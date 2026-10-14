# Events and dialogs

This page explains what users can do with events in the built-in interface and which callbacks tell your app about it. For the data format and the services, see the [API reference](./API.md). To replace the dialogs with your own, see [Using your own dialogs](#using-your-own-dialogs).

## Creating events

Users create an event by clicking the grid. What is prefilled depends on where they click:

| Where they click | Prefilled event |
| --- | --- |
| An hour slot (week or day view) | One hour, starting at that hour |
| The all-day row (week or day view) | An all-day event on that date |
| A day (month view) | 09:00 to 10:00 on that date |

The create dialog, titled **New event** (**Edit event** when editing), has a title, a date, start and end times, an **All day** checkbox, a repeat menu ([Recurring events](./RECURRING_EVENTS.md#the-repeat-menu)) and a calendar dropdown. The end time list only offers times after the start time, so an event made in the dialog ends on the day it starts. Choosing a calendar sets the event's colour to that calendar's colour.

While the dialog is open, a semi-transparent preview of the new event is drawn on the grid, so users see where it will land. This is a [ghost event](./API.md#ghost-events).

Saving needs a title: the **Save** button stays disabled until one is entered.

## Viewing, editing and deleting

Clicking an event opens a details dialog with its title, colour, date and time, a description of its repeat rule, and the calendar name. From there users can **edit** it (the same dialog as for creating), **delete** it, or close the dialog.

Deleting always asks for confirmation. For a repeating event, editing, deleting and dragging ask whether the change applies to **this event**, **this and following events** or **all events**. See [Recurring events](./RECURRING_EVENTS.md#changing-one-occurrence-or-many).

On a phone, the create, details and delete dialogs open as bottom sheets. See [Mobile layout](./MOBILE.md#dialogs-and-bottom-sheets).

## Event data

```js
{
  id:          string | number,   // generated when omitted
  title:       string,
  start:       string,            // '2026-03-14T10:00:00'
  end:         string,            // '2026-03-14T11:00:00'
  allDay:      boolean,
  calendarId:  string,            // required: the id of an existing calendar
  color:       string,            // hex colour, overrides the calendar's colour
  rrule:       string,            // repeat rule, see Recurring events
  description: string,
  location:    string,
  custom:      Record<string, unknown>
}
```

Dates are wall-clock date-times without a time zone, so an event at `10:00` is shown at 10:00 for every user. A value with `Z` or an offset, such as `'2026-03-14T10:00:00Z'`, is an exact moment: the calendar converts it to the viewer's time zone when the event is added. Events without an `end` last one hour. To show such a value the way the calendar would, for example in your own form, use `toPlainDateTimeString('2026-03-14T10:00:00Z')`: it returns the calendar's wall-clock form for the viewer's time zone.

### Colours

Give an event a `color` to override its calendar's colour. Any six-digit hex colour works. See [Event colours](./THEMING.md#event-colours).

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

Every event must belong to a calendar: `calendarId` is required and must be the id of a calendar you created. An event without one, or with an unknown one, is rejected: `eventsService.add()` returns `null`, `set()` and the initial `events` leave it out, and a console error names the event. Create the calendars before the events.

Events whose calendar is hidden are not drawn in any view. On mobile, the sidebar lists every calendar with a checkbox, and it calls `toggleVisibility` for you.

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

### Repeating events

Changing part of a repeating event can change several stored events at once, for example ending a series and starting a new one. Each is reported with its own callback, so `onEventUpdate`, `onEventCreate` and `onEventDelete` together keep your data in step. Deleting one occurrence, for instance, calls `onEventUpdate` with the series, which gains an `EXDATE`. See [Recurring events](./RECURRING_EVENTS.md#callbacks).

## Using your own dialogs

Set `enableModals: false` to turn off the built-in dialogs. Clicking the grid then draws a [ghost event](./API.md#ghost-events), a preview of the new event, and calls `onEventCreateRequest({ draft, context })`:

- `draft` holds the prefilled form fields: `title`, `startDate`, `startTime`, `endDate`, `endTime` (`'10:00'`), `allDay`, `calendarId`, `color` and `rrule`.
- `context.source` says where the user clicked: `'time-slot'`, `'all-day'` or `'month-day'`. `context.date` is the date clicked.
- The preview, `calendarApp.ghostEvent.value`, has the same event as ready-to-save `start` and `end` values.

Open your dialog there, keep the preview in step while the user edits, and hide it when the dialog closes:

```js
const form = ref(null);

const calendarApp = createCalendar({
  views: [createViewWeek()],
  calendars: [{ id: 'work', name: 'Work', color: '#1967D2' }],
  enableModals: false,
  onEventCreateRequest: () => {
    const { id, isGhost, ...event } = calendarApp.ghostEvent.value;
    form.value = event;   // title, start, end, allDay, calendarId, color, rrule
    openMyDialog();
  },
  onEventClick: (event) => openMyDetails(event)
});

// The preview follows the form
watch(form, (changes) => changes && calendarApp.updateGhostEvent(changes), { deep: true });

function save() {
  calendarApp.eventsService.add(form.value);
  close();
}

function close() {
  calendarApp.hideGhostEvent();
  form.value = null;
}
```

Events you add with `eventsService` do not call `onEventCreate`; that callback reports what users do in the built-in dialogs. With dialogs off, clicking an event only calls `onEventClick`.

For repeating events, the calendar's repeat menu, custom repeat dialog and "this / following / all events" dialog are exported as components, and their logic as plain functions. See [Recurring events](./RECURRING_EVENTS.md#in-your-own-ui).

## iCalendar files

`parseICal` reads the events of an `.ics` file, such as an export from Google Calendar or Outlook, and `serializeICal` writes events to one:

```js
import { parseICal, serializeICal } from 'vue-calendarium';

// Import: give the calendar the events belong to (events need one)
const events = parseICal(icsText, { calendarId: 'work' });
calendarApp.eventsService.set([...calendarApp.eventsService.getAll(), ...events]);

// Export: all stored events, with times in Lisbon time (without tzid, times are floating)
const icsText = serializeICal(calendarApp.eventsService.getAll(), { tzid: 'Europe/Lisbon' });
```

- **Repeating events** are written as Google Calendar exports them, and read the same way: a series with `RRULE` and `EXDATE` (deleted occurrences), and each changed occurrence as an event with the series' `UID` and a `RECURRENCE-ID`. Read back, a changed occurrence gets `recurringEventId` and `originalStart`.
- **Times.** A UTC time (`Z`) is converted to the viewer's time zone. A time with a `TZID`, or without a zone, keeps its wall-clock time, as the calendar does for dates with a time zone.
- **All-day events** are written as dates. In iCalendar their `DTEND` is the day after the last day; the calendar's `end` is the last day itself, and the functions convert between the two.
- **Fields:** title (`SUMMARY`), start, end, all day, repeat rule, description and location. Colours and calendars are not part of the file.
