import { test, expect } from '@playwright/test';

const TEST_NOW = '2025-01-15T09:00:00';

async function loadCalendar(page) {
  await page.addInitScript((testNow) => {
    window.__CALENDAR_TEST_NOW__ = testNow;
  }, TEST_NOW);
  await page.goto('/');
  await expect(page.locator('.vue-calendarium')).toBeVisible();
}

async function switchToView(page, name) {
  await page.getByTestId('view-toggle').click();
  await page.getByRole('option', { name }).click();
}

test.describe('Month view "+N" button', () => {
  test('lists all of the day\'s events and opens one', async ({ page }) => {
    await loadCalendar(page);

    const moreButton = page.getByTestId('more-events').first();
    await expect(moreButton).toHaveText('+3');
    await moreButton.click();

    const menu = page.getByTestId('more-events-menu');
    await expect(menu).toBeVisible();
    await expect(menu).toContainText('Wednesday, January 15');
    await expect(menu.locator('.more-events-item')).toHaveCount(7);
    await expect(page.getByTestId('event-modal')).toBeHidden();

    await menu.locator('.more-events-item', { hasText: 'Training Session' }).click();
    await expect(menu).toBeHidden();
    await expect(page.getByTestId('event-detail-modal')).toContainText('Training Session');
  });
});

test.describe('Event data', () => {
  test('events whose calendar does not exist are shown', async ({ page }) => {
    await loadCalendar(page);
    await page.evaluate(() => {
      window.calendarApp.eventsService.add({ title: 'Unknown calendar', start: '2025-01-16T10:00:00', end: '2025-01-16T11:00:00', calendarId: 'missing' });
      window.calendarApp.eventsService.add({ title: 'No calendar', start: '2025-01-16T12:00:00', end: '2025-01-16T13:00:00' });
    });
    await expect(page.locator('.event', { hasText: 'Unknown calendar' })).toBeVisible();
    await expect(page.locator('.event', { hasText: 'No calendar' })).toBeVisible();
  });

  test('events of a hidden calendar are not shown', async ({ page }) => {
    await loadCalendar(page);
    await expect(page.locator('.event', { hasText: 'Team Building' })).toBeVisible();
    await page.evaluate(() => {
      const event = window.calendarApp.eventsService.getAll().find(e => e.title === 'Team Building');
      window.calendarApp.calendarsService.toggleVisibility(event.calendarId);
    });
    await expect(page.locator('.event', { hasText: 'Team Building' })).toHaveCount(0);
  });

  test.describe('in New York', () => {
    test.use({ timezoneId: 'America/New_York' });

    test('dates with Z or an offset are shown in the viewer\'s time zone', async ({ page }) => {
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await loadCalendar(page);
      await page.evaluate(() => window.calendarApp.eventsService.add({
        id: 'zulu', title: 'Zulu call', start: '2025-01-16T15:00:00Z', end: '2025-01-16T16:00:00Z', calendarId: 'work'
      }));

      await expect(page.locator('.event', { hasText: 'Zulu call' })).toBeVisible();
      expect(await page.evaluate(() => window.calendarApp.eventsService.get('zulu').start)).toBe('2025-01-16T10:00:00');
      expect(errors).toEqual([]);
    });
  });
});

test.describe('Translated labels', () => {
  test('end time durations are in English', async ({ page }) => {
    await loadCalendar(page);
    await switchToView(page, 'Week');
    await page.locator('.hour-slot').nth(10).click();
    await page.locator('.time-select').nth(1).click();

    const options = page.locator('.v-overlay--active .v-list-item-title');
    await expect(options.filter({ hasText: '(1 hr)' })).toHaveCount(1);
    await expect(options.filter({ hasText: '(1.5 hrs)' })).toHaveCount(1);
    await expect(options.filter({ hasText: /hora/ })).toHaveCount(0);
  });

  test('end time durations are in Portuguese', async ({ page }) => {
    await loadCalendar(page);
    await page.evaluate(() => window.calendarApp.setLocale('pt-PT'));
    await page.locator('.hour-slot').first().waitFor({ state: 'detached' }).catch(() => {});
    await page.getByTestId('view-toggle').click();
    await page.getByRole('option', { name: 'Semana' }).click();
    await page.locator('.hour-slot').nth(10).click();
    await page.locator('.time-select').nth(1).click();

    const options = page.locator('.v-overlay--active .v-list-item-title');
    await expect(options.filter({ hasText: '(1 hora)' })).toHaveCount(1);
    await expect(options.filter({ hasText: '(1,5 horas)' })).toHaveCount(1);
  });

  test('the details dialog shows the date in one language', async ({ page }) => {
    await loadCalendar(page);
    await page.locator('.event', { hasText: 'Team Building' }).click();
    await expect(page.getByTestId('event-detail-modal')).toContainText('Monday, January 13 · 15:00 – 17:00');

    await page.keyboard.press('Escape');
    await page.evaluate(() => window.calendarApp.setLocale('pt-PT'));
    await page.locator('.event', { hasText: 'Team Building' }).click();
    await expect(page.getByTestId('event-detail-modal')).toContainText('segunda-feira, 13 de janeiro · 15:00 – 17:00');
  });

  test('repeat descriptions are translated', async ({ page }) => {
    await loadCalendar(page);
    await page.evaluate(() => window.calendarApp.setLocale('pt-PT'));
    await page.locator('.event', { hasText: 'Weekly Standup' }).first().click();
    await expect(page.getByTestId('event-detail-modal')).toContainText('Semanalmente, 6 vezes');
  });
});
