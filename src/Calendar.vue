<template>
  <div ref="calendarRoot" class="vue-calendarium" :class="{ 'is-mobile': isMobile }">
    <CalendarHeader
      :current-title="currentTitle"
      :current-view="currentView"
      :current-date="currentDate"
      :views="views"
      :is-mobile="isMobile"
      :show-mobile-menu="mobileSidebarEnabled"
      :mobile-view-selector-placement="mobileViewSelectorPlacement"
      :swipe-enabled="swipeDeckEnabled"
      :swipe-render-neighbors="swipeRenderNeighbors"
      :swipe-is-animating="swipeIsAnimating"
      :swipe-delta-x="swipeDeltaX"
      :prev-week-days="currentView === 'week' ? prevWeekViewDays : null"
      :next-week-days="currentView === 'week' ? nextWeekViewDays : null"
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

    <div ref="swipeDeck" class="swipe-deck" :class="{ 'is-active': swipeDeckEnabled, 'is-animating': swipeIsAnimating, 'is-panning': swipeIsPanning }">
      <div class="swipe-track" :class="{ 'is-single': !swipeRenderNeighbors }" :style="swipeTrackStyle">
        <div v-if="swipeRenderNeighbors" class="swipe-pane is-prev">
          <MonthView 
            v-if="currentView === 'month'" 
            :days="prevMonthDays" 
            :week-days="weekDays" 
            :locale="calendarLocale" 
            :is-mobile="isMobile" 
            :t="t" 
            @day-select="handleMonthDaySelect" 
            @event-select="onEventClick" />
          <WeekView 
            v-else-if="currentView === 'week'" 
            :days="prevWeekViewDays" 
            :locale="calendarLocale" 
            :pixels-per-hour="weekPixelsPerHour" 
            :show-current-time-indicator="prevShowCurrentTimeIndicator" 
            :current-time-position="currentTimePosition" 
            :is-mobile="isMobile" 
            :enable-drag-and-drop="dragAndDropEnabled" 
            :is-dragging="isDragging" 
            :dragged-event-id="draggedEvent?.id" 
            :drag-transform="dragTransform" 
            :drop-target="dropTarget" 
            :t="t" 
            @hour-slot-select="handleHourSlotSelect" 
            @all-day-select="onAllDaySlotClick" 
            @event-select="onEventClick" 
            @event-drag-start="handleEventDragStart" 
            @event-drag-move="handleEventDragMove" 
            @event-drag-end="handleEventDragEnd" 
            @slot-drag-over="handleSlotDragOver" 
            @slot-drag-leave="handleSlotDragLeave" />
          <DayView 
            v-else 
            :date="previousDate" 
            :events="prevDayEvents" 
            :all-day-events="prevDayAllDayEvents" 
            :locale="calendarLocale" 
            :pixels-per-hour="dayPixelsPerHour" 
            :show-current-time-indicator="prevShowCurrentTimeIndicator" 
            :current-time-position="currentTimePosition" 
            :is-mobile="isMobile" 
            :enable-drag-and-drop="dragAndDropEnabled" 
            :is-dragging="isDragging" 
            :dragged-event-id="draggedEvent?.id" 
            :drag-transform="dragTransform" 
            :drop-target="dropTarget" 
            :t="t" 
            @hour-slot-select="handleHourSlotSelect" 
            @all-day-select="onAllDaySlotClick" 
            @event-select="onEventClick" 
            @event-drag-start="handleEventDragStart" 
            @event-drag-move="handleEventDragMove" 
            @event-drag-end="handleEventDragEnd" 
            @slot-drag-over="handleSlotDragOver" 
            @slot-drag-leave="handleSlotDragLeave" />
        </div>

        <div class="swipe-pane is-current">
          <MonthView 
            v-if="currentView === 'month'" 
            :days="monthDays" 
            :week-days="weekDays" 
            :locale="calendarLocale" 
            :is-mobile="isMobile" 
            :t="t" 
            @day-select="handleMonthDaySelect" 
            @event-select="onEventClick" />
          <WeekView 
            v-else-if="currentView === 'week'" 
            :days="weekViewDays" 
            :locale="calendarLocale" 
            :pixels-per-hour="weekPixelsPerHour" 
            :show-current-time-indicator="showCurrentTimeIndicator" 
            :current-time-position="currentTimePosition" 
            :is-mobile="isMobile" 
            :enable-drag-and-drop="dragAndDropEnabled" 
            :is-dragging="isDragging" 
            :dragged-event-id="draggedEvent?.id" 
            :drag-transform="dragTransform" 
            :drop-target="dropTarget" 
            :t="t" 
            @hour-slot-select="handleHourSlotSelect" 
            @all-day-select="onAllDaySlotClick" 
            @event-select="onEventClick" 
            @event-drag-start="handleEventDragStart" 
            @event-drag-move="handleEventDragMove" 
            @event-drag-end="handleEventDragEnd" 
            @slot-drag-over="handleSlotDragOver" 
            @slot-drag-leave="handleSlotDragLeave" />
          <DayView 
            v-else 
            :date="currentDate" 
            :events="dayEvents" 
            :all-day-events="dayAllDayEvents" 
            :locale="calendarLocale" 
            :pixels-per-hour="dayPixelsPerHour" 
            :show-current-time-indicator="showCurrentTimeIndicator" 
            :current-time-position="currentTimePosition" 
            :is-mobile="isMobile" 
            :enable-drag-and-drop="dragAndDropEnabled" 
            :is-dragging="isDragging" 
            :dragged-event-id="draggedEvent?.id" 
            :drag-transform="dragTransform" 
            :drop-target="dropTarget" 
            :t="t" 
            @hour-slot-select="handleHourSlotSelect" 
            @all-day-select="onAllDaySlotClick" 
            @event-select="onEventClick" 
            @event-drag-start="handleEventDragStart" 
            @event-drag-move="handleEventDragMove" 
            @event-drag-end="handleEventDragEnd" 
            @slot-drag-over="handleSlotDragOver" 
            @slot-drag-leave="handleSlotDragLeave" />
        </div>

        <div v-if="swipeRenderNeighbors" class="swipe-pane is-next">
          <MonthView 
            v-if="currentView === 'month'" 
            :days="nextMonthDays" 
            :week-days="weekDays" 
            :locale="calendarLocale" 
            :is-mobile="isMobile" 
            :t="t" 
            @day-select="handleMonthDaySelect" 
            @event-select="onEventClick" />
          <WeekView 
            v-else-if="currentView === 'week'" 
            :days="nextWeekViewDays" 
            :locale="calendarLocale" 
            :pixels-per-hour="weekPixelsPerHour" 
            :show-current-time-indicator="nextShowCurrentTimeIndicator" 
            :current-time-position="currentTimePosition" 
            :is-mobile="isMobile" 
            :enable-drag-and-drop="dragAndDropEnabled" 
            :is-dragging="isDragging" 
            :dragged-event-id="draggedEvent?.id" 
            :drag-transform="dragTransform" 
            :drop-target="dropTarget" 
            :t="t" 
            @hour-slot-select="handleHourSlotSelect" 
            @all-day-select="onAllDaySlotClick" 
            @event-select="onEventClick" 
            @event-drag-start="handleEventDragStart" 
            @event-drag-move="handleEventDragMove" 
            @event-drag-end="handleEventDragEnd" 
            @slot-drag-over="handleSlotDragOver" 
            @slot-drag-leave="handleSlotDragLeave" />
          <DayView 
            v-else 
            :date="nextDate" 
            :events="nextDayEvents" 
            :all-day-events="nextDayAllDayEvents" 
            :locale="calendarLocale" 
            :pixels-per-hour="dayPixelsPerHour" 
            :show-current-time-indicator="nextShowCurrentTimeIndicator" 
            :current-time-position="currentTimePosition" 
            :is-mobile="isMobile" 
            :enable-drag-and-drop="dragAndDropEnabled" 
            :is-dragging="isDragging" 
            :dragged-event-id="draggedEvent?.id" 
            :drag-transform="dragTransform" 
            :drop-target="dropTarget" 
            :t="t" 
            @hour-slot-select="handleHourSlotSelect" 
            @all-day-select="onAllDaySlotClick" 
            @event-select="onEventClick" 
            @event-drag-start="handleEventDragStart" 
            @event-drag-move="handleEventDragMove" 
            @event-drag-end="handleEventDragEnd" 
            @slot-drag-over="handleSlotDragOver" 
            @slot-drag-leave="handleSlotDragLeave" />
        </div>
      </div>
    </div>

    <EventModal
      v-if="modalsEnabled"
      v-model="showModal"
      :event="newEvent"
      :calendars="calendars"
      @save="saveEvent"/>

    <EventDetailModal
      v-if="modalsEnabled"
      v-model="showEventDetail"
      :event="selectedEvent"
      :calendars="calendars"
      :locale="calendarLocale"
      @edit="editSelectedEvent"
      @delete="deleteSelectedEvent"/>

    <DeleteConfirmModal
      v-if="modalsEnabled"
      v-model="showDeleteConfirm"
      :event="selectedEvent"
      @confirm="confirmDelete"/>

    <MobileSidebar
      v-if="mobileSidebarEnabled"
      v-model="showMobileSidebar"
      :current-view="currentView"
      :views="views"
      :mobile-view-selector-placement="mobileViewSelectorPlacement"
      :calendars="calendars"
      :visible-calendars="visibleCalendarIds"
      @update:visible-calendars="handleVisibleCalendarsUpdate"
      @view-change="handleViewChange"/>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue';
