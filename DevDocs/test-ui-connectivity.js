// Test script to verify UI changes don't break backend connectivity
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Terminal colors for better readability
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
};

console.log(`${colors.bright}${colors.cyan}=== FinDoc UI Connectivity Test ====${colors.reset}\n`);

// Record test results
const testResults = {
  totalTests: 0,
  passedTests: 0,
  failedTests: 0,
  results: []
};

// Test endpoint connectivity
async function testEndpoint(endpoint, options = {}) {
  const { method = 'GET', body = null, name = endpoint } = options;
  
  testResults.totalTests++;
  
  try {
    console.log(`${colors.yellow}Testing endpoint: ${colors.bright}${name}${colors.reset}`);
    
    const url = `http://localhost:3000/api/${endpoint}`;
    const requestOptions = {
      method,
      headers: { 'Content-Type': 'application/json' }
    };
    
    if (body) {
      requestOptions.body = JSON.stringify(body);
    }
    
    const response = await fetch(url, requestOptions);
    const success = response.status >= 200 && response.status < 300;
    
    if (success) {
      console.log(`${colors.green}✓ ${name} is working correctly (${response.status})${colors.reset}`);
      testResults.passedTests++;
      testResults.results.push({
        name,
        success: true,
        status: response.status
      });
    } else {
      console.log(`${colors.red}✗ ${name} failed with status ${response.status}${colors.reset}`);
      testResults.failedTests++;
      testResults.results.push({
        name,
        success: false,
        status: response.status,
        error: `Failed with status ${response.status}`
      });
    }
    
    return success;
  } catch (error) {
    console.log(`${colors.red}✗ ${name} failed: ${error.message}${colors.reset}`);
    testResults.failedTests++;
    testResults.results.push({
      name,
      success: false,
      error: error.message
    });
    return false;
  }
}

// Check that component interfaces haven't been broken
function checkComponentInterfaces() {
  console.log(`\n${colors.bright}${colors.magenta}Checking component interfaces...${colors.reset}`);
  testResults.totalTests++;
  
  try {
    // Run TypeScript check to ensure component interfaces aren't broken
    execSync('npx tsc --noEmit', { stdio: 'pipe' });
    console.log(`${colors.green}✓ Component interfaces are valid${colors.reset}`);
    testResults.passedTests++;
    testResults.results.push({
      name: 'Component Interface Check',
      success: true
    });
    return true;
  } catch (error) {
    console.log(`${colors.red}✗ Component interfaces check failed${colors.reset}`);
    console.log(`${colors.red}${error.stdout?.toString() || error.message}${colors.reset}`);
    testResults.failedTests++;
    testResults.results.push({
      name: 'Component Interface Check',
      success: false,
      error: error.stdout?.toString() || error.message
    });
    return false;
  }
}

// Run the tests
async function runTests() {
  console.log(`${colors.bright}${colors.magenta}Testing API endpoints...${colors.reset}`);
  
  // Document APIs
  await testEndpoint('documents', { name: 'List Documents' });
  await testEndpoint('documents/process', { 
    method: 'POST',
    name: 'Process Document',
    body: { documentId: 'test-doc-1' }
  });
  
  // Financial APIs
  await testEndpoint('financial/securities', { name: 'Get Securities' });
  await testEndpoint('financial/advisor', { 
    method: 'POST',
    name: 'Financial Advisor',
    body: { query: 'What are my top holdings?' }
  });
  
  // Analytics APIs
  await testEndpoint('financial/analyze-data', { 
    method: 'POST',
    name: 'Analyze Financial Data',
    body: { documentId: 'test-doc-1' }
  });
  
  // Check component interfaces
  checkComponentInterfaces();
  
  // Display summary
  console.log(`\n${colors.bright}${colors.cyan}=== Test Summary ====${colors.reset}`);
  console.log(`${colors.bright}Total Tests: ${testResults.totalTests}${colors.reset}`);
  console.log(`${colors.green}Passed: ${testResults.passedTests}${colors.reset}`);
  console.log(`${colors.red}Failed: ${testResults.failedTests}${colors.reset}`);
  
  // Save results to file
  const resultFile = path.join(__dirname, 'ui-connectivity-test-results.json');
  fs.writeFileSync(resultFile, JSON.stringify(testResults, null, 2));
  console.log(`\nTest results saved to: ${resultFile}`);
  
  if (testResults.failedTests > 0) {
    console.log(`\n${colors.bright}${colors.red}Some tests failed. Please check the results.${colors.reset}`);
    process.exit(1);
  } else {
    console.log(`\n${colors.bright}${colors.green}All tests passed! UI changes don't affect backend connectivity.${colors.reset}`);
  }
}

// Run tests
runTests().catch(error => {
  console.error(`${colors.red}Test execution error: ${error.message}${colors.reset}`);
  process.exit(1);
});