const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Create screenshots directory if it doesn't exist
const screenshotsDir = path.join(__dirname, 'test-screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

(async () => {
  console.log('Starting document processing test...');

  // Launch browser
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    args: ['--start-maximized']
  });

  try {
    // Open new page
    const page = await browser.newPage();

    // Navigate to the application
    console.log('Navigating to the application...');
    await page.goto('http://localhost:8080');
    await page.screenshot({ path: path.join(screenshotsDir, '01-homepage.png') });

    // Navigate to the documents page
    console.log('Navigating to the documents page...');
    await page.click('a[href="/documents-new"]');
    await new Promise(resolve => setTimeout(resolve, 1000)); // Use setTimeout for compatibility
    await page.screenshot({ path: path.join(screenshotsDir, '02-documents-page.png') });

    // Check if there are any documents
    const documentCards = await page.$$('.document-card');

    if (documentCards.length === 0) {
      console.log('No documents found. Navigating to upload page...');

      // Navigate to the upload page
      await page.click('a[href="/upload"]');
      await new Promise(resolve => setTimeout(resolve, 1000));
      await page.screenshot({ path: path.join(screenshotsDir, '03-upload-page.png') });

      // Fill in the upload form
      await page.type('#document-name', 'Test Document ' + Date.now());
      await page.select('#document-type', 'financial');

      // Upload a test file
      const fileInput = await page.$('#file-input');
      await fileInput.uploadFile(path.join(__dirname, 'test-data', 'test-document.pdf'));

      // Wait for the file to be selected
      await page.waitForSelector('#file-name', { visible: true });
      await page.screenshot({ path: path.join(screenshotsDir, '04-file-selected.png') });

      // Click the upload button
      await page.click('#upload-btn');

      // Wait for the upload to complete and redirect
      await page.waitForNavigation();
      await page.screenshot({ path: path.join(screenshotsDir, '05-after-upload.png') });

      // Navigate back to the documents page
      await page.click('a[href="/documents-new"]');
      await new Promise(resolve => setTimeout(resolve, 1000));
      await page.screenshot({ path: path.join(screenshotsDir, '06-documents-page-after-upload.png') });
    }

    // Click on the first document card
    console.log('Clicking on the first document card...');
    const firstDocumentCard = await page.$('.document-card');
    if (firstDocumentCard) {
      await firstDocumentCard.click();
      await new Promise(resolve => setTimeout(resolve, 1000));
      await page.screenshot({ path: path.join(screenshotsDir, '07-document-details.png') });

      // Check if the process button is visible
      const processButton = await page.$('#process-document-btn');
      const reprocessButton = await page.$('#reprocess-document-btn');

      if (processButton) {
        console.log('Process button found. Clicking...');
        await processButton.click();
        await new Promise(resolve => setTimeout(resolve, 1000));
        await page.screenshot({ path: path.join(screenshotsDir, '08-processing-started.png') });

        // Wait for processing to complete
        console.log('Waiting for processing to complete...');
        await new Promise(resolve => setTimeout(resolve, 5000));
        await page.screenshot({ path: path.join(screenshotsDir, '09-after-waiting.png') });
      } else if (reprocessButton) {
        console.log('Reprocess button found. Clicking...');
        await reprocessButton.click();
        await page.waitFor(1000);
        await page.screenshot({ path: path.join(screenshotsDir, '08-reprocessing-started.png') });

        // Wait for processing to complete
        console.log('Waiting for processing to complete...');
        await page.waitFor(5000);
        await page.screenshot({ path: path.join(screenshotsDir, '09-after-waiting.png') });
      } else {
        console.log('No process or reprocess button found.');
        await page.screenshot({ path: path.join(screenshotsDir, '08-no-process-button.png') });
      }
    } else {
      console.log('No document cards found.');
    }

    // Navigate to the document chat page
    console.log('Navigating to the document chat page...');
    await page.click('a[href="/document-chat"]');
    await page.waitFor(1000);
    await page.screenshot({ path: path.join(screenshotsDir, '10-document-chat.png') });

    // Check if there are any documents in the selector
    const documentOptions = await page.$$('#document-select option');

    if (documentOptions.length > 1) { // Account for the default "Select a document" option
      console.log('Selecting the first document...');
      await page.select('#document-select', { index: 1 });
      await page.waitFor(1000);
      await page.screenshot({ path: path.join(screenshotsDir, '11-document-selected.png') });

      // Type a test question
      console.log('Typing a test question...');
      await page.type('#document-chat-input', 'What is this document about?');
      await page.screenshot({ path: path.join(screenshotsDir, '12-question-typed.png') });

      // Send the question
      console.log('Sending the question...');
      await page.click('#document-send-btn');

      // Wait for the response
      console.log('Waiting for the response...');
      await page.waitFor(5000);
      await page.screenshot({ path: path.join(screenshotsDir, '13-after-response.png') });
    } else {
      console.log('No documents found in the selector.');
    }

    console.log('Test completed successfully!');
  } catch (error) {
    console.error('Test failed:', error);

    // Take a screenshot of the error
    const page = (await browser.pages())[0];
    await page.screenshot({ path: path.join(screenshotsDir, 'error.png') });
  } finally {
    // Close the browser
    await browser.close();
  }
})();
