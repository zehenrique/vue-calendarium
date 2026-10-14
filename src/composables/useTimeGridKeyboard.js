import { nextTick, ref, watch } from 'vue';
import { Temporal } from '@js-temporal/polyfill';

const STEPS = {
  ArrowUp: [0, -1],
  ArrowDown: [0, 1],
  ArrowLeft: [-1, 0],
  ArrowRight: [1, 0]
};

const TIME_FORMAT = { hour: '2-digit', minute: '2-digit', hour12: false };

/**
 * Keyboard access to the hour slots of a time grid (week and day views).
 * One slot is in the tab order; the arrow keys move between hours and days, and
 * Enter or Space selects the slot, which opens the create dialog.
 * Each slot needs `data-slot="<column>-<hour>"` so focus can move to it.
 * @param {import('vue').Ref<Array<{ date: object, isToday?: boolean }>>} columns - One entry per day column
 * @param {(slot: { date: object, hour: number }) => void} onSelect
 */
export function useTimeGridKeyboard(columns, onSelect) {
  const activeSlot = ref({ column: 0, hour: 9 });

  // Start on today's column when it is shown, and keep the hour while navigating
  watch(columns, (days) => {
    const todayColumn = days.findIndex(day => day.isToday);
    const column = todayColumn >= 0 ? todayColumn : Math.min(activeSlot.value.column, Math.max(days.length - 1, 0));
    activeSlot.value = { column, hour: activeSlot.value.hour };
  }, { immediate: true });

  const isActiveSlot = (column, hour) => activeSlot.value.column === column && activeSlot.value.hour === hour;

  function handleSlotKeydown(event, column, hour) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onSelect({ date: columns.value[column].date, hour });
      return;
    }

    const step = STEPS[event.key];
    if (!step) return;

    const next = { column: column + step[0], hour: hour + step[1] };
    if (next.column < 0 || next.column >= columns.value.length || next.hour < 0 || next.hour > 23) return;

    event.preventDefault();
    activeSlot.value = next;
    const grid = event.currentTarget.closest('.calendar-body');
    nextTick(() => grid?.querySelector(`[data-slot="${next.column}-${next.hour}"]`)?.focus());
  }

  return { isActiveSlot, handleSlotKeydown };
}

/**
 * A day as it is read in labels: "Monday, January 13" or "segunda-feira, 13 de janeiro".
 * Format it once per day column, not once per hour slot.
 */
export function formatDayLabel(date, locale) {
  return Temporal.PlainDate.from(date).toLocaleString(locale, { weekday: 'long', day: 'numeric', month: 'long' });
}

/**
 * Screen reader label for an hour slot: "Create event on Monday, January 13 at 10:00".
 */
export function getSlotLabel(dayLabel, hour, t) {
  return t('createEventAt', { date: dayLabel, time: `${String(hour).padStart(2, '0')}:00` });
}

/**
 * Screen reader label for an event in a time grid: "Team Meeting, 10:00 – 11:00".
 */
export function getEventLabel(event, locale, t) {
  const title = event.title || t('untitled');
  if (event.allDay) return `${title}, ${t('allDay')}`;

  const start = Temporal.PlainDateTime.from(event.start);
  const end = event.end ? Temporal.PlainDateTime.from(event.end) : start.add({ hours: 1 });
  return `${title}, ${start.toLocaleString(locale, TIME_FORMAT)} – ${end.toLocaleString(locale, TIME_FORMAT)}`;
}
