import { Temporal } from '@js-temporal/polyfill';
import { DEFAULT_COLOR } from '../config/colors.js';

/**
 * CalendarEvent class represents a single event in the calendar
 */
export class CalendarEvent {
  constructor(data = {}) {
    this.id = data.id || this._generateId();
    this.title = data.title || '';
    this.start = data.start || null;
    this.end = data.end || null;
    this.allDay = data.allDay || false;
    this.calendarId = data.calendarId || data.calendar || 'default';
    this.color = data.color || DEFAULT_COLOR;
    this.rrule = data.rrule || '';
    this.description = data.description || '';
    this.location = data.location || '';
    this.custom = data.custom || {};
    
    // Internal properties
    this._options = data._options || {};
  }

  /**
   * Generate a unique ID for the event
   */
  _generateId() {
    return `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Convert event to plain object
   */
  toObject() {
    return {
      id: this.id,
      title: this.title,
      start: this.start,
      end: this.end,
      allDay: this.allDay,
      calendarId: this.calendarId,
      color: this.color,
      rrule: this.rrule,
      description: this.description,
      location: this.location,
      custom: { ...this.custom },
      _options: { ...this._options }
    };
  }

  /**
   * Create event from plain object
   */
  static from(data) {
    return new CalendarEvent(data);
  }

  /**
   * Clone the event
   */
  clone() {
    return new CalendarEvent(this.toObject());
  }

  /**
   * Update event properties
   */
  update(data) {
    Object.keys(data).forEach(key => {
      if (key === 'custom') {
        this.custom = { ...this.custom, ...data.custom };
      } else if (key !== 'id') {
        this[key] = data[key];
      }
    });
    return this;
  }

  /**
   * Check if event is all-day
   */
  isAllDay() {
    return this.allDay;
  }

  /**
   * Check if event is recurring
   */
  isRecurring() {
    return Boolean(this.rrule);
  }

  /**
   * Get event duration in minutes
   */
  getDurationMinutes() {
    if (!this.start || !this.end) return 0;
    
    try {
      // Handle different Temporal types
      if (typeof this.start === 'string') {
        const startDt = Temporal.PlainDateTime.from(this.start.split('[')[0]);
        const endDt = Temporal.PlainDateTime.from(this.end.split('[')[0]);
        return startDt.until(endDt).total({ unit: 'minutes' });
      }
      // Add more handling as needed
    } catch (e) {
      console.error('Error calculating duration:', e);
    }
    
    return 0;
  }
}

export default CalendarEvent;
