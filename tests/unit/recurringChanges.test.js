import { describe, expect, it } from 'vitest';
import { expandRecurrence, getExceptionDates, getRuleParts } from '../../src/core/recurrence.js';
import { changesRule, planRecurringDelete, planRecurringEdit } from '../../src/core/recurringChanges.js';

// Wednesdays 10:00–10:30, six times: 15, 22, 29 January, 5, 12, 19 February 2025
const series = {
  id: 'standup',
  title: 'Standup',
  start: '2025-01-15T10:00:00',
  end: '2025-01-15T10:30:00',
  calendarId: 'work',
  rrule: 'FREQ=WEEKLY;COUNT=6'
};

const occurrence = (start) => {
  const [found] = expandRecurrence(series, start, start);
  return found;
};

const YEAR = ['2025-01-01T00:00:00', '2025-12-31T23:59:59'];
const starts = (event, exceptions = []) => expandRecurrence(event, ...YEAR, { exceptions }).map(o => o.start);

// An occurrence changed on its own: renamed and moved from 10:00 to 16:00
const changedFifth = {
  ...series,
  id: 'standup@2025-02-12T10:00:00',
  rrule: '',
  title: 'Planning',
  description: 'Own notes',
  start: '2025-02-12T16:00:00',
  end: '2025-02-12T16:30:00',
  recurringEventId: 'standup',
  originalStart: '2025-02-12T10:00:00'
};

// An occurrence changed on its own without moving
const describedFourth = {
  ...series,
  id: 'standup@2025-02-05T10:00:00',
  rrule: '',
  description: 'Agenda',
  start: '2025-02-05T10:00:00',
  end: '2025-02-05T10:30:00',
  recurringEventId: 'standup',
  originalStart: '2025-02-05T10:00:00'
};

