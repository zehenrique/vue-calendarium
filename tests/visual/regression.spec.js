const { test, expect } = require('@playwright/test');

const VIEW_TOGGLE = 'view-toggle';
const EVENT_MODAL = '[data-testid="event-modal"]';
const EVENT_DETAIL_MODAL = '[data-testid="event-detail-modal"]';
const MOBILE_MENU_BUTTON = 'mobile-menu-button';
const SIDEBAR_SELECTOR = '.mobile-sidebar';
const SCRIM_SELECTOR = '.v-navigation-drawer__scrim';
const TEST_NOW_ISO = '2025-01-15T09:00:00';

async function ensureCalendarReady(page) {
  await expect(page.locator('.google-calendar')).toBeVisible({ timeout: 10000 });
}

async function applyTestNow(page) {
  await page.addInitScript((isoString) => {
    window.__CALENDAR_TEST_NOW__ = isoString;
  }, TEST_NOW_ISO);
}

async function switchDesktopView(page, view) {
  const labelPattern = new RegExp(`^${view}`, 'i');
  await page.getByTestId(VIEW_TOGGLE).getByRole('button', { name: labelPattern }).click();
  await page.waitForTimeout(300);
}

async function openMobileSidebar(page) {
  await page.getByTestId(MOBILE_MENU_BUTTON).click();
  await expect(page.locator(SIDEBAR_SELECTOR)).toHaveClass(/v-navigation-drawer--active/, { timeout: 3000 });
}

async function switchMobileView(page, view) {
  await openMobileSidebar(page);
  await page.getByTestId(`sidebar-view-${view}`).click();
  await expect(page.locator(SIDEBAR_SELECTOR)).not.toHaveClass(/v-navigation-drawer--active/, { timeout: 3000 });
  await expect(page.locator(SCRIM_SELECTOR)).toHaveCount(0, { timeout: 3000 });
  await page.waitForTimeout(300);
}

/**
 * Visual Regression Tests
 * 
 * These tests capture screenshots and compare them against baseline images.
 * Run with: npx playwright test tests/visual/ --update-snapshots (to update baselines)
 * Run with: npx playwright test tests/visual/ (to compare against baselines)
 */

test.describe('Visual Regression - Desktop', () => {
  test.beforeEach(async ({ page }, testInfo) => {
    if (testInfo.project.name.includes('Mobile')) {
      test.skip();
    }
    await applyTestNow(page);
    await page.goto('/');
    await ensureCalendarReady(page);
  });

  test('should match month view snapshot', async ({ page }) => {
    // Ensure we're in month view
    await page.waitForSelector('.calendar-days', { timeout: 3000 });
    
    // Take screenshot of full calendar
    await expect(page.locator('.google-calendar')).toHaveScreenshot('desktop-month-view.png', {
      maxDiffPixels: 100, // Allow small differences
    });
  });

  test('should match week view snapshot', async ({ page }) => {
    // Switch to week view
    await switchDesktopView(page, 'week');
    
    await expect(page.locator('.google-calendar')).toHaveScreenshot('desktop-week-view.png', {
      maxDiffPixels: 600,
    });
  });

  test('should match day view snapshot', async ({ page }) => {
    // Switch to day view
    await switchDesktopView(page, 'day');
    
    await expect(page.locator('.google-calendar')).toHaveScreenshot('desktop-day-view.png', {
      maxDiffPixels: 3200,
    });
  });

  test('should match event creation modal snapshot', async ({ page }) => {
    // Switch to week view and open modal
    await switchDesktopView(page, 'week');

    const hourSlot = page.locator('.hour-slot').nth(20);
    await hourSlot.scrollIntoViewIfNeeded();
    await hourSlot.click({ force: true });
    await expect(page.locator(EVENT_MODAL)).toBeVisible({ timeout: 2000 });

    // Screenshot just the modal
    await expect(page.locator(EVENT_MODAL)).toHaveScreenshot('desktop-event-modal.png', {
      maxDiffPixels: 150,
    });
  });

  test('should match event detail modal snapshot', async ({ page }) => {
    // Switch to week view
    await switchDesktopView(page, 'week');

    // Create event
    const hourSlot = page.locator('.hour-slot').nth(20);
    await hourSlot.scrollIntoViewIfNeeded();
    await hourSlot.click({ force: true });
    const titleInput = page.getByLabel(/Event Title/i);
    await expect(titleInput).toBeVisible({ timeout: 2000 });
    await titleInput.fill('Visual Test Event');
    await page.getByRole('button', { name: /Save/i }).click();
    await page.waitForTimeout(400);

    // Open event detail
    await page.locator('.day-event:has-text("Visual Test Event")').first().click();
    await expect(page.locator(EVENT_DETAIL_MODAL)).toBeVisible({ timeout: 2000 });

    await expect(page.locator(EVENT_DETAIL_MODAL)).toHaveScreenshot('desktop-event-detail-modal.png', {
      maxDiffPixels: 150,
    });
  });

  test('should match calendar header snapshot', async ({ page }) => {
    await expect(page.locator('.calendar-header')).toHaveScreenshot('desktop-header.png', {
      maxDiffPixels: 50,
    });
  });

  test('should match calendar with events snapshot', async ({ page }) => {
    // Switch to week view
    await switchDesktopView(page, 'week');
    
    // Create multiple events
    for (let i = 0; i < 3; i++) {
      const slot = page.locator('.hour-slot').nth(20 + i);
      await slot.scrollIntoViewIfNeeded();
      await slot.click({ force: true });
      const titleInput = page.getByLabel(/Event Title/i);
      await expect(titleInput).toBeVisible({ timeout: 2000 });
      await titleInput.fill(`Event ${i + 1}`);
      await page.getByRole('button', { name: /Save/i }).click();
      await page.waitForTimeout(200);
    }
    
    await expect(page.locator('.google-calendar')).toHaveScreenshot('desktop-week-with-events.png', {
      maxDiffPixels: 600,
    });
  });

  test('should match current time indicator snapshot', async ({ page }) => {
    // Switch to day view (better visibility of time indicator)
    await switchDesktopView(page, 'day');
    
    // Screenshot the day grid with time indicator
    await expect(page.locator('.day-grid')).toHaveScreenshot('desktop-time-indicator.png', {
      maxDiffPixels: 3200,
    });
  });
});

