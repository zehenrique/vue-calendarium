import { Temporal } from '@js-temporal/polyfill';
import { getStartOfWeek, getEndOfWeek, calculateEventColumns } from './useCalendarUtils.js';

const DEFAULT_EVENT_COLOR = '#1967d2';
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
    repeat: 'none',
    calendar: calendar.id,
    color: calendar.color || DEFAULT_EVENT_COLOR,
    allDay: false,
    ...overrides
  };
}

export function ensureDraftCalendar(draft, calendars) {
  const nextDraft = { ...draft };
  const calendar = resolveCalendarById(calendars, nextDraft.calendar);

  nextDraft.calendar = calendar.id;
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

export function createWeekdayLabels(currentDate, locale, isMobile) {
  const startOfWeek = getStartOfWeek(currentDate);
  const format = isMobile ? 'narrow' : 'short';

  return Array.from({ length: 7 }, (_, index) => {
    const date = startOfWeek.add({ days: index });
    return date.toLocaleString(locale, { weekday: format });
  });
}

export function formatCurrentTitle(view, currentDate, locale) {
  if (view === 'month') {
    const monthName = currentDate.toLocaleString(locale, { month: 'long' });
    return `${monthName} ${currentDate.year}`;
  }

  if (view === 'week') {
    // Always show the month of the current date (not the week start/end)
    const monthName = currentDate.toLocaleString(locale, { month: 'long' });
    return `${monthName} ${currentDate.year}`;
  }

  return currentDate.toLocaleString(locale, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
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
  const calendar = resolveCalendarById(calendars, draft.calendar);
  const startDateTime = `${draft.startDate}T${draft.startTime}:00`;
  const endDateTime = `${draft.endDate}T${draft.endTime}:00`;

  return {
    id: draft.id || Date.now().toString(),
    title: draft.title,
    start: startDateTime,
    end: endDateTime,
    color: draft.color || calendar.color || DEFAULT_EVENT_COLOR,
    calendar: draft.calendar || calendar.id,
    repeat: draft.repeat || 'none',
    allDay: Boolean(draft.allDay)
  };
}

export function generateRecurringEvents(baseEvent, repeatType, maxOccurrences = MAX_RECURRING_OCCURRENCES) {
  if (repeatType === 'none') return [baseEvent];

  const events = [baseEvent];
  const start = Temporal.PlainDate.from(baseEvent.start.split('T')[0]);
  const timeStart = baseEvent.start.split('T')[1];
  const timeEnd = baseEvent.end.split('T')[1];

  for (let offset = 1; offset < maxOccurrences; offset += 1) {
    let nextDate;

    switch (repeatType) {
      case 'daily':
        nextDate = start.add({ days: offset });
        break;
      case 'weekly':
        nextDate = start.add({ weeks: offset });
        break;
      case 'monthly':
        nextDate = start.add({ months: offset });
        break;
      case 'yearly':
        nextDate = start.add({ years: offset });
        break;
      default:
        return events;
    }

    events.push({
      ...baseEvent,
      id: `${baseEvent.id}-${offset}`,
      start: `${nextDate.toString()}T${timeStart}`,
      end: `${nextDate.toString()}T${timeEnd}`
    });
  }

  return events;
}
