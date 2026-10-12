// Type definitions for vue-calendarium.
// Hand-written to match the public API exported from src/index.js; keep them in sync with docs/API.md.

import type { ComputedRef, DefineComponent, Ref } from 'vue';
import type { Temporal } from '@js-temporal/polyfill';

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

export type CalendarViewName = 'day' | 'week' | 'month';
export type CalendarLocale = 'en-US' | 'pt-PT' | (string & {});

export interface CalendarView {
  name: CalendarViewName;
  label: string;
  type: CalendarViewName;
}

/** Event data you pass in. Dates are ISO strings such as '2026-01-27T10:00:00'. */
export interface CalendarEventInput {
  /** Generated when omitted */
  id?: string | number;
  title?: string;
  start: string;
  end?: string | null;
  allDay?: boolean;
  calendarId?: string;
  /** Hex color, e.g. '#1967D2' */
  color?: string;
  /** RRULE (RFC 5545), e.g. 'FREQ=WEEKLY;BYDAY=MO,WE' */
  rrule?: string;
  description?: string;
  location?: string;
  custom?: Record<string, unknown>;
}

/** Event data returned by the calendar (all fields filled in). */
export interface CalendarEventData extends Required<Omit<CalendarEventInput, 'end'>> {
  end: string | null;
  _options: Record<string, unknown>;
}

export interface CalendarInput {
  /** Generated when omitted */
  id?: string;
  name?: string;
  color?: string;
  visible?: boolean;
  description?: string;
  custom?: Record<string, unknown>;
}

export type CalendarData = Required<CalendarInput>;

/** The form state sent with `onEventCreateRequest` when built-in modals are off. */
export interface CalendarEventDraft {
  title: string;
  /** 'YYYY-MM-DD' */
  startDate: string;
  /** 'HH:MM' (24-hour) */
  startTime: string;
  endDate: string;
  endTime: string;
  rrule: string;
  calendarId: string;
  color: string;
  allDay: boolean;
  [key: string]: unknown;
}

export interface CalendarEventCreateRequest {
  draft: CalendarEventDraft;
  context: {
    view: CalendarViewName;
    source?: 'time-slot' | 'all-day' | 'month-day';
    [key: string]: unknown;
  };
}

export interface CalendarEventDrop {
  event: CalendarEventData;
  originalEvent: CalendarEventData;
  dropTarget: unknown;
}

// ---------------------------------------------------------------------------
// Services and models
// ---------------------------------------------------------------------------

export class CalendarEvent {
  constructor(data?: CalendarEventInput);
  id: string | number;
  title: string;
  start: string | null;
  end: string | null;
  allDay: boolean;
  calendarId: string;
  color: string;
  rrule: string;
  description: string;
  location: string;
  custom: Record<string, unknown>;
  static from(data: CalendarEventInput): CalendarEvent;
  toObject(): CalendarEventData;
  clone(): CalendarEvent;
  update(data: Partial<CalendarEventInput>): this;
  isAllDay(): boolean;
  isRecurring(): boolean;
  getDurationMinutes(): number;
}

export class CalendarModel {
  constructor(data?: CalendarInput);
  id: string;
  name: string;
  color: string;
  visible: boolean;
  description: string;
  custom: Record<string, unknown>;
  static from(data: CalendarInput): CalendarModel;
  toObject(): CalendarData;
  clone(): CalendarModel;
  update(data: Partial<CalendarInput>): this;
  toggleVisibility(): this;
}

export class EventsService {
  constructor(initialEvents?: CalendarEventInput[]);
  getAll(): CalendarEventData[];
  get(id: string | number): CalendarEventData | null;
  add(event: CalendarEventInput): CalendarEventData;
  /** Merges the given fields into the event with the same `id` */
  update(event: Partial<CalendarEventInput> & { id: string | number }): CalendarEventData | null;
  remove(id: string | number): CalendarEventData | null;
  /** Replaces all events */
  set(events: CalendarEventInput[]): void;
  getByCalendar(calendarId: string): CalendarEventData[];
  /** Events whose start is between `start` and `end` (ISO strings, compared as text) */
  getByDateRange(start: string, end: string): CalendarEventData[];
  getRef(): ComputedRef<CalendarEventData[]>;
}

export class CalendarsService {
  constructor(initialCalendars?: CalendarInput[]);
  getAll(): CalendarData[];
  get(id: string): CalendarData | null;
  add(calendar: CalendarInput): CalendarData;
  update(calendar: Partial<CalendarInput> & { id: string }): CalendarData | null;
  remove(id: string): CalendarData | null;
  set(calendars: CalendarInput[]): void;
  getVisible(): CalendarData[];
  toggleVisibility(id: string): CalendarData | null;
  getRef(): ComputedRef<CalendarData[]>;
}

export function createEventsService(initialEvents?: CalendarEventInput[]): EventsService;
export function createCalendarsService(initialCalendars?: CalendarInput[]): CalendarsService;

// ---------------------------------------------------------------------------
// Calendar instance
// ---------------------------------------------------------------------------

export interface CalendarCallbacks {
  onEventClick?: (event: CalendarEventData) => void;
  onEventCreate?: (events: CalendarEventData[]) => void;
  onEventUpdate?: (event: CalendarEventData) => void;
  onEventDelete?: (event: CalendarEventData) => void;
  onEventDrop?: (payload: CalendarEventDrop) => void;
  onDateChange?: (date: Temporal.PlainDate) => void;
  onViewChange?: (view: CalendarViewName) => void;
  /** Called instead of opening the built-in form when `enableModals` is false */
  onEventCreateRequest?: (request: CalendarEventCreateRequest) => void;
}

