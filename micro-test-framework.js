/**
 * FinDoc Analyzer Micro Test Framework
 *
 * This script provides a framework for running small, focused tests on the FinDoc Analyzer application.
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Configuration
const config = {
  baseUrl: 'http://localhost:8080',
  screenshotsDir: path.join(__dirname, 'micro-test-results'),
  timeout: 30000, // 30 seconds
  headless: false, // Set to false for visible browser
  slowMo: 500, // Slow down Puppeteer operations by 500ms for better visibility
  defaultViewport: null // Use the default viewport size
};

// Create screenshots directory if it doesn't exist
if (!fs.existsSync(config.screenshotsDir)) {
  fs.mkdirSync(config.screenshotsDir, { recursive: true });
}

/**
 * Test runner class
 */
class MicroTestRunner {
  constructor() {
    this.browser = null;
    this.page = null;
    this.results = [];
    this.consoleMessages = [];
    this.errors = [];
    this.networkRequests = [];
    this.networkResponses = [];
  }

  /**
   * Initialize the test runner
   * @returns {Promise<void>}
   */
  async init() {
    this.browser = await puppeteer.launch({
      headless: config.headless,
      slowMo: config.slowMo,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1280,800']
    });

    this.page = await this.browser.newPage();

    // Set viewport
    await this.page.setViewport({
      width: 1280,
      height: 800
    });

    // Collect console messages
    this.page.on('console', message => {
      const consoleMessage = {
        type: message.type(),
        text: message.text(),
        location: message.location(),
        timestamp: new Date().toISOString()
      };

      this.consoleMessages.push(consoleMessage);
      console.log(`Console ${consoleMessage.type}: ${consoleMessage.text}`);
    });

    // Collect errors
    this.page.on('pageerror', error => {
      const pageError = {
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      };

      this.errors.push(pageError);
      console.error(`Page error: ${pageError.message}`);
    });

    // Collect network requests
    this.page.on('request', request => {
      const networkRequest = {
        url: request.url(),
        method: request.method(),
        resourceType: request.resourceType(),
        timestamp: new Date().toISOString()
      };

      this.networkRequests.push(networkRequest);
    });

    // Collect network responses
    this.page.on('response', response => {
      const networkResponse = {
        url: response.url(),
        status: response.status(),
        statusText: response.statusText(),
        timestamp: new Date().toISOString()
      };

      this.networkResponses.push(networkResponse);

      if (response.status() >= 400) {
        console.error(`Network error: ${networkResponse.status} ${networkResponse.statusText} for ${networkResponse.url}`);
      }
    });
  }

  /**
   * Run a test
   * @param {string} name - Test name
   * @param {Function} testFn - Test function
   * @returns {Promise<object>} Test result
   */
  async runTest(name, testFn) {
    console.log(`Running test: ${name}`);

    // Initialize test result
    const testResult = {
      name,
      status: 'pending',
      startTime: new Date(),
      endTime: null,
      duration: null,
      error: null,
      screenshots: []
    };

    try {
      // Clear console messages and errors for this test
      this.consoleMessages = [];
      this.errors = [];
      this.networkRequests = [];
      this.networkResponses = [];

      // Run the test
      await testFn(this);

      // Mark test as passed
      testResult.status = 'passed';
    } catch (error) {
      // Mark test as failed
      testResult.status = 'failed';
      testResult.error = {
        message: error.message,
        stack: error.stack
      };

      console.error(`Test failed: ${name}`);
      console.error(error);

      // Take a screenshot of the failure
      try {
        const screenshotPath = await this.takeScreenshot(`${name}-failure`);
        testResult.screenshots.push(screenshotPath);
      } catch (screenshotError) {
        console.error(`Failed to take failure screenshot: ${screenshotError.message}`);
      }
    } finally {
      // Update test result
      testResult.endTime = new Date();
      testResult.duration = testResult.endTime - testResult.startTime;

      // Add console messages and errors to the test result
      testResult.consoleMessages = [...this.consoleMessages];
      testResult.errors = [...this.errors];
      testResult.networkRequests = [...this.networkRequests];
      testResult.networkResponses = [...this.networkResponses];

      // Add test result to results
      this.results.push(testResult);

      return testResult;
    }
  }

