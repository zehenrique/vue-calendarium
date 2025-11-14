import { describe, it, expect } from 'vitest';
import { parseRRule, serializeRRule, serializeICal, parseICal, expandRecurrence } from '../../src/composables/useCalendarInterop.js';

describe('useCalendarInterop - RRULE', () => {
  it('round-trips RRULE options to string', () => {
    const rrule = 'RRULE:FREQ=WEEKLY;BYDAY=MO,FR;COUNT=3';
    const { rule, options } = parseRRule(rrule);
    expect(rule).toBeTruthy();
    const str = serializeRRule(options);
    expect(str).toContain('RRULE:');
    // Should contain key parts
    expect(str).toContain('FREQ=WEEKLY');
    expect(str).toContain('BYDAY=MO,FR');
    expect(str).toContain('COUNT=3');
  });
});

describe('useCalendarInterop - iCalendar', () => {
  it('serializes and parses a simple VEVENT', () => {
    const events = [
      {
        id: 'abc123',
        title: 'Team Sync',
        start: '2025-10-30T09:00:00',
        end: '2025-10-30T10:00:00',
        allDay: false
      }
    ];

    const ics = serializeICal(events, { prodId: '-//Test//EN' });
    expect(ics).toContain('BEGIN:VCALENDAR');
    expect(ics).toContain('BEGIN:VEVENT');
    expect(ics).toContain('SUMMARY:Team Sync');

    const parsed = parseICal(ics);
    expect(parsed.length).toBe(1);
    expect(parsed[0].title).toBe('Team Sync');
    expect(parsed[0].start).toContain('2025-10-30T09:00:00');
    expect(parsed[0].end).toContain('2025-10-30T10:00:00');
  });
});

describe('useCalendarInterop - expandRecurrence', () => {
  it('expands weekly RRULE within a range', () => {
    const base = {
      id: 'evt1',
      title: 'Standup',
      start: '2025-10-06T09:00:00', // Monday
      end: '2025-10-06T09:15:00',
      rrule: 'RRULE:FREQ=WEEKLY;COUNT=3;BYDAY=MO'
    };

    const occurrences = expandRecurrence(
      base,
      '2025-10-01T00:00:00',
      '2025-11-01T00:00:00'
    );
    expect(occurrences.length).toBe(3);
    // Check dates (time may vary due to timezone handling)
    expect(occurrences[0].start).toContain('2025-10-06');
    expect(occurrences[1].start).toContain('2025-10-13');
    expect(occurrences[2].start).toContain('2025-10-20');
  });

  it('supports BYSETPOS nth weekday patterns', () => {
    const base = {
      id: 'evt2',
      title: 'Monthly Planning',
      start: '2025-10-06T10:00:00', // First Monday of Oct 2025
      end: '2025-10-06T11:00:00',
      rrule: 'RRULE:FREQ=MONTHLY;COUNT=2;BYDAY=MO;BYSETPOS=1'
    };

    const occurrences = expandRecurrence(
      base,
      '2025-10-01T00:00:00',
      '2025-12-31T00:00:00'
    );

    expect(occurrences.length).toBe(2);
    // Check dates (time may vary due to timezone handling)
    expect(occurrences[0].start).toContain('2025-10-06');
    expect(occurrences[1].start).toContain('2025-11-03');
  });
});
