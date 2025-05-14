/**
 * Dashboard UI Component Test
 * Tests for UI components on the dashboard page
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Test configuration
const config = {
  url: process.env.TEST_URL || 'http://localhost:8081',
  components: [
    { name: 'Recent Documents Section', selector: '.recent-documents' },
    { name: 'Quick Upload Section', selector: '.quick-upload' },
    { name: 'Features Section', selector: '.features' },
    { name: 'Navigation Bar', selector: 'nav' },
    { name: 'Footer', selector: 'footer' },
    { name: 'Chat Button', selector: '#show-chat-btn' }
  ],
  screenshotsDir: path.join(__dirname, '../results/screenshots/dashboard')
};

// Create screenshots directory
if (!fs.existsSync(config.screenshotsDir)) {
  fs.mkdirSync(config.screenshotsDir, { recursive: true });
}

// Run the test
async function runTest() {
  console.log(`Testing Dashboard UI Components at ${config.url}...`);
  
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const results = {
    page: 'Dashboard',
    url: `${config.url}/`,
    components: {},
    total: config.components.length,
    found: 0,
    missing: 0
  };
  
  try {
    const page = await browser.newPage();
    await page.goto(`${config.url}/`, { waitUntil: 'networkidle2', timeout: 30000 });
    
    // Take a screenshot of the full page
    await page.screenshot({ 
      path: path.join(config.screenshotsDir, 'dashboard-full.png'),
      fullPage: true
    });
    
    // Check each component
    for (const component of config.components) {
      const element = await page.$(component.selector);
      const exists = !!element;
      
      results.components[component.name] = {
        exists,
        selector: component.selector
      };
      
      if (exists) {
        results.found++;
        console.log(`✅ ${component.name} found`);
        
        // Take a screenshot of the component
        try {
          const clip = await page.evaluate((selector) => {
            const element = document.querySelector(selector);
            if (!element) return null;
            
            const { x, y, width, height } = element.getBoundingClientRect();
            return { x, y, width, height };
          }, component.selector);
          
          if (clip && clip.width > 0 && clip.height > 0) {
            await page.screenshot({
              path: path.join(config.screenshotsDir, `${component.name.toLowerCase().replace(/\s+/g, '-')}.png`),
              clip: {
                x: clip.x,
                y: clip.y,
                width: clip.width,
                height: clip.height
              }
            });
          }
        } catch (error) {
          console.error(`Error taking screenshot of ${component.name}: ${error.message}`);
        }
      } else {
        results.missing++;
        console.log(`❌ ${component.name} not found`);
      }
    }
    
    // Check for interactive elements
    console.log('Testing interactive elements...');
    
    // Test chat button
    const chatButton = await page.$('#show-chat-btn');
    if (chatButton) {
      console.log('Testing chat button...');
      await chatButton.click();
      
      // Wait for chat container to appear
      await page.waitForSelector('#document-chat-container', { visible: true, timeout: 5000 })
        .then(() => {
          console.log('✅ Chat container appears when chat button is clicked');
          
          // Take a screenshot of the chat container
          return page.screenshot({
            path: path.join(config.screenshotsDir, 'chat-container.png'),
            fullPage: true
          });
        })
        .catch(() => {
          console.log('❌ Chat container does not appear when chat button is clicked');
          results.interactivity = false;
        });
    }
    
    // Test navigation links
    const navLinks = await page.$$('nav a');
    if (navLinks.length > 0) {
      console.log(`Found ${navLinks.length} navigation links`);
      results.navLinks = navLinks.length;
    } else {
      console.log('❌ No navigation links found');
    }
    
  } catch (error) {
    console.error(`Error testing dashboard: ${error.message}`);
    results.error = error.message;
  } finally {
    await browser.close();
  }
  
  // Save results
  const resultsDir = path.join(__dirname, '../results');
  if (!fs.existsSync(resultsDir)) {
    fs.mkdirSync(resultsDir, { recursive: true });
  }
  
  fs.writeFileSync(
    path.join(resultsDir, 'dashboard-ui-test-results.json'),
    JSON.stringify(results, null, 2)
  );
  
  console.log(`Dashboard UI test completed. Found ${results.found}/${results.total} components.`);
  
  return results;
}

// Run the test if this file is executed directly
if (require.main === module) {
  runTest().catch(console.error);
}

module.exports = runTest;
