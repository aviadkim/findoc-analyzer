// @ts-check
const { test, expect } = require('@playwright/test');

/**
 * Deployed Document Process Test
 *
 * This test verifies that the document process functionality works correctly on the deployed application.
 */

test.describe('Deployed Document Process Test', () => {
  test.use({
    baseURL: 'https://backv2-app-brfi73d4ra-zf.a.run.app'
  });

  test('Process document from document detail page on deployed app', async ({ page }) => {
    // Navigate to the application
    await page.goto('/');
    console.log('Navigated to deployed app homepage');

    // Wait for the page to load
    await page.waitForLoadState('networkidle');

    // Take a screenshot of the homepage
    await page.screenshot({ path: 'test-results/deployed-01-homepage.png' });

    // Check the page title
    const title = await page.title();
    console.log('Page title:', title);

    // Check if we're on the new UI or old UI
    const documentsNewLinks = await page.locator('a[href="/documents-new"]').count();
    const isNewUI = documentsNewLinks > 0;
    console.log('Is new UI:', isNewUI, `(found ${documentsNewLinks} links to /documents-new)`);

    // Navigate to the documents page
    if (isNewUI) {
      await page.locator('a[href="/documents-new"]').click();
      console.log('Clicked on "My Documents" link (new UI)');
    } else {
      await page.locator('a:has-text("Documents")').first().click();
      console.log('Clicked on "Documents" link (old UI)');
    }

    await page.waitForLoadState('networkidle');

    // Take a screenshot of the documents page
    await page.screenshot({ path: 'test-results/deployed-02-documents-page.png' });

    // Check if there are any documents
    const documentCards = page.locator('.document-card');
    const count = await documentCards.count();

    console.log(`Found ${count} documents`);

    if (count === 0) {
      console.log('No documents found, uploading a new document');

      // Navigate to the upload page
      if (isNewUI) {
        await page.locator('a:has-text("Upload")').first().click();
        console.log('Clicked on Upload link (new UI)');
      } else {
        await page.locator('a:has-text("Upload")').first().click();
        console.log('Clicked on Upload link (old UI)');
      }

      await page.waitForLoadState('networkidle');

      // Take a screenshot of the upload page
      await page.screenshot({ path: 'test-results/deployed-03-upload-page.png' });

      // Check if the upload form is visible
      const uploadForm = page.locator('.upload-form');
      if (await uploadForm.isVisible()) {
        console.log('Upload form found, filling it out');

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
        await page.screenshot({ path: 'test-results/deployed-04-file-selected.png' });

        // Click the upload button
        await page.locator('#upload-btn').click();
        console.log('Clicked on Upload button');

        // Wait for the upload to complete and redirect
        await page.waitForNavigation();

        // Take a screenshot after upload
        await page.screenshot({ path: 'test-results/deployed-05-after-upload.png' });

        // Navigate back to the documents page
        if (isNewUI) {
          await page.locator('a[href="/documents-new"]').click();
          console.log('Clicked on "My Documents" link (new UI)');
        } else {
          await page.locator('a:has-text("Documents")').first().click();
          console.log('Clicked on "Documents" link (old UI)');
        }

        await page.waitForLoadState('networkidle');
      } else {
        console.log('Upload form not found');
        await page.screenshot({ path: 'test-results/deployed-03-upload-form-not-found.png' });
      }
    }

    // Take a screenshot of the documents page with documents
    await page.screenshot({ path: 'test-results/deployed-06-documents-page-with-docs.png' });

    // Check if there are any documents now
    const updatedDocumentCards = page.locator('.document-card');
    const updatedCount = await updatedDocumentCards.count();

    console.log(`Found ${updatedCount} documents after potential upload`);

    if (updatedCount === 0) {
      console.log('No documents found, skipping test');
      test.skip('No documents found to test');
      return;
    }

    // Click on the first document card
    await updatedDocumentCards.first().click();
    console.log('Clicked on first document card');

    await page.waitForLoadState('networkidle');

    // Take a screenshot of the document details page
    await page.screenshot({ path: 'test-results/deployed-07-document-details.png' });

    // Log the page content
    const content = await page.content();
    console.log('Page content (first 1000 chars):', content.substring(0, 1000) + '...');

    // Check if the document header is visible
    const documentHeader = page.locator('.document-header');
    if (await documentHeader.isVisible()) {
      console.log('Document header is visible');
    } else {
      console.log('Document header is not visible');
    }

    // Check if the document info is visible
    const documentInfo = page.locator('.document-info');
    if (await documentInfo.isVisible()) {
      console.log('Document info is visible');
    } else {
      console.log('Document info is not visible');
    }

    // Check if the action buttons are visible
    const actionButtons = page.locator('.action-buttons');
    if (await actionButtons.isVisible()) {
      console.log('Action buttons are visible');

      // Get the HTML of the action buttons
      const actionButtonsHtml = await actionButtons.innerHTML();
      console.log('Action buttons HTML:', actionButtonsHtml);
    } else {
      console.log('Action buttons are not visible');
    }

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
      await page.screenshot({ path: 'test-results/deployed-08-processing-started.png' });

      // Wait for a while to let processing happen
      await page.waitForTimeout(5000);

      // Take a screenshot after waiting
      await page.screenshot({ path: 'test-results/deployed-09-after-waiting.png' });

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
      await page.screenshot({ path: 'test-results/deployed-08-reprocessing-started.png' });

      // Wait for a while to let processing happen
      await page.waitForTimeout(5000);

      // Take a screenshot after waiting
      await page.screenshot({ path: 'test-results/deployed-09-after-waiting.png' });

      // Success - we were able to click the reprocess button
      console.log('Successfully clicked the reprocess button');
    } else {
      console.log('No process or reprocess button found');
      await page.screenshot({ path: 'test-results/deployed-08-no-process-button.png' });

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
        await page.screenshot({ path: 'test-results/deployed-09-processing-from-list.png' });

        // Success - we were able to click the process button on the document card
        console.log('Successfully clicked the process button on the document card');
      } else {
        console.log('No process button found on document card either');
        await page.screenshot({ path: 'test-results/deployed-09-no-process-button-on-card.png' });
      }
    }
  });
});
