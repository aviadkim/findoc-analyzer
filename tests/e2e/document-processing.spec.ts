import { test, expect } from '@playwright/test';

test.describe('Document Processing Workflow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the upload page
    await page.goto('/upload');
    // Wait for the page to load completely
    await page.waitForLoadState('networkidle');
  });

  test('should upload and process a document', async ({ page }) => {
    // Check if we're on the upload page
    await expect(page).toHaveTitle(/Upload/i);
    
    // Verify upload form is present
    const fileInput = page.locator('input[type="file"]');
    await expect(fileInput).toBeVisible();
    
    // Upload a test PDF file
    await fileInput.setInputFiles('./test-data/sample_portfolio.pdf');
    
    // Wait for upload to complete and verify success message
    await expect(page.locator('text=File uploaded successfully')).toBeVisible({ timeout: 10000 });
    
    // Click process button
    await page.locator('button:has-text("Process")').click();
    
    // Wait for processing to complete
    await expect(page.locator('text=Processing complete')).toBeVisible({ timeout: 30000 });
    
    // Verify that processing results are displayed
    await expect(page.locator('text=Processing Results')).toBeVisible();
    
    // Check that securities data was extracted
    const securitiesSection = page.locator('text=Securities');
    await expect(securitiesSection).toBeVisible();
    
    // Verify navigation to document details page
    await page.click('a:has-text("View Details")');
    
    // Check that we're on the document details page
    await expect(page.url()).toContain('/document/');
    
    // Verify document information is displayed
    await expect(page.locator('.document-title')).toBeVisible();
    await expect(page.locator('.document-details')).toBeVisible();
  });

  test('should show error for invalid document upload', async ({ page }) => {
    // Try to upload an invalid file (not a PDF)
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles('./test-data/invalid-file.txt');
    
    // Check for error message
    await expect(page.locator('text=Invalid file format')).toBeVisible({ timeout: 5000 });
  });

  test('should navigate through document workflow', async ({ page }) => {
    // Upload a document first
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles('./test-data/sample_portfolio.pdf');
    await expect(page.locator('text=File uploaded successfully')).toBeVisible({ timeout: 10000 });
    
    // Process the document
    await page.locator('button:has-text("Process")').click();
    await expect(page.locator('text=Processing complete')).toBeVisible({ timeout: 30000 });
    
    // Navigate to documents page
    await page.click('a:has-text("Documents")');
    
    // Verify we're on the documents page
    await expect(page.url()).toContain('/documents');
    
    // Check that our document appears in the list
    await expect(page.locator('.document-card')).toBeVisible();
    
    // Click on document to view details
    await page.click('.document-card');
    
    // Verify document details page
    await expect(page.url()).toContain('/document/');
    
    // Check document actions
    await expect(page.locator('button:has-text("Export")')).toBeVisible();
    await expect(page.locator('button:has-text("Ask Questions")')).toBeVisible();
    
    // Click on Ask Questions button
    await page.click('button:has-text("Ask Questions")');
    
    // Verify document chat interface
    await expect(page.locator('.chat-interface')).toBeVisible();
    
    // Type and send a question
    await page.fill('.chat-input', 'What securities are in this document?');
    await page.click('button:has-text("Send")');
    
    // Wait for response
    await expect(page.locator('.chat-response')).toBeVisible({ timeout: 15000 });
    
    // Verify response contains relevant information
    const responseText = await page.locator('.chat-response').innerText();
    expect(responseText).toContain('securities');
  });

  test('should correctly display document on mobile viewport', async ({ page }) => {
    // This test will run on mobile configurations
    
    // Upload a document
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles('./test-data/sample_portfolio.pdf');
    await expect(page.locator('text=File uploaded successfully')).toBeVisible({ timeout: 10000 });
    
    // Process the document
    await page.locator('button:has-text("Process")').click();
    await expect(page.locator('text=Processing complete')).toBeVisible({ timeout: 30000 });
    
    // Navigate to documents page
    await page.click('a:has-text("Documents")');
    
    // Click on document to view details
    await page.click('.document-card');
    
    // Check for mobile-specific elements
    if (page.viewportSize()?.width < 768) {
      // Verify mobile document viewer is used
      await expect(page.locator('.mobile-document-viewer')).toBeVisible();
      
      // Test mobile gestures (tap to zoom)
      await page.locator('.document-page').dblclick();
      
      // Verify zoom happened
      await expect(page.locator('.document-page.zoomed')).toBeVisible();
      
      // Verify mobile navigation controls
      await expect(page.locator('.mobile-controls')).toBeVisible();
    }
  });
});