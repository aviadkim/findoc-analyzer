/**
 * Test API Endpoints
 * 
 * This script tests the API endpoints of the FinDoc Analyzer application.
 */

const axios = require('axios');

// Configuration
const config = {
  apiUrl: 'https://findoc-deploy.ey.r.appspot.com',
  timeout: 10000 // 10 seconds
};

/**
 * Test an API endpoint
 * @param {string} method - HTTP method (GET, POST, etc.)
 * @param {string} endpoint - API endpoint
 * @param {object} data - Request data (for POST, PUT, etc.)
 * @returns {Promise<object>} Response data
 */
async function testEndpoint(method, endpoint, data = null) {
  console.log(`Testing ${method} ${endpoint}...`);
  
  try {
    const response = await axios({
      method,
      url: `${config.apiUrl}${endpoint}`,
      data,
      timeout: config.timeout
    });
    
    console.log(`  Status: ${response.status}`);
    console.log(`  Response: ${JSON.stringify(response.data).substring(0, 100)}...`);
    
    return response.data;
  } catch (error) {
    console.error(`  Error: ${error.message}`);
    if (error.response) {
      console.error(`  Status: ${error.response.status}`);
      console.error(`  Response: ${JSON.stringify(error.response.data).substring(0, 100)}...`);
    }
    
    return null;
  }
}

/**
 * Run the tests
 */
async function runTests() {
  console.log('Starting API endpoint tests...');
  
  // Test health endpoint
  await testEndpoint('GET', '/api/health');
  
  // Test various document endpoints
  await testEndpoint('GET', '/api/documents');
  await testEndpoint('GET', '/api/mock/documents');
  
  // Test various upload endpoints
  await testEndpoint('POST', '/api/documents/upload');
  await testEndpoint('POST', '/api/documents');
  await testEndpoint('POST', '/api/mock/documents');
  
  // Test various processing endpoints
  await testEndpoint('POST', '/api/documents/1/process');
  await testEndpoint('POST', '/api/documents/1/scan1');
  await testEndpoint('POST', '/api/mock/documents/1/process');
  
  // Test various status endpoints
  await testEndpoint('GET', '/api/documents/1/status');
  await testEndpoint('GET', '/api/documents/scan1/status');
  await testEndpoint('GET', '/api/mock/documents/1');
  
  // Test various query endpoints
  await testEndpoint('POST', '/api/documents/1/query', { query: 'What is this document about?' });
  await testEndpoint('POST', '/api/documents/1/ask', { question: 'What is this document about?' });
  await testEndpoint('POST', '/api/mock/documents/1/ask', { question: 'What is this document about?' });
  
  console.log('API endpoint tests completed.');
}

// Run the tests
runTests();
