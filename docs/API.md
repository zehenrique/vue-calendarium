# Calendar Component API

## Component Interface

### Props

#### events
- **Type:** `Array`
- **Default:** `[]`
- **Required:** No
- **Description:** Array of event objects to display on the calendar

Example:
```javascript
[
  {
    id: '1',
    title: 'Team Meeting',
    start: '2025-10-27T10:00:00',
    end: '2025-10-27T11:00:00',
    color: 'blue'
  }
]
```

#### locale
- **Type:** `String`
- **Default:** `'en-US'`
- **Required:** No
- **Description:** BCP 47 language tag for internationalization
- **Supported values:** `'en-US'` (English), `'pt-PT'` (Portuguese Portugal)
- **Note:** Language switching is reactive and updates all UI text and date formatting

#### initialView
- **Type:** `String`
- **Default:** `'month'`
- **Required:** No
- **Description:** Initial calendar view mode
- **Allowed values:** `'day'`, `'week'`, `'month'`
- **Validator:** Must be one of the allowed values

#### initialDate
- **Type:** `String | Object`
- **Default:** Current date
- **Required:** No
- **Description:** Initial date to display. Can be ISO string or Temporal.PlainDate object

#### enableModals
- **Type:** `Boolean`
- **Default:** `true`
- **Required:** No
- **Description:** Toggles the built-in event creation, detail, and deletion modals. Set to `false` to handle these interactions in your host application.

#### enableMobileSidebar
- **Type:** `Boolean`
- **Default:** `true`
- **Required:** No
- **Description:** Toggles the mobile sidebar menu (hamburger menu). Set to `false` to hide the mobile menu button and sidebar. Useful when you want to implement custom navigation or calendar selection.


Example:
```javascript
// ISO string
initialDate="2025-12-25"

// Temporal object
:initialDate="Temporal.PlainDate.from({ year: 2025, month: 12, day: 25 })"

// Disable modals and sidebar
:enableModals="false"
:enableMobileSidebar="false"
```

### Events

#### eventClick
- **Payload:** Event object
- **Description:** Emitted when user clicks on an event

Example:
```javascript
handleEventClick(event) {
  console.log('Clicked event:', event.title);
  // Open event details modal, etc.
}
```

#### dateChange
- **Payload:** Temporal.PlainDate object
- **Description:** Emitted when the displayed date/period changes (navigation)

Example:
```javascript
handleDateChange(date) {
  console.log('New date:', date.toString());
  // Fetch events for new date range
}
```

#### viewChange
- **Payload:** String ('day', 'week', or 'month')
- **Description:** Emitted when the calendar view changes

Example:
```javascript
handleViewChange(view) {
  console.log('View changed to:', view);
  // Update URL or preferences
}
```

#### eventCreateRequest
- **Payload:** `{ draft, context }`
- **Description:** Emitted when a user starts creating an event (clicks a day, time slot, or all-day area) while built-in modals are disabled. `draft` contains the pre-filled event data and `context` describes the trigger source.

Example:
```javascript
handleCreateRequest({ draft, context }) {
  console.log('Create in custom modal:', context.source);
  // Open your own modal with the suggested draft values
  this.openExternalModal(draft);
}
```

#### eventCreate
- **Payload:** Array of event objects
- **Description:** Emitted when the user creates a new event through the built-in modal. Contains an array with the newly created event(s). For recurring events, the array contains a single event with an `rrule` property.

Example:
```javascript
handleEventCreate(events) {
  events.forEach(event => {
    this.events.push(event);
    // Optionally persist to backend
    this.saveToAPI(event);
  });
}
```

#### eventDelete
- **Payload:** Event object
- **Description:** Emitted when the user deletes an event. For recurring events, this may be the original event (if deleting the entire series) or represent a single occurrence deletion.

Example:
```javascript
handleEventDelete(event) {
  const index = this.events.findIndex(e => e.id === event.id);
  if (index !== -1) {
    this.events.splice(index, 1);
    // Optionally persist to backend
    this.deleteFromAPI(event.id);
  }
}
```

