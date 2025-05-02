/**
 * FinDoc Analyzer QA Test Runner
 * 
 * This script runs automated tests for the FinDoc Analyzer application.
 */

const { 
  initBrowser, 
  createContext, 
  navigateToApp, 
  login, 
  runTests, 
  saveResults, 
  generateReport 
} = require('./playwright-setup');
const uploadTestCases = require('./upload-test-cases');

/**
 * Main function to run tests
 */
async function main() {
  console.log('Starting FinDoc Analyzer QA Tests...');
  
  // Initialize browser
  const browser = await initBrowser();
  
  try {
    // Create browser context
    const context = await createContext(browser);
    
    // Create page
    const page = await context.newPage();
    
    // Navigate to app
    await navigateToApp(page);
    
    // Login
    const loginSuccess = await login(page);
    
    if (!loginSuccess) {
      console.error('Login failed. Aborting tests.');
      return;
    }
    
    // Run tests
    console.log(`Running ${uploadTestCases.length} upload test cases...`);
    const results = await runTests(page, uploadTestCases);
    
    // Save results
    await saveResults(results);
    
    // Generate report
    await generateReport(results);
    
    console.log('All tests completed!');
  } catch (error) {
    console.error('Test run failed:', error);
  } finally {
    // Close browser
    await browser.close();
  }
}

// Run tests
main().catch(console.error);
