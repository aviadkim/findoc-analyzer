/**
 * Test Suite for FinDoc Analyzer
 * 
 * This module provides comprehensive testing for the FinDoc Analyzer application,
 * including unit tests, integration tests, and end-to-end tests.
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const assert = require('assert');
const axios = require('axios');

// Test configuration
const TEST_CONFIG = {
  baseUrl: process.env.TEST_BASE_URL || 'http://localhost:8080',
  apiUrl: process.env.TEST_API_URL || 'http://localhost:8080/api',
  headless: process.env.TEST_HEADLESS !== 'false',
  slowMo: parseInt(process.env.TEST_SLOW_MO || '0', 10),
  timeout: parseInt(process.env.TEST_TIMEOUT || '30000', 10),
  screenshotDir: process.env.TEST_SCREENSHOT_DIR || path.join(__dirname, 'test-screenshots'),
  testDataDir: process.env.TEST_DATA_DIR || path.join(__dirname, 'test-data')
};

// Ensure screenshot directory exists
if (!fs.existsSync(TEST_CONFIG.screenshotDir)) {
  fs.mkdirSync(TEST_CONFIG.screenshotDir, { recursive: true });
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
 * @param {Object} options - Test options
 */
async function runTest(name, testFn, options = {}) {
  const { skip = false, timeout = TEST_CONFIG.timeout } = options;
  
  console.log(`\n[TEST] ${name}`);
  testResults.total++;
  
  if (skip) {
    console.log(`[SKIP] ${name}`);
    testResults.skipped++;
    testResults.tests.push({
      name,
      status: 'skipped',
      duration: 0
    });
    return;
  }
  
  const startTime = Date.now();
  
  try {
    // Run test with timeout
    await Promise.race([
      testFn(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error(`Test timed out after ${timeout}ms`)), timeout)
      )
    ]);
    
    const duration = Date.now() - startTime;
    console.log(`[PASS] ${name} (${duration}ms)`);
    testResults.passed++;
    testResults.tests.push({
      name,
      status: 'passed',
      duration
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`[FAIL] ${name} (${duration}ms)`);
    console.error(error);
    testResults.failed++;
    testResults.tests.push({
      name,
      status: 'failed',
      duration,
      error: error.message,
      stack: error.stack
    });
  }
}

/**
 * Run all tests
 * @param {Object} options - Test options
 */
async function runAllTests(options = {}) {
  const startTime = Date.now();
  console.log(`\n=== Starting FinDoc Analyzer Test Suite ===\n`);
  
  // Run unit tests
  await runUnitTests(options);
  
  // Run integration tests
  await runIntegrationTests(options);
  
  // Run end-to-end tests
  await runE2ETests(options);
  
  // Print test results
  const duration = Date.now() - startTime;
  console.log(`\n=== Test Results ===`);
  console.log(`Total: ${testResults.total}`);
  console.log(`Passed: ${testResults.passed}`);
  console.log(`Failed: ${testResults.failed}`);
  console.log(`Skipped: ${testResults.skipped}`);
  console.log(`Duration: ${duration}ms`);
  
  // Return test results
  return {
    ...testResults,
    duration
  };
}

/**
 * Run unit tests
 * @param {Object} options - Test options
 */
