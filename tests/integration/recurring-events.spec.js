import { test, expect } from '@playwright/test';

const TEST_NOW = '2025-01-15T09:00:00';
// The demo's "Weekly Standup (Recurring)": id '11', Wednesdays 10:00–10:30 from 15 January 2025, six times
const SERIES_ID = '11';

async function loadWeekView(page) {
  await page.addInitScript((testNow) => {
    window.__CALENDAR_TEST_NOW__ = testNow;
  }, TEST_NOW);
  await page.goto('/');
  await expect(page.locator('.vue-calendarium')).toBeVisible();
  await page.getByTestId('view-toggle').click();
  await page.getByRole('option', { name: 'Week' }).click();
  await expect(page.locator('.week-view')).toBeVisible();
}

const nextWeek = (page) => page.getByRole('button', { name: 'Next' }).first().click();
const previousWeek = (page) => page.getByRole('button', { name: 'Previous' }).first().click();
const eventsTitled = (page, title) => page.locator('.week-event').filter({ hasText: title });
const scopeModal = (page) => page.getByTestId('recurrence-scope-modal');

const standupEvents = (page) => page.evaluate(() =>
  window.calendarApp.eventsService.getAll().filter(event => /Standup|Moved Sync|Late Sync|Sync All/.test(event.title))
);

// Open the occurrence of the current week, rename it and save; the scope dialog opens
async function renameOccurrence(page, title) {
  await eventsTitled(page, 'Standup').first().click();
  await page.getByRole('button', { name: 'Edit', exact: true }).click();
  await page.getByPlaceholder(/Event title/i).fill(title);
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(scopeModal(page)).toBeVisible();
}

async function chooseScope(page, label) {
  await scopeModal(page).getByRole('radio', { name: label, exact: true }).check();
  await scopeModal(page).getByRole('button', { name: 'OK' }).click();
  await expect(scopeModal(page)).toBeHidden();
}

