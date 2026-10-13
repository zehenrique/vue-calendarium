# Accessibility

This page describes what the calendar does for keyboard and screen reader users today, and what it does not do yet, so you can decide what your app needs.

## What works

- **Built from Vuetify components.** Dialogs, bottom sheets, dropdowns, checkboxes, radio buttons and date pickers come from Vuetify, which provides their roles, keyboard handling and focus management. Dialogs trap focus while open, and the event dialogs close with **Esc**.
- **Labelled controls.** The icon buttons (menu, today, previous, next, edit, delete, close) and the date field have text labels for screen readers, in the selected language.
- **Events are buttons.** Every event can be reached with **Tab** and opened with **Enter** or **Space**. In the week and day views its label is the title and the time range, for example "Team Meeting, 10:00 – 11:00". In the month view it is the title and the start time.
- **Creating events from the grid.** Each view puts one place of the grid in the tab order:
  - **Week and day views:** an hour slot, labelled for example "Create event on Wednesday, January 15 at 09:00". The arrow keys move up and down between hours and left and right between days. **Enter** or **Space** opens the create dialog for that hour.
  - **Month view:** the day number, labelled "Create event on Wednesday, January 15". The left and right arrows move by a day, up and down by a week, and **Enter** or **Space** opens the create dialog for that day.
  - The grid starts on today when today is shown, and otherwise on the first day.
- **The +N button in the month view** opens a list of all the day's events. The list items are buttons.
- **Period changes are announced.** The title in the header ("January 2026") is a polite live region, so screen readers read it when the user moves to another month, week or day. It is also the page's `<h1>`.
- **Reduced motion.** When the device asks for reduced motion, swiping changes the page without the slide animation.
- **Languages.** All text and labels come from the translations. See [Languages](./I18N.md).
- **Colour contrast.** The `highContrast` theme preset uses black borders and text on white. See [Styling](./STYLING.md).

```js
import { THEME_PRESETS } from 'vue-calendarium';
// <Calendar :calendar-app="calendarApp" :theme="THEME_PRESETS.highContrast" />
```

## Known gaps

- **Grid structure.** The week, day and month grids have no table or grid roles, so a screen reader does not announce rows and columns. The labels on the slots, days and events carry the date and time instead.
- **The all-day row** is not in the tab order. Keyboard users create an all-day event from an hour slot and the **All day** checkbox in the dialog.
- **Page zoom.** If you use the viewport tag from the [mobile guide](./MOBILE.md#sizing), users cannot zoom the page.

## Adding your own controls

Everything the calendar does is also available from code, so you can add controls of your own next to it:

```vue
<v-btn @click="calendarApp.goToToday()">Today</v-btn>
<v-btn @click="calendarApp.setView('month')">Month</v-btn>
```

For a fully custom flow, turn off the built-in dialogs with `enableModals: false` and open your own form. See [Ghost events](./GHOST_EVENTS.md) for the pattern. To list events as text, read them from `calendarApp.eventsService.getAll()`.

## Testing

The project's UI tests run with Playwright. They check roles and labels, for example `getByRole('button', { name: 'Save' })`, which also helps keep the interface labelled.

If you find an accessibility problem that is not on this page, please [open an issue](https://github.com/zehenrique/vue-calendarium/issues).
