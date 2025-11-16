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

// Export color configuration
export { 
  CALENDAR_COLORS, 
  DEFAULT_COLOR, 
  isValidColor, 
  getClosestColor, 
  getColorById,
  getColorIdByHex 
} from './config/colors.js';

// Export theme configuration and utilities
export {
  DEFAULT_THEME,
  THEME_PRESETS,
  applyTheme,
  mergeTheme,
  generateThemeCSS
} from './config/theme.js';

// Import for default export
import { createCalendar } from './core/createCalendar.js';
import { createViewDay, createViewWeek, createViewMonth } from './core/views.js';
import { CalendarEvent } from './core/CalendarEvent.js';
import { Calendar } from './core/Calendar.js';
import { createEventsService, EventsService } from './services/EventsService.js';
import { createCalendarsService, CalendarsService } from './services/CalendarsService.js';
import GoogleCalendar from './Calendar.vue';
import { 
  CALENDAR_COLORS, 
  DEFAULT_COLOR, 
  isValidColor, 
  getClosestColor, 
  getColorById,
  getColorIdByHex 
} from './config/colors.js';
import {
  DEFAULT_THEME,
  THEME_PRESETS,
  applyTheme,
  mergeTheme,
  generateThemeCSS
} from './config/theme.js';

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
  GoogleCalendar,
  CALENDAR_COLORS,
  DEFAULT_COLOR,
  isValidColor,
  getClosestColor,
  getColorById,
  getColorIdByHex,
  DEFAULT_THEME,
  THEME_PRESETS,
  applyTheme,
  mergeTheme,
  generateThemeCSS
};
