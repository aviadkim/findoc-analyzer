/**
 * Sequential Thinking Evaluation of Document Chat Functionality
 * 
 * This script uses Sequential Thinking MCP to deeply analyze the document chat
 * implementation and identify root causes of issues.
 */

const puppeteer = require('puppeteer');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Configuration
const config = {
  baseUrl: 'http://localhost:8080',
  sequentialThinkingUrl: 'http://localhost:8084/api/v1/think',
  testPdfPath: path.join(__dirname, 'sample.pdf'),
  resultsDir: path.join(__dirname, 'sequential-test-results'),
  screenshotsDir: path.join(__dirname, 'sequential-test-results', 'screenshots'),
  timeout: 30000
};

// Create results directories
fs.mkdirSync(config.resultsDir, { recursive: true });
fs.mkdirSync(config.screenshotsDir, { recursive: true });

// Initialize test results
const testResults = {
  observations: [],
  screenshots: [],
  network: [],
  thoughts: [],
  conclusions: []
};

/**
 * Call Sequential Thinking MCP to reason about observations
 */
async function thinkSequentially(prompt, context = {}) {
  try {
    console.log(`Sequential thinking about: ${prompt.substring(0, 100)}...`);
    
    const response = await axios.post(config.sequentialThinkingUrl, {
      prompt,
      context,
      session_id: Date.now().toString(),
      max_steps: 10, // More steps for deeper reasoning
      include_citations: true
    });
    
    // Record the thoughts in our results
    if (response.data.thinking) {
      testResults.thoughts.push(...response.data.thinking);
    }
    
    if (response.data.conclusion) {
      testResults.conclusions.push(response.data.conclusion);
    }
    
    return response.data;
  } catch (error) {
    console.error('Sequential Thinking MCP error:', error.message);
    return { 
      thinking: [`Error connecting to Sequential Thinking MCP: ${error.message}`],
      conclusion: 'Unable to process sequential thoughts'
    };
  }
}

/**
 * Record an observation with a screenshot
 */
async function recordObservation(page, description, details = {}) {
  console.log(`Observation: ${description}`);
  
  // Take a screenshot
  const screenshotPath = path.join(config.screenshotsDir, `obs-${testResults.observations.length + 1}.png`);
  await page.screenshot({ path: screenshotPath, fullPage: true });
  
  // Record the observation
  testResults.observations.push({
    id: testResults.observations.length + 1,
    description,
    screenshot: screenshotPath,
    url: page.url(),
    timestamp: new Date(),
    ...details
  });
  
  // Return the observation ID for reference
  return testResults.observations.length;
}

/**
 * Record network request information
 */
function recordNetworkRequest(request, response) {
  testResults.network.push({
    id: testResults.network.length + 1,
    url: request.url(),
    method: request.method(),
    headers: request.headers(),
    postData: request.postData(),
    status: response?.status(),
    response: response?.body(),
    timestamp: new Date()
  });
}

/**
 * Generate HTML test report
 */
