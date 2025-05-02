/**
 * UI Testing Suite for FinDoc Analyzer
 * 
 * This test suite covers all UI components and navigation in the FinDoc Analyzer application.
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Configuration
const config = {
  baseUrl: 'http://localhost:8080',
  screenshotDir: path.join(__dirname, '../test-results/screenshots'),
  reportDir: path.join(__dirname, '../test-results'),
  headless: false,
  slowMo: 50,
  timeout: 30000
};

// Create directories if they don't exist
fs.mkdirSync(config.screenshotDir, { recursive: true });
fs.mkdirSync(config.reportDir, { recursive: true });

// Test results
const testResults = {
  passed: 0,
  failed: 0,
  skipped: 0,
  total: 0,
  startTime: null,
  endTime: null,
  tests: []
};

/**
 * Test Runner
 */
class TestRunner {
  constructor() {
    this.browser = null;
    this.page = null;
    this.currentTest = null;
  }
  
  /**
   * Initialize the test runner
   */
  async init() {
    this.browser = await puppeteer.launch({
      headless: config.headless,
      slowMo: config.slowMo,
      args: ['--window-size=1280,800']
    });
    
    this.page = await this.browser.newPage();
    await this.page.setViewport({ width: 1280, height: 800 });
    await this.page.setDefaultTimeout(config.timeout);
    
    // Add console log listener
    this.page.on('console', message => {
      console.log(`Browser console [${message.type()}]: ${message.text()}`);
    });
  }
  
  /**
   * Close the browser
   */
  async close() {
    if (this.browser) {
      await this.browser.close();
    }
  }
  
  /**
   * Run a test
   * @param {string} name - Test name
   * @param {Function} testFn - Test function
   */
  async runTest(name, testFn) {
    testResults.total++;
    
    this.currentTest = {
      name,
      status: 'running',
      startTime: new Date(),
      endTime: null,
      error: null,
      screenshots: []
    };
    
    console.log(`\n🧪 Running test: ${name}`);
    
    try {
      await testFn(this);
      
      this.currentTest.status = 'passed';
      this.currentTest.endTime = new Date();
      testResults.passed++;
      
      console.log(`✅ Test passed: ${name}`);
    } catch (error) {
      this.currentTest.status = 'failed';
      this.currentTest.endTime = new Date();
      this.currentTest.error = error.message;
      testResults.failed++;
      
      console.error(`❌ Test failed: ${name}`);
      console.error(`   Error: ${error.message}`);
      
      // Take a screenshot of the failure
      await this.takeScreenshot(`${name.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-failure`);
    }
    
    testResults.tests.push(this.currentTest);
  }
  
  /**
   * Skip a test
   * @param {string} name - Test name
   * @param {string} reason - Reason for skipping
   */
  skipTest(name, reason) {
    testResults.total++;
    testResults.skipped++;
    
    const test = {
      name,
      status: 'skipped',
      startTime: new Date(),
      endTime: new Date(),
      error: null,
      reason
    };
    
    testResults.tests.push(test);
    
    console.log(`⏭️ Skipped test: ${name}`);
    console.log(`   Reason: ${reason}`);
  }
  
  /**
   * Navigate to a URL
   * @param {string} path - URL path
   */
  async navigateTo(path) {
    const url = path.startsWith('http') ? path : `${config.baseUrl}${path}`;
    await this.page.goto(url, { waitUntil: 'networkidle0' });
  }
  
  /**
   * Take a screenshot
   * @param {string} name - Screenshot name
   */
  async takeScreenshot(name) {
    const filename = `${name}-${Date.now()}.png`;
    const filepath = path.join(config.screenshotDir, filename);
    
    await this.page.screenshot({ path: filepath, fullPage: true });
    
    if (this.currentTest) {
      this.currentTest.screenshots.push(filename);
    }
    
    return filepath;
  }
  
  /**
   * Check if an element exists
   * @param {string} selector - Element selector
   * @returns {Promise<boolean>} - Whether the element exists
   */
  async elementExists(selector) {
    try {
      await this.page.waitForSelector(selector, { timeout: 5000 });
      return true;
    } catch (error) {
      return false;
    }
  }
  
