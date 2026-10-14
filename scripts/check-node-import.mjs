// Checks that the built package can be imported in plain Node, as in server-side rendering:
// the "node" condition of package.json must give code that imports no CSS, and every
// dependency must load. Run after `npm run build:lib` (npm run test:package).
import assert from 'node:assert/strict';

const calendarium = await import('vue-calendarium');

const {
  createCalendar, createViewMonth, expandRecurrence, describeRule, ruleToForm, parseICal, serializeICal, Calendar
} = calendarium;

assert.equal(typeof Calendar, 'object', 'the Calendar component is exported');

const calendarApp = createCalendar({
  views: [createViewMonth()],
  calendars: [{ id: 'work', name: 'Work', color: '#1967D2' }],
  events: [{ id: '1', title: 'Standup', start: '2025-01-15T10:00:00', calendarId: 'work', rrule: 'FREQ=WEEKLY;COUNT=3' }]
});
assert.equal(calendarApp.eventsService.getAll().length, 1);

const [event] = calendarApp.eventsService.getAll();
assert.equal(expandRecurrence(event, '2025-01-01T00:00:00', '2025-12-31T23:59:59').length, 3, 'rrule works');
assert.equal(describeRule('FREQ=WEEKLY;BYDAY=WE', { locale: 'pt-PT' }), 'Semanalmente (quarta-feira)');
assert.equal(ruleToForm('FREQ=DAILY;COUNT=5', '2025-01-15').count, 5);
assert.equal(parseICal(serializeICal([event]))[0].title, 'Standup', 'ical.js works');

console.log(`vue-calendarium imports in Node ${process.version}: ${Object.keys(calendarium).length} exports, OK`);
