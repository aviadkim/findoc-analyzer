#!/usr/bin/env node

/**
 * FinDoc Analyzer - Playwright Test Runner
 * 
 * This script runs Playwright tests and generates a comprehensive report.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

// Configuration
const CONFIG = {
  testDir: path.join(__dirname, 'playwright'),
  reportDir: path.join(__dirname, 'test-results/playwright-report'),
  maxParallelTests: os.cpus().length - 1 || 1, // Use all but one CPU core
  defaultTimeout: 60000, // 60 seconds
  retries: 1, // Retry failed tests once
};

// Parse command line arguments
const args = process.argv.slice(2);
const testPatterns = args.filter(arg => !arg.startsWith('--'));
const options = {
  debug: args.includes('--debug'),
  headed: args.includes('--headed'),
  slowMo: args.includes('--slow-mo'),
  updateSnapshots: args.includes('--update-snapshots'),
  browsers: ['chromium'], // Default
};

// Set browsers
if (args.includes('--all-browsers')) {
  options.browsers = ['chromium', 'firefox', 'webkit'];
} else {
  if (args.includes('--firefox')) options.browsers.push('firefox');
  if (args.includes('--webkit')) options.browsers.push('webkit');
}

// Create report directory if it doesn't exist
if (!fs.existsSync(CONFIG.reportDir)) {
  fs.mkdirSync(CONFIG.reportDir, { recursive: true });
}

// Function to run tests
function runTests() {
  console.log('╔════════════════════════════════════════════════════════════════════╗');
  console.log('║                   FinDoc Analyzer - Test Runner                    ║');
  console.log('╚════════════════════════════════════════════════════════════════════╝');
  console.log(`Running tests in ${CONFIG.testDir}`);
  console.log(`Using browsers: ${options.browsers.join(', ')}`);
  
  // Build test command
  let command = `npx playwright test`;
  
  // Add test patterns if provided
  if (testPatterns.length > 0) {
    command += ` ${testPatterns.map(pattern => `"${pattern}"`).join(' ')}`;
  }
  
  // Add options
  command += ` --config=${path.join(CONFIG.testDir, 'playwright.config.js')}`;
  
  if (options.debug) command += ' --debug';
  if (options.headed) command += ' --headed';
  if (options.slowMo) command += ' --slow-mo=100';
  if (options.updateSnapshots) command += ' --update-snapshots';
  
  // Set parallelism
  command += ` --workers=${CONFIG.maxParallelTests}`;
  
  // Add browsers
  command += ` --project=${options.browsers.join(' --project=')}`;
  
  // Run the tests
  try {
    console.log(`\nExecuting: ${command}\n`);
    execSync(command, { stdio: 'inherit' });
    console.log('\n✅ All tests completed successfully');
  } catch (error) {
    console.error('\n❌ Some tests failed');
    console.log('\nCheck the HTML report for details.');
    process.exitCode = 1;
  }
  
  // Generate report path
  const reportPath = path.join(CONFIG.reportDir, 'index.html');
  console.log(`\nTest report available at: ${reportPath}`);
  console.log(`Open with: npx playwright show-report ${CONFIG.reportDir}`);
}

// Function to display help
function showHelp() {
  console.log(`
FinDoc Analyzer - Playwright Test Runner

Usage:
  node run-playwright-tests.js [options] [test-patterns]

Options:
  --debug               Run tests in debug mode
  --headed              Run tests in headed mode
  --slow-mo             Run tests with slow motion (100ms between actions)
  --update-snapshots    Update snapshots
  --all-browsers        Run tests in all browsers (chromium, firefox, webkit)
  --firefox             Include Firefox in test browsers
  --webkit              Include WebKit in test browsers
  --help                Show this help message

Examples:
  node run-playwright-tests.js                          # Run all tests in Chromium
  node run-playwright-tests.js authentication.spec.js   # Run only authentication tests
  node run-playwright-tests.js --all-browsers           # Run all tests in all browsers
  node run-playwright-tests.js --headed --slow-mo       # Run in headed mode with slow motion
`);
}

// Main execution
if (args.includes('--help')) {
  showHelp();
} else {
  runTests();
}
