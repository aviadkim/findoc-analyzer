/**
 * FinDoc Analyzer Diagnostic Script
 * 
 * This script attempts to load the main components of the application
 * with detailed error logging to identify issues.
 */

console.log('Starting FinDoc Analyzer diagnostic...');

// Set environment variables
process.env.PORT = 3001;
process.env.NODE_ENV = 'development';
process.env.SUPABASE_URL = 'https://dnjnsotemnfrjlotgved.supabase.co';
process.env.SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRuam5zb3RlbW5mcmpsb3RndmVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODI0MzQ4NjcsImV4cCI6MTk5ODAxMDg2N30.t2oGhMPXxeY9jrQq5E7VDfGt2Vf_AgeStBjQfqfcBjY';

// Track which components load successfully
const componentStatus = {
  express: false,
  cors: false,
  fs: false,
  path: false,
  appPath: null,
  appLoaded: false,
  serverPath: null,
  serverLoaded: false
};

// Try to load basic dependencies
try {
  console.log('Testing basic dependencies...');
  
  const express = require('express');
  componentStatus.express = true;
  console.log('✓ Express loaded successfully');
  
  const cors = require('cors');
  componentStatus.cors = true;
  console.log('✓ CORS loaded successfully');
  
  const fs = require('fs');
  componentStatus.fs = true;
  console.log('✓ File system module loaded successfully');
  
  const path = require('path');
  componentStatus.path = true;
  console.log('✓ Path module loaded successfully');
  
  // Find app.js and server.js files
  console.log('\nLooking for main application files...');
  
  // Paths to check
  const potentialPaths = [
    path.join(__dirname, 'backv2-github', 'DevDocs', 'findoc-app-engine-v2', 'src', 'app.js'),
    path.join(__dirname, 'backv2-github', 'DevDocs', 'findoc-app-engine-v2', 'app.js'),
    path.join(__dirname, 'src', 'app.js'),
    path.join(__dirname, 'app.js')
  ];
  
  // Find app.js
  for (const appPath of potentialPaths) {
    if (fs.existsSync(appPath)) {
      componentStatus.appPath = appPath;
      console.log(`✓ Found app.js at: ${appPath}`);
      break;
    }
  }
  
  if (!componentStatus.appPath) {
    console.log('✗ Could not find app.js in any of the expected locations');
  }
  
  // Find server.js
  const serverPaths = [
    path.join(__dirname, 'backv2-github', 'DevDocs', 'findoc-app-engine-v2', 'server.js'),
    path.join(__dirname, 'server.js')
  ];
  
  for (const serverPath of serverPaths) {
    if (fs.existsSync(serverPath)) {
      componentStatus.serverPath = serverPath;
      console.log(`✓ Found server.js at: ${serverPath}`);
      break;
    }
  }
  
  if (!componentStatus.serverPath) {
    console.log('✗ Could not find server.js in any of the expected locations');
  }
  
  // Try to load the application
  console.log('\nAttempting to load application components...');
  
  if (componentStatus.appPath) {
    try {
      // Only require the app, don't start it
      const app = require(componentStatus.appPath);
      componentStatus.appLoaded = true;
      console.log('✓ Successfully loaded app.js');
    } catch (appError) {
      console.error('✗ Error loading app.js:', appError);
      console.log('Stack trace:', appError.stack);
    }
  }
  
  // Try to load server.js but don't run it
  if (componentStatus.serverPath) {
    try {
      // Mock listen method to prevent actual server start
      const http = require('http');
      const originalCreateServer = http.createServer;
      
      http.createServer = function() {
        const server = originalCreateServer.apply(this, arguments);
        const originalListen = server.listen;
        
        server.listen = function() {
          console.log('✓ Server listen method called (prevented actual start)');
          return server;
        };
        
        return server;
      };
      
      // Now try to load the server
      console.log('Loading server.js (but preventing actual server start)...');
      require(componentStatus.serverPath);
      componentStatus.serverLoaded = true;
      console.log('✓ Successfully loaded server.js');
      
      // Restore original method
      http.createServer = originalCreateServer;
    } catch (serverError) {
      console.error('✗ Error loading server.js:', serverError);
      console.log('Stack trace:', serverError.stack);
    }
  }
  
  // Print overall status
  console.log('\n----- Diagnostic Results -----');
  console.log('Basic dependencies:', componentStatus.express && componentStatus.cors ? 'OK' : 'ISSUES');
  console.log('Application files found:', componentStatus.appPath && componentStatus.serverPath ? 'OK' : 'MISSING');
  console.log('Application loading:', componentStatus.appLoaded && componentStatus.serverLoaded ? 'OK' : 'ISSUES');
  
  if (!componentStatus.appLoaded || !componentStatus.serverLoaded) {
    console.log('\nPotential issues:');
    console.log('1. Missing or incorrectly installed dependencies');
    console.log('2. Path or directory structure issues');
    console.log('3. Environment configuration problems');
    console.log('4. MCP server integration issues');
  }
  
} catch (error) {
  console.error('Error during diagnostics:', error);
}
