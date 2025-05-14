/**
 * Test script for Firecrawl MCP
 * Run with: node test-firecrawl.js
 */

const fetch = require('node-fetch');

async function testFirecrawl() {
  console.log('Testing Firecrawl MCP...');
  
  try {
    const response = await fetch('http://localhost:8081/mcp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        url: 'https://example.com',
        options: {
          selectors: ['h1', 'p'],
          wait: 2000
        }
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Firecrawl MCP response:');
    console.log(JSON.stringify(data, null, 2));
    
    return { success: true, data };
  } catch (error) {
    console.error('Error testing Firecrawl MCP:', error.message);
    return { success: false, error: error.message };
  }
}

async function testContext7() {
  console.log('\nTesting Context7 MCP...');
  
  // First store some data
  try {
    // Store data
    const storeResponse = await fetch('http://localhost:8082/mcp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        action: 'store',
        key: 'test-key',
        value: 'This is a test value from ' + new Date().toISOString()
      })
    });
    
    if (!storeResponse.ok) {
      throw new Error(`HTTP error while storing! Status: ${storeResponse.status}`);
    }
    
    const storeData = await storeResponse.json();
    console.log('Context7 MCP store response:');
    console.log(JSON.stringify(storeData, null, 2));
    
    // Now retrieve the data
    const getResponse = await fetch('http://localhost:8082/mcp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        action: 'get',
        key: 'test-key'
      })
    });
    
    if (!getResponse.ok) {
      throw new Error(`HTTP error while retrieving! Status: ${getResponse.status}`);
    }
    
    const getData = await getResponse.json();
    console.log('Context7 MCP get response:');
    console.log(JSON.stringify(getData, null, 2));
    
    return { success: true, storeData, getData };
  } catch (error) {
    console.error('Error testing Context7 MCP:', error.message);
    return { success: false, error: error.message };
  }
}

// Run tests
async function runTests() {
  const firecrawlResult = await testFirecrawl();
  const context7Result = await testContext7();
  
  console.log('\n--- Test Summary ---');
  console.log(`Firecrawl MCP: ${firecrawlResult.success ? 'SUCCESS' : 'FAILED'}`);
  console.log(`Context7 MCP: ${context7Result.success ? 'SUCCESS' : 'FAILED'}`);
  
  if (firecrawlResult.success && context7Result.success) {
    console.log('\nAll MCP servers are working correctly!');
  } else {
    console.log('\nSome MCP servers are not working. Please check the error messages above.');
  }
}

runTests().catch(console.error);