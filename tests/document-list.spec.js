// @ts-check
const { test, expect } = require('@playwright/test');

/**
 * Document List Page Test
 * 
 * This test verifies that the document list page is working correctly.
 */

test.describe('Document List Page Test', () => {
  test('Navigate to document list page', async ({ page }) => {
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
    
    // Check if the documents page is displayed
    const documentsPage = page.locator('.documents-page');
    await expect(documentsPage).toBeVisible();
    
    // Check if there are any documents
    const documentCards = page.locator('.document-card');
    const count = await documentCards.count();
    
    console.log(`Found ${count} documents`);
    
    if (count > 0) {
      // Check if the document cards have the expected elements
      const firstDocumentCard = documentCards.first();
      
      // Check if the document card has a header
      const cardHeader = firstDocumentCard.locator('.document-card-header');
      await expect(cardHeader).toBeVisible();
      
      // Check if the document card has a body
      const cardBody = firstDocumentCard.locator('.document-card-body');
      await expect(cardBody).toBeVisible();
      
      // Check if the document card has a footer
      const cardFooter = firstDocumentCard.locator('.document-card-footer');
      await expect(cardFooter).toBeVisible();
      
      // Check if the document card has a view link
      const viewLink = firstDocumentCard.locator('.view-link');
      await expect(viewLink).toBeVisible();
      
      // Take a screenshot of the document cards
      await page.screenshot({ path: 'test-results/03-document-cards.png' });
    } else {
      // Check if the empty state is displayed
      const emptyState = page.locator('.empty-state');
      await expect(emptyState).toBeVisible();
      
      // Take a screenshot of the empty state
      await page.screenshot({ path: 'test-results/03-empty-state.png' });
    }
  });
});
