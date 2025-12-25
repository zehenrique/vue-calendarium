<template>
  <div ref="scrollContainer" class="calendar-body week-view">
    <div class="week-grid">
      <div class="time-column no-border">
        <div class="time-header"></div>
        <div v-for="hour in 23" :key="hour" class="time-slot-label">
          {{ formatHour(hour, locale) }}
        </div>
      </div>
      <div class="week-days-container">
        <div class="week-day-columns">
          <div v-for="day in days" :key="day.key" class="week-day-column">
            <div v-for="hour in 24" :key="hour" class="hour-slot" @click="$emit('hour-slot-select', { date: day.date, hour: hour - 1 })"></div>
            <div
              v-if="showCurrentTimeIndicator && day.isToday"
              class="current-time-indicator"
              :style="{ top: currentTimePosition + 'px' }">
              <div class="time-indicator-circle"></div>
              <div class="time-indicator-line"></div>
            </div>
            <div
              v-for="event in day.events"
              :key="event.id"
              class="week-event"
              :class="{ 'ghost-event': event.isGhost }"
              :style="{ ...getEventStyle(event, pixelsPerHour, isMobile), ...getEventColorStyle(event.color, isEventPast(event)) }"
              @click.stop="$emit('event-select', event)">
              <div class="event-title">{{ event.title || '(Sem título)' }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, ref, toRefs, watch } from 'vue';
import { formatHour, getEventColorStyle, getEventStyle, isEventPast } from '../../composables/useCalendarUtils.js';