  /**
   * Click an element
   * @param {string} selector - Element selector
   */
  async clickElement(selector) {
    await this.page.waitForSelector(selector);
    await this.page.click(selector);
  }
  
  /**
   * Type text into an input field
   * @param {string} selector - Input selector
   * @param {string} text - Text to type
   */
  async typeText(selector, text) {
    await this.page.waitForSelector(selector);
    await this.page.type(selector, text);
  }
  
  /**
   * Get text content of an element
   * @param {string} selector - Element selector
   * @returns {Promise<string>} - Element text content
   */
  async getElementText(selector) {
    await this.page.waitForSelector(selector);
    return this.page.$eval(selector, el => el.textContent.trim());
  }
  
  /**
   * Wait for navigation to complete
   */
  async waitForNavigation() {
    await this.page.waitForNavigation({ waitUntil: 'networkidle0' });
  }
  
  /**
   * Upload a file
   * @param {string} selector - File input selector
   * @param {string} filePath - Path to the file to upload
   */
  async uploadFile(selector, filePath) {
    const input = await this.page.$(selector);
    await input.uploadFile(filePath);
  }
}

/**
 * Generate an HTML report
 */
function generateReport() {
  const duration = testResults.endTime - testResults.startTime;
  const durationStr = `${Math.floor(duration / 1000)} seconds`;
  
  const reportPath = path.join(config.reportDir, 'ui-test-report.html');
  
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>FinDoc Analyzer UI Test Report</title>
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
    
    .summary {
      display: flex;
      justify-content: space-between;
      background-color: #f8f9fa;
      padding: 20px;
      border-radius: 5px;
      margin-bottom: 20px;
    }
    
    .summary-item {
      text-align: center;
    }
    
    .summary-item h2 {
      margin: 0;
      font-size: 2rem;
    }
    
    .summary-label {
      font-size: 0.9rem;
      color: #666;
    }
    
    .test-results {
      margin-top: 30px;
    }
    
    .test {
      margin-bottom: 20px;
      padding: 15px;
      border-radius: 5px;
    }
    
    .test-passed {
      background-color: #d4edda;
      border-left: 5px solid #28a745;
    }
    
    .test-failed {
      background-color: #f8d7da;
      border-left: 5px solid #dc3545;
    }
    
    .test-skipped {
      background-color: #fff3cd;
      border-left: 5px solid #ffc107;
    }
    
    .test-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
    }
    
    .test-name {
      font-weight: bold;
      font-size: 1.1rem;
      margin: 0;
    }
    
    .test-status {
      font-size: 0.9rem;
      padding: 3px 8px;
      border-radius: 3px;
      color: white;
    }
    
    .status-passed {
      background-color: #28a745;
    }
    
    .status-failed {
      background-color: #dc3545;
    }
    
    .status-skipped {
      background-color: #ffc107;
      color: #333;
    }
    
    .test-details {
      font-size: 0.9rem;
      color: #666;
    }
    
    .test-error {
      background-color: #f8d7da;
      color: #721c24;
      padding: 10px;
      border-radius: 3px;
      margin-top: 10px;
      font-family: monospace;
      white-space: pre-wrap;
    }
    
    .test-screenshots {
      margin-top: 10px;
    }
    
    .screenshot {
      display: block;
      max-width: 100%;
      margin-top: 10px;
      border: 1px solid #ddd;
    }
  </style>