#### eventUpdate
- **Payload:** Event object
- **Description:** Emitted when an event is updated (e.g., adding an EXDATE to exclude a single occurrence from a recurring series). The payload contains the updated event object with all modifications.

Example:
```javascript
handleEventUpdate(updatedEvent) {
  const index = this.events.findIndex(e => e.id === updatedEvent.id);
  if (index !== -1) {
    this.events[index] = updatedEvent;
    // Optionally persist to backend
    this.updateToAPI(updatedEvent);
  }
}
```


## Event Object Structure

### Required Properties

#### id
- **Type:** `String | Number`
- **Description:** Unique identifier for the event

#### title
- **Type:** `String`
- **Description:** Event title/name to display

#### start
- **Type:** `String`
- **Description:** Start date/time in ISO 8601 format

Examples:
```javascript
// Date only
start: '2025-10-27'

// Date and time
start: '2025-10-27T14:30:00'

// With timezone
start: '2025-10-27T14:30:00-05:00'
```

### Optional Properties

#### end
- **Type:** `String`
- **Default:** Same as start + 1 hour
- **Description:** End date/time in ISO 8601 format

#### allDay
- **Type:** `Boolean`
- **Default:** `false`
- **Description:** Whether event spans entire day(s). All-day events display in the calendar header section above time slots.

#### color
- **Type:** `String` (Hex color code)
- **Default:** `'#1967D2'` (Cobalt - Google blue)
- **Description:** Event color from the predefined Material Design color palette
- **Allowed values:** Only colors from the `CALENDAR_COLORS` palette:
  - `#D50000` (Tomato)
  - `#E67C73` (Flamingo)
  - `#F4511E` (Tangerine)
  - `#F6BF26` (Banana)
  - `#33B679` (Sage)
  - `#0B8043` (Basil)
  - `#039BE5` (Peacock)
  - `#3F51B5` (Blueberry)
  - `#7986CB` (Lavender)
  - `#8E24AA` (Grape)
  - `#616161` (Graphite)
  - `#1967D2` (Cobalt - default)
- **Note:** Use the exported `CALENDAR_COLORS` array and helper functions (`isValidColor`, `getClosestColor`) from `src/config/colors.js` to ensure colors are from the allowed palette. Component automatically generates lighter background colors for better readability.

#### calendarId
- **Type:** `String`
- **Default:** `'default'`
- **Description:** Calendar/category ID that event belongs to. Used for filtering events in mobile sidebar.
- **Note:** Events with the same `calendarId` value will be shown/hidden together when toggling calendar visibility.

#### rrule
- **Type:** `String`
- **Required:** No
- **Description:** RFC 5545 recurrence rule string (e.g. `FREQ=WEEKLY;BYDAY=MO,FR;COUNT=4` or `RRULE:FREQ=WEEKLY;BYDAY=MO,FR;COUNT=4`). 
- **Usage:** All recurrence is stored and processed using RRULE internally. The UI provides a Google Calendar-like interface where users select repeat patterns (Daily, Weekly, Monthly, Yearly, or Custom), and these selections are converted to RRULE strings automatically.
- **Display:** When viewing events, RRULE strings are converted to human-readable text (e.g., "Weekly on Monday, Friday").

## Usage Examples

### Programmatic Event Creation

