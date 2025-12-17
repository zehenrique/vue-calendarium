import { test, expect } from '@playwright/test';

const SIDEBAR_SELECTOR = '.mobile-sidebar';
const SCRIM_SELECTOR = '.v-navigation-drawer__scrim';

async function openSidebar(page) {
  await page.getByTestId('mobile-menu-button').click();
  const sidebar = page.locator(SIDEBAR_SELECTOR);
  await expect(sidebar).toHaveClass(/v-navigation-drawer--active/, { timeout: 2000 });
}

async function clickScrim(page) {
  await page.locator(SCRIM_SELECTOR).dispatchEvent('click');
}

async function expectSidebarClosed(page) {
  const sidebar = page.locator(SIDEBAR_SELECTOR);
  await expect(sidebar).not.toHaveClass(/v-navigation-drawer--active/, { timeout: 2000 });
  await expect(page.locator(SCRIM_SELECTOR)).toHaveCount(0, { timeout: 2000 });
}

test.describe('Mobile Sidebar Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.__CALENDAR_TEST_NOW__ = '2025-01-15T09:00:00';
    });
    await page.goto('/');
    await expect(page.locator('.google-calendar')).toBeVisible({ timeout: 5000 });
  });

  test('should open mobile sidebar when clicking menu button', async ({ page }) => {
    await openSidebar(page);
  });

  test('should close mobile sidebar when clicking close button', async ({ page }) => {
    await openSidebar(page);
    await page.locator(SIDEBAR_SELECTOR).getByRole('button', { name: /Close/i }).click();

    await expectSidebarClosed(page);
  });

  test('should close sidebar when clicking backdrop', async ({ page }) => {
    await openSidebar(page);

    await clickScrim(page);
    await expectSidebarClosed(page);
  });

  test('should display calendar list in sidebar', async ({ page }) => {
    await openSidebar(page);

    const sidebar = page.locator(SIDEBAR_SELECTOR);
    await expect(sidebar.locator('text=Work').first()).toBeVisible();
    await expect(sidebar.locator('text=Personal').first()).toBeVisible();
    await expect(sidebar.locator('text=Family').first()).toBeVisible();
  });
});
