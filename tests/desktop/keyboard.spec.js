import { test, expect } from '@playwright/test';

const TEST_NOW = '2025-01-15T09:00:00';

async function loadCalendar(page) {
  await page.addInitScript((testNow) => {
    window.__CALENDAR_TEST_NOW__ = testNow;
  }, TEST_NOW);
  await page.goto('/');
  await expect(page.locator('.vue-calendarium')).toBeVisible();
}

async function switchToView(page, name) {
  await page.getByTestId('view-toggle').click();
  await page.getByRole('option', { name }).click();
}

test.describe('Keyboard access', () => {
  test('week view events open with Enter', async ({ page }) => {
    await loadCalendar(page);
    await switchToView(page, 'Week');

    const event = page.getByRole('button', { name: 'Team Meeting, 10:00 – 11:00' });
    await event.focus();
    await page.keyboard.press('Enter');
    await expect(page.getByTestId('event-detail-modal')).toContainText('Team Meeting');
  });

  test('the week grid has one hour slot in the tab order, and arrow keys move it', async ({ page }) => {
    await loadCalendar(page);
    await switchToView(page, 'Week');

    // Today's column when today is shown, otherwise the first day; 09:00
    const tabbable = page.locator('.hour-slot[tabindex="0"]');
    await expect(tabbable).toHaveCount(1);
    await expect(tabbable).toHaveAttribute('aria-label', 'Create event on Monday, January 13 at 09:00');

    await tabbable.focus();
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowRight');
    await expect(page.locator('.hour-slot:focus')).toHaveAttribute('aria-label', 'Create event on Tuesday, January 14 at 10:00');

    await page.keyboard.press('Enter');
    const dialog = page.getByTestId('event-modal');
    await expect(dialog).toBeVisible();
    await expect(dialog.locator('.date-input input')).toHaveValue('14/01/2025');
    await expect(dialog.locator('.time-select').first()).toContainText('10:00');
  });

  test('the day view grid works the same way', async ({ page }) => {
    await loadCalendar(page);
    await switchToView(page, 'Day');

    const tabbable = page.locator('.hour-slot[tabindex="0"]');
    await expect(tabbable).toHaveCount(1);
    await tabbable.focus();
    await page.keyboard.press('ArrowUp');
    await page.keyboard.press('Space');
    await expect(page.getByTestId('event-modal').locator('.time-select').first()).toContainText('08:00');
  });

  test('month view days can be chosen with the arrow keys', async ({ page }) => {
    await loadCalendar(page);

    const tabbable = page.locator('.day-number[tabindex="0"]');
    await expect(tabbable).toHaveCount(1);
    // Today when it is shown, otherwise the first day of the month
    await expect(tabbable).toHaveAttribute('aria-label', 'Create event on Wednesday, January 1');

    await tabbable.focus();
    await page.keyboard.press('ArrowDown');
    await expect(page.locator('.day-number:focus')).toHaveAttribute('aria-label', 'Create event on Wednesday, January 8');
    await page.keyboard.press('Enter');
    await expect(page.getByTestId('event-modal').locator('.date-input input')).toHaveValue('08/01/2025');
  });

  test('the header title announces changes', async ({ page }) => {
    await loadCalendar(page);
    await expect(page.locator('.calendar-title')).toHaveAttribute('aria-live', 'polite');
  });
});
