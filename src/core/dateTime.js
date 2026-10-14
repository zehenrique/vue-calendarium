import { Temporal } from '@js-temporal/polyfill';

// An exact time: ends in Z or a UTC offset, such as '2026-03-02T09:00:00Z' or '...T09:00:00+01:00'
const EXACT_TIME = /T.*(Z|[+-]\d{2}(:?\d{2})?)$/i;

/**
 * Normalize an event date to the wall-clock date-time string the calendar works with
 * ('2026-03-02T09:00:00').
 *
 * Accepts that string form, a date ('2026-03-02', midnight), an exact time with Z or an
 * offset (converted to the viewer's time zone), a zoned string ('...[Europe/Lisbon]', its own
 * wall-clock time), or a Temporal object of any of these kinds.
 * @param {string|object|null|undefined} value
 * @returns {string|null|undefined} The normalized value; empty values are returned unchanged
 */
export function toPlainDateTimeString(value) {
  if (value === null || value === undefined || value === '') return value;
  const text = String(value);

  if (text.includes('[')) {
    return Temporal.ZonedDateTime.from(text).toPlainDateTime().toString();
  }
  if (EXACT_TIME.test(text)) {
    return Temporal.Instant.from(text).toZonedDateTimeISO(Temporal.Now.timeZoneId()).toPlainDateTime().toString();
  }
  return text;
}
