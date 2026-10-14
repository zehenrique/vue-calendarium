// iCalendar (RFC 5545) files: reading events from .ics text and writing them to it.
//
// Repeating events are written as Google Calendar exports them: a series is a VEVENT with RRULE
// and EXDATE (deleted occurrences), and each changed occurrence is a VEVENT with the series'
// UID and a RECURRENCE-ID holding the occurrence's original start.
//
// Times follow the calendar's rules for dates (see toPlainDateTimeString): a UTC time ('Z') is
// shown in the viewer's time zone, and a time with a TZID or without a zone ("floating") keeps
// its wall-clock time. All-day events use dates (VALUE=DATE); their DTEND is the day after the
// last day, while the calendar's `end` is the last day itself.
import ICAL from 'ical.js';
import { Temporal } from '@js-temporal/polyfill';
import { getExceptionDates, getRuleParts } from './recurrence.js';
import { toPlainDateTimeString } from './dateTime.js';
import { generateEventId } from './CalendarEvent.js';

const pad = (value, length = 2) => String(value).padStart(length, '0');

// An ICAL.Time as the calendar's wall-clock date-time string
function fromICALTime(time) {
  const text = `${pad(time.year, 4)}-${pad(time.month)}-${pad(time.day)}T${pad(time.hour)}:${pad(time.minute)}:${pad(time.second)}`;
  const isUTC = !time.isDate && (time.zone === ICAL.Timezone.utcTimezone || time.zone?.tzid === 'UTC');
  return isUTC ? toPlainDateTimeString(`${text}Z`) : text;
}

// A wall-clock date-time as an ICAL.Time: a date for all-day events, otherwise floating
function toICALTime(dateTime, isDate) {
  const value = Temporal.PlainDateTime.from(dateTime);
  return ICAL.Time.fromData({
    year: value.year,
    month: value.month,
    day: value.day,
    hour: isDate ? 0 : value.hour,
    minute: isDate ? 0 : value.minute,
    second: isDate ? 0 : value.second,
    isDate
  });
}

function addTime(vevent, name, dateTime, { isDate, tzid }) {
  const property = vevent.addPropertyWithValue(name, toICALTime(dateTime, isDate));
  if (tzid && !isDate) property.setParameter('tzid', tzid);
}

const startOfDay = (dateTime) => `${Temporal.PlainDateTime.from(dateTime).toPlainDate()}T00:00:00`;

/**
 * Read the events of an iCalendar file.
 * @param {string} icsText - The file's text
 * @param {object} [options]
 * @param {string} [options.calendarId] - The calendar the events belong to (events need one to be shown)
 * @returns {object[]} Events for the events service: a series has `rrule` (with EXDATE lines),
 *   and a changed occurrence has `recurringEventId` and `originalStart`
 */
export function parseICal(icsText, { calendarId } = {}) {
  const calendar = new ICAL.Component(ICAL.parse(icsText));

  return calendar.getAllSubcomponents('vevent').map((vevent) => {
    const event = new ICAL.Event(vevent);
    const allDay = Boolean(event.startDate?.isDate);
    const uid = event.uid || generateEventId();

    const start = fromICALTime(event.startDate);
    // All day: DTEND is the day after the last day
    let end = event.endDate ? fromICALTime(event.endDate) : start;
    if (allDay && event.endDate) {
      const lastDay = Temporal.PlainDateTime.from(end).subtract({ days: 1 });
      end = Temporal.PlainDateTime.compare(lastDay, Temporal.PlainDateTime.from(start)) >= 0 ? lastDay.toString() : start;
    }

    const rruleValue = vevent.getFirstPropertyValue('rrule');
    const exceptionDates = vevent.getAllProperties('exdate')
      .flatMap(property => property.getValues())
      .map(time => `${fromICALTime(time).replace(/[-:]/g, '')}Z`);
    const rrule = rruleValue
      ? [`RRULE:${rruleValue}`, ...(exceptionDates.length ? [`EXDATE:${exceptionDates.join(',')}`] : [])].join('\n')
      : '';

    const recurrenceId = vevent.getFirstPropertyValue('recurrence-id');
    const originalStart = recurrenceId ? fromICALTime(recurrenceId) : null;

    return {
      // A changed occurrence shares its series' UID, so it takes the occurrence's id
      id: originalStart ? `${uid}@${originalStart}` : uid,
      title: event.summary || '',
      start,
      end,
      allDay,
      rrule,
      description: event.description || '',
      location: event.location || '',
      ...(calendarId !== undefined ? { calendarId } : {}),
      ...(originalStart ? { recurringEventId: uid, originalStart } : {})
    };
  });
}

/**
 * Write events to an iCalendar file.
 * @param {object[]} events - Stored events (series, changed occurrences and single events)
 * @param {object} [options]
 * @param {string} [options.prodId] - The file's PRODID
 * @param {string} [options.tzid] - A time zone to write times in, such as 'Europe/Lisbon'
 *   (otherwise they are floating: the same wall-clock time everywhere)
 * @returns {string} The file's text
 */
export function serializeICal(events, { prodId = '-//vue-calendarium//EN', tzid } = {}) {
  const calendar = new ICAL.Component(['vcalendar', [], []]);
  calendar.updatePropertyWithValue('prodid', prodId);
  calendar.updatePropertyWithValue('version', '2.0');

  events.forEach((data) => {
    const vevent = new ICAL.Component('vevent');
    const event = new ICAL.Event(vevent);
    const isDate = Boolean(data.allDay);

    // A changed occurrence is written under its series' UID, with the occurrence's original start
    event.uid = data.recurringEventId ?? String(data.id ?? generateEventId());
    if (data.recurringEventId && data.originalStart) {
      addTime(vevent, 'recurrence-id', data.originalStart, { isDate, tzid });
    }
    event.summary = data.title || '';
    if (data.description) event.description = data.description;
    if (data.location) event.location = data.location;

    addTime(vevent, 'dtstart', data.start, { isDate, tzid });
    if (isDate) {
      // All day: DTEND is the day after the last day
      const lastDay = Temporal.PlainDateTime.from(data.end || data.start).toPlainDate();
      addTime(vevent, 'dtend', `${lastDay.add({ days: 1 })}T00:00:00`, { isDate, tzid });
    } else {
      addTime(vevent, 'dtend', data.end || data.start, { isDate, tzid });
    }

    // RRULE, and EXDATE for deleted occurrences, in the same form as DTSTART
    if (data.rrule) {
      const parts = Object.entries(getRuleParts(data.rrule)).map(([key, value]) => `${key}=${value}`).join(';');
      vevent.addPropertyWithValue('rrule', ICAL.Recur.fromString(parts));
      getExceptionDates(data.rrule).forEach(date => addTime(vevent, 'exdate', isDate ? startOfDay(date) : date.toString(), { isDate, tzid }));
    }

    calendar.addSubcomponent(vevent);
  });

  return calendar.toString();
}
