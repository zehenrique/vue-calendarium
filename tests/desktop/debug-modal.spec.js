const { test } = require('@playwright/test');
const fs = require('fs');

test('debug modal styling', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  
  // Switch to week view to have hour slots
  await page.click('button:has-text("Week")');
  await page.waitForTimeout(500);
  
  // Click on a time slot to open the event modal
  await page.waitForSelector('.hour-slot', { timeout: 5000 });
  const slot = page.locator('.hour-slot').nth(10);
  await slot.click({ force: true });
  
  // Wait for modal to appear
  await page.waitForSelector('.fixed.inset-0', { timeout: 2000 });
  
  // Capture modal element HTML and classes
  const modalElement = page.locator('.fixed.inset-0').first();
  const modalHTML = await modalElement.evaluate(el => el.outerHTML);
  const modalClasses = await modalElement.getAttribute('class');
  
  // Get computed styles for the modal overlay
  const computedStyles = await modalElement.evaluate(el => {
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
      visibility: styles.visibility
    };
  });
  
  // Get computed styles for the modal content (bg-white div)
  const modalContent = page.locator('.fixed.inset-0 > div').first();
  const contentStyles = await modalContent.evaluate(el => {
    const styles = window.getComputedStyle(el);
    return {
      backgroundColor: styles.backgroundColor,
      borderRadius: styles.borderRadius,
      boxShadow: styles.boxShadow,
      padding: styles.padding,
      maxWidth: styles.maxWidth,
      width: styles.width
    };
  });
  
  // Take screenshot
  await page.screenshot({ path: 'modal-debug.png', fullPage: true });
  
  // Write debug info to file
  const debugInfo = {
    modalClasses,
    computedStyles,
    contentStyles,
    modalHTML: modalHTML.substring(0, 2000) // First 2000 chars
  };
  
  fs.writeFileSync('modal-debug.json', JSON.stringify(debugInfo, null, 2));
  
  console.log('Modal classes:', modalClasses);
  console.log('Computed styles:', computedStyles);
  console.log('Content styles:', contentStyles);
});
