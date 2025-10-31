<template>
  <v-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    max-width="680"
    persistent
    data-testid="event-modal"
  >
    <v-card class="pa-0 event-modal-card">
      <!-- Header with tabs and close button -->
      <div class="modal-header">
        <v-btn
          icon
          variant="text"
          size="small"
          class="ml-2"
        >
          <v-icon>mdi-menu</v-icon>
        </v-btn>
        <v-btn
          icon
          variant="text"
          size="small"
          @click="handleClose"
          :aria-label="t('close')"
          class="ml-auto mr-2"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </div>

      <v-card-text class="px-8 pt-4 pb-6">
        <v-container fluid class="pa-0">
          <v-form>
            <!-- Event title -->
            <v-text-field
              v-model="eventData.title"
              :placeholder="t('eventTitle')"
              variant="plain"
              class="text-h5 mb-4 title-input"
              hide-details
              autofocus
            ></v-text-field>

            <!-- Date and time row -->
            <div class="d-flex align-start mb-4">
              <v-icon class="mr-4 mt-2" size="20">mdi-clock-outline</v-icon>
              <div class="flex-grow-1">
                <div class="d-flex align-center mb-2">
                  <v-text-field
                    v-model="startDateDisplay"
                    variant="plain"
                    hide-details
                    readonly
                    density="compact"
                    class="date-field mr-2"
                  ></v-text-field>
                  <v-text-field
                    v-if="!eventData.allDay"
                    v-model="eventData.startTime"
                    variant="plain"
                    type="time"
                    hide-details
                    density="compact"
                    class="time-field"
                  ></v-text-field>
                  <span v-if="!eventData.allDay" class="mx-2">–</span>
                  <v-text-field
                    v-if="!eventData.allDay"
                    v-model="eventData.endTime"
                    variant="plain"
                    type="time"
                    hide-details
                    density="compact"
                    class="time-field"
                  ></v-text-field>
                </div>
                <div class="text-body-2">
                  <v-checkbox
                    v-model="eventData.allDay"
                    :label="t('allDay')"
                    hide-details
                    density="compact"
                    class="d-inline-flex all-day-checkbox"
                  ></v-checkbox>
                  <span class="mx-2">•</span>
                  <span>{{ timezoneDisplay }}</span>
                  <span class="mx-2">•</span>
                  <a href="#" class="text-decoration-none" @click.prevent="toggleRepeatPicker">
                    {{ repeatDisplayText }}
                  </a>
                </div>
              </div>
            </div>

            <!-- Description row -->
            <div class="d-flex align-start mb-4">
              <v-icon class="mr-4 mt-2" size="20">mdi-text</v-icon>
              <v-text-field
                v-model="eventData.description"
                :placeholder="t('addDescription')"
                variant="plain"
                hide-details
                density="compact"
                class="flex-grow-1"
              ></v-text-field>
            </div>

            <!-- Calendar and color row -->
            <div class="d-flex align-start">
              <v-icon class="mr-4 mt-2" size="20">mdi-calendar-blank</v-icon>
              <div class="d-flex align-center flex-grow-1">
                <v-select
                  v-model="eventData.calendar"
                  :items="calendars"
                  item-title="name"
                  item-value="id"
                  variant="plain"
                  hide-details
                  density="compact"
                  class="calendar-select"
                  data-testid="calendar-select"
                >
                  <template v-slot:selection="{ item }">
                    <div class="d-flex align-center">
                      <div
                        class="color-dot mr-2"
                        :style="{ backgroundColor: eventData.color }"
                      ></div>
                      <span>{{ item.title }}</span>
                    </div>
                  </template>
                  <template v-slot:item="{ item, props }">
                    <v-list-item v-bind="props">
                      <template v-slot:prepend>
                        <div
                          class="color-dot mr-2"
                          :style="{ backgroundColor: getCalendarColor(item.value) }"
                        ></div>
                      </template>
                    </v-list-item>
                  </template>
                </v-select>
              </div>
            </div>
          </v-form>
        </v-container>
      </v-card-text>

      <v-card-actions class="px-8 pb-4 pt-0">
        <v-spacer></v-spacer>
        <v-btn
          color="primary"
          variant="flat"
          size="large"
          @click="handleSave"
          :disabled="!eventData.title"
          class="px-8"
        >
          {{ t('save') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Custom recurrence picker - outside main dialog -->
  <RecurrencePickerModal
    v-model="showCustomRecurrence"
    :rrule="eventData.rrule"
    :start-date="eventData.startDate"
    @save="handleCustomRecurrenceSave"
  />
</template>

<script>
import { ref, watch, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { Temporal } from '@js-temporal/polyfill';
import RecurrencePickerModal from './RecurrencePickerModal.vue';

export default {
  name: 'EventModal',
  components: {
    RecurrencePickerModal
  },
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
      rrule: '',
      calendar: 'default',
      color: '#1967d2',
      allDay: false,
      description: ''
    });

    const repeatSelection = ref('none');
    const showCustomRecurrence = ref(false);

    const startDateDisplay = computed(() => {
      if (!eventData.value.startDate) return '';
      try {
        const date = Temporal.PlainDate.from(eventData.value.startDate);
        const locale = 'pt-PT'; // Use Portuguese format like in the image
        const dayOfWeek = date.toLocaleString(locale, { weekday: 'long' });
        const dayNumber = date.day;
        const month = date.toLocaleString(locale, { month: 'long' });
        
        return `${dayOfWeek.charAt(0).toUpperCase() + dayOfWeek.slice(1)}, ${dayNumber} de ${month}`;
      } catch (e) {
        return eventData.value.startDate;
      }
    });

    const timezoneDisplay = computed(() => {
      return t('timezone') || 'Fuso horário';
    });

    const repeatDisplayText = computed(() => {
      if (!eventData.value.rrule || eventData.value.rrule === '') {
        return t('doesNotRepeat') || 'Não se repete';
      }
      
      if (eventData.value.rrule === 'FREQ=DAILY') {
        return t('repeatDaily');
      } else if (eventData.value.rrule === 'FREQ=WEEKLY') {
        return t('repeatWeekly');
      } else if (eventData.value.rrule === 'FREQ=MONTHLY') {
        return t('repeatMonthly');
      } else if (eventData.value.rrule === 'FREQ=YEARLY') {
        return t('repeatYearly');
      }
      
      return t('customRecurrence');
    });

    const getCalendarColor = (calendarId) => {
      const calendar = props.calendars.find(c => c.id === calendarId);
      return calendar ? calendar.color : '#1967d2';
    };

    // Watch for event prop changes to update form
    watch(() => props.event, (newEvent) => {
      if (newEvent) {
        eventData.value = {
          title: newEvent.title || '',
          startDate: newEvent.startDate || '',
          startTime: newEvent.startTime || '09:00',
          endDate: newEvent.endDate || '',
          endTime: newEvent.endTime || '10:00',
          rrule: newEvent.rrule || '',
          calendar: newEvent.calendar || 'default',
          color: newEvent.color || '#1967d2',
          allDay: newEvent.allDay || false,
          description: newEvent.description || ''
        };
        
        // Update color from calendar
        const calendar = props.calendars.find(c => c.id === eventData.value.calendar);
        if (calendar) {
          eventData.value.color = calendar.color;
        }
        
        // Set repeat selection based on RRULE
        if (!newEvent.rrule || newEvent.rrule === '') {
          repeatSelection.value = 'none';
        } else if (newEvent.rrule === 'FREQ=DAILY') {
          repeatSelection.value = 'daily';
        } else if (newEvent.rrule === 'FREQ=WEEKLY') {
          repeatSelection.value = 'weekly';
        } else if (newEvent.rrule === 'FREQ=MONTHLY') {
          repeatSelection.value = 'monthly';
        } else if (newEvent.rrule === 'FREQ=YEARLY') {
          repeatSelection.value = 'yearly';
        } else {
          repeatSelection.value = 'custom';
        }
      }
    }, { immediate: true, deep: true });

    // Watch calendar selection to update color
    watch(() => eventData.value.calendar, (calendarId) => {
      const calendar = props.calendars.find(c => c.id === calendarId);
      if (calendar) {
        eventData.value.color = calendar.color;
      }
    });

    const toggleRepeatPicker = () => {
      showCustomRecurrence.value = true;
    };

    const handleRepeatChange = (val) => {
      if (val === 'custom') {
        showCustomRecurrence.value = true;
        return;
      }
      
      // Map simple repeats to RRULE
      switch (val) {
        case 'daily':
          eventData.value.rrule = 'FREQ=DAILY';
          break;
        case 'weekly':
          eventData.value.rrule = 'FREQ=WEEKLY';
          break;
        case 'monthly':
          eventData.value.rrule = 'FREQ=MONTHLY';
          break;
        case 'yearly':
          eventData.value.rrule = 'FREQ=YEARLY';
          break;
        default:
          eventData.value.rrule = '';
      }
    };

    const handleCustomRecurrenceSave = (rrule) => {
      eventData.value.rrule = rrule;
      repeatSelection.value = 'custom';
    };

    const handleClose = () => {
      emit('update:modelValue', false);
    };

    const handleSave = () => {
      if (!eventData.value.title) {
        return;
      }
      emit('save', { ...eventData.value });
      handleClose();
    };

    return {
      t,
      eventData,
      repeatSelection,
      showCustomRecurrence,
      startDateDisplay,
      timezoneDisplay,
      repeatDisplayText,
      getCalendarColor,
      toggleRepeatPicker,
      handleRepeatChange,
      handleCustomRecurrenceSave,
      handleClose,
      handleSave
    };
  }
};
</script>

<style scoped>
.event-modal-card {
  border-radius: 8px;
}

.modal-header {
  display: flex;
  align-items: center;
  padding: 8px 8px 8px 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
}

.title-input :deep(.v-field__input) {
  font-size: 1.5rem;
  font-weight: 400;
  padding: 8px 0;
}

.title-input :deep(.v-field__input::placeholder) {
  color: rgba(0, 0, 0, 0.38);
}

.date-field,
.time-field {
  max-width: fit-content;
}

.date-field :deep(.v-field__input),
.time-field :deep(.v-field__input) {
  font-size: 0.875rem;
}

.calendar-select :deep(.v-field__input) {
  font-size: 0.875rem;
}

.color-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
}

.all-day-checkbox :deep(.v-label) {
  font-size: 0.875rem;
}

.all-day-checkbox :deep(.v-selection-control) {
  min-height: 24px;
}
</style>