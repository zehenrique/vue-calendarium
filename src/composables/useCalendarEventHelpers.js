import { Temporal } from '@js-temporal/polyfill';
import { rrulestr } from 'rrule';
import { getStartOfWeek, getEndOfWeek, calculateEventColumns } from './useCalendarUtils.js';
import { DEFAULT_COLOR } from '../config/colors.js';

const DEFAULT_EVENT_COLOR = DEFAULT_COLOR;
const MAX_RECURRING_OCCURRENCES = 52;

function resolvePrimaryCalendar(calendars) {
  if (Array.isArray(calendars) && calendars.length > 0) {
    return calendars[0];
  }
  return { id: 'default', color: DEFAULT_EVENT_COLOR };
}

function resolveCalendarById(calendars, calendarId) {
  if (!Array.isArray(calendars)) return resolvePrimaryCalendar(calendars);
  return calendars.find((calendar) => calendar.id === calendarId) || resolvePrimaryCalendar(calendars);
}

export function createDefaultEventDraft(calendars, overrides = {}) {
  const today = Temporal.Now.plainDateISO();
  const calendar = resolvePrimaryCalendar(calendars);

  return {
    title: '',
    startDate: today.toString(),
    startTime: '09:00',
    endDate: today.toString(),
    endTime: '10:00',
    rrule: '', // RRULE string per RFC 5545, e.g. 'FREQ=WEEKLY;COUNT=4;BYDAY=MO'
    calendarId: calendar.id,
    color: calendar.color || DEFAULT_EVENT_COLOR,
    allDay: false,
    ...overrides
  };
}

export function ensureDraftCalendar(draft, calendars) {
  const nextDraft = { ...draft };
  const calendar = resolveCalendarById(calendars, nextDraft.calendarId);

  nextDraft.calendarId = calendar.id;
  nextDraft.color = nextDraft.color || calendar.color || DEFAULT_EVENT_COLOR;

  return nextDraft;
}

export function summarizeEventsForDate(date, events) {
  const plainDate = Temporal.PlainDate.from(date);
  const eventsForDate = events
    .filter((event) => {
      const eventStart = Temporal.PlainDate.from(event.start);
      const eventEnd = event.end ? Temporal.PlainDate.from(event.end) : eventStart;

      return (
        Temporal.PlainDate.compare(plainDate, eventStart) >= 0 &&
        Temporal.PlainDate.compare(plainDate, eventEnd) <= 0
      );
    })
    .sort((a, b) => {
      const aTime = Temporal.PlainDateTime.from(a.start);
      const bTime = Temporal.PlainDateTime.from(b.start);
      return Temporal.PlainDateTime.compare(aTime, bTime);
    });

  const allDayEvents = eventsForDate.filter((event) => event.allDay);
  const timedEvents = calculateEventColumns(eventsForDate);

  return {
    allDayEvents,
    timedEvents,
    allEvents: [...allDayEvents, ...timedEvents]
  };
}

export function createMonthGrid(currentDate, events) {
  const year = currentDate.year;
  const month = currentDate.month;
  const firstDay = Temporal.PlainDate.from({ year, month, day: 1 });
  const lastDay = firstDay.add({ months: 1 }).subtract({ days: 1 });
  const startOfGrid = getStartOfWeek(firstDay);
  const endOfGrid = getEndOfWeek(lastDay);
  const today = Temporal.Now.plainDateISO();

  const days = [];
  let cursor = startOfGrid;

  while (Temporal.PlainDate.compare(cursor, endOfGrid) <= 0) {
    const eventSummary = summarizeEventsForDate(cursor, events);

    days.push({
      key: cursor.toString(),
      day: cursor.day,
      date: cursor,
      isCurrentMonth: cursor.month === month && cursor.year === year,
      isToday: Temporal.PlainDate.compare(cursor, today) === 0,
      events: eventSummary.allEvents
    });

    cursor = cursor.add({ days: 1 });
  }

  return days;
}

export function createWeekViewDays(currentDate, events, locale) {
  const startOfWeek = getStartOfWeek(currentDate);
  const today = Temporal.Now.plainDateISO();

  return Array.from({ length: 7 }, (_, index) => {
    const date = startOfWeek.add({ days: index });
    const eventSummary = summarizeEventsForDate(date, events);

    return {
      key: date.toString(),
      day: date.day,
      date,
      dayName: date.toLocaleString(locale, { weekday: 'short' }),
      isToday: Temporal.PlainDate.compare(date, today) === 0,
      events: eventSummary.timedEvents,
      allDayEvents: eventSummary.allDayEvents
    };
  });
}