const props = defineProps({
  days: {
    type: Array,
    default: () => []
  },
  locale: {
    type: String,
    default: 'en-US'
  },
  pixelsPerHour: {
    type: Number,
    default: 60
  },
  showCurrentTimeIndicator: {
    type: Boolean,
    default: false
  },
  currentTimePosition: {
    type: Number,
    default: 0
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

const { days, showCurrentTimeIndicator, currentTimePosition } = toRefs(props);
const todayKey = computed(() => days.value?.find(day => day.isToday)?.key ?? '');

const scrollContainer = ref(null);
const hasAutoScrolled = ref(false);
const SCROLL_PADDING = 120;

const scrollToCurrentTime = () => {
  if (!scrollContainer.value || hasAutoScrolled.value) {
    return;
  }

  // Wait for next tick to ensure DOM is fully rendered
  nextTick(() => {
    requestAnimationFrame(() => {
      const container = scrollContainer.value;
      if (!container) {
        return;
      }

      // Only scroll if we have a current time position
      // This means we're viewing a week that contains today
      if (!currentTimePosition.value || currentTimePosition.value <= 0) {
        // Don't set hasAutoScrolled - we didn't actually scroll yet
        // This allows retry when currentTimePosition becomes available
        return;
      }

      const target = Math.max(0, currentTimePosition.value - SCROLL_PADDING);
      container.scrollTop = target;
      hasAutoScrolled.value = true;
    });
  });
};const scheduleScroll = () => nextTick(scrollToCurrentTime);

onMounted(scheduleScroll);

watch(todayKey, () => {
  hasAutoScrolled.value = false;
});

watch(showCurrentTimeIndicator, value => {
  if (!value) {
    hasAutoScrolled.value = false;
  }
});

watch([showCurrentTimeIndicator, todayKey], scheduleScroll);

// Also watch for currentTimePosition changes in case it updates after mount
watch(currentTimePosition, (newVal) => {
  if (newVal > 0 && !hasAutoScrolled.value) {
    scheduleScroll();
  }
});
</script>

<style scoped>
.calendar-body.week-view {
  flex: 1;
  background: var(--calendar-bg, #ffffff);
  position: relative;
  width: 100%;
  max-width: 100%;
  min-height: 0;
  padding: 0;
  overflow-y: auto; /* Auto show scrollbar only when needed */
  overflow-x: hidden;
  display: block;
  touch-action: pan-y; /* Allow vertical scroll but enable horizontal swipe gestures */
}

/* Style the scrollbar to be thin and match Google Calendar */
.calendar-body.week-view::-webkit-scrollbar {
  width: 6px;
}

.calendar-body.week-view::-webkit-scrollbar-track {
  background: #f1f3f4;
}

.calendar-body.week-view::-webkit-scrollbar-thumb {
  background: #dadce0;
  border-radius: 3px;
}

.calendar-body.week-view::-webkit-scrollbar-thumb:hover {
  background: #bdc1c6;
}

.week-grid {
  display: flex;
  min-height: calc(23 * var(--calendar-pixels-per-hour-week, 60px) * var(--calendar-height-scale, 1));
}

.time-column {
  width: var(--calendar-time-column-width, 60px);
  border-right: 1px solid var(--calendar-border-color-dark, #d0d0d0);
  flex-shrink: 0;
  position: relative;
}

.time-header {
  min-height: calc(var(--calendar-pixels-per-hour-week, 60px) * var(--calendar-height-scale, 1));
  padding-bottom: var(--calendar-spacing-md, 8px);
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}

.time-slot-label {
  height: calc(var(--calendar-pixels-per-hour-week, 60px) * var(--calendar-height-scale, 1));
  padding: 0 var(--calendar-spacing-md, 8px);
  font-size: var(--calendar-font-size-xsmall, 10px);
  color: var(--calendar-text-secondary, #70757a);
  text-align: right;
  position: relative;
  display: flex;
  align-items: flex-start;
  padding-top: 0;
  transform: translateY(-8px);
}

.week-days-container {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.week-day-columns {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  position: relative;
  flex: 1;
}

.week-day-column {
  border-right: 1px solid var(--calendar-border-color, #e0e0e0);
  position: relative;
}

.week-day-column:last-child {
  border-right: none;
}

.hour-slot {
  height: calc(var(--calendar-pixels-per-hour-week, 60px) * var(--calendar-height-scale, 1));
  border-bottom: 1px solid var(--calendar-border-color, #e0e0e0);
  cursor: pointer;
  transition: background-color 0.15s;
}

.hour-slot:first-child {
  border-top: none;
}

.hour-slot:hover {
  background-color: var(--calendar-day-hover-bg, #f1f3f4);
}

.week-event {
  position: absolute;
  border-radius: var(--calendar-event-border-radius, 8px);
  padding: var(--calendar-spacing-sm, 4px);
  font-size: var(--calendar-event-font-size, 12px);
  cursor: pointer;
  overflow: hidden;
  transition: opacity var(--calendar-transition-fast, 0.2s);
  z-index: var(--calendar-event-z-index, 1);
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

.event-title {
  font-weight: var(--calendar-font-weight-medium, 500);
  overflow-wrap: break-word;
  word-wrap: break-word;
  word-break: break-word;
  white-space: normal;
  line-height: 1.3;
  flex: 1;
  overflow: hidden;
}

.week-event:hover {
  opacity: 0.9;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

.ghost-event {
  opacity: var(--calendar-ghost-event-opacity, 0.5) !important;
  pointer-events: none;
  border: 2px dashed currentColor !important;
}

.current-time-indicator {
  position: absolute;
  left: 0;
  right: 0;
  z-index: var(--calendar-current-time-z-index, 5);
  pointer-events: none;
  display: flex;
  align-items: center;
}

.time-indicator-circle {
  width: var(--calendar-current-time-circle-size, 12px);
  height: var(--calendar-current-time-circle-size, 12px);
  background-color: var(--calendar-current-time-color, #ea4335);
  border-radius: var(--calendar-border-radius-circle, 50%);
  margin-left: calc(var(--calendar-current-time-circle-size, 12px) / -2);
  flex-shrink: 0;
}

.time-indicator-line {
  flex: 1;
  height: 2px;
  background-color: var(--calendar-current-time-color, #ea4335);
}

@media (max-width: 768px) {
  .week-event {
    font-size: 8px;
    padding: 1px 2px;
    border-radius: 3px;
    min-height: 0;
    line-height: 1;
    max-width: 100%;
  }

  .week-grid {
    min-height: calc(23 * var(--calendar-pixels-per-hour-week-mobile, 50px) * var(--calendar-height-scale, 1));
  }
  
  .time-column {
    width: var(--calendar-time-column-width-mobile, 50px);
  }
  
  .time-slot-label {
    font-size: 9px;
    padding: 0 var(--calendar-spacing-sm, 4px);
    height: var(--calendar-pixels-per-hour-week-mobile, 50px);
    align-items: flex-start;
    transform: translateY(-7px);
  }
  
  .week-day-number {
    font-size: 18px;
    width: var(--calendar-week-day-number-size-mobile, 32px);
    height: var(--calendar-week-day-number-size-mobile, 32px);
  }
  
  .hour-slot {
    height: calc(var(--calendar-pixels-per-hour-week-mobile, 50px) * var(--calendar-height-scale, 1));
  }
  
  .week-event {
    font-size: 8px;
    padding: 1px 2px;
    border-radius: 3px;
    min-height: 0;
    line-height: 1;
    max-width: 100%;
  }
  
  .week-event .event-title {
    font-size: 8px;
    line-height: 1;
    margin-bottom: 0;
    white-space: wrap;
    overflow: visible;
    text-overflow: ellipsis;
    max-width: 100%;
    font-weight: var(--calendar-font-weight-medium, 500);
  }
  
  .week-event .event-time {
    display: none;
  }

  .time-header {
    min-height: calc(var(--calendar-pixels-per-hour-week-mobile, 50px) * var(--calendar-height-scale, 1));
  }

  .time-slot-label {
    height: calc(var(--calendar-pixels-per-hour-week-mobile, 50px) * var(--calendar-height-scale, 1));
  }
}
</style>
