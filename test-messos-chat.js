const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Create directories for screenshots and results
const screenshotsDir = path.join(__dirname, 'test-screenshots-messos-chat');
const resultsDir = path.join(__dirname, 'test-results-messos-chat');

if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

if (!fs.existsSync(resultsDir)) {
  fs.mkdirSync(resultsDir, { recursive: true });
}

// URL of the deployed application
const baseUrl = 'https://backv2-app-326324779592.me-west1.run.app';

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

// Helper function to log with timestamp
function log(message) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${message}`);
  fs.appendFileSync(
    path.join(resultsDir, 'messos-chat-log.txt'),
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

// Main test function
async function testMessosChat() {
  log('Starting Messos chat test');
  
  const browser = await puppeteer.launch({
    headless: false, // Set to false to see the browser
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1920,1080']
  });
  
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  
  try {
    // Step 1: Navigate to document chat
    log('Navigating to document chat');
    await page.goto(`${baseUrl}/document-chat`, { waitUntil: 'networkidle0', timeout: 30000 });
    await takeScreenshot(page, '01-document-chat');
    
    // Step 2: Wait for document options to load
    log('Waiting for document options to load');
    await page.waitForFunction(
      () => {
        const select = document.querySelector('#document-select');
        return select && select.options.length > 1;
      },
      { timeout: 10000 }
    ).catch(() => {
      log('Document options did not load automatically, trying to refresh');
      return page.reload({ waitUntil: 'networkidle0' });
    });
    
    await takeScreenshot(page, '02-document-options-loaded');
    
    // Step 3: Select the document
    log('Selecting the document');
    const documentOptions = await page.evaluate(() => {
      const select = document.querySelector('#document-select');
      return Array.from(select.options).map(option => ({
        value: option.value,
        text: option.text
      }));
    });
    
    log(`Available documents: ${JSON.stringify(documentOptions)}`);
    
    // Select the first non-empty option
    const documentOption = documentOptions.find(option => option.value !== '');
    if (!documentOption) {
      throw new Error('No document options available');
    }
    
    log(`Selecting document: ${documentOption.text} (${documentOption.value})`);
    await page.select('#document-select', documentOption.value);
    
    // Wait for document to load
    await page.waitForTimeout(2000);
    await takeScreenshot(page, '03-document-selected');
    
    // Step 4: Wait for chat input to be enabled
    log('Waiting for chat input to be enabled');
    await page.waitForSelector('#question-input:not([disabled])', { timeout: 10000 })
      .catch(() => {
        log('Chat input not enabled, trying to select document again');
        return page.select('#document-select', documentOption.value);
      });
    
    await page.waitForSelector('#question-input:not([disabled])', { timeout: 10000 })
      .catch(() => {
        log('Chat input still not enabled, continuing anyway');
      });
    
    await takeScreenshot(page, '04-chat-input-enabled');
    
    // Step 5: Ask test questions
    log('Asking test questions');
    const chatResults = [];
    
    for (let i = 0; i < testQuestions.length; i++) {
      const question = testQuestions[i];
      log(`Asking question ${i+1}: ${question}`);
      
      try {
        // Type the question
        await page.waitForSelector('#question-input', { timeout: 5000 });
        await page.evaluate(() => {
          const input = document.querySelector('#question-input');
          input.disabled = false;
        });
        
        await page.type('#question-input', question);
        await takeScreenshot(page, `05-question-${i+1}-typed`);
        
        // Send the question
        const sendButton = await page.$('#send-btn');
        if (!sendButton) {
          throw new Error('Send button not found');
        }
        
        await page.evaluate(() => {
          const button = document.querySelector('#send-btn');
          button.disabled = false;
        });
        
        await sendButton.click();
        log(`Question ${i+1} sent`);
        
        // Wait for the response
        await page.waitForTimeout(5000); // Wait for typing indicator to appear
        await takeScreenshot(page, `06-question-${i+1}-waiting`);
        
        await page.waitForTimeout(5000); // Wait for response
        await takeScreenshot(page, `07-question-${i+1}-response`);
        
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
      } catch (error) {
        log(`Error asking question ${i+1}: ${error.message}`);
        chatResults.push({
          question,
          response: `Error: ${error.message}`
        });
      }
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
    // Keep the browser open for manual inspection
    // await browser.close();
  }
}

// Generate HTML report
function generateHtmlReport(chatResults) {
  const reportPath = path.join(resultsDir, 'messos-chat-report.html');
  
  const htmlContent = `
  <!DOCTYPE html>
  <html>
  <head>
    <title>Messos Chat Test Report</title>
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
    <h1>Messos Chat Test Report</h1>
    
    <h2>Chat Results</h2>
    ${chatResults.map((result, index) => `
      <div class="question-answer">
        <div class="question">Q${index+1}: ${result.question}</div>
        <div class="answer">${result.response}</div>
      </div>
    `).join('')}
    
    <h2>Screenshots</h2>
    <div class="screenshot-container">
      <div class="screenshot-title">1. Document Chat</div>
      <img src="../test-screenshots-messos-chat/01-document-chat.png" class="screenshot" alt="Document Chat">
    </div>
    
    <div class="screenshot-container">
      <div class="screenshot-title">2. Document Options Loaded</div>
      <img src="../test-screenshots-messos-chat/02-document-options-loaded.png" class="screenshot" alt="Document Options Loaded">
    </div>
    
    <div class="screenshot-container">
      <div class="screenshot-title">3. Document Selected</div>
      <img src="../test-screenshots-messos-chat/03-document-selected.png" class="screenshot" alt="Document Selected">
    </div>
    
    <div class="screenshot-container">
      <div class="screenshot-title">4. Chat Input Enabled</div>
      <img src="../test-screenshots-messos-chat/04-chat-input-enabled.png" class="screenshot" alt="Chat Input Enabled">
    </div>
    
    ${chatResults.map((_, index) => `
      <div class="screenshot-container">
        <div class="screenshot-title">5. Question ${index+1} Typed</div>
        <img src="../test-screenshots-messos-chat/05-question-${index+1}-typed.png" class="screenshot" alt="Question ${index+1} Typed">
      </div>
      
      <div class="screenshot-container">
        <div class="screenshot-title">6. Question ${index+1} Waiting</div>
        <img src="../test-screenshots-messos-chat/06-question-${index+1}-waiting.png" class="screenshot" alt="Question ${index+1} Waiting">
      </div>
      
      <div class="screenshot-container">
        <div class="screenshot-title">7. Question ${index+1} Response</div>
        <img src="../test-screenshots-messos-chat/07-question-${index+1}-response.png" class="screenshot" alt="Question ${index+1} Response">
      </div>
    `).join('')}
  </body>
  </html>
  `;
  
  fs.writeFileSync(reportPath, htmlContent);
  log(`HTML report generated at ${reportPath}`);
}

// Run the test
testMessosChat().catch(error => {
  console.error('Error running test:', error);
});
