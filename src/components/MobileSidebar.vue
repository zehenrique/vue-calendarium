<template>
  <v-navigation-drawer
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    location="left"
    temporary
    touchless
    width="280"
  >
    <v-list>
      <v-list-item>
        <template v-slot:prepend>
          <span class="text-h6">{{ t('menu') }}</span>
        </template>
        <template v-slot:append>
          <v-btn
            icon
            variant="text"
            size="small"
            @click="handleClose"
            :aria-label="t('close')"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </template>
      </v-list-item>
    </v-list>

    <v-divider></v-divider>

    <!-- View Selector -->
    <v-list-subheader>{{ t('view') }}</v-list-subheader>
    <v-list density="compact">
      <v-list-item
        v-for="view in views"
        :key="view"
        :active="currentView === view"
        @click="handleViewChange(view)"
        :aria-label="`Switch to ${t(view)} view`"
      >
        <v-list-item-title>{{ t(view) }}</v-list-item-title>
      </v-list-item>
    </v-list>

    <v-divider></v-divider>

    <!-- Calendars -->
    <v-list-subheader>{{ t('calendars') }}</v-list-subheader>
    <v-list density="compact">
      <v-list-item
        v-for="calendar in calendars"
        :key="calendar.id"
      >
        <template v-slot:prepend>
          <v-avatar
            :color="calendar.color"
            size="16"
          ></v-avatar>
        </template>
        <v-list-item-title>{{ calendar.name }}</v-list-item-title>
      </v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>

<script>
import { useI18n } from 'vue-i18n';
import { onMounted, onUnmounted, watch } from 'vue';

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
    let hammer = null;

    const handleClose = () => {
      emit('update:modelValue', false);
    };

    const handleViewChange = (view) => {
      emit('view-change', view);
      handleClose();
    };

    const initializeSwipeToClose = () => {
      if (typeof window === 'undefined' || !window.Hammer || !props.modelValue) return;

      // Clean up existing instance first
      cleanupSwipe();

      const sidebar = document.querySelector('.v-navigation-drawer');
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
      handleViewChange
    };
  }
};
</script>
