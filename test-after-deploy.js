/**
 * Test After Deployment
 * 
 * This script tests the FinDoc Analyzer application after deployment to verify that our changes are visible.
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Configuration
const config = {
  url: 'https://findoc-deploy.ey.r.appspot.com',
  screenshotsDir: path.join(__dirname, 'after-deploy-test'),
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
 * @param {string} expectedTitle - Expected page title
 * @param {Array<string>} expectedElements - Expected elements on the page
 * @returns {Promise<object>} Test results
 */
async function testPage(page, url, name, expectedTitle, expectedElements) {
  console.log(`Testing page: ${url}`);
  
  // Navigate to the page
  await page.goto(url, { timeout: config.timeout, waitUntil: 'networkidle2' });
  
  // Take a screenshot
  await takeScreenshot(page, name);
  
  // Get page title
  const title = await page.title();
  const titleMatch = title.includes(expectedTitle);
  
  // Check for expected elements
  const elementResults = [];
  for (const element of expectedElements) {
    const exists = await page.evaluate((selector) => {
      return document.querySelector(selector) !== null;
    }, element);
    
    elementResults.push({
      selector: element,
      exists
    });
  }
  
  return {
    url,
    title,
    titleMatch,
    elementResults
  };
}

/**
 * Run the tests
 */
async function runTests() {
  console.log('Starting tests after deployment...');
  
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
        name: '01-homepage',
        expectedTitle: 'FinDoc Analyzer',
        expectedElements: ['.sidebar', '.main-content', '.dashboard-header']
      },
      {
        url: `${config.url}/documents-new`,
        name: '02-documents-new',
        expectedTitle: 'FinDoc Analyzer',
        expectedElements: ['.documents-page', '.document-grid', '.document-card']
      },
      {
        url: `${config.url}/analytics-new`,
        name: '03-analytics-new',
        expectedTitle: 'FinDoc Analyzer',
        expectedElements: ['.analytics-page', '.analytics-header', '.chart-container']
      },
      {
        url: `${config.url}/feedback`,
        name: '04-feedback',
        expectedTitle: 'FinDoc Analyzer',
        expectedElements: ['.feedback-page', '.feedback-form', '.rating-container']
      },
      {
        url: `${config.url}/document-comparison`,
        name: '05-document-comparison',
        expectedTitle: 'FinDoc Analyzer',
        expectedElements: ['.document-comparison-page', '.comparison-container', '.document-selection']
      }
    ];
    
    // Test each page
    const results = [];
    for (const pageInfo of pagesToTest) {
      const result = await testPage(
        page,
        pageInfo.url,
        pageInfo.name,
        pageInfo.expectedTitle,
        pageInfo.expectedElements
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
    
    console.log('Tests after deployment completed.');
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
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>FinDoc Analyzer Test Report</title>
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
  </style>
</head>
<body>
  <h1>FinDoc Analyzer Test Report</h1>
  
  <div class="section">
    <h2>Summary</h2>
    <p>This report documents the results of testing the FinDoc Analyzer application after deployment.</p>
    
    <h3>Pages Tested</h3>
    <ul>
      ${results.map(result => `<li><a href="#${result.url.split('/').pop() || 'homepage'}">${result.url}</a> - ${result.titleMatch ? '✅ Pass' : '❌ Fail'}</li>`).join('')}
    </ul>
  </div>
  
  ${results.map(result => `
    <div id="${result.url.split('/').pop() || 'homepage'}" class="page-test">
      <h2>${result.url}</h2>
      
      <div class="section">
        <h3>Screenshot</h3>
        <img src="${result.url.split('/').pop() || '01-homepage'}.png" alt="${result.url}" class="screenshot">
      </div>
      
      <div class="section">
        <h3>Title</h3>
        <p>
          <span class="result-badge ${result.titleMatch ? 'success' : 'failure'}">
            ${result.titleMatch ? 'Pass' : 'Fail'}
          </span>
          Expected: ${result.url.split('/').pop() || 'Homepage'} to include "${result.expectedTitle}"
          <br>
          Actual: "${result.title}"
        </p>
      </div>
      
      <div class="section">
        <h3>Elements</h3>
        <table>
          <thead>
            <tr>
              <th>Selector</th>
              <th>Result</th>
            </tr>
          </thead>
          <tbody>
            ${result.elementResults.map(element => `
              <tr>
                <td>${element.selector}</td>
                <td>
                  <span class="result-badge ${element.exists ? 'success' : 'failure'}">
                    ${element.exists ? 'Found' : 'Not Found'}
                  </span>
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
