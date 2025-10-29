<template>
  <v-dialog
    :model-value="modelValue && !!event"
    @update:model-value="handleClose"
    max-width="500"
    data-testid="event-detail-modal"
  >
    <v-card v-if="event">
      <!-- Color bar -->
      <div class="color-bar" :style="{ backgroundColor: event?.color || '#1967d2' }"></div>
      
      <v-card-title class="d-flex align-center">
        <span class="text-h5">{{ event?.title }}</span>
        <v-spacer></v-spacer>
        <v-btn icon variant="text" size="small" @click="handleClose" :aria-label="t('close')">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>
      
      <v-card-text>
        <!-- Event details -->
        <v-list density="compact">
          <v-list-item>
            <template v-slot:prepend>
              <v-icon>mdi-clock-outline</v-icon>
            </template>
            <v-list-item-title>{{ timeRange }}</v-list-item-title>
            <v-list-item-subtitle v-if="event?.repeat && event.repeat !== 'none'">
              Repeats {{ repeatText }}
            </v-list-item-subtitle>
          </v-list-item>
          
          <v-list-item v-if="calendarName">
            <template v-slot:prepend>
              <v-icon>mdi-calendar</v-icon>
            </template>
            <v-list-item-title>{{ calendarName }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-card-text>
      
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn text @click="handleDelete">{{ t('delete') }}</v-btn>
        <v-btn color="primary" variant="elevated" @click="handleEdit">{{ t('edit') }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { Temporal } from '@js-temporal/polyfill';

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

    const repeatText = computed(() => {
      if (!props.event?.repeat || props.event.repeat === 'none') return '';
      const repeatKey = 'repeat' + props.event.repeat.charAt(0).toUpperCase() + props.event.repeat.slice(1);
      return t(repeatKey).toLowerCase();
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
      timeRange,
      repeatText,
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
  height: 8px;
  width: 100%;
}
</style>
