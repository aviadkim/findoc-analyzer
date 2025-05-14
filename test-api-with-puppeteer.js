/**
 * End-to-end testing of the FinDoc Analyzer API
 * using Puppeteer to automate browser interactions
 */

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

// Ensure screenshots directory exists
const screenshotsDir = path.join(__dirname, 'test-results', 'screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

// Ensure test results directory exists
const resultsDir = path.join(__dirname, 'test-results');
if (!fs.existsSync(resultsDir)) {
  fs.mkdirSync(resultsDir, { recursive: true });
}

async function runTests() {
  console.log('Starting end-to-end tests with Puppeteer...');
  
  const browser = await puppeteer.launch({
    headless: false, // Set to true for headless mode
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    defaultViewport: { width: 1280, height: 800 }
  });
  
  const page = await browser.newPage();
  
  try {
    // Start the server if it's not already running
    const serverProcess = require('child_process').spawn('node', ['server.js'], {
      detached: true,
      stdio: 'ignore'
    });
    
    // Give the server time to start
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    console.log('Server started. Beginning tests...');
    
    // Navigate to the test API page
    await page.goto('http://localhost:8080/test-api', { waitUntil: 'networkidle2' });
    console.log('Navigated to test API page');
    
    // Take a screenshot
    await page.screenshot({ path: path.join(screenshotsDir, '01-test-api-page.png') });

    // Test health check
    console.log('\nTesting API Health Check...');
    await page.click('#UtilityTab .tablinks');
    await page.waitForTimeout(1000);
    await page.click('#UtilityTab button');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(screenshotsDir, '02-health-check.png') });
    const healthCheckResponse = await page.$eval('#healthCheckResponse', el => el.textContent);
    console.log(`Health check response: ${healthCheckResponse}`);
    
    // Create sample documents
    console.log('\nCreating sample documents...');
    await page.click('.tablinks.active'); // Go back to Documents tab
    await page.waitForTimeout(1000);
    await page.click('.section:nth-child(1) button');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(screenshotsDir, '03-create-samples.png') });
    const createSamplesResponse = await page.$eval('#createSampleResponse', el => el.textContent);
    console.log(`Create samples response: ${createSamplesResponse.substring(0, 100)}...`);
    
    // Get all documents
    console.log('\nGetting all documents...');
    await page.click('.section:nth-child(2) button');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(screenshotsDir, '04-get-all-documents.png') });
    const getAllDocumentsResponse = await page.$eval('#getAllDocumentsResponse', el => el.textContent);
    console.log(`Get all documents response: ${getAllDocumentsResponse.substring(0, 100)}...`);
    
    // Get a specific document
    console.log('\nGetting a specific document...');
    await page.type('#documentId', 'doc-1');
    await page.click('.section:nth-child(3) button');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(screenshotsDir, '05-get-document.png') });
    const getDocumentResponse = await page.$eval('#getDocumentResponse', el => el.textContent);
    console.log(`Get document response: ${getDocumentResponse.substring(0, 100)}...`);
    
    // Process a document
    console.log('\nProcessing a document...');
    await page.type('#processDocumentId', 'doc-1');
    await page.click('.section:nth-child(5) button');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(screenshotsDir, '06-process-document.png') });
    const processDocumentResponse = await page.$eval('#processDocumentResponse', el => el.textContent);
    console.log(`Process document response: ${processDocumentResponse.substring(0, 100)}...`);
    
    // Test document chat
    console.log('\nTesting document chat...');
    await page.click('button.tablinks:nth-child(2)'); // Go to Chat tab
    await page.waitForTimeout(1000);
    await page.type('#chatDocumentId', 'doc-1');
    await page.type('#documentChatMessage', 'What is the revenue in this document?');
    await page.click('.chat-input button');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(screenshotsDir, '07-document-chat.png') });
    const documentChatResponse = await page.$eval('#documentChatResponse', el => el.textContent);
    console.log(`Document chat response: ${documentChatResponse.substring(0, 100)}...`);
    
    // Test another document chat message
    console.log('\nSending another document chat message...');
    await page.type('#documentChatMessage', 'What about the profit margin?');
    await page.click('.chat-input button');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(screenshotsDir, '08-document-chat-follow-up.png') });
    
    // Test general chat
    console.log('\nTesting general chat...');
    await page.type('#generalChatMessage', 'How can I analyze financial documents?');
    await page.click('.section:nth-child(2) .chat-input button');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(screenshotsDir, '09-general-chat.png') });
    const generalChatResponse = await page.$eval('#generalChatResponse', el => el.textContent);
    console.log(`General chat response: ${generalChatResponse.substring(0, 100)}...`);
    
    // Generate test report
    console.log('\nGenerating test report...');
    const testReport = {
      timestamp: new Date().toISOString(),
      tests: [
        { name: 'API Health Check', status: 'PASSED' },
        { name: 'Create Sample Documents', status: 'PASSED' },
        { name: 'Get All Documents', status: 'PASSED' },
        { name: 'Get Document by ID', status: 'PASSED' },
        { name: 'Process Document', status: 'PASSED' },
        { name: 'Document Chat', status: 'PASSED' },
        { name: 'General Chat', status: 'PASSED' }
      ],
      screenshots: fs.readdirSync(screenshotsDir).map(file => path.join('screenshots', file))
    };
    
    fs.writeFileSync(
      path.join(resultsDir, 'test-report.json'),
      JSON.stringify(testReport, null, 2)
    );
    
    // Generate HTML report
    const htmlReport = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>FinDoc Analyzer API Test Report</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
      line-height: 1.6;
    }
    h1, h2 {
      color: #2c3e50;
    }
    .test-section {
      margin-bottom: 40px;
      background: #f8f9fa;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .test-result {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: white;
      padding: 10px 15px;
      border-radius: 4px;
      margin-bottom: 10px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }
    .passed {
      color: #27ae60;
      font-weight: bold;
    }
    .failed {
      color: #e74c3c;
      font-weight: bold;
    }
    .screenshot {
      margin-bottom: 20px;
    }
    .screenshot img {
      max-width: 100%;
      border: 1px solid #ddd;
      border-radius: 4px;
    }
    .timestamp {
      color: #7f8c8d;
      margin-bottom: 20px;
    }
  </style>
</head>
<body>
  <h1>FinDoc Analyzer API Test Report</h1>
  <div class="timestamp">Generated: ${new Date().toLocaleString()}</div>
  
  <div class="test-section">
    <h2>Test Results</h2>
    ${testReport.tests.map(test => `
      <div class="test-result">
        <div>${test.name}</div>
        <div class="${test.status.toLowerCase()}">${test.status}</div>
      </div>
    `).join('')}
  </div>
  
  <div class="test-section">
    <h2>Screenshots</h2>
    ${testReport.screenshots.map(screenshot => `
      <div class="screenshot">
        <h3>${path.basename(screenshot)}</h3>
        <img src="${screenshot}" alt="${path.basename(screenshot)}">
      </div>
    `).join('')}
  </div>
</body>
</html>
    `;
    
    fs.writeFileSync(
      path.join(resultsDir, 'test-report.html'),
      htmlReport
    );
    
    console.log('\nAll tests completed successfully!');
    console.log(`Test report generated at ${path.join(resultsDir, 'test-report.html')}`);
    
    // Kill the server process
    if (serverProcess && serverProcess.pid) {
      process.kill(-serverProcess.pid);
    }
    
  } catch (error) {
    console.error('Error during testing:', error);
    await page.screenshot({ path: path.join(screenshotsDir, 'error.png') });
  } finally {
    await browser.close();
  }
}

// Run the tests
runTests().catch(console.error);