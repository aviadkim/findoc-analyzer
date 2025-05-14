import { test, expect } from '@playwright/test';
import { UploadPage } from './pages/UploadPage';
import { DocumentsPage } from './pages/DocumentsPage';
import { DocumentDetailsPage } from './pages/DocumentDetailsPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { PortfolioComparisonPage } from './pages/PortfolioComparisonPage';
import { AccessibilityHelper } from './helpers/AccessibilityHelper';

test.describe('Accessibility Tests', () => {
  let accessibilityHelper: AccessibilityHelper;

  test.beforeEach(async ({ page }) => {
    accessibilityHelper = new AccessibilityHelper(page);
  });

  test('Homepage should not have critical accessibility violations', async ({ page }) => {
    // Navigate to the homepage
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Run accessibility analysis
    const violations = await accessibilityHelper.getFormattedViolations();
    
    // Filter for critical violations
    const criticalViolations = violations.filter(v => v.impact === 'critical');
    
    // Output violations for debugging
    if (criticalViolations.length > 0) {
      console.log('Critical accessibility violations:', criticalViolations);
    }
    
    // Assert no critical violations
    expect(criticalViolations.length).toBe(0);
  });

  test('Upload page should be accessible', async ({ page }) => {
    const uploadPage = new UploadPage(page);
    await uploadPage.goto();
    
    // Get violation summary
    const summary = await accessibilityHelper.getViolationSummary();
    
    // Assert no critical violations
    expect(summary.critical).toBe(0);
    
    // Save results for reporting
    await accessibilityHelper.saveResults('./test-results/a11y/upload-page.json');
  });

  test('Documents page should be accessible', async ({ page }) => {
    const documentsPage = new DocumentsPage(page);
    await documentsPage.goto();
    
    // Get violation summary
    const summary = await accessibilityHelper.getViolationSummary();
    
    // Assert no critical violations
    expect(summary.critical).toBe(0);
    
    // Save results for reporting
    await accessibilityHelper.saveResults('./test-results/a11y/documents-page.json');
  });

  test('Analytics page should be accessible', async ({ page }) => {
    const analyticsPage = new AnalyticsPage(page);
    await analyticsPage.goto();
    
    // Get violation summary
    const summary = await accessibilityHelper.getViolationSummary();
    
    // Assert no critical violations
    expect(summary.critical).toBe(0);
    
    // Save results for reporting
    await accessibilityHelper.saveResults('./test-results/a11y/analytics-page.json');
  });

  test('Portfolio comparison page should be accessible', async ({ page }) => {
    const portfolioComparisonPage = new PortfolioComparisonPage(page);
    await portfolioComparisonPage.goto();
    
    // Get violation summary
    const summary = await accessibilityHelper.getViolationSummary();
    
    // Assert no critical violations
    expect(summary.critical).toBe(0);
    
    // Save results for reporting
    await accessibilityHelper.saveResults('./test-results/a11y/portfolio-comparison-page.json');
  });

  test('Color contrast should meet WCAG standards', async ({ page }) => {
    // Navigate to the homepage
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check specific color contrast rules
    const results = await accessibilityHelper.checkSpecificRules(['color-contrast']);
    
    // Assert no color contrast violations
    expect(results.violations.length).toBe(0);
  });

  test('Form elements should have proper labels', async ({ page }) => {
    const uploadPage = new UploadPage(page);
    await uploadPage.goto();
    
    // Check for label-related rules
    const results = await accessibilityHelper.checkSpecificRules([
      'label',
      'label-content-name-mismatch',
      'label-title-only'
    ]);
    
    // Assert no label violations
    expect(results.violations.length).toBe(0);
  });

  test('Navigation should be keyboard accessible', async ({ page }) => {
    // Navigate to the homepage
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Press Tab to move through navigation items
    await page.keyboard.press('Tab');
    
    // Check if an element is focused
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(focusedElement).not.toBe('BODY');
    
    // Continue tabbing and verify focus changes
    await page.keyboard.press('Tab');
    const newFocusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(newFocusedElement).not.toBe('BODY');
    expect(newFocusedElement).not.toBe(focusedElement);
  });

  test('Mobile navigation should be accessible', async ({ page }) => {
    // Set viewport to mobile size
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Navigate to homepage
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Find and click hamburger menu if it exists
    const hamburgerMenu = page.locator('.mobile-menu-button');
    if (await hamburgerMenu.isVisible()) {
      await hamburgerMenu.click();
      
      // Analyze mobile navigation menu
      const results = await accessibilityHelper.analyze({ 
        selector: '.mobile-navigation'
      });
      
      // Assert no critical violations in mobile navigation
      const criticalViolations = results.violations.filter(v => v.impact === 'critical');
      expect(criticalViolations.length).toBe(0);
    }
  });
});