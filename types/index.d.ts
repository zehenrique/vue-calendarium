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

/**
 * Event data you pass in. Dates are wall-clock date-times such as '2026-01-27T10:00:00'.
 * A value with Z or an offset ('2026-01-27T10:00:00Z') is converted to the viewer's time zone.
 */
export interface CalendarEventInput {
  /** Generated when omitted */
  id?: string | number;
  title?: string;
  start: string;
  end?: string | null;
  allDay?: boolean;
  /** Required: the id of an existing calendar. Events without one are rejected. */
  calendarId: string;
  /** Hex color, e.g. '#1967D2' */
  color?: string;
  /** RRULE (RFC 5545), e.g. 'FREQ=WEEKLY;BYDAY=MO,WE' */
  rrule?: string;
  description?: string;
  location?: string;
  custom?: Record<string, unknown>;
  /** On an event that replaces one occurrence of a repeating event: the series' id */
  recurringEventId?: string | number | null;
  /** On an event that replaces one occurrence of a repeating event: that occurrence's start in the series */
  originalStart?: string | null;
}

/** Event data returned by the calendar (all fields filled in). */
export interface CalendarEventData extends Required<Omit<CalendarEventInput, 'end'>> {
  end: string | null;
  _options: Record<string, unknown>;
}

/**
 * An event as the calendar shows it. For an instance of a repeating event, `recurringEventId`
 * is the id of the series and `originalStart` the start the instance has in the series.
 * Instances have the id '<series id>@<original start>', including changed occurrences (stored
 * events that replace one occurrence, created by "This event").
 */
export type CalendarEventOccurrence = CalendarEventData;

/** Which events of a repeating series a change applies to. */
export type RecurrenceScope = 'this' | 'following' | 'all';

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
  event: CalendarEventOccurrence;
  originalEvent: CalendarEventOccurrence;
  dropTarget: { date: Temporal.PlainDate; hour: number };
  /** For a repeating event, the choice the user made */
  scope?: RecurrenceScope;
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
  /** Returns null, and logs a console error, when the event has no valid calendarId */
  add(event: CalendarEventInput): CalendarEventData | null;
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
  onEventClick?: (event: CalendarEventOccurrence) => void;
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
  /** Sidebar on desktop with a small month to move around in and the calendars to show or hide (default: true) */
  enableDesktopSidebar?: boolean;
  /** Whether the desktop sidebar starts open (default: open, unless the calendar is narrower than 1024px) */
  sidebarOpen?: boolean;
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
  enableDesktopSidebar: Ref<boolean>;
  mobileViewSelectorPlacement: Ref<'header' | 'sidebar'>;
  enableSwipeGestures: ComputedRef<boolean>;
  enablePinchToZoom: ComputedRef<boolean>;
  enableCurrentTimeIndicator: ComputedRef<boolean>;
  enableDragAndDrop: ComputedRef<boolean>;
  views: ComputedRef<CalendarView[]>;
  /** Events of the visible calendars */
  visibleEvents: ComputedRef<CalendarEventData[]>;
  ghostEvent: ComputedRef<(CalendarEventInput & { isGhost: true }) | null>;
  /** Whether the desktop sidebar is open */
  sidebarOpen: ComputedRef<boolean>;

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
  /** Opens or closes the desktop sidebar */
  setSidebarOpen(open: boolean): void;
  /** Opens the desktop sidebar if it is closed, and closes it if it is open */
  toggleSidebar(): void;

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

/**
 * The repeat link and menu of the calendar's event dialog ("Does not repeat", "Weekly on
 * Wednesday", ..., "Custom..."), for an app's own Vuetify event dialog. v-model is the rule.
 */
export const RepeatSelect: DefineComponent<{
  /** The rule (RRULE), '' when the event does not repeat */
  modelValue?: string;
  /** The event's start date, 'YYYY-MM-DD' */
  startDate?: string;
  /** A class for the link, instead of its own style */
  linkClass?: string;
  'onUpdate:modelValue'?: (rrule: string) => void;
}>;

/** The "Custom recurrence" dialog (a bottom sheet on mobile). v-model opens it; `save` gives the rule. */
export const RecurrencePickerModal: DefineComponent<{
  modelValue: boolean;
  /** The rule to start from, '' for none */
  rrule?: string;
  /** The event's start date, 'YYYY-MM-DD' */
  startDate?: string;
  'onUpdate:modelValue'?: (open: boolean) => void;
  onSave?: (rrule: string) => void;
}>;