```javascript
import { Temporal } from '@js-temporal/polyfill';

export default {
  data() {
    return {
      events: []
    };
  },
  methods: {
    // Add a single event
    addEvent(title, startTime, duration = 1) {
      const start = Temporal.PlainDateTime.from(startTime);
      const end = start.add({ hours: duration });
      
      this.events.push({
        id: Date.now().toString(),
        title,
        start: start.toString(),
        end: end.toString(),
        color: 'blue'
      });
    },
    
    // Add recurring weekly event
    addWeeklyEvent(title, dayOfWeek, time, weeks = 4) {
      const today = Temporal.Now.plainDateISO();
      const startOfWeek = today.subtract({ days: today.dayOfWeek });
      
      for (let i = 0; i < weeks; i++) {
        const date = startOfWeek.add({ 
          weeks: i, 
          days: dayOfWeek 
        });
        const start = Temporal.PlainDateTime.from({
          year: date.year,
          month: date.month,
          day: date.day,
          ...time
        });
        
        this.events.push({
          id: `weekly-${i}-${Date.now()}`,
          title,
          start: start.toString(),
          end: start.add({ hours: 1 }).toString(),
          color: 'green'
        });
      }
    },
    
    // Add multi-day event
    addMultiDayEvent(title, startDate, days) {
      const start = Temporal.PlainDate.from(startDate);
      
      this.events.push({
        id: Date.now().toString(),
        title,
        start: start.toString(),
        end: start.add({ days }).toString(),
        allDay: true,
        color: 'yellow'
      });
    },
    
    // Remove event by id
    removeEvent(eventId) {
      const index = this.events.findIndex(e => e.id === eventId);
      if (index !== -1) {
        this.events.splice(index, 1);
      }
    },
    
    // Update event
    updateEvent(eventId, updates) {
      const event = this.events.find(e => e.id === eventId);
      if (event) {
        Object.assign(event, updates);
      }
    }
  }
};
```

### Integration Example

```vue
<template>
  <div class="app">
    <GoogleCalendar
      ref="calendar"
      :events="events"
      :locale="currentLocale"
      initial-view="month"
      @event-click="showEventDetails"
      @date-change="loadEventsForDate"
      @view-change="saveViewPreference"
    />
  </div>
</template>

<script>
import { Temporal } from '@js-temporal/polyfill';
import GoogleCalendar from './src/Calendar.vue';

export default {
  components: { GoogleCalendar },
  
  data() {
    return {
      events: [],
      currentLocale: 'en-US'
    };
  },
  
  async mounted() {
    await this.loadEvents();
  },
  
  methods: {
    async loadEvents() {
      // Load from API
      const response = await fetch('/api/events');
      const data = await response.json();
      this.events = data;
    },
    
    showEventDetails(event) {
      // Show event details modal
      this.$modal.show({
        component: EventDetails,
        props: { event }
      });
    },
    
    loadEventsForDate(date) {
      // Lazy load events for new date range
      const start = date.subtract({ days: 7 });
      const end = date.add({ days: 7 });
      this.fetchEventsInRange(start, end);
    },
    
    saveViewPreference(view) {
      localStorage.setItem('calendarView', view);
    }
  }
};
</script>
```

## Temporal API Integration

### Date Operations

```javascript
import { Temporal } from '@js-temporal/polyfill';

// Get current date
const today = Temporal.Now.plainDateISO();

// Add/subtract time
const tomorrow = today.add({ days: 1 });
const lastWeek = today.subtract({ weeks: 1 });
const nextMonth = today.add({ months: 1 });

// Compare dates
const isPast = Temporal.PlainDate.compare(date, today) < 0;
const isSame = Temporal.PlainDate.compare(date1, date2) === 0;
const isFuture = Temporal.PlainDate.compare(date, today) > 0;

// Format dates
const formatted = today.toLocaleString('en-US', {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric'
});
```

### DateTime Operations

```javascript
// Create specific date/time
const meeting = Temporal.PlainDateTime.from({
  year: 2025,
  month: 10,
  day: 27,
  hour: 14,
  minute: 30
});

// Get date/time components
console.log(meeting.year);    // 2025
console.log(meeting.month);   // 10
console.log(meeting.day);     // 27
console.log(meeting.hour);    // 14
console.log(meeting.minute);  // 30

// Duration calculations
const duration = end.since(start);
console.log(duration.hours);  // Hours between dates
```

## Advanced Features

### Custom Event Filtering

```javascript
methods: {
  filterEvents(events, criteria) {
    return events.filter(event => {
      // Filter by date range
      const start = Temporal.PlainDate.from(event.start);
      if (criteria.startDate && Temporal.PlainDate.compare(start, criteria.startDate) < 0) {
        return false;
      }
      
      // Filter by color
      if (criteria.colors && !criteria.colors.includes(event.color)) {
        return false;
      }
      
      // Filter by title search
      if (criteria.search && !event.title.toLowerCase().includes(criteria.search.toLowerCase())) {
        return false;
      }
      
      return true;
    });
  }
}
```

