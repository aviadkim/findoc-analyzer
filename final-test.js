/**
 * Final Test Script for FinDoc Analyzer
 * 
 * This script performs comprehensive tests to verify all fixes.
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// Configuration
const config = {
  baseUrl: 'http://localhost:8080', // Local URL
  cloudUrl: 'https://backv2-app-brfi73d4ra-zf.a.run.app', // Cloud deployment URL
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

// Start local server
const startLocalServer = async () => {
  console.log('Starting local server...');
  
  // Check if server.js exists
  const serverPath = path.join(__dirname, 'server.js');
  if (!fs.existsSync(serverPath)) {
    console.error('server.js not found');
    return null;
  }
  
  // Start server
  const { spawn } = require('child_process');
  const server = spawn('node', [serverPath]);
  
  // Log server output
  server.stdout.on('data', (data) => {
    console.log(`Server: ${data}`);
  });
  
  server.stderr.on('data', (data) => {
    console.error(`Server error: ${data}`);
  });
  
  // Wait for server to start
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  return server;
};

// Main test function
const runFinalTests = async (url = config.baseUrl) => {
  console.log(`\n🚀 Starting final tests for FinDoc Analyzer at ${url}`);
  console.log(`📅 Test run started at ${new Date().toISOString()}`);
  
  // Create test PDF
  createTestPdf();
  
  // Start local server if testing locally
  let server = null;
  if (url === config.baseUrl) {
    server = await startLocalServer();
    if (!server) {
      console.error('Failed to start local server');
      return;
    }
  }
  
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
    
    console.log('Checking page title...');
    const title = await page.title();
    console.log(`Page title: ${title}`);
    
    console.log('Checking sidebar...');
    const sidebar = await page.$('.sidebar');
    if (sidebar) {
      console.log('✅ Sidebar found');
    } else {
      console.error('❌ Sidebar not found');
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
    
    // Test 2: Google Login
    console.log('\n🧪 Test 2: Google Login');
    await page.goto(`${url}/login`);
    await page.waitForLoadState('networkidle');
    await takeScreenshot(page, 'login-page');
    
    // Check if login form exists
    const loginForm = await page.$('#login-form');
    if (loginForm) {
      console.log('✅ Login form found');
    } else {
      console.error('❌ Login form not found');
    }
    
    // Check if Google login button exists
    const googleLoginBtn = await page.$('#google-login-btn');
    if (googleLoginBtn) {
      console.log('✅ Google login button found');
      
      // Test Google login
      console.log('Testing Google login...');
      await googleLoginBtn.click();
      await page.waitForTimeout(2000);
      await takeScreenshot(page, 'google-login-result');
      
      const currentUrl = page.url();
      console.log(`Current URL after clicking Google login: ${currentUrl}`);
      
      if (currentUrl.includes('accounts.google.com') || currentUrl.includes('/auth/google/callback')) {
        console.log('✅ Google login redirects correctly');
      } else if (currentUrl.includes('404')) {
        console.error('❌ Google login leads to 404 page');
      } else {
        console.log('⚠️ Google login redirects to an unexpected URL');
      }
      
      // Go back to the login page
      await page.goto(`${url}/login`);
      await page.waitForLoadState('networkidle');
    } else {
      console.error('❌ Google login button not found');
    }
    
    // Test 3: Document Chat
    console.log('\n🧪 Test 3: Document Chat');
    await page.goto(`${url}/document-chat`);
    await page.waitForLoadState('networkidle');
    await takeScreenshot(page, 'document-chat');
    
    // Check if document chat container exists
    const chatContainer = await page.$('#document-chat-container');
    if (chatContainer) {
      console.log('✅ Document chat container found');
      
      // Check if document selector exists
      const documentSelect = await page.$('#document-select');
      if (documentSelect) {
        console.log('✅ Document selector found');
        
        // Select a document
        console.log('Selecting a document...');
        await documentSelect.selectOption({ index: 1 });
        await page.waitForTimeout(1000);
        
        // Check if chat input is enabled
        const chatInput = await page.$('#document-chat-input');
        if (chatInput) {
          console.log('✅ Document chat input found');
          
          const isDisabled = await chatInput.isDisabled();
          if (!isDisabled) {
            console.log('✅ Document chat input is enabled after selecting a document');
            
            // Type a question
            console.log('Typing a question...');
            await chatInput.fill('What is the ISIN code for Apple?');
            
            // Check if send button exists and is enabled
            const sendButton = await page.$('#document-send-btn');
            if (sendButton) {
              console.log('✅ Document chat send button found');
              
              const isSendDisabled = await sendButton.isDisabled();
              if (!isSendDisabled) {
                console.log('✅ Document chat send button is enabled after selecting a document');
                
                // Send the question
                console.log('Sending question...');
                await sendButton.click();
                await page.waitForTimeout(3000);
                await takeScreenshot(page, 'chat-response');
                
                // Check if response was received
                const aiMessage = await page.$('.ai-message');
                if (aiMessage) {
                  console.log('✅ AI response received');
                  
                  const responseText = await aiMessage.textContent();
                  console.log(`Response: ${responseText}`);
                } else {
                  console.error('❌ No AI response received');
                }
              } else {
                console.error('❌ Document chat send button is disabled after selecting a document');
              }
            } else {
              console.error('❌ Document chat send button not found');
            }
          } else {
            console.error('❌ Document chat input is still disabled after selecting a document');
          }
        } else {
          console.error('❌ Document chat input not found');
        }
      } else {
        console.error('❌ Document selector not found');
      }
    } else {
      console.error('❌ Document chat container not found');
    }
    
    // Test 4: Document Processing
    console.log('\n🧪 Test 4: Document Processing');
    await page.goto(`${url}/documents-new`);
    await page.waitForLoadState('networkidle');
    await takeScreenshot(page, 'documents-list');
    
    // Check if process button exists
    const processButton = await page.$('#process-document-btn');
    if (processButton) {
      console.log('✅ Process document button found');
    } else {
      console.error('❌ Process document button not found');
    }
    
    console.log('\n✅ Final tests completed');
    console.log('📸 Screenshots saved to:', config.screenshotsDir);
    
  } finally {
    await context.close();
    await browser.close();
    
    // Stop local server if started
    if (server) {
      console.log('Stopping local server...');
      server.kill();
    }
  }
};

// Run tests
if (require.main === module) {
  // Check if URL is provided as command line argument
  const url = process.argv[2] || config.baseUrl;
  runFinalTests(url).catch(console.error);
}

module.exports = {
  runFinalTests,
};
