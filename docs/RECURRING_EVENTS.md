# Recurring events

An event repeats when it has an `rrule`: a repeat rule in the iCalendar format ([RFC 5545](https://datatracker.ietf.org/doc/html/rfc5545)). The calendar expands the rule with the [`rrule`](https://github.com/jkbrzt/rrule) library, so any rule that library understands will work.

```js
calendarApp.eventsService.add({
  id: 'standup',
  title: 'Weekly Standup',
  start: '2026-01-05T09:00:00',
  end:   '2026-01-05T09:15:00',
  calendarId: 'work',
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

Rules written by other tools are read the same way. When a rule has a `DTSTART` line with a time zone (`DTSTART;TZID=Europe/Lisbon:...`, or a UTC time `DTSTART:...Z` as the [rrule](https://github.com/jkbrzt/rrule) library writes it in the browser), its UTC times are exact moments: the calendar converts them to wall-clock times in that zone (the viewer's zone for a UTC `DTSTART`), so daylight saving time is taken into account. An end at midnight, or a date without a time, includes that whole day. For example, rrule.js saves "ends 6 August" in Lisbon as `UNTIL=20260805T230000Z` (local midnight, 23:00 UTC in summer); the calendar reads it as the end of 6 August and keeps the occurrence on that day. Rules the calendar writes back are plain, without `DTSTART`.

## The repeat menu

In the create and edit dialogs, the repeat link next to **All day** ("Does not repeat") opens a menu, as in Google Calendar. Its choices follow the event's date; for Wednesday 15 January:

| Choice | Rule |
| --- | --- |
| Does not repeat | `''` |
| Daily | `FREQ=DAILY` |
| Weekly on Wednesday | `FREQ=WEEKLY;BYDAY=WE` |
| Monthly on the third Wednesday | `FREQ=MONTHLY;BYDAY=3WE` |
| Annually on January 15 | `FREQ=YEARLY` |
| Every weekday (Monday to Friday) | `FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR` |
| Custom... | Opens the custom repeat dialog |

- **Does not repeat** removes the rule. On an occurrence of a series, saving then asks **This and following events** or **All events**, and the event stops repeating from there.
- When the date changes, a choice from the menu follows it: "Weekly on Wednesday" becomes "Weekly on Thursday".
- A rule the menu does not list, such as one set in code or with the custom dialog, is shown at the top of the menu with its description, for example "Every 2 weeks, 6 times".

**Custom...** opens the **Custom recurrence** dialog, laid out as in Google Calendar:

- **Repeat every** [number] [day / week / month / year]: the interval and the unit, for example every 2 weeks. The unit reads "week" or "weeks" to match the number.
- **Repeat on** (weekly): round buttons for the days of the week, Monday first. The event's own weekday is selected when the dialog opens on an event that does not repeat.
- **Monthly** (monthly): a dropdown with the same day of the month ("Monthly on day 15") or the same weekday of the month ("Monthly on the third Wednesday"). Both are based on the event's start date.
- **Ends:** **Never**, **On** a date (that day included), or **After** a number of occurrences. The date and the number are only editable when their option is chosen; they start at three months after the event and 13 occurrences.

On mobile the dialog opens as a bottom sheet, with **Cancel** and **Done** at the top.

The event details dialog describes the rule in the calendar's language, for example "Weekly on Monday, Wednesday" or "Semanalmente, 6 vezes".

The dialog covers the common cases. Rules it cannot build, such as `BYSETPOS`, still work when you set them in code. Changing the rule in the menu or the dialog keeps the occurrences that were deleted from the series.

## How occurrences are shown

The calendar expands each rule for the dates on screen only, so rules without an end are fine: nothing is created in advance.

Each occurrence is a copy of the event with its own `start` and `end`, and these fields:

- `id`: `'<series id>@<start>'`, for example `'standup@2026-01-12T09:00:00'`.
- `recurringEventId`: the id of the series.
- `originalStart`: the occurrence's start in the series.

This is what `onEventClick` receives when a user clicks an occurrence. Occurrences are not stored, so store the series, with its `rrule`.

## Changing one occurrence or many

Editing, dragging or deleting an occurrence asks which events the change applies to, as in Google Calendar:

| Choice | Edit or drag | Delete |
| --- | --- | --- |
| **This event** | Only this occurrence changes. It is stored as a changed occurrence that takes its place, and the series stays as it is. | Only this occurrence is removed: the series leaves it out (`EXDATE`). |
| **This and following events** | The series ends before this occurrence (`UNTIL`), and a new series with the changes starts at it. | The series ends before this occurrence. |
| **All events** | The whole series changes. A new time applies to every occurrence: moving Wednesday 10:00 to 14:00 moves them all to 14:00, and moving it to Thursday makes the series repeat on Thursdays. | The series and its changed occurrences are removed. |

- The edit dialog opens on the occurrence the user clicked, with its own date and the series' repeat rule. The choice appears after **Save**.
- After a drag and drop, the choice appears when the event is dropped. **Cancel** leaves the event where it was.
- When the edit changes the repeat rule itself, **This event** is not offered, because a single event cannot repeat differently from its series.
- "This and following events" on the first occurrence is the same as "All events".
- Moving a series to another day also moves the days it repeats on (`BYDAY`, `BYMONTHDAY`), its end date (`UNTIL`) and its deleted occurrences (`EXDATE`).

### Changed occurrences

"This event" stores a changed occurrence: an event without an `rrule`, with the occurrence's id and two fields that link it to its series:

- `recurringEventId`: the series' id.
- `originalStart`: the start the occurrence has in the series. It does not change when the occurrence is moved.

```js
{
  id: 'standup@2026-01-14T09:00:00',   // the occurrence's id
  title: 'Standup with the design team',
  start: '2026-01-15T11:00:00',        // moved to Thursday 11:00
  end:   '2026-01-15T11:15:00',
  calendarId: 'work',
  rrule: '',
  recurringEventId: 'standup',
  originalStart: '2026-01-14T09:00:00'
}
```

The calendar shows it instead of the series' occurrence at `originalStart`, so the series itself does not change. This is how Google Calendar stores changed occurrences, and how iCalendar writes them (a `VEVENT` with the series' `UID` and a `RECURRENCE-ID`).

A changed occurrence is still part of its series, so editing, dragging or deleting it asks the same question:

- **This event** changes it, or deletes it (and the series leaves its date out).
- **This and following events** and **All events** change the series from it, as from any other occurrence.

When the series changes, its changed occurrences follow, as in Google Calendar:

- The fields that the edit changed (title, calendar, color and so on) are copied to them. The fields they changed themselves and the edit did not touch stay as they are.
- A changed occurrence that was moved keeps its own time. One that was not moved takes the series' new time.
- "This and following events" moves the changed occurrences from that date on to the new series.
- A changed occurrence that no longer differs from the series becomes an ordinary occurrence again, and is removed.
- When the repeat rule changes, changed occurrences whose date the new rule no longer has are removed.

### Callbacks

Each choice is reported with the usual callbacks, one call per stored event that changes:

| | `onEventUpdate` | `onEventCreate` | `onEventDelete` |
| --- | --- | --- | --- |
| Edit, this event | The changed occurrence, if it already existed | The changed occurrence, the first time | |
| Edit, this and following | The series (new `UNTIL`) and its changed occurrences from then on | The new series | Changed occurrences that are removed |
| Edit, all events | The series and its changed occurrences | | Changed occurrences that are removed |
| Delete, this event | The series (new `EXDATE`) | | The changed occurrence, if it was one |
| Delete, this and following | The series (new `UNTIL`) | | Its changed occurrences from then on |
| Delete, all events | | | The series and its changed occurrences |

A drag and drop also calls `onEventDrop` with the user's choice in `scope` (`'this'`, `'following'` or `'all'`).

## Without the built-in dialogs

With `enableModals: false` the calendar cannot ask. Dropping an occurrence then changes nothing and only calls `onEventDrop({ event, originalEvent, dropTarget })`, so your app can ask and apply the change.

## In your own UI

The logic behind the built-in dialogs is exported as plain functions, with no Vue or Vuetify, so an app with its own dialogs (PrimeVue, Quasar, plain HTML) can use it:

| Function | What it does |
| --- | --- |
| `ruleToForm(rrule, startDate)`, `formToRule(form, startDate)` | A rule as the fields of the custom repeat dialog (`frequency`, `interval`, `weekdays`, `monthlyType`, `endType`, `untilDate`, `count`) and back. With no rule, weekly on the event's weekday. |
| `getRepeatOptions(startDate, { locale })` | The repeat menu's choices for a date: "Daily", "Weekly on Wednesday", "Monthly on the third Wednesday", "Annually on January 15", "Every weekday", with their rules. |
| `getMonthlyOptions(startDate, { locale })` | "Monthly on day 15" and "Monthly on the third Wednesday", as `monthlyType` values. |
| `describeRule(rrule, { locale })` | A rule in words: "Weekly on Monday, Wednesday", "Semanalmente (quarta-feira)". |
| `planRecurringEdit(...)`, `planRecurringDelete(...)`, `changesRule(...)` | The "this event / this and following / all events" changes, as events to update, add and remove. They use this calendar's model: a series with a rule, and changed occurrences stored in its place. |
| `expandRecurrence`, `getRuleParts`, `isSameRule`, `addExceptionDate`, `endRuleBefore`, `continueRuleFrom`, `moveRule`, ... | Rules and occurrences. See [the API reference](./API.md#repeating-events). |

```js
import { describeRule, formToRule, getRepeatOptions, ruleToForm } from 'vue-calendarium';

// The repeat dropdown of your own event form
const choices = getRepeatOptions('2026-01-14', { locale: 'pt-PT' });
// [{ value: 'FREQ=DAILY', title: 'Diariamente' }, { value: 'FREQ=WEEKLY;BYDAY=WE', title: 'Semanalmente (quarta-feira)' }, ...]

// Your own custom repeat dialog
const form = ruleToForm(event.rrule, '2026-01-14'); // fill its fields
form.interval = 2;
form.weekdays = ['MO', 'WE'];
const rrule = formToRule(form, '2026-01-14');        // 'FREQ=WEEKLY;INTERVAL=2;BYDAY=MO,WE'

describeRule(rrule, { locale: 'pt-PT' });            // 'A cada 2 semanas (segunda-feira, quarta-feira)'
```

### The repeat components

For an app with its own **Vuetify** event dialog (`enableModals: false`), the calendar's repeat controls are exported too:

| Component | Props and events |
| --- | --- |
| `RepeatSelect` | The repeat link and menu ("Does not repeat", "Weekly on Wednesday", ..., "Custom..."). `v-model`: the rule. `start-date`: `'YYYY-MM-DD'`. `link-class`: a class for the link, instead of its own style. |
| `RecurrencePickerModal` | The **Custom recurrence** dialog (a bottom sheet on mobile). `v-model`: open. `rrule`, `start-date`. `@save(rrule)`. |
| `RecurrenceScopeModal` | **This event / This and following events / All events**. `v-model`: open. `allow-this-event`. `@confirm(scope)`, `@cancel`. |

```vue
<RepeatSelect v-model="form.rrule" :start-date="form.startDate"/>
<RecurrenceScopeModal v-model="askScope" :allow-this-event="!changesRule(series, form, occurrence)" @confirm="save"/>
```

They need Vuetify and the calendar's translations in your vue-i18n instance, as the calendar does. Outside the calendar they follow your app's Vuetify settings (button shapes, language) rather than the calendar's.

The text functions use the calendar's translations. Pass vue-i18n's `t` as `{ t }` to use your app's own wording (see [Languages](./I18N.md#changing-the-wording)).

The rules are plain RRULEs (`UNTIL` at the end of the chosen day, `Z` suffix, no `DTSTART`), so a server can expand them too. The events and rules are wall-clock times: see *Time zone of rule times* below.

## Limitations

- **Time zone of rule times.** `UNTIL` and `EXDATE` are stored as wall-clock times with a `Z` suffix. Other calendar tools read that `Z` as UTC, so convert them if you hand rules to another tool yourself.
- **Where a series ends.** "This and following events" ends the series one second before the chosen occurrence. Google Calendar ends it at the end of the previous day; for daily, weekly, monthly and yearly rules the result is the same.
