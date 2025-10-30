<template>
  <v-dialog
    :model-value="modelValue && !!event"
    @update:model-value="handleClose"
    max-width="500"
    data-testid="event-detail-modal"
  >
    <v-card v-if="event" class="pa-0">
      <!-- Color bar -->
      <div class="color-bar" :style="{ backgroundColor: event?.color || '#1967d2' }"></div>

      <v-card-title class="d-flex align-center px-6 pt-6 pb-4">
        <span class="text-h6 font-weight-medium">{{ event?.title }}</span>
        <v-spacer></v-spacer>
        <v-btn
          icon
          variant="text"
          size="small"
          @click="handleClose"
          :aria-label="t('close')"
          class="text-medium-emphasis"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text class="px-6 pb-6">
        <!-- Event details -->
        <v-list density="comfortable" class="pa-0">
          <v-list-item class="px-0">
            <template v-slot:prepend>
              <v-icon color="primary" class="mr-3">mdi-clock-outline</v-icon>
            </template>
            <div>
              <div class="text-body-1">{{ timeRange }}</div>
              <div v-if="event?.rrule && event.rrule !== ''" class="text-body-2 text-medium-emphasis">
                {{ formatRRule(event.rrule) }}
              </div>
            </div>
          </v-list-item>

          <v-list-item v-if="calendarName" class="px-0">
            <template v-slot:prepend>
              <v-icon color="primary" class="mr-3">mdi-calendar</v-icon>
            </template>
            <v-list-item-title class="text-body-1">{{ calendarName }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-card-text>

      <v-card-actions class="px-6 pb-6 pt-0">
        <v-spacer></v-spacer>
        <v-btn
          variant="text"
          color="error"
          @click="handleDelete"
          class="mr-2"
        >
          {{ t('delete') }}
        </v-btn>
        <v-btn
          color="primary"
          variant="flat"
          @click="handleEdit"
        >
          {{ t('edit') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { Temporal } from '@js-temporal/polyfill';
import { useRRuleFormatter } from '../composables/useRRuleFormatter.js';

export default {
  name: 'EventDetailModal',
  props: {
    modelValue: {
      type: Boolean,
      required: true
    },
    event: {
      type: Object,
      default: null
    },
    calendars: {
      type: Array,
      default: () => []
    },
    locale: {
      type: String,
      default: 'en-US'
    }
  },
  emits: ['update:modelValue', 'edit', 'delete'],
  setup(props, { emit }) {
    const { t } = useI18n();
    const { formatRRule } = useRRuleFormatter();

    const timeRange = computed(() => {
      if (!props.event) return '';
      if (props.event.allDay) return t('allDay');
      
      const start = Temporal.PlainDateTime.from(props.event.start);
      const end = props.event.end ? Temporal.PlainDateTime.from(props.event.end) : start.add({ hours: 1 });
      
      const startStr = start.toLocaleString(props.locale, {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
      
      const endStr = end.toLocaleString(props.locale, {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
      
      const dateStr = start.toLocaleString(props.locale, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      
      return `${dateStr}, ${startStr} – ${endStr}`;
    });

    const calendarName = computed(() => {
      if (!props.event?.calendar) return '';
      const calendar = props.calendars.find(c => c.id === props.event.calendar);
      return calendar ? calendar.name : props.event.calendar;
    });

    const handleClose = () => {
      emit('update:modelValue', false);
    };

    const handleEdit = () => {
      emit('edit', props.event);
    };

    const handleDelete = () => {
      emit('delete', props.event);
    };

    return {
      t,
      formatRRule,
      timeRange,
      calendarName,
      handleClose,
      handleEdit,
      handleDelete
    };
  }
};
</script>

<style scoped>
.color-bar {
  height: 6px;
  width: 100%;
  border-radius: 3px 3px 0 0;
}
</style>
