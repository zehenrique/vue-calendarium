<template>
  <div ref="scrollContainer" class="calendar-body day-view" :class="{ 'has-all-day-events': hasAllDayEvents }">
    <div class="day-grid">
      <div class="time-column no-border">
        <div v-if="hasAllDayEvents" class="time-header"></div>
        <div v-for="hour in 24" :key="hour" class="time-slot-label">
          <span v-if="hour > 1">{{ formatHour(hour - 1, locale) }}</span>
        </div>
      </div>
      <div class="day-column-container">
        <div
          v-if="hasAllDayEvents"
          class="day-all-day-section"
          @click="$emit('all-day-select', date)">
          <div
            v-for="event in allDayEvents"
            :key="event.id"
            class="all-day-event"
            :style="getEventColorStyle(event.color, isEventPast(event))"
            @click.stop="$emit('event-select', event)">
            {{ event.title }}
          </div>
        </div>
        <div class="day-column">
          <div
            v-for="hour in 24"
            :key="hour"
            class="hour-slot"
            @click="$emit('hour-slot-select', { date, hour: hour - 1 })">
          </div>
          <div
            v-if="showCurrentTimeIndicator"
            class="current-time-indicator"
            :style="{ top: currentTimePosition + 'px' }">
            <div class="time-indicator-circle"></div>
            <div class="time-indicator-line"></div>
          </div>
          <div
            v-for="event in events"
            :key="event.id"
            class="day-event"
            :class="{ 'ghost-event': event.isGhost }"
            :style="{ ...getEventStyle(event, pixelsPerHour, isMobile), ...getEventColorStyle(event.color, isEventPast(event)) }"
            @click.stop="$emit('event-select', event)">
            <div class="event-title">{{ event.title || '(Sem título)' }}</div>
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
  date: {
    type: Object,
    required: true
  },
  events: {
    type: Array,
    default: () => []
  },
  allDayEvents: {
    type: Array,
    default: () => []
  },
  locale: {
    type: String,
    default: 'en-US'
  },
  pixelsPerHour: {
    type: Number,
    default: 45
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

const {
  date,
  events,
  allDayEvents,
  locale,
  pixelsPerHour,
  showCurrentTimeIndicator,
  currentTimePosition
} = toRefs(props);

const hasAllDayEvents = computed(() => (allDayEvents.value?.length || 0) > 0);
const dateKey = computed(() => (date.value?.toString?.() ?? date.value ?? '')); 
const allDayCount = computed(() => allDayEvents.value?.length ?? 0);

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
      if (!container) return;
      
      // Only scroll if we have a current time position
      // This means we're viewing today's date
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
};

const scheduleScroll = () => nextTick(scrollToCurrentTime);

onMounted(scheduleScroll);

// Reset hasAutoScrolled when the date prop changes (view change or navigation)
watch(date, () => {
  hasAutoScrolled.value = false;
}, { deep: false });

watch([showCurrentTimeIndicator, dateKey, allDayCount], scheduleScroll);

watch(dateKey, () => {
  hasAutoScrolled.value = false;
});

watch(showCurrentTimeIndicator, value => {
  if (!value) {
    hasAutoScrolled.value = false;
  }
});

// Also watch for currentTimePosition changes in case it updates after mount
watch(currentTimePosition, (newVal) => {
  if (newVal > 0 && !hasAutoScrolled.value) {
    scheduleScroll();
  }
});
</script>