function generateReport() {
  const reportPath = path.join(config.resultsDir, 'sequential-chatbot-analysis.html');
  
  const reportHtml = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sequential Analysis of Document Chat</title>
    <style>
      body { font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 20px; color: #333; }
      h1, h2, h3 { color: #444; }
      .container { max-width: 1200px; margin: 0 auto; }
      .observation { border: 1px solid #ddd; padding: 15px; margin-bottom: 20px; border-radius: 5px; }
      .observation-header { display: flex; justify-content: space-between; margin-bottom: 10px; }
      .observation-id { font-weight: bold; color: #666; }
      .screenshot { max-width: 100%; border: 1px solid #ddd; margin-top: 10px; }
      .thinking { background: #f8f9fa; padding: 15px; margin: 15px 0; border-radius: 5px; }
      .thinking-step { margin-bottom: 10px; padding-left: 15px; border-left: 3px solid #007bff; }
      .conclusion { background: #e9f7ef; padding: 15px; margin: 15px 0; border-radius: 5px; font-weight: bold; }
      .network-requests { background: #f0f0f0; padding: 10px; margin-top: 10px; border-radius: 5px; overflow-x: auto; }
      .network-request { font-family: monospace; margin-bottom: 5px; }
      pre { background: #f5f5f5; padding: 10px; overflow-x: auto; border-radius: 3px; }
    </style>
  </head>
  <body>
    <div class="container">
      <h1>Sequential Analysis of Document Chat</h1>
      
      <h2>Observations</h2>
      ${testResults.observations.map(obs => `
        <div class="observation">
          <div class="observation-header">
            <span class="observation-id">Observation #${obs.id}</span>
            <span>${new Date(obs.timestamp).toLocaleString()}</span>
          </div>
          <p><strong>${obs.description}</strong></p>
          ${obs.details ? `<pre>${JSON.stringify(obs.details, null, 2)}</pre>` : ''}
          <img src="screenshots/obs-${obs.id}.png" alt="Screenshot" class="screenshot">
        </div>
      `).join('')}
      
      <h2>Network Requests</h2>
      <div class="network-requests">
        ${testResults.network.map(req => `
          <div class="network-request">
            ${req.method} ${req.url} - Status: ${req.status || 'N/A'}
          </div>
        `).join('')}
      </div>
      
      <h2>Sequential Thinking Analysis</h2>
      <div class="thinking">
        ${testResults.thoughts.map(thought => `
          <div class="thinking-step">
            <p>${thought}</p>
          </div>
        `).join('')}
      </div>
      
      <h2>Conclusions</h2>
      ${testResults.conclusions.map(conclusion => `
        <div class="conclusion">
          <p>${conclusion}</p>
        </div>
      `).join('')}
    </div>
  </body>
  </html>
  `;
  
  fs.writeFileSync(reportPath, reportHtml);
  console.log(`Report generated at: ${reportPath}`);
  
  // Also save the raw data
  fs.writeFileSync(
    path.join(config.resultsDir, 'sequential-chatbot-analysis.json'), 
    JSON.stringify(testResults, null, 2)
  );
}

/**
 * Main test function
 */
async function runSequentialChatbotTest() {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 1280, height: 800 }
  });
  
  const page = await browser.newPage();
  
  // Create a request interception to record network activity
  await page.setRequestInterception(true);
  
  // Track requests and responses
  page.on('request', request => {
    request.continue();
  });
  
  page.on('requestfinished', async request => {
    const response = request.response();
    recordNetworkRequest(request, response);
  });
  
  try {
    // Step 1: Navigate to homepage and assess purpose
    await page.goto(config.baseUrl);
    await page.waitForTimeout(2000);
    
    const homepageObs = await recordObservation(
      page, 
      "Homepage Observation - Understanding Application Purpose"
    );
    
    // Use Sequential Thinking to understand the application's purpose
    await thinkSequentially(
      `I'm looking at a financial document analysis application's homepage. Based on what I see, 
      what is the purpose of this application? What are the key features it claims to offer? 
      How would financial professionals use this application? What are the expectations for the 
      document chat functionality?`,
      { observationId: homepageObs }
    );
    
    // Step 2: Navigate to document upload
    await page.goto(`${config.baseUrl}/upload`);
    await page.waitForTimeout(2000);
    
    const uploadObs = await recordObservation(
      page, 
      "Upload Page Observation - Understanding Document Upload Process"
    );
    
    // Upload a file if we have the UI elements
    const fileInputSelector = 'input[type="file"]';
    const fileInputExists = await page.$(fileInputSelector) !== null;
    
    if (fileInputExists && fs.existsSync(config.testPdfPath)) {
      await page.waitForSelector(fileInputSelector);
      
      // Get the file input element
      const inputElement = await page.$(fileInputSelector);
      await inputElement.uploadFile(config.testPdfPath);
      await page.waitForTimeout(2000);
      
      await recordObservation(
        page, 
        "File Upload - Document Selected"
      );
      
      // Look for upload or submit button
      const uploadButtonSelector = 'button[type="submit"], button:has-text("Upload")';
      const uploadButtonExists = await page.$(uploadButtonSelector) !== null;
      
      if (uploadButtonExists) {
        await page.click(uploadButtonSelector);
        await page.waitForTimeout(5000);
        
        await recordObservation(
          page, 
          "File Upload - Document Submitted"
        );
      }
    }
    
    // Step 3: Navigate to document chat
    await page.goto(`${config.baseUrl}/document-chat`);
    await page.waitForTimeout(2000);
    
    const chatPageObs = await recordObservation(
      page, 
      "Document Chat Page - Initial State"
    );
    
    // Analyze the chat interface
    await thinkSequentially(
      `I'm looking at the document chat interface of a financial document analysis application. 
      What components do I see? Is there evidence that this is a real chatbot implementation or a mock? 
      What API endpoints would I expect to see if this were a real implementation? What would the 
      architecture of a proper document chat system look like?`,
      { observationId: chatPageObs }
    );
    
    // Step 4: Select a document if possible
    const documentSelectorExists = await page.$('#document-select, select') !== null;
    
    if (documentSelectorExists) {
      await page.select('#document-select, select', '1');
      await page.waitForTimeout(2000);
      
      await recordObservation(
        page, 
        "Document Chat - Document Selected"
      );
    }
    
    // Step 5: Attempt to send a message
    const chatInputSelector = '#chat-input, textarea, input[type="text"]';
    const chatInputExists = await page.$(chatInputSelector) !== null;
    
    if (chatInputExists) {
      await page.waitForSelector(chatInputSelector);
      await page.type(chatInputSelector, 'What are the key financial metrics in this document?');
      await page.waitForTimeout(1000);
      
      const sendButtonSelector = 'button[type="submit"], button:has-text("Send")';
      const sendButtonExists = await page.$(sendButtonSelector) !== null;
      
      if (sendButtonExists) {
        await page.click(sendButtonSelector);
        await page.waitForTimeout(5000);
        
        const responseObs = await recordObservation(
          page, 
          "Document Chat - Message Response"
        );
        
        // Analyze the response
        await thinkSequentially(
          `I've sent a message in the document chat asking about key financial metrics. 
          Based on the response I received, is this a real AI-powered chat or a mock/placeholder? 
          What evidence is there of proper or improper implementation? If it's not working correctly, 
          what are the possible root causes? What would need to be fixed?`,
          { observationId: responseObs }
        );
      }
    }
    
    // Step 6: Look at API calls and network traffic
    const networkAnalysisObs = await recordObservation(
      page, 
      "Network Traffic Analysis"
    );
    
    // Analyze the network traffic
    await thinkSequentially(
      `Based on the network traffic observed during my interaction with the document chat, 
      what APIs are being called? Are there calls to AI/LLM services? Is there evidence of document 
      context being sent to an AI service? What's missing from the API calls that would be needed 
      for a proper implementation? What architecture changes would be needed?`,
      { 
        observationId: networkAnalysisObs,
        networkRequests: testResults.network.filter(req => 
          req.url.includes('/api/') || 
          req.url.includes('chat') || 
          req.url.includes('openai') ||
          req.url.includes('anthropic')
        )
      }
    );
    
    // Step 7: Final assessment and recommendations
    await thinkSequentially(
      `Based on all observations of the document chat functionality in this financial document 
      analysis application, what is my assessment of the current implementation? What are the 
      specific issues that need to be fixed? How should they be prioritized? What would a proper 
      implementation look like? What steps should be taken to implement a production-ready 
      document chat feature?`,
      { allObservations: testResults.observations }
    );
    
    // Generate the report
    generateReport();
    
  } catch (error) {
    console.error('Test error:', error);
  } finally {
    await browser.close();
  }
}

// Run the test
runSequentialChatbotTest().catch(console.error);