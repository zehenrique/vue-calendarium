# vue-calendarium

[![npm version](https://img.shields.io/npm/v/vue-calendarium.svg)](https://www.npmjs.com/package/vue-calendarium)
[![license](https://img.shields.io/npm/l/vue-calendarium.svg)](./LICENSE)
[![Vue 3](https://img.shields.io/badge/Vue-3-42b883.svg)](https://vuejs.org/)
[![Vuetify 4](https://img.shields.io/badge/Vuetify-4-1867C0.svg)](https://vuetifyjs.com/)
[![Live demo](https://img.shields.io/badge/demo-try%20it%20live-1967D2.svg)](https://zehenrique.github.io/vue-calendarium/)

A full-featured scheduling and calendar component for **Vue 3** and **Vuetify 4**. Supports Month, Week, and Day views, recurring events (RRULE), drag-and-drop, mobile gestures, theming via CSS variables, and Temporal-based date handling.

**[▶ Try the live demo](https://zehenrique.github.io/vue-calendarium/)**. Open it on your phone to try the swipe and pinch gestures, or on a desktop switch your browser to a phone-sized viewport with its device mode (Chrome and Edge: press F12, then Ctrl+Shift+M; hold Shift and drag to pinch). Read the [documentation](https://zehenrique.github.io/vue-calendarium/docs.html) online.

Upgrading from version 1? Follow the [upgrade guide](./docs/UPGRADING.md).

---

## Features

- **Month, week and day views**, with a desktop sidebar and a current-time line
- **Built-in dialogs** to create, view, edit and delete events, or your own dialogs with a live preview
- **Recurring events** (RRULE) with a repeat editor and "this / following / all events" changes
- **Calendars** with colours and show/hide, **drag and drop**, and **iCalendar** import and export
- **Mobile layout** with swipe between periods, pinch-to-zoom, a side menu and bottom sheets
- **Theming** with CSS variables and presets, **English and Portuguese**, 24-hour times and the **Temporal API**

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

If you are coming from Vuetify 3, check your breakpoints and global CSS resets; see the [upgrade guide](./docs/UPGRADING.md) and [Theming](./docs/THEMING.md#vuetify-4).

---

## Installation

```bash
npm install vue-calendarium
```

Import Vuetify's styles and the Material Design Icons font (installed with the package) once in your app:

```js
import 'vuetify/styles';
import '@mdi/font/css/materialdesignicons.css';
```

The package includes its own styles and TypeScript types, and loads the touch gesture library on demand, so it also works with server-side rendering (add `import 'vue-calendarium/style.css'` there). See the [API reference](./docs/API.md#styles).

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

## Next steps

- Load and save events with the services and callbacks: [Events and dialogs](./docs/EVENTS.md)
- Repeating events: [Recurring events](./docs/RECURRING_EVENTS.md)
- Use your own dialogs: [Using your own dialogs](./docs/EVENTS.md#using-your-own-dialogs)
- Colours and fonts: [Theming](./docs/THEMING.md)
- Every option and method: [API reference](./docs/API.md)

---

## Documentation

All guides are also on the [documentation website](https://zehenrique.github.io/vue-calendarium/docs.html).

| Guide | What it covers |
| --- | --- |
| [Upgrading](./docs/UPGRADING.md) | Moving from 1.x to 2.0 |
| [Views](./docs/VIEWS.md) | Month, week and day views, navigation and the sidebar |
| [Events and dialogs](./docs/EVENTS.md) | Creating and editing events, calendars, callbacks, your own dialogs, iCalendar files |
| [Recurring events](./docs/RECURRING_EVENTS.md) | Repeat rules and changing one occurrence or many |
| [Drag and drop](./docs/DRAG_AND_DROP.md) | Moving events by dragging them |
| [Mobile and touch gestures](./docs/MOBILE.md) | The phone layout, swipe, pinch-to-zoom and the side menu |
| [Theming](./docs/THEMING.md) | Colours, fonts and presets |
| [Languages and formats](./docs/I18N.md) | Languages, dates and times |
| [Accessibility](./docs/ACCESSIBILITY.md) | Keyboard and screen reader support |
| [Troubleshooting](./docs/TROUBLESHOOTING.md) | Fixes for common problems |
| [API reference](./docs/API.md) | Every export, option, callback and method |
| [Theme variables](./docs/THEME_REFERENCE.md) | Every CSS variable and its default |
| [Changelog](./CHANGELOG.md) | Changes in each version |

---

## Development

```bash
make dev        # start the dev server
make test       # unit tests (Vitest)
make test-ui    # end-to-end tests (Playwright)
```

`npm run build:lib` builds the npm package into `lib/` (it also runs automatically before `npm publish`). The type definitions in [`types/index.d.ts`](./types/index.d.ts) are written by hand: update them whenever the public API changes.

The [website](https://zehenrique.github.io/vue-calendarium/) has the demo (`index.html` + `src/App.vue`) and the documentation (`docs.html` + `site/`), which renders the Markdown files at build time. To place a new page in its sidebar, add it to `SECTIONS` in `site/docs-page.js`. Both are built with `make build` and deployed to GitHub Pages by [`.github/workflows/pages.yml`](./.github/workflows/pages.yml).

---

## Contributing

Contributions are welcome. Please read the [contributing guide](./CONTRIBUTING.md) and the [code of conduct](./CODE_OF_CONDUCT.md) before opening an issue or pull request.

---

## License

[MIT](./LICENSE) © zehenrique