### Event Validation

```javascript
function validateEvent(event) {
  if (!event.id) {
    throw new Error('Event must have an id');
  }
  
  if (!event.title) {
    throw new Error('Event must have a title');
  }
  
  if (!event.start) {
    throw new Error('Event must have a start date/time');
  }
  
  // Validate date format
  try {
    Temporal.PlainDateTime.from(event.start);
  } catch (e) {
    throw new Error('Invalid start date format');
  }
  
  // Validate end is after start
  if (event.end) {
    const start = Temporal.PlainDateTime.from(event.start);
    const end = Temporal.PlainDateTime.from(event.end);
    if (Temporal.PlainDateTime.compare(end, start) < 0) {
      throw new Error('End time must be after start time');
    }
  }
  
  return true;
}
```

## iCalendar (RFC 5545) and RRULE Interop

### User-Facing Recurrence Interface

The calendar provides a Google Calendar-like interface for recurrence. Users **never see or edit RRULE strings directly**. Instead:

1. **Simple Repeat Options**: Users can select:
   - Does not repeat
   - Daily
   - Weekly
   - Monthly
   - Yearly
   - Custom...

2. **Custom Recurrence Modal**: When "Custom..." is selected, a detailed modal opens allowing users to configure:
   - Frequency (Daily/Weekly/Monthly/Yearly)
   - Interval (every N days/weeks/months/years)
   - Days of the week (for weekly recurrence)
   - Monthly pattern (by day of month or by weekday position)
   - End condition (never, until date, or after N occurrences)

3. **Human-Readable Display**: Event details show recurrence in plain language:
   - "Weekly" → displays as "Weekly"
   - "FREQ=WEEKLY;BYDAY=MO,FR" → displays as "Weekly on M, F"
   - "FREQ=MONTHLY;INTERVAL=2;COUNT=6" → displays as "Every 2 months, 6 times"

4. **Deleting Recurring Events**: When deleting a recurring event, users are prompted to choose:
   - **Delete this event**: Removes only the selected occurrence by adding an EXDATE to the RRULE. The event is updated via `eventUpdate` emission.
   - **Delete all events in the series**: Removes the entire recurring series. The event is deleted via `eventDelete` emission.

### Programmatic RRULE Usage

For developers, a composable `useCalendarInterop` is provided for importing/exporting iCalendar data and handling RRULE recurrence.

- parseICal(icsString) -> Array<Event>: Parses ICS text into the component's event objects.
- serializeICal(events, opts?) -> string: Generates ICS text from event objects. Optional opts: { prodId, tzid }.
- parseRRule(rruleString) -> { rule, options }: Parses an RRULE (with or without DTSTART) into an RRule instance.
- serializeRRule(optionsOrRule) -> string: Serializes RRule options or an RRule instance to RFC string.
- expandRecurrence(event, rangeStart, rangeEnd) -> Array<Event>: Expands an event with event.rrule into occurrences within range.

Example:

```js
import useCalendarInterop from './src/composables/useCalendarInterop.js';

const { parseICal, serializeICal, parseRRule, serializeRRule, expandRecurrence } = useCalendarInterop();

// Parse ICS
const events = parseICal(icsText);

// Export ICS
const ics = serializeICal(events, { prodId: '-//My App//EN' });

// RRULE round-trip
const { options } = parseRRule('RRULE:FREQ=WEEKLY;BYDAY=MO,FR;COUNT=3');
const rruleText = serializeRRule(options);

// Expand occurrences
const recurrences = expandRecurrence(
  {
    id: 'evt1',
    title: 'Standup',
    start: '2025-10-06T09:00:00',
    end: '2025-10-06T09:15:00',
    rrule: 'RRULE:FREQ=WEEKLY;COUNT=3;BYDAY=MO'
  },
  '2025-10-01T00:00:00',
  '2025-11-01T00:00:00'
);
```
