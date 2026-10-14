// A repeat rule (RRULE) as the fields of Google Calendar's "Custom recurrence" dialog, and back.
// Plain functions with no Vue, so an app can use them with its own dialog.
import { Temporal } from '@js-temporal/polyfill';
import { getRuleParts } from './recurrence.js';

/** Weekday codes of RRULE, Monday first */
export const WEEKDAYS = ['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'];

const toDate = (value) => {
  try {
    return value ? Temporal.PlainDate.from(value) : null;
  } catch {
    return null;
  }
};

const weekdayOf = (date) => WEEKDAYS[date.dayOfWeek - 1];

/**
 * @typedef {object} RecurrenceForm
 * @property {'DAILY'|'WEEKLY'|'MONTHLY'|'YEARLY'} frequency
 * @property {number} interval - Repeat every n days, weeks, months or years
 * @property {string[]} weekdays - Weekly: the days, as RRULE codes ('MO', 'WE')
 * @property {'bymonthday'|'byweekday'} monthlyType - Monthly: on the same day ("day 15") or the same weekday ("third Wednesday")
 * @property {'never'|'until'|'count'} endType
 * @property {string} untilDate - 'YYYY-MM-DD', the last day (included)
 * @property {number} count - Number of occurrences
 */

/**
 * The form for a rule, or for a new rule when there is none: weekly on the event's weekday,
 * ending (if the user chooses) three months later or after 13 occurrences, as in Google Calendar.
 * @param {string} rrule - The rule, '' for none
 * @param {string|Temporal.PlainDate} startDate - The event's start date
 * @returns {RecurrenceForm}
 */
export function ruleToForm(rrule, startDate) {
  const date = toDate(startDate);
  const form = {
    frequency: 'WEEKLY',
    interval: 1,
    weekdays: [date ? weekdayOf(date) : 'MO'],
    monthlyType: 'bymonthday',
    endType: 'never',
    untilDate: date ? date.add({ months: 3 }).toString() : '',
    count: 13
  };

  Object.entries(getRuleParts(rrule)).forEach(([key, value]) => {
    switch (key) {
      case 'FREQ':
        form.frequency = value;
        break;
      case 'INTERVAL':
        form.interval = parseInt(value, 10);
        break;
      case 'BYDAY':
        // '3WE' is a monthly "third Wednesday"; 'MO,WE' are weekly days
        if (/^[+-]?\d/.test(value)) {
          form.monthlyType = 'byweekday';
        } else {
          form.weekdays = value.split(',');
        }
        break;
      case 'UNTIL':
        // 'YYYYMMDD' or 'YYYYMMDDTHHMMSSZ'
        form.endType = 'until';
        form.untilDate = `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}`;
        break;
      case 'COUNT':
        form.endType = 'count';
        form.count = parseInt(value, 10);
        break;
    }
  });
  return form;
}

/**
 * The rule for a form, for example 'FREQ=WEEKLY;INTERVAL=2;BYDAY=MO,WE;COUNT=5'.
 * The end date is written as the end of that day, so an occurrence on it is included.
 * @param {RecurrenceForm} form
 * @param {string|Temporal.PlainDate} startDate - The event's start date (for the monthly rules)
 * @returns {string}
 */
export function formToRule(form, startDate) {
  const parts = [`FREQ=${form.frequency}`];
  const date = toDate(startDate);
  const interval = Number(form.interval);

  if (interval > 1) {
    parts.push(`INTERVAL=${interval}`);
  }
  if (form.frequency === 'WEEKLY' && form.weekdays?.length) {
    // In weekday order, whatever order they were picked in
    parts.push(`BYDAY=${WEEKDAYS.filter(day => form.weekdays.includes(day)).join(',')}`);
  }
  if (form.frequency === 'MONTHLY' && date) {
    parts.push(form.monthlyType === 'byweekday'
      ? `BYDAY=${Math.ceil(date.day / 7)}${weekdayOf(date)}`
      : `BYMONTHDAY=${date.day}`);
  }
  if (form.endType === 'until' && form.untilDate) {
    parts.push(`UNTIL=${form.untilDate.replace(/-/g, '')}T235959Z`);
  } else if (form.endType === 'count' && Number(form.count) > 0) {
    parts.push(`COUNT=${Number(form.count)}`);
  }
  return parts.join(';');
}
