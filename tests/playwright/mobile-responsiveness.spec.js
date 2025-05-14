const { test, expect } = require('@playwright/test');
const { login } = require('./utils/test-helpers');

test.describe('Mobile Responsiveness', () => {
  // Use iPhone 12 viewport
  test.use({
    viewport: { width: 390, height: 844 },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.3 Mobile/15E148 Safari/604.1'
  });

  test.beforeEach(async ({ page }) => {
    // Login before each test
    await login(page);
  });

  test('should show mobile navigation menu', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Check that mobile menu button is visible
    await expect(page.locator('[data-testid="mobile-menu-button"]')).toBeVisible();
    
    // Open mobile menu
    await page.click('[data-testid="mobile-menu-button"]');
    
    // Check that menu is visible
    await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible();
    
    // Check menu items
    await expect(page.locator('[data-testid="mobile-menu-item-dashboard"]')).toBeVisible();
    await expect(page.locator('[data-testid="mobile-menu-item-documents"]')).toBeVisible();
    await expect(page.locator('[data-testid="mobile-menu-item-agents"]')).toBeVisible();
    await expect(page.locator('[data-testid="mobile-menu-item-portfolio"]')).toBeVisible();
  });

  test('should adapt dashboard layout to mobile', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Check that widgets are stacked vertically
    const widgets = page.locator('[data-testid="dashboard-widget"]');
    const count = await widgets.count();
    
    for (let i = 0; i < count; i++) {
      await expect(widgets.nth(i)).toBeVisible();
      
      if (i > 0) {
        const prevBounds = await widgets.nth(i - 1).boundingBox();
        const currentBounds = await widgets.nth(i).boundingBox();
        
        // Second widget should be below the first (y-coordinate greater)
        expect(currentBounds.y).toBeGreaterThan(prevBounds.y + prevBounds.height - 10); // Allow some margin
      }
    }
  });

  test('should adapt document list to mobile', async ({ page }) => {
    await page.goto('/documents');
    
    // Check that document list is in compact mode
    await expect(page.locator('[data-testid="documents-list-compact"]')).toBeVisible();
    
    // Check that document items stack vertically
    const items = page.locator('[data-testid="document-item"]');
    const count = await items.count();
    
    if (count > 1) {
      const firstBounds = await items.first().boundingBox();
      const secondBounds = await items.nth(1).boundingBox();
      
      // Second item should be below the first
      expect(secondBounds.y).toBeGreaterThan(firstBounds.y + firstBounds.height - 10);
    }
  });

  test('should adapt document details to mobile', async ({ page }) => {
    await page.goto('/documents');
    
    // Click on a document if available
    const hasDocuments = await page.locator('[data-testid="document-item"]').count() > 0;
    
    if (hasDocuments) {
      await page.click('[data-testid="document-item"]:first-child');
      
      // Check that details are full width
      const detailsPanel = page.locator('[data-testid="document-details"]');
      const bounds = await detailsPanel.boundingBox();
      const viewport = page.viewportSize();
      
      // Details should use most of viewport width
      expect(bounds.width).toBeGreaterThan(viewport.width * 0.9);
      
      // Check that sections stack vertically
      const sections = page.locator('[data-testid="document-detail-section"]');
      const count = await sections.count();
      
      if (count > 1) {
        const firstBounds = await sections.first().boundingBox();
        const secondBounds = await sections.nth(1).boundingBox();
        
        // Second section should be below the first
        expect(secondBounds.y).toBeGreaterThan(firstBounds.y + firstBounds.height - 10);
      }
    }
  });

  test('should adapt agent workspace to mobile', async ({ page }) => {
    await page.goto('/agents');
    
    // Check that agent list is in mobile layout
    await expect(page.locator('[data-testid="agent-list-mobile"]')).toBeVisible();
    
    // Check that pipeline builder adapts to mobile
    await expect(page.locator('[data-testid="pipeline-builder-mobile"]')).toBeVisible();
  });

  test('should adapt analytics dashboard to mobile', async ({ page }) => {
    await page.goto('/portfolio');
    
    // Check that charts adapt to mobile viewport
    const chart = page.locator('[data-testid="portfolio-chart"]');
    const bounds = await chart.boundingBox();
    const viewport = page.viewportSize();
    
    // Chart should use most of viewport width
    expect(bounds.width).toBeGreaterThan(viewport.width * 0.8);
    
    // Check that controls are in mobile layout
    await expect(page.locator('[data-testid="chart-controls-mobile"]')).toBeVisible();
  });

  test('should provide touch-friendly controls', async ({ page }) => {
    await page.goto('/documents');
    
    // Check for touch-friendly buttons
    const buttons = page.locator('button, [role="button"]');
    const count = await buttons.count();
    
    for (let i = 0; i < Math.min(count, 5); i++) {
      const bounds = await buttons.nth(i).boundingBox();
      
      // Touch targets should be at least 44x44 pixels
      expect(bounds.width).toBeGreaterThanOrEqual(44);
      expect(bounds.height).toBeGreaterThanOrEqual(44);
    }
  });

  test('should adapt forms to mobile', async ({ page }) => {
    await page.goto('/preferences');
    
    // Check that form inputs are full width
    const inputs = page.locator('input[type="text"], select');
    const count = await inputs.count();
    
    for (let i = 0; i < Math.min(count, 3); i++) {
      const bounds = await inputs.nth(i).boundingBox();
      const viewport = page.viewportSize();
      
      // Inputs should use most of viewport width
      expect(bounds.width).toBeGreaterThan(viewport.width * 0.8);
    }
    
    // Check that form actions are mobile-friendly
    await expect(page.locator('[data-testid="form-actions-mobile"]')).toBeVisible();
  });
  
  test('should show mobile-specific help', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Open mobile help
    await page.click('[data-testid="mobile-help-button"]');
    
    // Check that mobile help is shown
    await expect(page.locator('[data-testid="mobile-help-panel"]')).toBeVisible();
    
    // Check mobile-specific content
    await expect(page.locator('[data-testid="mobile-help-panel"]')).toContainText('Mobile Navigation');
  });

  test('should handle touch gestures', async ({ page }) => {
    await page.goto('/documents');
    
    // Test swipe gesture if documents exist
    const hasDocuments = await page.locator('[data-testid="document-item"]').count() > 0;
    
    if (hasDocuments) {
      // Click first document to view details
      await page.click('[data-testid="document-item"]:first-child');
      
      // Simulate swipe left gesture (to go back to list)
      await page.mouse.move(50, 400);
      await page.mouse.down();
      await page.mouse.move(300, 400, { steps: 10 });
      await page.mouse.up();
      
      // Check that we're back to the document list
      await expect(page.locator('[data-testid="documents-list-compact"]')).toBeVisible();
    }
  });

  test('should have accessible tap targets', async ({ page }) => {
    await page.goto('/documents');
    
    // Check spacing between tap targets
    const buttons = page.locator('[data-testid="document-action-button"]');
    const count = await buttons.count();
    
    if (count >= 2) {
      const firstBounds = await buttons.nth(0).boundingBox();
      const secondBounds = await buttons.nth(1).boundingBox();
      
      // Check horizontal spacing
      if (Math.abs(firstBounds.x - secondBounds.x) < firstBounds.width) {
        // If buttons are stacked vertically
        const verticalSpacing = secondBounds.y - (firstBounds.y + firstBounds.height);
        expect(verticalSpacing).toBeGreaterThanOrEqual(8);
      } else {
        // If buttons are horizontally aligned
        const horizontalSpacing = secondBounds.x - (firstBounds.x + firstBounds.width);
        expect(horizontalSpacing).toBeGreaterThanOrEqual(8);
      }
    }
  });

  test('should handle orientation change', async ({ page }) => {
    // Start with portrait mode
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/portfolio');
    
    // Check portrait layout
    await expect(page.locator('[data-testid="portfolio-chart"]')).toBeVisible();
    
    // Switch to landscape mode
    await page.setViewportSize({ width: 844, height: 390 });
    
    // Wait for layout to adjust
    await page.waitForTimeout(500);
    
    // Check that layout adapts to landscape
    await expect(page.locator('[data-testid="portfolio-chart"]')).toBeVisible();
    
    // Verify that chart was resized
    const chartBounds = await page.locator('[data-testid="portfolio-chart"]').boundingBox();
    expect(chartBounds.width).toBeGreaterThan(600);
  });

  test('should handle mobile text input', async ({ page }) => {
    await page.goto('/search');
    
    // Click on search input (should trigger virtual keyboard on real device)
    await page.click('[data-testid="search-input"]');
    
    // Fill search field
    await page.fill('[data-testid="search-input"]', 'portfolio');
    
    // Check that search input has proper value
    await expect(page.locator('[data-testid="search-input"]')).toHaveValue('portfolio');
    
    // Check for clear button
    await expect(page.locator('[data-testid="clear-search-button"]')).toBeVisible();
    
    // Clear search
    await page.click('[data-testid="clear-search-button"]');
    
    // Check input is cleared
    await expect(page.locator('[data-testid="search-input"]')).toHaveValue('');
  });
});
