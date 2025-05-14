/**
 * UI Test using Firecrawl MCP
 * This script tests the UI of the FinDoc Analyzer application using Firecrawl
 */

// Use axios instead of fetch
const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

// Configuration
const config = {
  baseUrl: 'http://localhost:8080',
  firecrawlMcpUrl: 'http://localhost:8081/mcp',
  resultsDir: path.join(__dirname, 'firecrawl-test-results'),
  timeout: 30000
};

// Ensure the results directory exists
async function ensureResultsDir() {
  try {
    await fs.mkdir(config.resultsDir, { recursive: true });
    console.log(`Created results directory: ${config.resultsDir}`);
  } catch (error) {
    console.error(`Error creating results directory: ${error.message}`);
  }
}

// Utility function to make a request to the Firecrawl MCP
async function firecrawlMcp(options = {}) {
  try {
    console.log(`Making Firecrawl MCP request to: ${options.url || config.baseUrl}`);

    const response = await axios({
      method: 'POST',
      url: config.firecrawlMcpUrl,
      headers: {
        'Content-Type': 'application/json'
      },
      data: {
        url: options.url || config.baseUrl,
        options: {
          ...options,
          wait: options.wait || 2000
        }
      },
      timeout: config.timeout
    });

    return response.data;
  } catch (error) {
    console.error(`Firecrawl MCP error:`, error.message);
    throw error;
  }
}

// Save content to file
async function saveToFile(filename, content) {
  const filePath = path.join(config.resultsDir, filename);
  await fs.writeFile(filePath, content);
  console.log(`Saved to file: ${filePath}`);
  return filePath;
}

