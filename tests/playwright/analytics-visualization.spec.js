const { test, expect } = require('@playwright/test');
const { login, processDocument, navigateToAnalysis } = require('./utils/test-helpers');

test.describe('Analytics and Visualization', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await login(page);
  });

  test('should display portfolio dashboard', async ({ page }) => {
    await page.goto('/portfolio');
    await expect(page).toHaveTitle(/Portfolio/);
    await expect(page.locator('[data-testid="portfolio-dashboard"]')).toBeVisible();
  });

  test('should show portfolio summary', async ({ page }) => {
    await page.goto('/portfolio');
    
    // Check portfolio summary components
    await expect(page.locator('[data-testid="portfolio-value"]')).toBeVisible();
    await expect(page.locator('[data-testid="asset-allocation"]')).toBeVisible();
    await expect(page.locator('[data-testid="top-holdings"]')).toBeVisible();
  });

  test('should display different chart types', async ({ page }) => {
    await page.goto('/portfolio');
    
    // Test pie chart
    await page.click('[data-testid="chart-type-pie"]');
    await expect(page.locator('[data-testid="pie-chart"]')).toBeVisible();
    
    // Test bar chart
    await page.click('[data-testid="chart-type-bar"]');
    await expect(page.locator('[data-testid="bar-chart"]')).toBeVisible();
    
    // Test line chart
    await page.click('[data-testid="chart-type-line"]');
    await expect(page.locator('[data-testid="line-chart"]')).toBeVisible();
  });

  test('should customize dashboard layout', async ({ page }) => {
    await page.goto('/portfolio');
    
    // Enter customize mode
    await page.click('[data-testid="customize-dashboard-button"]');
    await expect(page.locator('[data-testid="dashboard-edit-mode"]')).toBeVisible();
    
    // Drag a widget to a new position
    const widget = page.locator('[data-testid="widget-portfolio-summary"]');
    const dropZone = page.locator('[data-testid="widget-drop-zone"]:nth-child(3)');
    
    await widget.dragTo(dropZone);
    
    // Save layout
    await page.click('[data-testid="save-layout-button"]');
    await expect(page.locator('[data-testid="layout-saved-message"]')).toBeVisible();
  });

  test('should filter chart data', async ({ page }) => {
    await page.goto('/portfolio');
    
    // Open filters
    await page.click('[data-testid="chart-filters-button"]');
    
    // Select a sector filter
    await page.click('[data-testid="filter-sector-technology"]');
    
    // Apply filters
    await page.click('[data-testid="apply-filters-button"]');
    
    // Check that chart has updated
    await expect(page.locator('[data-testid="filtered-chart"]')).toBeVisible();
    
    // Clear filters
    await page.click('[data-testid="clear-filters-button"]');
  });

  test('should show different time periods', async ({ page }) => {
    await page.goto('/portfolio');
    
    // Switch to performance tab
    await page.click('[data-testid="performance-tab"]');
    
    // Select different time periods
    await page.click('[data-testid="time-period-1m"]');
    await expect(page.locator('[data-testid="chart-period-1m"]')).toBeVisible();
    
    await page.click('[data-testid="time-period-3m"]');
    await expect(page.locator('[data-testid="chart-period-3m"]')).toBeVisible();
    
    await page.click('[data-testid="time-period-1y"]');
    await expect(page.locator('[data-testid="chart-period-1y"]')).toBeVisible();
    
    await page.click('[data-testid="time-period-all"]');
    await expect(page.locator('[data-testid="chart-period-all"]')).toBeVisible();
  });

  test('should compare to benchmark', async ({ page }) => {
    await page.goto('/portfolio');
    
    // Switch to performance tab
    await page.click('[data-testid="performance-tab"]');
    
    // Add benchmark
    await page.click('[data-testid="add-benchmark-button"]');
    
    // Select S&P 500 benchmark
    await page.selectOption('[data-testid="benchmark-select"]', 'sp500');
    
    // Apply benchmark
    await page.click('[data-testid="apply-benchmark-button"]');
    
    // Check that benchmark is shown
    await expect(page.locator('[data-testid="benchmark-chart"]')).toBeVisible();
    await expect(page.locator('[data-testid="benchmark-legend"]')).toBeVisible();
  });

  test('should export chart as image', async ({ page }) => {
    await page.goto('/portfolio');
    
    // Click export
    await page.click('[data-testid="export-chart-button"]');
    
    // Select image format
    await page.click('[data-testid="export-format-png"]');
    
    // Download image
    const downloadPromise = page.waitForEvent('download');
    await page.click('[data-testid="download-image-button"]');
    const download = await downloadPromise;
    
    // Check downloaded file
    const fileName = download.suggestedFilename();
    expect(fileName).toMatch(/\.png$/);
  });

  test('should show financial recommendations', async ({ page }) => {
    await page.goto('/recommendations');
    
    // Check recommendations components
    await expect(page.locator('[data-testid="recommendations-summary"]')).toBeVisible();
    await expect(page.locator('[data-testid="recommendation-items"]')).toBeVisible();
    
    // Select a recommendation to view details
    await page.click('[data-testid="recommendation-item"]:first-child');
    
    // Check recommendation details
    await expect(page.locator('[data-testid="recommendation-details"]')).toBeVisible();
  });

  test('should customize risk profile for recommendations', async ({ page }) => {
    await page.goto('/recommendations');
    
    // Change risk profile
    await page.click('[data-testid="risk-profile-selector"]');
    await page.click('[data-testid="risk-profile-aggressive"]');
    
    // Apply risk profile
    await page.click('[data-testid="apply-risk-profile"]');
    
    // Wait for recommendations to update
    await page.waitForSelector('[data-testid="recommendations-updated"]');
    
    // Check that recommendations have updated
    await expect(page.locator('[data-testid="risk-profile-indicator"]')).toContainText('Aggressive');
  });
});
