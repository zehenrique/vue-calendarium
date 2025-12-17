import { test, expect } from '@playwright/test';

test.describe('Mobile Horizontal Scroll Prevention', () => {
  test.use({
    viewport: { width: 375, height: 667 } // iPhone SE dimensions
  });

  test('should not have horizontal scroll in month view', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Wait for calendar to load
    await page.waitForSelector('.google-calendar');
    
    // Switch to month view
    const menuButton = page.locator('[data-testid="mobile-menu-button"]');
    await menuButton.click();
    await page.locator('[data-testid="sidebar-view-month"]').click();
    
    // Check that body width equals scroll width (no horizontal overflow)
    const calendar = page.locator('.google-calendar');
    const hasHorizontalScroll = await calendar.evaluate((el) => {
      return el.scrollWidth > el.clientWidth;
    });
    
    expect(hasHorizontalScroll).toBe(false);
  });

  test('should not have horizontal scroll in week view', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Wait for calendar to load
    await page.waitForSelector('.google-calendar');
    
    // Switch to week view
    const menuButton = page.locator('[data-testid="mobile-menu-button"]');
    await menuButton.click();
    await page.locator('[data-testid="sidebar-view-week"]').click();
    
    // Wait for week view to render
    await page.waitForSelector('.week-view');
    
    // Check multiple elements for horizontal overflow
    const elements = [
      '.google-calendar',
      '.week-view',
      '.week-grid',
      '.calendar-header'
    ];
    
    for (const selector of elements) {
      const element = page.locator(selector).first();
      const hasHorizontalScroll = await element.evaluate((el) => {
        return el.scrollWidth > el.clientWidth;
      });
      
      expect(hasHorizontalScroll, `${selector} should not have horizontal scroll`).toBe(false);
    }
  });

  test('should not have horizontal scroll in day view', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Wait for calendar to load
    await page.waitForSelector('.google-calendar');
    
    // Switch to day view
    const menuButton = page.locator('[data-testid="mobile-menu-button"]');
    await menuButton.click();
    await page.locator('[data-testid="sidebar-view-day"]').click();
    
    // Wait for day view to render
    await page.waitForSelector('.day-view');
    
    // Check multiple elements for horizontal overflow
    const elements = [
      '.google-calendar',
      '.day-view',
      '.day-grid',
      '.calendar-header'
    ];
    
    for (const selector of elements) {
      const element = page.locator(selector).first();
      const hasHorizontalScroll = await element.evaluate((el) => {
        return el.scrollWidth > el.clientWidth;
      });
      
      expect(hasHorizontalScroll, `${selector} should not have horizontal scroll`).toBe(false);
    }
  });

  test('should fit all week day columns within viewport', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Switch to week view
    const menuButton = page.locator('[data-testid="mobile-menu-button"]');
    await menuButton.click();
    await page.locator('[data-testid="sidebar-view-week"]').click();
    
    await page.waitForSelector('.week-day-columns');
    
    // Get viewport width
    const viewportWidth = page.viewportSize().width;
    
    // Check that week-day-columns doesn't exceed viewport
    const columnsWidth = await page.locator('.week-day-columns').evaluate((el) => {
      return el.getBoundingClientRect().width;
    });
    
    expect(columnsWidth).toBeLessThanOrEqual(viewportWidth);
  });

  test('should handle narrow mobile viewport (320px)', async ({ page }) => {
    // Set very narrow viewport (iPhone 5/SE)
    await page.setViewportSize({ width: 320, height: 568 });
    await page.goto('http://localhost:3000');
    
    // Test week view
    const menuButton = page.locator('[data-testid="mobile-menu-button"]');
    await menuButton.click();
    await page.locator('[data-testid="sidebar-view-week"]').click();
    
    await page.waitForSelector('.week-view');
    
    const calendar = page.locator('.google-calendar');
    const hasHorizontalScroll = await calendar.evaluate((el) => {
      return el.scrollWidth > el.clientWidth;
    });
    
    expect(hasHorizontalScroll).toBe(false);
  });

  test('should handle wide mobile viewport (428px)', async ({ page }) => {
    // Set wider mobile viewport (iPhone 14 Pro Max)
    await page.setViewportSize({ width: 428, height: 926 });
    await page.goto('http://localhost:3000');
    
    // Test week view
    const menuButton = page.locator('[data-testid="mobile-menu-button"]');
    await menuButton.click();
    await page.locator('[data-testid="sidebar-view-week"]').click();
    
    await page.waitForSelector('.week-view');
    
    const calendar = page.locator('.google-calendar');
    const hasHorizontalScroll = await calendar.evaluate((el) => {
      return el.scrollWidth > el.clientWidth;
    });
    
    expect(hasHorizontalScroll).toBe(false);
  });
});
