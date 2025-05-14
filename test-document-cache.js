/**
 * Test Document Cache Manager
 * 
 * This script tests the document caching functionality to verify that
 * repeated processing of the same document uses cached results.
 */

// Import required modules
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const documentCacheManager = require('./services/document-cache-manager');
const { CACHE_OPERATIONS } = documentCacheManager;

// Sample document content
const sampleDocument = {
  id: uuidv4(),
  fileName: 'sample-portfolio.pdf',
  filePath: path.join(__dirname, 'sample_portfolio.pdf'),
  tenantId: 'test-tenant',
  text: `
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
`
};

// Sample processing result
const sampleProcessingResult = {
  metadata: {
    fileName: sampleDocument.fileName,
    fileType: 'pdf',
    createdAt: new Date().toISOString()
  },
  text: sampleDocument.text,
  tables: [
    {
      headers: ['Company', 'ISIN', 'Quantity', 'Price', 'Value'],
      rows: [
        ['Apple Inc.', 'US0378331005', '100', '150.25', '15025.00'],
        ['Microsoft Corporation', 'US5949181045', '50', '280.75', '14037.50'],
        ['Amazon.com Inc.', 'US0231351067', '20', '3200.50', '64010.00']
      ]
    }
  ],
  entities: [
    { type: 'company', name: 'Apple Inc.', isin: 'US0378331005' },
    { type: 'company', name: 'Microsoft Corporation', isin: 'US5949181045' },
    { type: 'company', name: 'Amazon.com Inc.', isin: 'US0231351067' }
  ],
  securities: [
    { type: 'security', name: 'Apple Inc.', isin: 'US0378331005', quantity: 100, price: 150.25, value: 15025.00 },
    { type: 'security', name: 'Microsoft Corporation', isin: 'US5949181045', quantity: 50, price: 280.75, value: 14037.50 },
    { type: 'security', name: 'Amazon.com Inc.', isin: 'US0231351067', quantity: 20, price: 3200.50, value: 64010.00 }
  ]
};

// Mock document processor with artificial delay
async function mockDocumentProcessor(document, options = {}) {
  console.log('Processing document...'); 
  
  // Simulate processing time
  const delayMs = options.fastProcess ? 50 : 500;
  await new Promise(resolve => setTimeout(resolve, delayMs));
  
  return {
    ...sampleProcessingResult,
    processingTime: delayMs,
    processingOptions: options,
    processingTimestamp: new Date().toISOString()
  };
}

// Create cached version of mock processor
const cachedDocumentProcessor = documentCacheManager.createCachedProcessor(
  mockDocumentProcessor,
  CACHE_OPERATIONS.DOCUMENT_PROCESSING,
  60 // 60 seconds TTL for testing
);

// Helper to measure execution time
async function timeExecution(fn) {
  const start = process.hrtime.bigint();
  const result = await fn();
  const end = process.hrtime.bigint();
  const timeInMs = Number(end - start) / 1_000_000;
  return { result, timeInMs };
}

// Test with multiple tenants
async function testMultitenantCaching() {
  console.log('\nTesting multi-tenant caching:');
  console.log('----------------------------');
  
  const tenants = ['tenant-1', 'tenant-2', 'tenant-3'];
  const results = {};
  
  for (const tenant of tenants) {
    console.log(`\nTesting with tenant: ${tenant}`);
    
    // First execution (cache miss)
    const firstRun = await timeExecution(async () => {
      return await cachedDocumentProcessor({
        ...sampleDocument,
        tenantId: tenant
      });
    });
    
    console.log(`First run: ${firstRun.timeInMs.toFixed(2)}ms`);
    
    // Second execution (cache hit)
    const secondRun = await timeExecution(async () => {
      return await cachedDocumentProcessor({
        ...sampleDocument,
        tenantId: tenant
      });
    });
    
    console.log(`Second run: ${secondRun.timeInMs.toFixed(2)}ms`);
    
    // Calculate speedup
    const speedup = firstRun.timeInMs / secondRun.timeInMs;
    console.log(`Speedup: ${speedup.toFixed(2)}x`);
    
    results[tenant] = {
      firstRun: firstRun.timeInMs,
      secondRun: secondRun.timeInMs,
      speedup
    };
  }
  
  console.log('\nMulti-tenant results:');
  for (const [tenant, data] of Object.entries(results)) {
    console.log(`Tenant ${tenant}: ${data.speedup.toFixed(2)}x speedup`);
  }
}

