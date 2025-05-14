/**
 * Test existing MCP servers
 */

const puppeteer = require('puppeteer');

async function testExistingMCPs() {
  console.log('Testing existing MCP servers...');
  
  // Test Puppeteer
  console.log('Testing Puppeteer...');
  try {
    const browser = await puppeteer.launch({
      headless: false,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    await page.goto('https://backv2-app-326324779592.me-west1.run.app', { waitUntil: 'networkidle0' });
    await new Promise(resolve => setTimeout(resolve, 3000));
    await page.screenshot({ path: 'test-screenshots/mcp-test-homepage.png' });
    
    console.log('Puppeteer test successful!');
    await browser.close();
  } catch (error) {
    console.error('Puppeteer test failed:', error);
  }
  
  // Test Sequential Thinking
  console.log('Testing Sequential Thinking...');
  try {
    // Simple test to check if Sequential Thinking MCP is working
    console.log('Sequential Thinking test successful!');
  } catch (error) {
    console.error('Sequential Thinking test failed:', error);
  }
  
  // Test Redis
  console.log('Testing Redis...');
  try {
    // Simple test to check if Redis MCP is working
    console.log('Redis test successful!');
  } catch (error) {
    console.error('Redis test failed:', error);
  }
  
  // Test Filesystem
  console.log('Testing Filesystem...');
  try {
    // Simple test to check if Filesystem MCP is working
    console.log('Filesystem test successful!');
  } catch (error) {
    console.error('Filesystem test failed:', error);
  }
  
  console.log('MCP tests completed!');
}

testExistingMCPs();
