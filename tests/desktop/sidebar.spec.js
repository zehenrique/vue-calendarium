import { test, expect } from '@playwright/test';

const TEST_NOW = '2025-01-15T09:00:00';

async function loadCalendar(page) {
  await page.addInitScript((testNow) => {
    window.__CALENDAR_TEST_NOW__ = testNow;
  }, TEST_NOW);
  await page.goto('/');
  await expect(page.locator('.vue-calendarium')).toBeVisible();
}

const sidebar = (page) => page.getByTestId('desktop-sidebar');
const miniMonth = (page) => page.getByTestId('mini-month');
const title = (page) => page.locator('.calendar-title');

test.describe('Desktop sidebar', () => {
  test('shows a small month and the calendars, as in Google Calendar', async ({ page }) => {
    await loadCalendar(page);
    await expect(sidebar(page)).toBeVisible();
    await expect(miniMonth(page).locator('.mini-month__title')).toHaveText('January 2025');
    await expect(miniMonth(page).getByRole('gridcell', { name: 'Wednesday, January 15, 2025' })).toHaveAttribute('aria-current', 'date');
    await expect(sidebar(page).getByTestId('calendar-list')).toContainText('Work');
  });

  test('choosing a day in the small month shows it', async ({ page }) => {
    await loadCalendar(page);
    await page.getByTestId('view-toggle').click();
    await page.getByRole('option', { name: 'Day' }).click();

    await miniMonth(page).getByRole('gridcell', { name: 'Tuesday, January 28, 2025' }).click();
    await expect(title(page)).toHaveText('Tuesday, January 28, 2025');

    // Its arrows change the small month only
    await page.getByTestId('mini-month-next').click();
    await expect(miniMonth(page).locator('.mini-month__title')).toHaveText('February 2025');
    await expect(title(page)).toHaveText('Tuesday, January 28, 2025');
    await miniMonth(page).getByRole('gridcell', { name: 'Monday, February 3, 2025' }).click();
    await expect(title(page)).toHaveText('Monday, February 3, 2025');
  });

  test('the small month works with the keyboard', async ({ page }) => {
    await loadCalendar(page);
    const selected = miniMonth(page).getByRole('gridcell', { name: 'Wednesday, January 15, 2025' });
    await expect(selected).toHaveAttribute('tabindex', '0');

    await selected.focus();
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown');
    await expect(miniMonth(page).locator('.mini-month__title')).toHaveText('February 2025');
    await expect(page.locator('.mini-month__day:focus')).toHaveAttribute('data-date', '2025-02-05');
    await page.keyboard.press('Enter');
    await expect(title(page)).toHaveText('February 2025');
  });

  test('hides and shows a calendar\'s events', async ({ page }) => {
    await loadCalendar(page);
    const family = sidebar(page).getByTestId('calendar-toggle-family');

    await family.click();
    expect(await page.evaluate(() => window.calendarApp.calendarsService.get('family').visible)).toBe(false);
    await expect(family.getByRole('checkbox')).not.toBeChecked();

    await family.click();
    expect(await page.evaluate(() => window.calendarApp.calendarsService.get('family').visible)).toBe(true);
  });

  test('the menu button hides and shows it, and the views use the room', async ({ page }) => {
    await loadCalendar(page);
    const deck = page.locator('.swipe-deck');
    const menuButton = page.getByTestId('desktop-menu-button');
    const withSidebar = (await deck.boundingBox()).x;
    await expect(menuButton).toHaveAttribute('aria-expanded', 'true');

    await menuButton.click();
    await expect(sidebar(page)).toBeHidden();
    await expect(menuButton).toHaveAttribute('aria-expanded', 'false');
    await expect.poll(async () => (await deck.boundingBox()).x).toBeLessThan(withSidebar);
    expect(await page.evaluate(() => window.calendarApp.sidebarOpen.value)).toBe(false);

    await menuButton.click();
    await expect(sidebar(page)).toBeVisible();
    await expect.poll(async () => (await deck.boundingBox()).x).toBe(withSidebar);
  });

  test('the app can open and close it', async ({ page }) => {
    await loadCalendar(page);
    await page.evaluate(() => window.calendarApp.setSidebarOpen(false));
    await expect(sidebar(page)).toBeHidden();
    await page.evaluate(() => window.calendarApp.toggleSidebar());
    await expect(sidebar(page)).toBeVisible();
  });

  test('has the same background as the header', async ({ page }) => {
    await loadCalendar(page);
    const colors = await page.evaluate(() => [
      getComputedStyle(document.querySelector('[data-testid="desktop-sidebar"]')).backgroundColor,
      getComputedStyle(document.querySelector('.calendar-header')).backgroundColor
    ]);
    expect(colors[0]).toBe(colors[1]);
  });

  test('is translated', async ({ page }) => {
    await loadCalendar(page);
    await page.evaluate(() => window.calendarApp.setLocale('pt-PT'));
    await expect(miniMonth(page).locator('.mini-month__title')).toHaveText('Janeiro de 2025');
    await expect(sidebar(page)).toContainText('Calendários');
    await expect(page.getByTestId('mini-month-next')).toHaveAttribute('aria-label', 'Mês seguinte');
  });
});
