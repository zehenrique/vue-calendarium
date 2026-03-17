# Calendar Styling Guide

<!-- markdownlint-disable MD022 MD031 MD032 -->

Complete guide to customizing the appearance of the Vue Google Calendar component.

## Table of Contents

- [Overview](#overview)
- [Quick Start](#quick-start)
- [Theme Configuration](#theme-configuration)
- [CSS Custom Properties Reference](#css-custom-properties-reference)
- [Theme Presets](#theme-presets)
- [Advanced Customization](#advanced-customization)
- [Examples](#examples)

## Overview

The calendar component is fully customizable through CSS custom properties (CSS variables). You have three ways to customize the appearance:

1. **Theme Object** - Pass a theme object as a prop to the component
2. **CSS Override** - Define CSS variables in your parent component's styles
3. **Theme Presets** - Use built-in theme presets (default, dark, compact, highContrast)

All styling values are centralized in `src/config/theme.js` and can be overridden without modifying the component source code.

## Quick Start

### Method 1: Using Theme Prop (Recommended)

```vue
<template>
  <Calendar :calendar-app="calendarApp" :theme="customTheme" />
</template>

<script setup>
import { createCalendar, createViewDay, createViewWeek, createViewMonth, Calendar } from '@zehenrique/vue-google-calendar';

const customTheme = {
  '--calendar-primary-color': '#e91e63',  // Pink primary color
  '--calendar-today-bg': '#e91e63',
  '--calendar-header-bg': '#fce4ec',
  '--calendar-border-color': '#f8bbd0'
};

const calendarApp = createCalendar({
  views: [createViewDay(), createViewWeek(), createViewMonth()],
  events: []
});
</script>
```

### Method 2: Using CSS Override

```vue
<template>
  <div class="my-calendar-wrapper">
    <Calendar :calendar-app="calendarApp" />
  </div>
</template>

<style>
.my-calendar-wrapper .google-calendar {
  --calendar-primary-color: #673ab7;  /* Purple theme */
  --calendar-today-bg: #673ab7;
  --calendar-header-bg: #ede7f6;
  --calendar-border-color: #d1c4e9;
  --calendar-font-family: 'Inter', 'Segoe UI', sans-serif;
}
</style>
```

### Method 3: Using Theme Presets

```vue
<template>
  <Calendar :calendar-app="calendarApp" :theme="THEME_PRESETS.dark" />
</template>

<script setup>
import { createCalendar, createViewDay, createViewWeek, createViewMonth, Calendar, THEME_PRESETS } from '@zehenrique/vue-google-calendar';

const calendarApp = createCalendar({
  views: [createViewDay(), createViewWeek(), createViewMonth()],
  events: []
});
</script>
```

## Theme Configuration

### Theme Object Structure

A theme object is a simple JavaScript object with CSS custom property names as keys:

```javascript
const myTheme = {
  // Colors
  '--calendar-bg': '#ffffff',
  '--calendar-primary-color': '#1a73e8',
  
  // Typography
  '--calendar-font-family': '"Helvetica Neue", Arial, sans-serif',
  '--calendar-font-size-base': '14px',
  
  // Spacing
  '--calendar-spacing-md': '8px',
  
  // ... any other CSS custom properties
};
```

### Merging with Default Theme

You only need to specify the properties you want to change. The component automatically merges your theme with the default theme:

```javascript
import { mergeTheme, DEFAULT_THEME } from '@zehenrique/vue-google-calendar';

const partialTheme = {
  '--calendar-primary-color': '#00bcd4'
};

const fullTheme = mergeTheme(partialTheme);
// fullTheme now contains all default values + your overrides
```

## CSS Custom Properties Reference

### Colors

| Property | Default | Description |
|----------|---------|-------------|
| `--calendar-bg` | `#ffffff` | Main background color |
| `--calendar-header-bg` | `#f8f9fa` | Header background color |
| `--calendar-day-bg` | `#ffffff` | Day cell background |
| `--calendar-day-other-month-bg` | `#fafafa` | Background for days from other months |
| `--calendar-day-hover-bg` | `#f8f9fa` | Hover background for interactive elements |
| `--calendar-border-color` | `#e0e0e0` | Primary border color |
| `--calendar-border-color-dark` | `#d0d0d0` | Darker border color for emphasis |
| `--calendar-text-primary` | `#3c4043` | Primary text color |
| `--calendar-text-secondary` | `#70757a` | Secondary/muted text color |
| `--calendar-text-disabled` | `#5f6368` | Disabled text color |
| `--calendar-primary-color` | `#1a73e8` | Primary accent color |
| `--calendar-primary-hover` | `#1557b0` | Primary color hover state |
| `--calendar-today-bg` | `#1a73e8` | Background for today indicator |
| `--calendar-today-color` | `#ffffff` | Text color for today indicator |
| `--calendar-current-time-color` | `#ea4335` | Current time indicator color |
| `--calendar-event-bg` | `#1967d2` | Default event background (fallback) |
| `--calendar-event-color` | `#ffffff` | Default event text color (fallback) |
| `--calendar-event-hover-opacity` | `0.8` | Event opacity on hover |
| `--calendar-ghost-event-opacity` | `0.5` | Opacity for preview/ghost events |

### Typography

| Property | Default | Description |
|----------|---------|-------------|
| `--calendar-font-family` | `'Google Sans', 'Roboto', 'Product Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif` | Font family |
| `--calendar-font-size-base` | `14px` | Base font size |
| `--calendar-font-size-small` | `12px` | Small font size |
| `--calendar-font-size-xsmall` | `11px` | Extra small font size |
| `--calendar-font-size-large` | `16px` | Large font size |
| `--calendar-font-size-title` | `1.25rem` | Title font size |
| `--calendar-font-weight-normal` | `400` | Normal font weight |
| `--calendar-font-weight-medium` | `500` | Medium font weight |

The `--calendar-font-family` variable is applied to the calendar surface and to teleported Vuetify overlays used by the header menus, dialogs, and bottom sheets, so one override keeps font rendering consistent across all component text.

### Spacing

| Property | Default | Description |
|----------|---------|-------------|
| `--calendar-spacing-xs` | `2px` | Extra small spacing |
| `--calendar-spacing-sm` | `4px` | Small spacing |
| `--calendar-spacing-md` | `8px` | Medium spacing |
| `--calendar-spacing-lg` | `12px` | Large spacing |
| `--calendar-spacing-xl` | `16px` | Extra large spacing |
| `--calendar-spacing-xxl` | `20px` | 2X large spacing |

### Sizing

| Property | Default | Description |
|----------|---------|-------------|
| `--calendar-header-padding` | `16px 20px` | Header padding |
| `--calendar-header-gap` | `12px` | Gap between header elements |
| `--calendar-time-column-width` | `60px` | Time column width (desktop) |
| `--calendar-time-column-width-mobile` | `50px` | Time column width (mobile) |
| `--calendar-day-number-size` | `24px` | Day number circle size |
| `--calendar-week-day-number-size` | `36px` | Week view day number size |
| `--calendar-pixels-per-hour-week` | `60px` | Hour slot height in week view |
| `--calendar-pixels-per-hour-day` | `45px` | Hour slot height in day view |
| `--calendar-pixels-per-hour-week-mobile` | `50px` | Hour slot height in week view (mobile) |
| `--calendar-pixels-per-hour-day-mobile` | `38px` | Hour slot height in day view (mobile) |
| `--calendar-mobile-bottom-padding` | `46px` | Extra bottom padding for Day/Week scroll containers on mobile to keep late hours visible above browser toolbars (added to `env(safe-area-inset-bottom)`) |

### Borders & Radius

| Property | Default | Description |
|----------|---------|-------------|
| `--calendar-border-radius` | `4px` | Base border radius |
| `--calendar-border-radius-sm` | `6px` | Small border radius |
| `--calendar-border-radius-md` | `8px` | Medium border radius |
| `--calendar-border-radius-lg` | `12px` | Large border radius |
| `--calendar-border-radius-circle` | `50%` | Circle border radius |

### Transitions

| Property | Default | Description |
|----------|---------|-------------|
| `--calendar-transition-fast` | `0.2s` | Fast transition duration |
| `--calendar-transition-medium` | `0.3s` | Medium transition duration |

### Z-Index

| Property | Default | Description |
|----------|---------|-------------|
| `--calendar-header-z-index` | `10` | Header z-index (sticky positioning) |
| `--calendar-event-z-index` | `1` | Event z-index |
| `--calendar-current-time-z-index` | `5` | Current time indicator z-index |

## Theme Presets

The component includes several built-in theme presets:

### Header Outlined Controls

The desktop header keeps the `Today` button, view selector, and date picker visually aligned by reusing the same outlined-control styling. These controls inherit the existing theme variables below, so overriding them keeps the header consistent without component-specific CSS overrides:

- `--calendar-border-color`
- `--calendar-text-primary`
- `--calendar-font-size-base`
- `--calendar-font-weight-normal`
- `--calendar-border-radius-lg`
- `--calendar-day-hover-bg`

### Default Theme

```javascript
import { THEME_PRESETS } from '@zehenrique/vue-google-calendar';

<Calendar :theme="THEME_PRESETS.default" />
```

Standard Google Calendar-inspired light theme.

### Dark Theme

```javascript
<Calendar :theme="THEME_PRESETS.dark" />
```

Dark mode with inverted colors for low-light environments:
- Dark backgrounds (`#202124`, `#292a2d`)
- Light text (`#e8eaed`, `#9aa0a6`)
- Adjusted borders for dark mode

### Compact Theme

```javascript
<Calendar :theme="THEME_PRESETS.compact" />
```

Reduced spacing and smaller dimensions:
- Smaller hour slots (48px vs 60px in week view)
- Reduced padding and gaps
- Smaller font sizes

### High Contrast Theme

```javascript
<Calendar :theme="THEME_PRESETS.highContrast" />
```

Enhanced accessibility with high contrast colors:
- Pure black text on white background
- Black borders for maximum visibility
- Ideal for users with visual impairments

## Advanced Customization

### Creating Custom Presets

```javascript
import { DEFAULT_THEME } from '@zehenrique/vue-google-calendar';

const BRAND_THEME = {
  ...DEFAULT_THEME,
  '--calendar-primary-color': '#ff5722',      // Brand orange
  '--calendar-today-bg': '#ff5722',
  '--calendar-header-bg': '#fff3e0',
  '--calendar-border-color': '#ffe0b2',
  '--calendar-font-family': '"Montserrat", sans-serif'
};

<Calendar :theme="BRAND_THEME" />
```

### Dynamic Theme Switching

```vue
<template>
  <div>
    <button @click="currentTheme = 'light'">Light</button>
    <button @click="currentTheme = 'dark'">Dark</button>
    
    <Calendar 
      :calendar-app="calendarApp" 
      :theme="themes[currentTheme]" 
    />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { THEME_PRESETS } from '@zehenrique/vue-google-calendar';

const currentTheme = ref('light');

const themes = {
  light: THEME_PRESETS.default,
  dark: THEME_PRESETS.dark
};
</script>
```

### Generating CSS from Theme

```javascript
import { generateThemeCSS, THEME_PRESETS } from '@zehenrique/vue-google-calendar';

// Generate CSS string
const cssString = generateThemeCSS(THEME_PRESETS.dark);

console.log(cssString);
// Output:
// .google-calendar {
//   --calendar-bg: #202124;
//   --calendar-header-bg: #292a2d;
//   ...
// }
```

### Programmatic Theme Application

```javascript
import { applyTheme } from '@zehenrique/vue-google-calendar';

const calendarElement = document.querySelector('.google-calendar');
const myTheme = {
  '--calendar-primary-color': '#9c27b0'
};

applyTheme(calendarElement, myTheme);
```

## Examples

### Example 1: Brand Colors

```javascript
const brandTheme = {
  '--calendar-primary-color': '#5e35b1',      // Deep purple
  '--calendar-today-bg': '#5e35b1',
  '--calendar-header-bg': '#ede7f6',
  '--calendar-border-color': '#d1c4e9',
  '--calendar-text-primary': '#311b92'
};
```

### Example 2: Minimalist Theme

```javascript
const minimalistTheme = {
  '--calendar-bg': '#fafafa',
  '--calendar-header-bg': '#ffffff',
  '--calendar-border-color': '#eeeeee',
  '--calendar-border-color-dark': '#e0e0e0',
  '--calendar-text-primary': '#212121',
  '--calendar-text-secondary': '#757575',
  '--calendar-primary-color': '#424242',
  '--calendar-today-bg': '#424242',
  '--calendar-border-radius': '0px',           // Square edges
  '--calendar-border-radius-sm': '0px',
  '--calendar-border-radius-md': '0px'
};
```

### Example 3: Large Font / Accessibility

```javascript
const accessibleTheme = {
  '--calendar-font-size-base': '16px',         // Larger base font
  '--calendar-font-size-small': '14px',
  '--calendar-font-size-xsmall': '12px',
  '--calendar-day-number-font-size': '14px',
  '--calendar-event-font-size': '13px',
  '--calendar-pixels-per-hour-week': '80px',   // Taller hour slots
  '--calendar-pixels-per-hour-day': '60px'
};
```

### Example 4: Seasonal Theme (Winter)

```javascript
const winterTheme = {
  '--calendar-bg': '#e3f2fd',
  '--calendar-header-bg': '#bbdefb',
  '--calendar-day-bg': '#ffffff',
  '--calendar-border-color': '#90caf9',
  '--calendar-primary-color': '#1976d2',
  '--calendar-today-bg': '#0d47a1',
  '--calendar-text-primary': '#0d47a1',
  '--calendar-text-secondary': '#1565c0'
};
```

### Example 5: Custom Event Styling

While event colors are controlled by the event's `color` property, you can customize the default event appearance:

```javascript
const eventTheme = {
  '--calendar-event-border-radius': '12px',    // More rounded events
  '--calendar-event-padding': '4px 8px',       // More padding
  '--calendar-event-hover-opacity': '0.9',     // Less transparent on hover
  '--calendar-ghost-event-opacity': '0.3'      // More transparent preview
};
```

## Best Practices

1. **Start with a preset** - Begin with a built-in preset and customize from there
2. **Use semantic values** - Keep color meanings consistent (e.g., primary for actions, secondary for less important text)
3. **Test responsiveness** - Check mobile breakpoints when changing sizing properties
4. **Maintain contrast** - Ensure text remains readable against backgrounds
5. **Partial overrides** - Only override the properties you need to change
6. **Document custom themes** - Comment your theme objects for team members

## Troubleshooting

### Theme not applying

Make sure you're passing the theme to the component:
```vue
<Calendar :calendar-app="app" :theme="myTheme" />
```

### Styles being overridden

CSS custom properties follow standard CSS specificity rules. Make sure your overrides have sufficient specificity:

```css
/* Won't work - too generic */
.google-calendar {
  --calendar-primary-color: red;
}

/* Better - more specific */
.my-app .google-calendar {
  --calendar-primary-color: red;
}
```

### Mobile styles not working

Mobile-specific variables use separate properties. Make sure to override both:

```javascript
{
  '--calendar-time-column-width': '70px',        // Desktop
  '--calendar-time-column-width-mobile': '60px'  // Mobile
}
```

## Resources

- [CSS Custom Properties (MDN)](https://developer.mozilla.org/en-US/docs/Web/CSS/--*)
- [Default Theme Source](../src/config/theme.js)
- [Color Configuration](../docs/COLORS.md)
- [API Documentation](../docs/API.md)
