<template>
  <div class="calendar-body day-view">
    <div class="day-grid">
      <div class="time-column no-border">
        <div class="time-header"></div>
        <div v-for="hour in 23" :key="hour" class="time-slot-label">
          {{ formatHour(hour, locale) }}
        </div>
      </div>
      <div class="day-column-container">
        <div class="day-all-day-section" @click="$emit('all-day-select', date)">
          <div
            v-for="event in allDayEvents"
            :key="event.id"
            class="all-day-event"
            :style="getEventColorStyle(event.color)"
            @click.stop="$emit('event-select', event)"
          >
            {{ event.title }}
          </div>
        </div>
        <div class="day-column">
          <div
            v-for="hour in 23"
            :key="hour"
            class="hour-slot"
            @click="$emit('hour-slot-select', { date, hour: hour - 1 })"
          ></div>
          <div
            v-if="showCurrentTimeIndicator"
            class="current-time-indicator"
            :style="{ top: currentTimePosition + 'px' }"
          >
            <div class="time-indicator-circle"></div>
            <div class="time-indicator-line"></div>
          </div>
          <div
            v-for="event in events"
            :key="event.id"
            class="day-event"
            :style="{ ...getEventStyle(event, pixelsPerHour), ...getEventColorStyle(event.color) }"
            @click.stop="$emit('event-select', event)"
          >
            <div class="event-title">{{ event.title }}</div>
            <div class="event-time">{{ formatEventTime(event, locale) }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { formatEventTime, formatHour, getEventColorStyle, getEventStyle } from '../../composables/useCalendarUtils.js';

defineProps({
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
  t: {
    type: Function,
    required: true
  }
});
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
  display: flex;
  height: 100%;
  min-height: calc(23 * 60px);
}

.time-column {
  width: 60px;
  border-right: 1px solid #d0d0d0;
  flex-shrink: 0;
  position: relative;
}

.time-header {
  min-height: 40px;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.time-slot-label {
  height: 60px;
  padding: 0 8px;
  font-size: 10px;
  color: #70757a;
  text-align: right;
  position: relative;
  display: flex;
  align-items: flex-start;
  padding-top: 0;
  /* Position label on the grid line */
  transform: translateY(-8px);
}

.day-column-container {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.day-all-day-section {
  min-height: 40px;
  padding: 4px 8px;
  cursor: pointer;
  transition: background-color 0.2s;
  border-bottom: 1px solid #e0e0e0;
  margin-bottom: 8px;
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
  flex: 1;
  position: relative;
  border-right: 1px solid #d0d0d0;
}

.hour-slot {
  height: 60px;
  border-bottom: 1px solid #e0e0e0;
  cursor: pointer;
  transition: background-color 0.15s;
}

.hour-slot:first-child {
  border-top: none;
}

.hour-slot:hover {
  background-color: #f1f3f4;
}

.day-event {
  position: absolute;
  left: 4px;
  right: 4px;
  border-radius: 8px;
  padding: 8px;
  font-size: 13px;
  cursor: pointer;
  overflow: hidden;
  transition: opacity 0.2s;
  z-index: 1;
}

.day-event:hover {
  opacity: 0.9;
  box-shadow: 0 2px 6px rgba(0,0,0,0.2);
}

.event-title {
  font-weight: 500;
  margin-bottom: 4px;
}

.event-time {
  font-size: 11px;
  opacity: 0.9;
}

.current-time-indicator {
  position: absolute;
  left: 0;
  right: 0;
  z-index: 20;
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
  .day-grid {
    min-height: calc(23 * 50px);
  }

  .time-column {
    width: 50px;
  }

  .time-slot-label {
    height: 50px;
    font-size: 9px;
    padding: 0 4px;
    align-items: flex-start;
    transform: translateY(-7px);
  }
  
  .day-column {
    border-right: none;
  }
  
  .hour-slot {
    height: 50px;
  }
}
</style>
