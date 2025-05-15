/**
 * Test Script for FinDoc Analyzer UI Fix
 * This script tests the UI fix script to ensure it works correctly
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Configuration
const config = {
  // URLs to test
  urls: {
    documentDetails: 'https://findoc-deploy.ey.r.appspot.com/document-details.html?id=doc-1',
    documentChat: 'https://findoc-deploy.ey.r.appspot.com/document-chat.html',
    upload: 'https://findoc-deploy.ey.r.appspot.com/upload',
    documents: 'https://findoc-deploy.ey.r.appspot.com/documents-new',
    analytics: 'https://findoc-deploy.ey.r.appspot.com/analytics-new'
  },
  
  // Elements to check
  elements: {
    processButton: '#process-document-btn',
    chatContainer: '#document-chat-container',
    chatInput: '#document-chat-input',
    chatSendButton: '#document-send-btn',
    chatMessages: '#document-chat-messages',
    apiKeyWarning: '.api-key-warning'
  },
  
  // Test timeout
  timeout: 30000,
  
  // Output file
  outputFile: 'test-results.json'
};

// Test results
const testResults = {
  passed: [],
  failed: [],
  warnings: [],
  timestamp: new Date().toISOString()
};

// Main test function
async function runTests() {
  console.log('Starting UI fix tests...');
  
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    args: ['--window-size=1280,800']
  });
  
  try {
    // Test document details page
    await testDocumentDetailsPage(browser);
    
    // Test document chat page
    await testDocumentChatPage(browser);
    
    // Test upload page
    await testUploadPage(browser);
    
    // Test API key validation
    await testApiKeyValidation(browser);
    
    // Log test results
    logTestResults();
    
    // Save test results
    saveTestResults();
  } catch (error) {
    console.error('Error running tests:', error);
    testResults.failed.push({
      test: 'Test execution',
      error: error.message
    });
  } finally {
    await browser.close();
  }
}

// Test document details page
async function testDocumentDetailsPage(browser) {
  console.log('Testing document details page...');
  
  const page = await browser.newPage();
  await page.goto(config.urls.documentDetails, { timeout: config.timeout });
  
  // Wait for page to load
  await page.waitForSelector('h1', { timeout: config.timeout });
  
  // Check if process button exists
  const processButton = await page.$(config.elements.processButton);
  if (processButton) {
    testResults.passed.push({
      test: 'Process Button',
      message: 'Process button exists on document details page'
    });
  } else {
    testResults.failed.push({
      test: 'Process Button',
      error: 'Process button does not exist on document details page'
    });
  }
  
  // Check if chat container exists
  const chatContainer = await page.$(config.elements.chatContainer);
  if (chatContainer) {
    testResults.passed.push({
      test: 'Chat Container',
      message: 'Chat container exists on document details page'
    });
  } else {
    testResults.failed.push({
      test: 'Chat Container',
      error: 'Chat container does not exist on document details page'
    });
  }
  
  // Check if chat input exists
  const chatInput = await page.$(config.elements.chatInput);
  if (chatInput) {
    testResults.passed.push({
      test: 'Chat Input',
      message: 'Chat input exists on document details page'
    });
  } else {
    testResults.failed.push({
      test: 'Chat Input',
      error: 'Chat input does not exist on document details page'
    });
  }
  
  // Check if chat send button exists
  const chatSendButton = await page.$(config.elements.chatSendButton);
  if (chatSendButton) {
    testResults.passed.push({
      test: 'Chat Send Button',
      message: 'Chat send button exists on document details page'
    });
  } else {
    testResults.failed.push({
      test: 'Chat Send Button',
      error: 'Chat send button does not exist on document details page'
    });
  }
  
  // Test process button functionality
  if (processButton) {
    console.log('Testing process button functionality...');
    
    // Click process button
    await processButton.click();
    
    // Wait for processing to complete
    await page.waitForTimeout(3500);
    
    // Check if success message appears
    const successMessage = await page.$('.alert-success');
    if (successMessage) {
      testResults.passed.push({
        test: 'Process Button Functionality',
        message: 'Process button shows success message when clicked'
      });
    } else {
      testResults.failed.push({
        test: 'Process Button Functionality',
        error: 'Process button does not show success message when clicked'
      });
    }
  }
  
  // Test chat functionality
  if (chatInput && chatSendButton) {
    console.log('Testing chat functionality...');
    
    // Type a message
    await chatInput.type('What is the total value of the portfolio?');
    
    // Click send button
    await chatSendButton.click();
    
    // Wait for response
    await page.waitForTimeout(2000);
    
    // Check if user message appears
    const userMessages = await page.$$('.user-message');
    if (userMessages.length > 0) {
      testResults.passed.push({
        test: 'Chat User Message',
        message: 'User message appears in chat when sent'
      });
    } else {
      testResults.failed.push({
        test: 'Chat User Message',
        error: 'User message does not appear in chat when sent'
      });
    }
    
    // Check if AI response appears
    const aiMessages = await page.$$('.ai-message');
    if (aiMessages.length > 1) {
      testResults.passed.push({
        test: 'Chat AI Response',
        message: 'AI response appears in chat when user message is sent'
      });
    } else {
      testResults.failed.push({
        test: 'Chat AI Response',
        error: 'AI response does not appear in chat when user message is sent'
      });
    }
  }
  
  await page.close();
}

// Test document chat page
async function testDocumentChatPage(browser) {
  console.log('Testing document chat page...');
  
  const page = await browser.newPage();
  await page.goto(config.urls.documentChat, { timeout: config.timeout });
  
  // Wait for page to load
  await page.waitForSelector('h1', { timeout: config.timeout });
  
  // Check if document selector exists
  const documentSelector = await page.$('.document-selector');
  if (documentSelector) {
    testResults.passed.push({
      test: 'Document Selector',
      message: 'Document selector exists on document chat page'
    });
  } else {
    testResults.failed.push({
      test: 'Document Selector',
      error: 'Document selector does not exist on document chat page'
    });
  }
  
  // Check if chat messages container exists
  const chatMessages = await page.$('.chat-messages');
  if (chatMessages) {
    testResults.passed.push({
      test: 'Chat Messages Container',
      message: 'Chat messages container exists on document chat page'
    });
  } else {
    testResults.failed.push({
      test: 'Chat Messages Container',
      error: 'Chat messages container does not exist on document chat page'
    });
  }
  
  await page.close();
}

// Test upload page
async function testUploadPage(browser) {
  console.log('Testing upload page...');
  
  const page = await browser.newPage();
  await page.goto(config.urls.upload, { timeout: config.timeout });
  
  // Wait for page to load
  await page.waitForSelector('h1', { timeout: config.timeout });
  
  // Check if process button exists
  const processButton = await page.$(config.elements.processButton);
  if (processButton) {
    testResults.passed.push({
      test: 'Process Button (Upload)',
      message: 'Process button exists on upload page'
    });
  } else {
    testResults.failed.push({
      test: 'Process Button (Upload)',
      error: 'Process button does not exist on upload page'
    });
  }
  
  // Check if progress container exists
  const progressContainer = await page.$('#progress-container');
  if (progressContainer) {
    testResults.passed.push({
      test: 'Progress Container',
      message: 'Progress container exists on upload page'
    });
  } else {
    testResults.failed.push({
      test: 'Progress Container',
      error: 'Progress container does not exist on upload page'
    });
  }
  
  await page.close();
}

// Test API key validation
async function testApiKeyValidation(browser) {
  console.log('Testing API key validation...');
  
  const page = await browser.newPage();
  
  // Override localStorage to simulate invalid API keys
  await page.evaluateOnNewDocument(() => {
    const originalSetItem = localStorage.setItem;
    
    localStorage.setItem = function(key, value) {
      if (key === 'apiKeyValidation') {
        // Simulate invalid API keys
        const invalidValidation = JSON.stringify({
          openai: false,
          gemini: false,
          googleCloud: false,
          supabase: true
        });
        
        originalSetItem.call(this, key, invalidValidation);
      } else {
        originalSetItem.call(this, key, value);
      }
    };
  });
  
  await page.goto(config.urls.documentDetails, { timeout: config.timeout });
  
  // Wait for page to load
  await page.waitForSelector('h1', { timeout: config.timeout });
  
  // Wait for API key validation to complete
  await page.waitForTimeout(2000);
  
  // Check if API key warning appears
  const apiKeyWarning = await page.$(config.elements.apiKeyWarning);
  if (apiKeyWarning) {
    testResults.passed.push({
      test: 'API Key Warning',
      message: 'API key warning appears when API keys are invalid'
    });
  } else {
    testResults.failed.push({
      test: 'API Key Warning',
      error: 'API key warning does not appear when API keys are invalid'
    });
  }
  
  // Test process button with invalid API keys
  const processButton = await page.$(config.elements.processButton);
  if (processButton) {
    console.log('Testing process button with invalid API keys...');
    
    // Click process button
    await processButton.click();
    
    // Wait for error message
    await page.waitForTimeout(1000);
    
    // Check if error message appears
    const errorMessage = await page.$('.alert-danger');
    if (errorMessage) {
      testResults.passed.push({
        test: 'Process Button with Invalid API Keys',
        message: 'Process button shows error message when API keys are invalid'
      });
    } else {
      testResults.failed.push({
        test: 'Process Button with Invalid API Keys',
        error: 'Process button does not show error message when API keys are invalid'
      });
    }
  }
  
  // Test chat with invalid API keys
  const chatInput = await page.$(config.elements.chatInput);
  const chatSendButton = await page.$(config.elements.chatSendButton);
  
  if (chatInput && chatSendButton) {
    console.log('Testing chat with invalid API keys...');
    
    // Type a message
    await chatInput.type('What is the total value of the portfolio?');
    
    // Click send button
    await chatSendButton.click();
    
    // Wait for error message
    await page.waitForTimeout(1000);
    
    // Check if error message appears in chat
    const errorMessages = await page.$$eval('.ai-message', messages => {
      return messages.some(message => message.textContent.includes('Error'));
    });
    
    if (errorMessages) {
      testResults.passed.push({
        test: 'Chat with Invalid API Keys',
        message: 'Chat shows error message when API keys are invalid'
      });
    } else {
      testResults.failed.push({
        test: 'Chat with Invalid API Keys',
        error: 'Chat does not show error message when API keys are invalid'
      });
    }
  }
  
  await page.close();
}

// Log test results
function logTestResults() {
  console.log('\n==== TEST RESULTS ====');
  console.log(`Passed: ${testResults.passed.length}`);
  console.log(`Failed: ${testResults.failed.length}`);
  console.log(`Warnings: ${testResults.warnings.length}`);
  
  if (testResults.passed.length > 0) {
    console.log('\nPassed Tests:');
    testResults.passed.forEach(result => {
      console.log(`✅ ${result.test}: ${result.message}`);
    });
  }
  
  if (testResults.failed.length > 0) {
    console.log('\nFailed Tests:');
    testResults.failed.forEach(result => {
      console.log(`❌ ${result.test}: ${result.error}`);
    });
  }
  
  if (testResults.warnings.length > 0) {
    console.log('\nWarnings:');
    testResults.warnings.forEach(result => {
      console.log(`⚠️ ${result.test}: ${result.message}`);
    });
  }
}

// Save test results
function saveTestResults() {
  fs.writeFileSync(
    config.outputFile,
    JSON.stringify(testResults, null, 2),
    'utf8'
  );
  
  console.log(`\nTest results saved to ${config.outputFile}`);
}

// Run tests
runTests().catch(error => {
  console.error('Error running tests:', error);
  process.exit(1);
});
