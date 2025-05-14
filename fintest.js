#!/usr/bin/env node

/**
 * FinDoc Test Runner
 * 
 * A comprehensive tool for testing the FinDoc Analyzer application
 * both locally and in the cloud.
 */

const { execSync, spawn } = require('child_process');
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
  // Directories
  logDir: path.join(__dirname, 'logs'),
  resultsDir: path.join(__dirname, 'test-results'),
  
  // Test options
  testTypes: [
    { 
      id: 'service', 
      name: 'Service Tests', 
      description: 'Tests the document and chat services directly',
      command: 'node test-document-chat-implementation.js'
    },
    { 
      id: 'ui', 
      name: 'UI Tests', 
      description: 'Tests the UI using simple HTTP requests',
      command: 'node simple-ui-test.js'
    },
    { 
      id: 'browser', 
      name: 'Browser Tests',
      description: 'Tests the application in a browser using Playwright',
      setupCommand: 'node playwright-test-setup.js',
      command: 'node playwright-test.js'
    },
    { 
      id: 'cloud', 
      name: 'Cloud Tests',
      description: 'Deploys and tests the application in the cloud',
      setupCommand: 'node deploy-to-cloud.js',
      command: 'TEST_MODE=cloud node playwright-test.js'
    }
  ],
  
  // Default options
  defaultTestType: 'service',
  
  // Server options
  serverPort: 8080,
  serverTimeout: 5000
};

// Ensure directories exist
[config.logDir, config.resultsDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

/**
 * Ask a question and get user input
 * @param {string} question - Question to ask
 * @returns {Promise<string>} - User's answer
 */
function askQuestion(question) {
  return new Promise(resolve => {
    rl.question(question, answer => {
      resolve(answer);
    });
  });
}

/**
 * Print an ASCII art banner
 */
function printBanner() {
  console.log(`
+-----------------------------------+
|                                   |
|     FinDoc Analyzer Tester        |
|                                   |
+-----------------------------------+
  `);
}

/**
 * Check if server is running
 * @returns {Promise<boolean>} - Whether the server is running
 */
async function isServerRunning() {
  return new Promise(resolve => {
    const req = require('http').get(`http://localhost:${config.serverPort}/api/health`, res => {
      if (res.statusCode === 200) {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const response = JSON.parse(data);
            resolve(response.status === 'ok');
          } catch (e) {
            resolve(false);
          }
        });
      } else {
        resolve(false);
      }
    });
    
    req.on('error', () => resolve(false));
    req.setTimeout(2000, () => {
      req.destroy();
      resolve(false);
    });
  });
}

/**
 * Start the server
 * @returns {Promise<object|null>} - Server process or null if already running
 */
async function startServer() {
  console.log('Checking if server is already running...');
  
  if (await isServerRunning()) {
    console.log('Server is already running');
    return null;
  }
  
  console.log('Starting server...');
  
  const serverProcess = spawn('node', ['server.js'], {
    stdio: 'inherit',
    detached: true
  });
  
  // Wait for server to start
  let retries = 20;
  while (retries > 0) {
    await new Promise(resolve => setTimeout(resolve, 500));
    if (await isServerRunning()) {
      console.log('Server started successfully');
      return serverProcess;
    }
    retries--;
  }
  
  console.error('Failed to start server');
  serverProcess.kill();
  return null;
}

/**
 * Stop the server
 * @param {object} serverProcess - Server process to stop
 */
function stopServer(serverProcess) {
  if (serverProcess) {
    console.log('Stopping server...');
    try {
      process.kill(-serverProcess.pid);
      console.log('Server stopped');
    } catch (error) {
      console.error('Error stopping server:', error.message);
    }
  }
}

/**
 * Run a test
 * @param {object} test - Test configuration
 * @param {object|null} serverProcess - Server process or null if server is already running
 */
