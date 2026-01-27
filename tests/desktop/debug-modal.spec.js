import { test, expect } from '@playwright/test';
import fs from 'node:fs';

const TEST_NOW = '2025-01-15T09:00:00';

test('debug modal styling', async ({ page }, testInfo) => {
  await page.addInitScript(({ testNow }) => {
    window.__CALENDAR_TEST_NOW__ = testNow;
  }, { testNow: TEST_NOW });

  await page.goto('/');
  await expect(page.locator('.google-calendar')).toBeVisible({ timeout: 5000 });

  // Switch to week view using dropdown
  const viewToggle = page.getByTestId('view-toggle');
  await viewToggle.click();
  await page.getByRole('option', { name: /Week/i }).click();
  await expect(page.locator('.week-view')).toBeVisible({ timeout: 2000 });

  const slot = page.locator('.hour-slot').nth(10);
  await expect(slot).toBeVisible({ timeout: 2000 });
  await slot.click({ force: true });

  const modalContent = page.getByTestId('event-modal').first();
  await expect(modalContent).toBeVisible({ timeout: 2000 });

  const modalHTML = await modalContent.evaluate(el => el.outerHTML);
  const modalClasses = await modalContent.evaluate(el => el.className || '');

  const computedStyles = await modalContent.evaluate(el => {
    const styles = window.getComputedStyle(el);
    return {
      position: styles.position,
      top: styles.top,
      left: styles.left,
      right: styles.right,
      bottom: styles.bottom,
      backgroundColor: styles.backgroundColor,
      display: styles.display,
      zIndex: styles.zIndex,
      opacity: styles.opacity,
      visibility: styles.visibility,
    };
  });

  const contentStyles = await modalContent.evaluate(el => {
    const styles = window.getComputedStyle(el);
    return {
      backgroundColor: styles.backgroundColor,
      borderRadius: styles.borderRadius,
      boxShadow: styles.boxShadow,
      padding: styles.padding,
      maxWidth: styles.maxWidth,
      width: styles.width,
    };
  });

  await page.screenshot({ path: testInfo.outputPath('modal-debug.png'), fullPage: true });

  const debugInfo = {
    modalClasses,
    computedStyles,
    contentStyles,
    modalHTML: modalHTML.substring(0, 2000),
  };

  fs.writeFileSync(testInfo.outputPath('modal-debug.json'), JSON.stringify(debugInfo, null, 2));

  console.log('Modal classes:', modalClasses);
  console.log('Computed styles:', computedStyles);
  console.log('Content styles:', contentStyles);
});
