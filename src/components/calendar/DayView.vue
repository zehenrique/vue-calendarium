<template>
  <div class="calendar-body day-view" :class="{ 'has-all-day-events': hasAllDayEvents }">
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
            :style="{ ...getEventStyle(event, pixelsPerHour), ...getEventColorStyle(event.color, isEventPast(event)) }"
            @click.stop="$emit('event-select', event)">
            <div class="event-title">{{ event.title || '(Sem título)' }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, toRefs } from 'vue';
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
</script>

<style scoped>
.calendar-body {
  flex: 1;
  overflow: hidden;
  background: #ffffff;
  position: relative;
  width: 100%;
  max-width: 100%;
}

.day-view {
  padding: 0;
}

.day-grid {
  display: grid;
  grid-template-columns: 60px 1fr;
  height: 100%;
  min-height: calc(24 * 45px);
}

.time-column {
  display: grid;
  grid-template-rows: auto repeat(24, 45px);
  border-right: 1px solid #d0d0d0;
  position: relative;
}

.time-header {
  min-height: 40px;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid #e0e0e0;
}

.time-slot-label {
  height: 45px;
  padding: 0 8px;
  font-size: 10px;
  color: #70757a;
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
  padding: 4px 8px;
  cursor: pointer;
  transition: background-color 0.2s;
  border-bottom: 1px solid #e0e0e0;
}

.day-all-day-section:hover {
  background-color: #f8f9fa;
}

.all-day-event {
  font-size: 12px;
  padding: 2px 8px;
  margin: 2px 0;
  border-radius: 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: pointer;
  transition: opacity 0.2s;
}

.all-day-event:hover {
  opacity: 0.8;
}

.day-column {
  position: relative;
  border-right: 1px solid #d0d0d0;
  display: grid;
  grid-template-rows: repeat(24, 45px);
}

.hour-slot {
  height: 45px;
  border-bottom: 1px solid #e0e0e0;
  cursor: pointer;
  transition: background-color 0.15s;
}

.hour-slot:first-child {
  border-top: none;
}

.day-view:not(.has-all-day-events) .hour-slot:first-child {
  border-top: 1px solid #e0e0e0;
}

.hour-slot:hover {
  background-color: #f1f3f4;
}

.day-event {
  position: absolute;
  border-radius: 8px;
  padding: 2px 4px 0px 8px;
  font-size: 13px;
  cursor: pointer;
  overflow: hidden;
  transition: opacity 0.2s;
  z-index: 1;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  /* Position, width, and padding are set via inline styles from getEventStyle */
}

.day-event:hover {
  opacity: 0.9;
  box-shadow: 0 2px 6px rgba(0,0,0,0.2);
}

.event-title {
  font-weight: 500;
  margin-bottom: 4px;
  overflow-wrap: break-word;
  word-wrap: break-word;
  word-break: break-word;
  white-space: normal;
  line-height: 1.3;
  flex: 1;
  overflow: hidden;
}

.ghost-event {
  opacity: 0.5 !important;
  pointer-events: none;
  border: 2px dashed currentColor !important;
}

.current-time-indicator {
  position: absolute;
  left: 0;
  right: 0;
  z-index: 5;
  pointer-events: none;
  display: flex;
  align-items: center;
}

.time-indicator-circle {
  width: 12px;
  height: 12px;
  background-color: #ea4335;
  border-radius: 50%;
  margin-left: -6px;
  flex-shrink: 0;
}

.time-indicator-line {
  flex: 1;
  height: 2px;
  background-color: #ea4335;
}

@media (max-width: 768px) {
  .day-event {
    font-size: 11px;
    border-radius: 6px;
  }
  
  .event-title {
    font-size: 11px;
    line-height: 1.2;
    margin-bottom: 2px;
  }
  
  .day-grid {
    grid-template-columns: 50px 1fr;
    min-height: calc(24 * 38px);
  }

  .time-column {
    grid-template-rows: auto repeat(24, 38px);
  }
  
  .day-column {
    grid-template-rows: repeat(24, 38px);
  }

  .time-slot-label {
    height: 38px;
    font-size: 9px;
    padding: 0 4px;
    align-items: flex-start;
  }
  
  .day-column {
    border-right: none;
  }
  
  .hour-slot {
    height: 38px;
  }
}
</style>
