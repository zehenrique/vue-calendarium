# Vue Google Calendar Component

A production-ready calendar component for Vue.js that replicates Google Calendar's UI/UX with full internationalization, event overlap handling, all-day events, mobile support, and modern date handling via Temporal API.

## Features

✨ **Google Calendar Look & Feel** - Closely matches Google Calendar's design and interactions
📱 **Responsive Design** - Works seamlessly on desktop, tablet, and mobile with swipe gestures
🌍 **Internationalization** - Full support for English (en-US) and Portuguese Portugal (pt-PT)
📅 **Multiple Views** - Month, Week, and Day views with smooth transitions
⏰ **Temporal API** - Uses modern Temporal API for all date/time handling
🎨 **Custom Hex Colors** - Events accept any hex color code
💻 **Vue 3 Composition API** - Built with Vue 3 Composition API best practices
📊 **Event Management** - Create, view, edit, and delete events via UI and programmatically
🔁 **Recurring Events** - Daily, weekly, monthly, and yearly recurring events (up to 52 occurrences)
📂 **Multiple Calendars** - Support for event categories/calendars with color coding
♿ **Accessibility** - Full ARIA labels, keyboard navigation, and screen reader support
🧩 **Optional Modals** - Disable built-in dialogs and plug in your own custom modals
🎯 **Event Overlap Handling** - Column-based layout for overlapping events (Google Calendar style)
☀️ **All-Day Events** - Dedicated header section for all-day events
🕐 **Current Time Indicator** - Red line showing current time in week/day views
📱 **Mobile Swipe Gestures** - Navigate with left/right swipes on mobile
☰ **Mobile Sidebar** - Full-featured navigation sidebar for mobile devices
💎 **Vuetify (Material Design)** - Modern, beautiful Material Design styling with Vuetify
📌 **Sticky Calendar Header** - Header stays visible while scrolling for better navigation

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

Open http://localhost:3000 to view the demo.

## Usage

### Basic Example

```vue
<template>
  <GoogleCalendar
    :events="events"
    locale="en-US"
    initial-view="month"
    @event-click="handleEventClick"
    @date-change="handleDateChange"
  />
</template>

<script>
import { Temporal } from '@js-temporal/polyfill';
import GoogleCalendar from './src/Calendar.vue';

export default {
  components: {
    GoogleCalendar
  },
  data() {
    return {
      events: [
        {
          id: '1',
          title: 'Team Meeting',
          start: '2025-10-27T10:00:00',
          end: '2025-10-27T11:00:00',
          color: 'blue'
        }
      ]
    };
  },
  methods: {
    handleEventClick(event) {
      console.log('Event clicked:', event);
    },
    handleDateChange(date) {
      console.log('Date changed:', date);
    }
  }
};
</script>
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
  repeat: 'weekly',
  calendar: 'work'
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

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `events` | Array | `[]` | Array of event objects to display |
| `locale` | String | `'en-US'` | Locale: 'en-US' or 'pt-PT' |
| `calendars` | Array | `[{id:'default', name:'My Calendar', color:'#1967d2'}]` | Array of calendar objects |
| `initialView` | String | `'month'` | Initial view mode: 'month', 'week', or 'day' |
| `initialDate` | String/Object | Current date | Initial date to display (Temporal PlainDate or ISO string) |
| `enableModals` | Boolean | `true` | Toggle built-in event/detail/delete modals. Set to `false` to handle modals externally |

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `eventClick` | `event` | Emitted when an event is clicked |
| `dateChange` | `date` | Emitted when the displayed date changes |
| `viewChange` | `view` | Emitted when the view mode changes |
| `eventCreate` | `events[]` | Emitted when events are created via UI |
| `eventCreateRequest` | `{ draft, context }` | Emitted when the user starts creating an event while built-in modals are disabled |

## Event Object Structure

```javascript
{
  id: String,          // Unique identifier (required)
  title: String,       // Event title (required)
  start: String,       // Start date/time in ISO format (required)
  end: String,         // End date/time in ISO format (optional)
  allDay: Boolean,     // Whether event is all-day (optional)
  color: String,       // Hex color code like '#1967d2' (optional)
  repeat: String,      // 'none', 'daily', 'weekly', 'monthly', 'yearly' (optional)
  calendar: String     // Calendar ID (optional)
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

### Event Colors

Events accept any hex color code (e.g., `#1967d2`, `#137333`, `#d93025`). The component automatically generates a lighter background color for better readability.

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