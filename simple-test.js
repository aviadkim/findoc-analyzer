/**
 * Simple Test Script
 * This script checks basic functionality without relying on MCP servers
 */

console.log('Simple test script running...');
console.log('Node.js version:', process.version);
console.log('Environment variables available:', Object.keys(process.env).length);

// Test file system access
const fs = require('fs');
const path = require('path');

try {
  const directoryPath = path.join(__dirname);
  console.log('Current directory:', directoryPath);
  
  const files = fs.readdirSync(directoryPath);
  console.log('Files in current directory:', files.slice(0, 5), '... and more');
  
  // Check if critical directories exist
  const criticalDirs = ['uploads', 'temp', 'backv2-github'];
  criticalDirs.forEach(dir => {
    const dirPath = path.join(directoryPath, dir);
    const exists = fs.existsSync(dirPath);
    console.log(`Directory '${dir}' exists:`, exists);
  });
  
  // Check if we can create a simple server
  const http = require('http');
  const server = http.createServer((req, res) => {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end('Hello, World!\n');
  });
  
  // Attempt to start the server on port 3000
  server.listen(3000, () => {
    console.log('Test server running on port 3000');
    console.log('You can test it by opening http://localhost:3000 in your browser');
    console.log('The server will automatically stop after 10 seconds');
    
    // Automatically close the server after 10 seconds
    setTimeout(() => {
      server.close(() => {
        console.log('Test server stopped');
      });
    }, 10000);
  });
  
} catch (error) {
  console.error('Error during tests:', error);
}
