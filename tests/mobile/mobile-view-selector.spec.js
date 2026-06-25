import { test, expect } from '@playwright/test';

test.describe('Mobile View Selector', () => {
  test.use({
    viewport: { width: 375, height: 667 } // iPhone SE dimensions
  });

  test('should display view selector combobox in header on mobile', async ({ page }) => {
    await page.goto('/?viewSelector=header');
    
    // Wait for calendar to load
    await expect(page.locator('.vue-calendarium')).toBeVisible({ timeout: 10000 });
    
    // Check that the view selector is visible in the header
    const viewSelector = page.locator('.header-right [data-testid="view-toggle"]');
    await expect(viewSelector).toBeVisible();
  });

  test('should switch views using the header combobox on mobile', async ({ page }) => {
    await page.goto('/?viewSelector=header');
    
    await expect(page.locator('.vue-calendarium')).toBeVisible({ timeout: 10000 });
    
    // Click the view selector to open dropdown
    const viewSelector = page.locator('.header-right [data-testid="view-toggle"]');
    await viewSelector.click();
    
    // Wait for the dropdown menu to appear
    await page.waitForSelector('.v-list-item', { timeout: 5000 });
    
    // Get all list items and click the second one (should be week view if month is default)
    const listItems = page.locator('.v-list-item');
    const count = await listItems.count();
    
    // Assuming month is default, week should be at index 1
    if (count > 1) {
      await listItems.nth(1).click();
    }
    
    // Wait for view change
    await page.waitForTimeout(500);
    
    // Check that we're no longer in month view OR we're in week/day view
    const hasWeekOrDayView = await page.locator('.week-view, .day-view').count();
    expect(hasWeekOrDayView).toBeGreaterThan(0);
  });

  test('should have both Today button and view selector visible on mobile', async ({ page }) => {
    await page.goto('/?viewSelector=header');
    
    await expect(page.locator('.vue-calendarium')).toBeVisible({ timeout: 10000 });
    
    // Check that both Today button and view selector are in header-right
    const todayButton = page.locator('.header-right [data-testid="today-button"]');
    const viewSelector = page.locator('.header-right [data-testid="view-toggle"]');
    
    await expect(todayButton).toBeVisible();
    await expect(viewSelector).toBeVisible();
  });

  test('should display view selector on different mobile sizes', async ({ page }) => {
    // Test on narrow viewport (iPhone 5/SE)
    await page.setViewportSize({ width: 320, height: 568 });
    await page.goto('/?viewSelector=header');
    await expect(page.locator('.vue-calendarium')).toBeVisible({ timeout: 10000 });
    
    let viewSelector = page.locator('.header-right [data-testid="view-toggle"]');
    await expect(viewSelector).toBeVisible();
    
    // Test on wider viewport (iPhone 14 Pro Max)
    await page.setViewportSize({ width: 428, height: 926 });
    await page.goto('/?viewSelector=header');
    await expect(page.locator('.vue-calendarium')).toBeVisible({ timeout: 10000 });
    
    viewSelector = page.locator('.header-right [data-testid="view-toggle"]');
    await expect(viewSelector).toBeVisible();
  });

  test('should show correct view in selector after switching', async ({ page }) => {
    await page.goto('/?viewSelector=header');
    await expect(page.locator('.vue-calendarium')).toBeVisible({ timeout: 10000 });
    
    // Get initial view value
    const viewSelector = page.locator('.header-right [data-testid="view-toggle"]');
    const initialValue = await viewSelector.locator('input').inputValue();
    
    // Switch to a different view
    await viewSelector.click();
    await page.waitForSelector('.v-list-item');
    
    const listItems = page.locator('.v-list-item');
    await listItems.nth(1).click();
    
    await page.waitForTimeout(500);
    
    // Check that the value changed
    const newValue = await viewSelector.locator('input').inputValue();
    expect(newValue).not.toBe(initialValue);
  });
});
