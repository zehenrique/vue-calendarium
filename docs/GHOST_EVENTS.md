# Ghost Events API

Ghost events are semi-transparent preview events that can be displayed on the calendar before the user confirms creating or editing an event. This is particularly useful when integrating the calendar with custom modal dialogs or external event management systems.

## When to Use Ghost Events

- **Custom Modals**: When you disable built-in modals and implement your own event creation/editing UI
- **Drag-and-Drop**: Show a preview of where an event will be placed during drag operations
- **Multi-step Forms**: Display event previews as users fill out complex event forms
- **External Systems**: When another part of your application manages event creation

## API Methods

### `showGhostEvent(eventData)`

Displays a ghost event (preview) on the calendar.

**Parameters:**
- `eventData` (Object): Event data object (same structure as regular events)
  - `title` (String): Event title
  - `start` (String): ISO datetime string for start time
  - `end` (String): ISO datetime string for end time
  - `calendarId` (String, optional): Calendar category ID
  - `color` (String, optional): Hex color code
  - `allDay` (Boolean, optional): Whether this is an all-day event
  - `id` (String, optional): Custom ID (defaults to 'ghost-event')

**Returns:** `void`

**Example:**
```javascript
calendarApp.showGhostEvent({
  title: 'New Meeting',
  start: '2024-11-12T14:00:00',
  end: '2024-11-12T15:00:00',
  calendarId: 'work',
  color: '#1967d2'
});
```

### `updateGhostEvent(eventData)`

Updates the currently displayed ghost event. If no ghost event is visible, this method does nothing.

**Parameters:**
- `eventData` (Object): Partial event data to update
  - Any property from the event structure can be updated

**Returns:** `void`

**Example:**
```javascript
// Update only the title
calendarApp.updateGhostEvent({
  title: 'Updated Meeting Title'
});

// Update time range
calendarApp.updateGhostEvent({
  start: '2024-11-12T15:00:00',
  end: '2024-11-12T16:00:00'
});
```

### `hideGhostEvent()`

Hides the currently displayed ghost event.

**Returns:** `void`

**Example:**
```javascript
calendarApp.hideGhostEvent();
```

### `ghostEvent` (Computed Property)

A reactive computed property that contains the current ghost event object or `null` if no ghost event is displayed.

**Type:** `ComputedRef<Object | null>`

**Example:**
```javascript
// Check if ghost event is visible
if (calendarApp.ghostEvent.value) {
  console.log('Ghost event visible:', calendarApp.ghostEvent.value.title);
}

// Watch for changes
watch(() => calendarApp.ghostEvent.value, (ghost) => {
  if (ghost) {
    console.log('Ghost event shown:', ghost.title);
  } else {
    console.log('Ghost event hidden');
  }
});
```

## Complete Example

```vue
<template>
  <div>
    <Calendar :calendar-app="calendarApp" />
    
    <!-- Custom Event Creation Modal -->
    <v-dialog v-model="showModal" max-width="600px">
      <v-card>
        <v-card-title>Create Event</v-card-title>
        <v-card-text>
          <v-text-field
            v-model="draft.title"
            label="Title"
            @input="updatePreview"
          />
          <v-text-field
            v-model="draft.start"
            label="Start Time"
            type="datetime-local"
            @input="updatePreview"
          />
          <v-text-field
            v-model="draft.end"
            label="End Time"
            type="datetime-local"
            @input="updatePreview"
          />
        </v-card-text>
        <v-card-actions>
          <v-btn @click="cancelEvent">Cancel</v-btn>
          <v-btn color="primary" @click="saveEvent">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { createCalendar, createViewWeek, Calendar } from 'vue-calendarium';

const showModal = ref(false);
const draft = ref({
  title: '',
  start: '',
  end: '',
  calendarId: 'personal'
});

// Create calendar with modals disabled
const calendarApp = createCalendar({
  views: [createViewWeek()],
  calendars: [
    { id: 'personal', name: 'Personal', color: '#1967d2' }
  ],
  enableModals: false, // Disable built-in modals
  
  // Handle create request
  onEventCreateRequest: ({ draft: suggestedDraft }) => {
    // Populate draft with suggested values
    draft.value = {
      title: suggestedDraft.title,
      start: suggestedDraft.start,
      end: suggestedDraft.end,
      calendarId: suggestedDraft.calendarId
    };
    
    // Show ghost event preview
    calendarApp.showGhostEvent(draft.value);
    
    // Open custom modal
    showModal.value = true;
  }
});

// Update ghost event as user edits
function updatePreview() {
  calendarApp.updateGhostEvent({
    title: draft.value.title,
    start: draft.value.start,
    end: draft.value.end
  });
}

// Save the event
function saveEvent() {
  // Add the real event
  calendarApp.eventsService.add({
    title: draft.value.title,
    start: draft.value.start,
    end: draft.value.end,
    calendarId: draft.value.calendarId
  });
  
  // Hide ghost event
  calendarApp.hideGhostEvent();
  
  // Close modal
  showModal.value = false;
}

// Cancel event creation
function cancelEvent() {
  // Hide ghost event
  calendarApp.hideGhostEvent();
  
  // Close modal
  showModal.value = false;
  
  // Reset draft
  draft.value = {
    title: '',
    start: '',
    end: '',
    calendarId: 'personal'
  };
}
</script>
```

## Visual Styling

Ghost events automatically have:
- **Reduced opacity** (0.5 vs 1.0 for regular events)
- **Dashed border** (2px dashed vs solid)
- **isGhost flag** set to `true`

These styles are applied automatically and match the calendar's preview event styling.

## Best Practices

1. **Always hide ghost events**: When closing modals or canceling operations, always call `hideGhostEvent()` to clean up
2. **Update reactively**: Use `updateGhostEvent()` to provide real-time feedback as users edit event details
3. **Show on create**: Call `showGhostEvent()` when handling `onEventCreateRequest` to show users where the event will appear
4. **Check before update**: The `ghostEvent` computed property lets you check if a ghost event is currently visible
5. **One at a time**: Only one ghost event can be displayed at a time. Calling `showGhostEvent()` replaces any existing ghost event

## Common Patterns

### Drag-and-Drop Preview

```javascript
function onDragStart(event) {
  calendarApp.showGhostEvent({
    title: event.title,
    start: event.start,
    end: event.end,
    color: event.color
  });
}

function onDragMove(newStart, newEnd) {
  calendarApp.updateGhostEvent({
    start: newStart,
    end: newEnd
  });
}

function onDrop(confirmed) {
  if (confirmed) {
    // Update the actual event
    calendarApp.eventsService.update({
      id: event.id,
      start: newStart,
      end: newEnd
    });
  }
  calendarApp.hideGhostEvent();
}
```

### Multi-Step Wizard

```javascript
// Step 1: Basic info
function showStep1(draft) {
  calendarApp.showGhostEvent(draft);
  currentStep.value = 1;
}

// Step 2: Update with more details
function showStep2(additionalDetails) {
  calendarApp.updateGhostEvent(additionalDetails);
  currentStep.value = 2;
}

// Final step: Save or cancel
function finish(save) {
  if (save) {
    const finalEvent = { ...calendarApp.ghostEvent.value };
    calendarApp.eventsService.add(finalEvent);
  }
  calendarApp.hideGhostEvent();
  wizardOpen.value = false;
}
```

## Notes

- Ghost events are NOT saved to the events service
- Ghost events are purely visual previews
- When built-in modals are enabled, ghost events are managed automatically
- When modals are disabled, you have full control over ghost events
- Ghost events support all the same properties as regular events (rrule, location, description, custom, etc.)