async function runUnitTests(options = {}) {
  console.log(`\n=== Running Unit Tests ===\n`);
  
  // Document processor tests
  await runTest('Document processor - PDF processing', async () => {
    const { processDocument } = require('./document-processor');
    const testPdfPath = path.join(TEST_CONFIG.testDataDir, 'test-document.pdf');
    
    // Create test PDF if it doesn't exist
    if (!fs.existsSync(testPdfPath)) {
      console.log('Creating test PDF...');
      const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');
      
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      
      page.drawText('Test Document', {
        x: 50,
        y: 750,
        size: 30,
        font,
        color: rgb(0, 0, 0)
      });
      
      page.drawText('This is a test document for FinDoc Analyzer.', {
        x: 50,
        y: 700,
        size: 12,
        font,
        color: rgb(0, 0, 0)
      });
      
      page.drawText('ISIN: US0378331005', {
        x: 50,
        y: 650,
        size: 12,
        font,
        color: rgb(0, 0, 0)
      });
      
      const pdfBytes = await pdfDoc.save();
      fs.writeFileSync(testPdfPath, pdfBytes);
    }
    
    const result = await processDocument(testPdfPath, 'test');
    
    assert.ok(result, 'Result should not be null');
    assert.strictEqual(result.fileName, path.basename(testPdfPath), 'File name should match');
    assert.strictEqual(result.fileExtension, '.pdf', 'File extension should be .pdf');
    assert.strictEqual(result.documentType, 'test', 'Document type should be test');
    assert.strictEqual(result.status, 'completed', 'Status should be completed');
    assert.ok(result.content.text, 'Text content should not be empty');
    assert.ok(result.content.pages.length > 0, 'Pages should not be empty');
  });
  
  // Gemini agent tests
  await runTest('Gemini agent - Generate response', async () => {
    const GeminiAgent = require('./gemini-agent');
    
    // Mock Gemini API
    const originalGenerativeAI = require('@google/generative-ai');
    require('@google/generative-ai').GoogleGenerativeAI = class MockGoogleGenerativeAI {
      constructor() {}
      
      getGenerativeModel() {
        return {
          generateContent: async () => ({
            response: {
              text: () => 'This is a mock response from Gemini API'
            }
          })
        };
      }
    };
    
    const agent = new GeminiAgent('mock-api-key');
    const response = await agent.generateResponse('Test prompt');
    
    assert.ok(response, 'Response should not be null');
    assert.strictEqual(response.text, 'This is a mock response from Gemini API', 'Response text should match');
    
    // Restore original module
    require('@google/generative-ai').GoogleGenerativeAI = originalGenerativeAI.GoogleGenerativeAI;
  });
  
  // Bloomberg agent tests
  await runTest('Bloomberg agent - Get quote', async () => {
    const BloombergAgent = require('./bloomberg-agent');
    
    const agent = new BloombergAgent();
    const quote = await agent.getQuote('AAPL');
    
    assert.ok(quote, 'Quote should not be null');
    assert.strictEqual(quote.symbol, 'AAPL', 'Symbol should be AAPL');
    assert.ok(quote.name, 'Name should not be empty');
    assert.ok(typeof quote.price === 'number', 'Price should be a number');
  });
  
  // Export service tests
  await runTest('Export service - Export to CSV', async () => {
    const { exportToCsv } = require('./export-service');
    
    const testData = [
      { id: 1, name: 'Test 1', value: 100 },
      { id: 2, name: 'Test 2', value: 200 },
      { id: 3, name: 'Test 3', value: 300 }
    ];
    
    const result = await exportToCsv(testData, {
      fileName: 'test-export.csv'
    });
    
    assert.ok(result.success, 'Export should be successful');
    assert.strictEqual(result.fileName, 'test-export.csv', 'File name should match');
    assert.ok(fs.existsSync(result.filePath), 'File should exist');
    
    // Clean up
    fs.unlinkSync(result.filePath);
  });
  
  // Batch processor tests
  await runTest('Batch processor - Create batch job', async () => {
    const { createBatchJob, getBatchJobStatus, BATCH_STATUS } = require('./batch-processor');
    
    const files = [
      { name: 'test1.pdf', path: '/path/to/test1.pdf', size: 1000, type: 'application/pdf' },
      { name: 'test2.pdf', path: '/path/to/test2.pdf', size: 2000, type: 'application/pdf' }
    ];
    
    const batchJob = createBatchJob(files, {
      tenantId: 'test-tenant',
      userId: 'test-user',
      documentType: 'test'
    });
    
    assert.ok(batchJob, 'Batch job should not be null');
    assert.ok(batchJob.id, 'Batch job ID should not be empty');
    assert.strictEqual(batchJob.totalFiles, 2, 'Total files should be 2');
    
    // Wait for job to start processing
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const status = getBatchJobStatus(batchJob.id);
    assert.ok(status, 'Status should not be null');
    assert.strictEqual(status.totalFiles, 2, 'Total files should be 2');
    assert.ok([BATCH_STATUS.PENDING, BATCH_STATUS.PROCESSING].includes(status.status), 'Status should be pending or processing');
  });
}

/**
 * Run integration tests
 * @param {Object} options - Test options
 */
