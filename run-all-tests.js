/**
 * FinDoc Analyzer Test Runner
 *
 * This script runs all tests for the FinDoc Analyzer application.
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const { TestRunner, config } = require('./puppeteer-test-framework');

// Test scripts
const testScripts = [
  // UI Tests
  { name: 'Layout Tests', script: 'layout-tests.js', category: 'UI Tests' },
  { name: 'Navigation Tests', script: 'navigation-tests.js', category: 'UI Tests' },
  { name: 'Interactive Element Tests', script: 'interactive-element-tests.js', category: 'UI Tests' },
  { name: 'UI Tests', script: 'tests/ui-test.js', category: 'UI Tests' },

  // Document Processing Tests
  { name: 'PDF Text Extraction Tests', script: 'tests/pdf-text-extraction-test.js', category: 'Document Processing Tests' },
  { name: 'PDF Table Extraction Tests', script: 'tests/pdf-table-extraction-test.js', category: 'Document Processing Tests' },

  // Financial Analysis Tests
  { name: 'Securities Extraction Tests', script: 'tests/securities-extraction-test.js', category: 'Financial Analysis Tests' }
];

// Results directory
const resultsDir = path.join(__dirname, 'test-results');

// Create results directory if it doesn't exist
if (!fs.existsSync(resultsDir)) {
  fs.mkdirSync(resultsDir, { recursive: true });
}

/**
 * Run a test script
 * @param {string} script - Script path
 * @param {string} name - Test name
 * @param {string} category - Test category
 * @returns {Promise<object>} Test result
 */
function runTestScript(script, name, category) {
  return new Promise((resolve, reject) => {
    console.log(`Running ${name} (${script})...`);

    const child = spawn('node', [script], {
      stdio: 'inherit'
    });

    child.on('close', code => {
      if (code === 0) {
        console.log(`${name} completed successfully`);

        // Generate report path
        const scriptName = path.basename(script, '.js');
        const reportPath = path.join(resultsDir, `${scriptName}-report.html`);

        resolve({
          script,
          name,
          category,
          success: true,
          reportPath: `../test-results/${path.basename(reportPath)}`
        });
      } else {
        console.error(`${name} failed with code ${code}`);
        resolve({
          script,
          name,
          category,
          success: false,
          code
        });
      }
    });

    child.on('error', error => {
      console.error(`Error running ${name}:`, error);
      reject(error);
    });
  });
}

/**
 * Generate a summary report
 * @param {Array<object>} results - Test results
 * @returns {string} HTML report
 */
function generateSummaryReport(results) {
  const totalTests = results.length;
  const passedTests = results.filter(result => result.success).length;
  const failedTests = results.filter(result => !result.success).length;
  const passRate = Math.round((passedTests / totalTests) * 100);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>FinDoc Analyzer Test Summary</title>
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
    .summary-card {
      padding: 15px;
      border-radius: 5px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      margin-bottom: 20px;
      background-color: ${passRate === 100 ? '#d4edda' : passRate >= 80 ? '#fff3cd' : '#f8d7da'};
      color: ${passRate === 100 ? '#155724' : passRate >= 80 ? '#856404' : '#721c24'};
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
    .badge {
      display: inline-block;
      padding: 5px 10px;
      border-radius: 3px;
      margin-right: 10px;
    }
    .badge.success {
      background-color: #d4edda;
      color: #155724;
    }
    .badge.failure {
      background-color: #f8d7da;
      color: #721c24;
    }
  </style>
</head>
<body>
  <h1>FinDoc Analyzer Test Summary</h1>

  <div class="summary-card">
    <h2>Test Results</h2>
    <div class="progress-container">
      <div class="progress-bar ${passRate === 100 ? 'success' : passRate >= 80 ? 'warning' : 'danger'}" style="width: ${passRate}%">
        ${passRate}%
      </div>
    </div>
    <p>${passedTests} of ${totalTests} test suites passed</p>
  </div>

  <h2>Test Suites by Category</h2>

  ${Array.from(new Set(results.map(result => result.category))).map(category => `
    <h3>${category}</h3>
    <table>
      <thead>
        <tr>
          <th>Test Suite</th>
          <th>Status</th>
          <th>Report</th>
        </tr>
      </thead>
      <tbody>
        ${results.filter(result => result.category === category).map(result => `
          <tr>
            <td>${result.name}</td>
            <td>
              <span class="badge ${result.success ? 'success' : 'failure'}">
                ${result.success ? 'Passed' : 'Failed'}
              </span>
            </td>
            <td>
              <a href="${result.reportPath || '#'}" target="_blank">View Report</a>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `).join('')}

  <h2>Next Steps</h2>
  <p>Based on the test results, the following actions are recommended:</p>
  <ul>
    ${failedTests > 0 ? `
      <li>Fix the failing tests</li>
      <li>Re-run the tests to verify the fixes</li>
    ` : `
      <li>Continue to monitor the application for regressions</li>
      <li>Add more tests to increase coverage</li>
    `}
    <li>Update the application code to fix any issues found</li>
    <li>Deploy the updated application</li>
  </ul>
</body>
</html>`;
}

/**
 * Run all tests
 */
async function runAllTests() {
  console.log('Running all tests...');

  const results = [];

  for (const testScript of testScripts) {
    try {
      const result = await runTestScript(testScript.script, testScript.name, testScript.category);
      results.push(result);
    } catch (error) {
      console.error(`Error running ${testScript.name}:`, error);
      results.push({
        script: testScript.script,
        name: testScript.name,
        category: testScript.category,
        success: false,
        error
      });
    }
  }

  // Generate summary report
  const summaryReportPath = path.join(resultsDir, 'summary-report.html');
  const summaryReportHtml = generateSummaryReport(results);

  fs.writeFileSync(summaryReportPath, summaryReportHtml);

  console.log(`All tests completed. Summary report saved to: ${summaryReportPath}`);
  console.log(`Open the summary report in your browser: file://${summaryReportPath}`);

  // Return success if all tests passed
  return results.every(result => result.success);
}

// Run all tests
runAllTests()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Error running tests:', error);
    process.exit(1);
  });
