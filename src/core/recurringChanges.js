// Changing or deleting one instance of a repeating event, with Google Calendar's three
// choices: only this event, this and the following events, or all events of the series.
//
// The model is Google Calendar's (and iCalendar's, RFC 5545):
// - A series is one stored event with a rule (`rrule`). Its occurrences are not stored.
// - A changed occurrence is an exception: a stored event with `recurringEventId` (the
//   series' id) and `originalStart` (the start the occurrence has in the series, which
//   never changes when the exception moves). It replaces that occurrence, like an iCalendar
//   VEVENT with RECURRENCE-ID. Its id is the occurrence's id, '<series id>@<original start>'.
// - A deleted occurrence is an exception date (EXDATE) of the series.
// - Changing the series ("all events", or "this and following events", which ends the
//   series and starts a new one) copies the fields that changed to its exceptions, which
//   keep everything else of their own, including a time they were moved to.
//
// The functions return a plan of events to update, add and remove, and change nothing
// themselves, so the caller decides how to store them and which callbacks to call.
import { Temporal } from '@js-temporal/polyfill';
import { generateEventId } from './CalendarEvent.js';
import {
  addExceptionDate,
  continueRuleFrom,
  endRuleBefore,
  getOccurrenceId,
  hasOccurrenceAt,
  isSameRule,
  keepExceptionDates,
  moveRule,
  shiftExceptionDates
} from './recurrence.js';

/** @typedef {'this'|'following'|'all'} RecurrenceScope */
/** @typedef {{ update: object[], add: object[], remove: object[] }} ChangePlan */

// The fields an edit can change, besides start, end and the rule
const EDITABLE_FIELDS = ['title', 'allDay', 'calendarId', 'color', 'description', 'location', 'custom'];

const toDateTime = (value) => Temporal.PlainDateTime.from(value);
const isOnOrAfter = (a, b) => Temporal.PlainDateTime.compare(toDateTime(a), toDateTime(b)) >= 0;
const isSameTime = (a, b) => Temporal.PlainDateTime.compare(toDateTime(a), toDateTime(b)) === 0;
const isSameValue = (a, b) => JSON.stringify(a ?? null) === JSON.stringify(b ?? null);
const endOf = (event) => event.end ?? event.start;

function originalStartOf(instance) {
  return instance.originalStart ?? instance.start;
}

// The fields this edit changes: those that differ from the instance the user started from
function changedFields(instance, changes) {
  return Object.fromEntries(EDITABLE_FIELDS
    .filter(key => key in changes && !isSameValue(changes[key], instance[key]))
    .map(key => [key, changes[key]]));
}

/**
 * Whether an edit changes how the series repeats. Then "this event" is not offered.
 * @param {object} series
 * @param {object} changes - The edited event, with `rrule`
 * @param {object} [instance] - The occurrence or exception being changed
 */
export function changesRule(series, changes, instance = null) {
  if (!('rrule' in changes)) return false;
  // An exception has no rule of its own, so keeping its empty rule changes nothing
  if (instance && !instance.rrule && !changes.rrule) return false;
  return !isSameRule(changes.rrule, series.rrule);
}

/**
 * Plan an edit (from the edit dialog or a drag and drop) of one instance of a series.
 * @param {object} params
 * @param {object} params.series - The stored repeating event
 * @param {object[]} [params.exceptions] - Stored exceptions of the series
 * @param {object} params.instance - The occurrence or exception being changed
 * @param {object} params.changes - The edited event: `start`, `end`, optionally `rrule`, and the other fields
 * @param {RecurrenceScope} params.scope
 * @returns {ChangePlan}
 */
