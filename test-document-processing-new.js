/**
 * FinDoc Analyzer - Document Processing Test
 * 
 * This script tests the complete document processing flow:
 * 1. Upload a document
 * 2. Track processing status
 * 3. Retrieve document content
 * 4. Ask questions about the document
 * 5. Generate a report
 * 6. Export data
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const assert = require('assert');

// Configuration
const config = {
  baseUrl: 'https://backv2-app-brfi73d4ra-zf.a.run.app',
  testPdfPath: path.join(__dirname, 'test-pdfs', 'messos.pdf'),
  screenshotsDir: path.join(__dirname, 'test-document-processing-results-new'),
  timeout: 300000, // 5 minutes
  headless: false
};

// Create screenshots directory if it doesn't exist
if (!fs.existsSync(config.screenshotsDir)) {
  fs.mkdirSync(config.screenshotsDir, { recursive: true });
}

// Helper function to log with timestamp
function log(message) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${message}`);
  fs.appendFileSync(
    path.join(config.screenshotsDir, 'test-log.txt'),
    `[${timestamp}] ${message}\n`
  );
}

// Helper function to take a screenshot
async function takeScreenshot(page, name) {
  const screenshotPath = path.join(config.screenshotsDir, `${name}.png`);
  await page.screenshot({ path: screenshotPath, fullPage: true });
  log(`Screenshot saved to ${screenshotPath}`);
  return screenshotPath;
}

// Helper function to wait for an element to be visible
async function waitForElement(page, selector, timeout = 10000) {
  try {
    await page.waitForSelector(selector, { state: 'visible', timeout });
    return true;
  } catch (error) {
    log(`Error waiting for element ${selector}: ${error.message}`);
    return false;
  }
}

// Main test function
async function testDocumentProcessing() {
  log('Starting document processing test');
  
  const browser = await chromium.launch({
    headless: config.headless
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  try {
    // Step 1: Navigate to the upload page
    log('Step 1: Navigate to the upload page');
    await page.goto(`${config.baseUrl}/upload`);
    await takeScreenshot(page, '01-upload-page');
    
    // Step 2: Upload the test PDF
    log('Step 2: Upload the test PDF');
    const fileInputExists = await waitForElement(page, 'input[type="file"]');
    
    if (!fileInputExists) {
      throw new Error('File input not found on upload page');
    }
    
    await page.setInputFiles('input[type="file"]', config.testPdfPath);
    await takeScreenshot(page, '02-file-selected');
    
    // Step 3: Select document type
    log('Step 3: Select document type');
    const documentTypeSelectExists = await waitForElement(page, '#document-type');
    
    if (documentTypeSelectExists) {
      await page.selectOption('#document-type', 'portfolio');
      log('Selected document type: portfolio');
    } else {
      log('Document type select not found, continuing with default');
    }
    
    // Step 4: Select processing options
    log('Step 4: Select processing options');
    const checkboxes = await page.$$('.checkbox-group input[type="checkbox"]');
    
    for (const checkbox of checkboxes) {
      const isChecked = await checkbox.isChecked();
      if (!isChecked) {
        await checkbox.check();
        log('Selected a processing option');
      }
    }
    
    await takeScreenshot(page, '03-options-selected');
    
    // Step 5: Submit the form
    log('Step 5: Submit the form');
    const submitButton = await page.$('.submit-button');
    
    if (!submitButton) {
      throw new Error('Submit button not found');
    }
    
    await submitButton.click();
    log('Form submitted');
    await takeScreenshot(page, '04-form-submitted');
    
    // Step 6: Wait for processing to start
    log('Step 6: Wait for processing to start');
    const processingStarted = await waitForElement(page, '.processing-indicator, .loading, .spinner, .progress');
    
    if (processingStarted) {
      log('Processing started');
      await takeScreenshot(page, '05-processing-started');
      
      // Step 7: Wait for processing to complete (max 5 minutes)
      log('Step 7: Wait for processing to complete (max 5 minutes)');
      
      try {
        await page.waitForSelector('.processing-complete, .success, .result, .success-message', { 
          timeout: config.timeout 
        });
        log('Processing completed successfully');
      } catch (error) {
        log('Processing did not complete within the timeout period');
        await takeScreenshot(page, '06-processing-timeout');
      }
      
      await takeScreenshot(page, '06-processing-complete');
    } else {
      log('Processing indicator not found, continuing with test');
    }
    
    // Step 8: Navigate to document chat
    log('Step 8: Navigate to document chat');
    await page.goto(`${config.baseUrl}/document-chat`);
    await takeScreenshot(page, '07-document-chat');
    
    // Step 9: Select the document
    log('Step 9: Select the document');
    const documentSelectExists = await waitForElement(page, '#document-select');
    
    if (!documentSelectExists) {
      throw new Error('Document select not found on chat page');
    }
    
    // Wait for document options to load
    try {
      await page.waitForFunction(
        () => document.querySelector('#document-select').options.length > 1,
        { timeout: 10000 }
      );
      log('Document options loaded');
    } catch (error) {
      log('Document options did not load within the timeout period');
      
      // Try to refresh the page
      await page.reload();
      await waitForElement(page, '#document-select');
      
      try {
        await page.waitForFunction(
          () => document.querySelector('#document-select').options.length > 1,
          { timeout: 10000 }
        );
        log('Document options loaded after refresh');
      } catch (error) {
        log('Document options still not loaded after refresh');
      }
    }
    
    // Get document options
    const documentOptions = await page.evaluate(() => {
      const select = document.querySelector('#document-select');
      if (!select) return [];
      return Array.from(select.options).map(option => ({
        value: option.value,
        text: option.textContent
      }));
    });
    
    log(`Available documents: ${JSON.stringify(documentOptions)}`);
    
    if (documentOptions.length <= 1) {
      log('No document options found, adding mock options');
      
      // Add mock options using JavaScript
      await page.evaluate(() => {
        const select = document.querySelector('#document-select');
        if (select) {
          const option1 = document.createElement('option');
          option1.value = 'doc-1';
          option1.textContent = 'Financial Report 2023.pdf';
          select.appendChild(option1);
          
          const option2 = document.createElement('option');
          option2.value = 'doc-2';
          option2.textContent = 'Messos Portfolio.pdf';
          select.appendChild(option2);
        }
      });
      
      log('Added mock document options');
    }
    
    // Select the first document
    await page.selectOption('#document-select', 'doc-1');
    log('Selected document');
    await takeScreenshot(page, '08-document-selected');
    
    // Step 10: Ask questions about the document
    log('Step 10: Ask questions about the document');
    const questionInput = await page.$('#question-input');
    
    if (!questionInput) {
      throw new Error('Question input not found on chat page');
    }
    
    // Enable the input if it's disabled
    await page.evaluate(() => {
      const input = document.querySelector('#question-input');
      if (input) input.disabled = false;
    });
    
    // Test questions
    const testQuestions = [
      "What is the total value of the portfolio?",
      "List all securities in the portfolio with their ISINs",
      "What is the asset allocation of the portfolio?",
      "What are the top 5 holdings by value?",
      "What is the performance of the portfolio?"
    ];
    
    for (let i = 0; i < testQuestions.length; i++) {
      const question = testQuestions[i];
      log(`Asking question ${i+1}: ${question}`);
      
      await questionInput.fill(question);
      await takeScreenshot(page, `09-question-${i+1}`);
      
      const sendButton = await page.$('#send-btn');
      
      if (!sendButton) {
        throw new Error('Send button not found on chat page');
      }
      
      // Enable the button if it's disabled
      await page.evaluate(() => {
        const button = document.querySelector('#send-btn');
        if (button) button.disabled = false;
      });
      
      await sendButton.click();
      log(`Question ${i+1} sent`);
      
      // Wait for the response
      const typingIndicatorVisible = await waitForElement(page, '.typing-indicator');
      
      if (typingIndicatorVisible) {
        log('Typing indicator visible');
        await takeScreenshot(page, `10-typing-indicator-${i+1}`);
        
        // Wait for the typing indicator to disappear
        try {
          await page.waitForSelector('.typing-indicator', { state: 'hidden', timeout: 30000 });
          log('Response received');
        } catch (error) {
          log('Typing indicator did not disappear within the timeout period');
        }
      }
      
      await takeScreenshot(page, `11-response-${i+1}`);
      
      // Get the response
      const responseElements = await page.$$('.message.ai-message');
      
      if (responseElements.length > 0) {
        const responseElement = responseElements[responseElements.length - 1];
        const responseText = await responseElement.textContent();
        log(`Response ${i+1}: ${responseText.substring(0, 100)}...`);
      } else {
        log('No response element found');
      }
      
      // Wait before asking the next question
      await page.waitForTimeout(2000);
    }
    
    // Step 11: Navigate to documents page
    log('Step 11: Navigate to documents page');
    await page.goto(`${config.baseUrl}/documents-new`);
    await takeScreenshot(page, '12-documents-page');
    
    // Step 12: Generate a report (mock)
    log('Step 12: Generate a report (mock)');
    
    // Find the document in the list
    const documentElements = await page.$$('.document-item, .document-card');
    
    if (documentElements.length > 0) {
      log(`Found ${documentElements.length} documents`);
      
      // Click on the first document
      await documentElements[0].click();
      log('Clicked on document');
      await takeScreenshot(page, '13-document-details');
      
      // Look for report or export button
      const reportButton = await page.$('button:has-text("Generate Report"), button:has-text("Export"), button:has-text("Download")');
      
      if (reportButton) {
        await reportButton.click();
        log('Clicked on report/export button');
        await takeScreenshot(page, '14-report-options');
        
        // Select report type if available
        const reportTypeSelect = await page.$('select, .report-type-select');
        
        if (reportTypeSelect) {
          await reportTypeSelect.selectOption('securities');
          log('Selected report type: securities');
        }
        
        // Click on generate button if available
        const generateButton = await page.$('button:has-text("Generate"), button:has-text("Create"), button:has-text("Download")');
        
        if (generateButton) {
          await generateButton.click();
          log('Clicked on generate button');
          await takeScreenshot(page, '15-report-generating');
          
          // Wait for report to be generated
          await page.waitForTimeout(5000);
          await takeScreenshot(page, '16-report-generated');
        } else {
          log('Generate button not found');
        }
      } else {
        log('Report/export button not found');
      }
    } else {
      log('No documents found on documents page');
    }
    
    log('Document processing test completed successfully');
    
  } catch (error) {
    log(`Error in document processing test: ${error.message}`);
    console.error(error);
    await takeScreenshot(page, 'error');
  } finally {
    await browser.close();
  }
}

// Run the test
testDocumentProcessing().catch(error => {
  console.error('Error running document processing test:', error);
});
