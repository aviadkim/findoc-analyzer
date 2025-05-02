/**
 * Error Detection Test
 * 
 * This script performs thorough testing of the FinDoc Analyzer application to detect any errors.
 * It checks for JavaScript errors, network errors, UI rendering issues, and functionality issues.
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Configuration
const config = {
  url: 'https://findoc-deploy.ey.r.appspot.com',
  screenshotsDir: path.join(__dirname, 'error-detection-results'),
  timeout: 30000, // 30 seconds
  pages: [
    { path: '/', name: 'dashboard' },
    { path: '/documents-new', name: 'documents' },
    { path: '/analytics-new', name: 'analytics' },
    { path: '/feedback', name: 'feedback' },
    { path: '/document-comparison', name: 'document-comparison' },
    { path: '/upload', name: 'upload' }
  ]
};

// Create screenshots directory if it doesn't exist
if (!fs.existsSync(config.screenshotsDir)) {
  fs.mkdirSync(config.screenshotsDir, { recursive: true });
}

/**
 * Take a screenshot
 * @param {object} page - Puppeteer page
 * @param {string} name - Screenshot name
 * @returns {Promise<string>} Screenshot path
 */
async function takeScreenshot(page, name) {
  const screenshotPath = path.join(config.screenshotsDir, `${name}.png`);
  await page.screenshot({ path: screenshotPath, fullPage: true });
  console.log(`Screenshot saved: ${screenshotPath}`);
  return screenshotPath;
}

/**
 * Test a page for errors
 * @param {object} browser - Puppeteer browser
 * @param {string} url - URL to test
 * @param {string} name - Name for the test
 * @returns {Promise<object>} Test results
 */
