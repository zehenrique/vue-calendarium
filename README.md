# Vue Google Calendar Component

A production-ready, reusable calendar component for Vue.js that replicates Google Calendar's UI/UX with full internationalization, event overlap handling, all-day events, mobile support, and modern date handling via Temporal API.

## Features

✨ **Google Calendar Look & Feel** - Closely matches Google Calendar's design and interactions  
📱 **Responsive Design** - Works seamlessly on desktop, tablet, and mobile with swipe gestures  
🌍 **Internationalization** - Full support for English (en-US) and Portuguese Portugal (pt-PT)  
📅 **Multiple Views** - Month, Week, and Day views with smooth transitions  
⏰ **Temporal API** - Uses modern Temporal API for all date/time handling  
🎨 **Predefined Color Palette** - 12 Material Design colors matching Google Calendar (see [COLORS.md](./COLORS.md))  
💻 **Vue 3 Composition API** - Built with Vue 3 Composition API best practices  
📊 **Event Management** - Create, view, edit, and delete events via UI and programmatically  
🔁 **Recurring Events** - RFC 5545 compliant recurring events with RRULE support and iCalendar import/export  
  - Google Calendar-like interface: Daily, Weekly, Monthly, Yearly, or Custom recurrence  
  - Delete single occurrence or entire series with EXDATE support  
  - Human-readable recurrence descriptions  
📂 **Multiple Calendars** - Support for event categories/calendars with color coding  
♿ **Accessibility** - Full ARIA labels, keyboard navigation, and screen reader support  
🧩 **Pluggable API** - Use as a standalone component or integrate into existing applications  
🎯 **Event Overlap Handling** - Column-based layout for overlapping events (Google Calendar style)  
☀️ **All-Day Events** - Dedicated header section for all-day events  
🕐 **Current Time Indicator** - Red line showing current time in week/day views  
📱 **Mobile Swipe Gestures** - Navigate with left/right swipes on mobile  
☰ **Mobile Sidebar** - Full-featured navigation sidebar for mobile devices  
💎 **Vuetify (Material Design)** - Modern, beautiful Material Design styling with Vuetify  
📌 **Sticky Calendar Header** - Header stays visible while scrolling for better navigation  
🎛️ **Services API** - Dedicated services for managing events and calendars programmatically

## Color Palette

The calendar uses a **predefined color palette** with 12 Material Design colors that match Google Calendar:

🔴 Tomato • 🌸 Flamingo • 🟠 Tangerine • 🟡 Banana • 🟢 Sage • 🌿 Basil • 🔵 Peacock • 💙 Blueberry • 💜 Lavender • 🍇 Grape • ⚫ Graphite • 🔷 **Cobalt (default)**

**Quick Reference:**
- 📖 [Complete Color Guide](./COLORS.md) - Detailed usage guide with examples
- 📋 [Quick Reference](./COLOR_REFERENCE.md) - Color codes and helper functions
- 🛠️ [Implementation Details](./COLOR_IMPLEMENTATION.md) - Technical implementation

```javascript
import { CALENDAR_COLORS, DEFAULT_COLOR, isValidColor } from './src/config/colors.js';

// Use predefined colors
const calendar = {
  id: 'work',
  name: 'Work',
  color: '#1967D2' // Cobalt (default)
};
```

See [COLORS.md](./COLORS.md) for complete documentation.

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

Open http://localhost:3000 to view the demo.

## Quick Start

### New API (Recommended - Composition API)

```vue
<template>
  <v-app>
    <v-main>
      <GoogleCalendar :calendar-app="calendarApp" />
    </v-main>
  </v-app>
</template>

<script setup>
import { 
  createCalendar, 
  createViewDay, 
  createViewWeek, 
  createViewMonth,
  GoogleCalendar 
} from './src/index.js';

// Create calendar instance
const calendarApp = createCalendar({
  // Define available views (required)
  views: [
    createViewDay(),
    createViewWeek(),
    createViewMonth()
  ],
  
  // Set default view
  defaultView: 'month',
  
  // Initial events
  events: [
    {
      id: '1',
      title: 'Team Meeting',
      start: '2025-10-27T10:00:00',
      end: '2025-10-27T11:00:00',
      calendarId: 'work',
      custom: {
        location: 'Conference Room A'
      }
    }
  ],
  
  // Calendar categories
  calendars: [
    { id: 'work', name: 'Work', color: '#1967d2' },
    { id: 'personal', name: 'Personal', color: '#137333' }
  ],
  
  // Locale
  locale: 'en-US'
});

// Manage events programmatically
calendarApp.eventsService.add({
  title: 'New Event',
  start: '2025-10-28T14:00:00',
  end: '2025-10-28T15:00:00',
  calendarId: 'personal'
});
</script>
```

## Documentation

For comprehensive documentation, see [USAGE.md](./USAGE.md).

