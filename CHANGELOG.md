# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2026-10-12

Upgrading from 1.x? Follow the [upgrade guide](docs/UPGRADING.md).

### Changed

- **Breaking:** the calendar now requires Vuetify 4. Peer dependencies are `vue ^3.5`, `vuetify ^4.0` and `vue-i18n ^11.0`.
- The calendar uses Vuetify 4's Material Design 3 styling for its dialogs, menus, buttons and text; see [docs/STYLING.md](docs/STYLING.md#vuetify-4). Dialogs keep their 24px corners, and the header title stays 20px.
- The package ships a compiled ES module (`lib/`) with bundled styles instead of raw `src/` files, so the consuming app no longer needs to compile `.vue` files.
- Hammer.js is loaded automatically, in the browser only. Swipe, pinch-to-zoom and sidebar gestures no longer need a global `window.Hammer`, and the package can be imported during server-side rendering.
- Updated all dependencies to their latest versions.

### Added

- TypeScript type definitions (`types/index.d.ts`).
- An [upgrade guide](docs/UPGRADING.md) for moving from 1.x to 2.0.
- A [documentation website](https://zehenrique.github.io/vue-calendarium/docs.html) with every guide, the changelog and the upgrade guide, linked from the live demo.
- Guides for views, events and dialogs, recurring events, drag and drop, the mobile layout, touch gestures (swipe and pinch-to-zoom), languages, accessibility and troubleshooting.

### Fixed

- Repeating events show at the right time in every time zone. Before, they were shifted by the viewer's offset from UTC.
- Editing an occurrence of a repeating event edits the series. Before, it created a second series or moved the start of the series.
- Deleting one occurrence of a repeating event works for any id, including generated UUIDs, and occurrences have stable ids (`'<series id>@<start>'`) with a `recurringEventId` field.
- The repeat picker's end date includes that day.
- Events whose calendar does not exist are shown, and dates with `Z` or an offset are converted to the viewer's time zone instead of causing an error.
- The month view's **+N** button opens a list of that day's events.
- On mobile with `enableSwipeGestures: false`, the header has previous and next buttons.
- Text that was not translated: the end time durations, the date in the details dialog, repeat descriptions ("Every 2 weeks", "6 times", "until") and the "All day" label for screen readers.
- Keyboard access: events in every view are buttons, the time grid and the month view can be navigated with the arrow keys to create events, the header title announces period changes, and swiping respects reduced motion.
- Repeating events can no longer be dragged, which used to move the series or do nothing.
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
