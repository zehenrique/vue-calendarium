# vue-calendarium

[![npm version](https://img.shields.io/npm/v/vue-calendarium.svg)](https://www.npmjs.com/package/vue-calendarium)
[![license](https://img.shields.io/npm/l/vue-calendarium.svg)](./LICENSE)
[![Vue 3](https://img.shields.io/badge/Vue-3-42b883.svg)](https://vuejs.org/)
[![Vuetify 3](https://img.shields.io/badge/Vuetify-3-1867C0.svg)](https://vuetifyjs.com/)

A full-featured scheduling and calendar component for **Vue 3** and **Vuetify 3**. Supports Month, Week, and Day views, recurring events (RRULE), drag-and-drop, mobile gestures, theming via CSS variables, and Temporal-based date handling.

---

## Features

- **Three views** — Month, Week, and Day, switchable at runtime
- **Event CRUD** — create, edit, and delete events through built-in modals or your own UI
- **Recurring events** — full RRULE support (daily, weekly, monthly, yearly, custom) powered by the `rrule` library
- **Multiple calendars** — group events into color-coded calendars with per-calendar visibility toggle
- **Drag and drop** — move events across time slots and days (opt-in)
- **Mobile-first gestures** — horizontal swipe to navigate between days/weeks/months, pinch-to-zoom on Day/Week views (HammerJS)
- **Ghost events** — semi-transparent preview events shown while the user is filling in a creation form
- **Custom modals** — disable the built-in modals and wire your own UI via callbacks
- **Theming** — override any visual property through CSS custom properties or built-in presets (default, dark, compact, high-contrast)
- **12-color palette** — Material Design-inspired palette with helper utilities
- **i18n** — English and Portuguese built-in; full `vue-i18n` integration
- **Temporal API** — date handling built on `@js-temporal/polyfill` for correctness and timezone safety
- **Current-time indicator** — red line showing the current time in Day/Week views (opt-in)

---

## Requirements

| Peer dependency | Version |
| --- | --- |
| Vue | `^3.3` |
| Vuetify | `^3.3` (your app must be wrapped in `<v-app>`) |
| vue-i18n | `^9.0` |

---

## Installation

```bash
npm install vue-calendarium
```

---

## Quick Start

### 1. Register translations

```js
import { createI18n } from 'vue-i18n';
import { translations } from 'vue-calendarium';

export const i18n = createI18n({
  legacy: false,
  locale: 'en',
  fallbackLocale: 'en',
  messages: {
    en: translations.en,
    pt: translations.pt
  }
});
```

### 2. Render the calendar

```vue
<template>
  <v-app>
    <v-main>
      <Calendar :calendar-app="calendarApp" />
    </v-main>
  </v-app>
</template>

<script setup>
import {
  createCalendar,
  createViewDay,
  createViewWeek,
  createViewMonth,
  Calendar
} from 'vue-calendarium';

const calendarApp = createCalendar({
  views: [createViewDay(), createViewWeek(), createViewMonth()],
  defaultView: 'month',
  locale: 'en-US',
  calendars: [
    { id: 'work',     name: 'Work',     color: '#1967D2' },
    { id: 'personal', name: 'Personal', color: '#0B8043' }
  ],
  events: []
});

calendarApp.eventsService.add({
  title: 'Team Meeting',
  start: '2026-01-27T10:00:00',
  end:   '2026-01-27T10:30:00',
  calendarId: 'work'
});
</script>
```

---

## Core Concepts

### Event structure

```js
{
  id:          string | number,   // auto-generated if omitted
  title:       string,            // required
  start:       string,            // ISO date-time, required
  end:         string,            // ISO date-time, required
  allDay:      boolean,
  calendarId:  string,
  color:       string,            // hex color
  rrule:       string,            // RRULE string for recurring events
  description: string,
  location:    string,
  custom:      Record<string, unknown>
}
```

### Managing events

```js
calendarApp.eventsService.add({ title: 'Sprint Review', start: '...', end: '...' });
calendarApp.eventsService.update({ id: '1', title: 'Updated title' });
calendarApp.eventsService.remove('1');
calendarApp.eventsService.getAll();
calendarApp.eventsService.getByCalendar('work');
calendarApp.eventsService.getByDateRange(start, end);
calendarApp.eventsService.set([...events]); // replace all
```

### Navigation and view control

```js
calendarApp.goToNext();           // next day / week / month
calendarApp.goToPrevious();       // previous day / week / month
calendarApp.goToToday();
calendarApp.setView('week');      // 'day' | 'week' | 'month'
calendarApp.setDate(Temporal.Now.plainDateISO());
calendarApp.setLocale('pt-PT');
```

### Callbacks

```js
const calendarApp = createCalendar({
  views: [...],
  onEventClick:   (event) => { /* open detail panel */ },
  onEventCreate:  (events) => { /* persist to backend */ },
  onEventUpdate:  (event) => { /* sync changes */ },
  onEventDelete:  (event) => { /* remove from backend */ },
  onDateChange:   (date) => { /* Temporal.PlainDate */ },
  onViewChange:   (view) => { /* 'day' | 'week' | 'month' */ }
});
```

---

## Recurring Events

Pass any valid RRULE string in the `rrule` field:

```js
calendarApp.eventsService.add({
  title: 'Weekly Standup',
  start: '2026-01-05T09:00:00',
  end:   '2026-01-05T09:15:00',
  rrule: 'FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR'
});
```

The built-in recurrence picker modal covers daily, weekly, monthly, and yearly rules with custom interval and end options.

---

## Custom Modals

Disable the built-in modals and handle creation/editing in your own UI:

```js
const calendarApp = createCalendar({
  views: [...],
  enableModals: false,
  onEventCreateRequest: ({ draft, context }) => {
    // draft.start, draft.end, context.source ('time-slot' | 'day-cell' | ...)
    calendarApp.showGhostEvent(draft);   // show preview on the grid
    openMyModal(draft);
  },
  onEventClick: (event) => openMyEditModal(event)
});

// When the user confirms in your modal:
calendarApp.eventsService.add(finalEvent);
calendarApp.hideGhostEvent();

// To update the preview while the user types:
calendarApp.updateGhostEvent({ title: '...', start: '...', end: '...' });
```

---

## Theming

Pass a theme object as a prop to override any CSS custom property:

```vue
<Calendar :calendar-app="calendarApp" :theme="myTheme" />
```

```js
const myTheme = {
  '--calendar-primary-color': '#e91e63',
  '--calendar-today-bg':      '#e91e63',
  '--calendar-header-bg':     '#fce4ec',
  '--calendar-border-color':  '#f8bbd0'
};
```

Built-in presets are available via `THEME_PRESETS`:

```js
import { THEME_PRESETS } from 'vue-calendarium';
// THEME_PRESETS.default | .dark | .compact | .highContrast
```

See [docs/STYLING.md](./docs/STYLING.md) and [docs/THEME_REFERENCE.md](./docs/THEME_REFERENCE.md) for the full list of variables.

---

## Feature Flags

| Flag | Default | Description |
| --- | --- | --- |
| `enableModals` | `true` | Built-in create/edit/delete modals |
| `enableMobileSidebar` | `true` | Slide-out sidebar on mobile |
| `mobileViewSelectorPlacement` | `'sidebar'` | `'header'` or `'sidebar'` |
| `enableSwipeGestures` | `true` | Horizontal swipe navigation |
| `enablePinchToZoom` | `true` | Pinch-to-zoom on Day/Week views |
| `enableCurrentTimeIndicator` | `true` | Red current-time line |
| `enableDragAndDrop` | `false` | Drag events across the grid |

---

## Documentation

| Guide | Description |
| --- | --- |
| [docs/USAGE.md](./docs/USAGE.md) | Usage guide with practical examples |
| [docs/API.md](./docs/API.md) | Full API reference — props, callbacks, services |
| [docs/STYLING.md](./docs/STYLING.md) | Theming and styling guide |
| [docs/THEME_REFERENCE.md](./docs/THEME_REFERENCE.md) | Complete CSS variables reference |
| [docs/THEME_EXAMPLES.md](./docs/THEME_EXAMPLES.md) | Ready-to-use theme examples |
| [docs/COLORS.md](./docs/COLORS.md) | 12-color Material palette and helpers |
| [docs/GHOST_EVENTS.md](./docs/GHOST_EVENTS.md) | Ghost events for custom modal workflows |

---

## Development

```bash
make dev        # start the dev server
make test       # unit tests (Vitest)
make test-ui    # end-to-end tests (Playwright)
```

---

## Contributing

Contributions are welcome. Please read the [contributing guide](./CONTRIBUTING.md) and the [code of conduct](./CODE_OF_CONDUCT.md) before opening an issue or pull request.

---

## License

[MIT](./LICENSE) © zehenrique
