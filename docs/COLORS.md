# Color Palette Guide

<!-- markdownlint-disable MD022 MD031 MD032 -->

The vue-calendarium component uses a predefined color palette inspired by Material Design colors. This ensures visual consistency and a professional appearance.

## Available Colors

The calendar supports exactly **12 colors**, matching a Material Design palette:

| Color Name | Hex Code | Preview | Usage |
|------------|----------|---------|-------|
| Tomato | `#D50000` | 🔴 | High priority, urgent items |
| Flamingo | `#E67C73` | 🌸 | Soft accent, meetings |
| Tangerine | `#F4511E` | 🟠 | Warnings, important deadlines |
| Banana | `#F6BF26` | 🟡 | Highlights, reminders |
| Sage | `#33B679` | 🟢 | Success, completed tasks |
| Basil | `#0B8043` | 🌿 | Nature, health, wellness |
| Peacock | `#039BE5` | 🔵 | Information, general events |
| Blueberry | `#3F51B5` | 💙 | Professional, corporate |
| Lavender | `#7986CB` | 💜 | Creative, personal projects |
| Grape | `#8E24AA` | 🍇 | Special occasions |
| Graphite | `#616161` | ⚫ | Neutral, low priority |
| Cobalt | `#1967D2` | 🔷 | **Default** - Primary color |

## Usage

### Importing the Color Configuration

```javascript
import {
  CALENDAR_COLORS,
  DEFAULT_COLOR,
  getColorById,
  getColorIdByHex,
  isValidColor,
  getClosestColor
} from 'vue-calendarium';
```

### Using Colors in Calendars

```javascript
const calendars = [
  { 
    id: 'work', 
    name: 'Work', 
    color: '#1967D2' // Cobalt (default)
  },
  { 
    id: 'personal', 
    name: 'Personal', 
    color: '#0B8043' // Basil (green)
  },
  { 
    id: 'family', 
    name: 'Family', 
    color: '#D50000' // Tomato (red)
  },
  { 
    id: 'fitness', 
    name: 'Fitness', 
    color: '#33B679' // Sage (light green)
  }
];
```

### Using Colors in Events

Events inherit their calendar's color by default, but you can override:

```javascript
const event = {
  id: 'meeting-1',
  title: 'Urgent Client Meeting',
  start: '2025-11-15T14:00:00',
  end: '2025-11-15T15:00:00',
  calendarId: 'work',
  color: '#D50000' // Override with Tomato (red) for urgency
};
```

### Helper Functions

#### `getColorById(colorId)`
Get the hex code for a color by its ID:

```javascript
const color = getColorById('tomato'); 
// Returns: '#D50000'

const defaultColor = getColorById('cobalt');
// Returns: '#1967D2'
```

#### `getColorIdByHex(hex)`
Get the color ID from a hex code:

```javascript
const id = getColorIdByHex('#D50000');
// Returns: 'tomato'

const unknown = getColorIdByHex('#FFFFFF');
// Returns: null (color not in palette)
```

#### `isValidColor(hex)`
Check if a color is in the allowed palette:

```javascript
isValidColor('#D50000');  // true - Tomato
isValidColor('#1967D2');  // true - Cobalt
isValidColor('#FFFFFF');  // false - Not in palette
isValidColor('#FF0000');  // false - Not in palette
```

#### `getClosestColor(hex)`
Get the closest valid color (or default if not found):

```javascript
const color = getClosestColor('#D50000');
// Returns: '#D50000' (already valid)

const fallback = getClosestColor('#FFFFFF');
// Returns: '#1967D2' (DEFAULT_COLOR)
```

### Accessing the Full Palette

```javascript
import { CALENDAR_COLORS } from 'vue-calendarium';

// Display all colors in a UI picker
CALENDAR_COLORS.forEach(color => {
  console.log(`${color.name}: ${color.hex}`);
});

// Create a color selector dropdown
const colorOptions = CALENDAR_COLORS.map(color => ({
  value: color.hex,
  label: color.name,
  id: color.id
}));
```

## Internationalization

Color names are fully internationalized in both **English** and **Portuguese**:

### English (en-US)
- Tomato, Flamingo, Tangerine, Banana
- Sage, Basil, Peacock, Blueberry
- Lavender, Grape, Graphite, Cobalt

