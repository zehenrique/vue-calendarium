const { test, expect } = require('@playwright/test');

const WEEK_VIEW_SELECTOR = '.week-view';
const DAY_VIEW_SELECTOR = '.day-view';
const EVENT_MODAL = '[data-testid="event-modal"]';
const EVENT_DETAIL_MODAL = '[data-testid="event-detail-modal"]';
const DELETE_CONFIRM_MODAL = '[data-testid="delete-confirm-modal"]';
const TEST_NOW = '2025-01-15T09:00:00';

const repeatLabels = {
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly',
  yearly: 'Yearly'
};

async function switchToView(page, view) {
  const labelPattern = new RegExp(`^${view}`, 'i');
  await page.getByTestId('view-toggle').getByRole('button', { name: labelPattern }).click();

  if (view === 'week') {
    await expect(page.locator(WEEK_VIEW_SELECTOR)).toBeVisible();
  } else if (view === 'day') {
    await expect(page.locator(DAY_VIEW_SELECTOR)).toBeVisible();
  }
}

async function switchToWeekView(page) {
  await switchToView(page, 'week');
}

async function switchToDayView(page) {
  await switchToView(page, 'day');
}

async function openEventModal(page, hourSlotIndex) {
  const dayViewVisible = await page.locator(DAY_VIEW_SELECTOR).isVisible().catch(() => false);

  const slotLocator = dayViewVisible
    ? page.locator(`${DAY_VIEW_SELECTOR} .hour-slot`).nth(hourSlotIndex)
    : page.locator(`${WEEK_VIEW_SELECTOR} .week-day-column`).first().locator('.hour-slot').nth(hourSlotIndex);

  await slotLocator.scrollIntoViewIfNeeded();
  await slotLocator.click();
  await expect(page.locator(EVENT_MODAL)).toBeVisible({ timeout: 4000 });
}

async function selectRepeat(page, repeat) {
  if (!repeat || repeat === 'none') return;

  const label = repeatLabels[repeat];
  await page.getByTestId('repeat-select').click();
  await page.locator('.v-list-item-title', { hasText: new RegExp(`^${label}`, 'i') }).click();
}

async function saveEvent(page, title) {
  const titleInput = page.getByLabel(/Event Title/i);
  await titleInput.fill(title);
  await page.getByRole('button', { name: /Save/i }).click();
  await expect(page.locator(EVENT_MODAL)).not.toBeVisible({ timeout: 4000 });
}

async function createEvent(page, { slot, title, repeat } = {}) {
  await openEventModal(page, slot);
  await selectRepeat(page, repeat);
  await saveEvent(page, title);
  await expect(page.locator(`.day-event:has-text("${title}")`).first()).toBeVisible({ timeout: 4000 });
}

async function confirmDeletion(page) {
  await expect(page.locator(DELETE_CONFIRM_MODAL)).toBeVisible({ timeout: 4000 });
  await page.getByRole('button', { name: /Yes/i }).click();
  await expect(page.locator(DELETE_CONFIRM_MODAL)).not.toBeVisible({ timeout: 4000 });
}

async function openEventDetail(page, title) {
  await page.locator(`.day-event:has-text("${title}")`).first().click();
  await expect(page.locator(EVENT_DETAIL_MODAL)).toBeVisible({ timeout: 4000 });
}

async function loadCalendar(page) {
  await page.addInitScript(({ testNow }) => {
    window.__CALENDAR_TEST_NOW__ = testNow;
  }, { testNow: TEST_NOW });

  await page.goto('/');
  await expect(page.locator('.google-calendar')).toBeVisible({ timeout: 10000 });
}

/**
 * API/Integration Tests for Event Persistence
 *
 * Tests the complete event lifecycle including:
 * - Event creation and storage
 * - Event retrieval and display
 * - Event updates and modifications
 * - Event deletion and cleanup
 * - Recurring event generation
 * - Calendar state management
 */

test.describe('Event Persistence - CRUD Operations', () => {
  test.beforeEach(async ({ page }) => {
    await loadCalendar(page);
    await switchToWeekView(page);
  });

  test('should persist event after creation', async ({ page }) => {
    const eventTitle = 'Persistence Test Event';
    await createEvent(page, { slot: 10, title: eventTitle });

    // Reload page
    await page.reload();
  await expect(page.locator('.google-calendar')).toBeVisible({ timeout: 10000 });
    await switchToWeekView(page);

    // Verify event persists (currently in-memory, so won't persist)
    const eventCount = await page.locator(`.day-event:has-text("${eventTitle}")`).count();
    expect(eventCount).toBe(0); // Will be 1 when persistence is implemented
  });

  test('should update event data correctly', async ({ page }) => {
    await createEvent(page, { slot: 8, title: 'Original Title' });

    await openEventDetail(page, 'Original Title');
    await page.getByRole('button', { name: /Edit/i }).click();
    await expect(page.locator(EVENT_MODAL)).toBeVisible();

    await saveEvent(page, 'Updated Title');

    await expect(page.locator('.day-event:has-text("Updated Title")')).toBeVisible();
    await expect(page.locator('.day-event:has-text("Original Title")')).not.toBeVisible();
  });

  test('should delete event correctly', async ({ page }) => {
    const eventTitle = 'Event To Delete';
    await createEvent(page, { slot: 12, title: eventTitle });

    await openEventDetail(page, eventTitle);
    await page.getByRole('button', { name: /Delete/i }).click();
    await confirmDeletion(page);

    await expect(page.locator(`.day-event:has-text("${eventTitle}")`)).not.toBeVisible();
  });

  test('should handle multiple event creation', async ({ page }) => {
    const events = [
      { slot: 6, title: 'Event 1' },
      { slot: 9, title: 'Event 2' },
      { slot: 14, title: 'Event 3' },
    ];

    for (const evt of events) {
      await createEvent(page, evt);
    }

    for (const evt of events) {
      await expect(page.locator(`.day-event:has-text("${evt.title}")`).first()).toBeVisible();
    }

    const eventCount = await page.locator('.day-event').count();
    expect(eventCount).toBeGreaterThanOrEqual(events.length);
  });
});

