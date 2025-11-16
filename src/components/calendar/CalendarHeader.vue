<template>
  <v-sheet
    class="calendar-header"
    elevation="0"
    :class="{ 'header-sticky': true, 'month-view': currentView === 'month' }"
  >
    <div class="header-content">
      <div class="header-left">
        <v-btn
          v-if="isMobile && showMobileMenu"
          icon
          variant="text"
          :aria-label="t('menu')"
          data-testid="mobile-menu-button"
          @click="$emit('toggle-sidebar')"
        >
          <v-icon>mdi-menu</v-icon>
        </v-btn>
        
        <!-- Day view (mobile only): Show day number and abbreviated day name -->
        <div v-if="isMobile && currentView === 'day' && dayInfo" class="day-view-date">
          <span class="day-view-weekday">{{ dayInfo.weekday }}</span>
          <span class="day-view-number" :class="{ today: dayInfo.isToday }">
            {{ dayInfo.dayNumber }}
          </span>
        </div>
        
        <!-- Desktop: Text button for Today (placed before prev/next) -->
        <v-btn
          v-if="!isMobile"
          variant="outlined"
          :aria-label="t('today')"
          data-testid="today-button"
          @click="$emit('today')"
        >
          {{ t('today') }}
        </v-btn>
        
        <!-- Desktop: Navigation controls with smaller gap -->
        <div v-if="!isMobile" class="nav-controls">
          <v-btn
            icon
            variant="text"
            :aria-label="t('previous')"
            @click="$emit('previous')"
          >
            <v-icon>mdi-chevron-left</v-icon>
          </v-btn>
          <v-btn
            icon
            variant="text"
            :aria-label="t('next')"
            @click="$emit('next')"
          >
            <v-icon>mdi-chevron-right</v-icon>
          </v-btn>
        </div>
        
        <h1 class="calendar-title text-h6">{{ currentTitle }}</h1>
      </div>
      <div class="header-right">
        <!-- Mobile: Icon button for Today -->
        <v-btn
          v-if="isMobile"
          icon
          size="small"
          variant="text"
          :aria-label="t('today')"
          data-testid="today-button"
          @click="$emit('today')"
        >
          <v-icon size="20">mdi-calendar-today</v-icon>
        </v-btn>
        
        <!-- Desktop: compact dropdown for view selection -->
        <v-select
          v-if="!isMobile"
          :items="viewItems"
          item-title="title"
          item-value="value"
          :model-value="currentView"
          variant="outlined"
          density="compact"
          hide-details
          data-testid="view-toggle"
          style="min-width: 120px"
          @update:model-value="$emit('view-change', $event)"
        ></v-select>
      </div>
    </div>

    <!-- Week view day headers -->
    <div v-if="currentView === 'week' && weekDays" class="week-day-headers-container">
      <div class="time-column-spacer"></div>
      <div class="week-day-headers">
        <div v-for="day in weekDays" :key="`header-${day.key}`" class="week-day-header">
          <span class="week-day-name">{{ day.dayName }}</span>
          <span 
            class="week-day-number" 
            :class="{ today: day.isToday }"
            @click="$emit('day-number-click', day.date)"
          >
            {{ day.day }}
          </span>
        </div>
      </div>
    </div>

    <!-- Week view all-day events section (only show if there are all-day events) -->
    <div v-if="currentView === 'week' && weekDays && hasAllDayEvents" class="week-all-day-container">
      <div class="time-column-spacer"></div>
      <div class="week-all-day-events">
        <div v-for="day in weekDays" :key="`allday-${day.key}`" class="all-day-events-column" @click="$emit('all-day-select', day.date)">
          <div
            v-for="event in day.allDayEvents"
            :key="event.id"
            class="all-day-event"
            :style="getEventColorStyle(event.color, isEventPast(event))"
            @click.stop="$emit('event-select', event)"
            :title="event.title"
          >
            {{ isMobile ? abbreviateTitle(event.title) : event.title }}
          </div>
        </div>
      </div>
    </div>
  </v-sheet>
