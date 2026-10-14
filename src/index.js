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
export { CalendarModel } from './core/Calendar.js';
export { createEventsService, EventsService } from './services/EventsService.js';
export { createCalendarsService, CalendarsService } from './services/CalendarsService.js';
export { default as Calendar } from './Calendar.vue';

// The calendar's repeat controls, for apps with their own Vuetify event dialog (enableModals: false)
export { default as RepeatSelect } from './components/RepeatSelect.vue';
export { default as RecurrencePickerModal } from './components/RecurrencePickerModal.vue';
export { default as RecurrenceScopeModal } from './components/RecurrenceScopeModal.vue';

// The sidebar's parts, for apps that build their own sidebar (enableDesktopSidebar: false)
export { default as MiniMonth } from './components/MiniMonth.vue';
export { default as CalendarVisibilityList } from './components/CalendarVisibilityList.vue';

// iCalendar files, dates from APIs and event colours
export { parseICal, serializeICal } from './core/ical.js';
export { toPlainDateTimeString } from './core/dateTime.js';
export { getEventColorStyle } from './composables/useCalendarUtils.js';
export { translations } from './i18n.js';

// Repeating events: rules, occurrence changes, the repeat dialog's fields and rules in words
export * from './recurrence.js';

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

// Import translations
import { translations } from './i18n.js';

// Import for default export
import * as recurrence from './recurrence.js';
import { createCalendar } from './core/createCalendar.js';
import { createViewDay, createViewWeek, createViewMonth } from './core/views.js';
import { CalendarEvent } from './core/CalendarEvent.js';
import { CalendarModel } from './core/Calendar.js';
import { createEventsService, EventsService } from './services/EventsService.js';
import { createCalendarsService, CalendarsService } from './services/CalendarsService.js';
import Calendar from './Calendar.vue';
import RepeatSelect from './components/RepeatSelect.vue';
import RecurrencePickerModal from './components/RecurrencePickerModal.vue';
import RecurrenceScopeModal from './components/RecurrenceScopeModal.vue';
import MiniMonth from './components/MiniMonth.vue';
import CalendarVisibilityList from './components/CalendarVisibilityList.vue';
import { parseICal, serializeICal } from './core/ical.js';
import { toPlainDateTimeString } from './core/dateTime.js';
import { getEventColorStyle } from './composables/useCalendarUtils.js';
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
  CalendarModel,
  createEventsService,
  EventsService,
  createCalendarsService,
  CalendarsService,
  Calendar,
  RepeatSelect,
  RecurrencePickerModal,
  RecurrenceScopeModal,
  MiniMonth,
  CalendarVisibilityList,
  parseICal,
  serializeICal,
  toPlainDateTimeString,
  getEventColorStyle,
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
  generateThemeCSS,
  translations,
  ...recurrence
};
