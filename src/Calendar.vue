<template>
  <div class="google-calendar" :class="{ 'is-mobile': isMobile }">
    <!-- Header -->
    <div class="calendar-header">
      <div class="header-left">
        <!-- Mobile menu button -->
        <button v-if="isMobile" class="mobile-menu-btn" @click="toggleMobileSidebar" :aria-label="t('menu')">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
          </svg>
        </button>
        <button v-if="!isMobile" class="nav-btn" @click="previousPeriod" :aria-label="t('previous')">
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path fill="currentColor" d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
          </svg>
        </button>
        <button v-if="!isMobile" class="nav-btn" @click="nextPeriod" :aria-label="t('next')">
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path fill="currentColor" d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
          </svg>
        </button>
        <button class="today-btn" @click="goToToday">{{ t('today') }}</button>
        <h1 class="calendar-title">{{ currentTitle }}</h1>
      </div>
      <div class="header-right" v-if="!isMobile">
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
            @click.self="onMonthCellClick(day.date)"
            :title="`Create event on ${day.date.toString()}`"
          >
            <div class="day-number" @click="onMonthCellClick(day.date)">{{ day.day }}</div>
            <div class="day-events" @click.self="onMonthCellClick(day.date)">
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
        <div class="time-column no-border">
          <div class="time-header sticky-header"></div>
          <!-- All-day label -->
          <div class="all-day-label">
            {{ t('allDay') }}
          </div>
          <div v-for="hour in 24" :key="hour" class="time-slot-label">
            {{ formatHour(hour - 1) }}
          </div>
        </div>
        <div class="week-days-container">
          <div class="week-day-headers sticky-header no-border">
            <div v-for="day in weekViewDays" :key="day.key" class="week-day-header">
              <div class="week-day-name">{{ day.dayName }}</div>
              <div :class="['week-day-number', { today: day.isToday }]">{{ day.day }}</div>
              <!-- All-day events section in header -->
              <div 
                class="all-day-events-container"
                @click="onAllDaySlotClick(day.date)"
                :title="`Create all-day event`"
              >
                <div 
                  v-for="event in day.allDayEvents" 
                  :key="event.id"
                  class="all-day-event"
                  :style="getEventColorStyle(event.color)"
                  @click.stop="onEventClick(event)"
                  role="button"
                  :aria-label="`All-day event: ${event.title}`"
                  tabindex="0"
                  @keydown.enter="onEventClick(event)"
                  @keydown.space.prevent="onEventClick(event)"
                >
                  {{ event.title }}
                </div>
              </div>
            </div>
          </div>
          <div class="week-day-columns">
            <div v-for="day in weekViewDays" :key="day.key" class="week-day-column">
              <div 
                v-for="hour in 24" 
                :key="hour" 
                class="hour-slot"
                @click="onTimeSlotClick(day.date, hour - 1)"
                :title="`Create event at ${formatHour(hour - 1)}`"
              ></div>
              <!-- Current time indicator -->
              <div 
                v-if="showCurrentTimeIndicator && day.isToday" 
                class="current-time-indicator"
                :style="{ top: getCurrentTimePosition() + 'px' }"
              >
                <div class="time-indicator-circle"></div>
                <div class="time-indicator-line"></div>
              </div>
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
        <div class="time-column no-border">
          <div class="time-header">
            <!-- All-day label -->
            <div class="all-day-label">
              {{ t('allDay') }}
            </div>
          </div>
          <div v-for="hour in 24" :key="hour" class="time-slot-label">
            {{ formatHour(hour - 1) }}
          </div>
        </div>
        <div class="day-column-container">
          <!-- All-day events section -->
          <div 
            class="day-all-day-section"
            @click="onAllDaySlotClick(currentDate)"
            :title="`Create all-day event`"
          >
            <div 
              v-for="event in dayAllDayEvents" 
              :key="event.id"
              class="all-day-event"
              :style="getEventColorStyle(event.color)"
              @click.stop="onEventClick(event)"
              role="button"
              :aria-label="`All-day event: ${event.title}`"
              tabindex="0"
              @keydown.enter="onEventClick(event)"
              @keydown.space.prevent="onEventClick(event)"
            >
              {{ event.title }}
            </div>
          </div>
          <div class="day-column">
            <div 
              v-for="hour in 24" 
              :key="hour" 
              class="hour-slot"
              @click="onTimeSlotClick(currentDate, hour - 1)"
              :title="`Create event at ${formatHour(hour - 1)}`"
            ></div>
            <!-- Current time indicator -->
            <div 
              v-if="showCurrentTimeIndicator" 
              class="current-time-indicator"
              :style="{ top: getCurrentTimePosition() + 'px' }"
            >
              <div class="time-indicator-circle"></div>
              <div class="time-indicator-line"></div>
            </div>
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
    <EventModal
      v-model="showModal"
      :event="newEvent"
      :calendars="calendars"
      @save="saveEvent"
    />

    <!-- Event Detail Modal -->
    <EventDetailModal
      v-model="showEventDetail"
      :event="selectedEvent"
      :calendars="calendars"
      :locale="locale"
      @edit="editSelectedEvent"
      @delete="deleteSelectedEvent"
    />
    
    <!-- Delete Confirmation Dialog -->
    <DeleteConfirmModal
      v-model="showDeleteConfirm"
      @confirm="confirmDelete"
    />
    
    <!-- Mobile Sidebar -->
    <MobileSidebar
      v-model="showMobileSidebar"
      :current-view="currentView"
      :views="views"
      :calendars="calendars"
      @view-change="handleViewChange"
    />
  </div>
