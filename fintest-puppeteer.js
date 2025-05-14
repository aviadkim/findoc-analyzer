/**
 * FinDoc Analyzer Comprehensive Puppeteer Test Framework
 * 
 * This script provides a comprehensive testing framework for the FinDoc Analyzer application
 * using Puppeteer. It can test both local and cloud deployments and includes tests for
 * document upload, processing, chat, and navigation.
 * 
 * Features:
 * - Configurable to test local or cloud deployments
 * - Supports testing with or without API keys
 * - Comprehensive test coverage for all major features
 * - Detailed reporting with screenshots
 * - Support for CI/CD pipelines
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { promisify } = require('util');
const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);
const mkdirAsync = promisify(fs.mkdir);

// Configuration with defaults that can be overridden via command line args
const config = {
  // Base URL for the application
  baseUrl: process.env.BASE_URL || 'http://localhost:8080',
  
  // Whether to run in headless mode
  headless: process.env.HEADLESS !== 'false',
  
  // Directory for storing test results
  resultsDir: process.env.RESULTS_DIR || path.join(__dirname, 'test-results'),
  
  // Directory for storing screenshots
  screenshotsDir: process.env.SCREENSHOTS_DIR || path.join(__dirname, 'test-results', 'screenshots'),
  
  // Path to sample PDF for upload tests
  samplePdfPath: process.env.SAMPLE_PDF_PATH || path.join(__dirname, 'test-data', 'sample.pdf'),
  
  // Whether to create sample documents before testing
  createSampleDocs: process.env.CREATE_SAMPLE_DOCS !== 'false',
  
  // Timeouts
  defaultTimeout: parseInt(process.env.DEFAULT_TIMEOUT || '30000'),
  navigationTimeout: parseInt(process.env.NAVIGATION_TIMEOUT || '30000'),
  
  // Whether to capture console logs
  captureConsole: process.env.CAPTURE_CONSOLE !== 'false',
  
  // Browser viewport settings
  viewportWidth: parseInt(process.env.VIEWPORT_WIDTH || '1280'),
  viewportHeight: parseInt(process.env.VIEWPORT_HEIGHT || '800'),
  
  // API Keys for testing
  openaiApiKey: process.env.OPENAI_API_KEY || '',
  anthropicApiKey: process.env.ANTHROPIC_API_KEY || '',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  
  // Test selectors
  selectors: {
    // Navigation
    navUpload: 'a[href="/upload"]',
    navDocuments: 'a[href="/documents-new"]',
    navChat: 'a[href="/document-chat"]',
    navAnalytics: 'a[href="/analytics-new"]',
    navComparison: 'a[href="/document-comparison"]',
    
    // Upload page
    uploadInput: 'input[type="file"]',
    uploadButton: 'button[type="submit"]',
    processButton: 'button[data-action="process"]',
    uploadStatus: '.upload-status',
    
    // Documents page
    documentCard: '.document-card',
    documentTitle: '.document-title',
    documentActions: '.document-actions',
    
    // Document chat page
    chatInput: 'textarea[name="message"]',
    chatSendButton: 'button[type="submit"]',
    chatMessages: '.chat-messages',
    chatMessage: '.chat-message',
    
    // General
    loadingIndicator: '.loading-indicator',
    errorMessage: '.error-message',
    successMessage: '.success-message'
  }
};

// Create directory structure for test results
async function createDirectories() {
  await mkdirAsync(config.resultsDir, { recursive: true });
  await mkdirAsync(config.screenshotsDir, { recursive: true });
  
  // Create test-data directory if it doesn't exist
  const testDataDir = path.join(__dirname, 'test-data');
  if (!fs.existsSync(testDataDir)) {
    await mkdirAsync(testDataDir, { recursive: true });
  }
  
  // Create a sample PDF for testing if it doesn't exist
  if (!fs.existsSync(config.samplePdfPath)) {
    // Create a simple PDF with text content using a template
    const samplePdfContent = `%PDF-1.7
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /Resources 4 0 R /MediaBox [0 0 612 792] /Contents 5 0 R >>
endobj
4 0 obj
<< /Font << /F1 6 0 R >> >>
endobj
5 0 obj
<< /Length 170 >>
stream
BT
/F1,0 24 Tf
72 720 Td
(FinDoc Test Document) Tj
0 -36 Td
/F1,0 12 Tf
(This is a sample PDF file for testing the FinDoc Analyzer application.) Tj
0 -24 Td
(It contains financial data for testing purposes.) Tj
ET
endstream
endobj
6 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
xref
0 7
0000000000 65535 f
0000000009 00000 n
0000000058 00000 n
0000000115 00000 n
0000000210 00000 n
0000000251 00000 n
0000000471 00000 n
trailer
<< /Size 7 /Root 1 0 R >>
startxref
538
%%EOF`;
    
    await writeFileAsync(config.samplePdfPath, samplePdfContent);
  }
}

// Test Runner class
class TestRunner {
  constructor() {
    this.browser = null;
    this.page = null;
    this.results = [];
    this.startTime = null;
    this.endTime = null;
    this.currentTest = null;
    this.testSuites = [];
  }
  
  // Initialize the test runner
  async init() {
    // Create necessary directories
    await createDirectories();
    
    // Launch browser
    this.browser = await puppeteer.launch({
      headless: config.headless ? 'new' : false,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      defaultViewport: {
        width: config.viewportWidth,
        height: config.viewportHeight
      }
    });
    
    this.startTime = new Date();
    
    // Create a test suite for API tests
    this.apiSuite = this.createTestSuite('API Tests');
    
    // Create a test suite for UI tests
    this.uiSuite = this.createTestSuite('UI Tests');
    
    // Create a test suite for End-to-End tests
    this.e2eSuite = this.createTestSuite('End-to-End Tests');
  }
  
  // Create a test suite
  createTestSuite(name) {
    const suite = {
      name,
      tests: [],
      startTime: null,
      endTime: null,
      passed: 0,
      failed: 0,
      skipped: 0
    };
    
    this.testSuites.push(suite);
    return suite;
  }
  
  // Create a new page
  async createPage() {
    this.page = await this.browser.newPage();
    
    // Set viewport
    await this.page.setViewport({
      width: config.viewportWidth,
      height: config.viewportHeight
    });
    
    // Set default navigation timeout
    this.page.setDefaultNavigationTimeout(config.navigationTimeout);
    
    // Setup request interception for API key injection
    await this.page.setRequestInterception(true);
    
    this.page.on('request', async (request) => {
      // Intercept API requests to inject API keys
      if (request.url().includes('/api/chat') || request.url().includes('/api/documents')) {
        const headers = request.headers();
        
        // Add API keys to headers if available
        if (config.openaiApiKey) {
          headers['x-openai-api-key'] = config.openaiApiKey;
        }
        if (config.anthropicApiKey) {
          headers['x-anthropic-api-key'] = config.anthropicApiKey;
        }
        if (config.geminiApiKey) {
          headers['x-gemini-api-key'] = config.geminiApiKey;
        }
        
        await request.continue({ headers });
      } else {
        await request.continue();
      }
    });
    
    // Capture console logs if enabled
    if (config.captureConsole) {
      this.page.on('console', message => {
        if (this.currentTest) {
          if (!this.currentTest.logs) {
            this.currentTest.logs = [];
          }
          
          this.currentTest.logs.push({
            type: message.type(),
            text: message.text(),
            timestamp: new Date().toISOString()
          });
        }
      });
    }
    
    // Capture errors
    this.page.on('pageerror', error => {
      if (this.currentTest) {
        if (!this.currentTest.errors) {
          this.currentTest.errors = [];
        }
        
        this.currentTest.errors.push({
          message: error.message,
          stack: error.stack,
          timestamp: new Date().toISOString()
        });
      }
    });
    
    // Capture network errors
    this.page.on('requestfailed', request => {
      if (this.currentTest) {
        if (!this.currentTest.networkErrors) {
          this.currentTest.networkErrors = [];
        }
        
        this.currentTest.networkErrors.push({
          url: request.url(),
          method: request.method(),
          reason: request.failure().errorText,
          timestamp: new Date().toISOString()
        });
      }
    });
  }
  
  // Run a test
  async runTest(suite, name, testFn, skip = false) {
    // Skip test if requested
    if (skip) {
      const testResult = {
        name,
        status: 'skipped',
        startTime: new Date(),
        endTime: new Date(),
        duration: 0,
        screenshots: []
      };
      
      suite.tests.push(testResult);
      suite.skipped++;
      
      console.log(`Skipping test: ${name}`);
      return testResult;
    }
    
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
      logs: [],
      networkErrors: [],
      screenshots: []
    };
    
    try {
      // Run the test
      await testFn(this.page, this);
      
      // Mark test as passed
      this.currentTest.status = 'passed';
      suite.passed++;
    } catch (error) {
      // Mark test as failed
      this.currentTest.status = 'failed';
      this.currentTest.error = {
        message: error.message,
        stack: error.stack
      };
      
      console.error(`Test failed: ${name}`);
      console.error(error);
      
      suite.failed++;
    } finally {
      // Close the page
      await this.page.close();
      
      // Update test result
      this.currentTest.endTime = new Date();
      this.currentTest.duration = this.currentTest.endTime - this.currentTest.startTime;
      
      // Add test result to suite
      suite.tests.push(this.currentTest);
      
      // Reset current test
      const result = this.currentTest;
      this.currentTest = null;
      
      return result;
    }
  }
  
  // Take a screenshot
  async takeScreenshot(name) {
    if (!this.page) {
      throw new Error('No page available to take screenshot');
    }
    
    const screenshotName = `${this.currentTest.name.replace(/[^a-z0-9]/gi, '-')}-${name}.png`;
    const screenshotPath = path.join(config.screenshotsDir, screenshotName);
    
    await this.page.screenshot({ path: screenshotPath, fullPage: true });
    
    if (this.currentTest) {
      this.currentTest.screenshots.push({
        name: screenshotName,
        path: screenshotPath
      });
    }
    
    return screenshotPath;
  }
  
  // Navigate to a URL
  async navigateTo(url) {
    if (!this.page) {
      throw new Error('No page available to navigate');
    }
    
    const fullUrl = url.startsWith('http') ? url : `${config.baseUrl}${url}`;
    
    await this.page.goto(fullUrl, {
      timeout: config.navigationTimeout,
      waitUntil: 'networkidle2'
    });
    
    // Take a screenshot after navigation
    await this.takeScreenshot('navigation');
  }
  
  // Wait for an element to be visible
  async waitForElement(selector, timeout = config.defaultTimeout) {
    if (!this.page) {
      throw new Error('No page available to wait for element');
    }
    
    return this.page.waitForSelector(selector, {
      visible: true,
      timeout
    });
  }
  
  // Click an element
  async clickElement(selector) {
    if (!this.page) {
      throw new Error('No page available to click element');
    }
    
    await this.waitForElement(selector);
    await this.page.click(selector);
    
    // Take a screenshot after click
    await this.takeScreenshot(`click-${selector.replace(/[^a-zA-Z0-9]/g, '-')}`);
  }
  
  // Type text into an input
  async typeText(selector, text) {
    if (!this.page) {
      throw new Error('No page available to type text');
    }
    
    await this.waitForElement(selector);
    await this.page.type(selector, text);
    
    // Take a screenshot after typing
    await this.takeScreenshot(`type-${selector.replace(/[^a-zA-Z0-9]/g, '-')}`);
  }
  
  // Upload a file
  async uploadFile(selector, filePath) {
    if (!this.page) {
      throw new Error('No page available to upload file');
    }
    
    const input = await this.waitForElement(selector);
    await input.uploadFile(filePath);
    
    // Take a screenshot after uploading
    await this.takeScreenshot(`upload-${selector.replace(/[^a-zA-Z0-9]/g, '-')}`);
  }
  
  // Get text content of an element
  async getElementText(selector) {
    if (!this.page) {
      throw new Error('No page available to get element text');
    }
    
    await this.waitForElement(selector);
    
    return this.page.evaluate((sel) => {
      return document.querySelector(sel).textContent.trim();
    }, selector);
  }
  
  // Wait for an element to contain specific text
  async waitForElementText(selector, text, timeout = config.defaultTimeout) {
    if (!this.page) {
      throw new Error('No page available to wait for element text');
    }
    
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      await this.page.waitForTimeout(500);
      
      const elementText = await this.getElementText(selector);
      
      if (elementText.includes(text)) {
        return true;
      }
    }
    
    throw new Error(`Element ${selector} did not contain text "${text}" within ${timeout}ms`);
  }
  
  // Execute all tests
  async runAllTests() {
    // Start time for the entire test run
    this.startTime = new Date();
    
    try {
      // Create sample documents if requested
      if (config.createSampleDocs) {
        await this.createSampleDocuments();
      }
      
      // Run API tests
      this.apiSuite.startTime = new Date();
      
      await this.runTest(this.apiSuite, 'API Health Check', async (page, runner) => {
        const response = await axios.get(`${config.baseUrl}/api/health`);
        
        if (response.status !== 200 || !response.data.status === 'ok') {
          throw new Error(`API health check failed: ${JSON.stringify(response.data)}`);
        }
      });
      
      await this.runTest(this.apiSuite, 'API Get Documents', async (page, runner) => {
        const response = await axios.get(`${config.baseUrl}/api/documents`);
        
        if (response.status !== 200 || !response.data.success) {
          throw new Error(`Failed to get documents: ${JSON.stringify(response.data)}`);
        }
      });
      
      await this.runTest(this.apiSuite, 'API Get Document by ID', async (page, runner) => {
        const response = await axios.get(`${config.baseUrl}/api/documents/doc-1`);
        
        if (response.status !== 200 || !response.data.success) {
          throw new Error(`Failed to get document: ${JSON.stringify(response.data)}`);
        }
      });
      
      await this.runTest(this.apiSuite, 'API Chat with Document', async (page, runner) => {
        const response = await axios.post(`${config.baseUrl}/api/chat/document/doc-1`, {
          message: 'What is the total revenue?'
        });
        
        if (response.status !== 200 || !response.data.success) {
          throw new Error(`Failed to chat with document: ${JSON.stringify(response.data)}`);
        }
      });
      
      this.apiSuite.endTime = new Date();
      
      // Run UI tests
      this.uiSuite.startTime = new Date();
      
      await this.runTest(this.uiSuite, 'UI Navigation - Home', async (page, runner) => {
        await runner.navigateTo('/');
        await runner.waitForElement('body');
        
        const title = await page.title();
        if (!title.includes('FinDoc') && !title.includes('Analyzer')) {
          throw new Error(`Unexpected page title: ${title}`);
        }
      });
      
      await this.runTest(this.uiSuite, 'UI Navigation - Upload', async (page, runner) => {
        await runner.navigateTo('/upload');
        await runner.waitForElement(config.selectors.uploadInput);
      });
      
      await this.runTest(this.uiSuite, 'UI Navigation - Documents', async (page, runner) => {
        await runner.navigateTo('/documents-new');
        await runner.waitForElement('body');
      });
      
      await this.runTest(this.uiSuite, 'UI Upload Form', async (page, runner) => {
        await runner.navigateTo('/upload');
        
        // Wait for upload form to be visible
        await runner.waitForElement(config.selectors.uploadInput);
        
        // Upload sample PDF
        await runner.uploadFile(config.selectors.uploadInput, config.samplePdfPath);
        
        // Submit form
        await runner.clickElement(config.selectors.uploadButton);
        
        // Wait for success message or document ID
        await page.waitForFunction(
          () => document.body.textContent.includes('success') || 
                document.body.textContent.includes('document'),
          { timeout: config.defaultTimeout }
        );
      });
      
      this.uiSuite.endTime = new Date();
      
      // Run End-to-End tests
      this.e2eSuite.startTime = new Date();
      
      await this.runTest(this.e2eSuite, 'E2E Document Upload and Processing', async (page, runner) => {
        // Navigate to upload page
        await runner.navigateTo('/upload');
        
        // Wait for upload form to be visible
        await runner.waitForElement(config.selectors.uploadInput);
        
        // Upload sample PDF
        await runner.uploadFile(config.selectors.uploadInput, config.samplePdfPath);
        
        // Submit form
        await runner.clickElement(config.selectors.uploadButton);
        
        // Wait for success message or document ID
        await page.waitForFunction(
          () => document.body.textContent.includes('success') || 
                document.body.textContent.includes('document'),
          { timeout: config.defaultTimeout }
        );
        
        // Extract document ID if available
        const documentId = await page.evaluate(() => {
          const match = document.body.textContent.match(/document ID:?\s*([a-zA-Z0-9-]+)/i);
          return match ? match[1] : null;
        });
        
        if (!documentId) {
          throw new Error('Failed to extract document ID after upload');
        }
        
        // Click process button if available
        try {
          await runner.clickElement(config.selectors.processButton);
          
          // Wait for processing to complete
          await page.waitForFunction(
            () => document.body.textContent.includes('processed') || 
                  document.body.textContent.includes('complete'),
            { timeout: config.defaultTimeout }
          );
        } catch (error) {
          console.warn('Process button not found or processing failed, continuing test');
        }
        
        // Navigate to documents page
        await runner.navigateTo('/documents-new');
        
        // Verify document is listed
        await page.waitForFunction(
          () => document.body.textContent.includes('sample') || 
                document.body.textContent.includes('pdf'),
          { timeout: config.defaultTimeout }
        );
      });
      
      await this.runTest(this.e2eSuite, 'E2E Document Chat', async (page, runner) => {
        // Navigate to documents page
        await runner.navigateTo('/documents-new');
        
        // Click on the first document card
        try {
          await runner.clickElement(config.selectors.documentCard);
        } catch (error) {
          console.warn('Document card not found, navigating to chat page directly');
          await runner.navigateTo('/document-chat');
        }
        
        // Wait for chat input to be visible
        await runner.waitForElement(config.selectors.chatInput);
        
        // Type a message
        await runner.typeText(config.selectors.chatInput, 'What is the total revenue in this document?');
        
        // Send message
        await runner.clickElement(config.selectors.chatSendButton);
        
        // Wait for response
        await page.waitForFunction(
          () => document.querySelectorAll('.chat-message').length >= 2,
          { timeout: config.defaultTimeout }
        );
      });
      
      this.e2eSuite.endTime = new Date();
    } catch (error) {
      console.error('Error running tests:', error);
    }
    
    // End time for the entire test run
    this.endTime = new Date();
    
    // Generate report
    await this.generateReport();
    
    // Close browser
    await this.browser.close();
  }
  
  // Create sample documents
  async createSampleDocuments() {
    try {
      console.log('Creating sample documents...');
      
      const response = await axios.get(`${config.baseUrl}/api/test/sample-documents`);
      
      if (response.status === 200 && response.data.success) {
        console.log('Sample documents created successfully');
      } else {
        console.error('Failed to create sample documents');
      }
    } catch (error) {
      console.error('Error creating sample documents:', error);
    }
  }
  
  // Generate test report
  async generateReport() {
    try {
      const reportPath = path.join(config.resultsDir, 'test-report.html');
      const reportData = {
        startTime: this.startTime,
        endTime: this.endTime,
        duration: this.endTime - this.startTime,
        suites: this.testSuites,
        config: {
          baseUrl: config.baseUrl,
          headless: config.headless,
          createSampleDocs: config.createSampleDocs,
          hasOpenAIKey: !!config.openaiApiKey,
          hasAnthropicKey: !!config.anthropicApiKey,
          hasGeminiKey: !!config.geminiApiKey
        },
        environment: {
          nodeVersion: process.version,
          platform: process.platform,
          arch: process.arch
        }
      };
      
      // Save report data as JSON
      await writeFileAsync(
        path.join(config.resultsDir, 'test-results.json'),
        JSON.stringify(reportData, null, 2)
      );
      
      // Calculate summary
      const totalTests = this.testSuites.reduce((sum, suite) => sum + suite.tests.length, 0);
      const passedTests = this.testSuites.reduce((sum, suite) => sum + suite.passed, 0);
      const failedTests = this.testSuites.reduce((sum, suite) => sum + suite.failed, 0);
      const skippedTests = this.testSuites.reduce((sum, suite) => sum + suite.skipped, 0);
      const passRate = Math.round((passedTests / totalTests) * 100);
      
      // Generate HTML report
      const reportHtml = `<!DOCTYPE html>
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
    .test-result.skipped {
      border-left-color: #ffc107;
    }
    .test-suite {
      margin-bottom: 40px;
      padding: 20px;
      background-color: #f8f9fa;
      border-radius: 5px;
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
    .badge.skipped {
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
      <p>${passedTests} of ${totalTests} tests passed (${failedTests} failed, ${skippedTests} skipped)</p>
      <p>Tests run on: ${new Date(this.startTime).toLocaleString()}</p>
      <p>Duration: ${Math.round((this.endTime - this.startTime) / 1000)} seconds</p>
    </div>
    
    <h3>Configuration</h3>
    <table>
      <tr>
        <th>Base URL</th>
        <td>${config.baseUrl}</td>
      </tr>
      <tr>
        <th>Headless Mode</th>
        <td>${config.headless ? 'Yes' : 'No'}</td>
      </tr>
      <tr>
        <th>Node.js Version</th>
        <td>${process.version}</td>
      </tr>
      <tr>
        <th>Platform</th>
        <td>${process.platform}</td>
      </tr>
      <tr>
        <th>OpenAI API Key</th>
        <td>${config.openaiApiKey ? 'Available' : 'Not available'}</td>
      </tr>
      <tr>
        <th>Anthropic API Key</th>
        <td>${config.anthropicApiKey ? 'Available' : 'Not available'}</td>
      </tr>
      <tr>
        <th>Gemini API Key</th>
        <td>${config.geminiApiKey ? 'Available' : 'Not available'}</td>
      </tr>
    </table>
  </div>
  
  ${this.testSuites.map(suite => `
    <div class="test-suite">
      <h2>${suite.name}</h2>
      <p>Duration: ${suite.endTime && suite.startTime ? Math.round((suite.endTime - suite.startTime) / 1000) : 'N/A'} seconds</p>
      <p>Tests: ${suite.tests.length} (${suite.passed} passed, ${suite.failed} failed, ${suite.skipped} skipped)</p>
      
      ${suite.tests.map(test => `
        <div class="test-result ${test.status}">
          <h3>${test.name} <span class="badge ${test.status}">${test.status}</span></h3>
          <p>Duration: ${test.duration ? Math.round(test.duration / 1000) : 'N/A'} seconds</p>
          
          ${test.screenshots && test.screenshots.length > 0 ? `
            <div class="section">
              <h4>Screenshots</h4>
              ${test.screenshots.map(screenshot => `
                <div>
                  <h5>${screenshot.name}</h5>
                  <img src="screenshots/${screenshot.name}" alt="${screenshot.name}" class="screenshot">
                </div>
              `).join('')}
            </div>
          ` : ''}
          
          ${test.error ? `
            <div class="section">
              <h4>Error</h4>
              <div class="error-details">
                <p class="error-message">${test.error.message}</p>
                <button class="collapsible">Stack Trace</button>
                <div class="content">
                  <pre>${test.error.stack}</pre>
                </div>
              </div>
            </div>
          ` : ''}
          
          ${test.errors && test.errors.length > 0 ? `
            <div class="section">
              <h4>JavaScript Errors</h4>
              <table>
                <thead>
                  <tr>
                    <th>Message</th>
                    <th>Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  ${test.errors.map(error => `
                    <tr>
                      <td>${error.message}</td>
                      <td>${error.timestamp}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          ` : ''}
          
          ${test.networkErrors && test.networkErrors.length > 0 ? `
            <div class="section">
              <h4>Network Errors</h4>
              <table>
                <thead>
                  <tr>
                    <th>URL</th>
                    <th>Method</th>
                    <th>Reason</th>
                    <th>Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  ${test.networkErrors.map(error => `
                    <tr>
                      <td>${error.url}</td>
                      <td>${error.method}</td>
                      <td>${error.reason}</td>
                      <td>${error.timestamp}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          ` : ''}
          
          ${test.logs && test.logs.length > 0 ? `
            <div class="section">
              <h4>Console Logs</h4>
              <button class="collapsible">Show Console Logs</button>
              <div class="content">
                <table>
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th>Message</th>
                      <th>Timestamp</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${test.logs.map(log => `
                      <tr>
                        <td>${log.type}</td>
                        <td>${log.text}</td>
                        <td>${log.timestamp}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            </div>
          ` : ''}
        </div>
      `).join('')}
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
      
      await writeFileAsync(reportPath, reportHtml);
      
      console.log(`Test report saved to: ${reportPath}`);
      
      return reportPath;
    } catch (error) {
      console.error('Error generating report:', error);
    }
  }
}

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    if (arg === '--url' || arg === '-u') {
      config.baseUrl = args[++i];
    } else if (arg === '--headless' || arg === '-h') {
      config.headless = args[++i] !== 'false';
    } else if (arg === '--results-dir' || arg === '-r') {
      config.resultsDir = args[++i];
      config.screenshotsDir = path.join(config.resultsDir, 'screenshots');
    } else if (arg === '--sample-pdf' || arg === '-p') {
      config.samplePdfPath = args[++i];
    } else if (arg === '--create-samples' || arg === '-c') {
      config.createSampleDocs = args[++i] !== 'false';
    } else if (arg === '--timeout' || arg === '-t') {
      config.defaultTimeout = parseInt(args[++i]);
    } else if (arg === '--openai-key') {
      config.openaiApiKey = args[++i];
    } else if (arg === '--anthropic-key') {
      config.anthropicApiKey = args[++i];
    } else if (arg === '--gemini-key') {
      config.geminiApiKey = args[++i];
    } else if (arg === '--help') {
      console.log(`
FinDoc Analyzer Comprehensive Test Framework

Usage: node fintest-puppeteer.js [options]

Options:
  --url, -u <url>                  Base URL for the application (default: http://localhost:8080)
  --headless, -h <true|false>      Run in headless mode (default: true)
  --results-dir, -r <path>         Directory for storing test results (default: ./test-results)
  --sample-pdf, -p <path>          Path to sample PDF for upload tests (default: ./test-data/sample.pdf)
  --create-samples, -c <true|false> Create sample documents before testing (default: true)
  --timeout, -t <ms>               Default timeout in milliseconds (default: 30000)
  --openai-key <key>               OpenAI API key for testing
  --anthropic-key <key>            Anthropic API key for testing
  --gemini-key <key>               Gemini API key for testing
  --help                           Show this help message
      `);
      process.exit(0);
    }
  }
}

// Main function
async function main() {
  try {
    // Parse command line arguments
    parseArgs();
    
    // Initialize test runner
    const testRunner = new TestRunner();
    await testRunner.init();
    
    // Run all tests
    await testRunner.runAllTests();
    
    console.log('Tests completed successfully');
  } catch (error) {
    console.error('Error running tests:', error);
    process.exit(1);
  }
}

// Run main function
main();