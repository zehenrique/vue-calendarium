# API

This document describes the public API exported by the package.

## Exports

```js
import {
  Calendar,
  createCalendar,
  createViewDay,
  createViewWeek,
  createViewMonth,
  CalendarEvent,
  CalendarModel,
  EventsService,
  CalendarsService,
  THEME_PRESETS,
  translations
} from '@zehenrique/vue-google-calendar';
```

## `Calendar` (Vue component)

### Props

#### `calendarApp` (required)

- Type: `object`
- The calendar application instance returned by `createCalendar()`.

#### `theme` (optional)

- Type: `Record<string, string> | null`
- Default: `null`
- Theme overrides (CSS custom properties).

See [STYLING.md](./STYLING.md) for the full theme reference.

### Vue emits

The `Calendar` component does not emit Vue events. User interactions are reported through callbacks configured on the `calendarApp` instance.

## `createCalendar(config)`

Creates the stateful calendar “app” object.

### Minimal setup

```js
import { Temporal } from '@js-temporal/polyfill';
import { createCalendar, createViewDay, createViewWeek, createViewMonth } from '@zehenrique/vue-google-calendar';

const calendarApp = createCalendar({
  views: [createViewDay(), createViewWeek(), createViewMonth()],
  defaultView: 'month',
  selectedDate: Temporal.Now.plainDateISO(),
  locale: 'en-US',
  calendars: [{ id: 'default', name: 'Default', color: '#1a73e8', visible: true }],
  events: []
});
```

### Config options

- `views` (required): array of view objects created by `createViewDay()`, `createViewWeek()`, `createViewMonth()`.
- `defaultView`: `'day' | 'week' | 'month'`.
- `selectedDate`: `Temporal.PlainDate` (defaults to “today”).
- `locale`: `'en-US' | 'pt-PT'`.
- `locale` also syncs to Vuetify's locale so `VDatePicker` matches the app language.
- `events`: array of event objects (wrapped internally as `CalendarEvent`).
- `calendars`: array of calendar objects (wrapped internally as `CalendarModel`).

Feature flags:

- `enableModals` (default `true`)
- `enableMobileSidebar` (default `true`)
- `mobileViewSelectorPlacement` (default `'sidebar'`)
- `enableSwipeGestures` (default `true`)
- `enablePinchToZoom` (default `true`)
- `enableCurrentTimeIndicator` (default `true`)
- `enableDragAndDrop` (default `false`)

Callbacks:

- `onEventClick(event)`
- `onDateChange(date)` where `date` is `Temporal.PlainDate`
- `onViewChange(view)` where `view` is `'day' | 'week' | 'month'`
- `onEventCreate(events)` (currently called with an array containing the newly created event)
- `onEventUpdate(event)`
- `onEventDelete(event)`
- `onEventCreateRequest({ draft, context })` (used when `enableModals=false`)
- `onEventDrop({ event, originalEvent, dropTarget })` (used when `enableDragAndDrop=true`)

### Returned `calendarApp`

State (computed refs):

- `currentView`, `currentDate`, `locale`
- `visibleEvents` (events filtered by visible calendars)
- `ghostEvent`

Services:

- `eventsService` (`EventsService`)
- `calendarsService` (`CalendarsService`)

Navigation methods:

- `setView(viewName)`, `setDate(date)`, `setLocale(locale)`
- `goToToday()`, `goToNext()`, `goToPrevious()`

Ghost event methods:

- `showGhostEvent(eventData)`, `updateGhostEvent(eventData)`, `hideGhostEvent()`

## Data models

### `CalendarEvent`

Common fields:

- `id: string`
- `title: string`
- `start: string` (ISO date-time)
- `end: string | null` (ISO date-time)
- `allDay: boolean`
- `calendarId: string`
- `color: string`
- `rrule: string`
- `description: string`
- `location: string`
- `custom: Record<string, unknown>`

### `CalendarModel`

Common fields:

- `id: string`
- `name: string`
- `color: string`
- `visible: boolean`
- `description: string`
- `custom: Record<string, unknown>`

## Services

### `EventsService`

- `getAll()`, `get(id)`, `add(event)`, `update(event)`, `remove(id)`, `set(events)`
- `getByCalendar(calendarId)`, `getByDateRange(start, end)`, `getRef()`

### `CalendarsService`

- `getAll()`, `get(id)`, `add(calendar)`, `update(calendar)`, `remove(id)`, `set(calendars)`
- `getVisible()`, `toggleVisibility(id)`, `getRef()`

## Views

```js
import { createViewDay, createViewWeek, createViewMonth } from '@zehenrique/vue-google-calendar';

const views = [createViewDay(), createViewWeek(), createViewMonth()];
```

## i18n

The component uses `vue-i18n` internally. Register the exported `translations` in your app.

See [USAGE.md](./USAGE.md) for a complete integration example.
