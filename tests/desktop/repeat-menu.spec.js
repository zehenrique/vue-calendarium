import { test, expect } from '@playwright/test';

const TEST_NOW = '2025-01-15T09:00:00';

async function loadWeekView(page) {
  await page.addInitScript((testNow) => {
    window.__CALENDAR_TEST_NOW__ = testNow;
  }, TEST_NOW);
  await page.goto('/');
  await expect(page.locator('.vue-calendarium')).toBeVisible();
  await page.getByTestId('view-toggle').click();
  await page.getByRole('option', { name: 'Week' }).click();
  await expect(page.locator('.week-view')).toBeVisible();
}

// Wednesday 15 January 2025 at 20:00
async function openNewEvent(page) {
  await page.getByRole('button', { name: 'Create event on Wednesday, January 15 at 20:00' }).click();
  await expect(page.getByTestId('event-modal')).toBeVisible();
}

const repeatLink = (page) => page.getByTestId('event-modal').getByTestId('repeat-select');

async function chooseRepeat(page, name) {
  await repeatLink(page).click();
  await page.getByTestId('repeat-menu').getByText(name, { exact: true }).click();
  await expect(page.getByTestId('repeat-menu')).toBeHidden();
}

const storedEvent = (page, title) => page.evaluate(
  (eventTitle) => window.calendarApp.eventsService.getAll().find(event => event.title === eventTitle),
  title
);

test.describe('Repeat menu', () => {
  test('offers the usual rules for the event\'s date, as in Google Calendar', async ({ page }) => {
    await loadWeekView(page);
    await openNewEvent(page);
    await repeatLink(page).click();

    await expect(page.getByTestId('repeat-menu').locator('.v-list-item-title')).toHaveText([
      'Does not repeat',
      'Daily',
      'Weekly on Wednesday',
      'Monthly on the third Wednesday',
      'Annually on January 15',
      'Every weekday (Monday to Friday)',
      'Custom...'
    ]);
  });

  test('a repeat can be removed again', async ({ page }) => {
    await loadWeekView(page);
    await openNewEvent(page);
    await page.getByPlaceholder(/Event title/i).fill('Gym');

    await chooseRepeat(page, 'Weekly on Wednesday');
    await expect(repeatLink(page)).toHaveText('Weekly on Wednesday');
    await chooseRepeat(page, 'Does not repeat');
    await expect(repeatLink(page)).toHaveText('Does not repeat');

    await page.getByRole('button', { name: 'Save', exact: true }).click();
    expect(await storedEvent(page, 'Gym')).toMatchObject({ rrule: '' });
  });

  test('removing the repeat of a series ends it from that occurrence', async ({ page }) => {
    await loadWeekView(page);
    // The demo's weekly standup, next week's occurrence
    await page.getByRole('button', { name: 'Next' }).first().click();
    await page.locator('.week-event').filter({ hasText: 'Standup' }).first().click();
    await page.getByRole('button', { name: 'Edit', exact: true }).click();

    await chooseRepeat(page, 'Does not repeat');
    await page.getByRole('button', { name: 'Save', exact: true }).click();

    // Without a rule, "This event" is not offered
    const scopeModal = page.getByTestId('recurrence-scope-modal');
    await expect(scopeModal.getByRole('radio')).toHaveCount(2);
    await scopeModal.getByRole('radio', { name: 'This and following events', exact: true }).check();
    await scopeModal.getByRole('button', { name: 'OK' }).click();

    const events = await page.evaluate(() => window.calendarApp.eventsService.getAll().filter(event => /Standup/.test(event.title)));
    expect(events).toHaveLength(2);
    expect(events.find(event => event.start === '2025-01-22T10:00:00')).toMatchObject({ rrule: '' });
  });

  test('a weekly rule follows the event to another day', async ({ page }) => {
    await loadWeekView(page);
    await openNewEvent(page);
    await chooseRepeat(page, 'Weekly on Wednesday');

    await page.getByTestId('event-modal').locator('.date-input input').click();
    await page.locator('.event-date-picker').getByText('16', { exact: true }).click();
    await expect(repeatLink(page)).toHaveText('Weekly on Thursday');
  });

  test('is translated', async ({ page }) => {
    await loadWeekView(page);
    await page.evaluate(() => window.calendarApp.setLocale('pt-PT'));
    await page.getByRole('button', { name: /quarta-feira, 15 de janeiro.*20:00/ }).click();
    await repeatLink(page).click();

    await expect(page.getByTestId('repeat-menu').locator('.v-list-item-title')).toHaveText([
      'Não se repete',
      'Diariamente',
      'Semanalmente (quarta-feira)',
      'Mensalmente, quarta-feira da 3.ª semana',
      'Anualmente a 15 de janeiro',
      'Todos os dias úteis (segunda a sexta-feira)',
      'Personalizar...'
    ]);
  });
});
