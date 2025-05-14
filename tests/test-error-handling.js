/**
 * Test script for error handling and logging
 */

const axios = require('axios');

// Base URL for API requests
const API_BASE_URL = 'http://localhost:8080/api';

/**
 * Test validation error handling
 */
async function testValidationError() {
  console.log('\n=== Testing Validation Error Handling ===');

  try {
    // Attempt login without required fields
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      // Missing email and password
    });
    
    console.error('❌ Expected validation error, but received success response:', response.data);
    return false;
  } catch (error) {
    if (error.response && error.response.status === 400) {
      console.log('✅ Received expected validation error:', error.response.data);
      if (error.response.data.error && error.response.data.error.details) {
        console.log('Validation details:', error.response.data.error.details);
      }
      return true;
    } else {
      console.error('❌ Received unexpected error:', error.response?.data || error.message);
      return false;
    }
  }
}

/**
 * Test authentication error handling
 */
async function testAuthenticationError() {
  console.log('\n=== Testing Authentication Error Handling ===');

  try {
    // Attempt login with invalid credentials
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'invalid@example.com',
      password: 'wrongpassword'
    });
    
    console.error('❌ Expected authentication error, but received success response:', response.data);
    return false;
  } catch (error) {
    if (error.response && error.response.status === 401) {
      console.log('✅ Received expected authentication error:', error.response.data);
      return true;
    } else {
      console.error('❌ Received unexpected error:', error.response?.data || error.message);
      return false;
    }
  }
}

/**
 * Test admin route authorization
 */
async function testAuthorizationError() {
  console.log('\n=== Testing Authorization Error Handling ===');

  try {
    // Attempt to access admin logs without admin privileges
    const response = await axios.get(`${API_BASE_URL}/admin/logs`);
    
    console.error('❌ Expected authorization error, but received success response:', response.data);
    return false;
  } catch (error) {
    if (error.response && error.response.status === 401) {
      console.log('✅ Received expected authorization error:', error.response.data);
      return true;
    } else {
      console.error('❌ Received unexpected error:', error.response?.data || error.message);
      return false;
    }
  }
}

/**
 * Test not found error handling
 */
async function testNotFoundError() {
  console.log('\n=== Testing Not Found Error Handling ===');

  try {
    // Attempt to access a non-existent endpoint
    const response = await axios.get(`${API_BASE_URL}/nonexistent-endpoint`);
    
    console.error('❌ Expected not found error, but received success response:', response.data);
    return false;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      console.log('✅ Received expected not found error:', error.response.data);
      return true;
    } else {
      console.error('❌ Received unexpected error:', error.response?.data || error.message);
      return false;
    }
  }
}

/**
 * Test admin status endpoint
 */
async function testAdminStatus() {
  console.log('\n=== Testing Admin Status Endpoint ===');

  try {
    // Access admin status
    const response = await axios.get(`${API_BASE_URL}/admin/status`);
    
    if (response.data.success) {
      console.log('✅ Successfully accessed admin status endpoint');
      console.log('System info:', response.data.data);
      return true;
    } else {
      console.error('❌ Failed to access admin status endpoint:', response.data);
      return false;
    }
  } catch (error) {
    console.error('❌ Error accessing admin status endpoint:', error.response?.data || error.message);
    return false;
  }
}

/**
 * Test admin logs endpoint
 */
async function testAdminLogs() {
  console.log('\n=== Testing Admin Logs Endpoint ===');

  try {
    // Access admin logs
    const response = await axios.get(`${API_BASE_URL}/admin/logs?type=combined&limit=10`);
    
    if (response.data.success) {
      console.log('✅ Successfully accessed admin logs endpoint');
      console.log(`Retrieved ${response.data.data.logs.length} log entries`);
      if (response.data.data.logs.length > 0) {
        console.log('Sample log entry:', response.data.data.logs[0]);
      }
      return true;
    } else {
      console.error('❌ Failed to access admin logs endpoint:', response.data);
      return false;
    }
  } catch (error) {
    console.error('❌ Error accessing admin logs endpoint:', error.response?.data || error.message);
    return false;
  }
}

/**
 * Run all tests
 */
async function runTests() {
  try {
    console.log('🚀 Starting error handling and logging tests...');
    
    // Test validation error
    const validationResult = await testValidationError();
    
    // Test authentication error
    const authenticationResult = await testAuthenticationError();
    
    // Test authorization error
    const authorizationResult = await testAuthorizationError();
    
    // Test not found error
    const notFoundResult = await testNotFoundError();
    
    // Test admin status endpoint
    const adminStatusResult = await testAdminStatus();
    
    // Test admin logs endpoint
    const adminLogsResult = await testAdminLogs();
    
    // Print summary
    console.log('\n=== Test Results Summary ===');
    console.log(`Validation Error Test: ${validationResult ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Authentication Error Test: ${authenticationResult ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Authorization Error Test: ${authorizationResult ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Not Found Error Test: ${notFoundResult ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Admin Status Endpoint Test: ${adminStatusResult ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Admin Logs Endpoint Test: ${adminLogsResult ? '✅ PASS' : '❌ FAIL'}`);
    
    const allPassed = validationResult && authenticationResult && authorizationResult && 
                       notFoundResult && adminStatusResult && adminLogsResult;
    
    if (allPassed) {
      console.log('\n✅ All error handling and logging tests passed!');
    } else {
      console.log('\n❌ Some tests failed. See summary above for details.');
      process.exit(1);
    }
  } catch (error) {
    console.error('\n❌ Tests failed due to unexpected error:', error);
    process.exit(1);
  }
}

// Run the tests
runTests();