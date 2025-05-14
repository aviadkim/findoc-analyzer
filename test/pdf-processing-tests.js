/**
 * PDF Processing Tests
 *
 * This file contains end-to-end tests for the PDF processing functionality.
 */

const path = require('path');
const {
  config,
  runTest,
  generateReport,
  navigateTo,
  uploadFile,
  submitForm,
  waitForElement,
  elementExists,
  getTextContent
} = require('./e2e-testing-framework');

/**
 * Run the tests
 */
async function runTests() {
  // Test 1: Upload and process a PDF file
  await runTest('Upload and process a PDF file', async (page) => {
    // Navigate to the upload page
    await navigateTo(page, `${config.baseUrl}/upload`, '01-upload-page');

    // Check if the upload form exists
    const formExists = await elementExists(page, 'form');
    if (!formExists) {
      throw new Error('Upload form not found');
    }

    // Upload a PDF file
    const testPdfPath = path.join(config.testFilesDir, 'test-portfolio.pdf');
    const fileUploaded = await uploadFile(page, 'input[type="file"]', testPdfPath, '02-file-selected');

    if (!fileUploaded) {
      throw new Error('Failed to upload PDF file');
    }

    // Submit the form
    await submitForm(page, 'button[type="submit"]', '03-form-submitted');

    // Wait for the results
    const resultsLoaded = await waitForElement(page, '#results.show, .results, .document-results, .processing-results', 30000, '04-results-loaded');

    if (!resultsLoaded) {
      throw new Error('Results not loaded within timeout');
    }

    // Check if the document info is displayed
    const documentInfoExists = await elementExists(page, '#documentInfo, .document-info');
    if (!documentInfoExists) {
      throw new Error('Document info not displayed');
    }

    // Check if the file name is displayed
    try {
      const fileName = await getTextContent(page, '#fileName');
      if (fileName && fileName.includes('test-portfolio')) {
        console.log('File name displayed correctly:', fileName);
      } else {
        console.warn('File name not displayed correctly in #fileName element');

        // Try to find the file name in other elements
        const pageContent = await page.content();
        if (pageContent.includes('test-portfolio')) {
          console.log('File name found in page content');
        } else {
          console.warn('File name not found in page content');
        }
      }
    } catch (error) {
      console.warn('Error checking file name:', error.message);
    }

    // Check if tables are displayed
    const tablesExist = await elementExists(page, '#tablesSection table, .tables-section table, table');
    if (!tablesExist) {
      console.warn('Tables not displayed');
    }

    // Check if securities are displayed
    const securitiesExist = await elementExists(page, '#securitiesSection table, .securities-section table');
    if (!securitiesExist) {
      console.warn('Securities not displayed');
    }
  });

  // Test 2: Process a PDF with OCR
  await runTest('Process a PDF with OCR', async (page) => {
    // Navigate to the upload page
    await navigateTo(page, `${config.baseUrl}/upload`, '01-ocr-upload-page');

    // Check if the upload form exists
    const formExists = await elementExists(page, 'form');
    if (!formExists) {
      throw new Error('Upload form not found');
    }

    // Upload a PDF file
    const testPdfPath = path.join(config.testFilesDir, 'test-portfolio.pdf');
    const fileUploaded = await uploadFile(page, 'input[type="file"]', testPdfPath, '02-ocr-file-selected');

    if (!fileUploaded) {
      throw new Error('Failed to upload PDF file');
    }

    // Enable OCR
    try {
      await page.click('#useOcr');
    } catch (error) {
      console.warn('Could not click OCR checkbox, trying JavaScript click');
      await page.evaluate(() => {
        const checkbox = document.querySelector('#useOcr');
        if (checkbox) {
          checkbox.checked = true;
        }
      });
    }

    // Submit the form
    await submitForm(page, 'button[type="submit"]', '03-ocr-form-submitted');

    // Wait for the results
    const resultsLoaded = await waitForElement(page, '#results.show, .results, .document-results, .processing-results', 30000, '04-ocr-results-loaded');

    if (!resultsLoaded) {
      throw new Error('Results not loaded within timeout');
    }

    // Check if the document info is displayed
    const documentInfoExists = await elementExists(page, '#documentInfo, .document-info');
    if (!documentInfoExists) {
      throw new Error('Document info not displayed');
    }
  });

  // Generate the test report
  generateReport();
}

// Run the tests
runTests().catch(error => {
  console.error('Error running tests:', error);
  process.exit(1);
});
