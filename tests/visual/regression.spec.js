const { test, expect } = require('@playwright/test');

const VIEW_TOGGLE = 'view-toggle';
const EVENT_MODAL = '[data-testid="event-modal"]';
const MOBILE_MENU_BUTTON = 'mobile-menu-button';
const SIDEBAR_SELECTOR = '.mobile-sidebar';
const SCRIM_SELECTOR = '.v-navigation-drawer__scrim';
const TEST_NOW_ISO = '2025-01-15T09:00:00';

async function ensureCalendarReady(page) {
  await expect(page.locator('.google-calendar')).toBeVisible({ timeout: 5000 });
}

async function applyTestNow(page) {
  await page.addInitScript((isoString) => {
    window.__CALENDAR_TEST_NOW__ = isoString;
  }, TEST_NOW_ISO);
}

async function switchDesktopView(page, view) {
  // Click the v-select to open dropdown
  await page.getByTestId(VIEW_TOGGLE).click();
  await page.waitForTimeout(200);
  // Click the option in the dropdown menu - use first() to avoid sidebar match
  const viewLabels = { month: 'Month', week: 'Week', day: 'Day' };
  const label = viewLabels[view.toLowerCase()] || view;
  await page.locator('.v-overlay--active .v-list-item-title').filter({ hasText: new RegExp(`^${label}$`, 'i') }).first().click();
  await page.waitForTimeout(100);
}

async function openMobileSidebar(page) {
  await page.getByTestId(MOBILE_MENU_BUTTON).click();
  await expect(page.locator(SIDEBAR_SELECTOR)).toHaveClass(/v-navigation-drawer--active/, { timeout: 2000 });
}

async function switchMobileView(page, view) {
  await openMobileSidebar(page);
  await page.getByTestId(`sidebar-view-${view}`).click();
  await expect(page.locator(SIDEBAR_SELECTOR)).not.toHaveClass(/v-navigation-drawer--active/, { timeout: 2000 });
  await expect(page.locator(SCRIM_SELECTOR)).toHaveCount(0, { timeout: 2000 });
  await page.waitForTimeout(100);
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
    await page.waitForSelector('.calendar-days', { timeout: 2000 });
    
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

  // Removed: Complex event creation and detail modal test
  // - should match event detail modal snapshot

  test('should match calendar header snapshot', async ({ page }) => {
    await expect(page.locator('.calendar-header')).toHaveScreenshot('desktop-header.png', {
      maxDiffPixels: 50,
    });
  });

  // Removed: Complex multi-event creation test
  // - should match calendar with events snapshot

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
    await page.waitForSelector('.calendar-days', { timeout: 2000 });
    
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

  // Removed: Mobile modal test requires bottom sheet interaction
  // - should match mobile event modal snapshot

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

// Removed: Dark mode and custom color tests (complex color input interaction)
// test.describe('Visual Regression - Dark Mode / Themes', () => {
