# Events and dialogs

This page explains what users can do with events in the built-in interface and which callbacks tell your app about it. For the data format and the services, see the [API reference](./API.md). To replace the dialogs with your own, see [Ghost events](./GHOST_EVENTS.md).

## Creating events

Users create an event by clicking the grid. What is prefilled depends on where they click:

| Where they click | Prefilled event |
| --- | --- |
| An hour slot (week or day view) | One hour, starting at that hour |
| The all-day row (week or day view) | An all-day event on that date |
| A day (month view) | 09:00 to 10:00 on that date |

The create dialog has a title, a date, start and end times, an **All day** checkbox, a repeat link ([Recurring events](./RECURRING_EVENTS.md)) and a calendar dropdown. The end time list only offers times after the start time, so an event made in the dialog ends on the day it starts. Choosing a calendar sets the event's colour to that calendar's colour.

While the dialog is open, a semi-transparent preview of the new event is drawn on the grid, so users see where it will land. This is a [ghost event](./GHOST_EVENTS.md).

Saving needs a title: the **Save** button stays disabled until one is entered.

## Viewing, editing and deleting

Clicking an event opens a details dialog with its title, colour, date and time, a description of its repeat rule, and the calendar name. From there users can **edit** it (the same dialog as for creating), **delete** it, or close the dialog.

Deleting always asks for confirmation. For a repeating event the confirmation asks whether to delete **this event** or **all events in the series**. See [Recurring events](./RECURRING_EVENTS.md#deleting-repeating-events).

On a phone, the create, details and delete dialogs open as bottom sheets. See [Mobile layout](./MOBILE.md#dialogs-and-bottom-sheets).

## Event data

```js
{
  id:          string | number,   // generated when omitted
  title:       string,
  start:       string,            // '2026-03-14T10:00:00'
  end:         string,            // '2026-03-14T11:00:00'
  allDay:      boolean,
  calendarId:  string,
  color:       string,            // hex colour, overrides the calendar's colour
  rrule:       string,            // repeat rule, see Recurring events
  description: string,
  location:    string,
  custom:      Record<string, unknown>
}
```

Dates are wall-clock date-times without a time zone, so an event at `10:00` is shown at 10:00 for every user. A value with `Z` or an offset, such as `'2026-03-14T10:00:00Z'`, is an exact moment: the calendar converts it to the viewer's time zone when the event is added. Events without an `end` last one hour.

### Colours

Give an event a `color` to override its calendar's colour. Use the 12 colours from the palette, or any hex colour. See [Colors](./COLORS.md).

## Calendars

A calendar groups events and gives them a colour:

```js
const calendarApp = createCalendar({
  views: [createViewMonth()],
  calendars: [
    { id: 'work',     name: 'Work',     color: '#1967D2' },
    { id: 'personal', name: 'Personal', color: '#0B8043', visible: false }
  ]
});

calendarApp.calendarsService.toggleVisibility('personal');   // show it
```

Events whose calendar is hidden are not drawn in any view. An event whose `calendarId` does not match any calendar, or that has none, is always shown, in its own `color`. On mobile, the sidebar lists every calendar with a checkbox, and it calls `toggleVisibility` for you.

## Callbacks

Pass these to `createCalendar` to keep your app in sync:

| Callback | Called when | Argument |
| --- | --- | --- |
| `onEventClick` | A user clicks an event | The event |
| `onEventCreate` | A user saves a new event | An array with the new event |
| `onEventUpdate` | A user saves changes, a drag and drop moves an event, or one occurrence of a repeating event is deleted | The updated event |
| `onEventDelete` | A user deletes an event, or a whole series | The deleted event |
| `onEventCreateRequest` | A user clicks the grid, when `enableModals` is `false` | `{ draft, context }` |
| `onEventDrop` | An event is dropped on a new time slot | `{ event, originalEvent, dropTarget }` |

```js
const calendarApp = createCalendar({
  views: [createViewWeek()],
  onEventCreate: (events) => api.saveEvents(events),
  onEventUpdate: (event) => api.updateEvent(event.id, event),
  onEventDelete: (event) => api.deleteEvent(event.id)
});
```

The calendar updates its own state first and then calls your callback, so you do not need to change the events yourself. To load or replace events, use `calendarApp.eventsService.set(events)`.

`onEventClick` is also called when the built-in dialogs are enabled, so you can track clicks while the calendar shows its own details dialog. For an occurrence of a repeating event it receives the occurrence, with `recurringEventId` set to the series' id. See [Recurring events](./RECURRING_EVENTS.md#how-occurrences-are-shown).

### Deleting one occurrence

Deleting a single occurrence of a repeating event does not call `onEventDelete`, because the series still exists. The calendar adds an exception date (`EXDATE`) to the series' `rrule` and calls `onEventUpdate` with the updated series. Store that event as you would any other update. See [Recurring events](./RECURRING_EVENTS.md#deleting-repeating-events).

## Using your own dialogs

Set `enableModals: false` to turn off the built-in dialogs. Clicking the grid then calls `onEventCreateRequest({ draft, context })`, where `context.source` is `'time-slot'`, `'all-day'` or `'month-day'`. Open your own dialog there and use ghost events for the preview. See [Ghost events](./GHOST_EVENTS.md) for a complete example.

With dialogs off, clicking an event only calls `onEventClick`.
