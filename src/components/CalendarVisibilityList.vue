<template>
  <div class="calendar-visibility-list">
    <!-- The calendars, each with a checkbox to show or hide its events -->
    <v-list-subheader class="px-4 py-2 text-body-small font-weight-medium">{{ t('calendars') }}</v-list-subheader>
    <v-list density="comfortable" bg-color="transparent" class="py-0" data-testid="calendar-list">
      <v-list-item v-for="calendar in calendars" :key="calendar.id" class="px-4 my-1" rounded="lg" :data-testid="`calendar-toggle-${calendar.id}`" @click="toggleCalendar(calendar.id)">
        <template v-slot:prepend>
          <v-checkbox :model-value="isVisible(calendar.id)" :color="calendar.color" density="compact" hide-details class="calendar-checkbox" :aria-label="calendar.name" @click.stop="toggleCalendar(calendar.id)"></v-checkbox>
        </template>
        <template v-slot:default>
          <div class="d-flex align-center">
            <v-avatar :color="calendar.color" size="12" class="mr-3"></v-avatar>
            <v-list-item-title class="text-body-medium">{{ calendar.name }}</v-list-item-title>
          </div>
        </template>
      </v-list-item>
    </v-list>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n';

defineOptions({ name: 'CalendarVisibilityList' });

const props = defineProps({
  calendars: { type: Array, default: () => [] },
  // Ids of the calendars whose events are shown
  visibleCalendars: { type: Array, default: () => [] }
});

const emit = defineEmits(['update:visibleCalendars']);

const { t } = useI18n();

const isVisible = (calendarId) => props.visibleCalendars.includes(calendarId);

function toggleCalendar(calendarId) {
  emit('update:visibleCalendars', isVisible(calendarId)
    ? props.visibleCalendars.filter(id => id !== calendarId)
    : [...props.visibleCalendars, calendarId]);
}
</script>

<style scoped>
.calendar-checkbox {
  margin-right: 8px;
}

.calendar-checkbox :deep(.v-selection-control) {
  min-height: 32px;
}

.v-list-item {
  transition: background-color 0.2s;
}

.v-list-item:hover {
  background-color: rgba(0, 0, 0, 0.04);
}

.v-list-subheader {
  color: rgba(0, 0, 0, 0.6);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
</style>
