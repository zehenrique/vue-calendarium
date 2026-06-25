import { test, expect } from '@playwright/test';

const TEST_NOW = '2025-01-15T09:00:00';
const SIDEBAR_SELECTOR = '.mobile-sidebar';

async function openSidebar(page) {
  await page.getByTestId('mobile-menu-button').click();
  const sidebar = page.locator(SIDEBAR_SELECTOR);
  await expect(sidebar).toHaveClass(/v-navigation-drawer--active/, { timeout: 2000 });
}

async function waitForSidebarClosed(page) {
  const sidebar = page.locator(SIDEBAR_SELECTOR);
  await expect(sidebar).not.toHaveClass(/v-navigation-drawer--active/, { timeout: 2000 });
}

test.describe('Calendar Views (Mobile)', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(({ testNow }) => {
      window.__CALENDAR_TEST_NOW__ = testNow;
    }, { testNow: TEST_NOW });

    await page.goto('/');
    await expect(page.locator('.vue-calendarium')).toBeVisible({ timeout: 5000 });
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

    await expect(page.locator('.week-view')).toBeVisible({ timeout: 2000 });
    await expect(page.locator('.week-grid')).toBeVisible({ timeout: 2000 });
  });

  test('should switch to day view via mobile sidebar', async ({ page }) => {
    await openSidebar(page);
    await page.getByTestId('sidebar-view-day').click();
    await waitForSidebarClosed(page);

    await expect(page.locator('.day-view')).toBeVisible({ timeout: 2000 });
    await expect(page.locator('.day-grid')).toBeVisible({ timeout: 2000 });
  });

  test('should display "Today" button on mobile', async ({ page }) => {
    // Verify Today button is visible
    const todayButton = page.getByTestId('today-button');
    await expect(todayButton).toBeVisible();

    // Verify it's clickable (clicking on current date is a no-op but shouldn't error)
    await todayButton.click();
    
    // Verify calendar is still showing the correct period
    await expect(page.locator('.calendar-title')).toHaveText('January 2025', { timeout: 2000 });
  });
});