// Run the UI tests
async function runUiTests() {
  console.log('Starting UI tests with Firecrawl MCP...');
  
  // Ensure results directory exists
  await ensureResultsDir();
  
  try {
    // Test results
    const results = {
      timestamp: new Date().toISOString(),
      tests: [],
      passed: 0,
      failed: 0
    };
    
    // Test homepage
    console.log('\nTesting homepage...');
    try {
      const homepageData = await firecrawlMcp({
        url: config.baseUrl,
        fullPage: true,
        screenshot: true
      });
      
      // Save screenshot
      if (homepageData.screenshot) {
        const screenshotBase64 = homepageData.screenshot.replace(/^data:image\/png;base64,/, '');
        await saveToFile('homepage.png', Buffer.from(screenshotBase64, 'base64'));
      }
      
      // Save HTML content
      if (homepageData.html) {
        await saveToFile('homepage.html', homepageData.html);
      }
      
      // Check if sidebar exists
      const hasSidebar = homepageData.html && 
        (homepageData.html.includes('class="sidebar"') || 
         homepageData.html.includes('class="sidebar-nav"'));
      
      console.log(`Homepage has sidebar: ${hasSidebar ? 'Yes' : 'No'}`);
      
      results.tests.push({
        name: 'Homepage loads with sidebar',
        passed: hasSidebar,
        details: hasSidebar ? null : 'Sidebar not found'
      });
      
      if (hasSidebar) results.passed++;
      else results.failed++;
      
    } catch (error) {
      console.error(`Error testing homepage: ${error.message}`);
      results.tests.push({
        name: 'Homepage test',
        passed: false,
        details: error.message
      });
      results.failed++;
    }
    
    // Test upload page
    console.log('\nTesting upload page...');
    try {
      const uploadPageData = await firecrawlMcp({
        url: `${config.baseUrl}/upload`,
        fullPage: true,
        screenshot: true
      });
      
      // Save screenshot
      if (uploadPageData.screenshot) {
        const screenshotBase64 = uploadPageData.screenshot.replace(/^data:image\/png;base64,/, '');
        await saveToFile('upload-page.png', Buffer.from(screenshotBase64, 'base64'));
      }
      
      // Save HTML content
      if (uploadPageData.html) {
        await saveToFile('upload-page.html', uploadPageData.html);
      }
      
      // Check if file input exists
      const hasFileInput = uploadPageData.html && 
        (uploadPageData.html.includes('input type="file"') || 
         uploadPageData.html.includes('id="file-input"'));
      
      console.log(`Upload page has file input: ${hasFileInput ? 'Yes' : 'No'}`);
      
      results.tests.push({
        name: 'Upload page has file input',
        passed: hasFileInput,
        details: hasFileInput ? null : 'File input not found'
      });
      
      if (hasFileInput) results.passed++;
      else results.failed++;
      
      // Check if process button exists
      const hasProcessButton = uploadPageData.html && 
        (uploadPageData.html.includes('id="process-document-btn"') || 
         uploadPageData.html.includes('id="floating-process-btn"') || 
         uploadPageData.html.includes('Process Document'));
      
      console.log(`Upload page has process button: ${hasProcessButton ? 'Yes' : 'No'}`);
      
      results.tests.push({
        name: 'Upload page has process button',
        passed: hasProcessButton,
        details: hasProcessButton ? null : 'Process button not found'
      });
      
      if (hasProcessButton) results.passed++;
      else results.failed++;
      
    } catch (error) {
      console.error(`Error testing upload page: ${error.message}`);
      results.tests.push({
        name: 'Upload page test',
        passed: false,
        details: error.message
      });
      results.failed++;
    }
    
    // Test documents page
    console.log('\nTesting documents page...');
    try {
      const documentsPageData = await firecrawlMcp({
        url: `${config.baseUrl}/documents-new`,
        fullPage: true,
        screenshot: true
      });
      
      // Save screenshot
      if (documentsPageData.screenshot) {
        const screenshotBase64 = documentsPageData.screenshot.replace(/^data:image\/png;base64,/, '');
        await saveToFile('documents-page.png', Buffer.from(screenshotBase64, 'base64'));
      }
      
      // Save HTML content
      if (documentsPageData.html) {
        await saveToFile('documents-page.html', documentsPageData.html);
      }
      
      // Check for document-related elements
      const hasDocumentElements = documentsPageData.html && 
        (documentsPageData.html.includes('class="document-') || 
         documentsPageData.html.includes('id="document-'));
      
      console.log(`Documents page has document elements: ${hasDocumentElements ? 'Yes' : 'No'}`);
      
      results.tests.push({
        name: 'Documents page has document elements',
        passed: hasDocumentElements,
        details: hasDocumentElements ? null : 'Document elements not found'
      });
      
      if (hasDocumentElements) results.passed++;
      else results.failed++;
      
    } catch (error) {
      console.error(`Error testing documents page: ${error.message}`);
      results.tests.push({
        name: 'Documents page test',
        passed: false,
        details: error.message
      });
      results.failed++;
    }
    
    // Test for chat button existence on any page
    console.log('\nTesting for chat button...');
    try {
      // We'll check on the homepage
      const chatData = await firecrawlMcp({
        url: config.baseUrl,
        selectors: ['#show-chat-btn', 'button:contains("Chat")'],
        screenshot: true
      });
      
      // Save screenshot if available
      if (chatData.screenshot) {
        const screenshotBase64 = chatData.screenshot.replace(/^data:image\/png;base64,/, '');
        await saveToFile('chat-button-test.png', Buffer.from(screenshotBase64, 'base64'));
      }
      
      // Check if chat button exists
      const hasChatButton = chatData.elements && 
        chatData.elements.some(el => el.content && el.content.trim() !== '');
      
      console.log(`Chat button exists: ${hasChatButton ? 'Yes' : 'No'}`);
      
      results.tests.push({
        name: 'Chat button exists',
        passed: hasChatButton,
        details: hasChatButton ? null : 'Chat button not found'
      });
      
      if (hasChatButton) results.passed++;
      else results.failed++;
      
    } catch (error) {
      console.error(`Error testing chat button: ${error.message}`);
      results.tests.push({
        name: 'Chat button test',
        passed: false,
        details: error.message
      });
      results.failed++;
    }
    
    // Save test results
    await saveToFile('test-results.json', JSON.stringify(results, null, 2));
    
    // Generate HTML report
    const reportHtml = generateHtmlReport(results);
    await saveToFile('test-report.html', reportHtml);
    
    console.log('\n--- Test Summary ---');
    console.log(`Total tests: ${results.passed + results.failed}`);
    console.log(`Passed: ${results.passed}`);
    console.log(`Failed: ${results.failed}`);
    
    console.log('\nUI tests completed! Check the results directory for details.');
    return results;
    
  } catch (error) {
    console.error('Error during UI tests:', error);
  }
}

