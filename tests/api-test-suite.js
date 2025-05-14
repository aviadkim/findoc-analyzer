/**
 * API Test Suite
 * Comprehensive test suite for FinDoc Analyzer APIs
 */

const axios = require('axios');

// Base URL for API requests
const BASE_URL = process.env.API_BASE_URL || 'http://localhost:8080/api';

// Default test document ID
const TEST_DOCUMENT_ID = 'doc-123';

// Default test ISIN
const TEST_ISIN = 'US0378331005'; // Apple Inc.

/**
 * Run the comprehensive API test suite
 * @returns {Promise<Object>} - Test results
 */
async function runApiTests() {
  console.log('Starting FinDoc Analyzer API Test Suite');
  console.log(`Base URL: ${BASE_URL}`);
  console.log('='.repeat(50));

  const startTime = Date.now();
  const results = {
    total: 0,
    passed: 0,
    failed: 0,
    tests: []
  };

  // Run the tests
  await testHealthEndpoint(results);
  await testDocumentProcessingAPI(results);
  await testSecuritiesAPI(results);
  await testMarketDataAPI(results);
  await testDocumentSecuritiesAPI(results);
  await testUpdateSecurityAPI(results);

  // Calculate test duration
  const endTime = Date.now();
  const duration = (endTime - startTime) / 1000;
  
  // Print summary
  console.log('='.repeat(50));
  console.log(`Test Suite Completed in ${duration.toFixed(2)}s`);
  console.log(`Total Tests: ${results.total}`);
  console.log(`Passed: ${results.passed}`);
  console.log(`Failed: ${results.failed}`);
  console.log(`Success Rate: ${((results.passed / results.total) * 100).toFixed(2)}%`);
  console.log('='.repeat(50));

  return results;
}

/**
 * Test the health endpoint
 * @param {Object} results - Test results object
 */
async function testHealthEndpoint(results) {
  console.log('\nTesting Health Endpoint:');
  
  try {
    const response = await axios.get(`${BASE_URL}/health`);
    
    const test = {
      name: 'Health Endpoint',
      endpoint: '/api/health',
      passed: response.status === 200 && response.data.status === 'ok',
      statusCode: response.status,
      response: response.data
    };
    
    results.total++;
    if (test.passed) {
      results.passed++;
      console.log('✅ Health Endpoint Test PASSED');
    } else {
      results.failed++;
      console.log('❌ Health Endpoint Test FAILED');
    }
    
    results.tests.push(test);
  } catch (error) {
    results.total++;
    results.failed++;
    
    const test = {
      name: 'Health Endpoint',
      endpoint: '/api/health',
      passed: false,
      error: error.message
    };
    
    results.tests.push(test);
    console.log('❌ Health Endpoint Test FAILED');
    console.error(`Error: ${error.message}`);
  }
}

/**
 * Test the document processing API endpoints
 * @param {Object} results - Test results object
 */
async function testDocumentProcessingAPI(results) {
  console.log('\nTesting Document Processing API:');
  
  // Test document processing start endpoint
  try {
    const response = await axios.post(`${BASE_URL}/documents/process`, {
      documentId: TEST_DOCUMENT_ID,
      options: {
        extractText: true,
        extractTables: true
      }
    });
    
    const test = {
      name: 'Document Processing Start',
      endpoint: '/api/documents/process',
      passed: response.status === 200 && response.data.success === true,
      statusCode: response.status,
      response: response.data
    };
    
    results.total++;
    if (test.passed) {
      results.passed++;
      console.log('✅ Document Processing Start Test PASSED');
    } else {
      results.failed++;
      console.log('❌ Document Processing Start Test FAILED');
    }
    
    results.tests.push(test);
  } catch (error) {
    results.total++;
    results.failed++;
    
    const test = {
      name: 'Document Processing Start',
      endpoint: '/api/documents/process',
      passed: false,
      error: error.message
    };
    
    results.tests.push(test);
    console.log('❌ Document Processing Start Test FAILED');
    console.error(`Error: ${error.message}`);
  }

  // Test document processing status endpoint
  try {
    const response = await axios.get(`${BASE_URL}/documents/process/status/${TEST_DOCUMENT_ID}`);
    
    const test = {
      name: 'Document Processing Status',
      endpoint: `/api/documents/process/status/${TEST_DOCUMENT_ID}`,
      passed: response.status === 200 && response.data.success === true,
      statusCode: response.status,
      response: response.data
    };
    
    results.total++;
    if (test.passed) {
      results.passed++;
      console.log('✅ Document Processing Status Test PASSED');
    } else {
      results.failed++;
      console.log('❌ Document Processing Status Test FAILED');
    }
    
    results.tests.push(test);
  } catch (error) {
    results.total++;
    results.failed++;
    
    const test = {
      name: 'Document Processing Status',
      endpoint: `/api/documents/process/status/${TEST_DOCUMENT_ID}`,
      passed: false,
      error: error.message
    };
    
    results.tests.push(test);
    console.log('❌ Document Processing Status Test FAILED');
    console.error(`Error: ${error.message}`);
  }

  // Test document processing batch endpoint
  try {
    const response = await axios.post(`${BASE_URL}/documents/process/batch`, {
      documentIds: [TEST_DOCUMENT_ID, 'doc-456', 'doc-789'],
      options: {
        extractText: true,
        extractTables: true
      }
    });
    
    const test = {
      name: 'Document Processing Batch',
      endpoint: '/api/documents/process/batch',
      passed: response.status === 200 && response.data.success === true,
      statusCode: response.status,
      response: response.data
    };
    
    results.total++;
    if (test.passed) {
      results.passed++;
      console.log('✅ Document Processing Batch Test PASSED');
    } else {
      results.failed++;
      console.log('❌ Document Processing Batch Test FAILED');
    }
    
    results.tests.push(test);
  } catch (error) {
    results.total++;
    results.failed++;
    
    const test = {
      name: 'Document Processing Batch',
      endpoint: '/api/documents/process/batch',
      passed: false,
      error: error.message
    };
    
    results.tests.push(test);
    console.log('❌ Document Processing Batch Test FAILED');
    console.error(`Error: ${error.message}`);
  }
}

