/**
 * Dashboard UI Component Test
 * Tests for the presence and functionality of dashboard UI components
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Test configuration
const config = {
  url: process.env.TEST_URL || 'http://localhost:8081',
  components: [
    { name: 'Dashboard Container', selector: '.dashboard-container' },
    { name: 'Dashboard Header', selector: '.dashboard-header' },
    { name: 'Dashboard Stats', selector: '.dashboard-stats' },
    { name: 'Recent Documents', selector: '.recent-documents' },
    { name: 'Quick Upload', selector: '.quick-upload' },
    { name: 'Features', selector: '.features' }
  ],
  screenshotsDir: path.join(__dirname, '../../test-results/screenshots/dashboard')
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
    url: config.url,
    components: {},
    total: config.components.length,
    found: 0,
    missing: 0,
    success: false
  };
  
  try {
    const page = await browser.newPage();
    await page.goto(config.url, { waitUntil: 'networkidle2', timeout: 30000 });
    
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
    
    // Test document card click functionality
    if (results.components['Recent Documents'].exists) {
      console.log('Testing document card click functionality...');
      
      // Click on the first document card
      const documentCard = await page.$('.document-card');
      if (documentCard) {
        // Get the current URL
        const currentUrl = page.url();
        
        // Click the document card
        await documentCard.click();
        
        // Wait for navigation
        try {
          await page.waitForNavigation({ timeout: 5000 });
          
          // Check if the URL changed
          const newUrl = page.url();
          if (newUrl !== currentUrl) {
            console.log(`✅ Document card click navigated to: ${newUrl}`);
            results.documentCardClick = {
              success: true,
              url: newUrl
            };
          } else {
            console.log('❌ Document card click did not navigate to a new page');
            results.documentCardClick = {
              success: false,
              error: 'No navigation occurred'
            };
          }
        } catch (error) {
          console.log(`❌ Document card click navigation failed: ${error.message}`);
          results.documentCardClick = {
            success: false,
            error: error.message
          };
        }
      } else {
        console.log('❌ No document card found to test click functionality');
        results.documentCardClick = {
          success: false,
          error: 'No document card found'
        };
      }
    }
    
    // Set overall success
    results.success = results.found === results.total;
    
  } catch (error) {
    console.error(`Error testing dashboard: ${error.message}`);
    results.error = error.message;
  } finally {
    await browser.close();
  }
  
  // Save results
  const resultsDir = path.join(__dirname, '../../test-results');
  if (!fs.existsSync(resultsDir)) {
    fs.mkdirSync(resultsDir, { recursive: true });
  }
  
  fs.writeFileSync(
    path.join(resultsDir, 'dashboard-test-results.json'),
    JSON.stringify(results, null, 2)
  );
  
  console.log(`Dashboard test completed. Found ${results.found}/${results.total} components.`);
  console.log(`Success: ${results.success}`);
  
  return results;
}

// Run the test if this file is executed directly
if (require.main === module) {
  runTest().catch(console.error);
}

module.exports = runTest;
