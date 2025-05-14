/**
 * UI Test Runner
 * 
 * This script runs UI tests using Playwright.
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Test types
const testTypes = {
  all: {
    description: 'All tests',
    command: ['npx', 'playwright', 'test', '--config=tests/ui-testing/playwright.config.js'],
  },
  components: {
    description: 'Component tests',
    command: ['npx', 'playwright', 'test', '--config=tests/ui-testing/playwright.config.js', 'tests/ui-testing/components/'],
  },
  pages: {
    description: 'Page tests',
    command: ['npx', 'playwright', 'test', '--config=tests/ui-testing/playwright.config.js', 'tests/ui-testing/pages/'],
  },
  responsive: {
    description: 'Responsive design tests',
    command: ['npx', 'playwright', 'test', '--config=tests/ui-testing/playwright.config.js', 'tests/ui-testing/responsive-design.spec.js'],
  },
  a11y: {
    description: 'Accessibility tests',
    command: ['npx', 'playwright', 'test', '--config=tests/ui-testing/playwright.config.js', 'tests/ui-testing/accessibility.spec.js'],
  },
  visual: {
    description: 'Visual regression tests',
    command: ['npx', 'playwright', 'test', '--config=tests/ui-testing/playwright.config.js', 'tests/ui-testing/visual-regression.spec.js'],
  },
};

// Get test type from command line argument
const testType = process.argv[2] || 'all';

if (!testTypes[testType]) {
  console.error(`Invalid test type: ${testType}`);
  console.error('Available test types:');
  Object.entries(testTypes).forEach(([type, { description }]) => {
    console.error(`  ${type} - ${description}`);
  });
  process.exit(1);
}

console.log(`Running ${testTypes[testType].description}...`);

// Run tests
const child = spawn(testTypes[testType].command[0], testTypes[testType].command.slice(1), {
  stdio: 'inherit',
  shell: process.platform === 'win32'
});

child.on('close', code => {
  if (code !== 0) {
    console.error(`Tests failed with exit code ${code}`);
    process.exit(code);
  }
  
  console.log('Tests completed successfully!');
  
  // Generate results summary
  generateSummary();
});

/**
 * Generate test results summary
 */
function generateSummary() {
  const reportDir = path.join(__dirname, '..', '..', 'test-reports', 'html-report');
  const resultsFile = path.join(__dirname, '..', '..', 'test-reports', 'test-results.json');
  
  if (!fs.existsSync(reportDir) || !fs.existsSync(resultsFile)) {
    console.log('No test results found');
    return;
  }
  
  // Read results
  const results = JSON.parse(fs.readFileSync(resultsFile, 'utf8'));
  
  // Count passed and failed tests
  const passedTests = results.filter(test => test.status === 'passed').length;
  const failedTests = results.filter(test => test.status === 'failed').length;
  const skippedTests = results.filter(test => test.status === 'skipped').length;
  
  // Generate summary
  const summary = `
UI Test Summary
==============

Test type: ${testTypes[testType].description}
Date: ${new Date().toLocaleString()}

Results:
- Total tests: ${results.length}
- Passed: ${passedTests}
- Failed: ${failedTests}
- Skipped: ${skippedTests}

Test report: file://${reportDir}/index.html
`;
  
  console.log(summary);
  
  // Write summary
  fs.writeFileSync(path.join(__dirname, '..', '..', 'test-reports', 'summary.txt'), summary);
}