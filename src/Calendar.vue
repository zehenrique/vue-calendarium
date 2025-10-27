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
            :aria-label="`${t(view)} ${t('view')}`"
            :aria-pressed="currentView === view"
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
                class="event"
                :style="getEventColorStyle(event.color)"
                @click="onEventClick(event)"
                role="button"
                :aria-label="`${event.title} at ${formatEventTime(event)}`"
                tabindex="0"
                @keydown.enter="onEventClick(event)"
                @keydown.space.prevent="onEventClick(event)"
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
                class="week-event"
                :style="{ ...getEventStyle(event), ...getEventColorStyle(event.color) }"
                @click="onEventClick(event)"
                role="button"
                :aria-label="`${event.title} at ${formatEventTime(event)}`"
                tabindex="0"
                @keydown.enter="onEventClick(event)"
                @keydown.space.prevent="onEventClick(event)"
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
              class="day-event"
              :style="{ ...getEventStyle(event), ...getEventColorStyle(event.color) }"
              @click="onEventClick(event)"
              role="button"
              :aria-label="`${event.title} at ${formatEventTime(event)}`"
              tabindex="0"
              @keydown.enter="onEventClick(event)"
              @keydown.space.prevent="onEventClick(event)"
            >
              <div class="event-title">{{ event.title }}</div>
              <div class="event-time">{{ formatEventTime(event) }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Event Creation Modal -->
    <div v-if="showModal" class="modal-overlay" @click="closeModal" role="dialog" aria-modal="true" :aria-label="t('createEvent')">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>{{ t('newEvent') }}</h2>
          <button class="close-btn" @click="closeModal" :aria-label="t('close')">
            <svg width="24" height="24" viewBox="0 0 24 24">
              <path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label for="event-title">{{ t('eventTitle') }}</label>
            <input 
              id="event-title"
              v-model="newEvent.title" 
              type="text" 
              :placeholder="t('eventTitle')"
              required
            />
          </div>
          <div class="form-row">
            <div class="form-group">
              <label for="start-date">{{ t('startDate') }}</label>
              <input 
                id="start-date"
                v-model="newEvent.startDate" 
                type="date"
                required
              />
            </div>
            <div class="form-group">
              <label for="start-time">{{ t('startTime') }}</label>
              <input 
                id="start-time"
                v-model="newEvent.startTime" 
                type="time"
                required
              />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label for="end-date">{{ t('endDate') }}</label>
              <input 
                id="end-date"
                v-model="newEvent.endDate" 
                type="date"
                required
              />
            </div>
            <div class="form-group">
              <label for="end-time">{{ t('endTime') }}</label>
              <input 
                id="end-time"
                v-model="newEvent.endTime" 
                type="time"
                required
              />
            </div>
          </div>
          <div class="form-group">
            <label for="event-repeat">{{ t('repeat') }}</label>
            <select id="event-repeat" v-model="newEvent.repeat">
              <option value="none">{{ t('repeatNone') }}</option>
              <option value="daily">{{ t('repeatDaily') }}</option>
              <option value="weekly">{{ t('repeatWeekly') }}</option>
              <option value="monthly">{{ t('repeatMonthly') }}</option>
              <option value="yearly">{{ t('repeatYearly') }}</option>
            </select>
          </div>
          <div class="form-group">
            <label for="event-calendar">{{ t('calendar') }}</label>
            <select id="event-calendar" v-model="newEvent.calendar">
              <option v-for="cal in calendars" :key="cal.id" :value="cal.id">
                {{ cal.name }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label for="event-color">{{ t('color') }}</label>
            <input 
              id="event-color"
              v-model="newEvent.color" 
              type="color"
              :title="t('color')"
            />
          </div>
        </div>
        <div class="modal-footer">
          <button class="cancel-btn" @click="closeModal">{{ t('cancel') }}</button>
          <button class="save-btn" @click="saveEvent">{{ t('save') }}</button>
        </div>
      </div>
    </div>

    <!-- Event Detail Modal -->
    <div v-if="showEventDetail" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" @click="closeEventDetail" role="dialog" aria-modal="true" :aria-label="t('eventDetails')">
      <div class="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4" @click.stop>
        <div class="flex items-center justify-between p-4 border-b">
          <h2 class="text-xl font-semibold text-gray-900">{{ selectedEvent?.title }}</h2>
          <button @click="closeEventDetail" class="text-gray-400 hover:text-gray-600 rounded-full p-1 hover:bg-gray-100" :aria-label="t('close')">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
        <div class="p-6 space-y-4">
          <div class="flex items-start space-x-3">
            <svg class="w-6 h-6 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <div>
              <p class="text-sm text-gray-600">{{ formatEventTimeRange(selectedEvent) }}</p>
              <p v-if="selectedEvent?.repeat && selectedEvent.repeat !== 'none'" class="text-sm text-gray-500 mt-1">
                Repeats {{ t('repeat' + selectedEvent.repeat.charAt(0).toUpperCase() + selectedEvent.repeat.slice(1)).toLowerCase() }}
              </p>
            </div>
          </div>
          <div v-if="selectedEvent?.calendar" class="flex items-start space-x-3">
            <svg class="w-6 h-6 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
            <div>
              <p class="text-sm text-gray-600">{{ getCalendarName(selectedEvent.calendar) }}</p>
            </div>
          </div>
          <div class="flex items-start space-x-3">
            <div class="w-6 h-6 rounded mt-0.5" :style="{ backgroundColor: selectedEvent?.color || '#1967d2' }"></div>
            <div>
              <p class="text-sm text-gray-600">{{ selectedEvent?.color || '#1967d2' }}</p>
            </div>
          </div>
        </div>
        <div class="flex items-center justify-end space-x-3 p-4 border-t bg-gray-50">
          <button @click="deleteSelectedEvent" class="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors">
            {{ t('delete') }}
          </button>
          <button @click="editSelectedEvent" class="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors">
            {{ t('edit') }}
          </button>
          <button @click="closeEventDetail" class="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors">
            {{ t('close') }}
          </button>
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
    },
    calendars: {
      type: Array,
      default: () => [{ id: 'default', name: 'My Calendar', color: '#1967d2' }]
    }
  },
  emits: ['eventClick', 'dateChange', 'viewChange', 'eventCreate', 'eventDelete'],
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
    const PIXELS_PER_HOUR = 60; // Height in pixels for one hour slot
    const showModal = ref(false);
    const showEventDetail = ref(false);
    const selectedEvent = ref(null);
    const newEvent = ref({
      title: '',
      startDate: '',
      startTime: '09:00',
      endDate: '',
      endTime: '10:00',
      repeat: 'none',
      calendar: 'default',
      color: '#1967d2'
    });

    // Update locale when prop changes
    watch(() => props.locale, (newLocale) => {
      // Map BCP 47 language tags to i18n locale codes
      const localeMap = {
        'en-US': 'en',
        'pt-PT': 'pt'
      };
      locale.value = localeMap[newLocale] || 'en';
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
      // Start week on Monday
      return date.subtract({ days: dayOfWeek - 1 });
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
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false
      });
      return timeStr;
    }

    function formatHour(hour) {
      const time = Temporal.PlainTime.from({ hour });
      return time.toLocaleString(props.locale, { 
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
    }

    function getEventStyle(event) {
      const start = Temporal.PlainDateTime.from(event.start);
      const end = event.end ? Temporal.PlainDateTime.from(event.end) : start.add({ hours: 1 });
      
      const startMinutes = start.hour * 60 + start.minute;
      const endMinutes = end.hour * 60 + end.minute;
      const duration = endMinutes - startMinutes;
      
      const top = (startMinutes / 60) * PIXELS_PER_HOUR;
      const height = (duration / 60) * PIXELS_PER_HOUR;
      
      return {
        top: `${top}px`,
        height: `${height}px`
      };
    }

    function getEventColorStyle(hexColor) {
      if (!hexColor) hexColor = '#1967d2';
      
      // Convert hex to RGB for lighter background
      const r = parseInt(hexColor.slice(1, 3), 16);
      const g = parseInt(hexColor.slice(3, 5), 16);
      const b = parseInt(hexColor.slice(5, 7), 16);
      
      return {
        backgroundColor: `rgba(${r}, ${g}, ${b}, 0.15)`,
        color: hexColor,
        borderLeft: `3px solid ${hexColor}`
      };
    }

    // Modal functions
    function showCreateEventModal() {
      const today = Temporal.Now.plainDateISO();
      newEvent.value = {
        title: '',
        startDate: today.toString(),
        startTime: '09:00',
        endDate: today.toString(),
        endTime: '10:00',
        repeat: 'none',
        calendar: props.calendars[0]?.id || 'default',
        color: props.calendars[0]?.color || '#1967d2'
      };
      showModal.value = true;
    }

    function closeModal() {
      showModal.value = false;
    }

    function saveEvent() {
      if (!newEvent.value.title) {
        alert('Please enter an event title');
        return;
      }

      const startDateTime = `${newEvent.value.startDate}T${newEvent.value.startTime}:00`;
      const endDateTime = `${newEvent.value.endDate}T${newEvent.value.endTime}:00`;

      const eventData = {
        id: Date.now().toString(),
        title: newEvent.value.title,
        start: startDateTime,
        end: endDateTime,
        color: newEvent.value.color,
        calendar: newEvent.value.calendar,
        repeat: newEvent.value.repeat
      };

      // If recurring, generate recurring events
      if (newEvent.value.repeat !== 'none') {
        const recurringEvents = generateRecurringEvents(eventData, newEvent.value.repeat);
        emit('eventCreate', recurringEvents);
      } else {
        emit('eventCreate', [eventData]);
      }

      closeModal();
    }

    function generateRecurringEvents(baseEvent, repeatType) {
      const events = [baseEvent];
      const start = Temporal.PlainDate.from(baseEvent.start.split('T')[0]);
      const maxOccurrences = 52; // Generate up to 1 year of recurring events

      for (let i = 1; i < maxOccurrences; i++) {
        let nextDate;
        
        switch (repeatType) {
          case 'daily':
            nextDate = start.add({ days: i });
            break;
          case 'weekly':
            nextDate = start.add({ weeks: i });
            break;
          case 'monthly':
            nextDate = start.add({ months: i });
            break;
          case 'yearly':
            nextDate = start.add({ years: i });
            break;
          default:
            return events;
        }

        const timeStart = baseEvent.start.split('T')[1];
        const timeEnd = baseEvent.end.split('T')[1];

        events.push({
          ...baseEvent,
          id: `${baseEvent.id}-${i}`,
          start: `${nextDate.toString()}T${timeStart}`,
          end: `${nextDate.toString()}T${timeEnd}`
        });
      }

      return events;
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
      selectedEvent.value = event;
      showEventDetail.value = true;
      emit('eventClick', event);
    }

    function closeEventDetail() {
      showEventDetail.value = false;
      selectedEvent.value = null;
    }

    function deleteSelectedEvent() {
      if (selectedEvent.value) {
        emit('eventDelete', selectedEvent.value);
        closeEventDetail();
      }
    }

    function editSelectedEvent() {
      if (selectedEvent.value) {
        // Pre-fill the create modal with selected event data
        const start = Temporal.PlainDateTime.from(selectedEvent.value.start);
        const end = selectedEvent.value.end ? Temporal.PlainDateTime.from(selectedEvent.value.end) : start.add({ hours: 1 });
        
        newEvent.value = {
          title: selectedEvent.value.title,
          startDate: start.toPlainDate().toString(),
          startTime: `${String(start.hour).padStart(2, '0')}:${String(start.minute).padStart(2, '0')}`,
          endDate: end.toPlainDate().toString(),
          endTime: `${String(end.hour).padStart(2, '0')}:${String(end.minute).padStart(2, '0')}`,
          repeat: selectedEvent.value.repeat || 'none',
          calendar: selectedEvent.value.calendar || 'default',
          color: selectedEvent.value.color || '#1967d2'
        };
        
        closeEventDetail();
        showModal.value = true;
      }
    }

    function formatEventTimeRange(event) {
      if (!event) return '';
      if (event.allDay) return t('allDay');
      
      const start = Temporal.PlainDateTime.from(event.start);
      const end = event.end ? Temporal.PlainDateTime.from(event.end) : start.add({ hours: 1 });
      
      const startStr = start.toLocaleString(props.locale, {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
      
      const endStr = end.toLocaleString(props.locale, {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
      
      const dateStr = start.toLocaleString(props.locale, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      
      return `${dateStr}, ${startStr} – ${endStr}`;
    }

    function getCalendarName(calendarId) {
      const calendar = props.calendars.find(c => c.id === calendarId);
      return calendar ? calendar.name : calendarId;
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
      getEventColorStyle,
      onEventClick,
      showModal,
      showEventDetail,
      selectedEvent,
      newEvent,
      showCreateEventModal,
      closeModal,
      closeEventDetail,
      deleteSelectedEvent,
      editSelectedEvent,
      formatEventTimeRange,
      getCalendarName,
      saveEvent,
      calendars: props.calendars,
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
  border-bottom: 1px solid #d0d0d0;
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
  background-color: #e0e0e0;
}

.today-btn {
  padding: 8px 16px;
  border: 1px solid #d0d0d0;
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
  border: 1px solid #d0d0d0;
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
  border-right: 1px solid #d0d0d0;
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
  min-height: calc(24 * 60px); /* 24 hours * 60px per hour */
}

.time-column {
  width: 60px;
  border-right: 1px solid #d0d0d0;
  flex-shrink: 0;
}

.time-header {
  height: 60px;
  border-bottom: 1px solid #d0d0d0;
}

.time-slot {
  height: 60px;
  border-bottom: 1px solid #e0e0e0;
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
  border-bottom: 1px solid #d0d0d0;
}

.week-day-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-right: 1px solid #e0e0e0;
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
  min-height: calc(24 * 60px); /* 24 hours * 60px per hour */
}

.day-column-container {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.day-column {
  flex: 1;
  position: relative;
  border-right: 1px solid #d0d0d0;
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
    min-height: calc(24 * 50px); /* Smaller height on mobile */
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

/* Create Event Button */
.create-btn {
  padding: 8px 16px;
  background: #1a73e8;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  transition: background-color 0.2s, box-shadow 0.2s;
}

.create-btn:hover {
  background: #1557b0;
  box-shadow: 0 1px 2px 0 rgba(60,64,67,.3), 0 1px 3px 1px rgba(60,64,67,.15);
}

.create-btn:focus {
  outline: 2px solid #1a73e8;
  outline-offset: 2px;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow: auto;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #d0d0d0;
}

.modal-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 500;
  color: #3c4043;
}

.close-btn {
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

.close-btn:hover {
  background-color: #e0e0e0;
}

.close-btn:focus {
  outline: 2px solid #1a73e8;
  outline-offset: 2px;
}

.modal-body {
  padding: 24px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #3c4043;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d0d0d0;
  border-radius: 4px;
  font-size: 14px;
  font-family: inherit;
  transition: border-color 0.2s;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #1a73e8;
  box-shadow: 0 0 0 2px rgba(26, 115, 232, 0.2);
}

.form-group input[type="color"] {
  height: 44px;
  cursor: pointer;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid #d0d0d0;
}

.cancel-btn,
.save-btn {
  padding: 8px 24px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s, box-shadow 0.2s;
}

.cancel-btn {
  background: white;
  border: 1px solid #d0d0d0;
  color: #3c4043;
}

.cancel-btn:hover {
  background: #f8f9fa;
}

.cancel-btn:focus {
  outline: 2px solid #1a73e8;
  outline-offset: 2px;
}

.save-btn {
  background: #1a73e8;
  border: none;
  color: white;
}

.save-btn:hover {
  background: #1557b0;
  box-shadow: 0 1px 2px 0 rgba(60,64,67,.3), 0 1px 3px 1px rgba(60,64,67,.15);
}

.save-btn:focus {
  outline: 2px solid #1a73e8;
  outline-offset: 2px;
}

/* Accessibility improvements */
button:focus-visible,
a:focus-visible {
  outline: 2px solid #1a73e8;
  outline-offset: 2px;
}

.event:focus {
  outline: 2px solid #1a73e8;
  outline-offset: 1px;
}

/* Remove predefined color classes */
.event-blue,
.event-red,
.event-green,
.event-yellow {
  /* These classes are no longer used - colors are now dynamic */
}
</style>
