<template>
  <div class="demo-header">
    <h1>📅 Google Calendar Component</h1>
    <div class="demo-controls">
      <label>
        Language:
        <select v-model="selectedLocale" @change="changeLocale">
          <option value="en-US">English</option>
          <option value="es-ES">Español</option>
          <option value="fr-FR">Français</option>
          <option value="de-DE">Deutsch</option>
          <option value="pt-BR">Português</option>
          <option value="ja-JP">日本語</option>
          <option value="zh-CN">中文</option>
        </select>
      </label>
    </div>
  </div>
  <div class="calendar-container">
    <GoogleCalendar
      :events="events"
      :locale="selectedLocale"
      initial-view="month"
      @event-click="handleEventClick"
      @date-change="handleDateChange"
      @view-change="handleViewChange"
    />
  </div>
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
      events: []
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
          color: 'blue'
        },
        {
          id: '2',
          title: 'Lunch Break',
          start: today.add({ hours: 2 }).toString(),
          end: today.add({ hours: 3 }).toString(),
          color: 'green'
        },
        {
          id: '3',
          title: 'Project Review',
          start: today.add({ hours: 4 }).toString(),
          end: today.add({ hours: 5, minutes: 30 }).toString(),
          color: 'red'
        },
        {
          id: '4',
          title: 'Design Discussion',
          start: today.add({ days: 1, hours: 1 }).toString(),
          end: today.add({ days: 1, hours: 2 }).toString(),
          color: 'yellow'
        },
        {
          id: '5',
          title: 'Code Review',
          start: today.add({ days: 2, hours: 3 }).toString(),
          end: today.add({ days: 2, hours: 4 }).toString(),
          color: 'blue'
        },
        {
          id: '6',
          title: 'Sprint Planning',
          start: today.add({ days: 3 }).toString(),
          end: today.add({ days: 3, hours: 2 }).toString(),
          color: 'red'
        },
        {
          id: '7',
          title: 'Client Presentation',
          start: today.add({ days: 5, hours: 2 }).toString(),
          end: today.add({ days: 5, hours: 3 }).toString(),
          color: 'green'
        },
        {
          id: '8',
          title: 'Team Building',
          start: today.subtract({ days: 2 }).add({ hours: 5 }).toString(),
          end: today.subtract({ days: 2 }).add({ hours: 7 }).toString(),
          color: 'yellow'
        },
        {
          id: '9',
          title: 'Conference',
          start: today.add({ days: 7 }).toString(),
          allDay: true,
          color: 'blue'
        },
        {
          id: '10',
          title: 'Workshop',
          start: today.subtract({ days: 5 }).add({ hours: 3 }).toString(),
          end: today.subtract({ days: 5 }).add({ hours: 5 }).toString(),
          color: 'green'
        }
      ];
    },
    changeLocale() {
      const localeMap = {
        'en-US': 'en',
        'es-ES': 'es',
        'fr-FR': 'fr',
        'de-DE': 'de',
        'pt-BR': 'pt',
        'ja-JP': 'ja',
        'zh-CN': 'zh'
      };
      this.$i18n.locale = localeMap[this.selectedLocale] || 'en';
    },
    handleEventClick(event) {
      console.log('Event clicked:', event);
      alert(`Event: ${event.title}\nTime: ${event.start}`);
    },
    handleDateChange(date) {
      console.log('Date changed:', date.toString());
    },
    handleViewChange(view) {
      console.log('View changed:', view);
    }
  }
};
</script>

<style scoped>
.demo-header {
  background: white;
  padding: 16px 24px;
  border-bottom: 1px solid #dadce0;
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.demo-header h1 {
  font-size: 24px;
  color: #3c4043;
  font-weight: 400;
}

.demo-controls {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-left: auto;
  flex-wrap: wrap;
}

.demo-controls label {
  font-size: 14px;
  color: #5f6368;
  display: flex;
  align-items: center;
  gap: 8px;
}

.demo-controls select {
  padding: 6px 12px;
  border: 1px solid #dadce0;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
}

.calendar-container {
  flex: 1;
  overflow: hidden;
  background: white;
  height: calc(100vh - 65px);
}

@media (max-width: 768px) {
  .demo-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .demo-controls {
    margin-left: 0;
    width: 100%;
  }
}
</style>
