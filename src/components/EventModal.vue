<template>
  <v-dialog
    v-if="!mobile"
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
          @click="handleClose"
          :aria-label="t('close')"
          class="ml-auto mr-2">
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
            <div class="d-flex align-center mb-2">
              <v-icon class="mr-4 flex-shrink-0" size="20">mdi-clock-outline</v-icon>
              <span class="date-label mr-3">{{ startDateDisplay }}</span>
              <v-select
                v-if="!eventData.allDay"
                v-model="eventData.startTime"
                :items="timeOptions"
                variant="outlined"
                hide-details
                density="compact"
                class="time-select mr-2"
              ></v-select>
              <span v-if="!eventData.allDay" class="time-separator">–</span>
              <v-select
                v-if="!eventData.allDay"
                v-model="eventData.endTime"
                :items="endTimeOptions"
                variant="outlined"
                hide-details
                density="compact"
                class="time-select ml-2"
              >
                <template v-slot:selection="{ item }">
                  {{ item.value }}
                </template>
              </v-select>
            </div>

            <!-- All day and recurrence row -->
            <div class="d-flex align-center mb-4">
              <div class="icon-spacer mr-4"></div>
              <div class="flex-grow-1">
                <div class="text-body-2 d-flex align-center flex-wrap options-row">
                  <v-checkbox
                    v-model="eventData.allDay"
                    :label="t('allDay')"
                    hide-details
                    density="compact"
                    class="all-day-checkbox"
                  ></v-checkbox>
                  <span class="separator">•</span>
                  <a href="#" class="option-link" @click.prevent="toggleRepeatPicker">
                    {{ repeatDisplayText }}
                  </a>
                </div>
              </div>
            </div>

            <!-- Calendar and color row -->
            <div class="d-flex align-center">
              <v-icon class="mr-4" size="20">mdi-calendar-blank</v-icon>
              <div class="flex-grow-1">
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
        <v-btn
          variant="text"
          @click="handleClose">
          {{ t('cancel') }}
        </v-btn>
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

  <!-- Mobile Bottom Sheet -->
  <v-bottom-sheet
    v-if="mobile"
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    data-testid="event-modal-mobile"
  >
    <v-card class="mobile-bottom-sheet" rounded="t-xl">
      <!-- Action buttons at top -->
      <v-card-actions class="pa-4 pb-2">
        <v-btn
          variant="text"
          @click="handleClose"
        >
          {{ t('cancel') }}
        </v-btn>
        <v-spacer></v-spacer>
        <v-btn
          color="primary"
          variant="text"
          @click="handleSave"
          :disabled="!eventData.title"
        >
          {{ t('save') }}
        </v-btn>
      </v-card-actions>

      <v-divider></v-divider>

      <v-card-text class="px-4 pt-3 pb-4 mobile-content">
        <v-form>
          <!-- Event title -->
          <v-text-field
            v-model="eventData.title"
            :placeholder="t('eventTitle')"
            variant="plain"
            class="mobile-title-input mb-3"
            hide-details
            autofocus
          ></v-text-field>

          <!-- Date and time -->
          <div class="mb-2">
            <div class="d-flex align-center mb-2">
              <v-icon size="20" class="mr-3 flex-shrink-0 text-medium-emphasis">mdi-clock-outline</v-icon>
              <!-- Date picker -->
              <v-text-field
                v-model="eventData.startDate"
                type="date"
                variant="outlined"
                density="compact"
                hide-details
                class="flex-grow-1"
              ></v-text-field>
            </div>
            
            <!-- Time pickers -->
            <div v-if="!eventData.allDay" class="d-flex align-center">
              <div class="icon-spacer mr-3"></div>
              <v-select
                v-model="eventData.startTime"
                :items="timeOptions"
                variant="outlined"
                hide-details
                density="compact"
                class="time-select-mobile mr-2"
              ></v-select>
              <span class="time-separator">–</span>
              <v-select
                v-model="eventData.endTime"
                :items="endTimeOptions"
                variant="outlined"
                hide-details
                density="compact"
                class="time-select-mobile ml-2"
              >
                <template v-slot:selection="{ item }">
                  {{ item.value }}
                </template>
              </v-select>
            </div>
          </div>

          <!-- All day toggle -->
          <div class="mb-3">
            <div class="d-flex align-center">
              <div class="icon-spacer mr-3"></div>
              <div class="flex-grow-1">
                <v-checkbox
                  v-model="eventData.allDay"
                  :label="t('allDay')"
                  hide-details
                  density="compact"
                  class="mobile-checkbox"
                ></v-checkbox>
              </div>
            </div>
          </div>

          <!-- Recurrence -->
          <div class="mb-3 d-flex align-center">
            <v-icon size="20" class="mr-3 text-medium-emphasis">mdi-repeat</v-icon>
            <div class="flex-grow-1">
              <a href="#" class="mobile-option-link" @click.prevent="toggleRepeatPicker">
                {{ repeatDisplayText }}
              </a>
            </div>
          </div>

          <!-- Calendar selection -->
          <div class="d-flex align-center">
            <v-icon size="20" class="mr-3 text-medium-emphasis">mdi-calendar-blank</v-icon>
            <div class="flex-grow-1">
              <v-select
                v-model="eventData.calendar"
                :items="calendars"
                item-title="name"
                item-value="id"
                variant="outlined"
                hide-details
                density="compact"
                class="mobile-calendar-select"
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
      </v-card-text>
    </v-card>
  </v-bottom-sheet>

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
import { useDisplay } from 'vuetify';
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
    const { mobile } = useDisplay();
    
    const eventData = ref({
      title: '',
      startDate: '',
      startTime: '09:00',
      endDate: '',
      endTime: '10:00',
      rrule: '',
      calendar: 'default',
      color: '#1967d2',
      allDay: false
    });

    const repeatSelection = ref('none');
    const showCustomRecurrence = ref(false);

    // Generate time options in 15-minute intervals
    const timeOptions = computed(() => {
      const options = [];
      for (let hour = 0; hour < 24; hour++) {
        for (let minute = 0; minute < 60; minute += 15) {
          const timeStr = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
          options.push({
            value: timeStr,
            title: timeStr
          });
        }
      }
      return options;
    });

    // Calculate duration and generate end time options with duration labels
    const endTimeOptions = computed(() => {
      if (!eventData.value.startTime) return timeOptions.value;
      
      const [startHour, startMinute] = eventData.value.startTime.split(':').map(Number);
      const startMinutes = startHour * 60 + startMinute;
      
      return timeOptions.value
        .map(option => {
          const [endHour, endMinute] = option.value.split(':').map(Number);
          const endMinutes = endHour * 60 + endMinute;
          const durationMinutes = endMinutes - startMinutes;
          
          // Generate duration label for all options
          let durationLabel = '';
          const hours = Math.floor(durationMinutes / 60);
          const minutes = durationMinutes % 60;
          
          if (durationMinutes < 60) {
            // Less than 1 hour - show minutes
            durationLabel = ` (${durationMinutes} minutos)`;
          } else if (minutes === 0) {
            // Exact hours
            durationLabel = hours === 1 ? ' (1 hora)' : ` (${hours} horas)`;
          } else if (minutes === 30) {
            // Half hours
            durationLabel = ` (${hours},5 horas)`;
          } else {
            // Hours and minutes
            durationLabel = ` (${hours}h${String(minutes).padStart(2, '0')})`;
          }
          
          return {
            value: option.value,
            title: option.value + durationLabel,
            durationMinutes
          };
        })
        .filter(option => option.durationMinutes > 0); // Only allow end times after start time
    });

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
          allDay: newEvent.allDay || false
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

    // Watch startDate to sync endDate
    watch(() => eventData.value.startDate, (newDate) => {
      if (newDate) {
        eventData.value.endDate = newDate;
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
      mobile,
      eventData,
      repeatSelection,
      showCustomRecurrence,
      timeOptions,
      endTimeOptions,
      startDateDisplay,
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

.gap-2 {
  gap: 8px;
}

.icon-spacer {
  width: 20px;
  flex-shrink: 0;
}

.date-label {
  font-size: 0.875rem;
  color: rgba(0, 0, 0, 0.87);
  white-space: nowrap;
}

.date-field {
  flex: 1;
  min-width: 200px;
}

.time-field {
  width: 100px;
}

.time-field :deep(.v-field__input) {
  font-size: 0.875rem;
  text-align: center;
}

.time-field :deep(.v-field) {
  border-radius: 4px;
}

.time-select {
  min-width: 80px;
  max-width: 120px;
}

.time-select :deep(.v-field__input) {
  font-size: 0.875rem;
}

.time-select :deep(.v-field) {
  border-radius: 4px;
}

.date-field :deep(.v-field__input) {
  font-size: 0.875rem;
  padding: 4px 0;
}

.time-separator {
  color: rgba(0, 0, 0, 0.6);
  padding: 0 4px;
}

.options-row {
  gap: 8px;
  margin-top: 4px;
}

.separator {
  color: rgba(0, 0, 0, 0.38);
  padding: 0 4px;
}

.option-text {
  color: rgba(0, 0, 0, 0.6);
  font-size: 0.875rem;
}

.option-link {
  color: #1967d2;
  text-decoration: none;
  font-size: 0.875rem;
}

.option-link:hover {
  text-decoration: underline;
}

.calendar-select :deep(.v-field__input) {
  font-size: 0.875rem;
  padding: 4px 0;
}

.color-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
}

.all-day-checkbox {
  margin-right: 0;
}

.all-day-checkbox :deep(.v-label) {
  font-size: 0.875rem;
  color: rgba(0, 0, 0, 0.6);
}

.all-day-checkbox :deep(.v-selection-control) {
  min-height: 24px;
}

.all-day-checkbox :deep(.v-selection-control__wrapper) {
  height: 24px;
}

/* Mobile-specific styles */
.mobile-bottom-sheet {
  max-height: 50vh;
}

.mobile-content {
  max-height: calc(50vh - 100px);
  overflow-y: auto;
}

.mobile-title-input :deep(.v-field__input) {
  font-size: 1.125rem;
  font-weight: 400;
  padding: 4px 0;
}

.mobile-title-input :deep(.v-field__input::placeholder) {
  color: rgba(0, 0, 0, 0.38);
}

.mobile-option-link {
  color: rgba(0, 0, 0, 0.87);
  text-decoration: none;
  font-size: 0.875rem;
  display: block;
  padding: 8px 0;
}

.mobile-option-link:hover {
  text-decoration: underline;
}

.mobile-calendar-select :deep(.v-field__input) {
  font-size: 0.875rem;
}

.mobile-checkbox {
  margin-right: 0;
}

.mobile-checkbox :deep(.v-label) {
  font-size: 0.875rem;
  color: rgba(0, 0, 0, 0.6);
}

.mobile-checkbox :deep(.v-selection-control) {
  min-height: 24px;
}

.mobile-checkbox :deep(.v-selection-control__wrapper) {
  height: 24px;
}

.time-field-mobile {
  flex: 1;
}

.time-field-mobile :deep(.v-field__input) {
  font-size: 0.875rem;
  text-align: center;
}

.time-field-mobile :deep(.v-field) {
  border-radius: 4px;
}

.time-select-mobile {
  flex: 1;
}

.time-select-mobile :deep(.v-field__input) {
  font-size: 0.875rem;
}

.time-select-mobile :deep(.v-field) {
  border-radius: 4px;
}

@media (max-width: 767px) {
  .date-label {
    white-space: normal;
    line-height: 1.4;
  }
  
  .title-input :deep(.v-field__input) {
    font-size: 1.25rem;
  }
}
</style>