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

const standupEvents = (page) => page.evaluate(() =>
  window.calendarApp.eventsService.getAll().filter(event => /Standup/.test(event.title))
);

const standupInView = (page) => page.locator('.week-event').filter({ hasText: 'Standup' });

test.describe('Recurring events', () => {
  test('editing a later occurrence edits the series without moving or duplicating it', async ({ page }) => {
    await loadWeekView(page);
    await page.getByRole('button', { name: 'Next' }).first().click();
    await standupInView(page).first().click();
    await page.getByRole('button', { name: 'Edit' }).click();

    // The dialog shows the series, which starts on 15 January
    await expect(page.locator('[data-testid="event-modal"] .date-input input')).toHaveValue('15/01/2025');

    await page.getByPlaceholder(/Event title/i).fill('Daily Sync');
    await page.getByRole('button', { name: 'Save', exact: true }).click();
    await expect(page.getByTestId('event-modal')).toBeHidden();

    const events = await page.evaluate(() => window.calendarApp.eventsService.getAll().filter(event => /Standup|Daily Sync/.test(event.title)));
    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({ id: SERIES_ID, title: 'Daily Sync', start: '2025-01-15T10:00:00' });
    await expect(page.locator('.week-event').filter({ hasText: 'Daily Sync' })).toHaveCount(1);
  });

  test('deleting one occurrence keeps the rest of the series', async ({ page }) => {
    await loadWeekView(page);
    await page.getByRole('button', { name: 'Next' }).first().click();
    await standupInView(page).first().click();
    await page.getByRole('button', { name: 'Delete' }).click();
    await page.getByRole('radio', { name: 'This event' }).check();
    await page.getByRole('button', { name: 'Yes' }).click();

    await expect(standupInView(page)).toHaveCount(0);
    const [series] = await standupEvents(page);
    expect(series.rrule).toContain('EXDATE:20250122T100000Z');

    // The occurrences before and after are still there
    await page.getByRole('button', { name: 'Previous' }).first().click();
    await expect(standupInView(page)).toHaveCount(1);
    await page.getByRole('button', { name: 'Next' }).first().click();
    await page.getByRole('button', { name: 'Next' }).first().click();
    await expect(standupInView(page)).toHaveCount(1);
  });

  test('deleting one occurrence works when the series id contains hyphens', async ({ page }) => {
    await loadWeekView(page);
    await page.evaluate(() => window.calendarApp.eventsService.add({
      title: 'Hyphen Series',
      start: '2025-01-13T15:00:00',
      end: '2025-01-13T16:00:00',
      calendarId: 'work',
      rrule: 'FREQ=DAILY;COUNT=5'
    }));
    const seriesId = await page.evaluate(() => window.calendarApp.eventsService.getAll().find(event => event.title === 'Hyphen Series').id);
    expect(seriesId).toContain('-');

    const occurrences = page.locator('.week-event').filter({ hasText: 'Hyphen Series' });
    await expect(occurrences).toHaveCount(5);
    await occurrences.nth(2).click();
    await page.getByRole('button', { name: 'Delete' }).click();
    await page.getByRole('radio', { name: 'This event' }).check();
    await page.getByRole('button', { name: 'Yes' }).click();

    await expect(occurrences).toHaveCount(4);
  });

  test('deleting all events removes the series and reports it', async ({ page }) => {
    await loadWeekView(page);
    await page.evaluate(() => {
      window.__deleted = [];
      window.calendarApp.callbacks.onEventDelete = (event) => window.__deleted.push(event.id);
    });
    await standupInView(page).first().click();
    await page.getByRole('button', { name: 'Delete' }).click();
    await page.getByRole('radio', { name: 'All events in the series' }).check();
    await page.getByRole('button', { name: 'Yes' }).click();

    expect(await standupEvents(page)).toHaveLength(0);
    expect(await page.evaluate(() => window.__deleted)).toEqual([SERIES_ID]);
  });

  test('occurrences cannot be dragged', async ({ page }) => {
    await loadWeekView(page);
    const occurrence = standupInView(page).first();
    await expect(occurrence).not.toHaveClass(/draggable/);

    const box = await occurrence.boundingBox();
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.waitForTimeout(600);
    await page.mouse.move(box.x + box.width / 2, box.y + 150, { steps: 5 });
    await page.mouse.up();

    const [series] = await standupEvents(page);
    expect(series.start).toBe('2025-01-15T10:00:00');
  });
});

test.describe('Recurring events in other time zones', () => {
  for (const timezoneId of ['America/New_York', 'Asia/Tokyo']) {
    test.describe(timezoneId, () => {
      test.use({ timezoneId });

      test('occurrences keep their time of day', async ({ page }) => {
        await loadWeekView(page);
        const occurrence = standupInView(page).first();
        await expect(occurrence).toBeVisible();
        await expect(occurrence).toHaveAttribute('aria-label', /10:00 – 10:30/);
      });
    });
  }
});
