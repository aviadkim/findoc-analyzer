/**
 * Run Server and Verify
 * 
 * This script starts the server (if not already running) and runs the 
 * verification tests to ensure the chat interface is working correctly.
 */

const { spawn, execSync } = require('child_process');
const http = require('http');
const path = require('path');
const fs = require('fs');

// Check if the server is already running
function isServerRunning() {
  try {
    const response = execSync('curl -s -o /dev/null -w "%{http_code}" http://localhost:8080');
    return response.toString().trim() === '200';
  } catch (error) {
    return false;
  }
}

// Start the server
function startServer() {
  console.log('Starting server...');
  
  // Check if server.js exists
  if (!fs.existsSync(path.join(__dirname, 'server.js'))) {
    console.error('Error: server.js not found. Cannot start the server.');
    process.exit(1);
  }
  
  const server = spawn('node', ['server.js'], {
    detached: true,
    stdio: 'pipe'
  });
  
  server.stdout.on('data', (data) => {
    console.log(`Server: ${data}`);
  });
  
  server.stderr.on('data', (data) => {
    console.error(`Server Error: ${data}`);
  });
  
  server.on('close', (code) => {
    console.log(`Server process exited with code ${code}`);
  });
  
  // Return the server process
  return server;
}

// Wait for the server to start
function waitForServer(maxAttempts = 30) {
  return new Promise((resolve, reject) => {
    let attempts = 0;
    
    const checkServer = () => {
      attempts++;
      
      if (isServerRunning()) {
        console.log('Server is running!');
        resolve();
        return;
      }
      
      if (attempts >= maxAttempts) {
        reject(new Error('Timed out waiting for server to start'));
        return;
      }
      
      console.log(`Waiting for server to start (attempt ${attempts}/${maxAttempts})...`);
      setTimeout(checkServer, 1000);
    };
    
    checkServer();
  });
}

// Run the verification test
function runVerificationTest() {
  console.log('\nRunning verification test...');
  try {
    const output = execSync('node verify-chat-functionality.js', { encoding: 'utf8' });
    console.log(output);
    return true;
  } catch (error) {
    console.error('Verification test failed:');
    if (error.stdout) console.log(error.stdout.toString());
    if (error.stderr) console.error(error.stderr.toString());
    return false;
  }
}

// Main function
async function main() {
  console.log('Starting verification process...');
  
  let serverProcess = null;
  let serverWasRunning = false;
  
  try {
    // Check if server is already running
    serverWasRunning = isServerRunning();
    
    if (serverWasRunning) {
      console.log('Server is already running');
    } else {
      // Start the server
      serverProcess = startServer();
      
      // Wait for the server to start
      await waitForServer();
    }
    
    // Run the verification test
    const testPassed = runVerificationTest();
    
    console.log('\n========================================');
    console.log(`Verification ${testPassed ? 'PASSED! ✅' : 'FAILED! ❌'}`);
    console.log('========================================');
    
    if (testPassed) {
      console.log('\nThe fix for textarea[name="message"] has been successfully implemented!');
      console.log('Puppeteer tests should now be able to find and use the textarea element.');
    } else {
      console.log('\nThe fix was not implemented correctly. Please check the error messages above.');
    }
    
  } catch (error) {
    console.error(`Error: ${error.message}`);
  } finally {
    // Clean up server process if we started it
    if (serverProcess && !serverWasRunning) {
      console.log('Shutting down server...');
      process.kill(-serverProcess.pid);
    }
  }
}

// Run the main function
main().catch(console.error);