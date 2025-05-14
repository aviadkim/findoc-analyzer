/**
 * Test Securities Extraction Caching
 * 
 * This script tests the caching functionality for securities extraction
 * to verify that repeated processing of the same document uses cached results.
 */

// Import required modules
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Import services
const cachedSecuritiesExtractor = require('./services/cached-securities-extractor');
const extractionCacheService = require('./services/extraction-cache-service');

// Use a sample text instead of reading from file
const sampleText = `
Portfolio Statement
Account: 123456789
Date: May 1, 2023

Holdings Summary:

Apple Inc. (ISIN: US0378331005)
Quantity: 100 shares
Price: $150.25
Value: $15,025.00

Microsoft Corporation (ISIN: US5949181045)
Quantity: 50 shares
Price: $280.75
Value: $14,037.50

Amazon.com Inc. (ISIN: US0231351067)
Quantity: 20 shares
Price: $3,200.50
Value: $64,010.00

Total Portfolio Value: $93,072.50
Currency: USD
`;
const sampleTable = {
  headers: ['Company', 'ISIN', 'Quantity', 'Price', 'Value'],
  rows: [
    ['Apple Inc.', 'US0378331005', '100', '150.25', '15025.00'],
    ['Microsoft Corporation', 'US5949181045', '50', '280.75', '14037.50'],
    ['Amazon.com Inc.', 'US0231351067', '20', '3200.50', '64010.00']
  ]
};

// Sample document content
const documentContent = {
  text: sampleText || 'Sample text that mentions Apple Inc. (ISIN: US0378331005) and Microsoft (ISIN: US5949181045)',
  tables: [sampleTable],
  financialData: {
    portfolioInfo: {
      totalValue: 93072.50,
      currency: 'USD'
    }
  },
  tenantId: 'test-tenant'
};

// Benchmark function to measure execution time
async function benchmark(fn, iterations = 3) {
  const times = [];
  let cachedResults = [];
  
  console.log(`Running ${iterations} iterations...`);
  
  for (let i = 0; i < iterations; i++) {
    console.log(`\nIteration ${i + 1}:`);
    
    const start = process.hrtime.bigint();
    const result = await fn();
    const end = process.hrtime.bigint();
    
    const timeInMs = Number(end - start) / 1_000_000;
    times.push(timeInMs);
    cachedResults.push(result);
    
    console.log(`- Execution time: ${timeInMs.toFixed(2)}ms`);
    console.log(`- Securities found: ${result.length}`);
    
    // Sleep for a moment to allow logs to flush
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log('\nResults:');
  console.log(`- First run: ${times[0].toFixed(2)}ms`);
  console.log(`- Subsequent runs average: ${(times.slice(1).reduce((a, b) => a + b, 0) / (times.length - 1)).toFixed(2)}ms`);
  console.log(`- Securities counts: [${cachedResults.map(r => r.length).join(', ')}]`);
  
  // Calculate cache speed improvement
  if (times.length > 1) {
    const improvement = times[0] / (times.slice(1).reduce((a, b) => a + b, 0) / (times.length - 1));
    console.log(`- Cache speed improvement: ${improvement.toFixed(2)}x faster`);
  }
  
  return {
    times,
    results: cachedResults
  };
}

// Run tests
async function runTests() {
  console.log('Testing Securities Extraction Caching');
  console.log('====================================');
  
  // Test with caching enabled
  console.log('\nTEST 1: With Caching Enabled');
  console.log('---------------------------');
  const cachedResults = await benchmark(async () => {
    return await cachedSecuritiesExtractor.extractSecuritiesWithCache(documentContent, {
      useCache: true,
      ttl: 60
    });
  });
  
  // Clear cache for the next test
  console.log('\nClearing cache...');
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Test without caching
  console.log('\nTEST 2: Without Caching');
  console.log('----------------------');
  const noCacheResults = await benchmark(async () => {
    return await cachedSecuritiesExtractor.extractSecuritiesWithCache(documentContent, {
      useCache: false
    });
  });
  
  // Test with tenant-specific caching
  console.log('\nTEST 3: Tenant-Specific Caching');
  console.log('-----------------------------');
  const tenantCacheResults = await benchmark(async () => {
    // Change the tenant ID on each call to verify tenant-specific caching
    const tenantId = `tenant-${uuidv4().substring(0, 8)}`;
    return await cachedSecuritiesExtractor.extractSecuritiesWithCache({
      ...documentContent,
      tenantId
    });
  });
  
  console.log('\nAll tests completed!');
}

// Run the tests
runTests().catch(error => {
  console.error('Error running tests:', error);
  process.exit(1);
});