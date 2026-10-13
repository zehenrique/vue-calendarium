// Repeating events: expanding a repeat rule (RRULE, RFC 5545) into occurrences, and
// changing a rule's end and exception dates (EXDATE).
//
// The rrule library works with JavaScript Dates. Event times are wall-clock times with
// no time zone, so they are handed to rrule as UTC Dates that carry the same wall-clock
// fields ("floating" times, as the rrule documentation recommends). Occurrences then keep
// their time of day in every time zone.
import { Temporal } from '@js-temporal/polyfill';
import { rrulestr } from 'rrule';

/**
 * @param {string|Temporal.PlainDateTime} dateTime
 * @returns {Date} A Date whose UTC fields are the wall-clock fields of dateTime
 */
function toRRuleDate(dateTime) {
  const t = Temporal.PlainDateTime.from(dateTime);
  return new Date(Date.UTC(t.year, t.month - 1, t.day, t.hour, t.minute, t.second));
}

/**
 * @param {Date} date - A Date returned by rrule
 * @returns {Temporal.PlainDateTime}
 */
function fromRRuleDate(date) {
  return new Temporal.PlainDateTime(
    date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate(),
    date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds()
  );
}

/**
 * Format a wall-clock time the way UNTIL and EXDATE store it: 'YYYYMMDDTHHMMSSZ'.
 * @param {string|Temporal.PlainDateTime} dateTime
 */
export function toRRuleDateString(dateTime) {
  const t = Temporal.PlainDateTime.from(dateTime);
  const pad = (value, length = 2) => String(value).padStart(length, '0');
  return `${pad(t.year, 4)}${pad(t.month)}${pad(t.day)}T${pad(t.hour)}${pad(t.minute)}${pad(t.second)}Z`;
}

/**
 * Read a rule date ('YYYYMMDDTHHMMSSZ' or 'YYYYMMDD') as a wall-clock time.
 * @param {string} value
 * @returns {Temporal.PlainDateTime}
 */
function fromRRuleDateString(value) {
  const [, year, month, day, hour = 0, minute = 0, second = 0] = value.match(/^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2}))?/);
  return new Temporal.PlainDateTime(+year, +month, +day, +hour, +minute, +second);
}

const compareDateTimes = (a, b) => Temporal.PlainDateTime.compare(Temporal.PlainDateTime.from(a), Temporal.PlainDateTime.from(b));

// Rule lines without a name ('FREQ=WEEKLY') are RRULE lines
function toRuleLines(rrule) {
  return rrule.trim().split(/\r?\n/).map(line => (/^[A-Z-]+[:;]/.test(line) ? line : `RRULE:${line}`));
}

// The series always starts at the event's start. A DTSTART line in the rule is replaced,
// because rrule ignores its `dtstart` option for rules with EXDATE lines.
function parseRule(event, { withExceptions = true } = {}) {
  const lines = toRuleLines(event.rrule)
    .filter(line => !line.startsWith('DTSTART') && (withExceptions || !line.startsWith('EXDATE')));
  return rrulestr([`DTSTART:${toRRuleDateString(event.start)}`, ...lines].join('\n'));
}

/**
 * The id of an occurrence: '<series id>@<original start>'. A changed occurrence keeps it.
 * @param {string|number} seriesId
 * @param {string|Temporal.PlainDateTime} originalStart
 */
export function getOccurrenceId(seriesId, originalStart) {
  return `${seriesId}@${Temporal.PlainDateTime.from(originalStart)}`;
}

/**
 * Expand a repeating event into its occurrences between two wall-clock times.
 * Each occurrence is a copy of the event with its own start and end, an id of the form
 * '<event id>@<start>', `recurringEventId` set to the event's id and `originalStart` set to its start.
 * Occurrences replaced by a changed occurrence (an exception, as RECURRENCE-ID in iCalendar)
 * are left out, since the exception is shown in their place.
 * @param {object} event - An event with `start`, optional `end` and `rrule`
 * @param {string} rangeStart - '2026-03-01T00:00:00'
 * @param {string} rangeEnd - '2026-03-31T23:59:59'
 * @param {object} [options]
 * @param {object[]} [options.exceptions] - Stored exceptions: events with `recurringEventId` and `originalStart`
 * @returns {object[]} The occurrences, or [event] when it does not repeat
 */
