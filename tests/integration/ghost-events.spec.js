import { test, expect } from '@playwright/test';

test.describe('Ghost Events API', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.google-calendar');
  });

  test('should expose ghost event methods on calendar app', async ({ page }) => {
    const hasShowMethod = await page.evaluate(() => {
      const app = window.calendarApp;
      return typeof app.showGhostEvent === 'function';
    });
    
    const hasUpdateMethod = await page.evaluate(() => {
      const app = window.calendarApp;
      return typeof app.updateGhostEvent === 'function';
    });
    
    const hasHideMethod = await page.evaluate(() => {
      const app = window.calendarApp;
      return typeof app.hideGhostEvent === 'function';
    });
    
    const hasGhostProperty = await page.evaluate(() => {
      const app = window.calendarApp;
      return 'ghostEvent' in app;
    });

    expect(hasShowMethod).toBe(true);
    expect(hasUpdateMethod).toBe(true);
    expect(hasHideMethod).toBe(true);
    expect(hasGhostProperty).toBe(true);
  });

  test('should show ghost event on calendar', async ({ page }) => {
    // Switch to week view for better visibility
    await page.evaluate(() => {
      window.calendarApp.setView('week');
    });
    await page.waitForTimeout(500);

    // Initially no ghost event
    const initialGhost = await page.evaluate(() => {
      return window.calendarApp.ghostEvent.value;
    });
    expect(initialGhost).toBeNull();

    // Show ghost event
    await page.evaluate(() => {
      window.calendarApp.showGhostEvent({
        title: 'Test Ghost Event',
        start: '2025-01-15T10:00:00',
        end: '2025-01-15T11:00:00',
        calendarId: 'personal',
        color: '#1967D2'
      });
    });
    await page.waitForTimeout(300);

    // Check ghost event is set
    const ghostEvent = await page.evaluate(() => {
      return window.calendarApp.ghostEvent.value;
    });
    
    expect(ghostEvent).not.toBeNull();
    expect(ghostEvent.title).toBe('Test Ghost Event');
    expect(ghostEvent.isGhost).toBe(true);
    expect(ghostEvent.id).toBe('ghost-event');
  });

  test('should update ghost event', async ({ page }) => {
    // Show ghost event
    await page.evaluate(() => {
      window.calendarApp.showGhostEvent({
        title: 'Original Title',
        start: '2025-01-15T10:00:00',
        end: '2025-01-15T11:00:00'
      });
    });

    // Update ghost event
    await page.evaluate(() => {
      window.calendarApp.updateGhostEvent({
        title: 'Updated Title'
      });
    });

    // Check ghost event was updated
    const ghostEvent = await page.evaluate(() => {
      return window.calendarApp.ghostEvent.value;
    });
    
    expect(ghostEvent.title).toBe('Updated Title');
    expect(ghostEvent.start).toBe('2025-01-15T10:00:00');
    expect(ghostEvent.isGhost).toBe(true);
  });

  test('should hide ghost event', async ({ page }) => {
    // Show ghost event
    await page.evaluate(() => {
      window.calendarApp.showGhostEvent({
        title: 'Test Event',
        start: '2025-01-15T10:00:00',
        end: '2025-01-15T11:00:00'
      });
    });

    // Verify it's shown
    let ghostEvent = await page.evaluate(() => {
      return window.calendarApp.ghostEvent.value;
    });
    expect(ghostEvent).not.toBeNull();

    // Hide ghost event
    await page.evaluate(() => {
      window.calendarApp.hideGhostEvent();
    });

    // Verify it's hidden
    ghostEvent = await page.evaluate(() => {
      return window.calendarApp.ghostEvent.value;
    });
    expect(ghostEvent).toBeNull();

    // Check DOM is updated
    const ghostElements = await page.locator('.ghost-event').count();
    expect(ghostElements).toBe(0);
  });

  test('should show ghost event with custom ID', async ({ page }) => {
    await page.evaluate(() => {
      window.calendarApp.showGhostEvent({
        id: 'custom-ghost-123',
        title: 'Custom Ghost',
        start: '2025-01-15T14:00:00',
        end: '2025-01-15T15:00:00'
      });
    });

    const ghostEvent = await page.evaluate(() => {
      return window.calendarApp.ghostEvent.value;
    });
    
    expect(ghostEvent.id).toBe('custom-ghost-123');
    expect(ghostEvent.isGhost).toBe(true);
  });
});
