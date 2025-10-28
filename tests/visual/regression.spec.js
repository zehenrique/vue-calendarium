const { test, expect } = require('@playwright/test');

/**
 * Visual Regression Tests
 * 
 * These tests capture screenshots and compare them against baseline images.
 * Run with: npx playwright test tests/visual/ --update-snapshots (to update baselines)
 * Run with: npx playwright test tests/visual/ (to compare against baselines)
 */

test.describe('Visual Regression - Desktop', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
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
    await page.click('button:has-text("Week")');
    await page.waitForTimeout(500);
    
    await expect(page.locator('.google-calendar')).toHaveScreenshot('desktop-week-view.png', {
      maxDiffPixels: 100,
    });
  });

  test('should match day view snapshot', async ({ page }) => {
    // Switch to day view
    await page.click('button:has-text("Day")');
    await page.waitForTimeout(500);
    
    await expect(page.locator('.google-calendar')).toHaveScreenshot('desktop-day-view.png', {
      maxDiffPixels: 100,
    });
  });

  test('should match event creation modal snapshot', async ({ page }) => {
    // Switch to week view and open modal
    await page.click('button:has-text("Week")');
    await page.waitForTimeout(300);
    
    const hourSlot = page.locator('.hour-slot').nth(10);
    await hourSlot.click({ force: true });
    await page.waitForSelector('.fixed.inset-0', { timeout: 2000 });
    
    // Screenshot just the modal
    await expect(page.locator('.fixed.inset-0')).toHaveScreenshot('desktop-event-modal.png', {
      maxDiffPixels: 150,
    });
  });

  test('should match event detail modal snapshot', async ({ page }) => {
    // Switch to week view
    await page.click('button:has-text("Week")');
    await page.waitForTimeout(300);
    
    // Create event
    const hourSlot = page.locator('.hour-slot').nth(8);
    await hourSlot.click({ force: true });
    await page.waitForSelector('input[type="text"]', { timeout: 2000 });
    await page.fill('input[type="text"]', 'Visual Test Event');
    await page.click('button:has-text("Save")');
    await page.waitForTimeout(500);
    
    // Open event detail
    await page.click('.day-event:has-text("Visual Test Event")');
    await page.waitForSelector('h2:has-text("Visual Test Event")', { timeout: 2000 });
    
    await expect(page.locator('.fixed.inset-0')).toHaveScreenshot('desktop-event-detail-modal.png', {
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
    await page.click('button:has-text("Week")');
    await page.waitForTimeout(300);
    
    // Create multiple events
    for (let i = 0; i < 3; i++) {
      const slot = page.locator('.hour-slot').nth(8 + i * 2);
      await slot.click({ force: true });
      await page.waitForSelector('input[type="text"]', { timeout: 2000 });
      await page.fill('input[type="text"]', `Event ${i + 1}`);
      await page.click('button:has-text("Save")');
      await page.waitForTimeout(300);
    }
    
    await expect(page.locator('.google-calendar')).toHaveScreenshot('desktop-week-with-events.png', {
      maxDiffPixels: 200,
    });
  });

  test('should match current time indicator snapshot', async ({ page }) => {
    // Switch to day view (better visibility of time indicator)
    await page.click('button:has-text("Day")');
    await page.waitForTimeout(500);
    
    // Screenshot the day grid with time indicator
    await expect(page.locator('.day-grid')).toHaveScreenshot('desktop-time-indicator.png', {
      maxDiffPixels: 100,
    });
  });
});

test.describe('Visual Regression - Mobile', () => {
  test.use({ viewport: { width: 375, height: 667 } }); // iPhone SE size

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should match mobile month view snapshot', async ({ page }) => {
    await page.waitForSelector('.calendar-days', { timeout: 3000 });
    
    await expect(page.locator('.google-calendar')).toHaveScreenshot('mobile-month-view.png', {
      maxDiffPixels: 100,
    });
  });

  test('should match mobile sidebar snapshot', async ({ page }) => {
    // Open sidebar
    await page.click('button[aria-label="Menu"]');
    await page.waitForSelector('.mobile-sidebar', { timeout: 2000 });
    
    // Screenshot including backdrop
    await expect(page.locator('body')).toHaveScreenshot('mobile-sidebar-open.png', {
      maxDiffPixels: 150,
      fullPage: true,
    });
  });

  test('should match mobile week view snapshot', async ({ page }) => {
    // Open sidebar and switch to week
    await page.click('button[aria-label="Menu"]');
    await page.click('button:has-text("Week")');
    await page.waitForTimeout(500);
    
    await expect(page.locator('.google-calendar')).toHaveScreenshot('mobile-week-view.png', {
      maxDiffPixels: 100,
    });
  });

  test('should match mobile event modal snapshot', async ({ page }) => {
    // Switch to week view
    await page.click('button[aria-label="Menu"]');
    await page.click('button:has-text("Week")');
    await page.waitForTimeout(300);
    
    // Open event modal
    const hourSlot = page.locator('.hour-slot').nth(10);
    await hourSlot.click({ force: true });
    await page.waitForSelector('.fixed.inset-0', { timeout: 2000 });
    
    await expect(page.locator('.fixed.inset-0')).toHaveScreenshot('mobile-event-modal.png', {
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
    await page.click('button[aria-label="Menu"]');
    await page.click('button:has-text("Day")');
    await page.waitForTimeout(500);
    
    await expect(page.locator('.google-calendar')).toHaveScreenshot('mobile-day-view.png', {
      maxDiffPixels: 100,
    });
  });
});

test.describe('Visual Regression - Responsive Breakpoints', () => {
  test('should match tablet landscape view', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    await expect(page.locator('.google-calendar')).toHaveScreenshot('tablet-landscape.png', {
      maxDiffPixels: 150,
    });
  });

  test('should match tablet portrait view', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    await expect(page.locator('.google-calendar')).toHaveScreenshot('tablet-portrait.png', {
      maxDiffPixels: 150,
    });
  });

  test('should match small mobile view', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 }); // iPhone SE
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    await expect(page.locator('.google-calendar')).toHaveScreenshot('mobile-small.png', {
      maxDiffPixels: 100,
    });
  });

  test('should match large desktop view', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    await expect(page.locator('.google-calendar')).toHaveScreenshot('desktop-large.png', {
      maxDiffPixels: 200,
    });
  });
});

test.describe('Visual Regression - Dark Mode / Themes', () => {
  test('should match with custom event colors', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Switch to week view
    await page.click('button:has-text("Week")');
    await page.waitForTimeout(300);
    
    // Create events with different colors
    const colors = ['#ea4335', '#fbbc04', '#34a853', '#4285f4'];
    
    for (let i = 0; i < colors.length; i++) {
      const slot = page.locator('.hour-slot').nth(8 + i * 2);
      await slot.click({ force: true });
      await page.waitForSelector('input[type="text"]', { timeout: 2000 });
      await page.fill('input[type="text"]', `Color ${i + 1}`);
      await page.fill('input[type="color"]', colors[i]);
      await page.click('button:has-text("Save")');
      await page.waitForTimeout(300);
    }
    
    await expect(page.locator('.google-calendar')).toHaveScreenshot('calendar-colored-events.png', {
      maxDiffPixels: 200,
    });
  });
});