</head>
<body>
  <h1>FinDoc Analyzer UI Test Report</h1>
  
  <div class="summary">
    <div class="summary-item">
      <h2>${testResults.total}</h2>
      <div class="summary-label">Total Tests</div>
    </div>
    <div class="summary-item">
      <h2>${testResults.passed}</h2>
      <div class="summary-label">Passed</div>
    </div>
    <div class="summary-item">
      <h2>${testResults.failed}</h2>
      <div class="summary-label">Failed</div>
    </div>
    <div class="summary-item">
      <h2>${testResults.skipped}</h2>
      <div class="summary-label">Skipped</div>
    </div>
    <div class="summary-item">
      <h2>${durationStr}</h2>
      <div class="summary-label">Duration</div>
    </div>
  </div>
  
  <div class="test-results">
    <h2>Test Results</h2>
    
    ${testResults.tests.map(test => {
      const statusClass = test.status === 'passed' ? 'test-passed' : 
                          test.status === 'failed' ? 'test-failed' : 'test-skipped';
      
      const statusBadgeClass = test.status === 'passed' ? 'status-passed' : 
                              test.status === 'failed' ? 'status-failed' : 'status-skipped';
      
      const duration = test.endTime - test.startTime;
      const durationStr = `${Math.floor(duration / 1000)}.${duration % 1000} seconds`;
      
      return `
        <div class="test ${statusClass}">
          <div class="test-header">
            <h3 class="test-name">${test.name}</h3>
            <span class="test-status ${statusBadgeClass}">${test.status.toUpperCase()}</span>
          </div>
          
          <div class="test-details">
            <div>Duration: ${durationStr}</div>
            <div>Started: ${test.startTime.toLocaleString()}</div>
            <div>Ended: ${test.endTime.toLocaleString()}</div>
          </div>
          
          ${test.error ? `<div class="test-error">${test.error}</div>` : ''}
          ${test.reason ? `<div class="test-details">Reason: ${test.reason}</div>` : ''}
          
          ${test.screenshots && test.screenshots.length > 0 ? `
            <div class="test-screenshots">
              <h4>Screenshots:</h4>
              ${test.screenshots.map(screenshot => `
                <img class="screenshot" src="screenshots/${screenshot}" alt="Screenshot">
              `).join('')}
            </div>
          ` : ''}
        </div>
      `;
    }).join('')}
  </div>
