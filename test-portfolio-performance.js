/**
 * Portfolio Performance Agent Test
 * 
 * This script tests the Portfolio Performance Agent functionality.
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');
const assert = require('assert');

// Test configuration
const config = {
  baseUrl: process.env.BASE_URL || 'http://localhost:8080',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000'
};

// Test results directory
const RESULTS_DIR = path.join(__dirname, 'test-portfolio-performance-results');

// Create results directory if it doesn't exist
if (!fs.existsSync(RESULTS_DIR)) {
  fs.mkdirSync(RESULTS_DIR, { recursive: true });
}

// Test results
const testResults = {
  tests: [],
  summary: {
    total: 0,
    passed: 0,
    failed: 0
  },
  tenantId: null,
  documentId: null
};

/**
 * Run a test
 * @param {string} name - Test name
 * @param {Function} testFn - Test function
 */
async function runTest(name, testFn) {
  console.log(`Running test: ${name}`);
  
  const startTime = Date.now();
  let status = 'passed';
  let error = null;
  
  try {
    await testFn();
    console.log(`✅ Test passed: ${name}`);
    testResults.summary.passed++;
  } catch (err) {
    status = 'failed';
    error = err.message;
    console.error(`❌ Test failed: ${name}`);
    console.error(err);
    testResults.summary.failed++;
  }
  
  const endTime = Date.now();
  const duration = endTime - startTime;
  
  testResults.tests.push({
    name,
    status,
    duration,
    error
  });
  
  testResults.summary.total++;
}

/**
 * Generate test report
 */
function generateTestReport() {
  // Calculate test duration
  const totalDuration = testResults.tests.reduce((total, test) => total + test.duration, 0);
  
  // Generate HTML report
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Portfolio Performance Agent Test Report</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      margin: 0;
      padding: 20px;
      color: #333;
    }
    
    h1, h2, h3 {
      color: #0066cc;
    }
    
    .summary {
      background-color: #f5f5f5;
      padding: 15px;
      border-radius: 5px;
      margin-bottom: 20px;
    }
    
    .summary-item {
      margin-bottom: 10px;
    }
    
    .test {
      margin-bottom: 15px;
      padding: 15px;
      border-radius: 5px;
    }
    
    .test-passed {
      background-color: #e6ffe6;
      border-left: 5px solid #00cc00;
    }
    
    .test-failed {
      background-color: #ffe6e6;
      border-left: 5px solid #cc0000;
    }
    
    .test-name {
      font-weight: bold;
      margin-bottom: 5px;
    }
    
    .test-duration {
      color: #666;
      font-size: 0.9em;
    }
    
    .test-error {
      color: #cc0000;
      margin-top: 10px;
      font-family: monospace;
      white-space: pre-wrap;
    }
    
    .progress-bar {
      height: 20px;
      background-color: #f5f5f5;
      border-radius: 10px;
      margin-bottom: 20px;
      overflow: hidden;
    }
    
    .progress {
      height: 100%;
      background-color: #0066cc;
      text-align: center;
      line-height: 20px;
      color: white;
    }
  </style>
</head>
<body>
  <h1>Portfolio Performance Agent Test Report</h1>
  
  <div class="summary">
    <h2>Summary</h2>
    
    <div class="progress-bar">
      <div class="progress" style="width: ${testResults.summary.passed / testResults.summary.total * 100}%">
        ${testResults.summary.passed}/${testResults.summary.total} (${Math.round(testResults.summary.passed / testResults.summary.total * 100)}%)
      </div>
    </div>
    
    <div class="summary-item">
      <strong>Total Tests:</strong> ${testResults.summary.total}
    </div>
    
    <div class="summary-item">
      <strong>Passed:</strong> ${testResults.summary.passed}
    </div>
    
    <div class="summary-item">
      <strong>Failed:</strong> ${testResults.summary.failed}
    </div>
    
    <div class="summary-item">
      <strong>Duration:</strong> ${(totalDuration / 1000).toFixed(2)}s
    </div>
    
    <div class="summary-item">
      <strong>Tenant ID:</strong> ${testResults.tenantId || 'N/A'}
    </div>
    
    <div class="summary-item">
      <strong>Document ID:</strong> ${testResults.documentId || 'N/A'}
    </div>
  </div>
  
  <h2>Test Results</h2>
  
  ${testResults.tests.map(test => `
    <div class="test ${test.status === 'passed' ? 'test-passed' : 'test-failed'}">
      <div class="test-name">${test.name}</div>
      <div class="test-duration">Duration: ${(test.duration / 1000).toFixed(2)}s</div>
      ${test.error ? `<div class="test-error">${test.error}</div>` : ''}
    </div>
  `).join('')}
