# VueJS Calendar - Usage Guide

## Installation

```bash
npm install @zehenrique/vue-google-calendar
```

## Quick Start

### 1. Basic Setup with Composition API

```vue
<template>
  <v-app>
    <v-main>
      <Calendar :calendar-app="calendarApp" />
    </v-main>
  </v-app>
</template>

<script setup>
import { createCalendar, createViewDay, createViewWeek, createViewMonth, Calendar } from '@zehenrique/vue-google-calendar';

// Create calendar instance
const calendarApp = createCalendar({
  // Define available views (REQUIRED)
  views: [
    createViewDay(),
    createViewWeek(),
    createViewMonth()
  ],
  
  // Set default view
  defaultView: 'month',
  
  // Initial events
  events: [],
  
  // Calendar categories
  calendars: [
    { id: 'personal', name: 'Personal', color: '#1967d2' },
    { id: 'work', name: 'Work', color: '#d93025' }
  ],
  
  // Locale ('en-US' or 'pt-PT')
  locale: 'en-US',
  
  // Enable/disable modals
  enableModals: true
});
</script>
```

Note: The calendar syncs Vuetify's locale (used by `VDatePicker`) with the calendar locale so the date picker matches the app language.

## Mobile Gestures in SPA Navigation

The calendar cleans up and reschedules mobile gesture handlers when it is unmounted and mounted again inside a single-page application. This keeps pinch-to-zoom anchored correctly and prevents duplicated swipe or pinch listeners after navigating away from the calendar and back.

### 2. Event Structure

Events must follow this structure:

```javascript
{
  id: string | number,           // Unique identifier (REQUIRED)
  title: string,                  // Event title (REQUIRED)
  start: string,                  // ISO datetime string (REQUIRED)
  end: string,                    // ISO datetime string (REQUIRED)
  allDay: boolean,                // Is all-day event (optional)
  calendarId: string,             // Calendar category ID (optional)
  color: string,                  // Hex color (optional)
  rrule: string,                  // Recurrence rule (optional)
  description: string,            // Event description (optional)
  location: string,               // Event location (optional)
  custom: {                       // Custom properties (optional)
    // Any custom data you need
  }
}
```

### 3. Managing Events

```javascript
// Add event
calendarApp.eventsService.add({
  title: 'Team Meeting',
  start: '2024-11-12T10:00:00',
  end: '2024-11-12T11:00:00',
  calendarId: 'work'
});

// Update event
calendarApp.eventsService.update({
  id: '1',
  title: 'Updated Meeting Title'
});

// Remove event
calendarApp.eventsService.remove('1');

// Get event by ID
const event = calendarApp.eventsService.get('1');

// Get all events
const allEvents = calendarApp.eventsService.getAll();

// Get events by calendar
const workEvents = calendarApp.eventsService.getByCalendar('work');

// Replace all events
calendarApp.eventsService.set([...newEvents]);
```

### 4. Managing Calendars

```javascript
// Add calendar
calendarApp.calendarsService.add({
  name: 'Family',
  color: '#137333'
});

// Update calendar
calendarApp.calendarsService.update({
  id: 'family',
  name: 'Family & Friends'
});

// Remove calendar
calendarApp.calendarsService.remove('family');

// Toggle calendar visibility
calendarApp.calendarsService.toggleVisibility('work');

// Get visible calendars
const visible = calendarApp.calendarsService.getVisible();
```

### 5. Calendar Controls

```javascript
import { Temporal } from '@js-temporal/polyfill';

// Navigate
calendarApp.goToNext();        // Next day/week/month
calendarApp.goToPrevious();    // Previous day/week/month
calendarApp.goToToday();       // Go to today

// Change view
calendarApp.setView('week');   // 'day', 'week', or 'month'

// Change date
calendarApp.setDate(Temporal.Now.plainDateISO());

// Change locale
calendarApp.setLocale('pt-PT');
```

### 6. Using Event and Calendar Classes

