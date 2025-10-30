<template>
  <v-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    max-width="500"
    persistent
    data-testid="recurrence-picker-modal"
  >
    <v-card class="pa-0">
      <v-card-title class="d-flex align-center pa-6 pb-4">
        <span class="text-h6 font-weight-medium">{{ t('customRecurrence') }}</span>
        <v-spacer></v-spacer>
        <v-btn
          icon
          variant="text"
          size="small"
          @click="handleCancel"
          :aria-label="t('close')"
          class="text-medium-emphasis"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text class="px-6 pb-6">
        <v-container fluid class="pa-0">
          <v-form>
            <!-- Frequency -->
            <v-select
              v-model="frequency"
              :label="t('repeatFrequency')"
              :items="frequencyOptions"
              item-title="text"
              item-value="value"
              class="mb-4"
            ></v-select>

            <!-- Interval -->
            <v-row class="mb-4">
              <v-col cols="12">
                <v-text-field
                  v-model.number="interval"
                  :label="intervalLabel"
                  type="number"
                  min="1"
                  max="999"
                ></v-text-field>
              </v-col>
            </v-row>

            <!-- Weekly: Days of week -->
            <div v-if="frequency === 'WEEKLY'" class="mb-4">
              <div class="text-body-2 text-medium-emphasis mb-2">{{ t('repeatOn') }}</div>
              <v-chip-group
                v-model="selectedWeekdays"
                multiple
                column
              >
                <v-chip
                  v-for="day in weekdayOptions"
                  :key="day.value"
                  :value="day.value"
                  filter
                  variant="outlined"
                >
                  {{ day.text }}
                </v-chip>
              </v-chip-group>
            </div>

            <!-- Monthly: Day of month or day of week -->
            <div v-if="frequency === 'MONTHLY'" class="mb-4">
              <v-radio-group v-model="monthlyType">
                <v-radio
                  :label="t('repeatMonthlyByDay')"
                  value="bymonthday"
                ></v-radio>
                <v-radio
                  :label="t('repeatMonthlyByWeekday')"
                  value="byweekday"
                ></v-radio>
              </v-radio-group>
            </div>

            <!-- End condition -->
            <v-divider class="my-4"></v-divider>
            <div class="text-body-2 text-medium-emphasis mb-3">{{ t('ends') }}</div>
            
            <v-radio-group v-model="endType" class="mb-2">
              <v-radio
                :label="t('never')"
                value="never"
              ></v-radio>
              
              <v-radio value="until">
                <template v-slot:label>
                  <div class="d-flex align-center">
                    <span class="mr-2">{{ t('on') }}</span>
                    <v-text-field
                      v-model="untilDate"
                      type="date"
                      density="compact"
                      hide-details
                      :disabled="endType !== 'until'"
                      style="max-width: 180px;"
                      @click.stop
                    ></v-text-field>
                  </div>
                </template>
              </v-radio>
              
              <v-radio value="count">
                <template v-slot:label>
                  <div class="d-flex align-center">
                    <span class="mr-2">{{ t('after') }}</span>
                    <v-text-field
                      v-model.number="count"
                      type="number"
                      min="1"
                      max="999"
                      density="compact"
                      hide-details
                      :disabled="endType !== 'count'"
                      style="max-width: 80px;"
                      @click.stop
                    ></v-text-field>
                    <span class="ml-2">{{ t('occurrences') }}</span>
                  </div>
                </template>
              </v-radio>
            </v-radio-group>
          </v-form>
        </v-container>
      </v-card-text>

      <v-card-actions class="px-6 pb-6 pt-0">
        <v-spacer></v-spacer>
        <v-btn
          variant="text"
          @click="handleCancel"
          class="mr-2"
        >
          {{ t('cancel') }}
        </v-btn>
        <v-btn
          color="primary"
          variant="flat"
          @click="handleDone"
        >
          {{ t('done') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { ref, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { Temporal } from '@js-temporal/polyfill';

export default {
  name: 'RecurrencePickerModal',
  props: {
    modelValue: {
      type: Boolean,
      required: true
    },
    rrule: {
      type: String,
      default: ''
    },
    startDate: {
      type: String,
      default: ''
    }
  },
  emits: ['update:modelValue', 'save'],
  setup(props, { emit }) {
    const { t } = useI18n();
    
    const frequency = ref('WEEKLY');
    const interval = ref(1);
    const selectedWeekdays = ref([]);
    const monthlyType = ref('bymonthday');
    const endType = ref('never');
    const untilDate = ref('');
    const count = ref(10);

    const frequencyOptions = computed(() => [
      { text: t('repeatDaily'), value: 'DAILY' },
      { text: t('repeatWeekly'), value: 'WEEKLY' },
      { text: t('repeatMonthly'), value: 'MONTHLY' },
      { text: t('repeatYearly'), value: 'YEARLY' }
    ]);

    const weekdayOptions = computed(() => [
      { text: t('sunday'), value: 'SU' },
      { text: t('monday'), value: 'MO' },
      { text: t('tuesday'), value: 'TU' },
      { text: t('wednesday'), value: 'WE' },
      { text: t('thursday'), value: 'TH' },
      { text: t('friday'), value: 'FR' },
      { text: t('saturday'), value: 'SA' }
    ]);

    const intervalLabel = computed(() => {
      const freqMap = {
        DAILY: t('days'),
        WEEKLY: t('weeks'),
        MONTHLY: t('months'),
        YEARLY: t('years')
      };
      return t('repeatEvery', { unit: freqMap[frequency.value] || '' });
    });

    const parseRRule = (rruleStr) => {
      // Simple RRULE parser
      const str = rruleStr.startsWith('RRULE:') ? rruleStr.substring(6) : rruleStr;
      const parts = str.split(';');
      
      parts.forEach(part => {
        const [key, value] = part.split('=');
        switch (key) {
          case 'FREQ':
            frequency.value = value;
            break;
          case 'INTERVAL':
            interval.value = parseInt(value, 10);
            break;
          case 'BYDAY':
            selectedWeekdays.value = value.split(',');
            break;
          case 'UNTIL': {
            endType.value = 'until';
            // Parse UNTIL date (format: YYYYMMDD or YYYYMMDDTHHMMSSZ)
            const dateStr = value.replace(/T.*/, '');
            untilDate.value = `${dateStr.slice(0, 4)}-${dateStr.slice(4, 6)}-${dateStr.slice(6, 8)}`;
            break;
          }
          case 'COUNT':
            endType.value = 'count';
            count.value = parseInt(value, 10);
            break;
        }
      });
    };

    const resetToDefaults = () => {
      frequency.value = 'WEEKLY';
      interval.value = 1;
      endType.value = 'never';
      count.value = 10;
      
      // Set current weekday if startDate available
      if (props.startDate) {
        try {
          const date = Temporal.PlainDate.from(props.startDate);
          const dayMap = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
          selectedWeekdays.value = [dayMap[date.dayOfWeek % 7]];
        } catch (e) {
          selectedWeekdays.value = ['MO'];
        }
      } else {
        selectedWeekdays.value = ['MO'];
      }
    };

    // Parse RRULE when modal opens
    watch(() => props.rrule, (newRRule) => {
      if (newRRule && newRRule !== '') {
        parseRRule(newRRule);
      } else {
        // Default to weekly on current day
        resetToDefaults();
      }
    }, { immediate: true });

    const buildRRule = () => {
      let parts = [`FREQ=${frequency.value}`];
      
      if (interval.value > 1) {
        parts.push(`INTERVAL=${interval.value}`);
      }
      
      if (frequency.value === 'WEEKLY' && selectedWeekdays.value.length > 0) {
        parts.push(`BYDAY=${selectedWeekdays.value.join(',')}`);
      }
      
      if (frequency.value === 'MONTHLY') {
        if (monthlyType.value === 'bymonthday' && props.startDate) {
          try {
            const date = Temporal.PlainDate.from(props.startDate);
            parts.push(`BYMONTHDAY=${date.day}`);
          } catch (e) {
            // Fallback
          }
        } else if (monthlyType.value === 'byweekday' && props.startDate) {
          try {
            const date = Temporal.PlainDate.from(props.startDate);
            const dayMap = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
            const weekday = dayMap[date.dayOfWeek % 7];
            const weekNum = Math.ceil(date.day / 7);
            parts.push(`BYDAY=${weekNum}${weekday}`);
          } catch (e) {
            // Fallback
          }
        }
      }
      
      if (endType.value === 'until' && untilDate.value) {
        // Convert to YYYYMMDD format
        const cleanDate = untilDate.value.replace(/-/g, '');
        parts.push(`UNTIL=${cleanDate}`);
      } else if (endType.value === 'count' && count.value > 0) {
        parts.push(`COUNT=${count.value}`);
      }
      
      return parts.join(';');
    };

    const handleCancel = () => {
      emit('update:modelValue', false);
    };

    const handleDone = () => {
      const rrule = buildRRule();
      emit('save', rrule);
      emit('update:modelValue', false);
    };

    return {
      t,
      frequency,
      interval,
      selectedWeekdays,
      monthlyType,
      endType,
      untilDate,
      count,
      frequencyOptions,
      weekdayOptions,
      intervalLabel,
      handleCancel,
      handleDone
    };
  }
};
</script>
