// Interop utilities for iCalendar (RFC 5545) and RRULE handling. Reading and writing .ics
// files lives in core/ical.js; this module also wraps the rrule library.
import { RRule, rrulestr } from '../core/rruleLib.js';

export { parseICal, serializeICal } from '../core/ical.js';

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
