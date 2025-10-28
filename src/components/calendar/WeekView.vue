<template>
  <div class="calendar-body week-view">
    <div class="week-grid">
      <div class="time-column no-border">
        <div class="time-header">
          <div class="all-day-label">
            {{ t('allDay') }}
          </div>
        </div>
        <div v-for="hour in 24" :key="hour" class="time-slot-label">
          {{ formatHour(hour - 1, locale) }}
        </div>
      </div>
      <div class="week-days-container">
        <div class="week-day-headers sticky-header">
          <div v-for="day in days" :key="`header-${day.key}`" class="week-day-header">
            <span class="week-day-name">{{ day.dayName }}</span>
            <span class="week-day-number" :class="{ today: day.isToday }">{{ day.day }}</span>
          </div>
        </div>
        <div class="week-day-columns">
          <div v-for="day in days" :key="day.key" class="week-day-column">
            <div class="all-day-events-container" @click="$emit('all-day-select', day.date)">
              <div
                v-for="event in day.allDayEvents"
                :key="event.id"
                class="all-day-event"
                :style="getEventColorStyle(event.color)"
                @click.stop="$emit('event-select', event)"
              >
                {{ event.title }}
              </div>
            </div>
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
  overflow-y: auto;
  overflow-x: hidden;
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
  min-height: calc(24 * 60px);
}

.time-column {
  width: 60px;
  border-right: 1px solid #d0d0d0;
  flex-shrink: 0;
}

.time-header {
  min-height: 60px;
  border-bottom: 1px solid #d0d0d0;
  padding-bottom: 8px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}

.time-slot-label {
  height: 60px;
  padding: 4px 8px;
  font-size: 10px;
  color: #70757a;
  text-align: right;
  position: relative;
}

.week-days-container {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.week-day-headers {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  min-height: 60px;
  border-bottom: 1px solid #d0d0d0;
  padding-bottom: 8px;
  background: #fff;
  z-index: 10;
}

.week-day-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  border-right: 1px solid #e0e0e0;
  gap: 4px;
  padding-top: 8px;
}

.week-day-header:last-child {
  border-right: none;
}

.week-day-name {
  font-size: 11px;
  color: #70757a;
  text-transform: uppercase;
  font-weight: 500;
}

.week-day-number {
  font-size: 20px;
  color: #3c4043;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.week-day-number.today {
  background-color: #1a73e8;
  color: white;
}

.week-day-columns {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  position: relative;
  flex: 1;
  margin-top: 8px;
  border-top: 1px solid #d0d0d0;
}

.week-day-column {
  border-right: 1px solid #e0e0e0;
  position: relative;
}

.week-day-column:last-child {
  border-right: none;
}

.all-day-events-container {
  min-height: 40px;
  padding: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
  border-bottom: 1px solid #e0e0e0;
}

.all-day-events-container:hover {
  background-color: #f8f9fa;
}

.all-day-event {
  font-size: 12px;
  padding: 2px 8px;
  margin: 2px 0;
  border-radius: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: pointer;
  transition: opacity 0.2s;
}

.all-day-event:hover {
  opacity: 0.8;
}

.hour-slot {
  height: 60px;
  border-bottom: 1px solid #e0e0e0;
  cursor: pointer;
  transition: background-color 0.15s;
}

.hour-slot:hover {
  background-color: #f1f3f4;
}

.week-event {
  position: absolute;
  left: 2px;
  right: 2px;
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 12px;
  cursor: pointer;
  overflow: hidden;
  transition: opacity 0.2s;
  z-index: 1;
}

.week-event:hover {
  opacity: 0.9;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
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
  .week-grid {
    min-height: calc(24 * 50px);
  }
  
  .time-column {
    width: 50px;
  }
  
  .time-slot-label {
    font-size: 9px;
    padding: 2px 4px;
    height: 50px;
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
