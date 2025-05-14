/**
 * MCP Functionality Test Script
 * 
 * This script tests if various MCP servers are running correctly
 * and provides a brief example of their capabilities.
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const { promisify } = require('util');
const exec = promisify(require('child_process').exec);

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m'
};

/**
 * Tests a MCP server by running a simple command
 * @param {string} mcpName - Name of the MCP
 * @param {string} command - Command to execute (usually npx)
 * @param {Array<string>} args - Arguments for the command
 * @param {string} testPayload - JSON string payload to send to the MCP
 * @returns {Promise<boolean>} - Whether the test was successful
 */
async function testMcp(mcpName, command, args, testPayload) {
  console.log(`${colors.bright}${colors.blue}Testing ${mcpName} MCP...${colors.reset}`);
  
  return new Promise((resolve) => {
    try {
      // Spawn the MCP process
      const mcpProcess = spawn(command, args);
      
      // Set timeout in case the MCP hangs
      const timeout = setTimeout(() => {
        console.log(`${colors.red}✖ ${mcpName} MCP test timed out${colors.reset}`);
        mcpProcess.kill();
        resolve(false);
      }, 10000);
      
      // Process output chunks
      let responseData = '';
      
      // Send test payload
      mcpProcess.stdin.write(testPayload);
      mcpProcess.stdin.end();
      
      // Handle stdout data
      mcpProcess.stdout.on('data', (data) => {
        responseData += data.toString();
      });
      
      // Handle process completion
      mcpProcess.on('close', (code) => {
        clearTimeout(timeout);
        
        try {
          // Parse response as JSON
          const response = JSON.parse(responseData);
          
          if (response.success === true || response.result || response.data) {
            console.log(`${colors.green}✓ ${mcpName} MCP is running correctly${colors.reset}`);
            resolve(true);
          } else {
            console.log(`${colors.red}✖ ${mcpName} MCP returned unsuccessful response${colors.reset}`);
            resolve(false);
          }
        } catch (parseError) {
          console.log(`${colors.red}✖ ${mcpName} MCP returned invalid JSON: ${parseError.message}${colors.reset}`);
          console.log(`Response was: ${responseData.substring(0, 100)}...`);
          resolve(false);
        }
      });
      
      // Handle errors
      mcpProcess.on('error', (error) => {
        clearTimeout(timeout);
        console.log(`${colors.red}✖ ${mcpName} MCP error: ${error.message}${colors.reset}`);
        resolve(false);
      });
    } catch (execError) {
      console.log(`${colors.red}✖ ${mcpName} MCP failed to start: ${execError.message}${colors.reset}`);
      resolve(false);
    }
  });
}

/**
 * Main function to test all MCPs
 */
async function testAllMcps() {
  console.log(`${colors.bright}${colors.magenta}===== FinDoc Analyzer MCP Functionality Test =====${colors.reset}\n`);
  
  const testResults = {};
  
  // Create a test directory
  const testDir = path.join(__dirname, 'mcp-test');
  if (!fs.existsSync(testDir)) {
    fs.mkdirSync(testDir);
  }
  
  // Test Memory MCP
  testResults.memory = await testMcp(
    'Memory',
    'npx',
    ['-y', '@modelcontextprotocol/server-memory'],
    JSON.stringify({
      action: 'store',
      data: { key: 'test', value: 'This is a test from FinDoc Analyzer' }
    })
  );
  
  // Test FileSystem MCP
  testResults.filesystem = await testMcp(
    'FileSystem',
    'npx',
    ['-y', '@modelcontextprotocol/server-filesystem'],
    JSON.stringify({
      action: 'readdir',
      params: { path: '.' }
    })
  );
  
  // Test Fetch MCP
  testResults.fetch = await testMcp(
    'Fetch',
    'npx',
    ['-y', '@modelcontextprotocol/server-fetch'],
    JSON.stringify({
      action: 'fetch',
      params: {
        url: 'https://jsonplaceholder.typicode.com/todos/1',
        method: 'GET'
      }
    })
  );
  
  // Test Time MCP
  testResults.time = await testMcp(
    'Time',
    'npx',
    ['-y', '@modelcontextprotocol/server-time'],
    JSON.stringify({
      action: 'now',
      params: {}
    })
  );
  
  // Test SequentialThinking MCP
  testResults.sequentialthinking = await testMcp(
    'SequentialThinking',
    'npx',
    ['-y', '@modelcontextprotocol/server-sequentialthinking'],
    JSON.stringify({
      action: 'think',
      params: {
        question: 'How can we extract ISIN codes from financial documents?',
        maxSteps: 3
      }
    })
  );
  
  console.log(`\n${colors.bright}${colors.magenta}===== Test Summary =====${colors.reset}`);
  
  let passCount = 0;
  let totalCount = 0;
  
  for (const [mcpName, result] of Object.entries(testResults)) {
    totalCount++;
    if (result) passCount++;
    
    const status = result 
      ? `${colors.green}PASS${colors.reset}` 
      : `${colors.red}FAIL${colors.reset}`;
    
    console.log(`${mcpName} MCP: ${status}`);
  }
  
  console.log(`\n${colors.bright}${colors.blue}Test Results: ${passCount}/${totalCount} passed${colors.reset}`);
  
  // Clean up
  try {
    if (fs.existsSync(testDir)) {
      fs.rmdirSync(testDir, { recursive: true });
    }
  } catch (error) {
    console.log(`${colors.yellow}Warning: Could not clean up test directory: ${error.message}${colors.reset}`);
  }
}

// Run the tests
testAllMcps().catch((error) => {
  console.error(`${colors.red}Error running tests: ${error.message}${colors.reset}`);
  process.exit(1);
});