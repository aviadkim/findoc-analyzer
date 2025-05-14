/**
 * Run Sample Tests
 *
 * This script runs a small sample of the generated tests to verify they work.
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Configuration
const config = {
  generatedTestsDir: path.join(__dirname, 'generated-tests'),
  sampleSize: 2, // Number of tests to run from each category
  timeout: 30000 // Timeout for each test in milliseconds
};

// Create sample test files
function createSampleTestFile(sourceFile, sampleSize) {
  console.log(`Creating sample test file from ${sourceFile}...`);

  // Read source file
  const sourceContent = fs.readFileSync(path.join(config.generatedTestsDir, sourceFile), 'utf8');

  // Extract test cases
  const testCaseRegex = /\/\/ Test \d+:.+?await runTest\('.*?', async \(page\) => \{.+?\}\);/gs;
  const testCases = sourceContent.match(testCaseRegex) || [];

  // Select sample test cases
  const sampleTestCases = testCases.slice(0, sampleSize);

  // Create sample test file
  const sampleFileName = `sample-${sourceFile}`;
  const sampleFilePath = path.join(__dirname, sampleFileName);

  // Generate sample test file
  const sampleContent = sourceContent.replace(testCaseRegex, '').replace(
    'async function runTests() {',
    `async function runTests() {
${sampleTestCases.join('\n')}`
  );

  // Write sample test file
  fs.writeFileSync(sampleFilePath, sampleContent);
  console.log(`Created sample test file ${sampleFilePath}`);

  return sampleFilePath;
}

// Run sample tests
async function runSampleTests() {
  console.log('Running sample tests...');

  // Source files
  const sourceFiles = [
    'generated-pdf-processing-tests.js',
    'generated-document-chat-tests.js',
    'generated-data-visualization-tests.js',
    'generated-export-tests.js'
  ];

  // Create and run sample test files
  for (const sourceFile of sourceFiles) {
    try {
      const sampleFilePath = createSampleTestFile(sourceFile, config.sampleSize);

      console.log(`\nRunning sample tests from ${sourceFile}...`);
      execSync(`node ${sampleFilePath}`, { stdio: 'inherit' });

      // Clean up
      fs.unlinkSync(sampleFilePath);
    } catch (error) {
      console.error(`Error running sample tests from ${sourceFile}:`, error.message);
    }
  }

  console.log('\nAll sample tests completed');
}

// Run the sample tests
runSampleTests().catch(error => {
  console.error('Error running sample tests:', error);
  process.exit(1);
});
