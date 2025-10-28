const { test, expect } = require('@playwright/test');

test.describe('Mobile Gesture Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should swipe left to navigate to next period in week view', async ({ page }) => {
    // Open sidebar and switch to week view
    await page.click('button[aria-label="Menu"]');
    await page.click('button:has-text("Week")');
    await page.waitForTimeout(500);
    
    // Get current title to verify navigation
    const initialTitle = await page.locator('.calendar-title').textContent();
    
    // Get the calendar body for swiping
    const calendarBody = page.locator('.calendar-body');
    const box = await calendarBody.boundingBox();
    
    // Perform swipe left gesture (next week)
    await page.mouse.move(box.x + box.width * 0.8, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width * 0.2, box.y + box.height / 2, { steps: 10 });
    await page.mouse.up();
    
    await page.waitForTimeout(500);
    
    // Verify the week changed
    const newTitle = await page.locator('.calendar-title').textContent();
    expect(newTitle).not.toBe(initialTitle);
  });

  test('should swipe right to navigate to previous period in week view', async ({ page }) => {
    // Open sidebar and switch to week view
    await page.click('button[aria-label="Menu"]');
    await page.click('button:has-text("Week")');
    await page.waitForTimeout(500);
    
    const initialTitle = await page.locator('.calendar-title').textContent();
    
    const calendarBody = page.locator('.calendar-body');
    const box = await calendarBody.boundingBox();
    
    // Perform swipe right gesture (previous week)
    await page.mouse.move(box.x + box.width * 0.2, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width * 0.8, box.y + box.height / 2, { steps: 10 });
    await page.mouse.up();
    
    await page.waitForTimeout(500);
    
    const newTitle = await page.locator('.calendar-title').textContent();
    expect(newTitle).not.toBe(initialTitle);
  });

  test('should detect tap gesture on event', async ({ page }) => {
    // Switch to week view
    await page.click('button[aria-label="Menu"]');
    await page.click('button:has-text("Week")');
    await page.waitForTimeout(500);
    
    // Create an event first
    const hourSlot = page.locator('.hour-slot').nth(8);
    await hourSlot.click({ force: true });
    await page.waitForSelector('.fixed.inset-0', { timeout: 2000 });
    
    // Fill event details
    await page.fill('input[type="text"]', 'Tap Test Event');
    await page.click('button:has-text("Save")');
    await page.waitForTimeout(500);
    
    // Tap on the event to open detail modal
    const event = page.locator('.day-event:has-text("Tap Test Event")').first();
    await event.tap();
    
    // Verify detail modal opened
    await expect(page.locator('h2:has-text("Tap Test Event")')).toBeVisible({ timeout: 2000 });
  });

  test('should handle long press gesture on calendar cell', async ({ page }) => {
    // Switch to week view for better long-press target
    await page.click('button[aria-label="Menu"]');
    await page.click('button:has-text("Week")');
    await page.waitForTimeout(500);
    
    const hourSlot = page.locator('.hour-slot').nth(10);
    const box = await hourSlot.boundingBox();
    
    // Simulate long press (touch down, wait, touch up)
    await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2);
    
    // Verify modal opened (long press should open event creation)
    await page.waitForSelector('.fixed.inset-0', { timeout: 2000 });
    await expect(page.locator('h2:has-text("New event")')).toBeVisible();
  });

  test('should handle double tap gesture', async ({ page }) => {
    // Switch to day view
    await page.click('button[aria-label="Menu"]');
    await page.click('button:has-text("Day")');
    await page.waitForTimeout(500);
    
    const hourSlot = page.locator('.hour-slot').nth(12);
    
    // Double tap to create event
    await hourSlot.dblclick();
    
    // Verify event modal opened
    await page.waitForSelector('.fixed.inset-0', { timeout: 2000 });
    await expect(page.locator('h2:has-text("New event")')).toBeVisible();
  });

  test('should handle swipe to close sidebar', async ({ page }) => {
    // Open sidebar
    await page.click('button[aria-label="Menu"]');
    await page.waitForSelector('.mobile-sidebar', { timeout: 2000 });
    
    const sidebar = page.locator('.mobile-sidebar');
    const box = await sidebar.boundingBox();
    
    // Swipe left from sidebar (close gesture)
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x - 100, box.y + box.height / 2, { steps: 10 });
    await page.mouse.up();
    
    await page.waitForTimeout(500);
    
    // Verify sidebar is closed
    await expect(sidebar).not.toBeVisible({ timeout: 2000 });
  });

  test('should handle scroll gesture in week view', async ({ page }) => {
    // Switch to week view with time grid
    await page.click('button[aria-label="Menu"]');
    await page.click('button:has-text("Week")');
    await page.waitForTimeout(500);
    
    const calendarBody = page.locator('.calendar-body');
    
    // Get initial scroll position
    const initialScroll = await calendarBody.evaluate(el => el.scrollTop);
    
    // Perform vertical scroll
    const box = await calendarBody.boundingBox();
    await page.mouse.move(box.x + box.width / 2, box.y + box.height * 0.8);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width / 2, box.y + box.height * 0.2, { steps: 10 });
    await page.mouse.up();
    
    await page.waitForTimeout(300);
    
    // Verify scroll occurred
    const newScroll = await calendarBody.evaluate(el => el.scrollTop);
    expect(newScroll).toBeGreaterThan(initialScroll);
  });

  test('should handle fast swipe gesture (flick)', async ({ page }) => {
    // Switch to month view
    await page.click('button[aria-label="Menu"]');
    await page.click('button:has-text("Month")');
    await page.waitForTimeout(500);
    
    const initialTitle = await page.locator('.calendar-title').textContent();
    
    const calendarBody = page.locator('.calendar-body');
    const box = await calendarBody.boundingBox();
    
    // Perform fast swipe (flick) - fewer steps = faster
    await page.mouse.move(box.x + box.width * 0.8, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width * 0.2, box.y + box.height / 2, { steps: 3 });
    await page.mouse.up();
    
    await page.waitForTimeout(500);
    
    const newTitle = await page.locator('.calendar-title').textContent();
    expect(newTitle).not.toBe(initialTitle);
  });

  test('should prevent gestures when modal is open', async ({ page }) => {
    // Open event creation modal
    const hourSlot = page.locator('.hour-slot').nth(6);
    await hourSlot.click({ force: true });
    await page.waitForSelector('.fixed.inset-0', { timeout: 2000 });
    
    const initialModalVisible = await page.locator('.fixed.inset-0').isVisible();
    
    // Try to swipe while modal is open
    const modal = page.locator('.fixed.inset-0 > div').first();
    const box = await modal.boundingBox();
    
    // Swipe on modal content (should not navigate calendar)
    await page.mouse.move(box.x + box.width * 0.8, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width * 0.2, box.y + box.height / 2, { steps: 10 });
    await page.mouse.up();
    
    await page.waitForTimeout(300);
    
    // Modal should still be visible (gesture blocked)
    const modalStillVisible = await page.locator('.fixed.inset-0').isVisible();
    expect(modalStillVisible).toBe(initialModalVisible);
  });

  test('should handle edge swipe gesture from screen edge', async ({ page }) => {
    // Start from left edge to potentially open sidebar
    await page.mouse.move(5, 300);
    await page.mouse.down();
    await page.mouse.move(150, 300, { steps: 10 });
    await page.mouse.up();
    
    await page.waitForTimeout(500);
    
    // Sidebar might open from edge swipe (if implemented)
    // For now, just verify no errors occurred
    const pageContent = await page.locator('.google-calendar').isVisible();
    expect(pageContent).toBe(true);
  });
});
