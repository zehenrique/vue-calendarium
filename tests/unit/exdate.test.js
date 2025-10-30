import { describe, it, expect } from 'vitest';
import { rrulestr } from 'rrule';

describe('EXDATE handling', () => {
  it('should exclude dates with EXDATE', () => {
    // Create a weekly recurring event with one date excluded
    const rruleString = `DTSTART:20250127T100000Z
RRULE:FREQ=WEEKLY;COUNT=4
EXDATE:20250203T100000Z`;

    const rule = rrulestr(rruleString);
    const dates = rule.all();

    // Should have 3 occurrences instead of 4 (one excluded)
    expect(dates).toHaveLength(3);

    // Convert dates to ISO strings for easier comparison
    const dateStrings = dates.map(d => d.toISOString());

    // First occurrence
    expect(dateStrings[0]).toBe('2025-01-27T10:00:00.000Z');
    // Second occurrence (2025-02-03) should be excluded
    // Third occurrence
    expect(dateStrings[1]).toBe('2025-02-10T10:00:00.000Z');
    // Fourth occurrence
    expect(dateStrings[2]).toBe('2025-02-17T10:00:00.000Z');
  });

  it('should handle multiple EXDATEs', () => {
    const rruleString = `DTSTART:20250127T100000Z
RRULE:FREQ=WEEKLY;COUNT=5
EXDATE:20250203T100000Z,20250217T100000Z`;

    const rule = rrulestr(rruleString);
    const dates = rule.all();

    // Should have 3 occurrences instead of 5 (two excluded)
    expect(dates).toHaveLength(3);

    const dateStrings = dates.map(d => d.toISOString());
    expect(dateStrings[0]).toBe('2025-01-27T10:00:00.000Z');
    expect(dateStrings[1]).toBe('2025-02-10T10:00:00.000Z');
    expect(dateStrings[2]).toBe('2025-02-24T10:00:00.000Z');
  });

  it('should work with expandRecurrence when EXDATE is present', () => {
    // Import dynamically to avoid module resolution issues in test
    const expandRecurrence = (event, rangeStart, rangeEnd) => {
      if (!event.rrule) return [event];

      // rrulestr handles full RFC strings including DTSTART, RRULE, and EXDATE
      const rule = rrulestr(event.rrule, { dtstart: new Date(event.start) });
      const after = new Date(rangeStart);
      const before = new Date(rangeEnd);
      const dates = rule.between(after, before, true);

      return dates.map((jsDate, idx) => ({
        ...event,
        id: idx === 0 ? event.id : `${event.id}-${idx}`,
        start: jsDate.toISOString(),
      }));
    };

    const event = {
      id: 'test-1',
      title: 'Weekly Meeting',
      start: '2025-01-27T10:00:00.000Z',
      rrule: `DTSTART:20250127T100000Z
RRULE:FREQ=WEEKLY;COUNT=4
EXDATE:20250203T100000Z`,
    };

    const expanded = expandRecurrence(
      event,
      '2025-01-20T00:00:00.000Z',
      '2025-02-28T23:59:59.999Z'
    );

    // Should have 3 occurrences (4 - 1 excluded)
    expect(expanded).toHaveLength(3);
    expect(expanded[0].id).toBe('test-1');
    expect(expanded[1].id).toBe('test-1-1');
    expect(expanded[2].id).toBe('test-1-2');
  });
});
