// The state of the custom repeat dialog: reading a rule (RRULE) into the form and
// writing the form back as a rule. The form follows Google Calendar's "Custom recurrence".
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { Temporal } from '@js-temporal/polyfill';
import { getRuleParts } from '../core/recurrence.js';

// Monday first, as in the calendar
const WEEKDAYS = ['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'];
const A_MONDAY = Temporal.PlainDate.from('2024-01-01');
const UNIT_KEYS = { DAILY: 'unitDay', WEEKLY: 'unitWeek', MONTHLY: 'unitMonth', YEARLY: 'unitYear' };

function toDate(value) {
  try {
    return value ? Temporal.PlainDate.from(value) : null;
  } catch {
    return null;
  }
}

const weekdayOf = (date) => WEEKDAYS[date.dayOfWeek - 1];

/**
 * @param {() => string} getStartDate - The event's start date, 'YYYY-MM-DD'
 */
export function useRecurrenceForm(getStartDate) {
  const { t, locale } = useI18n();

  const frequency = ref('WEEKLY');
  const interval = ref(1);
  const weekdays = ref([]);
  const monthlyType = ref('bymonthday');
  const endType = ref('never');
  const untilDate = ref('');
  const count = ref(13);

  const startDate = computed(() => toDate(getStartDate()));

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
  const monthlyOptions = computed(() => {
    const date = startDate.value;
    if (!date) return [];
    return [
      { value: 'bymonthday', title: t('repeatMonthlyByDay', { day: date.day }) },
      {
        value: 'byweekday',
        title: t('repeatMonthlyByWeekday', { nth: t(`ordinal${Math.ceil(date.day / 7)}`), weekday: date.toLocaleString(locale.value, { weekday: 'long' }) })
      }
    ];
  });

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

  // Start from the event: weekly on its weekday, ending after 13 occurrences or on the
  // same day three months later if the user picks those
  const reset = () => {
    const date = startDate.value;
    frequency.value = 'WEEKLY';
    interval.value = 1;
    weekdays.value = [date ? weekdayOf(date) : 'MO'];
    monthlyType.value = 'bymonthday';
    endType.value = 'never';
    untilDate.value = date ? date.add({ months: 3 }).toString() : '';
    count.value = 13;
  };

  const load = (rrule) => {
    reset();
    Object.entries(getRuleParts(rrule)).forEach(([key, value]) => {
      switch (key) {
        case 'FREQ':
          frequency.value = value;
          break;
        case 'INTERVAL':
          interval.value = parseInt(value, 10);
          break;
        case 'BYDAY':
          // '3WE' is a monthly "third Wednesday"; 'MO,WE' are weekly days
          if (/^[+-]?\d/.test(value)) {
            monthlyType.value = 'byweekday';
          } else {
            weekdays.value = value.split(',');
          }
          break;
        case 'UNTIL': {
          // 'YYYYMMDD' or 'YYYYMMDDTHHMMSSZ'
          endType.value = 'until';
          untilDate.value = `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}`;
          break;
        }
        case 'COUNT':
          endType.value = 'count';
          count.value = parseInt(value, 10);
          break;
      }
    });
  };

  const toRule = () => {
    const parts = [`FREQ=${frequency.value}`];
    const date = startDate.value;

    if (Number(interval.value) > 1) {
      parts.push(`INTERVAL=${Number(interval.value)}`);
    }
    if (frequency.value === 'WEEKLY' && weekdays.value.length > 0) {
      // In weekday order, whatever order they were picked in
      parts.push(`BYDAY=${WEEKDAYS.filter(day => weekdays.value.includes(day)).join(',')}`);
    }
    if (frequency.value === 'MONTHLY' && date) {
      parts.push(monthlyType.value === 'byweekday'
        ? `BYDAY=${Math.ceil(date.day / 7)}${weekdayOf(date)}`
        : `BYMONTHDAY=${date.day}`);
    }
    if (endType.value === 'until' && untilDate.value) {
      // The end of that day, so an occurrence on the last day is included
      parts.push(`UNTIL=${untilDate.value.replace(/-/g, '')}T235959Z`);
    } else if (endType.value === 'count' && Number(count.value) > 0) {
      parts.push(`COUNT=${Number(count.value)}`);
    }
    return parts.join(';');
  };

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
