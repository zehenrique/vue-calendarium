import { test, expect } from '@playwright/test';

const TEST_NOW = '2025-01-15T09:00:00';

async function loadCalendar(page) {
  await page.addInitScript(({ testNow }) => {
    window.__CALENDAR_TEST_NOW__ = testNow;
  }, { testNow: TEST_NOW });

  await page.goto('/');
  await expect(page.locator('.vue-calendarium')).toBeVisible({ timeout: 5000 });
}

test.describe('Basic Smoke Tests', () => {
  test('should load the application', async ({ page }) => {
    // Capture console messages
    page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
    page.on('pageerror', error => console.log('BROWSER ERROR:', error.message));

    await loadCalendar(page);

    // Check for the main heading - use first() to avoid strict mode violation
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 5000 });
    
    // Take a screenshot for debugging
    await page.screenshot({ path: 'test-results/homepage.png', fullPage: true });
    
    // Log what's on the page
    const bodyText = await page.locator('body').textContent();
    console.log('Page content preview:', bodyText.substring(0, 200));
  });

  test('should have calendar component', async ({ page }) => {
    // Capture console messages
    page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
    page.on('pageerror', error => console.log('BROWSER ERROR:', error.message));
    
  await loadCalendar(page);

    // More lenient wait - just check if anything loaded
    const calendar = page.locator('.vue-calendarium');
    const isVisible = await calendar.isVisible().catch(() => false);
    
    if (!isVisible) {
      console.log('Calendar not visible, checking page HTML...');
      const html = await page.content();
      console.log('Page HTML:', html.substring(0, 500));
    }
    
    await expect(calendar).toBeVisible({ timeout: 15000 });
  });
});