/**
 * Test the securities API endpoints
 * @param {Object} results - Test results object
 */
async function testSecuritiesAPI(results) {
  console.log('\nTesting Securities API:');
  
  // Test get all securities endpoint
  try {
    const response = await axios.get(`${BASE_URL}/securities`);
    
    const test = {
      name: 'Get All Securities',
      endpoint: '/api/securities',
      passed: response.status === 200 && response.data.success === true && Array.isArray(response.data.securities),
      statusCode: response.status,
      response: response.data
    };
    
    results.total++;
    if (test.passed) {
      results.passed++;
      console.log('✅ Get All Securities Test PASSED');
    } else {
      results.failed++;
      console.log('❌ Get All Securities Test FAILED');
    }
    
    results.tests.push(test);
  } catch (error) {
    results.total++;
    results.failed++;
    
    const test = {
      name: 'Get All Securities',
      endpoint: '/api/securities',
      passed: false,
      error: error.message
    };
    
    results.tests.push(test);
    console.log('❌ Get All Securities Test FAILED');
    console.error(`Error: ${error.message}`);
  }

  // Test get security by ISIN endpoint
  try {
    const response = await axios.get(`${BASE_URL}/securities/${TEST_ISIN}`);
    
    const test = {
      name: 'Get Security by ISIN',
      endpoint: `/api/securities/${TEST_ISIN}`,
      passed: response.status === 200 && response.data.success === true && response.data.security?.isin === TEST_ISIN,
      statusCode: response.status,
      response: response.data
    };
    
    results.total++;
    if (test.passed) {
      results.passed++;
      console.log('✅ Get Security by ISIN Test PASSED');
    } else {
      results.failed++;
      console.log('❌ Get Security by ISIN Test FAILED');
    }
    
    results.tests.push(test);
  } catch (error) {
    results.total++;
    results.failed++;
    
    const test = {
      name: 'Get Security by ISIN',
      endpoint: `/api/securities/${TEST_ISIN}`,
      passed: false,
      error: error.message
    };
    
    results.tests.push(test);
    console.log('❌ Get Security by ISIN Test FAILED');
    console.error(`Error: ${error.message}`);
  }

  // Test securities extraction endpoint
  try {
    const response = await axios.post(`${BASE_URL}/securities/extract`, {
      text: "Apple Inc. (ISIN: US0378331005) is a technology company with 1000 shares at $150 per share.",
      tables: [
        {
          headers: ['Security', 'ISIN', 'Quantity', 'Price'],
          rows: [
            ['Microsoft Corporation', 'US5949181045', '500', '$300']
          ]
        }
      ],
      includeMarketData: true
    });
    
    const test = {
      name: 'Extract Securities',
      endpoint: '/api/securities/extract',
      passed: response.status === 200 && response.data.success === true && Array.isArray(response.data.securities),
      statusCode: response.status,
      response: response.data
    };
    
    results.total++;
    if (test.passed) {
      results.passed++;
      console.log('✅ Extract Securities Test PASSED');
    } else {
      results.failed++;
      console.log('❌ Extract Securities Test FAILED');
    }
    
    results.tests.push(test);
  } catch (error) {
    results.total++;
    results.failed++;
    
    const test = {
      name: 'Extract Securities',
      endpoint: '/api/securities/extract',
      passed: false,
      error: error.message
    };
    
    results.tests.push(test);
    console.log('❌ Extract Securities Test FAILED');
    console.error(`Error: ${error.message}`);
  }
}

