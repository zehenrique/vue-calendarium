import { test, expect } from '@playwright/test';

const TEST_NOW = '2025-01-15T09:00:00';
const CURRENT_MONTH_TEXT = 'January 2025';

const getHeaderTitle = page => page.locator('h1.calendar-title');

test.describe('Calendar Views (Desktop)', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(({ testNow }) => {
      window.__CALENDAR_TEST_NOW__ = testNow;
    }, { testNow: TEST_NOW });

    await page.goto('/');
    await expect(page.locator('.vue-calendarium')).toBeVisible({ timeout: 5000 });
    await expect(getHeaderTitle(page)).toHaveText(CURRENT_MONTH_TEXT, { timeout: 3000 });
  });

  test('should display calendar with default month view', async ({ page }) => {
    await expect(page.locator('.calendar-days')).toBeVisible();
    await expect(getHeaderTitle(page)).toHaveText(CURRENT_MONTH_TEXT);
  });

  test('should switch between month, week, and day views', async ({ page }) => {
    const viewToggle = page.getByTestId('view-toggle');

    await expect(page.locator('.calendar-days')).toBeVisible();

    // Click the select to open dropdown, then click Week option
    await viewToggle.click();
    await page.getByRole('option', { name: /Week/i }).click();
    await expect(page.locator('.week-view')).toBeVisible();
    await expect(page.locator('.week-grid')).toBeVisible();

    // Switch to Day view
    await viewToggle.click();
    await page.getByRole('option', { name: /Day/i }).click();
    await expect(page.locator('.day-view')).toBeVisible();
    await expect(page.locator('.day-grid')).toBeVisible();

    // Switch back to Month view
    await viewToggle.click();
    await page.getByRole('option', { name: /Month/i }).click();
    await expect(page.locator('.calendar-days')).toBeVisible();
  });

  test('should navigate between months', async ({ page }) => {
    const header = getHeaderTitle(page);
    const initialMonth = (await header.textContent())?.trim();

    await page.getByRole('button', { name: /Next/i }).click();
    await expect(header).not.toHaveText(initialMonth || '', { timeout: 1000 });

    await page.getByRole('button', { name: /Previous/i }).click();
    await expect(header).toHaveText(initialMonth || '', { timeout: 1000 });
  });

  test('should navigate to today', async ({ page }) => {
    const header = getHeaderTitle(page);

    await page.getByRole('button', { name: /Next/i }).click();
    await page.getByRole('button', { name: /Next/i }).click();

    await page.getByTestId('today-button').click();

    await expect(header).toHaveText(CURRENT_MONTH_TEXT, { timeout: 1000 });
  });
});
