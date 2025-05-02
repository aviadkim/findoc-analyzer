/**
 * Comprehensive UI Test
 * 
 * This script tests all UI elements of the FinDoc Analyzer application to ensure they are visible and functional.
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Configuration
const config = {
  url: 'https://findoc-deploy.ey.r.appspot.com',
  screenshotsDir: path.join(__dirname, 'ui-test-results'),
  timeout: 30000 // 30 seconds
};

// Create screenshots directory if it doesn't exist
if (!fs.existsSync(config.screenshotsDir)) {
  fs.mkdirSync(config.screenshotsDir, { recursive: true });
}

/**
 * Take a screenshot
 * @param {object} page - Puppeteer page
 * @param {string} name - Screenshot name
 * @returns {Promise<void>}
 */
async function takeScreenshot(page, name) {
  const screenshotPath = path.join(config.screenshotsDir, `${name}.png`);
  await page.screenshot({ path: screenshotPath, fullPage: true });
  console.log(`Screenshot saved: ${screenshotPath}`);
}

/**
 * Test a page
 * @param {object} page - Puppeteer page
 * @param {string} url - URL to test
 * @param {string} name - Name for the test
 * @param {Array<object>} elements - Elements to test
 * @returns {Promise<object>} Test results
 */
async function testPage(page, url, name, elements) {
  console.log(`Testing page: ${url}`);
  
  // Navigate to the page
  await page.goto(url, { timeout: config.timeout, waitUntil: 'networkidle2' });
  
  // Take a screenshot
  await takeScreenshot(page, name);
  
  // Test elements
  const elementResults = [];
  for (const element of elements) {
    try {
      // Check if element exists
      const exists = await page.evaluate((selector) => {
        return document.querySelector(selector) !== null;
      }, element.selector);
      
      // Check if element is visible
      let visible = false;
      if (exists) {
        visible = await page.evaluate((selector) => {
          const el = document.querySelector(selector);
          if (!el) return false;
          
          const style = window.getComputedStyle(el);
          return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
        }, element.selector);
      }
      
      // Test interaction if specified
      let interactionResult = null;
      if (exists && visible && element.interaction) {
        try {
          switch (element.interaction.type) {
            case 'click':
              await page.click(element.selector);
              interactionResult = 'success';
              break;
            case 'input':
              await page.type(element.selector, element.interaction.value);
              interactionResult = 'success';
              break;
            case 'select':
              await page.select(element.selector, element.interaction.value);
              interactionResult = 'success';
              break;
            default:
              interactionResult = 'unknown interaction type';
          }
        } catch (error) {
          interactionResult = `error: ${error.message}`;
        }
      }
      
      elementResults.push({
        selector: element.selector,
        description: element.description,
        exists,
        visible,
        interaction: element.interaction ? {
          type: element.interaction.type,
          result: interactionResult
        } : null
      });
    } catch (error) {
      elementResults.push({
        selector: element.selector,
        description: element.description,
        exists: false,
        visible: false,
        error: error.message
      });
    }
  }
  
  return {
    url,
    name,
    elementResults
  };
}

/**
 * Run the tests
 */
