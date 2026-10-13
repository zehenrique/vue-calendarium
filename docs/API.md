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
} from 'vue-calendarium';
```

### TypeScript

Type definitions ship with the package ([`types/index.d.ts`](../types/index.d.ts)), so the config, callbacks and services are typed without extra setup:

```ts
import { createCalendar, createViewWeek, type CalendarApp, type CalendarEventData } from 'vue-calendarium';

const calendarApp: CalendarApp = createCalendar({
  views: [createViewWeek()],
  onEventCreate: (events: CalendarEventData[]) => saveToBackend(events)
});
```

### Styles

The component's CSS is imported by the package entry automatically. If your setup needs it as a separate import, it is also exported as `vue-calendarium/style.css`.

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
import { createCalendar, createViewDay, createViewWeek, createViewMonth } from 'vue-calendarium';

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
- `enableDesktopSidebar` (default `true`): the sidebar on desktop, with a small month and the calendars. See [Views](./VIEWS.md#sidebar).
- `sidebarOpen` (default: open, unless the calendar is narrower than 1024px): whether the desktop sidebar starts open.
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
- `onEventDrop({ event, originalEvent, dropTarget, scope })` (used when `enableDragAndDrop=true`; `scope` is set for repeating events)

### Returned `calendarApp`

State (computed refs):

- `currentView`, `currentDate`, `locale`
- `visibleEvents` (events filtered by visible calendars)
- `ghostEvent`
- `sidebarOpen`: whether the desktop sidebar is open

Services:

- `eventsService` (`EventsService`)
- `calendarsService` (`CalendarsService`)

Navigation methods:

- `setView(viewName)`, `setDate(date)`, `setLocale(locale)`
- `goToToday()`, `goToNext()`, `goToPrevious()`

Sidebar methods (desktop):

- `setSidebarOpen(open)`, `toggleSidebar()`: open or close the sidebar, as the header's menu button does

Ghost event methods:

- `showGhostEvent(eventData)`, `updateGhostEvent(eventData)`, `hideGhostEvent()`

## Data models

### `CalendarEvent`

Common fields:

- `id: string`
- `title: string`
- `start: string` (wall-clock date-time, `'2026-03-14T10:00:00'`; values with `Z` or an offset are converted to the viewer's time zone)
- `end: string | null` (same format)
- `allDay: boolean`
- `calendarId: string` (required: the id of an existing calendar)
- `color: string`
- `rrule: string`
- `description: string`
- `location: string`
- `custom: Record<string, unknown>`

- `recurringEventId: string | null` and `originalStart: string | null`: set on an instance of a repeating event, meaning an occurrence generated from the rule (with the id `'<series id>@<start>'`) or a changed occurrence: a stored event that takes the place of one occurrence and keeps its id. See [Recurring events](./RECURRING_EVENTS.md#changed-occurrences).

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

Events without a valid `calendarId` are rejected with a console error: `add()` and `update()` return `null`, and `set()` leaves them out.

### `CalendarsService`

- `getAll()`, `get(id)`, `add(calendar)`, `update(calendar)`, `remove(id)`, `set(calendars)`
- `getVisible()`, `toggleVisibility(id)`, `getRef()`

## Views

```js
import { createViewDay, createViewWeek, createViewMonth } from 'vue-calendarium';

const views = [createViewDay(), createViewWeek(), createViewMonth()];
```

## i18n

The component uses `vue-i18n` internally. Register the exported `translations` in your app.

See [USAGE.md](./USAGE.md) for a complete integration example.
