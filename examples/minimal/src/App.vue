<template>
  <v-app>
    <v-main style="height: 100vh">
      <Calendar :calendar-app="calendarApp" />
    </v-main>
  </v-app>
</template>

<script setup>
import { Temporal } from '@js-temporal/polyfill';
import { Calendar, createCalendar, createViewDay, createViewWeek, createViewMonth } from 'vue-calendarium';

const today = Temporal.Now.plainDateISO().toString();

const calendarApp = createCalendar({
  views: [createViewDay(), createViewWeek(), createViewMonth()],
  defaultView: 'week',
  locale: 'en-US',
  calendars: [
    { id: 'work', name: 'Work', color: '#1967D2' },
    { id: 'personal', name: 'Personal', color: '#0B8043' }
  ],
  events: [
    { title: 'Team meeting', start: `${today}T10:00:00`, end: `${today}T10:30:00`, calendarId: 'work', color: '#1967D2' },
    { title: 'Lunch with Sam', start: `${today}T12:30:00`, end: `${today}T13:30:00`, calendarId: 'personal', color: '#0B8043' },
    { title: 'Weekly standup', start: `${today}T09:00:00`, end: `${today}T09:30:00`, calendarId: 'work', color: '#1967D2', rrule: 'FREQ=WEEKLY;COUNT=8' }
  ]
});
</script>
