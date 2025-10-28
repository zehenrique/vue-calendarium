import { test, expect } from '@playwright/test';

test.describe('Event Modals (Desktop)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for Vue app to mount
    await page.waitForSelector('#app', { timeout: 10000 });
    await page.waitForTimeout(1000); // Give Vue time to render
    await expect(page.locator('.google-calendar')).toBeVisible({ timeout: 5000 });
  });

  test('should open event creation modal when clicking on a date', async ({ page }) => {
    // Switch to month view
    await page.click('button.view-btn:has-text("Month")');
    await page.waitForTimeout(300);
    
    // Click on a date cell - use calendar-day class
    const dateCell = page.locator('.calendar-day').first();
    await dateCell.click();
    
    // Verify modal is visible - look for the modal backdrop
    const modal = page.locator('.fixed.inset-0').first();
    await expect(modal).toBeVisible({ timeout: 2000 });
    
    // Verify modal has title input
    await expect(page.locator('input').first()).toBeVisible();
  });

  test('should close modal when clicking outside', async ({ page }) => {
    // Open modal by clicking a date
    await page.click('button.view-btn:has-text("Month")');
    await page.waitForTimeout(300);
    const dateCell = page.locator('.calendar-day').first();
    await dateCell.click();
    
    // Wait for modal to open
    await page.waitForSelector('.fixed.inset-0', { timeout: 2000 });
    
    // Click on backdrop (outside modal content)
    await page.locator('.fixed.inset-0').first().click({ position: { x: 10, y: 10 } });
    await page.waitForTimeout(300);
    
    // Modal should be closed - no fixed backdrop visible
    const modalCount = await page.locator('.fixed.inset-0').count();
    expect(modalCount).toBe(0);
  });

  test('should create an event with title', async ({ page }) => {
    // Switch to day view for easier event creation
    await page.click('button.view-btn:has-text("Day")');
    await page.waitForTimeout(500);
    
    // Click on an early morning hour slot that won't have sample events (e.g., hour 6 = 6:00 AM)
    const hourSlot = page.locator('.hour-slot').nth(6); // 06:00 slot
    await hourSlot.click({ force: true });
    
    // Wait for modal with input field
    await page.waitForSelector('input[type="text"], input:not([type])', { timeout: 3000 });
    await page.waitForTimeout(300);
    
    // Fill in event title - use a more specific selector for the title input
    const titleInput = page.locator('input').first();
    await titleInput.fill('Test Event');
    await page.waitForTimeout(200);
    
    // Click save button - be more specific
    const saveButton = page.locator('button:has-text("Save")');
    await expect(saveButton).toBeVisible();
    await saveButton.click();
    await page.waitForTimeout(1000);
    
    // Verify event appears in the calendar - check for the event in day view
    await expect(page.locator('.day-event:has-text("Test Event")')).toBeVisible({ timeout: 5000 });
  });

  test('should show event detail modal when clicking on an event', async ({ page }) => {
    // First create an event
    await page.click('button.view-btn:has-text("Day")');
    await page.waitForTimeout(500);
    
    const hourSlot = page.locator('.hour-slot').nth(7); // 07:00 slot
    await hourSlot.click({ force: true });
    await page.waitForSelector('input[type="text"], input:not([type])', { timeout: 3000 });
    await page.waitForTimeout(300);
    await page.locator('input').first().fill('Detail Test Event');
    await page.waitForTimeout(200);
    await page.click('button:has-text("Save")');
    await page.waitForTimeout(1000);
    
    // Wait for event to appear
    await expect(page.locator('.day-event:has-text("Detail Test Event")')).toBeVisible({ timeout: 5000 });
    
    // Click on the created event
    const event = page.locator('.day-event:has-text("Detail Test Event")').first();
    await event.click();
    await page.waitForTimeout(300);
    
    // Verify detail modal shows event information - use heading to avoid strict mode
    await expect(page.locator('h2:has-text("Detail Test Event")')).toBeVisible();
    
    // Verify edit and delete buttons are present
    await expect(page.locator('button:has-text("Edit")')).toBeVisible();
    await expect(page.locator('button:has-text("Delete")')).toBeVisible();
  });

  test('should edit an existing event', async ({ page }) => {
    // Create an event first
    await page.click('button.view-btn:has-text("Day")');
    await page.waitForTimeout(500);
    
    const hourSlot = page.locator('.hour-slot').nth(19); // 19:00 slot (evening)
    await hourSlot.click({ force: true });
    await page.waitForSelector('input[type="text"], input:not([type])', { timeout: 3000 });
    await page.waitForTimeout(300);
    await page.locator('input').first().fill('Original Event');
    await page.waitForTimeout(200);
    await page.click('button:has-text("Save")');
    await page.waitForTimeout(1000);
    
    // Wait for event to appear
    await expect(page.locator('.day-event:has-text("Original Event")')).toBeVisible({ timeout: 5000 });
    
    // Click on event to open detail modal
    await page.locator('.day-event:has-text("Original Event")').first().click();
    await page.waitForTimeout(500);
    
    // Verify modal is open
    await expect(page.locator('h2:has-text("Original Event")')).toBeVisible();
    
    // Click edit button - use dispatchEvent as workaround for viewport issue
    await page.locator('button:has-text("Edit")').dispatchEvent('click');
    await page.waitForTimeout(300);
    
    // Modify title
    const titleInput = page.locator('input').first();
    await titleInput.clear();
    await titleInput.fill('Edited Event');
    await page.waitForTimeout(200);
    
    // Save changes
    await page.click('button:has-text("Save")');
    await page.waitForTimeout(1000);
    
    // Verify updated event appears
    await expect(page.locator('.day-event:has-text("Edited Event")')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('.day-event:has-text("Original Event")')).not.toBeVisible();
  });

  test('should delete an event', async ({ page }) => {
    // Create an event
    await page.click('button.view-btn:has-text("Day")');
    await page.waitForTimeout(500);
    
    const hourSlot = page.locator('.hour-slot').nth(20); // 20:00 slot (evening)
    await hourSlot.click({ force: true });
    await page.waitForSelector('input[type="text"], input:not([type])', { timeout: 3000 });
    await page.waitForTimeout(300);
    await page.locator('input').first().fill('Event to Delete');
    await page.waitForTimeout(200);
    await page.click('button:has-text("Save")');
    await page.waitForTimeout(1000);
    
    // Wait for event to appear
    await expect(page.locator('.day-event:has-text("Event to Delete")')).toBeVisible({ timeout: 5000 });
    
    // Click on event
    await page.locator('.day-event:has-text("Event to Delete")').first().click();
    await page.waitForTimeout(500);
    
    // Verify modal is open
    await expect(page.locator('h2:has-text("Event to Delete")')).toBeVisible();
    
    // Click delete button - use dispatchEvent as workaround for viewport issue
    await page.locator('button:has-text("Delete")').dispatchEvent('click');
    await page.waitForTimeout(300);
    
    // Confirm deletion
    await page.click('button:has-text("Yes")');
    await page.waitForTimeout(500);
    
    // Verify event is gone
    await expect(page.locator('.day-event:has-text("Event to Delete")')).not.toBeVisible();
  });

  test('should cancel deletion', async ({ page }) => {
    // Create an event
    await page.click('button.view-btn:has-text("Day")');
    await page.waitForTimeout(500);
    
    const hourSlot = page.locator('.hour-slot').nth(21); // 21:00 slot (evening)
    await hourSlot.click({ force: true });
    await page.waitForSelector('input[type="text"], input:not([type])', { timeout: 3000 });
    await page.waitForTimeout(300);
    await page.locator('input').first().fill('Event to Keep');
    await page.waitForTimeout(200);
    await page.click('button:has-text("Save")');
    await page.waitForTimeout(1000);
    
    // Wait for event to appear
    await expect(page.locator('.day-event:has-text("Event to Keep")')).toBeVisible({ timeout: 5000 });
    
    // Click on event
    await page.locator('.day-event:has-text("Event to Keep")').first().click();
    await page.waitForTimeout(500);
    
    // Verify modal is open
    await expect(page.locator('h2:has-text("Event to Keep")')).toBeVisible();
    
    // Click delete button - use dispatchEvent as workaround for viewport issue
    await page.locator('button:has-text("Delete")').dispatchEvent('click');
    await page.waitForTimeout(300);
    
    // Cancel deletion
    await page.click('button:has-text("No")');
    await page.waitForTimeout(300);
    
    // Verify event still exists
    await expect(page.locator('.day-event:has-text("Event to Keep")')).toBeVisible();
  });
});
