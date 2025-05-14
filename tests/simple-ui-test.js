/**
 * Simple UI Test
 * Tests for the presence of essential UI components
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Create results directory
const resultsDir = path.join(__dirname, 'results');
if (!fs.existsSync(resultsDir)) {
  fs.mkdirSync(resultsDir, { recursive: true });
}

// Test configuration
const config = {
  url: process.env.TEST_URL || 'http://localhost:3002',
  pages: [
    { path: '/', name: 'Dashboard' },
    { path: '/documents-new', name: 'Documents' },
    { path: '/upload', name: 'Upload' },
    { path: '/document-chat', name: 'Document Chat' },
    { path: '/test', name: 'Test' }
  ],
  components: {
    global: [
      { name: 'Sidebar', selector: '.sidebar' },
      { name: 'Show Chat Button', selector: '#show-chat-btn' },
      { name: 'Document Chat Container', selector: '#document-chat-container' }
    ],
    dashboard: [
      { name: 'Recent Documents', selector: '.recent-documents' }
    ],
    documents: [
      { name: 'Document List', selector: '#document-list' },
      { name: 'Document Item', selector: '.document-item' },
      { name: 'Document Actions', selector: '.document-actions' }
    ],
    upload: [
      { name: 'Upload Form', selector: 'form' },
      { name: 'File Input', selector: 'input[type="file"]' },
      { name: 'Process Document Button', selector: '#process-document-btn' },
      { name: 'Progress Container', selector: '#progress-container' }
    ],
    documentChat: [
      { name: 'Document Selector', selector: '.document-selector' },
      { name: 'Chat Messages', selector: '.chat-messages' },
      { name: 'Document Chat Input', selector: '#document-chat-input, #question-input' },
      { name: 'Document Chat Send Button', selector: '#document-send-btn, #send-btn' }
    ],
    test: [
      { name: 'Agent Card', selector: '.agent-card' },
      { name: 'Agent Status Indicator', selector: '.status-indicator' },
      { name: 'Agent Action Button', selector: '.agent-action' }
    ]
  }
};

// Run test for a specific page
async function testPage(browser, page) {
  console.log(`Testing ${page.name} page (${page.path})...`);
  
  const results = {
    page: page.name,
    path: page.path,
    components: {},
    total: 0,
    found: 0,
    missing: 0
  };
  
  // Determine which components to test
  let componentsToTest = [...config.components.global];
  
  if (page.path === '/') {
    componentsToTest = [...componentsToTest, ...config.components.dashboard];
  } else if (page.path.includes('documents-new')) {
    componentsToTest = [...componentsToTest, ...config.components.documents];
  } else if (page.path.includes('upload')) {
    componentsToTest = [...componentsToTest, ...config.components.upload];
  } else if (page.path.includes('document-chat')) {
    componentsToTest = [...componentsToTest, ...config.components.documentChat];
  } else if (page.path.includes('test')) {
    componentsToTest = [...componentsToTest, ...config.components.test];
  }
  
  results.total = componentsToTest.length;
  
  // Open the page
  const browserPage = await browser.newPage();
  try {
    await browserPage.goto(`${config.url}${page.path}`, { waitUntil: 'networkidle2', timeout: 30000 });
    
    // Take a screenshot
    await browserPage.screenshot({ path: path.join(resultsDir, `${page.name.toLowerCase()}.png`) });
    
    // Check each component
    for (const component of componentsToTest) {
      const element = await browserPage.$(component.selector);
      const exists = !!element;
      
      results.components[component.name] = {
        exists,
        selector: component.selector
      };
      
      if (exists) {
        results.found++;
        console.log(`✅ ${component.name} found`);
      } else {
        results.missing++;
        console.log(`❌ ${component.name} not found`);
      }
    }
  } catch (error) {
    console.error(`Error testing ${page.name} page: ${error.message}`);
  } finally {
    await browserPage.close();
  }
  
  return results;
}

// Run all tests
async function runTests() {
  console.log(`Running UI tests for ${config.url}...`);
  
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const results = [];
  
  try {
    for (const page of config.pages) {
      const pageResults = await testPage(browser, page);
      results.push(pageResults);
    }
  } finally {
    await browser.close();
  }
  
  // Generate report
  generateReport(results);
  
  return results;
}

// Generate report
function generateReport(results) {
  // Calculate overall statistics
  const overall = {
    total: 0,
    found: 0,
    missing: 0
  };
  
  results.forEach(result => {
    overall.total += result.total;
    overall.found += result.found;
    overall.missing += result.missing;
  });
  
  // Generate HTML report
  const reportHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>UI Test Results</title>
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
      background-color: ${overall.found / overall.total >= 0.9 ? '#4caf50' : overall.found / overall.total >= 0.7 ? '#ff9800' : '#f44336'};
      width: ${(overall.found / overall.total) * 100}%;
    }
    .page-results {
      background-color: #f8f9fa;
      padding: 20px;
      border-radius: 5px;
      margin-bottom: 20px;
    }
    .component-list {
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
    .recommendations {
      background-color: #fff8e1;
      padding: 15px;
      border-radius: 5px;
      margin-top: 20px;
    }
  </style>
</head>
<body>
  <h1>FinDoc Analyzer UI Test Results</h1>
  
  <div class="summary">
    <h2>Summary</h2>
    <div class="progress-bar">
      <div class="progress">${Math.round((overall.found / overall.total) * 100)}%</div>
    </div>
    <p><strong>Total components:</strong> ${overall.total}</p>
    <p><strong>Found components:</strong> ${overall.found}</p>
    <p><strong>Missing components:</strong> ${overall.missing}</p>
    <p><strong>Pass rate:</strong> ${Math.round((overall.found / overall.total) * 100)}%</p>
  </div>
  
  <h2>Page Results</h2>
  
  ${results.map(result => `
    <div class="page-results">
      <h3>${result.page} Page (${result.path})</h3>
      <p><strong>Components:</strong> ${result.found}/${result.total} (${Math.round((result.found / result.total) * 100)}%)</p>
      
      <div class="component-list">
        ${Object.entries(result.components).map(([name, data]) => `
          <div class="component-item ${data.exists ? 'found' : 'missing'}">
            <span class="status-icon">${data.exists ? '✅' : '❌'}</span>
            <div>
              <strong>${name}</strong>
              <div><small>${data.selector}</small></div>
            </div>
          </div>
        `).join('')}
      </div>
      
      ${result.missing > 0 ? `
        <div class="recommendations">
          <h4>Recommendations</h4>
          <ul>
            ${Object.entries(result.components)
              .filter(([_, data]) => !data.exists)
              .map(([name, data]) => `
                <li>Add the <strong>${name}</strong> component (selector: <code>${data.selector}</code>)</li>
              `).join('')}
          </ul>
        </div>
      ` : ''}
    </div>
  `).join('')}
  
  <h2>Next Steps</h2>
  
  <ol>
    <li>Add the <code>ui-fix.js</code> script to all HTML pages to automatically fix missing components</li>
    <li>Run the tests again to verify that all components are present</li>
    <li>Deploy the fixed UI to both local and cloud environments</li>
  </ol>
</body>
</html>
  `;
  
  // Save HTML report
  fs.writeFileSync(path.join(resultsDir, 'ui-test-report.html'), reportHTML);
  console.log(`Report saved to ${path.join(resultsDir, 'ui-test-report.html')}`);
  
  // Save JSON results
  fs.writeFileSync(path.join(resultsDir, 'ui-test-results.json'), JSON.stringify(results, null, 2));
  console.log(`Results saved to ${path.join(resultsDir, 'ui-test-results.json')}`);
}

// Run the tests
runTests().catch(console.error);
