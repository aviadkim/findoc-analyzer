/**
 * UI Validation Test
 * Tests that all required UI elements are present on the page
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Define required elements for each page
const requiredElements = {
  'all': [
    { selector: '#show-chat-btn', description: 'Show Chat Button' },
    { selector: '#document-chat-container', description: 'Document Chat Container', optional: true },
    { selector: '#document-chat-input', description: 'Document Chat Input', optional: true },
    { selector: '#document-send-btn', description: 'Document Chat Send Button', optional: true },
    { selector: '#login-form', description: 'Login Form', optional: true },
    { selector: '#google-login-btn', description: 'Google Login Button', optional: true }
  ],
  'upload': [
    { selector: '#process-document-btn', description: 'Process Document Button' },
    { selector: '#progress-container', description: 'Progress Container', optional: true },
    { selector: '#progress-bar', description: 'Progress Bar', optional: true },
    { selector: '#upload-status', description: 'Upload Status', optional: true }
  ],
  'test': [
    { selector: '.agent-card', description: 'Agent Cards' },
    { selector: '.status-indicator', description: 'Agent Status Indicators' },
    { selector: '.agent-action', description: 'Agent Action Buttons' }
  ],
  'document-details': [
    { selector: '.document-metadata', description: 'Document Metadata' },
    { selector: '.document-content', description: 'Document Content' },
    { selector: '.document-tables', description: 'Document Tables' }
  ],
  'documents-new': [
    { selector: '.document-list', description: 'Document List' },
    { selector: '.document-item', description: 'Document Items' },
    { selector: '.document-actions', description: 'Document Actions' }
  ],
  'analytics-new': [
    { selector: '.analytics-dashboard', description: 'Analytics Dashboard' },
    { selector: '.analytics-chart', description: 'Analytics Charts' },
    { selector: '.analytics-filters', description: 'Analytics Filters' }
  ],
  'document-chat': [
    { selector: '.document-selector', description: 'Document Selector' },
    { selector: '.chat-history', description: 'Chat History' },
    { selector: '.chat-input', description: 'Chat Input' }
  ],
  'document-comparison': [
    { selector: '.comparison-container', description: 'Comparison Container' },
    { selector: '.document-selector', description: 'Document Selectors' },
    { selector: '.comparison-results', description: 'Comparison Results' }
  ]
};

// Define pages to test
const pagesToTest = [
  { path: '/', name: 'Home' },
  { path: '/upload', name: 'Upload' },
  { path: '/documents-new', name: 'Documents' },
  { path: '/analytics-new', name: 'Analytics' },
  { path: '/document-details.html', name: 'Document Details' },
  { path: '/document-chat', name: 'Document Chat' },
  { path: '/document-comparison', name: 'Document Comparison' },
  { path: '/test', name: 'Test' }
];

// Main function
async function main() {
  console.log('Starting UI validation test...');
  
  // Create results directory
  const resultsDir = path.join(__dirname, 'ui-validation-results');
  if (!fs.existsSync(resultsDir)) {
    fs.mkdirSync(resultsDir, { recursive: true });
  }
  
  // Create screenshots directory
  const screenshotsDir = path.join(resultsDir, 'screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }
  
  // Create results file
  const resultsFile = path.join(resultsDir, 'results.json');
  const results = {
    timestamp: new Date().toISOString(),
    pages: [],
    summary: {
      totalElements: 0,
      foundElements: 0,
      missingElements: 0,
      passRate: 0
    }
  };
  
  // Launch browser
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    args: ['--start-maximized']
  });
  
  const page = await browser.newPage();
  
  // Test each page
  for (const pageToTest of pagesToTest) {
    console.log(`Testing page: ${pageToTest.name} (${pageToTest.path})`);
    
    // Navigate to page
    try {
      await page.goto(`http://localhost:8080${pageToTest.path}`, { waitUntil: 'networkidle2', timeout: 30000 });
    } catch (error) {
      console.error(`Error navigating to ${pageToTest.path}: ${error.message}`);
      continue;
    }
    
    // Take screenshot
    await page.screenshot({ path: path.join(screenshotsDir, `${pageToTest.name.toLowerCase().replace(/\s+/g, '-')}.png`), fullPage: true });
    
    // Determine page type
    let pageType = 'all';
    if (pageToTest.path.includes('/upload')) {
      pageType = 'upload';
    } else if (pageToTest.path.includes('/test')) {
      pageType = 'test';
    } else if (pageToTest.path.includes('/document-details')) {
      pageType = 'document-details';
    } else if (pageToTest.path.includes('/documents-new')) {
      pageType = 'documents-new';
    } else if (pageToTest.path.includes('/analytics-new')) {
      pageType = 'analytics-new';
    } else if (pageToTest.path.includes('/document-chat')) {
      pageType = 'document-chat';
    } else if (pageToTest.path.includes('/document-comparison')) {
      pageType = 'document-comparison';
    }
    
    // Get elements to validate
    const elementsToValidate = [...requiredElements['all']];
    if (requiredElements[pageType]) {
      elementsToValidate.push(...requiredElements[pageType]);
    }
    
    // Validate elements
    const pageResults = {
      name: pageToTest.name,
      path: pageToTest.path,
      type: pageType,
      elements: [],
      summary: {
        totalElements: 0,
        foundElements: 0,
        missingElements: 0,
        passRate: 0
      }
    };
    
    for (const element of elementsToValidate) {
      const found = await page.$(element.selector);
      
      const elementResult = {
        description: element.description,
        selector: element.selector,
        found: !!found,
        optional: !!element.optional
      };
      
      pageResults.elements.push(elementResult);
      
      if (!element.optional) {
        pageResults.summary.totalElements++;
        results.summary.totalElements++;
        
        if (found) {
          pageResults.summary.foundElements++;
          results.summary.foundElements++;
        } else {
          pageResults.summary.missingElements++;
          results.summary.missingElements++;
          console.warn(`Missing UI element on ${pageToTest.name}: ${element.description} (${element.selector})`);
        }
      }
    }
    
    // Calculate pass rate
    pageResults.summary.passRate = pageResults.summary.totalElements > 0
      ? (pageResults.summary.foundElements / pageResults.summary.totalElements) * 100
      : 100;
    
    results.pages.push(pageResults);
    
    console.log(`Completed testing page: ${pageToTest.name}`);
    console.log(`Pass rate: ${pageResults.summary.passRate.toFixed(2)}% (${pageResults.summary.foundElements}/${pageResults.summary.totalElements})`);
  }
  
  // Calculate overall pass rate
  results.summary.passRate = results.summary.totalElements > 0
    ? (results.summary.foundElements / results.summary.totalElements) * 100
    : 100;
  
  // Save results
  fs.writeFileSync(resultsFile, JSON.stringify(results, null, 2));
  
  // Generate HTML report
  const reportFile = path.join(resultsDir, 'report.html');
  const reportContent = generateHtmlReport(results);
  fs.writeFileSync(reportFile, reportContent);
  
  // Print summary
  console.log('\nUI Validation Test Summary:');
  console.log(`Total elements: ${results.summary.totalElements}`);
  console.log(`Found elements: ${results.summary.foundElements}`);
  console.log(`Missing elements: ${results.summary.missingElements}`);
  console.log(`Overall pass rate: ${results.summary.passRate.toFixed(2)}%`);
  
  // Open report
  await page.goto(`file://${reportFile}`);
  
  // Wait for user to close browser
  console.log('\nPress Ctrl+C to close the browser and exit');
}

/**
 * Generate HTML report
 * @param {Object} results - Test results
 * @returns {string} HTML report
 */
