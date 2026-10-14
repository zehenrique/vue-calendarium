# Views

The calendar has three views: **Month**, **Week** and **Day**. You choose which ones are available when you create the calendar, and users switch between them at runtime.

```js
import { createCalendar, createViewDay, createViewWeek, createViewMonth } from 'vue-calendarium';

const calendarApp = createCalendar({
  views: [createViewDay(), createViewWeek(), createViewMonth()],
  defaultView: 'week'
});
```

`views` must contain at least one view, otherwise `createCalendar` throws. Only the views you list can be selected, in the header's view dropdown and in the mobile sidebar. With a single view the calendar still works, and the user simply has nothing to switch to.

## Switching views and dates from code

```js
calendarApp.setView('day');                          // 'day' | 'week' | 'month'
calendarApp.setDate(Temporal.PlainDate.from('2026-03-14'));
calendarApp.goToToday();
calendarApp.goToNext();                              // +1 day, week or month, depending on the view
calendarApp.goToPrevious();
```

Calling `setView` with a view that is not in `views` logs a warning and does nothing. The current state is available as `calendarApp.currentView.value` and `calendarApp.currentDate.value` (a `Temporal.PlainDate`).

To react to the user's navigation, use the `onViewChange(view)` and `onDateChange(date)` callbacks. See [the API reference](./API.md#createcalendarconfig).

## Header

On desktop the header has a menu button that shows or hides the [sidebar](#sidebar), **Today**, previous and next buttons, the title (for example "January 2026"), a view dropdown and a date picker. Previous and next move one day, week or month, depending on the view.

On mobile the header is more compact. See [Mobile layout](./MOBILE.md).

## Sidebar

On desktop, as in Google Calendar, a sidebar on the left has:

- **A small month.** Choosing a day shows it in the calendar, in the current view. Its arrows change the small month without moving the calendar, and it follows the calendar when the calendar moves to another month. Today is shown in a filled circle and the selected date in a lighter one.
- **The calendars**, each with a checkbox that shows or hides its events.

The menu button in the header hides and shows it: the sidebar slides out to the left and the views take its room (without the animation when the device asks for reduced motion). The sidebar has the header's background (`--calendar-header-bg`), and its width is the `--calendar-sidebar-width` theme variable (256px); see [Theme variables](./THEME_REFERENCE.md#sidebar).

A calendar narrower than 1024px starts with the sidebar closed. To choose, or to open and close it from your app:

```js
const calendarApp = createCalendar({ views, sidebarOpen: false });

calendarApp.setSidebarOpen(true);
calendarApp.toggleSidebar();
calendarApp.sidebarOpen.value; // true or false
```

Set `enableDesktopSidebar: false` to remove the sidebar and its menu button. Its parts are exported for an app's own sidebar or layout:

```vue
<MiniMonth :selected-date="calendarApp.currentDate.value" :today="today" locale="pt-PT" @select="calendarApp.setDate"/>
<CalendarVisibilityList :calendars="calendars" v-model:visible-calendars="visibleIds"/>
```

`MiniMonth` emits `select` with the chosen `Temporal.PlainDate`, and `CalendarVisibilityList` emits `update:visibleCalendars` with the ids of the calendars to show; apply them with `calendarApp.calendarsService.toggleVisibility(id)`.

On mobile the same controls are in the slide-out sidebar. See [Mobile layout](./MOBILE.md).

## Month view

- A grid of whole weeks that includes the days of the neighbouring months, which are shown dimmed.
- Weeks start on **Monday**. This is not configurable.
- Each day shows up to **4 events** on desktop and **2** on mobile, followed by a **+N** button for the rest.
- Clicking an empty part of a day opens the create dialog for that date, prefilled with 09:00 to 10:00.
- Clicking the **+N** button opens a list of all of that day's events, with their times. Click one to open its details.
- Clicking an event opens its details.

## Week view

- Seven columns, Monday to Sunday, with a time grid of 24 hourly rows.
- All-day events are shown in a row above the grid.
- Clicking an hour slot opens the create dialog with a one-hour event starting at that hour.
- Clicking in the all-day row creates an all-day event for that date.
- Events are positioned by their start and end time. Overlapping events share the width of the column, as described below.
- On mobile you can zoom the grid with a pinch. See [Pinch to zoom](./MOBILE.md#pinch-to-zoom).

## Day view

The same time grid as the week view, for a single day. On mobile the header shows the weekday and day number next to the title.

## Overlapping events

Events that overlap in time are laid out side by side in columns within the day, so none is hidden behind another. Events that do not overlap use the full width. All-day events are not part of this layout, because they sit in their own row.

## Past events

Events that have already ended are shown in a lighter tint of their colour, so it is easy to see what is still to come.

## Current time indicator

In the week and day views a red line marks the current time on today's column, with a dot at its left end. It moves once a minute.

When a view that contains today opens, the grid scrolls so the line is near the top. It only does this until the user scrolls by themselves, so it never fights their scrolling.

Turn it off with `enableCurrentTimeIndicator: false`:

```js
const calendarApp = createCalendar({
  views: [createViewWeek()],
  enableCurrentTimeIndicator: false
});
```

The line's colour and dot size are theme variables: `--calendar-current-time-color` and `--calendar-current-time-circle-size`. See the [theme reference](./THEME_REFERENCE.md).

## Sticky header

The header stays at the top while you scroll the time grid, so the weekday names and dates are always visible.

## Time format

Times are always shown in the 24-hour format (`14:30`), whatever the language. See [Languages](./I18N.md).

## Keyboard

All three views can be used with the keyboard. In the week and day views, **Tab** reaches the time grid and then each event: the arrow keys move between hours and days, and **Enter** opens the create dialog for that hour or the details of an event. In the month view the arrow keys move between days. See [Accessibility](./ACCESSIBILITY.md).

## Calendars and visibility

Events belong to a calendar through `calendarId`. A hidden calendar hides all of its events in every view. The [sidebar](#sidebar) has a checkbox for each calendar, on desktop and mobile. You can also call `calendarApp.calendarsService.toggleVisibility(id)` from your own UI. See [Events](./EVENTS.md#calendars).
