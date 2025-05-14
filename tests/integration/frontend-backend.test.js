/**
 * Frontend-Backend Integration Test
 * Tests for integration between frontend and backend
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

// Test configuration
const config = {
  url: process.env.TEST_URL || 'http://localhost:8081',
  apiEndpoints: [
    { path: '/api/health', method: 'GET', name: 'Health Check' },
    { path: '/api/documents', method: 'GET', name: 'Get Documents' },
    { path: '/api/agents', method: 'GET', name: 'Get Agents' }
  ],
  screenshotsDir: path.join(__dirname, '../results/screenshots/frontend-backend')
};

// Create screenshots directory
if (!fs.existsSync(config.screenshotsDir)) {
  fs.mkdirSync(config.screenshotsDir, { recursive: true });
}

// Run the test
async function runTest() {
  console.log(`Testing Frontend-Backend Integration at ${config.url}...`);
  
  const results = {
    feature: 'Frontend-Backend Integration',
    url: config.url,
    apiTests: {},
    uiTests: {},
    success: false
  };
  
  // Test API endpoints
  console.log('Testing API endpoints...');
  
  for (const endpoint of config.apiEndpoints) {
    try {
      console.log(`Testing ${endpoint.name} (${endpoint.method} ${endpoint.path})...`);
      
      const response = await axios({
        method: endpoint.method,
        url: `${config.url}${endpoint.path}`,
        timeout: 10000
      });
      
      console.log(`✅ ${endpoint.name} responded with status ${response.status}`);
      
      results.apiTests[endpoint.name] = {
        success: true,
        status: response.status,
        hasData: !!response.data
      };
      
      // Save response data for reference
      const resultsDir = path.join(__dirname, '../results/api');
      if (!fs.existsSync(resultsDir)) {
        fs.mkdirSync(resultsDir, { recursive: true });
      }
      
      fs.writeFileSync(
        path.join(resultsDir, `${endpoint.name.toLowerCase().replace(/\s+/g, '-')}.json`),
        JSON.stringify(response.data, null, 2)
      );
      
    } catch (error) {
      console.log(`❌ ${endpoint.name} failed: ${error.message}`);
      
      results.apiTests[endpoint.name] = {
        success: false,
        error: error.message
      };
    }
  }
  
  // Test UI integration with backend
  console.log('Testing UI integration with backend...');
  
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    
    // Enable request interception to monitor API calls
    await page.setRequestInterception(true);
    
    const apiCalls = [];
    
    page.on('request', request => {
      const url = request.url();
      if (url.includes('/api/')) {
        apiCalls.push({
          url,
          method: request.method(),
          resourceType: request.resourceType()
        });
      }
      request.continue();
    });
    
    // Test dashboard page
    console.log('Testing dashboard page...');
    await page.goto(`${config.url}/`, { waitUntil: 'networkidle2', timeout: 30000 });
    
    await page.screenshot({ 
      path: path.join(config.screenshotsDir, '01-dashboard.png'),
      fullPage: true
    });
    
    // Wait a bit to capture any delayed API calls
    await page.waitForTimeout(2000);
    
    results.uiTests['dashboard'] = {
      success: true,
      apiCalls: apiCalls.length > 0,
      apiCallCount: apiCalls.length
    };
    
    // Reset API calls for next page
    apiCalls.length = 0;
    
    // Test documents page
    console.log('Testing documents page...');
    await page.goto(`${config.url}/documents-new`, { waitUntil: 'networkidle2', timeout: 30000 });
    
    await page.screenshot({ 
      path: path.join(config.screenshotsDir, '02-documents.png'),
      fullPage: true
    });
    
    // Wait a bit to capture any delayed API calls
    await page.waitForTimeout(2000);
    
    results.uiTests['documents'] = {
      success: true,
      apiCalls: apiCalls.length > 0,
      apiCallCount: apiCalls.length
    };
    
    // Reset API calls for next page
    apiCalls.length = 0;
    
    // Test document chat page
    console.log('Testing document chat page...');
    await page.goto(`${config.url}/document-chat`, { waitUntil: 'networkidle2', timeout: 30000 });
    
    await page.screenshot({ 
      path: path.join(config.screenshotsDir, '03-document-chat.png'),
      fullPage: true
    });
    
    // Wait a bit to capture any delayed API calls
    await page.waitForTimeout(2000);
    
    results.uiTests['document-chat'] = {
      success: true,
      apiCalls: apiCalls.length > 0,
      apiCallCount: apiCalls.length
    };
    
    // Check if any API calls were made across all pages
    const totalApiCalls = Object.values(results.uiTests).reduce(
      (total, test) => total + (test.apiCallCount || 0),
      0
    );
    
    if (totalApiCalls > 0) {
      console.log(`✅ UI made ${totalApiCalls} API calls to backend`);
      results.success = true;
    } else {
      console.log('❌ UI did not make any API calls to backend');
    }
    
  } catch (error) {
    console.error(`Error testing frontend-backend integration: ${error.message}`);
    results.error = error.message;
  } finally {
    await browser.close();
  }
  
  // Save results
  const resultsDir = path.join(__dirname, '../results');
  if (!fs.existsSync(resultsDir)) {
    fs.mkdirSync(resultsDir, { recursive: true });
  }
  
  fs.writeFileSync(
    path.join(resultsDir, 'frontend-backend-test-results.json'),
    JSON.stringify(results, null, 2)
  );
  
  console.log(`Frontend-backend integration test completed. Success: ${results.success}`);
  
  return results;
}

// Run the test if this file is executed directly
if (require.main === module) {
  runTest().catch(console.error);
}

module.exports = runTest;
