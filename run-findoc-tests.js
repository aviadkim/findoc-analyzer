/**
 * FinDoc Analyzer Test Runner
 *
 * This script runs all tests for the FinDoc Analyzer application.
 */

const { runHomepageTest } = require('./homepage-test');
const { runUploadTest } = require('./upload-test');
const { runProcessingTest } = require('./processing-test');
const path = require('path');
const fs = require('fs');

// Configuration
const config = {
  resultsDir: path.join(__dirname, 'test-results'),
  timeout: 300000 // 5 minutes
};

// Create results directory if it doesn't exist
if (!fs.existsSync(config.resultsDir)) {
  fs.mkdirSync(config.resultsDir, { recursive: true });
}

/**
 * Run all tests
 */
async function runAllTests() {
  console.log('Running all tests...');
  console.log('Base URL:', require('./micro-test-framework').config.baseUrl);

  const startTime = new Date();
  const results = [];

  try {
    // Run homepage test
    console.log('Running homepage test...');
    try {
      console.log('Starting homepage test at', new Date().toISOString());
      const homepageReportPath = await runHomepageTest();
      console.log('Homepage test completed successfully at', new Date().toISOString());
      console.log('Report saved to:', homepageReportPath);
      results.push({
        name: 'Homepage Test',
        status: 'passed',
        reportPath: homepageReportPath
      });
    } catch (error) {
      console.error('Homepage test failed:', error);
      console.error('Error stack:', error.stack);
      results.push({
        name: 'Homepage Test',
        status: 'failed',
        error: error.message
      });
    }

    // Run upload test
    console.log('Running upload test...');
    try {
      console.log('Starting upload test at', new Date().toISOString());
      const uploadReportPath = await runUploadTest();
      console.log('Upload test completed successfully at', new Date().toISOString());
      console.log('Report saved to:', uploadReportPath);
      results.push({
        name: 'Upload Test',
        status: 'passed',
        reportPath: uploadReportPath
      });
    } catch (error) {
      console.error('Upload test failed:', error);
      console.error('Error stack:', error.stack);
      results.push({
        name: 'Upload Test',
        status: 'failed',
        error: error.message
      });
    }

    // Run processing test
    console.log('Running processing test...');
    try {
      console.log('Starting processing test at', new Date().toISOString());
      const processingReportPath = await runProcessingTest();
      console.log('Processing test completed successfully at', new Date().toISOString());
      console.log('Report saved to:', processingReportPath);
      results.push({
        name: 'Processing Test',
        status: 'passed',
        reportPath: processingReportPath
      });
    } catch (error) {
      console.error('Processing test failed:', error);
      console.error('Error stack:', error.stack);
      results.push({
        name: 'Processing Test',
        status: 'failed',
        error: error.message
      });
    }

    // Generate summary report
    const endTime = new Date();
    const duration = endTime - startTime;

    const summaryReportPath = generateSummaryReport(results, duration);

    console.log(`All tests completed in ${duration / 1000} seconds`);
    console.log(`Summary report saved to: ${summaryReportPath}`);

    return summaryReportPath;
  } catch (error) {
    console.error('Error running tests:', error);
    throw error;
  }
}

/**
 * Generate a summary report
 * @param {Array<object>} results - Test results
 * @param {number} duration - Test duration in milliseconds
 * @returns {string} Summary report path
 */
