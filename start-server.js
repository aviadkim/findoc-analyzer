/**
 * Start the FinDoc Analyzer server
 * 
 * This script starts the Express server with all our new implementations.
 * It ensures all necessary directories exist and prints helpful information.
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// Create necessary directories
const directories = [
  './uploads',
  './temp',
  './results',
  './results/chat-logs',
  './logs'
];

directories.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Created directory: ${dir}`);
  }
});

// Start the server
console.log('Starting FinDoc Analyzer server...');
console.log('-------------------------------------');
console.log('Version: 1.0.0');
console.log('Environment: ' + (process.env.NODE_ENV || 'development'));
console.log('Port: ' + (process.env.PORT || 8080));
console.log('-------------------------------------');
console.log('Press Ctrl+C to stop the server');
console.log('-------------------------------------\n');

// Run the server
const server = exec('node server.js', (error, stdout, stderr) => {
  if (error) {
    console.error(`Error executing server: ${error}`);
    return;
  }
});

// Forward stdout and stderr
server.stdout.on('data', (data) => {
  console.log(data);
});

server.stderr.on('data', (data) => {
  console.error(data);
});

// Handle server exit
server.on('exit', (code) => {
  console.log(`Server exited with code ${code}`);
});

// Handle process exit
process.on('SIGINT', () => {
  console.log('\nStopping server...');
  server.kill();
  process.exit();
});