/** The sidebar's small month: choosing a day emits `select` with it. Monday first, keyboard navigable. */
export const MiniMonth: DefineComponent<{
  /** The date shown as selected; the month follows it */
  selectedDate: Temporal.PlainDate;
  /** Today, highlighted */
  today: Temporal.PlainDate;
  locale?: CalendarLocale;
  onSelect?: (date: Temporal.PlainDate) => void;
}>;

/** The calendars with a checkbox each, to show or hide their events. */
export const CalendarVisibilityList: DefineComponent<{
  calendars: CalendarData[];
  /** Ids of the calendars whose events are shown */
  visibleCalendars: string[];
  'onUpdate:visibleCalendars'?: (calendarIds: string[]) => void;
}>;

/** Read the events of an iCalendar (.ics) file. Give the calendar they belong to: events need one. */
export function parseICal(icsText: string, options?: { calendarId?: string }): CalendarEventInput[];
/** Write events to an iCalendar (.ics) file; repeating events as Google Calendar exports them (RRULE, EXDATE, RECURRENCE-ID). */
export function serializeICal(events: CalendarEventInput[], options?: { prodId?: string; tzid?: string }): string;
/**
 * A date from an API as the calendar's wall-clock date-time ('2026-03-02T09:00:00'): a time with
 * Z or an offset is converted to the viewer's time zone, a zoned string keeps its own time.
 */
export function toPlainDateTimeString<T extends string | object | null | undefined>(value: T): T extends string | object ? string : T;
/** The colours the calendar gives an event: its colour as background, and white text (black, lighter, when past). */
export function getEventColorStyle(hexColor?: string, isPast?: boolean): { backgroundColor: string; color: string; opacity: number };

