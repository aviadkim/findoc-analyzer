/**
 * FinDoc Analyzer Puppeteer Test Framework
 * 
 * This script provides a framework for testing the FinDoc Analyzer application using Puppeteer.
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Configuration
const config = {
  baseUrl: 'https://findoc-deploy.ey.r.appspot.com',
  screenshotsDir: path.join(__dirname, 'puppeteer-test-results'),
  timeout: 30000, // 30 seconds
  viewportWidth: 1280,
  viewportHeight: 800,
  headless: 'new'
};

// Create screenshots directory if it doesn't exist
if (!fs.existsSync(config.screenshotsDir)) {
  fs.mkdirSync(config.screenshotsDir, { recursive: true });
}

/**
 * Test runner class
 */
class TestRunner {
  constructor() {
    this.browser = null;
    this.page = null;
    this.results = [];
    this.currentTest = null;
  }

  /**
   * Initialize the test runner
   * @returns {Promise<void>}
   */
  async init() {
    this.browser = await puppeteer.launch({
      headless: config.headless,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
  }

  /**
   * Create a new page
   * @returns {Promise<void>}
   */
  async createPage() {
    this.page = await this.browser.newPage();
    
    // Set viewport
    await this.page.setViewport({
      width: config.viewportWidth,
      height: config.viewportHeight
    });
    
    // Collect console messages
    this.page.on('console', message => {
      if (this.currentTest) {
        if (!this.currentTest.consoleMessages) {
          this.currentTest.consoleMessages = [];
        }
        
        this.currentTest.consoleMessages.push({
          type: message.type(),
          text: message.text()
        });
      }
    });
    
    // Collect errors
    this.page.on('pageerror', error => {
      if (this.currentTest) {
        if (!this.currentTest.errors) {
          this.currentTest.errors = [];
        }
        
        this.currentTest.errors.push({
          message: error.message,
          stack: error.stack
        });
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
    
    // Create a new page for each test
    await this.createPage();
    
    // Initialize test result
    this.currentTest = {
      name,
      status: 'pending',
      startTime: new Date(),
      endTime: null,
      duration: null,
      errors: [],
      consoleMessages: [],
      screenshots: []
    };
    
    try {
      // Run the test
      await testFn(this.page, this);
      
      // Mark test as passed
      this.currentTest.status = 'passed';
    } catch (error) {
      // Mark test as failed
      this.currentTest.status = 'failed';
      this.currentTest.error = {
        message: error.message,
        stack: error.stack
      };
      
      console.error(`Test failed: ${name}`);
      console.error(error);
    } finally {
      // Close the page
      await this.page.close();
      
      // Update test result
      this.currentTest.endTime = new Date();
      this.currentTest.duration = this.currentTest.endTime - this.currentTest.startTime;
      
      // Add test result to results
      this.results.push(this.currentTest);
      
      // Reset current test
      const result = this.currentTest;
      this.currentTest = null;
      
      return result;
    }
  }

  /**
   * Take a screenshot
   * @param {string} name - Screenshot name
   * @returns {Promise<string>} Screenshot path
   */
  async takeScreenshot(name) {
    const screenshotName = `${this.currentTest.name}-${name}.png`;
    const screenshotPath = path.join(config.screenshotsDir, screenshotName);
    
    await this.page.screenshot({ path: screenshotPath, fullPage: true });
    
    if (this.currentTest) {
      this.currentTest.screenshots.push(screenshotPath);
    }
    
    return screenshotPath;
  }

  /**
   * Navigate to a URL
   * @param {string} url - URL to navigate to
   * @returns {Promise<void>}
   */
  async navigateTo(url) {
    const fullUrl = url.startsWith('http') ? url : `${config.baseUrl}${url}`;
    
    await this.page.goto(fullUrl, {
      timeout: config.timeout,
      waitUntil: 'networkidle2'
    });
    
    // Take a screenshot after navigation
    await this.takeScreenshot('navigation');
  }

  /**
   * Wait for an element to be visible
   * @param {string} selector - Element selector
   * @param {number} timeout - Timeout in milliseconds
   * @returns {Promise<ElementHandle>} Element handle
   */
  async waitForElement(selector, timeout = config.timeout) {
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
    await this.waitForElement(selector);
    await this.page.type(selector, text);
    
    // Take a screenshot after typing
    await this.takeScreenshot(`type-${selector.replace(/[^a-zA-Z0-9]/g, '-')}`);
  }

  /**
   * Select an option from a select element
   * @param {string} selector - Select selector
   * @param {string} value - Option value
   * @returns {Promise<void>}
   */
  async selectOption(selector, value) {
    await this.waitForElement(selector);
    await this.page.select(selector, value);
    
    // Take a screenshot after selection
    await this.takeScreenshot(`select-${selector.replace(/[^a-zA-Z0-9]/g, '-')}`);
  }

  /**
   * Check if an element exists
   * @param {string} selector - Element selector
   * @returns {Promise<boolean>} True if the element exists, false otherwise
   */
  async elementExists(selector) {
    return this.page.evaluate((sel) => {
      return document.querySelector(sel) !== null;
    }, selector);
  }

  /**
   * Check if an element is visible
   * @param {string} selector - Element selector
   * @returns {Promise<boolean>} True if the element is visible, false otherwise
   */
  async elementIsVisible(selector) {
    return this.page.evaluate((sel) => {
      const el = document.querySelector(sel);
      if (!el) return false;
      
      const style = window.getComputedStyle(el);
      return style.display !== 'none' && 
             style.visibility !== 'hidden' && 
             style.opacity !== '0';
    }, selector);
  }

  /**
   * Get element text
   * @param {string} selector - Element selector
   * @returns {Promise<string>} Element text
   */
  async getElementText(selector) {
    await this.waitForElement(selector);
    
    return this.page.evaluate((sel) => {
      return document.querySelector(sel).innerText;
    }, selector);
  }

  /**
   * Get element attribute
   * @param {string} selector - Element selector
   * @param {string} attribute - Attribute name
   * @returns {Promise<string>} Attribute value
   */
  async getElementAttribute(selector, attribute) {
    await this.waitForElement(selector);
    
    return this.page.evaluate((sel, attr) => {
      return document.querySelector(sel).getAttribute(attr);
    }, selector, attribute);
  }

  /**
   * Get element style
   * @param {string} selector - Element selector
   * @param {string} property - Style property
   * @returns {Promise<string>} Style value
   */
  async getElementStyle(selector, property) {
    await this.waitForElement(selector);
    
    return this.page.evaluate((sel, prop) => {
      return window.getComputedStyle(document.querySelector(sel))[prop];
    }, selector, property);
  }

  /**
   * Get element position
   * @param {string} selector - Element selector
   * @returns {Promise<object>} Element position
   */
  async getElementPosition(selector) {
    await this.waitForElement(selector);
    
    return this.page.evaluate((sel) => {
      const rect = document.querySelector(sel).getBoundingClientRect();
      return {
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: rect.height,
        top: rect.top,
        right: rect.right,
        bottom: rect.bottom,
        left: rect.left
      };
    }, selector);
  }

  /**
   * Check if two elements overlap
   * @param {string} selector1 - First element selector
   * @param {string} selector2 - Second element selector
   * @returns {Promise<boolean>} True if the elements overlap, false otherwise
   */
  async elementsOverlap(selector1, selector2) {
    await this.waitForElement(selector1);
    await this.waitForElement(selector2);
    
    return this.page.evaluate((sel1, sel2) => {
      const rect1 = document.querySelector(sel1).getBoundingClientRect();
      const rect2 = document.querySelector(sel2).getBoundingClientRect();
      
      return !(rect1.right < rect2.left || 
               rect1.left > rect2.right || 
               rect1.bottom < rect2.top || 
               rect1.top > rect2.bottom);
    }, selector1, selector2);
  }

  /**
   * Generate a test report
   * @returns {Promise<void>}
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
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>FinDoc Analyzer Test Report</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }
    h1, h2, h3 {
      color: #2c3e50;
    }
    .test-result {
      margin-bottom: 40px;
      padding: 20px;
      background-color: #f8f9fa;
      border-radius: 5px;
      border-left: 5px solid #ddd;
    }
    .test-result.passed {
      border-left-color: #28a745;
    }
    .test-result.failed {
      border-left-color: #dc3545;
    }
    .test-result.pending {
      border-left-color: #ffc107;
    }
    .screenshot {
      max-width: 100%;
      border: 1px solid #ddd;
      border-radius: 5px;
      margin-bottom: 20px;
    }
    .section {
      margin-bottom: 20px;
    }
    .badge {
      display: inline-block;
      padding: 5px 10px;
      border-radius: 3px;
      margin-right: 10px;
      margin-bottom: 10px;
    }
    .badge.passed {
      background-color: #d4edda;
      color: #155724;
    }
    .badge.failed {
      background-color: #f8d7da;
      color: #721c24;
    }
    .badge.pending {
      background-color: #fff3cd;
      color: #856404;
    }
    .badge.info {
      background-color: #d1ecf1;
      color: #0c5460;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
    }
    th, td {
      padding: 8px;
      text-align: left;
      border-bottom: 1px solid #ddd;
    }
    th {
      background-color: #f2f2f2;
    }
    .progress-container {
      width: 100%;
      background-color: #f3f3f3;
      border-radius: 4px;
      margin-bottom: 10px;
    }
    .progress-bar {
      height: 20px;
      border-radius: 4px;
      text-align: center;
      line-height: 20px;
      color: white;
    }
    .progress-bar.success {
      background-color: #4caf50;
    }
    .progress-bar.warning {
      background-color: #ff9800;
    }
    .progress-bar.danger {
      background-color: #f44336;
    }
    .summary-card {
      padding: 15px;
      border-radius: 5px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      margin-bottom: 20px;
      background-color: ${passRate > 80 ? '#d4edda' : passRate > 50 ? '#fff3cd' : '#f8d7da'};
      color: ${passRate > 80 ? '#155724' : passRate > 50 ? '#856404' : '#721c24'};
    }
    .error-details {
      background-color: #f8f9fa;
      border-radius: 5px;
      padding: 15px;
      margin-top: 10px;
      border: 1px solid #ddd;
      overflow-x: auto;
    }
    .error-message {
      font-family: monospace;
      white-space: pre-wrap;
    }
    .collapsible {
      background-color: #f1f1f1;
      color: #444;
      cursor: pointer;
      padding: 18px;
      width: 100%;
      border: none;
      text-align: left;
      outline: none;
      font-size: 15px;
      border-radius: 5px;
      margin-bottom: 5px;
    }
    .active, .collapsible:hover {
      background-color: #e8e8e8;
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
      padding: 0 18px;
      max-height: 0;
      overflow: hidden;
      transition: max-height 0.2s ease-out;
      background-color: white;
      border-radius: 0 0 5px 5px;
      margin-bottom: 10px;
    }
  </style>
</head>
<body>
  <h1>FinDoc Analyzer Test Report</h1>
  
  <div class="section">
    <h2>Summary</h2>
    <div class="summary-card">
      <h3>Test Results</h3>
      <div class="progress-container">
        <div class="progress-bar ${passRate > 80 ? 'success' : passRate > 50 ? 'warning' : 'danger'}" style="width: ${passRate}%">
          ${passRate}%
        </div>
      </div>
      <p>${passedTests} of ${totalTests} tests passed</p>
    </div>
    
    <h3>Tests</h3>
    <ul>
      ${this.results.map(result => `
        <li>
          <a href="#${result.name}">${result.name}</a>
          <span class="badge ${result.status}">${result.status}</span>
        </li>
      `).join('')}
    </ul>
  </div>
  
  ${this.results.map(result => `
    <div id="${result.name}" class="test-result ${result.status}">
      <h2>${result.name} <span class="badge ${result.status}">${result.status}</span></h2>
      <p>Duration: ${result.duration}ms</p>
      
      ${result.screenshots.length > 0 ? `
        <div class="section">
          <h3>Screenshots</h3>
          ${result.screenshots.map(screenshot => `
            <div>
              <h4>${path.basename(screenshot)}</h4>
              <img src="${path.basename(screenshot)}" alt="${path.basename(screenshot)}" class="screenshot">
            </div>
          `).join('')}
        </div>
      ` : ''}
      
      ${result.error ? `
        <div class="section">
          <h3>Error</h3>
          <div class="error-details">
            <p class="error-message">${result.error.message}</p>
            <button class="collapsible">Stack Trace</button>
            <div class="content">
              <pre>${result.error.stack}</pre>
            </div>
          </div>
        </div>
      ` : ''}
      
      ${result.errors && result.errors.length > 0 ? `
        <div class="section">
          <h3>JavaScript Errors</h3>
          <table>
            <thead>
              <tr>
                <th>Message</th>
              </tr>
            </thead>
            <tbody>
              ${result.errors.map(error => `
                <tr>
                  <td>${error.message}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      ` : ''}
      
      ${result.consoleMessages && result.consoleMessages.length > 0 ? `
        <div class="section">
          <h3>Console Messages</h3>
          <table>
            <thead>
              <tr>
                <th>Type</th>
                <th>Message</th>
              </tr>
            </thead>
            <tbody>
              ${result.consoleMessages.map(message => `
                <tr>
                  <td>${message.type}</td>
                  <td>${message.text}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
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
  TestRunner,
  config
};
