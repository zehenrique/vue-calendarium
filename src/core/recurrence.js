// Repeating events: expanding a repeat rule (RRULE, RFC 5545) into occurrences, and
// excluding single occurrences (EXDATE).
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
 * Format a wall-clock time the way DTSTART and EXDATE store it: 'YYYYMMDDTHHMMSSZ'.
 * @param {string|Temporal.PlainDateTime} dateTime
 */
export function toRRuleDateString(dateTime) {
  const t = Temporal.PlainDateTime.from(dateTime);
  const pad = (value, length = 2) => String(value).padStart(length, '0');
  return `${pad(t.year, 4)}${pad(t.month)}${pad(t.day)}T${pad(t.hour)}${pad(t.minute)}${pad(t.second)}Z`;
}

// Rule lines without a name ('FREQ=WEEKLY') are RRULE lines
function toRuleLines(rrule) {
  return rrule.trim().split(/\r?\n/).map(line => (/^[A-Z-]+[:;]/.test(line) ? line : `RRULE:${line}`));
}

// The series always starts at the event's start. A DTSTART line in the rule is replaced,
// because rrule ignores its `dtstart` option for rules with EXDATE lines.
function parseRule(event) {
  const lines = toRuleLines(event.rrule).filter(line => !line.startsWith('DTSTART'));
  return rrulestr([`DTSTART:${toRRuleDateString(event.start)}`, ...lines].join('\n'));
}

/**
 * Expand a repeating event into its occurrences between two wall-clock times.
 * Each occurrence is a copy of the event with its own start and end, an id of the form
 * '<event id>@<start>' and `recurringEventId` set to the event's id.
 * @param {object} event - An event with `start`, optional `end` and `rrule`
 * @param {string} rangeStart - '2026-03-01T00:00:00'
 * @param {string} rangeEnd - '2026-03-31T23:59:59'
 * @returns {object[]} The occurrences, or [event] when it does not repeat
 */
export function expandRecurrence(event, rangeStart, rangeEnd) {
  if (!event.rrule) return [event];

  const start = Temporal.PlainDateTime.from(event.start);
  const duration = start.until(Temporal.PlainDateTime.from(event.end || event.start));

  return parseRule(event)
    .between(toRRuleDate(rangeStart), toRRuleDate(rangeEnd), true)
    .map((date) => {
      const occurrenceStart = fromRRuleDate(date);
      return {
        ...event,
        id: `${event.id}@${occurrenceStart}`,
        recurringEventId: event.id,
        start: occurrenceStart.toString(),
        end: occurrenceStart.add(duration).toString()
      };
    });
}

/**
 * Return the event's rule with one occurrence excluded (an EXDATE line).
 * The rule keeps using the event's start (no DTSTART line is added), so editing the
 * series' time later still moves every occurrence.
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
