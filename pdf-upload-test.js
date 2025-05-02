/**
 * FinDoc Analyzer PDF Upload Test
 *
 * This script tests the PDF upload functionality of the FinDoc Analyzer application.
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Configuration
const config = {
  url: 'https://findoc-deploy.ey.r.appspot.com',
  screenshotsDir: path.join(__dirname, 'pdf-upload-test-results'),
  pdfPath: path.join(__dirname, 'test-documents', 'financial-report-2023.pdf'),
  timeout: 60000, // 60 seconds
  headless: false // Set to true for headless mode
};

// Create screenshots directory if it doesn't exist
if (!fs.existsSync(config.screenshotsDir)) {
  fs.mkdirSync(config.screenshotsDir, { recursive: true });
}

/**
 * Take a screenshot
 * @param {object} page - Puppeteer page
 * @param {string} name - Screenshot name
 * @returns {Promise<string>} Screenshot path
 */
async function takeScreenshot(page, name) {
  const screenshotPath = path.join(config.screenshotsDir, `${name}.png`);
  await page.screenshot({ path: screenshotPath, fullPage: true });
  console.log(`Screenshot saved: ${screenshotPath}`);
  return screenshotPath;
}

/**
 * Run the PDF upload test
 */
async function runPdfUploadTest() {
  console.log('Starting PDF upload test...');

  // Launch browser
  const browser = await puppeteer.launch({
    headless: config.headless,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    // Create a new page
    const page = await browser.newPage();

    // Set viewport
    await page.setViewport({ width: 1280, height: 800 });

    // Navigate to the upload page
    console.log(`Navigating to ${config.url}/upload...`);
    await page.goto(`${config.url}/upload`, { timeout: config.timeout, waitUntil: 'networkidle2' });

    // Take a screenshot of the upload page
    await takeScreenshot(page, '01-upload-page');

    // Log the page HTML for debugging
    const pageHtml = await page.content();
    console.log('Page HTML:', pageHtml.substring(0, 500) + '...');

    // Check if we're on the upload page
    const pageTitle = await page.title();
    console.log('Page title:', pageTitle);

    // Check for any upload-related elements
    const uploadElements = await page.evaluate(() => {
      const elements = {
        uploadArea: document.querySelector('.upload-area'),
        dropzone: document.querySelector('#dropzone'),
        fileInput: document.querySelector('#file-input'),
        uploadBtn: document.querySelector('.upload-btn'),
        uploadForm: document.querySelector('form[enctype="multipart/form-data"]'),
        inputFile: document.querySelector('input[type="file"]')
      };

      return Object.fromEntries(
        Object.entries(elements).map(([key, value]) => [key, value !== null])
      );
    });

    console.log('Upload elements found:', uploadElements);

    // Try to find any file input
    const fileInputs = await page.$$('input[type="file"]');
    console.log(`Found ${fileInputs.length} file inputs on the page`);

    // If no upload area, check if we need to navigate to a different page
    if (!uploadElements.uploadArea && !uploadElements.fileInput && !uploadElements.inputFile) {
      console.log('No upload elements found, checking for navigation links...');

      // Check if there's a link to the upload page
      const uploadLinks = await page.$$('a[href*="upload"]');

      if (uploadLinks.length > 0) {
        console.log(`Found ${uploadLinks.length} upload links, clicking the first one...`);
        await uploadLinks[0].click();
        await page.waitForNavigation({ timeout: config.timeout, waitUntil: 'networkidle2' });
        await takeScreenshot(page, '01b-after-upload-link-click');
      } else {
        // Try to find a button that might lead to upload
        const uploadButtons = await page.$$('button:not([disabled]):not([aria-disabled="true"]):not([style*="display: none"]):not([style*="visibility: hidden"])');

        for (const button of uploadButtons) {
          const buttonText = await page.evaluate(el => el.innerText.toLowerCase(), button);
          if (buttonText.includes('upload') || buttonText.includes('add') || buttonText.includes('new')) {
            console.log(`Found button with text "${buttonText}", clicking it...`);
            await button.click();
            await page.waitForTimeout(2000);
            await takeScreenshot(page, '01c-after-button-click');
            break;
          }
        }
      }
    }

    // Find any file input on the page
    let fileInput = null;

    if (uploadElements.fileInput) {
      fileInput = await page.$('#file-input');
    } else if (uploadElements.inputFile) {
      fileInput = await page.$('input[type="file"]');
    } else if (fileInputs.length > 0) {
      fileInput = fileInputs[0];
    }

    if (!fileInput) {
      console.error('No file input found on the page');
      await takeScreenshot(page, 'error-file-input-not-found');
      throw new Error('No file input found on the page');
    }

    console.log('Found file input, uploading PDF...');
    await fileInput.uploadFile(config.pdfPath);

    // Take a screenshot after file selection
    await takeScreenshot(page, '02-file-selected');

    // Wait for upload to complete
    console.log('Waiting for upload to complete...');

    // Check if the upload status element exists
    const uploadStatusExists = await page.evaluate(() => {
      return document.querySelector('.upload-status') !== null;
    });

    if (uploadStatusExists) {
      // Wait for the upload status to be displayed
      await page.waitForFunction(() => {
        const uploadStatus = document.querySelector('.upload-status');
        return uploadStatus && window.getComputedStyle(uploadStatus).display !== 'none';
      }, { timeout: config.timeout });

      // Take a screenshot of the upload status
      await takeScreenshot(page, '03-upload-status');

      // Wait for the upload to complete
      await page.waitForFunction(() => {
        const progressBar = document.querySelector('.progress-bar');
        return progressBar && progressBar.style.width === '100%';
      }, { timeout: config.timeout });

      // Take a screenshot after upload completion
      await takeScreenshot(page, '04-upload-completed');
    } else {
      console.warn('Upload status element not found, continuing with test...');
    }

    // Check if we are redirected to the documents page
    console.log('Checking if redirected to documents page...');

    // Wait for navigation or timeout
    try {
      await page.waitForNavigation({ timeout: config.timeout, waitUntil: 'networkidle2' });
    } catch (error) {
      console.warn('No navigation occurred after upload, continuing with test...');
    }

    // Take a screenshot of the current page
    await takeScreenshot(page, '05-after-upload');

    // Check if the document appears in the document list
    console.log('Checking if document appears in the document list...');

    // Navigate to the documents page if we're not already there
    const currentUrl = page.url();
    if (!currentUrl.includes('/documents')) {
      console.log('Navigating to documents page...');
      await page.goto(`${config.url}/documents-new`, { timeout: config.timeout, waitUntil: 'networkidle2' });

      // Take a screenshot of the documents page
      await takeScreenshot(page, '06-documents-page');
    }

    // Check if the document grid exists
    const documentGridExists = await page.evaluate(() => {
      return document.querySelector('.document-grid') !== null;
    });

    if (!documentGridExists) {
      console.error('Document grid not found on the page');
      await takeScreenshot(page, 'error-document-grid-not-found');
      throw new Error('Document grid not found on the page');
    }

    // Check if there are any document cards
    const documentCards = await page.$$('.document-card');
    console.log(`Found ${documentCards.length} document cards`);

    if (documentCards.length === 0) {
      console.error('No document cards found on the page');
      await takeScreenshot(page, 'error-no-document-cards');
      throw new Error('No document cards found on the page');
    }

    // Check if our uploaded document is in the list
    const uploadedDocumentFound = await page.evaluate((filename) => {
      const documentCards = document.querySelectorAll('.document-card');
      for (const card of documentCards) {
        const cardTitle = card.querySelector('h3');
        if (cardTitle && cardTitle.innerText.includes('Financial Report 2023')) {
          return true;
        }
      }
      return false;
    }, path.basename(config.pdfPath));

    if (uploadedDocumentFound) {
      console.log('Uploaded document found in the document list');
      await takeScreenshot(page, '07-document-found');
    } else {
      console.error('Uploaded document not found in the document list');
      await takeScreenshot(page, 'error-document-not-found');
      throw new Error('Uploaded document not found in the document list');
    }

    console.log('PDF upload test completed successfully');
  } catch (error) {
    console.error('Error during PDF upload test:', error);

    // Take a screenshot of the error
    try {
      if (page) {
        await takeScreenshot(page, 'error-screenshot');
      }
    } catch (screenshotError) {
      console.error('Error taking error screenshot:', screenshotError);
    }

    throw error;
  } finally {
    // Close browser
    await browser.close();
  }
}

// Run the test
runPdfUploadTest()
  .then(() => {
    console.log('PDF upload test completed successfully');
    process.exit(0);
  })
  .catch(error => {
    console.error('PDF upload test failed:', error);
    process.exit(1);
  });