async function runTest(test, serverProcess) {
  console.log(`\nRunning ${test.name}...`);
  
  // Run setup command if needed
  if (test.setupCommand) {
    console.log(`Running setup: ${test.setupCommand}`);
    try {
      execSync(test.setupCommand, { stdio: 'inherit' });
    } catch (error) {
      console.error(`Error running setup for ${test.name}:`, error.message);
      return;
    }
  }
  
  // Create timestamp for log file
  const timestamp = new Date().toISOString().replace(/:/g, '-').replace(/\..+/, '');
  const logFile = path.join(config.logDir, `${test.id}-${timestamp}.log`);
  
  // Create log file stream
  const logStream = fs.createWriteStream(logFile, { flags: 'a' });
  
  // Run test command
  console.log(`Running test: ${test.command}`);
  
  const testProcess = spawn(test.command, [], {
    shell: true,
    stdio: [process.stdin, 'pipe', 'pipe']
  });
  
  // Pipe output to console and log file
  testProcess.stdout.pipe(process.stdout);
  testProcess.stderr.pipe(process.stderr);
  testProcess.stdout.pipe(logStream);
  testProcess.stderr.pipe(logStream);
  
  // Wait for test to complete
  return new Promise(resolve => {
    testProcess.on('close', code => {
      console.log(`\n${test.name} completed with exit code ${code}`);
      console.log(`Log file: ${logFile}`);
      logStream.end();
      resolve(code === 0);
    });
    
    testProcess.on('error', error => {
      console.error(`Error running ${test.name}:`, error.message);
      logStream.write(`Error: ${error.message}\n`);
      logStream.end();
      resolve(false);
    });
  });
}

/**
 * Show all available test results
 */
function showTestResults() {
  console.log('\nAvailable Test Results:');
  
  // Check if test results directory exists
  if (!fs.existsSync(config.resultsDir)) {
    console.log('No test results found');
    return;
  }
  
  // Find all HTML result files
  const files = fs.readdirSync(config.resultsDir).filter(file => file.endsWith('.html'));
  
  if (files.length === 0) {
    console.log('No test results found');
    return;
  }
  
  // Show available result files
  files.forEach((file, index) => {
    const stats = fs.statSync(path.join(config.resultsDir, file));
    const date = stats.mtime.toLocaleString();
    console.log(`${index + 1}. ${file} (${date})`);
  });
  
  // If running on a system with a browser, offer to open results
  if (process.platform === 'win32' || process.platform === 'darwin') {
    console.log('\nTo view a result file, use:');
    console.log('  open <path-to-result-file>');
  }
}

/**
 * Main menu
 */
async function mainMenu() {
  printBanner();
  
  while (true) {
    console.log('\nMain Menu:');
    console.log('1. Run Tests');
    console.log('2. View Test Results');
    console.log('3. Deploy to Cloud');
    console.log('4. Exit');
    
    const choice = await askQuestion('\nEnter your choice (1-4): ');
    
    if (choice === '1') {
      await testMenu();
    } else if (choice === '2') {
      showTestResults();
    } else if (choice === '3') {
      execSync('node deploy-to-cloud.js', { stdio: 'inherit' });
    } else if (choice === '4') {
      console.log('Exiting...');
      break;
    } else {
      console.log('Invalid choice. Please try again.');
    }
  }
  
  rl.close();
}

/**
 * Test menu
 */
