<template>
  <!-- Desktop Dialog -->
  <v-dialog v-if="!mobile" :model-value="modelValue" @update:model-value="handleCancel" max-width="440" content-class="calendar-font-scope" persistent scrim="rgba(0, 0, 0, 0.5)" data-testid="recurrence-scope-modal">
    <v-card class="pa-0" rounded="xl">
      <v-card-title class="px-6 pt-6 pb-2">
        <span class="text-h6">{{ t('editRecurringTitle') }}</span>
      </v-card-title>
      <v-card-text class="px-6 pb-2">
        <v-radio-group v-model="scope" hide-details>
          <v-radio v-for="option in options" :key="option.value" :label="option.label" :value="option.value"></v-radio>
        </v-radio-group>
      </v-card-text>
      <v-card-actions class="px-6 pb-6 pt-2">
        <v-spacer></v-spacer>
        <v-btn variant="text" class="mr-2" @click="handleCancel">{{ t('cancel') }}</v-btn>
        <v-btn color="primary" variant="flat" @click="handleConfirm">{{ t('ok') }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Mobile Bottom Sheet -->
  <v-bottom-sheet v-if="mobile" :model-value="modelValue" @update:model-value="handleCancel" content-class="calendar-font-scope" persistent scrim="rgba(0, 0, 0, 0.5)" data-testid="recurrence-scope-modal-mobile">
    <v-card rounded="t-xl">
      <v-card-title class="px-4 pt-5 pb-2">
        <span class="text-h6">{{ t('editRecurringTitle') }}</span>
      </v-card-title>
      <v-card-text class="px-4 pb-2">
        <v-radio-group v-model="scope" hide-details>
          <v-radio v-for="option in options" :key="option.value" :label="option.label" :value="option.value"></v-radio>
        </v-radio-group>
      </v-card-text>
      <v-card-actions class="px-4 pb-6 pt-2">
        <v-spacer></v-spacer>
        <v-btn variant="text" class="mr-2" @click="handleCancel">{{ t('cancel') }}</v-btn>
        <v-btn color="primary" variant="flat" @click="handleConfirm">{{ t('ok') }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-bottom-sheet>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useDisplay } from 'vuetify';

/**
 * Asks which events of a repeating series a change applies to: this event, this and the
 * following events, or all events. Shown after editing or dragging a repeating event.
 */
const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true
  },
  // "This event" is not offered when the change is to how the series repeats
  allowThisEvent: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits(['update:modelValue', 'confirm', 'cancel']);

const { t } = useI18n();
const { mobile } = useDisplay();

const scope = ref('this');

const options = computed(() => [
  ...(props.allowThisEvent ? [{ value: 'this', label: t('scopeThisEvent') }] : []),
  { value: 'following', label: t('scopeFollowingEvents') },
  { value: 'all', label: t('scopeAllEvents') }
]);

// Start on the first choice each time the dialog opens
watch(() => props.modelValue, (isOpen) => {
  if (isOpen) scope.value = options.value[0].value;
});

function handleCancel() {
  emit('update:modelValue', false);
  emit('cancel');
}

function handleConfirm() {
  emit('update:modelValue', false);
  emit('confirm', scope.value);
}
</script>