async function runTests() {
  console.log('Starting comprehensive UI tests...');
  
  // Launch browser
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    // Create a new page
    const page = await browser.newPage();
    
    // Set viewport
    await page.setViewport({ width: 1280, height: 800 });
    
    // Pages to test
    const pagesToTest = [
      {
        url: `${config.url}/`,
        name: '01-dashboard',
        elements: [
          { selector: '.sidebar', description: 'Sidebar' },
          { selector: '.sidebar-logo', description: 'Sidebar Logo' },
          { selector: '.sidebar-nav', description: 'Sidebar Navigation' },
          { selector: '.main-content', description: 'Main Content' },
          { selector: '.dashboard-page', description: 'Dashboard Page' },
          { selector: '.dashboard-content', description: 'Dashboard Content' },
          { selector: '.dashboard-card', description: 'Dashboard Card' },
          { selector: '.page-title', description: 'Page Title' },
          { selector: '.sidebar-nav a[href="/documents-new"]', description: 'Documents Link', interaction: { type: 'click' } }
        ]
      },
      {
        url: `${config.url}/documents-new`,
        name: '02-documents',
        elements: [
          { selector: '.documents-page', description: 'Documents Page' },
          { selector: '.page-header', description: 'Page Header' },
          { selector: '.page-title', description: 'Page Title' },
          { selector: '.document-grid', description: 'Document Grid' },
          { selector: '.document-card', description: 'Document Card' },
          { selector: '.document-card-header', description: 'Document Card Header' },
          { selector: '.document-card-body', description: 'Document Card Body' },
          { selector: '.document-card-footer', description: 'Document Card Footer' },
          { selector: '.upload-btn', description: 'Upload Button', interaction: { type: 'click' } }
        ]
      },
      {
        url: `${config.url}/analytics-new`,
        name: '03-analytics',
        elements: [
          { selector: '.analytics-page', description: 'Analytics Page' },
          { selector: '.page-header', description: 'Page Header' },
          { selector: '.page-title', description: 'Page Title' },
          { selector: '.chart-container', description: 'Chart Container' },
          { selector: '.chart-placeholder', description: 'Chart Placeholder' }
        ]
      },
      {
        url: `${config.url}/feedback`,
        name: '04-feedback',
        elements: [
          { selector: '.feedback-page', description: 'Feedback Page' },
          { selector: '.page-title', description: 'Page Title' },
          { selector: '.page-description', description: 'Page Description' },
          { selector: '.feedback-form', description: 'Feedback Form' },
          { selector: '.form-group', description: 'Form Group' },
          { selector: '#name', description: 'Name Input', interaction: { type: 'input', value: 'Test User' } },
          { selector: '#email', description: 'Email Input', interaction: { type: 'input', value: 'test@example.com' } },
          { selector: '#feedbackType', description: 'Feedback Type Select', interaction: { type: 'select', value: 'feature' } },
          { selector: '.rating-container', description: 'Rating Container' },
          { selector: '.rating-btn', description: 'Rating Button', interaction: { type: 'click' } },
          { selector: '#message', description: 'Message Textarea', interaction: { type: 'input', value: 'This is a test message' } },
          { selector: '.submit-btn', description: 'Submit Button' }
        ]
      },
      {
        url: `${config.url}/document-comparison`,
        name: '05-document-comparison',
        elements: [
          { selector: '.document-comparison-page', description: 'Document Comparison Page' },
          { selector: '.page-title', description: 'Page Title' },
          { selector: '.page-description', description: 'Page Description' },
          { selector: '.comparison-container', description: 'Comparison Container' },
          { selector: '.document-selection', description: 'Document Selection' },
          { selector: '.selection-header', description: 'Selection Header' },
          { selector: '.search-box', description: 'Search Box' },
          { selector: '.document-list', description: 'Document List' },
          { selector: '.document-item', description: 'Document Item', interaction: { type: 'click' } },
          { selector: '.selection-actions', description: 'Selection Actions' },
          { selector: '.compare-btn', description: 'Compare Button' },
          { selector: '.comparison-results', description: 'Comparison Results' }
        ]
      },
      {
        url: `${config.url}/upload`,
        name: '06-upload',
        elements: [
          { selector: '.upload-page', description: 'Upload Page' },
          { selector: '.page-title', description: 'Page Title' },
          { selector: '.page-description', description: 'Page Description' },
          { selector: '.upload-container', description: 'Upload Container' },
          { selector: '.upload-area', description: 'Upload Area' },
          { selector: '.upload-icon', description: 'Upload Icon' },
          { selector: '.upload-btn', description: 'Upload Button' },
          { selector: '#file-input', description: 'File Input' },
          { selector: '.upload-options', description: 'Upload Options' },
          { selector: '#document-type', description: 'Document Type Select', interaction: { type: 'select', value: 'financial' } },
          { selector: '.checkbox-group', description: 'Checkbox Group' },
          { selector: '#extract-text', description: 'Extract Text Checkbox' },
          { selector: '.upload-history', description: 'Upload History' },
          { selector: '.upload-table', description: 'Upload Table' }
        ]
      }
    ];
    
    // Test each page
    const results = [];
    for (const pageInfo of pagesToTest) {
      const result = await testPage(
        page,
        pageInfo.url,
        pageInfo.name,
        pageInfo.elements
      );
      results.push(result);
    }
    
    // Save results to file
    const resultsPath = path.join(config.screenshotsDir, 'test-results.json');
    fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
    console.log(`Test results saved to: ${resultsPath}`);
    
    // Generate HTML report
    const reportPath = path.join(config.screenshotsDir, 'test-report.html');
    const reportHtml = generateHtmlReport(results);
    fs.writeFileSync(reportPath, reportHtml);
    console.log(`Test report saved to: ${reportPath}`);
    
    console.log('Comprehensive UI tests completed.');
  } catch (error) {
    console.error('Error during tests:', error);
  } finally {
    // Close browser
    await browser.close();
  }
}

/**
 * Generate HTML report
 * @param {Array<object>} results - Test results
 * @returns {string} HTML report
 */
