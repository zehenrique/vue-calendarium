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
          v-for="day in days"
          :key="day.key"
          class="calendar-day"
          :class="{
            'other-month': !day.isCurrentMonth,
            today: day.isToday
          }"
          @click="$emit('day-select', day.date)"
        >
          <div class="day-number">{{ day.day }}</div>
          <div class="day-events">
            <button
              v-for="event in day.events.slice(0, maxVisibleEvents)"
              :key="event.id"
              type="button"
              class="event"
              :style="getEventColorStyle(event.color)"
              @click.stop="$emit('event-select', event)"
              :aria-label="`${event.title} ${formatEventTime(event, locale)}`"
            >
              <span class="event-time" v-if="!event.allDay">{{ formatEventTime(event, locale) }}</span>
              <span>{{ event.title }}</span>
            </button>
            <button
              v-if="day.events.length > maxVisibleEvents"
              type="button"
              class="more-events"
              @click.stop="$emit('day-select', day.date)"
            >
              +{{ day.events.length - maxVisibleEvents }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { formatEventTime, getEventColorStyle } from '../../composables/useCalendarUtils.js';

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
  }
});

const maxVisibleEvents = computed(() => (props.isMobile ? 2 : 4));

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

.month-view {
  padding: 8px;
}

.calendar-grid {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.day-headers {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  border-bottom: 1px solid #d0d0d0;
  margin-bottom: 4px;
}

.day-header {
  padding: 8px;
  text-align: center;
  font-size: 11px;
  font-weight: 500;
  color: #70757a;
  text-transform: uppercase;
}

.calendar-days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  grid-auto-rows: minmax(100px, 1fr);
  gap: 1px;
  background: #d0d0d0;
  border: 1px solid #d0d0d0;
}

.calendar-day {
  background: white;
  padding: 4px;
  position: relative;
  overflow: hidden;
  cursor: pointer;
  transition: background-color 0.2s;
}

.calendar-day:hover {
  background-color: #f8f9fa;
}

.calendar-day.other-month {
  background-color: #fafafa;
}

.calendar-day.other-month .day-number {
  color: #70757a;
}

.calendar-day.today .day-number {
  background-color: #1a73e8;
  color: white;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
}

.day-number {
  font-size: 12px;
  font-weight: 500;
  color: #3c4043;
  padding: 4px;
  margin-bottom: 2px;
}

.day-events {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.event {
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 6px;
  cursor: pointer;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  transition: opacity 0.2s;
  text-align: left;
}

.event:hover {
  opacity: 0.8;
}

.event-time {
  font-weight: 500;
  margin-right: 4px;
}

.more-events {
  font-size: 11px;
  color: #5f6368;
  padding: 2px 6px;
  background: none;
  border: none;
  cursor: pointer;
  text-align: left;
}

.more-events:hover {
  text-decoration: underline;
}

@media (max-width: 768px) {
  .calendar-days {
    grid-auto-rows: minmax(80px, 1fr);
  }
}
</style>
