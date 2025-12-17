# Complete Theme Customization Reference

This document provides a comprehensive reference of all customizable CSS custom properties in the Vue Google Calendar component.

## Overview

Every visual aspect of the calendar can be customized through CSS custom properties (CSS variables). You can customize:

- ✅ **Colors** (backgrounds, borders, text, accents)
- ✅ **Typography** (fonts, sizes, weights)
- ✅ **Spacing** (padding, margins, gaps)
- ✅ **Sizing** (dimensions, heights, widths)
- ✅ **Borders & Radius** (border styles, rounded corners)
- ✅ **Transitions** (animation speeds)
- ✅ **Z-Index** (layering)
- ✅ **Mobile Overrides** (mobile-specific values)

## Quick Start

```vue
<template>
  <GoogleCalendar :calendar-app="calendarApp" :theme="customTheme" />
</template>

<script setup>
const customTheme = {
  '--calendar-primary-color': '#your-color',
  '--calendar-font-family': '"Your Font", sans-serif',
  // ... any other properties
};
</script>
```

## Complete Property Reference

### 🎨 Background Colors

| Property | Default | Description | Usage |
|----------|---------|-------------|-------|
| `--calendar-bg` | `#ffffff` | Main calendar background | Overall calendar background color |
| `--calendar-header-bg` | `#f8f9fa` | Header section background | Top header bar and navigation area |
| `--calendar-day-bg` | `#ffffff` | Day cell background | Background of individual day cells |
| `--calendar-day-other-month-bg` | `#fafafa` | Other month days background | Days from previous/next month in month view |
| `--calendar-day-hover-bg` | `#f8f9fa` | Hover state background | Background when hovering over interactive elements |

**Example:**
```javascript
{
  '--calendar-bg': '#fafafa',           // Light gray overall
  '--calendar-header-bg': '#e3f2fd',    // Light blue header
  '--calendar-day-hover-bg': '#fff3e0'  // Warm hover effect
}
```

### 🖊️ Border Colors

| Property | Default | Description | Usage |
|----------|---------|-------------|-------|
| `--calendar-border-color` | `#e0e0e0` | Primary border color | Standard borders, grid lines |
| `--calendar-border-color-dark` | `#d0d0d0` | Darker border color | Emphasized borders, separators |

**Example:**
```javascript
{
  '--calendar-border-color': '#cfd8dc',      // Subtle borders
  '--calendar-border-color-dark': '#90a4ae'  // Stronger emphasis
}
```

### 📝 Text Colors

| Property | Default | Description | Usage |
|----------|---------|-------------|-------|
| `--calendar-text-primary` | `#3c4043` | Primary text color | Main text, titles, important content |
| `--calendar-text-secondary` | `#70757a` | Secondary text color | Subtitles, labels, less important text |
| `--calendar-text-disabled` | `#5f6368` | Disabled text color | Inactive or disabled elements |

**Example:**
```javascript
{
  '--calendar-text-primary': '#212121',    // Dark gray for main text
  '--calendar-text-secondary': '#757575',  // Medium gray for labels
  '--calendar-text-disabled': '#bdbdbd'    // Light gray for disabled
}
```

### 🎯 Accent Colors

| Property | Default | Description | Usage |
|----------|---------|-------------|-------|
| `--calendar-primary-color` | `#1a73e8` | Primary accent color | Buttons, links, selected states |
| `--calendar-primary-hover` | `#1557b0` | Primary hover color | Hover state for primary elements |
| `--calendar-today-bg` | `#1a73e8` | Today indicator background | Background for current day marker |
| `--calendar-today-color` | `#ffffff` | Today indicator text | Text color for current day marker |
| `--calendar-current-time-color` | `#ea4335` | Current time line color | Red line showing current time |

**Example:**
```javascript
{
  '--calendar-primary-color': '#9c27b0',      // Purple brand color
  '--calendar-primary-hover': '#7b1fa2',      // Darker purple on hover
  '--calendar-today-bg': '#9c27b0',           // Purple today indicator
  '--calendar-today-color': '#ffffff',        // White text on purple
  '--calendar-current-time-color': '#ff4081'  // Pink current time line
}
```

### 📅 Event Colors

| Property | Default | Description | Usage |
|----------|---------|-------------|-------|
| `--calendar-event-bg` | `#1967d2` | Default event background | Fallback color when event has no color |
| `--calendar-event-color` | `#ffffff` | Default event text | Fallback text color for events |
| `--calendar-event-hover-opacity` | `0.8` | Event hover opacity | Opacity when hovering over event |
| `--calendar-ghost-event-opacity` | `0.5` | Ghost event opacity | Opacity for preview/ghost events |

