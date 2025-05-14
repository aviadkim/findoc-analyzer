/**
 * Run Tests Against Deployed Application
 * 
 * This script runs tests against the deployed FinDoc Analyzer application.
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Configuration
const config = {
  baseUrl: 'https://findoc-deploy.ey.r.appspot.com',
  testFilesDir: path.join(__dirname, 'tests', 'test-files'),
  resultsDir: path.join(__dirname, 'test-results'),
  reportsDir: path.join(__dirname, 'playwright-report'),
  testCount: 100, // Number of tests to run
  testCategories: [
    'pdf-processing',
    'document-chat',
    'data-visualization',
    'export'
  ]
};

// Create directories if they don't exist
for (const dir of [config.testFilesDir, config.resultsDir, config.reportsDir]) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Generate test files
function generateTestFiles() {
  console.log('Generating test files...');
  
  // Create test PDF if it doesn't exist
  const testPdfPath = path.join(config.testFilesDir, 'messos-portfolio.pdf');
  if (!fs.existsSync(testPdfPath)) {
    console.log('Creating test PDF...');
    execSync(`node tests/test-files/create-messos-pdf.js`, { stdio: 'inherit' });
  }
}

// Run tests
function runTests() {
  console.log(`Running tests against ${config.baseUrl}...`);
  
  try {
    // Run the deployed app tests
    execSync('npx playwright test tests/deployed-app-tests.js', { stdio: 'inherit' });
    console.log('Deployed app tests completed successfully');
    
    // Run the Messos PDF tests
    execSync('npx playwright test tests/messos-pdf-processing.spec.js', { stdio: 'inherit' });
    console.log('Messos PDF tests completed successfully');
    
    // Run the agent functionality tests
    execSync('npx playwright test tests/messos-agent-functionality.spec.js', { stdio: 'inherit' });
    console.log('Agent functionality tests completed successfully');
    
    // Show the test report
    execSync('npx playwright show-report', { stdio: 'inherit' });
  } catch (error) {
    console.error('Error running tests:', error.message);
    
    // Show the test report even if tests fail
    try {
      execSync('npx playwright show-report', { stdio: 'inherit' });
    } catch (showReportError) {
      console.error('Error showing report:', showReportError.message);
    }
    
    process.exit(1);
  }
}

// Generate test dashboard
function generateTestDashboard() {
  console.log('Generating test dashboard...');
  
  try {
    execSync('node test-dashboard/generate-dashboard.js', { stdio: 'inherit' });
    console.log('Test dashboard generated successfully');
  } catch (error) {
    console.error('Error generating test dashboard:', error.message);
  }
}

// Main function
async function main() {
  console.log(`Running tests against deployed application: ${config.baseUrl}`);
  
  // Generate test files
  generateTestFiles();
  
  // Run tests
  runTests();
  
  // Generate test dashboard
  generateTestDashboard();
  
  console.log('All tests completed');
}

// Run the script
main().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});
