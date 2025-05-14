/**
 * Authentication Flow Test
 * 
 * This script tests the authentication flow for the FinDoc Analyzer application.
 */

const { chromium } = require('playwright');
const axios = require('axios');
const assert = require('assert');
const fs = require('fs');
const path = require('path');

// Test configuration
const config = {
  baseUrl: process.env.BASE_URL || 'http://localhost:8080',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  testEmail: process.env.TEST_EMAIL || 'test@example.com',
  testPassword: process.env.TEST_PASSWORD || 'testpassword',
  headless: process.env.HEADLESS !== 'false',
  slowMo: parseInt(process.env.SLOW_MO || '0', 10),
  timeout: parseInt(process.env.TIMEOUT || '30000', 10)
};

// Test results directory
const RESULTS_DIR = path.join(__dirname, 'test-auth-flow-results');

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
  }
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
  <title>Authentication Flow Test Report</title>
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
  <h1>Authentication Flow Test Report</h1>
  
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
 * Run all tests
 */
async function runTests() {
  let browser;
  
  try {
    // Launch browser
    browser = await chromium.launch({
      headless: config.headless,
      slowMo: config.slowMo
    });
    
    // Create context
    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 },
      recordVideo: {
        dir: RESULTS_DIR,
        size: { width: 1280, height: 720 }
      }
    });
    
    // Test 1: Verify Google OAuth URL
    await runTest('Verify Google OAuth URL', async () => {
      const response = await axios.get(`${config.baseUrl}/api/auth/google`);
      
      assert.strictEqual(response.status, 200);
      assert.ok(response.data.url);
      assert.ok(response.data.url.includes('accounts.google.com'));
      assert.ok(response.data.url.includes('oauth2'));
    });
    
    // Test 2: Verify frontend login page
    await runTest('Verify frontend login page', async () => {
      const page = await context.newPage();
      
      // Navigate to login page
      await page.goto(`${config.frontendUrl}/login`);
      
      // Take screenshot
      await page.screenshot({ path: path.join(RESULTS_DIR, 'login-page.png') });
      
      // Check for Google login button
      const googleButton = await page.locator('button:has-text("Continue with Google")');
      await googleButton.waitFor({ state: 'visible' });
      
      // Check for email login form
      const emailInput = await page.locator('input[type="email"]');
      await emailInput.waitFor({ state: 'visible' });
      
      // Close page
      await page.close();
    });
    
    // Test 3: Verify authentication middleware
    await runTest('Verify authentication middleware', async () => {
      try {
        await axios.get(`${config.baseUrl}/api/auth/me`);
        assert.fail('Should have thrown an error');
      } catch (error) {
        assert.strictEqual(error.response.status, 401);
      }
    });
    
    // Test 4: Verify tenant middleware
    await runTest('Verify tenant middleware', async () => {
      try {
        await axios.get(`${config.baseUrl}/api/tenant/documents`);
        assert.fail('Should have thrown an error');
      } catch (error) {
        assert.strictEqual(error.response.status, 401);
      }
    });
    
    // Test 5: Verify logout endpoint
    await runTest('Verify logout endpoint', async () => {
      const response = await axios.post(`${config.baseUrl}/api/auth/logout`);
      
      assert.strictEqual(response.status, 200);
      assert.strictEqual(response.data.success, true);
    });
    
    // Close browser
    await browser.close();
  } catch (error) {
    console.error('Error running tests:', error);
  } finally {
    // Close browser if it's still open
    if (browser) {
      await browser.close();
    }
    
    // Generate test report
    generateTestReport();
  }
}

// Run tests
runTests();