  /**
   * Take a screenshot
   * @param {string} name - Screenshot name
   * @returns {Promise<string>} Screenshot path
   */
  async takeScreenshot(name) {
    const screenshotName = `${name.replace(/[^a-zA-Z0-9]/g, '-')}.png`;
    const screenshotPath = path.join(config.screenshotsDir, screenshotName);

    await this.page.screenshot({ path: screenshotPath, fullPage: true });

    console.log(`Screenshot saved: ${screenshotPath}`);

    return screenshotPath;
  }

  /**
   * Navigate to a URL
   * @param {string} url - URL to navigate to
   * @returns {Promise<void>}
   */
  async navigateTo(url) {
    const fullUrl = url.startsWith('http') ? url : `${config.baseUrl}${url}`;

    console.log(`Navigating to ${fullUrl}...`);

    await this.page.goto(fullUrl, {
      timeout: config.timeout,
      waitUntil: 'networkidle2'
    });

    // Take a screenshot after navigation
    await this.takeScreenshot(`navigation-${url.replace(/[^a-zA-Z0-9]/g, '-')}`);
  }

  /**
   * Wait for an element to be visible
   * @param {string} selector - Element selector
   * @param {number} timeout - Timeout in milliseconds
   * @returns {Promise<ElementHandle>} Element handle
   */
  async waitForElement(selector, timeout = config.timeout) {
    console.log(`Waiting for element: ${selector}...`);

    return this.page.waitForSelector(selector, {
      visible: true,
      timeout
    });
  }

  /**
   * Click an element
   * @param {string} selector - Element selector
   * @returns {Promise<void>}
   */
  async clickElement(selector) {
    console.log(`Clicking element: ${selector}...`);

    await this.waitForElement(selector);
    await this.page.click(selector);

    // Take a screenshot after click
    await this.takeScreenshot(`click-${selector.replace(/[^a-zA-Z0-9]/g, '-')}`);
  }

  /**
   * Type text into an input
   * @param {string} selector - Input selector
   * @param {string} text - Text to type
   * @returns {Promise<void>}
   */
  async typeText(selector, text) {
    console.log(`Typing text into element: ${selector}...`);

    await this.waitForElement(selector);
    await this.page.type(selector, text);

    // Take a screenshot after typing
    await this.takeScreenshot(`type-${selector.replace(/[^a-zA-Z0-9]/g, '-')}`);
  }

  /**
   * Upload a file
   * @param {string} selector - File input selector
   * @param {string} filePath - Path to the file to upload
   * @returns {Promise<void>}
   */
  async uploadFile(selector, filePath) {
    console.log(`Uploading file: ${filePath} to element: ${selector}...`);

    const fileInput = await this.waitForElement(selector);
    await fileInput.uploadFile(filePath);

    // Take a screenshot after upload
    await this.takeScreenshot(`upload-${selector.replace(/[^a-zA-Z0-9]/g, '-')}`);
  }

  /**
   * Check if an element exists
   * @param {string} selector - Element selector
   * @returns {Promise<boolean>} True if the element exists, false otherwise
   */
  async elementExists(selector) {
    console.log(`Checking if element exists: ${selector}...`);

    return this.page.evaluate((sel) => {
      return document.querySelector(sel) !== null;
    }, selector);
  }

  /**
   * Get element text
   * @param {string} selector - Element selector
   * @returns {Promise<string>} Element text
   */
  async getElementText(selector) {
    console.log(`Getting text from element: ${selector}...`);

    await this.waitForElement(selector);

    return this.page.evaluate((sel) => {
      return document.querySelector(sel).innerText;
    }, selector);
  }

