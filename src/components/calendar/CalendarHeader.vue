<template>
  <v-sheet
    class="calendar-header"
    elevation="0"
    :class="{ 'header-sticky': true }"
  >
    <div class="header-content">
      <div class="header-left">
        <v-btn
          v-if="isMobile"
          icon
          variant="text"
          :aria-label="t('menu')"
          @click="$emit('toggle-sidebar')"
        >
          <v-icon>mdi-menu</v-icon>
        </v-btn>
        <v-btn
          v-if="!isMobile"
          icon
          variant="text"
          :aria-label="t('previous')"
          @click="$emit('previous')"
        >
          <v-icon>mdi-chevron-left</v-icon>
        </v-btn>
        <v-btn
          v-if="!isMobile"
          icon
          variant="text"
          :aria-label="t('next')"
          @click="$emit('next')"
        >
          <v-icon>mdi-chevron-right</v-icon>
        </v-btn>
        <v-btn
          variant="outlined"
          @click="$emit('today')"
        >
          {{ t('today') }}
        </v-btn>
        <h1 class="calendar-title text-h6">{{ currentTitle }}</h1>
      </div>
      <div v-if="!isMobile" class="header-right">
        <v-btn-toggle
          :model-value="currentView"
          mandatory
          variant="outlined"
          divided
          @update:model-value="$emit('view-change', $event)"
        >
          <v-btn
            v-for="view in views"
            :key="view"
            :value="view"
            :aria-label="`${t(view)} ${t('view')}`"
          >
            {{ t(view) }}
          </v-btn>
        </v-btn-toggle>
      </div>
    </div>
  </v-sheet>
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
  border-bottom: 1px solid #e0e0e0;
}

.header-sticky {
  position: sticky;
  top: 0;
  z-index: 10;
  background: white;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  gap: 12px;
  flex-wrap: wrap;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.calendar-title {
  margin: 0;
  font-weight: 400;
  color: #3c4043;
}

@media (max-width: 768px) {
  .header-content {
    padding: 12px 16px;
  }
  
  .calendar-title {
    font-size: 1.1rem;
  }
}
</style>
