import { afterEach, describe, expect, it } from 'vitest';
import { parseICal, serializeICal } from '../../src/core/ical.js';
import { expandRecurrence } from '../../src/core/recurrence.js';

// A file as Google Calendar exports it: a weekly series in Lisbon time with a deleted
// occurrence, a changed occurrence, a UTC event and an all-day event over two days
const GOOGLE_EXPORT = [
  'BEGIN:VCALENDAR',
  'VERSION:2.0',
  'PRODID:-//Google Inc//Google Calendar 70.9054//EN',
  'BEGIN:VEVENT',
  'UID:standup@google.com',
  'SUMMARY:Standup',
  'DESCRIPTION:Daily notes',
  'LOCATION:Room 2',
  'DTSTART;TZID=Europe/Lisbon:20250115T100000',
  'DTEND;TZID=Europe/Lisbon:20250115T103000',
  'RRULE:FREQ=WEEKLY;COUNT=6',
  'EXDATE;TZID=Europe/Lisbon:20250205T100000',
  'END:VEVENT',
  'BEGIN:VEVENT',
  'UID:standup@google.com',
  'RECURRENCE-ID;TZID=Europe/Lisbon:20250122T100000',
  'SUMMARY:Standup (moved)',
  'DTSTART;TZID=Europe/Lisbon:20250123T150000',
  'DTEND;TZID=Europe/Lisbon:20250123T153000',
  'END:VEVENT',
  'BEGIN:VEVENT',
  'UID:call@google.com',
  'SUMMARY:Call',
  'DTSTART:20250116T120000Z',
  'DTEND:20250116T130000Z',
  'END:VEVENT',
  'BEGIN:VEVENT',
  'UID:trip@google.com',
  'SUMMARY:Trip',
  'DTSTART;VALUE=DATE:20250120',
  'DTEND;VALUE=DATE:20250122',
  'END:VEVENT',
  'END:VCALENDAR'
].join('\r\n');

describe('parseICal', () => {
  const originalTimeZone = process.env.TZ;
  afterEach(() => {
    if (originalTimeZone === undefined) delete process.env.TZ;
    else process.env.TZ = originalTimeZone;
  });

  it('reads a Google Calendar export into the calendar\'s events', () => {
    const [series, moved, , trip] = parseICal(GOOGLE_EXPORT, { calendarId: 'work' });

    expect(series).toMatchObject({
      id: 'standup@google.com',
      title: 'Standup',
      description: 'Daily notes',
      location: 'Room 2',
      calendarId: 'work',
      // A time zone keeps its wall-clock time, as the calendar does for zoned dates
      start: '2025-01-15T10:00:00',
      end: '2025-01-15T10:30:00',
      rrule: 'RRULE:FREQ=WEEKLY;COUNT=6\nEXDATE:20250205T100000Z'
    });
    expect(moved).toMatchObject({
      id: 'standup@google.com@2025-01-22T10:00:00',
      recurringEventId: 'standup@google.com',
      originalStart: '2025-01-22T10:00:00',
      start: '2025-01-23T15:00:00'
    });
    // All day: the end is the last day; DTEND was the day after it
    expect(trip).toMatchObject({ allDay: true, start: '2025-01-20T00:00:00', end: '2025-01-21T00:00:00' });

    // The series with its changed occurrence: four occurrences left, one replaced
    const occurrences = expandRecurrence(series, '2025-01-01T00:00:00', '2025-03-01T00:00:00', { exceptions: [moved] });
    expect(occurrences.map(o => o.start)).toEqual(['2025-01-15T10:00:00', '2025-01-29T10:00:00', '2025-02-12T10:00:00', '2025-02-19T10:00:00']);
  });

  it('shows UTC times in the viewer\'s time zone', () => {
    process.env.TZ = 'America/New_York';
    const call = parseICal(GOOGLE_EXPORT).find(event => event.title === 'Call');
    expect(call).toMatchObject({ start: '2025-01-16T07:00:00', end: '2025-01-16T08:00:00' });
  });
});

describe('serializeICal', () => {
  it('writes all-day events as dates, with DTEND after the last day', () => {
    const ics = serializeICal([{ id: 'trip', title: 'Trip', start: '2025-01-20', end: '2025-01-21', allDay: true, rrule: 'FREQ=YEARLY\nEXDATE:20260120T000000Z' }]);
    expect(ics).toContain('DTSTART;VALUE=DATE:20250120');
    expect(ics).toContain('DTEND;VALUE=DATE:20250122');
    expect(ics).toContain('EXDATE;VALUE=DATE:20260120');
  });

  it('round-trips a Google Calendar export', () => {
    const events = parseICal(GOOGLE_EXPORT, { calendarId: 'work' });
    const again = parseICal(serializeICal(events, { tzid: 'Europe/Lisbon' }), { calendarId: 'work' });
    expect(again.map(({ id, start, end, rrule, allDay, recurringEventId, originalStart, description, location }) => ({ id, start, end, rrule, allDay, recurringEventId, originalStart, description, location })))
      .toEqual(events.map(({ id, start, end, rrule, allDay, recurringEventId, originalStart, description, location }) => ({ id, start, end, rrule, allDay, recurringEventId, originalStart, description, location })));
  });
});
