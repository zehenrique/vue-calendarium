<template>
  <div 
    v-if="modelValue" 
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4" 
    style="z-index: 1001;" 
    @click="handleCancel" 
    role="dialog" 
    aria-modal="true" 
    :aria-label="t('confirmDeleteTitle')"
  >
    <div class="bg-white rounded-lg shadow-2xl max-w-sm w-full p-6" @click.stop>
      <h3 class="text-lg font-medium text-gray-900 mb-4">{{ t('confirmDeleteTitle') }}</h3>
      <p class="text-sm text-gray-600 mb-6">{{ t('confirmDelete') }}</p>
      <div class="flex justify-end space-x-3">
        <button 
          @click="handleCancel" 
          class="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded transition-colors"
        >
          {{ t('no') }}
        </button>
        <button 
          @click="handleConfirm" 
          class="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded transition-colors"
        >
          {{ t('yes') }}
        </button>
      </div>
    </div>
  </div>
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

<style>
/* Modal uses Tailwind utilities - no scoped styles needed */
</style>
