<template>
  <v-sheet
    class="calendar-header"
    elevation="0"
    :class="{ 'header-sticky': true }"
  >
    <div class="header-content">
      <div class="header-left">
        <v-btn
          v-if="isMobile"
          icon
          variant="text"
          :aria-label="t('menu')"
          @click="$emit('toggle-sidebar')"
        >
          <v-icon>mdi-menu</v-icon>
        </v-btn>
        <v-btn
          v-if="!isMobile"
          icon
          variant="text"
          :aria-label="t('previous')"
          @click="$emit('previous')"
        >
          <v-icon>mdi-chevron-left</v-icon>
        </v-btn>
        <v-btn
          v-if="!isMobile"
          icon
          variant="text"
          :aria-label="t('next')"
          @click="$emit('next')"
        >
          <v-icon>mdi-chevron-right</v-icon>
        </v-btn>
        <v-btn
          variant="outlined"
          @click="$emit('today')"
        >
          {{ t('today') }}
        </v-btn>
        <h1 class="calendar-title text-h6">{{ currentTitle }}</h1>
      </div>
      <div v-if="!isMobile" class="header-right">
        <v-btn-toggle
          :model-value="currentView"
          mandatory
          variant="outlined"
          divided
          @update:model-value="$emit('view-change', $event)"
        >
          <v-btn
            v-for="view in views"
            :key="view"
            :value="view"
            :aria-label="`${t(view)} ${t('view')}`"
          >
            {{ t(view) }}
          </v-btn>
        </v-btn-toggle>
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
            :style="getEventColorStyle(event)"
            @click.stop="$emit('event-select', event)"
          >
            {{ event.title }}
          </div>
        </div>
      </div>
    </div>
  </v-sheet>
</template>

<script setup>
import { computed } from 'vue';

function getEventColorStyle(event) {
  const color = event.color || '#1967d2';
  return {
    backgroundColor: color,
    color: '#ffffff'
  };
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
  t: {
    type: Function,
    required: true
  },
  weekDays: {
    type: Array,
    default: null
  }
});

defineEmits(['toggle-sidebar', 'previous', 'next', 'today', 'view-change', 'all-day-select', 'event-select', 'day-number-click']);

const hasAllDayEvents = computed(() => {
  if (!props.weekDays) return false;
  return props.weekDays.some(day => day.allDayEvents && day.allDayEvents.length > 0);
});
</script>

<style scoped>
.calendar-header {
  border-bottom: 1px solid #e0e0e0;
}

.header-sticky {
  position: sticky;
  top: 0;
  z-index: 10;
  background: white;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  gap: 12px;
  flex-wrap: wrap;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.calendar-title {
  margin: 0;
  font-weight: 400;
  color: #3c4043;
}

.week-day-headers-container {
  display: flex;
  padding-bottom: 8px;
  padding-top: 8px;
}

.time-column-spacer {
  width: 60px;
  flex-shrink: 0;
  /* border-right: 1px solid #d0d0d0; */
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
  min-height: 40px;
  border-bottom: 1px solid #d0d0d0;
}

.week-all-day-events {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  flex: 1;
}

.all-day-events-column {
  border-right: 1px solid #e0e0e0;
  padding: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
  min-height: 40px;
}

.all-day-events-column:last-child {
  border-right: none;
}

.all-day-events-column:hover {
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

.week-day-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
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
  cursor: pointer;
  transition: background-color 0.2s;
}

.week-day-number:hover {
  background-color: #f1f3f4;
}

.week-day-number.today {
  background-color: #1a73e8;
  color: white;
}

.week-day-number.today:hover {
  background-color: #1557b0;
}

@media (max-width: 768px) {
  .header-content {
    padding: 12px 16px;
  }
  
  .calendar-title {
    font-size: 1.1rem;
  }

  .time-column-spacer {
    width: 50px;
  }

  .week-day-name {
    font-size: 10px;
  }

  .week-day-number {
    font-size: 18px;
    width: 32px;
    height: 32px;
  }

  .all-day-event {
    font-size: 11px;
  }
}
</style>
