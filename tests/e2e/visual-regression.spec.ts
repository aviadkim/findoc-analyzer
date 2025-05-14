import { test, expect } from '@playwright/test';
import { UploadPage } from './pages/UploadPage';
import { DocumentsPage } from './pages/DocumentsPage';
import { DocumentDetailsPage } from './pages/DocumentDetailsPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { PortfolioComparisonPage } from './pages/PortfolioComparisonPage';

test.describe('Visual Regression Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Set a consistent viewport size for visual testing
    await page.setViewportSize({ width: 1280, height: 720 });
  });

  test('Homepage visual appearance', async ({ page }) => {
    // Navigate to the homepage
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Take screenshot for visual comparison
    await expect(page).toHaveScreenshot('homepage.png', {
      maxDiffPixelRatio: 0.01
    });
  });

  test('Upload page visual appearance', async ({ page }) => {
    const uploadPage = new UploadPage(page);
    await uploadPage.goto();
    
    // Take screenshot for visual comparison
    await expect(page).toHaveScreenshot('upload-page.png', {
      maxDiffPixelRatio: 0.01
    });
  });

  test('Documents page visual appearance', async ({ page }) => {
    const documentsPage = new DocumentsPage(page);
    await documentsPage.goto();
    
    // Take screenshot for visual comparison
    await expect(page).toHaveScreenshot('documents-page.png', {
      maxDiffPixelRatio: 0.01
    });
  });

  test('Analytics page visual appearance', async ({ page }) => {
    const analyticsPage = new AnalyticsPage(page);
    await analyticsPage.goto();
    
    // Take screenshot for visual comparison
    await expect(page).toHaveScreenshot('analytics-page.png', {
      maxDiffPixelRatio: 0.01
    });
  });

  test('Portfolio comparison page visual appearance', async ({ page }) => {
    const portfolioComparisonPage = new PortfolioComparisonPage(page);
    await portfolioComparisonPage.goto();
    
    // Take screenshot for visual comparison
    await expect(page).toHaveScreenshot('portfolio-comparison-page.png', {
      maxDiffPixelRatio: 0.01
    });
  });

  test('Mobile homepage visual appearance', async ({ page }) => {
    // Set mobile viewport size
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Navigate to the homepage
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Take screenshot for mobile visual comparison
    await expect(page).toHaveScreenshot('mobile-homepage.png', {
      maxDiffPixelRatio: 0.01
    });
  });

  test('Mobile upload page visual appearance', async ({ page }) => {
    // Set mobile viewport size
    await page.setViewportSize({ width: 375, height: 667 });
    
    const uploadPage = new UploadPage(page);
    await uploadPage.goto();
    
    // Take screenshot for mobile visual comparison
    await expect(page).toHaveScreenshot('mobile-upload-page.png', {
      maxDiffPixelRatio: 0.01
    });
  });

  test('Theme consistency across pages', async ({ page }) => {
    // Define pages to test
    const pages = [
      '/',
      '/upload',
      '/documents',
      '/analytics',
      '/portfolio-comparison'
    ];
    
    // Navigate to each page and take screenshots of key elements
    for (const pagePath of pages) {
      await page.goto(pagePath);
      await page.waitForLoadState('networkidle');
      
      // Take screenshots of common UI elements
      
      // Header
      const header = page.locator('header').first();
      if (await header.isVisible()) {
        await expect(header).toHaveScreenshot(`header-${pagePath.replace(/\//g, '-')}.png`, {
          maxDiffPixelRatio: 0.01
        });
      }
      
      // Navigation
      const navigation = page.locator('nav').first();
      if (await navigation.isVisible()) {
        await expect(navigation).toHaveScreenshot(`nav-${pagePath.replace(/\//g, '-')}.png`, {
          maxDiffPixelRatio: 0.01
        });
      }
      
      // Buttons
      const buttons = page.locator('button').first();
      if (await buttons.isVisible()) {
        await expect(buttons).toHaveScreenshot(`button-${pagePath.replace(/\//g, '-')}.png`, {
          maxDiffPixelRatio: 0.01
        });
      }
    }
  });

  test('Enhanced securities viewer visual appearance', async ({ page }) => {
    // Navigate to documents page
    const documentsPage = new DocumentsPage(page);
    await documentsPage.goto();
    
    // Check if there are documents, if not, upload one
    if (await documentsPage.isEmpty()) {
      // Upload and process a document first
      const uploadPage = new UploadPage(page);
      await uploadPage.goto();
      
      const samplePdfPath = 'test-data/sample_portfolio.pdf';
      await uploadPage.uploadAndProcessFile(samplePdfPath);
      
      // Navigate back to documents page
      await documentsPage.goto();
    }
    
    // Click on the first document
    await documentsPage.clickDocumentCard(0);
    
    // Wait for the securities viewer to be visible
    const documentDetailsPage = new DocumentDetailsPage(page);
    await expect(documentDetailsPage.enhancedSecuritiesViewer).toBeVisible();
    
    // Take screenshot of the securities viewer
    await expect(documentDetailsPage.enhancedSecuritiesViewer).toHaveScreenshot('enhanced-securities-viewer.png', {
      maxDiffPixelRatio: 0.01
    });
  });

  test('Portfolio charts visual appearance', async ({ page }) => {
    // Navigate to analytics page
    const analyticsPage = new AnalyticsPage(page);
    await analyticsPage.goto();
    
    // Wait for charts to be visible
    await expect(analyticsPage.portfolioCharts).toBeVisible();
    
    // Take screenshot of the charts
    await expect(analyticsPage.portfolioCharts).toHaveScreenshot('portfolio-charts.png', {
      maxDiffPixelRatio: 0.01
    });
  });

  test('Mobile portfolio comparison visual appearance', async ({ page }) => {
    // Set mobile viewport size
    await page.setViewportSize({ width: 375, height: 667 });
    
    const portfolioComparisonPage = new PortfolioComparisonPage(page);
    await portfolioComparisonPage.goto();
    
    // Take screenshot for mobile visual comparison
    await expect(page).toHaveScreenshot('mobile-portfolio-comparison.png', {
      maxDiffPixelRatio: 0.01
    });
  });
});