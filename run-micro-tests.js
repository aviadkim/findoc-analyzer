/**
 * FinDoc Analyzer Micro-Tests Runner
 * 
 * This script runs all the micro-tests for the FinDoc Analyzer application.
 */

const fs = require('fs');
const path = require('path');

// Import test scripts
const test01WebsiteAccess = require('./test-scripts/test-01-website-access');
const test04DocumentUpload = require('./test-scripts/test-04-document-upload');
const test15DocumentChat = require('./test-scripts/test-15-document-chat');

// Configuration
const config = {
  resultsDir: path.join(__dirname, 'test-results'),
  reportPath: path.join(__dirname, 'test-results', 'report.html')
};

// Create results directory if it doesn't exist
fs.mkdirSync(config.resultsDir, { recursive: true });

/**
 * Run all tests
 */
async function runAllTests() {
  console.log('Starting FinDoc Analyzer Micro-Tests...');
  
  const startTime = Date.now();
  const results = [];
  
  // Run Test 1: Website Access
  console.log('\n=== Running Test 1: Website Access ===');
  try {
    const test1Result = await test01WebsiteAccess();
    results.push(test1Result);
    console.log(`Test 1 completed with status: ${test1Result.overallStatus}`);
  } catch (error) {
    console.error('Test 1 failed with error:', error);
    results.push({
      testId: 'Test-01',
      testName: 'Basic Website Access',
      overallStatus: 'Fail',
      issues: [`Unexpected error: ${error.message}`]
    });
  }
  
  // Run Test 4: Document Upload
  console.log('\n=== Running Test 4: Document Upload ===');
  try {
    const test4Result = await test04DocumentUpload();
    results.push(test4Result);
    console.log(`Test 4 completed with status: ${test4Result.overallStatus}`);
  } catch (error) {
    console.error('Test 4 failed with error:', error);
    results.push({
      testId: 'Test-04',
      testName: 'Document Upload',
      overallStatus: 'Fail',
      issues: [`Unexpected error: ${error.message}`]
    });
  }
  
  // Run Test 15: Document Chat
  console.log('\n=== Running Test 15: Document Chat Interface ===');
  try {
    const test15Result = await test15DocumentChat();
    results.push(test15Result);
    console.log(`Test 15 completed with status: ${test15Result.overallStatus}`);
  } catch (error) {
    console.error('Test 15 failed with error:', error);
    results.push({
      testId: 'Test-15',
      testName: 'Document Chat Interface',
      overallStatus: 'Fail',
      issues: [`Unexpected error: ${error.message}`]
    });
  }
  
  // Calculate test duration
  const duration = Date.now() - startTime;
  
  // Generate report
  generateReport(results, duration);
  
  console.log(`\nAll tests completed in ${duration / 1000} seconds`);
  console.log(`Report generated at: ${config.reportPath}`);
  
  return results;
}

/**
 * Generate HTML report
 * @param {Array} results - Test results
 * @param {number} duration - Test duration in milliseconds
 */
