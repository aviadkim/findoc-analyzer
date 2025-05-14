/**
 * Run automated tests for the FinDoc Analyzer
 * 
 * This script:
 * 1. Starts the server
 * 2. Runs the Puppeteer tests
 * 3. Shuts down the server
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Ensure logs directory exists
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Create log file streams
const serverLogStream = fs.createWriteStream(path.join(logsDir, 'server.log'), { flags: 'a' });
const testLogStream = fs.createWriteStream(path.join(logsDir, 'test.log'), { flags: 'a' });

// Start the server
console.log('Starting server...');
const server = spawn('node', ['server.js'], {
  stdio: ['ignore', 'pipe', 'pipe']
});

// Pipe server output to log file
server.stdout.pipe(serverLogStream);
server.stderr.pipe(serverLogStream);

// Wait for server to start
setTimeout(() => {
  console.log('Server started. Running tests...');
  
  // Run the Puppeteer tests
  const test = spawn('node', ['test-api-with-puppeteer.js'], {
    stdio: ['ignore', 'pipe', 'pipe']
  });
  
  // Pipe test output to log file and console
  test.stdout.on('data', (data) => {
    process.stdout.write(data.toString());
    testLogStream.write(data.toString());
  });
  
  test.stderr.on('data', (data) => {
    process.stderr.write(data.toString());
    testLogStream.write(data.toString());
  });
  
  // Handle test completion
  test.on('close', (code) => {
    console.log(`Tests completed with code ${code}`);
    
    // Shut down the server
    console.log('Shutting down server...');
    server.kill();
    
    // Close log streams
    serverLogStream.end();
    testLogStream.end();
    
    process.exit(code);
  });
  
}, 5000); // Wait 5 seconds for server to start

// Handle process exit
process.on('SIGINT', () => {
  console.log('\nShutting down...');
  server.kill();
  serverLogStream.end();
  testLogStream.end();
  process.exit();
});