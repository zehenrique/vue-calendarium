<template>
  <v-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    max-width="600"
    persistent
    data-testid="event-modal"
  >
    <v-card class="pa-0">
      <v-card-title class="d-flex align-center pa-6 pb-4">
        <span class="text-h6 font-weight-medium">{{ t('newEvent') }}</span>
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
        <v-container fluid class="pa-0">
          <v-form>
            <!-- Event title -->
            <v-text-field
              v-model="eventData.title"
              :label="t('eventTitle')"
              :placeholder="t('eventTitle')"
              required
              class="mb-4"
            ></v-text-field>

            <!-- Date and time inputs -->
            <div class="text-body-2 text-medium-emphasis mb-3">{{ t('start') }}</div>
            <v-row class="mb-4">
              <v-col cols="6">
                <v-text-field
                  v-model="eventData.startDate"
                  :label="t('date')"
                  type="date"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="6">
                <v-text-field
                  v-model="eventData.startTime"
                  :label="t('time')"
                  type="time"
                  required
                ></v-text-field>
              </v-col>
            </v-row>

            <div class="text-body-2 text-medium-emphasis mb-3">{{ t('end') }}</div>
            <v-row class="mb-4">
              <v-col cols="6">
                <v-text-field
                  v-model="eventData.endDate"
                  :label="t('date')"
                  type="date"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="6">
                <v-text-field
                  v-model="eventData.endTime"
                  :label="t('time')"
                  type="time"
                  required
                ></v-text-field>
              </v-col>
            </v-row>

            <!-- Repeat -->
            <v-select
              v-model="eventData.repeat"
              :label="t('repeat')"
              :items="repeatOptions"
              item-title="text"
              item-value="value"
              class="mb-4"
              data-testid="repeat-select"
            ></v-select>

            <!-- Calendar selection -->
            <v-select
              v-model="eventData.calendar"
              :label="t('calendar')"
              :items="calendars"
              item-title="name"
              item-value="id"
              class="mb-4"
              data-testid="calendar-select"
            ></v-select>

            <!-- Color picker -->
            <div class="text-body-2 text-medium-emphasis mb-3">{{ t('color') }}</div>
            <v-row align="center" class="mb-4">
              <v-col cols="4">
                <v-text-field
                  v-model="eventData.color"
                  type="color"
                  hide-details
                ></v-text-field>
              </v-col>
              <v-col cols="8">
                <v-text-field
                  v-model="eventData.color"
                  readonly
                  hide-details
                  class="font-mono text-body-2"
                ></v-text-field>
              </v-col>
            </v-row>
          </v-form>
        </v-container>
      </v-card-text>

      <v-card-actions class="px-6 pb-6 pt-0">
        <v-spacer></v-spacer>
        <v-btn
          variant="text"
          @click="handleClose"
          class="mr-2"
        >
          {{ t('cancel') }}
        </v-btn>
        <v-btn
          color="primary"
          variant="filled"
          @click="handleSave"
          :disabled="!eventData.title"
        >
          {{ t('save') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { ref, watch, computed } from 'vue';
import { useI18n } from 'vue-i18n';

export default {
  name: 'EventModal',
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
      default: () => [{ id: 'default', name: 'My Calendar', color: '#1967d2' }]
    }
  },
  emits: ['update:modelValue', 'save'],
  setup(props, { emit }) {
    const { t } = useI18n();
    
    const eventData = ref({
      title: '',
      startDate: '',
      startTime: '09:00',
      endDate: '',
      endTime: '10:00',
      repeat: 'none',
      calendar: 'default',
      color: '#1967d2'
    });

    const repeatOptions = computed(() => [
      { text: t('repeatNone'), value: 'none' },
      { text: t('repeatDaily'), value: 'daily' },
      { text: t('repeatWeekly'), value: 'weekly' },
      { text: t('repeatMonthly'), value: 'monthly' },
      { text: t('repeatYearly'), value: 'yearly' }
    ]);

    // Watch for event prop changes to update form
    watch(() => props.event, (newEvent) => {
      if (newEvent) {
        eventData.value = { ...newEvent };
      }
    }, { immediate: true, deep: true });

    const handleClose = () => {
      emit('update:modelValue', false);
    };

    const handleSave = () => {
      if (!eventData.value.title) {
        alert('Please enter an event title');
        return;
      }
      emit('save', { ...eventData.value });
      handleClose();
    };

    return {
      t,
      eventData,
      repeatOptions,
      handleClose,
      handleSave
    };
  }
};
</script>
