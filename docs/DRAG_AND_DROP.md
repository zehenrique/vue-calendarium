# Drag and drop

Users can move an event to another time or day by dragging it. Drag and drop is **off by default**.

```js
const calendarApp = createCalendar({
  views: [createViewWeek(), createViewDay()],
  enableDragAndDrop: true,
  onEventDrop: ({ event, originalEvent, dropTarget }) => {
    console.log(`Moved "${event.title}" to ${dropTarget.date} at ${dropTarget.hour}:00`);
  }
});
```

## How it works

1. **Press and hold** an event for half a second, without moving the pointer. The event follows the pointer, drawn semi-transparent.
2. **Move** over the time slot you want. The hour slot under the pointer is highlighted.
3. **Release.** The event moves to that slot.

A quick click still opens the event's details. After a drag, no details dialog opens.

If you move the pointer more than a few pixels before the half second has passed, the press is cancelled and nothing is dragged. This keeps normal clicks and scrolling from starting a drag by accident.

## What gets moved

- The event keeps its **duration**: dropping a one-hour event on 15:00 gives 15:00 to 16:00.
- The new start time is the **start of the hour** you dropped it on, so events snap to full hours (15:00, not 15:20). The original minutes are not kept.
- The date changes when you drop on another day's column in the week view.
- Dropping outside the time grid changes nothing. There is no key to cancel a drag, so to cancel it, drop the event outside the grid.
- The calendar updates the event itself, then calls `onEventUpdate` with the updated event and `onEventDrop` with the details.

## `onEventDrop`

```js
onEventDrop: ({ event, originalEvent, dropTarget }) => { /* ... */ }
```

| Property | Type | Description |
| --- | --- | --- |
| `event` | object | The event after the move, with its new `start` and `end` |
| `originalEvent` | object | The event before the move |
| `dropTarget` | `{ date, hour }` | The slot it was dropped on: a `Temporal.PlainDate` and an hour from 0 to 23 |

Use `onEventUpdate` if you only need to save the result. Use `onEventDrop` when you also need to know where it came from, for example to show an "Undo" message.

## Where it works

- **Week and day views.** Events in the month view and in the all-day row cannot be dragged.
- **Mouse only.** Dragging needs a mouse (or a pen that acts as one). On touch screens a finger drag swipes between periods instead. See [Touch gestures](./GESTURES.md).
- **Not for repeating events.** Occurrences of a repeating event cannot be dragged. A press and hold on one does nothing, and a click opens its details as usual. Change a series' time in the edit dialog. See [Recurring events](./RECURRING_EVENTS.md#editing-repeating-events).

## Styling

The highlighted slot uses the `--calendar-drop-target-bg` variable. See the [theme reference](./THEME_REFERENCE.md).
