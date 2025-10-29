<template>
  <v-dialog
    :model-value="modelValue"
    @update:model-value="handleCancel"
    max-width="400"
    persistent
  >
    <v-card>
      <v-card-title>{{ t('confirmDeleteTitle') }}</v-card-title>
      <v-card-text>{{ t('confirmDelete') }}</v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn text @click="handleCancel">{{ t('no') }}</v-btn>
        <v-btn color="error" variant="elevated" @click="handleConfirm">{{ t('yes') }}</v-btn>
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
