import { test, expect } from '@playwright/test';

const TEST_NOW = '2025-01-15T09:00:00';

async function loadCalendar(page, query = '') {
  await page.addInitScript((testNow) => {
    window.__CALENDAR_TEST_NOW__ = testNow;
  }, TEST_NOW);
  await page.goto(`/${query}`);
  await expect(page.locator('.vue-calendarium')).toBeVisible();
}

test.describe('Mobile navigation buttons', () => {
  test('are hidden while swiping is on', async ({ page }) => {
    await loadCalendar(page);
    await expect(page.getByTestId('mobile-previous')).toHaveCount(0);
    await expect(page.getByTestId('mobile-next')).toHaveCount(0);
  });

  test('appear when swiping is off, and change the period', async ({ page }) => {
    await loadCalendar(page, '?swipe=off');
    const title = page.locator('.calendar-title');
    await expect(title).toHaveText('January 2025');

    await page.getByTestId('mobile-next').click();
    await expect(title).toHaveText('February 2025');
    await page.getByTestId('mobile-previous').click();
    await page.getByTestId('mobile-previous').click();
    await expect(title).toHaveText('December 2024');
  });
});
