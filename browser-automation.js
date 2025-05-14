const { chromium } = require('playwright');
const path = require('path');

// Configuration
const APP_URL = 'https://backv2-app-brfi73d4ra-zf.a.run.app';
const PDF_PATH = path.join(__dirname, 'messos.pdf');

// Questions to ask
const QUESTIONS = [
  'What is the total value of the portfolio?',
  'What are the top 3 holdings in the portfolio?',
  'What is the percentage of Apple stock in the portfolio?',
  'What is the average acquisition price of Microsoft shares?'
];

async function runTest() {
  console.log('Starting browser automation test...');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // Step 1: Navigate to the upload page
    console.log('Navigating to upload page...');
    await page.goto(`${APP_URL}/upload`);
    await page.waitForLoadState('networkidle');
    
    // Step 2: Upload the PDF file
    console.log(`Uploading ${PDF_PATH}...`);
    const fileInput = await page.$('input[type="file"]');
    if (!fileInput) {
      throw new Error('File input not found on the page');
    }
    
    await fileInput.setInputFiles(PDF_PATH);
    
    // Step 3: Select document type (if available)
    const documentTypeSelect = await page.$('select#documentType');
    if (documentTypeSelect) {
      await documentTypeSelect.selectOption('portfolio');
    }
    
    // Step 4: Click the upload button
    console.log('Clicking upload button...');
    const uploadButton = await page.$('button[type="submit"]');
    if (!uploadButton) {
      throw new Error('Upload button not found on the page');
    }
    
    await uploadButton.click();
    
    // Step 5: Wait for upload to complete
    console.log('Waiting for upload to complete...');
    await page.waitForSelector('.success-message, .error-message', { timeout: 60000 });
    
    // Check if upload was successful
    const successMessage = await page.$('.success-message');
    if (!successMessage) {
      const errorMessage = await page.$('.error-message');
      const errorText = errorMessage ? await errorMessage.textContent() : 'Unknown error';
      throw new Error(`Upload failed: ${errorText}`);
    }
    
    console.log('Upload successful!');
    
    // Step 6: Click the process button (if available)
    const processButton = await page.$('#process-btn');
    if (processButton) {
      console.log('Clicking process button...');
      await processButton.click();
      
      // Wait for processing to complete
      console.log('Waiting for processing to complete...');
      await page.waitForSelector('.progress-bar-fill[style*="width: 100%"]', { timeout: 60000 });
    }
    
    // Step 7: Navigate to document chat page
    console.log('Navigating to document chat page...');
    await page.goto(`${APP_URL}/document-chat`);
    await page.waitForLoadState('networkidle');
    
    // Step 8: Select the document (if needed)
    const documentSelect = await page.$('#document-select');
    if (documentSelect) {
      // Wait for options to load
      await page.waitForFunction(() => {
        const select = document.querySelector('#document-select');
        return select && select.options.length > 1;
      }, { timeout: 10000 });
      
      // Select the first document
      const options = await documentSelect.$$('option');
      if (options.length > 1) {
        await documentSelect.selectOption({ index: 1 });
      }
    }
    
    // Step 9: Ask questions
    console.log('\nAsking questions about the document:');
    
    const chatInput = await page.$('#document-chat-input');
    const sendButton = await page.$('#document-chat-send-btn');
    
    if (!chatInput || !sendButton) {
      throw new Error('Chat input or send button not found on the page');
    }
    
    for (const question of QUESTIONS) {
      console.log(`\nQ: ${question}`);
      
      // Type the question
      await chatInput.fill(question);
      
      // Send the question
      await sendButton.click();
      
      // Wait for response
      await page.waitForFunction(
        (q) => {
          const messages = Array.from(document.querySelectorAll('.chat-message'));
          return messages.some(m => m.textContent.includes(q));
        },
        question,
        { timeout: 30000 }
      );
      
      // Get the response
      const messages = await page.$$('.chat-message');
      const lastMessage = messages[messages.length - 1];
      const response = await lastMessage.textContent();
      
      console.log(`A: ${response}`);
      
      // Wait a bit before asking the next question
      await page.waitForTimeout(2000);
    }
    
    console.log('\nTest completed successfully!');
  } catch (error) {
    console.error('Error:', error);
    
    // Take a screenshot of the error
    await page.screenshot({ path: 'error.png' });
    console.log('Screenshot saved to error.png');
  } finally {
    // Close the browser
    await browser.close();
  }
}

// Run the test
runTest();
