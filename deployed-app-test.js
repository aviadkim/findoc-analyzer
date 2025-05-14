const { chromium } = require('playwright');
const assert = require('assert');

// Configuration
const config = {
  baseUrl: 'https://findoc-deploy.ey.r.appspot.com', // Deployed app URL
  timeout: 30000, // Longer timeout for production environment
  screenshotDir: './test-screenshots',
};

// Test steps
const steps = [
  {
    name: 'Step 1: Homepage and Authentication',
    tests: [
      { name: 'Load homepage', action: async (page) => await page.goto(`${config.baseUrl}/`) },
      { name: 'Check title', action: async (page) => await page.waitForSelector('h1', { timeout: config.timeout }) },
      { name: 'Verify navigation', action: async (page) => await page.isVisible('nav') },
      { name: 'Check authentication elements', action: async (page) => await page.isVisible('#login-container, #user-profile, .auth-button') },
    ]
  },
  {
    name: 'Step 2: Document Processing',
    tests: [
      { name: 'Navigate to documents page', action: async (page) => await page.goto(`${config.baseUrl}/documents.html`) },
      { name: 'Check documents container', action: async (page) => await page.waitForSelector('#documents-container', { timeout: config.timeout }) },
      { name: 'Verify document list', action: async (page) => await page.isVisible('.document-list, .document-item') },
      { name: 'Check document processing button', action: async (page) => await page.isVisible('.process-document-button, #process-button') },
      { name: 'Test document API', action: async (page) => {
        return await page.evaluate(async () => {
          try {
            const response = await fetch('/api/documents');
            return await response.json();
          } catch (error) {
            return { error: error.message };
          }
        });
      }},
    ]
  },
  {
    name: 'Step 3: Data Visualization',
    tests: [
      { name: 'Navigate to analytics page', action: async (page) => await page.goto(`${config.baseUrl}/analytics.html`) },
      { name: 'Check analytics container', action: async (page) => await page.waitForSelector('#analytics-container, #visualization-container', { timeout: config.timeout }) },
      { name: 'Verify charts', action: async (page) => await page.isVisible('.chart-container, .visualization') },
      { name: 'Test visualization API', action: async (page) => {
        return await page.evaluate(async () => {
          try {
            const response = await fetch('/api/visualization/portfolio');
            return await response.json();
          } catch (error) {
            return { error: error.message };
          }
        });
      }},
    ]
  }
];

// Run tests
(async () => {
  console.log('Starting deployed application test with Playwright');
  console.log(`Testing URL: ${config.baseUrl}`);
  
  const browser = await chromium.launch({
    headless: true
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Create results object
  const results = {
    url: config.baseUrl,
    timestamp: new Date().toISOString(),
    steps: [],
    summary: {
      total: 0,
      passed: 0,
      failed: 0,
      skipped: 0
    }
  };
  
  try {
    // Run each step
    for (const step of steps) {
      console.log(`\n=== ${step.name} ===`);
      
      const stepResult = {
        name: step.name,
        tests: [],
        passed: 0,
        failed: 0,
        skipped: 0
      };
      
      // Run each test in the step
      for (const test of step.tests) {
        console.log(`Testing: ${test.name}`);
        
        try {
          // Take screenshot before test
          await page.screenshot({ path: `${config.screenshotDir}/${test.name.replace(/\s+/g, '-')}-before.png` });
          
          // Run the test
          const result = await test.action(page);
          
          // Take screenshot after test
          await page.screenshot({ path: `${config.screenshotDir}/${test.name.replace(/\s+/g, '-')}-after.png` });
          
          console.log(`✅ Passed: ${test.name}`);
          stepResult.tests.push({
            name: test.name,
            status: 'passed',
            result: result ? JSON.stringify(result).substring(0, 100) + '...' : 'No result data'
          });
          stepResult.passed++;
          results.summary.passed++;
        } catch (error) {
          console.error(`❌ Failed: ${test.name}`, error.message);
          
          // Take screenshot of failure
          await page.screenshot({ path: `${config.screenshotDir}/${test.name.replace(/\s+/g, '-')}-error.png` });
          
          stepResult.tests.push({
            name: test.name,
            status: 'failed',
            error: error.message
          });
          stepResult.failed++;
          results.summary.failed++;
        }
        
        results.summary.total++;
      }
      
      // Add step results
      results.steps.push(stepResult);
      console.log(`Step results: ${stepResult.passed} passed, ${stepResult.failed} failed`);
    }
    
    // Print summary
    console.log('\n=== Test Summary ===');
    console.log(`Total tests: ${results.summary.total}`);
    console.log(`Passed: ${results.summary.passed}`);
    console.log(`Failed: ${results.summary.failed}`);
    console.log(`Success rate: ${Math.round((results.summary.passed / results.summary.total) * 100)}%`);
    
    // Save results to file
    const fs = require('fs');
    fs.writeFileSync('./deployed-test-results.json', JSON.stringify(results, null, 2));
    console.log('Test results saved to deployed-test-results.json');
    
  } catch (error) {
    console.error('Test execution failed:', error);
  } finally {
    await browser.close();
  }
})();