### Portuguese (pt-PT)
- Tomate, Flamingo, Tangerina, Banana
- Sálvia, Manjericão, Pavão, Mirtilo
- Lavanda, Uva, Grafite, Cobalto

Access translated names via i18n:

```javascript
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

// Get translated color name
const colorName = t('tomato'); // "Tomato" (en) or "Tomate" (pt)
```

## Color Behavior

### Automatic Background Styling
The component automatically generates lighter background colors for events:
- **Active events**: 90% opacity background
- **Past events**: 40% opacity background (dimmed)

### Text Color
- **Active events**: White text for better contrast
- **Past events**: Black text with reduced opacity

### Validation
When creating or updating events/calendars:
1. Use `isValidColor()` to validate hex codes
2. Use `getClosestColor()` to ensure fallback to valid colors
3. Invalid colors automatically fallback to `DEFAULT_COLOR` (#1967D2)

## Design Philosophy

The predefined palette ensures:
- **Consistency**: All calendars look professional and cohesive
- **Accessibility**: Colors chosen for sufficient contrast and visibility
- **Familiarity**: Built on a familiar, trusted design language
- **Simplicity**: Limited choices prevent decision fatigue

## Migration from Custom Colors

If you were using custom hex colors before, update them to use the palette:

```javascript
// Before (any hex color)
const event = {
  color: '#FF5733' // Custom orange
};

// After (predefined palette)
const event = {
  color: '#F4511E' // Tangerine (closest match)
};

// Or use helper
import { getClosestColor } from 'vue-calendarium';

const event = {
  color: getClosestColor('#FF5733') // Falls back to DEFAULT_COLOR
};
```

## Best Practices

1. **Use semantic naming**: Match colors to calendar purpose
   - Work → Cobalt (professional blue)
   - Personal → Basil (calming green)
   - Urgent → Tomato (alert red)

2. **Limit color variety**: Don't use all 12 colors for 3 calendars
   - Stick to 3-5 distinct colors for clarity

3. **Consider accessibility**:
   - Avoid relying solely on color to convey information
   - Use both color AND calendar name for identification

4. **Test in both locales**:
   - Verify color names display correctly in en-US and pt-PT
   - Use `t()` function for translated names

## Examples

### Complete Calendar Setup

```javascript
import { createCalendar, CALENDAR_COLORS, DEFAULT_COLOR } from 'vue-calendarium';

const calendarApp = createCalendar({
  calendars: [
    { id: 'work', name: 'Work', color: '#1967D2' },      // Cobalt
    { id: 'personal', name: 'Personal', color: '#0B8043' }, // Basil
    { id: 'family', name: 'Family', color: '#D50000' },   // Tomato
    { id: 'fitness', name: 'Fitness', color: '#33B679' }  // Sage
  ],
  events: [
    {
      id: '1',
      title: 'Team Meeting',
      start: '2025-11-15T10:00:00',
      end: '2025-11-15T11:00:00',
      calendarId: 'work',
      color: '#1967D2' // Inherits from Work calendar
    },
    {
      id: '2',
      title: 'Yoga Class',
      start: '2025-11-15T18:00:00',
      end: '2025-11-15T19:00:00',
      calendarId: 'fitness',
      color: '#33B679' // Sage green for wellness
    }
  ]
});
```

### Dynamic Color Picker

```vue
<template>
  <div class="color-picker">
    <div 
      v-for="color in CALENDAR_COLORS" 
      :key="color.id"
      class="color-option"
      :style="{ backgroundColor: color.hex }"
      @click="selectColor(color.hex)"
    >
      <span>{{ t(color.id) }}</span>
    </div>
  </div>
</template>

<script setup>
import { CALENDAR_COLORS } from 'vue-calendarium';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

function selectColor(hex) {
  console.log('Selected color:', hex);
  // Apply to calendar or event
}
</script>
```

## Support

For questions or issues related to colors:
1. Check that colors are from the `CALENDAR_COLORS` palette
2. Use validation helpers (`isValidColor`, `getClosestColor`)
3. Refer to this guide for correct hex codes
4. See `src/config/colors.js` for implementation details
