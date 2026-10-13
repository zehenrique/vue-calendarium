import { afterEach, describe, expect, it } from 'vitest';
import { addExceptionDate, expandRecurrence, getRuleParts, keepExceptionDates } from '../../src/core/recurrence.js';

const weekly = {
  id: 'standup',
  title: 'Standup',
  start: '2025-01-15T10:00:00',
  end: '2025-01-15T10:30:00',
  rrule: 'FREQ=WEEKLY;COUNT=6'
};

const starts = (occurrences) => occurrences.map(occurrence => occurrence.start);

describe('expandRecurrence', () => {
  const originalTimeZone = process.env.TZ;
  afterEach(() => {
    process.env.TZ = originalTimeZone;
  });

  it('returns a non-repeating event unchanged', () => {
    const event = { ...weekly, rrule: '' };
    expect(expandRecurrence(event, '2025-01-01T00:00:00', '2025-12-31T23:59:59')).toEqual([event]);
  });

  it('expands occurrences within the range only', () => {
    const occurrences = expandRecurrence(weekly, '2025-01-20T00:00:00', '2025-02-02T23:59:59');
    expect(starts(occurrences)).toEqual(['2025-01-22T10:00:00', '2025-01-29T10:00:00']);
  });

  it('keeps the time of day and duration', () => {
    const [occurrence] = expandRecurrence(weekly, '2025-01-22T00:00:00', '2025-01-22T23:59:59');
    expect(occurrence.start).toBe('2025-01-22T10:00:00');
    expect(occurrence.end).toBe('2025-01-22T10:30:00');
  });

  it.each(['UTC', 'America/New_York', 'Asia/Tokyo', 'Pacific/Kiritimati'])('shows occurrences at the same wall-clock time in %s', (timeZone) => {
    process.env.TZ = timeZone;
    const occurrences = expandRecurrence(weekly, '2025-01-01T00:00:00', '2025-03-31T23:59:59');
    expect(starts(occurrences)).toEqual([
      '2025-01-15T10:00:00', '2025-01-22T10:00:00', '2025-01-29T10:00:00',
      '2025-02-05T10:00:00', '2025-02-12T10:00:00', '2025-02-19T10:00:00'
    ]);
  });

  it('links every occurrence to its series with a unique id', () => {
    const occurrences = expandRecurrence(weekly, '2025-01-01T00:00:00', '2025-03-31T23:59:59');
    expect(occurrences.every(occurrence => occurrence.recurringEventId === 'standup')).toBe(true);
    expect(new Set(occurrences.map(occurrence => occurrence.id)).size).toBe(occurrences.length);
    expect(occurrences[0].id).toBe('standup@2025-01-15T10:00:00');
  });

  it('works with series ids that contain hyphens', () => {
    const event = { ...weekly, id: '02a5090a-a543-4c47-b48e-c2d5d48994b7' };
    const [occurrence] = expandRecurrence(event, '2025-01-22T00:00:00', '2025-01-22T23:59:59');
    expect(occurrence.recurringEventId).toBe(event.id);
  });

  it('includes the last day of an UNTIL date', () => {
    const event = { ...weekly, rrule: 'FREQ=DAILY;UNTIL=20250117T235959Z' };
    expect(starts(expandRecurrence(event, '2025-01-01T00:00:00', '2025-01-31T23:59:59'))).toEqual([
      '2025-01-15T10:00:00', '2025-01-16T10:00:00', '2025-01-17T10:00:00'
    ]);
  });
});

describe('addExceptionDate', () => {
  it('excludes one occurrence and keeps the others', () => {
    const rrule = addExceptionDate(weekly, '2025-01-22T10:00:00');
    expect(rrule).toBe('RRULE:FREQ=WEEKLY;COUNT=6\nEXDATE:20250122T100000Z');

    const occurrences = expandRecurrence({ ...weekly, rrule }, '2025-01-01T00:00:00', '2025-03-31T23:59:59');
    expect(starts(occurrences)).not.toContain('2025-01-22T10:00:00');
    expect(occurrences).toHaveLength(5);
  });

  it('adds to an existing EXDATE line', () => {
    const once = addExceptionDate(weekly, '2025-01-22T10:00:00');
    const twice = addExceptionDate({ ...weekly, rrule: once }, '2025-02-05T10:00:00');
    expect(twice).toBe('RRULE:FREQ=WEEKLY;COUNT=6\nEXDATE:20250122T100000Z,20250205T100000Z');
  });

  it('still follows the series when its time changes', () => {
    const rrule = addExceptionDate(weekly, '2025-01-22T10:00:00');
    const moved = { ...weekly, start: '2025-01-15T14:00:00', end: '2025-01-15T14:30:00', rrule };
    const occurrences = expandRecurrence(moved, '2025-01-01T00:00:00', '2025-03-31T23:59:59');
    expect(occurrences.every(occurrence => occurrence.start.endsWith('T14:00:00'))).toBe(true);
  });
});

describe('getRuleParts', () => {
  it('reads a plain rule', () => {
    expect(getRuleParts('FREQ=WEEKLY;BYDAY=MO,WE;COUNT=6')).toEqual({ FREQ: 'WEEKLY', BYDAY: 'MO,WE', COUNT: '6' });
  });

  it('reads the RRULE line of a rule with other lines', () => {
    expect(getRuleParts('DTSTART:20250115T100000Z\nRRULE:FREQ=DAILY;INTERVAL=2\nEXDATE:20250117T100000Z')).toEqual({ FREQ: 'DAILY', INTERVAL: '2' });
  });

  it('returns nothing for an empty rule', () => {
    expect(getRuleParts('')).toEqual({});
  });
});

describe('keepExceptionDates', () => {
  it('carries EXDATE lines over to a new rule', () => {
    expect(keepExceptionDates('FREQ=DAILY', 'RRULE:FREQ=WEEKLY\nEXDATE:20250122T100000Z')).toBe('RRULE:FREQ=DAILY\nEXDATE:20250122T100000Z');
  });

  it('leaves a rule without exceptions unchanged', () => {
    expect(keepExceptionDates('FREQ=DAILY', 'FREQ=WEEKLY')).toBe('FREQ=DAILY');
  });

  it('keeps "does not repeat" empty', () => {
    expect(keepExceptionDates('', 'RRULE:FREQ=WEEKLY\nEXDATE:20250122T100000Z')).toBe('');
  });
});
