/**
 * Comprehensive Test for Deployed FinDoc Analyzer Application
 *
 * This script tests all major features of the deployed application:
 * 1. Bloomberg Agent API
 * 2. Document Upload and Processing
 * 3. Chat Interface
 * 4. Table Generation
 * 5. PDF Processing
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');
const assert = require('assert');
const FormData = require('form-data');

// Test configuration
const config = {
  baseUrl: process.env.BASE_URL || 'https://backv2-app-brfi73d4ra-zf.a.run.app',
  testPdfPath: path.join(__dirname, 'test-files', 'sample_portfolio.pdf')
};

// Create test files directory if it doesn't exist
const TEST_FILES_DIR = path.join(__dirname, 'test-files');
if (!fs.existsSync(TEST_FILES_DIR)) {
  fs.mkdirSync(TEST_FILES_DIR, { recursive: true });
}

// Test results directory
const RESULTS_DIR = path.join(__dirname, 'test-deployed-app-results');
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
  <title>FinDoc Analyzer Comprehensive Test Report</title>
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
  <h1>FinDoc Analyzer Comprehensive Test Report</h1>

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
 * Create a sample PDF file for testing
 */
function createSamplePdf() {
  // Create a simple text file as a placeholder
  // In a real test, you would use a real PDF file
  const sampleContent = `
Sample Portfolio Statement
--------------------------

Securities:
- Apple Inc. (AAPL): 100 shares @ $180.00 = $18,000.00
- Microsoft Corp. (MSFT): 50 shares @ $350.00 = $17,500.00
- Amazon.com Inc. (AMZN): 20 shares @ $180.00 = $3,600.00

Total Portfolio Value: $39,100.00
  `;

  fs.writeFileSync(path.join(TEST_FILES_DIR, 'sample_portfolio.pdf'), sampleContent);

  console.log(`Created sample PDF at ${path.join(TEST_FILES_DIR, 'sample_portfolio.pdf')}`);
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
    // Create sample PDF for testing
    createSamplePdf();

    // Test 1: Create tenant
    await runTest('Create tenant', async () => {
      const tenant = await createTenant();

      assert.ok(tenant);
      assert.ok(tenant.tenant);
      assert.ok(tenant.tenant.id);

      testResults.tenantId = tenant.tenant.id;

      console.log(`Created tenant with ID: ${tenant.tenant.id}`);
    });

    // Test 2: Get stock price (Bloomberg Agent)
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

    // Test 3: Get historical data (Bloomberg Agent)
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

    // Test 4: Generate chart (Bloomberg Agent)
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

    // Test 5: Answer price question (Bloomberg Agent)
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

    // Test 6: Upload document
    await runTest('Upload document', async () => {
      // Create form data
      const formData = new FormData();
      formData.append('file', fs.createReadStream(config.testPdfPath));
      formData.append('name', 'Sample Portfolio');
      formData.append('type', 'financial_statement');

      const response = await axios.post(`${config.baseUrl}/api/tenant/documents/upload`, formData, {
        headers: {
          ...formData.getHeaders(),
          'x-tenant-id': testResults.tenantId
        }
      });

      const result = response.data;

      assert.ok(result);
      assert.ok(result.success);
      assert.ok(result.document);
      assert.ok(result.document.id);

      testResults.documentId = result.document.id;

      console.log(`Uploaded document with ID: ${result.document.id}`);
    });

    // Test 7: Get document status
    await runTest('Get document status', async () => {
      // Wait for document processing to complete
      let processed = false;
      let attempts = 0;
      const maxAttempts = 10;

      while (!processed && attempts < maxAttempts) {
        const response = await axios.get(`${config.baseUrl}/api/tenant/documents/${testResults.documentId}/status`, {
          headers: {
            'x-tenant-id': testResults.tenantId
          }
        });

        const result = response.data;

        if (result.status === 'completed' || result.processed) {
          processed = true;
          console.log(`Document processed successfully after ${attempts + 1} attempts`);
        } else {
          console.log(`Document processing in progress (${result.status}), waiting...`);
          attempts++;
          await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
        }
      }

      assert.ok(processed, `Document processing did not complete after ${maxAttempts} attempts`);
    });

    // Test 8: Get document content
    await runTest('Get document content', async () => {
      const response = await axios.get(`${config.baseUrl}/api/tenant/documents/${testResults.documentId}/content`, {
        headers: {
          'x-tenant-id': testResults.tenantId
        }
      });

      const result = response.data;

      assert.ok(result);
      assert.ok(result.content);

      // Save content to file
      fs.writeFileSync(path.join(RESULTS_DIR, 'document-content.json'), JSON.stringify(result.content, null, 2));

      console.log(`Retrieved document content`);
    });

    // Test 9: Get document metadata
    await runTest('Get document metadata', async () => {
      const response = await axios.get(`${config.baseUrl}/api/tenant/documents/${testResults.documentId}/metadata`, {
        headers: {
          'x-tenant-id': testResults.tenantId
        }
      });

      const result = response.data;

      assert.ok(result);
      assert.ok(result.metadata);

      // Save metadata to file
      fs.writeFileSync(path.join(RESULTS_DIR, 'document-metadata.json'), JSON.stringify(result.metadata, null, 2));

      console.log(`Retrieved document metadata`);
    });

    // Test 10: Ask question about document
    await runTest('Ask question about document', async () => {
      const question = 'What securities are in this portfolio?';

      // Wait for document to be fully processed
      let processed = false;
      let attempts = 0;
      const maxAttempts = 15;

      while (!processed && attempts < maxAttempts) {
        try {
          const statusResponse = await axios.get(`${config.baseUrl}/api/tenant/documents/${testResults.documentId}/status`, {
            headers: {
              'x-tenant-id': testResults.tenantId
            }
          });

          const statusResult = statusResponse.data;

          if (statusResult.status === 'completed' && statusResult.processed) {
            processed = true;
            console.log(`Document is fully processed and ready for questions`);
          } else {
            console.log(`Waiting for document to be fully processed (${statusResult.status}), attempt ${attempts + 1}/${maxAttempts}`);
            attempts++;
            await new Promise(resolve => setTimeout(resolve, 3000)); // Wait 3 seconds
          }
        } catch (error) {
          console.log(`Error checking document status: ${error.message}`);
          attempts++;
          await new Promise(resolve => setTimeout(resolve, 3000)); // Wait 3 seconds
        }
      }

      if (!processed) {
        throw new Error(`Document not fully processed after ${maxAttempts} attempts`);
      }

      const response = await axios.post(`${config.baseUrl}/api/tenant/documents/${testResults.documentId}/ask`, {
        question
      }, {
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': testResults.tenantId
        }
      });

      const result = response.data;

      assert.ok(result);
      assert.ok(result.answer);

      // Save answer to file
      fs.writeFileSync(path.join(RESULTS_DIR, 'document-question-answer.json'), JSON.stringify(result, null, 2));

      console.log(`Question: ${question}`);
      console.log(`Answer: ${result.answer}`);
    });

    // Test 11: Generate table from document
    await runTest('Generate table from document', async () => {
      const request = {
        prompt: 'Create a table of all securities with their values and weights'
      };

      const response = await axios.post(`${config.baseUrl}/api/tenant/documents/${testResults.documentId}/generate-table`, request, {
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': testResults.tenantId
        }
      });

      const result = response.data;

      assert.ok(result);
      assert.ok(result.table);
      assert.ok(result.table.headers);
      assert.ok(result.table.rows);

      // Save table to file
      fs.writeFileSync(path.join(RESULTS_DIR, 'generated-table.json'), JSON.stringify(result.table, null, 2));

      console.log(`Generated table with ${result.table.rows.length} rows and ${result.table.headers.length} columns`);
    });

    // Test 12: Generate chart from document
    await runTest('Generate chart from document', async () => {
      const request = {
        prompt: 'Create a pie chart showing the portfolio allocation by security',
        chartType: 'pie'
      };

      const response = await axios.post(`${config.baseUrl}/api/tenant/documents/${testResults.documentId}/generate-chart`, request, {
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': testResults.tenantId
        }
      });

      const result = response.data;

      assert.ok(result);
      assert.ok(result.chartUrl);
      assert.ok(result.chartData);

      // Save chart data to file
      fs.writeFileSync(path.join(RESULTS_DIR, 'document-chart-data.json'), JSON.stringify(result.chartData, null, 2));

      console.log(`Generated chart: ${result.chartUrl}`);
    });

    // Test 13: Export document as PDF
    await runTest('Export document as PDF', async () => {
      const response = await axios.get(`${config.baseUrl}/api/tenant/documents/${testResults.documentId}/export/pdf`, {
        headers: {
          'x-tenant-id': testResults.tenantId
        },
        responseType: 'arraybuffer'
      });

      assert.ok(response.data);
      assert.ok(response.headers['content-type'].includes('application/pdf'));

      // Save PDF to file
      fs.writeFileSync(path.join(RESULTS_DIR, 'exported-document.pdf'), response.data);

      console.log(`Exported document as PDF`);
    });

    // Test 14: Export document as Excel
    await runTest('Export document as Excel', async () => {
      const response = await axios.get(`${config.baseUrl}/api/tenant/documents/${testResults.documentId}/export/excel`, {
        headers: {
          'x-tenant-id': testResults.tenantId
        },
        responseType: 'arraybuffer'
      });

      assert.ok(response.data);
      assert.ok(response.headers['content-type'].includes('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'));

      // Save Excel to file
      fs.writeFileSync(path.join(RESULTS_DIR, 'exported-document.xlsx'), response.data);

      console.log(`Exported document as Excel`);
    });

    // Test 15: Check UI components
    await runTest('Check UI components', async () => {
      // Get the main page
      const response = await axios.get(`${config.baseUrl}`, {
        headers: {
          'Accept': 'text/html'
        }
      });

      const html = response.data;

      // Check for key UI components
      assert.ok(html.includes('FinDoc Analyzer'), 'Main page should include the app title');
      assert.ok(html.includes('Dashboard') || html.includes('dashboard'), 'Main page should include dashboard');
      assert.ok(html.includes('Documents') || html.includes('documents'), 'Main page should include documents section');
      assert.ok(html.includes('Analytics') || html.includes('analytics'), 'Main page should include analytics section');

      console.log(`Verified UI components on main page`);
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
