<template>
  <div class="calendar-body month-view">
    <div class="calendar-grid">
      <div class="day-headers">
        <div v-for="dayName in weekDays" :key="dayName" class="day-header">
          {{ dayName }}
        </div>
      </div>
      <div class="calendar-days">
        <div
          v-for="(day, index) in days"
          :key="day.key"
          class="calendar-day"
          :class="{
            'other-month': !day.isCurrentMonth,
            today: day.isToday
          }"
          @click="$emit('day-select', day.date)"
        >
          <div class="day-number" role="button" :tabindex="day.key === activeDayKey ? 0 : -1" :data-day-key="day.key" :aria-label="t('createEventOn', { date: formatDayLabel(day.date, locale) })" @keydown="handleDayKeydown($event, index)">{{ day.day }}</div>
          <div class="day-events">
            <button
              v-for="event in day.events.slice(0, maxVisibleEvents)"
              :key="event.id"
              type="button"
              class="event"
              :class="{ 'ghost-event': event.isGhost }"
              :style="getEventColorStyle(event.color, isEventPast(event))"
              @click.stop="$emit('event-select', event)"
              :aria-label="`${event.title || t('untitled')} ${formatEventTime(event, locale, t('allDay'))}`">
              <span>{{ event.title || t('untitled') }}</span>
            </button>
            <MoreEventsMenu v-if="day.events.length > maxVisibleEvents" :date="day.date" :events="day.events" :hidden-count="day.events.length - maxVisibleEvents" :locale="locale" :t="t" @event-select="$emit('event-select', $event)" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, ref, watch } from 'vue';
import { formatEventTime, getEventColorStyle, isEventPast } from '../../composables/useCalendarUtils.js';
import { formatDayLabel } from '../../composables/useTimeGridKeyboard.js';
import MoreEventsMenu from './MoreEventsMenu.vue';

const props = defineProps({
  days: {
    type: Array,
    default: () => []
  },
  weekDays: {
    type: Array,
    default: () => []
  },
  locale: {
    type: String,
    default: 'en-US'
  },
  isMobile: {
    type: Boolean,
    default: false
  },
  t: {
    type: Function,
    required: true
  }
});

const emit = defineEmits(['day-select', 'event-select']);

const maxVisibleEvents = computed(() => (props.isMobile ? 2 : 4));

// Keyboard: one day number is in the tab order; arrow keys move between days and
// Enter or Space opens the create dialog for that day
const activeDayKey = ref(null);

watch(() => props.days, (days) => {
  if (days.some(day => day.key === activeDayKey.value)) return;
  const initialDay = days.find(day => day.isToday) ?? days.find(day => day.isCurrentMonth) ?? days[0];
  activeDayKey.value = initialDay?.key ?? null;
}, { immediate: true });

const DAY_KEY_STEPS = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };

function handleDayKeydown(event, index) {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    emit('day-select', props.days[index].date);
    return;
  }

  const step = DAY_KEY_STEPS[event.key];
  const nextDay = step && props.days[index + step];
  if (!nextDay) return;

  event.preventDefault();
  activeDayKey.value = nextDay.key;
  const grid = event.currentTarget.closest('.calendar-days');
  nextTick(() => grid?.querySelector(`[data-day-key="${nextDay.key}"]`)?.focus());
}

</script>

<style scoped>
.calendar-body {
  flex: 1;
  overflow: hidden;
  background: var(--calendar-bg, #ffffff);
  position: relative;
  width: 100%;
  max-width: 100%;
  display: flex;
  flex-direction: column;
}

.month-view {
  padding: var(--calendar-spacing-md, 8px);
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  overscroll-behavior-y: contain;
  -webkit-overflow-scrolling: touch;
}

@media (max-width: 767px) {
  .calendar-body.month-view {
    padding-bottom: calc(env(safe-area-inset-bottom, 0px) + var(--calendar-mobile-bottom-padding, 46px));
  }
}

.calendar-grid {
  display: flex;
  flex-direction: column;
  height: 100%;
  flex: 1;
}

.day-headers {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  flex-shrink: 0;
}

.day-header {
  padding: var(--calendar-spacing-xs, 2px);
  text-align: center;
  font-size: var(--calendar-week-day-font-size, 11px);
  font-weight: var(--calendar-font-weight-medium, 500);
  color: var(--calendar-text-secondary, #70757a);
  text-transform: uppercase;
}

.calendar-days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  grid-template-rows: repeat(auto-fit, 1fr);
  gap: var(--calendar-grid-gap, 1px);
  background: var(--calendar-border-color-dark, #d0d0d0);
  border-bottom: 1px solid var(--calendar-border-color-dark, #d0d0d0);
  text-align: center;
  flex: 1;
  overflow: hidden;
}

.calendar-day {
  background: var(--calendar-day-bg, white);
  padding: var(--calendar-spacing-sm, 4px);
  position: relative;
  overflow: hidden;
  cursor: pointer;
  transition: background-color var(--calendar-transition-fast, 0.2s);
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.calendar-day:hover {
  background-color: var(--calendar-day-hover-bg, #f8f9fa);
}

.calendar-day.other-month {
  background-color: var(--calendar-day-other-month-bg, #fafafa);
}

.calendar-day.other-month .day-number {
  color: var(--calendar-text-secondary, #70757a);
}

.calendar-day.today .day-number {
  background-color: var(--calendar-today-bg, #1a73e8);
  color: var(--calendar-today-color, white);
  border-radius: var(--calendar-border-radius-circle, 50%);
  width: var(--calendar-day-number-size, 24px);
  height: var(--calendar-day-number-size, 24px);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: var(--calendar-day-number-font-size, 12px);
}

.day-number {
  font-size: var(--calendar-day-number-font-size, 12px);
  font-weight: var(--calendar-font-weight-medium, 500);
  color: var(--calendar-text-primary, #3c4043);
  padding: var(--calendar-spacing-sm, 4px);
  margin-bottom: var(--calendar-spacing-xs, 2px);
  flex-shrink: 0;
}

.day-events {
  display: flex;
  flex-direction: column;
  gap: var(--calendar-event-gap, 2px);
  flex: 1;
  overflow: hidden;
  min-height: 0;
}

.event {
  border: none;
  font-size: var(--calendar-event-font-size, 11px);
  padding: var(--calendar-event-padding, 2px 6px);
  border-radius: var(--calendar-event-border-radius, 6px);
  cursor: pointer;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: opacity var(--calendar-transition-fast, 0.2s);
  text-align: left;
  line-height: var(--calendar-event-line-height, 1.2);
  max-height: var(--calendar-event-max-height, 20px);
}

.event:hover {
  opacity: var(--calendar-event-hover-opacity, 0.8);
}

.ghost-event {
  opacity: var(--calendar-ghost-event-opacity, 0.5) !important;
  pointer-events: none;
  border: 2px dashed currentColor !important;
}

/* Keyboard focus on events and on the day number (the day's "create event" target) */
.event:focus-visible,
.day-number:focus-visible {
  outline: 2px solid var(--calendar-primary-color, #1a73e8);
  outline-offset: 1px;
}

.day-number:focus-visible {
  border-radius: var(--calendar-border-radius-circle, 50%);
}

@media (max-width: 768px) {
  .month-view {
    padding: var(--calendar-spacing-sm, 4px);
  }
  
  .day-number {
    font-size: var(--calendar-mobile-day-number-font-size, 11px);
    padding: var(--calendar-spacing-xs, 2px);
  }
  
  .event {
    font-size: var(--calendar-mobile-event-font-size, 10px);
    padding: 1px 4px;
  }
}
</style>
