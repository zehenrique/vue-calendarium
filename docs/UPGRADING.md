# Upgrading from 1.x to 2.0

vue-calendarium 2.0 moves to **Vuetify 4**. The calendar's API is unchanged: your events, calendars, callbacks, theme variables and component props all work as before. Most of the work is upgrading your app to Vuetify 4, which the calendar now requires.

If your app is already on Vuetify 4 and Vue 3.5, the upgrade is usually just `npm install vue-calendarium@2`.

## Checklist

1. [Update the peer dependencies](#1-update-the-peer-dependencies)
2. [Install vue-calendarium 2](#2-install-vue-calendarium-2)
3. [Remove the Hammer.js setup](#3-remove-the-hammerjs-setup)
4. [Check your Vuetify breakpoints](#4-check-your-vuetify-breakpoints)
5. [Move global CSS resets into a layer](#5-move-global-css-resets-into-a-layer)
6. [Review the visual changes](#6-review-the-visual-changes)

## 1. Update the peer dependencies

| Peer dependency | 1.0.0 – 1.0.2 | 1.0.3 | 2.0 |
| --- | --- | --- | --- |
| Vue | `^3.3` | `^3.3` | `^3.5` |
| Vuetify | `^3.3` | `^3.3` | `^4.0` |
| vue-i18n | `^9.0` | `^11.0` | `^11.0` |

```bash
npm install vue@^3.5 vuetify@^4 vue-i18n@^11
```

Follow the [Vuetify upgrade guide](https://vuetifyjs.com/en/getting-started/upgrade-guide/) for the rest of your app. If you are coming from 1.0.0 – 1.0.2, also follow the vue-i18n migration guides for [version 10](https://vue-i18n.intlify.dev/guide/migration/breaking10.html) and [version 11](https://vue-i18n.intlify.dev/guide/migration/breaking11.html). The calendar uses the Composition API mode (`legacy: false`), as shown in the [README](../README.md#quick-start).

## 2. Install vue-calendarium 2

```bash
npm install vue-calendarium@2
```

Imports stay the same:

```js
import { Calendar, createCalendar, createViewDay, createViewWeek, createViewMonth, translations } from 'vue-calendarium';
```

The package now ships a compiled ES module instead of raw `.vue` source files:

- Your bundler no longer needs to compile the calendar's `.vue` files.
- The calendar's styles load automatically with the JavaScript. If your setup needs to import them explicitly, use `import 'vue-calendarium/style.css'`.
- TypeScript type definitions are included.
- The package can be imported during server-side rendering.

## 3. Remove the Hammer.js setup

Version 1 read Hammer.js from a global `window.Hammer`, so apps had to load it themselves, for example:

```html
<!-- No longer needed -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/hammer.js/2.0.8/hammer.min.js"></script>
```

```js
// No longer needed
import Hammer from 'hammerjs';
window.Hammer = Hammer;
```

Version 2 loads Hammer.js itself, in the browser only, when the calendar mounts. Remove that setup. Leaving it in does no harm, but the CDN script is an extra download.

## 4. Check your Vuetify breakpoints

Vuetify 4 lowered its `md`, `lg`, `xl` and `xxl` breakpoints. The calendar switches its dialogs to bottom sheets using Vuetify's `mobile` breakpoint (`lg`), so on Vuetify 4's defaults, windows between 1145px and 1279px wide show dialogs where version 1 showed bottom sheets.

To keep the version 1 behaviour, set the Vuetify 3 thresholds when you create Vuetify:

```js
createVuetify({
  display: { thresholds: { md: 960, lg: 1280, xl: 1920, xxl: 2560 } },
})
```

## 5. Move global CSS resets into a layer

Vuetify 4 ships all of its CSS in [cascade layers](https://developer.mozilla.org/en-US/docs/Web/CSS/@layer). Any CSS in your app that is not in a layer now overrides every Vuetify rule, including the spacing and layout utilities the calendar uses. A common culprit is a global reset:

```css
/* Before: unlayered, so it removes the padding Vuetify gives the calendar's dialogs and buttons */
* { margin: 0; padding: 0; box-sizing: border-box; }
```

Put such rules in a layer that comes before Vuetify's, so Vuetify still wins:

```css
@layer app-base {
  * { margin: 0; padding: 0; box-sizing: border-box; }
}
```

The `@layer app-base` rule must appear before Vuetify's styles load, for example in a `<style>` in your `index.html`.

## 6. Review the visual changes

The calendar now uses Vuetify 4's Material Design 3 styling in its dialogs, menus and side menu:

- Dialog titles are slightly larger and lighter.
- Button text has less letter spacing.
- Dialogs, menus and sheets have softer shadows.
- The selected item in a dropdown shows a stronger highlight when the dropdown opens, because keyboard focus now moves to it.
- The mobile side menu's section headings ("Views", "Calendars") are uppercase.
- Date picker day cells are larger, except in the event dialog.

These stay the same as in version 1:

- Dialogs keep their 24px rounded corners.
- The header's month title is 20px on desktop and mobile. You can change it with the `--calendar-font-size-title` theme variable.
- All `--calendar-*` theme variables and the theme presets work as before.

If you wrote custom CSS that targets Vuetify's internal classes inside the calendar (for example `.v-card-title` or `.v-btn`), check it against Vuetify 4, since some of those classes changed their styles.

## Behaviour changes

Check these if your app reads occurrence ids or relies on the old behaviour:

- **Occurrence ids.** An occurrence of a repeating event has the id `'<series id>@<start>'` and a `recurringEventId` field with the series' id. In version 1 the first occurrence on screen had the series' id and the others `'<id>-1'`, `'<id>-2'` and so on. If your `onEventClick` looks events up by id, use `recurringEventId` for occurrences. See [Recurring events](./RECURRING_EVENTS.md#how-occurrences-are-shown).
- **Changing a repeating event asks which events to change.** Editing, dragging or deleting an occurrence offers **This event**, **This and following events** and **All events**. "This event" stores a changed occurrence (the occurrence's id, `recurringEventId` and `originalStart`) that takes the place of the occurrence, as Google Calendar does, and "This and following events" ends the series and starts a new one, so expect `onEventCreate` calls for these. In version 1, editing changed the series, dragging moved it or did nothing, and delete offered two choices. See [Recurring events](./RECURRING_EVENTS.md#changing-one-occurrence-or-many).
- **Times of repeating events** are the same in every time zone. In version 1 they were shifted by the viewer's offset from UTC, so a 10:00 event showed at 15:00 in New York. The `DTSTART` line of a rule is ignored: the series starts at the event's `start`.
- **Deleting one occurrence** (`EXDATE`) works for any series id. In version 1 it failed for ids with a hyphen, such as generated UUIDs. Exception dates written by version 1 were in UTC, so in time zones other than UTC some deleted occurrences may show again. Delete them again in version 2.
- **The repeat link opens a menu**, as in Google Calendar: **Does not repeat**, the usual rules for the event's date ("Weekly on Wednesday", "Monthly on the third Wednesday", "Annually on January 15", "Every weekday") and **Custom...**. In version 1 it opened the custom dialog, and a repeat could not be removed. See [Recurring events](./RECURRING_EVENTS.md#the-repeat-menu).
- **The repeat picker's end date** now includes that day (`UNTIL=20260331T235959Z`). In version 1 the last day was left out.
- **Every event needs a valid `calendarId`.** Events without one, or with an unknown one, are rejected with a console error, and `eventsService.add()` returns `null`. In version 1 they were stored but never shown. Create your calendars before adding events.
- **Dates with `Z` or an offset** are converted to the viewer's time zone. In version 1 they caused an error.
- **The +N button in the month view** opens a list of that day's events. In version 1 it opened the create dialog.
- **On mobile with `enableSwipeGestures: false`**, the header shows previous and next buttons.
- **Dropping a dragged event onto a time that already has another event** now moves it there. In version 1 the drop was ignored.

See the [changelog](../CHANGELOG.md) for the full list of changes.