/**
 * Test the market data API endpoints
 * @param {Object} results - Test results object
 */
async function testMarketDataAPI(results) {
  console.log('\nTesting Market Data API:');
  
  // Test get current price endpoint
  try {
    const response = await axios.get(`${BASE_URL}/market-data/price/${TEST_ISIN}`);
    
    const test = {
      name: 'Get Current Price',
      endpoint: `/api/market-data/price/${TEST_ISIN}`,
      passed: response.status === 200 && response.data.success === true && response.data.data?.price,
      statusCode: response.status,
      response: response.data
    };
    
    results.total++;
    if (test.passed) {
      results.passed++;
      console.log('✅ Get Current Price Test PASSED');
    } else {
      results.failed++;
      console.log('❌ Get Current Price Test FAILED');
    }
    
    results.tests.push(test);
  } catch (error) {
    results.total++;
    results.failed++;
    
    const test = {
      name: 'Get Current Price',
      endpoint: `/api/market-data/price/${TEST_ISIN}`,
      passed: false,
      error: error.message
    };
    
    results.tests.push(test);
    console.log('❌ Get Current Price Test FAILED');
    console.error(`Error: ${error.message}`);
  }

  // Test get historical prices endpoint
  try {
    const response = await axios.get(`${BASE_URL}/market-data/historical/${TEST_ISIN}?period=1m&interval=1d`);
    
    const test = {
      name: 'Get Historical Prices',
      endpoint: `/api/market-data/historical/${TEST_ISIN}?period=1m&interval=1d`,
      passed: response.status === 200 && response.data.success === true && response.data.data?.historicalData,
      statusCode: response.status,
      response: response.data
    };
    
    results.total++;
    if (test.passed) {
      results.passed++;
      console.log('✅ Get Historical Prices Test PASSED');
    } else {
      results.failed++;
      console.log('❌ Get Historical Prices Test FAILED');
    }
    
    results.tests.push(test);
  } catch (error) {
    results.total++;
    results.failed++;
    
    const test = {
      name: 'Get Historical Prices',
      endpoint: `/api/market-data/historical/${TEST_ISIN}?period=1m&interval=1d`,
      passed: false,
      error: error.message
    };
    
    results.tests.push(test);
    console.log('❌ Get Historical Prices Test FAILED');
    console.error(`Error: ${error.message}`);
  }

  // Test update securities with market data endpoint
  try {
    const response = await axios.put(`${BASE_URL}/market-data/update-securities`, {
      securities: [
        { isin: TEST_ISIN, quantity: 100 },
        { isin: 'US5949181045', quantity: 50 } // Microsoft
      ]
    });
    
    const test = {
      name: 'Update Securities with Market Data',
      endpoint: '/api/market-data/update-securities',
      passed: response.status === 200 && response.data.success === true,
      statusCode: response.status,
      response: response.data
    };
    
    results.total++;
    if (test.passed) {
      results.passed++;
      console.log('✅ Update Securities with Market Data Test PASSED');
    } else {
      results.failed++;
      console.log('❌ Update Securities with Market Data Test FAILED');
    }
    
    results.tests.push(test);
  } catch (error) {
    results.total++;
    results.failed++;
    
    const test = {
      name: 'Update Securities with Market Data',
      endpoint: '/api/market-data/update-securities',
      passed: false,
      error: error.message
    };
    
    results.tests.push(test);
    console.log('❌ Update Securities with Market Data Test FAILED');
    console.error(`Error: ${error.message}`);
  }
}

/**
 * Test the document securities API endpoints
 * @param {Object} results - Test results object
 */
