import { test, expect } from '@playwright/test';

// The exported repeat components in an app's own form, without a calendar on the page
test.describe('Exported repeat components', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tests/fixtures/exported-components.html');
    await expect(page.getByTestId('repeat-select')).toBeVisible();
  });

  test('RepeatSelect sets the rule from its menu, and back to "Does not repeat"', async ({ page }) => {
    const link = page.getByTestId('repeat-select');
    await expect(link).toHaveText('Does not repeat');
    // Its own link style, without a linkClass
    await expect(link).toHaveCSS('text-decoration-line', 'none');

    await link.click();
    await page.getByTestId('repeat-menu').getByText('Weekly on Wednesday', { exact: true }).click();
    await expect(page.getByTestId('fixture-rule')).toHaveText('FREQ=WEEKLY;BYDAY=WE');

    await link.click();
    await page.getByTestId('repeat-menu').getByText('Does not repeat', { exact: true }).click();
    await expect(page.getByTestId('fixture-rule')).toHaveText('');
  });

  test('RecurrencePickerModal gives the rule built in it', async ({ page }) => {
    await page.getByTestId('open-picker').click();
    const dialog = page.getByTestId('recurrence-picker-modal');
    await dialog.getByLabel('Repeat every').fill('2');
    await dialog.getByRole('radio', { name: 'After' }).check();
    await dialog.getByLabel('Number of occurrences').fill('4');
    await dialog.getByRole('button', { name: 'Done' }).click();
    await expect(page.getByTestId('fixture-rule')).toHaveText('FREQ=WEEKLY;INTERVAL=2;BYDAY=WE;COUNT=4');
  });

  test('RecurrenceScopeModal gives the choice, or cancels', async ({ page }) => {
    await page.getByTestId('open-scope').click();
    const dialog = page.getByTestId('recurrence-scope-modal');
    await dialog.getByRole('radio', { name: 'All events', exact: true }).check();
    await dialog.getByRole('button', { name: 'OK' }).click();
    await expect(page.getByTestId('fixture-scope')).toHaveText('all');

    await page.getByTestId('open-scope').click();
    await dialog.getByRole('button', { name: 'Cancel' }).click();
    await expect(page.getByTestId('fixture-scope')).toHaveText('cancelled');
  });
});

test.describe('Exported sidebar components', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tests/fixtures/exported-components.html');
    await expect(page.getByTestId('mini-month')).toBeVisible();
  });

  test('MiniMonth emits the chosen day', async ({ page }) => {
    await page.getByTestId('mini-month').getByRole('gridcell', { name: 'Monday, January 27, 2025' }).click();
    await expect(page.getByTestId('fixture-date')).toHaveText('2025-01-27');
  });

  test('CalendarVisibilityList updates the visible calendars', async ({ page }) => {
    await page.getByTestId('calendar-toggle-home').click();
    await expect(page.getByTestId('fixture-visible')).toHaveText('work');
    await page.getByTestId('calendar-toggle-home').click();
    await expect(page.getByTestId('fixture-visible')).toHaveText('work,home');
  });
});