</template>

<script setup>
import { computed } from 'vue';
import { getEventColorStyle, isEventPast } from '../../composables/useCalendarUtils.js';

function abbreviateTitle(title) {
  if (!title) return '';
  // Dynamic abbreviation based on available space in mobile
  const maxLength = 8;
  if (title.length <= maxLength) return title;
  return title.substring(0, maxLength) + '...';
}

const props = defineProps({
  currentTitle: {
    type: String,
    default: ''
  },
  currentView: {
    type: String,
    default: 'month'
  },
  views: {
    type: Array,
    default: () => ['day', 'week', 'month']
  },
  isMobile: {
    type: Boolean,
    default: false
  },
  showMobileMenu: {
    type: Boolean,
    default: true
  },
  t: {
    type: Function,
    required: true
  },
  weekDays: {
    type: Array,
    default: null
  },
  currentDate: {
    type: Object,
    default: null
  }
});

defineEmits(['toggle-sidebar', 'previous', 'next', 'today', 'view-change', 'all-day-select', 'event-select', 'day-number-click']);

const viewItems = computed(() => {
  return props.views.map(v => ({
    title: props.t(v),
    value: v
  }));
});

const hasAllDayEvents = computed(() => {
  if (!props.weekDays) return false;
  return props.weekDays.some(day => day.allDayEvents && day.allDayEvents.length > 0);
});

const dayInfo = computed(() => {
  if (props.currentView !== 'day' || !props.currentDate) return null;
  
  const today = props.currentDate.toString().slice(0, 10);
  const now = new Date().toISOString().slice(0, 10);
  const isToday = today === now;
  
  // Get abbreviated weekday (e.g., "Mon", "Tue")
  const weekday = props.currentDate.toLocaleString('en-US', { weekday: 'short' }).toUpperCase();
  const dayNumber = props.currentDate.day;
  
  return {
    weekday,
    dayNumber,
    isToday
  };
});
</script>

