/**
 * Test 4: Document Upload
 *
 * This script tests the document upload functionality of the FinDoc Analyzer website.
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// Configuration
const config = {
  url: 'https://findoc-deploy.ey.r.appspot.com/',
  testPdfPath: path.join(__dirname, 'test-files', 'simple-financial-statement.pdf'),
  screenshotsDir: path.join(__dirname, 'screenshots'),
  headless: false,
  slowMo: 100
};

// Create directories if they don't exist
fs.mkdirSync(config.screenshotsDir, { recursive: true });
fs.mkdirSync(path.dirname(config.testPdfPath), { recursive: true });

// Create a simple test PDF if it doesn't exist
if (!fs.existsSync(config.testPdfPath)) {
  console.log('Test PDF does not exist. Please create a test PDF at:', config.testPdfPath);
  process.exit(1);
}

/**
 * Run the test
 */
async function runTest() {
  console.log('Starting Test 4: Document Upload...');

  // Initialize results
  const results = {
    testId: 'Test-04',
    testName: 'Document Upload',
    date: new Date().toISOString(),
    steps: [],
    issues: [],
    screenshots: [],
    overallStatus: 'Pass'
  };

  // Launch browser
  const browser = await chromium.launch({
    headless: config.headless,
    slowMo: config.slowMo
  });

  // Create context and page
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Step 1: Open the website
    console.log('Step 1: Opening the website...');

    await page.goto(config.url);

    // Take screenshot
    const screenshotPath1 = path.join(config.screenshotsDir, 'test-04-step-01.png');
    await page.screenshot({ path: screenshotPath1 });
    results.screenshots.push('test-04-step-01.png');

    results.steps.push({
      step: 1,
      description: 'Open the website',
      expectedResult: 'Website loads successfully',
      actualResult: 'Website loaded successfully',
      status: 'Pass'
    });

    // Step 2: Verify upload button is visible
    console.log('Step 2: Verifying upload button is visible...');

    // Check for upload button with multiple selectors
    console.log('Checking for upload button with multiple selectors...');
    const uploadButtonSelectors = [
      'button:has-text("Upload Document")',
      'button:has-text("Upload")',
      'button:has-text("Add Document")',
      'a:has-text("Upload")',
      '[aria-label="Upload Document"]',
      '.upload-button',
      '#uploadButton',
      '[data-testid="upload-button"]'
    ];

    let uploadButtonVisible = false;
    let uploadButtonSelector = '';

    for (const selector of uploadButtonSelectors) {
      const isVisible = await page.isVisible(selector);
      console.log(`- ${selector}: ${isVisible}`);

      if (isVisible) {
        uploadButtonVisible = true;
        uploadButtonSelector = selector;
        break;
      }
    }

    // Take screenshot
    const screenshotPath2 = path.join(config.screenshotsDir, 'test-04-step-02.png');
    await page.screenshot({ path: screenshotPath2 });
    results.screenshots.push('test-04-step-02.png');

    results.steps.push({
      step: 2,
      description: 'Verify upload button is visible',
      expectedResult: 'Upload button is visible',
      actualResult: uploadButtonVisible
        ? `Upload button is visible (selector: ${uploadButtonSelector})`
        : 'Upload button is not visible with any of the tried selectors',
      status: uploadButtonVisible ? 'Pass' : 'Fail'
    });

    if (!uploadButtonVisible) {
      results.issues.push('Upload button is not visible with any of the tried selectors');
      results.overallStatus = 'Fail';
      throw new Error('Upload button is not visible with any of the tried selectors');
    }

    // Step 3: Click upload button
    console.log('Step 3: Clicking upload button...');

    // Click the upload button using the selector we found
    if (uploadButtonSelector) {
      await page.click(uploadButtonSelector);
    } else {
      throw new Error('No upload button selector found to click');
    }

    // Wait for upload dialog
    const uploadDialogVisible = await page.waitForSelector('input[type="file"]', { timeout: 5000 })
      .then(() => true)
      .catch(() => false);

    // Take screenshot
    const screenshotPath3 = path.join(config.screenshotsDir, 'test-04-step-03.png');
    await page.screenshot({ path: screenshotPath3 });
    results.screenshots.push('test-04-step-03.png');

    results.steps.push({
      step: 3,
      description: 'Click upload button',
      expectedResult: 'Upload dialog appears',
      actualResult: uploadDialogVisible
        ? 'Upload dialog appeared'
        : 'Upload dialog did not appear',
      status: uploadDialogVisible ? 'Pass' : 'Fail'
    });

    if (!uploadDialogVisible) {
      results.issues.push('Upload dialog did not appear');
      results.overallStatus = 'Fail';
      throw new Error('Upload dialog did not appear');
    }

    // Step 4: Select file
    console.log('Step 4: Selecting file...');

    const fileInput = await page.$('input[type="file"]');
    await fileInput.setInputFiles(config.testPdfPath);

    // Verify file name appears
    const fileNameVisible = await page.waitForSelector(`text=${path.basename(config.testPdfPath)}`, { timeout: 5000 })
      .then(() => true)
      .catch(() => false);

    // Take screenshot
    const screenshotPath4 = path.join(config.screenshotsDir, 'test-04-step-04.png');
    await page.screenshot({ path: screenshotPath4 });
    results.screenshots.push('test-04-step-04.png');

    results.steps.push({
      step: 4,
      description: 'Select file',
      expectedResult: 'File is selected and name appears',
      actualResult: fileNameVisible
        ? 'File was selected and name appears'
        : 'File name did not appear after selection',
      status: fileNameVisible ? 'Pass' : 'Fail'
    });

    if (!fileNameVisible) {
      results.issues.push('File name did not appear after selection');
      results.overallStatus = 'Fail';
    }

    // Step 5: Select document type
    console.log('Step 5: Selecting document type...');

    // Check if document type dropdown exists
    const documentTypeDropdownVisible = await page.isVisible('select');

    if (documentTypeDropdownVisible) {
      await page.selectOption('select', 'financial_statement');
    }

    // Take screenshot
    const screenshotPath5 = path.join(config.screenshotsDir, 'test-04-step-05.png');
    await page.screenshot({ path: screenshotPath5 });
    results.screenshots.push('test-04-step-05.png');

    results.steps.push({
      step: 5,
      description: 'Select document type',
      expectedResult: 'Document type is selected',
      actualResult: documentTypeDropdownVisible
        ? 'Document type was selected'
        : 'Document type dropdown not found',
      status: documentTypeDropdownVisible ? 'Pass' : 'Fail'
    });

    if (!documentTypeDropdownVisible) {
      results.issues.push('Document type dropdown not found');
      results.overallStatus = 'Fail';
    }

    // Step 6: Click upload button in dialog
    console.log('Step 6: Clicking upload button in dialog...');

    // Find and click the upload button in the dialog
    const uploadButtonInDialogVisible = await page.isVisible('button:has-text("Upload")');

    if (uploadButtonInDialogVisible) {
      await page.click('button:has-text("Upload")');
    }

    // Take screenshot
    const screenshotPath6 = path.join(config.screenshotsDir, 'test-04-step-06.png');
    await page.screenshot({ path: screenshotPath6 });
    results.screenshots.push('test-04-step-06.png');

    results.steps.push({
      step: 6,
      description: 'Click upload button in dialog',
      expectedResult: 'Upload process starts',
      actualResult: uploadButtonInDialogVisible
        ? 'Upload button clicked'
        : 'Upload button in dialog not found',
      status: uploadButtonInDialogVisible ? 'Pass' : 'Fail'
    });

    if (!uploadButtonInDialogVisible) {
      results.issues.push('Upload button in dialog not found');
      results.overallStatus = 'Fail';
    }

    // Step 7: Wait for upload to complete
    console.log('Step 7: Waiting for upload to complete...');

    // Wait for upload success message or progress indicator
    const uploadSuccessOrProgress = await Promise.race([
      page.waitForSelector('text=Upload complete', { timeout: 30000 })
        .then(() => 'success'),
      page.waitForSelector('.progress-indicator', { timeout: 30000 })
        .then(() => 'progress'),
      new Promise(resolve => setTimeout(() => resolve('timeout'), 30000))
    ]);

    // Take screenshot
    const screenshotPath7 = path.join(config.screenshotsDir, 'test-04-step-07.png');
    await page.screenshot({ path: screenshotPath7 });
    results.screenshots.push('test-04-step-07.png');

    results.steps.push({
      step: 7,
      description: 'Wait for upload to complete',
      expectedResult: 'Upload completes successfully or shows progress',
      actualResult: uploadSuccessOrProgress === 'success'
        ? 'Upload completed successfully'
        : uploadSuccessOrProgress === 'progress'
          ? 'Upload progress indicator visible'
          : 'Upload did not complete within timeout',
      status: uploadSuccessOrProgress !== 'timeout' ? 'Pass' : 'Fail'
    });

    if (uploadSuccessOrProgress === 'timeout') {
      results.issues.push('Upload did not complete within timeout');
      results.overallStatus = 'Fail';
    }

  } catch (error) {
    console.error('Test failed:', error);

    results.steps.push({
      step: results.steps.length + 1,
      description: 'Unexpected error',
      expectedResult: 'No errors',
      actualResult: `Error: ${error.message}`,
      status: 'Fail'
    });

    results.issues.push(`Unexpected error: ${error.message}`);
    results.overallStatus = 'Fail';

    // Take error screenshot
    const screenshotPath = path.join(config.screenshotsDir, 'test-04-error.png');
    await page.screenshot({ path: screenshotPath });
    results.screenshots.push('test-04-error.png');
  } finally {
    // Close browser
    await browser.close();
  }

  // Save results
  const resultsPath = path.join(__dirname, 'results', 'test-04-results.json');
  fs.mkdirSync(path.dirname(resultsPath), { recursive: true });
  fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));

  console.log(`Test completed with status: ${results.overallStatus}`);
  console.log(`Results saved to: ${resultsPath}`);

  return results;
}

// Run the test if this script is executed directly
if (require.main === module) {
  runTest().catch(console.error);
}

module.exports = runTest;
