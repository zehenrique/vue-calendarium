<template>
  <!-- A small month calendar, as in Google Calendar's sidebar: choosing a day shows it in the calendar -->
  <div class="mini-month" data-testid="mini-month">
    <div class="mini-month__header">
      <span class="mini-month__title" aria-live="polite">{{ monthTitle }}</span>
      <v-btn icon variant="text" size="small" :aria-label="t('previousMonth')" data-testid="mini-month-previous" @click="moveMonth(-1)">
        <v-icon size="20">mdi-chevron-left</v-icon>
      </v-btn>
      <v-btn icon variant="text" size="small" :aria-label="t('nextMonth')" data-testid="mini-month-next" @click="moveMonth(1)">
        <v-icon size="20">mdi-chevron-right</v-icon>
      </v-btn>
    </div>

    <div class="mini-month__grid" role="grid" :aria-label="monthTitle" @keydown="handleKeydown">
      <div class="mini-month__row" role="row">
        <span v-for="weekday in weekdays" :key="weekday.name" class="mini-month__weekday" role="columnheader" :aria-label="weekday.name">{{ weekday.letter }}</span>
      </div>
      <div v-for="(week, index) in weeks" :key="index" class="mini-month__row" role="row">
        <button v-for="day in week" :key="day.key" type="button" role="gridcell" class="mini-month__day" :class="{ 'is-outside': !day.inMonth, 'is-today': day.isToday, 'is-selected': day.isSelected }" :tabindex="day.isFocusable ? 0 : -1" :aria-label="day.label" :aria-current="day.isToday ? 'date' : undefined" :aria-selected="day.isSelected" :data-date="day.key" @click="selectDate(day.date)">
          {{ day.date.day }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { Temporal } from '@js-temporal/polyfill';

defineOptions({ name: 'MiniMonth' });

const props = defineProps({
  // The date the calendar shows
  selectedDate: { type: Object, required: true },
  today: { type: Object, required: true },
  locale: { type: String, default: 'en-US' }
});

const emit = defineEmits(['select']);

const { t } = useI18n();

// The month on screen, and the day keyboard focus is on
const shownMonth = ref(props.selectedDate.with({ day: 1 }));
const focusedDate = ref(props.selectedDate);

// Follow the calendar when it moves to another month
watch(() => props.selectedDate, (date) => {
  shownMonth.value = date.with({ day: 1 });
  focusedDate.value = date;
});

const capitalize = (text) => text.charAt(0).toUpperCase() + text.slice(1);

const monthTitle = computed(() => capitalize(shownMonth.value.toLocaleString(props.locale, { month: 'long', year: 'numeric' })));

// Monday first, as in the calendar
const A_MONDAY = Temporal.PlainDate.from('2024-01-01');
const weekdays = computed(() => Array.from({ length: 7 }, (_, index) => {
  const date = A_MONDAY.add({ days: index });
  return { letter: date.toLocaleString(props.locale, { weekday: 'narrow' }), name: date.toLocaleString(props.locale, { weekday: 'long' }) };
}));

// Six weeks, from the Monday on or before the first of the month
const weeks = computed(() => {
  const first = shownMonth.value;
  const start = first.subtract({ days: first.dayOfWeek - 1 });
  return Array.from({ length: 6 }, (_, week) => Array.from({ length: 7 }, (_, day) => {
    const date = start.add({ days: week * 7 + day });
    return {
      date,
      key: date.toString(),
      inMonth: date.month === first.month,
      isToday: date.equals(props.today),
      isSelected: date.equals(props.selectedDate),
      isFocusable: date.equals(focusedDate.value),
      label: date.toLocaleString(props.locale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    };
  }));
});

function moveMonth(months) {
  shownMonth.value = shownMonth.value.add({ months });
  focusedDate.value = shownMonth.value;
}

function selectDate(date) {
  focusedDate.value = date;
  emit('select', date);
}

// Arrow keys move by a day or a week, Page Up and Page Down by a month, Home and End to the
// start and end of the week; the shown month follows
const KEY_MOVES = {
  ArrowLeft: { days: -1 },
  ArrowRight: { days: 1 },
  ArrowUp: { days: -7 },
  ArrowDown: { days: 7 },
  PageUp: { months: -1 },
  PageDown: { months: 1 }
};

function handleKeydown(event) {
  let next = null;
  if (KEY_MOVES[event.key]) {
    next = focusedDate.value.add(KEY_MOVES[event.key]);
  } else if (event.key === 'Home') {
    next = focusedDate.value.subtract({ days: focusedDate.value.dayOfWeek - 1 });
  } else if (event.key === 'End') {
    next = focusedDate.value.add({ days: 7 - focusedDate.value.dayOfWeek });
  }
  if (!next) return;

  event.preventDefault();
  focusedDate.value = next;
  if (next.month !== shownMonth.value.month || next.year !== shownMonth.value.year) {
    shownMonth.value = next.with({ day: 1 });
  }
  nextTick(() => {
    event.currentTarget?.querySelector?.(`[data-date="${next}"]`)?.focus();
  });
}
</script>

<style scoped>
.mini-month {
  padding: 0 8px;
  user-select: none;
}

.mini-month__header {
  display: flex;
  align-items: center;
  padding: 0 0 4px 8px;
}

.mini-month__title {
  flex: 1;
  font-size: 0.875rem;
  font-weight: var(--calendar-font-weight-medium, 500);
  color: var(--calendar-text-primary, #3c4043);
}

.mini-month__row {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  justify-items: center;
}

.mini-month__weekday {
  font-size: 0.625rem;
  font-weight: var(--calendar-font-weight-medium, 500);
  line-height: 24px;
  color: var(--calendar-text-secondary, #70757a);
}

.mini-month__day {
  width: 28px;
  height: 28px;
  margin: 1px 0;
  border: none;
  border-radius: 50%;
  background: transparent;
  color: var(--calendar-text-primary, #3c4043);
  font: inherit;
  font-size: 0.6875rem;
  font-weight: var(--calendar-font-weight-medium, 500);
  cursor: pointer;
}

.mini-month__day:hover {
  background: rgba(60, 64, 67, 0.08);
}

.mini-month__day:focus-visible {
  outline: 2px solid var(--calendar-primary-color, #1a73e8);
  outline-offset: 1px;
}

.mini-month__day.is-outside {
  color: var(--calendar-text-secondary, #70757a);
}

.mini-month__day.is-selected {
  background: color-mix(in srgb, var(--calendar-primary-color, #1a73e8) 16%, transparent);
  color: var(--calendar-primary-color, #1a73e8);
}

.mini-month__day.is-today {
  background: var(--calendar-today-bg, #1a73e8);
  color: var(--calendar-today-color, #ffffff);
}
</style>
