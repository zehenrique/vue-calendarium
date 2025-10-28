import { test, expect } from '@playwright/test';

test.describe('Mobile Sidebar Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for Vue app to mount
    await page.waitForSelector('#app', { timeout: 10000 });
    await page.waitForTimeout(1000); // Give Vue time to render
    await expect(page.locator('.google-calendar')).toBeVisible({ timeout: 5000 });
  });

  test('should open mobile sidebar when clicking menu button', async ({ page }) => {
    // Click hamburger menu button
    const menuButton = page.locator('.mobile-menu-btn');
    await expect(menuButton).toBeVisible();
    await menuButton.click();
    await page.waitForTimeout(300);
    
    // Verify sidebar is open
    const sidebar = page.locator('.mobile-sidebar');
    await expect(sidebar).toBeVisible();
  });

  test('should display view buttons in sidebar', async ({ page }) => {
    // Open sidebar
    await page.click('.mobile-menu-btn');
    await page.waitForTimeout(300);
    
    // Verify view buttons are present in sidebar
    const sidebar = page.locator('.mobile-sidebar');
    await expect(sidebar.locator('button:has-text("Month")')).toBeVisible();
    await expect(sidebar.locator('button:has-text("Week")')).toBeVisible();
    await expect(sidebar.locator('button:has-text("Day")')).toBeVisible();
  });

  test('should close mobile sidebar when clicking close button', async ({ page }) => {
    // Open sidebar
    await page.click('.mobile-menu-btn');
    await page.waitForTimeout(300);
    
    // Click close button - use aria-label with correct case
    const closeButton = page.locator('button[aria-label*="Close"]');
    await closeButton.click();
    await page.waitForTimeout(500); // Increased wait for animation
    
    // Verify sidebar is closed
    const sidebarCount = await page.locator('.mobile-sidebar').count();
    expect(sidebarCount).toBe(0);
  });

  test('should close sidebar when clicking backdrop', async ({ page }) => {
    // Open sidebar
    await page.click('.mobile-menu-btn');
    await page.waitForTimeout(300);
    
    // Verify sidebar is open
    await expect(page.locator('.mobile-sidebar')).toBeVisible();
    
    // Click on backdrop - need to click outside the sidebar element
    // The backdrop is the parent div, sidebar is positioned inside it
    const backdrop = page.locator('.fixed.inset-0').first();
    
    // Get the sidebar bounding box to click outside of it
    const sidebarBox = await page.locator('.mobile-sidebar').boundingBox();
    if (sidebarBox) {
      // Click to the right of the sidebar (which should be the backdrop)
      await page.mouse.click(sidebarBox.x + sidebarBox.width + 50, sidebarBox.y + 50);
    } else {
      // Fallback: click on far right of screen
      await page.mouse.click(350, 200);
    }
    
    await page.waitForTimeout(500);
    
    // Verify sidebar is closed
    await expect(page.locator('.mobile-sidebar')).not.toBeVisible({ timeout: 2000 });
  });

  test('should switch views from mobile sidebar', async ({ page }) => {
    // Open sidebar
    await page.click('.mobile-menu-btn');
    await page.waitForTimeout(300);
    
    // Click Week view in sidebar
    const sidebar = page.locator('.mobile-sidebar');
    await sidebar.locator('button:has-text("Week")').click();
    await page.waitForTimeout(500);
    
    // Verify week view is displayed
    await expect(page.locator('.week-view')).toBeVisible();
    
    // Open sidebar again
    await page.click('.mobile-menu-btn');
    await page.waitForTimeout(300);
    
    // Click Day view
    await sidebar.locator('button:has-text("Day")').click();
    await page.waitForTimeout(500);
    
    // Verify day view is displayed
    await expect(page.locator('.day-view')).toBeVisible();
  });

  test('should display calendar list in sidebar', async ({ page }) => {
    // Open sidebar
    await page.click('.mobile-menu-btn');
    await page.waitForTimeout(300);
    
    // Verify calendar categories are listed - use .first() for strict mode
    const sidebar = page.locator('.mobile-sidebar');
    await expect(sidebar.locator('text=Work').first()).toBeVisible();
    await expect(sidebar.locator('text=Personal').first()).toBeVisible();
    await expect(sidebar.locator('text=Family').first()).toBeVisible();
  });
});
