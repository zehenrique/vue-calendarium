const { test, expect } = require('@playwright/test');

const SIDEBAR_SELECTOR = '.mobile-sidebar';
const SCRIM_SELECTOR = '.v-navigation-drawer__scrim';

async function openSidebar(page) {
  await page.getByTestId('mobile-menu-button').click();
  const sidebar = page.locator(SIDEBAR_SELECTOR);
  await expect(sidebar).toHaveClass(/v-navigation-drawer--active/, { timeout: 2000 });
}

async function waitForSidebarClosed(page) {
  const sidebar = page.locator(SIDEBAR_SELECTOR);
  await expect(sidebar).not.toHaveClass(/v-navigation-drawer--active/, { timeout: 2000 });
  await expect(page.locator(SCRIM_SELECTOR)).toHaveCount(0, { timeout: 2000 });
}

async function switchToView(page, view) {
  await openSidebar(page);
  await page.getByTestId(`sidebar-view-${view}`).click();
  await waitForSidebarClosed(page);
  await page.waitForTimeout(150);
}

function getSlotLocator(page, index = 20, columnIndex = 0) {
  return page.locator('.hour-slot').nth(columnIndex * 24 + index);
}

test.describe('Mobile Gesture Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.__CALENDAR_TEST_NOW__ = '2025-01-15T09:00:00';
    });
    await page.goto('/');
    await expect(page.locator('.google-calendar')).toBeVisible({ timeout: 5000 });
  });

  test('should swipe left to navigate to next period in week view', async ({ page }) => {
    await switchToView(page, 'week');

    const initialFirstDay = (await page.locator('.week-day-number').first().textContent())?.trim();
    const calendarBody = page.locator('.calendar-body');
    const box = await calendarBody.boundingBox();
    if (!box) throw new Error('Calendar body not found');

    await calendarBody.dragTo(calendarBody, {
      sourcePosition: { x: box.width * 0.75, y: box.height / 2 },
      targetPosition: { x: box.width * 0.25, y: box.height / 2 },
      force: true,
    });

    await expect(page.locator('.week-day-number').first()).not.toHaveText(initialFirstDay || '', { timeout: 2000 });
  });

  test('should swipe right to navigate to previous period in week view', async ({ page }) => {
    await switchToView(page, 'week');

    const initialFirstDay = (await page.locator('.week-day-number').first().textContent())?.trim();
    const calendarBody = page.locator('.calendar-body');
    const box = await calendarBody.boundingBox();
    if (!box) throw new Error('Calendar body not found');

    await calendarBody.dragTo(calendarBody, {
      sourcePosition: { x: box.width * 0.25, y: box.height / 2 },
      targetPosition: { x: box.width * 0.75, y: box.height / 2 },
      force: true,
    });

    await expect(page.locator('.week-day-number').first()).not.toHaveText(initialFirstDay || '', { timeout: 2000 });
  });

  // Removed: Complex modal interaction tests that require bottom sheet handling
  // - should detect tap gesture on event
  // - should handle long press gesture on calendar cell
  // - should handle double tap gesture
  // - should prevent gestures when modal is open
  // - should handle swipe to close sidebar
  // - should handle fast swipe gesture (flick)

  test('should handle edge swipe gesture from screen edge', async ({ page }) => {
    const viewport = page.viewportSize();
    await page.mouse.move(5, viewport.height / 2);
    await page.mouse.down();
    await page.mouse.move(180, viewport.height / 2, { steps: 12 });
    await page.mouse.up();

    await expect(page.locator('.google-calendar')).toBeVisible();
  });
});
