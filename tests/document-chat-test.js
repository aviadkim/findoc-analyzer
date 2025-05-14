/**
 * Document Chat Test
 * Tests the document chat functionality
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Create results directory
const resultsDir = path.join(__dirname, 'results');
if (!fs.existsSync(resultsDir)) {
  fs.mkdirSync(resultsDir, { recursive: true });
}

// Create screenshots directory
const screenshotsDir = path.join(__dirname, 'screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

// Test configuration
const config = {
  url: process.env.TEST_URL || 'http://localhost:3002',
  chatPage: '/document-chat',
  testQuestion: 'What is in this document?',
  timeout: 30000 // 30 seconds timeout for response
};

async function runTest() {
  console.log(`Testing document chat at ${config.url}${config.chatPage}...`);
  
  const results = {
    steps: [],
    success: false,
    error: null
  };
  
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  try {
    // Step 1: Navigate to chat page
    results.steps.push({ name: 'Navigate to chat page', status: 'running' });
    await page.goto(`${config.url}${config.chatPage}`, { waitUntil: 'networkidle2', timeout: 30000 });
    await page.screenshot({ path: path.join(screenshotsDir, 'chat-page.png') });
    results.steps[0].status = 'passed';
    
    // Step 2: Check if document selector exists
    results.steps.push({ name: 'Check document selector', status: 'running' });
    const selectorExists = await page.$('select') !== null;
    
    if (!selectorExists) {
      results.steps[1].status = 'failed';
      results.steps[1].error = 'Document selector not found';
      throw new Error('Document selector not found');
    }
    
    results.steps[1].status = 'passed';
    
    // Step 3: Check if any documents are available
    results.steps.push({ name: 'Check document availability', status: 'running' });
    const hasDocuments = await page.evaluate(() => {
      const select = document.querySelector('select');
      return select && select.options.length > 1; // More than just the default option
    });
    
    if (!hasDocuments) {
      results.steps[2].status = 'skipped';
      results.steps[2].message = 'No documents available for chat. Upload a document first.';
      results.success = false; // Not a failure, but not a success either
      return;
    }
    
    results.steps[2].status = 'passed';
    
    // Step 4: Select first document
    results.steps.push({ name: 'Select document', status: 'running' });
    await page.select('select', '1'); // Select first document
    await page.screenshot({ path: path.join(screenshotsDir, 'document-selected.png') });
    results.steps[3].status = 'passed';
    
    // Step 5: Check if chat input exists
    results.steps.push({ name: 'Check chat input', status: 'running' });
    const chatInputExists = await page.$('#document-chat-input') !== null;
    
    if (!chatInputExists) {
      results.steps[4].status = 'failed';
      results.steps[4].error = 'Chat input not found';
      throw new Error('Chat input not found');
    }
    
    results.steps[4].status = 'passed';
    
    // Step 6: Type question
    results.steps.push({ name: 'Type question', status: 'running' });
    await page.type('#document-chat-input', config.testQuestion);
    await page.screenshot({ path: path.join(screenshotsDir, 'question-typed.png') });
    results.steps[5].status = 'passed';
    
    // Step 7: Send question
    results.steps.push({ name: 'Send question', status: 'running' });
    
    // Find the send button
    const sendButton = await page.$('#document-send-btn');
    
    if (!sendButton) {
      results.steps[6].status = 'failed';
      results.steps[6].error = 'Send button not found';
      throw new Error('Send button not found');
    }
    
    await sendButton.click();
    await page.screenshot({ path: path.join(screenshotsDir, 'question-sent.png') });
    results.steps[6].status = 'passed';
    
    // Step 8: Wait for response
    results.steps.push({ name: 'Wait for response', status: 'running' });
    
    try {
      // Wait for response message
      await page.waitForFunction(() => {
        const messages = document.querySelectorAll('.message, .chat-message');
        return messages.length >= 2; // At least question and response
      }, { timeout: config.timeout });
      
      await page.screenshot({ path: path.join(screenshotsDir, 'response-received.png') });
      results.steps[7].status = 'passed';
    } catch (error) {
      results.steps[7].status = 'failed';
      results.steps[7].error = `Timeout waiting for response: ${error.message}`;
      throw new Error(`Timeout waiting for response: ${error.message}`);
    }
    
    // All steps passed
    results.success = true;
    
  } catch (error) {
    console.error(`Error during document chat test: ${error.message}`);
    results.error = error.message;
    
    // Take screenshot of error state
    await page.screenshot({ path: path.join(screenshotsDir, 'chat-error.png') });
    
  } finally {
    await browser.close();
  }
  
  // Save results
  fs.writeFileSync(
    path.join(resultsDir, 'document-chat-test-results.json'),
    JSON.stringify(results, null, 2)
  );
  
  // Generate report
  const report = `
# Document Chat Test Results

Test URL: ${config.url}${config.chatPage}
Date: ${new Date().toISOString()}
Test Question: "${config.testQuestion}"
Overall Result: ${results.success ? '✅ Passed' : '❌ Failed'}
${results.error ? `Error: ${results.error}` : ''}

## Test Steps

${results.steps.map((step, index) => `
### Step ${index + 1}: ${step.name}
- **Status**: ${
  step.status === 'passed' ? '✅ Passed' : 
  step.status === 'failed' ? '❌ Failed' : 
  step.status === 'skipped' ? '⏭️ Skipped' : 
  '⏳ Unknown'
}
${step.error ? `- **Error**: ${step.error}` : ''}
${step.message ? `- **Message**: ${step.message}` : ''}
`).join('\n')}

## Screenshots

The following screenshots were captured during the test:
- [Chat Page](../screenshots/chat-page.png)
${results.steps[2].status === 'passed' ? '- [Document Selected](../screenshots/document-selected.png)' : ''}
${results.steps[5].status === 'passed' ? '- [Question Typed](../screenshots/question-typed.png)' : ''}
${results.steps[6].status === 'passed' ? '- [Question Sent](../screenshots/question-sent.png)' : ''}
${results.steps[7] && results.steps[7].status === 'passed' ? '- [Response Received](../screenshots/response-received.png)' : ''}
${results.error ? '- [Chat Error](../screenshots/chat-error.png)' : ''}

## Recommendations

${!results.success ? `
The document chat functionality needs to be fixed:

${results.steps
  .filter(step => step.status === 'failed')
  .map(step => `- Fix "${step.name}" step: ${step.error}`)
  .join('\n')}
` : 'The document chat functionality is working correctly. No action needed.'}
`;
  
  fs.writeFileSync(
    path.join(resultsDir, 'document-chat-test-report.md'),
    report
  );
  
  console.log(`Test completed. Results saved to ${path.join(resultsDir, 'document-chat-test-results.json')}`);
  console.log(`Report saved to ${path.join(resultsDir, 'document-chat-test-report.md')}`);
  
  return results;
}

// Run the test if this file is executed directly
if (require.main === module) {
  runTest().catch(console.error);
}

module.exports = { runTest };
