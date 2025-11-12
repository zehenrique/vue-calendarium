<template>
  <div class="google-calendar" :class="{ 'is-mobile': isMobile }">
    <CalendarHeader
      :current-title="currentTitle"
      :current-view="currentView"
      :current-date="currentDate"
      :views="views"
      :is-mobile="isMobile"
      :show-mobile-menu="mobileSidebarEnabled"
      :week-days="currentView === 'week' ? weekViewDays : null"
      :t="t"
      @toggle-sidebar="toggleMobileSidebar"
      @previous="previousPeriod"
      @next="nextPeriod"
      @today="goToToday"
      @view-change="handleViewChange"
      @all-day-select="onAllDaySlotClick"
      @event-select="onEventClick"
      @day-number-click="onAllDaySlotClick"
    />

    <MonthView
      v-if="currentView === 'month'"
      :days="monthDays"
      :week-days="weekDays"
      :locale="calendarLocale"
      :is-mobile="isMobile"
      :t="t"
      @day-select="handleMonthDaySelect"
      @event-select="onEventClick"
    />

    <WeekView
      v-else-if="currentView === 'week'"
      :days="weekViewDays"
      :locale="calendarLocale"
      :pixels-per-hour="weekPixelsPerHour"
      :show-current-time-indicator="showCurrentTimeIndicator"
      :current-time-position="currentTimePosition"
      :t="t"
      @hour-slot-select="handleHourSlotSelect"
      @all-day-select="onAllDaySlotClick"
      @event-select="onEventClick"
    />

    <DayView
      v-else
      :date="currentDate"
      :events="dayEvents"
      :all-day-events="dayAllDayEvents"
      :locale="calendarLocale"
      :pixels-per-hour="dayPixelsPerHour"
      :show-current-time-indicator="showCurrentTimeIndicator"
      :current-time-position="currentTimePosition"
      :t="t"
      @hour-slot-select="handleHourSlotSelect"
      @all-day-select="onAllDaySlotClick"
      @event-select="onEventClick"
    />

    <EventModal
      v-if="modalsEnabled"
      v-model="showModal"
      :event="newEvent"
      :calendars="props.calendars"
      @save="saveEvent"
    />

    <EventDetailModal
      v-if="modalsEnabled"
      v-model="showEventDetail"
      :event="selectedEvent"
      :calendars="props.calendars"
      :locale="calendarLocale"
      @edit="editSelectedEvent"
      @delete="deleteSelectedEvent"
    />

    <DeleteConfirmModal
      v-if="modalsEnabled"
      v-model="showDeleteConfirm"
      :event="selectedEvent"
      @confirm="confirmDelete"
    />

    <MobileSidebar
      v-if="mobileSidebarEnabled"
      v-model="showMobileSidebar"
      :current-view="currentView"
      :views="views"
      :calendars="props.calendars"
      :visible-calendars="visibleCalendars"
      @view-change="handleViewChange"
      @update:visible-calendars="handleVisibleCalendarsUpdate"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue';
import { Temporal } from '@js-temporal/polyfill';
import { useI18n } from 'vue-i18n';
import CalendarHeader from './components/calendar/CalendarHeader.vue';
import MonthView from './components/calendar/MonthView.vue';
import WeekView from './components/calendar/WeekView.vue';
import DayView from './components/calendar/DayView.vue';
import EventModal from './components/EventModal.vue';
import EventDetailModal from './components/EventDetailModal.vue';
import DeleteConfirmModal from './components/DeleteConfirmModal.vue';
import MobileSidebar from './components/MobileSidebar.vue';
import {
  createDefaultEventDraft,
  ensureDraftCalendar,
  summarizeEventsForDate,
  createMonthGrid,
  createWeekViewDays,
  createWeekdayLabels,
  formatCurrentTitle,
  shouldDisplayCurrentTimeIndicator,
  buildEventPayloadFromDraft
} from './composables/useCalendarEventHelpers.js';
import { getStartOfWeek, getEndOfWeek } from './composables/useCalendarUtils.js';
import { expandRecurrence } from './composables/useCalendarInterop.js';
import { createSwipeController } from './composables/useSwipeGestures.js';