async function runIntegrationTests(options = {}) {
  console.log(`\n=== Running Integration Tests ===\n`);
  
  // API tests
  await runTest('API - Health check', async () => {
    const response = await axios.get(`${TEST_CONFIG.apiUrl}/health`);
    
    assert.strictEqual(response.status, 200, 'Status should be 200');
    assert.strictEqual(response.data.status, 'ok', 'Status should be ok');
  });
  
  // Document upload test
  await runTest('API - Document upload', async () => {
    const testPdfPath = path.join(TEST_CONFIG.testDataDir, 'test-document.pdf');
    
    // Create form data
    const FormData = require('form-data');
    const form = new FormData();
    form.append('file', fs.createReadStream(testPdfPath));
    form.append('name', 'Test Document');
    form.append('type', 'test');
    
    const response = await axios.post(`${TEST_CONFIG.apiUrl}/documents/upload`, form, {
      headers: {
        ...form.getHeaders()
      }
    });
    
    assert.strictEqual(response.status, 200, 'Status should be 200');
    assert.ok(response.data.id, 'Document ID should not be empty');
    assert.strictEqual(response.data.name, 'Test Document', 'Document name should match');
    assert.strictEqual(response.data.status, 'pending', 'Status should be pending');
  });
  
  // Document processing test
  await runTest('API - Document processing', async () => {
    // Upload document first
    const testPdfPath = path.join(TEST_CONFIG.testDataDir, 'test-document.pdf');
    
    // Create form data
    const FormData = require('form-data');
    const form = new FormData();
    form.append('file', fs.createReadStream(testPdfPath));
    form.append('name', 'Test Document');
    form.append('type', 'test');
    
    const uploadResponse = await axios.post(`${TEST_CONFIG.apiUrl}/documents/upload`, form, {
      headers: {
        ...form.getHeaders()
      }
    });
    
    const documentId = uploadResponse.data.id;
    
    // Wait for processing to complete
    let processed = false;
    let attempts = 0;
    const maxAttempts = 10;
    
    while (!processed && attempts < maxAttempts) {
      const response = await axios.get(`${TEST_CONFIG.apiUrl}/documents/${documentId}`);
      
      if (response.data.status === 'completed') {
        processed = true;
      } else {
        attempts++;
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    assert.ok(processed, 'Document should be processed');
    
    // Get document details
    const response = await axios.get(`${TEST_CONFIG.apiUrl}/documents/${documentId}`);
    
    assert.strictEqual(response.status, 200, 'Status should be 200');
    assert.strictEqual(response.data.id, documentId, 'Document ID should match');
    assert.strictEqual(response.data.status, 'completed', 'Status should be completed');
    assert.ok(response.data.content, 'Content should not be empty');
    assert.ok(response.data.content.text, 'Text content should not be empty');
  });
  
  // Document chat test
  await runTest('API - Document chat', async () => {
    // Get first document
    const documentsResponse = await axios.get(`${TEST_CONFIG.apiUrl}/documents`);
    
    if (documentsResponse.data.length === 0) {
      throw new Error('No documents found');
    }
    
    const documentId = documentsResponse.data[0].id;
    
    // Send chat message
    const chatResponse = await axios.post(`${TEST_CONFIG.apiUrl}/documents/${documentId}/chat`, {
      question: 'What is this document about?'
    });
    
    assert.strictEqual(chatResponse.status, 200, 'Status should be 200');
    assert.strictEqual(chatResponse.data.documentId, documentId, 'Document ID should match');
    assert.ok(chatResponse.data.answer, 'Answer should not be empty');
  });
}

/**
 * Run end-to-end tests
 * @param {Object} options - Test options
 */
async function runE2ETests(options = {}) {
  console.log(`\n=== Running End-to-End Tests ===\n`);
  
  let browser;
  
  try {
    // Launch browser
    browser = await chromium.launch({
      headless: TEST_CONFIG.headless,
      slowMo: TEST_CONFIG.slowMo
    });
    
    // Navigation test
    await runTest('E2E - Navigation', async () => {
      const context = await browser.newContext();
      const page = await context.newPage();
      
      // Go to homepage
      await page.goto(TEST_CONFIG.baseUrl);
      await page.screenshot({ path: path.join(TEST_CONFIG.screenshotDir, '01-homepage.png') });
      
      // Check title
      const title = await page.title();
      assert.ok(title.includes('FinDoc'), 'Title should include FinDoc');
      
      // Navigate to documents page
      await page.click('a:has-text("Documents")');
      await page.waitForSelector('.documents-page');
      await page.screenshot({ path: path.join(TEST_CONFIG.screenshotDir, '02-documents.png') });
      
      // Navigate to upload page
      await page.click('a:has-text("Upload")');
      await page.waitForSelector('.upload-page');
      await page.screenshot({ path: path.join(TEST_CONFIG.screenshotDir, '03-upload.png') });
      
      // Navigate to analytics page
      await page.click('a:has-text("Analytics")');
      await page.waitForSelector('.analytics-page');
      await page.screenshot({ path: path.join(TEST_CONFIG.screenshotDir, '04-analytics.png') });
      
      // Navigate to document chat page
      await page.click('a:has-text("Document Chat")');
      await page.waitForSelector('.document-chat-page');
      await page.screenshot({ path: path.join(TEST_CONFIG.screenshotDir, '05-document-chat.png') });
      
      // Navigate back to homepage
      await page.click('a:has-text("Dashboard")');
      await page.waitForSelector('.dashboard-page');
      await page.screenshot({ path: path.join(TEST_CONFIG.screenshotDir, '06-dashboard.png') });
      
      await context.close();
    });
    
    // Upload test
    await runTest('E2E - Upload document', async () => {
      const context = await browser.newContext();
      const page = await context.newPage();
      
      // Go to upload page
      await page.goto(`${TEST_CONFIG.baseUrl}/upload`);
      await page.waitForSelector('.upload-page');
      
      // Fill form
      await page.setInputFiles('input[type="file"]', path.join(TEST_CONFIG.testDataDir, 'test-document.pdf'));
      await page.fill('#document-name', 'E2E Test Document');
      await page.selectOption('#document-type', 'test');
      
      // Take screenshot
      await page.screenshot({ path: path.join(TEST_CONFIG.screenshotDir, '07-upload-form.png') });
      
      // Submit form
      await page.click('#upload-btn');
      
      // Wait for upload to complete
      await page.waitForSelector('.progress-bar[style*="width: 100%"]', { timeout: 10000 });
      
      // Take screenshot
      await page.screenshot({ path: path.join(TEST_CONFIG.screenshotDir, '08-upload-complete.png') });
      
      // Check if redirected to documents page
      await page.waitForSelector('.documents-page');
      
      await context.close();
    });
    
    // Document chat test
    await runTest('E2E - Document chat', async () => {
      const context = await browser.newContext();
      const page = await context.newPage();
      
      // Go to document chat page
      await page.goto(`${TEST_CONFIG.baseUrl}/document-chat`);
      await page.waitForSelector('.document-chat-page');
      
      // Select first document
      await page.waitForSelector('#document-select option:not([value=""])');
      await page.selectOption('#document-select', { index: 1 });
      
      // Take screenshot
      await page.screenshot({ path: path.join(TEST_CONFIG.screenshotDir, '09-document-chat-select.png') });
      
      // Send message
      await page.fill('#document-chat-input', 'What is this document about?');
      await page.click('#document-chat-send');
      
      // Wait for response
      await page.waitForSelector('.ai-message:not(.loading-message)');
      
      // Take screenshot
      await page.screenshot({ path: path.join(TEST_CONFIG.screenshotDir, '10-document-chat-response.png') });
      
      // Check if response is not empty
      const responseText = await page.textContent('.ai-message:not(.loading-message) p');
      assert.ok(responseText, 'Response should not be empty');
      
      await context.close();
    });
    
    // Analytics test
    await runTest('E2E - Analytics', async () => {
      const context = await browser.newContext();
      const page = await context.newPage();
      
      // Go to analytics page
      await page.goto(`${TEST_CONFIG.baseUrl}/analytics-new`);
      await page.waitForSelector('.analytics-page');
      
      // Take screenshot
      await page.screenshot({ path: path.join(TEST_CONFIG.screenshotDir, '11-analytics.png') });
      
      // Check if charts are displayed
      await page.waitForSelector('.chart-container');
      
      // Take screenshot
      await page.screenshot({ path: path.join(TEST_CONFIG.screenshotDir, '12-analytics-charts.png') });
      
      await context.close();
    });
  } finally {
    // Close browser
    if (browser) {
      await browser.close();
    }
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = {
  runAllTests,
  runUnitTests,
  runIntegrationTests,
  runE2ETests,
  runTest
};
