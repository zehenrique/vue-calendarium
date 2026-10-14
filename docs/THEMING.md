# Theming

The calendar's colours, fonts and sizes are CSS variables. Change them with the `theme` prop, in your own CSS, or by starting from a preset. Every variable and its default is listed in [Theme variables](./THEME_REFERENCE.md).

## With the `theme` prop

Pass only the variables you want to change; the rest keep their defaults:

```vue
<template>
  <Calendar :calendar-app="calendarApp" :theme="brandTheme" />
</template>

<script setup>
const brandTheme = {
  '--calendar-primary-color': '#e91e63',
  '--calendar-today-bg': '#e91e63',
  '--calendar-header-bg': '#fce4ec',
  '--calendar-font-family': "'Inter', sans-serif"
};
</script>
```

The prop is reactive, so a new object (for example a light/dark switch) restyles the calendar straight away.

## With CSS

Set the variables on any element around the calendar:

```css
.my-calendar {
  --calendar-primary-color: #673ab7;
  --calendar-today-bg: #673ab7;
  --calendar-border-color: #d1c4e9;
}
```

```vue
<div class="my-calendar">
  <Calendar :calendar-app="calendarApp" />
</div>
```

Use one approach or the other. When the `theme` prop is set, the calendar writes every variable on its own element, so those values win over variables set in your CSS.

## Presets

Four presets are exported as `THEME_PRESETS`:

| Preset | What it changes |
| --- | --- |
| `default` | The standard light theme |
| `dark` | Dark backgrounds and light text |
| `compact` | Less padding, smaller event text and shorter hours |
| `highContrast` | Black text and borders on white |

```vue
<script setup>
import { ref, computed } from 'vue';
import { THEME_PRESETS } from 'vue-calendarium';

const isDark = ref(false);
const theme = computed(() => (isDark.value ? THEME_PRESETS.dark : THEME_PRESETS.default));
</script>

<template>
  <Calendar :calendar-app="calendarApp" :theme="theme" />
</template>
```

To build on a preset, spread it: `{ ...THEME_PRESETS.dark, '--calendar-primary-color': '#bb86fc' }`.

Presets change the calendar's variables only. Its dialogs, menus and date pickers are Vuetify components and follow your app's Vuetify theme.

## Fonts

`--calendar-font-family` sets the calendar's font. The calendar's dialogs, menus and bottom sheets read it too, but Vuetify renders them outside the calendar's element, so a value set through the `theme` prop or on a wrapper does not reach them. To change the font everywhere, set it on `:root`:

```css
:root {
  --calendar-font-family: 'Inter', sans-serif;
}
```

The default is Roboto with system fonts as a fallback. The package does not load Roboto, so add it to your app (for example from Google Fonts) if you want it.

## Event colours

An event takes its calendar's colour unless it has its own `color`. Any six-digit hex colour works (`'#ff5722'`); other values, such as `'red'` or `'#f00'`, fall back to the default colour.

Events in the past are drawn at half opacity with dark text; current and future events are solid with white text. `getEventColorStyle(hex, isPast)` returns the same colours, for a legend or a list beside the calendar.

For your own colour picker or legend, the package exports a 12-colour palette as `CALENDAR_COLORS`. The names are translated in the calendar's messages, for example `t('tomato')`:

| Name | Hex | Name | Hex |
| --- | --- | --- | --- |
| Tomato | `#D50000` | Peacock | `#039BE5` |
| Flamingo | `#E67C73` | Blueberry | `#3F51B5` |
| Tangerine | `#F4511E` | Lavender | `#7986CB` |
| Banana | `#F6BF26` | Grape | `#8E24AA` |
| Sage | `#33B679` | Graphite | `#616161` |
| Basil | `#0B8043` | Cobalt (default) | `#1967D2` |

For the colour helpers (`getColorById`, `isValidColor` and others), see the [API reference](./API.md#colours-and-themes).

## Vuetify 4

The calendar's dialogs and menus use Vuetify 4's Material Design 3 styling. Two things in your app affect them:

- **Load order.** Import `vuetify/styles` before any code that imports a Vuetify component. Vuetify 4 puts its CSS in cascade layers, and the first stylesheet to name a layer fixes its order.
- **Unlayered CSS** in your app overrides Vuetify's layered styles, including the classes the calendar uses. Put global resets in a layer declared before Vuetify's, for example `@layer app-base { * { margin: 0; padding: 0 } }`. The calendar already protects its buttons from resets such as Bootstrap's `button { border-radius: 0 }`.

For breakpoints and other changes from Vuetify 3, see the [upgrade guide](./UPGRADING.md).
