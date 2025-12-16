# Quick Theme Customization Examples

<!-- markdownlint-disable MD022 MD031 MD032 -->

## Example 1: Using Built-in Theme Presets

```vue
<template>
  <div>
    <!-- Toggle between light and dark mode -->
    <button @click="isDark = !isDark">
      {{ isDark ? '☀️ Light Mode' : '🌙 Dark Mode' }}
    </button>
    
    <GoogleCalendar 
      :calendar-app="calendarApp" 
      :theme="isDark ? THEME_PRESETS.dark : THEME_PRESETS.default" 
    />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { createCalendar, GoogleCalendar, THEME_PRESETS } from '@zehenrique/vue-google-calendar';

const isDark = ref(false);

const calendarApp = createCalendar({
  views: [createViewDay(), createViewWeek(), createViewMonth()],
  events: []
});
</script>
```

## Example 2: Custom Brand Colors

```vue
<template>
  <GoogleCalendar :calendar-app="calendarApp" :theme="brandTheme" />
</template>

<script setup>
import { createCalendar, GoogleCalendar } from '@zehenrique/vue-google-calendar';

// Your company's brand colors
const brandTheme = {
  '--calendar-primary-color': '#ff5722',      // Your brand orange
  '--calendar-today-bg': '#ff5722',
  '--calendar-header-bg': '#fff3e0',          // Light orange background
  '--calendar-border-color': '#ffe0b2',
  '--calendar-font-family': '"Montserrat", sans-serif'
};

const calendarApp = createCalendar({
  views: [createViewDay(), createViewWeek(), createViewMonth()],
  events: []
});
</script>
```

## Example 3: Partial Theme Override

```vue
<template>
  <GoogleCalendar :calendar-app="calendarApp" :theme="customTheme" />
</template>

<script setup>
import { createCalendar, GoogleCalendar } from '@zehenrique/vue-google-calendar';

// Only change what you need - rest stays default
const customTheme = {
  '--calendar-primary-color': '#9c27b0',      // Purple accent
  '--calendar-today-bg': '#9c27b0'
  // Everything else uses default values
};

const calendarApp = createCalendar({
  views: [createViewDay(), createViewWeek(), createViewMonth()],
  events: []
});
</script>
```

## Example 4: CSS Override Method

```vue
<template>
  <div class="my-app">
    <GoogleCalendar :calendar-app="calendarApp" />
  </div>
</template>

<script setup>
import { createCalendar, GoogleCalendar } from '@zehenrique/vue-google-calendar';

const calendarApp = createCalendar({
  views: [createViewDay(), createViewWeek(), createViewMonth()],
  events: []
});
</script>

<style>
/* Override styles via CSS */
.my-app .google-calendar {
  --calendar-primary-color: #00bcd4;
  --calendar-today-bg: #00bcd4;
  --calendar-border-radius: 12px;
  --calendar-font-family: 'Inter', system-ui, sans-serif;
}
</style>
```

## Example 5: Responsive Theme (Different on Mobile)

```vue
<template>
  <GoogleCalendar :calendar-app="calendarApp" :theme="responsiveTheme" />
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { createCalendar, GoogleCalendar, THEME_PRESETS } from '@zehenrique/vue-google-calendar';

const isMobile = ref(false);

const responsiveTheme = computed(() => {
  return isMobile.value 
    ? THEME_PRESETS.compact  // Compact theme on mobile
    : THEME_PRESETS.default; // Default theme on desktop
});

onMounted(() => {
  const checkMobile = () => {
    isMobile.value = window.innerWidth < 768;
  };
  checkMobile();
  window.addEventListener('resize', checkMobile);
  
  onBeforeUnmount(() => {
    window.removeEventListener('resize', checkMobile);
  });
});

const calendarApp = createCalendar({
  views: [createViewDay(), createViewWeek(), createViewMonth()],
  events: []
});
</script>
```

## Example 6: Merge Custom Theme with Preset

```vue
<template>
  <GoogleCalendar :calendar-app="calendarApp" :theme="customDarkTheme" />
</template>

<script setup>
import { createCalendar, GoogleCalendar, THEME_PRESETS, mergeTheme } from '@zehenrique/vue-google-calendar';

// Start with dark theme, customize specific properties
const customDarkTheme = mergeTheme({
  ...THEME_PRESETS.dark,
  '--calendar-primary-color': '#bb86fc',  // Purple accent for dark mode
  '--calendar-today-bg': '#bb86fc'
});

const calendarApp = createCalendar({
  views: [createViewDay(), createViewWeek(), createViewMonth()],
  events: []
});
</script>
```

## Available Theme Presets

```javascript
import { THEME_PRESETS } from '@zehenrique/vue-google-calendar';

// Available presets:
THEME_PRESETS.default        // Standard light theme
THEME_PRESETS.dark           // Dark mode
THEME_PRESETS.compact        // Smaller spacing/sizing
THEME_PRESETS.highContrast   // High contrast for accessibility
```

## All Customizable Properties

See `docs/STYLING.md` for the complete list of 100+ CSS custom properties you can customize, including:

- **Colors**: Backgrounds, borders, text, accents
- **Typography**: Fonts, sizes, weights
- **Spacing**: Padding, margins, gaps
- **Sizing**: Dimensions, heights, widths
- **Borders**: Radius values
- **Transitions**: Animation durations
- **Mobile**: Mobile-specific overrides

## Quick Property Reference

### Most Commonly Customized

```javascript
{
  // Primary accent color
  '--calendar-primary-color': '#1a73e8',
  '--calendar-today-bg': '#1a73e8',
  
  // Backgrounds
  '--calendar-bg': '#ffffff',
  '--calendar-header-bg': '#f8f9fa',
  
  // Text colors
  '--calendar-text-primary': '#3c4043',
  '--calendar-text-secondary': '#70757a',
  
  // Borders
  '--calendar-border-color': '#e0e0e0',
  
  // Typography
  '--calendar-font-family': '"Google Sans", "Roboto", Arial, sans-serif',
  '--calendar-font-size-base': '14px',
  
  // Spacing
  '--calendar-spacing-md': '8px',
  
  // Sizing
  '--calendar-pixels-per-hour-week': '60px',
  '--calendar-border-radius': '4px'
}
```

## Resources

- [Complete Styling Guide](./docs/STYLING.md) - Full documentation with all properties
- [API Documentation](./docs/API.md) - Component API reference
- [Live Demo](./theme-examples.html) - Interactive theme switcher
