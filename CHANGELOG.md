# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2026-10-12

Upgrading from 1.x? Follow the [upgrade guide](docs/UPGRADING.md).

### Changed

- **Breaking:** every event needs a `calendarId` that matches an existing calendar. Events without one are rejected with a console error, and `eventsService.add()` returns `null`.
- **Breaking:** the calendar now requires Vuetify 4. Peer dependencies are `vue ^3.5`, `vuetify ^4.0` and `vue-i18n ^11.0`.
- The calendar uses Vuetify 4's Material Design 3 styling for its dialogs, menus, buttons and text; see [docs/THEMING.md](docs/THEMING.md#vuetify-4). Dialogs keep their 24px corners, and the header title stays 20px.
- The package ships a compiled ES module (`lib/`) with bundled styles instead of raw `src/` files, so the consuming app no longer needs to compile `.vue` files.
- Hammer.js is loaded automatically, in the browser only. Swipe, pinch-to-zoom and sidebar gestures no longer need a global `window.Hammer`, and the package can be imported during server-side rendering.
- Updated all dependencies to their latest versions.

### Added

- TypeScript type definitions (`types/index.d.ts`).
- The repeat logic is exported as plain functions for apps with their own dialogs: `ruleToForm` and `formToRule` (the custom repeat dialog's fields), `getRepeatOptions` and `getMonthlyOptions` (the menu's choices), `describeRule` (rules in words), `planRecurringEdit` and `planRecurringDelete` ("this / following / all events"), and the rule helpers (`expandRecurrence`, `getRuleParts`, `moveRule`...). The repeat components are exported for apps with their own Vuetify event dialog: `RepeatSelect`, `RecurrencePickerModal` and `RecurrenceScopeModal`.
- More exports for apps that build around the calendar: the sidebar's `MiniMonth` and `CalendarVisibilityList`; `parseICal` and `serializeICal` for iCalendar files (repeating events as Google Calendar writes them, time zones and all-day events); `toPlainDateTimeString` for dates from APIs; and `getEventColorStyle` for the calendar's event colours. See [Recurring events](docs/RECURRING_EVENTS.md#in-your-own-ui).
- A desktop sidebar, as in Google Calendar: a small month to move to any day, and a checkbox for each calendar to show or hide its events. The header's menu button slides it in and out, and the app can too (`calendarApp.toggleSidebar()`, `setSidebarOpen()`, `sidebarOpen`). It has the header's background. Options `enableDesktopSidebar` (default `true`) and `sidebarOpen`, and theme variable `--calendar-sidebar-width`.
- Changing a repeating event asks which events to change, as in Google Calendar: **This event**, **This and following events** or **All events**, for edits, drag and drop and deletes. A single changed occurrence is stored as an event that takes the place of that occurrence (`recurringEventId`, `originalStart`), and changes to the series are copied to its changed occurrences, which keep their own time and other changes. Moving a series to another day also moves the days its rule repeats on.
- An [upgrade guide](docs/UPGRADING.md) for moving from 1.x to 2.0.
- A [documentation website](https://zehenrique.github.io/vue-calendarium/docs.html) with every guide, the changelog and the upgrade guide, linked from the live demo.
- Guides for views, events and dialogs, recurring events, drag and drop, the mobile layout, touch gestures (swipe and pinch-to-zoom), languages, accessibility and troubleshooting.

### Fixed

- Repeating events show at the right time in every time zone. Before, they were shifted by the viewer's offset from UTC.
- Editing an occurrence of a repeating event no longer creates a second series or moves the start of the series.
- Deleting one occurrence of a repeating event works for any id, including generated UUIDs, and occurrences have stable ids (`'<series id>@<start>'`) with a `recurringEventId` field.
- The repeat picker's end date includes that day.
- The desktop day view title uses the language's own word order ("quarta-feira, 15 de janeiro de 2025", not "quarta-feira, janeiro 15, 2025").
- The mobile day view's weekday is in the calendar's language ("QUA", was always "WED"), and today is worked out from the calendar's clock. With the view dropdown in the header, the title uses the short month ("set. 2025") so it is not cut off.
- Vuetify's language is set inside the calendar only, with Vuetify's own translations: the calendar no longer changes the app's Vuetify language, and apps without Vuetify's Portuguese messages no longer get "translation not found" warnings from the date picker.
- Buttons keep their shapes in apps with an unlayered CSS reset (CoreUI, Bootstrap), including in the date picker, which opens outside the calendar.
- `@js-temporal/polyfill` was listed twice in the package's dependencies.
- The package can be imported in plain Node, as the README says (server-side rendering, scripts, tests). Node's `node` export condition now gives the code without the CSS import, which Node cannot load, while bundlers still get the styles automatically; and `rrule`, whose named exports Node cannot see, is read either way. `npm run test:package` (`make test-package`) checks it, also in CI.
- Rules written by other tools with a `DTSTART` in a time zone or in UTC, such as rrule.js in the browser, keep their last day: their UTC end dates (`UNTIL`) and deleted dates (`EXDATE`) are read in that time zone, and an end at midnight includes that day. Before, a summer end date (local midnight, 23:00 UTC the day before) lost its last occurrence and was described as the day before.
- The date picker's **Today** button uses the calendar's clock, like the header's.
- The mobile day view's date uses the today colour (`--calendar-today-bg`), like the other today markers, instead of the primary colour.
- A repeat can be removed again: the repeat link opens a menu, as in Google Calendar, with **Does not repeat**, the usual rules for the event's date ("Weekly on Wednesday", "Monthly on the third Wednesday", "Annually on January 15", "Every weekday") and **Custom...**. Before, it opened the custom dialog, which had no way back to "Does not repeat".
- On mobile, **All day** and the repeat link share a row in the create dialog, as on desktop; the link moves to its own line only when it does not fit.
- Repeat descriptions write out the days ("Weekly on Monday, Wednesday") instead of abbreviations ("MON, WED").
- The custom repeat dialog follows Google Calendar's layout: "Repeat every [1] [week]" on one line, round weekday buttons, a dropdown for the monthly options, and the end options' fields lined up in one column with space between them.
- Dialog buttons sit together on the right with the same size; the text buttons' hover background was smaller than the filled buttons.
- Buttons are pill-shaped and icon buttons round, with a round hover background, as in Google Calendar, whatever the app's `VBtn` defaults.
- Text uses Vuetify 4's typography classes. The Vuetify 3 classes it used before (`text-h6`, `text-body-1`...) no longer exist in Vuetify 4, so some text had lost its size; the colour dot in the event details is centred on the title again.
- The custom repeat dialog's monthly options show the day and weekday ("Monthly on day 15", "Monthly on the third Wednesday") instead of an empty placeholder.
- Dates with `Z` or an offset are converted to the viewer's time zone instead of causing an error.
- The month view's **+N** button opens a list of that day's events.
- On mobile with `enableSwipeGestures: false`, the header has previous and next buttons.
- Text that was not translated: the end time durations, the date in the details dialog, repeat descriptions ("Every 2 weeks", "6 times", "until") and the "All day" label for screen readers.
- Keyboard access: events in every view are buttons, the time grid and the month view can be navigated with the arrow keys to create events, the header title announces period changes, and swiping respects reduced motion.
- Dragging an occurrence of a repeating event no longer moves the series or does nothing without asking.
- Icons and colour dots in the event details, and the warning icon in the delete confirmation, now line up with their text. The event dialog's calendar dropdown arrow lines up with the selected calendar.
- Dragging an event onto a time that already has another event now moves it there. Before, the drop was ignored.

## [1.0.3] - 2026-07-02

### Changed

- The `vue-i18n` peer dependency is now `^11.0` (was `^9.0`).
- Updated `@js-temporal/polyfill` to 0.5.

## [1.0.2] - 2026-06-28

### Fixed

- Event listeners and timers are cleaned up when the calendar views unmount.
- Consistent styling across the event, delete and recurrence dialogs.

## [1.0.1] - 2026-06-27

### Fixed

- Package homepage, repository and issue links now point to the `vue-calendarium` repository.

## [1.0.0] - 2026-06-25

### Changed

- Renamed the package to `vue-calendarium` and published it to the public npm registry.
- Renamed the root CSS class from `.google-calendar` to `.vue-calendarium`. **Breaking:** update any custom selectors that targeted `.google-calendar`.
- Replaced the default font stack (now `Roboto` + system fonts).

### Added

- MIT `LICENSE` file, `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, issue/PR templates, and CI workflow.

## [0.1.0]

- Initial release: Month/Week/Day views, event CRUD, recurring events (RRULE),
  mobile gestures, Temporal-based date handling, and i18n (`en`, `pt`).

[2.0.0]: https://github.com/zehenrique/vue-calendarium/compare/v1.0.2...v2.0.0
[1.0.3]: https://www.npmjs.com/package/vue-calendarium/v/1.0.3
[1.0.2]: https://github.com/zehenrique/vue-calendarium/compare/v1.0.1...v1.0.2
[1.0.1]: https://github.com/zehenrique/vue-calendarium/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/zehenrique/vue-calendarium/releases/tag/v1.0.0
