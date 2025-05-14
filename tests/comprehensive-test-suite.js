/**
 * Comprehensive Test Suite for FinDoc Analyzer
 * This script runs a comprehensive set of tests on both local and deployed versions
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const config = {
  local: {
    url: 'http://localhost:3002',
    name: 'Local'
  },
  deployed: {
    url: 'https://backv2-app-brfi73d4ra-zf.a.run.app',
    name: 'Deployed'
  },
  testResultsDir: path.join(__dirname, 'test-results'),
  screenshotsDir: path.join(__dirname, 'test-screenshots'),
  pdfTestFile: path.join(__dirname, '../test-files/sample.pdf')
};

// Create directories if they don't exist
if (!fs.existsSync(config.testResultsDir)) {
  fs.mkdirSync(config.testResultsDir, { recursive: true });
}

if (!fs.existsSync(config.screenshotsDir)) {
  fs.mkdirSync(config.screenshotsDir, { recursive: true });
}

// Test categories
const testCategories = [
  {
    name: 'UI Components',
    tests: [
      { name: 'Document Chat Input', path: '/document-chat', selector: '#document-chat-input' },
      { name: 'Document Chat Send Button', path: '/document-chat', selector: '#document-send-btn' },
      { name: 'Progress Container', path: '/upload', selector: '#progress-container' },
      { name: 'Document List', path: '/documents-new', selector: '#document-list' },
      { name: 'Document Item', path: '/documents-new', selector: '.document-item' },
      { name: 'Document Actions', path: '/documents-new', selector: '.document-actions' },
      { name: 'Agent Card', path: '/test', selector: '.agent-card' },
      { name: 'Agent Status Indicator', path: '/test', selector: '.status-indicator' },
      { name: 'Agent Action Button', path: '/test', selector: '.agent-action' },
      { name: 'Analytics Dashboard', path: '/analytics-new', selector: '.analytics-dashboard' },
      { name: 'Analytics Chart', path: '/analytics-new', selector: '.analytics-chart' },
      { name: 'Analytics Filters', path: '/analytics-new', selector: '.analytics-filters' }
    ]
  },
  {
    name: 'Functionality',
    tests: [
      { 
        name: 'File Upload', 
        path: '/upload', 
        test: async (page) => {
          try {
            // Wait for file input
            await page.waitForSelector('input[type="file"]', { timeout: 5000 });
            
            // Set file input
            const inputFile = await page.$('input[type="file"]');
            await inputFile.uploadFile(config.pdfTestFile);
            
            // Click upload button
            await page.click('button[type="submit"]');
            
            // Wait for progress indicator or success message
            await page.waitForSelector('#progress-container, .success-message', { timeout: 10000 });
            
            return { success: true, message: 'File upload successful' };
          } catch (error) {
            return { success: false, message: `File upload failed: ${error.message}` };
          }
        }
      },
      { 
        name: 'Document Chat', 
        path: '/document-chat', 
        test: async (page) => {
          try {
            // Wait for document select
            await page.waitForSelector('select', { timeout: 5000 });
            
            // Select first document if available
            const hasOptions = await page.evaluate(() => {
              const select = document.querySelector('select');
              return select && select.options.length > 1;
            });
            
            if (hasOptions) {
              await page.select('select', '1');
              
              // Type a question
              await page.waitForSelector('#document-chat-input', { timeout: 5000 });
              await page.type('#document-chat-input', 'What is in this document?');
              
              // Click send button
              await page.click('#document-send-btn');
              
              // Wait for response
              await page.waitForFunction(() => {
                const messages = document.querySelectorAll('.message');
                return messages.length >= 2;
              }, { timeout: 10000 });
              
              return { success: true, message: 'Document chat successful' };
            } else {
              return { success: false, message: 'No documents available for chat' };
            }
          } catch (error) {
            return { success: false, message: `Document chat failed: ${error.message}` };
          }
        }
      },
      { 
        name: 'Agent Functionality', 
        path: '/test', 
        test: async (page) => {
          try {
            // Wait for agent cards
            await page.waitForSelector('.agent-card', { timeout: 5000 });
            
            // Click on agent action button
            const actionButtons = await page.$$('.agent-action');
            if (actionButtons.length > 0) {
              await actionButtons[0].click();
              
              // Wait for alert or response
              await page.on('dialog', async dialog => {
                await dialog.accept();
              });
              
              return { success: true, message: 'Agent action successful' };
            } else {
              return { success: false, message: 'No agent action buttons found' };
            }
          } catch (error) {
            return { success: false, message: `Agent functionality failed: ${error.message}` };
          }
        }
      }
    ]
  }
];

// Test results
const testResults = {
  local: {
    passed: 0,
    failed: 0,
    total: 0,
    components: {},
    functionality: {}
  },
  deployed: {
    passed: 0,
    failed: 0,
    total: 0,
    components: {},
    functionality: {}
  }
};

// Run tests for a specific environment
async function runTests(environment) {
  console.log(`Running tests for ${environment.name} environment (${environment.url})...`);
  
  // Launch browser
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  try {
    // Test UI Components
    console.log(`Testing UI Components for ${environment.name}...`);
    for (const test of testCategories[0].tests) {
      console.log(`Testing ${test.name}...`);
      testResults[environment.name.toLowerCase()].total++;
      
      try {
        // Navigate to the URL
        await page.goto(`${environment.url}${test.path}`, { waitUntil: 'networkidle2', timeout: 30000 });
        
        // Take a screenshot
        await page.screenshot({ 
          path: path.join(config.screenshotsDir, `${environment.name.toLowerCase()}-${test.name.toLowerCase().replace(/\s+/g, '-')}.png`), 
          fullPage: true 
        });
        
        // Check if the component exists
        const componentExists = await page.$(test.selector);
        
        if (componentExists) {
          console.log(`✅ ${test.name} found`);
          testResults[environment.name.toLowerCase()].passed++;
          testResults[environment.name.toLowerCase()].components[test.name] = true;
        } else {
          console.log(`❌ ${test.name} not found`);
          testResults[environment.name.toLowerCase()].failed++;
          testResults[environment.name.toLowerCase()].components[test.name] = false;
        }
      } catch (error) {
        console.error(`Error testing ${test.name}: ${error.message}`);
        testResults[environment.name.toLowerCase()].failed++;
        testResults[environment.name.toLowerCase()].components[test.name] = false;
      }
    }
    
    // Test Functionality
    console.log(`Testing Functionality for ${environment.name}...`);
    for (const test of testCategories[1].tests) {
      console.log(`Testing ${test.name}...`);
      testResults[environment.name.toLowerCase()].total++;
      
      try {
        // Navigate to the URL
        await page.goto(`${environment.url}${test.path}`, { waitUntil: 'networkidle2', timeout: 30000 });
        
        // Take a screenshot before test
        await page.screenshot({ 
          path: path.join(config.screenshotsDir, `${environment.name.toLowerCase()}-${test.name.toLowerCase().replace(/\s+/g, '-')}-before.png`), 
          fullPage: true 
        });
        
        // Run the test
        const result = await test.test(page);
        
        // Take a screenshot after test
        await page.screenshot({ 
          path: path.join(config.screenshotsDir, `${environment.name.toLowerCase()}-${test.name.toLowerCase().replace(/\s+/g, '-')}-after.png`), 
          fullPage: true 
        });
        
        if (result.success) {
          console.log(`✅ ${test.name} successful`);
          testResults[environment.name.toLowerCase()].passed++;
          testResults[environment.name.toLowerCase()].functionality[test.name] = true;
        } else {
          console.log(`❌ ${test.name} failed: ${result.message}`);
          testResults[environment.name.toLowerCase()].failed++;
          testResults[environment.name.toLowerCase()].functionality[test.name] = false;
        }
      } catch (error) {
        console.error(`Error testing ${test.name}: ${error.message}`);
        testResults[environment.name.toLowerCase()].failed++;
        testResults[environment.name.toLowerCase()].functionality[test.name] = false;
      }
    }
  } catch (error) {
    console.error(`Error running tests for ${environment.name}: ${error.message}`);
  } finally {
    // Close browser
    await browser.close();
  }
}

// Generate test report
function generateTestReport() {
  console.log('Generating test report...');
  
  // Calculate pass rates
  const localPassRate = (testResults.local.passed / testResults.local.total) * 100;
  const deployedPassRate = (testResults.deployed.passed / testResults.deployed.total) * 100;
  
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
    }
    h1, h2, h3 {
      color: #333;
    }
    .summary {
      display: flex;
      justify-content: space-between;
      margin-bottom: 30px;
    }
    .summary-card {
      background-color: #f5f5f5;
      padding: 20px;
      border-radius: 5px;
      width: 48%;
    }
    .progress-bar {
      height: 20px;
      background-color: #e0e0e0;
      border-radius: 10px;
      margin-bottom: 20px;
      overflow: hidden;
    }
    .progress {
      height: 100%;
      border-radius: 10px;
      text-align: center;
      line-height: 20px;
      color: white;
      font-size: 12px;
      font-weight: bold;
    }
    .local-progress {
      background-color: ${localPassRate >= 90 ? '#4caf50' : localPassRate >= 70 ? '#ff9800' : '#f44336'};
      width: ${localPassRate}%;
    }
    .deployed-progress {
      background-color: ${deployedPassRate >= 90 ? '#4caf50' : deployedPassRate >= 70 ? '#ff9800' : '#f44336'};
      width: ${deployedPassRate}%;
    }
    .test-results {
      display: flex;
      flex-wrap: wrap;
      gap: 20px;
    }
    .test-category {
      background-color: #f9f9f9;
      padding: 20px;
      border-radius: 5px;
      width: 100%;
      margin-bottom: 20px;
    }
    .test-items {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 15px;
      margin-top: 15px;
    }
    .test-item {
      padding: 15px;
      border-radius: 5px;
      display: flex;
      align-items: center;
    }
    .test-item.passed {
      background-color: #e8f5e9;
    }
    .test-item.failed {
      background-color: #ffebee;
    }
    .test-icon {
      margin-right: 10px;
      font-size: 20px;
    }
    .passed .test-icon {
      color: #4caf50;
    }
    .failed .test-icon {
      color: #f44336;
    }
    .comparison {
      display: flex;
      flex-wrap: wrap;
      gap: 20px;
      margin-top: 30px;
    }
    .comparison-item {
      background-color: #f9f9f9;
      padding: 20px;
      border-radius: 5px;
      width: 100%;
    }
    .comparison-title {
      margin-top: 0;
      margin-bottom: 15px;
    }
    .comparison-content {
      display: flex;
      justify-content: space-between;
      gap: 20px;
    }
    .comparison-column {
      width: 48%;
    }
    .comparison-column img {
      max-width: 100%;
      border: 1px solid #ddd;
      border-radius: 5px;
    }
    .comparison-column h4 {
      margin-top: 0;
      margin-bottom: 10px;
    }
    .issues-list {
      margin-top: 30px;
    }
    .issue {
      background-color: #fff3e0;
      padding: 15px;
      border-radius: 5px;
      margin-bottom: 15px;
    }
    .issue h4 {
      margin-top: 0;
      margin-bottom: 10px;
      color: #e65100;
    }
    .issue p {
      margin: 0 0 10px 0;
    }
    .issue-actions {
      margin-top: 10px;
    }
    .issue-actions button {
      background-color: #ff9800;
      color: white;
      border: none;
      padding: 8px 12px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      margin-right: 10px;
    }
    .issue-actions button:hover {
      background-color: #f57c00;
    }
  </style>
</head>
<body>
  <h1>FinDoc Analyzer Test Results</h1>
  
  <div class="summary">
    <div class="summary-card">
      <h2>Local Environment</h2>
      <div class="progress-bar">
        <div class="progress local-progress">${localPassRate.toFixed(2)}%</div>
      </div>
      <p><strong>Total tests:</strong> ${testResults.local.total}</p>
      <p><strong>Passed tests:</strong> ${testResults.local.passed}</p>
      <p><strong>Failed tests:</strong> ${testResults.local.failed}</p>
      <p><strong>Pass rate:</strong> ${localPassRate.toFixed(2)}%</p>
    </div>
    
    <div class="summary-card">
      <h2>Deployed Environment</h2>
      <div class="progress-bar">
        <div class="progress deployed-progress">${deployedPassRate.toFixed(2)}%</div>
      </div>
      <p><strong>Total tests:</strong> ${testResults.deployed.total}</p>
      <p><strong>Passed tests:</strong> ${testResults.deployed.passed}</p>
      <p><strong>Failed tests:</strong> ${testResults.deployed.failed}</p>
      <p><strong>Pass rate:</strong> ${deployedPassRate.toFixed(2)}%</p>
    </div>
  </div>
  
  <h2>Test Results</h2>
  
  <div class="test-results">
    <div class="test-category">
      <h3>UI Components</h3>
      
      <div class="test-items">
        ${testCategories[0].tests.map(test => `
          <div class="test-item ${testResults.local.components[test.name] ? 'passed' : 'failed'}">
            <span class="test-icon">${testResults.local.components[test.name] ? '✅' : '❌'}</span>
            <span class="test-name">${test.name} (Local)</span>
          </div>
          
          <div class="test-item ${testResults.deployed.components[test.name] ? 'passed' : 'failed'}">
            <span class="test-icon">${testResults.deployed.components[test.name] ? '✅' : '❌'}</span>
            <span class="test-name">${test.name} (Deployed)</span>
          </div>
        `).join('')}
      </div>
    </div>
    
    <div class="test-category">
      <h3>Functionality</h3>
      
      <div class="test-items">
        ${testCategories[1].tests.map(test => `
          <div class="test-item ${testResults.local.functionality[test.name] ? 'passed' : 'failed'}">
            <span class="test-icon">${testResults.local.functionality[test.name] ? '✅' : '❌'}</span>
            <span class="test-name">${test.name} (Local)</span>
          </div>
          
          <div class="test-item ${testResults.deployed.functionality[test.name] ? 'passed' : 'failed'}">
            <span class="test-icon">${testResults.deployed.functionality[test.name] ? '✅' : '❌'}</span>
            <span class="test-name">${test.name} (Deployed)</span>
          </div>
        `).join('')}
      </div>
    </div>
  </div>
  
  <h2>Component Comparisons</h2>
  
  <div class="comparison">
    ${testCategories[0].tests.map(test => `
      <div class="comparison-item">
        <h3 class="comparison-title">${test.name}</h3>
        
        <div class="comparison-content">
          <div class="comparison-column">
            <h4>Local</h4>
            <img src="../test-screenshots/local-${test.name.toLowerCase().replace(/\s+/g, '-')}.png" alt="${test.name} (Local)">
            <p><strong>Status:</strong> ${testResults.local.components[test.name] ? 'Found' : 'Not Found'}</p>
          </div>
          
          <div class="comparison-column">
            <h4>Deployed</h4>
            <img src="../test-screenshots/deployed-${test.name.toLowerCase().replace(/\s+/g, '-')}.png" alt="${test.name} (Deployed)">
            <p><strong>Status:</strong> ${testResults.deployed.components[test.name] ? 'Found' : 'Not Found'}</p>
          </div>
        </div>
      </div>
    `).join('')}
  </div>
  
  <h2>Functionality Comparisons</h2>
  
  <div class="comparison">
    ${testCategories[1].tests.map(test => `
      <div class="comparison-item">
        <h3 class="comparison-title">${test.name}</h3>
        
        <div class="comparison-content">
          <div class="comparison-column">
            <h4>Local (Before)</h4>
            <img src="../test-screenshots/local-${test.name.toLowerCase().replace(/\s+/g, '-')}-before.png" alt="${test.name} Before (Local)">
            <h4>Local (After)</h4>
            <img src="../test-screenshots/local-${test.name.toLowerCase().replace(/\s+/g, '-')}-after.png" alt="${test.name} After (Local)">
            <p><strong>Status:</strong> ${testResults.local.functionality[test.name] ? 'Working' : 'Not Working'}</p>
          </div>
          
          <div class="comparison-column">
            <h4>Deployed (Before)</h4>
            <img src="../test-screenshots/deployed-${test.name.toLowerCase().replace(/\s+/g, '-')}-before.png" alt="${test.name} Before (Deployed)">
            <h4>Deployed (After)</h4>
            <img src="../test-screenshots/deployed-${test.name.toLowerCase().replace(/\s+/g, '-')}-after.png" alt="${test.name} After (Deployed)">
            <p><strong>Status:</strong> ${testResults.deployed.functionality[test.name] ? 'Working' : 'Not Working'}</p>
          </div>
        </div>
      </div>
    `).join('')}
  </div>
  
  <h2>Issues and Recommendations</h2>
  
  <div class="issues-list">
    ${(() => {
      const issues = [];
      
      // Check for UI component issues
      testCategories[0].tests.forEach(test => {
        if (!testResults.local.components[test.name] || !testResults.deployed.components[test.name]) {
          issues.push(`
            <div class="issue">
              <h4>${test.name} Component Issue</h4>
              <p><strong>Local:</strong> ${testResults.local.components[test.name] ? 'Found' : 'Not Found'}</p>
              <p><strong>Deployed:</strong> ${testResults.deployed.components[test.name] ? 'Found' : 'Not Found'}</p>
              <p><strong>Recommendation:</strong> ${
                !testResults.local.components[test.name] && !testResults.deployed.components[test.name] ?
                `Implement the ${test.name} component in both local and deployed environments.` :
                !testResults.local.components[test.name] ?
                `Implement the ${test.name} component in the local environment to match the deployed environment.` :
                `Deploy the ${test.name} component to the deployed environment to match the local environment.`
              }</p>
            </div>
          `);
        }
      });
      
      // Check for functionality issues
      testCategories[1].tests.forEach(test => {
        if (!testResults.local.functionality[test.name] || !testResults.deployed.functionality[test.name]) {
          issues.push(`
            <div class="issue">
              <h4>${test.name} Functionality Issue</h4>
              <p><strong>Local:</strong> ${testResults.local.functionality[test.name] ? 'Working' : 'Not Working'}</p>
              <p><strong>Deployed:</strong> ${testResults.deployed.functionality[test.name] ? 'Working' : 'Not Working'}</p>
              <p><strong>Recommendation:</strong> ${
                !testResults.local.functionality[test.name] && !testResults.deployed.functionality[test.name] ?
                `Fix the ${test.name} functionality in both local and deployed environments.` :
                !testResults.local.functionality[test.name] ?
                `Fix the ${test.name} functionality in the local environment to match the deployed environment.` :
                `Fix the ${test.name} functionality in the deployed environment to match the local environment.`
              }</p>
            </div>
          `);
        }
      });
      
      return issues.length > 0 ? issues.join('') : '<p>No issues found.</p>';
    })()}
  </div>
</body>
</html>
`;
  
  // Write HTML report to file
  fs.writeFileSync(path.join(config.testResultsDir, 'test-report.html'), htmlReport);
  
  // Write JSON results to file
  fs.writeFileSync(path.join(config.testResultsDir, 'test-results.json'), JSON.stringify(testResults, null, 2));
  
  console.log(`Test report generated at ${path.join(config.testResultsDir, 'test-report.html')}`);
  
  // Open the report in the default browser
  try {
    const command = process.platform === 'win32' ? 'start' : process.platform === 'darwin' ? 'open' : 'xdg-open';
    execSync(`${command} "${path.join(config.testResultsDir, 'test-report.html')}"`);
  } catch (error) {
    console.error(`Error opening test report: ${error.message}`);
  }
}

// Main function
async function main() {
  console.log('Starting comprehensive test suite...');
  
  // Run tests for local environment
  await runTests(config.local);
  
  // Run tests for deployed environment
  await runTests(config.deployed);
  
  // Generate test report
  generateTestReport();
  
  console.log('Comprehensive test suite completed.');
}

// Run the main function
main();
