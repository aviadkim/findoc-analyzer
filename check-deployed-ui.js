const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Main function
async function main() {
  console.log('Checking deployed UI fixes...');
  
  // Launch browser
  const browser = await puppeteer.launch({ 
    headless: false,
    defaultViewport: null,
    args: ['--start-maximized']
  });
  
  const page = await browser.newPage();
  
  // Create screenshots directory
  const screenshotsDir = path.join(__dirname, 'deployed-ui-check');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir);
  }
  
  try {
    // Check upload page
    console.log('Checking upload page...');
    await page.goto('https://backv2-app-brfi73d4ra-zf.a.run.app/upload', { waitUntil: 'networkidle2' });
    await page.screenshot({ path: path.join(screenshotsDir, '01-upload-page.png'), fullPage: true });
    
    // Check if process button exists
    const processButton = await page.$('#process-document-btn');
    console.log(`Process button exists: ${!!processButton}`);
    
    // Check if chat button exists
    const chatButton = await page.$('#show-chat-btn');
    console.log(`Chat button exists: ${!!chatButton}`);
    
    // Check if document chat container exists
    const chatContainer = await page.$('#document-chat-container');
    console.log(`Document chat container exists: ${!!chatContainer}`);
    
    // Check if login form exists
    const loginForm = await page.$('#login-form');
    console.log(`Login form exists: ${!!loginForm}`);
    
    // Check if Google login button exists
    const googleLoginButton = await page.$('#google-login-btn');
    console.log(`Google login button exists: ${!!googleLoginButton}`);
    
    // Check test page
    console.log('Checking test page...');
    await page.goto('https://backv2-app-brfi73d4ra-zf.a.run.app/test', { waitUntil: 'networkidle2' });
    await page.screenshot({ path: path.join(screenshotsDir, '02-test-page.png'), fullPage: true });
    
    // Check if agent cards exist
    const agentCards = await page.$('.agent-card');
    console.log(`Agent cards exist: ${!!agentCards}`);
    
    // Check if status indicators exist
    const statusIndicators = await page.$('.status-indicator');
    console.log(`Status indicators exist: ${!!statusIndicators}`);
    
    // Check if agent action buttons exist
    const agentActionButtons = await page.$('.agent-action');
    console.log(`Agent action buttons exist: ${!!agentActionButtons}`);
    
    console.log('UI check completed!');
    console.log(`Screenshots saved to ${screenshotsDir}`);
    
  } catch (error) {
    console.error('Error during UI check:', error);
  } finally {
    // Wait for user to press a key
    console.log('\nPress any key to close the browser...');
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.on('data', () => {
      browser.close();
      process.exit(0);
    });
  }
}

// Run the check
main().catch(console.error);
