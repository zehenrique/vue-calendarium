import { ref, computed } from 'vue';
import { CalendarEvent } from '../core/CalendarEvent.js';

/**
 * Events Service - Manages calendar events
 */
export class EventsService {
  /**
   * @param {object[]} initialEvents
   * @param {object} [options]
   * @param {(calendarId: string) => boolean} [options.calendarExists] - Used to reject events whose calendar does not exist
   */
  constructor(initialEvents = [], { calendarExists } = {}) {
    this._calendarExists = calendarExists;
    this._events = ref(initialEvents.map(e => CalendarEvent.from(e)).filter(e => this._isValid(e)));
  }

  /**
   * Every event must belong to an existing calendar. Rejected events are reported in the console.
   * @param {CalendarEvent} event
   * @returns {boolean}
   */
  _isValid(event) {
    let problem = null;
    if (!event.calendarId) {
      problem = 'it has no calendarId';
    } else if (this._calendarExists && !this._calendarExists(event.calendarId)) {
      problem = `its calendarId "${event.calendarId}" does not match any calendar`;
    }
    if (problem) {
      console.error(`[vue-calendarium] Event "${event.title}" (${event.id}) was rejected: ${problem}.`);
    }
    return !problem;
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
    if (!this._isValid(event)) return null;
    this._events.value.push(event);
    return event.toObject();
  }

  /**
   * Update an existing event
   */
  update(eventData) {
    const index = this._events.value.findIndex(e => e.id === eventData.id);
    if (index !== -1) {
      const updated = this._events.value[index].clone().update(eventData);
      if (!this._isValid(updated)) return null;
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
    this._events.value = events.map(e => CalendarEvent.from(e)).filter(e => this._isValid(e));
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
export function createEventsService(initialEvents = [], options = {}) {
  return new EventsService(initialEvents, options);
}

export default EventsService;
