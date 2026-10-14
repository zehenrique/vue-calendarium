import { test, expect } from '@playwright/test';

const TEST_NOW = '2025-01-15T09:00:00';

// The app's settings that crowd the header most: the view dropdown in the header
test.describe('Mobile day header', () => {
  test('shows the weekday in the calendar\'s language and a title that fits', async ({ page }) => {
    await page.addInitScript((testNow) => {
      window.__CALENDAR_TEST_NOW__ = testNow;
    }, TEST_NOW);
    await page.goto('/');
    await expect(page.locator('.vue-calendarium')).toBeVisible();
    await page.evaluate(() => {
      window.calendarApp.setView('day');
      window.calendarApp.setLocale('pt-PT');
      window.calendarApp.mobileViewSelectorPlacement.value = 'header';
      window.calendarApp.setDate(window.calendarApp.currentDate.value.with({ month: 9, day: 30 }));
    });

    await expect(page.locator('.day-view-weekday')).toHaveText('TER');
    const title = page.locator('.calendar-title');
    await expect(title).toHaveText('set. 2025');
    expect(await title.evaluate(element => element.scrollWidth <= element.clientWidth)).toBe(true);
  });
});
