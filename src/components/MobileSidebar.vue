<template>
  <v-navigation-drawer :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)" location="left" temporary touchless width="280" class="mobile-sidebar">
    <template v-if="modelValue">
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

      <!-- Views -->
      <template v-if="shouldShowViewSelector">
        <v-list-subheader class="px-4 py-2 text-caption font-weight-medium">{{ t('views') }}</v-list-subheader>
        <v-list density="comfortable" class="py-0">
          <v-list-item v-for="view in views" :key="view" :data-testid="`sidebar-view-${view}`" class="px-4 my-1" rounded="lg" @click="selectView(view)">
            <template v-slot:prepend>
              <v-icon size="18">{{ getViewIcon(view) }}</v-icon>
            </template>
            <template v-slot:default>
              <v-list-item-title class="text-body-2">{{ t(view) }}</v-list-item-title>
            </template>
            <template v-slot:append>
              <v-icon v-if="currentView === view" size="18">mdi-check</v-icon>
            </template>
          </v-list-item>
        </v-list>

        <v-divider class="my-2"></v-divider>
      </template>

      <!-- Calendars -->
      <v-list-subheader class="px-4 py-2 text-caption font-weight-medium">{{ t('calendars') }}</v-list-subheader>
      <v-list density="comfortable" class="py-0">
        <v-list-item v-for="calendar in calendars" :key="calendar.id" @click="toggleCalendar(calendar.id)" class="px-4 my-1" rounded="lg">
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
    </template>
  </v-navigation-drawer>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

defineOptions({ name: 'MobileSidebar' });

const props = defineProps({
  modelValue: { type: Boolean, required: true },
  calendars: { type: Array, default: () => [] },
  visibleCalendars: { type: Array, default: () => [] },
  currentView: { type: String, default: 'month' },
  views: { type: Array, default: () => ['day', 'week', 'month'] },
  mobileViewSelectorPlacement: {
    type: String,
    default: 'sidebar'
  },
});

const shouldShowViewSelector = computed(() => props.mobileViewSelectorPlacement === 'sidebar');

const emit = defineEmits(['update:modelValue', 'update:visibleCalendars', 'view-change']);

const { t } = useI18n();
let hammer = null;

const localVisibleCalendars = ref(props.visibleCalendars.length > 0 ? [...props.visibleCalendars] : props.calendars.map(c => c.id));

watch(() => props.visibleCalendars, (newVal) => {
  if (newVal.length > 0) {
    localVisibleCalendars.value = [...newVal];
  }
});

watch(() => props.calendars, (newCalendars) => {
  if (props.visibleCalendars.length > 0) return;
  localVisibleCalendars.value = newCalendars.map(c => c.id);
}, { deep: true });

const views = computed(() => props.views);

function handleClose() {
  emit('update:modelValue', false);
}

function isCalendarVisible(calendarId) {
  return localVisibleCalendars.value.includes(calendarId);
}

function toggleCalendar(calendarId) {
  const index = localVisibleCalendars.value.indexOf(calendarId);
  if (index > -1) {
    localVisibleCalendars.value = localVisibleCalendars.value.filter(id => id !== calendarId);
  } else {
    localVisibleCalendars.value = [...localVisibleCalendars.value, calendarId];
  }
  emit('update:visibleCalendars', localVisibleCalendars.value);
}

function getViewIcon(view) {
  if (view === 'day') return 'mdi-view-day';
  if (view === 'week') return 'mdi-view-week';
  return 'mdi-view-module';
}

function selectView(view) {
  emit('view-change', view);
  handleClose();
}

function cleanupSwipe() {
  if (hammer) {
    hammer.destroy();
    hammer = null;
  }
}

function initializeSwipeToClose() {
  if (typeof window === 'undefined' || !window.Hammer || !props.modelValue) return;

  cleanupSwipe();
  const sidebar = document.querySelector('.mobile-sidebar');
  if (!sidebar) return;

  hammer = new window.Hammer(sidebar);

  hammer.get('swipe').set({
    direction: window.Hammer.DIRECTION_HORIZONTAL,
    threshold: 30,
    velocity: 0.3
  });

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
    const deltaX = Math.min(0, event.deltaX);
    sidebar.style.transform = `translateX(${deltaX}px)`;
  });

  hammer.on('panend', (event) => {
    if (!isPanning || swipeHandled) return;
    isPanning = false;
    event.srcEvent.stopPropagation();
    sidebar.style.transition = 'transform 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)';

    if (event.deltaX < -128 || (event.velocityX < -0.3 && event.deltaX < -30)) {
      if (window.navigator && window.navigator.vibrate) {
        window.navigator.vibrate(10);
      }
      handleClose();
    } else {
      sidebar.style.transform = '';
    }
  });

  hammer.on('swipeleft', (event) => {
    swipeHandled = true;
    event.srcEvent.stopPropagation();
    if (window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(10);
    }
    handleClose();
  });
}

watch(() => props.modelValue, (isOpen) => {
  if (isOpen) {
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

onBeforeUnmount(() => {
  cleanupSwipe();
});
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