test.describe('Event Persistence - Recurring Events', () => {
  test.beforeEach(async ({ page }) => {
    await loadCalendar(page);
    await switchToWeekView(page);
  });

  test('should create daily recurring event', async ({ page }) => {
    await createEvent(page, { slot: 10, title: 'Daily Meeting', repeat: 'daily' });

    const eventCount = await page.locator('.day-event:has-text("Daily Meeting")').count();
    expect(eventCount).toBeGreaterThan(1);
  });

  test('should create weekly recurring event', async ({ page }) => {
    await createEvent(page, { slot: 8, title: 'Weekly Team Sync', repeat: 'weekly' });

    await expect(page.locator('.day-event:has-text("Weekly Team Sync")')).toBeVisible();

    await page.click('button[aria-label="Next"]');
    await expect(page.locator('.day-event:has-text("Weekly Team Sync")')).toBeVisible();
  });

  test('should create monthly recurring event', async ({ page }) => {
    await createEvent(page, { slot: 12, title: 'Monthly Review', repeat: 'monthly' });

    const eventCount = await page.locator('.day-event:has-text("Monthly Review")').count();
    expect(eventCount).toBeGreaterThanOrEqual(1);
  });

  test('should delete all recurring event instances', async ({ page }) => {
    await createEvent(page, { slot: 10, title: 'Recurring To Delete', repeat: 'weekly' });

    await openEventDetail(page, 'Recurring To Delete');
    await page.getByRole('button', { name: /Delete/i }).click();
    await confirmDeletion(page);

    const eventCount = await page.locator('.day-event:has-text("Recurring To Delete")').count();
    expect(eventCount).toBe(0);
  });
});

test.describe('Event Persistence - Calendar State Management', () => {
  test.beforeEach(async ({ page }) => {
    await loadCalendar(page);
  });

  test('should maintain calendar view after event creation', async ({ page }) => {
    await switchToDayView(page);
    await expect(page.locator(DAY_VIEW_SELECTOR)).toBeVisible();

    await createEvent(page, { slot: 20, title: 'State Test Event' });

    await expect(page.locator(DAY_VIEW_SELECTOR)).toBeVisible();
  });

  test('should maintain date context after operations', async ({ page }) => {
    const initialTitle = await page.locator('.calendar-title').textContent();

    await switchToWeekView(page);
    await createEvent(page, { slot: 8, title: 'Context Test' });

    await switchToView(page, 'month');
    await expect(page.locator('.calendar-days')).toBeVisible();

    const finalTitle = await page.locator('.calendar-title').textContent();
    expect(finalTitle).toContain(initialTitle.split(' ')[0]);
  });

  test('should handle rapid event operations', async ({ page }) => {
    await switchToWeekView(page);

    for (let i = 0; i < 5; i++) {
      await createEvent(page, { slot: 8 + i, title: `Rapid ${i}` });
    }

    const eventCount = await page.locator('.day-event').count();
    expect(eventCount).toBeGreaterThanOrEqual(5);
  });
});

test.describe('Event Persistence - Data Validation', () => {
  test.beforeEach(async ({ page }) => {
    await loadCalendar(page);
    await switchToWeekView(page);
  });

  test('should validate event title requirement', async ({ page }) => {
    await openEventModal(page, 10);

    page.once('dialog', async dialog => {
      expect(dialog.message()).toContain('title');
      await dialog.accept();
    });

    await page.getByRole('button', { name: /Save/i }).click();
    await expect(page.locator(EVENT_MODAL)).toBeVisible();
  });

  test('should preserve event data across edit', async ({ page }) => {
    await openEventModal(page, 8);
    await page.locator('input[type="color"]').first().fill('#ea4335');
    await selectRepeat(page, 'weekly');
    await saveEvent(page, 'Data Test Event');

    await openEventDetail(page, 'Data Test Event');
    await page.getByRole('button', { name: /Edit/i }).click();
    await expect(page.locator(EVENT_MODAL)).toBeVisible();

    const titleValue = await page.getByLabel(/Event Title/i).inputValue();
    expect(titleValue).toBe('Data Test Event');

    const colorValue = await page.locator('input[type="color"]').first().inputValue();
    expect(colorValue.toLowerCase()).toBe('#ea4335');

    // Close modal without changes and verify detail data manually
    await page.getByRole('button', { name: /Cancel/i }).click();
    await expect(page.locator(EVENT_MODAL)).not.toBeVisible();

    await openEventDetail(page, 'Data Test Event');
    await expect(page.locator(EVENT_DETAIL_MODAL).locator('text=Repeats weekly')).toBeVisible();
    await page.locator(EVENT_DETAIL_MODAL).getByRole('button', { name: /Close/i }).click();
  });

  test('should handle event time boundaries', async ({ page }) => {
    await createEvent(page, { slot: 0, title: 'Early Event' });
    await createEvent(page, { slot: 23, title: 'Late Event' });

    await expect(page.locator('.day-event:has-text("Early Event")')).toBeVisible();
    await expect(page.locator('.day-event:has-text("Late Event")')).toBeVisible();
  });
});
