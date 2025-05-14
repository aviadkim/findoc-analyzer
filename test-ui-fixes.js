/**
 * Test UI Fixes
 * This script tests that the UI fixes are working correctly
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Create directories for screenshots and results if they don't exist
const screenshotsDir = path.join(__dirname, 'test-ui-fixes-screenshots');
const resultsDir = path.join(__dirname, 'test-ui-fixes-results');

if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

if (!fs.existsSync(resultsDir)) {
  fs.mkdirSync(resultsDir, { recursive: true });
}

// Test results
const testResults = {
  passed: 0,
  failed: 0,
  total: 0,
  components: {}
};

// URLs to test
const urls = [
  'http://localhost:3002/',
  'http://localhost:3002/document-chat',
  'http://localhost:3002/upload',
  'http://localhost:3002/documents-new',
  'http://localhost:3002/test'
];

// Components to test
const componentsToTest = [
  { name: 'Chat Input', selector: '#document-chat-input', url: '/document-chat' },
  { name: 'Chat Send Button', selector: '#document-send-btn', url: '/document-chat' },
  { name: 'Progress Container', selector: '#progress-container', url: '/upload' },
  { name: 'Document List', selector: '#document-list', url: '/documents-new' },
  { name: 'Document Item', selector: '.document-item', url: '/documents-new' },
  { name: 'Document Actions', selector: '.document-actions', url: '/documents-new' },
  { name: 'Agent Card', selector: '.agent-card', url: '/test' },
  { name: 'Agent Status Indicator', selector: '.status-indicator', url: '/test' },
  { name: 'Agent Action Button', selector: '.agent-action', url: '/test' }
];

// Main function
async function testUiFixes() {
  console.log('Testing UI Fixes...');

  // Launch browser
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 1280, height: 800 },
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  try {
    // Test each component
    for (const component of componentsToTest) {
      console.log(`Testing ${component.name}...`);
      testResults.total++;

      // Navigate to the URL
      try {
        await page.goto(`http://localhost:8080${component.url}`, { waitUntil: 'networkidle2', timeout: 30000 });
      } catch (error) {
        console.error(`Error navigating to ${component.url}: ${error.message}`);
        // Try alternative port
        try {
          await page.goto(`http://localhost:3002${component.url}`, { waitUntil: 'networkidle2', timeout: 30000 });
        } catch (error) {
          console.error(`Error navigating to alternative port for ${component.url}: ${error.message}`);
        }
      }

      // Take a screenshot
      await page.screenshot({ path: path.join(screenshotsDir, `${component.name.toLowerCase().replace(/\s+/g, '-')}.png`), fullPage: true });

      // Check if the component exists
      const componentExists = await page.$(component.selector);

      if (componentExists) {
        console.log(`✅ ${component.name} found`);
        testResults.passed++;
        testResults.components[component.name] = true;
      } else {
        console.log(`❌ ${component.name} not found`);
        testResults.failed++;
        testResults.components[component.name] = false;
      }
    }

    // Generate test results
    const passRate = (testResults.passed / testResults.total) * 100;

    console.log(`
UI Fixes Test Results:
Total components: ${testResults.total}
Found components: ${testResults.passed}
Missing components: ${testResults.failed}
Pass rate: ${passRate.toFixed(2)}%
`);

    // Save test results
    fs.writeFileSync(path.join(resultsDir, 'test-results.json'), JSON.stringify(testResults, null, 2));

    // Generate HTML report
    const htmlReport = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>UI Fixes Test Results</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    h1 {
      text-align: center;
      margin-bottom: 20px;
    }
    .summary {
      background-color: #f5f5f5;
      padding: 20px;
      border-radius: 5px;
      margin-bottom: 20px;
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
      background-color: ${passRate >= 90 ? '#4caf50' : passRate >= 70 ? '#ff9800' : '#f44336'};
      width: ${passRate}%;
      border-radius: 10px;
      text-align: center;
      line-height: 20px;
      color: white;
      font-size: 12px;
      font-weight: bold;
    }
    .components {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 15px;
    }
    .component {
      padding: 15px;
      border-radius: 5px;
      display: flex;
      align-items: center;
    }
    .component.passed {
      background-color: #e8f5e9;
    }
    .component.failed {
      background-color: #ffebee;
    }
    .component-icon {
      margin-right: 10px;
      font-size: 20px;
    }
    .passed .component-icon {
      color: #4caf50;
    }
    .failed .component-icon {
      color: #f44336;
    }
  </style>
</head>
<body>
  <h1>UI Fixes Test Results</h1>

  <div class="summary">
    <div class="progress-bar">
      <div class="progress">${passRate.toFixed(2)}%</div>
    </div>
    <p><strong>Total components:</strong> ${testResults.total}</p>
    <p><strong>Found components:</strong> ${testResults.passed}</p>
    <p><strong>Missing components:</strong> ${testResults.failed}</p>
    <p><strong>Pass rate:</strong> ${passRate.toFixed(2)}%</p>
  </div>

  <h2>Components</h2>

  <div class="components">
    ${Object.entries(testResults.components).map(([name, passed]) => `
      <div class="component ${passed ? 'passed' : 'failed'}">
        <span class="component-icon">${passed ? '✅' : '❌'}</span>
        <span class="component-name">${name}</span>
      </div>
    `).join('')}
  </div>
</body>
</html>
`;

    fs.writeFileSync(path.join(resultsDir, 'test-results.html'), htmlReport);

    console.log(`Test results saved to ${path.join(resultsDir, 'test-results.json')}`);
    console.log(`HTML report saved to ${path.join(resultsDir, 'test-results.html')}`);

  } catch (error) {
    console.error('Error testing UI fixes:', error);
  } finally {
    // Close browser
    await browser.close();
  }
}

// Run the test
testUiFixes();
