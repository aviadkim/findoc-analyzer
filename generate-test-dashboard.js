/**
 * Generate Test Dashboard
 * 
 * This script runs the Playwright tests and generates a dashboard.
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Configuration
const config = {
  playwrightReportDir: path.join(__dirname, 'playwright-report'),
  dashboardDir: path.join(__dirname, 'test-dashboard'),
  serverStartTimeout: 5000, // 5 seconds
  testTimeout: 300000 // 5 minutes
};

// Ensure the server is running
async function ensureServerRunning() {
  console.log('Ensuring server is running...');
  
  try {
    // Check if server is already running
    const response = await fetch('http://localhost:8080/upload');
    if (response.ok) {
      console.log('Server is already running');
      return;
    }
  } catch (error) {
    console.log('Server is not running, starting it...');
    
    // Start the server
    const serverProcess = require('child_process').spawn('node', ['server.js'], {
      detached: true,
      stdio: 'ignore'
    });
    
    // Unref the process so it can run independently
    serverProcess.unref();
    
    // Wait for the server to start
    console.log(`Waiting ${config.serverStartTimeout / 1000} seconds for server to start...`);
    await new Promise(resolve => setTimeout(resolve, config.serverStartTimeout));
  }
}

// Run Playwright tests
function runPlaywrightTests() {
  console.log('Running Playwright tests...');
  
  try {
    execSync('npx playwright test', { stdio: 'inherit', timeout: config.testTimeout });
    console.log('Playwright tests completed successfully');
    return true;
  } catch (error) {
    console.error('Error running Playwright tests:', error.message);
    return false;
  }
}

// Generate dashboard
function generateDashboard() {
  console.log('Generating dashboard...');
  
  try {
    execSync('node test-dashboard/generate-dashboard.js', { stdio: 'inherit' });
    console.log('Dashboard generated successfully');
    return true;
  } catch (error) {
    console.error('Error generating dashboard:', error.message);
    return false;
  }
}

// Open dashboard in browser
function openDashboard() {
  const dashboardPath = path.join(config.dashboardDir, 'dashboard', 'index.html');
  
  if (fs.existsSync(dashboardPath)) {
    console.log(`Opening dashboard: ${dashboardPath}`);
    
    // Open dashboard in default browser
    const open = (process.platform === 'win32') ? 'start' : (process.platform === 'darwin' ? 'open' : 'xdg-open');
    execSync(`${open} "${dashboardPath}"`);
  } else {
    console.error(`Dashboard file not found: ${dashboardPath}`);
  }
}

// Main function
async function main() {
  console.log('Starting test dashboard generation...');
  
  // Ensure server is running
  await ensureServerRunning();
  
  // Run Playwright tests
  const testsSucceeded = runPlaywrightTests();
  
  // Generate dashboard
  const dashboardGenerated = generateDashboard();
  
  // Open dashboard in browser
  if (dashboardGenerated) {
    openDashboard();
  }
  
  console.log('Test dashboard generation completed');
}

// Run the script
main().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});