async function testMenu() {
  console.log('\nAvailable Tests:');
  config.testTypes.forEach((test, index) => {
    console.log(`${index + 1}. ${test.name} - ${test.description}`);
  });
  
  const choice = await askQuestion('\nEnter your choice (1-4): ');
  const choiceIndex = parseInt(choice) - 1;
  
  if (isNaN(choiceIndex) || choiceIndex < 0 || choiceIndex >= config.testTypes.length) {
    console.log('Invalid choice. Please try again.');
    return;
  }
  
  const selectedTest = config.testTypes[choiceIndex];
  
  // If this is a browser test, check if we need to install Playwright
  if (selectedTest.id === 'browser') {
    try {
      require.resolve('@playwright/test');
    } catch (e) {
      console.log('\nPlaywright is not installed. Installing now...');
      try {
        execSync('node playwright-test-setup.js', { stdio: 'inherit' });
      } catch (error) {
        console.error('Error setting up Playwright:', error.message);
        return;
      }
    }
  }
  
  // For cloud tests, special handling
  if (selectedTest.id === 'cloud') {
    console.log('\nThis will deploy the application to the cloud and run tests against it.');
    const confirm = await askQuestion('Continue? (y/n): ');
    
    if (confirm.toLowerCase() !== 'y' && confirm.toLowerCase() !== 'yes') {
      console.log('Cloud tests cancelled.');
      return;
    }
    
    // Run cloud deployment
    try {
      execSync('node deploy-to-cloud.js', { stdio: 'inherit' });
    } catch (error) {
      console.error('Error deploying to cloud:', error.message);
      return;
    }
    
    // Check if cloud-url.txt exists
    if (!fs.existsSync(path.join(__dirname, 'cloud-url.txt'))) {
      console.error('Cloud URL not found. Deployment may have failed.');
      return;
    }
    
    // Get cloud URL
    const cloudUrl = fs.readFileSync(path.join(__dirname, 'cloud-url.txt'), 'utf8').trim();
    
    // Run cloud tests
    const testCommand = `CLOUD_URL=${cloudUrl} TEST_MODE=cloud node playwright-test.js`;
    
    try {
      execSync(testCommand, { stdio: 'inherit' });
    } catch (error) {
      console.error('Error running cloud tests:', error.message);
    }
    
    return;
  }
  
  // For local tests, start server if needed
  let serverProcess = null;
  
  // For UI or browser tests, start server if needed
  if (selectedTest.id === 'ui' || selectedTest.id === 'browser') {
    serverProcess = await startServer();
    
    if (!serverProcess && !await isServerRunning()) {
      console.error('Server is required but could not be started.');
      console.log('Please start the server manually with: node server.js');
      return;
    }
  }
  
  try {
    // Run the selected test
    await runTest(selectedTest, serverProcess);
  } finally {
    // Stop server if we started it
    if (serverProcess) {
      stopServer(serverProcess);
    }
  }
}

/**
 * Command line interface
 */
async function handleCommandLine() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    // No arguments, show interactive menu
    await mainMenu();
    return;
  }
  
  // Handle arguments
  if (args[0] === 'run') {
    // Run a specific test type
    const testType = args[1] || config.defaultTestType;
    const test = config.testTypes.find(t => t.id === testType);
    
    if (!test) {
      console.error(`Unknown test type: ${testType}`);
      console.log('Available test types:', config.testTypes.map(t => t.id).join(', '));
      return;
    }
    
    // For UI or browser tests, start server if needed
    let serverProcess = null;
    
    if (test.id === 'ui' || test.id === 'browser') {
      serverProcess = await startServer();
      
      if (!serverProcess && !await isServerRunning()) {
        console.error('Server is required but could not be started.');
        console.log('Please start the server manually with: node server.js');
        return;
      }
    }
    
    try {
      // Run the selected test
      await runTest(test, serverProcess);
    } finally {
      // Stop server if we started it
      if (serverProcess) {
        stopServer(serverProcess);
      }
    }
  } else if (args[0] === 'results') {
    // Show test results
    showTestResults();
  } else if (args[0] === 'deploy') {
    // Deploy to cloud
    execSync('node deploy-to-cloud.js', { stdio: 'inherit' });
  } else if (args[0] === 'help') {
    // Show help
    console.log(`
FinDoc Test Runner

Usage:
  node fintest.js [command]

Commands:
  run [type]     Run tests of the specified type
                 Available types: ${config.testTypes.map(t => t.id).join(', ')}
  results        Show available test results
  deploy         Deploy to cloud
  help           Show this help message

Examples:
  node fintest.js                    Show interactive menu
  node fintest.js run service        Run service tests
  node fintest.js run ui             Run UI tests
  node fintest.js run browser        Run browser tests
  node fintest.js run cloud          Run cloud tests
  node fintest.js results            Show test results
  node fintest.js deploy             Deploy to cloud
    `);
  } else {
    console.error(`Unknown command: ${args[0]}`);
    console.log('Run node fintest.js help for usage information');
  }
  
  rl.close();
}

// Start the CLI
handleCommandLine().catch(console.error);