async function testPageForErrors(browser, url, name) {
  console.log(`Testing page for errors: ${url}`);
  
  // Create a new page for each test to avoid interference
  const page = await browser.newPage();
  
  // Collect errors
  const errors = [];
  const consoleMessages = [];
  const networkErrors = [];
  
  // Listen for console messages
  page.on('console', message => {
    consoleMessages.push({
      type: message.type(),
      text: message.text(),
      location: message.location()
    });
    
    // Log console errors
    if (message.type() === 'error') {
      errors.push({
        type: 'console',
        message: message.text(),
        location: message.location()
      });
    }
  });
  
  // Listen for page errors
  page.on('pageerror', error => {
    errors.push({
      type: 'page',
      message: error.message,
      stack: error.stack
    });
  });
  
  // Listen for request failures
  page.on('requestfailed', request => {
    networkErrors.push({
      url: request.url(),
      method: request.method(),
      failure: request.failure(),
      resourceType: request.resourceType()
    });
  });
  
  try {
    // Navigate to the page
    await page.goto(url, { timeout: config.timeout, waitUntil: 'networkidle2' });
    
    // Take a screenshot
    const screenshotPath = await takeScreenshot(page, name);
    
    // Check for visible error messages in the UI
    const visibleErrors = await page.evaluate(() => {
      const errorElements = Array.from(document.querySelectorAll('.error, .error-message, [role="alert"], .alert-danger'));
      return errorElements.map(el => ({
        text: el.innerText,
        isVisible: el.offsetParent !== null
      })).filter(error => error.isVisible);
    });
    
    // Check for broken images
    const brokenImages = await page.evaluate(() => {
      const images = Array.from(document.querySelectorAll('img'));
      return images.filter(img => !img.complete || img.naturalWidth === 0).map(img => ({
        src: img.src,
        alt: img.alt
      }));
    });
    
    // Check for broken links
    const brokenLinks = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a[href]'));
      return links.filter(link => {
        const href = link.getAttribute('href');
        return href === '#' || href === 'javascript:void(0)' || href === '';
      }).map(link => ({
        href: link.getAttribute('href'),
        text: link.innerText
      }));
    });
    
    // Check for empty containers
    const emptyContainers = await page.evaluate(() => {
      const containers = Array.from(document.querySelectorAll('.container, .section, .card, .panel'));
      return containers.filter(container => container.children.length === 0).map(container => ({
        className: container.className,
        id: container.id
      }));
    });
    
    // Check for overlapping elements
    const overlappingElements = await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('*'));
      const overlaps = [];
      
      for (let i = 0; i < elements.length; i++) {
        const el1 = elements[i];
        const rect1 = el1.getBoundingClientRect();
        
        // Skip elements with zero size or that are not visible
        if (rect1.width === 0 || rect1.height === 0 || 
            getComputedStyle(el1).display === 'none' || 
            getComputedStyle(el1).visibility === 'hidden') {
          continue;
        }
        
        for (let j = i + 1; j < elements.length; j++) {
          const el2 = elements[j];
          const rect2 = el2.getBoundingClientRect();
          
          // Skip elements with zero size or that are not visible
          if (rect2.width === 0 || rect2.height === 0 || 
              getComputedStyle(el2).display === 'none' || 
              getComputedStyle(el2).visibility === 'hidden') {
            continue;
          }
          
          // Check if elements overlap
          if (!(rect1.right < rect2.left || 
                rect1.left > rect2.right || 
                rect1.bottom < rect2.top || 
                rect1.top > rect2.bottom)) {
            
            // Check if one element is a parent of the other
            if (!el1.contains(el2) && !el2.contains(el1)) {
              overlaps.push({
                element1: {
                  tagName: el1.tagName,
                  className: el1.className,
                  id: el1.id,
                  text: el1.innerText.substring(0, 50)
                },
                element2: {
                  tagName: el2.tagName,
                  className: el2.className,
                  id: el2.id,
                  text: el2.innerText.substring(0, 50)
                }
              });
              
              // Limit to 10 overlaps to avoid huge results
              if (overlaps.length >= 10) {
                break;
              }
            }
          }
        }
        
        // Limit to 10 overlaps to avoid huge results
        if (overlaps.length >= 10) {
          break;
        }
      }
      
      return overlaps;
    });
    
    // Test interactive elements
    const interactiveElementsResults = await testInteractiveElements(page);
    
    // Close the page
    await page.close();
    
    return {
      url,
      name,
      screenshotPath,
      errors,
      consoleMessages,
      networkErrors,
      visibleErrors,
      brokenImages,
      brokenLinks,
      emptyContainers,
      overlappingElements,
      interactiveElementsResults,
      hasErrors: errors.length > 0 || 
                 networkErrors.length > 0 || 
                 visibleErrors.length > 0 || 
                 brokenImages.length > 0 || 
                 interactiveElementsResults.some(result => !result.success)
    };
  } catch (error) {
    // Take a screenshot of the error
    await takeScreenshot(page, `${name}-error`);
    
    // Close the page
    await page.close();
    
    return {
      url,
      name,
      error: {
        message: error.message,
        stack: error.stack
      },
      hasErrors: true
    };
  }
}

/**
 * Test interactive elements on a page
 * @param {object} page - Puppeteer page
 * @returns {Promise<Array<object>>} Test results
 */
