<template>
  <!-- Google Calendar's "Custom recurrence": a dialog on desktop, a bottom sheet on mobile.
       The Vuetify components are used by name, not imported: an import would load their CSS
       before the app's Vuetify styles and break Vuetify's CSS layer order. -->
  <component :is="mobile ? 'v-bottom-sheet' : 'v-dialog'" :model-value="modelValue" @update:model-value="handleCancel" :max-width="mobile ? undefined : 440" content-class="calendar-font-scope" persistent scrim="rgba(0, 0, 0, 0.5)" :data-testid="mobile ? 'recurrence-picker-modal-mobile' : 'recurrence-picker-modal'">
    <v-card class="recurrence-card" :class="{ 'recurrence-card--mobile': mobile }" :rounded="mobile ? 't-xl' : 'xl'">
      <!-- Mobile: Cancel, title and Done at the top, as in the other sheets -->
      <template v-if="mobile">
        <v-card-actions class="pa-4 pb-2">
          <v-btn variant="text" @click="handleCancel">{{ t('cancel') }}</v-btn>
          <v-spacer></v-spacer>
          <h2 class="recurrence-title--mobile">{{ t('customRecurrenceTitle') }}</h2>
          <v-spacer></v-spacer>
          <v-btn color="primary" variant="text" @click="handleDone">{{ t('done') }}</v-btn>
        </v-card-actions>
        <v-divider></v-divider>
      </template>
      <h2 v-else class="recurrence-title text-headline-small">{{ t('customRecurrenceTitle') }}</h2>

      <v-card-text class="recurrence-content">
        <!-- Repeat every [1] [week] -->
        <div class="repeat-every">
          <span class="recurrence-label">{{ t('repeatEveryLabel') }}</span>
          <v-number-input v-model="form.interval.value" :min="1" :max="999" control-variant="stacked" variant="solo-filled" flat density="compact" hide-details class="interval-input recurrence-number" :aria-label="t('repeatEveryLabel')"></v-number-input>
          <v-select v-model="form.frequency.value" :items="form.unitOptions.value" variant="solo-filled" flat density="compact" hide-details class="unit-select" data-testid="recurrence-unit" :aria-label="t('repeatFrequency')" :menu-props="{ contentClass: 'calendar-select-menu' }"></v-select>
        </div>

        <!-- Weekly: the days, as round buttons -->
        <div v-if="form.frequency.value === 'WEEKLY'" class="recurrence-section">
          <div class="recurrence-label mb-3">{{ t('repeatOn') }}</div>
          <div class="weekday-buttons" role="group" :aria-label="t('repeatOn')">
            <v-btn v-for="day in form.weekdayOptions.value" :key="day.value" icon size="32" :variant="isSelectedDay(day.value) ? 'flat' : 'tonal'" :color="isSelectedDay(day.value) ? 'primary' : undefined" :aria-label="day.name" :aria-pressed="isSelectedDay(day.value)" class="weekday-button" @click="form.toggleWeekday(day.value)">{{ day.letter }}</v-btn>
          </div>
        </div>

        <!-- Monthly: on the same day, or on the same weekday of the month -->
        <v-select v-if="form.frequency.value === 'MONTHLY'" v-model="form.monthlyType.value" :items="form.monthlyOptions.value" variant="solo-filled" flat density="compact" hide-details class="recurrence-section monthly-select" data-testid="recurrence-monthly" :aria-label="t('repeatMonthly')" :menu-props="{ contentClass: 'calendar-select-menu' }"></v-select>

        <!-- Ends: never, on a date, or after a number of occurrences; the fields line up in one column -->
        <div class="recurrence-section">
          <div class="recurrence-label mb-1">{{ t('ends') }}</div>
          <v-radio-group v-model="form.endType.value" hide-details>
            <div class="ends-grid">
              <v-radio :label="t('never')" value="never"></v-radio>
              <span></span>

              <v-radio :label="t('on')" value="until"></v-radio>
              <v-menu v-model="showUntilPicker" content-class="calendar-font-scope" :close-on-content-click="false" :disabled="form.endType.value !== 'until'">
                <template v-slot:activator="{ props: menuProps }">
                  <v-text-field :model-value="form.untilDateDisplay.value" readonly variant="solo-filled" flat density="compact" hide-details :disabled="form.endType.value !== 'until'" class="ends-field" data-testid="recurrence-until" :aria-label="t('untilDateLabel')" v-bind="menuProps"></v-text-field>
                </template>
                <v-date-picker class="event-date-picker" :model-value="untilPickerValue" @update:model-value="handleUntilChange" control-variant="modal" hide-header show-adjacent-months></v-date-picker>
              </v-menu>

              <v-radio :label="t('after')" value="count"></v-radio>
              <v-number-input v-model="form.count.value" :min="1" :max="730" control-variant="stacked" variant="solo-filled" flat density="compact" hide-details :suffix="t('occurrences')" :disabled="form.endType.value !== 'count'" class="ends-field recurrence-number" data-testid="recurrence-count" :aria-label="t('countLabel')"></v-number-input>
            </div>
          </v-radio-group>
        </div>
      </v-card-text>

      <v-card-actions v-if="!mobile" class="recurrence-actions">
        <v-spacer></v-spacer>
        <v-btn color="primary" variant="text" :slim="false" class="px-6" @click="handleCancel">{{ t('cancel') }}</v-btn>
        <v-btn color="primary" variant="flat" :slim="false" class="px-6" @click="handleDone">{{ t('done') }}</v-btn>
      </v-card-actions>
    </v-card>
  </component>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useDisplay } from 'vuetify';
