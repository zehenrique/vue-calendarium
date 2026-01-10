import { test, expect } from '@playwright/test';

const TEST_NOW = '2025-01-15T09:00:00'; // Wednesday

test.describe('Drag and Drop (Desktop)', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(({ testNow }) => {
      window.__CALENDAR_TEST_NOW__ = testNow;
    }, { testNow: TEST_NOW });

    await page.goto('/');
    
    // Switch to Week view
    const viewToggle = page.getByTestId('view-toggle');
    await expect(viewToggle).toBeVisible();
    await viewToggle.click();
    
    // Wait for dropdown to open
    await expect(page.locator('.v-overlay__content')).toBeVisible();
    
    // Click Week option
    await page.getByRole('option', { name: 'Week' }).click();
    
    await expect(page.locator('.week-view')).toBeVisible();
  });

  test('should drag and drop an event to a new time slot', async ({ page }) => {
    // Find the "Team Meeting" event (Wednesday 10:00)
    const eventLocator = page.locator('.week-event').filter({ hasText: 'Team Meeting' }).first();
    await expect(eventLocator).toBeVisible();

    // Get event bounding box
    const eventBox = await eventLocator.boundingBox();
    expect(eventBox).not.toBeNull();
    
    // Calculate target position (e.g., 2 hours later)
    // The grid is roughly 54px per hour (desktop).
    // Move down by ~108px.
    
    const startX = eventBox.x + eventBox.width / 2;
    const startY = eventBox.y + eventBox.height / 2;
    const targetX = startX;
    const targetY = startY + 108; // 2 hours * 54px

    // Perform drag with long press
    await page.mouse.move(startX, startY);
    await page.mouse.down();
    await page.waitForTimeout(600); // Wait for long press (500ms threshold)
    await page.mouse.move(targetX, targetY, { steps: 10 });
    
    // Wait a bit to ensure drag is registered
    await page.waitForTimeout(100);
    
    await page.mouse.up();

    // Wait for update
    await page.waitForTimeout(500);
    
    // Check new position
    const newEventBox = await eventLocator.boundingBox();
    expect(newEventBox.y).toBeGreaterThan(eventBox.y + 50); // Should have moved significantly down
  });

  test('should open event detail modal on short click', async ({ page }) => {
    // Find the "Team Meeting" event
    const eventLocator = page.locator('.week-event').filter({ hasText: 'Team Meeting' }).first();
    await expect(eventLocator).toBeVisible();

    // Click it (short click)
    await eventLocator.click();

    // Expect detail modal to open
    await expect(page.getByTestId('event-detail-modal')).toBeVisible();
  });

  test('should NOT open event detail modal after drag', async ({ page }) => {
    // Find the "Team Meeting" event
    const eventLocator = page.locator('.week-event').filter({ hasText: 'Team Meeting' }).first();
    await expect(eventLocator).toBeVisible();
    
    const eventBox = await eventLocator.boundingBox();
    const startX = eventBox.x + eventBox.width / 2;
    const startY = eventBox.y + eventBox.height / 2;
    const targetY = startY + 108;

    // Perform drag
    await page.mouse.move(startX, startY);
    await page.mouse.down();
    await page.waitForTimeout(600); // Long press
    await page.mouse.move(startX, targetY, { steps: 10 });
    await page.mouse.up();

    // Expect detail modal NOT to be visible
    await expect(page.getByTestId('event-detail-modal')).not.toBeVisible();
  });
});
