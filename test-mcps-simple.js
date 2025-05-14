/**
 * Simple MCP Test Script
 */

const { spawn } = require('child_process');
const fs = require('fs');
require('dotenv').config();

// Test Brave Search MCP
async function testBraveSearch() {
  return new Promise((resolve) => {
    console.log('Testing Brave Search MCP...');
    
    if (!process.env.BRAVE_API_KEY) {
      console.log('⚠️ BRAVE_API_KEY not set in .env file');
      return resolve(false);
    }
    
    const mcpProcess = spawn('npx', ['brave-search-mcp'], {
      env: { ...process.env }
    });
    
    const testPayload = {
      action: 'search',
      params: {
        q: 'ISIN code Apple Inc',
        type: 'web',
        count: 1
      }
    };
    
    let responseData = '';
    
    mcpProcess.stdout.on('data', (data) => {
      responseData += data.toString();
    });
    
    mcpProcess.stderr.on('data', (data) => {
      console.error(`Error: ${data.toString()}`);
    });
    
    mcpProcess.on('close', (code) => {
      try {
        const response = JSON.parse(responseData);
        if (response && response.results) {
          console.log('✅ Brave Search MCP is working!');
          resolve(true);
        } else {
          console.log('❌ Brave Search MCP test failed');
          resolve(false);
        }
      } catch (error) {
        console.error(`❌ Brave Search MCP test failed: ${error.message}`);
        resolve(false);
      }
    });
    
    // Send test payload
    mcpProcess.stdin.write(JSON.stringify(testPayload));
    mcpProcess.stdin.end();
  });
}

// Test Sequential Thinking MCP
async function testSequentialThinking() {
  return new Promise((resolve) => {
    console.log('Testing Sequential Thinking MCP...');
    
    const mcpProcess = spawn('npx', ['@modelcontextprotocol/server-sequential-thinking']);
    
    const testPayload = {
      action: 'think',
      params: {
        question: 'How to extract ISIN codes from financial documents?',
        maxSteps: 2
      }
    };
    
    let responseData = '';
    
    mcpProcess.stdout.on('data', (data) => {
      responseData += data.toString();
    });
    
    mcpProcess.stderr.on('data', (data) => {
      console.error(`Error: ${data.toString()}`);
    });
    
    mcpProcess.on('close', (code) => {
      try {
        const response = JSON.parse(responseData);
        if (response && response.steps) {
          console.log('✅ Sequential Thinking MCP is working!');
          resolve(true);
        } else {
          console.log('❌ Sequential Thinking MCP test failed');
          resolve(false);
        }
      } catch (error) {
        console.error(`❌ Sequential Thinking MCP test failed: ${error.message}`);
        resolve(false);
      }
    });
    
    // Send test payload
    mcpProcess.stdin.write(JSON.stringify(testPayload));
    mcpProcess.stdin.end();
  });
}

// Run all tests
async function runTests() {
  const braveResult = await testBraveSearch();
  const thinkingResult = await testSequentialThinking();
  
  console.log('\n=== Test Results ===');
  console.log(`Brave Search MCP: ${braveResult ? '✅ Working' : '❌ Failed'}`);
  console.log(`Sequential Thinking MCP: ${thinkingResult ? '✅ Working' : '❌ Failed'}`);
  
  if (braveResult && thinkingResult) {
    console.log('\n✅ All MCPs are working correctly!');
  } else {
    console.log('\n⚠️ Some MCPs are not working correctly.');
    console.log('Please check the .env file and make sure all API keys are set.');
    console.log('Then try running the MCPs with ./start-essential-mcps.sh');
  }
}

runTests();
