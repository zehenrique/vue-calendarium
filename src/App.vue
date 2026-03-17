<template>
  <v-app>
    <v-main>
      <Calendar :calendar-app="calendarApp" />
    </v-main>
  </v-app>
</template>

<script setup>
import { onMounted } from 'vue';
import { Temporal } from '@js-temporal/polyfill';
import { useI18n } from 'vue-i18n';
import { createCalendar } from './core/createCalendar.js';
import { createViewDay, createViewWeek, createViewMonth } from './core/views.js';
import Calendar from './Calendar.vue';

const { locale } = useI18n();

// Helper to get current date (respects test mode)
function getCurrentDate() {
  if (typeof window !== 'undefined' && window.__CALENDAR_TEST_NOW__) {
    // Parse test date string to Temporal.PlainDateTime then convert to PlainDate
    const testDateTime = Temporal.PlainDateTime.from(window.__CALENDAR_TEST_NOW__);
    return testDateTime.toPlainDate();
  }
  return Temporal.Now.plainDateISO();
}

// Check URL parameters for TEST configuration
const urlParams = new URLSearchParams(window.location.search);
const modalsParam = urlParams.get('modals');
const enableModalsFromUrl = modalsParam !== 'off';

const viewSelectorParam = urlParams.get('viewSelector');
const mobileViewSelectorPlacementFromUrl = viewSelectorParam === 'header' ? 'header' : 'sidebar';

// Generate sample events
function generateSampleEvents() {
  const now = getCurrentDate();
  const today = Temporal.PlainDateTime.from({
    year: now.year,
    month: now.month,
    day: now.day,
    hour: 10,
    minute: 0
  });

  return [
    {
      id: '1',
      title: 'Team Meeting',
      start: today.toString(),
      end: today.add({ hours: 1 }).toString(),
      calendarId: 'work',
      color: '#1967D2' // Cobalt
    },
    {
      id: '2',
      title: 'Lunch Break',
      start: today.add({ hours: 2 }).toString(),
      end: today.add({ hours: 3 }).toString(),
      calendarId: 'personal',
      color: '#0B8043' // Basil
    },
    {
      id: '3',
      title: 'Project Review',
      start: today.add({ hours: 4 }).toString(),
      end: today.add({ hours: 5, minutes: 30 }).toString(),
      calendarId: 'family',
      color: '#D50000' // Tomato
    },
    {
      id: '4',
      title: 'Design Discussion',
      start: today.add({ days: 1, hours: 1 }).toString(),
      end: today.add({ days: 1, hours: 2 }).toString(),
      calendarId: 'work',
      color: '#F6BF26' // Banana
    },
    {
      id: '5',
      title: 'Code Review',
      start: today.add({ days: 2, hours: 3 }).toString(),
      end: today.add({ days: 2, hours: 4 }).toString(),
      calendarId: 'work',
      color: '#1967D2' // Cobalt
    },
    {
      id: '6',
      title: 'Sprint Planning',
      start: today.add({ days: 3 }).toString(),
      end: today.add({ days: 3, hours: 2 }).toString(),
      calendarId: 'family',
      color: '#D50000' // Tomato
    },
    {
      id: '7',
      title: 'Client Presentation',
      start: today.add({ days: 5, hours: 2 }).toString(),
      end: today.add({ days: 5, hours: 3 }).toString(),
      calendarId: 'personal',
      color: '#0B8043' // Basil
    },
    {
      id: '8',
      title: 'Team Building',
      start: today.subtract({ days: 2 }).add({ hours: 5 }).toString(),
      end: today.subtract({ days: 2 }).add({ hours: 7 }).toString(),
      calendarId: 'work',
      color: '#F6BF26' // Banana
    },
    {
      id: '9',
      title: 'Conference',
      start: today.add({ days: 7 }).toString(),
      allDay: true,
      calendarId: 'work',
      color: '#1967D2' // Cobalt
    },
    {
      id: '9a',
      title: 'All-Day Meeting',
      start: today.add({ days: 2 }).toString(),
      allDay: true,
      calendarId: 'family',
      color: '#D50000' // Tomato
    },
    {
      id: '10',
      title: 'Workshop',
      start: today.subtract({ days: 5 }).add({ hours: 3 }).toString(),
      end: today.subtract({ days: 5 }).add({ hours: 5 }).toString(),
      calendarId: 'personal',
      color: '#0B8043' // Basil
    },
    {
      id: '11',
      title: 'Weekly Standup (Recurring)',
      start: today.toString(),
      end: today.add({ hours: 0, minutes: 30 }).toString(),
      calendarId: 'work',
      color: '#E67C73', // Flamingo
      rrule: 'FREQ=WEEKLY;COUNT=6'
    },
    // Overlapping events for testing layout
    {
      id: '12',
      title: 'Client Call',
      start: today.add({ hours: 6 }).toString(),
      end: today.add({ hours: 7 }).toString(),
      calendarId: 'work',
      color: '#1967D2' // Cobalt
    },
    {
      id: '13',
      title: 'Team Sync',
      start: today.add({ hours: 6, minutes: 15 }).toString(),
      end: today.add({ hours: 6, minutes: 45 }).toString(),
      calendarId: 'work',
      color: '#F6BF26' // Banana
    },
    {
      id: '14',
      title: 'Training Session',
      start: today.add({ hours: 6, minutes: 30 }).toString(),
      end: today.add({ hours: 7, minutes: 30 }).toString(),
      calendarId: 'personal',
      color: '#0B8043' // Basil
    }
  ];
}

