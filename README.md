# Vue Google Calendar Component

A fully-featured calendar component for Vue.js that looks and feels like Google Calendar, with Temporal API support and internationalization.

## Features

✨ **Google Calendar Look & Feel** - Closely matches Google Calendar's design
📱 **Responsive Design** - Works seamlessly on desktop, tablet, and mobile
🌍 **Internationalization** - Built-in support for multiple languages (English, Spanish, French, German, Portuguese, Japanese, Chinese)
📅 **Multiple Views** - Month, Week, and Day views
⏰ **Temporal API** - Uses modern Temporal API for date/time handling
🎨 **Customizable Events** - Color-coded events with multiple color options
💻 **Vue 3 Compatible** - Built with Vue 3 Composition API
📊 **Event Management** - Create and manage events programmatically

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

// Create a simple event
const event = {
  id: 'unique-id',
  title: 'My Event',
  start: '2025-10-27T14:00:00',
  end: '2025-10-27T15:00:00',
  color: 'blue' // Options: blue, red, green, yellow
};

// Create an all-day event
const allDayEvent = {
  id: 'all-day-1',
  title: 'Conference',
  start: '2025-10-28',
  allDay: true,
  color: 'green'
};

// Create event using Temporal API
const now = Temporal.Now.plainDateTimeISO();
const temporalEvent = {
  id: 'temporal-1',
  title: 'Future Meeting',
  start: now.add({ days: 5, hours: 2 }).toString(),
  end: now.add({ days: 5, hours: 3 }).toString(),
  color: 'red'
};
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `events` | Array | `[]` | Array of event objects to display |
| `locale` | String | `'en-US'` | Locale for date/time formatting (e.g., 'en-US', 'es-ES', 'fr-FR') |
| `initialView` | String | `'month'` | Initial view mode: 'month', 'week', or 'day' |
| `initialDate` | String/Object | Current date | Initial date to display (Temporal PlainDate or ISO string) |

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `eventClick` | `event` | Emitted when an event is clicked |
| `dateChange` | `date` | Emitted when the displayed date changes |
| `viewChange` | `view` | Emitted when the view mode changes |

## Event Object Structure

```javascript
{
  id: String,        // Unique identifier (required)
  title: String,     // Event title (required)
  start: String,     // Start date/time in ISO format (required)
  end: String,       // End date/time in ISO format (optional)
  allDay: Boolean,   // Whether event is all-day (optional)
  color: String      // Color theme: 'blue', 'red', 'green', 'yellow' (optional)
}
```

## Supported Locales

- `en-US` - English (United States)
- `es-ES` - Spanish (Spain)
- `fr-FR` - French (France)
- `de-DE` - German (Germany)
- `pt-BR` - Portuguese (Brazil)
- `ja-JP` - Japanese (Japan)
- `zh-CN` - Chinese (China)

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

The component supports four color themes matching Google Calendar:

- **blue** - Default blue theme
- **red** - Red theme for important events
- **green** - Green theme for confirmed/completed events
- **yellow** - Yellow theme for tentative events

### Styling

The component uses scoped styles that closely match Google Calendar. You can customize colors by overriding CSS variables in your parent component.

## Browser Support

- Modern browsers with ES6+ support
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## Dependencies

- Vue 3.3+
- @js-temporal/polyfill 0.4+
- vue-i18n 9.5+

## API Documentation

For detailed API documentation, see [API.md](./API.md).

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Roadmap

- [ ] Drag and drop event rescheduling
- [ ] Event creation via UI
- [ ] Recurring events
- [ ] Event categories/calendars
- [ ] Export to iCal format
- [ ] Print view
- [ ] Keyboard shortcuts
- [ ] Accessibility improvements

## Credits

Inspired by Google Calendar's excellent user interface and design patterns.