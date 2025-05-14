/**
 * Test and Fix Script
 * Runs tests and fixes issues one by one
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Create interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Configuration
const config = {
  testsDir: path.join(__dirname, '../tests'),
  scriptsDir: path.join(__dirname, '../scripts'),
  resultsDir: path.join(__dirname, '../tests/results'),
  environment: process.env.TEST_ENV || 'local' // 'local' or 'deployed'
};

// Set the URL based on environment
process.env.TEST_URL = config.environment === 'local' ? 
  'http://localhost:3002' : 
  'https://backv2-app-brfi73d4ra-zf.a.run.app';

// Create results directory if it doesn't exist
if (!fs.existsSync(config.resultsDir)) {
  fs.mkdirSync(config.resultsDir, { recursive: true });
}

// Available tests
const tests = [
  { name: 'Basic UI Components', script: 'basic-ui-test.js', fixer: 'fix-ui-components.js' },
  { name: 'Document Upload', script: 'document-upload-test.js', fixer: null },
  { name: 'Document Chat', script: 'document-chat-test.js', fixer: null }
];

// Function to run a test
function runTest(test) {
  console.log(`\n=== Running ${test.name} Test ===\n`);
  
  try {
    execSync(`node ${path.join(config.testsDir, test.script)}`, { stdio: 'inherit' });
    console.log(`\n${test.name} Test completed.\n`);
    return true;
  } catch (error) {
    console.error(`Error running ${test.name} Test: ${error.message}`);
    return false;
  }
}

// Function to run a fixer script
function runFixer(test) {
  if (!test.fixer) {
    console.log(`No fixer available for ${test.name}.`);
    return false;
  }
  
  console.log(`\n=== Running ${test.name} Fixer ===\n`);
  
  try {
    execSync(`node ${path.join(config.scriptsDir, test.fixer)}`, { stdio: 'inherit' });
    console.log(`\n${test.name} Fixer completed.\n`);
    return true;
  } catch (error) {
    console.error(`Error running ${test.name} Fixer: ${error.message}`);
    return false;
  }
}

// Function to check if a test passed
function checkTestPassed(test) {
  try {
    if (test.name === 'Basic UI Components') {
      const resultsPath = path.join(config.resultsDir, 'basic-ui-test-results.json');
      const results = JSON.parse(fs.readFileSync(resultsPath, 'utf8'));
      return results.failed === 0;
    } else if (test.name === 'Document Upload') {
      const resultsPath = path.join(config.resultsDir, 'document-upload-test-results.json');
      const results = JSON.parse(fs.readFileSync(resultsPath, 'utf8'));
      return results.success;
    } else if (test.name === 'Document Chat') {
      const resultsPath = path.join(config.resultsDir, 'document-chat-test-results.json');
      const results = JSON.parse(fs.readFileSync(resultsPath, 'utf8'));
      return results.success;
    }
    
    return false;
  } catch (error) {
    console.error(`Error checking if ${test.name} Test passed: ${error.message}`);
    return false;
  }
}

// Function to run all tests
function runAllTests() {
  console.log(`\n=== Running All Tests (${config.environment} environment) ===\n`);
  
  const results = [];
  
  for (const test of tests) {
    const passed = runTest(test);
    results.push({ test, passed });
  }
  
  console.log('\n=== Test Results ===\n');
  
  for (const result of results) {
    console.log(`${result.test.name}: ${result.passed ? 'Passed' : 'Failed'}`);
  }
  
  return results;
}

// Function to fix all issues
function fixAllIssues() {
  console.log('\n=== Fixing All Issues ===\n');
  
  for (const test of tests) {
    if (!checkTestPassed(test) && test.fixer) {
      runFixer(test);
      
      // Run the test again to see if it's fixed
      runTest(test);
      
      if (checkTestPassed(test)) {
        console.log(`✅ ${test.name} issues fixed successfully.`);
      } else {
        console.log(`❌ ${test.name} issues could not be fixed automatically.`);
      }
    }
  }
}

// Function to deploy to Docker
function deployToDocker() {
  console.log('\n=== Deploying to Docker ===\n');
  
  try {
    execSync('powershell -ExecutionPolicy Bypass -File .\\deploy-to-docker.ps1', { stdio: 'inherit' });
    console.log('\nDeployment to Docker completed.\n');
    return true;
  } catch (error) {
    console.error(`Error deploying to Docker: ${error.message}`);
    return false;
  }
}

// Function to deploy to Google Cloud
function deployToCloud() {
  console.log('\n=== Deploying to Google Cloud ===\n');
  
  try {
    execSync('powershell -ExecutionPolicy Bypass -File .\\deploy-to-cloud.ps1', { stdio: 'inherit' });
    console.log('\nDeployment to Google Cloud completed.\n');
    return true;
  } catch (error) {
    console.error(`Error deploying to Google Cloud: ${error.message}`);
    return false;
  }
}

// Main menu
function showMainMenu() {
  console.log('\n=== FinDoc Analyzer Test and Fix ===\n');
  console.log(`Current environment: ${config.environment.toUpperCase()}`);
  console.log('\nOptions:');
  console.log('1. Run all tests');
  console.log('2. Fix all issues');
  console.log('3. Run tests and fix issues');
  console.log('4. Deploy to Docker');
  console.log('5. Deploy to Google Cloud');
  console.log('6. Switch environment');
  console.log('7. Exit');
  
  rl.question('\nEnter your choice (1-7): ', (answer) => {
    switch (answer) {
      case '1':
        runAllTests();
        showMainMenu();
        break;
      case '2':
        fixAllIssues();
        showMainMenu();
        break;
      case '3':
        runAllTests();
        fixAllIssues();
        showMainMenu();
        break;
      case '4':
        deployToDocker();
        showMainMenu();
        break;
      case '5':
        deployToCloud();
        showMainMenu();
        break;
      case '6':
        switchEnvironment();
        break;
      case '7':
        console.log('\nExiting...');
        rl.close();
        break;
      default:
        console.log('\nInvalid choice. Please try again.');
        showMainMenu();
        break;
    }
  });
}

// Switch environment
function switchEnvironment() {
  console.log('\n=== Switch Environment ===\n');
  console.log('1. Local (http://localhost:3002)');
  console.log('2. Deployed (https://backv2-app-brfi73d4ra-zf.a.run.app)');
  
  rl.question('\nEnter your choice (1-2): ', (answer) => {
    switch (answer) {
      case '1':
        config.environment = 'local';
        process.env.TEST_URL = 'http://localhost:3002';
        console.log('\nSwitched to local environment.');
        showMainMenu();
        break;
      case '2':
        config.environment = 'deployed';
        process.env.TEST_URL = 'https://backv2-app-brfi73d4ra-zf.a.run.app';
        console.log('\nSwitched to deployed environment.');
        showMainMenu();
        break;
      default:
        console.log('\nInvalid choice. Please try again.');
        switchEnvironment();
        break;
    }
  });
}

// Start the application
showMainMenu();
