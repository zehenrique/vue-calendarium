// Repeat rules in words, in the calendar's languages: descriptions ("Weekly on Monday,
// Wednesday") and the choices of the repeat menu ("Monthly on the third Wednesday").
// Plain functions: they take vue-i18n's `t` when there is one, and otherwise use the
// calendar's own translations.
import { Temporal } from '@js-temporal/polyfill';
import { translations } from '../i18n.js';
import { getRuleParts } from './recurrence.js';
import { WEEKDAYS } from './recurrenceForm.js';

const LANGUAGES = { 'en-US': 'en', 'pt-PT': 'pt' };
const FREQUENCY_KEYS = { DAILY: 'repeatDaily', WEEKLY: 'repeatWeekly', MONTHLY: 'repeatMonthly', YEARLY: 'repeatYearly' };
const UNIT_KEYS = { DAILY: 'days', WEEKLY: 'weeks', MONTHLY: 'months', YEARLY: 'years' };
const A_MONDAY = Temporal.PlainDate.from('2024-01-01');

/**
 * A translate function for the calendar's messages, like vue-i18n's `t`: named values
 * ('{count} times') and plural forms ('day | days', with a number).
 * @param {string} [locale] - 'en-US' or 'pt-PT'
 * @returns {(key: string, values?: object|number) => string}
 */
export function createTranslator(locale = 'en-US') {
  const messages = translations[LANGUAGES[locale] ?? locale] ?? translations.en;
  return (key, values) => {
    const text = messages[key] ?? translations.en[key] ?? key;
    if (typeof values === 'number') {
      const forms = text.split('|').map(form => form.trim());
      return values === 1 ? forms[0] : forms[forms.length - 1];
    }
    return text.replace(/\{(\w+)\}/g, (match, name) => (values && name in values ? String(values[name]) : match));
  };
}

const toDate = (value) => {
  try {
    return value ? Temporal.PlainDate.from(value) : null;
  } catch {
    return null;
  }
};

const weekdayName = (code, locale) => A_MONDAY.add({ days: WEEKDAYS.indexOf(code) }).toLocaleString(locale, { weekday: 'long' });

/**
 * A rule in words, for example "Weekly on Monday, Wednesday", "Every 2 weeks, 6 times" or
 * "Semanalmente (quarta-feira)".
 * @param {string} rrule
 * @param {object} [options]
 * @param {string} [options.locale] - 'en-US' (default) or 'pt-PT'
 * @param {Function} [options.t] - vue-i18n's translate function, to use the app's wording
 * @returns {string}
 */
export function describeRule(rrule, { locale = 'en-US', t = createTranslator(locale) } = {}) {
  const parts = getRuleParts(rrule);
  const frequency = parts.FREQ;
  if (!frequency) {
    return t('repeatNone');
  }

  const interval = parseInt(parts.INTERVAL || '1', 10);
  let description = interval === 1
    ? (FREQUENCY_KEYS[frequency] ? t(FREQUENCY_KEYS[frequency]) : frequency)
    : t('repeatEveryCount', { count: interval, unit: UNIT_KEYS[frequency] ? t(UNIT_KEYS[frequency]) : frequency.toLowerCase() });

  // The days of a weekly rule; BYDAY values like '2TU' (monthly) are left out
  if (frequency === 'WEEKLY' && parts.BYDAY) {
    const days = parts.BYDAY.split(',').map(day => (WEEKDAYS.includes(day) ? weekdayName(day, locale) : day)).join(', ');
    description = t('repeatOnDays', { rule: description, days });
  }

  if (parts.COUNT) {
    description = t('repeatTimes', { rule: description, count: parseInt(parts.COUNT, 10) });
  } else if (parts.UNTIL) {
    const until = parts.UNTIL;
    const date = Temporal.PlainDate.from(`${until.slice(0, 4)}-${until.slice(4, 6)}-${until.slice(6, 8)}`);
    description = t('repeatUntil', { rule: description, date: date.toLocaleString(locale, { dateStyle: 'medium' }) });
  }

  return description;
}

/**
 * The repeat menu's usual rules for an event's date, as in Google Calendar: daily, weekly on
 * its weekday, monthly on that weekday of the month, yearly, and every weekday. Without
 * "Does not repeat" and "Custom...", which an app adds with its own wording.
 * @param {string|Temporal.PlainDate} startDate
 * @param {object} [options]
 * @param {string} [options.locale]
 * @param {Function} [options.t]
 * @returns {{ value: string, title: string }[]} The rules (RRULE) and their names
 */
export function getRepeatOptions(startDate, { locale = 'en-US', t = createTranslator(locale) } = {}) {
  const date = toDate(startDate);
  if (!date) {
    return Object.entries(FREQUENCY_KEYS).map(([frequency, key]) => ({ value: `FREQ=${frequency}`, title: t(key) }));
  }
  const weekdayCode = WEEKDAYS[date.dayOfWeek - 1];
  const weekday = date.toLocaleString(locale, { weekday: 'long' });
  const week = Math.ceil(date.day / 7);
  return [
    { value: 'FREQ=DAILY', title: t('repeatDaily') },
    { value: `FREQ=WEEKLY;BYDAY=${weekdayCode}`, title: t('repeatWeeklyOn', { weekday }) },
    { value: `FREQ=MONTHLY;BYDAY=${week}${weekdayCode}`, title: t('repeatMonthlyByWeekday', { nth: t(`ordinal${week}`), weekday }) },
    { value: 'FREQ=YEARLY', title: t('repeatAnnuallyOn', { date: date.toLocaleString(locale, { month: 'long', day: 'numeric' }) }) },
    { value: 'FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR', title: t('repeatEveryWeekday') }
  ];
}

/**
 * The two monthly choices of the custom repeat dialog for an event's date: "Monthly on day 15"
 * and "Monthly on the third Wednesday", as `monthlyType` values of the form.
 * @param {string|Temporal.PlainDate} startDate
 * @param {object} [options]
 * @param {string} [options.locale]
 * @param {Function} [options.t]
 * @returns {{ value: 'bymonthday'|'byweekday', title: string }[]}
 */
export function getMonthlyOptions(startDate, { locale = 'en-US', t = createTranslator(locale) } = {}) {
  const date = toDate(startDate);
  if (!date) return [];
  return [
    { value: 'bymonthday', title: t('repeatMonthlyByDay', { day: date.day }) },
    {
      value: 'byweekday',
      title: t('repeatMonthlyByWeekday', { nth: t(`ordinal${Math.ceil(date.day / 7)}`), weekday: date.toLocaleString(locale, { weekday: 'long' }) })
    }
  ];
}