</template>

<script>
import { Temporal } from '@js-temporal/polyfill';
import { ref, computed, onMounted, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import EventModal from './components/EventModal.vue';
import EventDetailModal from './components/EventDetailModal.vue';
import DeleteConfirmModal from './components/DeleteConfirmModal.vue';
import MobileSidebar from './components/MobileSidebar.vue';
import {
  getEventColorStyle,
  formatEventTime,
  formatHour,
  getStartOfWeek,
  getEndOfWeek,
  getEventStyle,
  getEventsForDate,
  getCurrentTimePosition
} from './composables/useCalendarUtils.js';

export default {
  name: 'GoogleCalendar',
  components: {
    EventModal,
    EventDetailModal,
    DeleteConfirmModal,
    MobileSidebar
  },
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
    const showDeleteConfirm = ref(false);
    const showMobileSidebar = ref(false);
    const currentTime = ref(Temporal.Now.plainDateTimeISO());

    // Update locale when prop changes
    watch(() => props.locale, (newLocale) => {
      // Map BCP 47 language tags to i18n locale codes
      const localeMap = {
        'en-US': 'en',
        'pt-PT': 'pt'
      };
      locale.value = localeMap[newLocale] || 'en';
    }, { immediate: true }); // Run immediately to set initial locale

    // Detect mobile screen size
    const checkMobile = () => {
      isMobile.value = window.innerWidth < 768;
    };

    onMounted(() => {
      checkMobile();
      window.addEventListener('resize', checkMobile);
      
      // Update current time every minute
      const updateTime = () => {
        currentTime.value = Temporal.Now.plainDateTimeISO();
      };
      const timeInterval = setInterval(updateTime, 60000); // Update every minute
      
      // Setup swipe gestures for mobile with proper timing and retry logic
      let swipeInitialized = false;
      const initializeSwipeGestures = () => {
        if (swipeInitialized) return true;
        
        if (typeof window !== 'undefined' && window.Hammer && isMobile.value) {
          const calendarEl = document.querySelector('.google-calendar');
          if (calendarEl) {
            try {
              const hammer = new window.Hammer(calendarEl);
              
              // Configure hammer for better swipe detection
              hammer.get('swipe').set({ 
                direction: window.Hammer.DIRECTION_HORIZONTAL,
                threshold: 30, // Lower threshold for easier swipes
                velocity: 0.3  // Lower velocity requirement
              });
              
              hammer.on('swipeleft', () => {
                console.log('Swipe left detected');
                nextPeriod();
              });
              
              hammer.on('swiperight', () => {
                console.log('Swipe right detected');
                previousPeriod();
              });
              
              swipeInitialized = true;
              console.log('✅ Swipe gestures initialized successfully');
              return true;
            } catch (error) {
              console.error('Failed to initialize swipe gestures:', error);
            }
          } else {
            console.log('Calendar element not found for swipe initialization');
          }
        } else {
          console.log('Hammer.js not available or not on mobile');
        }
        return false;
      };
      
      // Try multiple times with increasing delays
      initializeSwipeGestures();
      setTimeout(initializeSwipeGestures, 100);
      setTimeout(initializeSwipeGestures, 500);
      setTimeout(initializeSwipeGestures, 1000);
      
      // Cleanup on unmount
      return () => {
        clearInterval(timeInterval);
      };
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
        const dayEvents = getEventsForDate(current, props.events);
        
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
        const allEvents = getEventsForDate(date, props.events);
        
        // Separate all-day and timed events
        const allDayEvents = allEvents.filter(e => e.allDay);
        const timedEvents = allEvents.filter(e => !e.allDay);
        
        return {
          key: date.toString(),
          day: date.day,
          date,
          dayName,
          isToday,
          events: timedEvents,
          allDayEvents: allDayEvents
        };
      });
    });

    const dayEvents = computed(() => {
      const allEvents = getEventsForDate(currentDate.value, props.events);
      return allEvents.filter(e => !e.allDay);
    });

    const dayAllDayEvents = computed(() => {
      const allEvents = getEventsForDate(currentDate.value, props.events);
      return allEvents.filter(e => e.allDay);
    });

    // Helper functions - most imported from useCalendarUtils.js
    // calculateEventColumns is kept here as it's specific to this component's overlap logic
    
    // Calculate column positions for overlapping events (Google Calendar style)
    function calculateEventColumns(events) {
      if (events.length === 0) return [];
      
      // Filter out all-day events as they're handled separately
      const timedEvents = events.filter(e => !e.allDay);
      
      // Add column information to each event
      const eventsWithColumns = timedEvents.map(event => {
        const start = Temporal.PlainDateTime.from(event.start);
        const end = event.end ? Temporal.PlainDateTime.from(event.end) : start.add({ hours: 1 });
        
        return {
          ...event,
          _start: start,
          _end: end,
          _column: 0,
          _totalColumns: 1
        };
      });
      
      // Sort by start time, then by duration (longer first)
      eventsWithColumns.sort((a, b) => {
        const timeComp = Temporal.PlainDateTime.compare(a._start, b._start);
        if (timeComp !== 0) return timeComp;
        
        const durationA = Temporal.Duration.from(a._end.since(a._start)).total('minutes');
        const durationB = Temporal.Duration.from(b._end.since(b._start)).total('minutes');
        return durationB - durationA;
      });
      
      // Detect overlaps and assign columns
      for (let i = 0; i < eventsWithColumns.length; i++) {
        const current = eventsWithColumns[i];
        const overlapping = [current];
        
        // Find all events that overlap with current event
        for (let j = 0; j < eventsWithColumns.length; j++) {
          if (i === j) continue;
          const other = eventsWithColumns[j];
          
          // Check if events overlap
          const currentStartsBeforeOtherEnds = Temporal.PlainDateTime.compare(current._start, other._end) < 0;
          const currentEndsAfterOtherStarts = Temporal.PlainDateTime.compare(current._end, other._start) > 0;
          
          if (currentStartsBeforeOtherEnds && currentEndsAfterOtherStarts) {
            if (!overlapping.find(e => e.id === other.id)) {
              overlapping.push(other);
            }
          }
        }
        
        // Assign column to current event
        const usedColumns = new Set();
        for (const event of overlapping) {
          if (event.id !== current.id && event._column !== undefined) {
            usedColumns.add(event._column);
          }
        }
        
        // Find first available column
        let column = 0;
        while (usedColumns.has(column)) {
          column++;
        }
        current._column = column;
        
        // Update total columns for all overlapping events
        const maxColumns = Math.max(column + 1, ...overlapping.map(e => e._column + 1));
        for (const event of overlapping) {
          event._totalColumns = Math.min(maxColumns, 3); // Max 3 columns for readability
        }
      }
      
      return eventsWithColumns;
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

    function onTimeSlotClick(date, hour) {
      // Get the PlainDate object for the clicked date
      const clickedDate = typeof date === 'string' ? 
        Temporal.PlainDate.from(date) : 
        Temporal.PlainDate.from({ year: date.year, month: date.month, day: date.day });
      
      // Set start time to the clicked hour
      const startTime = `${String(hour).padStart(2, '0')}:00`;
      // Set end time to one hour later
      const endTime = `${String((hour + 1) % 24).padStart(2, '0')}:00`;
      
      // Pre-fill the new event form
      newEvent.value = {
        title: '',
        startDate: clickedDate.toString(),
        startTime: startTime,
        endDate: clickedDate.toString(),
        endTime: endTime,
        repeat: 'none',
        calendar: 'default',
        color: '#1967d2'
      };
      
      showModal.value = true;
    }

    function onMonthCellClick(date) {
      // Handle clicks on month view cells
      const clickedDate = Temporal.PlainDate.from({ year: date.year, month: date.month, day: date.day });
      
      // Default to 9:00 AM for month view clicks
      newEvent.value = {
        title: '',
        startDate: clickedDate.toString(),
        startTime: '09:00',
        endDate: clickedDate.toString(),
        endTime: '10:00',
        repeat: 'none',
        calendar: 'default',
        color: '#1967d2'
      };
      
      showModal.value = true;
    }

    function onAllDaySlotClick(date) {
      // Handle clicks on all-day event slots
      const clickedDate = typeof date === 'string' ? 
        Temporal.PlainDate.from(date) : 
        Temporal.PlainDate.from({ year: date.year, month: date.month, day: date.day });
      
      // Pre-fill for all-day event (no times needed)
      newEvent.value = {
        title: '',
        startDate: clickedDate.toString(),
        startTime: '00:00',
        endDate: clickedDate.toString(),
        endTime: '23:59',
        repeat: 'none',
        calendar: 'default',
        color: '#1967d2',
        allDay: true
      };
      
      showModal.value = true;
    }

    function saveEvent(eventDataFromModal) {
      // Use data from modal if provided, otherwise use local newEvent
      const eventToSave = eventDataFromModal || newEvent.value;
      
      if (!eventToSave.title) {
        alert('Please enter an event title');
        return;
      }

      const startDateTime = `${eventToSave.startDate}T${eventToSave.startTime}:00`;
      const endDateTime = `${eventToSave.endDate}T${eventToSave.endTime}:00`;

      const eventData = {
        id: eventToSave.id || Date.now().toString(), // Preserve ID if editing, generate new if creating
        title: eventToSave.title,
        start: startDateTime,
        end: endDateTime,
        color: eventToSave.color,
        calendar: eventToSave.calendar,
        repeat: eventToSave.repeat,
        allDay: eventToSave.allDay || false
      };

      // If recurring, generate recurring events
      if (eventToSave.repeat !== 'none') {
        const recurringEvents = generateRecurringEvents(eventData, eventToSave.repeat);
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
        showDeleteConfirm.value = true;
      }
    }
    
    function confirmDelete() {
      if (selectedEvent.value) {
        emit('eventDelete', selectedEvent.value);
        showDeleteConfirm.value = false;
        closeEventDetail();
      }
    }
    
    function cancelDelete() {
      showDeleteConfirm.value = false;
    }

    function editSelectedEvent() {
      if (selectedEvent.value) {
        // Pre-fill the create modal with selected event data
        const start = Temporal.PlainDateTime.from(selectedEvent.value.start);
        const end = selectedEvent.value.end ? Temporal.PlainDateTime.from(selectedEvent.value.end) : start.add({ hours: 1 });
        
        newEvent.value = {
          id: selectedEvent.value.id, // Preserve ID for editing
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
    
    function toggleMobileSidebar() {
      showMobileSidebar.value = !showMobileSidebar.value;
    }
    
    function closeMobileSidebar() {
      showMobileSidebar.value = false;
    }
    
    function handleViewChange(view) {
      currentView.value = view;
      showMobileSidebar.value = false;
    }
    
    function getCurrentTimePosition() {
      const now = currentTime.value;
      const minutesSinceMidnight = now.hour * 60 + now.minute;
      return (minutesSinceMidnight / 60) * PIXELS_PER_HOUR;
    }
    
    const showCurrentTimeIndicator = computed(() => {
      const today = Temporal.Now.plainDateISO();
      if (currentView.value === 'day') {
        return Temporal.PlainDate.compare(currentDate.value, today) === 0;
      } else if (currentView.value === 'week') {
        const startOfWeek = getStartOfWeek(currentDate.value);
        const endOfWeek = startOfWeek.add({ days: 6 });
        return Temporal.PlainDate.compare(today, startOfWeek) >= 0 && 
               Temporal.PlainDate.compare(today, endOfWeek) <= 0;
      }
      return false;
    });

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
      onTimeSlotClick,
      onMonthCellClick,
      showModal,
      showEventDetail,
      showDeleteConfirm,
      showMobileSidebar,
      selectedEvent,
      newEvent,
      showCreateEventModal,
      closeModal,
      closeEventDetail,
      deleteSelectedEvent,
      confirmDelete,
      cancelDelete,
      editSelectedEvent,
      formatEventTimeRange,
      getCalendarName,
      toggleMobileSidebar,
      closeMobileSidebar,
      handleViewChange,
      getCurrentTimePosition,
      showCurrentTimeIndicator,
      currentTime,
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
  width: 100%;
  display: flex;
  flex-direction: column;
  color: #3c4043;
  touch-action: pan-y; /* Allow vertical scrolling, enable horizontal swipes */
  user-select: none; /* Prevent text selection during swipes */
  -webkit-user-select: none;
  position: relative;
}

/* Header */
.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  /* slightly increased vertical spacing */
  padding: 20px 24px;
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
  min-height: 60px;
  border-bottom: 1px solid #d0d0d0;
  padding-bottom: 8px; /* Adds spacing for all-day section */
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
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
  min-height: 60px;
  border-bottom: 1px solid #d0d0d0;
  padding-bottom: 8px; /* Adds spacing before time grid */
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
  margin-top: 8px; /* Creates visible gap between header and time grid */
  border-top: 1px solid #d0d0d0; /* Grid line divider */
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
  margin-top: 8px; /* Creates visible gap between header and time grid */
  border-top: 1px solid #d0d0d0; /* Grid line divider */
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
  .google-calendar {
    height: 100%;
  }
  
  .calendar-header {
    /* slightly larger mobile header spacing */
    padding: 12px;
    flex-wrap: wrap;
    flex-shrink: 0;
  }

  .calendar-title {
    font-size: 16px;
  }

  .today-btn {
    padding: 6px 12px;
    font-size: 13px;
    min-height: 44px;
  }

  .view-btn {
    padding: 6px 12px;
    font-size: 13px;
    min-height: 44px; /* Touch target size */
  }

  .calendar-body {
    flex: 1;
    min-height: 0;
    overflow: auto;
    -webkit-overflow-scrolling: touch;
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
    font-size: 10px;
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
  
  .week-day-name {
    font-size: 10px;
  }
  
  .hour-slot {
    height: 50px;
  }
  
  /* Better modal sizing on mobile */
  .fixed > div {
    max-width: calc(100vw - 24px) !important;
    max-height: calc(100vh - 80px) !important;
    margin: auto;
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

/* Modal Overlay Styles */
.fixed.inset-0 {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
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

/* Remove predefined color classes (no-op — classes removed) */

/* Time column without grid lines */
.time-column.no-border {
  border-right: none;
}

.time-slot-label {
  height: 60px;
  padding: 4px 8px;
  font-size: 10px;
  color: #70757a;
  text-align: right;
  position: relative;
  /* Remove negative offset so 00:00 is visible beneath sticky headers */
  top: 0;
}

/* Sticky headers */
.sticky-header {
  position: sticky;
  top: 0;
  background: white;
  z-index: 10;
}

.week-day-headers.sticky-header,
.week-day-headers.no-border {
  border-bottom: none !important;
}

.week-day-headers.sticky-header .week-day-header {
  border-right: none !important;
}

/* Current time indicator */
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

/* Mobile menu button */
.mobile-menu-btn {
  padding: 8px;
  border: none;
  background: none;
  cursor: pointer;
  color: #5f6368;
  border-radius: 50%;
  transition: background-color 0.2s;
  margin-right: 8px;
}

.mobile-menu-btn:hover {
  background-color: #f8f9fa;
}

/* Mobile responsive adjustments */
@media (max-width: 768px) {
  .calendar-header {
    /* slightly larger mobile header spacing (duplicate media block adjusted) */
    padding: 16px 12px;
  }
  
  .calendar-title {
    font-size: 18px;
  }
  
  .today-btn {
    padding: 6px 12px;
    font-size: 13px;
  }
  
  .time-column {
    width: 50px;
  }
  
  .time-slot-label {
    font-size: 9px;
    padding: 2px 4px;
  }
  
  .week-day-number {
    width: 30px;
    height: 30px;
    font-size: 16px;
  }
  
  .hour-slot {
    height: 50px;
  }
}

/* All-day events styling */
.all-day-label {
  font-size: 11px;
  color: #70757a;
  padding: 4px 8px;
  text-align: center;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid #e0e0e0;
}

/* Mobile sidebar transitions */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

.slide-enter-active, .slide-leave-active {
  transition: transform 0.3s ease;
}

.slide-enter-from, .slide-leave-to {
  transform: translateX(-100%);
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
</style>