**Example:**
```javascript
{
  '--calendar-event-bg': '#5e35b1',           // Purple default
  '--calendar-event-hover-opacity': '0.9',    // Less transparent hover
  '--calendar-ghost-event-opacity': '0.3'     // More transparent preview
}
```

### 🔤 Typography

| Property | Default | Description | Usage |
|----------|---------|-------------|-------|
| `--calendar-font-family` | `'Google Sans', 'Roboto', Arial, sans-serif` | Font family | All text in calendar |
| `--calendar-font-size-base` | `14px` | Base font size | Standard text size |
| `--calendar-font-size-small` | `12px` | Small font size | Labels, captions |
| `--calendar-font-size-xsmall` | `11px` | Extra small font size | Very small text, timestamps |
| `--calendar-font-size-large` | `16px` | Large font size | Headings, emphasis |
| `--calendar-font-size-title` | `1.25rem` | Title font size | Main titles |
| `--calendar-font-weight-normal` | `400` | Normal font weight | Regular text |
| `--calendar-font-weight-medium` | `500` | Medium font weight | Emphasized text, labels |

**Example:**
```javascript
{
  '--calendar-font-family': '"Inter", "Helvetica Neue", sans-serif',
  '--calendar-font-size-base': '15px',        // Slightly larger text
  '--calendar-font-size-small': '13px',
  '--calendar-font-weight-medium': '600'      // Bolder emphasis
}
```

### 📏 Spacing

| Property | Default | Description | Usage |
|----------|---------|-------------|-------|
| `--calendar-spacing-xs` | `2px` | Extra small spacing | Minimal gaps |
| `--calendar-spacing-sm` | `4px` | Small spacing | Tight spacing |
| `--calendar-spacing-md` | `8px` | Medium spacing | Standard gaps |
| `--calendar-spacing-lg` | `12px` | Large spacing | Comfortable spacing |
| `--calendar-spacing-xl` | `16px` | Extra large spacing | Generous gaps |
| `--calendar-spacing-xxl` | `20px` | 2X large spacing | Maximum spacing |

**Example:**
```javascript
{
  '--calendar-spacing-xs': '1px',    // Tighter spacing
  '--calendar-spacing-sm': '2px',
  '--calendar-spacing-md': '4px',
  '--calendar-spacing-lg': '8px',
  '--calendar-spacing-xl': '12px',
  '--calendar-spacing-xxl': '16px'
}
```

### 📐 Header Sizing

| Property | Default | Description | Usage |
|----------|---------|-------------|-------|
| `--calendar-header-padding` | `16px 20px` | Header padding | Padding inside header |
| `--calendar-header-gap` | `12px` | Header element gap | Space between header items |
| `--calendar-header-border-width` | `1px` | Header border width | Bottom border thickness |

**Example:**
```javascript
{
  '--calendar-header-padding': '12px 16px',  // Compact header
  '--calendar-header-gap': '8px'             // Tighter spacing
}
```

### ⏱️ Time Column

| Property | Default | Description | Usage |
|----------|---------|-------------|-------|
| `--calendar-time-column-width` | `60px` | Time column width (desktop) | Width of time labels in week/day view |
| `--calendar-time-column-width-mobile` | `50px` | Time column width (mobile) | Mobile version of time column |

**Example:**
```javascript
{
  '--calendar-time-column-width': '70px',         // Wider for 12-hour format
  '--calendar-time-column-width-mobile': '55px'
}
```

### 📅 Day Numbers

| Property | Default | Description | Usage |
|----------|---------|-------------|-------|
| `--calendar-day-number-size` | `24px` | Day number circle size | Size of day numbers in month view |
| `--calendar-day-number-font-size` | `12px` | Day number font size | Font size of day numbers |
| `--calendar-week-day-number-size` | `36px` | Week view day number size | Day number in week view header |
| `--calendar-week-day-number-size-mobile` | `32px` | Mobile week day number size | Mobile version |
| `--calendar-week-day-font-size` | `11px` | Week day label font size | "Mon", "Tue", etc. |
| `--calendar-week-day-font-size-mobile` | `10px` | Mobile week day font size | Mobile version |

**Example:**
```javascript
{
  '--calendar-day-number-size': '28px',           // Larger day numbers
  '--calendar-day-number-font-size': '13px',
  '--calendar-week-day-number-size': '40px'
}
```

### 📊 Hour Slots (Grid Height)

| Property | Default | Description | Usage |
|----------|---------|-------------|-------|
| `--calendar-pixels-per-hour-week` | `60px` | Week view hour height | Height of each hour slot in week view |
| `--calendar-pixels-per-hour-week-mobile` | `50px` | Week view hour height (mobile) | Mobile version |
| `--calendar-pixels-per-hour-day` | `45px` | Day view hour height | Height of each hour slot in day view |
| `--calendar-pixels-per-hour-day-mobile` | `38px` | Day view hour height (mobile) | Mobile version |

