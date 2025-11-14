import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for Google Calendar Component
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests',
  
  // Maximum time one test can run (reduced from 30s to 15s)
  timeout: 15 * 1000,
  
  // Run tests in files in parallel
  fullyParallel: true,
  
  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,
  
  // Retry on CI only
  retries: process.env.CI ? 2 : 0,
  
  // Run tests in parallel (increased workers for speed)
  workers: process.env.CI ? 4 : 8,
  
  // Reporter to use
  // Use a console-friendly reporter and keep HTML generation but do not open/serve it automatically.
  // This prevents Playwright from serving the HTML report after the run while still producing
  // artifacts for CI or manual inspection.
  reporter: [
    ['list'],
    ['html', { open: 'never' }]
  ],
  
  // Shared settings for all the projects below
  use: {
    // Base URL to use in actions like `await page.goto('/')`
    baseURL: 'http://localhost:3000',
    
    // Collect trace when retrying the failed test
    trace: 'on-first-retry',
    
    // Screenshot on failure
    screenshot: 'only-on-failure',
    
    // Reduce action timeout for faster failures (5s instead of default 30s)
    actionTimeout: 5000,
    
    // Faster navigation timeout
    navigationTimeout: 10000,
  },

  // Configure projects for major browsers
  projects: [
    {
      name: 'Desktop Chrome',
      testDir: './tests/desktop',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'Mobile Chrome',
      testDir: './tests/mobile',
      use: { ...devices['Pixel 5'] },
    },

    {
      name: 'Visual Regression - Desktop',
      testDir: './tests/visual',
      use: { 
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 },
      },
    },

    {
      name: 'Visual Regression - Mobile',
      testDir: './tests/visual',
      use: { 
        ...devices['Pixel 5'],
      },
    },

    {
      name: 'Integration Tests',
      testDir: './tests/integration',
      use: { ...devices['Desktop Chrome'] },
    },

    // Uncomment to test on more browsers
    // {
    //   name: 'Desktop Firefox',
    //   testDir: './tests/desktop',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    // {
    //   name: 'Desktop Safari',
    //   testDir: './tests/desktop',
    //   use: { ...devices['Desktop Safari'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   testDir: './tests/mobile',
    //   use: { ...devices['iPhone 12'] },
    // },
  ],

  // Run your local dev server before starting the tests
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: true, // Always reuse existing server for speed
    timeout: 60 * 1000, // Reduced from 120s to 60s
  },
});
