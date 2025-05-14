/**
 * Frontend-Backend Integration Test
 * Tests for the integration between frontend and backend components
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Test configuration
const config = {
  url: process.env.TEST_URL || 'http://localhost:8081',
  apiEndpoints: [
    { name: 'Health Check', path: '/api/health', method: 'GET' },
    { name: 'Documents List', path: '/api/documents', method: 'GET' },
    { name: 'Agents List', path: '/api/agents', method: 'GET' }
  ],
  screenshotsDir: path.join(__dirname, '../../test-results/screenshots/integration')
};

// Create screenshots directory
if (!fs.existsSync(config.screenshotsDir)) {
  fs.mkdirSync(config.screenshotsDir, { recursive: true });
}

// Run the test
async function runTest() {
  console.log(`Testing Frontend-Backend Integration at ${config.url}...`);

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const results = {
    url: config.url,
    apiEndpoints: {},
    total: config.apiEndpoints.length,
    successful: 0,
    failed: 0,
    success: false
  };

  try {
    const page = await browser.newPage();

    // Enable request interception
    await page.setRequestInterception(true);

    // Track API responses
    const apiResponses = {};

    page.on('request', request => {
      request.continue();
    });

    page.on('response', async response => {
      const url = response.url();

      // Check if this is one of our API endpoints
      for (const endpoint of config.apiEndpoints) {
        if (url.includes(endpoint.path)) {
          try {
            const responseBody = await response.json().catch(() => null);
            apiResponses[endpoint.path] = {
              status: response.status(),
              body: responseBody
            };
          } catch (error) {
            console.error(`Error parsing response for ${endpoint.path}: ${error.message}`);
          }
        }
      }
    });

    // Navigate to the main page
    await page.goto(config.url, { waitUntil: 'networkidle2', timeout: 30000 });

    // Take a screenshot of the main page
    await page.screenshot({
      path: path.join(config.screenshotsDir, 'main-page.png'),
      fullPage: true
    });

    // Wait a bit to ensure all API calls are completed
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Test each API endpoint
    for (const endpoint of config.apiEndpoints) {
      console.log(`Testing API endpoint: ${endpoint.method} ${endpoint.path}`);

      try {
        // Make a direct fetch request to the API
        const response = await page.evaluate(async (url, path, method) => {
          const response = await fetch(`${url}${path}`, { method });
          if (!response.ok) {
            return {
              success: false,
              status: response.status,
              statusText: response.statusText
            };
          }

          const data = await response.json().catch(() => null);
          return {
            success: true,
            status: response.status,
            data
          };
        }, config.url, endpoint.path, endpoint.method);

        if (response.success) {
          console.log(`✅ ${endpoint.name} (${endpoint.path}) returned status ${response.status}`);
          results.apiEndpoints[endpoint.path] = {
            success: true,
            status: response.status,
            data: response.data
          };
          results.successful++;
        } else {
          console.log(`❌ ${endpoint.name} (${endpoint.path}) failed with status ${response.status}: ${response.statusText}`);
          results.apiEndpoints[endpoint.path] = {
            success: false,
            status: response.status,
            error: response.statusText
          };
          results.failed++;
        }
      } catch (error) {
        console.log(`❌ Error testing ${endpoint.name} (${endpoint.path}): ${error.message}`);
        results.apiEndpoints[endpoint.path] = {
          success: false,
          error: error.message
        };
        results.failed++;
      }
    }

    // Check if we observed any API calls during page load
    console.log('\nAPI calls observed during page load:');
    let observedApiCalls = 0;

    for (const [path, response] of Object.entries(apiResponses)) {
      console.log(`- ${path}: Status ${response.status}`);
      observedApiCalls++;
    }

    if (observedApiCalls === 0) {
      console.log('No API calls were observed during page load.');
    }

    results.observedApiCalls = apiResponses;

    // Set overall success
    results.success = results.successful === results.total;

  } catch (error) {
    console.error(`Error testing frontend-backend integration: ${error.message}`);
    results.error = error.message;
  } finally {
    await browser.close();
  }

  // Save results
  const resultsDir = path.join(__dirname, '../../test-results');
  if (!fs.existsSync(resultsDir)) {
    fs.mkdirSync(resultsDir, { recursive: true });
  }

  fs.writeFileSync(
    path.join(resultsDir, 'frontend-backend-test-results.json'),
    JSON.stringify(results, null, 2)
  );

  console.log(`\nFrontend-Backend integration test completed.`);
  console.log(`Successful API endpoints: ${results.successful}/${results.total}`);
  console.log(`Success: ${results.success}`);

  return results;
}

// Run the test if this file is executed directly
if (require.main === module) {
  runTest().catch(console.error);
}

module.exports = runTest;
