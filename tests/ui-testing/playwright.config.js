// @ts-check
const { defineConfig, devices } = require('@playwright/test');

/**
 * Comprehensive UI Testing Strategy Configuration
 * @see https://playwright.dev/docs/test-configuration
 */
module.exports = defineConfig({
  testDir: './ui-testing',
  /* Maximum time one test can run for. */
  timeout: 120 * 1000, // 2 minutes
  
  expect: {
    /**
     * Maximum time expect() should wait for the condition to be met.
     */
    timeout: 10000
  },
  
  /* Run tests in files in parallel */
  fullyParallel: false, // Run tests sequentially to avoid conflicts
  
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 1,
  
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : 3, // Single worker on CI, 3 locally
  
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ['html', { outputFolder: './test-reports/html-report' }],
    ['json', { outputFile: './test-reports/test-results.json' }],
    ['list']
  ],
  
  /* Shared settings for all the projects below */
  use: {
    /* Maximum time each action such as `click()` can take. Defaults to 0 (no limit). */
    actionTimeout: 15000,
    
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: process.env.TEST_URL || (process.env.TEST_ENV === 'production'
      ? 'https://backv2-app-brfi73d4ra-zf.a.run.app'
      : 'http://localhost:8080'),

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'retain-on-failure',

    /* Take screenshots on failure */
    screenshot: 'only-on-failure',

    /* Record video on failure */
    video: 'retain-on-failure',
  },

  /* Configure projects for major browsers and devices */
  projects: [
    /* Desktop browsers */
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 }
      },
    },
    {
      name: 'firefox',
      use: { 
        ...devices['Desktop Firefox'],
        viewport: { width: 1280, height: 720 }
      },
    },
    {
      name: 'webkit',
      use: { 
        ...devices['Desktop Safari'],
        viewport: { width: 1280, height: 720 }
      },
    },
    
    /* Mobile browsers */
    {
      name: 'mobile-chrome',
      use: { 
        ...devices['Pixel 5'],
      },
    },
    {
      name: 'mobile-safari',
      use: { 
        ...devices['iPhone 12'],
      },
    },
    
    /* Tablet browsers */
    {
      name: 'tablet-safari',
      use: { 
        ...devices['iPad (gen 7)'],
        viewport: { width: 768, height: 1024 }
      },
    },
    
    /* Accessibility testing project */
    {
      name: 'accessibility',
      use: { 
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 }
      },
    },
  ],

  /* Folder for test artifacts such as screenshots, videos, traces, etc. */
  outputDir: 'test-results/',

  /* Run your local dev server before starting the tests */
  webServer: process.env.TEST_ENV !== 'production' ? {
    command: 'node server.js',
    port: 8080,
    timeout: 120 * 1000,
    reuseExistingServer: true,
  } : undefined,
});