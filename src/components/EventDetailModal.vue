<template>
  <!-- Desktop Dialog -->
  <v-dialog v-if="!mobile" :model-value="modelValue && !!event" @update:model-value="handleClose" max-width="520" content-class="calendar-font-scope" scrim="rgba(0, 0, 0, 0.5)" data-testid="event-detail-modal">
    <v-card v-if="event" class="pa-0 event-detail-card" rounded="xl">
      <!-- Header with action buttons -->
      <v-card-title class="d-flex align-center px-4 py-3 border-b">
        <v-spacer></v-spacer>
        <v-btn icon variant="text" size="small" @click="handleEdit" :aria-label="t('edit')">
          <v-icon>mdi-pencil</v-icon>
        </v-btn>
        <v-btn icon variant="text" size="small" @click="handleDelete" :aria-label="t('delete')">
          <v-icon>mdi-delete</v-icon>
        </v-btn>
        <v-btn icon variant="text" size="small" @click="handleClose" :aria-label="t('close')">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text class="px-6 py-4">
        <!-- Title with color indicator -->
        <div class="d-flex align-start mb-4">
          <div class="color-dot mr-3 mt-1" :style="{ backgroundColor: event?.color || DEFAULT_COLOR }"></div>
          <h2 class="text-h5 font-weight-regular">{{ event?.title }}</h2>
        </div>

        <!-- Date and time -->
        <div class="d-flex align-start mb-2">
          <v-icon class="mr-3 mt-1" size="20">mdi-clock-outline</v-icon>
          <div>
            <div class="text-body-1">{{ dateTimeDisplay }}</div>
            <div v-if="event?.rrule && event.rrule !== ''" class="text-body-2 text-medium-emphasis mt-1">
              {{ formatRRule(event.rrule) }}
            </div>
          </div>
        </div>

        <!-- Calendar name -->
        <div v-if="calendarName" class="d-flex align-start">
          <v-icon class="mr-3 mt-1" size="20">mdi-calendar-blank</v-icon>
          <div class="text-body-1">{{ calendarName }}</div>
        </div>
      </v-card-text>
    </v-card>
  </v-dialog>

  <!-- Mobile Bottom Sheet -->
  <v-bottom-sheet v-if="mobile" :model-value="modelValue && !!event" @update:model-value="handleClose" content-class="calendar-font-scope" scrim="rgba(0, 0, 0, 0.5)" data-testid="event-detail-modal-mobile">
    <v-card v-if="event" class="mobile-detail-sheet" rounded="t-xl">
      <!-- Action buttons at top -->
      <v-card-actions class="pa-4 pb-2">
        <v-btn icon variant="text" size="small" @click="handleEdit" :aria-label="t('edit')">
          <v-icon>mdi-pencil</v-icon>
        </v-btn>
        <v-btn icon variant="text" size="small" @click="handleDelete" :aria-label="t('delete')">
          <v-icon>mdi-delete</v-icon>
        </v-btn>
        <v-spacer></v-spacer>
        <v-btn icon variant="text" size="small" @click="handleClose" :aria-label="t('close')">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-actions>

      <v-divider></v-divider>

      <v-card-text class="px-4 pt-4 pb-6">
        <!-- Title with color indicator -->
        <div class="d-flex align-start mb-4">
          <div class="color-dot mr-3 mt-1" :style="{ backgroundColor: event?.color }"></div>
          <h2 class="text-h6 font-weight-regular">{{ event?.title }}</h2>
        </div>

        <!-- Date and time -->
        <div class="d-flex align-start mb-2">
          <v-icon class="mr-3 mt-1" size="20">mdi-clock-outline</v-icon>
          <div>
            <div class="text-body-1">{{ dateTimeDisplay }}</div>
            <div v-if="event?.rrule && event.rrule !== ''" class="text-body-2 text-medium-emphasis mt-1">
              {{ formatRRule(event.rrule) }}
            </div>
          </div>
        </div>

        <!-- Calendar name -->
        <div v-if="calendarName" class="d-flex align-start">
          <v-icon class="mr-3 mt-1" size="20">mdi-calendar-blank</v-icon>
          <div class="text-body-1">{{ calendarName }}</div>
        </div>
      </v-card-text>
    </v-card>
  </v-bottom-sheet>
</template>

<script>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useDisplay } from 'vuetify';
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
    const { mobile } = useDisplay();
    const { formatRRule } = useRRuleFormatter();

    const dateTimeDisplay = computed(() => {
      if (!props.event) return '';
      
      const start = Temporal.PlainDateTime.from(props.event.start);
      const end = props.event.end ? Temporal.PlainDateTime.from(props.event.end) : start.add({ hours: 1 });
      
      // Format the day and date
      const dayOfWeek = start.toLocaleString(props.locale, { weekday: 'long' });
      const dayNumber = start.day;
      const month = start.toLocaleString(props.locale, { month: 'long' });
      
      if (props.event.allDay) {
        return `${dayOfWeek}, ${dayNumber} de ${month.toLowerCase()}`;
      }
      
      const startTime = start.toLocaleString(props.locale, {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
      
      const endTime = end.toLocaleString(props.locale, {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
      
      return `${dayOfWeek}, ${dayNumber} de ${month.toLowerCase()} · ${startTime} – ${endTime}`;
    });

    const calendarName = computed(() => {
      if (!props.event?.calendarId) return '';
      const calendar = props.calendars.find(c => c.id === props.event.calendarId);
      return calendar ? calendar.name : props.event.calendarId;
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
      mobile,
      formatRRule,
      dateTimeDisplay,
      calendarName,
      handleClose,
      handleEdit,
      handleDelete
    };
  }
};
</script>

<style scoped>
.event-detail-card {
  border-radius: 8px;
}

.border-b {
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
}

.color-dot {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  flex-shrink: 0;
}

.mobile-detail-sheet {
  max-height: 80vh;
}
</style>
