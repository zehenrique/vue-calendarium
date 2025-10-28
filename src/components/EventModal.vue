<template>
  <div 
    v-if="modelValue" 
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4" 
    style="z-index: 1000;" 
    @click="handleClose" 
    role="dialog" 
    aria-modal="true" 
    :aria-label="t('createEvent')"
  >
    <div 
      class="bg-white rounded-lg shadow-2xl max-w-lg w-full overflow-hidden" 
      style="max-height: 90vh; display: flex; flex-direction: column;" 
      @click.stop
    >
      <!-- Modal header -->
      <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200">
        <h2 class="text-xl font-medium text-gray-900">{{ t('newEvent') }}</h2>
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
      
      <!-- Modal body -->
      <div class="p-6 space-y-4 overflow-y-auto" style="flex: 1;">
        <!-- Event title -->
        <div class="space-y-2">
          <label for="event-title" class="block text-sm font-medium text-gray-700">{{ t('eventTitle') }}</label>
          <input 
            id="event-title"
            v-model="eventData.title" 
            type="text" 
            :placeholder="t('eventTitle')"
            class="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            required
          />
        </div>
        
        <!-- Date and time inputs -->
        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-2">
            <label for="start-date" class="block text-sm font-medium text-gray-700">{{ t('startDate') }}</label>
            <input 
              id="start-date"
              v-model="eventData.startDate" 
              type="date"
              class="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
          <div class="space-y-2">
            <label for="start-time" class="block text-sm font-medium text-gray-700">{{ t('startTime') }}</label>
            <input 
              id="start-time"
              v-model="eventData.startTime" 
              type="time"
              class="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
        </div>
        
        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-2">
            <label for="end-date" class="block text-sm font-medium text-gray-700">{{ t('endDate') }}</label>
            <input 
              id="end-date"
              v-model="eventData.endDate" 
              type="date"
              class="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
          <div class="space-y-2">
            <label for="end-time" class="block text-sm font-medium text-gray-700">{{ t('endTime') }}</label>
            <input 
              id="end-time"
              v-model="eventData.endTime" 
              type="time"
              class="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
        </div>
        
        <!-- Repeat -->
        <div class="space-y-2">
          <label for="event-repeat" class="block text-sm font-medium text-gray-700">{{ t('repeat') }}</label>
          <select 
            id="event-repeat" 
            v-model="eventData.repeat" 
            class="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
          >
            <option value="none">{{ t('repeatNone') }}</option>
            <option value="daily">{{ t('repeatDaily') }}</option>
            <option value="weekly">{{ t('repeatWeekly') }}</option>
            <option value="monthly">{{ t('repeatMonthly') }}</option>
            <option value="yearly">{{ t('repeatYearly') }}</option>
          </select>
        </div>
        
        <!-- Calendar selection -->
        <div class="space-y-2">
          <label for="event-calendar" class="block text-sm font-medium text-gray-700">{{ t('calendar') }}</label>
          <select 
            id="event-calendar" 
            v-model="eventData.calendar" 
            class="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
          >
            <option v-for="cal in calendars" :key="cal.id" :value="cal.id">
              {{ cal.name }}
            </option>
          </select>
        </div>
        
        <!-- Color picker -->
        <div class="space-y-2">
          <label for="event-color" class="block text-sm font-medium text-gray-700">{{ t('color') }}</label>
          <div class="flex items-center space-x-3">
            <input 
              id="event-color"
              v-model="eventData.color" 
              type="color"
              class="h-10 w-20 border border-gray-300 rounded cursor-pointer"
              :title="t('color')"
            />
            <div class="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm text-gray-600 font-mono">
              {{ eventData.color }}
            </div>
          </div>
        </div>
      </div>
      
      <!-- Modal footer -->
      <div class="flex items-center justify-end space-x-3 px-6 py-4 bg-gray-50 border-t border-gray-200">
        <button 
          @click="handleClose" 
          class="px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 rounded-md transition-colors"
        >
          {{ t('cancel') }}
        </button>
        <button 
          @click="handleSave" 
          class="px-5 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors shadow-sm"
        >
          {{ t('save') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

export default {
  name: 'EventModal',
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
    
    const eventData = ref({
      title: '',
      startDate: '',
      startTime: '09:00',
      endDate: '',
      endTime: '10:00',
      repeat: 'none',
      calendar: 'default',
      color: '#1967d2'
    });

    // Watch for event prop changes to update form
    watch(() => props.event, (newEvent) => {
      if (newEvent) {
        eventData.value = { ...newEvent };
      }
    }, { immediate: true, deep: true });

    const handleClose = () => {
      emit('update:modelValue', false);
    };

    const handleSave = () => {
      if (!eventData.value.title) {
        alert('Please enter an event title');
        return;
      }
      emit('save', { ...eventData.value });
      handleClose();
    };

    return {
      t,
      eventData,
      handleClose,
      handleSave
    };
  }
};
</script>

<style>
/* Modal uses Tailwind utilities - no scoped styles needed */
</style>
