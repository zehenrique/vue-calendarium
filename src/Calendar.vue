<template>
  <div ref="calendarRoot" class="google-calendar" :class="{ 'is-mobile': isMobile }">
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
      @date-change="handleDateChange"
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
      :calendars="calendars"
      @save="saveEvent"
    />

    <EventDetailModal
      v-if="modalsEnabled"
      v-model="showEventDetail"
      :event="selectedEvent"
      :calendars="calendars"
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
      :calendars="calendars"
      :visible-calendars="visibleCalendarIds"
      @update:visible-calendars="handleVisibleCalendarsUpdate"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue';
import { Temporal } from '@js-temporal/polyfill';
import { useI18n } from 'vue-i18n';
import { DEFAULT_COLOR } from './config/colors.js';
import { mergeTheme, applyTheme } from './config/theme.js';
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
  // Calendar app instance (required)
  calendarApp: {
    type: Object,
    required: true
  },
  // Theme customization (optional)
  theme: {
    type: Object,
    default: null
  }
});

defineEmits([]);

defineOptions({ name: 'GoogleCalendar' });

const { t, locale: i18nLocale } = useI18n();

// Reactive data sources from calendar app
const events = computed(() => props.calendarApp.visibleEvents.value);
const calendars = computed(() => props.calendarApp.calendarsService.getAll());
const calendarLocale = computed(() => props.calendarApp.locale.value);
const modalsEnabled = computed(() => props.calendarApp.enableModals.value);
const mobileSidebarEnabled = computed(() => props.calendarApp.enableMobileSidebar?.value ?? true);

// Computed to get visible calendar IDs
const visibleCalendarIds = computed(() => 
  props.calendarApp.calendarsService.getVisible().map(c => c.id)
);

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

// Initialize current view and date from calendar app
const currentView = ref(props.calendarApp._refs.currentView.value);
const currentDate = ref(props.calendarApp._refs.currentDate.value);

// Sync with calendar app
watch(() => props.calendarApp._refs.currentView.value, (newView) => {
  currentView.value = newView;
});

watch(() => props.calendarApp._refs.currentDate.value, (newDate) => {
  currentDate.value = newDate;
});

watch(currentView, (newView) => {
  const appView = props.calendarApp._refs.currentView;
  if (appView.value !== newView) {
    appView.value = newView;
  }
});

watch(currentDate, (newDate) => {
  const appDate = props.calendarApp._refs.currentDate;
  if (appDate.value !== newDate) {
    appDate.value = newDate;
  }
});

const isMobile = ref(false);
const showModal = ref(false);
const showEventDetail = ref(false);
const showDeleteConfirm = ref(false);
const showMobileSidebar = ref(false);
const selectedEvent = ref(null);
const currentTime = ref(getCurrentDateTime());
const ghostEvent = props.calendarApp._refs.ghostEvent; // Ghost event controlled by app instance
const calendarRoot = ref(null); // Reference to root element for theme application

let timeIntervalId = null;
let mobileMediaQuery = null;

const localeCodeMap = {
  'en-US': 'en',
  'pt-PT': 'pt'
};

const newEvent = ref(createDefaultEventDraft(calendars.value));

watch(
  () => calendarLocale.value,
  (newLocale) => {
    i18nLocale.value = localeCodeMap[newLocale] || 'en';
  },
  { immediate: true }
);

watch(
  () => calendars.value,
  (cals) => {
    if (!cals || !cals.length) return;
    newEvent.value = ensureDraftCalendar(newEvent.value, cals);
  },
  { immediate: true, deep: true }
);

const weekDays = computed(() =>
  createWeekdayLabels(currentDate.value, calendarLocale.value, isMobile.value, t)
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
  
  for (const e of events.value) {
    if (e && e.rrule) {
      expanded.push(
        ...expandRecurrence(e, range.start, range.end)
      );
    } else {
      expanded.push(e);
    }
  }
  
  // Events are already filtered by visibleEvents in calendar app
  return expanded;
});

const monthDays = computed(() => createMonthGrid(currentDate.value, displayEvents.value));

const weekViewDays = computed(() =>
  createWeekViewDays(currentDate.value, displayEvents.value, calendarLocale.value, t)
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
  
  // Apply theme if provided
  if (props.theme && calendarRoot.value) {
    const mergedTheme = mergeTheme(props.theme);
    applyTheme(calendarRoot.value, mergedTheme);
  }
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
  props.calendarApp.callbacks.onViewChange?.(view);
});

// Watch for theme changes
watch(() => props.theme, (newTheme) => {
  if (calendarRoot.value) {
    const mergedTheme = mergeTheme(newTheme);
    applyTheme(calendarRoot.value, mergedTheme);
  }
}, { deep: true });

function toggleMobileSidebar() {
  showMobileSidebar.value = !showMobileSidebar.value;
}

function handleVisibleCalendarsUpdate(calendarIds) {
  // Update calendar visibility through calendarsService
  calendars.value.forEach(cal => {
    const shouldBeVisible = calendarIds.includes(cal.id);
    if (cal.visible !== shouldBeVisible) {
      props.calendarApp.calendarsService.toggleVisibility(cal.id);
    }
  });
}

