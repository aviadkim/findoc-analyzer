/**
 * Simple Test for Agent Capabilities
 * 
 * This script tests the agent capabilities in the FinDoc Analyzer application.
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// Configuration
const config = {
  baseUrl: 'https://backv2-app-brfi73d4ra-zf.a.run.app', // Cloud deployment URL
  screenshotsDir: path.join(__dirname, 'test-results', 'agent-tests'),
  timeout: 30000, // 30 seconds
};

// Create directories
fs.mkdirSync(config.screenshotsDir, { recursive: true });

// Helper functions
const takeScreenshot = async (page, name) => {
  const screenshotPath = path.join(config.screenshotsDir, `${name}.png`);
  await page.screenshot({ path: screenshotPath, fullPage: true });
  console.log(`Screenshot saved: ${screenshotPath}`);
  return screenshotPath;
};

// Main test function
const testAgentCapabilities = async (url = config.baseUrl) => {
  console.log(`\n🚀 Testing agent capabilities at ${url}`);
  console.log(`📅 Test run started at ${new Date().toISOString()}`);
  
  const browser = await chromium.launch({ 
    headless: false,
  });
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
  });
  
  const page = await context.newPage();
  page.setDefaultTimeout(config.timeout);
  
  try {
    // Test 1: Check if document chat page loads
    console.log('\n🧪 Test 1: Document Chat Page Load');
    await page.goto(`${url}/document-chat`);
    await page.waitForLoadState('networkidle');
    await takeScreenshot(page, 'document-chat-page');
    
    // Check if document chat container exists
    const chatContainer = await page.$('#document-chat-container');
    if (chatContainer) {
      console.log('✅ Document chat container found');
    } else {
      console.error('❌ Document chat container not found');
    }
    
    // Test 2: Check if document selector exists
    console.log('\n🧪 Test 2: Document Selector');
    const documentSelect = await page.$('#document-select');
    if (documentSelect) {
      console.log('✅ Document selector found');
    } else {
      console.error('❌ Document selector not found');
    }
    
    // Test 3: Check if chat input exists
    console.log('\n🧪 Test 3: Chat Input');
    const chatInput = await page.$('#document-chat-input');
    if (chatInput) {
      console.log('✅ Document chat input found');
    } else {
      console.error('❌ Document chat input not found');
    }
    
    // Test 4: Check if send button exists
    console.log('\n🧪 Test 4: Send Button');
    const sendButton = await page.$('#document-send-btn');
    if (sendButton) {
      console.log('✅ Document chat send button found');
    } else {
      console.error('❌ Document chat send button not found');
    }
    
    // Test 5: Check if system message exists
    console.log('\n🧪 Test 5: System Message');
    const systemMessage = await page.$('.system-message');
    if (systemMessage) {
      console.log('✅ System message found');
      const messageText = await systemMessage.textContent();
      console.log(`System message: ${messageText}`);
    } else {
      console.error('❌ System message not found');
    }
    
    // Test 6: Check other pages
    console.log('\n🧪 Test 6: Other Pages');
    
    // Check documents page
    await page.goto(`${url}/documents-new`);
    await page.waitForLoadState('networkidle');
    await takeScreenshot(page, 'documents-page');
    console.log('✅ Documents page loaded');
    
    // Check analytics page
    await page.goto(`${url}/analytics-new`);
    await page.waitForLoadState('networkidle');
    await takeScreenshot(page, 'analytics-page');
    console.log('✅ Analytics page loaded');
    
    // Check upload page
    await page.goto(`${url}/upload`);
    await page.waitForLoadState('networkidle');
    await takeScreenshot(page, 'upload-page');
    console.log('✅ Upload page loaded');
    
    console.log('\n✅ Agent capabilities test completed');
    
  } finally {
    await context.close();
    await browser.close();
  }
};

// Run test
if (require.main === module) {
  testAgentCapabilities().catch(console.error);
}

module.exports = {
  testAgentCapabilities,
};
