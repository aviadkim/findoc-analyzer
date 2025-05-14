/**
 * Test Brave Search MCP
 * 
 * This script tests the Brave Search MCP functionality
 */

const { spawn } = require('child_process');

console.log('Testing Brave Search MCP...');

// Create a simple test payload
const testPayload = {
  action: 'search',
  params: {
    q: 'ISIN code US0378331005',
    type: 'web',
    count: 2
  }
};

// Spawn the Brave Search MCP process
const mcpProcess = spawn('npx', ['-y', 'brave-search-mcp']);

// Set a timeout for the test
const timeout = setTimeout(() => {
  console.error('Test timed out after 10 seconds');
  mcpProcess.kill();
  process.exit(1);
}, 10000);

// Process output
let responseData = '';

// Send the test payload
mcpProcess.stdin.write(JSON.stringify(testPayload));
mcpProcess.stdin.end();

// Collect stdout
mcpProcess.stdout.on('data', (data) => {
  responseData += data.toString();
  console.log('Received data chunk...');
});

// Log stderr
mcpProcess.stderr.on('data', (data) => {
  console.error(`Error from MCP: ${data.toString()}`);
});

// Handle process completion
mcpProcess.on('close', (code) => {
  clearTimeout(timeout);
  
  console.log(`MCP process exited with code ${code}`);
  
  try {
    // Try to parse the response
    const response = JSON.parse(responseData);
    
    // Check if the response contains search results
    if (response && response.results) {
      console.log('✅ Brave Search MCP test passed!');
      console.log(`Found ${response.results.length} search results`);
      
      // Display the first result
      if (response.results.length > 0) {
        const firstResult = response.results[0];
        console.log('\nFirst search result:');
        console.log(`Title: ${firstResult.title}`);
        console.log(`URL: ${firstResult.url}`);
        console.log(`Description: ${firstResult.description}`);
      }
    } else {
      console.error('❌ Brave Search MCP test failed: No search results in response');
      console.log('Response:', response);
    }
  } catch (error) {
    console.error(`❌ Brave Search MCP test failed: ${error.message}`);
    console.log('Raw response:', responseData);
  }
});

// Handle process errors
mcpProcess.on('error', (error) => {
  clearTimeout(timeout);
  console.error(`❌ Brave Search MCP test failed: ${error.message}`);
  process.exit(1);
});