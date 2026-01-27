import { DEFAULT_COLOR } from '../config/colors.js';

/**
 * Calendar class represents a calendar category
 */
export class CalendarModel {
  constructor(data = {}) {
    this.id = data.id || this._generateId();
    this.name = data.name || 'Untitled Calendar';
    this.color = data.color || DEFAULT_COLOR;
    this.visible = data.visible !== undefined ? data.visible : true;
    this.description = data.description || '';
    this.custom = data.custom || {};
  }

  /**
   * Generate a unique ID for the calendar
   */
  _generateId() {
    return `calendar-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Convert calendar to plain object
   */
  toObject() {
    return {
      id: this.id,
      name: this.name,
      color: this.color,
      visible: this.visible,
      description: this.description,
      custom: { ...this.custom }
    };
  }

  /**
   * Create calendar from plain object
   */
  static from(data) {
    return new CalendarModel(data);
  }

  /**
   * Clone the calendar
   */
  clone() {
    return new CalendarModel(this.toObject());
  }

  /**
   * Update calendar properties
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
   * Toggle calendar visibility
   */
  toggleVisibility() {
    this.visible = !this.visible;
    return this;
  }
}

export default CalendarModel;