function generateSummaryReport(results, duration) {
  const summaryReportPath = path.join(config.resultsDir, 'summary-report.html');

  // Calculate statistics
  const totalTests = results.length;
  const passedTests = results.filter(result => result.status === 'passed').length;
  const failedTests = results.filter(result => result.status === 'failed').length;
  const passRate = Math.round((passedTests / totalTests) * 100);

  const summaryReportHtml = `<!DOCTYPE html>
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
    .summary {
      background-color: ${passRate > 80 ? '#d4edda' : passRate > 50 ? '#fff3cd' : '#f8d7da'};
      color: ${passRate > 80 ? '#155724' : passRate > 50 ? '#856404' : '#721c24'};
      padding: 15px;
      border-radius: 5px;
      margin-bottom: 20px;
    }
    .test-result {
      margin-bottom: 20px;
      padding: 15px;
      border-radius: 5px;
      border-left: 5px solid #ddd;
      background-color: #f8f9fa;
    }
    .test-result.passed {
      border-left-color: #28a745;
    }
    .test-result.failed {
      border-left-color: #dc3545;
    }
    .badge {
      display: inline-block;
      padding: 3px 8px;
      border-radius: 3px;
      font-size: 12px;
      font-weight: bold;
    }
    .badge.passed {
      background-color: #d4edda;
      color: #155724;
    }
    .badge.failed {
      background-color: #f8d7da;
      color: #721c24;
    }
    .progress-bar {
      width: 100%;
      background-color: #e9ecef;
      border-radius: 5px;
      margin-bottom: 10px;
    }
    .progress {
      height: 20px;
      border-radius: 5px;
      background-color: ${passRate > 80 ? '#28a745' : passRate > 50 ? '#ffc107' : '#dc3545'};
      width: ${passRate}%;
      text-align: center;
      line-height: 20px;
      color: white;
    }
    .error {
      background-color: #f8d7da;
      color: #721c24;
      padding: 10px;
      border-radius: 5px;
      margin-top: 10px;
      font-family: monospace;
      white-space: pre-wrap;
    }
    .issues {
      margin-top: 20px;
    }
    .issue {
      margin-bottom: 10px;
      padding: 10px;
      border-radius: 5px;
      background-color: #f8f9fa;
      border-left: 5px solid #dc3545;
    }
    .recommendations {
      margin-top: 20px;
    }
    .recommendation {
      margin-bottom: 10px;
      padding: 10px;
      border-radius: 5px;
      background-color: #f8f9fa;
      border-left: 5px solid #28a745;
    }
  </style>
</head>
<body>
  <h1>FinDoc Analyzer Test Summary</h1>

  <div class="summary">
    <h2>Summary</h2>
    <div class="progress-bar">
      <div class="progress">${passRate}%</div>
    </div>
    <p><strong>${passedTests}</strong> of <strong>${totalTests}</strong> tests passed</p>
    <p>Total duration: <strong>${Math.round(duration / 1000)}</strong> seconds</p>
  </div>

  <h2>Test Results</h2>

  ${results.map(result => `
    <div class="test-result ${result.status}">
      <h3>${result.name} <span class="badge ${result.status}">${result.status}</span></h3>
      ${result.reportPath ? `<p><a href="${path.relative(config.resultsDir, result.reportPath)}" target="_blank">View detailed report</a></p>` : ''}
      ${result.error ? `<div class="error">${result.error}</div>` : ''}
    </div>
  `).join('')}

  <h2>Identified Issues</h2>

  <div class="issues">
    <div class="issue">
      <h3>Authentication Issues</h3>
      <p>The application returns 401 Unauthorized errors when attempting to process uploaded documents. This indicates that the backend API requires authentication, but the frontend is not providing the necessary authentication credentials.</p>
    </div>

    <div class="issue">
      <h3>Missing Mock API</h3>
      <p>The mock API implementation is not working correctly. The application is still trying to use the real API endpoints, which require authentication.</p>
    </div>

    <div class="issue">
      <h3>Incomplete Document Processing</h3>
      <p>The document processing functionality is not fully implemented. The application does not extract text, tables, or metadata from uploaded documents.</p>
    </div>

    <div class="issue">
      <h3>Missing Q&A Functionality</h3>
      <p>The Q&A functionality for asking questions about processed documents is not fully implemented.</p>
    </div>
  </div>

  <h2>Recommendations</h2>

  <div class="recommendations">
    <div class="recommendation">
      <h3>Fix Authentication Issues</h3>
      <p>Implement proper authentication for the API endpoints. This could involve using API keys, OAuth tokens, or session cookies.</p>
    </div>

    <div class="recommendation">
      <h3>Implement Mock API</h3>
      <p>Implement a mock API that simulates the behavior of the real API without requiring authentication. This will allow for testing the application without having to set up a real backend.</p>
    </div>

    <div class="recommendation">
      <h3>Complete Document Processing</h3>
      <p>Implement the document processing functionality to extract text, tables, and metadata from uploaded documents. This could involve using libraries like pdf.js, pdfminer, or Apache Tika.</p>
    </div>

    <div class="recommendation">
      <h3>Implement Q&A Functionality</h3>
      <p>Implement the Q&A functionality for asking questions about processed documents. This could involve using natural language processing libraries or services like OpenAI's GPT.</p>
    </div>
  </div>
</body>
</html>`;

  fs.writeFileSync(summaryReportPath, summaryReportHtml);

  return summaryReportPath;
}

// Run the tests if this script is executed directly
if (require.main === module) {
  runAllTests()
    .then(summaryReportPath => {
      console.log(`All tests completed. Summary report saved to: ${summaryReportPath}`);
      process.exit(0);
    })
    .catch(error => {
      console.error('Error running tests:', error);
      process.exit(1);
    });
}

module.exports = {
  runAllTests
};
