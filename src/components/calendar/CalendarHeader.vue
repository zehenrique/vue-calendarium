<template>
  <div class="calendar-header">
    <div class="header-left">
      <button
        v-if="isMobile"
        class="mobile-menu-btn"
        type="button"
        :aria-label="t('menu')"
        @click="$emit('toggle-sidebar')"
      >
        <slot name="menu-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          <span class="sr-only">{{ t('menu') }}</span>
        </slot>
      </button>
      <button
        v-if="!isMobile"
        class="nav-btn"
        type="button"
        :aria-label="t('previous')"
        @click="$emit('previous')"
      >
        <slot name="previous-icon">
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path fill="currentColor" d="M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
          </svg>
          <span class="sr-only">{{ t('previous') }}</span>
        </slot>
      </button>
      <button
        v-if="!isMobile"
        class="nav-btn"
        type="button"
        :aria-label="t('next')"
        @click="$emit('next')"
      >
        <slot name="next-icon">
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path fill="currentColor" d="m10 6-1.41 1.41L13.17 12l-4.58 4.59L10 18l6-6z" />
          </svg>
          <span class="sr-only">{{ t('next') }}</span>
        </slot>
      </button>
      <button class="today-btn" type="button" @click="$emit('today')">
        {{ t('today') }}
      </button>
      <h1 class="calendar-title">{{ currentTitle }}</h1>
    </div>
    <div
      v-if="!isMobile"
      class="header-right"
    >
      <div class="view-selector">
        <button
          v-for="view in views"
          :key="view"
          type="button"
          class="view-btn"
          :class="{ active: view === currentView }"
          :aria-label="`${t(view)} ${t('view')}`"
          :aria-pressed="view === currentView"
          @click="$emit('view-change', view)"
        >
          {{ t(view) }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  currentTitle: {
    type: String,
    default: ''
  },
  currentView: {
    type: String,
    default: 'month'
  },
  views: {
    type: Array,
    default: () => ['day', 'week', 'month']
  },
  isMobile: {
    type: Boolean,
    default: false
  },
  t: {
    type: Function,
    required: true
  }
});
</script>

<style scoped>
.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #d0d0d0;
  flex-wrap: wrap;
  gap: 12px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.nav-btn {
  width: 36px;
  height: 36px;
  border: none;
  background: none;
  cursor: pointer;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #5f6368;
  transition: background-color 0.2s;
}

.nav-btn:hover {
  background-color: #e0e0e0;
}

.today-btn {
  padding: 8px 16px;
  border: 1px solid #d0d0d0;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: #3c4043;
  transition: background-color 0.2s, box-shadow 0.2s;
}

.today-btn:hover {
  background-color: #f8f9fa;
  box-shadow: 0 1px 2px 0 rgba(60,64,67,.3), 0 1px 3px 1px rgba(60,64,67,.15);
}

.calendar-title {
  font-size: 22px;
  font-weight: 400;
  color: #3c4043;
  margin: 0;
}

.view-selector {
  display: flex;
  border: 1px solid #d0d0d0;
  border-radius: 4px;
  overflow: hidden;
}

.view-btn {
  padding: 8px 16px;
  border: none;
  background: white;
  cursor: pointer;
  font-size: 14px;
  color: #3c4043;
  border-right: 1px solid #d0d0d0;
  transition: background-color 0.2s;
}

.view-btn:last-child {
  border-right: none;
}

.view-btn:hover {
  background-color: #f8f9fa;
}

.view-btn.active {
  background-color: #e8f0fe;
  color: #1967d2;
  font-weight: 500;
}

.mobile-menu-btn {
  padding: 8px;
  border: none;
  background: none;
  cursor: pointer;
  color: #5f6368;
  border-radius: 50%;
  transition: background-color 0.2s;
  margin-right: 8px;
}

.mobile-menu-btn:hover {
  background-color: #f8f9fa;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  border: 0;
}

@media (max-width: 768px) {
  .calendar-header {
    padding: 16px 12px;
  }
  
  .calendar-title {
    font-size: 18px;
  }
  
  .today-btn {
    padding: 6px 12px;
    font-size: 13px;
  }
}
</style>