import { Temporal } from '@js-temporal/polyfill';
import { useRecurrenceForm } from '../composables/useRecurrenceForm.js';

const props = defineProps({
  modelValue: { type: Boolean, required: true },
  // The rule to start from, '' for none
  rrule: { type: String, default: '' },
  // The event's start date, 'YYYY-MM-DD'
  startDate: { type: String, default: '' }
});

const emit = defineEmits(['update:modelValue', 'save']);

const { t } = useI18n();
const { mobile } = useDisplay();
const form = useRecurrenceForm(() => props.startDate);
const showUntilPicker = ref(false);

const isSelectedDay = (day) => form.weekdays.value.includes(day);

// Start from the event's rule each time the dialog opens; without one, weekly on the event's day
watch(() => [props.modelValue, props.rrule], ([isOpen]) => {
  if (isOpen) form.load(props.rrule);
}, { immediate: true });

// The date picker works with JavaScript dates; the form keeps 'YYYY-MM-DD'
const untilPickerValue = computed(() => {
  if (!form.untilDate.value) return null;
  const date = Temporal.PlainDate.from(form.untilDate.value);
  return new Date(date.year, date.month - 1, date.day);
});

function handleUntilChange(date) {
  if (!date) return;
  form.untilDate.value = new Temporal.PlainDate(date.getFullYear(), date.getMonth() + 1, date.getDate()).toString();
  showUntilPicker.value = false;
}

function handleCancel() {
  emit('update:modelValue', false);
}

function handleDone() {
  emit('save', form.toRule());
  emit('update:modelValue', false);
}
</script>

<style scoped>
.recurrence-title {
  margin: 0;
  padding: 24px 24px 8px;
}

.recurrence-title--mobile {
  margin: 0;
  font-size: 1rem;
  font-weight: var(--calendar-font-weight-medium, 500);
}

.recurrence-content {
  padding: 16px 24px 8px;
}

.recurrence-label {
  font-size: 0.875rem;
  color: rgba(0, 0, 0, 0.6);
}

.repeat-every {
  display: flex;
  align-items: center;
  gap: 12px;
}

.interval-input {
  flex: 0 0 96px;
}

.unit-select {
  flex: 0 0 140px;
}

/* Number fields as tall as the others (40px): the arrows are as tall as their icons
   (height: auto), so smaller icons make the two arrows and their divider fit */
.recurrence-number :deep(.v-number-input__control .v-icon) {
  font-size: 18px;
  height: 18px;
  width: 18px;
}

.recurrence-section {
  margin-top: 24px;
}

.weekday-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.weekday-button {
  font-size: 0.75rem;
  font-weight: 500;
}

/* The radios in one column, their fields in another, so the fields line up */
.ends-grid {
  display: grid;
  grid-template-columns: max-content minmax(0, 220px);
  align-items: center;
  column-gap: 24px;
  row-gap: 8px;
}

/* Vuetify places radios in a named grid area of its own; here they take the next cell */
.ends-grid > :deep(*) {
  grid-area: auto;
}

.recurrence-actions {
  gap: 8px;
  padding: 8px 24px 24px;
}

/* Bottom sheet: scroll the form when the screen is short */
.recurrence-card--mobile {
  max-height: 90vh;
}

.recurrence-card--mobile .recurrence-content {
  padding: 16px;
  overflow-y: auto;
}
</style>
