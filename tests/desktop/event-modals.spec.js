import { test, expect } from '@playwright/test';

const TEST_NOW = '2025-01-15T09:00:00';

async function switchToView(page, view) {
  const viewToggle = page.getByTestId('view-toggle');
  await viewToggle.click();
  await page.getByRole('option', { name: new RegExp(view, 'i') }).click();

  if (view === 'day') {
    await expect(page.locator('.day-view')).toBeVisible({ timeout: 2000 });
  } else if (view === 'week') {
    await expect(page.locator('.week-view')).toBeVisible({ timeout: 2000 });
  } else if (view === 'month') {
    await expect(page.locator('.calendar-days')).toBeVisible({ timeout: 2000 });
  }
}

async function openEventModal(page, slotIndex) {
  const slot = page.locator('.hour-slot').nth(slotIndex);
  await slot.click({ force: true });
  await expect(page.getByTestId('event-modal')).toBeVisible({ timeout: 2000 });
}

async function createEvent(page, { slot, title }) {
  await openEventModal(page, slot);
  await page.getByPlaceholder(/Event title|Add title/i).fill(title);
  await page.getByRole('button', { name: /Save/i }).click();
  await expect(page.getByTestId('event-modal')).not.toBeVisible({ timeout: 2000 });
  // Small wait for Vue reactivity to settle
  await page.waitForTimeout(100);
  // Wait for event to appear - it could be .day-event or .month-event depending on view
  await expect(page.locator(`.day-event:has-text("${title}"), .month-event:has-text("${title}")`).first()).toBeVisible({ timeout: 2000 });
}

test.describe('Event Modals (Desktop)', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(({ testNow }) => {
      window.__CALENDAR_TEST_NOW__ = testNow;
    }, { testNow: TEST_NOW });

    await page.goto('/');
    await expect(page.locator('.google-calendar')).toBeVisible({ timeout: 5000 });
  });

  test('should open event creation modal when clicking on a date', async ({ page }) => {
    await switchToView(page, 'month');

    await page.locator('.calendar-day').first().click();
    await expect(page.getByTestId('event-modal')).toBeVisible({ timeout: 2000 });
    await expect(page.getByPlaceholder(/Event title|Add title/i)).toBeVisible();
  });

  test('should close modal when canceling', async ({ page }) => {
    await switchToView(page, 'month');
    await page.locator('.calendar-day').first().click();
    await expect(page.getByTestId('event-modal')).toBeVisible({ timeout: 2000 });

    await page.getByRole('button', { name: /cancel/i }).click();
    await expect(page.getByTestId('event-modal')).not.toBeVisible({ timeout: 2000 });
  });

  test('should create an event with title', async ({ page }) => {
    await switchToView(page, 'day');
    await createEvent(page, { slot: 6, title: 'Test Event' });
  });

  test('should show event detail modal when clicking on an event', async ({ page }) => {
    await switchToView(page, 'day');
    await createEvent(page, { slot: 7, title: 'Detail Test Event' });

    await page.locator('.day-event:has-text("Detail Test Event")').first().click();
    await expect(page.getByTestId('event-detail-modal')).toBeVisible({ timeout: 4000 });
    await expect(page.getByTestId('event-detail-modal').getByText('Detail Test Event', { exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: /Edit/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Delete/i })).toBeVisible();
  });

  test('should edit an existing event', async ({ page }) => {
    await switchToView(page, 'day');
    await createEvent(page, { slot: 19, title: 'Original Event' });

    await page.locator('.day-event:has-text("Original Event")').first().click();
    await page.getByRole('button', { name: /Edit/i }).click();
    await expect(page.getByTestId('event-modal')).toBeVisible();

    const titleInput = page.getByPlaceholder(/Event title|Add title/i);
    await titleInput.fill('Edited Event');
    await page.getByRole('button', { name: /Save/i }).click();

    await expect(page.locator('.day-event:has-text("Edited Event")')).toBeVisible({ timeout: 4000 });
    await expect(page.locator('.day-event:has-text("Original Event")')).toHaveCount(0);
  });

  test('should delete an event', async ({ page }) => {
    await switchToView(page, 'day');
    await createEvent(page, { slot: 20, title: 'Event to Delete' });

    await page.locator('.day-event:has-text("Event to Delete")').first().click();
    await page.getByRole('button', { name: /Delete/i }).click();
    await expect(page.getByTestId('delete-confirm-modal')).toBeVisible();

    await page.getByRole('button', { name: /Yes/i }).click();
    await expect(page.locator('.day-event:has-text("Event to Delete")')).toHaveCount(0);
  });

  test('should cancel deletion', async ({ page }) => {
    await switchToView(page, 'day');
    await createEvent(page, { slot: 21, title: 'Event to Keep' });

    await page.locator('.day-event:has-text("Event to Keep")').first().click();
    await page.getByRole('button', { name: /Delete/i }).click();
    await expect(page.getByTestId('delete-confirm-modal')).toBeVisible();

    await page.getByRole('button', { name: /No/i }).click();
    await expect(page.locator('.day-event:has-text("Event to Keep")')).toBeVisible();
  });

  test('should emit create request when modals are disabled', async ({ page }) => {
    const createRequestLogged = page.waitForEvent('console', {
      predicate: message => message.text().includes('Event create request:')
    });

    await page.goto('/?modals=off');
    await expect(page.locator('.google-calendar')).toBeVisible({ timeout: 10000 });

    await page.locator('.calendar-day').first().click();
    await expect(page.locator('[data-testid="event-modal"]')).toHaveCount(0);

    await createRequestLogged;
  });
});
