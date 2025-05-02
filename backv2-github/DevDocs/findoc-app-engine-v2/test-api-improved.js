/**
 * Improved Test API Endpoints
 * 
 * This script tests the API endpoints of the FinDoc Analyzer application.
 */

const http = require('http');

// Test endpoints
const endpoints = [
  '/api/health',
  '/api/visualizations/dashboard',
  '/api/reports',
  '/api/financial/market-data'
];

// Function to test an endpoint
function testEndpoint(endpoint, index) {
  return new Promise((resolve, reject) => {
    console.log(`Testing endpoint: ${endpoint}`);
    
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: endpoint,
      method: 'GET'
    };
    
    const req = http.request(options, res => {
      console.log(`Status: ${res.statusCode}`);
      
      let data = '';
      
      res.on('data', chunk => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          console.log(`Response: ${json.success ? 'Success' : 'Failure'}`);
          console.log(`Data: ${JSON.stringify(json.data || {}, null, 2).substring(0, 100)}...`);
          console.log('---');
          resolve();
        } catch (error) {
          console.error(`Error parsing response: ${error.message}`);
          console.log('---');
          reject(error);
        }
      });
    });
    
    req.on('error', error => {
      console.error(`Error: ${error.message}`);
      console.log('---');
      reject(error);
    });
    
    req.end();
  });
}

// Test endpoints sequentially
async function runTests() {
  for (let i = 0; i < endpoints.length; i++) {
    try {
      await testEndpoint(endpoints[i], i);
    } catch (error) {
      console.error(`Test failed for ${endpoints[i]}: ${error.message}`);
    }
  }
  console.log('All tests completed.');
}

runTests();
