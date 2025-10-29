<template>
  <v-dialog
    :model-value="modelValue"
    @update:model-value="handleCancel"
    max-width="400"
    persistent
    data-testid="delete-confirm-modal"
  >
    <v-card class="pa-0">
      <v-card-title class="px-6 pt-6 pb-4">
        <v-icon color="error" size="24" class="mr-3">mdi-alert-circle-outline</v-icon>
        <span class="text-h6 font-weight-medium">{{ t('confirmDeleteTitle') }}</span>
      </v-card-title>
      <v-card-text class="px-6 pb-6">
        <div class="text-body-1">{{ t('confirmDelete') }}</div>
      </v-card-text>
      <v-card-actions class="px-6 pb-6 pt-0">
        <v-spacer></v-spacer>
        <v-btn
          variant="text"
          @click="handleCancel"
          class="mr-2"
        >
          {{ t('no') }}
        </v-btn>
        <v-btn
          color="error"
          variant="filled"
          @click="handleConfirm"
        >
          {{ t('yes') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { useI18n } from 'vue-i18n';

export default {
  name: 'DeleteConfirmModal',
  props: {
    modelValue: {
      type: Boolean,
      required: true
    }
  },
  emits: ['update:modelValue', 'confirm'],
  setup(props, { emit }) {
    const { t } = useI18n();

    const handleCancel = () => {
      emit('update:modelValue', false);
    };

    const handleConfirm = () => {
      emit('confirm');
      emit('update:modelValue', false);
    };

    return {
      t,
      handleCancel,
      handleConfirm
    };
  }
};
</script>
