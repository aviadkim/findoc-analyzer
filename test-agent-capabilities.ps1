# Test Agent Capabilities
Write-Host "===================================================
Testing Agent Capabilities
===================================================" -ForegroundColor Green

# Step 1: Create test script
Write-Host "`n=== Step 1: Creating test script ===" -ForegroundColor Cyan

$testAgentJsPath = "test-agent-capabilities.js"
$testAgentJsContent = @"
/**
 * Test Agent Capabilities
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

// Test questions for the agent
const testQuestions = [
  {
    question: 'What is the ISIN code for Apple?',
    expectedKeywords: ['US0378331005', 'Apple'],
  },
  {
    question: 'What companies are mentioned in this document?',
    expectedKeywords: ['Apple', 'Microsoft', 'companies'],
  },
  {
    question: 'Can you summarize this document?',
    expectedKeywords: ['summary', 'report', 'analysis'],
  },
  {
    question: 'What is the current stock price of Apple?',
    expectedKeywords: ['price', 'Apple', 'stock'],
  },
  {
    question: 'What is the difference between ISIN and CUSIP?',
    expectedKeywords: ['ISIN', 'CUSIP', 'difference', 'code'],
  },
];

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
    // Go to document chat page
    console.log('\n🧪 Testing Document Chat Agent');
    await page.goto(`${url}/document-chat`);
    await page.waitForLoadState('networkidle');
    await takeScreenshot(page, 'document-chat-page');
    
    // Check if document chat container exists
    const chatContainer = await page.$('#document-chat-container');
    if (!chatContainer) {
      console.error('❌ Document chat container not found');
      return;
    }
    
    console.log('✅ Document chat container found');
    
    // Check if document selector exists
    const documentSelect = await page.$('#document-select');
    if (!documentSelect) {
      console.error('❌ Document selector not found');
      return;
    }
    
    console.log('✅ Document selector found');
    
    // Select a document
    console.log('Selecting a document...');
    await documentSelect.selectOption({ index: 1 });
    await page.waitForTimeout(2000);
    await takeScreenshot(page, 'document-selected');
    
    // Check if chat input is enabled
    const chatInput = await page.$('#document-chat-input');
    if (!chatInput) {
      console.error('❌ Document chat input not found');
      return;
    }
    
    console.log('✅ Document chat input found');
    
    const isDisabled = await chatInput.isDisabled();
    if (isDisabled) {
      console.error('❌ Document chat input is disabled after selecting a document');
      return;
    }
    
    console.log('✅ Document chat input is enabled after selecting a document');
    
    // Check if send button exists and is enabled
    const sendButton = await page.$('#document-send-btn');
    if (!sendButton) {
      console.error('❌ Document chat send button not found');
      return;
    }
    
    console.log('✅ Document chat send button found');
    
    const isSendDisabled = await sendButton.isDisabled();
    if (isSendDisabled) {
      console.error('❌ Document chat send button is disabled after selecting a document');
      return;
    }
    
    console.log('✅ Document chat send button is enabled after selecting a document');
    
    // Test each question
    console.log('\n🧪 Testing Agent Responses');
    
    for (const [index, test] of testQuestions.entries()) {
      console.log(`\nTest ${index + 1}: "${test.question}"`);
      
      // Type the question
      await chatInput.fill(test.question);
      await takeScreenshot(page, `question-${index + 1}`);
      
      // Send the question
      await sendButton.click();
      
      // Wait for response
      await page.waitForTimeout(5000);
      await takeScreenshot(page, `response-${index + 1}`);
      
      // Check if response was received
      const aiMessages = await page.$$('.ai-message');
      if (aiMessages.length === 0) {
        console.error(`❌ No AI response received for question ${index + 1}`);
        continue;
      }
      
      // Get the latest AI message
      const latestAiMessage = aiMessages[aiMessages.length - 1];
      const responseText = await latestAiMessage.textContent();
      
      console.log(`Response: ${responseText}`);
      
      // Check if response contains expected keywords
      const containsKeywords = test.expectedKeywords.some(keyword => 
        responseText.toLowerCase().includes(keyword.toLowerCase())
      );
      
      if (containsKeywords) {
        console.log(`✅ Response contains expected keywords`);
      } else {
        console.error(`❌ Response does not contain any expected keywords: ${test.expectedKeywords.join(', ')}`);
      }
    }
    
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
"@

Set-Content -Path $testAgentJsPath -Value $testAgentJsContent
Write-Host "Test script created: $testAgentJsPath" -ForegroundColor Green

# Step 2: Install required packages
Write-Host "`n=== Step 2: Installing required packages ===" -ForegroundColor Cyan
npm install playwright
npx playwright install chromium
Write-Host "Required packages installed." -ForegroundColor Green

# Step 3: Run the test
Write-Host "`n=== Step 3: Running agent capabilities test ===" -ForegroundColor Cyan
node test-agent-capabilities.js
Write-Host "Agent capabilities test completed." -ForegroundColor Green

Write-Host "`nAgent capabilities testing completed." -ForegroundColor Green
