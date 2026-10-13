# Recurring events

An event repeats when it has an `rrule`: a repeat rule in the iCalendar format ([RFC 5545](https://datatracker.ietf.org/doc/html/rfc5545)). The calendar expands the rule with the [`rrule`](https://github.com/jkbrzt/rrule) library, so any rule that library understands will work.

```js
calendarApp.eventsService.add({
  id: 'standup',
  title: 'Weekly Standup',
  start: '2026-01-05T09:00:00',
  end:   '2026-01-05T09:15:00',
  rrule: 'FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR'
});
```

`start` and `end` are the first occurrence. Every later occurrence has the same time of day and the same duration, in every time zone: a standup at 09:00 shows at 09:00 for everyone.

## Common rules

| Rule | Meaning |
| --- | --- |
| `FREQ=DAILY` | Every day |
| `FREQ=WEEKLY;BYDAY=MO,WE` | Every Monday and Wednesday |
| `FREQ=WEEKLY;INTERVAL=2` | Every other week |
| `FREQ=MONTHLY;BYMONTHDAY=15` | The 15th of every month |
| `FREQ=MONTHLY;BYDAY=2TU` | The second Tuesday of every month |
| `FREQ=YEARLY` | Every year |
| `FREQ=WEEKLY;COUNT=6` | Six times, then stop |
| `FREQ=DAILY;UNTIL=20260331T235959Z` | Every day up to and including 31 March 2026 |

A rule can also have `EXDATE` lines, for occurrences that are left out:

```js
rrule: 'RRULE:FREQ=WEEKLY\nEXDATE:20260112T090000Z,20260119T090000Z'
```

Times in a rule (`UNTIL`, `EXDATE`) are the same wall-clock times as the event's: `T090000Z` means 09:00 on the calendar, whatever the viewer's time zone. The series always starts at the event's `start`, so a `DTSTART` line in the rule is ignored.

## The repeat picker

In the create and edit dialogs, the repeat link under the time ("Does not repeat") opens the **Custom...** dialog, where users choose:

- **Repeat frequency:** daily, weekly, monthly or yearly.
- **Repeat every:** the interval, for example every 2 weeks.
- **Repeat on** (weekly): the days of the week.
- **Monthly on** (monthly): either the same day of the month, or the same weekday of the month, such as the second Tuesday. Both are based on the event's start date.
- **Ends:** never, on a date (that day included), or after a number of occurrences.

The link shows "Daily", "Weekly", "Monthly" or "Yearly" for the plain rules, and "Custom" for anything else. The event details dialog describes the rule in the calendar's language, for example "Weekly on Monday, Wednesday" or "Semanalmente, 6 vezes".

The dialog covers the common cases. Rules it cannot build, such as `BYSETPOS`, still work when you set them in code. Changing the rule in the dialog keeps the occurrences that were deleted from the series.

## How occurrences are shown

The calendar expands each rule for the dates on screen only, so rules without an end are fine: nothing is created in advance.

Each occurrence is a copy of the event with its own `start` and `end`, and two extra fields:

- `id`: `'<series id>@<start>'`, for example `'standup@2026-01-12T09:00:00'`.
- `recurringEventId`: the id of the series.

This is what `onEventClick` receives when a user clicks an occurrence. Use `recurringEventId` to find the series in your data. Occurrences are not stored, so store the series, with its `rrule`.

## Editing repeating events

Editing an occurrence edits the **whole series**. The edit dialog opens with the series' first occurrence, whichever occurrence the user clicked, so changes to the title, time, calendar or rule apply to every occurrence and the series keeps its start date. Saving calls `onEventUpdate` with the series.

Single occurrences cannot be changed on their own. To move one occurrence, delete it from the series and create a separate event.

## Deleting repeating events

Deleting a repeating event asks what to delete:

- **This event** adds the occurrence to the series' `EXDATE` list and calls `onEventUpdate` with the updated series. Store the new `rrule`.
- **All events in the series** removes the series and calls `onEventDelete` with it.

```js
onEventUpdate: (event) => {
  // event.rrule now has an EXDATE line when one occurrence was deleted
  api.saveEvent(event);
}
```

Both work for any series id, including the generated UUIDs.

## Drag and drop

Occurrences of a repeating event cannot be dragged. Change a series' time in the edit dialog. See [Drag and drop](./DRAG_AND_DROP.md).

## Limitations

- **No per-occurrence changes.** An occurrence can be deleted, but not edited or moved on its own.
- **Deleted occurrences are tied to their time.** If you change the time of day of a series, occurrences deleted before the change come back, because their `EXDATE` times no longer match. Delete them again after changing the time.
