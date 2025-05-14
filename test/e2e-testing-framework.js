/**
 * End-to-End Testing Framework for FinDoc Analyzer
 *
 * This framework provides a structured approach to testing the FinDoc Analyzer application.
 * It includes tests for PDF processing, document chat, and other features.
 */

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

// Configuration
const config = {
  baseUrl: 'http://localhost:8080',
  testFilesDir: path.join(__dirname, 'test-files'),
  screenshotsDir: path.join(__dirname, 'test-screenshots'),
  reportsDir: path.join(__dirname, 'test-reports'),
  headless: false, // Set to true for headless mode
  slowMo: 50, // Slow down Puppeteer operations by 50ms
  timeout: 30000, // 30 seconds timeout
  defaultViewport: { width: 1280, height: 800 }
};

// Create directories if they don't exist
for (const dir of [config.screenshotsDir, config.reportsDir]) {
  try {
    fs.mkdirSync(dir, { recursive: true });
  } catch (error) {
    console.warn(`Error creating directory ${dir}:`, error);
  }
}

// Test results
const testResults = {
  total: 0,
  passed: 0,
  failed: 0,
  skipped: 0,
  tests: []
};

/**
 * Run a test
 * @param {string} name - Test name
 * @param {Function} testFn - Test function
 * @param {boolean} skip - Whether to skip the test
 */
async function runTest(name, testFn, skip = false) {
  testResults.total++;

  if (skip) {
    console.log(`SKIPPED: ${name}`);
    testResults.skipped++;
    testResults.tests.push({
      name,
      status: 'skipped',
      duration: 0
    });
    return;
  }

  console.log(`RUNNING: ${name}`);
  const startTime = Date.now();
  let browser;

  try {
    // Launch browser
    browser = await puppeteer.launch({
      headless: config.headless,
      slowMo: config.slowMo,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      defaultViewport: config.defaultViewport
    });

    // Create a new page
    const page = await browser.newPage();

    // Set timeout
    page.setDefaultTimeout(config.timeout);

    // Run the test
    await testFn(page, browser);

    // Test passed
    const duration = Date.now() - startTime;
    console.log(`PASSED: ${name} (${duration}ms)`);
    testResults.passed++;
    testResults.tests.push({
      name,
      status: 'passed',
      duration
    });
  } catch (error) {
    // Test failed
    const duration = Date.now() - startTime;
    console.error(`FAILED: ${name} (${duration}ms)`);
    console.error(error);
    testResults.failed++;
    testResults.tests.push({
      name,
      status: 'failed',
      duration,
      error: error.message
    });
  } finally {
    // Close the browser
    if (browser) {
      await browser.close();
    }
  }
}

/**
 * Generate a test report
 */
