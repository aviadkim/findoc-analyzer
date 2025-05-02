// @ts-check
const { defineConfig } = require('@playwright/test');

/**
 * @see https://playwright.dev/docs/test-configuration
 */
module.exports = defineConfig({
  testDir: './tests/e2e',
  timeout: 30 * 1000,
  expect: {
    timeout: 5000
  },
  use: {
    actionTimeout: 0,
    baseURL: 'http://localhost:8080',
    trace: 'on-first-retry',
    video: 'on-first-retry',
    screenshot: 'only-on-failure'
  },
  projects: [
    {
      name: 'chromium',
      use: {
        browserName: 'chromium',
      },
    },
  ],
  webServer: {
    command: 'npm run dev',
    port: 8080,
    timeout: 120 * 1000,
    reuseExistingServer: true,
  },
});
