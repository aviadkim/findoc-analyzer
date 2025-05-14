/**
 * Bloomberg Agent API Test for Cloud Deployment
 * 
 * This script tests the Bloomberg Agent API endpoints on the deployed application.
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');
const assert = require('assert');

// Test configuration
const config = {
  baseUrl: process.env.BASE_URL || 'https://backv2-app-326324779592.me-west1.run.app'
};

// Test results directory
const RESULTS_DIR = path.join(__dirname, 'test-bloomberg-api-cloud-results');

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
  tenantId: null
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
  <title>Bloomberg Agent API Cloud Test Report</title>
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
  <h1>Bloomberg Agent API Cloud Test Report</h1>
  
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
      <strong>Base URL:</strong> ${config.baseUrl}
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
    
    // Test 2: Get stock price
    await runTest('Get stock price', async () => {
      const symbol = 'AAPL';
      
      const response = await axios.get(`${config.baseUrl}/api/tenant/bloomberg/stock/${symbol}`, {
        headers: {
          'x-tenant-id': testResults.tenantId
        }
      });
      
      const result = response.data;
      
      assert.ok(result);
      assert.ok(result.success);
      assert.strictEqual(result.symbol, symbol);
      assert.ok(result.price);
      assert.ok(result.change);
      assert.ok(result.changePercent);
      
      console.log(`Stock price for ${symbol}: $${result.price} (${result.change > 0 ? '+' : ''}${result.change}, ${result.changePercent}%)`);
    });
    
    // Test 3: Get historical data
    await runTest('Get historical data', async () => {
      const symbol = 'MSFT';
      const interval = '1d';
      const range = '1m';
      
      const response = await axios.get(`${config.baseUrl}/api/tenant/bloomberg/historical/${symbol}?interval=${interval}&range=${range}`, {
        headers: {
          'x-tenant-id': testResults.tenantId
        }
      });
      
      const result = response.data;
      
      assert.ok(result);
      assert.ok(result.success);
      assert.strictEqual(result.symbol, symbol);
      assert.strictEqual(result.interval, interval);
      assert.strictEqual(result.range, range);
      assert.ok(Array.isArray(result.data));
      assert.ok(result.data.length > 0);
      
      console.log(`Historical data for ${symbol}: ${result.data.length} data points`);
      
      // Save historical data to file
      fs.writeFileSync(path.join(RESULTS_DIR, `${symbol}-historical-data.json`), JSON.stringify(result.data, null, 2));
    });
    
    // Test 4: Generate chart
    await runTest('Generate chart', async () => {
      const symbol = 'GOOGL';
      const chartType = 'line';
      const interval = '1d';
      const range = '1m';
      
      const response = await axios.post(`${config.baseUrl}/api/tenant/bloomberg/chart/${symbol}`, {
        chartType,
        interval,
        range
      }, {
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': testResults.tenantId
        }
      });
      
      const result = response.data;
      
      assert.ok(result);
      assert.ok(result.success);
      assert.strictEqual(result.symbol, symbol);
      assert.strictEqual(result.chartType, chartType);
      assert.strictEqual(result.interval, interval);
      assert.strictEqual(result.range, range);
      assert.ok(result.chartUrl);
      assert.ok(result.chartData);
      assert.ok(result.chartData.labels);
      assert.ok(result.chartData.datasets);
      
      console.log(`Chart for ${symbol}: ${result.chartUrl}`);
      console.log(`Chart has ${result.chartData.labels.length} data points and ${result.chartData.datasets.length} datasets`);
      
      // Save chart data to file
      fs.writeFileSync(path.join(RESULTS_DIR, `${symbol}-chart-data.json`), JSON.stringify(result.chartData, null, 2));
    });
    
    // Test 5: Answer price question
    await runTest('Answer price question', async () => {
      const question = 'What is the current price of AAPL?';
      
      const response = await axios.post(`${config.baseUrl}/api/tenant/bloomberg/question`, {
        question
      }, {
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': testResults.tenantId
        }
      });
      
      const result = response.data;
      
      assert.ok(result);
      assert.ok(result.success);
      assert.strictEqual(result.question, question);
      assert.ok(result.answer);
      assert.strictEqual(result.type, 'price');
      assert.ok(result.data);
      
      console.log(`Question: ${question}`);
      console.log(`Answer: ${result.answer}`);
      
      // Save answer to file
      fs.writeFileSync(path.join(RESULTS_DIR, 'price-question-answer.json'), JSON.stringify(result, null, 2));
    });
    
    // Test 6: Answer historical question
    await runTest('Answer historical question', async () => {
      const question = 'How has TSLA performed over the past month?';
      
      const response = await axios.post(`${config.baseUrl}/api/tenant/bloomberg/question`, {
        question
      }, {
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': testResults.tenantId
        }
      });
      
      const result = response.data;
      
      assert.ok(result);
      assert.ok(result.success);
      assert.strictEqual(result.question, question);
      assert.ok(result.answer);
      assert.ok(result.type);
      assert.ok(result.data);
      
      console.log(`Question: ${question}`);
      console.log(`Answer: ${result.answer}`);
      
      // Save answer to file
      fs.writeFileSync(path.join(RESULTS_DIR, 'historical-question-answer.json'), JSON.stringify(result, null, 2));
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