import { Temporal } from '@js-temporal/polyfill';
import { useI18n } from 'vue-i18n';
import { useLocale } from 'vuetify';
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
import { createSwipeTransitionController } from './composables/useSwipeTransition.js';
import { createPinchToZoomController } from './composables/usePinchToZoom.js';
import { useDragAndDrop } from './composables/useDragAndDrop.js';

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

defineOptions({ name: 'Calendar' });

const { t, locale: i18nLocale } = useI18n();
const { current: vuetifyLocale } = useLocale();

// Reactive data sources from calendar app
const events = computed(() => props.calendarApp.visibleEvents.value);
const calendars = computed(() => props.calendarApp.calendarsService.getAll());
const calendarLocale = computed(() => props.calendarApp.locale.value);
const modalsEnabled = computed(() => props.calendarApp.enableModals?.value ?? true);
const mobileSidebarEnabled = computed(() => props.calendarApp.enableMobileSidebar?.value ?? true);
const dragAndDropEnabled = computed(() => props.calendarApp.enableDragAndDrop?.value ?? false);

const mobileViewSelectorPlacement = computed(() => {
  const placement = props.calendarApp?.mobileViewSelectorPlacement?.value;
  return placement === 'header' ? 'header' : 'sidebar';
});

const swipeGesturesEnabled = computed(() => props.calendarApp.enableSwipeGestures?.value ?? true);
const pinchToZoomEnabled = computed(() => props.calendarApp.enablePinchToZoom?.value ?? true);
const currentTimeIndicatorEnabled = computed(() => props.calendarApp.enableCurrentTimeIndicator?.value ?? true);

