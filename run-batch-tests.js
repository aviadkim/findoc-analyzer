/**
 * Batch Processing Tests Runner
 * 
 * This script runs tests for the batch processing functionality in the FinDoc Analyzer.
 */

const { runTests } = require('./tests/batch-processing-test');

console.log('===============================================================');
console.log('  FinDoc Analyzer - Batch Processing API Tests');
console.log('===============================================================\n');

// Run the tests
runTests().then(() => {
  console.log('\n===============================================================');
  console.log('  Tests completed. Check test-results directory for reports');
  console.log('===============================================================');
});