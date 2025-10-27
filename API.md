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

Example:
```javascript
// ISO string
initialDate="2025-12-25"

// Temporal object
:initialDate="Temporal.PlainDate.from({ year: 2025, month: 12, day: 25 })"
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
- **Default:** `'#1967d2'` (Google blue)
- **Description:** Custom hex color for event display (e.g., `'#1967d2'`, `'#137333'`, `'#d93025'`)
- **Note:** Any valid hex color code is accepted. Component automatically generates lighter background color.

#### calendar
- **Type:** `String`
- **Default:** `'default'`
- **Description:** Calendar/category ID that event belongs to

#### repeat
- **Type:** `String`
- **Default:** `'none'`
- **Allowed values:** `'none'`, `'daily'`, `'weekly'`, `'monthly'`, `'yearly'`
- **Description:** Recurrence pattern for event. When set, component automatically generates up to 52 recurring instances.

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