<style scoped>
.calendar-header {
  border-bottom: 1px solid var(--calendar-border-color, #e0e0e0);
}

.calendar-header.month-view {
  border-bottom: none;
}

.header-sticky {
  position: sticky;
  top: 0;
  z-index: var(--calendar-header-z-index, 10);
  background: var(--calendar-header-bg, #f8f9fa);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--calendar-header-padding, 16px 20px);
  gap: var(--calendar-header-gap, 12px);
  flex-wrap: wrap;
}

.header-left {
  display: flex;
  align-items: center;
  gap: var(--calendar-spacing-md, 8px);
  flex-wrap: wrap;
  flex: 1;
  min-width: 0;
}

.nav-controls {
  display: flex;
  align-items: center;
  gap: 0;
  margin: 0 10px;
}

.nav-controls .v-btn {
  margin: 0 -4px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: var(--calendar-header-gap, 12px);
}

.calendar-title {
  margin: 0;
  font-weight: var(--calendar-font-weight-normal, 400);
  color: var(--calendar-text-primary, #3c4043);
  flex-shrink: 1;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.day-view-date {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-right: var(--calendar-spacing-xl, 16px);
  padding: var(--calendar-spacing-sm, 4px);
  min-width: 50px;
}

.day-view-weekday {
  font-size: var(--calendar-day-view-weekday-font-size, 11px);
  color: var(--calendar-text-secondary, #70757a);
  text-transform: uppercase;
  font-weight: var(--calendar-font-weight-medium, 500);
  letter-spacing: 0.5px;
}

.day-view-number {
  font-size: var(--calendar-day-view-number-font-size, 26px);
  color: var(--calendar-text-primary, #3c4043);
  font-weight: var(--calendar-font-weight-normal, 400);
  line-height: 1;
  margin-top: var(--calendar-day-view-number-margin-top, 2px);
}

.day-view-number.today {
  color: var(--calendar-primary-color, #1a73e8);
  font-weight: var(--calendar-font-weight-medium, 500);
}

.week-day-headers-container {
  display: flex;
  padding-bottom: var(--calendar-spacing-xs, 2px);
  padding-top: var(--calendar-spacing-xs, 2px);
}

.time-column-spacer {
  width: var(--calendar-time-column-width, 60px);
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.week-day-headers {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  flex: 1;
}

.week-all-day-container {
  display: flex;
  min-height: var(--calendar-all-day-min-height, 20px);
  border-bottom: 1px solid var(--calendar-border-color-dark, #d0d0d0);
}

.week-all-day-events {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  flex: 1;
}

.all-day-events-column {
  border-right: 1px solid var(--calendar-border-color, #e0e0e0);
  padding: var(--calendar-all-day-padding, 4px);
  cursor: pointer;
  transition: background-color var(--calendar-transition-fast, 0.2s);
  min-height: 40px;
}

.all-day-events-column:last-child {
  border-right: none;
}

.all-day-events-column:hover {
  background-color: var(--calendar-day-hover-bg, #f8f9fa);
}

.all-day-event {
  font-size: var(--calendar-all-day-event-font-size, 12px);
  padding: var(--calendar-all-day-event-padding, 2px 8px);
  margin: var(--calendar-spacing-xs, 2px) 0;
  border-radius: var(--calendar-all-day-event-border-radius, 8px);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: pointer;
  transition: opacity var(--calendar-transition-fast, 0.2s);
}

.all-day-event:hover {
  opacity: var(--calendar-event-hover-opacity, 0.8);
}

.week-day-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--calendar-spacing-sm, 4px);
}

.week-day-name {
  font-size: var(--calendar-week-day-font-size, 11px);
  color: var(--calendar-text-secondary, #70757a);
  text-transform: uppercase;
  font-weight: var(--calendar-font-weight-medium, 500);
}

.week-day-number {
  font-size: 20px;
  color: var(--calendar-text-primary, #3c4043);
  width: var(--calendar-week-day-number-size, 36px);
  height: var(--calendar-week-day-number-size, 36px);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--calendar-border-radius-circle, 50%);
  cursor: pointer;
  transition: background-color var(--calendar-transition-fast, 0.2s);
}

.week-day-number:hover {
  background-color: var(--calendar-day-hover-bg, #f1f3f4);
}

.week-day-number.today {
  background-color: var(--calendar-today-bg, #1a73e8);
  color: var(--calendar-today-color, white);
}

.week-day-number.today:hover {
  background-color: var(--calendar-primary-hover, #1557b0);
}

@media (max-width: 768px) {
  .header-content {
    padding: var(--calendar-mobile-header-padding, 2px 2px);
    flex-wrap: nowrap;
    gap: var(--calendar-mobile-header-gap, 8px);
  }
  
  .header-left {
    gap: var(--calendar-spacing-sm, 4px);
    flex-wrap: nowrap;
    overflow: hidden;
  }
  
  .calendar-title {
    font-size: 1rem;
  }

  .time-column-spacer {
    width: var(--calendar-time-column-width-mobile, 50px);
  }

  .week-day-name {
    font-size: var(--calendar-week-day-font-size-mobile, 10px);
  }

  .week-day-number {
    font-size: 18px;
    width: var(--calendar-week-day-number-size-mobile, 32px);
    height: var(--calendar-week-day-number-size-mobile, 32px);
  }

  .all-day-events-column {
    border-right: 1px solid var(--calendar-border-color, #e0e0e0);
    padding: 1px;
    min-height: auto;
    max-height: auto;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    justify-content: flex-start;
  }

  .all-day-event {
    font-size: var(--calendar-all-day-event-font-size-mobile, 8.5px);
    padding: var(--calendar-all-day-event-padding-mobile, 2px 1px);
    margin: 1px 0;
    border-radius: var(--calendar-all-day-event-border-radius-mobile, 5px);
    line-height: 1.3;
    text-align: center;
    width: 100%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}
</style>