export function expandRecurrence(event, rangeStart, rangeEnd, { exceptions = [] } = {}) {
  if (!event.rrule) return [event];

  const start = Temporal.PlainDateTime.from(event.start);
  const duration = start.until(Temporal.PlainDateTime.from(event.end || event.start));
  const replaced = new Set(exceptions
    .filter(exception => exception.recurringEventId === event.id && exception.originalStart)
    .map(exception => Temporal.PlainDateTime.from(exception.originalStart).toString()));

  return parseRule(event)
    .between(toRRuleDate(rangeStart), toRRuleDate(rangeEnd), true)
    .filter(date => !replaced.has(fromRRuleDate(date).toString()))
    .map((date) => {
      const occurrenceStart = fromRRuleDate(date);
      return {
        ...event,
        id: getOccurrenceId(event.id, occurrenceStart),
        recurringEventId: event.id,
        originalStart: occurrenceStart.toString(),
        start: occurrenceStart.toString(),
        end: occurrenceStart.add(duration).toString()
      };
    });
}

/**
 * The parts of a rule's RRULE line, for example { FREQ: 'WEEKLY', COUNT: '6' }.
 * Works for a plain rule ('FREQ=WEEKLY;COUNT=6') and for one with DTSTART or EXDATE lines.
 * @param {string} rrule
 * @returns {Record<string, string>}
 */
export function getRuleParts(rrule) {
  if (!rrule) return {};
  const ruleLine = toRuleLines(rrule).find(line => line.startsWith('RRULE')) ?? '';
  return Object.fromEntries(
    ruleLine.replace(/^RRULE:/, '').split(';').filter(Boolean).map(part => part.split('='))
  );
}

/**
 * The excluded occurrences (EXDATE) of a rule.
 * @param {string} rrule
 * @returns {Temporal.PlainDateTime[]}
 */
export function getExceptionDates(rrule) {
  if (!rrule) return [];
  return toRuleLines(rrule)
    .filter(line => line.startsWith('EXDATE'))
    .flatMap(line => line.slice(line.indexOf(':') + 1).split(','))
    .filter(Boolean)
    .map(fromRRuleDateString);
}

/**
 * Write a rule from its RRULE parts and exception dates.
 * @param {Record<string, string>} parts
 * @param {Temporal.PlainDateTime[]} [exceptionDates]
 * @returns {string}
 */
function buildRule(parts, exceptionDates = []) {
  const lines = [`RRULE:${Object.entries(parts).map(([key, value]) => `${key}=${value}`).join(';')}`];
  if (exceptionDates.length) {
    lines.push(`EXDATE:${exceptionDates.map(toRRuleDateString).join(',')}`);
  }
  return lines.join('\n');
}

/**
 * Return the event's rule with one occurrence excluded (an EXDATE line).
 * @param {object} event - The repeating event (the series, not an occurrence)
 * @param {string} occurrenceStart - Start of the occurrence to exclude
 * @returns {string} The new rule
 */
export function addExceptionDate(event, occurrenceStart) {
  const exdate = toRRuleDateString(occurrenceStart);
  const lines = toRuleLines(event.rrule);

  const exdateIndex = lines.findIndex(line => line.startsWith('EXDATE'));
  if (exdateIndex === -1) {
    lines.push(`EXDATE:${exdate}`);
  } else {
    lines[exdateIndex] += `,${exdate}`;
  }
  return lines.join('\n');
}

/**
 * Carry the excluded occurrences (EXDATE lines) of a previous rule over to a new one,
 * so changing how a series repeats does not bring back occurrences that were deleted.
 * @param {string} newRule - The rule chosen in the repeat picker, such as 'FREQ=DAILY'
 * @param {string} previousRule - The series' rule before the change
 * @returns {string}
 */
export function keepExceptionDates(newRule, previousRule) {
  if (!newRule || !previousRule) return newRule;
  const exceptions = toRuleLines(previousRule).filter(line => line.startsWith('EXDATE'));
  return exceptions.length ? [...toRuleLines(newRule), ...exceptions].join('\n') : newRule;
}

/**
 * Whether two rules repeat the same way. Exception dates are not compared.
 * @param {string} a
 * @param {string} b
 */
export function isSameRule(a, b) {
  const partsA = getRuleParts(a);
  const partsB = getRuleParts(b);
  const keys = new Set([...Object.keys(partsA), ...Object.keys(partsB)]);
  return [...keys].every(key => partsA[key] === partsB[key]);
}

/**
 * How many occurrences of a series start before a time, counting excluded ones too
 * (as COUNT does).
 * @param {object} event - The series
 * @param {string} dateTime
 * @returns {number}
 */
export function countOccurrencesBefore(event, dateTime) {
  const limit = toRRuleDate(dateTime);
  return parseRule(event, { withExceptions: false }).all(date => date < limit).length;
}

/**
 * The series' rule ending just before an occurrence, for "this and following" changes.
 * @param {object} event - The series
 * @param {string} dateTime - Start of the first occurrence to leave out
 * @returns {string}
 */