  /**
   * Wait for a specific amount of time
   * @param {number} ms - Time to wait in milliseconds
   * @returns {Promise<void>}
   */
  async wait(ms) {
    console.log(`Waiting for ${ms}ms...`);

    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Generate a test report
   * @returns {Promise<string>} Report path
   */
  async generateReport() {
    const reportPath = path.join(config.screenshotsDir, 'test-report.html');
    const reportHtml = this.generateReportHtml();

    fs.writeFileSync(reportPath, reportHtml);

    console.log(`Test report saved to: ${reportPath}`);

    return reportPath;
  }

  /**
   * Generate HTML report
   * @returns {string} HTML report
   */
  generateReportHtml() {
    // Calculate statistics
    const totalTests = this.results.length;
    const passedTests = this.results.filter(result => result.status === 'passed').length;
    const failedTests = this.results.filter(result => result.status === 'failed').length;
    const passRate = Math.round((passedTests / totalTests) * 100);

    // Count network errors
    const networkErrors = this.results.reduce((count, result) => {
      return count + result.networkResponses.filter(response => response.status >= 400).length;
    }, 0);

    // Count JavaScript errors
    const jsErrors = this.results.reduce((count, result) => {
      return count + result.errors.length;
    }, 0);

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>FinDoc Analyzer Micro Test Report</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }
    h1, h2, h3, h4 {
      color: #2c3e50;
    }
    .summary {
      background-color: ${passRate > 80 ? '#d4edda' : passRate > 50 ? '#fff3cd' : '#f8d7da'};
      color: ${passRate > 80 ? '#155724' : passRate > 50 ? '#856404' : '#721c24'};
      padding: 15px;
      border-radius: 5px;
      margin-bottom: 20px;
    }
    .test-result {
      margin-bottom: 30px;
      padding: 15px;
      border-radius: 5px;
      border-left: 5px solid #ddd;
      background-color: #f8f9fa;
    }
    .test-result.passed {
      border-left-color: #28a745;
    }
    .test-result.failed {
      border-left-color: #dc3545;
    }
    .badge {
      display: inline-block;
      padding: 3px 8px;
      border-radius: 3px;
      font-size: 12px;
      font-weight: bold;
    }
    .badge.passed {
      background-color: #d4edda;
      color: #155724;
    }
    .badge.failed {
      background-color: #f8d7da;
      color: #721c24;
    }
    .badge.warning {
      background-color: #fff3cd;
      color: #856404;
    }
    .badge.info {
      background-color: #d1ecf1;
      color: #0c5460;
    }
    .screenshot {
      max-width: 100%;
      height: auto;
      border: 1px solid #ddd;
      border-radius: 5px;
      margin-top: 10px;
    }
    .error {
      background-color: #f8d7da;
      color: #721c24;
      padding: 10px;
      border-radius: 5px;
      margin-top: 10px;
      font-family: monospace;
      white-space: pre-wrap;
    }
    .console {
      background-color: #f8f9fa;
      padding: 10px;
      border-radius: 5px;
      margin-top: 10px;
      font-family: monospace;
      white-space: pre-wrap;
      max-height: 200px;
      overflow-y: auto;
    }
    .console-error {
      color: #dc3545;
    }
    .console-warning {
      color: #ffc107;
    }
    .console-info {
      color: #17a2b8;
    }
    .network-error {
      background-color: #f8d7da;
      color: #721c24;
      padding: 10px;
      border-radius: 5px;
      margin-top: 10px;
      font-family: monospace;
      white-space: pre-wrap;
    }
    .collapsible {
      background-color: #f1f1f1;
      color: #444;
      cursor: pointer;
      padding: 10px;
      width: 100%;
      border: none;
      text-align: left;
      outline: none;
      font-size: 14px;
      border-radius: 5px;
      margin-top: 10px;
    }
    .active, .collapsible:hover {
      background-color: #ddd;
    }
    .collapsible:after {
      content: '\\002B';
      color: #777;
      font-weight: bold;
      float: right;
      margin-left: 5px;
    }
    .active:after {
      content: "\\2212";
    }
    .content {
      padding: 0 10px;
      max-height: 0;
      overflow: hidden;
      transition: max-height 0.2s ease-out;
      background-color: #f8f9fa;
      border-radius: 0 0 5px 5px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
    }
    th, td {
      padding: 8px;
      text-align: left;
      border-bottom: 1px solid #ddd;
    }
    th {
      background-color: #f2f2f2;
    }
    .progress-bar {
      width: 100%;
      background-color: #e9ecef;
      border-radius: 5px;
      margin-bottom: 10px;
    }
    .progress {
      height: 20px;
      border-radius: 5px;
      background-color: ${passRate > 80 ? '#28a745' : passRate > 50 ? '#ffc107' : '#dc3545'};
      width: ${passRate}%;
      text-align: center;
      line-height: 20px;
      color: white;
    }
  </style>
</head>
<body>
  <h1>FinDoc Analyzer Micro Test Report</h1>

  <div class="summary">
    <h2>Summary</h2>
    <div class="progress-bar">
      <div class="progress">${passRate}%</div>
    </div>
    <p><strong>${passedTests}</strong> of <strong>${totalTests}</strong> tests passed</p>
    <p><strong>${networkErrors}</strong> network errors detected</p>
    <p><strong>${jsErrors}</strong> JavaScript errors detected</p>
  </div>

  <h2>Test Results</h2>

  ${this.results.map(result => `
    <div class="test-result ${result.status}">
      <h3>${result.name} <span class="badge ${result.status}">${result.status}</span></h3>
      <p>Duration: ${result.duration}ms</p>

      ${result.error ? `
        <button class="collapsible">Error Details</button>
        <div class="content">
          <div class="error">${result.error.message}
${result.error.stack}</div>
        </div>
      ` : ''}

      ${result.errors.length > 0 ? `
        <button class="collapsible">JavaScript Errors (${result.errors.length})</button>
        <div class="content">
          ${result.errors.map(error => `
            <div class="error">${error.message}
${error.stack}</div>
          `).join('')}
        </div>
      ` : ''}

      ${result.networkResponses.filter(response => response.status >= 400).length > 0 ? `
        <button class="collapsible">Network Errors (${result.networkResponses.filter(response => response.status >= 400).length})</button>
        <div class="content">
          <table>
            <thead>
              <tr>
                <th>URL</th>
                <th>Status</th>
                <th>Status Text</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              ${result.networkResponses.filter(response => response.status >= 400).map(response => `
                <tr>
                  <td>${response.url}</td>
                  <td>${response.status}</td>
                  <td>${response.statusText}</td>
                  <td>${response.timestamp}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      ` : ''}

      ${result.consoleMessages.length > 0 ? `
        <button class="collapsible">Console Messages (${result.consoleMessages.length})</button>
        <div class="content">
          <div class="console">
            ${result.consoleMessages.map(message => `
              <div class="console-${message.type === 'error' ? 'error' : message.type === 'warning' ? 'warning' : 'info'}">
                [${message.timestamp}] [${message.type}] ${message.text}
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}

      ${result.screenshots.length > 0 ? `
        <button class="collapsible">Screenshots (${result.screenshots.length})</button>
        <div class="content">
          ${result.screenshots.map(screenshot => `
            <h4>${path.basename(screenshot)}</h4>
            <img src="${path.basename(screenshot)}" alt="${path.basename(screenshot)}" class="screenshot">
          `).join('')}
        </div>
      ` : ''}
    </div>
  `).join('')}

  <script>
    var coll = document.getElementsByClassName("collapsible");
    var i;

    for (i = 0; i < coll.length; i++) {
      coll[i].addEventListener("click", function() {
        this.classList.toggle("active");
        var content = this.nextElementSibling;
        if (content.style.maxHeight){
          content.style.maxHeight = null;
        } else {
          content.style.maxHeight = content.scrollHeight + "px";
        }
      });
    }
  </script>
</body>
</html>`;
  }

  /**
   * Close the browser
   * @returns {Promise<void>}
   */
  async close() {
    if (this.browser) {
      await this.browser.close();
    }
  }
}

module.exports = {
  MicroTestRunner,
  config
};
