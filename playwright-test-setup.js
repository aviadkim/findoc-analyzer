/**
 * Playwright Test Setup for FinDoc Analyzer
 * 
 * This script sets up Playwright for testing the FinDoc Analyzer application.
 * It handles installation and configuration of Playwright to work in WSL environments.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const config = {
  logDir: path.join(__dirname, 'logs'),
  installLog: path.join(__dirname, 'logs', 'playwright-install.log'),
  testResultsDir: path.join(__dirname, 'test-results')
};

// Create directories
[config.logDir, config.testResultsDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

console.log('Setting up Playwright for testing FinDoc Analyzer...');

// Check if running in WSL
const isWsl = () => {
  try {
    return execSync('uname -r').toString().toLowerCase().includes('microsoft');
  } catch (e) {
    return false;
  }
};

// Handle WSL-specific setup
if (isWsl()) {
  console.log('WSL environment detected. Using special configuration...');
  
  // Create Playwright config for WSL
  const playwrightConfig = {
    "browsers": ["chromium"],
    "headless": true,
    "channel": "chrome",
    "executablePath": "/usr/bin/google-chrome",
    "args": [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage"
    ]
  };
  
  fs.writeFileSync(
    path.join(__dirname, 'playwright.config.json'),
    JSON.stringify(playwrightConfig, null, 2)
  );
  
  // Install required system dependencies
  console.log('Installing system dependencies for Playwright in WSL...');
  try {
    // Log output to file
    const installLog = fs.openSync(config.installLog, 'w');
    
    // Using apt to install dependencies
    execSync('sudo apt-get update', { stdio: [0, installLog, installLog] });
    execSync(
      'sudo apt-get install -y libwoff1 libopus0 libwebp6 libwebpdemux2 libenchant1c2a libgudev-1.0-0 libsecret-1-0 libhyphen0 libgdk-pixbuf2.0-0 libegl1 libnotify4 libxslt1.1 libevent-2.1-6 libgles2 libvpx5 libxcomposite1 libatk1.0-0 libatk-bridge2.0-0 libepoxy0 libgtk-3-0 libharfbuzz-icu0 libgstreamer-gl1.0-0 libgstreamer-plugins-bad1.0-0 gstreamer1.0-plugins-good gstreamer1.0-plugins-bad xvfb libnss3 libxss1', 
      { stdio: [0, installLog, installLog] }
    );
    
    // Install Google Chrome
    execSync(
      'wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | sudo apt-key add - && sudo sh -c \'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list\' && sudo apt-get update && sudo apt-get install -y google-chrome-stable',
      { stdio: [0, installLog, installLog] }
    );
    
    fs.closeSync(installLog);
    console.log('System dependencies installed successfully.');
  } catch (error) {
    console.error('Error installing system dependencies:', error.message);
    console.log('Please check the installation log for details:', config.installLog);
    console.log('You may need to manually install the required dependencies.');
  }
}

// Check if Playwright is installed
const isPlaywrightInstalled = () => {
  try {
    require.resolve('@playwright/test');
    return true;
  } catch (e) {
    return false;
  }
};

// Install Playwright if not already installed
if (!isPlaywrightInstalled()) {
  console.log('Installing Playwright...');
  try {
    execSync('npm install @playwright/test', { stdio: 'inherit' });
    console.log('Playwright installed successfully.');
  } catch (error) {
    console.error('Error installing Playwright:', error.message);
    process.exit(1);
  }
}

// Install Playwright browsers
console.log('Installing Playwright browsers...');
try {
  execSync('npx playwright install chromium', { stdio: 'inherit' });
  console.log('Playwright browsers installed successfully.');
} catch (error) {
  console.error('Error installing Playwright browsers:', error.message);
  console.log('You may need to manually install browsers with:');
  console.log('  npx playwright install chromium');
}

console.log('Playwright setup completed successfully.');
console.log('You can now run the tests with:');
console.log('  node playwright-test.js');