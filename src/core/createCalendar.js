import { ref, computed } from 'vue';
import { createEventsService } from '../services/EventsService.js';
import { createCalendarsService } from '../services/CalendarsService.js';
import { Temporal } from '@js-temporal/polyfill';

/**
 * Create a calendar instance
 * 
 * @param {Object} config - Calendar configuration
 * @param {Array} config.views - Array of view objects (from createViewDay, createViewWeek, createViewMonth)
 * @param {String} config.defaultView - Default view name ('day', 'week', or 'month')
 * @param {Array} config.events - Initial events array
 * @param {Array} config.calendars - Initial calendars array
 * @param {String} config.locale - Locale for internationalization ('en-US', 'pt-PT')
 * @param {Object} config.selectedDate - Initial selected date (Temporal.PlainDate)
 * @param {Boolean} config.enableModals - Enable/disable modals
 * @param {Function} config.onEventClick - Callback when event is clicked
 * @param {Function} config.onDateChange - Callback when date changes
 * @param {Function} config.onViewChange - Callback when view changes
 * @param {Function} config.onEventCreate - Callback when event is created
 * @param {Function} config.onEventUpdate - Callback when event is updated
 * @param {Function} config.onEventDelete - Callback when event is deleted
 * @param {Function} config.onEventCreateRequest - Callback when event create is requested (modals disabled)
 * 
 * @returns {Object} Calendar instance with methods and services
 * @returns {Function} .showGhostEvent - Show a ghost event (preview) on the calendar
 * @returns {Function} .updateGhostEvent - Update the currently displayed ghost event
 * @returns {Function} .hideGhostEvent - Hide the currently displayed ghost event
 * @returns {Object} .ghostEvent - Computed property containing current ghost event or null
 */
export function createCalendar(config = {}) {
  // Helper to get current date (respects test mode)
  const _getCurrentDate = () => {
    if (typeof window !== 'undefined' && window.__CALENDAR_TEST_NOW__) {
      // Parse test date string to Temporal.PlainDateTime then convert to PlainDate
      const testDateTime = Temporal.PlainDateTime.from(window.__CALENDAR_TEST_NOW__);
      return testDateTime.toPlainDate();
    }
    return Temporal.Now.plainDateISO();
  };

  // Extract configuration
  const {
    views = [],
    defaultView = 'month',
    events = [],
    calendars = [],
    locale = 'en-US',
    selectedDate,
    enableModals = true,
    onEventClick,
    onDateChange,
    onViewChange,
    onEventCreate,
    onEventUpdate,
    onEventDelete,
    onEventCreateRequest
  } = config;

  // Validate views
  if (views.length === 0) {
    throw new Error('At least one view must be provided. Use createViewDay(), createViewWeek(), or createViewMonth()');
  }

  // Create services
  const eventsService = createEventsService(events);
  const calendarsService = createCalendarsService(calendars);

  // Reactive state
  const currentView = ref(defaultView);
  const currentDate = ref(selectedDate !== undefined ? selectedDate : _getCurrentDate());
  const modalsEnabled = ref(enableModals);
  const currentLocale = ref(locale);

  // Available views
  const availableViews = ref(views);

  // Ghost event state (for external control)
  const ghostEvent = ref(null);

  // Computed properties
  const visibleEvents = computed(() => {
    const visibleCalendarIds = calendarsService.getVisible().map(c => c.id);
    // Directly access the reactive ref array and map to objects
    const allEvents = eventsService._events.value.map(e => e.toObject());
    const filtered = allEvents.filter(e => visibleCalendarIds.includes(e.calendarId));
    return filtered;
  });

  // Methods
  const setView = (viewName) => {
    const view = views.find(v => v.name === viewName);
    if (view) {
      currentView.value = viewName;
    } else {
      console.warn(`View "${viewName}" not found in available views`);
    }
  };

  const setDate = (date) => {
    currentDate.value = date;
  };

  const setLocale = (newLocale) => {
    currentLocale.value = newLocale;
  };

  const goToToday = () => {
    currentDate.value = _getCurrentDate();
  };

  const goToNext = () => {
    switch (currentView.value) {
      case 'day':
        currentDate.value = currentDate.value.add({ days: 1 });
        break;
      case 'week':
        currentDate.value = currentDate.value.add({ weeks: 1 });
        break;
      case 'month':
        currentDate.value = currentDate.value.add({ months: 1 });
        break;
    }
  };

  const goToPrevious = () => {
    switch (currentView.value) {
      case 'day':
        currentDate.value = currentDate.value.subtract({ days: 1 });
        break;
      case 'week':
        currentDate.value = currentDate.value.subtract({ weeks: 1 });
        break;
      case 'month':
        currentDate.value = currentDate.value.subtract({ months: 1 });
        break;
    }
  };

  // Ghost event methods (for external control when modals are disabled)
  const showGhostEvent = (eventData) => {
    ghostEvent.value = {
      ...eventData,
      id: eventData.id || 'ghost-event',
      isGhost: true
    };
  };

  const updateGhostEvent = (eventData) => {
    if (ghostEvent.value) {
      ghostEvent.value = {
        ...ghostEvent.value,
        ...eventData,
        isGhost: true
      };
    }
  };

  const hideGhostEvent = () => {
    ghostEvent.value = null;
  };

  // Return calendar instance
  return {
    // Services
    eventsService,
    calendarsService,

    // State
    currentView: computed(() => currentView.value),
    currentDate: computed(() => currentDate.value),
    locale: computed(() => currentLocale.value),
    enableModals: computed(() => modalsEnabled.value),
    views: computed(() => availableViews.value),
    visibleEvents,
    ghostEvent: computed(() => ghostEvent.value),

    // Methods
    setView,
    setDate,
    setLocale,
    goToToday,
    goToNext,
    goToPrevious,
    showGhostEvent,
    updateGhostEvent,
    hideGhostEvent,

    // Callbacks
    callbacks: {
      onEventClick,
      onDateChange,
      onViewChange,
      onEventCreate,
      onEventUpdate,
      onEventDelete,
      onEventCreateRequest
    },

    // Internal refs (for component binding)
    _refs: {
      currentView,
      currentDate,
      currentLocale,
      modalsEnabled,
      ghostEvent
    }
  };
}

export default createCalendar;
