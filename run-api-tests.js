/**
 * API Test Runner
 * Executes the comprehensive API test suite
 */

const { runApiTests } = require('./tests/api-test-suite');
const fs = require('fs');
const path = require('path');

// Default output directory for test results
const outputDir = path.join(__dirname, 'test-results');

// Ensure the output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Generate output file path
const timestamp = new Date().toISOString().replace(/:/g, '-').replace(/\..+/, '');
const outputFile = path.join(outputDir, `api-test-results-${timestamp}.json`);

// Set environment variables
process.env.OUTPUT_FILE = outputFile;
process.env.API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:8080/api';

// Run the tests
console.log(`Running API tests against ${process.env.API_BASE_URL}`);
console.log(`Results will be saved to ${outputFile}`);

runApiTests()
  .then(results => {
    // Generate HTML report
    const htmlReport = generateHtmlReport(results, timestamp);
    const htmlFile = path.join(outputDir, `api-test-report-${timestamp}.html`);
    fs.writeFileSync(htmlFile, htmlReport);
    
    console.log(`HTML report saved to ${htmlFile}`);
    
    // Exit with appropriate code
    process.exit(results.failed > 0 ? 1 : 0);
  })
  .catch(error => {
    console.error('Error running API tests:', error);
    process.exit(1);
  });

/**
 * Generate an HTML report from test results
 * @param {Object} results - Test results
 * @param {string} timestamp - Test run timestamp
 * @returns {string} - HTML report content
 */
function generateHtmlReport(results, timestamp) {
  const successRate = ((results.passed / results.total) * 100).toFixed(2);
  const dateString = new Date().toLocaleString();
  
  // Build HTML content
  let html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>API Test Report - ${dateString}</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
      color: #333;
    }
    header {
      text-align: center;
      margin-bottom: 30px;
    }
    h1 {
      color: #2c3e50;
    }
    .summary {
      background-color: #f9f9f9;
      padding: 20px;
      border-radius: 5px;
      margin-bottom: 30px;
      display: flex;
      justify-content: space-around;
      flex-wrap: wrap;
    }
    .summary-box {
      text-align: center;
      padding: 15px;
      border-radius: 5px;
      min-width: 150px;
      margin: 10px;
    }
    .total {
      background-color: #3498db;
      color: white;
    }
    .passed {
      background-color: #2ecc71;
      color: white;
    }
    .failed {
      background-color: #e74c3c;
      color: white;
    }
    .success-rate {
      background-color: #f1c40f;
      color: #333;
    }
    .test-category {
      margin-bottom: 30px;
    }
    .test-item {
      margin-bottom: 15px;
      padding: 15px;
      border-radius: 5px;
      background-color: #f9f9f9;
    }
    .test-passed {
      border-left: 5px solid #2ecc71;
    }
    .test-failed {
      border-left: 5px solid #e74c3c;
    }
    .test-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
    }
    .test-name {
      font-weight: bold;
      font-size: 1.1em;
    }
    .status-badge {
      padding: 5px 10px;
      border-radius: 3px;
      font-size: 0.8em;
    }
    .status-passed {
      background-color: #2ecc71;
      color: white;
    }
    .status-failed {
      background-color: #e74c3c;
      color: white;
    }
    .endpoint {
      font-family: monospace;
      background-color: #f1f1f1;
      padding: 5px;
      border-radius: 3px;
      margin-top: 5px;
      display: inline-block;
    }
    .details {
      margin-top: 15px;
      overflow: auto;
    }
    .collapsible {
      background-color: #eee;
      color: #444;
      cursor: pointer;
      padding: 10px;
      width: 100%;
      border: none;
      text-align: left;
      outline: none;
      font-size: 15px;
      margin-top: 10px;
    }
    .content {
      padding: 0 18px;
      display: none;
      overflow: hidden;
      background-color: #f1f1f1;
    }
    pre {
      background-color: #f8f8f8;
      border: 1px solid #ddd;
      border-radius: 3px;
      padding: 10px;
      overflow: auto;
    }
    footer {
      text-align: center;
      margin-top: 30px;
      color: #7f8c8d;
      font-size: 0.9em;
    }
  </style>
</head>
<body>
  <header>
    <h1>FinDoc Analyzer API Test Report</h1>
    <p>Test Run: ${dateString}</p>
  </header>
  
  <div class="summary">
    <div class="summary-box total">
      <h2>Total Tests</h2>
      <p>${results.total}</p>
    </div>
    <div class="summary-box passed">
      <h2>Passed</h2>
      <p>${results.passed}</p>
    </div>
    <div class="summary-box failed">
      <h2>Failed</h2>
      <p>${results.failed}</p>
    </div>
    <div class="summary-box success-rate">
      <h2>Success Rate</h2>
      <p>${successRate}%</p>
    </div>
  </div>
  
  <div class="test-results">
`;

  // Group tests by category
  const categories = {
    'Health Endpoint': [],
    'Document Processing API': [],
    'Securities API': [],
    'Market Data API': [],
    'Document Securities API': [],
    'Update Security API': []
  };
  
  // Add tests to their respective categories
  results.tests.forEach(test => {
    if (test.name === 'Health Endpoint') {
      categories['Health Endpoint'].push(test);
    } else if (test.name.includes('Document Processing')) {
      categories['Document Processing API'].push(test);
    } else if (test.name.includes('Securities') && test.name.includes('Document')) {
      categories['Document Securities API'].push(test);
    } else if (test.name.includes('Securities')) {
      categories['Securities API'].push(test);
    } else if (test.name.includes('Market Data') || test.name.includes('Price')) {
      categories['Market Data API'].push(test);
    } else if (test.name.includes('Update Security')) {
      categories['Update Security API'].push(test);
    }
  });
  
  // Add tests by category
  Object.entries(categories).forEach(([category, tests]) => {
    if (tests.length === 0) return;
    
    html += `
    <div class="test-category">
      <h2>${category}</h2>
    `;
    
    tests.forEach(test => {
      const statusClass = test.passed ? 'test-passed' : 'test-failed';
      const statusBadge = test.passed ? 'status-passed' : 'status-failed';
      const statusText = test.passed ? 'PASSED' : 'FAILED';
      
      html += `
      <div class="test-item ${statusClass}">
        <div class="test-header">
          <div class="test-name">${test.name}</div>
          <div class="status-badge ${statusBadge}">${statusText}</div>
        </div>
        <div class="endpoint">${test.endpoint}</div>
        <div class="details">
      `;
      
      if (test.passed) {
        html += `
          <button class="collapsible">Show Response</button>
          <div class="content">
            <pre>${JSON.stringify(test.response, null, 2)}</pre>
          </div>
        `;
      } else {
        html += `
          <div class="error">
            <p><strong>Error:</strong> ${test.error || 'Unknown error'}</p>
          </div>
        `;
      }
      
      html += `
        </div>
      </div>
      `;
    });
    
    html += `
    </div>
    `;
  });
  
  html += `
  </div>
  
  <footer>
    <p>FinDoc Analyzer API Test Suite - Generated on ${dateString}</p>
  </footer>
  
  <script>
    var coll = document.getElementsByClassName("collapsible");
    var i;
    
    for (i = 0; i < coll.length; i++) {
      coll[i].addEventListener("click", function() {
        this.classList.toggle("active");
        var content = this.nextElementSibling;
        if (content.style.display === "block") {
          content.style.display = "none";
        } else {
          content.style.display = "block";
        }
      });
    }
  </script>
</body>
</html>
  `;
  
  return html;
}