describe('planRecurringEdit', () => {
  const third = occurrence('2025-01-29T10:00:00');

  it('this event: stores the changed occurrence, which replaces it in the series', () => {
    const plan = planRecurringEdit({
      series,
      instance: third,
      changes: { ...third, title: 'Moved standup', start: '2025-01-29T14:00:00', end: '2025-01-29T14:30:00' },
      scope: 'this'
    });

    expect(plan.update).toHaveLength(0);
    expect(plan.add).toEqual([expect.objectContaining({
      id: 'standup@2025-01-29T10:00:00',
      title: 'Moved standup',
      start: '2025-01-29T14:00:00',
      end: '2025-01-29T14:30:00',
      rrule: '',
      recurringEventId: 'standup',
      originalStart: '2025-01-29T10:00:00'
    })]);
    // The series does not change; expanded with the exception, it leaves that occurrence out
    expect(starts(series, plan.add)).not.toContain('2025-01-29T10:00:00');
    expect(starts(series, plan.add)).toHaveLength(5);
  });

  it('this event: updates a changed occurrence in place', () => {
    const plan = planRecurringEdit({ series, exceptions: [changedFifth], instance: changedFifth, changes: { ...changedFifth, title: 'Renamed' }, scope: 'this' });

    expect(plan.add).toHaveLength(0);
    expect(plan.update).toEqual([expect.objectContaining({ id: changedFifth.id, title: 'Renamed', originalStart: '2025-02-12T10:00:00' })]);
  });

  it('all events: applies the changes to the series and moves it to the new time', () => {
    const plan = planRecurringEdit({
      series: { ...series, rrule: 'FREQ=WEEKLY;COUNT=6\nEXDATE:20250205T100000Z' },
      instance: third,
      changes: { ...third, title: 'Afternoon standup', start: '2025-01-29T14:00:00', end: '2025-01-29T15:00:00' },
      scope: 'all'
    });

    expect(plan.add).toHaveLength(0);
    const [updated] = plan.update;
    expect(updated).toMatchObject({ id: 'standup', title: 'Afternoon standup', start: '2025-01-15T14:00:00', end: '2025-01-15T15:00:00' });
    // The deleted occurrence stays deleted at its new time
    expect(getExceptionDates(updated.rrule).map(String)).toEqual(['2025-02-05T14:00:00']);
    expect(starts(updated)).toEqual(['2025-01-15T14:00:00', '2025-01-22T14:00:00', '2025-01-29T14:00:00', '2025-02-12T14:00:00', '2025-02-19T14:00:00']);
  });

  it('all events: moving an occurrence to another day moves the days the series repeats on', () => {
    const weekly = { ...series, rrule: 'FREQ=WEEKLY;BYDAY=WE;UNTIL=20250219T235959Z' };
    const plan = planRecurringEdit({
      series: weekly,
      instance: { ...third, rrule: weekly.rrule },
      changes: { ...third, rrule: weekly.rrule, start: '2025-01-30T10:00:00', end: '2025-01-30T10:30:00' },
      scope: 'all'
    });

    const [updated] = plan.update;
    expect(getRuleParts(updated.rrule)).toMatchObject({ BYDAY: 'TH', UNTIL: '20250220T235959Z' });
    expect(starts(updated)).toEqual(['2025-01-16T10:00:00', '2025-01-23T10:00:00', '2025-01-30T10:00:00', '2025-02-06T10:00:00', '2025-02-13T10:00:00', '2025-02-20T10:00:00']);
  });

  it('all events: copies the changed fields to changed occurrences, which keep their own', () => {
    const plan = planRecurringEdit({
      series,
      exceptions: [changedFifth, describedFourth],
      instance: third,
      changes: { ...third, location: 'Room 2', start: '2025-01-29T11:00:00', end: '2025-01-29T11:30:00' },
      scope: 'all'
    });

    // Its own title, description and time stay; the new location and original start apply
    expect(plan.update.find(event => event.id === changedFifth.id)).toMatchObject({
      title: 'Planning', description: 'Own notes', location: 'Room 2', start: '2025-02-12T16:00:00', originalStart: '2025-02-12T11:00:00'
    });
    // A changed occurrence that was not moved takes the series' new time
    expect(plan.update.find(event => event.id === describedFourth.id)).toMatchObject({
      description: 'Agenda', location: 'Room 2', start: '2025-02-05T11:00:00', end: '2025-02-05T11:30:00', originalStart: '2025-02-05T11:00:00'
    });
  });

  it('all events from a changed occurrence: one that no longer differs becomes an ordinary occurrence again', () => {
    const plan = planRecurringEdit({
      series,
      exceptions: [changedFifth],
      instance: changedFifth,
      changes: { ...changedFifth, title: 'Standup', description: undefined, start: '2025-02-12T10:00:00', end: '2025-02-12T10:30:00' },
      scope: 'all'
    });

    expect(plan.remove).toEqual([changedFifth]);
    expect(plan.update).toEqual([expect.objectContaining({ id: 'standup', title: 'Standup', start: '2025-01-15T10:00:00' })]);
  });

  it('this and following: ends the series before the occurrence and starts a new one', () => {
    const plan = planRecurringEdit({
      series,
      instance: third,
      changes: { ...third, title: 'New standup', start: '2025-01-29T09:00:00', end: '2025-01-29T09:30:00' },
      scope: 'following'
    });

    const [ended] = plan.update;
    expect(starts(ended)).toEqual(['2025-01-15T10:00:00', '2025-01-22T10:00:00']);

    const [rest] = plan.add;
    expect(rest).toMatchObject({ title: 'New standup', start: '2025-01-29T09:00:00', recurringEventId: null });
    expect(getRuleParts(rest.rrule).COUNT).toBe('4');
    expect(starts(rest)).toEqual(['2025-01-29T09:00:00', '2025-02-05T09:00:00', '2025-02-12T09:00:00', '2025-02-19T09:00:00']);
  });

  it('this and following: later changed occurrences move to the new series with the changes', () => {
    const earlier = { ...describedFourth, id: 'standup@2025-01-22T10:00:00', start: '2025-01-22T10:00:00', end: '2025-01-22T10:30:00', originalStart: '2025-01-22T10:00:00' };
    const plan = planRecurringEdit({
      series,
      exceptions: [changedFifth, earlier],
      instance: third,
      changes: { ...third, title: 'Sync', start: '2025-01-29T11:00:00', end: '2025-01-29T11:30:00' },
      scope: 'following'
    });

    const newSeriesId = plan.add[0].id;
    // It keeps its id, its own description and the time it was moved to; the new title applies
    expect(plan.update).toContainEqual(expect.objectContaining({
      id: changedFifth.id, recurringEventId: newSeriesId, title: 'Sync', description: 'Own notes', start: '2025-02-12T16:00:00', originalStart: '2025-02-12T11:00:00'
    }));
    expect(plan.update.find(event => event.id === earlier.id)).toBeUndefined();
  });

  it('this and following from a changed occurrence keeps its other changes', () => {
    const plan = planRecurringEdit({ series, exceptions: [changedFifth], instance: changedFifth, changes: { ...changedFifth, location: 'Room 2' }, scope: 'following' });

    const [rest] = plan.add;
    // The new series starts at the occurrence's slot, at the series' time
    expect(rest).toMatchObject({ title: 'Standup', location: 'Room 2', start: '2025-02-12T10:00:00', end: '2025-02-12T10:30:00' });
    expect(plan.update).toContainEqual(expect.objectContaining({
      id: changedFifth.id, recurringEventId: rest.id, title: 'Planning', location: 'Room 2', start: '2025-02-12T16:00:00'
    }));
  });

  it('this and following from the first occurrence changes the whole series', () => {
    const plan = planRecurringEdit({ series, instance: occurrence('2025-01-15T10:00:00'), changes: { ...series, title: 'Renamed' }, scope: 'following' });
    expect(plan.add).toHaveLength(0);
    expect(plan.update).toEqual([expect.objectContaining({ id: 'standup', title: 'Renamed', start: '2025-01-15T10:00:00' })]);
  });

  it('a new rule replaces the old one', () => {
    const changes = { ...third, rrule: 'FREQ=DAILY;COUNT=3' };
    expect(changesRule(series, changes)).toBe(true);
    expect(changesRule(series, { ...third })).toBe(false);

    const plan = planRecurringEdit({ series, instance: third, changes, scope: 'following' });
    expect(starts(plan.add[0])).toEqual(['2025-01-29T10:00:00', '2025-01-30T10:00:00', '2025-01-31T10:00:00']);
  });

  it('a new rule keeps the changed occurrences it still has and drops the others', () => {
    // Every other week from 15 January still has 12 February
    const biweekly = planRecurringEdit({ series, exceptions: [changedFifth], instance: third, changes: { ...third, rrule: 'FREQ=WEEKLY;INTERVAL=2;COUNT=3' }, scope: 'all' });
    expect(biweekly.update).toContainEqual(expect.objectContaining({ id: changedFifth.id }));

    // Three days from 15 January does not
    const daily = planRecurringEdit({ series, exceptions: [changedFifth], instance: third, changes: { ...third, rrule: 'FREQ=DAILY;COUNT=3' }, scope: 'all' });
    expect(daily.remove).toEqual([changedFifth]);
  });
});

