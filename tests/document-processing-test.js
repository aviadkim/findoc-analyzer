/**
 * Document Processing Test
 * 
 * This test verifies the document processing functionality of the FinDoc Analyzer application.
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');
const { processDocument, extractSecurities, generateFinancialSummary } = require('../services/document-processor');

// Configuration
const config = {
  testFilesDir: path.join(__dirname, 'test-files'),
  resultsDir: path.join(__dirname, '../test-results'),
  reportFile: 'document-processing-report.json'
};

// Create directories if they don't exist
fs.mkdirSync(config.testFilesDir, { recursive: true });
fs.mkdirSync(config.resultsDir, { recursive: true });

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
 * Run a test
 * @param {string} name - Test name
 * @param {Function} testFn - Test function
 */
async function runTest(name, testFn) {
  testResults.total++;
  
  const test = {
    name,
    status: 'running',
    startTime: new Date(),
    endTime: null,
    error: null
  };
  
  console.log(`\n🧪 Running test: ${name}`);
  
  try {
    await testFn();
    
    test.status = 'passed';
    test.endTime = new Date();
    testResults.passed++;
    
    console.log(`✅ Test passed: ${name}`);
  } catch (error) {
    test.status = 'failed';
    test.endTime = new Date();
    test.error = error.message;
    testResults.failed++;
    
    console.error(`❌ Test failed: ${name}`);
    console.error(`   Error: ${error.message}`);
  }
  
  testResults.tests.push(test);
}

/**
 * Skip a test
 * @param {string} name - Test name
 * @param {string} reason - Reason for skipping
 */
