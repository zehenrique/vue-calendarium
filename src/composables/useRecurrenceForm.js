// The state of the custom repeat dialog. The rule is read into the form and written back with
// ruleToForm and formToRule (core/recurrenceForm.js), which apps can also use with their own dialog.
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { Temporal } from '@js-temporal/polyfill';
import { WEEKDAYS, formToRule, ruleToForm } from '../core/recurrenceForm.js';
import { getMonthlyOptions } from '../core/recurrenceText.js';

const A_MONDAY = Temporal.PlainDate.from('2024-01-01');
const UNIT_KEYS = { DAILY: 'unitDay', WEEKLY: 'unitWeek', MONTHLY: 'unitMonth', YEARLY: 'unitYear' };

function toDate(value) {
  try {
    return value ? Temporal.PlainDate.from(value) : null;
  } catch {
    return null;
  }
}

/**
 * @param {() => string} getStartDate - The event's start date, 'YYYY-MM-DD'
 */
export function useRecurrenceForm(getStartDate) {
  const { t, locale } = useI18n();

  const initial = ruleToForm('', getStartDate());
  const frequency = ref(initial.frequency);
  const interval = ref(initial.interval);
  const weekdays = ref(initial.weekdays);
  const monthlyType = ref(initial.monthlyType);
  const endType = ref(initial.endType);
  const untilDate = ref(initial.untilDate);
  const count = ref(initial.count);

  // "day" or "days", following the interval, as Google Calendar does
  const unitOptions = computed(() => Object.entries(UNIT_KEYS).map(([value, key]) => ({
    value,
    title: t(key, Number(interval.value) || 1)
  })));

  // One round button per weekday: a letter, and the full name for screen readers
  const weekdayOptions = computed(() => WEEKDAYS.map((value, index) => {
    const date = A_MONDAY.add({ days: index });
    return {
      value,
      letter: date.toLocaleString(locale.value, { weekday: 'narrow' }),
      name: date.toLocaleString(locale.value, { weekday: 'long' })
    };
  }));

  // "Monthly on day 15" and "Monthly on the third Wednesday", for the event's date
  const monthlyOptions = computed(() => getMonthlyOptions(getStartDate(), { locale: locale.value, t }));

  // The end date as the event dialog shows dates: dd/mm/yyyy
  const untilDateDisplay = computed(() => {
    const date = toDate(untilDate.value);
    if (!date) return '';
    return `${String(date.day).padStart(2, '0')}/${String(date.month).padStart(2, '0')}/${date.year}`;
  });

  const toggleWeekday = (value) => {
    weekdays.value = weekdays.value.includes(value)
      ? weekdays.value.filter(day => day !== value)
      : [...weekdays.value, value];
  };

  // Start from a rule, or from the event's defaults when there is none
  const load = (rrule) => {
    const form = ruleToForm(rrule, getStartDate());
    frequency.value = form.frequency;
    interval.value = form.interval;
    weekdays.value = form.weekdays;
    monthlyType.value = form.monthlyType;
    endType.value = form.endType;
    untilDate.value = form.untilDate;
    count.value = form.count;
  };

  const toRule = () => formToRule({
    frequency: frequency.value,
    interval: interval.value,
    weekdays: weekdays.value,
    monthlyType: monthlyType.value,
    endType: endType.value,
    untilDate: untilDate.value,
    count: count.value
  }, getStartDate());

  return {
    frequency,
    interval,
    weekdays,
    monthlyType,
    endType,
    untilDate,
    count,
    unitOptions,
    weekdayOptions,
    monthlyOptions,
    untilDateDisplay,
    toggleWeekday,
    load,
    toRule
  };
}
