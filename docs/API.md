# API

Everything the package exports. For how to use it, start with the [README](../README.md#quick-start) and the guides; this page is the complete list.

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
  translations,
  // Repeating events, for apps with their own UI (see below)
  RepeatSelect,
  RecurrencePickerModal,
  RecurrenceScopeModal,
  describeRule,
  // Sidebar parts, iCalendar files, dates and colours (see below)
  MiniMonth,
  CalendarVisibilityList,
  parseICal,
  serializeICal,
  toPlainDateTimeString,
  getEventColorStyle,
  ruleToForm,
  formToRule,
  // Colours and themes (see below)
  CALENDAR_COLORS,
  DEFAULT_COLOR,
  getColorById,
  DEFAULT_THEME,
  mergeTheme
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

The component's CSS is imported by the package entry automatically when a bundler (Vite, webpack) builds your app. In plain Node, including the server side of server-side rendering, the package resolves to the same code without the CSS import (the `node` export condition), so it can be imported there. To have the styles in server-rendered pages, or if your setup needs them as a separate import, use `import 'vue-calendarium/style.css'`.

## `Calendar` (Vue component)

### Props

#### `calendarApp` (required)

- Type: `object`
- The calendar application instance returned by `createCalendar()`.

#### `theme` (optional)

- Type: `Record<string, string> | null`
- Default: `null`
- Theme overrides (CSS custom properties), merged with the default theme.

See [Theming](./THEMING.md) and the list of [theme variables](./THEME_REFERENCE.md).

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
- `locale` also sets Vuetify's language inside the calendar (its date pickers and their labels), with Vuetify's own translations. Your app's Vuetify language is not changed, and you do not need to register Vuetify's `pt` messages.
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

### Ghost events

A ghost event is a semi-transparent preview drawn on the grid (half opacity, dashed border). It is not stored in `eventsService`. The calendar shows one while its create dialog is open; with `enableModals: false`, it shows one when the user clicks the grid, just before calling `onEventCreateRequest`, and your app updates and hides it. See [Using your own dialogs](./EVENTS.md#using-your-own-dialogs).

- `showGhostEvent(event)`: shows `event` (same fields as an event) as the preview, replacing any current one. Only one ghost event is shown at a time.
- `updateGhostEvent(changes)`: merges `changes` into the current preview, for example a new `title` or `end`. Does nothing when no preview is shown.
- `hideGhostEvent()`: removes the preview. Call it when your dialog saves or closes.
- `ghostEvent`: computed ref with the current preview (with `isGhost: true`), or `null`.

## Repeating events

Plain functions, with no Vue or Vuetify, for apps that build their own UI around the calendar's repeat rules. See [Recurring events](./RECURRING_EVENTS.md#in-your-own-ui) for an example.

Rules and occurrences:

- `expandRecurrence(event, rangeStart, rangeEnd, { exceptions })`: the occurrences between two times, with changed occurrences in place of theirs.
- `getOccurrenceId(seriesId, originalStart)`: `'<series id>@<original start>'`.
- `getRuleParts(rrule)`: `{ FREQ: 'WEEKLY', COUNT: '6' }`.
- `getExceptionDates(rrule)`, `addExceptionDate(event, start)`, `keepExceptionDates(newRule, previousRule)`: deleted occurrences (`EXDATE`).
- `isSameRule(a, b)`, `hasOccurrenceAt(event, dateTime)`.
- `endRuleBefore(event, dateTime)`, `continueRuleFrom(event, dateTime)`: split a series in two.
- `moveRule(rrule, from, to)`: move a rule with its series to another time or day.

Changing one occurrence or many (`'this' | 'following' | 'all'`), returning `{ update, add, remove }`:

- `planRecurringEdit({ series, exceptions, instance, changes, scope })`
- `planRecurringDelete({ series, exceptions, instance, scope })`
- `changesRule(series, changes, instance)`: whether "this event" can be offered.

The repeat dialog and menu:

- `WEEKDAYS`: `['MO', ..., 'SU']`.
- `ruleToForm(rrule, startDate)`, `formToRule(form, startDate)`.
- `getRepeatOptions(startDate, { locale, t })`, `getMonthlyOptions(startDate, { locale, t })`.
- `describeRule(rrule, { locale, t })`.
- `createTranslator(locale)`: a `t` for the calendar's messages, for apps without vue-i18n.

Components, for an app's own Vuetify event dialog (see [Recurring events](./RECURRING_EVENTS.md#the-repeat-components)):

- `RepeatSelect`: `v-model` (rule), `start-date`, `link-class`.
- `RecurrencePickerModal`: `v-model` (open), `rrule`, `start-date`, `@save(rrule)`.
- `RecurrenceScopeModal`: `v-model` (open), `allow-this-event`, `@confirm(scope)`, `@cancel`.

## Other exports

Sidebar parts, for an app's own sidebar (see [Views](./VIEWS.md#sidebar)):

- `MiniMonth`: `selected-date`, `today` (`Temporal.PlainDate`), `locale`, `@select(date)`.
- `CalendarVisibilityList`: `calendars`, `v-model:visible-calendars` (ids).

iCalendar files (see [Events](./EVENTS.md#icalendar-files)):

- `parseICal(icsText, { calendarId })`: the file's events.
- `serializeICal(events, { prodId, tzid })`: the file's text.

Dates:

- `toPlainDateTimeString(value)`: a date from an API in the calendar's wall-clock form (`Z` and offsets converted to the viewer's time zone).

### Colours and themes

See [Theming](./THEMING.md) for the palette and how events are coloured.

- `CALENDAR_COLORS`: the 12-colour palette, `[{ id: 'tomato', name: 'Tomato', hex: '#D50000' }, ...]`.
- `DEFAULT_COLOR`: `'#1967D2'` (Cobalt), used for missing or invalid colours.
- `getColorById(id)`: the hex of a palette colour, or `DEFAULT_COLOR`.
- `getColorIdByHex(hex)`: the palette id of a hex colour, or `null`.
- `isValidColor(hex)`: whether the hex colour is in the palette.
- `getClosestColor(hex)`: the hex itself when it is in the palette, otherwise `DEFAULT_COLOR`.
- `getEventColorStyle(hex, isPast)`: `{ backgroundColor, color, opacity }`, the colours the calendar gives an event.
- `DEFAULT_THEME`, `THEME_PRESETS` (`default`, `dark`, `compact`, `highContrast`): theme objects of CSS variables.
- `mergeTheme(theme)`: `theme` on top of `DEFAULT_THEME`.
- `applyTheme(element, theme)`: sets the variables on an element.
- `generateThemeCSS(theme)`: the theme as a `.vue-calendarium { ... }` CSS rule.

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

Methods: `CalendarEvent.from(data)`, `toObject()`, `clone()`, `update(changes)`, `isAllDay()`, `isRecurring()`, `getDurationMinutes()`.

### `CalendarModel`

Common fields:

- `id: string`
- `name: string`
- `color: string`
- `visible: boolean`
- `description: string`
- `custom: Record<string, unknown>`

Methods: `CalendarModel.from(data)`, `toObject()`, `clone()`, `update(changes)`, `toggleVisibility()`.

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

The component uses `vue-i18n`. Register the exported `translations` in your app, as in the [quick start](../README.md#quick-start). See [Languages and formats](./I18N.md).