function skipTest(name, reason) {
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
 * Create a test file
 * @param {string} fileName - File name
 * @param {string} content - File content
 * @returns {string} - File path
 */
function createTestFile(fileName, content) {
  const filePath = path.join(config.testFilesDir, fileName);
  fs.writeFileSync(filePath, content);
  return filePath;
}

/**
 * Save test results to a JSON file
 */
function saveTestResults() {
  const reportPath = path.join(config.resultsDir, config.reportFile);
  fs.writeFileSync(reportPath, JSON.stringify(testResults, null, 2));
  console.log(`\n📊 Test results saved to: ${reportPath}`);
}

/**
 * Generate an HTML report
 */
function generateHtmlReport() {
  const reportPath = path.join(config.resultsDir, 'document-processing-report.html');
  
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document Processing Test Report</title>
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
    
    .test-list {
      list-style: none;
      padding: 0;
    }
    
    .test-item {
      background-color: #fff;
      border-radius: 5px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
      margin-bottom: 15px;
      overflow: hidden;
    }
    
    .test-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 15px 20px;
      background-color: #f8f9fa;
      border-bottom: 1px solid #eee;
    }
    
    .test-name {
      font-weight: 500;
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
      background-color: #6c757d;
    }
    
    .test-content {
      padding: 15px 20px;
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
    
    .test-reason {
      background-color: #e2e3e5;
      color: #383d41;
      padding: 10px;
      border-radius: 3px;
      margin-top: 10px;
    }
    
    .test-time {
      color: #6c757d;
      font-size: 0.9rem;
      margin-top: 10px;
    }
  </style>
</head>
<body>
  <h1>Document Processing Test Report</h1>
  
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
      <h2>${Math.floor((testResults.endTime - testResults.startTime) / 1000)}s</h2>
      <div class="summary-label">Duration</div>
    </div>
  </div>
  
  <h2>Test Results</h2>
  
  <ul class="test-list">
    ${testResults.tests.map(test => `
      <li class="test-item">
        <div class="test-header">
          <h3 class="test-name">${test.name}</h3>
          <span class="test-status status-${test.status}">${test.status.toUpperCase()}</span>
        </div>
        <div class="test-content">
          ${test.error ? `<div class="test-error">${test.error}</div>` : ''}
          ${test.reason ? `<div class="test-reason">${test.reason}</div>` : ''}
          <div class="test-time">
            Started: ${test.startTime.toISOString()}<br>
            ${test.endTime ? `Ended: ${test.endTime.toISOString()}<br>` : ''}
            ${test.endTime ? `Duration: ${Math.floor((test.endTime - test.startTime) / 1000)}s` : ''}
          </div>
        </div>
      </li>
    `).join('')}
  </ul>
</body>
</html>
  `;
  
  fs.writeFileSync(reportPath, html);
  console.log(`\n📊 HTML report saved to: ${reportPath}`);
  
  return reportPath;
}

/**
 * Run all tests
 */
async function runTests() {
  testResults.startTime = new Date();
  
  try {
    // Test 1: Process a PDF document
    await runTest('Process a PDF document', async () => {
      // Create a test PDF file
      const pdfContent = `%PDF-1.5
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R >>
endobj
4 0 obj
<< /Length 68 >>
stream
BT
/F1 12 Tf
100 700 Td
(Financial Report 2023) Tj
ET
endstream
endobj
xref
0 5
0000000000 65535 f
0000000010 00000 n
0000000059 00000 n
0000000118 00000 n
0000000196 00000 n
trailer
<< /Size 5 /Root 1 0 R >>
startxref
314
%%EOF`;
      
      const pdfPath = createTestFile('test.pdf', pdfContent);
      
      // Process the PDF
      const result = await processDocument(pdfPath);
      
      // Check if the result has the expected properties
      assert.ok(result, 'Result should not be null or undefined');
      assert.ok(result.text, 'Result should have text');
      assert.ok(Array.isArray(result.tables), 'Result should have tables array');
      assert.ok(result.metadata, 'Result should have metadata');
    });
    
    // Test 2: Process an Excel document
    await runTest('Process an Excel document', async () => {
      // Skip this test for now as we can't easily create a binary Excel file
      throw new Error('Skipping Excel test - cannot create binary Excel file in this environment');
    });
    
    // Test 3: Process a CSV document
    await runTest('Process a CSV document', async () => {
      // Create a test CSV file
      const csvContent = `Security,ISIN,Quantity,Acquisition Price,Current Value,% of Assets
Apple Inc.,US0378331005,1000,$150.00,$175.00,7.0%
Microsoft,US5949181045,800,$250.00,$300.00,9.6%
Amazon,US0231351067,500,$120.00,$140.00,2.8%`;
      
      const csvPath = createTestFile('test.csv', csvContent);
      
      // Process the CSV
      const result = await processDocument(csvPath);
      
      // Check if the result has the expected properties
      assert.ok(result, 'Result should not be null or undefined');
      assert.ok(result.text, 'Result should have text');
      assert.ok(Array.isArray(result.tables), 'Result should have tables array');
      assert.ok(result.metadata, 'Result should have metadata');
      
      // Check if the tables were extracted correctly
      assert.ok(result.tables.length > 0, 'Result should have at least one table');
      assert.ok(result.tables[0].headers.includes('Security'), 'Table should have Security header');
      assert.ok(result.tables[0].headers.includes('ISIN'), 'Table should have ISIN header');
    });
    
    // Test 4: Extract securities from document content
    await runTest('Extract securities from document content', async () => {
      // Create mock document content
      const content = {
        text: `Investment Portfolio
        
        Security   | ISIN         | Quantity | Acquisition Price | Current Value | % of Assets
        -----------|--------------|----------|-------------------|---------------|------------
        Apple Inc. | US0378331005 | 1,000    | $150.00           | $175.00       | 7.0%
        Microsoft  | US5949181045 | 800      | $250.00           | $300.00       | 9.6%
        Amazon     | US0231351067 | 500      | $120.00           | $140.00       | 2.8%`,
        tables: [
          {
            title: 'Investment Portfolio',
            headers: ['Security', 'ISIN', 'Quantity', 'Acquisition Price', 'Current Value', '% of Assets'],
            rows: [
              ['Apple Inc.', 'US0378331005', '1,000', '$150.00', '$175.00', '7.0%'],
              ['Microsoft', 'US5949181045', '800', '$250.00', '$300.00', '9.6%'],
              ['Amazon', 'US0231351067', '500', '$120.00', '$140.00', '2.8%']
            ]
          }
        ]
      };
      
      // Extract securities
      const securities = await extractSecurities(content);
      
      // Check if securities were extracted correctly
      assert.ok(Array.isArray(securities), 'Securities should be an array');
      assert.ok(securities.length > 0, 'Securities array should not be empty');
      
      // Check if specific securities were extracted
      const apple = securities.find(s => s.isin === 'US0378331005');
      const microsoft = securities.find(s => s.isin === 'US5949181045');
      const amazon = securities.find(s => s.isin === 'US0231351067');
      
      assert.ok(apple, 'Apple should be extracted');
      assert.ok(microsoft, 'Microsoft should be extracted');
      assert.ok(amazon, 'Amazon should be extracted');
      
      assert.strictEqual(apple.name, 'Apple Inc.', 'Apple name should be correct');
      assert.strictEqual(microsoft.name, 'Microsoft', 'Microsoft name should be correct');
      assert.strictEqual(amazon.name, 'Amazon', 'Amazon name should be correct');
    });
    
    // Test 5: Generate financial summary from document content
    await runTest('Generate financial summary from document content', async () => {
      // Create mock document content
      const content = {
        text: `Financial Report 2023
        
        Financial Highlights:
        - Total Assets: $25,000,000
        - Total Liabilities: $12,000,000
        - Shareholders' Equity: $13,000,000
        - Annual Return: 8.5%`,
        tables: [
          {
            title: 'Balance Sheet',
            headers: ['Item', 'Amount'],
            rows: [
              ['Total Assets', '$25,000,000'],
              ['Total Liabilities', '$12,000,000'],
              ['Shareholders\' Equity', '$13,000,000']
            ]
          }
        ],
        securities: [
          {
            name: 'Apple Inc.',
            isin: 'US0378331005',
            quantity: '1,000',
            acquisitionPrice: '$150.00',
            currentValue: '$175.00',
            percentOfAssets: '7.0%'
          },
          {
            name: 'Microsoft',
            isin: 'US5949181045',
            quantity: '800',
            acquisitionPrice: '$250.00',
            currentValue: '$300.00',
            percentOfAssets: '9.6%'
          },
          {
            name: 'Amazon',
            isin: 'US0231351067',
            quantity: '500',
            acquisitionPrice: '$120.00',
            currentValue: '$140.00',
            percentOfAssets: '2.8%'
          }
        ]
      };
      
      // Generate financial summary
      const summary = await generateFinancialSummary(content);
      
      // Check if summary was generated correctly
      assert.ok(summary, 'Summary should not be null or undefined');
      assert.ok(summary.metrics, 'Summary should have metrics');
      assert.ok(Array.isArray(summary.topHoldings), 'Summary should have top holdings array');
      
      // Check if specific metrics were extracted
      assert.ok(summary.metrics.totalAssets, 'Total assets should be extracted');
      assert.ok(summary.metrics.totalLiabilities, 'Total liabilities should be extracted');
      assert.ok(summary.metrics.netWorth, 'Net worth should be extracted');
    });
  } catch (error) {
    console.error('Error running tests:', error);
  } finally {
    testResults.endTime = new Date();
    
    // Save test results
    saveTestResults();
    
    // Generate HTML report
    generateHtmlReport();
    
    // Print summary
    console.log('\n📋 Test Summary:');
    console.log(`   Total: ${testResults.total}`);
    console.log(`   Passed: ${testResults.passed}`);
    console.log(`   Failed: ${testResults.failed}`);
    console.log(`   Skipped: ${testResults.skipped}`);
    console.log(`   Duration: ${Math.floor((testResults.endTime - testResults.startTime) / 1000)} seconds`);
  }
}

// Run the tests
runTests();
