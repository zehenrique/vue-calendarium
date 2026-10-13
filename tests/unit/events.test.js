import { afterEach, describe, expect, it, vi } from 'vitest';
import { Temporal } from '@js-temporal/polyfill';
import { toPlainDateTimeString } from '../../src/core/dateTime.js';
import { CalendarEvent } from '../../src/core/CalendarEvent.js';
import { createCalendar } from '../../src/core/createCalendar.js';
import { createViewMonth } from '../../src/core/views.js';

describe('toPlainDateTimeString', () => {
  const originalTimeZone = process.env.TZ;
  afterEach(() => {
    process.env.TZ = originalTimeZone;
  });

  it('keeps wall-clock date-times and dates as they are', () => {
    expect(toPlainDateTimeString('2026-03-02T09:00:00')).toBe('2026-03-02T09:00:00');
    expect(toPlainDateTimeString('2026-03-02')).toBe('2026-03-02');
  });

  it('leaves empty values alone', () => {
    expect(toPlainDateTimeString(undefined)).toBeUndefined();
    expect(toPlainDateTimeString(null)).toBeNull();
    expect(toPlainDateTimeString('')).toBe('');
  });

  it('converts an exact time (Z or offset) to the viewer\'s time zone', () => {
    process.env.TZ = 'America/New_York';
    expect(toPlainDateTimeString('2026-03-02T15:00:00Z')).toBe('2026-03-02T10:00:00');
    expect(toPlainDateTimeString('2026-03-02T15:00:00+01:00')).toBe('2026-03-02T09:00:00');
  });

  it('uses the wall-clock time of a zoned value', () => {
    expect(toPlainDateTimeString('2026-03-02T09:00:00+00:00[Europe/Lisbon]')).toBe('2026-03-02T09:00:00');
    expect(toPlainDateTimeString(Temporal.PlainDateTime.from('2026-03-02T09:30:00'))).toBe('2026-03-02T09:30:00');
  });
});

describe('CalendarEvent dates', () => {
  it('normalizes start and end on creation and update', () => {
    process.env.TZ = 'UTC';
    const event = new CalendarEvent({ title: 'Call', start: '2026-03-02T09:00:00Z', end: '2026-03-02T10:00:00Z' });
    expect(event.start).toBe('2026-03-02T09:00:00');
    event.update({ end: '2026-03-02T11:00:00Z' });
    expect(event.end).toBe('2026-03-02T11:00:00');
  });
});

describe('calendarId', () => {
  const event = (id, calendarId) => ({ id, title: id, start: '2026-03-02T09:00:00', end: '2026-03-02T10:00:00', calendarId });
  const calendars = [{ id: 'work', name: 'Work', color: '#1967D2' }, { id: 'private', name: 'Private', color: '#0B8043', visible: false }];

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('rejects events without a calendarId or with an unknown one, and reports them', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    const calendarApp = createCalendar({
      views: [createViewMonth()],
      calendars,
      events: [event('a', 'work'), event('b', 'private'), event('c', 'missing'), event('d', undefined)]
    });

    expect(calendarApp.eventsService.getAll().map(e => e.id)).toEqual(['a', 'b']);
    expect(error).toHaveBeenCalledTimes(2);
    expect(error.mock.calls[0][0]).toContain('"c" (c) was rejected: its calendarId "missing" does not match any calendar');
    expect(error.mock.calls[1][0]).toContain('"d" (d) was rejected: it has no calendarId');
  });

  it('rejects them when added or updated later', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const calendarApp = createCalendar({ views: [createViewMonth()], calendars, events: [event('a', 'work')] });

    expect(calendarApp.eventsService.add(event('x', 'missing'))).toBeNull();
    expect(calendarApp.eventsService.add(event('y', 'work'))).not.toBeNull();
    expect(calendarApp.eventsService.update({ id: 'a', calendarId: 'missing' })).toBeNull();
    expect(calendarApp.eventsService.get('a').calendarId).toBe('work');
  });

  it('shows only the events of visible calendars', () => {
    const calendarApp = createCalendar({ views: [createViewMonth()], calendars, events: [event('a', 'work'), event('b', 'private')] });
    expect(calendarApp.visibleEvents.value.map(e => e.id)).toEqual(['a']);
  });
});
