import { test } from '@playwright/test';
import fs from 'fs';

test('debug app loading', async ({ page }) => {
  // Listen for errors BEFORE navigating
  const consoleMessages = [];
  const pageErrors = [];
  
  page.on('console', msg => {
    const text = `[BROWSER ${msg.type()}] ${msg.text()}`;
    console.log(text);
    consoleMessages.push(text);
  });
  
  page.on('pageerror', err => {
    const text = `[PAGE ERROR] ${err.message}`;
    console.log(text);
    pageErrors.push(text);
  });

  // Set test date
  await page.addInitScript(() => {
    window.__CALENDAR_TEST_NOW__ = '2025-01-15T09:00:00';
    console.log('[TEST] Set __CALENDAR_TEST_NOW__:', window.__CALENDAR_TEST_NOW__);
  });

  // Go to page
  console.log('[TEST] Navigating to page...');
  await page.goto('/');
  
  // Wait a bit for async loading
  await page.waitForTimeout(3000);
  
  // Get page content
  const content = await page.content();
  console.log('[TEST] Page HTML length:', content.length);
  console.log('[TEST] Page title:', await page.title());
  
  // Save HTML to file
  fs.writeFileSync('debug-page.html', content);
  console.log('[TEST] Saved HTML to debug-page.html');
  
  // Save console messages
  fs.writeFileSync('debug-console.txt', consoleMessages.join('\n') + '\n\nERRORS:\n' + pageErrors.join('\n'));
  console.log('[TEST] Saved console to debug-console.txt');
  
  // Check for .google-calendar
  const calendarElement = await page.locator('.google-calendar').count();
  console.log('[TEST] .google-calendar elements found:', calendarElement);
  
  // Check for calendar-title
  const titleElement = await page.locator('.calendar-title').count();
  console.log('[TEST] .calendar-title elements found:', titleElement);
  
  if (titleElement > 0) {
    const titleText = await page.locator('.calendar-title').first().textContent();
    console.log('[TEST] Calendar title text:', titleText);
  }
});