test.describe('Editing a repeating event', () => {
  test('the dialog opens on the occurrence that was clicked', async ({ page }) => {
    await loadWeekView(page);
    await nextWeek(page);
    await eventsTitled(page, 'Standup').first().click();
    await page.getByRole('button', { name: 'Edit', exact: true }).click();
    await expect(page.locator('[data-testid="event-modal"] .date-input input')).toHaveValue('22/01/2025');
    await expect(page.getByTestId('event-modal').getByRole('heading', { name: 'Edit event' })).toBeVisible();
  });

  test('"This event" changes only that occurrence', async ({ page }) => {
    await loadWeekView(page);
    await nextWeek(page);
    await renameOccurrence(page, 'Moved Sync');
    await chooseScope(page, 'This event');

    await expect(eventsTitled(page, 'Moved Sync')).toHaveCount(1);
    await expect(eventsTitled(page, 'Standup')).toHaveCount(0);
    await previousWeek(page);
    await expect(eventsTitled(page, 'Weekly Standup')).toHaveCount(1);
    await nextWeek(page);
    await nextWeek(page);
    await expect(eventsTitled(page, 'Weekly Standup')).toHaveCount(1);

    const events = await standupEvents(page);
    const exception = events.find(event => event.title === 'Moved Sync');
    // As in Google Calendar, the changed occurrence keeps the occurrence's id and replaces it; the series does not change
    expect(exception).toMatchObject({ id: `${SERIES_ID}@2025-01-22T10:00:00`, recurringEventId: SERIES_ID, originalStart: '2025-01-22T10:00:00', rrule: '' });
    expect(events.find(event => event.id === SERIES_ID).rrule).not.toContain('EXDATE');
  });

  test('"This and following events" changes the occurrence and the ones after it', async ({ page }) => {
    await loadWeekView(page);
    await nextWeek(page);
    await nextWeek(page);
    await renameOccurrence(page, 'Late Sync');
    await chooseScope(page, 'This and following events');

    await expect(eventsTitled(page, 'Late Sync')).toHaveCount(1);
    await nextWeek(page);
    await expect(eventsTitled(page, 'Late Sync')).toHaveCount(1);
    await previousWeek(page);
    await previousWeek(page);
    await expect(eventsTitled(page, 'Weekly Standup')).toHaveCount(1);
    expect(await standupEvents(page)).toHaveLength(2);
  });

  test('"All events" changes the whole series and keeps its start', async ({ page }) => {
    await loadWeekView(page);
    await nextWeek(page);
    await renameOccurrence(page, 'Team Sync All');
    await chooseScope(page, 'All events');

    await expect(eventsTitled(page, 'Team Sync All')).toHaveCount(1);
    await previousWeek(page);
    await expect(eventsTitled(page, 'Team Sync All')).toHaveCount(1);

    const events = await standupEvents(page);
    expect(events.filter(event => event.title === 'Team Sync All')).toEqual([
      expect.objectContaining({ id: SERIES_ID, start: '2025-01-15T10:00:00' })
    ]);
  });

  test('this and following, then this event, then this and following from that event', async ({ page }) => {
    // Three full edits: allow more than the default 15s when the suite runs in parallel
    test.slow();
    await loadWeekView(page);
    // Week of 29 January: "B" from there on
    await nextWeek(page);
    await nextWeek(page);
    await renameOccurrence(page, 'B Sync');
    await chooseScope(page, 'This and following events');

    // Week of 5 February: only this one becomes "E"
    await nextWeek(page);
    await eventsTitled(page, 'B Sync').first().click();
    await page.getByRole('button', { name: 'Edit', exact: true }).click();
    await page.getByPlaceholder(/Event title/i).fill('E Sync');
    await page.getByRole('button', { name: 'Save', exact: true }).click();
    await chooseScope(page, 'This event');
    await expect(eventsTitled(page, 'E Sync')).toHaveCount(1);

    // The same event, this and following: it and the later ones become "C"
    await eventsTitled(page, 'E Sync').first().click();
    await page.getByRole('button', { name: 'Edit', exact: true }).click();
    await page.getByPlaceholder(/Event title/i).fill('C Sync');
    await page.getByRole('button', { name: 'Save', exact: true }).click();
    await chooseScope(page, 'This and following events');

    await expect(eventsTitled(page, 'C Sync')).toHaveCount(1);
    await expect(eventsTitled(page, 'E Sync')).toHaveCount(0);
    await nextWeek(page);
    await expect(eventsTitled(page, 'C Sync')).toHaveCount(1);
    await nextWeek(page);
    await expect(eventsTitled(page, 'C Sync')).toHaveCount(1);
    await previousWeek(page);
    await previousWeek(page);
    await previousWeek(page);
    await expect(eventsTitled(page, 'B Sync')).toHaveCount(1);
  });

  test('cancelling the choice changes nothing', async ({ page }) => {
    await loadWeekView(page);
    await renameOccurrence(page, 'Never saved');
    await scopeModal(page).getByRole('button', { name: 'Cancel' }).click();

    await expect(eventsTitled(page, 'Weekly Standup')).toHaveCount(1);
    expect((await standupEvents(page)).map(event => event.title)).toEqual(['Weekly Standup (Recurring)']);
  });

  test('changing the repeat rule does not offer "This event"', async ({ page }) => {
    await loadWeekView(page);
    await eventsTitled(page, 'Standup').first().click();
    await page.getByRole('button', { name: 'Edit', exact: true }).click();
    await page.getByTestId('repeat-select').click();
    await page.getByTestId('repeat-menu').getByText('Daily', { exact: true }).click();
    await page.getByRole('button', { name: 'Save', exact: true }).click();

    await expect(scopeModal(page)).toBeVisible();
    await expect(scopeModal(page).getByRole('radio')).toHaveCount(2);
    await expect(scopeModal(page).getByRole('radio', { name: 'This event', exact: true })).toHaveCount(0);
  });
});

