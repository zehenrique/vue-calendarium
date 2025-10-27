<template>
  <div class="google-calendar" :class="{ 'is-mobile': isMobile }">
    <!-- Header -->
    <div class="calendar-header">
      <div class="header-left">
        <button class="nav-btn" @click="previousPeriod" :aria-label="t('previous')">
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path fill="currentColor" d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
          </svg>
        </button>
        <button class="nav-btn" @click="nextPeriod" :aria-label="t('next')">
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path fill="currentColor" d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
          </svg>
        </button>
        <button class="today-btn" @click="goToToday">{{ t('today') }}</button>
        <h1 class="calendar-title">{{ currentTitle }}</h1>
      </div>
      <div class="header-right">
        <div class="view-selector">
          <button 
            v-for="view in views" 
            :key="view"
            :class="['view-btn', { active: currentView === view }]"
            @click="currentView = view"
          >
            {{ t(view) }}
          </button>
        </div>
      </div>
    </div>

    <!-- Month View -->
    <div v-if="currentView === 'month'" class="calendar-body month-view">
      <div class="calendar-grid">
        <!-- Day headers -->
        <div class="day-headers">
          <div v-for="day in weekDays" :key="day" class="day-header">
            {{ day }}
          </div>
        </div>
        <!-- Calendar days -->
        <div class="calendar-days">
          <div 
            v-for="day in monthDays" 
            :key="day.key"
            :class="['calendar-day', {
              'other-month': !day.isCurrentMonth,
              'today': day.isToday,
              'has-events': day.events.length > 0
            }]"
          >
            <div class="day-number">{{ day.day }}</div>
            <div class="day-events">
              <div 
                v-for="event in day.events.slice(0, 3)" 
                :key="event.id"
                :class="['event', `event-${event.color || 'blue'}`]"
                @click="onEventClick(event)"
              >
                <span class="event-time">{{ formatEventTime(event) }}</span>
                <span class="event-title">{{ event.title }}</span>
              </div>
              <div v-if="day.events.length > 3" class="more-events">
                +{{ day.events.length - 3 }} {{ t('more') }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Week View -->
    <div v-if="currentView === 'week'" class="calendar-body week-view">
      <div class="week-grid">
        <div class="time-column">
          <div class="time-header"></div>
          <div v-for="hour in 24" :key="hour" class="time-slot">
            {{ formatHour(hour - 1) }}
          </div>
        </div>
        <div class="week-days-container">
          <div class="week-day-headers">
            <div v-for="day in weekViewDays" :key="day.key" class="week-day-header">
              <div class="week-day-name">{{ day.dayName }}</div>
              <div :class="['week-day-number', { today: day.isToday }]">{{ day.day }}</div>
            </div>
          </div>
          <div class="week-day-columns">
            <div v-for="day in weekViewDays" :key="day.key" class="week-day-column">
              <div v-for="hour in 24" :key="hour" class="hour-slot"></div>
              <div 
                v-for="event in day.events" 
                :key="event.id"
                :class="['week-event', `event-${event.color || 'blue'}`]"
                :style="getEventStyle(event)"
                @click="onEventClick(event)"
              >
                <div class="event-title">{{ event.title }}</div>
                <div class="event-time">{{ formatEventTime(event) }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Day View -->
    <div v-if="currentView === 'day'" class="calendar-body day-view">
      <div class="day-grid">
        <div class="time-column">
          <div class="time-header"></div>
          <div v-for="hour in 24" :key="hour" class="time-slot">
            {{ formatHour(hour - 1) }}
          </div>
        </div>
        <div class="day-column-container">
          <div class="day-column">
            <div v-for="hour in 24" :key="hour" class="hour-slot"></div>
            <div 
              v-for="event in dayEvents" 
              :key="event.id"
              :class="['day-event', `event-${event.color || 'blue'}`]"
              :style="getEventStyle(event)"
              @click="onEventClick(event)"
            >
              <div class="event-title">{{ event.title }}</div>
              <div class="event-time">{{ formatEventTime(event) }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Temporal } from '@js-temporal/polyfill';
import { ref, computed, onMounted, watch } from 'vue';
import { useI18n } from 'vue-i18n';

export default {
  name: 'GoogleCalendar',
  props: {
    events: {
      type: Array,
      default: () => []
    },
    locale: {
      type: String,
      default: 'en-US'
    },
    initialView: {
      type: String,
      default: 'month',
      validator: (value) => ['month', 'week', 'day'].includes(value)
    },
    initialDate: {
      type: [String, Object],
      default: null
    }
  },
  emits: ['eventClick', 'dateChange', 'viewChange'],
  setup(props, { emit }) {
    const { t, locale } = useI18n();
    
    // Reactive state
    const currentView = ref(props.initialView);
    const currentDate = ref(props.initialDate ? 
      Temporal.PlainDate.from(props.initialDate) : 
      Temporal.Now.plainDateISO()
    );
    const isMobile = ref(false);
    const views = ['day', 'week', 'month'];

    // Update locale when prop changes
    watch(() => props.locale, (newLocale) => {
      locale.value = newLocale;
    });

    // Detect mobile screen size
    const checkMobile = () => {
      isMobile.value = window.innerWidth < 768;
    };

    onMounted(() => {
      checkMobile();
      window.addEventListener('resize', checkMobile);
    });

    // Computed properties
    const currentTitle = computed(() => {
      const year = currentDate.value.year;
      const month = currentDate.value.month;
      const monthName = currentDate.value.toLocaleString(props.locale, { month: 'long' });
      
      if (currentView.value === 'month') {
        return `${monthName} ${year}`;
      } else if (currentView.value === 'week') {
        const startOfWeek = getStartOfWeek(currentDate.value);
        const endOfWeek = startOfWeek.add({ days: 6 });
        if (startOfWeek.month === endOfWeek.month) {
          return `${monthName} ${year}`;
        } else {
          const endMonthName = endOfWeek.toLocaleString(props.locale, { month: 'long' });
          return `${monthName} – ${endMonthName} ${year}`;
        }
      } else {
        return currentDate.value.toLocaleString(props.locale, { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        });
      }
    });

    const weekDays = computed(() => {
      const startOfWeek = getStartOfWeek(currentDate.value);
      return Array.from({ length: 7 }, (_, i) => {
        const date = startOfWeek.add({ days: i });
        return date.toLocaleString(props.locale, { weekday: isMobile.value ? 'narrow' : 'short' });
      });
    });

    const monthDays = computed(() => {
      const year = currentDate.value.year;
      const month = currentDate.value.month;
      const firstDay = Temporal.PlainDate.from({ year, month, day: 1 });
      const lastDay = firstDay.add({ months: 1 }).subtract({ days: 1 });
      
      const startOfWeek = getStartOfWeek(firstDay);
      const endOfWeek = getEndOfWeek(lastDay);
      
      const days = [];
      let current = startOfWeek;
      
      while (Temporal.PlainDate.compare(current, endOfWeek) <= 0) {
        const isCurrentMonth = current.month === month;
        const isToday = Temporal.PlainDate.compare(current, Temporal.Now.plainDateISO()) === 0;
        const dayEvents = getEventsForDate(current);
        
        days.push({
          key: current.toString(),
          day: current.day,
          date: current,
          isCurrentMonth,
          isToday,
          events: dayEvents
        });
        
        current = current.add({ days: 1 });
      }
      
      return days;
    });

    const weekViewDays = computed(() => {
      const startOfWeek = getStartOfWeek(currentDate.value);
      return Array.from({ length: 7 }, (_, i) => {
        const date = startOfWeek.add({ days: i });
        const isToday = Temporal.PlainDate.compare(date, Temporal.Now.plainDateISO()) === 0;
        const dayName = date.toLocaleString(props.locale, { weekday: 'short' });
        const dayEvents = getEventsForDate(date);
        
        return {
          key: date.toString(),
          day: date.day,
          date,
          dayName,
          isToday,
          events: dayEvents
        };
      });
    });

    const dayEvents = computed(() => {
      return getEventsForDate(currentDate.value);
    });

    // Helper functions
    function getStartOfWeek(date) {
      const dayOfWeek = date.dayOfWeek; // 1 = Monday, 7 = Sunday
      const daysToSubtract = dayOfWeek === 7 ? 6 : dayOfWeek - 1; // Start on Sunday
      return date.subtract({ days: daysToSubtract });
    }

    function getEndOfWeek(date) {
      const startOfWeek = getStartOfWeek(date);
      return startOfWeek.add({ days: 6 });
    }

    function getEventsForDate(date) {
      return props.events.filter(event => {
        const eventStart = Temporal.PlainDate.from(event.start);
        const eventEnd = event.end ? Temporal.PlainDate.from(event.end) : eventStart;
        
        return Temporal.PlainDate.compare(date, eventStart) >= 0 &&
               Temporal.PlainDate.compare(date, eventEnd) <= 0;
      }).sort((a, b) => {
        const aTime = Temporal.PlainDateTime.from(a.start);
        const bTime = Temporal.PlainDateTime.from(b.start);
        return Temporal.PlainDateTime.compare(aTime, bTime);
      });
    }

    function formatEventTime(event) {
      const start = Temporal.PlainDateTime.from(event.start);
      if (event.allDay) {
        return t('allDay');
      }
      const timeStr = start.toLocaleString(props.locale, { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true
      });
      return timeStr;
    }

    function formatHour(hour) {
      const time = Temporal.PlainTime.from({ hour });
      return time.toLocaleString(props.locale, { 
        hour: 'numeric',
        hour12: true
      });
    }

    function getEventStyle(event) {
      const start = Temporal.PlainDateTime.from(event.start);
      const end = event.end ? Temporal.PlainDateTime.from(event.end) : start.add({ hours: 1 });
      
      const startMinutes = start.hour * 60 + start.minute;
      const endMinutes = end.hour * 60 + end.minute;
      const duration = endMinutes - startMinutes;
      
      const top = (startMinutes / 60) * 60; // 60px per hour
      const height = (duration / 60) * 60;
      
      return {
        top: `${top}px`,
        height: `${height}px`
      };
    }

    // Navigation functions
    function previousPeriod() {
      if (currentView.value === 'month') {
        currentDate.value = currentDate.value.subtract({ months: 1 });
      } else if (currentView.value === 'week') {
        currentDate.value = currentDate.value.subtract({ weeks: 1 });
      } else {
        currentDate.value = currentDate.value.subtract({ days: 1 });
      }
      emit('dateChange', currentDate.value);
    }

    function nextPeriod() {
      if (currentView.value === 'month') {
        currentDate.value = currentDate.value.add({ months: 1 });
      } else if (currentView.value === 'week') {
        currentDate.value = currentDate.value.add({ weeks: 1 });
      } else {
        currentDate.value = currentDate.value.add({ days: 1 });
      }
      emit('dateChange', currentDate.value);
    }

    function goToToday() {
      currentDate.value = Temporal.Now.plainDateISO();
      emit('dateChange', currentDate.value);
    }

    function onEventClick(event) {
      emit('eventClick', event);
    }

    watch(currentView, (newView) => {
      emit('viewChange', newView);
    });

    return {
      currentView,
      currentDate,
      currentTitle,
      weekDays,
      monthDays,
      weekViewDays,
      dayEvents,
      views,
      isMobile,
      previousPeriod,
      nextPeriod,
      goToToday,
      formatEventTime,
      formatHour,
      getEventStyle,
      onEventClick,
      t
    };
  }
};
</script>

<style scoped>
.google-calendar {
  font-family: 'Google Sans', 'Roboto', Arial, sans-serif;
  background: #ffffff;
  height: 100%;
  display: flex;
  flex-direction: column;
  color: #3c4043;
}

/* Header */
.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-bottom: 1px solid #dadce0;
  flex-wrap: wrap;
  gap: 12px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.nav-btn {
  width: 36px;
  height: 36px;
  border: none;
  background: none;
  cursor: pointer;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #5f6368;
  transition: background-color 0.2s;
}

.nav-btn:hover {
  background-color: #f1f3f4;
}

.today-btn {
  padding: 8px 16px;
  border: 1px solid #dadce0;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: #3c4043;
  transition: background-color 0.2s, box-shadow 0.2s;
}

.today-btn:hover {
  background-color: #f8f9fa;
  box-shadow: 0 1px 2px 0 rgba(60,64,67,.3), 0 1px 3px 1px rgba(60,64,67,.15);
}

.calendar-title {
  font-size: 22px;
  font-weight: 400;
  color: #3c4043;
  margin: 0;
}

.view-selector {
  display: flex;
  border: 1px solid #dadce0;
  border-radius: 4px;
  overflow: hidden;
}

.view-btn {
  padding: 8px 16px;
  border: none;
  background: white;
  cursor: pointer;
  font-size: 14px;
  color: #3c4043;
  border-right: 1px solid #dadce0;
  transition: background-color 0.2s;
}

.view-btn:last-child {
  border-right: none;
}

.view-btn:hover {
  background-color: #f8f9fa;
}

.view-btn.active {
  background-color: #e8f0fe;
  color: #1967d2;
  font-weight: 500;
}

/* Calendar Body */
.calendar-body {
  flex: 1;
  overflow: auto;
  background: #ffffff;
}

/* Month View */
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
  border-bottom: 1px solid #dadce0;
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
  background: #dadce0;
  border: 1px solid #dadce0;
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
  width: 26px;
  height: 26px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
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
  border-radius: 2px;
  cursor: pointer;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  transition: opacity 0.2s;
}

.event:hover {
  opacity: 0.8;
}

.event-time {
  font-weight: 500;
  margin-right: 4px;
}

.event-blue {
  background-color: #e8f0fe;
  color: #1967d2;
  border-left: 3px solid #1967d2;
}

.event-red {
  background-color: #fce8e6;
  color: #d93025;
  border-left: 3px solid #d93025;
}

.event-green {
  background-color: #e6f4ea;
  color: #137333;
  border-left: 3px solid #137333;
}

.event-yellow {
  background-color: #fef7e0;
  color: #f9ab00;
  border-left: 3px solid #f9ab00;
}

.more-events {
  font-size: 11px;
  color: #5f6368;
  padding: 2px 6px;
}

/* Week View */
.week-view {
  padding: 0;
}

.week-grid {
  display: flex;
  height: 100%;
  min-height: 1440px; /* 24 hours * 60px */
}

.time-column {
  width: 60px;
  border-right: 1px solid #dadce0;
  flex-shrink: 0;
}

.time-header {
  height: 60px;
  border-bottom: 1px solid #dadce0;
}

.time-slot {
  height: 60px;
  border-bottom: 1px solid #f1f3f4;
  padding: 4px 8px;
  font-size: 10px;
  color: #70757a;
  text-align: right;
}

.week-days-container {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.week-day-headers {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  height: 60px;
  border-bottom: 1px solid #dadce0;
}

.week-day-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-right: 1px solid #f1f3f4;
  gap: 4px;
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
  font-size: 26px;
  color: #3c4043;
  width: 46px;
  height: 46px;
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
}

.week-day-column {
  border-right: 1px solid #f1f3f4;
  position: relative;
}

.week-day-column:last-child {
  border-right: none;
}

.hour-slot {
  height: 60px;
  border-bottom: 1px solid #f1f3f4;
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

/* Day View */
.day-view {
  padding: 0;
}

.day-grid {
  display: flex;
  height: 100%;
  min-height: 1440px;
}

.day-column-container {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.day-column {
  flex: 1;
  position: relative;
  border-right: 1px solid #dadce0;
}

.day-event {
  position: absolute;
  left: 4px;
  right: 4px;
  border-radius: 4px;
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

.day-event .event-title {
  font-weight: 500;
  margin-bottom: 4px;
}

.day-event .event-time {
  font-size: 11px;
  opacity: 0.9;
}

/* Mobile Styles */
@media (max-width: 768px) {
  .calendar-header {
    padding: 12px 16px;
  }

  .calendar-title {
    font-size: 18px;
  }

  .view-btn {
    padding: 6px 12px;
    font-size: 13px;
  }

  .calendar-days {
    grid-auto-rows: minmax(80px, 1fr);
  }

  .week-grid,
  .day-grid {
    min-height: 1200px;
  }

  .time-column {
    width: 50px;
  }

  .week-day-number {
    font-size: 20px;
    width: 36px;
    height: 36px;
  }
}

@media (max-width: 480px) {
  .header-left,
  .header-right {
    width: 100%;
    justify-content: space-between;
  }

  .view-selector {
    width: 100%;
  }

  .view-btn {
    flex: 1;
  }
}
</style>