const props = defineProps({
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
  },
  enableModals: {
    type: Boolean,
    default: true
  },
  enableMobileSidebar: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits(['eventClick', 'dateChange', 'viewChange', 'eventCreate', 'eventDelete', 'eventUpdate', 'eventCreateRequest']);

defineOptions({ name: 'GoogleCalendar' });

const { t, locale: i18nLocale } = useI18n();

const views = ['day', 'week', 'month'];
const DESKTOP_PIXELS_PER_HOUR_WEEK = 60;
const MOBILE_PIXELS_PER_HOUR_WEEK = 50;
const DESKTOP_PIXELS_PER_HOUR_DAY = 45;
const MOBILE_PIXELS_PER_HOUR_DAY = 38;

function readTestNow() {
  if (typeof window === 'undefined') return null;
  const value = window.__CALENDAR_TEST_NOW__;
  if (!value) return null;
  try {
    return Temporal.PlainDateTime.from(value);
  } catch (error) {
    console.warn('Invalid __CALENDAR_TEST_NOW__ value:', value, error);
    return null;
  }
}

function getCurrentPlainDate() {
  const testNow = readTestNow();
  return testNow ? testNow.toPlainDate() : Temporal.Now.plainDateISO();
}

function getCurrentDateTime() {
  return readTestNow() ?? Temporal.Now.plainDateTimeISO();
}

const currentView = ref(props.initialView);
const currentDate = ref(props.initialDate ? Temporal.PlainDate.from(props.initialDate) : getCurrentPlainDate());
const isMobile = ref(false);
const showModal = ref(false);
const showEventDetail = ref(false);
const showDeleteConfirm = ref(false);
const showMobileSidebar = ref(false);
const selectedEvent = ref(null);
const currentTime = ref(getCurrentDateTime());
const ghostEvent = ref(null); // Ghost event displayed before saving
const visibleCalendars = ref(props.calendars.map(c => c.id)); // Track which calendars are visible

let timeIntervalId = null;
let mobileMediaQuery = null;

const localeCodeMap = {
  'en-US': 'en',
  'pt-PT': 'pt'
};

const calendarLocale = computed(() => props.locale);
const modalsEnabled = computed(() => props.enableModals !== false);
const mobileSidebarEnabled = computed(() => props.enableMobileSidebar !== false);

const newEvent = ref(createDefaultEventDraft(props.calendars));

watch(
  () => props.locale,
  (newLocale) => {
    i18nLocale.value = localeCodeMap[newLocale] || 'en';
  },
  { immediate: true }
);

watch(
  () => props.calendars,
  (calendars) => {
    if (!calendars || !calendars.length) return;
    newEvent.value = ensureDraftCalendar(newEvent.value, calendars);
  },
  { immediate: true, deep: true }
);

const weekDays = computed(() =>
  createWeekdayLabels(currentDate.value, calendarLocale.value, isMobile.value)
);

// Expand RRULE-based events into occurrences for the visible range
function getViewRange(view, date) {
  if (view === 'month') {
    const year = date.year;
    const month = date.month;
    const firstDay = Temporal.PlainDate.from({ year, month, day: 1 });
    const lastDay = firstDay.add({ months: 1 }).subtract({ days: 1 });
    const start = getStartOfWeek(firstDay);
    const end = getEndOfWeek(lastDay);
    return {
      start: `${start.toString()}T00:00:00`,
      end: `${end.toString()}T23:59:59`
    };
  }
  if (view === 'week') {
    const start = getStartOfWeek(date);
    const end = start.add({ days: 6 });
    return {
      start: `${start.toString()}T00:00:00`,
      end: `${end.toString()}T23:59:59`
    };
  }
  // day
  return {
    start: `${date.toString()}T00:00:00`,
    end: `${date.toString()}T23:59:59`
  };
}

const displayEvents = computed(() => {
  const range = getViewRange(currentView.value, currentDate.value);
  const expanded = [];
  
  // Add ghost event if it exists
  if (ghostEvent.value) {
    expanded.push(ghostEvent.value);
  }
  
  for (const e of props.events) {
    if (e && e.rrule) {
      expanded.push(
        ...expandRecurrence(e, range.start, range.end)
      );
    } else {
      expanded.push(e);
    }
  }
  
  // Filter events by visible calendars
  return expanded.filter(event => {
    // Ghost events are always shown
    if (event.isGhost) return true;
    
    // Filter by calendar ID - show only events from visible calendars
    if (event.calendar) {
      return visibleCalendars.value.includes(event.calendar);
    }
    
    // If no calendar property, show the event by default
    return true;
  });
});

const monthDays = computed(() => createMonthGrid(currentDate.value, displayEvents.value));

const weekViewDays = computed(() =>
  createWeekViewDays(currentDate.value, displayEvents.value, calendarLocale.value)
);

const weekPixelsPerHour = computed(() =>
  isMobile.value ? MOBILE_PIXELS_PER_HOUR_WEEK : DESKTOP_PIXELS_PER_HOUR_WEEK
);

const dayPixelsPerHour = computed(() =>
  isMobile.value ? MOBILE_PIXELS_PER_HOUR_DAY : DESKTOP_PIXELS_PER_HOUR_DAY
);

const dayEventSummary = computed(() => summarizeEventsForDate(currentDate.value, displayEvents.value));
const dayEvents = computed(() => dayEventSummary.value.timedEvents);
const dayAllDayEvents = computed(() => dayEventSummary.value.allDayEvents);

const currentTitle = computed(() =>
  formatCurrentTitle(currentView.value, currentDate.value, calendarLocale.value, isMobile.value)
);

const currentTimePosition = computed(() => {
  const minutesSinceMidnight = currentTime.value.hour * 60 + currentTime.value.minute;
  const pixelsPerHour = currentView.value === 'day' ? dayPixelsPerHour.value : weekPixelsPerHour.value;
  return (minutesSinceMidnight / 60) * pixelsPerHour;
});

const showCurrentTimeIndicator = computed(() =>
  shouldDisplayCurrentTimeIndicator(currentView.value, currentDate.value)
);

function handleMobileQueryChange(event) {
  const matches = Boolean(event?.matches);
  if (isMobile.value !== matches) {
    isMobile.value = matches;
  }
}

function initializeMobileDetection() {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return;
  }

  mobileMediaQuery = window.matchMedia('(max-width: 767px)');
  handleMobileQueryChange(mobileMediaQuery);

  if (typeof mobileMediaQuery.addEventListener === 'function') {
    mobileMediaQuery.addEventListener('change', handleMobileQueryChange);
  } else if (typeof mobileMediaQuery.addListener === 'function') {
    // Fallback for older browsers
    mobileMediaQuery.addListener(handleMobileQueryChange);
  }
}

