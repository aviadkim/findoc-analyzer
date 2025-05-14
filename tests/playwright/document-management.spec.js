const { test, expect } = require('@playwright/test');
const path = require('path');
const { login, uploadDocument } = require('./utils/test-helpers');

test.describe('Document Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await login(page);
  });

  test('should display documents page', async ({ page }) => {
    await page.goto('/documents');
    await expect(page).toHaveTitle(/Documents/);
    await expect(page.locator('[data-testid="documents-list"]')).toBeVisible();
  });

  test('should upload a document', async ({ page }) => {
    // Use a sample PDF for testing
    const filePath = path.join(__dirname, '../test-data/sample_portfolio.pdf');
    
    await page.goto('/documents');
    await page.click('[data-testid="upload-button"]');
    
    // Set file input
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(filePath);
    
    // Click upload
    await page.click('[data-testid="upload-submit-button"]');
    
    // Wait for upload to complete and check success message
    await expect(page.locator('[data-testid="upload-success-message"]')).toBeVisible();
    
    // Verify document appears in the list
    await expect(page.locator('[data-testid="documents-list"]')).toContainText('sample_portfolio.pdf');
  });

  test('should show document details', async ({ page }) => {
    // First upload a document if not exists
    try {
      await page.goto('/documents');
      if (!(await page.locator('[data-testid="document-item"]:has-text("sample_portfolio.pdf")').isVisible())) {
        const filePath = path.join(__dirname, '../test-data/sample_portfolio.pdf');
        await uploadDocument(page, filePath);
      }
    } catch (error) {
      console.warn('Document might already exist, continuing test...');
    }
    
    // Click on the document
    await page.goto('/documents');
    await page.click('[data-testid="document-item"]:has-text("sample_portfolio.pdf")');
    
    // Verify document details page
    await expect(page.locator('[data-testid="document-details"]')).toBeVisible();
    await expect(page.locator('[data-testid="document-name"]')).toContainText('sample_portfolio.pdf');
  });

  test('should filter documents', async ({ page }) => {
    await page.goto('/documents');
    
    // Use filter dropdown
    await page.click('[data-testid="filter-dropdown"]');
    await page.click('[data-testid="filter-option-pdf"]');
    
    // Check that PDF documents are shown
    await expect(page.locator('[data-testid="documents-list"]')).toContainText('.pdf');
    
    // Reset filter
    await page.click('[data-testid="filter-dropdown"]');
    await page.click('[data-testid="filter-option-all"]');
  });

  test('should sort documents', async ({ page }) => {
    await page.goto('/documents');
    
    // Sort by name
    await page.click('[data-testid="sort-dropdown"]');
    await page.click('[data-testid="sort-option-name"]');
    
    // Wait for sort to apply
    await page.waitForTimeout(500);
    
    // Sort by date
    await page.click('[data-testid="sort-dropdown"]');
    await page.click('[data-testid="sort-option-date"]');
    
    // Wait for sort to apply
    await page.waitForTimeout(500);
  });

  test('should search documents', async ({ page }) => {
    await page.goto('/documents');
    
    // Search for portfolio
    await page.fill('[data-testid="search-input"]', 'portfolio');
    await page.press('[data-testid="search-input"]', 'Enter');
    
    // Wait for search results
    await page.waitForTimeout(1000);
    
    // Check search results
    const docList = page.locator('[data-testid="documents-list"]');
    
    // Either there are results containing 'portfolio' or empty state message
    const hasResults = await docList.locator(':has-text("portfolio")').count() > 0;
    
    if (hasResults) {
      await expect(docList).toContainText('portfolio');
    } else {
      await expect(page.locator('[data-testid="no-results-message"]')).toBeVisible();
    }
    
    // Clear search
    await page.click('[data-testid="clear-search-button"]');
  });

  test('should delete a document', async ({ page }) => {
    // First upload a document to delete
    const filePath = path.join(__dirname, '../test-data/sample_portfolio.pdf');
    const documentName = `delete-test-${Date.now()}.pdf`;
    
    // Create a new file to upload with a unique name
    await require('fs').promises.copyFile(filePath, path.join(__dirname, `../test-data/${documentName}`));
    
    // Upload the test document
    await uploadDocument(page, path.join(__dirname, `../test-data/${documentName}`));
    
    // Now delete it
    await page.goto('/documents');
    
    // Find and click the new document
    const docItem = page.locator(`[data-testid="document-item"]:has-text("${documentName}")`);
    await docItem.click();
    
    // Click delete button
    await page.click('[data-testid="delete-document-button"]');
    
    // Confirm deletion
    await page.click('[data-testid="confirm-delete-button"]');
    
    // Check success message
    await expect(page.locator('[data-testid="delete-success-message"]')).toBeVisible();
    
    // Clean up the test file
    await require('fs').promises.unlink(path.join(__dirname, `../test-data/${documentName}`)).catch(err => console.error(err));
  });
});
