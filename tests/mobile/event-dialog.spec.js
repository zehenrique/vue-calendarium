import { test, expect } from '@playwright/test';

const TEST_NOW = '2025-01-15T09:00:00';

async function openNewEvent(page, locale = 'en-US') {
  await page.addInitScript((testNow) => {
    window.__CALENDAR_TEST_NOW__ = testNow;
  }, TEST_NOW);
  await page.goto('/');
  await expect(page.locator('.vue-calendarium')).toBeVisible();
  await page.evaluate((language) => {
    window.calendarApp.setView('day');
    window.calendarApp.setLocale(language);
  }, locale);
  await page.locator('.hour-slot[data-slot$="-20"]').first().click();
  await expect(page.getByTestId('event-modal-mobile')).toBeVisible();
  await waitForSheetToSettle(page);
}

// The sheet slides up when it opens; measure once it has stopped moving
async function waitForSheetToSettle(page) {
  let previous = null;
  await expect.poll(async () => {
    const box = await page.getByTestId('event-modal-mobile').boundingBox();
    const settled = previous !== null && box.y === previous;
    previous = box.y;
    return settled;
  }, { intervals: [100] }).toBe(true);
}

const sheet = (page) => page.getByTestId('event-modal-mobile');
const allDay = (page) => sheet(page).locator('.all-day-checkbox .v-label');
const repeatLink = (page) => sheet(page).getByTestId('repeat-select');

// The dot between "All day" and the repeat link, as the user sees it
const separatorIsVisible = (page) => sheet(page).locator('.repeat-option').evaluate((option) => {
  const row = option.closest('.options-row').getBoundingClientRect();
  const dotLeft = option.getBoundingClientRect().left + 12;
  return dotLeft >= row.left;
});

test.describe('Mobile event dialog', () => {
  test('"All day" and the repeat link share a row, as on desktop', async ({ page }) => {
    await openNewEvent(page);
    const checkbox = await allDay(page).boundingBox();
    const link = await repeatLink(page).boundingBox();

    expect(Math.abs((checkbox.y + checkbox.height / 2) - (link.y + link.height / 2))).toBeLessThan(4);
    expect(link.x).toBeGreaterThan(checkbox.x + checkbox.width);
    expect(await separatorIsVisible(page)).toBe(true);
  });

  test('a long repeat choice moves to its own line, without the dot', async ({ page }) => {
    await openNewEvent(page, 'pt-PT');
    await repeatLink(page).click();
    await page.getByTestId('repeat-menu').getByText('Todos os dias úteis (segunda a sexta-feira)', { exact: true }).click();
    await expect(repeatLink(page)).toHaveText('Todos os dias úteis (segunda a sexta-feira)');

    const checkbox = await allDay(page).boundingBox();
    const link = await repeatLink(page).boundingBox();
    expect(link.y).toBeGreaterThan(checkbox.y + checkbox.height / 2);
    expect(await separatorIsVisible(page)).toBe(false);

    // The menu still opens and its choices can be picked
    await repeatLink(page).click();
    await page.getByTestId('repeat-menu').getByText('Não se repete', { exact: true }).click();
    await expect(repeatLink(page)).toHaveText('Não se repete');
  });
});
