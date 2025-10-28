import { test, expect } from '@playwright/test';

test.describe('Calendar Views (Desktop)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for Vue app to mount
    await page.waitForSelector('#app', { timeout: 10000 });
    await page.waitForTimeout(1000); // Give Vue time to render
    await expect(page.locator('.google-calendar')).toBeVisible({ timeout: 5000 });
  });

  test('should display calendar with default month view', async ({ page }) => {
    // Check that calendar is visible
    await expect(page.locator('.google-calendar')).toBeVisible();
    
    // Check that month view is active - calendar-days is the grid container
    await expect(page.locator('.calendar-days')).toBeVisible();
    
    // Check that header shows current month/year
    const header = page.locator('h1.calendar-title');
    await expect(header).toBeVisible();
    const headerText = await header.textContent();
    expect(headerText).toMatch(/\w+ \d{4}/); // e.g., "October 2025"
  });

  test('should switch between month, week, and day views', async ({ page }) => {
    // Start in month view
    await expect(page.locator('.calendar-days')).toBeVisible();
    
    // Switch to week view - use the view button
    await page.click('button.view-btn:has-text("Week")');
    await page.waitForTimeout(300);
    
    // Verify week view is displayed
    await expect(page.locator('.week-view')).toBeVisible();
    await expect(page.locator('.week-grid')).toBeVisible();
    
    // Switch to day view
    await page.click('button.view-btn:has-text("Day")');
    await page.waitForTimeout(300);
    
    // Verify day view shows time slots
    await expect(page.locator('.day-view')).toBeVisible();
    await expect(page.locator('text=00:00')).toBeVisible();
    // Use .first() to avoid strict mode violation
    await expect(page.locator('text=12:00').first()).toBeVisible();
    
    // Switch back to month view
    await page.click('button.view-btn:has-text("Month")');
    await page.waitForTimeout(300);
    await expect(page.locator('.calendar-days')).toBeVisible();
  });

  test('should navigate between months', async ({ page }) => {
    // Get initial month
    const initialMonth = await page.locator('h1.calendar-title').textContent();
    
    // Click next month button - use aria-label with correct case
    const nextButton = page.locator('button[aria-label*="Next"]');
    await nextButton.click();
    await page.waitForTimeout(300);
    
    // Verify month changed
    const newMonth = await page.locator('h1.calendar-title').textContent();
    expect(newMonth).not.toBe(initialMonth);
    
    // Click previous month button
    const prevButton = page.locator('button[aria-label*="Previous"]');
    await prevButton.click();
    await page.waitForTimeout(300);
    
    // Should be back to initial month
    const finalMonth = await page.locator('h1.calendar-title').textContent();
    expect(finalMonth).toBe(initialMonth);
  });

  test('should navigate to today', async ({ page }) => {
    // Navigate away from current month first
    const nextButton = page.locator('button[aria-label*="Next"]');
    await nextButton.click();
    await nextButton.click();
    await page.waitForTimeout(300);
    
    // Click Today button
    await page.click('button.today-btn');
    await page.waitForTimeout(300);
    
    // Verify current month is shown
    const header = await page.locator('h1.calendar-title').textContent();
    const now = new Date();
    const currentMonth = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    expect(header).toBe(currentMonth);
  });
});
