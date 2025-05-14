// install-ui-validator.js - Script to set up UI validation environment
const { execSync } = require('child_process');
const fs = require('fs');

// Install necessary packages
console.log('Installing UI validation dependencies...');
execSync('npm install --save-dev puppeteer');

// Create screenshots directory if it doesn't exist
if (!fs.existsSync('./validation-screenshots')) {
  fs.mkdirSync('./validation-screenshots');
}

// Create reports directory if it doesn't exist
if (!fs.existsSync('./validation-reports')) {
  fs.mkdirSync('./validation-reports');
}

console.log('UI validation environment configured successfully');
