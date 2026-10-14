import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { addExceptionDate, expandRecurrence, getRuleParts } from '../../src/core/recurrence.js';
import { formToRule, ruleToForm } from '../../src/core/recurrenceForm.js';
import { describeRule } from '../../src/core/recurrenceText.js';

// Rules as rrule.js writes them in the browser: DTSTART in UTC, and the end date as local
// midnight in UTC. Thursdays at 10:00 in Lisbon, from 2 July 2026, ending on Thursday 6 August.
const SUMMER = 'DTSTART:20260702T090000Z\nRRULE:FREQ=WEEKLY;BYDAY=TH;UNTIL=20260805T230000Z';
const series = { id: 'therapy', start: '2026-07-02T10:00:00', end: '2026-07-02T11:00:00', rrule: SUMMER };
const starts = (event) => expandRecurrence(event, '2026-01-01T00:00:00', '2026-12-31T23:59:59').map(o => o.start);

describe('rules written by other tools', () => {
  const originalTimeZone = process.env.TZ;
  beforeEach(() => {
    process.env.TZ = 'Europe/Lisbon';
  });
  afterEach(() => {
    if (originalTimeZone === undefined) delete process.env.TZ;
    else process.env.TZ = originalTimeZone;
  });

  it('keep the last day of a summer end date', () => {
    expect(starts(series)).toEqual([
      '2026-07-02T10:00:00', '2026-07-09T10:00:00', '2026-07-16T10:00:00', '2026-07-23T10:00:00',
      '2026-07-30T10:00:00', '2026-08-06T10:00:00'
    ]);
    expect(describeRule(SUMMER, { locale: 'pt-PT' })).toBe('Semanalmente (quinta-feira), até 06/08/2026');
    expect(ruleToForm(SUMMER, '2026-07-02')).toMatchObject({ endType: 'until', untilDate: '2026-08-06', weekdays: ['TH'] });
  });

  it('keep the last day of a winter end date', () => {
    const winter = 'DTSTART:20261105T100000Z\nRRULE:FREQ=WEEKLY;BYDAY=TH;UNTIL=20261126T000000Z';
    expect(starts({ ...series, start: '2026-11-05T10:00:00', rrule: winter }).at(-1)).toBe('2026-11-26T10:00:00');
    expect(ruleToForm(winter, '2026-11-05').untilDate).toBe('2026-11-26');
  });

  it('read UTC times in the DTSTART line\'s own time zone', () => {
    const zoned = 'DTSTART;TZID=Europe/Lisbon:20260702T100000\nRRULE:FREQ=WEEKLY;BYDAY=TH;UNTIL=20260805T230000Z\nEXDATE:20260716T090000Z';
    expect(starts({ ...series, rrule: zoned })).not.toContain('2026-07-16T10:00:00');
    expect(starts({ ...series, rrule: zoned }).at(-1)).toBe('2026-08-06T10:00:00');
  });

  it('are written back as plain wall-clock rules', () => {
    expect(formToRule(ruleToForm(SUMMER, '2026-07-02'), '2026-07-02')).toBe('FREQ=WEEKLY;BYDAY=TH;UNTIL=20260806T235959Z');
    const withDeleted = addExceptionDate(series, '2026-07-16T10:00:00');
    expect(withDeleted).not.toContain('DTSTART');
    expect(withDeleted).toContain('UNTIL=20260806T235959Z');
    expect(withDeleted).toContain('EXDATE:20260716T100000Z');
  });
});

describe('the calendar\'s own rules', () => {
  it('are read as they are', () => {
    expect(getRuleParts('FREQ=DAILY;UNTIL=20260331T120000Z').UNTIL).toBe('20260331T120000Z');
  });

  it('include the whole day of a date-only end', () => {
    expect(getRuleParts('FREQ=DAILY;UNTIL=20260331').UNTIL).toBe('20260331T235959Z');
  });
});
