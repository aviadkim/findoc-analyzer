/**
 * Test 1: Basic Website Access
 * 
 * This script tests basic access to the FinDoc Analyzer website.
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// Configuration
const config = {
  url: 'https://findoc-deploy.ey.r.appspot.com/',
  screenshotsDir: path.join(__dirname, 'screenshots'),
  headless: false,
  slowMo: 100
};

// Create screenshots directory if it doesn't exist
fs.mkdirSync(config.screenshotsDir, { recursive: true });

/**
 * Run the test
 */
async function runTest() {
  console.log('Starting Test 1: Basic Website Access...');
  
  // Initialize results
  const results = {
    testId: 'Test-01',
    testName: 'Basic Website Access',
    date: new Date().toISOString(),
    steps: [],
    issues: [],
    screenshots: [],
    overallStatus: 'Pass'
  };
  
  // Launch browser
  const browser = await chromium.launch({
    headless: config.headless,
    slowMo: config.slowMo
  });
  
  // Create context and page
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // Step 1: Open the website
    console.log('Step 1: Opening the website...');
    
    const startTime = Date.now();
    await page.goto(config.url);
    const loadTime = Date.now() - startTime;
    
    // Take screenshot
    const screenshotPath = path.join(config.screenshotsDir, 'test-01-step-01.png');
    await page.screenshot({ path: screenshotPath });
    results.screenshots.push('test-01-step-01.png');
    
    // Check if page loaded
    const pageLoaded = page.url() === config.url;
    
    results.steps.push({
      step: 1,
      description: 'Open the website',
      expectedResult: 'Website loads successfully',
      actualResult: pageLoaded 
        ? `Website loaded successfully in ${loadTime}ms` 
        : `Failed to load website. Current URL: ${page.url()}`,
      status: pageLoaded ? 'Pass' : 'Fail'
    });
    
    if (!pageLoaded) {
      results.issues.push('Website failed to load correctly');
      results.overallStatus = 'Fail';
    }
    
    // Step 2: Verify dashboard is visible
    console.log('Step 2: Verifying dashboard is visible...');
    
    // Check for dashboard elements
    const dashboardTitle = await page.isVisible('text=Dashboard');
    
    // Take screenshot
    const screenshotPath2 = path.join(config.screenshotsDir, 'test-01-step-02.png');
    await page.screenshot({ path: screenshotPath2 });
    results.screenshots.push('test-01-step-02.png');
    
    results.steps.push({
      step: 2,
      description: 'Verify dashboard is visible',
      expectedResult: 'Dashboard title and elements are visible',
      actualResult: dashboardTitle 
        ? 'Dashboard is visible' 
        : 'Dashboard is not visible',
      status: dashboardTitle ? 'Pass' : 'Fail'
    });
    
    if (!dashboardTitle) {
      results.issues.push('Dashboard is not visible');
      results.overallStatus = 'Fail';
    }
    
    // Step 3: Check sidebar navigation
    console.log('Step 3: Checking sidebar navigation...');
    
    // Check for sidebar elements
    const sidebarVisible = await page.isVisible('nav');
    
    // Take screenshot
    const screenshotPath3 = path.join(config.screenshotsDir, 'test-01-step-03.png');
    await page.screenshot({ path: screenshotPath3 });
    results.screenshots.push('test-01-step-03.png');
    
    results.steps.push({
      step: 3,
      description: 'Check sidebar navigation',
      expectedResult: 'Sidebar navigation is visible',
      actualResult: sidebarVisible 
        ? 'Sidebar navigation is visible' 
        : 'Sidebar navigation is not visible',
      status: sidebarVisible ? 'Pass' : 'Fail'
    });
    
    if (!sidebarVisible) {
      results.issues.push('Sidebar navigation is not visible');
      results.overallStatus = 'Fail';
    }
    
  } catch (error) {
    console.error('Test failed:', error);
    
    results.steps.push({
      step: results.steps.length + 1,
      description: 'Unexpected error',
      expectedResult: 'No errors',
      actualResult: `Error: ${error.message}`,
      status: 'Fail'
    });
    
    results.issues.push(`Unexpected error: ${error.message}`);
    results.overallStatus = 'Fail';
    
    // Take error screenshot
    const screenshotPath = path.join(config.screenshotsDir, 'test-01-error.png');
    await page.screenshot({ path: screenshotPath });
    results.screenshots.push('test-01-error.png');
  } finally {
    // Close browser
    await browser.close();
  }
  
  // Save results
  const resultsPath = path.join(__dirname, 'results', 'test-01-results.json');
  fs.mkdirSync(path.dirname(resultsPath), { recursive: true });
  fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
  
  console.log(`Test completed with status: ${results.overallStatus}`);
  console.log(`Results saved to: ${resultsPath}`);
  
  return results;
}

// Run the test if this script is executed directly
if (require.main === module) {
  runTest().catch(console.error);
}

module.exports = runTest;
