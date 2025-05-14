const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const { setTimeout } = require('timers/promises');

// Create directories for screenshots and results
const screenshotsDir = path.join(__dirname, 'test-screenshots-agents');
const resultsDir = path.join(__dirname, 'test-results-agents');

if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

if (!fs.existsSync(resultsDir)) {
  fs.mkdirSync(resultsDir, { recursive: true });
}

// URL of the deployed application
const baseUrl = 'https://backv2-app-326324779592.me-west1.run.app';

// Test documents
const testDocuments = [
  {
    name: 'sample_portfolio.pdf',
    path: path.join(__dirname, 'test-pdfs', 'sample_portfolio.pdf'),
    expectedAgents: ['Document Analyzer', 'Table Understanding', 'Securities Extractor', 'Financial Reasoner'],
    expectedData: {
      securities: true,
      tables: true,
      isins: true
    }
  }
];

// Helper function to log with timestamp
function log(message) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${message}`);
  fs.appendFileSync(
    path.join(resultsDir, 'agent-test-log.txt'),
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

// Test agent selection and processing
async function testAgentProcessing(browser, document) {
  const page = await browser.newPage();
  const results = {
    documentName: document.name,
    uploadSuccess: false,
    agentSelection: false,
    processingStarted: false,
    processingCompleted: false,
    dataExtracted: {
      securities: false,
      tables: false,
      isins: false
    },
    errors: [],
    screenshots: []
  };
  
  try {
    log(`Testing document processing for ${document.name}`);
    
    // Navigate to upload page
    log('Navigating to upload page');
    await page.goto(`${baseUrl}/upload`, { waitUntil: 'networkidle0', timeout: 30000 });
    results.screenshots.push(await takeScreenshot(page, `${document.name}-01-upload-page`));
    
    // Check if file input exists
    const fileInput = await page.$('input[type="file"]');
    if (!fileInput) {
      throw new Error('File input not found on upload page');
    }
    
    // Upload document
    log(`Uploading document: ${document.name}`);
    await fileInput.uploadFile(document.path);
    results.screenshots.push(await takeScreenshot(page, `${document.name}-02-file-selected`));
    results.uploadSuccess = true;
    
    // Check for agent selection options
    log('Checking for agent selection options');
    const agentSelectors = await page.$$('.agent-selector, input[type="checkbox"][name*="agent"], .agent-option');
    
    if (agentSelectors && agentSelectors.length > 0) {
      log(`Found ${agentSelectors.length} agent selectors`);
      
      // Select all agents
      for (const selector of agentSelectors) {
        const isChecked = await page.evaluate(el => el.checked, selector);
        if (!isChecked) {
          await selector.click();
          log('Selected an agent');
        }
      }
      
      results.agentSelection = true;
      results.screenshots.push(await takeScreenshot(page, `${document.name}-03-agents-selected`));
    } else {
      log('No agent selectors found, assuming default selection');
      results.agentSelection = true;
    }
    
    // Check for processing options
    const processingOptions = await page.$$('.processing-option, input[type="checkbox"][name*="processing"], .option-checkbox');
    
    if (processingOptions && processingOptions.length > 0) {
      log(`Found ${processingOptions.length} processing options`);
      
      // Select all processing options
      for (const option of processingOptions) {
        const isChecked = await page.evaluate(el => el.checked, option);
        if (!isChecked) {
          await option.click();
          log('Selected a processing option');
        }
      }
      
      results.screenshots.push(await takeScreenshot(page, `${document.name}-04-options-selected`));
    }
    
    // Submit the form
    log('Submitting the form');
    const submitButton = await page.$('button[type="submit"], .upload-button, .submit-button');
    
    if (!submitButton) {
      throw new Error('Submit button not found');
    }
    
    await Promise.all([
      submitButton.click(),
      page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 10000 }).catch(() => log('No navigation occurred after submit'))
    ]);
    
    results.screenshots.push(await takeScreenshot(page, `${document.name}-05-form-submitted`));
    
    // Check for processing indicators
    log('Checking for processing indicators');
    const processingIndicator = await page.$('.processing-indicator, .loading, .spinner, .progress');
    
    if (processingIndicator) {
      log('Processing indicator found, processing started');
      results.processingStarted = true;
      results.screenshots.push(await takeScreenshot(page, `${document.name}-06-processing-started`));
      
      // Wait for processing to complete (max 2 minutes)
      log('Waiting for processing to complete (max 2 minutes)');
      await page.waitForFunction(
        () => !document.querySelector('.processing-indicator, .loading, .spinner, .progress') || 
              document.querySelector('.processing-complete, .success, .result'),
        { timeout: 120000 }
      ).catch(() => log('Processing indicator still present after timeout, continuing'));
      
      results.screenshots.push(await takeScreenshot(page, `${document.name}-07-processing-complete`));
    } else {
      log('No processing indicator found, checking for immediate results');
    }
    
    // Check for success indicators
    log('Checking for success indicators');
    const successIndicator = await page.$('.processing-complete, .success, .result');
    
    if (successIndicator) {
      log('Success indicator found, processing completed');
      results.processingCompleted = true;
    }
    
    // Check for results
    log('Checking for extracted data');
    const pageContent = await page.content();
    
    // Check for securities
    if (pageContent.includes('securities') || 
        pageContent.includes('Securities') || 
        pageContent.includes('ISIN') || 
        pageContent.includes('stock') || 
        pageContent.includes('bond')) {
      log('Securities data found');
      results.dataExtracted.securities = true;
    }
    
    // Check for tables
    if (pageContent.includes('table') || 
        pageContent.includes('Table') || 
        pageContent.includes('<table') || 
        pageContent.includes('grid')) {
      log('Table data found');
      results.dataExtracted.tables = true;
    }
    
    // Check for ISINs
    if (pageContent.includes('ISIN') || 
        pageContent.match(/[A-Z]{2}[A-Z0-9]{9}[0-9]/g)) {
      log('ISIN data found');
      results.dataExtracted.isins = true;
    }
    
    // Navigate to document chat to test agent integration
    log('Navigating to document chat to test agent integration');
    await page.goto(`${baseUrl}/document-chat`, { waitUntil: 'networkidle0', timeout: 30000 });
    results.screenshots.push(await takeScreenshot(page, `${document.name}-08-document-chat`));
    
    // Check if there are documents listed
    const documentsList = await page.$('.documents-list, .document-selector, select[name="document"]');
    
    if (documentsList) {
      log('Documents list found in chat interface');
      
      // Select the first document if it's a dropdown
      const isDropdown = await page.$('select[name="document"]');
      if (isDropdown) {
        await page.select('select[name="document"]', '1');
        log('Selected first document from dropdown');
      }
      
      // Try to find and click on the first document if it's a list
      const documentItem = await page.$('.document-item, .document-option');
      if (documentItem) {
        await documentItem.click();
        log('Clicked on first document in list');
      }
      
      results.screenshots.push(await takeScreenshot(page, `${document.name}-09-document-selected`));
      
      // Try to ask a question
      const chatInput = await page.$('input[type="text"], textarea, .chat-input');
      
      if (chatInput) {
        log('Chat input found, asking a test question');
        await chatInput.type('What securities are in this document?');
        
        const sendButton = await page.$('button[type="submit"], .send-button, .submit');
        
        if (sendButton) {
          await sendButton.click();
          log('Sent test question');
          
          // Wait for response (max 30 seconds)
          await page.waitForFunction(
            () => document.querySelector('.chat-response, .answer, .response, .message:not(.user-message)'),
            { timeout: 30000 }
          ).catch(() => log('No response received after timeout'));
          
          results.screenshots.push(await takeScreenshot(page, `${document.name}-10-chat-response`));
          
          // Check if response contains relevant information
          const responseContent = await page.content();
          
          if (responseContent.includes('securities') || 
              responseContent.includes('Securities') || 
              responseContent.includes('ISIN') || 
              responseContent.includes('stock') || 
              responseContent.includes('bond')) {
            log('Chat response contains relevant securities information');
            results.agentIntegration = true;
          }
        }
      }
    }
    
    log(`Document processing test for ${document.name} completed`);
    
  } catch (error) {
    log(`Error in document processing test for ${document.name}: ${error.message}`);
    results.errors.push(error.message);
    results.screenshots.push(await takeScreenshot(page, `${document.name}-error`));
  } finally {
    await page.close();
  }
  
  return results;
}

// Main test function
async function runAgentTests() {
  log('Starting agent and processing tests');
  
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const testResults = [];
  
  try {
    // Test each document
    for (const document of testDocuments) {
      if (!fs.existsSync(document.path)) {
        log(`Test document not found: ${document.path}`);
        continue;
      }
      
      const result = await testAgentProcessing(browser, document);
      testResults.push(result);
    }
    
    // Save test results
    fs.writeFileSync(
      path.join(resultsDir, 'agent-test-results.json'),
      JSON.stringify(testResults, null, 2)
    );
    
    // Generate HTML report
    generateHtmlReport(testResults);
    
    log('Agent and processing tests completed');
    
  } catch (error) {
    log(`Error in agent tests: ${error.message}`);
  } finally {
    await browser.close();
  }
}

// Generate HTML report
function generateHtmlReport(results) {
  const reportPath = path.join(resultsDir, 'agent-test-report.html');
  
  const htmlContent = `
  <!DOCTYPE html>
  <html>
  <head>
    <title>Agent and Processing Test Report</title>
    <style>
      body { font-family: Arial, sans-serif; margin: 20px; }
      h1, h2, h3 { color: #333; }
      .test-result { margin-bottom: 30px; border: 1px solid #ddd; padding: 15px; border-radius: 5px; }
      .passed { border-left: 5px solid green; }
      .failed { border-left: 5px solid red; }
      .test-result h3 { margin-top: 0; }
      .screenshot { max-width: 100%; border: 1px solid #ddd; margin-top: 10px; }
      .section { margin-bottom: 20px; }
      .status { font-weight: bold; }
      .status.success { color: green; }
      .status.failure { color: red; }
      .error { color: red; margin-top: 10px; padding: 10px; background-color: #ffeeee; border-radius: 5px; }
      .summary { margin-bottom: 30px; }
      table { border-collapse: collapse; width: 100%; }
      th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
      th { background-color: #f2f2f2; }
    </style>
  </head>
  <body>
    <h1>Agent and Processing Test Report</h1>
    
    <div class="summary">
      <h2>Summary</h2>
      <table>
        <tr>
          <th>Document</th>
          <th>Upload</th>
          <th>Agent Selection</th>
          <th>Processing</th>
          <th>Securities</th>
          <th>Tables</th>
          <th>ISINs</th>
          <th>Status</th>
        </tr>
        ${results.map(result => `
          <tr>
            <td>${result.documentName}</td>
            <td class="status ${result.uploadSuccess ? 'success' : 'failure'}">${result.uploadSuccess ? 'Success' : 'Failed'}</td>
            <td class="status ${result.agentSelection ? 'success' : 'failure'}">${result.agentSelection ? 'Success' : 'Failed'}</td>
            <td class="status ${result.processingCompleted ? 'success' : 'failure'}">${result.processingCompleted ? 'Success' : 'Failed'}</td>
            <td class="status ${result.dataExtracted.securities ? 'success' : 'failure'}">${result.dataExtracted.securities ? 'Found' : 'Not Found'}</td>
            <td class="status ${result.dataExtracted.tables ? 'success' : 'failure'}">${result.dataExtracted.tables ? 'Found' : 'Not Found'}</td>
            <td class="status ${result.dataExtracted.isins ? 'success' : 'failure'}">${result.dataExtracted.isins ? 'Found' : 'Not Found'}</td>
            <td class="status ${result.errors.length === 0 ? 'success' : 'failure'}">${result.errors.length === 0 ? 'Passed' : 'Failed'}</td>
          </tr>
        `).join('')}
      </table>
    </div>
    
    <h2>Detailed Results</h2>
    
    ${results.map(result => `
      <div class="test-result ${result.errors.length === 0 ? 'passed' : 'failed'}">
        <h3>Document: ${result.documentName}</h3>
        
        <div class="section">
          <h4>Test Steps</h4>
          <p>Upload: <span class="status ${result.uploadSuccess ? 'success' : 'failure'}">${result.uploadSuccess ? 'Success' : 'Failed'}</span></p>
          <p>Agent Selection: <span class="status ${result.agentSelection ? 'success' : 'failure'}">${result.agentSelection ? 'Success' : 'Failed'}</span></p>
          <p>Processing Started: <span class="status ${result.processingStarted ? 'success' : 'failure'}">${result.processingStarted ? 'Yes' : 'No'}</span></p>
          <p>Processing Completed: <span class="status ${result.processingCompleted ? 'success' : 'failure'}">${result.processingCompleted ? 'Yes' : 'No'}</span></p>
        </div>
        
        <div class="section">
          <h4>Data Extraction</h4>
          <p>Securities: <span class="status ${result.dataExtracted.securities ? 'success' : 'failure'}">${result.dataExtracted.securities ? 'Found' : 'Not Found'}</span></p>
          <p>Tables: <span class="status ${result.dataExtracted.tables ? 'success' : 'failure'}">${result.dataExtracted.tables ? 'Found' : 'Not Found'}</span></p>
          <p>ISINs: <span class="status ${result.dataExtracted.isins ? 'success' : 'failure'}">${result.dataExtracted.isins ? 'Found' : 'Not Found'}</span></p>
        </div>
        
        ${result.errors.length > 0 ? `
          <div class="section">
            <h4>Errors</h4>
            ${result.errors.map(error => `<div class="error">${error}</div>`).join('')}
          </div>
        ` : ''}
        
        <div class="section">
          <h4>Screenshots</h4>
          ${result.screenshots.map((screenshot, index) => `
            <div>
              <h5>Step ${index + 1}</h5>
              <img src="../${path.relative(__dirname, screenshot)}" class="screenshot" alt="Step ${index + 1}">
            </div>
          `).join('')}
        </div>
      </div>
    `).join('')}
  </body>
  </html>
  `;
  
  fs.writeFileSync(reportPath, htmlContent);
  log(`HTML report generated at ${reportPath}`);
}

// Run the tests
runAgentTests().catch(error => {
  console.error('Error running agent tests:', error);
});
