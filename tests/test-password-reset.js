/**
 * Test script for password reset functionality
 */

const axios = require('axios');

// Base URL for API requests
const API_BASE_URL = 'http://localhost:8080/api';

// Test user email
const TEST_EMAIL = 'test@example.com';

// Store the reset token for use between tests
let resetToken;

/**
 * Test requesting a password reset
 */
async function testRequestPasswordReset() {
  console.log('\n=== Testing Password Reset Request ===');
  
  try {
    // Request password reset
    const response = await axios.post(`${API_BASE_URL}/auth/password-reset/request`, {
      email: TEST_EMAIL
    });
    
    console.log('Response:', response.data);
    
    if (response.data.success) {
      console.log('✅ Password reset request successful');
      
      // For testing purposes, get the reset token from the response
      if (response.data.debug && response.data.debug.resetToken) {
        resetToken = response.data.debug.resetToken;
        console.log('Reset token:', resetToken);
      }
    } else {
      console.log('❌ Password reset request failed');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error requesting password reset:', error.response?.data || error.message);
    process.exit(1);
  }
}

/**
 * Test verifying a password reset token
 */
async function testVerifyResetToken() {
  console.log('\n=== Testing Password Reset Token Verification ===');
  
  if (!resetToken) {
    console.log('❌ No reset token available for testing. Run testRequestPasswordReset first.');
    process.exit(1);
  }
  
  try {
    // Verify reset token
    const response = await axios.get(`${API_BASE_URL}/auth/password-reset/verify?token=${resetToken}`);
    
    console.log('Response:', response.data);
    
    if (response.data.success) {
      console.log('✅ Reset token verification successful');
      console.log('Email:', response.data.email);
    } else {
      console.log('❌ Reset token verification failed');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error verifying reset token:', error.response?.data || error.message);
    process.exit(1);
  }
}

/**
 * Test completing a password reset
 */
async function testCompletePasswordReset() {
  console.log('\n=== Testing Password Reset Completion ===');
  
  if (!resetToken) {
    console.log('❌ No reset token available for testing. Run testRequestPasswordReset first.');
    process.exit(1);
  }
  
  const newPassword = 'newPassword123';
  
  try {
    // Complete password reset
    const response = await axios.post(`${API_BASE_URL}/auth/password-reset/complete`, {
      token: resetToken,
      newPassword
    });
    
    console.log('Response:', response.data);
    
    if (response.data.success) {
      console.log('✅ Password reset completion successful');
      
      // Now try to log in with the new password
      await testLoginWithNewPassword(TEST_EMAIL, newPassword);
    } else {
      console.log('❌ Password reset completion failed');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error completing password reset:', error.response?.data || error.message);
    process.exit(1);
  }
}

/**
 * Test logging in with the new password
 */
async function testLoginWithNewPassword(email, password) {
  console.log('\n=== Testing Login with New Password ===');
  
  try {
    // Login with new password
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      email,
      password
    });
    
    console.log('Response:', response.data);
    
    if (response.data.success) {
      console.log('✅ Login with new password successful');
    } else {
      console.log('❌ Login with new password failed');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error logging in with new password:', error.response?.data || error.message);
    process.exit(1);
  }
}

/**
 * Test invalid reset token
 */
async function testInvalidResetToken() {
  console.log('\n=== Testing Invalid Reset Token ===');
  
  const invalidToken = 'invalid-token-' + Date.now();
  
  try {
    // Verify invalid reset token
    const response = await axios.get(`${API_BASE_URL}/auth/password-reset/verify?token=${invalidToken}`);
    
    console.log('❌ Verification of invalid token should have failed but succeeded:', response.data);
    process.exit(1);
  } catch (error) {
    if (error.response && error.response.status === 401) {
      console.log('✅ Invalid token correctly rejected');
      console.log('Response:', error.response.data);
    } else {
      console.error('❌ Unexpected error with invalid token:', error.response?.data || error.message);
      process.exit(1);
    }
  }
}

/**
 * Run all tests
 */
async function runTests() {
  try {
    console.log('🚀 Starting password reset tests...');
    
    // Request password reset
    await testRequestPasswordReset();
    
    // Verify reset token
    await testVerifyResetToken();
    
    // Test invalid reset token
    await testInvalidResetToken();
    
    // Complete password reset
    await testCompletePasswordReset();
    
    console.log('\n✅ All password reset tests passed successfully!');
  } catch (error) {
    console.error('\n❌ Tests failed:', error);
    process.exit(1);
  }
}

// Run the tests
runTests();