**Example:**
```javascript
{
  '--calendar-pixels-per-hour-week': '80px',         // Taller for more space
  '--calendar-pixels-per-hour-week-mobile': '65px',
  '--calendar-pixels-per-hour-day': '60px',
  '--calendar-pixels-per-hour-day-mobile': '50px'
}
```

### 🎫 Event Elements

| Property | Default | Description | Usage |
|----------|---------|-------------|-------|
| `--calendar-event-padding` | `2px 6px` | Event padding | Padding inside event boxes |
| `--calendar-event-border-radius` | `6px` | Event border radius | Rounded corners of events |
| `--calendar-event-font-size` | `11px` | Event font size | Font size of event text |
| `--calendar-event-font-size-mobile` | `10px` | Event font size (mobile) | Mobile version |
| `--calendar-event-line-height` | `1.2` | Event line height | Line height for event text |
| `--calendar-event-max-height` | `20px` | Event max height | Maximum height for month view events |
| `--calendar-event-gap` | `2px` | Gap between events | Space between stacked events |

**Example:**
```javascript
{
  '--calendar-event-padding': '4px 8px',          // More padding
  '--calendar-event-border-radius': '8px',        // Rounder events
  '--calendar-event-font-size': '12px',           // Larger text
  '--calendar-event-gap': '3px'                   // More space between
}
```

### 📌 All-Day Events

| Property | Default | Description | Usage |
|----------|---------|-------------|-------|
| `--calendar-all-day-min-height` | `20px` | All-day section min height | Minimum height of all-day area |
| `--calendar-all-day-padding` | `4px` | All-day section padding | Padding in all-day area |
| `--calendar-all-day-event-padding` | `2px 8px` | All-day event padding | Padding inside all-day events |
| `--calendar-all-day-event-padding-mobile` | `2px 1px` | Mobile all-day event padding | Mobile version |
| `--calendar-all-day-event-font-size` | `12px` | All-day event font size | Font size for all-day events |
| `--calendar-all-day-event-font-size-mobile` | `8.5px` | Mobile all-day font size | Mobile version |
| `--calendar-all-day-event-border-radius` | `8px` | All-day event border radius | Rounded corners |
| `--calendar-all-day-event-border-radius-mobile` | `5px` | Mobile border radius | Mobile version |

**Example:**
```javascript
{
  '--calendar-all-day-event-padding': '3px 10px',
  '--calendar-all-day-event-font-size': '13px',
  '--calendar-all-day-event-border-radius': '10px'
}
```

### 📊 Grid

| Property | Default | Description | Usage |
|----------|---------|-------------|-------|
| `--calendar-grid-gap` | `1px` | Gap between grid cells | Space between day cells in month view |

**Example:**
```javascript
{
  '--calendar-grid-gap': '2px'  // More visible separation
}
```

### 🔲 Borders & Radius

| Property | Default | Description | Usage |
|----------|---------|-------------|-------|
| `--calendar-border-radius` | `4px` | Base border radius | Default rounded corners |
| `--calendar-border-radius-sm` | `6px` | Small border radius | Slightly rounded |
| `--calendar-border-radius-md` | `8px` | Medium border radius | Moderately rounded |
| `--calendar-border-radius-lg` | `12px` | Large border radius | Very rounded |
| `--calendar-border-radius-circle` | `50%` | Circle border radius | Perfect circles |

**Example:**
```javascript
{
  '--calendar-border-radius': '8px',      // More rounded overall
  '--calendar-border-radius-sm': '10px',
  '--calendar-border-radius-md': '12px',
  '--calendar-border-radius-lg': '16px'
}
```

### ⏱️ Transitions

| Property | Default | Description | Usage |
|----------|---------|-------------|-------|
| `--calendar-transition-fast` | `0.2s` | Fast transition | Quick animations |
| `--calendar-transition-medium` | `0.3s` | Medium transition | Standard animations |

**Example:**
```javascript
{
  '--calendar-transition-fast': '0.15s',    // Snappier
  '--calendar-transition-medium': '0.25s'
}
```

### 📚 Z-Index (Layering)

| Property | Default | Description | Usage |
|----------|---------|-------------|-------|
| `--calendar-header-z-index` | `10` | Header z-index | Keeps header on top when sticky |
| `--calendar-event-z-index` | `1` | Event z-index | Event layering |
| `--calendar-current-time-z-index` | `5` | Current time indicator z-index | Time line layering |

**Example:**
```javascript
{
  '--calendar-header-z-index': '100',           // Above modals
  '--calendar-current-time-z-index': '50'
}
```

### 🎨 Current Time Indicator

| Property | Default | Description | Usage |
|----------|---------|-------------|-------|
| `--calendar-current-time-circle-size` | `12px` | Circle size | Size of the red dot |