export function planRecurringEdit({ series, exceptions = [], instance, changes, scope }) {
  const plan = { update: [], add: [], remove: [] };
  const originalStart = originalStartOf(instance);
  const start = toDateTime(changes.start);
  const end = toDateTime(changes.end ?? changes.start);
  const isException = exceptions.some(exception => exception.id === instance.id);

  if (scope === 'this') {
    const single = {
      ...changedFields(instance, changes),
      start: start.toString(),
      end: end.toString(),
      rrule: '',
      recurringEventId: series.id,
      originalStart
    };
    if (isException) {
      plan.update.push({ ...instance, ...single });
    } else {
      plan.add.push({ ...series, ...single, id: getOccurrenceId(series.id, originalStart) });
    }
    return plan;
  }

  const fields = changedFields(instance, changes);
  const ruleChanged = changesRule(series, changes, instance);
  // When the edit changes the time, every event of the series takes the new time: the series
  // moves as far as the instance's slot moved. Otherwise nothing moves.
  const timeChanged = !isSameTime(instance.start, start) || !isSameTime(endOf(instance), end);
  const shift = timeChanged ? toDateTime(originalStart).until(start) : new Temporal.Duration();
  const duration = timeChanged ? start.until(end) : toDateTime(series.start).until(toDateTime(endOf(series)));
  const movedStart = toDateTime(originalStart).add(shift);
  const nextRule = (rule) => (ruleChanged
    ? shiftExceptionDates(keepExceptionDates(changes.rrule, rule), shift)
    : moveRule(rule, originalStart, movedStart));

  // The series' changes, applied to one of its exceptions. The instance being edited also
  // takes the edited time; the others keep a time they were moved to. An exception that no
  // longer differs from its occurrence, or whose occurrence the new rule no longer has, goes.
  const changeException = (exception, changedSeries) => {
    const exceptionOriginalStart = toDateTime(exception.originalStart).add(shift);
    const seriesDuration = toDateTime(changedSeries.start).until(toDateTime(changedSeries.end));
    let time;
    if (exception.id === instance.id) {
      time = { start: start.toString(), end: end.toString() };
    } else if (isSameTime(exception.start, exception.originalStart)) {
      const ownDuration = toDateTime(exception.start).until(toDateTime(endOf(exception)));
      time = { start: exceptionOriginalStart.toString(), end: exceptionOriginalStart.add(timeChanged ? duration : ownDuration).toString() };
    } else {
      time = { start: exception.start, end: exception.end };
    }
    const changed = { ...exception, ...fields, ...time, recurringEventId: changedSeries.id, originalStart: exceptionOriginalStart.toString() };

    const isOrdinaryOccurrence = isSameTime(changed.start, exceptionOriginalStart)
      && isSameTime(endOf(changed), exceptionOriginalStart.add(seriesDuration))
      && EDITABLE_FIELDS.every(key => isSameValue(changed[key], changedSeries[key]));
    if (isOrdinaryOccurrence || (ruleChanged && !hasOccurrenceAt(changedSeries, exceptionOriginalStart))) {
      plan.remove.push(exception);
    } else {
      plan.update.push(changed);
    }
  };

  const isFirstOccurrence = !isOnOrAfter(originalStart, series.start) || isSameTime(originalStart, series.start);
  if (scope === 'all' || isFirstOccurrence) {
    const seriesStart = toDateTime(series.start).add(shift);
    const changedSeries = {
      ...series,
      ...fields,
      start: seriesStart.toString(),
      end: seriesStart.add(duration).toString(),
      rrule: series.rrule ? nextRule(series.rrule) : ''
    };
    plan.update.push(changedSeries);
    exceptions.forEach(exception => changeException(exception, changedSeries));
    return plan;
  }

  // This and following: end the series before the instance, and start a new one there
  const newSeries = {
    ...series,
    ...fields,
    id: generateEventId(),
    start: movedStart.toString(),
    end: movedStart.add(duration).toString(),
    rrule: nextRule(continueRuleFrom(series, originalStart)),
    recurringEventId: null,
    originalStart: null
  };
  plan.update.push({ ...series, rrule: endRuleBefore(series, originalStart) });
  plan.add.push(newSeries);

  // Exceptions from this instance on now belong to the new series
  exceptions
    .filter(exception => isOnOrAfter(exception.originalStart, originalStart))
    .forEach(exception => changeException(exception, newSeries));

  return plan;
}

/**
 * Plan deleting one instance of a series.
 * @param {object} params
 * @param {object} params.series - The stored repeating event
 * @param {object[]} [params.exceptions] - Stored exceptions of the series
 * @param {object} params.instance - The occurrence or exception being deleted
 * @param {RecurrenceScope} params.scope
 * @returns {ChangePlan}
 */
export function planRecurringDelete({ series, exceptions = [], instance, scope }) {
  const plan = { update: [], add: [], remove: [] };
  const originalStart = originalStartOf(instance);

  if (scope === 'this') {
    // The series leaves the occurrence out; a changed occurrence is removed as well
    plan.update.push({ ...series, rrule: addExceptionDate(series, originalStart) });
    if (exceptions.some(exception => exception.id === instance.id)) {
      plan.remove.push(instance);
    }
    return plan;
  }

  if (scope === 'all' || !isOnOrAfter(originalStart, series.start) || isSameTime(originalStart, series.start)) {
    plan.remove.push(series, ...exceptions);
    return plan;
  }

  // This and following
  plan.update.push({ ...series, rrule: endRuleBefore(series, originalStart) });
  plan.remove.push(...exceptions.filter(exception => isOnOrAfter(exception.originalStart, originalStart)));
  return plan;
}
