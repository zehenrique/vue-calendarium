import { test, expect } from '@playwright/test';

const TEST_NOW = '2025-01-15T09:00:00';
const SIDEBAR_SELECTOR = '.mobile-sidebar';

async function openSidebar(page) {
  await page.getByTestId('mobile-menu-button').click();
  const sidebar = page.locator(SIDEBAR_SELECTOR);
  await expect(sidebar).toHaveClass(/v-navigation-drawer--active/, { timeout: 3000 });
}

async function waitForSidebarClosed(page) {
  const sidebar = page.locator(SIDEBAR_SELECTOR);
  await expect(sidebar).not.toHaveClass(/v-navigation-drawer--active/, { timeout: 3000 });
}

test.describe('Calendar Views (Mobile)', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(({ testNow }) => {
      window.__CALENDAR_TEST_NOW__ = testNow;
    }, { testNow: TEST_NOW });

    await page.goto('/');
    await expect(page.locator('.google-calendar')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('.calendar-title')).toHaveText('January 2025', { timeout: 5000 });
  });

  test('should display calendar with default month view', async ({ page }) => {
    await expect(page.locator('.calendar-days')).toBeVisible();
    await expect(page.locator('.calendar-title')).toHaveText('January 2025');
  });

  test('should switch to week view via mobile sidebar', async ({ page }) => {
    await openSidebar(page);
    await page.getByTestId('sidebar-view-week').click();
    await waitForSidebarClosed(page);

    await expect(page.locator('.week-view')).toBeVisible({ timeout: 4000 });
    await expect(page.locator('.week-grid')).toBeVisible({ timeout: 4000 });
  });

  test('should switch to day view via mobile sidebar', async ({ page }) => {
    await openSidebar(page);
    await page.getByTestId('sidebar-view-day').click();
    await waitForSidebarClosed(page);

    await expect(page.locator('.day-view')).toBeVisible({ timeout: 4000 });
    await expect(page.locator('.day-grid')).toBeVisible({ timeout: 4000 });
  });

  test('should display "Today" button on mobile', async ({ page }) => {
    const todayButton = page.getByTestId('today-button');
    await expect(todayButton).toBeVisible();

    const calendarBody = page.locator('.calendar-body');
    const box = await calendarBody.boundingBox();
    if (!box) throw new Error('Calendar body not found');

    await calendarBody.dragTo(calendarBody, {
      sourcePosition: { x: box.width * 0.75, y: box.height / 2 },
      targetPosition: { x: box.width * 0.25, y: box.height / 2 },
      force: true,
    });

    await expect(page.locator('.calendar-title')).not.toHaveText('January 2025', { timeout: 4000 });

    await todayButton.click();
    await expect(page.locator('.calendar-title')).toHaveText('January 2025', { timeout: 4000 });
  });
});
