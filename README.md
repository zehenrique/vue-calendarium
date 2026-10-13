# vue-calendarium

[![npm version](https://img.shields.io/npm/v/vue-calendarium.svg)](https://www.npmjs.com/package/vue-calendarium)
[![license](https://img.shields.io/npm/l/vue-calendarium.svg)](./LICENSE)
[![Vue 3](https://img.shields.io/badge/Vue-3-42b883.svg)](https://vuejs.org/)
[![Vuetify 4](https://img.shields.io/badge/Vuetify-4-1867C0.svg)](https://vuetifyjs.com/)
[![Live demo](https://img.shields.io/badge/demo-try%20it%20live-1967D2.svg)](https://zehenrique.github.io/vue-calendarium/)

A full-featured scheduling and calendar component for **Vue 3** and **Vuetify 4**. Supports Month, Week, and Day views, recurring events (RRULE), drag-and-drop, mobile gestures, theming via CSS variables, and Temporal-based date handling.

**[▶ Try the live demo](https://zehenrique.github.io/vue-calendarium/)**. Open it on your phone to try the swipe and pinch gestures. Read the [documentation](https://zehenrique.github.io/vue-calendarium/docs.html) online.

Upgrading from version 1? Follow the [upgrade guide](./docs/UPGRADING.md).

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

## Why vue-calendarium?

Most free Vue calendars either leave mobile interaction and event forms for you to build, or sell them as paid add-ons. vue-calendarium includes them:

| | vue-calendarium | Typical free alternatives |
| --- | --- | --- |
| Recurring events | RRULE plus a recurrence editor UI | Not included, a plugin without an editor, or paid |
| Create and edit forms | Built in (or bring your own) | Usually build your own, or paid |
| Swipe between periods, pinch-to-zoom | Built in | Not included |
| Phone layout (drawer, bottom sheets) | Built in | Responsive layout only |
| Vuetify / Material Design | Native Vuetify components | Separate design system |

---

## Requirements

| Peer dependency | Version |
| --- | --- |
| Vue | `^3.5` |
| Vuetify | `^4.0` (your app must be wrapped in `<v-app>`) |
| vue-i18n | `^11.0` |

The calendar uses Vuetify 4's Material Design 3 styling (see [docs/STYLING.md](docs/STYLING.md#vuetify-4)). Two app-level Vuetify 4 changes are worth checking when you upgrade:

- **Breakpoints.** Vuetify 4 lowered its `md`/`lg`/`xl`/`xxl` thresholds. The calendar switches its dialogs to bottom sheets using Vuetify's `mobile` breakpoint, so keep the Vuetify 3 thresholds if you want the same behaviour:

  ```js
  createVuetify({
    display: { thresholds: { md: 960, lg: 1280, xl: 1920, xxl: 2560 } },
  })
  ```

- **CSS layers.** Vuetify 4 ships all of its CSS in cascade layers, so any unlayered global rule (for example a `* { margin: 0; padding: 0 }` reset) now overrides Vuetify's utility classes, including the ones the calendar uses. Put such rules in a layer declared before Vuetify's, e.g. `@layer app-base { ... }`.

---

## Installation

```bash
npm install vue-calendarium
```

The package ships a compiled ES module with its styles (imported automatically) and TypeScript type definitions. Touch gestures (HammerJS) are loaded on demand in the browser, so the package is also safe to import during server-side rendering.

The calendar uses [Material Design Icons](https://pictogrammers.com/library/mdi/). The font is installed with the package (`@mdi/font`), but you import its stylesheet once in your app, together with Vuetify's styles:

```js
import 'vuetify/styles';
import '@mdi/font/css/materialdesignicons.css';
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

All guides are also on the [documentation website](https://zehenrique.github.io/vue-calendarium/docs.html).

| Guide | Description |
| --- | --- |
| [docs/UPGRADING.md](./docs/UPGRADING.md) | Upgrading from 1.x to 2.0 |
| [docs/USAGE.md](./docs/USAGE.md) | Usage guide with practical examples |
| [docs/VIEWS.md](./docs/VIEWS.md) | Month, week and day views, navigation and the current time indicator |
| [docs/EVENTS.md](./docs/EVENTS.md) | Creating, viewing, editing and deleting events, calendars and callbacks |
| [docs/RECURRING_EVENTS.md](./docs/RECURRING_EVENTS.md) | Repeat rules, the repeat picker and deleting occurrences |
| [docs/DRAG_AND_DROP.md](./docs/DRAG_AND_DROP.md) | Moving events by dragging them |
| [docs/MOBILE.md](./docs/MOBILE.md) | The mobile layout, side menu and bottom sheets |
| [docs/GESTURES.md](./docs/GESTURES.md) | Swipe, pinch-to-zoom and sidebar gestures |
| [docs/I18N.md](./docs/I18N.md) | Languages, date and time formats |
| [docs/ACCESSIBILITY.md](./docs/ACCESSIBILITY.md) | What works with keyboards and screen readers, and what does not yet |
| [docs/TROUBLESHOOTING.md](./docs/TROUBLESHOOTING.md) | Fixes for common problems |
| [docs/API.md](./docs/API.md) | Full API reference — props, callbacks, services |
| [docs/STYLING.md](./docs/STYLING.md) | Theming and styling guide |
| [docs/THEME_REFERENCE.md](./docs/THEME_REFERENCE.md) | Complete CSS variables reference |
| [docs/THEME_EXAMPLES.md](./docs/THEME_EXAMPLES.md) | Ready-to-use theme examples |
| [docs/COLORS.md](./docs/COLORS.md) | 12-color Material palette and helpers |
| [docs/GHOST_EVENTS.md](./docs/GHOST_EVENTS.md) | Ghost events for custom modal workflows |
| [CHANGELOG.md](./CHANGELOG.md) | Changes in each version |

---

## Development

```bash
make dev        # start the dev server
make test       # unit tests (Vitest)
make test-ui    # end-to-end tests (Playwright)
```

`npm run build:lib` builds the npm package into `lib/` (it also runs automatically before `npm publish`). The type definitions in [`types/index.d.ts`](./types/index.d.ts) are written by hand: update them whenever the public API changes.

### Website

The [website](https://zehenrique.github.io/vue-calendarium/) has two parts:

- **Demo** (`index.html` + `src/App.vue`): this repository's dev app.
- **Documentation** (`docs.html` + `site/`): renders `README.md`, `CHANGELOG.md`, `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md` and every Markdown file in `docs/` at build time, so it always matches the repository. A new file in `docs/` appears in the sidebar automatically; add it to `SECTIONS` in `site/docs-page.js` to choose its place and label.

Both are built with `make build` and deployed to GitHub Pages by [`.github/workflows/pages.yml`](./.github/workflows/pages.yml) on every push to `main`. To enable it once, open the repository's **Settings > Pages** and set **Source** to **GitHub Actions**.

---

## Contributing

Contributions are welcome. Please read the [contributing guide](./CONTRIBUTING.md) and the [code of conduct](./CODE_OF_CONDUCT.md) before opening an issue or pull request.

---

## License

[MIT](./LICENSE) © zehenrique
