/**
 * Cloud UI Components Check
 * This script checks for the presence of UI components in the cloud deployment
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Create results directory
const resultsDir = path.join(__dirname, 'cloud-results');
if (!fs.existsSync(resultsDir)) {
  fs.mkdirSync(resultsDir, { recursive: true });
}

// Create screenshots directory
const screenshotsDir = path.join(resultsDir, 'screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

// Test configuration
const config = {
  url: process.env.TEST_URL || 'https://backv2-app-brfi73d4ra-zf.a.run.app',
  pages: [
    { path: '/', name: 'Dashboard' },
    { path: '/documents-new', name: 'Documents' },
    { path: '/upload', name: 'Upload' },
    { path: '/document-chat', name: 'Document Chat' },
    { path: '/test', name: 'Test' }
  ],
  components: {
    dashboard: [
      { name: 'Recent Documents Section', selector: '.recent-documents' },
      { name: 'Quick Upload Section', selector: '.quick-upload' },
      { name: 'Features Section', selector: '.features' }
    ],
    documents: [
      { name: 'Document List', selector: '#document-list' },
      { name: 'Document Item', selector: '.document-item' },
      { name: 'Document Actions', selector: '.document-actions' }
    ],
    upload: [
      { name: 'Upload Form', selector: 'form' },
      { name: 'File Input', selector: 'input[type="file"]' },
      { name: 'Upload Button', selector: 'button[type="submit"]' },
      { name: 'Progress Container', selector: '#progress-container' }
    ],
    documentChat: [
      { name: 'Document Selector', selector: 'select' },
      { name: 'Chat Messages', selector: '.chat-messages, .message' },
      { name: 'Chat Input', selector: '#document-chat-input, #question-input' },
      { name: 'Send Button', selector: '#document-send-btn, #send-btn, button[type="submit"]' }
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
  let componentsToTest = [];
  
  if (page.path === '/') {
    componentsToTest = config.components.dashboard;
  } else if (page.path.includes('documents-new')) {
    componentsToTest = config.components.documents;
  } else if (page.path.includes('upload')) {
    componentsToTest = config.components.upload;
  } else if (page.path.includes('document-chat')) {
    componentsToTest = config.components.documentChat;
  } else if (page.path.includes('test')) {
    componentsToTest = config.components.test;
  }
  
  results.total = componentsToTest.length;
  
  // Open the page
  const browserPage = await browser.newPage();
  try {
    await browserPage.goto(`${config.url}${page.path}`, { waitUntil: 'networkidle2', timeout: 30000 });
    
    // Take a screenshot
    await browserPage.screenshot({ 
      path: path.join(screenshotsDir, `${page.name.toLowerCase()}.png`),
      fullPage: true
    });
    
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
        
        // Take a screenshot of the component
        try {
          const clip = await browserPage.evaluate((selector) => {
            const element = document.querySelector(selector);
            if (!element) return null;
            
            const { x, y, width, height } = element.getBoundingClientRect();
            return { x, y, width, height };
          }, component.selector);
          
          if (clip && clip.width > 0 && clip.height > 0) {
            await browserPage.screenshot({
              path: path.join(screenshotsDir, `${page.name.toLowerCase()}-${component.name.toLowerCase().replace(/\s+/g, '-')}.png`),
              clip: {
                x: clip.x,
                y: clip.y,
                width: clip.width,
                height: clip.height
              }
            });
          }
        } catch (error) {
          console.error(`Error taking screenshot of ${component.name}: ${error.message}`);
        }
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
  <title>Cloud UI Test Results</title>
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
    .screenshots {
      margin-top: 20px;
    }
    .screenshot {
      margin-bottom: 20px;
    }
    .screenshot img {
      max-width: 100%;
      border: 1px solid #ddd;
      border-radius: 5px;
    }
  </style>
</head>
<body>
  <h1>FinDoc Analyzer Cloud UI Test Results</h1>
  
  <div class="summary">
    <h2>Summary</h2>
    <p><strong>URL:</strong> ${config.url}</p>
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
      
      <div class="screenshots">
        <h4>Screenshots</h4>
        <div class="screenshot">
          <h5>Full Page</h5>
          <img src="../screenshots/${result.page.toLowerCase()}.png" alt="${result.page} Page">
        </div>
        
        ${Object.entries(result.components)
          .filter(([_, data]) => data.exists)
          .map(([name, _]) => `
            <div class="screenshot">
              <h5>${name}</h5>
              <img src="../screenshots/${result.page.toLowerCase()}-${name.toLowerCase().replace(/\s+/g, '-')}.png" alt="${name}">
            </div>
          `).join('')}
      </div>
    </div>
  `).join('')}
  
  <h2>Next Steps</h2>
  
  ${overall.missing > 0 ? `
    <ol>
      <li>Fix the missing UI components</li>
      <li>Run the tests again to verify that all components are present</li>
      <li>Deploy the fixed UI to Google Cloud Run</li>
    </ol>
  ` : `
    <p>All UI components are present. The deployment is successful!</p>
  `}
</body>
</html>
  `;
  
  // Save HTML report
  fs.writeFileSync(path.join(resultsDir, 'cloud-ui-test-report.html'), reportHTML);
  console.log(`Report saved to ${path.join(resultsDir, 'cloud-ui-test-report.html')}`);
  
  // Save JSON results
  fs.writeFileSync(path.join(resultsDir, 'cloud-ui-test-results.json'), JSON.stringify(results, null, 2));
  console.log(`Results saved to ${path.join(resultsDir, 'cloud-ui-test-results.json')}`);
}

// Run the tests
runTests().catch(console.error);
