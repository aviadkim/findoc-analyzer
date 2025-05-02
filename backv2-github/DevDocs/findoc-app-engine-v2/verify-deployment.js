/**
 * Deployment Verification Script
 * 
 * This script verifies that the application has been deployed successfully
 * by checking the health endpoint and other critical functionality.
 */

const axios = require('axios');

// Configuration
const config = {
  baseUrl: process.env.VERIFY_URL || 'https://findoc-deploy.ey.r.appspot.com',
  endpoints: [
    '/api/health',
    '/api/mock/documents/doc-123456',
    '/test-pdf-processing.html'
  ],
  timeout: 10000 // 10 seconds
};

/**
 * Verify an endpoint
 * @param {string} endpoint - Endpoint to verify
 * @returns {Promise<boolean>} - True if verification passed, false otherwise
 */
async function verifyEndpoint(endpoint) {
  try {
    console.log(`Verifying endpoint: ${endpoint}`);
    
    const response = await axios.get(`${config.baseUrl}${endpoint}`, {
      timeout: config.timeout,
      validateStatus: null // Don't throw on non-2xx status
    });
    
    if (response.status >= 200 && response.status < 300) {
      console.log(`✅ Endpoint ${endpoint} is available (${response.status})`);
      return true;
    } else {
      console.error(`❌ Endpoint ${endpoint} returned status ${response.status}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Error verifying endpoint ${endpoint}: ${error.message}`);
    return false;
  }
}

/**
 * Verify all endpoints
 * @returns {Promise<boolean>} - True if all verifications passed, false otherwise
 */
async function verifyDeployment() {
  console.log(`Verifying deployment at ${config.baseUrl}`);
  
  const results = await Promise.all(
    config.endpoints.map(endpoint => verifyEndpoint(endpoint))
  );
  
  const success = results.every(result => result);
  
  if (success) {
    console.log('✅ Deployment verification passed!');
  } else {
    console.error('❌ Deployment verification failed!');
  }
  
  return success;
}

// Run verification
verifyDeployment()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error(`Error in verification: ${error.message}`);
    process.exit(1);
  });