async function testDocumentSecuritiesAPI(results) {
  console.log('\nTesting Document Securities API:');
  
  // Test get securities for document endpoint
  try {
    const response = await axios.get(`${BASE_URL}/documents/${TEST_DOCUMENT_ID}/securities`);
    
    const test = {
      name: 'Get Securities for Document',
      endpoint: `/api/documents/${TEST_DOCUMENT_ID}/securities`,
      passed: response.status === 200 && response.data.success === true && Array.isArray(response.data.securities),
      statusCode: response.status,
      response: response.data
    };
    
    results.total++;
    if (test.passed) {
      results.passed++;
      console.log('✅ Get Securities for Document Test PASSED');
    } else {
      results.failed++;
      console.log('❌ Get Securities for Document Test FAILED');
    }
    
    results.tests.push(test);
  } catch (error) {
    results.total++;
    results.failed++;
    
    const test = {
      name: 'Get Securities for Document',
      endpoint: `/api/documents/${TEST_DOCUMENT_ID}/securities`,
      passed: false,
      error: error.message
    };
    
    results.tests.push(test);
    console.log('❌ Get Securities for Document Test FAILED');
    console.error(`Error: ${error.message}`);
  }

  // Test updating securities for a document endpoint
  try {
    const sampleSecurities = [
      {
        isin: TEST_ISIN,
        name: 'Apple Inc.',
        quantity: 100,
        price: 150.00
      },
      {
        isin: 'US5949181045',
        name: 'Microsoft Corporation',
        quantity: 50,
        price: 300.00
      }
    ];
    
    const response = await axios.put(`${BASE_URL}/documents/${TEST_DOCUMENT_ID}/securities`, {
      securities: sampleSecurities
    });
    
    const test = {
      name: 'Update Securities for Document',
      endpoint: `/api/documents/${TEST_DOCUMENT_ID}/securities`,
      passed: response.status === 200 && response.data.success === true,
      statusCode: response.status,
      response: response.data
    };
    
    results.total++;
    if (test.passed) {
      results.passed++;
      console.log('✅ Update Securities for Document Test PASSED');
    } else {
      results.failed++;
      console.log('❌ Update Securities for Document Test FAILED');
    }
    
    results.tests.push(test);
  } catch (error) {
    results.total++;
    results.failed++;
    
    const test = {
      name: 'Update Securities for Document',
      endpoint: `/api/documents/${TEST_DOCUMENT_ID}/securities`,
      passed: false,
      error: error.message
    };
    
    results.tests.push(test);
    console.log('❌ Update Securities for Document Test FAILED');
    console.error(`Error: ${error.message}`);
  }
}

/**
 * Test the update security API endpoints
 * @param {Object} results - Test results object
 */
async function testUpdateSecurityAPI(results) {
  console.log('\nTesting Update Security API:');
  
  // Test update security by ISIN endpoint
  try {
    const updates = {
      name: 'Apple Inc. (Updated)',
      price: 155.50,
      quantity: 120
    };
    
    const response = await axios.put(`${BASE_URL}/securities/${TEST_ISIN}`, updates);
    
    const test = {
      name: 'Update Security by ISIN',
      endpoint: `/api/securities/${TEST_ISIN}`,
      passed: response.status === 200 && response.data.success === true && response.data.security?.isin === TEST_ISIN,
      statusCode: response.status,
      response: response.data
    };
    
    results.total++;
    if (test.passed) {
      results.passed++;
      console.log('✅ Update Security by ISIN Test PASSED');
    } else {
      results.failed++;
      console.log('❌ Update Security by ISIN Test FAILED');
    }
    
    results.tests.push(test);
  } catch (error) {
    results.total++;
    results.failed++;
    
    const test = {
      name: 'Update Security by ISIN',
      endpoint: `/api/securities/${TEST_ISIN}`,
      passed: false,
      error: error.message
    };
    
    results.tests.push(test);
    console.log('❌ Update Security by ISIN Test FAILED');
    console.error(`Error: ${error.message}`);
  }

  // Test update document securities endpoint with market data
  try {
    const response = await axios.get(`${BASE_URL}/market-data/update-document-securities/${TEST_DOCUMENT_ID}?forceRefresh=true`);
    
    const test = {
      name: 'Update Document Securities with Market Data',
      endpoint: `/api/market-data/update-document-securities/${TEST_DOCUMENT_ID}?forceRefresh=true`,
      passed: response.status === 200 && response.data.success === true,
      statusCode: response.status,
      response: response.data
    };
    
    results.total++;
    if (test.passed) {
      results.passed++;
      console.log('✅ Update Document Securities with Market Data Test PASSED');
    } else {
      results.failed++;
      console.log('❌ Update Document Securities with Market Data Test FAILED');
    }
    
    results.tests.push(test);
  } catch (error) {
    results.total++;
    results.failed++;
    
    const test = {
      name: 'Update Document Securities with Market Data',
      endpoint: `/api/market-data/update-document-securities/${TEST_DOCUMENT_ID}?forceRefresh=true`,
      passed: false,
      error: error.message
    };
    
    results.tests.push(test);
    console.log('❌ Update Document Securities with Market Data Test FAILED');
    console.error(`Error: ${error.message}`);
  }
}

// Run the tests if executed directly
if (require.main === module) {
  runApiTests()
    .then(results => {
      // Output results to file if requested
      if (process.env.OUTPUT_FILE) {
        const fs = require('fs');
        fs.writeFileSync(process.env.OUTPUT_FILE, JSON.stringify(results, null, 2));
        console.log(`Test results written to ${process.env.OUTPUT_FILE}`);
      }
      
      // Exit with appropriate code
      process.exit(results.failed > 0 ? 1 : 0);
    })
    .catch(error => {
      console.error('Error running API tests:', error);
      process.exit(1);
    });
}

// Export for use in other files
module.exports = { runApiTests };