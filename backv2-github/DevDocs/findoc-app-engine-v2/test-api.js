/**
 * Test API Endpoints
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

// Test each endpoint
endpoints.forEach(endpoint => {
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
        console.log('---');
      } catch (error) {
        console.error(`Error parsing response: ${error.message}`);
        console.log('---');
      }
    });
  });
  
  req.on('error', error => {
    console.error(`Error: ${error.message}`);
    console.log('---');
  });
  
  req.end();
});
