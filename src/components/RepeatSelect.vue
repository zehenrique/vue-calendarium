<template>
  <v-menu v-model="menuOpen" content-class="calendar-font-scope calendar-select-menu">
    <template v-slot:activator="{ props: activatorProps }">
      <a href="#" :class="linkClass || 'repeat-select-link'" data-testid="repeat-select" v-bind="activatorProps" @click.prevent>{{ selectedLabel }}</a>
    </template>
    <v-list density="compact" class="repeat-menu" data-testid="repeat-menu">
      <v-list-item v-for="option in options" :key="option.value" :title="option.title" :active="option.value === selectedValue" color="primary" @click="choose(option)"></v-list-item>
    </v-list>
  </v-menu>

  <RecurrencePickerModal v-model="showCustomRecurrence" :rrule="modelValue" :start-date="startDate" @save="saveRule"/>
</template>

<script setup>
// The repeat menu of the event dialog, as in Google Calendar: "Does not repeat", the usual
// rules for the event's date ("Weekly on Wednesday", "Monthly on the third Wednesday"...),
// and "Custom..." for the repeat picker.
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { Temporal } from '@js-temporal/polyfill';
import RecurrencePickerModal from './RecurrencePickerModal.vue';
import { isSameRule, keepExceptionDates } from '../core/recurrence.js';
import { getRepeatOptions } from '../core/recurrenceText.js';
import { useRRuleFormatter } from '../composables/useRRuleFormatter.js';

const props = defineProps({
  // The rule (RRULE), '' when the event does not repeat
  modelValue: { type: String, default: '' },
  // The event's start date, 'YYYY-MM-DD'
  startDate: { type: String, default: '' },
  // A class for the link; without one it has its own style (used outside the calendar's dialog)
  linkClass: { type: String, default: '' }
});

const emit = defineEmits(['update:modelValue']);

const { t, locale } = useI18n();
const { formatRRule } = useRRuleFormatter();

const CUSTOM = 'custom';

const menuOpen = ref(false);
const showCustomRecurrence = ref(false);

function toDate(value) {
  try {
    return value ? Temporal.PlainDate.from(value) : null;
  } catch {
    return null;
  }
}

// The usual rules for an event on a date
const presetsFor = (date) => getRepeatOptions(date, { locale: locale.value, t });

const presets = computed(() => presetsFor(toDate(props.startDate)));
const matchingPreset = computed(() => presets.value.find(preset => isSameRule(preset.value, props.modelValue)));

// The value of the selected option: '' (does not repeat), a preset, or the event's own rule
const selectedValue = computed(() => {
  if (!props.modelValue) return '';
  return matchingPreset.value?.value ?? props.modelValue;
});

const selectedLabel = computed(() => {
  if (!props.modelValue) return t('doesNotRepeat');
  return matchingPreset.value?.title ?? formatRRule(props.modelValue);
});

const options = computed(() => [
  { value: '', title: t('doesNotRepeat') },
  // A rule the presets do not cover is listed too, so it stays selectable
  ...(props.modelValue && !matchingPreset.value ? [{ value: props.modelValue, title: formatRRule(props.modelValue) }] : []),
  ...presets.value,
  { value: CUSTOM, title: t('customRecurrence') }
]);

// Occurrences deleted from the series stay deleted when its rule changes
function saveRule(rule) {
  emit('update:modelValue', keepExceptionDates(rule, props.modelValue));
}

function choose(option) {
  menuOpen.value = false;
  if (option.value === CUSTOM) {
    showCustomRecurrence.value = true;
  } else if (option.value !== props.modelValue) {
    saveRule(option.value);
  }
}

// A preset follows the event's date: "Weekly on Wednesday" becomes "Weekly on Thursday".
// Only when the date alone changes, not when the dialog opens another event.
watch(() => [props.startDate, props.modelValue], ([startDate, rule], [previousStartDate, previousRule]) => {
  const date = toDate(startDate);
  const previousDate = toDate(previousStartDate);
  if (rule !== previousRule || !date || !previousDate || date.equals(previousDate)) return;
  const index = presetsFor(previousDate).findIndex(preset => isSameRule(preset.value, rule));
  if (index !== -1) {
    saveRule(presetsFor(date)[index].value);
  }
});
</script>

<style>
/* The menu is moved to the end of the page, so this style is not scoped. It has a fixed
   width that fits narrow screens: sized by its content, it can keep resizing and moving
   when it is nearly as wide as the screen. Long choices wrap instead of being cut off. */
.repeat-menu {
  width: min(340px, calc(100vw - 32px));
}

.repeat-menu .v-list-item-title {
  white-space: normal;
}

/* The link's own style, when the component is used without a linkClass */
.repeat-select-link {
  color: rgb(var(--v-theme-primary));
  font-size: 0.875rem;
  text-decoration: none;
}

.repeat-select-link:hover {
  text-decoration: underline;
}
</style>
