import { useI18n } from 'vue-i18n';
import { describeRule } from '../core/recurrenceText.js';

/**
 * Composable to format RRULE strings into human-readable text, in the calendar's language
 */
export function useRRuleFormatter() {
  const { t, locale } = useI18n();

  /**
   * Convert an RRULE string to a human-readable description in the current language,
   * for example "Weekly on Monday, Wednesday" or "Every 2 weeks, 6 times".
   * @param {string} rruleStr - RRULE string, with or without the RRULE: prefix and other lines
   * @returns {string} Human-readable recurrence description
   */
  const formatRRule = (rruleStr) => describeRule(rruleStr, { locale: locale.value, t });

  return {
    formatRRule
  };
}
