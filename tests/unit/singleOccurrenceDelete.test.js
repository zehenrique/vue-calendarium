import { describe, it, expect } from 'vitest';
import { rrulestr } from 'rrule';

describe('Single occurrence deletion', () => {
  it('should correctly add EXDATE for third occurrence', () => {
    // Simulate a weekly recurring event starting Jan 27, 2025
    const baseEvent = {
      id: 'weekly-1',
      title: 'Weekly Meeting',
      start: '2025-01-27T10:00:00',
      end: '2025-01-27T11:00:00',
      rrule: 'FREQ=WEEKLY;COUNT=5'
    };

    // User clicks on third occurrence (Feb 10)
    const thirdOccurrence = {
      id: 'weekly-1-2', // Expanded occurrence ID
      title: 'Weekly Meeting',
      start: '2025-02-10T10:00:00',
      end: '2025-02-10T11:00:00',
      rrule: 'FREQ=WEEKLY;COUNT=5'
    };

    // Simulate what confirmDelete should do
    const dateToExclude = thirdOccurrence.start;
    const excludeDate = new Date(dateToExclude);
    const exdateFormatted = excludeDate.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');

    let rruleString = baseEvent.rrule;
    
    // Add DTSTART and EXDATE
    if (!rruleString.includes('DTSTART:')) {
      const dtstart = new Date(baseEvent.start).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
      rruleString = `DTSTART:${dtstart}\nRRULE:${rruleString.replace(/^RRULE:/, '')}`;
    }
    rruleString += `\nEXDATE:${exdateFormatted}`;

    // Parse and verify
    const rule = rrulestr(rruleString);
    const dates = rule.all();

    // Should have 4 occurrences (5 - 1 excluded)
    expect(dates).toHaveLength(4);

    const dateStrings = dates.map(d => {
      const year = d.getUTCFullYear();
      const month = String(d.getUTCMonth() + 1).padStart(2, '0');
      const day = String(d.getUTCDate()).padStart(2, '0');
      const hour = String(d.getUTCHours()).padStart(2, '0');
      return `${year}-${month}-${day}T${hour}:00`;
    });

    // Verify the dates - third occurrence (Feb 10) should be missing
    expect(dateStrings[0]).toBe('2025-01-27T10:00'); // First
    expect(dateStrings[1]).toBe('2025-02-03T10:00'); // Second
    expect(dateStrings[2]).toBe('2025-02-17T10:00'); // Fourth (third is excluded)
    expect(dateStrings[3]).toBe('2025-02-24T10:00'); // Fifth
  });

  it('should handle timezone correctly when creating EXDATE', () => {
    // Event with time portion
    const baseEvent = {
      id: 'event-1',
      title: 'Daily Standup',
      start: '2025-01-27T14:30:00', // 2:30 PM
      end: '2025-01-27T15:00:00',
      rrule: 'FREQ=DAILY;COUNT=5'
    };

    // Second occurrence
    const secondOccurrence = {
      id: 'event-1-1',
      title: 'Daily Standup',
      start: '2025-01-28T14:30:00',
      end: '2025-01-28T15:00:00',
      rrule: 'FREQ=DAILY;COUNT=5'
    };

    const dateToExclude = secondOccurrence.start;
    const excludeDate = new Date(dateToExclude);
    const exdateFormatted = excludeDate.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');

    let rruleString = baseEvent.rrule;
    
    if (!rruleString.includes('DTSTART:')) {
      const dtstart = new Date(baseEvent.start).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
      rruleString = `DTSTART:${dtstart}\nRRULE:${rruleString}`;
    }
    rruleString += `\nEXDATE:${exdateFormatted}`;

    const rule = rrulestr(rruleString);
    const dates = rule.all();

    // Should have 4 occurrences
    expect(dates).toHaveLength(4);

    // Verify second occurrence is missing
    const dateStrings = dates.map(d => d.toISOString().slice(0, 10));
    expect(dateStrings).not.toContain('2025-01-28');
    expect(dateStrings).toContain('2025-01-27');
    expect(dateStrings).toContain('2025-01-29');
    expect(dateStrings).toContain('2025-01-30');
    expect(dateStrings).toContain('2025-01-31');
  });
});
