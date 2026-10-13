import { useI18n } from 'vue-i18n';
import { Temporal } from '@js-temporal/polyfill';
import { getRuleParts } from '../core/recurrence.js';

const FREQUENCY_KEYS = {
  DAILY: 'repeatDaily',
  WEEKLY: 'repeatWeekly',
  MONTHLY: 'repeatMonthly',
  YEARLY: 'repeatYearly'
};

const UNIT_KEYS = {
  DAILY: 'days',
  WEEKLY: 'weeks',
  MONTHLY: 'months',
  YEARLY: 'years'
};

// A Monday, for naming the days of the week in the calendar's language
const A_MONDAY = Temporal.PlainDate.from('2024-01-01');
const WEEKDAY_OFFSETS = { MO: 0, TU: 1, WE: 2, TH: 3, FR: 4, SA: 5, SU: 6 };

/**
 * Composable to format RRULE strings into human-readable text
 */
export function useRRuleFormatter() {
  const { t, locale } = useI18n();

  /**
   * Convert an RRULE string to a human-readable description in the current language,
   * for example "Weekly on Monday, Wednesday" or "Every 2 weeks, 6 times".
   * @param {string} rruleStr - RRULE string, with or without the RRULE: prefix and other lines
   * @returns {string} Human-readable recurrence description
   */
  const formatRRule = (rruleStr) => {
    const parts = getRuleParts(rruleStr);
    const freq = parts.FREQ;
    if (!freq) {
      return t('repeatNone');
    }

    const interval = parseInt(parts.INTERVAL || '1', 10);
    let description = interval === 1
      ? (FREQUENCY_KEYS[freq] ? t(FREQUENCY_KEYS[freq]) : freq)
      : t('repeatEveryCount', { count: interval, unit: UNIT_KEYS[freq] ? t(UNIT_KEYS[freq]) : freq.toLowerCase() });

    // Weekdays of a weekly rule, written out ("Monday, Wednesday"); BYDAY values like '2TU' (monthly) are left out
    if (freq === 'WEEKLY' && parts.BYDAY) {
      const dayName = (day) => A_MONDAY.add({ days: WEEKDAY_OFFSETS[day] }).toLocaleString(locale.value, { weekday: 'long' });
      const days = parts.BYDAY.split(',').map(day => (day in WEEKDAY_OFFSETS ? dayName(day) : day)).join(', ');
      description = t('repeatOnDays', { rule: description, days });
    }

    if (parts.COUNT) {
      description = t('repeatTimes', { rule: description, count: parseInt(parts.COUNT, 10) });
    } else if (parts.UNTIL) {
      const until = parts.UNTIL.replace(/T.*/, '');
      const date = Temporal.PlainDate.from(`${until.slice(0, 4)}-${until.slice(4, 6)}-${until.slice(6, 8)}`);
      description = t('repeatUntil', { rule: description, date: date.toLocaleString(locale.value, { dateStyle: 'medium' }) });
    }

    return description;
  };

  return {
    formatRRule
  };
}
