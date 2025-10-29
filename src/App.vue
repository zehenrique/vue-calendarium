<template>
  <v-app>
    <v-app-bar color="white" elevation="1" density="compact">
      <v-app-bar-title>
        <span class="text-h6">📅 Google Calendar Component</span>
      </v-app-bar-title>
      <v-spacer></v-spacer>
      <v-select
        v-model="selectedLocale"
        :items="localeItems"
        item-title="text"
        item-value="value"
        density="compact"
        variant="outlined"
        hide-details
        style="max-width: 180px"
        @update:model-value="changeLocale"
      ></v-select>
    </v-app-bar>
    <v-main>
      <GoogleCalendar
        :events="events"
        :locale="selectedLocale"
        :calendars="calendars"
        initial-view="month"
        @event-click="handleEventClick"
        @date-change="handleDateChange"
        @view-change="handleViewChange"
        @event-create="handleEventCreate"
        @event-delete="handleEventDelete"
      />
    </v-main>
  </v-app>
</template>

<script>
import { Temporal } from '@js-temporal/polyfill';
import GoogleCalendar from './Calendar.vue';

export default {
  name: 'App',
  components: {
    GoogleCalendar
  },
  data() {
    return {
      selectedLocale: 'en-US',
      localeItems: [
        { text: 'English', value: 'en-US' },
        { text: 'Português', value: 'pt-PT' }
      ],
      events: [],
      calendars: [
        { id: 'work', name: 'Work', color: '#1967d2' },
        { id: 'personal', name: 'Personal', color: '#137333' },
        { id: 'family', name: 'Family', color: '#d93025' }
      ]
    };
  },
  created() {
    this.generateSampleEvents();
  },
  methods: {
    generateSampleEvents() {
      const now = Temporal.Now.plainDateISO();
      const today = Temporal.PlainDateTime.from({
        year: now.year,
        month: now.month,
        day: now.day,
        hour: 10,
        minute: 0
      });

      this.events = [
        {
          id: '1',
          title: 'Team Meeting',
          start: today.toString(),
          end: today.add({ hours: 1 }).toString(),
          color: '#1967d2'
        },
        {
          id: '2',
          title: 'Lunch Break',
          start: today.add({ hours: 2 }).toString(),
          end: today.add({ hours: 3 }).toString(),
          color: '#137333'
        },
        {
          id: '3',
          title: 'Project Review',
          start: today.add({ hours: 4 }).toString(),
          end: today.add({ hours: 5, minutes: 30 }).toString(),
          color: '#d93025'
        },
        {
          id: '4',
          title: 'Design Discussion',
          start: today.add({ days: 1, hours: 1 }).toString(),
          end: today.add({ days: 1, hours: 2 }).toString(),
          color: '#f9ab00'
        },
        {
          id: '5',
          title: 'Code Review',
          start: today.add({ days: 2, hours: 3 }).toString(),
          end: today.add({ days: 2, hours: 4 }).toString(),
          color: '#1967d2'
        },
        {
          id: '6',
          title: 'Sprint Planning',
          start: today.add({ days: 3 }).toString(),
          end: today.add({ days: 3, hours: 2 }).toString(),
          color: '#d93025'
        },
        {
          id: '7',
          title: 'Client Presentation',
          start: today.add({ days: 5, hours: 2 }).toString(),
          end: today.add({ days: 5, hours: 3 }).toString(),
          color: '#137333'
        },
        {
          id: '8',
          title: 'Team Building',
          start: today.subtract({ days: 2 }).add({ hours: 5 }).toString(),
          end: today.subtract({ days: 2 }).add({ hours: 7 }).toString(),
          color: '#f9ab00'
        },
        {
          id: '9',
          title: 'Conference',
          start: today.add({ days: 7 }).toString(),
          allDay: true,
          color: '#1967d2'
        },
        {
          id: '10',
          title: 'Workshop',
          start: today.subtract({ days: 5 }).add({ hours: 3 }).toString(),
          end: today.subtract({ days: 5 }).add({ hours: 5 }).toString(),
          color: '#137333'
        }
      ];
    },
    changeLocale() {
      const localeMap = {
        'en-US': 'en',
        'pt-PT': 'pt'
      };
      this.$i18n.locale = localeMap[this.selectedLocale] || 'en';
    },
    handleEventClick(event) {
      console.log('Event clicked:', event);
    },
    handleDateChange(date) {
      console.log('Date changed:', date.toString());
    },
    handleViewChange(view) {
      console.log('View changed:', view);
    },
    handleEventCreate(newEvents) {
      console.log('Events created:', newEvents);
      
      // Handle both creation and updates
      newEvents.forEach(newEvent => {
        const existingIndex = this.events.findIndex(e => e.id === newEvent.id);
        if (existingIndex !== -1) {
          // Update existing event
          this.events[existingIndex] = newEvent;
        } else {
          // Add new event
          this.events.push(newEvent);
        }
      });
    },
    handleEventDelete(event) {
      console.log('Event deleted:', event);
      // Remove the event and all its recurring instances
      this.events = this.events.filter(e => {
        // Remove the exact event or any recurring instance (has same base ID)
        const baseId = e.id.split('-')[0];
        const eventBaseId = event.id.split('-')[0];
        return baseId !== eventBaseId;
      });
    }
  }
};
</script>

<style scoped>
/* Vuetify handles most styling */
</style>
