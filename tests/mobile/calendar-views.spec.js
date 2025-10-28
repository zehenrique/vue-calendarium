import { test, expect } from '@playwright/test';

test.describe('Calendar Views (Mobile)', () => {
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
    
    // Check that month view is active
    await expect(page.locator('.calendar-days')).toBeVisible();
    
    // Check that header shows current month/year
    const header = page.locator('h1.calendar-title');
    await expect(header).toBeVisible();
    const headerText = await header.textContent();
    expect(headerText).toMatch(/\w+ \d{4}/);
  });

  test('should switch to week view via mobile sidebar', async ({ page }) => {
    // Open sidebar
    await page.click('.mobile-menu-btn');
    await page.waitForTimeout(300);
    
    // Click Week view in sidebar
    const sidebar = page.locator('.mobile-sidebar');
    await sidebar.locator('button:has-text("Week")').click();
    await page.waitForTimeout(500);
    
    // Verify week view is displayed
    await expect(page.locator('.week-view')).toBeVisible();
    await expect(page.locator('.week-grid')).toBeVisible();
  });

  test('should switch to day view via mobile sidebar', async ({ page }) => {
    // Open sidebar
    await page.click('.mobile-menu-btn');
    await page.waitForTimeout(300);
    
    // Click Day view in sidebar
    const sidebar = page.locator('.mobile-sidebar');
    await sidebar.locator('button:has-text("Day")').click();
    await page.waitForTimeout(500);
    
    // Verify day view is displayed
    await expect(page.locator('.day-view')).toBeVisible();
    await expect(page.locator('text=00:00')).toBeVisible();
    await expect(page.locator('text=12:00').first()).toBeVisible();
  });

  test('should display "Today" button on mobile', async ({ page }) => {
    // Verify Today button is visible on mobile
    const todayButton = page.locator('button.today-btn');
    await expect(todayButton).toBeVisible();
    
    // Click today button should work
    await todayButton.click();
    await page.waitForTimeout(300);
    
    // Verify current month is shown
    const header = await page.locator('h1.calendar-title').textContent();
    const now = new Date();
    const currentMonth = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    expect(header).toBe(currentMonth);
  });
});
