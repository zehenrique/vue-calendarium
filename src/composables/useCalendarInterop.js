// Interop utilities for iCalendar (RFC5545) and RRULE handling
// Uses ical.js for ICS parsing/serialization and rrule for recurrence expansion
import ICAL from 'ical.js';
import { RRule, rrulestr } from 'rrule';
import { getExceptionDates, getRuleParts } from '../core/recurrence.js';

// Internal event shape contract
// {
//   id: string,
//   title: string,
//   start: 'YYYY-MM-DDTHH:mm:SS',
//   end: 'YYYY-MM-DDTHH:mm:SS',
//   color?: string,
//   calendar?: string,
//   allDay?: boolean,
//   rrule?: string, // optional full RFC string including DTSTART or plain RRULE line
//   recurringEventId?: string, // for a changed occurrence: the id (UID) of its series
//   originalStart?: string // for a changed occurrence: its start in the series (RECURRENCE-ID)
// }
//
// Repeating events follow RFC 5545, as Google Calendar exports them: a series is a VEVENT
// with RRULE and EXDATE (deleted occurrences), and each changed occurrence is a VEVENT with
// the series' UID and a RECURRENCE-ID holding the occurrence's original start.

function icTimeToPlainString(icTime) {
  // Returns local date-time string without timezone suffix, with seconds
  // 1) Convert to JS Date then to ISO, then strip Z and milliseconds
  const js = icTime.toJSDate();
  const iso = new Date(js.getTime() - js.getTimezoneOffset() * 60000)
    .toISOString()
    .replace('Z', '');
  // Keep seconds, drop milliseconds if present
  return iso.split('.') [0];
}

function plainStringToICALTime(dtString) {
  // dtString: 'YYYY-MM-DDTHH:mm:SS'
  // Use ICAL.Time.fromString which expects 'YYYY-MM-DDTHH:MM:SS' (local)
  return ICAL.Time.fromString(dtString);
}

export function parseICal(icsString) {
  const vcal = new ICAL.Component(ICAL.parse(icsString));
  const vevents = vcal.getAllSubcomponents('vevent');

  return vevents.map((vevent) => {
    const ev = new ICAL.Event(vevent);
    const uid = ev.uid || cryptoRandomId();
    const title = ev.summary || '';
    const start = icTimeToPlainString(ev.startDate);
    const end = ev.endDate ? icTimeToPlainString(ev.endDate) : start;
    const rruleProp = vevent.getFirstProperty('rrule');
    const exdates = vevent.getAllProperties('exdate').flatMap(prop => prop.getValues()).map(icTimeToRuleDate);
    const ruleLines = [`RRULE:${rruleProp?.getFirstValue()}`, ...(exdates.length ? [`EXDATE:${exdates.join(',')}`] : [])];
    const rrule = rruleProp ? ruleLines.join('\n') : undefined;
    const recurrenceId = vevent.getFirstPropertyValue('recurrence-id');
    const originalStart = recurrenceId ? icTimeToPlainString(recurrenceId) : null;

    // Detect all-day via VALUE=date
    const dtstartProp = vevent.getFirstProperty('dtstart');
    const isAllDay = dtstartProp && dtstartProp.type === 'date';

    return {
      // A changed occurrence shares its series' UID, so it takes the occurrence's id
      id: originalStart ? `${uid}@${originalStart}` : uid,
      title,
      start,
      end,
      allDay: Boolean(isAllDay),
      rrule,
      ...(originalStart ? { recurringEventId: uid, originalStart } : {})
    };
  });
}

export function serializeICal(events, { prodId = '-//Calendar Component//EN', tzid } = {}) {
  const vcal = new ICAL.Component(['vcalendar', [], []]);
  vcal.updatePropertyWithValue('prodid', prodId);
  vcal.updatePropertyWithValue('version', '2.0');

  events.forEach((e) => {
    const vevent = new ICAL.Component('vevent');
    const ev = new ICAL.Event(vevent);

    // A changed occurrence is written under its series' UID, with the occurrence's original start
    ev.uid = e.recurringEventId ?? (e.id || cryptoRandomId());
    if (e.recurringEventId && e.originalStart) {
      addTimeProperty(vevent, 'recurrence-id', e.originalStart, tzid);
    }
    ev.summary = e.title || '';

    // DTSTART / DTEND
    const dtStart = plainStringToICALTime(e.start);
    const dtEnd = plainStringToICALTime(e.end || e.start);
    if (tzid) {
      // Assign TZID via property params when provided
      vevent.addPropertyWithValue('dtstart', dtStart);
      vevent.getFirstProperty('dtstart').setParameter('tzid', tzid);
      vevent.addPropertyWithValue('dtend', dtEnd);
      vevent.getFirstProperty('dtend').setParameter('tzid', tzid);
    } else {
      ev.startDate = dtStart;
      ev.endDate = dtEnd;
    }

    // RRULE, and EXDATE for deleted occurrences, in the same time zone as DTSTART
    if (e.rrule) {
      const parts = Object.entries(getRuleParts(e.rrule)).map(([key, value]) => `${key}=${value}`).join(';');
      vevent.addPropertyWithValue('rrule', ICAL.Recur.fromString(parts));
      getExceptionDates(e.rrule).forEach(date => addTimeProperty(vevent, 'exdate', date.toString(), tzid));
    }

    vcal.addSubcomponent(vevent);
  });

  return vcal.toString();
}

export function parseRRule(rruleString) {
  // Accept either a full RFC string including DTSTART or a line starting with RRULE:
  const str = rruleString.trim();
  if (str.startsWith('RRULE:') || str.startsWith('DTSTART') || str.includes('\nRRULE:')) {
    const ruleOrSet = rrulestr(str, { forceset: false });
    if (ruleOrSet instanceof RRule) {
      return { rule: ruleOrSet, options: ruleOrSet.origOptions };
    }
    // rrulestr may return RRuleSet; for simplicity return first rule options
    const rules = ruleOrSet.rrules();
    return { rule: rules[0], options: rules[0]?.origOptions };
  }
  // Plain value, add RRULE: prefix
  const rule = rrulestr(`RRULE:${str}`);
  return { rule, options: rule.origOptions };
}

export function serializeRRule(input) {
  if (!input) return '';
  if (input instanceof RRule) return input.toString();
  // assume options object
  const rule = new RRule(input);
  return rule.toString();
}

// Occurrence expansion lives with the rest of the recurrence logic
export { expandRecurrence } from '../core/recurrence.js';

// EXDATE values are stored as wall-clock times with a Z suffix ('20250122T100000Z')
function icTimeToRuleDate(icTime) {
  return `${icTimeToPlainString(icTime).replace(/[-:]/g, '')}Z`;
}

function addTimeProperty(vevent, name, dtString, tzid) {
  const property = vevent.addPropertyWithValue(name, plainStringToICALTime(dtString));
  if (tzid) property.setParameter('tzid', tzid);
}

function cryptoRandomId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return `evt_${Math.random().toString(36).slice(2, 10)}`;
}
