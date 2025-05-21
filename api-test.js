const axios = require('axios');
const fs = require('fs');
const path = require('path');

async function runTest() {
  console.log('Starting API test...');
  
  // Create test results directory
  const resultsDir = path.join(__dirname, 'test-results');
  if (!fs.existsSync(resultsDir)) {
    fs.mkdirSync(resultsDir, { recursive: true });
  }
  
  const testResults = {
    timestamp: new Date().toISOString(),
    tests: [],
    passCount: 0,
    failCount: 0
  };
  
  // Test endpoints
  const endpoints = [
    // API Endpoints
    { name: 'Health Check', url: '/api/health', method: 'GET', expectCode: 200 },
    { name: 'Document List', url: '/api/documents', method: 'GET', expectCode: 401 }, // Expect auth required
    { name: 'API Keys Status', url: '/api/config/api-keys', method: 'GET', expectCode: 200 },
    
    // UI Routes
    { name: 'Homepage', url: '/', method: 'GET', expectCode: 200 },
    { name: 'Login Page', url: '/login', method: 'GET', expectCode: 200 },
    { name: 'Upload Page', url: '/upload', method: 'GET', expectCode: 200 },
    { name: 'Documents Page', url: '/documents', method: 'GET', expectCode: 200 },
    { name: 'Analytics Page', url: '/analytics', method: 'GET', expectCode: 200 },
    { name: 'Document Chat Page', url: '/document-chat', method: 'GET', expectCode: 200 }
  ];
  
  // Base URL
  const baseUrl = 'http://localhost:8081';
  
  // Run tests
  for (const endpoint of endpoints) {
    console.log(`Testing ${endpoint.name} (${endpoint.method} ${endpoint.url})...`);
    
    try {
      const response = await axios({
        method: endpoint.method,
        url: `${baseUrl}${endpoint.url}`,
        timeout: 5000
      });
      
      // Check if status code matches expectation
      const expectedCode = endpoint.expectCode || 200;
      const passed = response.status === expectedCode;
      
      if (passed) {
        console.log(`✅ ${endpoint.name} test passed with status ${response.status}`);
        
        if (response.data) {
          console.log('Response:', JSON.stringify(response.data, null, 2));
        }
        
        testResults.tests.push({
          name: endpoint.name,
          url: endpoint.url,
          method: endpoint.method,
          status: 'PASSED',
          statusCode: response.status,
          response: response.data,
          responseType: response.headers['content-type']
        });
        
        testResults.passCount++;
      } else {
        console.log(`❌ ${endpoint.name} test failed: Expected status ${expectedCode}, got ${response.status}`);
        
        testResults.tests.push({
          name: endpoint.name,
          url: endpoint.url,
          method: endpoint.method,
          status: 'FAILED',
          expected: expectedCode,
          actual: response.status
        });
        
        testResults.failCount++;
      }
    } catch (error) {
      // Check if this is an expected error (like 401 for auth required)
      const expectedCode = endpoint.expectCode || 200;
      const actualCode = error.response ? error.response.status : null;
      
      if (actualCode && actualCode === expectedCode) {
        console.log(`✅ ${endpoint.name} test passed with expected error status ${actualCode}`);
        
        testResults.tests.push({
          name: endpoint.name,
          url: endpoint.url,
          method: endpoint.method,
          status: 'PASSED',
          statusCode: actualCode,
          expectedError: true
        });
        
        testResults.passCount++;
      } else {
        console.error(`❌ ${endpoint.name} test failed:`, error.message);
        
        testResults.tests.push({
          name: endpoint.name,
          url: endpoint.url,
          method: endpoint.method,
          status: 'FAILED',
          expected: expectedCode,
          actual: actualCode,
          error: error.message
        });
        
        testResults.failCount++;
      }
    }
  }
  
  // Save test results
  const resultsFile = path.join(resultsDir, 'api-test-results.json');
  fs.writeFileSync(resultsFile, JSON.stringify(testResults, null, 2));
  
  console.log('\nTest Summary:');
  console.log(`Total tests: ${testResults.tests.length}`);
  console.log(`Passed: ${testResults.passCount}`);
  console.log(`Failed: ${testResults.failCount}`);
  console.log(`Results saved to: ${resultsFile}`);
  
  return testResults;
}

// Run the test
runTest();