function generateReport(results, duration) {
  // Calculate statistics
  const totalTests = results.length;
  const passedTests = results.filter(r => r.overallStatus === 'Pass').length;
  const failedTests = results.filter(r => r.overallStatus === 'Fail').length;
  
  // Collect all issues
  const allIssues = results.flatMap(r => r.issues || []);
  
  // Generate HTML
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>FinDoc Analyzer Micro-Tests Report</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 20px;
            color: #333;
        }
        h1, h2, h3 {
            color: #2c3e50;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
        }
        .summary {
            background-color: #f8f9fa;
            padding: 20px;
            border-radius: 5px;
            margin-bottom: 20px;
        }
        .stats {
            display: flex;
            flex-wrap: wrap;
            gap: 20px;
            margin-bottom: 20px;
        }
        .stat-card {
            background-color: #fff;
            border: 1px solid #ddd;
            border-radius: 5px;
            padding: 15px;
            flex: 1;
            min-width: 200px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .stat-card h3 {
            margin-top: 0;
            border-bottom: 1px solid #eee;
            padding-bottom: 10px;
        }
        .success-rate {
            font-size: 24px;
            font-weight: bold;
            color: #27ae60;
        }
        .time {
            font-size: 18px;
            color: #2980b9;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        th, td {
            border: 1px solid #ddd;
            padding: 12px;
            text-align: left;
        }
        th {
            background-color: #f2f2f2;
        }
        tr:nth-child(even) {
            background-color: #f9f9f9;
        }
        .pass {
            color: #27ae60;
            font-weight: bold;
        }
        .fail {
            color: #e74c3c;
            font-weight: bold;
        }
        .issues {
            background-color: #ffecec;
            padding: 10px;
            border-radius: 5px;
            border-left: 4px solid #e74c3c;
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>FinDoc Analyzer Micro-Tests Report</h1>
        <p>Generated on: ${new Date().toLocaleString()}</p>
        
        <div class="summary">
            <h2>Test Summary</h2>
            <div class="stats">
                <div class="stat-card">
                    <h3>Tests</h3>
                    <div class="success-rate">${passedTests}/${totalTests}</div>
                    <p>${Math.round(passedTests / totalTests * 100)}% Pass Rate</p>
                </div>
                <div class="stat-card">
                    <h3>Duration</h3>
                    <div class="time">${(duration / 1000).toFixed(2)}s</div>
                </div>
                <div class="stat-card">
                    <h3>Issues</h3>
                    <div class="success-rate" style="color: ${allIssues.length > 0 ? '#e74c3c' : '#27ae60'}">${allIssues.length}</div>
                </div>
            </div>
        </div>
        
        <h2>Test Results</h2>
        <table>
            <thead>
                <tr>
                    <th>Test ID</th>
                    <th>Test Name</th>
                    <th>Status</th>
                    <th>Issues</th>
                </tr>
            </thead>
            <tbody>
                ${results.map(result => `
                <tr>
                    <td>${result.testId}</td>
                    <td>${result.testName}</td>
                    <td class="${result.overallStatus === 'Pass' ? 'pass' : 'fail'}">${result.overallStatus}</td>
                    <td>${(result.issues || []).length}</td>
                </tr>
                `).join('')}
            </tbody>
        </table>
        
        ${allIssues.length > 0 ? `
        <div class="issues">
            <h2>Issues Found</h2>
            <ul>
                ${allIssues.map(issue => `<li>${issue}</li>`).join('')}
            </ul>
        </div>
        ` : ''}
        
        <h2>Detailed Results</h2>
        ${results.map(result => `
        <h3>${result.testId}: ${result.testName}</h3>
        <p>Status: <span class="${result.overallStatus === 'Pass' ? 'pass' : 'fail'}">${result.overallStatus}</span></p>
        
        ${(result.steps || []).length > 0 ? `
        <table>
            <thead>
                <tr>
                    <th>Step</th>
                    <th>Description</th>
                    <th>Expected Result</th>
                    <th>Actual Result</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
                ${result.steps.map(step => `
                <tr>
                    <td>${step.step}</td>
                    <td>${step.description}</td>
                    <td>${step.expectedResult}</td>
                    <td>${step.actualResult}</td>
                    <td class="${step.status === 'Pass' ? 'pass' : step.status === 'Fail' ? 'fail' : ''}">${step.status}</td>
                </tr>
                `).join('')}
            </tbody>
        </table>
        ` : ''}
        
        ${(result.issues || []).length > 0 ? `
        <div class="issues">
            <h4>Issues</h4>
            <ul>
                ${result.issues.map(issue => `<li>${issue}</li>`).join('')}
            </ul>
        </div>
        ` : ''}
        
        ${(result.screenshots || []).length > 0 ? `
        <h4>Screenshots</h4>
        <ul>
            ${result.screenshots.map(screenshot => `<li>${screenshot}</li>`).join('')}
        </ul>
        ` : ''}
        `).join('')}
    </div>
</body>
</html>
  `;
  
  // Write report to file
  fs.writeFileSync(config.reportPath, html);
}

// Run all tests if this script is executed directly
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = runAllTests;