function teardownMobileDetection() {
  if (!mobileMediaQuery) {
    return;
  }

  if (typeof mobileMediaQuery.removeEventListener === 'function') {
    mobileMediaQuery.removeEventListener('change', handleMobileQueryChange);
  } else if (typeof mobileMediaQuery.removeListener === 'function') {
    mobileMediaQuery.removeListener(handleMobileQueryChange);
  }

  mobileMediaQuery = null;
}

function updateCurrentTime() {
  currentTime.value = getCurrentDateTime();
}

const { destroySwipeGestures, scheduleSwipeInitialization } = createSwipeController('.google-calendar', {
  onSwipeLeft: nextPeriod,
  onSwipeRight: previousPeriod
});

onMounted(() => {
  initializeMobileDetection();
  updateCurrentTime();

  timeIntervalId = setInterval(updateCurrentTime, 60000);
  scheduleSwipeInitialization(isMobile.value);
});

onBeforeUnmount(() => {
  teardownMobileDetection();

  if (timeIntervalId) {
    clearInterval(timeIntervalId);
    timeIntervalId = null;
  }

  destroySwipeGestures();
});

watch(isMobile, (mobile) => {
  if (mobile) {
    scheduleSwipeInitialization(mobile);
  } else {
    destroySwipeGestures();
  }
});

