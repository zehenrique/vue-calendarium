/**
 * VueJS Calendar - Main Export
 *
 * Usage example:
 *
 * import { createCalendar, createViewDay, createViewWeek, createViewMonth } from '@/index'
 *
 * const calendarApp = createCalendar({
 *   views: [createViewDay(), createViewWeek(), createViewMonth()],
 *   defaultView: 'month',
 *   events: [...],
 *   calendars: [...]
 * })
 */

// Re-export everything for named imports
export { createCalendar } from './core/createCalendar.js';
export { createViewDay, createViewWeek, createViewMonth } from './core/views.js';
export { CalendarEvent } from './core/CalendarEvent.js';
export { Calendar } from './core/Calendar.js';
export { createEventsService, EventsService } from './services/EventsService.js';
export { createCalendarsService, CalendarsService } from './services/CalendarsService.js';
export { default as GoogleCalendar } from './Calendar.vue';

// Import for default export
import { createCalendar } from './core/createCalendar.js';
import { createViewDay, createViewWeek, createViewMonth } from './core/views.js';
import { CalendarEvent } from './core/CalendarEvent.js';
import { Calendar } from './core/Calendar.js';
import { createEventsService, EventsService } from './services/EventsService.js';
import { createCalendarsService, CalendarsService } from './services/CalendarsService.js';
import GoogleCalendar from './Calendar.vue';

// Default export with all exports
export default {
  createCalendar,
  createViewDay,
  createViewWeek,
  createViewMonth,
  CalendarEvent,
  Calendar,
  createEventsService,
  EventsService,
  createCalendarsService,
  CalendarsService,
  GoogleCalendar
};