async function testInteractiveElements(page) {
  const results = [];
  
  // Test buttons
  const buttons = await page.$$('button, .btn, [role="button"]');
  for (const button of buttons) {
    try {
      // Get button text for identification
      const buttonText = await page.evaluate(el => el.innerText, button);
      
      // Check if button is visible and enabled
      const isVisible = await page.evaluate(el => {
        const style = window.getComputedStyle(el);
        return style.display !== 'none' && 
               style.visibility !== 'hidden' && 
               style.opacity !== '0' &&
               !el.disabled;
      }, button);
      
      if (isVisible) {
        // Try to click the button
        await button.click();
        
        results.push({
          type: 'button',
          text: buttonText,
          success: true
        });
      } else {
        results.push({
          type: 'button',
          text: buttonText,
          success: false,
          reason: 'Button is not visible or disabled'
        });
      }
    } catch (error) {
      results.push({
        type: 'button',
        error: error.message,
        success: false
      });
    }
  }
  
  // Test inputs
  const inputs = await page.$$('input[type="text"], input[type="email"], input[type="password"], textarea');
  for (const input of inputs) {
    try {
      // Get input placeholder or name for identification
      const inputId = await page.evaluate(el => el.placeholder || el.name || el.id, input);
      
      // Check if input is visible and enabled
      const isVisible = await page.evaluate(el => {
        const style = window.getComputedStyle(el);
        return style.display !== 'none' && 
               style.visibility !== 'hidden' && 
               !el.disabled && 
               !el.readOnly;
      }, input);
      
      if (isVisible) {
        // Try to type in the input
        await input.type('Test input');
        
        results.push({
          type: 'input',
          id: inputId,
          success: true
        });
      } else {
        results.push({
          type: 'input',
          id: inputId,
          success: false,
          reason: 'Input is not visible, disabled, or readonly'
        });
      }
    } catch (error) {
      results.push({
        type: 'input',
        error: error.message,
        success: false
      });
    }
  }
  
  // Test selects
  const selects = await page.$$('select');
  for (const select of selects) {
    try {
      // Get select name or id for identification
      const selectId = await page.evaluate(el => el.name || el.id, select);
      
      // Check if select is visible and enabled
      const isVisible = await page.evaluate(el => {
        const style = window.getComputedStyle(el);
        return style.display !== 'none' && 
               style.visibility !== 'hidden' && 
               !el.disabled;
      }, select);
      
      if (isVisible) {
        // Get options
        const options = await page.evaluate(el => {
          return Array.from(el.options).map(option => option.value);
        }, select);
        
        if (options.length > 0) {
          // Try to select an option
          await select.select(options[0]);
          
          results.push({
            type: 'select',
            id: selectId,
            success: true
          });
        } else {
          results.push({
            type: 'select',
            id: selectId,
            success: false,
            reason: 'Select has no options'
          });
        }
      } else {
        results.push({
          type: 'select',
          id: selectId,
          success: false,
          reason: 'Select is not visible or disabled'
        });
      }
    } catch (error) {
      results.push({
        type: 'select',
        error: error.message,
        success: false
      });
    }
  }
  
  return results;
}

/**
 * Run the tests
 */