watch(currentView, (view) => {
  emit('viewChange', view);
});

function toggleMobileSidebar() {
  showMobileSidebar.value = !showMobileSidebar.value;
}

function handleVisibleCalendarsUpdate(calendars) {
  visibleCalendars.value = calendars;
}

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
  currentDate.value = getCurrentPlainDate();
  emit('dateChange', currentDate.value);
}

function handleViewChange(view) {
  if (currentView.value !== view) {
    currentView.value = view;
  }
  showMobileSidebar.value = false;
}

function handleMonthDaySelect(date) {
  const clickedDate = Temporal.PlainDate.from(date);

  openCreateModal({
    startDate: clickedDate.toString(),
    endDate: clickedDate.toString(),
    startTime: '09:00',
    endTime: '10:00',
    allDay: false
  }, {
    source: 'month-day',
    view: 'month',
    date: clickedDate.toString()
  });
}

function handleHourSlotSelect(payload) {
  if (!payload) return;
  const { date, hour } = payload;
  const clickedDate = Temporal.PlainDate.from(date);
  const startHour = String(hour).padStart(2, '0');
  const endHour = String((hour + 1) % 24).padStart(2, '0');

  openCreateModal({
    startDate: clickedDate.toString(),
    endDate: clickedDate.toString(),
    startTime: `${startHour}:00`,
    endTime: `${endHour}:00`,
    allDay: false
  }, {
    source: 'time-slot',
    slot: payload,
    date: clickedDate.toString()
  });
}

function onAllDaySlotClick(date) {
  const clickedDate = Temporal.PlainDate.from(date);

  openCreateModal({
    startDate: clickedDate.toString(),
    endDate: clickedDate.toString(),
    startTime: '00:00',
    endTime: '23:59',
    allDay: true
  }, {
    source: 'all-day',
    date: clickedDate.toString()
  });
}

function openCreateModal(overrides = {}, context = {}) {
  const draft = createDefaultEventDraft(props.calendars, overrides);
  newEvent.value = draft;

  // Create ghost event with lower opacity
  const ghostEventData = buildEventPayloadFromDraft(draft, props.calendars);
  ghostEvent.value = {
    ...ghostEventData,
    id: 'ghost-event',
    isGhost: true // Mark as ghost for styling
  };

  if (!modalsEnabled.value) {
    const requestContext = {
      view: currentView.value,
      ...context
    };

    emit('eventCreateRequest', { draft, context: requestContext });
    return;
  }

  showModal.value = true;
}

function onEventClick(event) {
  selectedEvent.value = event;
  emit('eventClick', event);

  if (!modalsEnabled.value) {
    return;
  }

  showEventDetail.value = true;
}

function editSelectedEvent(event) {
  const target = event || selectedEvent.value;
  if (!target) return;

  const start = Temporal.PlainDateTime.from(target.start);
  const end = target.end ? Temporal.PlainDateTime.from(target.end) : start.add({ hours: 1 });

  newEvent.value = createDefaultEventDraft(props.calendars, {
    id: target.id,
    title: target.title,
    startDate: start.toPlainDate().toString(),
    startTime: `${String(start.hour).padStart(2, '0')}:${String(start.minute).padStart(2, '0')}`,
    endDate: end.toPlainDate().toString(),
    endTime: `${String(end.hour).padStart(2, '0')}:${String(end.minute).padStart(2, '0')}`,
    rrule: target.rrule || '',
    calendar: target.calendar || props.calendars[0]?.id || 'default',
    color: target.color || props.calendars[0]?.color || '#1967d2',
    allDay: target.allDay || false
  });

  showEventDetail.value = false;
  if (!modalsEnabled.value) {
    return;
  }

  showModal.value = true;
}

function deleteSelectedEvent(event) {
  selectedEvent.value = event || selectedEvent.value;
  if (!modalsEnabled.value) {
    return;
  }

  if (selectedEvent.value) {
    showDeleteConfirm.value = true;
  }
}

