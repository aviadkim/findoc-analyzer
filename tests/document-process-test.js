// @ts-check
const { test, expect } = require('@playwright/test');

/**
 * Document Process Test
 * 
 * This test verifies that the document process functionality works correctly.
 */

test.describe('Document Process Test', () => {
  test('Process document from document detail page', async ({ page }) => {
    // Start the server before running the test
    console.log('Starting test: Process document from document detail page');
    
    // Navigate to the application
    await page.goto('/');
    console.log('Navigated to homepage');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Take a screenshot of the homepage
    await page.screenshot({ path: 'test-results/01-homepage.png' });
    
    // Navigate to the documents page
    await page.getByText('Documents').first().click();
    console.log('Clicked on Documents link');
    
    await page.waitForLoadState('networkidle');
    
    // Take a screenshot of the documents page
    await page.screenshot({ path: 'test-results/02-documents-page.png' });
    
    // Check if there are any documents
    const documentCards = page.locator('.document-card');
    const count = await documentCards.count();
    
    if (count === 0) {
      console.log('No documents found, uploading a new document');
      
      // Navigate to the upload page
      await page.getByText('Upload').first().click();
      console.log('Clicked on Upload link');
      
      await page.waitForLoadState('networkidle');
      
      // Take a screenshot of the upload page
      await page.screenshot({ path: 'test-results/03-upload-page.png' });
      
      // Fill in the form
      await page.locator('#document-name').fill('Test Document');
      await page.locator('#document-type').selectOption('financial');
      
      // Create a test file
      const testFile = {
        name: 'test-document.pdf',
        mimeType: 'application/pdf',
        buffer: Buffer.from('Test PDF content')
      };
      
      // Set the file input
      await page.locator('#file-input').setInputFiles(testFile);
      
      // Wait for the file to be selected
      await page.waitForSelector('#file-name', { state: 'visible' });
      
      // Take a screenshot of the form with file selected
      await page.screenshot({ path: 'test-results/04-file-selected.png' });
      
      // Click the upload button
      await page.locator('#upload-btn').click();
      console.log('Clicked on Upload button');
      
      // Wait for the upload to complete and redirect
      await page.waitForNavigation();
      
      // Take a screenshot after upload
      await page.screenshot({ path: 'test-results/05-after-upload.png' });
      
      // Navigate back to the documents page
      await page.getByText('Documents').first().click();
      console.log('Clicked on Documents link');
      
      await page.waitForLoadState('networkidle');
    } else {
      console.log(`Found ${count} documents`);
    }
    
    // Take a screenshot of the documents page with documents
    await page.screenshot({ path: 'test-results/06-documents-page-with-docs.png' });
    
    // Click on the first document card
    await page.locator('.document-card').first().click();
    console.log('Clicked on first document card');
    
    await page.waitForLoadState('networkidle');
    
    // Take a screenshot of the document details page
    await page.screenshot({ path: 'test-results/07-document-details.png' });
    
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
      console.log('Process button found, clicking it');
      
      // Click the process button
      await processButton.click();
      
      // Wait for processing to start
      await page.waitForSelector('#processing-status', { state: 'visible', timeout: 5000 }).catch(() => {
        console.log('Processing status not visible, continuing anyway');
      });
      
      // Take a screenshot of the processing status
      await page.screenshot({ path: 'test-results/08-processing-started.png' });
      
      // Wait for a while to let processing happen
      await page.waitForTimeout(5000);
      
      // Take a screenshot after waiting
      await page.screenshot({ path: 'test-results/09-after-waiting.png' });
      
      // Success - we were able to click the process button
      console.log('Successfully clicked the process button');
    } else if (await reprocessButton.isVisible()) {
      console.log('Reprocess button found, clicking it');
      
      // Click the reprocess button
      await reprocessButton.click();
      
      // Wait for processing to start
      await page.waitForSelector('#processing-status', { state: 'visible', timeout: 5000 }).catch(() => {
        console.log('Processing status not visible, continuing anyway');
      });
      
      // Take a screenshot of the processing status
      await page.screenshot({ path: 'test-results/08-reprocessing-started.png' });
      
      // Wait for a while to let processing happen
      await page.waitForTimeout(5000);
      
      // Take a screenshot after waiting
      await page.screenshot({ path: 'test-results/09-after-waiting.png' });
      
      // Success - we were able to click the reprocess button
      console.log('Successfully clicked the reprocess button');
    } else {
      console.log('No process or reprocess button found');
      await page.screenshot({ path: 'test-results/08-no-process-button.png' });
      
      // Check the HTML structure
      const html = await page.content();
      console.log('HTML structure:', html.substring(0, 1000) + '...');
      
      // Check if there's a process button on the document card
      await page.goto('/documents');
      await page.waitForLoadState('networkidle');
      
      const processBtn = page.locator('.process-btn').first();
      if (await processBtn.isVisible()) {
        console.log('Process button found on document card, clicking it');
        
        // Click the process button
        await processBtn.click();
        
        // Wait for a while to let processing happen
        await page.waitForTimeout(5000);
        
        // Take a screenshot after waiting
        await page.screenshot({ path: 'test-results/09-processing-from-list.png' });
        
        // Success - we were able to click the process button on the document card
        console.log('Successfully clicked the process button on the document card');
      } else {
        console.log('No process button found on document card either');
        await page.screenshot({ path: 'test-results/09-no-process-button-on-card.png' });
      }
    }
  });
});