For API reference, see [API.md](./API.md).

## Event Structure

Events support a standardized structure with custom properties:

```javascript
{
  id: string | number,          // Unique identifier (required)
  title: string,                 // Event title (required)
  start: string,                 // ISO datetime string (required)
  end: string,                   // ISO datetime string (required)
  allDay: boolean,               // Is all-day event (optional)
  calendarId: string,            // Calendar category ID (optional)
  color: string,                 // Hex color (optional)
  rrule: string,                 // Recurrence rule (optional)
  description: string,           // Event description (optional)
  location: string,              // Event location (optional)
  custom: {                      // Custom properties (optional)
    // Any application-specific data
    attendees: ['email@example.com'],
    room: 'Conference Room A',
    priority: 'high'
  }
}
```

## Managing Events & Calendars

### With New API (Events Service)

```javascript
// Add event
calendarApp.eventsService.add({
  title: 'New Event',
  start: '2025-10-28T10:00:00',
  end: '2025-10-28T11:00:00',
  calendarId: 'work'
});

// Update event
calendarApp.eventsService.update({
  id: '1',
  title: 'Updated Title'
});

// Delete event
calendarApp.eventsService.remove('1');

// Get all events
const allEvents = calendarApp.eventsService.getAll();

// Manage calendars
calendarApp.calendarsService.add({
  name: 'Family',
  color: '#d93025'
});

calendarApp.calendarsService.toggleVisibility('work');
```

### Creating Events Programmatically

```javascript
import { Temporal } from '@js-temporal/polyfill';

// Create a simple event with custom color
const event = {
  id: 'unique-id',
  title: 'My Event',
  start: '2025-10-27T14:00:00',
  end: '2025-10-27T15:00:00',
  color: '#1967d2' // Any hex color code
};

// Create a recurring weekly event
const recurringEvent = {
  id: 'weekly-1',
  title: 'Weekly Standup',
  start: '2025-10-27T09:00:00',
  end: '2025-10-27T09:30:00',
  color: '#137333',
  rrule: 'FREQ=WEEKLY;COUNT=10',
  calendarId: 'work'
};

// Create an all-day event
const allDayEvent = {
  id: 'all-day-1',
  title: 'Conference',
  start: '2025-10-28',
  allDay: true,
  color: '#d93025'
};

// Create event using Temporal API
const now = Temporal.Now.plainDateTimeISO();
const temporalEvent = {
  id: 'temporal-1',
  title: 'Future Meeting',
  start: now.add({ days: 5, hours: 2 }).toString(),
  end: now.add({ days: 5, hours: 3 }).toString(),
  color: '#f9ab00'
};
```

### Creating Events via UI

Users can click the "Create event" button to open a modal dialog with:
- Event title
- Start and end date/time
- Recurring options (none, daily, weekly, monthly, yearly)
- Calendar selection
- Custom color picker

```vue
<GoogleCalendar
  :events="events"
  :calendars="calendars"
  @event-create="handleEventCreate"
/>

<script>
export default {
  data() {
    return {
      events: [],
      calendars: [
        { id: 'work', name: 'Work', color: '#1967d2' },
        { id: 'personal', name: 'Personal', color: '#137333' }
      ]
    };
  },
  methods: {
    handleEventCreate(newEvents) {
      // newEvents is an array (multiple for recurring events)
      this.events.push(...newEvents);
    }
  }
};
</script>
```

## API

The calendar component accepts a single `calendar-app` prop created using `createCalendar()`:

```javascript
import { createCalendar, createViewDay, createViewWeek, createViewMonth } from '@/calendar';

const calendarApp = createCalendar({
  views: [createViewDay(), createViewWeek(), createViewMonth()],  // Required
  defaultView: 'month',              // Optional (default: 'month')
  events: [],                        // Optional (default: [])
  calendars: [],                     // Optional (default: [])
  locale: 'en-US',                   // Optional (default: 'en-US')
  selectedDate: Temporal.Now.plainDateISO(),  // Optional (default: today)
  enableModals: true,                // Optional (default: true)
  
  // Callbacks (all optional)
  onEventClick: (event) => {},
  onDateChange: (date) => {},
  onViewChange: (view) => {},
  onEventCreate: (events) => {},
  onEventUpdate: (event) => {},
  onEventDelete: (event) => {},
  onEventCreateRequest: ({ draft, context }) => {}
});
```

See [USAGE.md](./USAGE.md) for detailed API documentation.

## Event Object Structure

```javascript
{
  id: String,          // Unique identifier (required)
  title: String,       // Event title (required)
  start: String,       // Start date/time in ISO format (required)
  end: String,         // End date/time in ISO format (optional)
  allDay: Boolean,     // Whether event is all-day (optional)
  color: String,       // Hex color code like '#1967d2' (optional)
  rrule: String,       // RRULE string for recurring events (optional)
  calendarId: String,  // Calendar ID (optional)
  description: String, // Event description (optional)
  location: String,    // Event location (optional)
  custom: Object       // Custom properties object (optional)
}
```

