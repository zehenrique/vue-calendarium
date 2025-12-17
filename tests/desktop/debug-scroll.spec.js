const { test, expect } = require('@playwright/test');

test('verify auto-scroll in week view', async ({ page }) => {
  const TEST_NOW = '2025-12-16T14:30:00'; // 2:30 PM
  
  // Listen to console logs
  page.on('console', msg => console.log('BROWSER:', msg.text()));
  
  await page.addInitScript(({ testNow }) => {
    window.__CALENDAR_TEST_NOW__ = testNow;
  }, { testNow: TEST_NOW });

  await page.goto('/');
  await expect(page.locator('.google-calendar')).toBeVisible({ timeout: 5000 });

  // Log viewport size
  const viewport = page.viewportSize();
  const appHeight = await page.evaluate(() => {
    const app = document.getElementById('app');
    const cal = document.querySelector('.google-calendar');
    return {
      appHeight: app?.offsetHeight,
      appClientHeight: app?.clientHeight,
      appComputedHeight: app ? window.getComputedStyle(app).height : null,
      appParent: app?.parentElement?.tagName,
      calHeight: cal?.offsetHeight,
      calClientHeight: cal?.clientHeight,
      calComputedHeight: cal ? window.getComputedStyle(cal).height : null,
      calParent: cal?.parentElement?.id || cal?.parentElement?.tagName,
      bodyHeight: document.body.offsetHeight,
      viewportHeight: window.innerHeight,
      dpr: window.devicePixelRatio
    };
  });
  console.log('Viewport:', viewport);
  console.log('Heights:', appHeight);

  // Switch to week view
  const viewToggle = page.getByTestId('view-toggle');
  await viewToggle.click();
  await page.getByRole('option', { name: /Week/i }).click();
  await expect(page.locator('.week-view')).toBeVisible({ timeout: 2000 });

  // Wait a moment for auto-scroll to happen
  await page.waitForTimeout(2000);

  // Debug the DOM hierarchy and CSS
  const domInfo = await page.evaluate(() => {
    const weekView = document.querySelector('.week-view');
    const weekGrid = document.querySelector('.week-grid');
    const calendarBody = document.querySelector('.calendar-body');
    const googleCalendar = document.querySelector('.google-calendar');
    
    const getStyles = (el) => {
      if (!el) return null;
      const computed = window.getComputedStyle(el);
      return {
        height: computed.height,
        minHeight: computed.minHeight,
        maxHeight: computed.maxHeight,
        flex: computed.flex,
        overflow: computed.overflow,
        overflowY: computed.overflowY,
        display: computed.display,
        clientHeight: el.clientHeight,
        scrollHeight: el.scrollHeight,
        offsetHeight: el.offsetHeight
      };
    };
    
    // Get all children of .google-calendar
    const children = Array.from(googleCalendar?.children || []).map(child => ({
      className: child.className,
      tagName: child.tagName,
      offsetHeight: child.offsetHeight
    }));
    
    return {
      weekGrid: getStyles(weekGrid),
      weekView: getStyles(weekView),
      calendarBody: getStyles(calendarBody),
      googleCalendar: getStyles(googleCalendar),
      googleCalendarChildren: children,
      hierarchy: {
        weekViewParent: weekView?.parentElement?.className,
        calendarBodyParent: calendarBody?.parentElement?.className,
      }
    };
  });
  console.log('DOM structure and styles:', JSON.stringify(domInfo, null, 2));

  // Check scroll multiple times
  for (let i = 0; i < 5; i++) {
    const info = await page.evaluate(() => {
      const weekView = document.querySelector('.week-view');
      const calendarBody = weekView?.parentElement;
      const googleCalendar = document.querySelector('.google-calendar');
      
      return {
        weekView: weekView ? {
          scrollTop: weekView.scrollTop,
          scrollHeight: weekView.scrollHeight,
          clientHeight: weekView.clientHeight,
          offsetHeight: weekView.offsetHeight,
          computedHeight: window.getComputedStyle(weekView).height
        } : null,
        calendarBody: calendarBody ? {
          clientHeight: calendarBody.clientHeight,
          offsetHeight: calendarBody.offsetHeight,
          computedHeight: window.getComputedStyle(calendarBody).height
        } : null,
        googleCalendar: googleCalendar ? {
          clientHeight: googleCalendar.clientHeight,
          offsetHeight: googleCalendar.offsetHeight,
          computedHeight: window.getComputedStyle(googleCalendar).height
        } : null
      };
    });
    console.log(`Element heights attempt ${i + 1}:`, JSON.stringify(info, null, 2));
    if (info.weekView && info.weekView.scrollTop > 0) break;
    await page.waitForTimeout(500);
  }

  // Get the final scroll position
  const scrollTop = await page.locator('.week-view').evaluate(el => el.scrollTop);
  console.log('Week view FINAL scrollTop:', scrollTop);

  // The scroll should be > 0 since we're at 2:30 PM
  expect(scrollTop).toBeGreaterThan(0);

  // Switch to day view
  await viewToggle.click();
  await page.getByRole('option', { name: /Day/i }).click();
  await expect(page.locator('.day-view')).toBeVisible({ timeout: 2000 });

  // Wait a moment for auto-scroll to happen
  await page.waitForTimeout(2000);

  // Get the scroll position for day view
  const dayScrollTop = await page.locator('.day-view').evaluate(el => el.scrollTop);
  console.log('Day view scrollTop:', dayScrollTop);

  // The scroll should be > 0 since we're at 2:30 PM
  expect(dayScrollTop).toBeGreaterThan(0);
});
