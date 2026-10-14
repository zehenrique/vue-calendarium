<template>
  <v-menu v-model="isOpen" location="bottom" :close-on-content-click="false" content-class="calendar-font-scope">
    <template #activator="{ props: menuProps }">
      <button type="button" class="more-events" v-bind="menuProps" :aria-label="t('moreEvents', { count: hiddenCount })" data-testid="more-events" @click.stop>+{{ hiddenCount }}</button>
    </template>

    <v-card class="more-events-card" min-width="220" max-width="300" data-testid="more-events-menu">
      <div class="more-events-date">{{ dateLabel }}</div>
      <div class="more-events-list">
        <button v-for="event in events" :key="event.id" type="button" class="more-events-item" :style="getEventColorStyle(event.color, isEventPast(event))" @click="selectEvent(event)">
          <span class="more-events-time">{{ formatEventTime(event, locale, t('allDay')) }}</span>
          <span class="more-events-title">{{ event.title || t('untitled') }}</span>
        </button>
      </div>
    </v-card>
  </v-menu>
</template>

<script setup>
import { computed, ref } from 'vue';
import { Temporal } from '@js-temporal/polyfill';
import { formatEventTime, getEventColorStyle, isEventPast } from '../../composables/useCalendarUtils.js';

/**
 * The "+N" button of a month view day, with a popover listing all of that day's events.
 */
const props = defineProps({
  date: {
    type: Object,
    required: true
  },
  events: {
    type: Array,
    default: () => []
  },
  hiddenCount: {
    type: Number,
    required: true
  },
  locale: {
    type: String,
    default: 'en-US'
  },
  t: {
    type: Function,
    required: true
  }
});

const emit = defineEmits(['event-select']);

const isOpen = ref(false);

const dateLabel = computed(() =>
  Temporal.PlainDate.from(props.date).toLocaleString(props.locale, { weekday: 'long', day: 'numeric', month: 'long' })
);

function selectEvent(event) {
  isOpen.value = false;
  emit('event-select', event);
}
</script>

<style scoped>
.more-events {
  font-size: var(--calendar-event-font-size, 11px);
  color: var(--calendar-text-disabled, #5f6368);
  padding: var(--calendar-event-padding, 2px 6px);
  background: none;
  border: none;
  cursor: pointer;
  text-align: left;
}

.more-events:hover {
  text-decoration: underline;
}

.more-events-card {
  padding: 12px;
}

.more-events-date {
  margin-bottom: 8px;
  font-size: var(--calendar-font-size-base, 14px);
  font-weight: var(--calendar-font-weight-medium, 500);
  color: var(--calendar-text-primary, #3c4043);
}

.more-events-date::first-letter {
  text-transform: uppercase;
}

.more-events-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-height: 320px;
  overflow-y: auto;
}

.more-events-item {
  display: flex;
  gap: 8px;
  width: 100%;
  padding: 4px 8px;
  border: none;
  border-radius: 4px;
  font: inherit;
  font-size: var(--calendar-font-size-small, 12px);
  text-align: left;
  cursor: pointer;
}

.more-events-item:hover {
  filter: brightness(0.95);
}

.more-events-item:focus-visible,
.more-events:focus-visible {
  outline: 2px solid var(--calendar-primary-color, #1a73e8);
  outline-offset: 1px;
}

.more-events-time {
  flex-shrink: 0;
  font-variant-numeric: tabular-nums;
}

.more-events-title {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
