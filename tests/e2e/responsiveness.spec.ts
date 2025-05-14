import { test, expect } from '@playwright/test';

test.describe('Responsive UI Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the home page
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should adapt navigation for mobile devices', async ({ page, isMobile }) => {
    // Skip this test if not running on mobile configuration
    if (!isMobile) {
      test.skip();
      return;
    }
    
    // Check if hamburger menu is visible on mobile
    const hamburgerMenu = page.locator('.mobile-menu-button');
    await expect(hamburgerMenu).toBeVisible();
    
    // Click hamburger menu to open navigation
    await hamburgerMenu.click();
    
    // Verify mobile navigation appeared
    await expect(page.locator('.mobile-navigation')).toBeVisible();
    
    // Check all expected navigation links are present
    const navLinks = ['Home', 'Documents', 'Upload', 'Analytics', 'Settings'];
    for (const link of navLinks) {
      await expect(page.locator(`.mobile-navigation a:has-text("${link}")`)).toBeVisible();
    }
    
    // Click a navigation link
    await page.click('.mobile-navigation a:has-text("Documents")');
    
    // Verify we navigated to the correct page
    await expect(page.url()).toContain('/documents');
    
    // Verify mobile navigation closed
    await expect(page.locator('.mobile-navigation')).not.toBeVisible();
  });

  test('should display responsive securities viewer', async ({ page }) => {
    // Navigate to documents page
    await page.goto('/documents');
    await page.waitForLoadState('networkidle');
    
    // Click on a document to view details
    await page.click('.document-card:first-child');
    
    // Wait for document details page to load
    await expect(page.url()).toContain('/document/');
    
    // Check for the securities viewer
    await expect(page.locator('.enhanced-securities-viewer')).toBeVisible();
    
    // Check responsive behavior based on viewport
    const viewportWidth = page.viewportSize()?.width || 0;
    
    if (viewportWidth < 640) {
      // On small screens, expect compact view
      await expect(page.locator('.enhanced-securities-viewer.compact-view')).toBeVisible();
      
      // Check that only essential columns are visible
      await expect(page.locator('.securities-table th')).toHaveCount(3);
      
      // Verify expand/collapse controls
      await expect(page.locator('.expand-row-button')).toBeVisible();
      
      // Test expand functionality
      await page.click('.expand-row-button:first-child');
      await expect(page.locator('.expanded-details')).toBeVisible();
    } else if (viewportWidth < 1024) {
      // On medium screens, expect more columns but still responsive
      await expect(page.locator('.securities-table th')).toHaveCountGreaterThan(3);
      await expect(page.locator('.securities-table th')).toHaveCountLessThan(8);
    } else {
      // On large screens, expect full table
      await expect(page.locator('.securities-table th')).toHaveCountGreaterThan(7);
    }
  });

  test('should display responsive portfolio charts', async ({ page }) => {
    // Navigate to analytics page
    await page.goto('/analytics');
    await page.waitForLoadState('networkidle');
    
    // Check that portfolio charts component is visible
    await expect(page.locator('.portfolio-charts')).toBeVisible();
    
    // Check responsive layout based on viewport size
    const viewportWidth = page.viewportSize()?.width || 0;
    
    if (viewportWidth < 768) {
      // On mobile, charts should be stacked vertically
      await expect(page.locator('.portfolio-charts.stacked-layout')).toBeVisible();
      
      // Check that chart containers have appropriate height
      const chartHeight = await page.locator('.chart-container:first-child').evaluate(el => {
        return window.getComputedStyle(el).height;
      });
      
      // Mobile charts should have fixed height
      expect(parseInt(chartHeight)).toBeGreaterThanOrEqual(200);
      
      // Mobile controls should be touch-optimized
      await expect(page.locator('.touch-controls')).toBeVisible();
    } else {
      // On desktop, charts should be in grid layout
      await expect(page.locator('.portfolio-charts.grid-layout')).toBeVisible();
      
      // Check that charts are arranged horizontally
      const chartContainers = page.locator('.chart-container');
      await expect(chartContainers).toHaveCount(3);
      
      // Check that chart containers have similar width (grid layout)
      const firstChartWidth = await chartContainers.nth(0).evaluate(el => {
        return window.getComputedStyle(el).width;
      });
      
      const secondChartWidth = await chartContainers.nth(1).evaluate(el => {
        return window.getComputedStyle(el).width;
      });
      
      // Charts should have similar width in grid layout
      expect(Math.abs(parseInt(firstChartWidth) - parseInt(secondChartWidth))).toBeLessThan(10);
    }
  });

  test('should display responsive portfolio comparison', async ({ page }) => {
    // Navigate to portfolio comparison page
    await page.goto('/portfolio-comparison');
    await page.waitForLoadState('networkidle');
    
    // Check that portfolio comparison component is visible
    await expect(page.locator('.portfolio-comparison')).toBeVisible();
    
    // Check responsive behavior based on viewport
    const viewportWidth = page.viewportSize()?.width || 0;
    
    if (viewportWidth < 768) {
      // On mobile, comparison should be vertical
      await expect(page.locator('.portfolio-comparison.vertical-layout')).toBeVisible();
      
      // Check that portfolio selector has mobile-specific styling
      await expect(page.locator('.portfolio-comparison-selector.mobile-view')).toBeVisible();
      
      // Selector should have card-based interface on mobile
      await expect(page.locator('.selection-card')).toBeVisible();
      
      // Test card-based selection
      await page.click('.selection-card:first-child');
      await expect(page.locator('.selection-card.selected')).toBeVisible();
    } else {
      // On desktop, comparison should be horizontal
      await expect(page.locator('.portfolio-comparison.horizontal-layout')).toBeVisible();
      
      // Check that portfolio selector has desktop-specific styling
      await expect(page.locator('.portfolio-comparison-selector.desktop-view')).toBeVisible();
      
      // Verify dropdown-based selection on desktop
      await expect(page.locator('select.portfolio-select')).toBeVisible();
      
      // Test dropdown selection
      await page.selectOption('select.portfolio-select', { index: 1 });
      await expect(page.locator('.comparison-results')).toBeVisible();
    }
  });
});