/**
 * Comprehensive QA Test for FinDoc Analyzer
 * 
 * This script tests all major functionality of the FinDoc Analyzer application,
 * including authentication, document processing, chat, and more.
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// Configuration
const config = {
  baseUrl: 'https://backv2-app-brfi73d4ra-zf.a.run.app', // Cloud deployment URL
  localUrl: 'http://localhost:8080', // Local URL
  testPdfPath: path.join(__dirname, 'test-files', 'test.pdf'),
  screenshotsDir: path.join(__dirname, 'test-results', 'screenshots'),
  reportsDir: path.join(__dirname, 'test-results', 'reports'),
  timeout: 30000, // 30 seconds
  slowMo: 100, // Slow down by 100ms
};

// Create directories
fs.mkdirSync(config.screenshotsDir, { recursive: true });
fs.mkdirSync(config.reportsDir, { recursive: true });

// Test results
const testResults = {
  passed: 0,
  failed: 0,
  skipped: 0,
  total: 0,
  bugs: [],
};

// Helper functions
const takeScreenshot = async (page, name) => {
  const screenshotPath = path.join(config.screenshotsDir, `${name}.png`);
  await page.screenshot({ path: screenshotPath, fullPage: true });
  return screenshotPath;
};

const logBug = async (page, description, severity = 'high', screenshotName = null) => {
  console.error(`🐞 BUG: ${description} (Severity: ${severity})`);
  
  const screenshot = screenshotName 
    ? await takeScreenshot(page, screenshotName)
    : await takeScreenshot(page, `bug-${testResults.bugs.length + 1}`);
  
  testResults.bugs.push({
    id: testResults.bugs.length + 1,
    description,
    severity,
    screenshot,
    url: page.url(),
    timestamp: new Date().toISOString(),
  });
};

const runTest = async (name, testFn) => {
  console.log(`\n🧪 Running test: ${name}`);
  testResults.total++;
  
  try {
    await testFn();
    console.log(`✅ Test passed: ${name}`);
    testResults.passed++;
  } catch (error) {
    console.error(`❌ Test failed: ${name}`);
    console.error(`   Error: ${error.message}`);
    testResults.failed++;
  }
};

// Main test function
const runTests = async (url = config.baseUrl) => {
  console.log(`\n🚀 Starting QA tests for FinDoc Analyzer at ${url}`);
  console.log(`📅 Test run started at ${new Date().toISOString()}`);
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: config.slowMo,
  });
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    recordVideo: { dir: path.join(config.reportsDir, 'videos') },
  });
  
  const page = await context.newPage();
  page.setDefaultTimeout(config.timeout);
  
  try {
    // Test 1: Basic Navigation
    await runTest('Basic Navigation', async () => {
      await page.goto(url);
      await page.waitForLoadState('networkidle');
      
      // Check if the page title is correct
      const title = await page.title();
      if (!title.includes('FinDoc Analyzer')) {
        await logBug(page, 'Incorrect page title', 'low', 'incorrect-title');
      }
      
      // Check if the sidebar is visible
      const sidebar = await page.$('.sidebar');
      if (!sidebar) {
        await logBug(page, 'Sidebar not found', 'high', 'missing-sidebar');
      }
      
      // Check navigation links
      const navLinks = [
        { text: 'Dashboard', url: '/' },
        { text: 'My Documents', url: '/documents-new' },
        { text: 'Analytics', url: '/analytics-new' },
        { text: 'Upload', url: '/upload' },
        { text: 'Chat', url: '/chat' },
        { text: 'Document Chat', url: '/document-chat' },
      ];
      
      for (const link of navLinks) {
        const linkElement = await page.locator(`.sidebar-nav a:has-text("${link.text}")`).first();
        
        if (!linkElement) {
          await logBug(page, `Navigation link "${link.text}" not found`, 'medium', `missing-link-${link.text}`);
          continue;
        }
        
        await linkElement.click();
        await page.waitForLoadState('networkidle');
        
        // Check if URL changed correctly
        const currentUrl = page.url();
        if (!currentUrl.endsWith(link.url)) {
          await logBug(page, `Navigation to "${link.text}" failed. Expected URL: ${url}${link.url}, Actual: ${currentUrl}`, 'high', `nav-failed-${link.text}`);
        }
      }
    });
    
    // Test 2: Authentication
    await runTest('Authentication', async () => {
      // Go to login page
      await page.goto(`${url}/login`);
      await page.waitForLoadState('networkidle');
      
      // Check if login form exists
      const loginForm = await page.$('#login-form');
      if (!loginForm) {
        await logBug(page, 'Login form not found', 'critical', 'missing-login-form');
      }
      
      // Check if Google login button exists
      const googleLoginBtn = await page.$('#google-login-btn');
      if (!googleLoginBtn) {
        await logBug(page, 'Google login button not found', 'critical', 'missing-google-login');
      } else {
        // Test Google login
        await googleLoginBtn.click();
        await page.waitForTimeout(2000);
        
        // Check if we get a 404 error
        const pageContent = await page.content();
        if (pageContent.includes('404 - Page Not Found') || pageContent.includes('does not exist')) {
          await logBug(page, 'Google login leads to 404 page', 'critical', 'google-login-404');
        }
      }
      
      // Go to signup page
      await page.goto(`${url}/signup`);
      await page.waitForLoadState('networkidle');
      
      // Check if signup form exists
      const signupForm = await page.$('#signup-form');
      if (!signupForm) {
        await logBug(page, 'Signup form not found', 'critical', 'missing-signup-form');
      }
    });
    
    // Test 3: Document Upload
    await runTest('Document Upload', async () => {
      await page.goto(`${url}/upload`);
      await page.waitForLoadState('networkidle');
      
      // Check if upload form exists
      const uploadForm = await page.$('.upload-form');
      if (!uploadForm) {
        await logBug(page, 'Upload form not found', 'critical', 'missing-upload-form');
      } else {
        // Check if file input exists
        const fileInput = await page.$('input[type="file"]');
        if (!fileInput) {
          await logBug(page, 'File input not found', 'critical', 'missing-file-input');
        } else {
          // Create test PDF if it doesn't exist
          if (!fs.existsSync(config.testPdfPath)) {
            fs.mkdirSync(path.dirname(config.testPdfPath), { recursive: true });
            
            // Create a simple PDF with some text and an ISIN code
            const pdfContent = `
%PDF-1.5
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
(This is a test PDF document for QA testing.) Tj
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
%%EOF
`;
            fs.writeFileSync(config.testPdfPath, pdfContent);
          }
          
          // Upload test PDF
          await fileInput.setInputFiles(config.testPdfPath);
          
          // Check if upload button exists
          const uploadButton = await page.$('button[type="submit"]');
          if (!uploadButton) {
            await logBug(page, 'Upload button not found', 'critical', 'missing-upload-button');
          } else {
            // Click upload button
            await uploadButton.click();
            await page.waitForTimeout(5000);
            
            // Check if upload was successful
            const successMessage = await page.$('.notification.success');
            if (!successMessage) {
              await logBug(page, 'No success message after upload', 'high', 'missing-upload-success');
            }
          }
        }
      }
    });
    
    // Test 4: Document List
    await runTest('Document List', async () => {
      await page.goto(`${url}/documents-new`);
      await page.waitForLoadState('networkidle');
      
      // Check if document list exists
      const documentList = await page.$('.document-list');
      if (!documentList) {
        await logBug(page, 'Document list not found', 'high', 'missing-document-list');
      } else {
        // Check if there are documents
        const documents = await page.$$('.document-item');
        if (documents.length === 0) {
          await logBug(page, 'No documents found in document list', 'medium', 'empty-document-list');
        } else {
          // Check if document actions exist
          const documentActions = await page.$('.document-actions');
          if (!documentActions) {
            await logBug(page, 'Document actions not found', 'high', 'missing-document-actions');
          }
          
          // Check if process button exists
          const processButton = await page.$('#process-document-btn');
          if (!processButton) {
            await logBug(page, 'Process document button not found', 'critical', 'missing-process-button');
          } else {
            // Click on first document
            await documents[0].click();
            await page.waitForTimeout(2000);
            
            // Check if document detail page loaded
            const documentDetail = await page.$('.document-detail');
            if (!documentDetail) {
              await logBug(page, 'Document detail page not loaded after clicking document', 'high', 'missing-document-detail');
            }
          }
        }
      }
    });
    
    // Test 5: Document Processing
    await runTest('Document Processing', async () => {
      await page.goto(`${url}/documents-new`);
      await page.waitForLoadState('networkidle');
      
      // Check if process button exists
      const processButton = await page.$('#process-document-btn');
      if (!processButton) {
        await logBug(page, 'Process document button not found', 'critical', 'missing-process-button-2');
      } else {
        // Click process button
        await processButton.click();
        await page.waitForTimeout(2000);
        
        // Check if we're on documents page
        const currentUrl = page.url();
        if (!currentUrl.includes('/documents-new')) {
          await logBug(page, `Process button didn't navigate to documents page. Current URL: ${currentUrl}`, 'high', 'process-navigation-failed');
        }
        
        // Check if there are documents
        const documents = await page.$$('.document-item');
        if (documents.length === 0) {
          await logBug(page, 'No documents found to process', 'medium', 'no-documents-to-process');
        } else {
          // Click on first document
          await documents[0].click();
          await page.waitForTimeout(2000);
          
          // Check if document detail page has process button
          const detailProcessButton = await page.$('.document-detail button:has-text("Process")');
          if (!detailProcessButton) {
            await logBug(page, 'Process button not found on document detail page', 'high', 'missing-detail-process-button');
          } else {
            // Click process button
            await detailProcessButton.click();
            await page.waitForTimeout(5000);
            
            // Check if processing started
            const processingIndicator = await page.$('.processing-indicator');
            if (!processingIndicator) {
              await logBug(page, 'No processing indicator after clicking process button', 'high', 'missing-processing-indicator');
            }
          }
        }
      }
    });
    
    // Test 6: Document Chat
    await runTest('Document Chat', async () => {
      await page.goto(`${url}/document-chat`);
      await page.waitForLoadState('networkidle');
      
      // Check if chat container exists
      const chatContainer = await page.$('#document-chat-container');
      if (!chatContainer) {
        await logBug(page, 'Document chat container not found', 'critical', 'missing-chat-container');
      } else {
        // Check if chat input exists
        const chatInput = await page.$('#document-chat-input');
        if (!chatInput) {
          await logBug(page, 'Document chat input not found', 'critical', 'missing-chat-input');
        } else {
          // Type a question
          await chatInput.fill('What is the ISIN code for Apple?');
          
          // Check if send button exists
          const sendButton = await page.$('#document-send-btn');
          if (!sendButton) {
            await logBug(page, 'Document chat send button not found', 'critical', 'missing-chat-send-button');
          } else {
            // Click send button
            await sendButton.click();
            await page.waitForTimeout(5000);
            
            // Check if response was received
            const aiMessage = await page.$('.ai-message');
            if (!aiMessage) {
              await logBug(page, 'No AI response received in document chat', 'high', 'missing-ai-response');
            }
          }
        }
      }
    });
    
    // Test 7: Analytics
    await runTest('Analytics', async () => {
      await page.goto(`${url}/analytics-new`);
      await page.waitForLoadState('networkidle');
      
      // Check if analytics container exists
      const analyticsContainer = await page.$('.analytics-container');
      if (!analyticsContainer) {
        await logBug(page, 'Analytics container not found', 'high', 'missing-analytics-container');
      } else {
        // Check if charts exist
        const charts = await page.$$('.chart-container');
        if (charts.length === 0) {
          await logBug(page, 'No charts found in analytics page', 'medium', 'missing-charts');
        }
      }
    });
    
    // Test 8: Agent Functionality
    await runTest('Agent Functionality', async () => {
      await page.goto(`${url}/test`);
      await page.waitForLoadState('networkidle');
      
      // Check if agent cards exist
      const agentCards = await page.$$('.agent-card');
      if (agentCards.length === 0) {
        await logBug(page, 'No agent cards found on test page', 'high', 'missing-agent-cards');
      } else {
        // Check if agent status indicators exist
        const statusIndicators = await page.$$('.status-indicator');
        if (statusIndicators.length === 0) {
          await logBug(page, 'No agent status indicators found', 'medium', 'missing-status-indicators');
        }
        
        // Check if agent action buttons exist
        const agentActions = await page.$$('.agent-action');
        if (agentActions.length === 0) {
          await logBug(page, 'No agent action buttons found', 'medium', 'missing-agent-actions');
        } else {
          // Click on first agent action button
          await agentActions[0].click();
          await page.waitForTimeout(5000);
          
          // Check if agent notification appears
          const agentNotification = await page.$('#agent-notification');
          if (!agentNotification || !(await agentNotification.isVisible())) {
            await logBug(page, 'No agent notification after clicking agent action', 'medium', 'missing-agent-notification');
          }
        }
      }
    });
    
    // Generate report
    const reportPath = path.join(config.reportsDir, `qa-report-${new Date().toISOString().replace(/:/g, '-')}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(testResults, null, 2));
    
    console.log(`\n📊 Test Results:`);
    console.log(`   Total: ${testResults.total}`);
    console.log(`   Passed: ${testResults.passed}`);
    console.log(`   Failed: ${testResults.failed}`);
    console.log(`   Skipped: ${testResults.skipped}`);
    console.log(`   Bugs Found: ${testResults.bugs.length}`);
    console.log(`\n📝 Report saved to: ${reportPath}`);
    
    // Generate HTML report
    const htmlReportPath = path.join(config.reportsDir, `qa-report-${new Date().toISOString().replace(/:/g, '-')}.html`);
    const htmlReport = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>FinDoc Analyzer QA Report</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      margin: 0;
      padding: 20px;
      color: #333;
    }
    h1, h2, h3 {
      color: #2c3e50;
    }
    .summary {
      background-color: #f8f9fa;
      border-radius: 5px;
      padding: 15px;
      margin-bottom: 20px;
    }
    .stats {
      display: flex;
      gap: 20px;
      margin-bottom: 20px;
    }
    .stat {
      background-color: #fff;
      border-radius: 5px;
      padding: 15px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      flex: 1;
    }
    .stat h3 {
      margin-top: 0;
    }
    .stat.passed {
      border-left: 5px solid #28a745;
    }
    .stat.failed {
      border-left: 5px solid #dc3545;
    }
    .stat.skipped {
      border-left: 5px solid #ffc107;
    }
    .stat.total {
      border-left: 5px solid #17a2b8;
    }
    .bug-list {
      margin-top: 20px;
    }
    .bug {
      background-color: #fff;
      border-radius: 5px;
      padding: 15px;
      margin-bottom: 15px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .bug-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
    }
    .bug-id {
      font-weight: bold;
      color: #6c757d;
    }
    .bug-severity {
      padding: 5px 10px;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 500;
    }
    .bug-severity.critical {
      background-color: #dc3545;
      color: #fff;
    }
    .bug-severity.high {
      background-color: #fd7e14;
      color: #fff;
    }
    .bug-severity.medium {
      background-color: #ffc107;
      color: #212529;
    }
    .bug-severity.low {
      background-color: #6c757d;
      color: #fff;
    }
    .bug-description {
      margin-bottom: 10px;
    }
    .bug-screenshot {
      max-width: 100%;
      height: auto;
      border: 1px solid #dee2e6;
      border-radius: 5px;
    }
    .bug-meta {
      display: flex;
      justify-content: space-between;
      font-size: 0.8rem;
      color: #6c757d;
      margin-top: 10px;
    }
  </style>
</head>
<body>
  <h1>FinDoc Analyzer QA Report</h1>
  <div class="summary">
    <p>Test run completed at ${new Date().toISOString()}</p>
    <p>Tested URL: ${url}</p>
  </div>
  
  <div class="stats">
    <div class="stat total">
      <h3>Total Tests</h3>
      <p>${testResults.total}</p>
    </div>
    <div class="stat passed">
      <h3>Passed</h3>
      <p>${testResults.passed}</p>
    </div>
    <div class="stat failed">
      <h3>Failed</h3>
      <p>${testResults.failed}</p>
    </div>
    <div class="stat skipped">
      <h3>Skipped</h3>
      <p>${testResults.skipped}</p>
    </div>
  </div>
  
  <h2>Bugs Found (${testResults.bugs.length})</h2>
  <div class="bug-list">
    ${testResults.bugs.map(bug => `
      <div class="bug">
        <div class="bug-header">
          <span class="bug-id">Bug #${bug.id}</span>
          <span class="bug-severity ${bug.severity}">${bug.severity}</span>
        </div>
        <div class="bug-description">
          <p>${bug.description}</p>
        </div>
        <img src="${path.relative(config.reportsDir, bug.screenshot)}" alt="Bug Screenshot" class="bug-screenshot">
        <div class="bug-meta">
          <span>URL: ${bug.url}</span>
          <span>Timestamp: ${bug.timestamp}</span>
        </div>
      </div>
    `).join('')}
  </div>
</body>
</html>
    `;
    
    fs.writeFileSync(htmlReportPath, htmlReport);
    console.log(`📄 HTML Report saved to: ${htmlReportPath}`);
    
  } finally {
    await context.close();
    await browser.close();
  }
};

// Run tests
if (require.main === module) {
  // Check if URL is provided as command line argument
  const url = process.argv[2] || config.baseUrl;
  runTests(url).catch(console.error);
}

module.exports = {
  runTests,
};
