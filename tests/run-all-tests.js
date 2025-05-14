/**
 * Test Runner
 * Runs all tests and generates a combined report
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Import test modules
const basicUiTest = require('./basic-ui-test');
const documentUploadTest = require('./document-upload-test');
const documentChatTest = require('./document-chat-test');

// Create results directory
const resultsDir = path.join(__dirname, 'results');
if (!fs.existsSync(resultsDir)) {
  fs.mkdirSync(resultsDir, { recursive: true });
}

// Test environments
const environments = [
  { name: 'Local', url: 'http://localhost:3002' },
  { name: 'Deployed', url: 'https://backv2-app-brfi73d4ra-zf.a.run.app' }
];

// Run all tests for a specific environment
async function runTestsForEnvironment(environment) {
  console.log(`\n=== Running tests for ${environment.name} environment (${environment.url}) ===\n`);
  
  // Set environment variable for tests
  process.env.TEST_URL = environment.url;
  
  const results = {
    environment: environment.name,
    url: environment.url,
    timestamp: new Date().toISOString(),
    tests: {}
  };
  
  // Run Basic UI Test
  console.log('\n--- Running Basic UI Test ---\n');
  try {
    results.tests.basicUi = await basicUiTest.runTest();
    console.log(`Basic UI Test completed with ${results.tests.basicUi.passed}/${results.tests.basicUi.total} components found`);
  } catch (error) {
    console.error(`Error running Basic UI Test: ${error.message}`);
    results.tests.basicUi = { error: error.message };
  }
  
  // Run Document Upload Test
  console.log('\n--- Running Document Upload Test ---\n');
  try {
    results.tests.documentUpload = await documentUploadTest.runTest();
    console.log(`Document Upload Test ${results.tests.documentUpload.success ? 'passed' : 'failed'}`);
  } catch (error) {
    console.error(`Error running Document Upload Test: ${error.message}`);
    results.tests.documentUpload = { error: error.message };
  }
  
  // Run Document Chat Test
  console.log('\n--- Running Document Chat Test ---\n');
  try {
    results.tests.documentChat = await documentChatTest.runTest();
    console.log(`Document Chat Test ${results.tests.documentChat.success ? 'passed' : 'failed'}`);
  } catch (error) {
    console.error(`Error running Document Chat Test: ${error.message}`);
    results.tests.documentChat = { error: error.message };
  }
  
  // Save combined results
  fs.writeFileSync(
    path.join(resultsDir, `${environment.name.toLowerCase()}-combined-results.json`),
    JSON.stringify(results, null, 2)
  );
  
  return results;
}

// Generate combined report
function generateCombinedReport(allResults) {
  console.log('\n=== Generating Combined Report ===\n');
  
  // Calculate overall statistics
  const stats = {
    environments: allResults.length,
    uiComponentsTotal: 0,
    uiComponentsFound: 0,
    functionalTestsPassed: 0,
    functionalTestsTotal: 0
  };
  
  allResults.forEach(result => {
    if (result.tests.basicUi && !result.tests.basicUi.error) {
      stats.uiComponentsTotal += result.tests.basicUi.total;
      stats.uiComponentsFound += result.tests.basicUi.passed;
    }
    
    stats.functionalTestsTotal += 2; // Upload and Chat tests
    
    if (result.tests.documentUpload && result.tests.documentUpload.success) {
      stats.functionalTestsPassed += 1;
    }
    
    if (result.tests.documentChat && result.tests.documentChat.success) {
      stats.functionalTestsPassed += 1;
    }
  });
  
  // Generate HTML report
  const htmlReport = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>FinDoc Analyzer Test Results</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
      color: #333;
    }
    h1, h2, h3, h4 {
      color: #2c3e50;
    }
    .summary {
      background-color: #f8f9fa;
      padding: 20px;
      border-radius: 5px;
      margin-bottom: 30px;
    }
    .progress-bar {
      height: 20px;
      background-color: #e9ecef;
      border-radius: 10px;
      margin: 10px 0;
      overflow: hidden;
    }
    .progress {
      height: 100%;
      text-align: center;
      line-height: 20px;
      color: white;
      font-weight: bold;
    }
    .ui-progress {
      background-color: #4caf50;
      width: ${(stats.uiComponentsFound / stats.uiComponentsTotal) * 100}%;
    }
    .functional-progress {
      background-color: #2196f3;
      width: ${(stats.functionalTestsPassed / stats.functionalTestsTotal) * 100}%;
    }
    .environment {
      background-color: #f8f9fa;
      padding: 20px;
      border-radius: 5px;
      margin-bottom: 20px;
    }
    .test-section {
      background-color: white;
      padding: 15px;
      border-radius: 5px;
      margin: 10px 0;
      border-left: 4px solid #ddd;
    }
    .test-section.passed {
      border-left-color: #4caf50;
    }
    .test-section.failed {
      border-left-color: #f44336;
    }
    .test-section.partial {
      border-left-color: #ff9800;
    }
    .component-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 10px;
      margin-top: 10px;
    }
    .component-item {
      padding: 10px;
      border-radius: 5px;
      display: flex;
      align-items: center;
    }
    .component-item.found {
      background-color: #e8f5e9;
    }
    .component-item.missing {
      background-color: #ffebee;
    }
    .status-icon {
      margin-right: 10px;
      font-size: 18px;
    }
    .step-list {
      list-style-type: none;
      padding-left: 0;
    }
    .step-item {
      padding: 8px;
      margin: 5px 0;
      border-radius: 4px;
    }
    .step-item.passed {
      background-color: #e8f5e9;
    }
    .step-item.failed {
      background-color: #ffebee;
    }
    .step-item.skipped {
      background-color: #e3f2fd;
    }
    .recommendations {
      background-color: #fff8e1;
      padding: 15px;
      border-radius: 5px;
      margin-top: 20px;
    }
    .comparison {
      display: flex;
      flex-wrap: wrap;
      gap: 20px;
      margin-top: 20px;
    }
    .comparison-item {
      flex: 1;
      min-width: 300px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    th, td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid #ddd;
    }
    th {
      background-color: #f2f2f2;
    }
    tr:hover {
      background-color: #f5f5f5;
    }
  </style>
</head>
<body>
  <h1>FinDoc Analyzer Test Results</h1>
  <p>Tests run on: ${new Date().toLocaleString()}</p>
  
  <div class="summary">
    <h2>Summary</h2>
    <p><strong>Environments tested:</strong> ${stats.environments}</p>
    
    <h3>UI Components</h3>
    <div class="progress-bar">
      <div class="progress ui-progress">${Math.round((stats.uiComponentsFound / stats.uiComponentsTotal) * 100)}%</div>
    </div>
    <p>${stats.uiComponentsFound} of ${stats.uiComponentsTotal} UI components found across all environments</p>
    
    <h3>Functional Tests</h3>
    <div class="progress-bar">
      <div class="progress functional-progress">${Math.round((stats.functionalTestsPassed / stats.functionalTestsTotal) * 100)}%</div>
    </div>
    <p>${stats.functionalTestsPassed} of ${stats.functionalTestsTotal} functional tests passed across all environments</p>
  </div>
  
  <h2>Environment Comparison</h2>
  
  <table>
    <tr>
      <th>Test</th>
      ${allResults.map(result => `<th>${result.environment}</th>`).join('')}
    </tr>
    <tr>
      <td>UI Components</td>
      ${allResults.map(result => {
        if (result.tests.basicUi && !result.tests.basicUi.error) {
          const passRate = Math.round((result.tests.basicUi.passed / result.tests.basicUi.total) * 100);
          return `<td>${result.tests.basicUi.passed}/${result.tests.basicUi.total} (${passRate}%)</td>`;
        } else {
          return '<td>Error</td>';
        }
      }).join('')}
    </tr>
    <tr>
      <td>Document Upload</td>
      ${allResults.map(result => {
        if (result.tests.documentUpload && !result.tests.documentUpload.error) {
          return `<td>${result.tests.documentUpload.success ? '✅ Passed' : '❌ Failed'}</td>`;
        } else {
          return '<td>Error</td>';
        }
      }).join('')}
    </tr>
    <tr>
      <td>Document Chat</td>
      ${allResults.map(result => {
        if (result.tests.documentChat && !result.tests.documentChat.error) {
          return `<td>${result.tests.documentChat.success ? '✅ Passed' : '❌ Failed'}</td>`;
        } else {
          return '<td>Error</td>';
        }
      }).join('')}
    </tr>
  </table>
  
  ${allResults.map(result => `
  <div class="environment">
    <h2>${result.environment} Environment (${result.url})</h2>
    
    <div class="test-section ${result.tests.basicUi && !result.tests.basicUi.error ? 
      (result.tests.basicUi.passed === result.tests.basicUi.total ? 'passed' : 'partial') : 'failed'}">
      <h3>Basic UI Components</h3>
      ${result.tests.basicUi && !result.tests.basicUi.error ? `
        <p>${result.tests.basicUi.passed} of ${result.tests.basicUi.total} components found (${Math.round((result.tests.basicUi.passed / result.tests.basicUi.total) * 100)}%)</p>
        
        <div class="component-grid">
          ${Object.entries(result.tests.basicUi.components).map(([name, data]) => `
            <div class="component-item ${data.exists ? 'found' : 'missing'}">
              <span class="status-icon">${data.exists ? '✅' : '❌'}</span>
              <span>${name}</span>
            </div>
          `).join('')}
        </div>
      ` : `
        <p>Error running UI test: ${result.tests.basicUi.error}</p>
      `}
    </div>
    
    <div class="test-section ${result.tests.documentUpload && result.tests.documentUpload.success ? 'passed' : 'failed'}">
      <h3>Document Upload Test</h3>
      ${result.tests.documentUpload && !result.tests.documentUpload.error ? `
        <p><strong>Result:</strong> ${result.tests.documentUpload.success ? '✅ Passed' : '❌ Failed'}</p>
        
        <h4>Test Steps</h4>
        <ul class="step-list">
          ${result.tests.documentUpload.steps.map(step => `
            <li class="step-item ${step.status}">
              <strong>${step.name}:</strong> ${
                step.status === 'passed' ? '✅ Passed' : 
                step.status === 'failed' ? `❌ Failed - ${step.error}` : 
                step.status === 'skipped' ? `⏭️ Skipped - ${step.message || ''}` : 
                '⏳ Unknown'
              }
            </li>
          `).join('')}
        </ul>
      ` : `
        <p>Error running document upload test: ${result.tests.documentUpload.error}</p>
      `}
    </div>
    
    <div class="test-section ${result.tests.documentChat && result.tests.documentChat.success ? 'passed' : 'failed'}">
      <h3>Document Chat Test</h3>
      ${result.tests.documentChat && !result.tests.documentChat.error ? `
        <p><strong>Result:</strong> ${result.tests.documentChat.success ? '✅ Passed' : '❌ Failed'}</p>
        
        <h4>Test Steps</h4>
        <ul class="step-list">
          ${result.tests.documentChat.steps.map(step => `
            <li class="step-item ${step.status}">
              <strong>${step.name}:</strong> ${
                step.status === 'passed' ? '✅ Passed' : 
                step.status === 'failed' ? `❌ Failed - ${step.error}` : 
                step.status === 'skipped' ? `⏭️ Skipped - ${step.message || ''}` : 
                '⏳ Unknown'
              }
            </li>
          `).join('')}
        </ul>
      ` : `
        <p>Error running document chat test: ${result.tests.documentChat.error}</p>
      `}
    </div>
  </div>
  `).join('')}
  
  <div class="recommendations">
    <h2>Recommendations</h2>
    
    <h3>UI Components</h3>
    <ul>
      ${(() => {
        const recommendations = [];
        
        // Check each environment for missing UI components
        allResults.forEach(result => {
          if (result.tests.basicUi && !result.tests.basicUi.error) {
            Object.entries(result.tests.basicUi.components)
              .filter(([_, data]) => !data.exists)
              .forEach(([name, data]) => {
                recommendations.push(`<li>Implement the <strong>${name}</strong> component in the ${result.environment} environment (selector: <code>${data.selector}</code>, page: <code>${data.page}</code>)</li>`);
              });
          }
        });
        
        return recommendations.length > 0 ? recommendations.join('') : '<li>All UI components are implemented correctly.</li>';
      })()}
    </ul>
    
    <h3>Document Upload</h3>
    <ul>
      ${(() => {
        const recommendations = [];
        
        // Check each environment for document upload issues
        allResults.forEach(result => {
          if (result.tests.documentUpload && !result.tests.documentUpload.success) {
            result.tests.documentUpload.steps
              .filter(step => step.status === 'failed')
              .forEach(step => {
                recommendations.push(`<li>Fix the <strong>${step.name}</strong> step in the ${result.environment} environment: ${step.error}</li>`);
              });
          }
        });
        
        return recommendations.length > 0 ? recommendations.join('') : '<li>Document upload functionality is working correctly.</li>';
      })()}
    </ul>
    
    <h3>Document Chat</h3>
    <ul>
      ${(() => {
        const recommendations = [];
        
        // Check each environment for document chat issues
        allResults.forEach(result => {
          if (result.tests.documentChat && !result.tests.documentChat.success) {
            result.tests.documentChat.steps
              .filter(step => step.status === 'failed')
              .forEach(step => {
                recommendations.push(`<li>Fix the <strong>${step.name}</strong> step in the ${result.environment} environment: ${step.error}</li>`);
              });
          }
        });
        
        return recommendations.length > 0 ? recommendations.join('') : '<li>Document chat functionality is working correctly.</li>';
      })()}
    </ul>
  </div>
</body>
</html>
  `;
  
  // Save HTML report
  fs.writeFileSync(
    path.join(resultsDir, 'combined-test-report.html'),
    htmlReport
  );
  
  console.log(`Combined report saved to ${path.join(resultsDir, 'combined-test-report.html')}`);
  
  // Try to open the report in the default browser
  try {
    const command = process.platform === 'win32' ? 'start' : process.platform === 'darwin' ? 'open' : 'xdg-open';
    execSync(`${command} "${path.join(resultsDir, 'combined-test-report.html')}"`);
  } catch (error) {
    console.error(`Error opening report: ${error.message}`);
  }
}

// Main function
async function main() {
  console.log('=== Starting FinDoc Analyzer Test Suite ===');
  
  const allResults = [];
  
  // Run tests for each environment
  for (const environment of environments) {
    const results = await runTestsForEnvironment(environment);
    allResults.push(results);
  }
  
  // Generate combined report
  generateCombinedReport(allResults);
  
  console.log('=== Test Suite Completed ===');
}

// Run the main function
main().catch(console.error);