```javascript
import { CalendarEvent, CalendarModel } from '@zehenrique/vue-google-calendar';

// Create event instance
const event = new CalendarEvent({
  title: 'Meeting',
  start: '2024-11-12T10:00:00',
  end: '2024-11-12T11:00:00',
  custom: {
    attendees: ['john@example.com', 'jane@example.com'],
    room: 'Conference Room A'
  }
});

// Event methods
event.isAllDay();              // Check if all-day
event.isRecurring();           // Check if recurring
event.getDurationMinutes();    // Get duration
event.clone();                 // Clone event
event.update({ title: 'New Title' });
const obj = event.toObject();  // Convert to plain object

// Create calendar instance
const calendar = new CalendarModel({
  name: 'Work',
  color: '#1967d2',
  custom: {
    owner: 'user@example.com',
    shared: true
  }
});

// Calendar methods
calendar.toggleVisibility();
calendar.clone();
calendar.update({ name: 'Work Calendar' });
const obj = calendar.toObject();
```

## Complete Example

```vue
<template>
  <v-app>
    <v-main>
      <v-container>
        <!-- Calendar Controls -->
        <v-row>
          <v-col>
            <v-btn @click="addSampleEvent">Add Event</v-btn>
            <v-btn @click="toggleWorkCalendar">Toggle Work</v-btn>
            <v-btn @click="switchToWeek">Week View</v-btn>
          </v-col>
        </v-row>

        <!-- Calendar Component -->
        <v-row>
          <v-col>
            <Calendar :calendar-app="calendarApp" />
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import { Temporal } from '@js-temporal/polyfill';
import { 
  createCalendar, 
  createViewDay, 
  createViewWeek, 
  createViewMonth,
  Calendar 
} from '@zehenrique/vue-google-calendar';

// Create calendar
const calendarApp = createCalendar({
  views: [
    createViewDay(),
    createViewWeek(),
    createViewMonth()
  ],
  defaultView: 'month',
  events: [
    {
      id: '1',
      title: 'Team Meeting',
      start: Temporal.Now.plainDateTimeISO().toString(),
      end: Temporal.Now.plainDateTimeISO().add({ hours: 1 }).toString(),
      calendarId: 'work',
      custom: {
        location: 'Conference Room',
        attendees: ['john@example.com']
      }
    }
  ],
  calendars: [
    { id: 'work', name: 'Work', color: '#1967d2' },
    { id: 'personal', name: 'Personal', color: '#137333' }
  ],
  locale: 'en-US'
});

// Control methods
function addSampleEvent() {
  calendarApp.eventsService.add({
    title: 'New Event',
    start: Temporal.Now.plainDateTimeISO().toString(),
    end: Temporal.Now.plainDateTimeISO().add({ hours: 1 }).toString(),
    calendarId: 'personal'
  });
}

function toggleWorkCalendar() {
  calendarApp.calendarsService.toggleVisibility('work');
}

function switchToWeek() {
  calendarApp.setView('week');
}
</script>
```

## Custom Modals and Ghost Events

When using the calendar in a larger application with custom event creation/editing modals, you can disable the built-in modals and control ghost events (preview events) programmatically.

### Disabling Built-in Modals

```javascript
const calendarApp = createCalendar({
  views: [createViewDay(), createViewWeek(), createViewMonth()],
  enableModals: false, // Disable built-in modals
  onEventCreateRequest: ({ draft, context }) => {
    // Handle event creation in your custom modal
    console.log('User wants to create event:', draft);
    console.log('Source:', context.source); // 'time-slot', 'day-cell', 'all-day', etc.
    
    // Show your custom modal with the draft data
    openCustomModal(draft);
  },
  onEventClick: (event) => {
    // Handle event click in your custom modal
    openCustomEditModal(event);
  }
});
```

### Controlling Ghost Events

Ghost events are semi-transparent preview events displayed while the user is creating or editing an event. When modals are disabled, you can control ghost events manually:

