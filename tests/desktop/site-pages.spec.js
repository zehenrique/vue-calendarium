import { test, expect } from '@playwright/test';
import pkg from '../../package.json' with { type: 'json' };

const majorVersion = pkg.version.split('.')[0];
const DOC_PAGES = ['overview', 'usage', 'upgrade', 'api', 'ghost-events', 'styling', 'theme-reference', 'theme-examples', 'colors', 'changelog', 'contributing', 'code-of-conduct'];

test.describe('Website pages', () => {
  test('demo page links to the documentation', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.vue-calendarium')).toBeVisible();

    const nav = page.getByRole('navigation', { name: 'Site' });
    await expect(nav.getByRole('link', { name: 'Demo' })).toHaveAttribute('aria-current', 'page');
    await expect(page.locator('.site-nav__version')).toHaveText(`v${pkg.version}`);

    await nav.getByRole('link', { name: 'Docs' }).click();
    await expect(page).toHaveURL(/docs\.html$/);
    await expect(page.getByRole('heading', { level: 1, name: 'vue-calendarium' })).toBeVisible();
  });

  test('every documentation page is listed and renders', async ({ page }) => {
    await page.goto('/docs.html');
    const toc = page.getByRole('navigation', { name: 'Documentation' });
    await expect(toc.getByRole('link')).toHaveCount(DOC_PAGES.length);

    for (const slug of DOC_PAGES) {
      await page.goto(`/docs.html?page=${slug}`);
      await expect(page.locator('.doc h1')).toBeVisible();
      await expect(toc.locator('[aria-current="page"]')).toHaveAttribute('href', `./docs.html?page=${slug}`);
    }
  });

  test('changelog page shows the current version', async ({ page }) => {
    await page.goto('/docs.html?page=changelog');

    await expect(page.getByRole('heading', { level: 1, name: 'Changelog' })).toBeVisible();
    await expect(page.locator('.doc h2').first()).toContainText(pkg.version);
    await expect(page.getByRole('navigation', { name: 'Site' }).getByRole('link', { name: 'Changelog' })).toHaveAttribute('aria-current', 'page');

    // Links to other documentation go to their website page; other repository files go to GitHub
    await expect(page.locator('.doc a', { hasText: 'upgrade guide' }).first()).toHaveAttribute('href', './docs.html?page=upgrade');
    await expect(page.locator('.doc a', { hasText: 'docs/STYLING.md' })).toHaveAttribute('href', './docs.html?page=styling#vuetify-4');
  });

  test('upgrade guide section links work', async ({ page }) => {
    await page.goto('/docs.html?page=upgrade');

    await expect(page.locator('.doc h1')).toContainText(`to ${majorVersion}.0`);

    await page.locator('.doc a', { hasText: 'Remove the Hammer.js setup' }).click();
    await expect(page).toHaveURL(/#3-remove-the-hammerjs-setup$/);
    await expect(page.locator('[id="3-remove-the-hammerjs-setup"]')).toBeInViewport();
  });

  test('section links work when a page is opened directly', async ({ page }) => {
    await page.goto('/docs.html?page=upgrade#4-check-your-vuetify-breakpoints');

    await expect(page.locator('[id="4-check-your-vuetify-breakpoints"]')).toBeInViewport();
  });

  test('unknown pages show a not found message', async ({ page }) => {
    await page.goto('/docs.html?page=does-not-exist');

    await expect(page.getByRole('heading', { level: 1, name: 'Page not found' })).toBeVisible();
  });
});
