<template>
  <transition name="fade">
    <div 
      v-if="modelValue" 
      class="fixed inset-0 bg-black bg-opacity-50" 
      style="z-index: 900;" 
      @click="handleClose"
    >
      <transition name="slide">
        <div 
          class="mobile-sidebar fixed left-0 top-0 bottom-0 w-64 bg-white shadow-2xl overflow-y-auto" 
          style="z-index: 901;" 
          @click.stop
        >
          <div class="p-4 border-b border-gray-200 flex items-center justify-between">
            <h2 class="text-lg font-medium text-gray-900">{{ t('menu') }}</h2>
            <button 
              @click="handleClose" 
              class="text-gray-400 hover:text-gray-600 rounded-full p-2 hover:bg-gray-100" 
              :aria-label="t('close')"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
          
          <!-- View Selector -->
          <div class="p-4 border-b border-gray-200">
            <h3 class="text-sm font-medium text-gray-700 mb-3">{{ t('view') }}</h3>
            <div class="space-y-2">
              <button 
                v-for="view in views" 
                :key="view"
                :class="['w-full text-left px-4 py-2 rounded-md transition-all', 
                        currentView === view ? 'bg-blue-100 text-blue-700 font-medium' : 'text-gray-700 hover:bg-gray-100']"
                @click="handleViewChange(view)"
                :aria-label="`Switch to ${t(view)} view`"
              >
                {{ t(view) }}
              </button>
            </div>
          </div>
          
          <!-- Calendars -->
          <div class="p-4">
            <h3 class="text-sm font-medium text-gray-700 mb-3">{{ t('calendars') }}</h3>
            <div class="space-y-2">
              <div 
                v-for="calendar in calendars" 
                :key="calendar.id" 
                class="flex items-center space-x-3 px-2 py-2 rounded hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <div 
                  class="w-4 h-4 rounded-full flex-shrink-0 border border-gray-300" 
                  :style="{ backgroundColor: calendar.color }"
                ></div>
                <span class="text-sm text-gray-800">{{ calendar.name }}</span>
              </div>
            </div>
          </div>
        </div>
      </transition>
    </div>
  </transition>
</template>

<script>
import { useI18n } from 'vue-i18n';

export default {
  name: 'MobileSidebar',
  props: {
    modelValue: {
      type: Boolean,
      required: true
    },
    currentView: {
      type: String,
      required: true
    },
    views: {
      type: Array,
      default: () => ['day', 'week', 'month']
    },
    calendars: {
      type: Array,
      default: () => []
    }
  },
  emits: ['update:modelValue', 'view-change'],
  setup(props, { emit }) {
    const { t } = useI18n();

    const handleClose = () => {
      emit('update:modelValue', false);
    };

    const handleViewChange = (view) => {
      emit('view-change', view);
      handleClose();
    };

    return {
      t,
      handleClose,
      handleViewChange
    };
  }
};
</script>

<style scoped>
/* Mobile sidebar transitions */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

.slide-enter-active, .slide-leave-active {
  transition: transform 0.3s ease;
}

.slide-enter-from, .slide-leave-to {
  transform: translateX(-100%);
}
</style>
