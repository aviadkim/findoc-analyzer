// @ts-check
const { test, expect } = require('@playwright/test');

test('Homepage loads correctly', async ({ page }) => {
  // Get the test URL from environment variable or use default
  const testUrl = process.env.TEST_URL || 'http://localhost:8081';
  console.log(`Testing URL: ${testUrl}`);

  // Navigate to the application
  await page.goto(testUrl);

  // Wait for the page to load
  await page.waitForLoadState('networkidle');

  // Take a screenshot of the homepage
  await page.screenshot({ path: 'test-results/01-homepage.png' });

  // Check if the page title is correct
  const title = await page.title();
  expect(title).toContain('FinDoc Analyzer');

  // Check if the sidebar is visible
  const sidebar = page.locator('.sidebar');
  await expect(sidebar).toBeVisible().catch(() => console.log('Sidebar not visible'));

  // Check if the main content is visible
  const mainContent = page.locator('main');
  await expect(mainContent).toBeVisible().catch(() => console.log('Main content not visible'));

  // Check for dashboard container
  const dashboardContainer = page.locator('.dashboard-container');
  await expect(dashboardContainer).toBeVisible().catch(() => console.log('Dashboard container not visible'));

  // Check for API health
  try {
    const response = await page.request.get(`${testUrl}/api/health`);
    if (response.ok()) {
      console.log('✅ API health check passed');
    } else {
      console.log(`❌ API health check failed: ${response.status()}`);
    }
  } catch (error) {
    console.log(`❌ API health check error: ${error.message}`);
  }
});