// Computed to get visible calendar IDs
const visibleCalendarIds = computed(() => 
  props.calendarApp.calendarsService.getVisible().map(c => c.id)
);

const views = ['day', 'week', 'month'];

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
const swipeDeck = ref(null);
const swipeDeltaX = ref(0);
const swipeIsPanning = ref(false);
const swipeIsAnimating = ref(false);

let swipeScrollTopPx = 0;
let shouldRestoreSwipeScrollTop = false;
const swipeBlockedByPinch = ref(false);
let pinchSwipeBlockTimeoutId = null;

let timeIntervalId = null;
let mobileMediaQuery = null;
let swipeAnimationTimeoutId = null;
let swipeWidthPx = 0;

const localeCodeMap = {
  'en-US': 'en',
  'pt-PT': 'pt'
};

const newEvent = ref(createDefaultEventDraft(calendars.value));

watch(
  () => calendarLocale.value,
  (newLocale) => {
    const mappedLocale = localeCodeMap[newLocale] || 'en';
    i18nLocale.value = mappedLocale;
    vuetifyLocale.value = mappedLocale;
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

function shiftDateForView(date, view, direction) {
  if (!date) return date;
  if (view === 'month') {
    return direction < 0 ? date.subtract({ months: 1 }) : date.add({ months: 1 });
  }
  if (view === 'week') {
    return direction < 0 ? date.subtract({ weeks: 1 }) : date.add({ weeks: 1 });
  }
  return direction < 0 ? date.subtract({ days: 1 }) : date.add({ days: 1 });
}

const previousDate = computed(() => shiftDateForView(currentDate.value, currentView.value, -1));
const nextDate = computed(() => shiftDateForView(currentDate.value, currentView.value, 1));

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

function buildDisplayEventsFor(view, date) {
  const range = getViewRange(view, date);
  const expanded = [];

  // Add ghost event if it exists
  if (ghostEvent.value) {
    expanded.push(ghostEvent.value);
  }

  for (const e of events.value) {
    if (e && e.rrule) {
      expanded.push(...expandRecurrence(e, range.start, range.end));
    } else {
      expanded.push(e);
    }
  }

  // Events are already filtered by visibleEvents in calendar app
  return expanded;
}

const displayEvents = computed(() => buildDisplayEventsFor(currentView.value, currentDate.value));
const prevDisplayEvents = computed(() => buildDisplayEventsFor(currentView.value, previousDate.value));
const nextDisplayEvents = computed(() => buildDisplayEventsFor(currentView.value, nextDate.value));

const monthDays = computed(() => createMonthGrid(currentDate.value, displayEvents.value));
const prevMonthDays = computed(() => createMonthGrid(previousDate.value, prevDisplayEvents.value));
const nextMonthDays = computed(() => createMonthGrid(nextDate.value, nextDisplayEvents.value));

const weekViewDays = computed(() =>
  createWeekViewDays(currentDate.value, displayEvents.value, calendarLocale.value, t)
);
const prevWeekViewDays = computed(() =>
  createWeekViewDays(previousDate.value, prevDisplayEvents.value, calendarLocale.value, t)
);
const nextWeekViewDays = computed(() =>
  createWeekViewDays(nextDate.value, nextDisplayEvents.value, calendarLocale.value, t)
);

const weekPixelsPerHour = computed(() =>
  getPixelsPerHour('week', isMobile.value)
);

const dayPixelsPerHour = computed(() =>
  getPixelsPerHour('day', isMobile.value)
);

const dayEventSummary = computed(() => summarizeEventsForDate(currentDate.value, displayEvents.value));
const prevDayEventSummary = computed(() => summarizeEventsForDate(previousDate.value, prevDisplayEvents.value));
const nextDayEventSummary = computed(() => summarizeEventsForDate(nextDate.value, nextDisplayEvents.value));
const dayEvents = computed(() => dayEventSummary.value.timedEvents);
const dayAllDayEvents = computed(() => dayEventSummary.value.allDayEvents);
const prevDayEvents = computed(() => prevDayEventSummary.value.timedEvents);
const prevDayAllDayEvents = computed(() => prevDayEventSummary.value.allDayEvents);
const nextDayEvents = computed(() => nextDayEventSummary.value.timedEvents);
const nextDayAllDayEvents = computed(() => nextDayEventSummary.value.allDayEvents);

const currentTitle = computed(() =>
  formatCurrentTitle(currentView.value, currentDate.value, calendarLocale.value, isMobile.value)
);

const currentTimePosition = computed(() => {
  const minutesSinceMidnight = currentTime.value.hour * 60 + currentTime.value.minute;
  const pixelsPerHour = currentView.value === 'day' ? dayPixelsPerHour.value : weekPixelsPerHour.value;
  return (minutesSinceMidnight / 60) * pixelsPerHour;
});

const showCurrentTimeIndicator = computed(() =>
  currentTimeIndicatorEnabled.value && shouldDisplayCurrentTimeIndicator(currentView.value, currentDate.value)
);

const prevShowCurrentTimeIndicator = computed(() =>
  currentTimeIndicatorEnabled.value && shouldDisplayCurrentTimeIndicator(currentView.value, previousDate.value)
);

const nextShowCurrentTimeIndicator = computed(() =>
  currentTimeIndicatorEnabled.value && shouldDisplayCurrentTimeIndicator(currentView.value, nextDate.value)
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

function clearPinchSwipeBlockTimeout() {
  if (pinchSwipeBlockTimeoutId) {
    clearTimeout(pinchSwipeBlockTimeoutId);
    pinchSwipeBlockTimeoutId = null;
  }
}

function setSwipeBlockedByPinchFor(ms) {
  clearPinchSwipeBlockTimeout();
  swipeBlockedByPinch.value = true;
  pinchSwipeBlockTimeoutId = setTimeout(() => {
    pinchSwipeBlockTimeoutId = null;
    swipeBlockedByPinch.value = false;
  }, ms);
}

const swipeDeckEnabled = computed(() => isMobile.value && swipeGesturesEnabled.value && !showMobileSidebar.value);
const swipeTransitionEnabled = computed(() => {
  return swipeDeckEnabled.value && !showModal.value && !showEventDetail.value && !showDeleteConfirm.value && !swipeBlockedByPinch.value && !pinchIsZooming.value;
});
const swipeRenderNeighbors = computed(() => swipeDeckEnabled.value && (swipeIsPanning.value || swipeIsAnimating.value));

function getSwipePaneBody(paneClass) {
  const root = swipeDeck.value;
  if (!root || typeof root.querySelector !== 'function') return null;
  return root.querySelector(`.swipe-pane.${paneClass} .calendar-body`);
}

function syncSwipePaneScrollTops(scrollTop) {
  const prevBody = getSwipePaneBody('is-prev');
  const nextBody = getSwipePaneBody('is-next');
  if (prevBody && Math.abs(prevBody.scrollTop - scrollTop) > 1) prevBody.scrollTop = scrollTop;
  if (nextBody && Math.abs(nextBody.scrollTop - scrollTop) > 1) nextBody.scrollTop = scrollTop;
}

async function captureAndSyncSwipeScrollTop() {
  await nextTick();
  const currentBody = getSwipePaneBody('is-current');
  if (!currentBody) return;
  swipeScrollTopPx = currentBody.scrollTop;
  syncSwipePaneScrollTops(swipeScrollTopPx);
}

async function restoreCurrentPaneScrollTopAfterNavigation() {
  if (!shouldRestoreSwipeScrollTop) return;
  shouldRestoreSwipeScrollTop = false;
  await nextTick();
  const currentBody = getSwipePaneBody('is-current');
  if (!currentBody) return;
  currentBody.scrollTop = swipeScrollTopPx;
}

function getSwipeWidth() {
  const measured = swipeDeck.value?.getBoundingClientRect?.().width;
  if (Number.isFinite(measured) && measured > 0) return measured;
  return Number.isFinite(window?.innerWidth) ? window.innerWidth : 0;
}

function clearSwipeAnimationTimeout() {
  if (swipeAnimationTimeoutId) {
    clearTimeout(swipeAnimationTimeoutId);
    swipeAnimationTimeoutId = null;
  }
}

function animateSwipeTo(targetDeltaX, { onComplete } = {}) {
  clearSwipeAnimationTimeout();
  swipeIsAnimating.value = true;
  swipeDeltaX.value = targetDeltaX;
  swipeAnimationTimeoutId = setTimeout(() => {
    swipeAnimationTimeoutId = null;
    swipeIsAnimating.value = false;
    onComplete?.();
  }, 220);
}

function handleSwipePanStart() {
  if (!swipeTransitionEnabled.value) return;
  clearSwipeAnimationTimeout();
  swipeIsPanning.value = true;
  swipeIsAnimating.value = false;
  swipeWidthPx = getSwipeWidth();
  captureAndSyncSwipeScrollTop();
}

function handleSwipePanMove(event) {
  if (!swipeTransitionEnabled.value) return;
  const width = swipeWidthPx || getSwipeWidth();
  if (!Number.isFinite(width) || width <= 0) return;
  const rawDx = Number(event?.deltaX ?? 0);
  const clampedDx = Math.max(-width, Math.min(width, rawDx));
  swipeDeltaX.value = clampedDx;

  const currentBody = getSwipePaneBody('is-current');
  if (currentBody) {
    swipeScrollTopPx = currentBody.scrollTop;
    syncSwipePaneScrollTops(swipeScrollTopPx);
  }
}

function handleSwipePanEnd(event) {
  if (!swipeTransitionEnabled.value) {
    swipeIsPanning.value = false;
    swipeDeltaX.value = 0;
    return;
  }

  const width = swipeWidthPx || getSwipeWidth();
  if (!Number.isFinite(width) || width <= 0) {
    swipeIsPanning.value = false;
    swipeDeltaX.value = 0;
    return;
  }

  const velocityX = Number(event?.velocityX ?? event?.overallVelocityX ?? event?.velocity ?? 0);
  const dx = swipeDeltaX.value;
  const shouldNavigate = Math.abs(dx) > width * 0.22 || Math.abs(velocityX) > 0.35;

  if (shouldNavigate) {
    const direction = dx < 0 ? 'next' : 'previous';
    const target = direction === 'next' ? -width : width;
    animateSwipeTo(target, {
      onComplete: () => {
        // Disable transition before resetting the deck back to center.
        // Vue will batch state updates so we don't show an intermediate "double-next" frame.
        if (direction === 'next') {
          nextPeriod();
        } else {
          previousPeriod();
        }

        shouldRestoreSwipeScrollTop = true;
        restoreCurrentPaneScrollTopAfterNavigation();
        swipeIsPanning.value = false;
        swipeDeltaX.value = 0;
      }
    });
    return;
  }

  // Snap back
  animateSwipeTo(0, {
    onComplete: () => {
      swipeIsPanning.value = false;
      swipeDeltaX.value = 0;
    }
  });
}

const swipeTrackStyle = computed(() => {
  const baseOffset = swipeRenderNeighbors.value ? '-33.333333%' : '0%';
  const dx = `${swipeDeltaX.value}px`;
  return {
    transform: `translate3d(calc(${baseOffset} + ${dx}), 0, 0)`,
    transition: swipeIsAnimating.value ? 'transform 220ms cubic-bezier(0.2, 0, 0, 1)' : 'none'
  };
});


// Pinch-to-zoom functionality
const {
  destroyPinchGestures,
  schedulePinchInitialization,
  isZooming: pinchIsZooming,
  getPixelsPerHour,
  getZoomRange
} = createPinchToZoomController('.swipe-pane.is-current .calendar-body', {
  onZoomChange: () => {
  }
  ,
  onPinchStart: () => {
    // Immediately disable swipe while pinching.
    clearPinchSwipeBlockTimeout();
    swipeBlockedByPinch.value = true;
  },
  onPinchEnd: () => {
    // After pinch, users often lift fingers asynchronously (2 -> 1 pointer).
    // Keep swipe disabled briefly to avoid accidental horizontal navigation.
    setSwipeBlockedByPinchFor(250);
  }
});

const { destroySwipeTransitionGestures, scheduleSwipeTransitionInitialization } = createSwipeTransitionController('.vue-calendarium', {
  isEnabled: () => swipeTransitionEnabled.value,
  onPanStart: handleSwipePanStart,
  onPanMove: handleSwipePanMove,
  onPanEnd: handleSwipePanEnd
});

// Drag and drop functionality
const {
  isDragging,
  draggedEvent,
  dragTransform,
  dropTarget,
  startDrag,
  updateDrag,
  endDrag,
  setDropTarget,
  clearDropTarget
} = useDragAndDrop();

// Update CSS variables when pixels per hour changes
function updateCSSVariables() {
  if (!calendarRoot.value) return;
  
  const weekPx = weekPixelsPerHour.value;
  const dayPx = dayPixelsPerHour.value;
  
  calendarRoot.value.style.setProperty('--calendar-pixels-per-hour-week', `${weekPx}px`);
  calendarRoot.value.style.setProperty('--calendar-pixels-per-hour-day', `${dayPx}px`);
  
  // Mobile values use the same computed values
  calendarRoot.value.style.setProperty('--calendar-pixels-per-hour-week-mobile', `${weekPx}px`);
  calendarRoot.value.style.setProperty('--calendar-pixels-per-hour-day-mobile', `${dayPx}px`);

  // Scale event text with zoom (increases more noticeably on pinch)
  const clampNumber = (v, min, max) => Math.max(min, Math.min(max, v));
  const powScale = (ratio) => Math.pow(ratio, 0.45);
  const weekRange = getZoomRange('week', isMobile.value);
  const dayRange = getZoomRange('day', isMobile.value);
  const weekRatio = weekRange?.default ? weekPx / weekRange.default : 1;
  const dayRatio = dayRange?.default ? dayPx / dayRange.default : 1;
  const weekScale = clampNumber(powScale(weekRatio), 0.90, 1.35);
  const dayScale = clampNumber(powScale(dayRatio), 0.90, 1.35);

  const weekBaseFont = isMobile.value ? 10 : 12;
  const dayBaseFont = isMobile.value ? 12 : 13;

  calendarRoot.value.style.setProperty('--calendar-week-event-font-size', `${(weekBaseFont * weekScale).toFixed(1)}px`);
  calendarRoot.value.style.setProperty('--calendar-week-event-title-font-size', `${(weekBaseFont * weekScale).toFixed(1)}px`);
  calendarRoot.value.style.setProperty('--calendar-day-event-font-size', `${(dayBaseFont * dayScale).toFixed(1)}px`);
  calendarRoot.value.style.setProperty('--calendar-day-event-title-font-size', `${(dayBaseFont * dayScale).toFixed(1)}px`);
}

// Watch for changes in pixelsPerHour and update CSS
watch([weekPixelsPerHour, dayPixelsPerHour], updateCSSVariables);

onMounted(() => {
  initializeMobileDetection();
  updateCurrentTime();

  timeIntervalId = setInterval(updateCurrentTime, 60000);
  if (swipeGesturesEnabled.value) {
    scheduleSwipeTransitionInitialization(isMobile.value);
  }
  if (pinchToZoomEnabled.value) {
    schedulePinchInitialization(isMobile.value, currentView.value);
  }
  
  // Apply theme if provided
  if (props.theme && calendarRoot.value) {
    const mergedTheme = mergeTheme(props.theme);
    applyTheme(calendarRoot.value, mergedTheme);
  }
  
  // Set initial CSS variables for zoom
  updateCSSVariables();
  
  // Add global mouse event listeners for drag and drop
  if (typeof window !== 'undefined') {
    window.addEventListener('mousemove', handleEventDragMove);
    window.addEventListener('mouseup', handleEventDragEnd);
  }
});

onBeforeUnmount(() => {
  teardownMobileDetection();

  if (timeIntervalId) {
    clearInterval(timeIntervalId);
    timeIntervalId = null;
  }

  destroySwipeTransitionGestures();
  destroyPinchGestures();
  clearSwipeAnimationTimeout();
  clearPinchSwipeBlockTimeout();
  
  // Remove global mouse event listeners
  if (typeof window !== 'undefined') {
    window.removeEventListener('mousemove', handleEventDragMove);
    window.removeEventListener('mouseup', handleEventDragEnd);
  }
});

watch([isMobile, swipeGesturesEnabled, pinchToZoomEnabled], ([mobile, swipeEnabled, pinchEnabled]) => {
  if (!mobile) {
    destroySwipeTransitionGestures();
    destroyPinchGestures();
    clearSwipeAnimationTimeout();
    clearPinchSwipeBlockTimeout();
    return;
  }

  if (swipeEnabled) {
    scheduleSwipeTransitionInitialization(mobile);
  } else {
    destroySwipeTransitionGestures();
    clearSwipeAnimationTimeout();
  }

  if (pinchEnabled) {
    schedulePinchInitialization(mobile, currentView.value);
  } else {
    destroyPinchGestures();
  }
});

watch(currentView, (view) => {
  props.calendarApp.callbacks.onViewChange?.(view);
  
  // Re-initialize pinch gestures for the new view
  if (isMobile.value && pinchToZoomEnabled.value) {
    schedulePinchInitialization(isMobile.value, view);
  }
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

// Drag and drop handlers
function handleEventDragStart(event, mouseEvent) {
  if (!dragAndDropEnabled.value) return;
  mouseEvent.preventDefault();
  startDrag(event, mouseEvent);
}

function handleEventDragMove(mouseEvent) {
  if (!dragAndDropEnabled.value || !isDragging.value) return;
  mouseEvent.preventDefault();
  updateDrag(mouseEvent);
}

function handleEventDragEnd() {
  if (!dragAndDropEnabled.value || !isDragging.value) return;
  
  const result = endDrag();
  
  if (result && result.dropTarget) {
    const { event, dropTarget: target } = result;
    
    // Calculate new start and end times
    const originalStart = Temporal.PlainDateTime.from(event.start);
    const originalEnd = event.end ? Temporal.PlainDateTime.from(event.end) : originalStart.add({ hours: 1 });
    const duration = originalEnd.since(originalStart);
    
    // Create new start time with target date and hour
    const targetDate = Temporal.PlainDate.from(target.date);
    const newStart = targetDate.toPlainDateTime({ hour: target.hour, minute: 0 });
    const newEnd = newStart.add(duration);
    
    // Update event
    const updatedEvent = {
      ...event,
      start: newStart.toString(),
      end: newEnd.toString()
    };
    
    // Update in service
    props.calendarApp.eventsService.update(updatedEvent);
    
    // Call callback if provided
    props.calendarApp.callbacks.onEventDrop?.({
      event: updatedEvent,
      originalEvent: event,
      dropTarget: target
    });
    
    // Trigger update callback
    props.calendarApp.callbacks.onEventUpdate?.(updatedEvent);
  }
}

function handleSlotDragOver(date, hour) {
  if (!dragAndDropEnabled.value || !isDragging.value) return;
  setDropTarget({ date, hour });
}

function handleSlotDragLeave() {
  if (!dragAndDropEnabled.value || !isDragging.value) return;
  clearDropTarget();
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
.vue-calendarium {
  --calendar-height-scale: 1;

  /* Use CSS custom properties from theme */
  font-family: var(--calendar-font-family, 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif);
  background: var(--calendar-bg, #ffffff);
  color: var(--calendar-text-primary, #3c4043);
  display: flex;
  flex-direction: column;
  height: 100%;
  position: relative;
  touch-action: pan-x pan-y;
  user-select: none;
  width: 100%;
  overscroll-behavior: contain;
}

.vue-calendarium,
.vue-calendarium :deep(*),
:deep(.calendar-font-scope),
:deep(.calendar-font-scope *) {
  font-family: var(--calendar-font-family, 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif);
}

.swipe-deck {
  flex: 1;
  min-height: 0;
  position: relative;
  overflow: hidden;
}

.swipe-track {
  position: absolute;
  top: 0;
  left: 0;
  display: flex;
  width: 300%;
  height: 100%;
  will-change: transform;
}

.swipe-track.is-single {
  width: 100%;
}

.swipe-pane {
  flex: 0 0 33.333333%;
  height: 100%;
}

.swipe-track.is-single .swipe-pane {
  flex: 0 0 100%;
}


.swipe-pane :deep(.calendar-body) {
  height: 100%;
}

@media (max-width: 768px) {
  .vue-calendarium {
    height: 100%;
  }
}
</style>
