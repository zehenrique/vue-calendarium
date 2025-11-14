<template>
  <v-navigation-drawer :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)" location="left" temporary touchless width="280" class="mobile-sidebar">
    <v-list class="py-2">
      <v-list-item class="px-4 py-3">
        <template v-slot:prepend>
          <span class="text-h6 font-weight-medium">{{ t('menu') }}</span>
        </template>
        <template v-slot:append>
          <v-btn icon variant="text" size="small" @click="handleClose" :aria-label="t('close')">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </template>
      </v-list-item>
    </v-list>

    <v-divider class="my-2"></v-divider>

    <!-- View Selector -->
    <v-list-subheader class="px-4 py-2 text-caption font-weight-medium">{{ t('view') }}</v-list-subheader>
    <v-list density="comfortable" class="py-0">
      <v-list-item v-for="view in views" :key="view" :active="currentView === view" :data-testid="`sidebar-view-${view}`" @click="handleViewChange(view)" :aria-label="`Switch to ${t(view)} view`" class="px-4 my-1" rounded="lg">
        <v-list-item-title class="text-body-2">{{ t(view) }}</v-list-item-title>
      </v-list-item>
    </v-list>

    <v-divider class="my-2"></v-divider>

    <!-- Calendars -->
    <v-list-subheader class="px-4 py-2 text-caption font-weight-medium">{{ t('calendars') }}</v-list-subheader>
    <v-list density="comfortable" class="py-0">
      <v-list-item
        v-for="calendar in calendars"
        :key="calendar.id"
        @click="toggleCalendar(calendar.id)"
        class="px-4 my-1"
        rounded="lg"
      >
        <template v-slot:prepend>
          <v-checkbox :model-value="isCalendarVisible(calendar.id)" :color="calendar.color" density="compact" hide-details class="calendar-checkbox" @click.stop="toggleCalendar(calendar.id)"></v-checkbox>
        </template>
        <template v-slot:default>
          <div class="d-flex align-center">
            <v-avatar :color="calendar.color" size="12" class="mr-3"></v-avatar>
            <v-list-item-title class="text-body-2">{{ calendar.name }}</v-list-item-title>
          </div>
        </template>
      </v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>

<script>
import { useI18n } from 'vue-i18n';
import { onMounted, onUnmounted, watch, ref } from 'vue';

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
    },
    visibleCalendars: {
      type: Array,
      default: () => []
    }
  },
  emits: ['update:modelValue', 'view-change', 'update:visibleCalendars'],
  setup(props, { emit }) {
    const { t } = useI18n();
    let hammer = null;
    
    // Initialize visible calendars with all calendars if not provided
    const localVisibleCalendars = ref(
      props.visibleCalendars.length > 0 
        ? [...props.visibleCalendars] 
        : props.calendars.map(c => c.id)
    );

    // Watch for external changes to visibleCalendars prop
    watch(() => props.visibleCalendars, (newVal) => {
      if (newVal.length > 0) {
        localVisibleCalendars.value = [...newVal];
      }
    });

    const handleClose = () => {
      emit('update:modelValue', false);
    };

    const handleViewChange = (view) => {
      emit('view-change', view);
      handleClose();
    };

    const isCalendarVisible = (calendarId) => {
      return localVisibleCalendars.value.includes(calendarId);
    };

    const toggleCalendar = (calendarId) => {
      const index = localVisibleCalendars.value.indexOf(calendarId);
      if (index > -1) {
        localVisibleCalendars.value = localVisibleCalendars.value.filter(id => id !== calendarId);
      } else {
        localVisibleCalendars.value = [...localVisibleCalendars.value, calendarId];
      }
      emit('update:visibleCalendars', localVisibleCalendars.value);
    };

    const initializeSwipeToClose = () => {
      if (typeof window === 'undefined' || !window.Hammer || !props.modelValue) return;

      // Clean up existing instance first
      cleanupSwipe();

  const sidebar = document.querySelector('.mobile-sidebar');
      if (!sidebar) return;

      hammer = new window.Hammer(sidebar);
      
      // Configure swipe left to close
      hammer.get('swipe').set({ 
        direction: window.Hammer.DIRECTION_HORIZONTAL,
        threshold: 30,
        velocity: 0.3
      });

      // Configure pan for visual feedback
      hammer.get('pan').set({
        direction: window.Hammer.DIRECTION_HORIZONTAL,
        threshold: 10
      });

      let isPanning = false;
      let swipeHandled = false;

      hammer.on('panstart', (event) => {
        isPanning = true;
        swipeHandled = false;
        sidebar.style.transition = 'none';
        event.srcEvent.stopPropagation();
      });

      hammer.on('panmove', (event) => {
        if (!isPanning) return;
        
        event.srcEvent.stopPropagation();
        
        // Only allow dragging left (closing direction)
        const deltaX = Math.min(0, event.deltaX);
        sidebar.style.transform = `translateX(${deltaX}px)`;
      });

      hammer.on('panend', (event) => {
        if (!isPanning || swipeHandled) return;
        
        isPanning = false;
        event.srcEvent.stopPropagation();
        
        sidebar.style.transition = 'transform 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)';

        // Close if dragged more than 50% or fast swipe left
        if (event.deltaX < -128 || (event.velocityX < -0.3 && event.deltaX < -30)) {
          // Trigger haptic feedback
          if (window.navigator && window.navigator.vibrate) {
            window.navigator.vibrate(10);
          }
          handleClose();
        } else {
          // Snap back
          sidebar.style.transform = '';
        }
      });

      hammer.on('swipeleft', (event) => {
        swipeHandled = true;
        event.srcEvent.stopPropagation();
        // Trigger haptic feedback
        if (window.navigator && window.navigator.vibrate) {
          window.navigator.vibrate(10);
        }
        handleClose();
      });
    };

    const cleanupSwipe = () => {
      if (hammer) {
        hammer.destroy();
        hammer = null;
      }
    };

    // Initialize swipe when sidebar opens
    watch(() => props.modelValue, (isOpen) => {
      if (isOpen) {
        // Use longer timeout to ensure DOM is fully rendered and transitions complete
        setTimeout(initializeSwipeToClose, 150);
      } else {
        cleanupSwipe();
      }
    });

    onMounted(() => {
      if (props.modelValue) {
        setTimeout(initializeSwipeToClose, 150);
      }
    });

    onUnmounted(() => {
      cleanupSwipe();
    });

    return {
      t,
      handleClose,
      handleViewChange,
      isCalendarVisible,
      toggleCalendar
    };
  }
};
</script>

<style scoped>
.mobile-sidebar {
  background: #ffffff;
}

.calendar-checkbox {
  margin-right: 8px;
}

.calendar-checkbox :deep(.v-selection-control) {
  min-height: 32px;
}

.v-list-item {
  transition: background-color 0.2s;
}

.v-list-item:hover {
  background-color: rgba(0, 0, 0, 0.04);
}

.v-list-item.v-list-item--active {
  background-color: rgba(25, 103, 210, 0.12);
}

.v-list-subheader {
  color: rgba(0, 0, 0, 0.6);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
</style>