export interface CalendarConfig extends CalendarCallbacks {
  /** At least one view is required */
  views: CalendarView[];
  defaultView?: CalendarViewName;
  events?: CalendarEventInput[];
  calendars?: CalendarInput[];
  locale?: CalendarLocale;
  selectedDate?: Temporal.PlainDate;
  enableModals?: boolean;
  enableMobileSidebar?: boolean;
  mobileViewSelectorPlacement?: 'header' | 'sidebar';
  enableSwipeGestures?: boolean;
  enablePinchToZoom?: boolean;
  enableCurrentTimeIndicator?: boolean;
  enableDragAndDrop?: boolean;
}

export interface CalendarApp {
  eventsService: EventsService;
  calendarsService: CalendarsService;

  currentView: ComputedRef<CalendarViewName>;
  currentDate: ComputedRef<Temporal.PlainDate>;
  locale: ComputedRef<CalendarLocale>;
  enableModals: ComputedRef<boolean>;
  enableMobileSidebar: Ref<boolean>;
  mobileViewSelectorPlacement: Ref<'header' | 'sidebar'>;
  enableSwipeGestures: ComputedRef<boolean>;
  enablePinchToZoom: ComputedRef<boolean>;
  enableCurrentTimeIndicator: ComputedRef<boolean>;
  enableDragAndDrop: ComputedRef<boolean>;
  views: ComputedRef<CalendarView[]>;
  /** Events of the visible calendars */
  visibleEvents: ComputedRef<CalendarEventData[]>;
  ghostEvent: ComputedRef<(CalendarEventInput & { isGhost: true }) | null>;

  setView(view: CalendarViewName): void;
  setDate(date: Temporal.PlainDate): void;
  setLocale(locale: CalendarLocale): void;
  goToToday(): void;
  goToNext(): void;
  goToPrevious(): void;
  /** Shows a semi-transparent preview event, e.g. while your own form is open */
  showGhostEvent(event: CalendarEventInput): void;
  updateGhostEvent(event: Partial<CalendarEventInput>): void;
  hideGhostEvent(): void;

  callbacks: CalendarCallbacks;
  /** Internal state used by the component; not part of the stable API */
  _refs: Record<string, Ref<unknown>>;
}

export function createCalendar(config: CalendarConfig): CalendarApp;
export function createViewDay(): CalendarView;
export function createViewWeek(): CalendarView;
export function createViewMonth(): CalendarView;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/** Map of CSS custom properties, e.g. { '--calendar-primary-color': '#e91e63' } */
export type CalendarTheme = Record<`--calendar-${string}`, string>;

export const Calendar: DefineComponent<{
  calendarApp: CalendarApp;
  theme?: CalendarTheme | null;
}>;

// ---------------------------------------------------------------------------
// Colors, theme and translations
// ---------------------------------------------------------------------------

export interface CalendarColor {
  id: string;
  name: string;
  hex: string;
}

export const CALENDAR_COLORS: CalendarColor[];
export const DEFAULT_COLOR: string;
export function getColorById(colorId: string): string;
export function getColorIdByHex(hex: string): string | null;
export function isValidColor(hex: string): boolean;
export function getClosestColor(hex: string): string;

export const DEFAULT_THEME: CalendarTheme;
export const THEME_PRESETS: {
  default: CalendarTheme;
  dark: CalendarTheme;
  compact: CalendarTheme;
  highContrast: CalendarTheme;
};
export function applyTheme(element: HTMLElement, theme?: CalendarTheme): void;
export function mergeTheme(userTheme?: Partial<CalendarTheme>): CalendarTheme;
export function generateThemeCSS(theme?: CalendarTheme): string;

/** vue-i18n messages for the calendar, keyed by vue-i18n locale ('en', 'pt') */
export const translations: {
  en: Record<string, unknown>;
  pt: Record<string, unknown>;
};

declare const VueCalendarium: {
  createCalendar: typeof createCalendar;
  createViewDay: typeof createViewDay;
  createViewWeek: typeof createViewWeek;
  createViewMonth: typeof createViewMonth;
  CalendarEvent: typeof CalendarEvent;
  CalendarModel: typeof CalendarModel;
  createEventsService: typeof createEventsService;
  EventsService: typeof EventsService;
  createCalendarsService: typeof createCalendarsService;
  CalendarsService: typeof CalendarsService;
  Calendar: typeof Calendar;
  CALENDAR_COLORS: typeof CALENDAR_COLORS;
  DEFAULT_COLOR: typeof DEFAULT_COLOR;
  isValidColor: typeof isValidColor;
  getClosestColor: typeof getClosestColor;
  getColorById: typeof getColorById;
  getColorIdByHex: typeof getColorIdByHex;
  DEFAULT_THEME: typeof DEFAULT_THEME;
  THEME_PRESETS: typeof THEME_PRESETS;
  applyTheme: typeof applyTheme;
  mergeTheme: typeof mergeTheme;
  generateThemeCSS: typeof generateThemeCSS;
  translations: typeof translations;
};

export default VueCalendarium;