// Create calendar instance
const calendarApp = createCalendar({
  // Define which views are available
  views: [
    createViewDay(),
    createViewWeek(),
    createViewMonth()
  ],
  
  // Set default view
  defaultView: 'month',
  
  // Initial events
  events: generateSampleEvents(),
  
  // Calendar categories
  calendars: [
    { id: 'work', name: 'Work', color: '#1967D2' }, // Cobalt
    { id: 'personal', name: 'Personal', color: '#0B8043' }, // Basil
    { id: 'family', name: 'Family', color: '#D50000' } // Tomato
  ],
  
  // Locale
  locale: 'en-US',
  
  // Enable modals
  enableModals: enableModalsFromUrl,

  // Mobile view selector placement (can be changed via ?viewSelector=header|sidebar URL parameter)
  mobileViewSelectorPlacement: mobileViewSelectorPlacementFromUrl,

  // Mobile interaction toggles
  enableSwipeGestures: true,
  enablePinchToZoom: true,
  enableCurrentTimeIndicator: true,

  // Enable drag and drop
  enableDragAndDrop: true,
  
  // Callbacks for when modals are disabled
  onEventCreateRequest: (eventData) => {
    console.log('Event create request:', eventData);
  }
});

// Set i18n locale
onMounted(() => {
  const localeMap = {
    'en-US': 'en',
    'pt-PT': 'pt'
  };
  locale.value = localeMap[calendarApp.locale.value] || 'en';
  
  // Expose calendar app for testing
  if (typeof window !== 'undefined') {
    window.calendarApp = calendarApp;
  }
});

// Example: Access events service
console.log('Initial events:', calendarApp.eventsService.getAll());

// Example: Add event programmatically
// calendarApp.eventsService.add({
//   title: 'New Event',
//   start: Temporal.Now.plainDateISO().toString(),
//   end: Temporal.Now.plainDateISO().toString(),
//   calendarId: 'work'
// });

// Example: Update event
// calendarApp.eventsService.update({
//   id: '1',
//   title: 'Updated Team Meeting'
// });

// Example: Remove event
// calendarApp.eventsService.remove('1');

// Example: Calendar controls
// calendarApp.goToNext();
// calendarApp.goToPrevious();
// calendarApp.goToToday();
// calendarApp.setView('week');
</script>

<style>
/* Global font family for Google Calendar look */
* {
  font-family: var(--calendar-font-family, 'Google Sans', 'Roboto', 'Product Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif) !important;
}

/* Ensure Vuetify main container fills height */
.v-application .v-main {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.v-application .v-main__wrap {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}
</style>