function confirmDelete(options = {}) {
  if (!selectedEvent.value) {
    showDeleteConfirm.value = false;
    showEventDetail.value = false;
    return;
  }

  const { deleteAll = false } = options;
  
  // If deleting all events in the series, or if not a recurring event
  if (deleteAll || (!selectedEvent.value.rrule && !selectedEvent.value.recurringEventId)) {
    emit('eventDelete', selectedEvent.value);
  } else {
    // Deleting single occurrence - find the base event and add EXDATE
    // selectedEvent might be an expanded occurrence (id like 'event-1-2')
    // We need to find the original base event
    const selectedId = selectedEvent.value.id.toString();
    const baseEventId = selectedId.includes('-') ? selectedId.split('-')[0] : selectedId;
    
    // Find the base event from props.events (not the expanded displayEvents)
    const baseEvent = props.events.find(e => e.id.toString() === baseEventId);
    
    if (!baseEvent || !baseEvent.rrule) {
      // Fallback: if we can't find base event or it doesn't have rrule, delete normally
      emit('eventDelete', selectedEvent.value);
      selectedEvent.value = null;
      showDeleteConfirm.value = false;
      showEventDetail.value = false;
      return;
    }
    
    // Create updated event with EXDATE
    const eventToUpdate = { ...baseEvent };
    const dateToExclude = selectedEvent.value.start;
    
    // Parse the ISO date to get formatted date for EXDATE (YYYYMMDDTHHMMSSZ format)
    const excludeDate = new Date(dateToExclude);
    const exdateFormatted = excludeDate.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    
    // Parse existing RRULE
    let rruleString = eventToUpdate.rrule || '';
    
    // Check if EXDATE already exists in the RRULE
    if (rruleString.includes('\nEXDATE:')) {
      // Append to existing EXDATE
      rruleString = rruleString.replace(
        /\nEXDATE:([^\n]+)/,
        (match, dates) => `\nEXDATE:${dates},${exdateFormatted}`
      );
    } else {
      // Add new EXDATE line
      // Ensure RRULE has proper format (DTSTART\nRRULE:...)
      if (!rruleString.includes('DTSTART:')) {
        // Use the base event's start for DTSTART, not the occurrence's start
        const dtstart = new Date(baseEvent.start).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
        rruleString = `DTSTART:${dtstart}\nRRULE:${rruleString.replace(/^RRULE:/, '')}`;
      }
      rruleString += `\nEXDATE:${exdateFormatted}`;
    }
    
    eventToUpdate.rrule = rruleString;
    emit('eventUpdate', eventToUpdate);
  }
  
  selectedEvent.value = null;
  showDeleteConfirm.value = false;
  showEventDetail.value = false;
}

function saveEvent(eventDataFromModal) {
  const eventToSave = eventDataFromModal || newEvent.value;

  if (!eventToSave.title) {
    alert('Please enter an event title');
    return;
  }

  const normalizedDraft = ensureDraftCalendar(eventToSave, props.calendars);
  const eventPayload = buildEventPayloadFromDraft(normalizedDraft, props.calendars);

  // Emit single event with RRULE - expansion happens in displayEvents computed
  emit('eventCreate', [eventPayload]);

  // Clear ghost event after saving
  ghostEvent.value = null;
  newEvent.value = createDefaultEventDraft(props.calendars);
}

// Watch for modal close to clear ghost event if cancelled
watch(showModal, (isOpen) => {
  if (!isOpen && ghostEvent.value) {
    // Modal was closed without saving, clear ghost event
    ghostEvent.value = null;
  }
});

</script>

<style scoped>
.google-calendar {
  font-family: 'Google Sans', 'Roboto', Arial, sans-serif;
  background: #ffffff;
  color: #3c4043;
  display: flex;
  flex-direction: column;
  height: 100%;
  position: relative;
  touch-action: pan-x pan-y;
  user-select: none;
  width: 100%;
}

@media (max-width: 768px) {
  .google-calendar {
    height: 100%;
  }
}
</style>