**Example:**
```javascript
{
  '--calendar-current-time-circle-size': '14px'  // Larger dot
}
```

### 📱 Mobile Specific

| Property | Default | Description | Usage |
|----------|---------|-------------|-------|
| `--calendar-mobile-breakpoint` | `768px` | Mobile breakpoint | When mobile styles activate |
| `--calendar-mobile-header-padding` | `2px 2px` | Mobile header padding | Compact header on mobile |
| `--calendar-mobile-header-gap` | `8px` | Mobile header gap | Space between header items |
| `--calendar-mobile-day-number-font-size` | `11px` | Mobile day number size | Day numbers on mobile |
| `--calendar-mobile-event-font-size` | `10px` | Mobile event font size | Event text on mobile |

**Example:**
```javascript
{
  '--calendar-mobile-header-padding': '4px 4px',
  '--calendar-mobile-header-gap': '6px',
  '--calendar-mobile-event-font-size': '11px'
}
```

### 🌅 Day View Specific

| Property | Default | Description | Usage |
|----------|---------|-------------|-------|
| `--calendar-day-view-weekday-font-size` | `11px` | Day view weekday label | "Monday" label size |
| `--calendar-day-view-number-font-size` | `26px` | Day view number size | Large day number |
| `--calendar-day-view-number-margin-top` | `2px` | Day number top margin | Spacing above number |

**Example:**
```javascript
{
  '--calendar-day-view-number-font-size': '32px',  // Larger day number
  '--calendar-day-view-weekday-font-size': '12px'
}
```

## Complete Example - Brand Theme

Here's a complete example showing how to create a cohesive brand theme:

```javascript
const BRAND_THEME = {
  // === COLORS ===
  // Backgrounds
  '--calendar-bg': '#ffffff',
  '--calendar-header-bg': '#f0f4f8',
  '--calendar-day-bg': '#ffffff',
  '--calendar-day-other-month-bg': '#fafbfc',
  '--calendar-day-hover-bg': '#e6f2ff',
  
  // Borders
  '--calendar-border-color': '#cbd5e0',
  '--calendar-border-color-dark': '#a0aec0',
  
  // Text
  '--calendar-text-primary': '#1a202c',
  '--calendar-text-secondary': '#4a5568',
  '--calendar-text-disabled': '#a0aec0',
  
  // Accents (Brand Blue)
  '--calendar-primary-color': '#0066cc',
  '--calendar-primary-hover': '#0052a3',
  '--calendar-today-bg': '#0066cc',
  '--calendar-today-color': '#ffffff',
  '--calendar-current-time-color': '#ff6b6b',
  
  // Events
  '--calendar-event-hover-opacity': '0.85',
  '--calendar-ghost-event-opacity': '0.4',
  
  // === TYPOGRAPHY ===
  '--calendar-font-family': '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
  '--calendar-font-size-base': '14px',
  '--calendar-font-size-small': '12px',
  '--calendar-font-weight-medium': '600',
  
  // === SPACING ===
  '--calendar-spacing-md': '10px',
  '--calendar-spacing-lg': '14px',
  
  // === SIZING ===
  '--calendar-header-padding': '18px 24px',
  '--calendar-pixels-per-hour-week': '65px',
  
  // === BORDERS ===
  '--calendar-border-radius': '8px',
  '--calendar-event-border-radius': '8px',
  
  // === TRANSITIONS ===
  '--calendar-transition-fast': '0.15s'
};
```

## Usage in Vue Component

```vue
<template>
  <GoogleCalendar :calendar-app="calendarApp" :theme="myTheme" />
</template>

<script setup>
import { createCalendar, GoogleCalendar } from '@zehenrique/vue-google-calendar';

const myTheme = {
  '--calendar-primary-color': '#your-brand-color',
  '--calendar-font-family': '"Your Brand Font", sans-serif',
  // ... customize any properties you need
};

const calendarApp = createCalendar({
  views: [createViewWeek()],
  events: []
});
</script>
```

## Tips for Customization

1. **Start Small**: Override only what you need. The default theme provides good defaults.
2. **Be Consistent**: Use the same accent color across `--calendar-primary-color`, `--calendar-today-bg`, etc.
3. **Test Mobile**: Always check mobile-specific properties work well on small screens.
4. **Check Contrast**: Ensure sufficient contrast between text and backgrounds (WCAG AA: 4.5:1 minimum).
5. **Use Brand Colors**: Align with your application's brand guidelines.
6. **Consider Accessibility**: Test with high contrast mode and screen readers.

## Related Documentation

- [Styling Guide](./STYLING.md) - Comprehensive styling documentation
- [Theme Examples](../examples/theming-examples.js) - 10+ pre-made themes
- [Color Configuration](./COLORS.md) - Event color palette