function generateHtmlReport(results) {
  const pageRows = results.pages.map(page => {
    const passRateClass = page.summary.passRate === 100 ? 'pass' : page.summary.passRate >= 80 ? 'warning' : 'fail';
    
    return `
      <tr>
        <td>${page.name}</td>
        <td>${page.path}</td>
        <td>${page.summary.totalElements}</td>
        <td>${page.summary.foundElements}</td>
        <td>${page.summary.missingElements}</td>
        <td class="${passRateClass}">${page.summary.passRate.toFixed(2)}%</td>
        <td><button onclick="toggleDetails('${page.name.replace(/\s+/g, '-')}')">Details</button></td>
      </tr>
      <tr id="${page.name.replace(/\s+/g, '-')}-details" class="details-row" style="display: none;">
        <td colspan="7">
          <table class="details-table">
            <thead>
              <tr>
                <th>Element</th>
                <th>Selector</th>
                <th>Status</th>
                <th>Required</th>
              </tr>
            </thead>
            <tbody>
              ${page.elements.map(element => {
                const statusClass = element.found ? 'pass' : element.optional ? 'warning' : 'fail';
                const statusText = element.found ? 'Found' : 'Missing';
                const requiredText = element.optional ? 'No' : 'Yes';
                
                return `
                  <tr>
                    <td>${element.description}</td>
                    <td><code>${element.selector}</code></td>
                    <td class="${statusClass}">${statusText}</td>
                    <td>${requiredText}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </td>
      </tr>
    `;
  }).join('');
  
  const overallPassRateClass = results.summary.passRate === 100 ? 'pass' : results.summary.passRate >= 80 ? 'warning' : 'fail';
  
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>UI Validation Test Report</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          margin: 0;
          padding: 20px;
          color: #333;
        }
        
        h1, h2, h3 {
          color: #444;
        }
        
        .summary {
          background-color: #f5f5f5;
          padding: 20px;
          border-radius: 5px;
          margin-bottom: 20px;
        }
        
        .summary-item {
          margin-bottom: 10px;
        }
        
        .pass {
          color: #28a745;
        }
        
        .warning {
          color: #ffc107;
        }
        
        .fail {
          color: #dc3545;
        }
        
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
        }
        
        th, td {
          padding: 12px 15px;
          text-align: left;
          border-bottom: 1px solid #ddd;
        }
        
        th {
          background-color: #f8f9fa;
          font-weight: bold;
        }
        
        tr:hover {
          background-color: #f5f5f5;
        }
        
        .details-table {
          margin-top: 10px;
          margin-bottom: 10px;
        }
        
        .details-table th, .details-table td {
          padding: 8px 10px;
          font-size: 14px;
        }
        
        button {
          padding: 5px 10px;
          background-color: #007bff;
          color: white;
          border: none;
          border-radius: 3px;
          cursor: pointer;
        }
        
        button:hover {
          background-color: #0069d9;
        }
        
        code {
          background-color: #f8f9fa;
          padding: 2px 4px;
          border-radius: 3px;
          font-family: monospace;
        }
        
        .timestamp {
          color: #6c757d;
          font-size: 14px;
          margin-bottom: 20px;
        }
      </style>
    </head>
    <body>
      <h1>UI Validation Test Report</h1>
      
      <div class="timestamp">
        Generated on: ${new Date(results.timestamp).toLocaleString()}
      </div>
      
      <div class="summary">
        <h2>Summary</h2>
        <div class="summary-item">Total elements: <strong>${results.summary.totalElements}</strong></div>
        <div class="summary-item">Found elements: <strong class="pass">${results.summary.foundElements}</strong></div>
        <div class="summary-item">Missing elements: <strong class="${results.summary.missingElements > 0 ? 'fail' : 'pass'}">${results.summary.missingElements}</strong></div>
        <div class="summary-item">Overall pass rate: <strong class="${overallPassRateClass}">${results.summary.passRate.toFixed(2)}%</strong></div>
      </div>
      
      <h2>Results by Page</h2>
      
      <table>
        <thead>
          <tr>
            <th>Page</th>
            <th>Path</th>
            <th>Total Elements</th>
            <th>Found Elements</th>
            <th>Missing Elements</th>
            <th>Pass Rate</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${pageRows}
        </tbody>
      </table>
      
      <script>
        function toggleDetails(pageName) {
          const detailsRow = document.getElementById(pageName + '-details');
          if (detailsRow.style.display === 'none') {
            detailsRow.style.display = 'table-row';
          } else {
            detailsRow.style.display = 'none';
          }
        }
      </script>
    </body>
    </html>
  `;
}

// Run the test
main().catch(console.error);
