/**
 * Test script for Multi-Factor Authentication functionality
 */

const axios = require('axios');

// Base URL for API requests
const API_BASE_URL = 'http://localhost:8080/api';

// Test user credentials
const TEST_USER = {
  email: 'test@example.com',
  password: 'password123'
};

// Store session token for authenticated requests
let sessionToken;

// Store MFA data
let mfaSecret;

/**
 * Test login without MFA
 */
async function testLoginWithoutMfa() {
  console.log('\n=== Testing Login without MFA ===');
  
  try {
    // Login with test credentials
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: TEST_USER.email,
      password: TEST_USER.password
    });
    
    console.log('Response:', response.data);
    
    if (response.data.success) {
      console.log('✅ Login successful');
      
      // Store session token for later tests
      sessionToken = response.data.sessionToken;
      
      // Check if MFA is already enabled
      if (response.data.user.mfaEnabled) {
        console.log('⚠️ MFA is already enabled for test user. Disabling...');
        await testDisableMfa();
      }
    } else {
      console.log('❌ Login failed');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error during login:', error.response?.data || error.message);
    process.exit(1);
  }
}

/**
 * Test setting up MFA
 */
async function testMfaSetup() {
  console.log('\n=== Testing MFA Setup ===');
  
  if (!sessionToken) {
    console.log('❌ No session token available. Run testLoginWithoutMfa first.');
    process.exit(1);
  }
  
  try {
    // Request MFA setup
    const response = await axios.post(`${API_BASE_URL}/auth/mfa/setup`, {
      sessionToken,
      method: 'totp' // Time-based One-Time Password
    });
    
    console.log('Response:', response.data);
    
    if (response.data.success) {
      console.log('✅ MFA setup initiated successfully');
      console.log('Secret:', response.data.secret);
      console.log('QR Code URL:', response.data.qrCodeUrl);
      console.log('Recovery Codes:', response.data.recoveryCodes);
      
      // Store MFA secret for later tests
      mfaSecret = response.data.secret;
    } else {
      console.log('❌ MFA setup failed');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error during MFA setup:', error.response?.data || error.message);
    process.exit(1);
  }
}

/**
 * Test verifying and enabling MFA
 */
async function testMfaVerifyAndEnable() {
  console.log('\n=== Testing MFA Verification and Enablement ===');
  
  if (!sessionToken || !mfaSecret) {
    console.log('❌ Missing session token or MFA secret. Run testMfaSetup first.');
    process.exit(1);
  }
  
  // Generate a mock 6-digit code (in a real test, this would be generated from the secret)
  const mockCode = '123456';
  
  try {
    // Verify and enable MFA
    const response = await axios.post(`${API_BASE_URL}/auth/mfa/verify`, {
      sessionToken,
      code: mockCode
    });
    
    console.log('Response:', response.data);
    
    if (response.data.success) {
      console.log('✅ MFA verified and enabled successfully');
      
      // Verify that MFA is now enabled
      console.log('MFA Enabled:', response.data.user.mfaEnabled);
    } else {
      console.log('❌ MFA verification failed');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error during MFA verification:', error.response?.data || error.message);
    process.exit(1);
  }
}

/**
 * Test login with MFA
 */
async function testLoginWithMfa() {
  console.log('\n=== Testing Login with MFA ===');
  
  try {
    // First login attempt will return verification requirement
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: TEST_USER.email,
      password: TEST_USER.password
    });
    
    console.log('Login Response:', loginResponse.data);
    
    if (loginResponse.data.success && loginResponse.data.requiresMfa) {
      console.log('✅ Login requires MFA as expected');
      
      const verificationId = loginResponse.data.verificationId;
      const mockMfaCode = '123456';
      
      // Complete login with MFA code
      const mfaResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
        email: TEST_USER.email,
        password: TEST_USER.password,
        mfaCode: mockMfaCode,
        verificationId
      });
      
      console.log('MFA Verification Response:', mfaResponse.data);
      
      if (mfaResponse.data.success) {
        console.log('✅ Login with MFA successful');
        
        // Store new session token
        sessionToken = mfaResponse.data.sessionToken;
      } else {
        console.log('❌ Login with MFA failed');
        process.exit(1);
      }
    } else {
      console.log('❌ Login did not require MFA as expected');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error during login with MFA:', error.response?.data || error.message);
    process.exit(1);
  }
}

/**
 * Test disabling MFA
 */
async function testDisableMfa() {
  console.log('\n=== Testing MFA Disablement ===');
  
  if (!sessionToken) {
    console.log('❌ No session token available. Run testLoginWithMfa first.');
    process.exit(1);
  }
  
  try {
    // Disable MFA
    const response = await axios.post(`${API_BASE_URL}/auth/mfa/disable`, {
      sessionToken,
      password: TEST_USER.password
    });
    
    console.log('Response:', response.data);
    
    if (response.data.success) {
      console.log('✅ MFA disabled successfully');
      
      // Verify that MFA is now disabled
      console.log('MFA Enabled:', response.data.user.mfaEnabled);
    } else {
      console.log('❌ MFA disablement failed');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error during MFA disablement:', error.response?.data || error.message);
    process.exit(1);
  }
}

/**
 * Run all tests in sequence
 */
async function runTests() {
  try {
    console.log('🚀 Starting MFA tests...');
    
    // Login without MFA
    await testLoginWithoutMfa();
    
    // Set up MFA
    await testMfaSetup();
    
    // Verify and enable MFA
    await testMfaVerifyAndEnable();
    
    // Login with MFA
    await testLoginWithMfa();
    
    // Disable MFA
    await testDisableMfa();
    
    console.log('\n✅ All MFA tests passed successfully!');
  } catch (error) {
    console.error('\n❌ Tests failed:', error);
    process.exit(1);
  }
}

// Run the tests
runTests();