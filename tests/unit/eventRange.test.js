import { afterEach, describe, expect, it, vi } from 'vitest';
import { Temporal } from '@js-temporal/polyfill';
import { eventOverlapsDays, summarizeEventsForDate } from '../../src/composables/useCalendarEventHelpers.js';
import { formatHour, isEventPast } from '../../src/composables/useCalendarUtils.js';
import { getEventLabel } from '../../src/composables/useTimeGridKeyboard.js';
import { expandRecurrence } from '../../src/core/recurrence.js';

const timed = (id, start, end) => ({ id, title: id, start, end, allDay: false });
const t = (key) => key;

describe('eventOverlapsDays', () => {
  it('includes an event on the first and on the last day of the range', () => {
    const first = timed('first', '2026-03-02T09:00:00', '2026-03-02T10:00:00');
    const last = timed('last', '2026-03-08T23:00:00', '2026-03-08T23:30:00');

    expect(eventOverlapsDays(first, '2026-03-02', '2026-03-08')).toBe(true);
    expect(eventOverlapsDays(last, '2026-03-02', '2026-03-08')).toBe(true);
  });

  it('leaves out events just before and just after the range', () => {
    const before = timed('before', '2026-03-01T23:00:00', '2026-03-01T23:30:00');
    const after = timed('after', '2026-03-09T00:00:00', '2026-03-09T01:00:00');

    expect(eventOverlapsDays(before, '2026-03-02', '2026-03-08')).toBe(false);
    expect(eventOverlapsDays(after, '2026-03-02', '2026-03-08')).toBe(false);
  });

  it('keeps a multi-day event that crosses the range', () => {
    const intoRange = timed('into', '2026-02-27T09:00:00', '2026-03-02T09:00:00');
    const outOfRange = timed('out', '2026-03-08T09:00:00', '2026-03-11T09:00:00');
    const overRange = timed('over', '2026-02-01T09:00:00', '2026-04-01T09:00:00');

    expect(eventOverlapsDays(intoRange, '2026-03-02', '2026-03-08')).toBe(true);
    expect(eventOverlapsDays(outOfRange, '2026-03-02', '2026-03-08')).toBe(true);
    expect(eventOverlapsDays(overRange, '2026-03-02', '2026-03-08')).toBe(true);
  });

  it('works with date-only values and with no end', () => {
    expect(eventOverlapsDays({ start: '2026-03-02', end: '2026-03-02' }, '2026-03-02', '2026-03-02')).toBe(true);
    expect(eventOverlapsDays({ start: '2026-03-02' }, '2026-03-02', '2026-03-02')).toBe(true);
    expect(eventOverlapsDays({ start: '2026-03-01' }, '2026-03-02', '2026-03-02')).toBe(false);
  });
});

describe('summarizeEventsForDate', () => {
  it('returns the events of that day, in start order', () => {
    const events = [
      timed('late', '2026-03-02T15:00:00', '2026-03-02T16:00:00'),
      timed('other-day', '2026-03-03T09:00:00', '2026-03-03T10:00:00'),
      timed('early', '2026-03-02T09:00:00', '2026-03-02T10:00:00')
    ];

    const summary = summarizeEventsForDate(Temporal.PlainDate.from('2026-03-02'), events);

    expect(summary.timedEvents.map(event => event.id)).toEqual(['early', 'late']);
  });

  it('accepts the date as a string', () => {
    const events = [timed('one', '2026-03-02T09:00:00', '2026-03-02T10:00:00')];

    expect(summarizeEventsForDate('2026-03-02', events).timedEvents).toHaveLength(1);
  });

  it('shows a multi-day event on each of its days', () => {
    const events = [timed('trip', '2026-03-02T09:00:00', '2026-03-04T09:00:00')];

    for (const day of ['2026-03-02', '2026-03-03', '2026-03-04']) {
      expect(summarizeEventsForDate(day, events).allEvents).toHaveLength(1);
    }
    expect(summarizeEventsForDate('2026-03-05', events).allEvents).toHaveLength(0);
  });

  it('separates all-day events, including date-only ones', () => {
    const events = [
      { id: 'holiday', title: 'holiday', start: '2026-03-02', end: '2026-03-02', allDay: true },
      timed('meeting', '2026-03-02T09:00:00', '2026-03-02T10:00:00')
    ];

    const summary = summarizeEventsForDate('2026-03-02', events);

    expect(summary.allDayEvents.map(event => event.id)).toEqual(['holiday']);
    expect(summary.timedEvents.map(event => event.id)).toEqual(['meeting']);
  });

  it('places the occurrences of a repeating event on their days', () => {
    const series = { ...timed('series', '2026-03-02T09:00:00', '2026-03-02T10:00:00'), rrule: 'FREQ=DAILY;COUNT=3' };

    const occurrences = expandRecurrence(series, '2026-03-02T00:00:00', '2026-03-08T23:59:59');

    expect(occurrences).toHaveLength(3);
    expect(summarizeEventsForDate('2026-03-03', occurrences).timedEvents).toHaveLength(1);
    expect(summarizeEventsForDate('2026-03-05', occurrences).timedEvents).toHaveLength(0);
  });
});

describe('isEventPast', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('compares the end of the event with the current time', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 2, 2, 12, 0, 0));

    expect(isEventPast(timed('ended', '2026-03-02T10:00:00', '2026-03-02T11:59:00'))).toBe(true);
    expect(isEventPast(timed('running', '2026-03-02T11:00:00', '2026-03-02T12:30:00'))).toBe(false);
    expect(isEventPast({ start: '2026-03-02T13:00:00' })).toBe(false);
  });
});

describe('time labels', () => {
  it('formats each locale on its own', () => {
    const event = timed('Meeting', '2026-03-02T00:30:00', '2026-03-02T13:05:00');
    const format = (value, locale) => Temporal.PlainDateTime.from(value)
      .toLocaleString(locale, { hour: '2-digit', minute: '2-digit', hour12: false });

    for (const locale of ['en-US', 'pt-PT', 'en-US']) {
      const expected = `Meeting, ${format(event.start, locale)} – ${format(event.end, locale)}`;
      expect(getEventLabel(event, locale, t)).toBe(expected);
    }
  });

  it('gives different times different labels', () => {
    const morning = timed('Meeting', '2026-03-02T09:00:00', '2026-03-02T09:30:00');
    const afternoon = timed('Meeting', '2026-03-02T15:45:00', '2026-03-02T16:00:00');

    expect(getEventLabel(morning, 'pt-PT', t)).toBe('Meeting, 09:00 – 09:30');
    expect(getEventLabel(afternoon, 'pt-PT', t)).toBe('Meeting, 15:45 – 16:00');
  });

  it('keeps the hour labels of each locale apart', () => {
    const format = (hour, locale) => Temporal.PlainTime.from({ hour })
      .toLocaleString(locale, { hour: '2-digit', minute: '2-digit', hour12: false });

    for (const locale of ['pt-PT', 'en-US', 'pt-PT']) {
      expect(formatHour(0, locale)).toBe(format(0, locale));
      expect(formatHour(14, locale)).toBe(format(14, locale));
    }
  });
});
