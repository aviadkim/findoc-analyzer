const { test, expect } = require('@playwright/test');
const path = require('path');
const { login, uploadDocument, processDocument } = require('./utils/test-helpers');

test.describe('Document Processing', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await login(page);
  });

  test('should process a document', async ({ page }) => {
    // Use a sample PDF for testing
    const filePath = path.join(__dirname, '../test-data/sample_portfolio.pdf');
    const documentName = 'sample_portfolio.pdf';
    
    // First, check if document exists or upload it
    await page.goto('/documents');
    
    const documentExists = await page.locator(`[data-testid="document-item"]:has-text("${documentName}")`).count() > 0;
    
    if (!documentExists) {
      await uploadDocument(page, filePath);
    }
    
    // Find and click the document
    await page.click(`[data-testid="document-item"]:has-text("${documentName}")`);
    
    // Click process button
    await page.click('[data-testid="process-button"]');
    
    // Select standard processing
    await page.click('[data-testid="standard-processing-option"]');
    
    // Start processing
    await page.click('[data-testid="start-processing-button"]');
    
    // Wait for processing to complete (may take time)
    await page.waitForSelector('[data-testid="processing-complete-message"]', { timeout: 60000 });
    
    // Verify processing results are shown
    await expect(page.locator('[data-testid="processing-results"]')).toBeVisible();
  }, 90000); // Longer timeout for processing

  test('should view document analysis', async ({ page }) => {
    const documentName = 'sample_portfolio.pdf';
    
    await page.goto('/documents');
    
    // Ensure document exists and has been processed
    const documentExists = await page.locator(`[data-testid="document-item"]:has-text("${documentName}")`).count() > 0;
    
    if (!documentExists) {
      test.skip('Document not found, skipping test');
    }
    
    // Click the document
    await page.click(`[data-testid="document-item"]:has-text("${documentName}")`);
    
    // Check if document is processed
    const isProcessed = await page.locator('[data-testid="document-status"]:has-text("Processed")').count() > 0;
    
    if (!isProcessed) {
      // Process the document if not already processed
      await processDocument(page, documentName);
    }
    
    // Click analyze button
    await page.click('[data-testid="analyze-button"]');
    
    // Wait for analysis dashboard to load
    await page.waitForSelector('[data-testid="analysis-dashboard"]');
    
    // Verify analysis components are shown
    await expect(page.locator('[data-testid="portfolio-summary"]')).toBeVisible();
    await expect(page.locator('[data-testid="allocation-chart"]')).toBeVisible();
  });

  test('should execute custom agent pipeline', async ({ page }) => {
    const documentName = 'sample_portfolio.pdf';
    
    await page.goto('/documents');
    
    // Ensure document exists
    const documentExists = await page.locator(`[data-testid="document-item"]:has-text("${documentName}")`).count() > 0;
    
    if (!documentExists) {
      test.skip('Document not found, skipping test');
    }
    
    // Click the document
    await page.click(`[data-testid="document-item"]:has-text("${documentName}")`);
    
    // Click process button
    await page.click('[data-testid="process-button"]');
    
    // Select custom processing
    await page.click('[data-testid="custom-processing-option"]');
    
    // Select agents
    await page.click('[data-testid="agent-checkbox-ISINExtractorAgent"]');
    await page.click('[data-testid="agent-checkbox-FinancialAdvisorAgent"]');
    
    // Start processing
    await page.click('[data-testid="start-processing-button"]');
    
    // Wait for processing to complete (may take time)
    await page.waitForSelector('[data-testid="processing-complete-message"]', { timeout: 60000 });
    
    // Verify processing results are shown
    await expect(page.locator('[data-testid="processing-results"]')).toBeVisible();
    
    // Verify that selected agents' results are shown
    await expect(page.locator('[data-testid="agent-result-ISINExtractorAgent"]')).toBeVisible();
    await expect(page.locator('[data-testid="agent-result-FinancialAdvisorAgent"]')).toBeVisible();
  }, 90000); // Longer timeout for processing

  test('should compare documents', async ({ page }) => {
    await page.goto('/documents');
    
    // Select at least two documents
    await page.click('[data-testid="document-checkbox"]:nth-child(1)');
    await page.click('[data-testid="document-checkbox"]:nth-child(2)');
    
    // Click compare button
    await page.click('[data-testid="compare-button"]');
    
    // Wait for comparison results to load
    await page.waitForSelector('[data-testid="comparison-results"]', { timeout: 30000 });
    
    // Verify comparison components are shown
    await expect(page.locator('[data-testid="comparison-summary"]')).toBeVisible();
    await expect(page.locator('[data-testid="comparison-chart"]')).toBeVisible();
    
    // Test different views
    await page.click('[data-testid="view-selector-side-by-side"]');
    await expect(page.locator('[data-testid="side-by-side-view"]')).toBeVisible();
    
    await page.click('[data-testid="view-selector-changes-only"]');
    await expect(page.locator('[data-testid="changes-only-view"]')).toBeVisible();
  }, 60000); // Longer timeout for comparison

  test('should export document data', async ({ page }) => {
    const documentName = 'sample_portfolio.pdf';
    
    await page.goto('/documents');
    
    // Ensure document exists and has been processed
    const documentExists = await page.locator(`[data-testid="document-item"]:has-text("${documentName}")`).count() > 0;
    
    if (!documentExists) {
      test.skip('Document not found, skipping test');
    }
    
    // Click the document
    await page.click(`[data-testid="document-item"]:has-text("${documentName}")`);
    
    // Check if document is processed
    const isProcessed = await page.locator('[data-testid="document-status"]:has-text("Processed")').count() > 0;
    
    if (!isProcessed) {
      // Process the document if not already processed
      await processDocument(page, documentName);
    }
    
    // Click export button
    await page.click('[data-testid="export-button"]');
    
    // Select export format
    await page.selectOption('[data-testid="export-format-select"]', 'csv');
    
    // Start download
    const downloadPromise = page.waitForEvent('download');
    await page.click('[data-testid="download-button"]');
    const download = await downloadPromise;
    
    // Check downloaded file
    const fileName = download.suggestedFilename();
    expect(fileName).toMatch(/\.csv$/);
  });
});
