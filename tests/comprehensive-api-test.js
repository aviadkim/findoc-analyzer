/**
 * Comprehensive API Test
 * This script tests the API key configuration, authentication, and backend integration
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
    // Health endpoints
    health: '/api/health',

    // API key endpoints
    getSecret: '/api/keys/gcp/secrets/get',
    validateApiKey: '/api/keys/validate',
    getAllApiKeys: '/api/keys/all',
    getEnvironment: '/api/keys/environment',

    // Document endpoints
    getDocuments: '/api/documents',
    getDocument: '/api/documents/doc-1',
    processDocument: '/api/documents/doc-1/process',

    // Authentication endpoints
    googleAuth: '/auth/google',
    googleCallback: '/auth/google/callback',

    // Chat endpoints
    documentChat: '/api/document-chat'
  },

  // Test timeout
  timeout: 30000,

  // Output file
  outputFile: 'comprehensive-api-test-results.json',

  // Test API key
  apiKey: 'test-api-key'
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
  console.log('Starting comprehensive API tests...');

  try {
    // Test health endpoint
    await testHealthEndpoint();

    // Test API key endpoints
    await testApiKeyEndpoints();

    // Test document endpoints
    await testDocumentEndpoints();

    // Test authentication
    await testAuthentication();

    // Test chat endpoints
    await testChatEndpoints();

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

// Test API key endpoints
async function testApiKeyEndpoints() {
  console.log('Testing API key endpoints...');

  // Test get environment endpoint
  await testGetEnvironmentEndpoint();

  // Test get secret endpoint
  await testGetSecretEndpoint();

  // Test validate API key endpoint
  await testValidateApiKeyEndpoint();

  // Test get all API keys endpoint
  await testGetAllApiKeysEndpoint();
}

// Test get environment endpoint
async function testGetEnvironmentEndpoint() {
  console.log('Testing get environment endpoint...');

  try {
    const response = await axios.get(`${config.baseUrl}${config.endpoints.getEnvironment}`, {
      timeout: config.timeout
    });

    if (response.status === 200 && response.data.isGoogleCloud !== undefined) {
      testResults.passed.push({
        test: 'Get Environment Endpoint',
        message: 'Get environment endpoint is working correctly'
      });
      console.log('✅ Get environment endpoint is working correctly');
      console.log('Environment information:', JSON.stringify(response.data, null, 2));
    } else {
      testResults.failed.push({
        test: 'Get Environment Endpoint',
        error: `Get environment endpoint returned unexpected response: ${JSON.stringify(response.data)}`
      });
      console.log('❌ Get environment endpoint returned unexpected response');
    }
  } catch (error) {
    testResults.failed.push({
      test: 'Get Environment Endpoint',
      error: `Error testing get environment endpoint: ${error.message}`
    });
    console.log('❌ Error testing get environment endpoint:', error.message);
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
        'x-api-key': config.apiKey
      }
    });

    if (response.status === 200) {
      testResults.passed.push({
        test: 'Get Secret Endpoint - With Authentication',
        message: 'Get secret endpoint is working correctly with authentication'
      });
      console.log('✅ Get secret endpoint is working correctly with authentication');
    } else {
      testResults.failed.push({
        test: 'Get Secret Endpoint - With Authentication',
        error: `Get secret endpoint returned unexpected status with authentication: ${response.status}`
      });
      console.log('❌ Get secret endpoint returned unexpected status with authentication:', response.status);
    }
  } catch (error) {
    testResults.failed.push({
      test: 'Get Secret Endpoint',
      error: `Error testing get secret endpoint: ${error.message}`
    });
    console.log('❌ Error testing get secret endpoint:', error.message);
  }
}

// Test validate API key endpoint
async function testValidateApiKeyEndpoint() {
  console.log('Testing validate API key endpoint...');

  try {
    // First, test without authentication
    console.log('Testing validate API key endpoint without authentication...');
    const responseWithoutAuth = await axios.post(`${config.baseUrl}${config.endpoints.validateApiKey}`, {
      type: 'openrouter',
      key: 'test-key'
    }, {
      timeout: config.timeout,
      validateStatus: status => status < 500 // Accept 4xx responses
    });

    if (responseWithoutAuth.status === 401 || responseWithoutAuth.status === 403) {
      testResults.passed.push({
        test: 'Validate API Key Endpoint - Without Authentication',
        message: 'Validate API key endpoint exists and requires authentication'
      });
      console.log('✅ Validate API key endpoint exists and requires authentication');
    } else {
      testResults.warnings.push({
        test: 'Validate API Key Endpoint - Without Authentication',
        message: `Validate API key endpoint returned unexpected status without authentication: ${responseWithoutAuth.status}`
      });
      console.log('⚠️ Validate API key endpoint returned unexpected status without authentication:', responseWithoutAuth.status);
    }

    // Now, test with authentication
    console.log('Testing validate API key endpoint with authentication...');
    const response = await axios.post(`${config.baseUrl}${config.endpoints.validateApiKey}`, {
      type: 'openrouter',
      key: 'test-key'
    }, {
      timeout: config.timeout,
      validateStatus: status => status < 500, // Accept 4xx responses
      headers: {
        'x-api-key': config.apiKey
      }
    });

    if (response.status === 200) {
      testResults.passed.push({
        test: 'Validate API Key Endpoint - With Authentication',
        message: 'Validate API key endpoint is working correctly with authentication'
      });
      console.log('✅ Validate API key endpoint is working correctly with authentication');
    } else {
      testResults.failed.push({
        test: 'Validate API Key Endpoint - With Authentication',
        error: `Validate API key endpoint returned unexpected status with authentication: ${response.status}`
      });
      console.log('❌ Validate API key endpoint returned unexpected status with authentication:', response.status);
    }
  } catch (error) {
    testResults.failed.push({
      test: 'Validate API Key Endpoint',
      error: `Error testing validate API key endpoint: ${error.message}`
    });
    console.log('❌ Error testing validate API key endpoint:', error.message);
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
        'x-api-key': config.apiKey
      }
    });

    if (response.status === 200) {
      testResults.passed.push({
        test: 'Get All API Keys Endpoint - With Authentication',
        message: 'Get all API keys endpoint is working correctly with authentication'
      });
      console.log('✅ Get all API keys endpoint is working correctly with authentication');
    } else {
      testResults.failed.push({
        test: 'Get All API Keys Endpoint - With Authentication',
        error: `Get all API keys endpoint returned unexpected status with authentication: ${response.status}`
      });
      console.log('❌ Get all API keys endpoint returned unexpected status with authentication:', response.status);
    }
  } catch (error) {
    testResults.failed.push({
      test: 'Get All API Keys Endpoint',
      error: `Error testing get all API keys endpoint: ${error.message}`
    });
    console.log('❌ Error testing get all API keys endpoint:', error.message);
  }
}

// Test document endpoints
async function testDocumentEndpoints() {
  console.log('Testing document endpoints...');

  // Test get documents endpoint
  await testGetDocumentsEndpoint();

  // Test get document endpoint
  await testGetDocumentEndpoint();

  // Test process document endpoint
  await testProcessDocumentEndpoint();
}

// Test get documents endpoint
async function testGetDocumentsEndpoint() {
  console.log('Testing get documents endpoint...');

  try {
    const response = await axios.get(`${config.baseUrl}${config.endpoints.getDocuments}`, {
      timeout: config.timeout,
      validateStatus: status => status < 500 // Accept 4xx responses
    });

    if (response.status === 200 && Array.isArray(response.data)) {
      testResults.passed.push({
        test: 'Get Documents Endpoint',
        message: 'Get documents endpoint is working correctly'
      });
      console.log('✅ Get documents endpoint is working correctly');
    } else {
      testResults.failed.push({
        test: 'Get Documents Endpoint',
        error: `Get documents endpoint returned unexpected response: ${JSON.stringify(response.data)}`
      });
      console.log('❌ Get documents endpoint returned unexpected response');
    }
  } catch (error) {
    testResults.failed.push({
      test: 'Get Documents Endpoint',
      error: `Error testing get documents endpoint: ${error.message}`
    });
    console.log('❌ Error testing get documents endpoint:', error.message);
  }
}

// Test get document endpoint
async function testGetDocumentEndpoint() {
  console.log('Testing get document endpoint...');

  try {
    const response = await axios.get(`${config.baseUrl}${config.endpoints.getDocument}`, {
      timeout: config.timeout,
      validateStatus: status => status < 500 // Accept 4xx responses
    });

    if (response.status === 200 && response.data.id) {
      testResults.passed.push({
        test: 'Get Document Endpoint',
        message: 'Get document endpoint is working correctly'
      });
      console.log('✅ Get document endpoint is working correctly');
    } else {
      testResults.failed.push({
        test: 'Get Document Endpoint',
        error: `Get document endpoint returned unexpected response: ${JSON.stringify(response.data)}`
      });
      console.log('❌ Get document endpoint returned unexpected response');
    }
  } catch (error) {
    testResults.failed.push({
      test: 'Get Document Endpoint',
      error: `Error testing get document endpoint: ${error.message}`
    });
    console.log('❌ Error testing get document endpoint:', error.message);
  }
}

// Test process document endpoint
async function testProcessDocumentEndpoint() {
  console.log('Testing process document endpoint...');

  try {
    const response = await axios.post(`${config.baseUrl}${config.endpoints.processDocument}`, {
      userId: 'user-1'
    }, {
      timeout: config.timeout,
      validateStatus: status => status < 500 // Accept 4xx responses
    });

    if (response.status === 200) {
      testResults.passed.push({
        test: 'Process Document Endpoint',
        message: 'Process document endpoint is working correctly'
      });
      console.log('✅ Process document endpoint is working correctly');
    } else {
      testResults.failed.push({
        test: 'Process Document Endpoint',
        error: `Process document endpoint returned unexpected status: ${response.status}`
      });
      console.log('❌ Process document endpoint returned unexpected status:', response.status);
    }
  } catch (error) {
    testResults.failed.push({
      test: 'Process Document Endpoint',
      error: `Error testing process document endpoint: ${error.message}`
    });
    console.log('❌ Error testing process document endpoint:', error.message);
  }
}

// Test authentication
async function testAuthentication() {
  console.log('Testing authentication...');

  // Test Google authentication
  await testGoogleAuthentication();
}

// Test Google authentication
async function testGoogleAuthentication() {
  console.log('Testing Google authentication...');

  try {
    const response = await axios.get(`${config.baseUrl}${config.endpoints.googleAuth}`, {
      timeout: config.timeout,
      validateStatus: status => status < 500, // Accept 4xx responses
      maxRedirects: 0 // Don't follow redirects
    });

    if (response.status === 302) {
      testResults.passed.push({
        test: 'Google Authentication',
        message: 'Google authentication endpoint is working correctly'
      });
      console.log('✅ Google authentication endpoint is working correctly');
    } else {
      testResults.warnings.push({
        test: 'Google Authentication',
        message: `Google authentication endpoint returned unexpected status: ${response.status}`
      });
      console.log('⚠️ Google authentication endpoint returned unexpected status:', response.status);
    }
  } catch (error) {
    if (error.response && error.response.status === 302) {
      testResults.passed.push({
        test: 'Google Authentication',
        message: 'Google authentication endpoint is working correctly (redirects to Google)'
      });
      console.log('✅ Google authentication endpoint is working correctly (redirects to Google)');
    } else {
      testResults.warnings.push({
        test: 'Google Authentication',
        message: `Error testing Google authentication endpoint: ${error.message}`
      });
      console.log('⚠️ Error testing Google authentication endpoint:', error.message);
    }
  }
}

// Test chat endpoints
async function testChatEndpoints() {
  console.log('Testing chat endpoints...');

  // Test document chat endpoint
  await testDocumentChatEndpoint();
}

// Test document chat endpoint
async function testDocumentChatEndpoint() {
  console.log('Testing document chat endpoint...');

  try {
    const response = await axios.get(`${config.baseUrl}${config.endpoints.documentChat}?documentId=doc-1&message=What%20is%20the%20revenue?`, {
      timeout: config.timeout,
      validateStatus: status => status < 500 // Accept 4xx responses
    });

    if (response.status === 200 && response.data.response) {
      testResults.passed.push({
        test: 'Document Chat Endpoint',
        message: 'Document chat endpoint is working correctly'
      });
      console.log('✅ Document chat endpoint is working correctly');
    } else {
      testResults.failed.push({
        test: 'Document Chat Endpoint',
        error: `Document chat endpoint returned unexpected response: ${JSON.stringify(response.data)}`
      });
      console.log('❌ Document chat endpoint returned unexpected response');
    }
  } catch (error) {
    testResults.failed.push({
      test: 'Document Chat Endpoint',
      error: `Error testing document chat endpoint: ${error.message}`
    });
    console.log('❌ Error testing document chat endpoint:', error.message);
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
