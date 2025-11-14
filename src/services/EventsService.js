import { ref, computed } from 'vue';
import { CalendarEvent } from '../core/CalendarEvent.js';

/**
 * Events Service - Manages calendar events
 */
export class EventsService {
  constructor(initialEvents = []) {
    this._events = ref(initialEvents.map(e => CalendarEvent.from(e)));
  }

  /**
   * Get all events
   */
  getAll() {
    return this._events.value.map(e => e.toObject());
  }

  /**
   * Get event by ID
   */
  get(id) {
    const event = this._events.value.find(e => e.id === id);
    return event ? event.toObject() : null;
  }

  /**
   * Add a new event
   */
  add(eventData) {
    const event = CalendarEvent.from(eventData);
    this._events.value.push(event);
    return event.toObject();
  }

  /**
   * Update an existing event
   */
  update(eventData) {
    const index = this._events.value.findIndex(e => e.id === eventData.id);
    if (index !== -1) {
      this._events.value[index].update(eventData);
      return this._events.value[index].toObject();
    }
    return null;
  }

  /**
   * Remove an event by ID
   */
  remove(id) {
    const index = this._events.value.findIndex(e => e.id === id);
    if (index !== -1) {
      const removed = this._events.value.splice(index, 1)[0];
      return removed.toObject();
    }
    return null;
  }

  /**
   * Set all events (replaces existing)
   */
  set(events) {
    this._events.value = events.map(e => CalendarEvent.from(e));
  }

  /**
   * Filter events by calendar ID
   */
  getByCalendar(calendarId) {
    return this._events.value
      .filter(e => e.calendarId === calendarId)
      .map(e => e.toObject());
  }

  /**
   * Filter events by date range
   */
  getByDateRange(start, end) {
    return this._events.value
      .filter(e => {
        // Simple date range filtering - can be enhanced
        return e.start >= start && e.start <= end;
      })
      .map(e => e.toObject());
  }

  /**
   * Get reactive events ref
   */
  getRef() {
    return computed(() => this._events.value.map(e => e.toObject()));
  }
}

/**
 * Factory function to create events service
 */
export function createEventsService(initialEvents = []) {
  return new EventsService(initialEvents);
}

export default EventsService;