describe('planRecurringDelete', () => {
  const third = occurrence('2025-01-29T10:00:00');

  it('this event: excludes the occurrence', () => {
    const plan = planRecurringDelete({ series, instance: third, scope: 'this' });
    expect(plan.remove).toHaveLength(0);
    expect(starts(plan.update[0])).not.toContain('2025-01-29T10:00:00');
  });

  it('this event: removes a changed occurrence and excludes its slot', () => {
    const plan = planRecurringDelete({ series, exceptions: [changedFifth], instance: changedFifth, scope: 'this' });
    expect(plan.remove).toEqual([changedFifth]);
    expect(starts(plan.update[0])).not.toContain('2025-02-12T10:00:00');
  });

  it('this and following: ends the series and removes later exceptions', () => {
    const plan = planRecurringDelete({ series, exceptions: [changedFifth], instance: third, scope: 'following' });
    expect(starts(plan.update[0])).toEqual(['2025-01-15T10:00:00', '2025-01-22T10:00:00']);
    expect(plan.remove).toEqual([changedFifth]);
  });

  it('all events: removes the series and its exceptions', () => {
    const plan = planRecurringDelete({ series, exceptions: [changedFifth], instance: third, scope: 'all' });
    expect(plan.remove).toEqual([series, changedFifth]);
  });
});