test.describe('Dragging a repeating event', () => {
  async function dragStandupDownTwoHours(page) {
    const occurrence = eventsTitled(page, 'Standup').first();
    const box = await occurrence.boundingBox();
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.waitForTimeout(600);
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2 + 108, { steps: 10 });
    await page.waitForTimeout(100);
    await page.mouse.up();
  }

  test('asks first, then moves only that occurrence', async ({ page }) => {
    await loadWeekView(page);
    await dragStandupDownTwoHours(page);
    await expect(scopeModal(page)).toBeVisible();
    await chooseScope(page, 'This event');

    const events = await standupEvents(page);
    const moved = events.find(event => event.recurringEventId === SERIES_ID);
    expect(moved).toMatchObject({ start: '2025-01-15T12:00:00', end: '2025-01-15T12:30:00', originalStart: '2025-01-15T10:00:00' });

    await nextWeek(page);
    await expect(eventsTitled(page, 'Standup')).toHaveAttribute('aria-label', /10:00 – 10:30/);
  });

  test('"All events" moves the whole series', async ({ page }) => {
    await loadWeekView(page);
    await dragStandupDownTwoHours(page);
    await chooseScope(page, 'All events');

    const [series] = await standupEvents(page);
    expect(series).toMatchObject({ id: SERIES_ID, start: '2025-01-15T12:00:00', end: '2025-01-15T12:30:00' });
    await nextWeek(page);
    await expect(eventsTitled(page, 'Standup')).toHaveAttribute('aria-label', /12:00 – 12:30/);
  });

  test('a moved occurrence keeps its time when the series changes, and takes the changes', async ({ page }) => {
    test.slow();
    await loadWeekView(page);
    await dragStandupDownTwoHours(page);
    await chooseScope(page, 'This event');

    // Rename the series from next week's occurrence
    await nextWeek(page);
    await renameOccurrence(page, 'Sync All');
    await chooseScope(page, 'All events');

    await previousWeek(page);
    await expect(eventsTitled(page, 'Sync All')).toHaveAttribute('aria-label', /12:00 – 12:30/);
    const moved = (await standupEvents(page)).find(event => event.recurringEventId === SERIES_ID);
    expect(moved).toMatchObject({ title: 'Sync All', start: '2025-01-15T12:00:00', originalStart: '2025-01-15T10:00:00' });
  });

  test('cancelling leaves the event where it was', async ({ page }) => {
    await loadWeekView(page);
    await dragStandupDownTwoHours(page);
    await scopeModal(page).getByRole('button', { name: 'Cancel' }).click();

    const [series] = await standupEvents(page);
    expect(series.start).toBe('2025-01-15T10:00:00');
    await expect(eventsTitled(page, 'Standup')).toHaveAttribute('aria-label', /10:00 – 10:30/);
  });
});

test.describe('Deleting a repeating event', () => {
  async function deleteOccurrence(page, occurrence, label) {
    await occurrence.click();
    await page.getByRole('button', { name: 'Delete', exact: true }).click();
    await page.getByRole('radio', { name: label, exact: true }).check();
    await page.getByRole('button', { name: 'Yes', exact: true }).click();
  }

  test('"This event" keeps the rest of the series', async ({ page }) => {
    await loadWeekView(page);
    await nextWeek(page);
    await deleteOccurrence(page, eventsTitled(page, 'Standup').first(), 'This event');

    await expect(eventsTitled(page, 'Standup')).toHaveCount(0);
    await previousWeek(page);
    await expect(eventsTitled(page, 'Standup')).toHaveCount(1);
    await nextWeek(page);
    await nextWeek(page);
    await expect(eventsTitled(page, 'Standup')).toHaveCount(1);
  });

  test('"This and following events" ends the series', async ({ page }) => {
    await loadWeekView(page);
    await nextWeek(page);
    await deleteOccurrence(page, eventsTitled(page, 'Standup').first(), 'This and following events');

    await expect(eventsTitled(page, 'Standup')).toHaveCount(0);
    await nextWeek(page);
    await expect(eventsTitled(page, 'Standup')).toHaveCount(0);
    await previousWeek(page);
    await previousWeek(page);
    await expect(eventsTitled(page, 'Standup')).toHaveCount(1);
  });

  test('"All events" removes the series and reports it', async ({ page }) => {
    await loadWeekView(page);
    await page.evaluate(() => {
      window.__deleted = [];
      window.calendarApp.callbacks.onEventDelete = (event) => window.__deleted.push(event.id);
    });
    await deleteOccurrence(page, eventsTitled(page, 'Standup').first(), 'All events');

    expect(await standupEvents(page)).toHaveLength(0);
    expect(await page.evaluate(() => window.__deleted)).toEqual([SERIES_ID]);
  });

  test('works when the series id contains hyphens', async ({ page }) => {
    await loadWeekView(page);
    await page.evaluate(() => window.calendarApp.eventsService.add({
      title: 'Hyphen Series',
      start: '2025-01-13T15:00:00',
      end: '2025-01-13T16:00:00',
      calendarId: 'work',
      rrule: 'FREQ=DAILY;COUNT=5'
    }));
    const occurrences = eventsTitled(page, 'Hyphen Series');
    await expect(occurrences).toHaveCount(5);
    await deleteOccurrence(page, occurrences.nth(2), 'This event');
    await expect(occurrences).toHaveCount(4);
  });
});

test.describe('Recurring events in other time zones', () => {
  for (const timezoneId of ['America/New_York', 'Asia/Tokyo']) {
    test.describe(timezoneId, () => {
      test.use({ timezoneId });

      test('occurrences keep their time of day', async ({ page }) => {
        await loadWeekView(page);
        await expect(eventsTitled(page, 'Standup').first()).toHaveAttribute('aria-label', /10:00 – 10:30/);
      });
    });
  }
});
