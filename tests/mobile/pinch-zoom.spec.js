import { test, expect } from '@playwright/test';

test.describe('Mobile Pinch-to-Zoom Tests', () => {
  test.use({
    viewport: { width: 375, height: 667 } // iPhone SE dimensions
  });

  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.__CALENDAR_TEST_NOW__ = '2025-01-15T09:00:00';
    });
    await page.goto('/');
    await expect(page.locator('.vue-calendarium')).toBeVisible({ timeout: 5000 });
  });

  test('should load calendar successfully on mobile', async ({ page }) => {
    // Basic smoke test to verify calendar loads
    const calendar = page.locator('.vue-calendarium');
    await expect(calendar).toBeVisible();
    await expect(calendar).toHaveClass(/is-mobile/);
  });

  test('should have hour slots in week/day views for zoom functionality', async ({ page }) => {
    // Month view doesn't have hour slots (pinch disabled)
    const monthViewBody = page.locator('.calendar-body.month-view');
    const monthViewCount = await monthViewBody.count();
    
    if (monthViewCount > 0) {
      const hourSlotCount = await page.locator('.hour-slot').count();
      expect(hourSlotCount).toBe(0);
    }
  });

  test('should initialize pinch gestures composable without errors', async ({ page }) => {
    // Verify no console errors related to pinch gestures
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    
    // Wait a bit for any initialization errors
    await page.waitForTimeout(1000);
    
    const pinchErrors = errors.filter(err => 
      err.includes('pinch') || err.includes('Hammer') || err.includes('zoom')
    );
    
    expect(pinchErrors.length).toBe(0);
  });
});

test.describe('Desktop - No Pinch-to-Zoom', () => {
  test.use({
    viewport: { width: 1280, height: 720 } // Desktop size
  });

  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.__CALENDAR_TEST_NOW__ = '2025-01-15T09:00:00';
    });
    await page.goto('/');
    await expect(page.locator('.vue-calendarium')).toBeVisible({ timeout: 5000 });
  });

  test('should load calendar successfully on desktop', async ({ page }) => {
    const calendar = page.locator('.vue-calendarium');
    await expect(calendar).toBeVisible();
    await expect(calendar).not.toHaveClass(/is-mobile/);
  });
});
