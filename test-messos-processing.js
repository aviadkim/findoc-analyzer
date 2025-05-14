const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Create directories for screenshots and results
const screenshotsDir = path.join(__dirname, 'test-screenshots-messos');
const resultsDir = path.join(__dirname, 'test-results-messos');

if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

if (!fs.existsSync(resultsDir)) {
  fs.mkdirSync(resultsDir, { recursive: true });
}

// URL of the deployed application
const baseUrl = 'https://backv2-app-326324779592.me-west1.run.app';

// Path to Messos PDF
const messosPath = path.join(__dirname, 'test-pdfs', 'messos.pdf');

// Helper function to log with timestamp
function log(message) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${message}`);
  fs.appendFileSync(
    path.join(resultsDir, 'messos-test-log.txt'),
    `[${timestamp}] ${message}\n`
  );
}

// Helper function to take a screenshot
async function takeScreenshot(page, name) {
  const screenshotPath = path.join(screenshotsDir, `${name}.png`);
  await page.screenshot({ path: screenshotPath, fullPage: true });
  log(`Screenshot saved to ${screenshotPath}`);
  return screenshotPath;
}

// Test questions to ask about the Messos PDF
const testQuestions = [
  "What is the total value of the portfolio?",
  "List all securities in the portfolio with their ISINs",
  "What is the asset allocation of the portfolio?",
  "What is the performance of the portfolio?",
  "What are the top 5 holdings by value?",
  "Are there any bonds in the portfolio?",
  "What is the currency breakdown of the portfolio?"
];

// Main test function
async function testMessosProcessing() {
  log('Starting Messos PDF processing test');
  
  const browser = await puppeteer.launch({
    headless: false, // Set to false to see the browser
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1920,1080']
  });
  
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  
  try {
    // Step 1: Navigate to upload page
    log('Navigating to upload page');
    await page.goto(`${baseUrl}/upload`, { waitUntil: 'networkidle0', timeout: 30000 });
    await takeScreenshot(page, '01-upload-page');
    
    // Step 2: Upload Messos PDF
    log('Uploading Messos PDF');
    const fileInput = await page.$('input[type="file"]');
    if (!fileInput) {
      throw new Error('File input not found on upload page');
    }
    
    await fileInput.uploadFile(messosPath);
    await takeScreenshot(page, '02-file-selected');
    
    // Step 3: Select processing options
    log('Selecting processing options');
    const checkboxes = await page.$$('.checkbox-group input[type="checkbox"]');
    for (const checkbox of checkboxes) {
      const isChecked = await page.evaluate(el => el.checked, checkbox);
      if (!isChecked) {
        await checkbox.click();
        log('Selected a processing option');
      }
    }
    
    await takeScreenshot(page, '03-options-selected');
    
    // Step 4: Submit the form
    log('Submitting the form');
    const submitButton = await page.$('.submit-button');
    if (!submitButton) {
      throw new Error('Submit button not found');
    }
    
    await Promise.all([
      submitButton.click(),
      page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 10000 }).catch(() => log('No navigation occurred after submit'))
    ]);
    
    await takeScreenshot(page, '04-form-submitted');
    
    // Step 5: Wait for processing to complete
    log('Waiting for processing to complete (max 2 minutes)');
    await page.waitForFunction(
      () => !document.querySelector('.processing-indicator') || 
            document.querySelector('.processing-complete, .success-message'),
      { timeout: 120000 }
    ).catch(() => log('Processing indicator still present after timeout, continuing'));
    
    await takeScreenshot(page, '05-processing-complete');
    
    // Step 6: Check processing results
    log('Checking processing results');
    const pageContent = await page.content();
    
    const hasSuccessMessage = pageContent.includes('success') || 
                             pageContent.includes('processed') || 
                             pageContent.includes('complete');
    
    const hasErrorMessage = pageContent.includes('error') || 
                           pageContent.includes('failed') || 
                           pageContent.includes('timeout');
    
    log(`Processing ${hasSuccessMessage ? 'succeeded' : 'failed'}`);
    if (hasErrorMessage) {
      log('Error message detected');
    }
    
    // Step 7: Navigate to document chat
    log('Navigating to document chat');
    await page.goto(`${baseUrl}/document-chat`, { waitUntil: 'networkidle0', timeout: 30000 });
    await takeScreenshot(page, '06-document-chat');
    
    // Step 8: Select the document
    log('Selecting the document');
    await page.waitForSelector('#document-select', { timeout: 10000 });
    
    // Wait for document options to load
    await page.waitForFunction(
      () => document.querySelector('#document-select').options.length > 1,
      { timeout: 10000 }
    ).catch(() => log('Document options did not load, continuing'));
    
    // Select the first document (should be the Messos PDF)
    await page.select('#document-select', 'doc-1');
    await takeScreenshot(page, '07-document-selected');
    
    // Step 9: Ask test questions
    log('Asking test questions');
    const chatResults = [];
    
    for (let i = 0; i < testQuestions.length; i++) {
      const question = testQuestions[i];
      log(`Asking question ${i+1}: ${question}`);
      
      // Type the question
      await page.waitForSelector('#question-input:not([disabled])', { timeout: 10000 });
      await page.type('#question-input', question);
      
      // Send the question
      const sendButton = await page.$('#send-btn');
      await sendButton.click();
      
      // Wait for the response
      await page.waitForFunction(
        () => {
          const messages = document.querySelectorAll('.message');
          return messages.length >= (i * 2) + 3; // Initial message + user question + AI response for each question
        },
        { timeout: 30000 }
      ).catch(() => log('Response timeout, continuing'));
      
      await takeScreenshot(page, `08-question-${i+1}`);
      
      // Get the response
      const messages = await page.$$('.message');
      const responseElement = messages[messages.length - 1];
      const response = await page.evaluate(el => el.innerText, responseElement);
      
      chatResults.push({
        question,
        response
      });
      
      // Wait a bit before asking the next question
      await page.waitForTimeout(2000);
    }
    
    // Save chat results
    fs.writeFileSync(
      path.join(resultsDir, 'messos-chat-results.json'),
      JSON.stringify(chatResults, null, 2)
    );
    
    log('Test completed successfully');
    
    // Generate HTML report
    generateHtmlReport(chatResults);
    
  } catch (error) {
    log(`Error in test: ${error.message}`);
    console.error(error);
    await takeScreenshot(page, 'error');
  } finally {
    await browser.close();
  }
}

// Generate HTML report
function generateHtmlReport(chatResults) {
  const reportPath = path.join(resultsDir, 'messos-test-report.html');
  
  const htmlContent = `
  <!DOCTYPE html>
  <html>
  <head>
    <title>Messos PDF Processing Test Report</title>
    <style>
      body { font-family: Arial, sans-serif; margin: 20px; }
      h1, h2, h3 { color: #333; }
      .question-answer { margin-bottom: 30px; border: 1px solid #ddd; padding: 15px; border-radius: 5px; }
      .question { font-weight: bold; margin-bottom: 10px; color: #3498db; }
      .answer { white-space: pre-wrap; background-color: #f9f9f9; padding: 10px; border-radius: 5px; }
      .screenshot { max-width: 100%; border: 1px solid #ddd; margin-top: 20px; }
      .screenshot-container { margin-top: 30px; }
      .screenshot-title { font-weight: bold; margin-bottom: 10px; }
    </style>
  </head>
  <body>
    <h1>Messos PDF Processing Test Report</h1>
    
    <h2>Chat Results</h2>
    ${chatResults.map((result, index) => `
      <div class="question-answer">
        <div class="question">Q${index+1}: ${result.question}</div>
        <div class="answer">${result.response}</div>
      </div>
    `).join('')}
    
    <h2>Screenshots</h2>
    <div class="screenshot-container">
      <div class="screenshot-title">1. Upload Page</div>
      <img src="../test-screenshots-messos/01-upload-page.png" class="screenshot" alt="Upload Page">
    </div>
    
    <div class="screenshot-container">
      <div class="screenshot-title">2. File Selected</div>
      <img src="../test-screenshots-messos/02-file-selected.png" class="screenshot" alt="File Selected">
    </div>
    
    <div class="screenshot-container">
      <div class="screenshot-title">3. Options Selected</div>
      <img src="../test-screenshots-messos/03-options-selected.png" class="screenshot" alt="Options Selected">
    </div>
    
    <div class="screenshot-container">
      <div class="screenshot-title">4. Form Submitted</div>
      <img src="../test-screenshots-messos/04-form-submitted.png" class="screenshot" alt="Form Submitted">
    </div>
    
    <div class="screenshot-container">
      <div class="screenshot-title">5. Processing Complete</div>
      <img src="../test-screenshots-messos/05-processing-complete.png" class="screenshot" alt="Processing Complete">
    </div>
    
    <div class="screenshot-container">
      <div class="screenshot-title">6. Document Chat</div>
      <img src="../test-screenshots-messos/06-document-chat.png" class="screenshot" alt="Document Chat">
    </div>
    
    <div class="screenshot-container">
      <div class="screenshot-title">7. Document Selected</div>
      <img src="../test-screenshots-messos/07-document-selected.png" class="screenshot" alt="Document Selected">
    </div>
    
    ${chatResults.map((_, index) => `
      <div class="screenshot-container">
        <div class="screenshot-title">8. Question ${index+1}</div>
        <img src="../test-screenshots-messos/08-question-${index+1}.png" class="screenshot" alt="Question ${index+1}">
      </div>
    `).join('')}
  </body>
  </html>
  `;
  
  fs.writeFileSync(reportPath, htmlContent);
  log(`HTML report generated at ${reportPath}`);
}

// Run the test
testMessosProcessing().catch(error => {
  console.error('Error running test:', error);
});