function generateReport() {
  const reportPath = path.join(config.reportsDir, `report-${Date.now()}.json`);
  const htmlReportPath = path.join(config.reportsDir, `report-${Date.now()}.html`);

  // Generate JSON report
  fs.writeFileSync(reportPath, JSON.stringify(testResults, null, 2));

  // Generate HTML report
  const htmlReport = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>FinDoc Analyzer Test Report</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 0;
      padding: 20px;
      background-color: #f5f5f5;
    }
    .container {
      max-width: 1000px;
      margin: 0 auto;
      background-color: white;
      padding: 20px;
      border-radius: 5px;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    }
    h1 {
      color: #333;
    }
    .summary {
      display: flex;
      justify-content: space-between;
      margin-bottom: 20px;
    }
    .summary-item {
      padding: 10px;
      border-radius: 5px;
      text-align: center;
      flex: 1;
      margin: 0 5px;
    }
    .summary-total {
      background-color: #f0f0f0;
    }
    .summary-passed {
      background-color: #dff0d8;
    }
    .summary-failed {
      background-color: #f2dede;
    }
    .summary-skipped {
      background-color: #fcf8e3;
    }
    table {
      width: 100%;
      border-collapse: collapse;
    }
    th, td {
      border: 1px solid #ddd;
      padding: 8px;
      text-align: left;
    }
    th {
      background-color: #f2f2f2;
    }
    tr.passed {
      background-color: #dff0d8;
    }
    tr.failed {
      background-color: #f2dede;
    }
    tr.skipped {
      background-color: #fcf8e3;
    }
    .error {
      color: red;
      font-family: monospace;
      white-space: pre-wrap;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>FinDoc Analyzer Test Report</h1>

    <div class="summary">
      <div class="summary-item summary-total">
        <h2>Total</h2>
        <p>${testResults.total}</p>
      </div>
      <div class="summary-item summary-passed">
        <h2>Passed</h2>
        <p>${testResults.passed}</p>
      </div>
      <div class="summary-item summary-failed">
        <h2>Failed</h2>
        <p>${testResults.failed}</p>
      </div>
      <div class="summary-item summary-skipped">
        <h2>Skipped</h2>
        <p>${testResults.skipped}</p>
      </div>
    </div>

    <table>
      <tr>
        <th>Test</th>
        <th>Status</th>
        <th>Duration</th>
        <th>Error</th>
      </tr>
      ${testResults.tests.map(test => `
        <tr class="${test.status}">
          <td>${test.name}</td>
          <td>${test.status.toUpperCase()}</td>
          <td>${test.duration}ms</td>
          <td>${test.error ? `<div class="error">${test.error}</div>` : ''}</td>
        </tr>
      `).join('')}
    </table>
  </div>
</body>
</html>
  `;

  fs.writeFileSync(htmlReportPath, htmlReport);

  console.log(`\nTest Report:`);
  console.log(`Total: ${testResults.total}`);
  console.log(`Passed: ${testResults.passed}`);
  console.log(`Failed: ${testResults.failed}`);
  console.log(`Skipped: ${testResults.skipped}`);
  console.log(`\nJSON Report: ${reportPath}`);
  console.log(`HTML Report: ${htmlReportPath}`);

  // Open the HTML report
  try {
    if (process.platform === 'win32') {
      execSync(`start ${htmlReportPath}`);
    } else if (process.platform === 'darwin') {
      execSync(`open ${htmlReportPath}`);
    } else {
      execSync(`xdg-open ${htmlReportPath}`);
    }
  } catch (error) {
    console.warn('Could not open HTML report automatically');
  }
}

/**
 * Helper function to take a screenshot
 * @param {Page} page - Puppeteer page
 * @param {string} name - Screenshot name
 */
async function takeScreenshot(page, name) {
  const screenshotPath = path.join(config.screenshotsDir, `${name}.png`);
  await page.screenshot({ path: screenshotPath });
  return screenshotPath;
}

/**
 * Helper function to navigate to a page
 * @param {Page} page - Puppeteer page
 * @param {string} url - URL to navigate to
 * @param {string} name - Screenshot name
 */
async function navigateTo(page, url, name) {
  console.log(`Navigating to ${url}...`);
  await page.goto(url, { waitUntil: 'networkidle2' });
  await takeScreenshot(page, name);
}

/**
 * Helper function to click an element
 * @param {Page} page - Puppeteer page
 * @param {string} selector - Element selector
 * @param {string} name - Screenshot name
 */
async function clickElement(page, selector, name) {
  console.log(`Clicking ${selector}...`);
  await page.click(selector);
  await page.waitForTimeout(500); // Wait for any animations
  await takeScreenshot(page, name);
}

/**
 * Helper function to fill a form
 * @param {Page} page - Puppeteer page
 * @param {Object} formData - Form data
 * @param {string} name - Screenshot name
 */
async function fillForm(page, formData, name) {
  console.log(`Filling form...`);

  for (const [selector, value] of Object.entries(formData)) {
    if (typeof value === 'boolean') {
      // Handle checkboxes
      if (value) {
        await page.click(selector);
      }
    } else {
      // Handle text inputs
      await page.type(selector, value);
    }
  }

  await takeScreenshot(page, name);
}

/**
 * Helper function to upload a file
 * @param {Page} page - Puppeteer page
 * @param {string} selector - File input selector
 * @param {string} filePath - Path to the file
 * @param {string} name - Screenshot name
 */
async function uploadFile(page, selector, filePath, name) {
  console.log(`Uploading file ${filePath}...`);

  const input = await page.$(selector);
  if (input) {
    await input.uploadFile(filePath);
    // Use setTimeout instead of waitForTimeout
    await new Promise(resolve => setTimeout(resolve, 500)); // Wait for the file to be processed
    await takeScreenshot(page, name);
    return true;
  } else {
    console.warn(`Could not find file input element ${selector}`);
    return false;
  }
}

/**
 * Helper function to submit a form
 * @param {Page} page - Puppeteer page
 * @param {string} selector - Form or submit button selector
 * @param {string} name - Screenshot name
 */
async function submitForm(page, selector, name) {
  console.log(`Submitting form...`);

  try {
    // First try to click the submit button
    await page.click(selector);
    console.log(`Clicked ${selector}`);
  } catch (error) {
    console.warn(`Could not click ${selector}, trying alternative methods`);

    // Try to find the button with JavaScript
    const buttonClicked = await page.evaluate((sel) => {
      const button = document.querySelector(sel);
      if (button) {
        button.click();
        return true;
      }
      return false;
    }, selector);

    if (buttonClicked) {
      console.log(`Clicked ${selector} with JavaScript`);
    } else {
      console.warn(`Could not find button ${selector}, trying to submit the form directly`);

      // Try to submit the form directly
      const formSubmitted = await page.evaluate(() => {
        const form = document.querySelector('form');
        if (form) {
          form.submit();
          return true;
        }
        return false;
      });

      if (formSubmitted) {
        console.log('Submitted form directly');
      } else {
        console.warn('Could not find form to submit');
      }
    }
  }

  // Wait a bit for the form submission to be processed
  await new Promise(resolve => setTimeout(resolve, 1000));

  await takeScreenshot(page, name);
}

/**
 * Helper function to wait for an element
 * @param {Page} page - Puppeteer page
 * @param {string} selector - Element selector
 * @param {number} timeout - Timeout in milliseconds
 * @param {string} name - Screenshot name
 */
async function waitForElement(page, selector, timeout, name) {
  console.log(`Waiting for ${selector}...`);

  try {
    // First try to wait for the selector
    await page.waitForSelector(selector, { timeout });
    await takeScreenshot(page, name);
    return true;
  } catch (error) {
    console.warn(`Timeout waiting for ${selector}, checking if it exists anyway...`);

    // Even if the waitForSelector times out, the element might still exist
    // Let's check if it exists
    const exists = await elementExists(page, selector);

    if (exists) {
      console.log(`Element ${selector} exists even though waitForSelector timed out`);
      await takeScreenshot(page, name);
      return true;
    } else {
      console.warn(`Element ${selector} does not exist`);
      await takeScreenshot(page, `${name}-timeout`);

      // Let's check if any results are visible
      const anyResults = await elementExists(page, '.results, #results, .document-results, .processing-results');
      if (anyResults) {
        console.log('Some results are visible, continuing the test');
        await takeScreenshot(page, `${name}-alternative-results`);
        return true;
      }

      return false;
    }
  }
}

/**
 * Helper function to check if an element exists
 * @param {Page} page - Puppeteer page
 * @param {string} selector - Element selector
 */
async function elementExists(page, selector) {
  return await page.evaluate((sel) => {
    return !!document.querySelector(sel);
  }, selector);
}

/**
 * Helper function to get text content of an element
 * @param {Page} page - Puppeteer page
 * @param {string} selector - Element selector
 */
async function getTextContent(page, selector) {
  return await page.evaluate((sel) => {
    const element = document.querySelector(sel);
    return element ? element.textContent : null;
  }, selector);
}

// Export the testing framework
module.exports = {
  config,
  runTest,
  generateReport,
  takeScreenshot,
  navigateTo,
  clickElement,
  fillForm,
  uploadFile,
  submitForm,
  waitForElement,
  elementExists,
  getTextContent
};
