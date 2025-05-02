/**
 * FinDoc Analyzer PDF Processing Test
 * 
 * This script tests the PDF processing functionality of the FinDoc Analyzer application.
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Configuration
const config = {
  url: 'https://findoc-deploy.ey.r.appspot.com',
  screenshotsDir: path.join(__dirname, 'pdf-processing-test-results'),
  pdfPath: path.join(__dirname, 'test-documents', 'financial-report-2023.pdf'),
  timeout: 60000, // 60 seconds
  headless: false // Set to true for headless mode
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
 * Run the PDF processing test
 */
async function runPdfProcessingTest() {
  console.log('Starting PDF processing test...');
  
  // Launch browser
  const browser = await puppeteer.launch({
    headless: config.headless,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  let page;
  
  try {
    // Create a new page
    page = await browser.newPage();
    
    // Set viewport
    await page.setViewport({ width: 1280, height: 800 });
    
    // Navigate to the upload page
    console.log(`Navigating to ${config.url}/upload...`);
    await page.goto(`${config.url}/upload`, { timeout: config.timeout, waitUntil: 'networkidle2' });
    
    // Take a screenshot of the upload page
    await takeScreenshot(page, '01-upload-page');
    
    // Find any file input on the page
    const fileInputs = await page.$$('input[type="file"]');
    console.log(`Found ${fileInputs.length} file inputs on the page`);
    
    if (fileInputs.length === 0) {
      // Try to find a link to the upload page
      const uploadLinks = await page.$$('a[href*="upload"]');
      
      if (uploadLinks.length > 0) {
        console.log(`Found ${uploadLinks.length} upload links, clicking the first one...`);
        await uploadLinks[0].click();
        await page.waitForNavigation({ timeout: config.timeout, waitUntil: 'networkidle2' });
        await takeScreenshot(page, '01b-after-upload-link-click');
      }
    }
    
    // Try to find any file input again
    const fileInputs2 = await page.$$('input[type="file"]');
    
    if (fileInputs2.length === 0) {
      console.error('No file input found on the page');
      await takeScreenshot(page, 'error-file-input-not-found');
      throw new Error('No file input found on the page');
    }
    
    // Upload the PDF file
    console.log('Uploading PDF file...');
    await fileInputs2[0].uploadFile(config.pdfPath);
    
    // Take a screenshot after file selection
    await takeScreenshot(page, '02-file-selected');
    
    // Wait for processing to start
    console.log('Waiting for processing to start...');
    
    // Check if there's a progress bar or status indicator
    const progressElements = await page.$$('.progress-bar, .progress, .upload-status, .processing-status');
    
    if (progressElements.length > 0) {
      console.log(`Found ${progressElements.length} progress elements, waiting for processing to complete...`);
      
      // Wait for a reasonable amount of time for processing to complete
      await page.waitForTimeout(5000);
      
      // Take a screenshot during processing
      await takeScreenshot(page, '03-processing');
      
      // Wait a bit longer for processing to complete
      await page.waitForTimeout(5000);
    } else {
      console.log('No progress elements found, waiting for a fixed amount of time...');
      await page.waitForTimeout(10000);
    }
    
    // Take a screenshot after processing
    await takeScreenshot(page, '04-after-processing');
    
    // Check if we were redirected to a results page
    const currentUrl = page.url();
    console.log(`Current URL: ${currentUrl}`);
    
    // Navigate to the documents page to check if the document was processed
    console.log('Navigating to documents page...');
    await page.goto(`${config.url}/documents-new`, { timeout: config.timeout, waitUntil: 'networkidle2' });
    
    // Take a screenshot of the documents page
    await takeScreenshot(page, '05-documents-page');
    
    // Check if there are any document cards
    const documentCards = await page.$$('.document-card');
    console.log(`Found ${documentCards.length} document cards`);
    
    if (documentCards.length === 0) {
      console.error('No document cards found on the page');
      await takeScreenshot(page, 'error-no-document-cards');
      throw new Error('No document cards found on the page');
    }
    
    // Click on the first document card to view the processed results
    console.log('Clicking on the first document card...');
    await documentCards[0].click();
    
    // Wait for navigation or content to load
    try {
      await page.waitForNavigation({ timeout: config.timeout, waitUntil: 'networkidle2' });
    } catch (error) {
      console.warn('No navigation occurred after clicking document card, checking for modal or content change...');
      
      // Wait for any modal or content change
      await page.waitForTimeout(2000);
    }
    
    // Take a screenshot of the document details
    await takeScreenshot(page, '06-document-details');
    
    // Check for extracted text
    const extractedTextElements = await page.$$('.extracted-text, .document-text, .text-content, .content-text');
    console.log(`Found ${extractedTextElements.length} extracted text elements`);
    
    // Check for extracted tables
    const extractedTableElements = await page.$$('table, .table, .extracted-table, .document-table');
    console.log(`Found ${extractedTableElements.length} extracted table elements`);
    
    // Check for metadata
    const metadataElements = await page.$$('.metadata, .document-metadata, .meta-info, .info');
    console.log(`Found ${metadataElements.length} metadata elements`);
    
    // Take screenshots of any found elements
    if (extractedTextElements.length > 0) {
      await takeScreenshot(page, '07-extracted-text');
    }
    
    if (extractedTableElements.length > 0) {
      await takeScreenshot(page, '08-extracted-tables');
    }
    
    if (metadataElements.length > 0) {
      await takeScreenshot(page, '09-metadata');
    }
    
    // Check if there's a chat or Q&A interface
    const chatElements = await page.$$('.chat, .qa, .question-answer, .ask-question, input[placeholder*="question"], input[placeholder*="ask"]');
    console.log(`Found ${chatElements.length} chat elements`);
    
    if (chatElements.length > 0) {
      console.log('Found chat interface, testing question answering...');
      
      // Find the input field
      const inputField = await page.$('input[type="text"], textarea');
      
      if (inputField) {
        // Type a question
        await inputField.type('What is the total revenue?');
        
        // Take a screenshot after typing the question
        await takeScreenshot(page, '10-question-typed');
        
        // Find the submit button
        const submitButton = await page.$('button[type="submit"], button:contains("Send"), button:contains("Ask"), button:contains("Submit")');
        
        if (submitButton) {
          // Click the submit button
          await submitButton.click();
          
          // Wait for the answer
          await page.waitForTimeout(5000);
          
          // Take a screenshot of the answer
          await takeScreenshot(page, '11-answer');
        } else {
          console.warn('No submit button found for the chat interface');
        }
      } else {
        console.warn('No input field found for the chat interface');
      }
    }
    
    console.log('PDF processing test completed successfully');
  } catch (error) {
    console.error('Error during PDF processing test:', error);
    
    // Take a screenshot of the error
    try {
      if (page) {
        await takeScreenshot(page, 'error-screenshot');
      }
    } catch (screenshotError) {
      console.error('Error taking error screenshot:', screenshotError);
    }
    
    throw error;
  } finally {
    // Close browser
    await browser.close();
  }
}

// Run the test
runPdfProcessingTest()
  .then(() => {
    console.log('PDF processing test completed successfully');
    process.exit(0);
  })
  .catch(error => {
    console.error('PDF processing test failed:', error);
    process.exit(1);
  });
