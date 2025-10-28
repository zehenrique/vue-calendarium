<template>
  <div 
    v-if="modelValue && event" 
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4" 
    style="z-index: 1000;" 
    @click="handleClose" 
    role="dialog" 
    aria-modal="true" 
    :aria-label="t('eventDetails')"
  >
    <div class="bg-white rounded-lg shadow-2xl max-w-md w-full overflow-hidden" @click.stop>
      <!-- Color bar -->
      <div class="h-2" :style="{ backgroundColor: event?.color || '#1967d2' }"></div>
      
      <!-- Header -->
      <div class="p-6">
        <div class="flex items-start justify-between mb-4">
          <h2 class="text-2xl font-normal text-gray-900 flex-1">{{ event?.title }}</h2>
          <button 
            @click="handleClose" 
            class="text-gray-400 hover:text-gray-600 rounded-full p-2 hover:bg-gray-100 -mt-2 -mr-2" 
            :aria-label="t('close')"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
        
        <!-- Event details -->
        <div class="space-y-3">
          <div class="flex items-start">
            <svg class="w-5 h-5 text-gray-500 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <div class="flex-1">
              <p class="text-sm text-gray-700 leading-relaxed">{{ timeRange }}</p>
              <p v-if="event?.repeat && event.repeat !== 'none'" class="text-xs text-gray-500 mt-1">
                Repeats {{ repeatText }}
              </p>
            </div>
          </div>
          
          <div v-if="calendarName" class="flex items-start">
            <svg class="w-5 h-5 text-gray-500 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
            <p class="text-sm text-gray-700">{{ calendarName }}</p>
          </div>
        </div>
      </div>
      
      <!-- Actions -->
      <div class="flex items-center justify-end space-x-2 px-6 py-4 bg-gray-50 border-t">
        <button 
          @click="handleDelete" 
          class="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 rounded transition-colors"
        >
          {{ t('delete') }}
        </button>
        <button 
          @click="handleEdit" 
          class="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors"
        >
          {{ t('edit') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { Temporal } from '@js-temporal/polyfill';

export default {
  name: 'EventDetailModal',
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
      default: () => []
    },
    locale: {
      type: String,
      default: 'en-US'
    }
  },
  emits: ['update:modelValue', 'edit', 'delete'],
  setup(props, { emit }) {
    const { t } = useI18n();

    const timeRange = computed(() => {
      if (!props.event) return '';
      if (props.event.allDay) return t('allDay');
      
      const start = Temporal.PlainDateTime.from(props.event.start);
      const end = props.event.end ? Temporal.PlainDateTime.from(props.event.end) : start.add({ hours: 1 });
      
      const startStr = start.toLocaleString(props.locale, {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
      
      const endStr = end.toLocaleString(props.locale, {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
      
      const dateStr = start.toLocaleString(props.locale, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      
      return `${dateStr}, ${startStr} – ${endStr}`;
    });

    const repeatText = computed(() => {
      if (!props.event?.repeat || props.event.repeat === 'none') return '';
      const repeatKey = 'repeat' + props.event.repeat.charAt(0).toUpperCase() + props.event.repeat.slice(1);
      return t(repeatKey).toLowerCase();
    });

    const calendarName = computed(() => {
      if (!props.event?.calendar) return '';
      const calendar = props.calendars.find(c => c.id === props.event.calendar);
      return calendar ? calendar.name : props.event.calendar;
    });

    const handleClose = () => {
      emit('update:modelValue', false);
    };

    const handleEdit = () => {
      emit('edit', props.event);
    };

    const handleDelete = () => {
      emit('delete', props.event);
    };

    return {
      t,
      timeRange,
      repeatText,
      calendarName,
      handleClose,
      handleEdit,
      handleDelete
    };
  }
};
</script>

<style>
/* Modal uses Tailwind utilities - no scoped styles needed */
</style>
