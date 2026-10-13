<template>
  <!-- Google Calendar's sidebar on desktop: a month to move around in, and the calendars to show.
       Closed, it slides out to the left and cannot be reached with the keyboard (inert). -->
  <aside class="desktop-sidebar calendar-font-scope" :class="{ 'is-open': open }" :inert="!open" :aria-label="t('menu')" data-testid="desktop-sidebar">
    <MiniMonth :selected-date="selectedDate" :today="today" :locale="locale" @select="$emit('date-select', $event)"/>
    <CalendarVisibilityList class="mt-4" :calendars="calendars" :visible-calendars="visibleCalendars" @update:visible-calendars="$emit('update:visibleCalendars', $event)"/>
  </aside>
</template>

<script setup>
import { useI18n } from 'vue-i18n';
import MiniMonth from './MiniMonth.vue';
import CalendarVisibilityList from './CalendarVisibilityList.vue';

defineOptions({ name: 'DesktopSidebar' });

defineProps({
  open: { type: Boolean, default: true },
  selectedDate: { type: Object, required: true },
  today: { type: Object, required: true },
  locale: { type: String, default: 'en-US' },
  calendars: { type: Array, default: () => [] },
  visibleCalendars: { type: Array, default: () => [] }
});

defineEmits(['date-select', 'update:visibleCalendars']);

const { t } = useI18n();
</script>

<style scoped>
/* Under the header's top bar, beside the week's day headers and the views, with the header's
   background so the two read as one frame around the calendar */
.desktop-sidebar {
  position: absolute;
  top: var(--calendar-topbar-height, 72px);
  bottom: 0;
  left: 0;
  z-index: calc(var(--calendar-header-z-index, 10) + 1);
  width: var(--calendar-sidebar-width, 256px);
  padding: 8px 0 16px;
  overflow-y: auto;
  background: var(--calendar-header-bg, #f8f9fa);
  transform: translateX(-100%);
  visibility: hidden;
  transition: transform var(--calendar-transition-fast, 0.2s) ease, visibility 0s linear var(--calendar-transition-fast, 0.2s);
}

.desktop-sidebar.is-open {
  transform: none;
  visibility: visible;
  transition: transform var(--calendar-transition-fast, 0.2s) ease, visibility 0s;
}

@media (prefers-reduced-motion: reduce) {
  .desktop-sidebar,
  .desktop-sidebar.is-open {
    transition: none;
  }
}
</style>