// Generate HTML report
function generateHtmlReport(results) {
  const passPercentage = Math.round((results.passed / (results.passed + results.failed)) * 100) || 0;
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Firecrawl UI Test Report</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }
    h1, h2, h3 {
      color: #2c3e50;
    }
    .summary {
      display: flex;
      gap: 20px;
      margin-bottom: 30px;
    }
    .summary-card {
      flex: 1;
      background-color: #f5f5f5;
      border-radius: 8px;
      padding: 20px;
      text-align: center;
    }
    .summary-card.pass {
      background-color: #d4edda;
      color: #155724;
    }
    .summary-card.fail {
      background-color: #f8d7da;
      color: #721c24;
    }
    .progress {
      height: 24px;
      background-color: #f1f1f1;
      border-radius: 12px;
      margin: 20px 0;
      overflow: hidden;
    }
    .progress-bar {
      height: 100%;
      background-color: #4caf50;
      text-align: center;
      line-height: 24px;
      color: white;
      width: ${passPercentage}%;
    }
    .test {
      background-color: #f9f9f9;
      border-radius: 8px;
      padding: 15px;
      margin-bottom: 15px;
    }
    .test.pass {
      border-left: 5px solid #4caf50;
    }
    .test.fail {
      border-left: 5px solid #f44336;
    }
    .test-name {
      font-weight: bold;
    }
    .test-result {
      display: inline-block;
      padding: 5px 10px;
      border-radius: 4px;
      margin-left: 10px;
    }
    .test-result.pass {
      background-color: #d4edda;
      color: #155724;
    }
    .test-result.fail {
      background-color: #f8d7da;
      color: #721c24;
    }
    .test-details {
      margin-top: 10px;
    }
    .screenshot {
      margin-top: 20px;
    }
    .screenshot img {
      max-width: 100%;
      border: 1px solid #ddd;
      border-radius: 4px;
    }
  </style>
</head>
<body>
  <h1>Firecrawl UI Test Report</h1>
  <p>Tests ran on: ${new Date(results.timestamp).toLocaleString()}</p>
  
  <div class="summary">
    <div class="summary-card">
      <h2>Total Tests</h2>
      <div class="count">${results.passed + results.failed}</div>
    </div>
    <div class="summary-card pass">
      <h2>Passed</h2>
      <div class="count">${results.passed}</div>
    </div>
    <div class="summary-card fail">
      <h2>Failed</h2>
      <div class="count">${results.failed}</div>
    </div>
  </div>
  
  <div class="progress">
    <div class="progress-bar" style="width: ${passPercentage}%">${passPercentage}%</div>
  </div>
  
  <h2>Test Results</h2>
  
  ${results.tests.map(test => `
    <div class="test ${test.passed ? 'pass' : 'fail'}">
      <div class="test-header">
        <span class="test-name">${test.name}</span>
        <span class="test-result ${test.passed ? 'pass' : 'fail'}">${test.passed ? 'PASS' : 'FAIL'}</span>
      </div>
      ${test.details ? `<div class="test-details">${test.details}</div>` : ''}
    </div>
  `).join('')}
  
  <h2>Screenshots</h2>
  
  <div class="screenshot">
    <h3>Homepage</h3>
    <img src="homepage.png" alt="Homepage screenshot">
  </div>
  
  <div class="screenshot">
    <h3>Upload Page</h3>
    <img src="upload-page.png" alt="Upload page screenshot">
  </div>
  
  <div class="screenshot">
    <h3>Documents Page</h3>
    <img src="documents-page.png" alt="Documents page screenshot">
  </div>
  
  <div class="screenshot">
    <h3>Chat Button Test</h3>
    <img src="chat-button-test.png" alt="Chat button test screenshot">
  </div>
</body>
</html>`;
}

// Run the tests
runUiTests().catch(console.error);