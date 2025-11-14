import { ref, computed } from 'vue';
import { Calendar } from '../core/Calendar.js';

/**
 * Calendars Service - Manages calendar categories
 */
export class CalendarsService {
  constructor(initialCalendars = []) {
    this._calendars = ref(initialCalendars.map(c => Calendar.from(c)));
  }

  /**
   * Get all calendars
   */
  getAll() {
    return this._calendars.value.map(c => c.toObject());
  }

  /**
   * Get calendar by ID
   */
  get(id) {
    const calendar = this._calendars.value.find(c => c.id === id);
    return calendar ? calendar.toObject() : null;
  }

  /**
   * Add a new calendar
   */
  add(calendarData) {
    const calendar = Calendar.from(calendarData);
    this._calendars.value.push(calendar);
    return calendar.toObject();
  }

  /**
   * Update an existing calendar
   */
  update(calendarData) {
    const index = this._calendars.value.findIndex(c => c.id === calendarData.id);
    if (index !== -1) {
      this._calendars.value[index].update(calendarData);
      return this._calendars.value[index].toObject();
    }
    return null;
  }

  /**
   * Remove a calendar by ID
   */
  remove(id) {
    const index = this._calendars.value.findIndex(c => c.id === id);
    if (index !== -1) {
      const removed = this._calendars.value.splice(index, 1)[0];
      return removed.toObject();
    }
    return null;
  }

  /**
   * Set all calendars (replaces existing)
   */
  set(calendars) {
    this._calendars.value = calendars.map(c => Calendar.from(c));
  }

  /**
   * Get visible calendars
   */
  getVisible() {
    return this._calendars.value
      .filter(c => c.visible)
      .map(c => c.toObject());
  }

  /**
   * Toggle calendar visibility
   */
  toggleVisibility(id) {
    const calendar = this._calendars.value.find(c => c.id === id);
    if (calendar) {
      calendar.toggleVisibility();
      return calendar.toObject();
    }
    return null;
  }

  /**
   * Get reactive calendars ref
   */
  getRef() {
    return computed(() => this._calendars.value.map(c => c.toObject()));
  }
}

/**
 * Factory function to create calendars service
 */
export function createCalendarsService(initialCalendars = []) {
  return new CalendarsService(initialCalendars);
}

export default CalendarsService;
