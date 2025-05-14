/**
 * Google App Engine Deployment Test
 * This script tests the deployed application for critical UI components
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Create screenshots directory
const screenshotsDir = path.join(__dirname, 'test-screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

// Get deployed URL from command line or use default
const deployedUrl = process.argv[2] || 'https://backv2-app-brfi73d4ra-zf.a.run.app';

console.log(`Testing deployed application at: ${deployedUrl}`);

// Define pages to test
const pagesToTest = [
  {
    name: 'Home',
    path: '/',
    elements: [
      { selector: '#process-document-btn', name: 'Process Button' },
      { selector: '#show-chat-btn', name: 'Chat Button' }
    ]
  },
  {
    name: 'Documents',
    path: '/documents-new',
    elements: [
      { selector: '#process-document-btn', name: 'Process Button' },
      { selector: '#show-chat-btn', name: 'Chat Button' }
    ]
  },
  {
    name: 'Upload',
    path: '/upload',
    elements: [
      { selector: '#process-document-btn', name: 'Process Button' },
      { selector: '#show-chat-btn', name: 'Chat Button' },
      { selector: 'form, input[type="file"]', name: 'Upload Form' }
    ]
  },
  {
    name: 'DocumentChat',
    path: '/document-chat',
    elements: [
      { selector: '#document-chat-container', name: 'Chat Container' },
      { selector: '#question-input', name: 'Question Input' },
      { selector: '#send-btn, #document-send-btn', name: 'Send Button' }
    ]
  },
  {
    name: 'Test',
    path: '/test',
    elements: [
      { selector: '#process-document-btn', name: 'Process Button' },
      { selector: '#show-chat-btn', name: 'Chat Button' },
      { selector: '.agent-card', name: 'Agent Cards' }
    ]
  }
];

// Run the tests
(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  // Initialize results
  const results = {
    url: deployedUrl,
    timestamp: new Date().toISOString(),
    pages: [],
    overall: {
      total: 0,
      found: 0,
      missing: 0
    }
  };

  // Test each page
  for (const pageInfo of pagesToTest) {
    console.log(`\nTesting ${pageInfo.name} page...`);
    
    const pageUrl = `${deployedUrl}${pageInfo.path}`;
    console.log(`URL: ${pageUrl}`);
    
    const pageResult = {
      name: pageInfo.name,
      path: pageInfo.path,
      elements: [],
      found: 0,
      missing: 0
    };
    
    try {
      // Navigate to page
      await page.goto(pageUrl, { waitUntil: 'networkidle2', timeout: 30000 });
      
      // Take screenshot
      const screenshotPath = path.join(screenshotsDir, `${pageInfo.name.toLowerCase()}.png`);
      await page.screenshot({ path: screenshotPath, fullPage: true });
      console.log(`📸 Screenshot saved to ${screenshotPath}`);
      
      // Wait a bit for any JavaScript to run
      await page.waitForTimeout(2000);
      
      // Test each element
      for (const element of pageInfo.elements) {
        results.overall.total++;
        
        // Handle multiple selectors (comma-separated)
        const selectors = element.selector.split(',').map(s => s.trim());
        let found = false;
        
        for (const selector of selectors) {
          try {
            // Check if element exists
            const elementHandle = await page.$(selector);
            if (elementHandle) {
              found = true;
              break;
            }
          } catch (error) {
            // Continue to next selector
          }
        }
        
        if (found) {
          console.log(`✅ Found: ${element.name}`);
          pageResult.found++;
          results.overall.found++;
          pageResult.elements.push({
            name: element.name,
            selector: element.selector,
            found: true
          });
        } else {
          console.log(`❌ Missing: ${element.name}`);
          pageResult.missing++;
          results.overall.missing++;
          pageResult.elements.push({
            name: element.name,
            selector: element.selector,
            found: false
          });
        }
      }
      
      // Add page result
      results.pages.push(pageResult);
      
    } catch (error) {
      console.error(`Error testing ${pageInfo.name} page:`, error.message);
      results.pages.push({
        name: pageInfo.name,
        path: pageInfo.path,
        error: error.message
      });
    }
  }
  
  // Save results
  const resultsPath = path.join(__dirname, 'test-gae-results.json');
  fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
  console.log(`\n📊 Test results saved to ${resultsPath}`);
  
  // Generate HTML report
  generateHtmlReport(results);
  
  // Print summary
  console.log('\n📝 Test Summary:');
  console.log(`Total elements: ${results.overall.total}`);
  console.log(`Found: ${results.overall.found}`);
  console.log(`Missing: ${results.overall.missing}`);
  
  const passRate = results.overall.total > 0 
    ? (results.overall.found / results.overall.total) * 100 
    : 0;
  
  console.log(`Pass rate: ${passRate.toFixed(2)}%`);
  
  // Close browser
  await browser.close();
  
  // Exit with code based on pass rate
  process.exit(passRate >= 80 ? 0 : 1);
})().catch(error => {
  console.error('Test failed with error:', error);
  process.exit(1);
});

/**
 * Generate HTML report from test results
 */
