/**
 * Documents UI Component Test
 * Tests for the presence and functionality of documents UI components
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Test configuration
const config = {
  url: process.env.TEST_URL || 'http://localhost:8081',
  path: '/documents-new',
  components: [
    { name: 'Documents Container', selector: '.documents-container' },
    { name: 'Documents Header', selector: '.documents-header' },
    { name: 'Documents Filters', selector: '.documents-filters' },
    { name: 'Document List', selector: '#document-list' },
    { name: 'Document Item', selector: '.document-item' },
    { name: 'Document Actions', selector: '.document-actions' }
  ],
  screenshotsDir: path.join(__dirname, '../../test-results/screenshots/documents')
};

// Create screenshots directory
if (!fs.existsSync(config.screenshotsDir)) {
  fs.mkdirSync(config.screenshotsDir, { recursive: true });
}

// Run the test
async function runTest() {
  console.log(`Testing Documents UI Components at ${config.url}${config.path}...`);
  
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const results = {
    page: 'Documents',
    url: `${config.url}${config.path}`,
    components: {},
    total: config.components.length,
    found: 0,
    missing: 0,
    success: false
  };
  
  try {
    const page = await browser.newPage();
    await page.goto(`${config.url}${config.path}`, { waitUntil: 'networkidle2', timeout: 30000 });
    
    // Take a screenshot of the full page
    await page.screenshot({ 
      path: path.join(config.screenshotsDir, 'documents-full.png'),
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
    
    // Test document actions functionality
    if (results.components['Document Actions'].exists) {
      console.log('Testing document actions functionality...');
      
      // Test view button
      const viewButton = await page.$('.document-actions .btn-secondary, .document-actions .btn-view');
      if (viewButton) {
        console.log('Testing view button...');
        
        // Get the current URL
        const currentUrl = page.url();
        
        // Click the view button
        await viewButton.click();
        
        // Wait for navigation
        try {
          await page.waitForNavigation({ timeout: 5000 });
          
          // Check if the URL changed
          const newUrl = page.url();
          if (newUrl !== currentUrl) {
            console.log(`✅ View button click navigated to: ${newUrl}`);
            results.viewButtonClick = {
              success: true,
              url: newUrl
            };
          } else {
            console.log('❌ View button click did not navigate to a new page');
            results.viewButtonClick = {
              success: false,
              error: 'No navigation occurred'
            };
          }
        } catch (error) {
          console.log(`❌ View button click navigation failed: ${error.message}`);
          results.viewButtonClick = {
            success: false,
            error: error.message
          };
        }
      } else {
        console.log('❌ No view button found to test functionality');
        results.viewButtonClick = {
          success: false,
          error: 'No view button found'
        };
      }
    }
    
    // Set overall success
    results.success = results.found === results.total;
    
  } catch (error) {
    console.error(`Error testing documents page: ${error.message}`);
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
    path.join(resultsDir, 'documents-test-results.json'),
    JSON.stringify(results, null, 2)
  );
  
  console.log(`Documents test completed. Found ${results.found}/${results.total} components.`);
  console.log(`Success: ${results.success}`);
  
  return results;
}

// Run the test if this file is executed directly
if (require.main === module) {
  runTest().catch(console.error);
}

module.exports = runTest;
