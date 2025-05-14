/**
 * Run Playwright Tests for FinDoc Analyzer
 *
 * This script runs the Playwright tests for the FinDoc Analyzer application.
 * It can run tests against the local development server or the production server.
 *
 * Usage:
 *   node run-playwright-tests.js [--env=production|local] [--repeat=N] [--test=test-name]
 *
 * Options:
 *   --env=production|local  Run tests against production or local server (default: local)
 *   --repeat=N              Repeat tests N times (default: 1)
 *   --test=test-name        Run only the specified test file
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Parse command line arguments
const args = process.argv.slice(2);
const env = args.find(arg => arg.startsWith('--env='))?.split('=')[1] || 'local';
const repeat = parseInt(args.find(arg => arg.startsWith('--repeat='))?.split('=')[1] || '1');
const testFile = args.find(arg => arg.startsWith('--test='))?.split('=')[1];

// Configuration
const config = {
  reportsDir: path.join(__dirname, 'playwright-report'),
  screenshotsDir: path.join(__dirname, 'tests', 'screenshots'),
  testResultsDir: path.join(__dirname, 'test-results'),
  testFilesDir: path.join(__dirname, 'tests', 'test-pdfs'),
  mainTestFilesDir: path.join(__dirname, 'test', 'test-files'),
  testCommand: `npx playwright test ${testFile || ''}`,
  env: env === 'production' ? 'production' : 'local',
  repeat: Math.max(1, Math.min(100, repeat)) // Between 1 and 100
};

// Create directories if they don't exist
for (const dir of [config.reportsDir, config.screenshotsDir, config.testResultsDir, config.testFilesDir]) {
  try {
    fs.mkdirSync(dir, { recursive: true });
  } catch (error) {
    console.warn(`Error creating directory ${dir}:`, error);
  }
}

// Copy test files if they don't exist
const testPdfPath = path.join(config.testFilesDir, 'test-portfolio.pdf');
const mainTestPdfPath = path.join(config.mainTestFilesDir, 'test-portfolio.pdf');
if (fs.existsSync(mainTestPdfPath) && !fs.existsSync(testPdfPath)) {
  try {
    fs.copyFileSync(mainTestPdfPath, testPdfPath);
    console.log(`Copied test PDF from ${mainTestPdfPath} to ${testPdfPath}`);
  } catch (error) {
    console.warn(`Error copying test PDF:`, error);
  }
}

// Print test configuration
console.log('=== FinDoc Analyzer Test Configuration ===');
console.log(`Environment: ${config.env}`);
console.log(`Repeat: ${config.repeat} time(s)`);
console.log(`Test file: ${testFile || 'All tests'}`);
console.log('==========================================');

// Run the tests
console.log(`Running Playwright tests against ${config.env} environment...`);

let successCount = 0;
let failureCount = 0;

for (let i = 0; i < config.repeat; i++) {
  console.log(`\n=== Test Run ${i + 1}/${config.repeat} ===`);

  try {
    // Set environment variable for test environment
    process.env.TEST_ENV = config.env;

    // Run the tests
    execSync(config.testCommand, {
      stdio: 'inherit',
      env: { ...process.env, TEST_ENV: config.env }
    });

    console.log(`Test run ${i + 1} completed successfully`);
    successCount++;
  } catch (error) {
    console.error(`Test run ${i + 1} failed:`, error.message);
    failureCount++;

    // Continue with next run even if this one failed
  }
}

// Print test summary
console.log('\n=== Test Summary ===');
console.log(`Total runs: ${config.repeat}`);
console.log(`Successful runs: ${successCount}`);
console.log(`Failed runs: ${failureCount}`);
console.log('====================');

// Open the report
try {
  console.log('\nOpening test report...');
  execSync('npx playwright show-report', { stdio: 'inherit' });
} catch (error) {
  console.error('Error showing report:', error.message);
}

// Exit with appropriate code
process.exit(failureCount > 0 ? 1 : 0);
