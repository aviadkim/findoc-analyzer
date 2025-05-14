/**
 * Run All Tests
 * 
 * This script runs all the end-to-end tests for the FinDoc Analyzer application.
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Configuration
const config = {
  testsDir: __dirname,
  reportsDir: path.join(__dirname, 'test-reports'),
  screenshotsDir: path.join(__dirname, 'test-screenshots')
};

// Create directories if they don't exist
for (const dir of [config.reportsDir, config.screenshotsDir]) {
  try {
    fs.mkdirSync(dir, { recursive: true });
  } catch (error) {
    console.warn(`Error creating directory ${dir}:`, error);
  }
}

// Test suites
const testSuites = [
  {
    name: 'PDF Processing Tests',
    file: 'pdf-processing-tests.js'
  },
  {
    name: 'Document Chat Tests',
    file: 'document-chat-tests.js'
  }
];

// Run all test suites
async function runAllTests() {
  console.log('Running all tests...');
  
  for (const suite of testSuites) {
    console.log(`\nRunning ${suite.name}...`);
    
    try {
      execSync(`node ${path.join(config.testsDir, suite.file)}`, { stdio: 'inherit' });
      console.log(`${suite.name} completed successfully`);
    } catch (error) {
      console.error(`Error running ${suite.name}:`, error.message);
    }
  }
  
  console.log('\nAll tests completed');
}

// Run the tests
runAllTests().catch(error => {
  console.error('Error running tests:', error);
  process.exit(1);
});