export function createWeekdayLabels(currentDate, locale, isMobile, t) {
  const startOfWeek = getStartOfWeek(currentDate);
  
  // Use i18n translations for consistent, unique labels
  const weekdayKeys = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  
  return Array.from({ length: 7 }, (_, index) => {
    if (t && isMobile) {
      // Use i18n translations which have unique single letters
      return t(weekdayKeys[index]);
    }
    // For desktop, use browser's short format
    const date = startOfWeek.add({ days: index });
    return date.toLocaleString(locale, { weekday: 'short' });
  });
}

export function formatCurrentTitle(view, currentDate, locale, isMobile = false) {
  if (view === 'month') {
    const monthName = currentDate.toLocaleString(locale, { month: 'long' });
    return `${monthName} ${currentDate.year}`;
  }

  if (view === 'week') {
    // Always show the month of the current date (not the week start/end)
    const monthName = currentDate.toLocaleString(locale, { month: 'long' });
    return `${monthName} ${currentDate.year}`;
  }

  // Day view: 
  // - Mobile: Show only month and year (day name is shown separately in header badge)
  // - Desktop: Show full date with weekday
  if (isMobile) {
    const monthName = currentDate.toLocaleString(locale, { month: 'long' });
    return `${monthName} ${currentDate.year}`;
  } else {
    const weekday = currentDate.toLocaleString(locale, { weekday: 'long' });
    const monthName = currentDate.toLocaleString(locale, { month: 'long' });
    const day = currentDate.day;
    const year = currentDate.year;
    return `${weekday}, ${monthName} ${day}, ${year}`;
  }
}

export function shouldDisplayCurrentTimeIndicator(view, currentDate) {
  const today = Temporal.Now.plainDateISO();

  if (view === 'day') {
    return Temporal.PlainDate.compare(currentDate, today) === 0;
  }

  if (view === 'week') {
    const startOfWeek = getStartOfWeek(currentDate);
    const endOfWeek = startOfWeek.add({ days: 6 });

    return (
      Temporal.PlainDate.compare(today, startOfWeek) >= 0 &&
      Temporal.PlainDate.compare(today, endOfWeek) <= 0
    );
  }

  return false;
}

export function buildEventPayloadFromDraft(draft, calendars) {
  const calendar = resolveCalendarById(calendars, draft.calendarId);
  const startDateTime = `${draft.startDate}T${draft.startTime}:00`;
  const endDateTime = `${draft.endDate}T${draft.endTime}:00`;

  return {
    id: draft.id || Date.now().toString(),
    title: draft.title,
    start: startDateTime,
    end: endDateTime,
    color: draft.color || calendar.color || DEFAULT_EVENT_COLOR,
    calendarId: draft.calendarId || calendar.id,
    rrule: draft.rrule || '',
    allDay: Boolean(draft.allDay)
  };
}

export function generateRecurringEvents(baseEvent, maxOccurrences = MAX_RECURRING_OCCURRENCES) {
  const dtstart = new Date(baseEvent.start);
  const baseStart = Temporal.PlainDateTime.from(baseEvent.start);
  const baseEnd = Temporal.PlainDateTime.from(baseEvent.end || baseEvent.start);
  const dur = baseEnd.since(baseStart);

  const rruleText = baseEvent.rrule;
  if (!rruleText || rruleText.trim() === '') {
    return [baseEvent];
  }

  const rule = rrulestr(rruleText.startsWith('RRULE:') ? rruleText : `RRULE:${rruleText}`, {
    dtstart
  });

  const dates = [];
  rule.all((date, i) => {
    if (i >= maxOccurrences) return false;
    dates.push(date);
    return true;
  });

  return dates.map((jsDate, idx) => {
    const t = Temporal.PlainDateTime.from(jsDate.toISOString().slice(0, 19));
    return {
      ...baseEvent,
      id: idx === 0 ? baseEvent.id : `${baseEvent.id}-${idx}`,
      start: t.toString(),
      end: t.add(dur).toString()
    };
  });
}