```javascript
// Show a ghost event (preview) when user starts creating an event
function openCustomModal(draft) {
  // Display the ghost event on the calendar
  calendarApp.showGhostEvent({
    title: draft.title,
    start: draft.start,
    end: draft.end,
    calendarId: draft.calendarId,
    color: draft.color
  });
  
  // Show your custom modal
  showModal.value = true;
}

// Update ghost event as user edits in the modal
function onDraftChange(updatedDraft) {
  calendarApp.updateGhostEvent({
    title: updatedDraft.title,
    start: updatedDraft.start,
    end: updatedDraft.end
  });
}

// Hide ghost event when modal closes
function onModalClose(saved) {
  if (saved) {
    // Add the actual event
    calendarApp.eventsService.add({
      title: finalEvent.title,
      start: finalEvent.start,
      end: finalEvent.end,
      calendarId: finalEvent.calendarId
    });
  }
  
  // Always hide the ghost event
  calendarApp.hideGhostEvent();
}

// Check if a ghost event is currently displayed
if (calendarApp.ghostEvent.value) {
  console.log('Ghost event visible:', calendarApp.ghostEvent.value);
}
```

### Example: Integration with Custom Modal

```vue
<template>
  <div>
    <Calendar :calendar-app="calendarApp" />
    
    <CustomEventModal
      v-model="showCustomModal"
      :draft="eventDraft"
      @update:draft="updateGhostPreview"
      @save="saveEvent"
      @cancel="cancelEvent"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { createCalendar, createViewWeek, Calendar } from '@zehenrique/vue-google-calendar';

const showCustomModal = ref(false);
const eventDraft = ref(null);

const calendarApp = createCalendar({
  views: [createViewWeek()],
  enableModals: false,
  onEventCreateRequest: ({ draft }) => {
    eventDraft.value = draft;
    calendarApp.showGhostEvent(draft);
    showCustomModal.value = true;
  }
});

function updateGhostPreview(updatedDraft) {
  calendarApp.updateGhostEvent(updatedDraft);
}

function saveEvent(finalEvent) {
  calendarApp.eventsService.add(finalEvent);
  calendarApp.hideGhostEvent();
  showCustomModal.value = false;
}

function cancelEvent() {
  calendarApp.hideGhostEvent();
  showCustomModal.value = false;
}
</script>
```

## API Reference

### `createCalendar(config)`

Creates a calendar instance.

**Config Properties:**

- `views` (Array): Array of view objects from `createViewDay()`, `createViewWeek()`, `createViewMonth()` - **REQUIRED**
- `defaultView` (String): Default view name - 'day', 'week', or 'month'
- `events` (Array): Initial events
- `calendars` (Array): Calendar categories
- `locale` (String): 'en-US' or 'pt-PT'
- `selectedDate` (Temporal.PlainDate): Initial selected date
- `enableModals` (Boolean): Enable/disable modals
- `enableMobileSidebar` (Boolean): Enable/disable mobile sidebar
- `mobileViewSelectorPlacement` ('header'|'sidebar'): Where the view selector is shown on mobile
- `enableSwipeGestures` (Boolean): Enable/disable horizontal swipe navigation on mobile
- `enablePinchToZoom` (Boolean): Enable/disable pinch-to-zoom on mobile Day/Week views
- `enableCurrentTimeIndicator` (Boolean): Enable/disable the red current-time indicator line in Day/Week views

**Returns:** Calendar instance with:

- `eventsService`: Events management service
- `calendarsService`: Calendars management service
- `currentView`: Current view (computed)
- `currentDate`: Current date (computed)
- `locale`: Current locale (computed)
- `ghostEvent`: Current ghost event or null (computed)
- `setView(name)`: Change view
- `setDate(date)`: Change date
- `setLocale(locale)`: Change locale
- `goToNext()`: Navigate forward
- `goToPrevious()`: Navigate backward
- `goToToday()`: Go to today
- `showGhostEvent(eventData)`: Display a ghost event (preview)
- `updateGhostEvent(eventData)`: Update the current ghost event
- `hideGhostEvent()`: Hide the current ghost event

### `createViewDay()`, `createViewWeek()`, `createViewMonth()`

Factory functions to create view configurations.


**Returns:** View object with `name`, `label`, and `type` properties.

## Notes

- All views must be explicitly defined using `createViewDay()`, `createViewWeek()`, or `createViewMonth()`
- Events use `calendarId` to reference calendar categories
- The `custom` property in events and calendars allows for any application-specific data
- Services provide reactive updates - changes are immediately reflected in the UI
- Callbacks can be provided to handle user interactions (eventClick, dateChange, etc.)

