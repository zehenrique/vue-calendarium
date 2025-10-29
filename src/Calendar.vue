<template>
  <div class="google-calendar" :class="{ 'is-mobile': isMobile }">
    <CalendarHeader
      :current-title="currentTitle"
      :current-view="currentView"
      :views="views"
      :is-mobile="isMobile"
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
      @confirm="confirmDelete"
    />

    <MobileSidebar
      v-model="showMobileSidebar"
      :current-view="currentView"
      :views="views"
      :calendars="props.calendars"
      @view-change="handleViewChange"
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
  buildEventPayloadFromDraft,
  generateRecurringEvents
} from './composables/useCalendarEventHelpers.js';
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
  }
});

const emit = defineEmits(['eventClick', 'dateChange', 'viewChange', 'eventCreate', 'eventDelete', 'eventCreateRequest']);

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

let timeIntervalId = null;
let mobileMediaQuery = null;

const localeCodeMap = {
  'en-US': 'en',
  'pt-PT': 'pt'
};

const calendarLocale = computed(() => props.locale);
const modalsEnabled = computed(() => props.enableModals !== false);

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

const monthDays = computed(() => createMonthGrid(currentDate.value, props.events));

const weekViewDays = computed(() =>
  createWeekViewDays(currentDate.value, props.events, calendarLocale.value)
);

const weekPixelsPerHour = computed(() =>
  isMobile.value ? MOBILE_PIXELS_PER_HOUR_WEEK : DESKTOP_PIXELS_PER_HOUR_WEEK
);

const dayPixelsPerHour = computed(() =>
  isMobile.value ? MOBILE_PIXELS_PER_HOUR_DAY : DESKTOP_PIXELS_PER_HOUR_DAY
);

const dayEventSummary = computed(() => summarizeEventsForDate(currentDate.value, props.events));
const dayEvents = computed(() => dayEventSummary.value.timedEvents);
const dayAllDayEvents = computed(() => dayEventSummary.value.allDayEvents);

const currentTitle = computed(() =>
  formatCurrentTitle(currentView.value, currentDate.value, calendarLocale.value)
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
    repeat: target.repeat || 'none',
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

function confirmDelete() {
  if (selectedEvent.value) {
    emit('eventDelete', selectedEvent.value);
    selectedEvent.value = null;
  }
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
  const eventsToEmit = generateRecurringEvents(eventPayload, eventPayload.repeat);

  emit('eventCreate', eventsToEmit);

  newEvent.value = createDefaultEventDraft(props.calendars);
}

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