async function runTests() {
  console.log('Starting error detection tests...');
  
  // Launch browser
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    // Test each page
    const results = [];
    for (const page of config.pages) {
      const result = await testPageForErrors(
        browser,
        `${config.url}${page.path}`,
        page.name
      );
      results.push(result);
    }
    
    // Save results to file
    const resultsPath = path.join(config.screenshotsDir, 'error-detection-results.json');
    fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
    console.log(`Error detection results saved to: ${resultsPath}`);
    
    // Generate HTML report
    const reportPath = path.join(config.screenshotsDir, 'error-detection-report.html');
    const reportHtml = generateHtmlReport(results);
    fs.writeFileSync(reportPath, reportHtml);
    console.log(`Error detection report saved to: ${reportPath}`);
    
    // Open the report
    console.log('Error detection tests completed.');
    
    // Print summary
    const errorCount = results.filter(result => result.hasErrors).length;
    console.log(`Found errors in ${errorCount} of ${results.length} pages.`);
    
    if (errorCount > 0) {
      console.log('Pages with errors:');
      results.filter(result => result.hasErrors).forEach(result => {
        console.log(`- ${result.url}`);
      });
    }
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
  const totalPages = results.length;
  const pagesWithErrors = results.filter(result => result.hasErrors).length;
  const errorPercentage = Math.round((pagesWithErrors / totalPages) * 100);
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>FinDoc Analyzer Error Detection Report</title>
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
      border-left: 5px solid #ddd;
    }
    .page-test.has-errors {
      border-left-color: #dc3545;
    }
    .page-test.no-errors {
      border-left-color: #28a745;
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
    .error-badge {
      display: inline-block;
      padding: 5px 10px;
      border-radius: 3px;
      margin-right: 10px;
      margin-bottom: 10px;
    }
    .error-badge.error {
      background-color: #f8d7da;
      color: #721c24;
    }
    .error-badge.warning {
      background-color: #fff3cd;
      color: #856404;
    }
    .error-badge.success {
      background-color: #d4edda;
      color: #155724;
    }
    .error-badge.info {
      background-color: #d1ecf1;
      color: #0c5460;
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
    .progress-bar.error {
      background-color: #f44336;
    }
    .summary-card {
      padding: 15px;
      border-radius: 5px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      margin-bottom: 20px;
      background-color: ${errorPercentage > 50 ? '#f8d7da' : errorPercentage > 0 ? '#fff3cd' : '#d4edda'};
      color: ${errorPercentage > 50 ? '#721c24' : errorPercentage > 0 ? '#856404' : '#155724'};
    }
    .error-details {
      background-color: #f8f9fa;
      border-radius: 5px;
      padding: 15px;
      margin-top: 10px;
      border: 1px solid #ddd;
      overflow-x: auto;
    }
    .error-message {
      font-family: monospace;
      white-space: pre-wrap;
    }
    .collapsible {
      background-color: #f1f1f1;
      color: #444;
      cursor: pointer;
      padding: 18px;
      width: 100%;
      border: none;
      text-align: left;
      outline: none;
      font-size: 15px;
      border-radius: 5px;
      margin-bottom: 5px;
    }
    .active, .collapsible:hover {
      background-color: #e8e8e8;
    }
    .collapsible:after {
      content: '\\002B';
      color: #777;
      font-weight: bold;
      float: right;
      margin-left: 5px;
    }
    .active:after {
      content: "\\2212";
    }
    .content {
      padding: 0 18px;
      max-height: 0;
      overflow: hidden;
      transition: max-height 0.2s ease-out;
      background-color: white;
      border-radius: 0 0 5px 5px;
      margin-bottom: 10px;
    }
  </style>
</head>
<body>
  <h1>FinDoc Analyzer Error Detection Report</h1>
  
  <div class="section">
    <h2>Summary</h2>
    <div class="summary-card">
      <h3>Error Detection Results</h3>
      <div class="progress-container">
        <div class="progress-bar ${errorPercentage > 50 ? 'error' : errorPercentage > 0 ? 'warning' : 'success'}" style="width: ${errorPercentage}%">
          ${errorPercentage}%
        </div>
      </div>
      <p>${pagesWithErrors} of ${totalPages} pages have errors</p>
    </div>
    
    <h3>Pages Tested</h3>
    <ul>
      ${results.map(result => `
        <li>
          <a href="#${result.name}">${result.url}</a>
          <span class="error-badge ${result.hasErrors ? 'error' : 'success'}">
            ${result.hasErrors ? 'Has Errors' : 'No Errors'}
          </span>
        </li>
      `).join('')}
    </ul>
  </div>
  
  ${results.map(result => `
    <div id="${result.name}" class="page-test ${result.hasErrors ? 'has-errors' : 'no-errors'}">
      <h2>${result.url} ${result.hasErrors ? '❌' : '✅'}</h2>
      
      <div class="section">
        <h3>Screenshot</h3>
        <img src="${result.name}.png" alt="${result.url}" class="screenshot">
      </div>
      
      ${result.error ? `
        <div class="section">
          <h3>Error</h3>
          <div class="error-details">
            <p class="error-message">${result.error.message}</p>
            <button class="collapsible">Stack Trace</button>
            <div class="content">
              <pre>${result.error.stack}</pre>
            </div>
          </div>
        </div>
      ` : ''}
      
      ${result.errors && result.errors.length > 0 ? `
        <div class="section">
          <h3>JavaScript Errors</h3>
          <table>
            <thead>
              <tr>
                <th>Type</th>
                <th>Message</th>
              </tr>
            </thead>
            <tbody>
              ${result.errors.map(error => `
                <tr>
                  <td>${error.type}</td>
                  <td>${error.message}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      ` : ''}
      
      ${result.networkErrors && result.networkErrors.length > 0 ? `
        <div class="section">
          <h3>Network Errors</h3>
          <table>
            <thead>
              <tr>
                <th>URL</th>
                <th>Method</th>
                <th>Resource Type</th>
                <th>Failure</th>
              </tr>
            </thead>
            <tbody>
              ${result.networkErrors.map(error => `
                <tr>
                  <td>${error.url}</td>
                  <td>${error.method}</td>
                  <td>${error.resourceType}</td>
                  <td>${error.failure ? error.failure.errorText : 'Unknown'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      ` : ''}
      
      ${result.visibleErrors && result.visibleErrors.length > 0 ? `
        <div class="section">
          <h3>Visible Error Messages</h3>
          <ul>
            ${result.visibleErrors.map(error => `
              <li>${error.text}</li>
            `).join('')}
          </ul>
        </div>
      ` : ''}
      
      ${result.brokenImages && result.brokenImages.length > 0 ? `
        <div class="section">
          <h3>Broken Images</h3>
          <table>
            <thead>
              <tr>
                <th>Source</th>
                <th>Alt Text</th>
              </tr>
            </thead>
            <tbody>
              ${result.brokenImages.map(image => `
                <tr>
                  <td>${image.src}</td>
                  <td>${image.alt}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      ` : ''}
      
      ${result.brokenLinks && result.brokenLinks.length > 0 ? `
        <div class="section">
          <h3>Broken Links</h3>
          <table>
            <thead>
              <tr>
                <th>Href</th>
                <th>Text</th>
              </tr>
            </thead>
            <tbody>
              ${result.brokenLinks.map(link => `
                <tr>
                  <td>${link.href}</td>
                  <td>${link.text}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      ` : ''}
      
      ${result.emptyContainers && result.emptyContainers.length > 0 ? `
        <div class="section">
          <h3>Empty Containers</h3>
          <table>
            <thead>
              <tr>
                <th>Class Name</th>
                <th>ID</th>
              </tr>
            </thead>
            <tbody>
              ${result.emptyContainers.map(container => `
                <tr>
                  <td>${container.className}</td>
                  <td>${container.id}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      ` : ''}
      
      ${result.interactiveElementsResults && result.interactiveElementsResults.some(r => !r.success) ? `
        <div class="section">
          <h3>Interactive Elements Issues</h3>
          <table>
            <thead>
              <tr>
                <th>Type</th>
                <th>Identifier</th>
                <th>Issue</th>
              </tr>
            </thead>
            <tbody>
              ${result.interactiveElementsResults.filter(r => !r.success).map(element => `
                <tr>
                  <td>${element.type}</td>
                  <td>${element.text || element.id || 'Unknown'}</td>
                  <td>${element.reason || element.error || 'Unknown issue'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      ` : ''}
      
      ${!result.hasErrors ? `
        <div class="section">
          <h3>No Errors Detected</h3>
          <p>No errors were detected on this page.</p>
        </div>
      ` : ''}
    </div>
  `).join('')}
  
  <script>
    var coll = document.getElementsByClassName("collapsible");
    var i;

    for (i = 0; i < coll.length; i++) {
      coll[i].addEventListener("click", function() {
        this.classList.toggle("active");
        var content = this.nextElementSibling;
        if (content.style.maxHeight){
          content.style.maxHeight = null;
        } else {
          content.style.maxHeight = content.scrollHeight + "px";
        } 
      });
    }
  </script>
</body>
</html>`;
}

// Run the tests
runTests();
