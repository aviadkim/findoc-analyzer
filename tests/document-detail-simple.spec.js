// @ts-check
const { test, expect } = require('@playwright/test');

/**
 * Simple Document Detail Page Test
 * 
 * This test verifies that the document detail page loads correctly.
 */

test.describe('Simple Document Detail Page Test', () => {
  test('Navigate to document detail page', async ({ page }) => {
    // Navigate to the application
    await page.goto('/');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Take a screenshot of the homepage
    await page.screenshot({ path: 'test-results/01-homepage.png' });
    
    // Navigate to the documents page
    await page.locator('a:has-text("Documents")').first().click();
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Take a screenshot of the documents page
    await page.screenshot({ path: 'test-results/02-documents-page.png' });
    
    // Check if there are any documents
    const documentCards = page.locator('.document-card');
    const count = await documentCards.count();
    
    console.log(`Found ${count} documents`);
    
    if (count === 0) {
      test.skip('No documents found to test');
    }
    
    // Click on the first document to view details
    await documentCards.first().click();
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Take a screenshot of the document details page
    await page.screenshot({ path: 'test-results/03-document-details.png' });
    
    // Log the page content
    const content = await page.content();
    console.log('Page content:', content.substring(0, 1000) + '...');
    
    // Check if the document header is visible
    const documentHeader = page.locator('.document-header');
    await expect(documentHeader).toBeVisible();
    
    // Check if the document info is visible
    const documentInfo = page.locator('.document-info');
    await expect(documentInfo).toBeVisible();
    
    // Check if the action buttons are visible
    const actionButtons = page.locator('.action-buttons');
    await expect(actionButtons).toBeVisible();
    
    // Check if the process button is visible
    const processButton = page.locator('#process-document-btn');
    const reprocessButton = page.locator('#reprocess-document-btn');
    
    if (await processButton.isVisible()) {
      console.log('Process button is visible');
    } else if (await reprocessButton.isVisible()) {
      console.log('Reprocess button is visible');
    } else {
      console.log('No process or reprocess button is visible');
      
      // Check the HTML of the action buttons
      const actionButtonsHtml = await actionButtons.innerHTML();
      console.log('Action buttons HTML:', actionButtonsHtml);
    }
  });
});