function generateHtmlReport(results) {
  const passRate = results.overall.total > 0 
    ? (results.overall.found / results.overall.total) * 100 
    : 0;
  
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Google App Engine Deployment Test Results</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 1000px;
      margin: 0 auto;
      padding: 20px;
    }
    h1, h2, h3 {
      color: #444;
    }
    .summary {
      background-color: #f8f9fa;
      border-radius: 5px;
      padding: 20px;
      margin-bottom: 30px;
    }
    .pass-rate {
      font-size: 24px;
      font-weight: bold;
      color: ${passRate >= 80 ? '#28a745' : '#dc3545'};
    }
    .page {
      background-color: white;
      border: 1px solid #dee2e6;
      border-radius: 5px;
      padding: 20px;
      margin-bottom: 20px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid #eee;
      padding-bottom: 10px;
      margin-bottom: 20px;
    }
    .page-status {
      font-weight: bold;
      padding: 5px 10px;
      border-radius: 3px;
    }
    .pass {
      background-color: #d4edda;
      color: #155724;
    }
    .partial {
      background-color: #fff3cd;
      color: #856404;
    }
    .fail {
      background-color: #f8d7da;
      color: #721c24;
    }
    .element-list {
      margin-bottom: 20px;
    }
    .element {
      display: flex;
      justify-content: space-between;
      padding: 8px;
      border-bottom: 1px solid #eee;
    }
    .element:last-child {
      border-bottom: none;
    }
    .element-name {
      font-weight: 500;
    }
    .element-status {
      font-weight: bold;
    }
    .found {
      color: #28a745;
    }
    .missing {
      color: #dc3545;
    }
    .screenshot {
      margin-top: 20px;
    }
    .screenshot img {
      max-width: 100%;
      border: 1px solid #dee2e6;
      border-radius: 5px;
    }
  </style>
</head>
<body>
  <h1>Google App Engine Deployment Test Results</h1>
  
  <div class="summary">
    <h2>Summary</h2>
    <p><strong>URL:</strong> ${results.url}</p>
    <p><strong>Test Date:</strong> ${new Date(results.timestamp).toLocaleString()}</p>
    <p><strong>Elements Found:</strong> ${results.overall.found} / ${results.overall.total}</p>
    <p><strong>Pass Rate:</strong> <span class="pass-rate">${passRate.toFixed(2)}%</span></p>
    <p><strong>Status:</strong> ${passRate >= 80 ? '✅ PASS' : '❌ FAIL'}</p>
  </div>
  
  <h2>Page Results</h2>
  
  ${results.pages.map(page => {
    const pagePassRate = page.found + page.missing > 0 
      ? (page.found / (page.found + page.missing)) * 100 
      : 0;
    
    let statusClass = 'fail';
    if (pagePassRate === 100) statusClass = 'pass';
    else if (pagePassRate >= 50) statusClass = 'partial';
    
    return `
    <div class="page">
      <div class="page-header">
        <h3>${page.name} (${page.path})</h3>
        ${page.error 
          ? `<span class="page-status fail">Error</span>` 
          : `<span class="page-status ${statusClass}">${page.found} / ${page.found + page.missing} Elements</span>`
        }
      </div>
      
      ${page.error 
        ? `<div class="error">Error: ${page.error}</div>` 
        : `
          <div class="element-list">
            ${page.elements.map(element => `
              <div class="element">
                <span class="element-name">${element.name} (${element.selector})</span>
                <span class="element-status ${element.found ? 'found' : 'missing'}">
                  ${element.found ? '✅ Found' : '❌ Missing'}
                </span>
              </div>
            `).join('')}
          </div>
          
          <div class="screenshot">
            <h4>Screenshot</h4>
            <img src="./test-screenshots/${page.name.toLowerCase()}.png" alt="${page.name} screenshot">
          </div>
        `
      }
    </div>
    `;
  }).join('')}
</body>
</html>
  `;
  
  const reportPath = path.join(__dirname, 'test-gae-report.html');
  fs.writeFileSync(reportPath, html);
  console.log(`📋 HTML report generated: ${reportPath}`);
}