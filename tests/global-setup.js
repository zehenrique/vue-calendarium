import { chromium } from '@playwright/test';

/**
 * Loads the app once before the tests run.
 *
 * The dev server reports ready before it has compiled the app, so the first page
 * load takes several seconds. Without this warm-up, every parallel worker pays
 * that cost at once and the first tests can exceed the navigation timeout.
 */
export default async function globalSetup(config) {
  const baseURL = config.projects[0].use.baseURL;
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    await page.goto(baseURL, { timeout: 120 * 1000 });
    try {
      await page.locator('.vue-calendarium').waitFor({ timeout: 60 * 1000 });
    } catch {
      // The config reuses any server already on the port, which may be another app
      throw new Error(`The calendar did not load at ${baseURL}. If another app is using that port, run the tests on a free one, e.g. TEST_PORT=3100 make test-ui`);
    }
  } finally {
    await browser.close();
  }
}
