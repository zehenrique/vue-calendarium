import { test, expect } from '@playwright/test';

// How the calendar behaves inside an app with its own CSS and settings

const TEST_NOW = '2025-01-15T09:00:00';

async function loadCalendar(page) {
  await page.addInitScript((testNow) => {
    window.__CALENDAR_TEST_NOW__ = testNow;
  }, TEST_NOW);
  await page.goto('/');
  await expect(page.locator('.vue-calendarium')).toBeVisible();
}

const radiusOf = (locator) => locator.evaluate(element => getComputedStyle(element).borderTopLeftRadius);

test.describe('In an app with a CSS reset', () => {
  test('buttons keep their shapes when the app resets button corners outside a CSS layer', async ({ page }) => {
    await loadCalendar(page);
    // CoreUI's and Bootstrap's reboot
    await page.addStyleTag({ content: 'button { border-radius: 0; }' });

    expect(await radiusOf(page.getByTestId('desktop-menu-button'))).not.toBe('0px');

    // The date picker opens outside the calendar
    await page.getByTestId('date-picker').click();
    const pickerButton = page.locator('.v-date-picker .v-btn').first();
    await expect(pickerButton).toBeVisible();
    expect(await radiusOf(pickerButton)).not.toBe('0px');
  });
});

test.describe('Languages', () => {
  test('the desktop day title uses the language\'s own word order', async ({ page }) => {
    await loadCalendar(page);
    await page.evaluate(() => {
      window.calendarApp.setView('day');
      window.calendarApp.setLocale('pt-PT');
    });
    await expect(page.locator('.calendar-title')).toHaveText('quarta-feira, 15 de janeiro de 2025');
  });
});
