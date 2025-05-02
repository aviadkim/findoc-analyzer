/**
 * Test Next.js Build
 * 
 * This script tests the Next.js build output to verify that our pages are being properly built.
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const config = {
  buildDir: path.join(__dirname, 'DevDocs', 'frontend', '.next'),
  screenshotsDir: path.join(__dirname, 'nextjs-build-test'),
  timeout: 30000 // 30 seconds
};

// Create screenshots directory if it doesn't exist
if (!fs.existsSync(config.screenshotsDir)) {
  fs.mkdirSync(config.screenshotsDir, { recursive: true });
}

/**
 * Run the Next.js build
 * @returns {Promise<void>}
 */
async function runNextjsBuild() {
  console.log('Running Next.js build...');
  
  try {
    // Navigate to the frontend directory
    process.chdir(path.join(__dirname, 'DevDocs', 'frontend'));
    
    // Run the build
    execSync('npm run build', { stdio: 'inherit' });
    
    console.log('Build completed successfully!');
  } catch (error) {
    console.error('Error during build:', error.message);
    throw error;
  }
}

/**
 * Check if a file exists
 * @param {string} filePath - Path to the file
 * @returns {boolean} True if the file exists, false otherwise
 */
function fileExists(filePath) {
  try {
    return fs.existsSync(filePath);
  } catch (error) {
    return false;
  }
}

/**
 * Check the build output
 * @returns {Promise<void>}
 */
async function checkBuildOutput() {
  console.log('Checking build output...');
  
  // Check if the build directory exists
  if (!fileExists(config.buildDir)) {
    console.error(`Build directory not found: ${config.buildDir}`);
    return;
  }
  
  // Check if the server directory exists
  const serverDir = path.join(config.buildDir, 'server', 'pages');
  if (!fileExists(serverDir)) {
    console.error(`Server directory not found: ${serverDir}`);
    return;
  }
  
  // Check if the static directory exists
  const staticDir = path.join(config.buildDir, 'static');
  if (!fileExists(staticDir)) {
    console.error(`Static directory not found: ${staticDir}`);
    return;
  }
  
  // Check for specific pages
  const pagesToCheck = [
    'index.html',
    'documents-new.html',
    'analytics-new.html',
    'feedback.html',
    'document-comparison.html'
  ];
  
  console.log('Checking for pages:');
  for (const page of pagesToCheck) {
    const pagePath = path.join(serverDir, page);
    const exists = fileExists(pagePath);
    console.log(`- ${page}: ${exists ? 'Found' : 'Not found'}`);
  }
  
  // List all files in the server/pages directory
  console.log('\nAll files in server/pages directory:');
  try {
    const files = fs.readdirSync(serverDir);
    files.forEach(file => {
      console.log(`- ${file}`);
    });
  } catch (error) {
    console.error(`Error reading server/pages directory: ${error.message}`);
  }
}

/**
 * Run the tests
 */
async function runTests() {
  console.log('Starting Next.js build tests...');
  
  try {
    // Run the Next.js build
    await runNextjsBuild();
    
    // Check the build output
    await checkBuildOutput();
    
    console.log('Next.js build tests completed.');
  } catch (error) {
    console.error('Error during tests:', error);
  }
}

// Run the tests
runTests();
