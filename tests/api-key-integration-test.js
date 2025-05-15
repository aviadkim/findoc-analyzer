/**
 * API Key Integration Test
 * This script tests the API key configuration and backend integration
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Configuration
const config = {
  // Base URL for the API
  baseUrl: 'https://findoc-deploy.ey.r.appspot.com',

  // API endpoints to test
  endpoints: {
    health: '/api/health',
    getSecret: '/api/keys/gcp/secrets/get',
    validateApiKey: '/api/keys/validate',
    getAllApiKeys: '/api/keys/all',
    processDocument: '/api/documents/doc-1/process'
  },

  // Test timeout
  timeout: 30000,

  // Output file
  outputFile: 'api-key-integration-test-results.json'
};

// Test results
const testResults = {
  passed: [],
  failed: [],
  warnings: [],
  timestamp: new Date().toISOString()
};

// Main test function
async function runTests() {
  console.log('Starting API key integration tests...');

  try {
    // Test health endpoint
    await testHealthEndpoint();

    // Test API key endpoints
    await testGetSecretEndpoint();
    await testValidateApiKeyEndpoint();
    await testGetAllApiKeysEndpoint();

    // Test document processing
    await testDocumentProcessingEndpoint();

    // Log test results
    logTestResults();

    // Save test results
    saveTestResults();
  } catch (error) {
    console.error('Error running tests:', error);
    testResults.failed.push({
      test: 'Test execution',
      error: error.message
    });

    // Save test results
    saveTestResults();
  }
}

// Test health endpoint
async function testHealthEndpoint() {
  console.log('Testing health endpoint...');

  try {
    const response = await axios.get(`${config.baseUrl}${config.endpoints.health}`, {
      timeout: config.timeout
    });

    if (response.status === 200 && response.data.status === 'ok') {
      testResults.passed.push({
        test: 'Health Endpoint',
        message: 'Health endpoint is working correctly'
      });
      console.log('✅ Health endpoint is working correctly');
    } else {
      testResults.failed.push({
        test: 'Health Endpoint',
        error: `Health endpoint returned unexpected response: ${JSON.stringify(response.data)}`
      });
      console.log('❌ Health endpoint returned unexpected response');
    }
  } catch (error) {
    testResults.failed.push({
      test: 'Health Endpoint',
      error: `Error testing health endpoint: ${error.message}`
    });
    console.log('❌ Error testing health endpoint:', error.message);
  }
}

// Test get secret endpoint
async function testGetSecretEndpoint() {
  console.log('Testing get secret endpoint...');

  try {
    // First, test without authentication
    console.log('Testing get secret endpoint without authentication...');
    const responseWithoutAuth = await axios.get(`${config.baseUrl}${config.endpoints.getSecret}?name=test-secret`, {
      timeout: config.timeout,
      validateStatus: status => status < 500 // Accept 4xx responses
    });

    if (responseWithoutAuth.status === 401 || responseWithoutAuth.status === 403) {
      testResults.passed.push({
        test: 'Get Secret Endpoint - Without Authentication',
        message: 'Get secret endpoint exists and requires authentication'
      });
      console.log('✅ Get secret endpoint exists and requires authentication');
    } else {
      testResults.warnings.push({
        test: 'Get Secret Endpoint - Without Authentication',
        message: `Get secret endpoint returned unexpected status without authentication: ${responseWithoutAuth.status}`
      });
      console.log('⚠️ Get secret endpoint returned unexpected status without authentication:', responseWithoutAuth.status);
    }

    // Now, test with authentication
    console.log('Testing get secret endpoint with authentication...');
    const response = await axios.get(`${config.baseUrl}${config.endpoints.getSecret}?name=test-secret`, {
      timeout: config.timeout,
      validateStatus: status => status < 500, // Accept 4xx responses
      headers: {
        'x-api-key': 'test-api-key'
      }
    });

    if (response.status === 401 || response.status === 403) {
      testResults.passed.push({
        test: 'Get Secret Endpoint',
        message: 'Get secret endpoint exists and requires authentication'
      });
      console.log('✅ Get secret endpoint exists and requires authentication');
    } else if (response.status === 400) {
      testResults.passed.push({
        test: 'Get Secret Endpoint',
        message: 'Get secret endpoint exists and validates input'
      });
      console.log('✅ Get secret endpoint exists and validates input');
    } else if (response.status === 200) {
      testResults.warnings.push({
        test: 'Get Secret Endpoint',
        message: 'Get secret endpoint returned a 200 response, which is unexpected without authentication'
      });
      console.log('⚠️ Get secret endpoint returned a 200 response, which is unexpected without authentication');
    } else {
      testResults.failed.push({
        test: 'Get Secret Endpoint',
        error: `Get secret endpoint returned unexpected status: ${response.status}`
      });
      console.log('❌ Get secret endpoint returned unexpected status:', response.status);
    }
  } catch (error) {
    if (error.response && error.response.status === 404) {
      testResults.failed.push({
        test: 'Get Secret Endpoint',
        error: 'Get secret endpoint does not exist'
      });
      console.log('❌ Get secret endpoint does not exist');
    } else {
      testResults.failed.push({
        test: 'Get Secret Endpoint',
        error: `Error testing get secret endpoint: ${error.message}`
      });
      console.log('❌ Error testing get secret endpoint:', error.message);
    }
  }
}

// Test validate API key endpoint
async function testValidateApiKeyEndpoint() {
  console.log('Testing validate API key endpoint...');

  try {
    const response = await axios.post(`${config.baseUrl}${config.endpoints.validateApiKey}`, {
      type: 'openrouter',
      key: 'test-key'
    }, {
      timeout: config.timeout,
      validateStatus: status => status < 500 // Accept 4xx responses
    });

    if (response.status === 200) {
      testResults.passed.push({
        test: 'Validate API Key Endpoint',
        message: 'Validate API key endpoint is working correctly'
      });
      console.log('✅ Validate API key endpoint is working correctly');
    } else {
      testResults.failed.push({
        test: 'Validate API Key Endpoint',
        error: `Validate API key endpoint returned unexpected status: ${response.status}`
      });
      console.log('❌ Validate API key endpoint returned unexpected status:', response.status);
    }
  } catch (error) {
    if (error.response && error.response.status === 404) {
      testResults.failed.push({
        test: 'Validate API Key Endpoint',
        error: 'Validate API key endpoint does not exist'
      });
      console.log('❌ Validate API key endpoint does not exist');
    } else {
      testResults.failed.push({
        test: 'Validate API Key Endpoint',
        error: `Error testing validate API key endpoint: ${error.message}`
      });
      console.log('❌ Error testing validate API key endpoint:', error.message);
    }
  }
}

// Test get all API keys endpoint
async function testGetAllApiKeysEndpoint() {
  console.log('Testing get all API keys endpoint...');

  try {
    // First, test without authentication
    console.log('Testing get all API keys endpoint without authentication...');
    const responseWithoutAuth = await axios.get(`${config.baseUrl}${config.endpoints.getAllApiKeys}`, {
      timeout: config.timeout,
      validateStatus: status => status < 500 // Accept 4xx responses
    });

    if (responseWithoutAuth.status === 401 || responseWithoutAuth.status === 403) {
      testResults.passed.push({
        test: 'Get All API Keys Endpoint - Without Authentication',
        message: 'Get all API keys endpoint exists and requires authentication'
      });
      console.log('✅ Get all API keys endpoint exists and requires authentication');
    } else {
      testResults.warnings.push({
        test: 'Get All API Keys Endpoint - Without Authentication',
        message: `Get all API keys endpoint returned unexpected status without authentication: ${responseWithoutAuth.status}`
      });
      console.log('⚠️ Get all API keys endpoint returned unexpected status without authentication:', responseWithoutAuth.status);
    }

    // Now, test with authentication
    console.log('Testing get all API keys endpoint with authentication...');
    const response = await axios.get(`${config.baseUrl}${config.endpoints.getAllApiKeys}`, {
      timeout: config.timeout,
      validateStatus: status => status < 500, // Accept 4xx responses
      headers: {
        'x-api-key': 'test-api-key'
      }
    });

    if (response.status === 401 || response.status === 403) {
      testResults.passed.push({
        test: 'Get All API Keys Endpoint',
        message: 'Get all API keys endpoint exists and requires authentication'
      });
      console.log('✅ Get all API keys endpoint exists and requires authentication');
    } else if (response.status === 200) {
      testResults.warnings.push({
        test: 'Get All API Keys Endpoint',
        message: 'Get all API keys endpoint returned a 200 response, which is unexpected without authentication'
      });
      console.log('⚠️ Get all API keys endpoint returned a 200 response, which is unexpected without authentication');
    } else {
      testResults.failed.push({
        test: 'Get All API Keys Endpoint',
        error: `Get all API keys endpoint returned unexpected status: ${response.status}`
      });
      console.log('❌ Get all API keys endpoint returned unexpected status:', response.status);
    }
  } catch (error) {
    if (error.response && error.response.status === 404) {
      testResults.failed.push({
        test: 'Get All API Keys Endpoint',
        error: 'Get all API keys endpoint does not exist'
      });
      console.log('❌ Get all API keys endpoint does not exist');
    } else {
      testResults.failed.push({
        test: 'Get All API Keys Endpoint',
        error: `Error testing get all API keys endpoint: ${error.message}`
      });
      console.log('❌ Error testing get all API keys endpoint:', error.message);
    }
  }
}

// Test document processing endpoint
async function testDocumentProcessingEndpoint() {
  console.log('Testing document processing endpoint...');

  try {
    const response = await axios.post(`${config.baseUrl}${config.endpoints.processDocument}`, {
      userId: 'user-1'
    }, {
      timeout: config.timeout,
      validateStatus: status => status < 500 // Accept 4xx responses
    });

    if (response.status === 200) {
      testResults.passed.push({
        test: 'Document Processing Endpoint',
        message: 'Document processing endpoint is working correctly'
      });
      console.log('✅ Document processing endpoint is working correctly');
    } else {
      testResults.failed.push({
        test: 'Document Processing Endpoint',
        error: `Document processing endpoint returned unexpected status: ${response.status}`
      });
      console.log('❌ Document processing endpoint returned unexpected status:', response.status);
    }
  } catch (error) {
    if (error.response && error.response.status === 404) {
      testResults.failed.push({
        test: 'Document Processing Endpoint',
        error: 'Document processing endpoint does not exist'
      });
      console.log('❌ Document processing endpoint does not exist');
    } else {
      testResults.failed.push({
        test: 'Document Processing Endpoint',
        error: `Error testing document processing endpoint: ${error.message}`
      });
      console.log('❌ Error testing document processing endpoint:', error.message);
    }
  }
}

// Log test results
function logTestResults() {
  console.log('\n==== TEST RESULTS ====');
  console.log(`Passed: ${testResults.passed.length}`);
  console.log(`Failed: ${testResults.failed.length}`);
  console.log(`Warnings: ${testResults.warnings.length}`);

  if (testResults.passed.length > 0) {
    console.log('\nPassed Tests:');
    testResults.passed.forEach(result => {
      console.log(`✅ ${result.test}: ${result.message}`);
    });
  }

  if (testResults.failed.length > 0) {
    console.log('\nFailed Tests:');
    testResults.failed.forEach(result => {
      console.log(`❌ ${result.test}: ${result.error}`);
    });
  }

  if (testResults.warnings.length > 0) {
    console.log('\nWarnings:');
    testResults.warnings.forEach(result => {
      console.log(`⚠️ ${result.test}: ${result.message}`);
    });
  }
}

// Save test results
function saveTestResults() {
  fs.writeFileSync(
    config.outputFile,
    JSON.stringify(testResults, null, 2),
    'utf8'
  );

  console.log(`\nTest results saved to ${config.outputFile}`);
}

// Run tests
runTests().catch(error => {
  console.error('Error running tests:', error);
  process.exit(1);
});
