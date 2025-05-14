/**
 * Basic QA Test for FinDoc Analyzer
 * 
 * This script tests the most critical functionality of the FinDoc Analyzer application.
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
  timeout: 30000, // 30 seconds
};

// Create directories
fs.mkdirSync(config.screenshotsDir, { recursive: true });
fs.mkdirSync(path.dirname(config.testPdfPath), { recursive: true });

// Helper functions
const takeScreenshot = async (page, name) => {
  const screenshotPath = path.join(config.screenshotsDir, `${name}.png`);
  await page.screenshot({ path: screenshotPath, fullPage: true });
  console.log(`Screenshot saved: ${screenshotPath}`);
  return screenshotPath;
};

// Create test PDF if it doesn't exist
const createTestPdf = () => {
  if (fs.existsSync(config.testPdfPath)) {
    console.log(`Test PDF already exists at ${config.testPdfPath}`);
    return;
  }
  
  console.log(`Creating test PDF at ${config.testPdfPath}`);
  
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
};

// Main test function
const runBasicTests = async (url = config.baseUrl) => {
  console.log(`\n🚀 Starting basic QA tests for FinDoc Analyzer at ${url}`);
  console.log(`📅 Test run started at ${new Date().toISOString()}`);
  
  // Create test PDF
  createTestPdf();
  
  const browser = await chromium.launch({ 
    headless: false,
  });
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
  });
  
  const page = await context.newPage();
  page.setDefaultTimeout(config.timeout);
  
  try {
    // Test 1: Basic Navigation
    console.log('\n🧪 Test 1: Basic Navigation');
    await page.goto(url);
    await page.waitForLoadState('networkidle');
    await takeScreenshot(page, 'homepage');
    
    console.log('Checking sidebar navigation...');
    const sidebar = await page.$('.sidebar');
    if (!sidebar) {
      console.error('❌ Sidebar not found');
      await takeScreenshot(page, 'missing-sidebar');
    } else {
      console.log('✅ Sidebar found');
    }
    
    // Test navigation to Documents page
    console.log('Navigating to Documents page...');
    await page.click('.sidebar-nav a:has-text("My Documents")');
    await page.waitForLoadState('networkidle');
    await takeScreenshot(page, 'documents-page');
    
    if (page.url().includes('/documents-new')) {
      console.log('✅ Successfully navigated to Documents page');
    } else {
      console.error(`❌ Failed to navigate to Documents page. Current URL: ${page.url()}`);
    }
    
    // Test 2: Authentication
    console.log('\n🧪 Test 2: Authentication');
    await page.goto(`${url}/login`);
    await page.waitForLoadState('networkidle');
    await takeScreenshot(page, 'login-page');
    
    // Check if login form exists
    const loginForm = await page.$('#login-form');
    if (!loginForm) {
      console.error('❌ Login form not found');
    } else {
      console.log('✅ Login form found');
    }
    
    // Check if Google login button exists
    const googleLoginBtn = await page.$('#google-login-btn');
    if (!googleLoginBtn) {
      console.error('❌ Google login button not found');
    } else {
      console.log('✅ Google login button found');
      
      // Test Google login
      console.log('Testing Google login...');
      await googleLoginBtn.click();
      await page.waitForTimeout(2000);
      await takeScreenshot(page, 'google-login-result');
      
      // Check if we get a 404 error
      const pageContent = await page.content();
      if (pageContent.includes('404 - Page Not Found') || pageContent.includes('does not exist')) {
        console.error('❌ Google login leads to 404 page');
      }
    }
    
    // Test 3: Document Upload
    console.log('\n🧪 Test 3: Document Upload');
    await page.goto(`${url}/upload`);
    await page.waitForLoadState('networkidle');
    await takeScreenshot(page, 'upload-page');
    
    // Check if upload form exists
    const uploadForm = await page.$('.upload-form');
    if (!uploadForm) {
      console.error('❌ Upload form not found');
    } else {
      console.log('✅ Upload form found');
      
      // Check if file input exists
      const fileInput = await page.$('input[type="file"]');
      if (!fileInput) {
        console.error('❌ File input not found');
      } else {
        console.log('✅ File input found');
        
        // Upload test PDF
        console.log('Uploading test PDF...');
        await fileInput.setInputFiles(config.testPdfPath);
        
        // Check if upload button exists
        const uploadButton = await page.$('button[type="submit"]');
        if (!uploadButton) {
          console.error('❌ Upload button not found');
        } else {
          console.log('✅ Upload button found');
          
          // Click upload button
          await uploadButton.click();
          await page.waitForTimeout(5000);
          await takeScreenshot(page, 'upload-result');
          
          // Check if upload was successful
          const successMessage = await page.$('.notification.success');
          if (!successMessage) {
            console.error('❌ No success message after upload');
          } else {
            console.log('✅ Upload successful');
          }
        }
      }
    }
    
    // Test 4: Document Processing
    console.log('\n🧪 Test 4: Document Processing');
    await page.goto(`${url}/documents-new`);
    await page.waitForLoadState('networkidle');
    await takeScreenshot(page, 'documents-list');
    
    // Check if process button exists
    const processButton = await page.$('#process-document-btn');
    if (!processButton) {
      console.error('❌ Process document button not found');
    } else {
      console.log('✅ Process document button found');
      
      // Check if there are documents
      const documents = await page.$$('.document-item');
      if (documents.length === 0) {
        console.error('❌ No documents found to process');
      } else {
        console.log(`✅ Found ${documents.length} documents`);
        
        // Click on first document
        console.log('Clicking on first document...');
        await documents[0].click();
        await page.waitForTimeout(2000);
        await takeScreenshot(page, 'document-detail');
        
        // Check if document detail page has process button
        const detailProcessButton = await page.$('.document-detail button:has-text("Process")');
        if (!detailProcessButton) {
          console.error('❌ Process button not found on document detail page');
        } else {
          console.log('✅ Process button found on document detail page');
          
          // Click process button
          console.log('Processing document...');
          await detailProcessButton.click();
          await page.waitForTimeout(5000);
          await takeScreenshot(page, 'processing-result');
          
          // Check if processing started
          const processingIndicator = await page.$('.processing-indicator');
          if (!processingIndicator) {
            console.error('❌ No processing indicator after clicking process button');
          } else {
            console.log('✅ Processing started');
          }
        }
      }
    }
    
    // Test 5: Document Chat
    console.log('\n🧪 Test 5: Document Chat');
    await page.goto(`${url}/document-chat`);
    await page.waitForLoadState('networkidle');
    await takeScreenshot(page, 'document-chat');
    
    // Check if chat container exists
    const chatContainer = await page.$('#document-chat-container');
    if (!chatContainer) {
      console.error('❌ Document chat container not found');
    } else {
      console.log('✅ Document chat container found');
      
      // Check if chat input exists
      const chatInput = await page.$('#document-chat-input');
      if (!chatInput) {
        console.error('❌ Document chat input not found');
      } else {
        console.log('✅ Document chat input found');
        
        // Type a question
        console.log('Typing a question...');
        await chatInput.fill('What is the ISIN code for Apple?');
        
        // Check if send button exists
        const sendButton = await page.$('#document-send-btn');
        if (!sendButton) {
          console.error('❌ Document chat send button not found');
        } else {
          console.log('✅ Document chat send button found');
          
          // Click send button
          console.log('Sending question...');
          await sendButton.click();
          await page.waitForTimeout(5000);
          await takeScreenshot(page, 'chat-response');
          
          // Check if response was received
          const aiMessage = await page.$('.ai-message');
          if (!aiMessage) {
            console.error('❌ No AI response received in document chat');
          } else {
            console.log('✅ AI response received');
          }
        }
      }
    }
    
    console.log('\n✅ Basic tests completed');
    console.log('📸 Screenshots saved to:', config.screenshotsDir);
    
  } finally {
    await context.close();
    await browser.close();
  }
};

// Run tests
if (require.main === module) {
  // Check if URL is provided as command line argument
  const url = process.argv[2] || config.baseUrl;
  runBasicTests(url).catch(console.error);
}

module.exports = {
  runBasicTests,
};