<style scoped>
.calendar-body {
  flex: 1;
  background: var(--calendar-bg, #ffffff);
  position: relative;
  width: 100%;
  max-width: 100%;
  overflow: hidden;
  min-height: 0;
}

.calendar-body.day-view {
  padding: 0;
  overflow-y: auto; /* Auto show scrollbar only when needed */
  overflow-x: hidden;
  display: block;
  touch-action: pan-y; /* Allow vertical scroll but enable horizontal swipe gestures */
}

/* Style the scrollbar to be thin and match Google Calendar */
.calendar-body.day-view::-webkit-scrollbar {
  width: 6px;
}

.calendar-body.day-view::-webkit-scrollbar-track {
  background: #f1f3f4;
}

.calendar-body.day-view::-webkit-scrollbar-thumb {
  background: #dadce0;
  border-radius: 3px;
}

.calendar-body.day-view::-webkit-scrollbar-thumb:hover {
  background: #bdc1c6;
}

.day-grid {
  display: grid;
  grid-template-columns: var(--calendar-time-column-width, 60px) 1fr;
  min-height: calc(24 * var(--calendar-pixels-per-hour-day, 45px) * var(--calendar-height-scale, 1));
}

.time-column {
  display: grid;
  grid-template-rows: auto repeat(24, calc(var(--calendar-pixels-per-hour-day, 45px) * var(--calendar-height-scale, 1)));
  border-right: 1px solid var(--calendar-border-color-dark, #d0d0d0);
  position: relative;
}

.time-header {
  min-height: 40px;
  padding: var(--calendar-spacing-sm, 4px);
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid var(--calendar-border-color, #e0e0e0);
}

.time-slot-label {
  height: calc(var(--calendar-pixels-per-hour-day, 45px) * var(--calendar-height-scale, 1));
  padding: 0 var(--calendar-spacing-md, 8px);
  font-size: var(--calendar-font-size-xsmall, 10px);
  color: var(--calendar-text-secondary, #70757a);
  text-align: right;
  position: relative;
  display: flex;
  align-items: flex-start;
  padding-top: 0;
  overflow: visible;
}

.time-slot-label span {
  display: inline-block;
  position: relative;
  top: -8px;
}

.day-column-container {
  display: grid;
  grid-template-rows: auto 1fr;
}

.day-all-day-section {
  min-height: 40px;
  padding: var(--calendar-spacing-sm, 4px) var(--calendar-spacing-md, 8px);
  cursor: pointer;
  transition: background-color var(--calendar-transition-fast, 0.2s);
  border-bottom: 1px solid var(--calendar-border-color, #e0e0e0);
}

.day-all-day-section:hover {
  background-color: var(--calendar-day-hover-bg, #f8f9fa);
}

.all-day-event {
  font-size: var(--calendar-event-font-size, 12px);
  padding: var(--calendar-event-padding, 2px 8px);
  margin: var(--calendar-spacing-xs, 2px) 0;
  border-radius: var(--calendar-event-border-radius, 8px);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: pointer;
  transition: opacity var(--calendar-transition-fast, 0.2s);
}

.all-day-event:hover {
  opacity: var(--calendar-event-hover-opacity, 0.8);
}

.day-column {
  position: relative;
  border-right: 1px solid var(--calendar-border-color-dark, #d0d0d0);
  display: grid;
  grid-template-rows: repeat(24, calc(var(--calendar-pixels-per-hour-day, 45px) * var(--calendar-height-scale, 1)));
}

.hour-slot {
  height: calc(var(--calendar-pixels-per-hour-day, 45px) * var(--calendar-height-scale, 1));
  border-bottom: 1px solid var(--calendar-border-color, #e0e0e0);
  cursor: pointer;
  transition: background-color 0.15s;
}

.hour-slot:first-child {
  border-top: none;
}

.day-view:not(.has-all-day-events) .hour-slot:first-child {
  border-top: 1px solid var(--calendar-border-color, #e0e0e0);
}

.hour-slot:hover {
  background-color: var(--calendar-day-hover-bg, #f1f3f4);
}

.day-event {
  position: absolute;
  border-radius: var(--calendar-event-border-radius, 8px);
  padding: 2px 4px 0px 8px;
  font-size: 13px;
  cursor: pointer;
  overflow: hidden;
  transition: opacity var(--calendar-transition-fast, 0.2s);
  z-index: var(--calendar-event-z-index, 1);
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

.day-event:hover {
  opacity: 0.9;
  box-shadow: 0 2px 6px rgba(0,0,0,0.2);
}

.event-title {
  font-weight: var(--calendar-font-weight-medium, 500);
  margin-bottom: var(--calendar-spacing-sm, 4px);
  overflow-wrap: break-word;
  word-wrap: break-word;
  word-break: break-word;
  white-space: normal;
  line-height: 1.3;
  flex: 1;
  overflow: hidden;
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
  .day-event {
    font-size: 11px;
    border-radius: var(--calendar-border-radius-sm, 6px);
  }
  
  .event-title {
    font-size: 11px;
    line-height: 1.2;
    margin-bottom: var(--calendar-spacing-xs, 2px);
  }
  
  .day-grid {
    grid-template-columns: var(--calendar-time-column-width-mobile, 50px) 1fr;
    min-height: calc(24 * var(--calendar-pixels-per-hour-day-mobile, 38px) * var(--calendar-height-scale, 1));
  }

  .time-column {
    grid-template-rows: auto repeat(24, calc(var(--calendar-pixels-per-hour-day-mobile, 38px) * var(--calendar-height-scale, 1)));
  }
  
  .day-column {
    grid-template-rows: repeat(24, calc(var(--calendar-pixels-per-hour-day-mobile, 38px) * var(--calendar-height-scale, 1)));
  }

  .time-slot-label {
    height: calc(var(--calendar-pixels-per-hour-day-mobile, 38px) * var(--calendar-height-scale, 1));
    font-size: 9px;
    padding: 0 var(--calendar-spacing-sm, 4px);
    align-items: flex-start;
  }
  
  .day-column {
    border-right: none;
  }
  
  .hour-slot {
    height: calc(var(--calendar-pixels-per-hour-day-mobile, 38px) * var(--calendar-height-scale, 1));
  }
}
</style>