describe('a sequence of changes', () => {
  // A tiny store that applies plans the way the calendar does
  function createStore(events) {
    let stored = events.map(event => ({ recurringEventId: null, originalStart: null, ...event }));
    const exceptionsOf = (seriesId) => stored.filter(event => event.recurringEventId === seriesId);
    const apply = ({ update, add, remove }) => {
      stored = stored.map(event => ({ ...event, ...update.find(changed => changed.id === event.id) }));
      stored = stored.filter(event => !remove.some(removed => removed.id === event.id));
      stored.push(...add.map(event => ({ recurringEventId: null, originalStart: null, ...event })));
    };
    // What the calendar shows: title by start, for all occurrences and single events
    const shown = () => Object.fromEntries(stored
      .flatMap(event => expandRecurrence(event, ...YEAR, { exceptions: stored }))
      .map(event => [event.start, event.title])
      .sort(([a], [b]) => a.localeCompare(b)));
    const instanceAt = (start) => {
      for (const event of stored) {
        const found = expandRecurrence(event, start, start, { exceptions: stored }).find(candidate => candidate.start === start);
        if (found) return found;
      }
      return null;
    };
    const edit = (start, changes, scope) => {
      const instance = instanceAt(start);
      const series = stored.find(event => event.id === instance.recurringEventId);
      apply(planRecurringEdit({ series, exceptions: exceptionsOf(series.id), instance, changes: { ...instance, ...changes }, scope }));
    };
    return { edit, shown, stored: () => stored };
  }

  it('this and following, then this event, then this and following on that event', () => {
    const store = createStore([series]);
    store.edit('2025-01-29T10:00:00', { title: 'B' }, 'following');
    store.edit('2025-02-05T10:00:00', { title: 'E' }, 'this');
    store.edit('2025-02-05T10:00:00', { title: 'C' }, 'following');

    expect(store.shown()).toEqual({
      '2025-01-15T10:00:00': 'Standup',
      '2025-01-22T10:00:00': 'Standup',
      '2025-01-29T10:00:00': 'B',
      '2025-02-05T10:00:00': 'C',
      '2025-02-12T10:00:00': 'C',
      '2025-02-19T10:00:00': 'C'
    });
  });

  it('this event, then all events on that event', () => {
    const store = createStore([series]);
    store.edit('2025-01-29T10:00:00', { title: 'E' }, 'this');
    store.edit('2025-01-29T10:00:00', { title: 'All' }, 'all');

    expect(Object.values(store.shown())).toEqual(['All', 'All', 'All', 'All', 'All', 'All']);
    // The changed occurrence no longer differs from its series, so it is gone
    expect(store.stored()).toHaveLength(1);
  });

  it('a moved occurrence stays moved when the series is renamed, and follows a later split', () => {
    const store = createStore([series]);
    store.edit('2025-02-12T10:00:00', { start: '2025-02-13T15:00:00', end: '2025-02-13T15:30:00' }, 'this');
    store.edit('2025-01-15T10:00:00', { title: 'Daily sync' }, 'all');
    store.edit('2025-01-29T10:00:00', { start: '2025-01-29T09:00:00', end: '2025-01-29T09:30:00' }, 'following');

    expect(store.shown()).toEqual({
      '2025-01-15T10:00:00': 'Daily sync',
      '2025-01-22T10:00:00': 'Daily sync',
      '2025-01-29T09:00:00': 'Daily sync',
      '2025-02-05T09:00:00': 'Daily sync',
      '2025-02-13T15:00:00': 'Daily sync',
      '2025-02-19T09:00:00': 'Daily sync'
    });
  });
});