</body>
</html>
  `;
  
  fs.writeFileSync(reportPath, html);
  
  console.log(`\n📊 Test report generated: ${reportPath}`);
  
  return reportPath;
}

/**
 * Run all tests
 */
async function runTests() {
  const runner = new TestRunner();
  
  testResults.startTime = new Date();
  
  try {
    await runner.init();
    
    // Test 1: Homepage loads correctly
    await runner.runTest('Homepage loads correctly', async (runner) => {
      await runner.navigateTo('/');
      
      // Check if the page title is correct
      const title = await runner.page.title();
      if (!title.includes('FinDoc Analyzer')) {
        throw new Error(`Unexpected page title: ${title}`);
      }
      
      // Check if the sidebar is visible
      const sidebarExists = await runner.elementExists('.sidebar');
      if (!sidebarExists) {
        throw new Error('Sidebar not found');
      }
      
      // Check if the main content is visible
      const mainContentExists = await runner.elementExists('.main-content');
      if (!mainContentExists) {
        throw new Error('Main content not found');
      }
      
      // Take a screenshot
      await runner.takeScreenshot('homepage');
    });
    
    // Test 2: Sidebar navigation works
    await runner.runTest('Sidebar navigation works', async (runner) => {
      await runner.navigateTo('/');
      
      // Check if all sidebar links exist
      const sidebarLinks = [
        { selector: 'a[href="/"]', text: 'Dashboard' },
        { selector: 'a[href="/documents-new"]', text: 'My Documents' },
        { selector: 'a[href="/analytics-new"]', text: 'Analytics' },
        { selector: 'a[href="/upload"]', text: 'Upload' },
        { selector: 'a[href="/document-comparison"]', text: 'Document Comparison' },
        { selector: 'a[href="/feedback"]', text: 'Feedback' }
      ];
      
      for (const link of sidebarLinks) {
        const linkExists = await runner.elementExists(link.selector);
        if (!linkExists) {
          throw new Error(`Sidebar link not found: ${link.text}`);
        }
        
        // Check if the link text is correct
        const linkText = await runner.getElementText(link.selector);
        if (!linkText.includes(link.text)) {
          throw new Error(`Unexpected link text: ${linkText}, expected: ${link.text}`);
        }
      }
      
      // Test navigation to each page
      for (const link of sidebarLinks) {
        await runner.clickElement(link.selector);
        await runner.page.waitForNavigation({ waitUntil: 'networkidle0' });
        
        // Take a screenshot
        await runner.takeScreenshot(`navigation-${link.text.toLowerCase()}`);
        
        // Check if the URL is correct
        const url = runner.page.url();
        const expectedPath = link.selector.match(/href="([^"]+)"/)[1];
        const expectedUrl = `${config.baseUrl}${expectedPath}`;
        
        if (url !== expectedUrl) {
          throw new Error(`Unexpected URL: ${url}, expected: ${expectedUrl}`);
        }
      }
    });
    
    // Test 3: Documents page loads correctly
    await runner.runTest('Documents page loads correctly', async (runner) => {
      await runner.navigateTo('/documents-new');
      
      // Check if the page title is correct
      const title = await runner.page.title();
      if (!title.includes('FinDoc Analyzer')) {
        throw new Error(`Unexpected page title: ${title}`);
      }
      
      // Check if the document grid exists
      const documentGridExists = await runner.elementExists('.document-grid');
      if (!documentGridExists) {
        throw new Error('Document grid not found');
      }
      
      // Check if document cards exist
      const documentCardsExist = await runner.elementExists('.document-card');
      if (!documentCardsExist) {
        throw new Error('Document cards not found');
      }
      
      // Take a screenshot
      await runner.takeScreenshot('documents-page');
    });
    
    // Test 4: Upload page loads correctly
    await runner.runTest('Upload page loads correctly', async (runner) => {
      await runner.navigateTo('/upload');
      
      // Check if the page title is correct
      const title = await runner.page.title();
      if (!title.includes('FinDoc Analyzer')) {
        throw new Error(`Unexpected page title: ${title}`);
      }
      
      // Check if the upload area exists
      const uploadAreaExists = await runner.elementExists('.upload-area');
      if (!uploadAreaExists) {
        throw new Error('Upload area not found');
      }
      
      // Check if the file input exists
      const fileInputExists = await runner.elementExists('#file-input');
      if (!fileInputExists) {
        throw new Error('File input not found');
      }
      
      // Take a screenshot
      await runner.takeScreenshot('upload-page');
    });
    
    // Test 5: Analytics page loads correctly
    await runner.runTest('Analytics page loads correctly', async (runner) => {
      await runner.navigateTo('/analytics-new');
      
      // Check if the page title is correct
      const title = await runner.page.title();
      if (!title.includes('FinDoc Analyzer')) {
        throw new Error(`Unexpected page title: ${title}`);
      }
      
      // Take a screenshot
      await runner.takeScreenshot('analytics-page');
    });
    
    // Test 6: Document comparison page loads correctly
    await runner.runTest('Document comparison page loads correctly', async (runner) => {
      await runner.navigateTo('/document-comparison');
      
      // Check if the page title is correct
      const title = await runner.page.title();
      if (!title.includes('FinDoc Analyzer')) {
        throw new Error(`Unexpected page title: ${title}`);
      }
      
      // Take a screenshot
      await runner.takeScreenshot('document-comparison-page');
    });
    
    // Test 7: Feedback page loads correctly
    await runner.runTest('Feedback page loads correctly', async (runner) => {
      await runner.navigateTo('/feedback');
      
      // Check if the page title is correct
      const title = await runner.page.title();
      if (!title.includes('FinDoc Analyzer')) {
        throw new Error(`Unexpected page title: ${title}`);
      }
      
      // Take a screenshot
      await runner.takeScreenshot('feedback-page');
    });
    
    // Test 8: Document details page loads correctly
    await runner.runTest('Document details page loads correctly', async (runner) => {
      // First, navigate to the documents page
      await runner.navigateTo('/documents-new');
      
      // Click on the first document card
      const documentCardExists = await runner.elementExists('.document-card');
      
      if (documentCardExists) {
        await runner.clickElement('.document-card');
        await runner.page.waitForNavigation({ waitUntil: 'networkidle0' });
        
        // Check if the document details page loaded
        const documentTitleExists = await runner.elementExists('#document-title');
        if (!documentTitleExists) {
          throw new Error('Document title not found on details page');
        }
        
        // Check if the extracted text section exists
        const extractedTextExists = await runner.elementExists('#extracted-text');
        if (!extractedTextExists) {
          throw new Error('Extracted text section not found');
        }
        
        // Check if the extracted tables section exists
        const extractedTablesExists = await runner.elementExists('#extracted-tables');
        if (!extractedTablesExists) {
          throw new Error('Extracted tables section not found');
        }
        
        // Check if the metadata section exists
        const metadataExists = await runner.elementExists('#metadata');
        if (!metadataExists) {
          throw new Error('Metadata section not found');
        }
        
        // Check if the Q&A section exists
        const qaExists = await runner.elementExists('#chat-messages');
        if (!qaExists) {
          throw new Error('Q&A section not found');
        }
        
        // Take a screenshot
        await runner.takeScreenshot('document-details-page');
      } else {
        runner.skipTest('Document details page loads correctly', 'No document cards found to click');
      }
    });
    
    // Test 9: Q&A functionality works
    await runner.runTest('Q&A functionality works', async (runner) => {
      // First, navigate to the documents page
      await runner.navigateTo('/documents-new');
      
      // Click on the first document card
      const documentCardExists = await runner.elementExists('.document-card');
      
      if (documentCardExists) {
        await runner.clickElement('.document-card');
        await runner.page.waitForNavigation({ waitUntil: 'networkidle0' });
        
        // Check if the Q&A section exists
        const questionInputExists = await runner.elementExists('#question-input');
        if (!questionInputExists) {
          throw new Error('Question input not found');
        }
        
        // Type a question
        await runner.typeText('#question-input', 'What is the total revenue?');
        
        // Click the ask button
        await runner.clickElement('#ask-btn');
        
        // Wait for the response
        await runner.page.waitForTimeout(2000);
        
        // Check if a response was added to the chat
        const aiMessageExists = await runner.elementExists('.ai-message');
        if (!aiMessageExists) {
          throw new Error('AI response not found');
        }
        
        // Take a screenshot
        await runner.takeScreenshot('qa-functionality');
      } else {
        runner.skipTest('Q&A functionality works', 'No document cards found to click');
      }
    });
    
    // Test 10: Responsive design
    await runner.runTest('Responsive design works', async (runner) => {
      // Test on mobile viewport
      await runner.page.setViewport({ width: 375, height: 667 });
      await runner.navigateTo('/');
      
      // Take a screenshot
      await runner.takeScreenshot('responsive-mobile');
      
      // Test on tablet viewport
      await runner.page.setViewport({ width: 768, height: 1024 });
      await runner.navigateTo('/');
      
      // Take a screenshot
      await runner.takeScreenshot('responsive-tablet');
      
      // Test on desktop viewport
      await runner.page.setViewport({ width: 1280, height: 800 });
      await runner.navigateTo('/');
      
      // Take a screenshot
      await runner.takeScreenshot('responsive-desktop');
    });
  } catch (error) {
    console.error('Error running tests:', error);
  } finally {
    testResults.endTime = new Date();
    
    // Generate report
    const reportPath = generateReport();
    
    // Close the browser
    await runner.close();
    
    // Print summary
    console.log('\n📋 Test Summary:');
    console.log(`   Total: ${testResults.total}`);
    console.log(`   Passed: ${testResults.passed}`);
    console.log(`   Failed: ${testResults.failed}`);
    console.log(`   Skipped: ${testResults.skipped}`);
    console.log(`   Duration: ${Math.floor((testResults.endTime - testResults.startTime) / 1000)} seconds`);
    
    // Open the report
    console.log(`\n🔍 View the full report at: ${reportPath}`);
  }
}

// Run the tests
runTests();
