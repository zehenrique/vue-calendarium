<template>
  <div class="calendar-body week-view">
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
              :style="{ top: currentTimePosition + 'px' }"
            >
              <div class="time-indicator-circle"></div>
              <div class="time-indicator-line"></div>
            </div>
            <div
              v-for="event in day.events"
              :key="event.id"
              class="week-event day-event"
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
  </div>
</template>

<script setup>
import { formatEventTime, formatHour, getEventColorStyle, getEventStyle } from '../../composables/useCalendarUtils.js';

defineProps({
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

.week-view {
  padding: 0;
}

.week-grid {
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
  min-height: 60px;
  padding-bottom: 8px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
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
  /* Position label at the top grid line */
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
  border-right: 1px solid #e0e0e0;
  position: relative;
}

.week-day-column:last-child {
  border-right: none;
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

.week-event {
  position: absolute;
  border-radius: 8px;
  padding: 4px;
  font-size: 12px;
  cursor: pointer;
  overflow: hidden;
  transition: opacity 0.2s;
  z-index: 1;
  box-sizing: border-box;
  /* Position, width, and padding are set via inline styles from getEventStyle */
}

@media (max-width: 768px) {
  .week-event {
    font-size: 10px;
    padding: 2px;
    border-radius: 6px;
  }
  
  .week-event .event-title {
    font-size: 10px;
    line-height: 1.2;
    margin-bottom: 1px;
  }
  
  .week-event .event-time {
    font-size: 9px;
    line-height: 1.1;
  }
}

.week-event:hover {
  opacity: 0.9;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
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
  .week-grid {
    min-height: calc(23 * 50px);
  }
  
  .time-column {
    width: 50px;
  }
  
  .time-slot-label {
    font-size: 9px;
    padding: 0 4px;
    height: 50px;
    align-items: flex-start;
    /* Slightly smaller nudge on mobile */
    transform: translateY(-7px);
  }
  
  .week-day-number {
    font-size: 18px;
    width: 32px;
    height: 32px;
  }
  
  .hour-slot {
    height: 50px;
  }
}
</style>
