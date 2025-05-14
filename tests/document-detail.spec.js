// @ts-check
const { test, expect } = require('@playwright/test');

/**
 * Document Detail Page Test
 * 
 * This test verifies that the document detail page is working correctly.
 */

test.describe('Document Detail Page Test', () => {
  test('Navigate to document detail page', async ({ page }) => {
    // Navigate to the application
    await page.goto('/');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Take a screenshot of the homepage
    await page.screenshot({ path: 'test-results/01-homepage.png' });
    
    // Navigate to the documents page
    await page.click('a:has-text("Documents")');
    await page.waitForLoadState('networkidle');
    
    // Take a screenshot of the documents page
    await page.screenshot({ path: 'test-results/02-documents-page.png' });
    
    // Check if there are any documents
    const documentCards = page.locator('.document-card');
    const count = await documentCards.count();
    
    if (count === 0) {
      test.skip('No documents found to test');
    }
    
    console.log(`Found ${count} documents`);
    
    // Click on the first document to view details
    await documentCards.first().click();
    await page.waitForLoadState('networkidle');
    
    // Take a screenshot of the document details page
    await page.screenshot({ path: 'test-results/03-document-details.png' });
    
    // Check if the document details are displayed
    const documentHeader = page.locator('.document-header');
    await expect(documentHeader).toBeVisible();
    
    // Check if the document info is displayed
    const documentInfo = page.locator('.document-info');
    await expect(documentInfo).toBeVisible();
    
    // Check if the action buttons are displayed
    const actionButtons = page.locator('.action-buttons');
    await expect(actionButtons).toBeVisible();
    
    // Check if the back button is displayed
    const backButton = page.locator('a:has-text("Back to Documents")');
    await expect(backButton).toBeVisible();
    
    // Check if the document status is displayed
    const documentStatus = page.locator('.document-status');
    await expect(documentStatus).toBeVisible();
    
    // Check if the document is processed
    const isProcessed = await page.locator('.status-processed').isVisible();
    
    if (isProcessed) {
      console.log('Document is processed');
      
      // Check if the processed content is displayed
      const processedContent = page.locator('.processed-content');
      await expect(processedContent).toBeVisible();
      
      // Check if the reprocess button is displayed
      const reprocessButton = page.locator('#reprocess-document-btn');
      
      if (await reprocessButton.isVisible()) {
        console.log('Reprocess button is visible');
      } else {
        console.log('Reprocess button is not visible');
      }
    } else {
      console.log('Document is not processed');
      
      // Check if the process button is displayed
      const processButton = page.locator('#process-document-btn');
      
      if (await processButton.isVisible()) {
        console.log('Process button is visible');
      } else {
        console.log('Process button is not visible');
      }
    }
    
    // Check if the download button is displayed
    const downloadButton = page.locator('#download-document-btn');
    
    if (await downloadButton.isVisible()) {
      console.log('Download button is visible');
    } else {
      console.log('Download button is not visible');
    }
    
    // Click the back button to return to the documents page
    await backButton.click();
    await page.waitForLoadState('networkidle');
    
    // Take a screenshot of the documents page
    await page.screenshot({ path: 'test-results/04-back-to-documents.png' });
    
    // Check if we're back on the documents page
    await expect(page.locator('.documents-page')).toBeVisible();
  });
});