function previousPeriod() {
  if (currentView.value === 'month') {
    currentDate.value = currentDate.value.subtract({ months: 1 });
  } else if (currentView.value === 'week') {
    currentDate.value = currentDate.value.subtract({ weeks: 1 });
  } else {
    currentDate.value = currentDate.value.subtract({ days: 1 });
  }

  props.calendarApp.callbacks.onDateChange?.(currentDate.value);
}

function nextPeriod() {
  if (currentView.value === 'month') {
    currentDate.value = currentDate.value.add({ months: 1 });
  } else if (currentView.value === 'week') {
    currentDate.value = currentDate.value.add({ weeks: 1 });
  } else {
    currentDate.value = currentDate.value.add({ days: 1 });
  }

  props.calendarApp.callbacks.onDateChange?.(currentDate.value);
}

function goToToday() {
  currentDate.value = getCurrentPlainDate();
  props.calendarApp.callbacks.onDateChange?.(currentDate.value);
}

function handleDateChange(dateString) {
  try {
    // Convert ISO date string (YYYY-MM-DD) to Temporal.PlainDate
    const newDate = Temporal.PlainDate.from(dateString);
    currentDate.value = newDate;
    props.calendarApp.callbacks.onDateChange?.(newDate);
  } catch (error) {
    console.error('Invalid date format:', dateString, error);
  }
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
  const draft = createDefaultEventDraft(calendars.value, overrides);
  newEvent.value = draft;

  // Create ghost event with lower opacity using app method
  const ghostEventData = buildEventPayloadFromDraft(draft, calendars.value);
  props.calendarApp.showGhostEvent({
    ...ghostEventData,
    id: 'ghost-event'
  });

  if (!modalsEnabled.value) {
    const requestContext = {
      view: currentView.value,
      ...context
    };

    props.calendarApp.callbacks.onEventCreateRequest?.({ draft, context: requestContext });
    return;
  }

  showModal.value = true;
}

function onEventClick(event) {
  selectedEvent.value = event;
  props.calendarApp.callbacks.onEventClick?.(event);

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

  newEvent.value = createDefaultEventDraft(calendars.value, {
    id: target.id,
    title: target.title,
    startDate: start.toPlainDate().toString(),
    startTime: `${String(start.hour).padStart(2, '0')}:${String(start.minute).padStart(2, '0')}`,
    endDate: end.toPlainDate().toString(),
    endTime: `${String(end.hour).padStart(2, '0')}:${String(end.minute).padStart(2, '0')}`,
    rrule: target.rrule || '',
    calendarId: target.calendarId || calendars.value[0]?.id || 'default',
    color: target.color || calendars.value[0]?.color || DEFAULT_COLOR,
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
    props.calendarApp.eventsService.remove(selectedEvent.value.id);
    props.calendarApp.callbacks.onEventDelete?.(selectedEvent.value);
  } else {
    // Deleting single occurrence - find the base event and add EXDATE
    const selectedId = selectedEvent.value.id.toString();
    const baseEventId = selectedId.includes('-') ? selectedId.split('-')[0] : selectedId;
    
    // Find the base event from events (not the expanded displayEvents)
    const baseEvent = events.value.find(e => e.id.toString() === baseEventId);
    
    if (!baseEvent || !baseEvent.rrule) {
      // Fallback: if we can't find base event or it doesn't have rrule, delete normally
      props.calendarApp.eventsService.remove(selectedEvent.value.id);
      props.calendarApp.callbacks.onEventDelete?.(selectedEvent.value);
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
    props.calendarApp.eventsService.update(eventToUpdate);
    props.calendarApp.callbacks.onEventUpdate?.(eventToUpdate);
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

  const normalizedDraft = ensureDraftCalendar(eventToSave, calendars.value);
  const eventPayload = buildEventPayloadFromDraft(normalizedDraft, calendars.value);

  // Check if event exists in the service (not just if it has an ID)
  const existingEvent = eventPayload.id ? props.calendarApp.eventsService.get(eventPayload.id) : null;
  
  if (existingEvent) {
    // Update existing event
    props.calendarApp.eventsService.update(eventPayload);
    props.calendarApp.callbacks.onEventUpdate?.(eventPayload);
  } else {
    // Add new event (remove any auto-generated ID first)
    delete eventPayload.id;
    props.calendarApp.eventsService.add(eventPayload);
    props.calendarApp.callbacks.onEventCreate?.([eventPayload]);
  }

  // Clear ghost event after saving
  props.calendarApp.hideGhostEvent();
  newEvent.value = createDefaultEventDraft(calendars.value);
}

// Watch for modal close to clear ghost event if cancelled
watch(showModal, (isOpen) => {
  if (!isOpen && ghostEvent.value) {
    // Modal was closed without saving, clear ghost event
    props.calendarApp.hideGhostEvent();
    // Also reset newEvent when modal closes
    newEvent.value = createDefaultEventDraft(calendars.value);
  }
});

</script>

<style scoped>
.google-calendar {
  /* Use CSS custom properties from theme */
  font-family: var(--calendar-font-family, 'Google Sans', 'Roboto', Arial, sans-serif);
  background: var(--calendar-bg, #ffffff);
  color: var(--calendar-text-primary, #3c4043);
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