</body>
</html>
  `;
  
  // Write HTML report to file
  fs.writeFileSync(path.join(RESULTS_DIR, 'test-report.html'), html);
  
  // Write JSON results to file
  fs.writeFileSync(path.join(RESULTS_DIR, 'test-results.json'), JSON.stringify(testResults, null, 2));
  
  console.log(`\nTest report generated at ${path.join(RESULTS_DIR, 'test-report.html')}`);
  console.log(`\nTest Summary:`);
  console.log(`Total: ${testResults.summary.total}`);
  console.log(`Passed: ${testResults.summary.passed}`);
  console.log(`Failed: ${testResults.summary.failed}`);
  console.log(`Success Rate: ${Math.round(testResults.summary.passed / testResults.summary.total * 100)}%`);
}

/**
 * Create a tenant
 * @returns {Promise<Object>} Created tenant
 */
async function createTenant() {
  const response = await axios.post(`${config.baseUrl}/api/tenants`, {
    name: `Test Tenant ${Date.now()}`,
    subscriptionTier: 'premium',
    maxDocuments: 500,
    maxApiCalls: 5000
  });
  
  return response.data;
}

/**
 * Create a document for a tenant
 * @param {string} tenantId - Tenant ID
 * @returns {Promise<Object>} Created document
 */
async function createDocument(tenantId) {
  const response = await axios.post(`${config.baseUrl}/api/tenant/documents`, {
    fileName: `Portfolio Document ${Date.now()}.pdf`,
    fileSize: 1024000,
    documentType: 'portfolio'
  }, {
    headers: {
      'Content-Type': 'application/json',
      'x-tenant-id': tenantId
    }
  });
  
  return response.data;
}

/**
 * Process a document for a tenant
 * @param {string} tenantId - Tenant ID
 * @param {string} documentId - Document ID
 * @returns {Promise<Object>} Processing result
 */
async function processDocument(tenantId, documentId) {
  const response = await axios.post(`${config.baseUrl}/api/tenant/documents/${documentId}/process`, {}, {
    headers: {
      'x-tenant-id': tenantId
    }
  });
  
  return response.data;
}

/**
 * Analyze portfolio performance for a document
 * @param {string} tenantId - Tenant ID
 * @param {string} documentId - Document ID
 * @returns {Promise<Object>} Analysis result
 */
async function analyzePortfolioPerformance(tenantId, documentId) {
  const response = await axios.post(`${config.baseUrl}/api/tenant/documents/${documentId}/portfolio-performance`, {}, {
    headers: {
      'x-tenant-id': tenantId
    }
  });
  
  return response.data;
}

/**
 * Generate portfolio performance report
 * @param {string} tenantId - Tenant ID
 * @param {string} documentId - Document ID
 * @param {Object} portfolioData - Portfolio data
 * @param {Object} options - Report options
 * @returns {Promise<Object>} Generated report
 */
async function generatePerformanceReport(tenantId, documentId, portfolioData = null, options = {}) {
  const response = await axios.post(`${config.baseUrl}/api/tenant/documents/${documentId}/portfolio-performance/report`, {
    portfolioData,
    options
  }, {
    headers: {
      'Content-Type': 'application/json',
      'x-tenant-id': tenantId
    }
  });
  
  return response.data;
}

/**
 * Run all tests
 */
async function runTests() {
  try {
    // Test 1: Create tenant
    await runTest('Create tenant', async () => {
      const tenant = await createTenant();
      
      assert.ok(tenant);
      assert.ok(tenant.tenant);
      assert.ok(tenant.tenant.id);
      
      testResults.tenantId = tenant.tenant.id;
      
      console.log(`Created tenant with ID: ${tenant.tenant.id}`);
    });
    
    // Test 2: Create document
    await runTest('Create document', async () => {
      const document = await createDocument(testResults.tenantId);
      
      assert.ok(document);
      assert.ok(document.id);
      
      testResults.documentId = document.id;
      
      console.log(`Created document with ID: ${document.id}`);
    });
    
    // Test 3: Process document
    await runTest('Process document', async () => {
      const result = await processDocument(testResults.tenantId, testResults.documentId);
      
      assert.ok(result);
      assert.ok(result.id);
      assert.ok(result.status);
      
      console.log(`Processing document: ${JSON.stringify(result)}`);
      
      // Wait for processing to start
      await new Promise(resolve => setTimeout(resolve, 1000));
    });
    
    // Test 4: Analyze portfolio performance
    await runTest('Analyze portfolio performance', async () => {
      const result = await analyzePortfolioPerformance(testResults.tenantId, testResults.documentId);
      
      assert.ok(result);
      assert.ok(result.success);
      assert.ok(result.portfolioData);
      assert.ok(result.metrics);
      assert.ok(result.performanceAnalysis);
      
      console.log(`Portfolio performance analysis: ${JSON.stringify(result.metrics)}`);
    });
    
    // Test 5: Generate portfolio performance report
    await runTest('Generate portfolio performance report', async () => {
      const result = await generatePerformanceReport(testResults.tenantId, testResults.documentId);
      
      assert.ok(result);
      assert.ok(result.success);
      assert.ok(result.report);
      assert.ok(result.metrics);
      assert.ok(result.performanceAnalysis);
      
      console.log(`Portfolio performance report: ${JSON.stringify(result.report.title)}`);
      
      // Save report to file
      fs.writeFileSync(path.join(RESULTS_DIR, 'performance-report.json'), JSON.stringify(result.report, null, 2));
    });
    
    // Test 6: Generate portfolio performance report with custom options
    await runTest('Generate portfolio performance report with custom options', async () => {
      const options = {
        includeBenchmarks: true,
        includeAssetAllocation: true,
        includeSectorAllocation: true,
        includeRiskMetrics: true
      };
      
      const result = await generatePerformanceReport(testResults.tenantId, testResults.documentId, null, options);
      
      assert.ok(result);
      assert.ok(result.success);
      assert.ok(result.report);
      assert.ok(result.metrics);
      assert.ok(result.performanceAnalysis);
      
      console.log(`Custom portfolio performance report: ${JSON.stringify(result.report.title)}`);
      
      // Save report to file
      fs.writeFileSync(path.join(RESULTS_DIR, 'custom-performance-report.json'), JSON.stringify(result.report, null, 2));
    });
  } catch (error) {
    console.error('Error running tests:', error);
  } finally {
    // Generate test report
    generateTestReport();
  }
}

// Run tests
runTests();
