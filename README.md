# vue-calendarium

[![npm version](https://img.shields.io/npm/v/vue-calendarium.svg)](https://www.npmjs.com/package/vue-calendarium)
[![license](https://img.shields.io/npm/l/vue-calendarium.svg)](./LICENSE)
[![Vue 3](https://img.shields.io/badge/Vue-3-42b883.svg)](https://vuejs.org/)

A polished, full-featured scheduling and calendar component for Vue 3 (Composition API), built with Vuetify. Includes Month/Week/Day views, event CRUD, recurring events (RRULE), mobile gestures, and Temporal-based date handling (24-hour time display).

> Note: `vue-calendarium` is an independent open-source project. It is inspired by familiar calendar UX patterns but is not affiliated with or endorsed by any third-party calendar product.

Mobile gesture handlers are safely reinitialized across SPA route changes so pinch-to-zoom and horizontal swipe remain stable after unmounting and remounting the calendar.

## Installation

```bash
npm install vue-calendarium
```

## Requirements

- Vue 3
- Vuetify 3 (your app should be wrapped in `v-app`)
- vue-i18n 9 (the component uses `t()` internally)

## Quick start

Register translations with vue-i18n:

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

The calendar syncs Vuetify's locale (used by `VDatePicker`) with the calendar locale, so the date picker matches the app language. Ensure your Vuetify setup includes `en` and `pt` locale messages.

Create a calendar instance and render the component:

```vue
<template>
  <v-app>
    <v-main>
      <Calendar :calendar-app="calendarApp" />
    </v-main>
  </v-app>
</template>

<script setup>
import { createCalendar, createViewDay, createViewWeek, createViewMonth, Calendar } from 'vue-calendarium';

const calendarApp = createCalendar({
  views: [createViewDay(), createViewWeek(), createViewMonth()],
  defaultView: 'month',
  locale: 'en-US',
  calendars: [
    { id: 'work', name: 'Work', color: '#1967D2' },
    { id: 'personal', name: 'Personal', color: '#0B8043' }
  ],
  events: []
});

calendarApp.eventsService.add({
  title: 'Team Meeting',
  start: '2026-01-27T10:00:00',
  end: '2026-01-27T10:30:00',
  calendarId: 'work'
});
</script>
```

## Documentation

Start here, then jump to the specific guides:

- [docs/USAGE.md](./docs/USAGE.md) - usage guide + practical examples
- [docs/API.md](./docs/API.md) - full API reference (props, callbacks, services)
- [docs/STYLING.md](./docs/STYLING.md) - theming/styling guide
- [docs/THEME_REFERENCE.md](./docs/THEME_REFERENCE.md) - complete CSS variables reference
- [docs/THEME_EXAMPLES.md](./docs/THEME_EXAMPLES.md) - quick theme examples
- [docs/COLORS.md](./docs/COLORS.md) - predefined 12-color palette + helpers
- [docs/GHOST_EVENTS.md](./docs/GHOST_EVENTS.md) - ghost events for custom modals

## Development

```bash
make dev
```

Run tests:

```bash
make test
make test-ui
```

## Contributing

Contributions are welcome! Please read the [contributing guide](./CONTRIBUTING.md) and the [code of conduct](./CODE_OF_CONDUCT.md) before opening an issue or pull request.

## License

[MIT](./LICENSE) © zehenrique
