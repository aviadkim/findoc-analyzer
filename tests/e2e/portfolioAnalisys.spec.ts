import { test, expect } from '@playwright/test';

test.describe('Portfolio Analysis Workflow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to documents page
    await page.goto('/documents');
    await page.waitForLoadState('networkidle');
  });

  test('should analyze portfolio from document details', async ({ page }) => {
    // Click on a document to view details
    await page.click('.document-card:first-child');
    
    // Wait for document details page to load
    await expect(page.url()).toContain('/document/');
    
    // Click on Analyze button
    await page.click('button:has-text("Analyze")');
    
    // Wait for analysis to complete
    await expect(page.locator('text=Analysis complete')).toBeVisible({ timeout: 15000 });
    
    // Verify analysis results are displayed
    await expect(page.locator('.analysis-results')).toBeVisible();
    
    // Check for portfolio summary section
    await expect(page.locator('.portfolio-summary')).toBeVisible();
    
    // Check for asset allocation chart
    await expect(page.locator('.asset-allocation-chart')).toBeVisible();
    
    // Verify interactive charts are present
    await expect(page.locator('.interactive-chart')).toBeVisible();
    
    // Test chart interaction
    await page.hover('.interactive-chart path');
    
    // Verify tooltip appears on hover
    await expect(page.locator('.chart-tooltip')).toBeVisible();
  });

  test('should compare multiple portfolios', async ({ page }) => {
    // Navigate to portfolio comparison page
    await page.goto('/portfolio-comparison');
    await page.waitForLoadState('networkidle');
    
    // Verify comparison interface is loaded
    await expect(page.locator('.portfolio-comparison')).toBeVisible();
    
    // Select first portfolio
    if (page.viewportSize()?.width < 768) {
      // Mobile selector
      await page.click('.selection-card:nth-child(1)');
    } else {
      // Desktop selector
      await page.selectOption('select.portfolio-select:nth-of-type(1)', { index: 1 });
    }
    
    // Select second portfolio
    if (page.viewportSize()?.width < 768) {
      // Mobile selector
      await page.click('.selection-card:nth-child(2)');
    } else {
      // Desktop selector
      await page.selectOption('select.portfolio-select:nth-of-type(2)', { index: 2 });
    }
    
    // Click Compare button
    await page.click('button:has-text("Compare")');
    
    // Wait for comparison results
    await expect(page.locator('.comparison-results')).toBeVisible({ timeout: 10000 });
    
    // Check for comparison charts
    await expect(page.locator('.comparison-chart')).toBeVisible();
    
    // Verify performance metrics are displayed
    await expect(page.locator('.performance-metrics')).toBeVisible();
    
    // Check for differences section
    await expect(page.locator('.portfolio-differences')).toBeVisible();
    
    // Test interactive elements
    await page.click('.toggle-view-button');
    
    // Verify view toggle works
    await expect(page.locator('.alternate-view')).toBeVisible();
  });

  test('should export portfolio data', async ({ page, browserName }) => {
    // This test is browser-specific due to download handling
    test.skip(browserName === 'webkit', 'Download handling needs different approach in WebKit');
    
    // Navigate to document details page
    await page.goto('/documents');
    await page.click('.document-card:first-child');
    
    // Wait for document details to load
    await expect(page.url()).toContain('/document/');
    
    // Click Export button
    await page.click('button:has-text("Export")');
    
    // Select export format from dropdown
    await page.click('.export-format-selector');
    await page.click('text=CSV');
    
    // Setup download handler
    const downloadPromise = page.waitForEvent('download');
    
    // Click Export button in modal
    await page.click('.export-modal button:has-text("Export")');
    
    // Wait for download to start
    const download = await downloadPromise;
    
    // Verify file name contains 'securities'
    expect(download.suggestedFilename()).toContain('securities');
    
    // Check file extension matches selected format
    expect(download.suggestedFilename()).toMatch(/\.csv$/i);
  });

  test('should handle portfolio charts responsively on mobile', async ({ page, isMobile }) => {
    // Skip this test if not running on mobile
    if (!isMobile) {
      test.skip();
      return;
    }
    
    // Navigate to analytics page
    await page.goto('/analytics');
    await page.waitForLoadState('networkidle');
    
    // Verify mobile-specific chart controls are present
    await expect(page.locator('.mobile-chart-controls')).toBeVisible();
    
    // Test touch-based zoom on charts
    const chart = page.locator('.portfolio-charts .chart-container:first-child');
    
    // Double-tap to zoom
    await chart.dblclick();
    
    // Verify zoom effect
    await expect(chart.locator('.zoomed-view')).toBeVisible();
    
    // Tap again to reset zoom
    await chart.click();
    
    // Verify zoom is reset
    await expect(chart.locator('.zoomed-view')).not.toBeVisible();
    
    // Test swipe to navigate between charts
    await chart.swipe({ direction: 'left', speed: 1000 });
    
    // Verify second chart is now visible
    await expect(page.locator('.chart-pagination-indicator[data-index="1"]')).toHaveClass(/active/);
  });
});