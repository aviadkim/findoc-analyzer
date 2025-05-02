/**
 * Create Test User Script
 * 
 * This script creates a test user account for testing purposes.
 */

const fetch = require('node-fetch');
const crypto = require('crypto');

// API URL
const API_URL = 'https://findoc-deploy.ey.r.appspot.com/api';

// Test user credentials
const TEST_USER = {
  email: 'test@example.com',
  password: 'password123',
  name: 'Test User'
};

/**
 * Create a test user account
 */
async function createTestUser() {
  try {
    console.log(`Creating test user: ${TEST_USER.email}`);
    
    // Hash the password
    const hashedPassword = crypto.createHash('sha256').update(TEST_USER.password).digest('hex');
    
    // Create the user
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: TEST_USER.email,
        password: hashedPassword,
        name: TEST_USER.name
      })
    });
    
    const data = await response.json();
    
    if (response.ok && data.success) {
      console.log('Test user created successfully!');
      console.log(`Email: ${TEST_USER.email}`);
      console.log(`Password: ${TEST_USER.password}`);
      return true;
    } else {
      console.error(`Failed to create test user: ${data.error || response.statusText}`);
      return false;
    }
  } catch (error) {
    console.error(`Error creating test user: ${error.message}`);
    return false;
  }
}

// Run the script
createTestUser().then(success => {
  process.exit(success ? 0 : 1);
});