export function endRuleBefore(event, dateTime) {
  const parts = { ...getRuleParts(event.rrule) };
  delete parts.COUNT;
  parts.UNTIL = toRRuleDateString(Temporal.PlainDateTime.from(dateTime).subtract({ seconds: 1 }));
  const exceptions = getExceptionDates(event.rrule).filter(date => compareDateTimes(date, dateTime) < 0);
  return buildRule(parts, exceptions);
}

/**
 * The rule for the rest of a series, from one of its occurrences on. A COUNT is reduced by
 * the occurrences before it; exception dates before it are dropped.
 * @param {object} event - The series
 * @param {string} dateTime - Start of the occurrence the new rule starts at
 * @returns {string}
 */
export function continueRuleFrom(event, dateTime) {
  const parts = { ...getRuleParts(event.rrule) };
  if (parts.COUNT) {
    parts.COUNT = String(Math.max(1, Number(parts.COUNT) - countOccurrencesBefore(event, dateTime)));
  }
  const exceptions = getExceptionDates(event.rrule).filter(date => compareDateTimes(date, dateTime) >= 0);
  return buildRule(parts, exceptions);
}

/**
 * Whether a series has an occurrence at a time, deleted occurrences (EXDATE) included.
 * @param {object} event - The series
 * @param {string} dateTime
 */
export function hasOccurrenceAt(event, dateTime) {
  if (!event.rrule) return false;
  const date = toRRuleDate(dateTime);
  return parseRule(event, { withExceptions: false }).between(date, date, true).length > 0;
}

/**
 * Move the exception dates of a rule by a duration, so they still match their occurrences
 * after the series' time changes.
 * @param {string} rrule
 * @param {Temporal.Duration} duration
 * @returns {string}
 */
export function shiftExceptionDates(rrule, duration) {
  const exceptions = getExceptionDates(rrule);
  if (!exceptions.length || duration.blank) return rrule;
  return buildRule(getRuleParts(rrule), exceptions.map(date => date.add(duration)));
}

const WEEKDAYS = ['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'];
const weekdayOf = (date) => WEEKDAYS[date.dayOfWeek - 1];

// Move the days of a BYDAY list. Weekly days ('MO,WE') move by the same number of days;
// a monthly or yearly "nth weekday" ('2TU', '-1FR') becomes the nth weekday of the new date.
function moveWeekdays(byDay, frequency, toDate, days) {
  const moved = byDay.split(',').map((token) => {
    const [, ordinal, weekday] = token.match(/^([+-]?\d*)([A-Z]{2})$/) ?? [];
    if (!weekday) return token;
    if (ordinal) {
      const isLast = ordinal.startsWith('-') && toDate.day + 7 > toDate.daysInMonth;
      return `${isLast ? -1 : Math.ceil(toDate.day / 7)}${weekdayOf(toDate)}`;
    }
    if (frequency !== 'WEEKLY') return token;
    return WEEKDAYS[(((WEEKDAYS.indexOf(weekday) + days) % 7) + 7) % 7];
  });
  return [...new Set(moved)].join(',');
}

/**
 * Move a series' rule with the series, when "All events" or "This and following events"
 * moves an occurrence to another time or day. The days it repeats on (BYDAY, BYMONTHDAY,
 * BYMONTH), the end date (UNTIL) and the deleted occurrences (EXDATE) move with it, so
 * moving Wednesday's occurrence to Thursday makes a weekly series repeat on Thursdays.
 * @param {string} rrule
 * @param {string} from - The occurrence's start in the series
 * @param {string} to - Its new start
 * @returns {string}
 */
export function moveRule(rrule, from, to) {
  if (!rrule) return rrule;
  const fromDateTime = Temporal.PlainDateTime.from(from);
  const toDateTime = Temporal.PlainDateTime.from(to);
  const shift = fromDateTime.until(toDateTime);
  if (shift.blank) return rrule;

  const fromDate = fromDateTime.toPlainDate();
  const toDate = toDateTime.toPlainDate();
  const days = fromDate.until(toDate).days;
  const parts = { ...getRuleParts(rrule) };

  if (days !== 0) {
    if (parts.BYDAY) parts.BYDAY = moveWeekdays(parts.BYDAY, parts.FREQ, toDate, days);
    if (parts.BYMONTHDAY === String(fromDate.day)) parts.BYMONTHDAY = String(toDate.day);
    if (parts.BYMONTH === String(fromDate.month)) parts.BYMONTH = String(toDate.month);
    if (parts.UNTIL) parts.UNTIL = toRRuleDateString(fromRRuleDateString(parts.UNTIL).add({ days }));
  }
  return buildRule(parts, getExceptionDates(rrule).map(date => date.add(shift)));
}