// Test processing with different options
async function testOptionBasedCaching() {
  console.log('\nTesting option-based caching:');
  console.log('----------------------------');
  
  const optionSets = [
    { extractText: true, extractTables: true, extractSecurities: true, useMcp: true },
    { extractText: true, extractTables: true, extractSecurities: false, useMcp: true },
    { extractText: true, extractTables: false, extractSecurities: true, useMcp: false },
    { extractText: true, extractTables: true, extractSecurities: true, useMcp: true } // Same as first set
  ];
  
  for (let i = 0; i < optionSets.length; i++) {
    console.log(`\nTesting with option set #${i+1}:`);
    console.log(optionSets[i]);
    
    // First execution
    const firstRun = await timeExecution(async () => {
      return await cachedDocumentProcessor(sampleDocument, optionSets[i]);
    });
    
    console.log(`First run: ${firstRun.timeInMs.toFixed(2)}ms`);
    
    // Second execution
    const secondRun = await timeExecution(async () => {
      return await cachedDocumentProcessor(sampleDocument, optionSets[i]);
    });
    
    console.log(`Second run: ${secondRun.timeInMs.toFixed(2)}ms`);
    console.log(`Cache ${secondRun.timeInMs < firstRun.timeInMs / 2 ? 'HIT' : 'MISS'}`);
  }
}

// Test cache invalidation
async function testCacheInvalidation() {
  console.log('\nTesting cache invalidation:');
  console.log('---------------------------');
  
  // Generate document fingerprint
  const fingerprint = documentCacheManager.generateDocumentFingerprint(sampleDocument);
  console.log(`Document fingerprint: ${fingerprint}`);
  
  // First run (cache miss)
  const firstRun = await timeExecution(async () => {
    return await cachedDocumentProcessor(sampleDocument);
  });
  console.log(`First run: ${firstRun.timeInMs.toFixed(2)}ms`);
  
  // Second run (cache hit)
  const secondRun = await timeExecution(async () => {
    return await cachedDocumentProcessor(sampleDocument);
  });
  console.log(`Second run: ${secondRun.timeInMs.toFixed(2)}ms`);
  
  // Invalidate cache
  console.log('Invalidating cache...');
  await documentCacheManager.invalidateCache(
    fingerprint, 
    CACHE_OPERATIONS.DOCUMENT_PROCESSING, 
    sampleDocument.tenantId
  );
  
  // Third run (cache miss after invalidation)
  const thirdRun = await timeExecution(async () => {
    return await cachedDocumentProcessor(sampleDocument);
  });
  console.log(`Third run: ${thirdRun.timeInMs.toFixed(2)}ms`);
  
  // Fourth run (cache hit)
  const fourthRun = await timeExecution(async () => {
    return await cachedDocumentProcessor(sampleDocument);
  });
  console.log(`Fourth run: ${fourthRun.timeInMs.toFixed(2)}ms`);
  
  // Calculate speedups
  const initialSpeedup = firstRun.timeInMs / secondRun.timeInMs;
  const afterInvalidationSpeedup = thirdRun.timeInMs / fourthRun.timeInMs;
  
  console.log(`Initial speedup: ${initialSpeedup.toFixed(2)}x`);
  console.log(`After invalidation speedup: ${afterInvalidationSpeedup.toFixed(2)}x`);
  
  // Check if invalidation worked correctly
  if (thirdRun.timeInMs > secondRun.timeInMs * 2) {
    console.log('✅ Cache invalidation worked correctly!');
  } else {
    console.log('❌ Cache invalidation may not have worked correctly!');
  }
}

// Main test function
async function runTests() {
  console.log('Testing Document Cache Manager');
  console.log('=============================');
  
  // Test with caching enabled/disabled
  console.log('\nTesting basic caching functionality:');
  console.log('----------------------------------');
  
  // First run without cache
  const noCacheRun = await timeExecution(async () => {
    return await cachedDocumentProcessor(sampleDocument, { useCache: false });
  });
  console.log(`Without cache: ${noCacheRun.timeInMs.toFixed(2)}ms`);
  
  // First run with cache (cache miss)
  const firstCacheRun = await timeExecution(async () => {
    return await cachedDocumentProcessor(sampleDocument);
  });
  console.log(`First run (cache miss): ${firstCacheRun.timeInMs.toFixed(2)}ms`);
  
  // Second run with cache (cache hit)
  const secondCacheRun = await timeExecution(async () => {
    return await cachedDocumentProcessor(sampleDocument);
  });
  console.log(`Second run (cache hit): ${secondCacheRun.timeInMs.toFixed(2)}ms`);
  
  // Calculate cache speedup
  const cacheSpeedup = firstCacheRun.timeInMs / secondCacheRun.timeInMs;
  console.log(`Cache speedup: ${cacheSpeedup.toFixed(2)}x faster with cache`);
  
  // Run specific tests
  await testMultitenantCaching();
  await testOptionBasedCaching();
  await testCacheInvalidation();
  
  // Cache stats
  const stats = await documentCacheManager.getCacheStats();
  console.log('\nCache Statistics:');
  console.log(JSON.stringify(stats, null, 2));
  
  console.log('\nAll tests completed!');
}

// Run the tests
runTests().catch(error => {
  console.error('Error running tests:', error);
  process.exit(1);
});