function generateHtmlReport(results) {
  // Calculate overall statistics
  const totalElements = results.reduce((total, page) => total + page.elementResults.length, 0);
  const existingElements = results.reduce((total, page) => total + page.elementResults.filter(el => el.exists).length, 0);
  const visibleElements = results.reduce((total, page) => total + page.elementResults.filter(el => el.visible).length, 0);
  const interactiveElements = results.reduce((total, page) => {
    return total + page.elementResults.filter(el => el.interaction && el.interaction.result === 'success').length;
  }, 0);
  
  const existingPercentage = Math.round((existingElements / totalElements) * 100);
  const visiblePercentage = Math.round((visibleElements / totalElements) * 100);
  const interactivePercentage = Math.round((interactiveElements / totalElements) * 100);
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>FinDoc Analyzer UI Test Report</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }
    h1, h2, h3 {
      color: #2c3e50;
    }
    .page-test {
      margin-bottom: 40px;
      padding: 20px;
      background-color: #f8f9fa;
      border-radius: 5px;
    }
    .screenshot {
      max-width: 100%;
      border: 1px solid #ddd;
      border-radius: 5px;
      margin-bottom: 20px;
    }
    .section {
      margin-bottom: 20px;
    }
    .result-badge {
      display: inline-block;
      padding: 5px 10px;
      border-radius: 3px;
      margin-right: 10px;
      margin-bottom: 10px;
    }
    .result-badge.success {
      background-color: #d4edda;
      color: #155724;
    }
    .result-badge.failure {
      background-color: #f8d7da;
      color: #721c24;
    }
    .result-badge.warning {
      background-color: #fff3cd;
      color: #856404;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
    }
    th, td {
      padding: 8px;
      text-align: left;
      border-bottom: 1px solid #ddd;
    }
    th {
      background-color: #f2f2f2;
    }
    .progress-container {
      width: 100%;
      background-color: #f3f3f3;
      border-radius: 4px;
      margin-bottom: 10px;
    }
    .progress-bar {
      height: 20px;
      border-radius: 4px;
      text-align: center;
      line-height: 20px;
      color: white;
    }
    .progress-bar.success {
      background-color: #4caf50;
    }
    .progress-bar.warning {
      background-color: #ff9800;
    }
    .progress-bar.failure {
      background-color: #f44336;
    }
    .summary-card {
      display: inline-block;
      width: 30%;
      margin-right: 1.5%;
      padding: 15px;
      border-radius: 5px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      margin-bottom: 20px;
    }
    .summary-card h3 {
      margin-top: 0;
    }
    .summary-card.exists {
      background-color: #e8f5e9;
    }
    .summary-card.visible {
      background-color: #e3f2fd;
    }
    .summary-card.interactive {
      background-color: #f3e5f5;
    }
  </style>
</head>
<body>
  <h1>FinDoc Analyzer UI Test Report</h1>
  
  <div class="section">
    <h2>Summary</h2>
    <p>This report documents the results of testing all UI elements of the FinDoc Analyzer application.</p>
    
    <div class="summary-card exists">
      <h3>Elements Exist</h3>
      <div class="progress-container">
        <div class="progress-bar ${existingPercentage > 80 ? 'success' : existingPercentage > 50 ? 'warning' : 'failure'}" style="width: ${existingPercentage}%">
          ${existingPercentage}%
        </div>
      </div>
      <p>${existingElements} of ${totalElements} elements exist</p>
    </div>
    
    <div class="summary-card visible">
      <h3>Elements Visible</h3>
      <div class="progress-container">
        <div class="progress-bar ${visiblePercentage > 80 ? 'success' : visiblePercentage > 50 ? 'warning' : 'failure'}" style="width: ${visiblePercentage}%">
          ${visiblePercentage}%
        </div>
      </div>
      <p>${visibleElements} of ${totalElements} elements are visible</p>
    </div>
    
    <div class="summary-card interactive">
      <h3>Interactive Elements</h3>
      <div class="progress-container">
        <div class="progress-bar ${interactivePercentage > 80 ? 'success' : interactivePercentage > 50 ? 'warning' : 'failure'}" style="width: ${interactivePercentage}%">
          ${interactivePercentage}%
        </div>
      </div>
      <p>${interactiveElements} of ${totalElements} elements are interactive</p>
    </div>
    
    <h3>Pages Tested</h3>
    <ul>
      ${results.map(result => `<li><a href="#${result.name}">${result.url}</a></li>`).join('')}
    </ul>
  </div>
  
  ${results.map(result => `
    <div id="${result.name}" class="page-test">
      <h2>${result.url}</h2>
      
      <div class="section">
        <h3>Screenshot</h3>
        <img src="${result.name}.png" alt="${result.url}" class="screenshot">
      </div>
      
      <div class="section">
        <h3>Elements</h3>
        <table>
          <thead>
            <tr>
              <th>Element</th>
              <th>Description</th>
              <th>Exists</th>
              <th>Visible</th>
              <th>Interaction</th>
            </tr>
          </thead>
          <tbody>
            ${result.elementResults.map(element => `
              <tr>
                <td>${element.selector}</td>
                <td>${element.description}</td>
                <td>
                  <span class="result-badge ${element.exists ? 'success' : 'failure'}">
                    ${element.exists ? 'Yes' : 'No'}
                  </span>
                </td>
                <td>
                  <span class="result-badge ${element.visible ? 'success' : element.exists ? 'warning' : 'failure'}">
                    ${element.visible ? 'Yes' : element.exists ? 'No' : 'N/A'}
                  </span>
                </td>
                <td>
                  ${element.interaction ? `
                    <span class="result-badge ${element.interaction.result === 'success' ? 'success' : 'failure'}">
                      ${element.interaction.type}: ${element.interaction.result}
                    </span>
                  ` : 'N/A'}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `).join('')}
</body>
</html>`;
}

// Run the tests
runTests();
