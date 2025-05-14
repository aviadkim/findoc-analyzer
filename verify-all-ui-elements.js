/**
 * Verify All UI Elements
 * Verifies that all 91 UI elements are present on the deployed website
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Define all required UI elements
const allRequiredElements = [
  // Home page elements
  { page: 'Home', selector: '.navbar', description: 'Navigation Bar' },
  { page: 'Home', selector: '.sidebar', description: 'Sidebar' },
  { page: 'Home', selector: '.main-content', description: 'Main Content' },
  { page: 'Home', selector: '.quick-upload', description: 'Quick Upload Section' },
  { page: 'Home', selector: '.recent-documents', description: 'Recent Documents Section' },
  { page: 'Home', selector: '.analytics-section', description: 'Analytics Section' },
  { page: 'Home', selector: '.document-chat-section', description: 'Document Chat Section' },
  { page: 'Home', selector: '.features-section', description: 'Features Section' },
  { page: 'Home', selector: '.agents-section', description: 'Agents Section' },
  { page: 'Home', selector: '#show-chat-btn', description: 'Show Chat Button' },
  { page: 'Home', selector: '#document-chat-container', description: 'Document Chat Container', optional: true },
  
  // Upload page elements
  { page: 'Upload', selector: '.upload-form', description: 'Upload Form' },
  { page: 'Upload', selector: '.form-group', description: 'Form Group' },
  { page: 'Upload', selector: '.form-control', description: 'Form Control' },
  { page: 'Upload', selector: '.form-actions', description: 'Form Actions' },
  { page: 'Upload', selector: '#process-document-btn', description: 'Process Document Button' },
  { page: 'Upload', selector: '#progress-container', description: 'Progress Container', optional: true },
  { page: 'Upload', selector: '#progress-bar', description: 'Progress Bar', optional: true },
  { page: 'Upload', selector: '#upload-status', description: 'Upload Status', optional: true },
  { page: 'Upload', selector: '#show-chat-btn', description: 'Show Chat Button' },
  
  // Documents page elements
  { page: 'Documents', selector: '.document-list', description: 'Document List' },
  { page: 'Documents', selector: '.document-item', description: 'Document Item' },
  { page: 'Documents', selector: '.document-actions', description: 'Document Actions' },
  { page: 'Documents', selector: '.document-filter', description: 'Document Filter' },
  { page: 'Documents', selector: '.document-search', description: 'Document Search' },
  { page: 'Documents', selector: '.document-sort', description: 'Document Sort' },
  { page: 'Documents', selector: '.document-pagination', description: 'Document Pagination' },
  { page: 'Documents', selector: '.document-upload-btn', description: 'Document Upload Button' },
  { page: 'Documents', selector: '#show-chat-btn', description: 'Show Chat Button' },
  
  // Analytics page elements
  { page: 'Analytics', selector: '.analytics-dashboard', description: 'Analytics Dashboard' },
  { page: 'Analytics', selector: '.analytics-chart', description: 'Analytics Chart' },
  { page: 'Analytics', selector: '.analytics-filters', description: 'Analytics Filters' },
  { page: 'Analytics', selector: '.analytics-metrics', description: 'Analytics Metrics' },
  { page: 'Analytics', selector: '.analytics-summary', description: 'Analytics Summary' },
  { page: 'Analytics', selector: '.analytics-period', description: 'Analytics Period' },
  { page: 'Analytics', selector: '.analytics-export', description: 'Analytics Export' },
  { page: 'Analytics', selector: '.analytics-refresh', description: 'Analytics Refresh' },
  { page: 'Analytics', selector: '#show-chat-btn', description: 'Show Chat Button' },
  
  // Document details page elements
  { page: 'Document Details', selector: '.document-metadata', description: 'Document Metadata' },
  { page: 'Document Details', selector: '.document-content', description: 'Document Content' },
  { page: 'Document Details', selector: '.document-tables', description: 'Document Tables' },
  { page: 'Document Details', selector: '.document-actions', description: 'Document Actions' },
  { page: 'Document Details', selector: '.document-export', description: 'Document Export' },
  { page: 'Document Details', selector: '.document-process', description: 'Document Process' },
  { page: 'Document Details', selector: '.document-share', description: 'Document Share' },
  { page: 'Document Details', selector: '.document-delete', description: 'Document Delete' },
  { page: 'Document Details', selector: '#show-chat-btn', description: 'Show Chat Button' },
  
  // Document chat page elements
  { page: 'Document Chat', selector: '.document-selector', description: 'Document Selector' },
  { page: 'Document Chat', selector: '.chat-history', description: 'Chat History' },
  { page: 'Document Chat', selector: '.chat-input', description: 'Chat Input' },
  { page: 'Document Chat', selector: '.chat-send', description: 'Chat Send' },
  { page: 'Document Chat', selector: '.chat-clear', description: 'Chat Clear' },
  { page: 'Document Chat', selector: '.chat-export', description: 'Chat Export' },
  { page: 'Document Chat', selector: '.chat-settings', description: 'Chat Settings' },
  { page: 'Document Chat', selector: '.chat-message', description: 'Chat Message' },
  { page: 'Document Chat', selector: '#show-chat-btn', description: 'Show Chat Button' },
  
  // Document comparison page elements
  { page: 'Document Comparison', selector: '.comparison-container', description: 'Comparison Container' },
  { page: 'Document Comparison', selector: '.document-selector', description: 'Document Selector' },
  { page: 'Document Comparison', selector: '.comparison-results', description: 'Comparison Results' },
  { page: 'Document Comparison', selector: '.comparison-diff', description: 'Comparison Diff' },
  { page: 'Document Comparison', selector: '.comparison-summary', description: 'Comparison Summary' },
  { page: 'Document Comparison', selector: '.comparison-export', description: 'Comparison Export' },
  { page: 'Document Comparison', selector: '.comparison-settings', description: 'Comparison Settings' },
  { page: 'Document Comparison', selector: '.comparison-refresh', description: 'Comparison Refresh' },
  { page: 'Document Comparison', selector: '#show-chat-btn', description: 'Show Chat Button' },
  
  // Test page elements
  { page: 'Test', selector: '.test-page-content', description: 'Test Page Content' },
  { page: 'Test', selector: '.agent-card', description: 'Agent Card' },
  { page: 'Test', selector: '.status-indicator', description: 'Status Indicator' },
  { page: 'Test', selector: '.agent-action', description: 'Agent Action' },
  { page: 'Test', selector: '.agent-card-header', description: 'Agent Card Header' },
  { page: 'Test', selector: '.agent-card-body', description: 'Agent Card Body' },
  { page: 'Test', selector: '.agent-card-footer', description: 'Agent Card Footer' },
  { page: 'Test', selector: '.agent-cards-container', description: 'Agent Cards Container' },
  { page: 'Test', selector: '#show-chat-btn', description: 'Show Chat Button' },
  
  // Common elements across all pages
  { page: 'All', selector: '.navbar', description: 'Navigation Bar' },
  { page: 'All', selector: '.sidebar', description: 'Sidebar' },
  { page: 'All', selector: '.main-content', description: 'Main Content' },
  { page: 'All', selector: '.footer', description: 'Footer' },
  { page: 'All', selector: '.logo', description: 'Logo' },
  { page: 'All', selector: '.user-menu', description: 'User Menu' },
  { page: 'All', selector: '.notifications', description: 'Notifications' },
  { page: 'All', selector: '.search', description: 'Search' },
  { page: 'All', selector: '.settings', description: 'Settings' },
  { page: 'All', selector: '#show-chat-btn', description: 'Show Chat Button' },
  { page: 'All', selector: '#document-chat-container', description: 'Document Chat Container', optional: true }
];

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
  console.log('Verifying all UI elements...');
  
  // Create results directory
  const resultsDir = path.join(__dirname, 'all-ui-elements-verification');
  if (!fs.existsSync(resultsDir)) {
    fs.mkdirSync(resultsDir, { recursive: true });
  }
  
  // Create screenshots directory
  const screenshotsDir = path.join(resultsDir, 'screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }
  
  // Launch browser
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    args: ['--start-maximized']
  });
  
  const page = await browser.newPage();
  
  // Get deployed URL
  const deployedUrl = 'https://backv2-app-brfi73d4ra-zf.a.run.app';
  
  // Initialize results
  const results = {
    timestamp: new Date().toISOString(),
    totalElements: 0,
    foundElements: 0,
    missingElements: 0,
    pages: []
  };
  
  // Test each page
  for (const pageToTest of pagesToTest) {
    console.log(`Testing page: ${pageToTest.name} (${pageToTest.path})`);
    
    // Navigate to page
    try {
      await page.goto(`${deployedUrl}${pageToTest.path}`, { waitUntil: 'networkidle2', timeout: 30000 });
    } catch (error) {
      console.error(`Error navigating to ${pageToTest.path}: ${error.message}`);
      continue;
    }
    
    // Take screenshot
    await page.screenshot({ path: path.join(screenshotsDir, `${pageToTest.name.toLowerCase().replace(/\s+/g, '-')}.png`), fullPage: true });
    
    // Get elements to validate for this page
    const elementsToValidate = allRequiredElements.filter(element => 
      element.page === pageToTest.name || element.page === 'All'
    );
    
    // Initialize page results
    const pageResults = {
      name: pageToTest.name,
      path: pageToTest.path,
      totalElements: 0,
      foundElements: 0,
      missingElements: 0,
      elements: []
    };
    
    // Validate elements
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
        pageResults.totalElements++;
        results.totalElements++;
        
        if (found) {
          pageResults.foundElements++;
          results.foundElements++;
          console.log(`✅ Found: ${element.description} (${element.selector})`);
        } else {
          pageResults.missingElements++;
          results.missingElements++;
          console.error(`❌ Missing: ${element.description} (${element.selector})`);
        }
      } else if (found) {
        console.log(`✅ Found optional: ${element.description} (${element.selector})`);
      } else {
        console.log(`⚠️ Optional element not found: ${element.description} (${element.selector})`);
      }
    }
    
    // Add page results to overall results
    results.pages.push(pageResults);
    
    console.log(`Completed testing page: ${pageToTest.name}`);
    console.log(`Found ${pageResults.foundElements}/${pageResults.totalElements} elements`);
  }
  
  // Calculate pass rate
  results.passRate = results.totalElements > 0
    ? (results.foundElements / results.totalElements) * 100
    : 100;
  
  // Save results
  const resultsFile = path.join(resultsDir, 'results.json');
  fs.writeFileSync(resultsFile, JSON.stringify(results, null, 2));
  
  // Generate HTML report
  const reportFile = path.join(resultsDir, 'report.html');
  const reportContent = generateHtmlReport(results);
  fs.writeFileSync(reportFile, reportContent);
  
  // Print summary
  console.log('\nVerification Summary:');
  console.log(`Total elements: ${results.totalElements}`);
  console.log(`Found elements: ${results.foundElements}`);
  console.log(`Missing elements: ${results.missingElements}`);
  console.log(`Pass rate: ${results.passRate.toFixed(2)}%`);
  
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
    const passRateClass = page.totalElements === page.foundElements ? 'pass' : 'fail';
    
    return `
      <tr>
        <td>${page.name}</td>
        <td>${page.path}</td>
        <td>${page.totalElements}</td>
        <td>${page.foundElements}</td>
        <td>${page.missingElements}</td>
        <td class="${passRateClass}">${page.totalElements > 0 ? ((page.foundElements / page.totalElements) * 100).toFixed(2) : 100}%</td>
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
  
  const overallPassRateClass = results.totalElements === results.foundElements ? 'pass' : 'fail';
  
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>All UI Elements Verification Report</title>
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
      <h1>All UI Elements Verification Report</h1>
      
      <div class="timestamp">
        Generated on: ${new Date(results.timestamp).toLocaleString()}
      </div>
      
      <div class="summary">
        <h2>Summary</h2>
        <div class="summary-item">Total elements: <strong>${results.totalElements}</strong></div>
        <div class="summary-item">Found elements: <strong class="pass">${results.foundElements}</strong></div>
        <div class="summary-item">Missing elements: <strong class="${results.missingElements > 0 ? 'fail' : 'pass'}">${results.missingElements}</strong></div>
        <div class="summary-item">Pass rate: <strong class="${overallPassRateClass}">${results.passRate.toFixed(2)}%</strong></div>
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

// Run the verification
main().catch(console.error);
