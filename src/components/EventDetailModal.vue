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
        <div class="detail-row mb-4">
          <div class="detail-row__icon text-headline-small">
            <div class="color-dot" :style="{ backgroundColor: event?.color || DEFAULT_COLOR }"></div>
          </div>
          <h2 class="detail-title text-headline-small">{{ event?.title }}</h2>
        </div>

        <!-- Date and time -->
        <div class="detail-row mb-2">
          <div class="detail-row__icon text-body-large">
            <v-icon size="20">mdi-clock-outline</v-icon>
          </div>
          <div>
            <div class="text-body-large">{{ dateTimeDisplay }}</div>
            <div v-if="event?.rrule && event.rrule !== ''" class="text-body-medium text-medium-emphasis mt-1">
              {{ formatRRule(event.rrule) }}
            </div>
          </div>
        </div>

        <!-- Calendar name -->
        <div v-if="calendarName" class="detail-row">
          <div class="detail-row__icon text-body-large">
            <v-icon size="20">mdi-calendar-blank</v-icon>
          </div>
          <div class="text-body-large">{{ calendarName }}</div>
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
        <div class="detail-row mb-4">
          <div class="detail-row__icon text-title-large">
            <div class="color-dot" :style="{ backgroundColor: event?.color }"></div>
          </div>
          <h2 class="detail-title text-title-large">{{ event?.title }}</h2>
        </div>

        <!-- Date and time -->
        <div class="detail-row mb-2">
          <div class="detail-row__icon text-body-large">
            <v-icon size="20">mdi-clock-outline</v-icon>
          </div>
          <div>
            <div class="text-body-large">{{ dateTimeDisplay }}</div>
            <div v-if="event?.rrule && event.rrule !== ''" class="text-body-medium text-medium-emphasis mt-1">
              {{ formatRRule(event.rrule) }}
            </div>
          </div>
        </div>

        <!-- Calendar name -->
        <div v-if="calendarName" class="detail-row">
          <div class="detail-row__icon text-body-large">
            <v-icon size="20">mdi-calendar-blank</v-icon>
          </div>
          <div class="text-body-large">{{ calendarName }}</div>
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
      
      // Weekday and date in the calendar's language: "Monday, January 13" or "segunda-feira, 13 de janeiro"
      const date = start.toLocaleString(props.locale, { weekday: 'long', day: 'numeric', month: 'long' });
      
      if (props.event.allDay) {
        return date;
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
      
      return `${date} · ${startTime} – ${endTime}`;
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
.border-b {
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
}

/* Icon + text rows: the icon box is one text line tall (1lh, using the text's
   typography class), so the icon stays centred on the first line of text */
.detail-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.detail-row__icon {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  height: 1lh;
}

.detail-title {
  margin: 0;
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
