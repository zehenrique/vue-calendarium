const { test, expect } = require('@playwright/test');

const SIDEBAR_SELECTOR = '.mobile-sidebar';
const SCRIM_SELECTOR = '.v-navigation-drawer__scrim';

async function openSidebar(page) {
  await page.getByTestId('mobile-menu-button').click();
  const sidebar = page.locator(SIDEBAR_SELECTOR);
  await expect(sidebar).toHaveClass(/v-navigation-drawer--active/, { timeout: 3000 });
}

async function waitForSidebarClosed(page) {
  const sidebar = page.locator(SIDEBAR_SELECTOR);
  await expect(sidebar).not.toHaveClass(/v-navigation-drawer--active/, { timeout: 3000 });
  await expect(page.locator(SCRIM_SELECTOR)).toHaveCount(0, { timeout: 3000 });
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

async function openEventModalFromSlot(page, index = 20, columnIndex = 0) {
  const slot = getSlotLocator(page, index, columnIndex);
  await slot.scrollIntoViewIfNeeded();
  await slot.click({ force: true });
  await expect(page.getByTestId('event-modal')).toBeVisible({ timeout: 4000 });
}

async function fillEventTitle(page, title) {
  await page.getByLabel(/Event Title/i).fill(title);
  await page.getByRole('button', { name: /Save/i }).click();
  await expect(page.getByTestId('event-modal')).not.toBeVisible({ timeout: 4000 });
  await expect(page.getByTestId('event-detail-modal')).toBeHidden({ timeout: 4000 }).catch(() => {});
}

test.describe('Mobile Gesture Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.__CALENDAR_TEST_NOW__ = '2025-01-15T09:00:00';
    });
    await page.goto('/');
    await expect(page.locator('.google-calendar')).toBeVisible({ timeout: 10000 });
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

    await expect(page.locator('.week-day-number').first()).not.toHaveText(initialFirstDay || '', { timeout: 3000 });
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

    await expect(page.locator('.week-day-number').first()).not.toHaveText(initialFirstDay || '', { timeout: 3000 });
  });

  test('should detect tap gesture on event', async ({ page }) => {
    await switchToView(page, 'week');

    await openEventModalFromSlot(page, 20);
    await fillEventTitle(page, 'Tap Test Event');

    await page.locator('.day-event:has-text("Tap Test Event")').first().tap();

    await expect(page.getByTestId('event-detail-modal')).toBeVisible({ timeout: 4000 });
  });

  test('should handle long press gesture on calendar cell', async ({ page }) => {
    await switchToView(page, 'week');

    const slot = getSlotLocator(page, 20);
    await slot.scrollIntoViewIfNeeded();
    await slot.click({ delay: 700, force: true });

    await expect(page.getByTestId('event-modal')).toBeVisible({ timeout: 4000 });
  });

  test('should handle double tap gesture', async ({ page }) => {
    await switchToView(page, 'day');

    const slot = getSlotLocator(page, 20);
    await slot.click({ clickCount: 2 });

    await expect(page.getByTestId('event-modal')).toBeVisible({ timeout: 4000 });
  });

  test('should handle swipe to close sidebar', async ({ page }) => {
    await openSidebar(page);
    await page.waitForTimeout(300);

    const sidebar = page.locator('.mobile-sidebar');
    const box = await sidebar.boundingBox();

    await page.mouse.move(box.x + box.width * 0.8, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x - 40, box.y + box.height / 2, { steps: 8 });
    await page.mouse.up();

    await waitForSidebarClosed(page);
  });

  test('should handle fast swipe gesture (flick)', async ({ page }) => {
    await switchToView(page, 'month');

    const initialTitle = await page.locator('.calendar-title').textContent();
    const calendarBody = page.locator('.calendar-body');
    const box = await calendarBody.boundingBox();

    await page.mouse.move(box.x + box.width * 0.8, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width * 0.2, box.y + box.height / 2, { steps: 4 });
    await page.mouse.up();

    await expect(page.locator('.calendar-title')).not.toHaveText(initialTitle || '', { timeout: 2000 });
  });

  test('should prevent gestures when modal is open', async ({ page }) => {
    await switchToView(page, 'week');
    await openEventModalFromSlot(page, 21);

    const modal = page.getByTestId('event-modal');
    const box = await modal.boundingBox();

    await page.mouse.move(box.x + box.width * 0.8, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width * 0.2, box.y + box.height / 2, { steps: 10 });
    await page.mouse.up();

    await expect(modal).toBeVisible();
  });

  test('should handle edge swipe gesture from screen edge', async ({ page }) => {
    const viewport = page.viewportSize();
    await page.mouse.move(5, viewport.height / 2);
    await page.mouse.down();
    await page.mouse.move(180, viewport.height / 2, { steps: 12 });
    await page.mouse.up();

    await expect(page.locator('.google-calendar')).toBeVisible();
  });
});
