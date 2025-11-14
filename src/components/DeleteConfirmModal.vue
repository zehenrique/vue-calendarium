<template>
  <v-dialog :model-value="modelValue" @update:model-value="handleCancel" max-width="520" persistent scrim="rgba(0, 0, 0, 0.5)" data-testid="delete-confirm-modal">
    <v-card class="pa-0" rounded="xl">
      <v-card-title class="px-6 pt-6 pb-4">
        <v-icon color="error" size="24" class="mr-3">mdi-alert-circle-outline</v-icon>
        <span class="text-h6 font-weight-medium">{{ t('confirmDeleteTitle') }}</span>
      </v-card-title>
      <v-card-text class="px-6 pb-6">
        <div v-if="isRecurring" class="mb-4">
          <div class="text-body-1 mb-3">{{ t('confirmDeleteRecurring') }}</div>
          <v-radio-group v-model="deleteOption">
            <v-radio :label="t('deleteThisEvent')" value="single"></v-radio>
            <v-radio :label="t('deleteAllEvents')" value="all"></v-radio>
          </v-radio-group>
        </div>
        <div v-else class="text-body-1">{{ t('confirmDelete') }}</div>
      </v-card-text>
      <v-card-actions class="px-6 pb-6 pt-0">
        <v-spacer></v-spacer>
        <v-btn variant="text" @click="handleCancel" class="mr-2">
          {{ t('no') }}
        </v-btn>
        <v-btn color="error" variant="flat" @click="handleConfirm">
          {{ t('yes') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

export default {
  name: 'DeleteConfirmModal',
  props: {
    modelValue: {
      type: Boolean,
      required: true
    },
    event: {
      type: Object,
      default: null
    }
  },
  emits: ['update:modelValue', 'confirm'],
  setup(props, { emit }) {
    const { t } = useI18n();
    const deleteOption = ref('single');

    const isRecurring = ref(false);

    // Watch event to determine if it's recurring
    watch(() => props.event, (newEvent) => {
      if (newEvent) {
        // Check if event has RRULE or if it's an occurrence of a recurring event
        isRecurring.value = !!(newEvent.rrule || newEvent.recurringEventId);
        deleteOption.value = 'single'; // Default to single
      } else {
        isRecurring.value = false;
      }
    }, { immediate: true });

    const handleCancel = () => {
      emit('update:modelValue', false);
    };

    const handleConfirm = () => {
      emit('confirm', {
        deleteAll: isRecurring.value && deleteOption.value === 'all'
      });
      emit('update:modelValue', false);
    };

    return {
      t,
      isRecurring,
      deleteOption,
      handleCancel,
      handleConfirm
    };
  }
};
</script>
