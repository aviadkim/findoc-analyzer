/**
 * Focused Web Test for UI Issues
 * 
 * This script specifically tests for:
 * 1. Missing/non-functional buttons
 * 2. Processing issues
 * 3. Chatbot problems
 * 4. Other UI issues
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// Configuration
const config = {
  baseUrl: 'http://localhost:8080',
  screenshotsDir: path.join(__dirname, 'ui-test-screenshots'),
  timeout: 30000,
  testPdfPath: path.join(__dirname, 'test-files', 'test.pdf')
};

// Create screenshots directory
if (!fs.existsSync(config.screenshotsDir)) {
  fs.mkdirSync(config.screenshotsDir, { recursive: true });
}

// Ensure test PDF exists
async function ensureTestPdfExists() {
  const testDir = path.dirname(config.testPdfPath);
  
  if (!fs.existsSync(testDir)) {
    fs.mkdirSync(testDir, { recursive: true });
  }
  
  if (!fs.existsSync(config.testPdfPath)) {
    // Create a simple test PDF content
    const pdfContent = `%PDF-1.5
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>
endobj
4 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
5 0 obj
<< /Length 178 >>
stream
BT
/F1 12 Tf
72 720 Td
(This is a test PDF document for integration testing.) Tj
0 -20 Td
(It contains an ISIN code: US0378331005 (Apple Inc.)) Tj
0 -20 Td
(And another one: US5949181045 (Microsoft Corporation)) Tj
ET
endstream
endobj
xref
0 6
0000000000 65535 f
0000000010 00000 n
0000000059 00000 n
0000000118 00000 n
0000000217 00000 n
0000000284 00000 n
trailer
<< /Size 6 /Root 1 0 R >>
startxref
514
%%EOF`;
    
    fs.writeFileSync(config.testPdfPath, pdfContent);
    console.log(`Created test PDF: ${config.testPdfPath}`);
  }
}

// Take screenshot
async function takeScreenshot(page, name) {
  const screenshotPath = path.join(config.screenshotsDir, `${name}.png`);
  await page.screenshot({ path: screenshotPath, fullPage: true });
  console.log(`Screenshot saved: ${screenshotPath}`);
  return screenshotPath;
}

// Check if element exists
async function elementExists(page, selector, timeoutMs = 2000) {
  try {
    await page.waitForSelector(selector, { timeout: timeoutMs });
    return true;
  } catch (error) {
    return false;
  }
}

// Wait for element with timeout and return success/failure
async function waitForElementWithTimeout(page, selector, timeoutMs = 10000) {
  try {
    await page.waitForSelector(selector, { timeout: timeoutMs });
    return true;
  } catch (error) {
    return false;
  }
}

// Test all pages and UI functionality
async function runUiTest() {
  console.log('Starting UI test to identify issues...');
  
  // Create result structure
  const results = {
    timestamp: new Date().toISOString(),
    issues: [],
    pages: {}
  };
  
  // Ensure test PDF exists
  await ensureTestPdfExists();
  
  // Launch browser in headless mode to avoid dependency issues
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewportSize: { width: 1280, height: 800 } });
  const page = await context.newPage();
  
  try {
    // 1. Test homepage
    console.log('\nTesting homepage...');
    await page.goto(config.baseUrl);
    await takeScreenshot(page, '01-homepage');
    
    results.pages.homepage = { url: page.url(), title: await page.title() };
    
    // Check sidebar navigation
    const hasNavbar = await elementExists(page, 'nav, .sidebar, #sidebar');
    if (!hasNavbar) {
      results.issues.push({
        page: 'homepage',
        issue: 'No navigation sidebar found',
        severity: 'high'
      });
    }
    
    // 2. Navigate to upload page
    console.log('\nNavigating to upload page...');
    const uploadLinkSelector = 'a[href*="upload"], a:text("Upload")';
    
    if (await elementExists(page, uploadLinkSelector)) {
      await page.click(uploadLinkSelector);
    } else {
      results.issues.push({
        page: 'homepage',
        issue: 'Upload link not found in navigation',
        severity: 'critical'
      });
      // Try direct navigation
      await page.goto(`${config.baseUrl}/upload`);
    }
    
    await takeScreenshot(page, '02-upload-page');
    results.pages.upload = { url: page.url(), title: await page.title() };
    
    // 3. Check for file input on upload page
    console.log('\nChecking file input...');
    const fileInputSelector = 'input[type="file"]';
    const hasFileInput = await elementExists(page, fileInputSelector);
    
    if (!hasFileInput) {
      results.issues.push({
        page: 'upload',
        issue: 'File input not found on upload page',
        severity: 'critical'
      });
    } else {
      // 4. Test file upload
      console.log('\nTesting file upload...');
      const fileInput = await page.$(fileInputSelector);
      await fileInput.setInputFiles(config.testPdfPath);
      await takeScreenshot(page, '03-file-uploaded');
      
      // 5. Check for process button
      console.log('\nChecking process button...');
      const processButtonSelector = 'button:text("Process"), input[value="Process"], .process-button';
      const hasProcessButton = await elementExists(page, processButtonSelector);
      
      if (!hasProcessButton) {
        results.issues.push({
          page: 'upload',
          issue: 'Process button not found after file upload',
          severity: 'critical'
        });
      } else {
        // 6. Test process button click
        console.log('\nTesting process button click...');
        await page.click(processButtonSelector);
        await takeScreenshot(page, '04-processing');
        
        // Wait for processing indicators
        const processingStarted = await waitForElementWithTimeout(page, '.processing, .loader, .spinner, .progress');
        
        if (!processingStarted) {
          results.issues.push({
            page: 'upload',
            issue: 'No processing indicator appeared after clicking Process button',
            severity: 'high'
          });
        }
        
        // Wait for processing to complete
        console.log('Waiting for processing to complete...');
        await page.waitForTimeout(15000);
        await takeScreenshot(page, '05-after-processing');
        
        // Check for results
        const resultsAppeared = await elementExists(page, '.results, .data, #results, [data-testid="results"]');
        
        if (!resultsAppeared) {
          results.issues.push({
            page: 'upload',
            issue: 'No results appeared after processing',
            severity: 'critical'
          });
        }
      }
    }
    
    // 7. Navigate to documents page
    console.log('\nNavigating to documents page...');
    const documentsUrl = `${config.baseUrl}/documents-new`;
    await page.goto(documentsUrl);
    await takeScreenshot(page, '06-documents-page');
    
    results.pages.documents = { url: page.url(), title: await page.title() };
    
    // Check for document cards
    const hasDocumentCards = await elementExists(page, '.document, .document-card, .file-card');
    
    if (!hasDocumentCards) {
      results.issues.push({
        page: 'documents',
        issue: 'No document cards found on documents page',
        severity: 'high'
      });
    } else {
      // 8. Test document card click
      console.log('\nTesting document card click...');
      await page.click('.document, .document-card, .file-card');
      await takeScreenshot(page, '07-document-details');
      
      // Check for document details
      const hasDocumentDetails = await elementExists(page, '.document-details, .file-details, #details');
      
      if (!hasDocumentDetails) {
        results.issues.push({
          page: 'documents',
          issue: 'No document details appeared after clicking document card',
          severity: 'high'
        });
      }
    }
    
    // 9. Test document chat
    console.log('\nTesting document chat functionality...');
    
    // Try to navigate to document chat
    try {
      await page.goto(`${config.baseUrl}/document-chat`);
      await takeScreenshot(page, '08-document-chat-page');
      
      results.pages.documentChat = { url: page.url(), title: await page.title() };
      
      // Check for chat input
      const hasChatInput = await elementExists(page, 'input[type="text"], textarea, .chat-input');
      
      if (!hasChatInput) {
        results.issues.push({
          page: 'document-chat',
          issue: 'No chat input found on document chat page',
          severity: 'high'
        });
      } else {
        // Test sending a message
        console.log('\nTesting sending a message in document chat...');
        await page.fill('input[type="text"], textarea, .chat-input', 'What is this document about?');
        await page.press('input[type="text"], textarea, .chat-input', 'Enter');
        await takeScreenshot(page, '09-document-chat-message-sent');
        
        // Wait for response
        console.log('Waiting for chat response...');
        await page.waitForTimeout(10000);
        await takeScreenshot(page, '10-document-chat-response');
        
        // Check for response
        const hasResponse = await elementExists(page, '.chat-message.received, .message.bot, .message.agent');
        
        if (!hasResponse) {
          results.issues.push({
            page: 'document-chat',
            issue: 'No response received in document chat',
            severity: 'high'
          });
        }
      }
    } catch (error) {
      results.issues.push({
        page: 'document-chat',
        issue: 'Failed to navigate to document chat page',
        severity: 'medium',
        error: error.message
      });
    }
    
    // 10. Test chat button on any page
    console.log('\nTesting chat button on main pages...');
    
    // List of pages to check for chat button
    const pagesToCheck = [
      { name: 'homepage', url: config.baseUrl },
      { name: 'upload', url: `${config.baseUrl}/upload` },
      { name: 'documents', url: documentsUrl }
    ];
    
    let chatButtonFoundOnAnyPage = false;
    
    for (const pageInfo of pagesToCheck) {
      await page.goto(pageInfo.url);
      await page.waitForTimeout(2000);
      
      const hasChatButton = await elementExists(page, 'button:text("Chat"), .chat-button, #chatButton');
      
      if (hasChatButton) {
        chatButtonFoundOnAnyPage = true;
        console.log(`Chat button found on ${pageInfo.name} page`);
        
        // Test chat button functionality
        await page.click('button:text("Chat"), .chat-button, #chatButton');
        await takeScreenshot(page, `11-chat-opened-from-${pageInfo.name}`);
        
        // Check for chat input
        const hasChatInput = await elementExists(page, 'input[type="text"].chat-input, textarea.chat-input, .chat-input');
        
        if (!hasChatInput) {
          results.issues.push({
            page: pageInfo.name,
            issue: 'Chat button exists but no chat input appears after clicking it',
            severity: 'high'
          });
        } else {
          // Test sending a message
          await page.fill('input[type="text"].chat-input, textarea.chat-input, .chat-input', 'Hello, can you help me?');
          await page.press('input[type="text"].chat-input, textarea.chat-input, .chat-input', 'Enter');
          await takeScreenshot(page, `12-chat-message-sent-from-${pageInfo.name}`);
          
          // Wait for response
          await page.waitForTimeout(10000);
          await takeScreenshot(page, `13-chat-response-from-${pageInfo.name}`);
          
          // Check for response
          const hasResponse = await elementExists(page, '.chat-message.received, .message.bot, .message.agent');
          
          if (!hasResponse) {
            results.issues.push({
              page: pageInfo.name,
              issue: 'No response received in global chat',
              severity: 'high'
            });
          }
        }
        
        break; // We found and tested a chat button, no need to check other pages
      }
    }
    
    if (!chatButtonFoundOnAnyPage) {
      results.issues.push({
        page: 'global',
        issue: 'Chat button not found on any page',
        severity: 'high'
      });
    }
    
    // 11. Test analytics page
    console.log('\nTesting analytics page...');
    await page.goto(`${config.baseUrl}/analytics-new`);
    await takeScreenshot(page, '14-analytics-page');
    
    results.pages.analytics = { url: page.url(), title: await page.title() };
    
    // Check for charts
    const hasCharts = await elementExists(page, 'canvas, .chart, .graph');
    
    if (!hasCharts) {
      results.issues.push({
        page: 'analytics',
        issue: 'No charts or graphs found on analytics page',
        severity: 'medium'
      });
    }
    
    // 12. Test document comparison page
    console.log('\nTesting document comparison page...');
    await page.goto(`${config.baseUrl}/document-comparison`);
    await takeScreenshot(page, '15-comparison-page');
    
    results.pages.comparison = { url: page.url(), title: await page.title() };
    
    // Check for comparison form
    const hasComparisonForm = await elementExists(page, 'form, .comparison-form, select');
    
    if (!hasComparisonForm) {
      results.issues.push({
        page: 'comparison',
        issue: 'No comparison form or document selection found',
        severity: 'medium'
      });
    }
    
    // Generate summary
    results.summary = {
      pagesChecked: Object.keys(results.pages).length,
      issuesFound: results.issues.length,
      criticalIssues: results.issues.filter(issue => issue.severity === 'critical').length,
      highIssues: results.issues.filter(issue => issue.severity === 'high').length,
      mediumIssues: results.issues.filter(issue => issue.severity === 'medium').length
    };
    
    // Save results to file
    const resultsPath = path.join(config.screenshotsDir, 'ui-issues.json');
    fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
    console.log(`\nResults saved to: ${resultsPath}`);
    
    // Generate HTML report
    const htmlReport = generateHtmlReport(results);
    const reportPath = path.join(config.screenshotsDir, 'ui-issues-report.html');
    fs.writeFileSync(reportPath, htmlReport);
    console.log(`HTML report saved to: ${reportPath}`);
    
    // Display issues summary
    console.log('\n--- Issues Summary ---');
    console.log(`Total issues found: ${results.issues.length}`);
    console.log(`Critical issues: ${results.summary.criticalIssues}`);
    console.log(`High-priority issues: ${results.summary.highIssues}`);
    console.log(`Medium-priority issues: ${results.summary.mediumIssues}`);
    
    if (results.issues.length > 0) {
      console.log('\nTop issues:');
      results.issues
        .filter(issue => issue.severity === 'critical' || issue.severity === 'high')
        .slice(0, 5)
        .forEach((issue, index) => {
          console.log(`${index + 1}. [${issue.severity.toUpperCase()}] ${issue.page}: ${issue.issue}`);
        });
    }
    
    return results;
  } catch (error) {
    console.error('Test failed with error:', error);
    results.error = error.message;
    return results;
  } finally {
    await browser.close();
  }
}

// Generate HTML report
function generateHtmlReport(results) {
  const css = `
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }
    h1, h2 {
      color: #0066cc;
    }
    .summary {
      display: flex;
      flex-wrap: wrap;
      gap: 15px;
      margin-bottom: 30px;
    }
    .summary-box {
      background-color: #f5f5f5;
      border-radius: 8px;
      padding: 15px;
      min-width: 150px;
      text-align: center;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .summary-box.critical {
      background-color: #ffebee;
      border-left: 5px solid #f44336;
    }
    .summary-box.high {
      background-color: #fff8e1;
      border-left: 5px solid #ffc107;
    }
    .summary-box.medium {
      background-color: #e8f5e9;
      border-left: 5px solid #4caf50;
    }
    .summary-number {
      font-size: 2em;
      font-weight: bold;
      margin: 10px 0;
    }
    .issues {
      margin-top: 30px;
    }
    .issue {
      background-color: #f9f9f9;
      border-radius: 8px;
      padding: 15px;
      margin-bottom: 15px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .issue.critical {
      background-color: #ffebee;
      border-left: 5px solid #f44336;
    }
    .issue.high {
      background-color: #fff8e1;
      border-left: 5px solid #ffc107;
    }
    .issue.medium {
      background-color: #e8f5e9;
      border-left: 5px solid #4caf50;
    }
    .screenshots {
      margin-top: 30px;
    }
    .screenshot-gallery {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 20px;
      margin-top: 20px;
    }
    .screenshot-item {
      border: 1px solid #ddd;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .screenshot-item p {
      padding: 10px;
      margin: 0;
      background-color: #f5f5f5;
      border-top: 1px solid #ddd;
    }
  `;
  
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>UI Issues Report</title>
      <style>${css}</style>
    </head>
    <body>
      <h1>UI Issues Report</h1>
      <p>Test run on: ${new Date(results.timestamp).toLocaleString()}</p>
      
      <div class="summary">
        <div class="summary-box">
          <div>Pages Checked</div>
          <div class="summary-number">${results.summary.pagesChecked}</div>
        </div>
        <div class="summary-box">
          <div>Total Issues</div>
          <div class="summary-number">${results.summary.issuesFound}</div>
        </div>
        <div class="summary-box critical">
          <div>Critical Issues</div>
          <div class="summary-number">${results.summary.criticalIssues}</div>
        </div>
        <div class="summary-box high">
          <div>High-Priority Issues</div>
          <div class="summary-number">${results.summary.highIssues}</div>
        </div>
        <div class="summary-box medium">
          <div>Medium-Priority Issues</div>
          <div class="summary-number">${results.summary.mediumIssues}</div>
        </div>
      </div>
      
      <div class="issues">
        <h2>Issues Found</h2>
        ${results.issues.map(issue => `
          <div class="issue ${issue.severity}">
            <h3>Issue on ${issue.page} page</h3>
            <p><strong>Description:</strong> ${issue.issue}</p>
            <p><strong>Severity:</strong> ${issue.severity}</p>
            ${issue.error ? `<p><strong>Error:</strong> ${issue.error}</p>` : ''}
          </div>
        `).join('')}
      </div>
      
      <h2>Screenshots</h2>
      <p>Screenshot files can be found in the <code>${config.screenshotsDir}</code> directory.</p>
    </body>
    </html>
  `;
  
  return html;
}

// Run the test
runUiTest().catch(console.error);