/** "This event / This and following events / All events". v-model opens it; `confirm` gives the choice. */
export const RecurrenceScopeModal: DefineComponent<{
  modelValue: boolean;
  /** Offer "This event" (not when the change is to how the series repeats) */
  allowThisEvent?: boolean;
  'onUpdate:modelValue'?: (open: boolean) => void;
  onConfirm?: (scope: RecurrenceScope) => void;
  onCancel?: () => void;
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

// ---------------------------------------------------------------------------
// Repeating events: plain functions for apps with their own UI
// ---------------------------------------------------------------------------

/** A date-time 'YYYY-MM-DDTHH:mm:ss' or a Temporal.PlainDateTime */
type DateTimeLike = string | Temporal.PlainDateTime;
/** A date 'YYYY-MM-DD' or a Temporal.PlainDate */
type DateLike = string | Temporal.PlainDate;
/** vue-i18n's translate function, or one from createTranslator() */
export type Translate = (key: string, values?: Record<string, unknown> | number) => string;

/** Stored events to add, change and remove, from planRecurringEdit and planRecurringDelete */
export interface RecurrenceChangePlan {
  update: CalendarEventData[];
  add: CalendarEventData[];
  remove: CalendarEventData[];
}

/** The occurrences of a repeating event between two wall-clock times; changed occurrences (exceptions) replace theirs */
export function expandRecurrence(event: CalendarEventInput, rangeStart: string, rangeEnd: string, options?: { exceptions?: CalendarEventInput[] }): CalendarEventOccurrence[];
/** The id of an occurrence: '<series id>@<original start>' */
export function getOccurrenceId(seriesId: string | number, originalStart: DateTimeLike): string;
/** The parts of a rule's RRULE line, e.g. { FREQ: 'WEEKLY', COUNT: '6' } */
export function getRuleParts(rrule: string): Record<string, string>;
/** The deleted occurrences (EXDATE) of a rule */
export function getExceptionDates(rrule: string): Temporal.PlainDateTime[];
/** The series' rule with one occurrence deleted (EXDATE) */
export function addExceptionDate(event: CalendarEventInput, occurrenceStart: DateTimeLike): string;
/** A new rule with the deleted occurrences of the previous one */
export function keepExceptionDates(newRule: string, previousRule: string): string;
/** Whether two rules repeat the same way (deleted occurrences are not compared) */
export function isSameRule(a: string, b: string): boolean;
/** Whether a series has an occurrence at a time, deleted ones included */
export function hasOccurrenceAt(event: CalendarEventInput, dateTime: DateTimeLike): boolean;
/** The series' rule ending just before an occurrence (UNTIL) */
export function endRuleBefore(event: CalendarEventInput, dateTime: DateTimeLike): string;
/** The rule for the rest of a series from an occurrence on (COUNT reduced) */
export function continueRuleFrom(event: CalendarEventInput, dateTime: DateTimeLike): string;
/** A rule moved with its series to another time or day (BYDAY, BYMONTHDAY, UNTIL and EXDATE move with it) */
export function moveRule(rrule: string, from: DateTimeLike, to: DateTimeLike): string;

/** Plan an edit of one occurrence: "this event", "this and following events" or "all events" */
export function planRecurringEdit(params: {
  series: CalendarEventData;
  exceptions?: CalendarEventData[];
  instance: CalendarEventOccurrence;
  changes: Partial<CalendarEventData> & { start: string; end?: string };
  scope: RecurrenceScope;
}): RecurrenceChangePlan;
/** Plan deleting one occurrence, it and the following ones, or the whole series */
export function planRecurringDelete(params: {
  series: CalendarEventData;
  exceptions?: CalendarEventData[];
  instance: CalendarEventOccurrence;
  scope: RecurrenceScope;
}): RecurrenceChangePlan;
/** Whether an edit changes how the series repeats ("this event" is then not offered) */
export function changesRule(series: CalendarEventData, changes: Partial<CalendarEventData>, instance?: CalendarEventOccurrence | null): boolean;

/** RRULE weekday codes, Monday first */
export const WEEKDAYS: readonly ['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'];
/** The fields of the custom repeat dialog */
export interface RecurrenceForm {
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
  interval: number;
  /** RRULE weekday codes, e.g. ['MO', 'WE'] */
  weekdays: string[];
  monthlyType: 'bymonthday' | 'byweekday';
  endType: 'never' | 'until' | 'count';
  /** 'YYYY-MM-DD', included */
  untilDate: string;
  count: number;
}
/** A rule as the dialog's fields; with no rule, weekly on the event's weekday */
export function ruleToForm(rrule: string, startDate: DateLike): RecurrenceForm;
/** The dialog's fields as a rule, e.g. 'FREQ=WEEKLY;INTERVAL=2;BYDAY=MO,WE;COUNT=5' */
export function formToRule(form: RecurrenceForm, startDate: DateLike): string;

/** A translate function for the calendar's messages, for apps without vue-i18n */
export function createTranslator(locale?: CalendarLocale): Translate;
/** A rule in words, e.g. "Weekly on Monday, Wednesday" or "Semanalmente (quarta-feira)" */
export function describeRule(rrule: string, options?: { locale?: CalendarLocale; t?: Translate }): string;
/** The repeat menu's usual rules for an event's date: daily, weekly on its weekday, monthly, yearly, every weekday */
export function getRepeatOptions(startDate: DateLike, options?: { locale?: CalendarLocale; t?: Translate }): { value: string; title: string }[];
/** "Monthly on day 15" and "Monthly on the third Wednesday" for an event's date */
export function getMonthlyOptions(startDate: DateLike, options?: { locale?: CalendarLocale; t?: Translate }): { value: 'bymonthday' | 'byweekday'; title: string }[];

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
  RepeatSelect: typeof RepeatSelect;
  RecurrencePickerModal: typeof RecurrencePickerModal;
  RecurrenceScopeModal: typeof RecurrenceScopeModal;
  MiniMonth: typeof MiniMonth;
  CalendarVisibilityList: typeof CalendarVisibilityList;
  parseICal: typeof parseICal;
  serializeICal: typeof serializeICal;
  toPlainDateTimeString: typeof toPlainDateTimeString;
  getEventColorStyle: typeof getEventColorStyle;
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
  expandRecurrence: typeof expandRecurrence;
  getOccurrenceId: typeof getOccurrenceId;
  getRuleParts: typeof getRuleParts;
  getExceptionDates: typeof getExceptionDates;
  addExceptionDate: typeof addExceptionDate;
  keepExceptionDates: typeof keepExceptionDates;
  isSameRule: typeof isSameRule;
  hasOccurrenceAt: typeof hasOccurrenceAt;
  endRuleBefore: typeof endRuleBefore;
  continueRuleFrom: typeof continueRuleFrom;
  moveRule: typeof moveRule;
  planRecurringEdit: typeof planRecurringEdit;
  planRecurringDelete: typeof planRecurringDelete;
  changesRule: typeof changesRule;
  WEEKDAYS: typeof WEEKDAYS;
  ruleToForm: typeof ruleToForm;
  formToRule: typeof formToRule;
  createTranslator: typeof createTranslator;
  describeRule: typeof describeRule;
  getRepeatOptions: typeof getRepeatOptions;
  getMonthlyOptions: typeof getMonthlyOptions;
};

export default VueCalendarium;
