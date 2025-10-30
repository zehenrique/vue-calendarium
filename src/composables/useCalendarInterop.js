// Interop utilities for iCalendar (RFC5545) and RRULE handling
// Uses ical.js for ICS parsing/serialization and rrule for recurrence expansion
import { Temporal } from '@js-temporal/polyfill';
import ICAL from 'ical.js';
import { RRule, rrulestr } from 'rrule';

// Internal event shape contract
// {
//   id: string,
//   title: string,
//   start: 'YYYY-MM-DDTHH:mm:SS',
//   end: 'YYYY-MM-DDTHH:mm:SS',
//   color?: string,
//   calendar?: string,
//   allDay?: boolean,
//   rrule?: string // optional full RFC string including DTSTART or plain RRULE line
// }

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
    const rrule = rruleProp ? `RRULE:${rruleProp.getFirstValue().toICALString()}` : undefined;

    // Detect all-day via VALUE=date
    const dtstartProp = vevent.getFirstProperty('dtstart');
    const isAllDay = dtstartProp && dtstartProp.type === 'date';

    return {
      id: uid,
      title,
      start,
      end,
      allDay: Boolean(isAllDay),
      rrule
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

    ev.uid = e.id || cryptoRandomId();
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

    // RRULE (if provided either as full string or just the value)
    if (e.rrule) {
      const value = e.rrule.startsWith('RRULE:') ? e.rrule.substring(6) : e.rrule;
      const recur = ICAL.Recur.fromString(value);
      vevent.addPropertyWithValue('rrule', recur);
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

export function expandRecurrence(event, rangeStart, rangeEnd) {
  // Returns array of occurrence events with adjusted start/end in internal shape
  if (!event.rrule) return [event];

  // Handle full RFC strings (DTSTART, RRULE, EXDATE) or simple RRULE strings
  let rule;
  if (event.rrule.includes('\n') || event.rrule.includes('DTSTART:')) {
    // Full RFC format string - parse directly
    rule = rrulestr(event.rrule);
  } else {
    // Simple RRULE string - add RRULE: prefix if needed and provide dtstart
    const value = event.rrule.startsWith('RRULE:') ? event.rrule : `RRULE:${event.rrule}`;
    rule = rrulestr(value, { dtstart: new Date(event.start) });
  }
  
  // rrule returns JS Date in local TZ
  const after = new Date(rangeStart);
  const before = new Date(rangeEnd);
  const dates = rule.between(after, before, true);

  const baseStart = Temporal.PlainDateTime.from(event.start);
  const baseEnd = Temporal.PlainDateTime.from(event.end || event.start);
  const dur = baseEnd.since(baseStart);

  return dates.map((jsDate, idx) => {
    const t = Temporal.PlainDateTime.from(jsDate.toISOString().slice(0, 19));
    const end = t.add(dur);
    return {
      ...event,
      id: idx === 0 ? event.id : `${event.id}-${idx}`,
      start: t.toString(),
      end: end.toString()
    };
  });
}

function cryptoRandomId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return `evt_${Math.random().toString(36).slice(2, 10)}`;
}