## Supported Locales

- `en-US` - English
- `pt-PT` - Portuguese (Portugal)

## Temporal API

This component uses the [Temporal API](https://tc39.es/proposal-temporal/docs/) for modern date and time handling. Temporal provides:

- Type-safe date/time operations
- No timezone confusion
- Intuitive API for date arithmetic
- Better internationalization support

### Using Temporal with Events

```javascript
import { Temporal } from '@js-temporal/polyfill';

// Get current date
const today = Temporal.Now.plainDateISO();

// Create an event for tomorrow at 3 PM
const tomorrow = today.add({ days: 1 });
const eventStart = Temporal.PlainDateTime.from({
  year: tomorrow.year,
  month: tomorrow.month,
  day: tomorrow.day,
  hour: 15,
  minute: 0
});

const event = {
  id: 'tomorrow-event',
  title: 'Tomorrow Meeting',
  start: eventStart.toString(),
  end: eventStart.add({ hours: 1 }).toString(),
  color: 'blue'
};
```

## Customization

### Event Colors

The calendar uses a predefined color palette inspired by Google Calendar's Material Design colors. Only these colors are available for calendars and events to ensure visual consistency:

```javascript
import { CALENDAR_COLORS, DEFAULT_COLOR } from './src/config/colors.js';

// Available colors:
const colors = [
  { id: 'tomato', name: 'Tomato', hex: '#D50000' },
  { id: 'flamingo', name: 'Flamingo', hex: '#E67C73' },
  { id: 'tangerine', name: 'Tangerine', hex: '#F4511E' },
  { id: 'banana', name: 'Banana', hex: '#F6BF26' },
  { id: 'sage', name: 'Sage', hex: '#33B679' },
  { id: 'basil', name: 'Basil', hex: '#0B8043' },
  { id: 'peacock', name: 'Peacock', hex: '#039BE5' },
  { id: 'blueberry', name: 'Blueberry', hex: '#3F51B5' },
  { id: 'lavender', name: 'Lavender', hex: '#7986CB' },
  { id: 'grape', name: 'Grape', hex: '#8E24AA' },
  { id: 'graphite', name: 'Graphite', hex: '#616161' },
  { id: 'cobalt', name: 'Cobalt', hex: '#1967D2' } // Default
];

// Helper functions
import { getColorById, getColorIdByHex, isValidColor, getClosestColor } from './src/config/colors.js';

// Get color by ID
const color = getColorById('tomato'); // Returns '#D50000'

// Check if a color is valid
isValidColor('#D50000'); // Returns true
isValidColor('#FFFFFF'); // Returns false

// Get closest valid color (fallback to default if not in palette)
const validColor = getClosestColor('#FF0000'); // Returns DEFAULT_COLOR
```

**Usage in calendars:**
```javascript
const calendars = [
  { id: 'work', name: 'Work', color: '#1967D2' }, // Cobalt
  { id: 'personal', name: 'Personal', color: '#0B8043' }, // Basil
  { id: 'family', name: 'Family', color: '#D50000' } // Tomato
];
```

**Color palette integration:**
The color names are internationalized and available in both English and Portuguese through the i18n system.

### Styling

The component uses scoped styles that closely match Google Calendar. You can customize colors by overriding CSS variables in your parent component.

## Component Architecture

The calendar component follows a modular architecture with focused, single-responsibility components:

### Main Component
- **`Calendar.vue`** - Main calendar container managing state and view rendering

### Sub-Components
- **`EventModal.vue`** - Event creation and editing form modal
- **`EventDetailModal.vue`** - Event details display with edit/delete actions
- **`DeleteConfirmModal.vue`** - Confirmation dialog for event deletion
- **`MobileSidebar.vue`** - Mobile navigation sidebar with view and calendar selection

### Utilities
- **`composables/useCalendarUtils.js`** - Shared utility functions for:
  - Event styling and positioning
  - Date/time formatting (24-hour format)
  - Event overlap calculation
  - Week/day calculations

This modular structure makes the codebase:
- **Maintainable**: Each component has a clear, focused purpose
- **Testable**: Components can be tested in isolation
- **Reusable**: Modal and utility components can be used elsewhere
- **Scalable**: Easy to add new features without affecting existing code

For more details on the refactoring approach, see [REFACTORING.md](./REFACTORING.md).

## Browser Support

- Modern browsers with ES6+ support
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## Dependencies

- Vue 3.3+
- Vuetify 3.0+
- @js-temporal/polyfill 0.4+
- vue-i18n 9.5+
- @mdi/font (Material Design Icons)

## API Documentation

For detailed API documentation, see [API.md](./API.md).

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Credits

Inspired by Google Calendar's excellent user interface and design patterns.