test.describe('Visual Regression - Mobile', () => {
  test.use({ viewport: { width: 375, height: 667 } }); // iPhone SE size

  test.beforeEach(async ({ page }, testInfo) => {
    if (!testInfo.project.name.includes('Mobile')) {
      test.skip();
    }
    await applyTestNow(page);
    await page.goto('/');
    await ensureCalendarReady(page);
  });

  test('should match mobile month view snapshot', async ({ page }) => {
    await page.waitForSelector('.calendar-days', { timeout: 3000 });
    
    await expect(page.locator('.google-calendar')).toHaveScreenshot('mobile-month-view.png', {
      maxDiffPixels: 100,
    });
  });

  test('should match mobile sidebar snapshot', async ({ page }) => {
    // Open sidebar
    await openMobileSidebar(page);
    
    // Screenshot including backdrop
    await expect(page.locator('body')).toHaveScreenshot('mobile-sidebar-open.png', {
      maxDiffPixels: 150,
      fullPage: true,
    });
  });

  test('should match mobile week view snapshot', async ({ page }) => {
    // Open sidebar and switch to week
    await switchMobileView(page, 'week');
    
    await expect(page.locator('.google-calendar')).toHaveScreenshot('mobile-week-view.png', {
      maxDiffPixels: 100,
    });
  });

  test('should match mobile event modal snapshot', async ({ page }) => {
    // Switch to week view
    await switchMobileView(page, 'week');
    
    // Open event modal
    const hourSlot = page.locator('.hour-slot').nth(20);
    await hourSlot.scrollIntoViewIfNeeded();
    await hourSlot.click({ force: true });
    await expect(page.locator(EVENT_MODAL)).toBeVisible({ timeout: 2000 });
    
    await expect(page.locator(EVENT_MODAL)).toHaveScreenshot('mobile-event-modal.png', {
      maxDiffPixels: 150,
    });
  });

  test('should match mobile header snapshot', async ({ page }) => {
    await expect(page.locator('.calendar-header')).toHaveScreenshot('mobile-header.png', {
      maxDiffPixels: 50,
    });
  });

  test('should match mobile day view snapshot', async ({ page }) => {
    // Open sidebar and switch to day
    await switchMobileView(page, 'day');
    
    await expect(page.locator('.google-calendar')).toHaveScreenshot('mobile-day-view.png', {
      maxDiffPixels: 100,
    });
  });
});

test.describe('Visual Regression - Responsive Breakpoints', () => {
  test.beforeEach(({ page }, testInfo) => {
    if (testInfo.project.name.includes('Mobile')) {
      test.skip();
    }
    void page;
  });

  test('should match tablet landscape view', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 768 });
    await applyTestNow(page);
    await page.goto('/');
    await ensureCalendarReady(page);
    
    await expect(page.locator('.google-calendar')).toHaveScreenshot('tablet-landscape.png', {
      maxDiffPixels: 150,
    });
  });

  test('should match tablet portrait view', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await applyTestNow(page);
    await page.goto('/');
    await ensureCalendarReady(page);
    
    await expect(page.locator('.google-calendar')).toHaveScreenshot('tablet-portrait.png', {
      maxDiffPixels: 150,
    });
  });

  test('should match small mobile view', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 }); // iPhone SE
    await applyTestNow(page);
    await page.goto('/');
    await ensureCalendarReady(page);
    
    await expect(page.locator('.google-calendar')).toHaveScreenshot('mobile-small.png', {
      maxDiffPixels: 100,
    });
  });

  test('should match large desktop view', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await applyTestNow(page);
    await page.goto('/');
    await ensureCalendarReady(page);
    
    await expect(page.locator('.google-calendar')).toHaveScreenshot('desktop-large.png', {
      maxDiffPixels: 200,
    });
  });
});

test.describe('Visual Regression - Dark Mode / Themes', () => {
  test.beforeEach(({ page }, testInfo) => {
    if (testInfo.project.name.includes('Mobile')) {
      test.skip();
    }
    void page;
  });

  test('should match with custom event colors', async ({ page }) => {
    await applyTestNow(page);
    await page.goto('/');
    await ensureCalendarReady(page);
    
    // Switch to week view
    await switchDesktopView(page, 'week');
    
    // Create events with different colors
    const colors = ['#ea4335', '#fbbc04', '#34a853', '#4285f4'];
    
    for (let i = 0; i < colors.length; i++) {
      const slot = page.locator('.hour-slot').nth(20 + i);
      await slot.scrollIntoViewIfNeeded();
      await slot.click({ force: true });
      const titleInput = page.getByLabel(/Event Title/i);
      await expect(titleInput).toBeVisible({ timeout: 2000 });
      await titleInput.fill(`Color ${i + 1}`);
      await page.locator('input[type="color"]').first().fill(colors[i]);
      await page.getByRole('button', { name: /Save/i }).click();
      await page.waitForTimeout(200);
    }
    
    await expect(page.locator('.google-calendar')).toHaveScreenshot('calendar-colored-events.png', {
      maxDiffPixels: 600,
    });
  });
});
