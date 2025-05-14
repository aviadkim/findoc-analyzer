/**
 * Upload UI Component Test
 * Tests for the presence and functionality of upload UI components
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Test configuration
const config = {
  url: process.env.TEST_URL || 'http://localhost:8081',
  path: '/upload',
  components: [
    { name: 'Upload Container', selector: '.upload-container' },
    { name: 'Upload Form', selector: 'form' },
    { name: 'File Input', selector: 'input[type="file"]' },
    { name: 'Document Type Select', selector: 'select[name="documentType"]' },
    { name: 'Upload Button', selector: 'button[type="submit"]' },
    { name: 'Process Button', selector: '#process-document-btn' }
  ],
  screenshotsDir: path.join(__dirname, '../../test-results/screenshots/upload')
};

// Create screenshots directory
if (!fs.existsSync(config.screenshotsDir)) {
  fs.mkdirSync(config.screenshotsDir, { recursive: true });
}

// Run the test
async function runTest() {
  console.log(`Testing Upload UI Components at ${config.url}${config.path}...`);
  
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const results = {
    page: 'Upload',
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
      path: path.join(config.screenshotsDir, 'upload-full.png'),
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
    
    // Test form functionality
    if (results.components['Upload Form'].exists && 
        results.components['File Input'].exists && 
        results.components['Document Type Select'].exists) {
      console.log('Testing form functionality...');
      
      // Create a test file
      const testFilePath = path.join(__dirname, '../../test-results/test-file.pdf');
      if (!fs.existsSync(testFilePath)) {
        // Create a simple PDF-like content (not a real PDF)
        fs.writeFileSync(testFilePath, '%PDF-1.5\nTest PDF file for upload testing\n%%EOF');
        console.log('Created test file for upload');
      }
      
      // Set file input
      const fileInput = await page.$('input[type="file"]');
      if (fileInput) {
        try {
          await fileInput.uploadFile(testFilePath);
          console.log('✅ Uploaded test file');
          
          // Select document type
          await page.select('select[name="documentType"]', 'financial');
          console.log('✅ Selected document type');
          
          // Check if we can submit the form
          const submitButton = await page.$('button[type="submit"]');
          if (submitButton) {
            const isDisabled = await page.evaluate(button => button.disabled, submitButton);
            if (!isDisabled) {
              console.log('✅ Submit button is enabled');
              results.formFunctionality = {
                success: true
              };
            } else {
              console.log('❌ Submit button is disabled');
              results.formFunctionality = {
                success: false,
                error: 'Submit button is disabled'
              };
            }
          } else {
            console.log('❌ Could not find submit button');
            results.formFunctionality = {
              success: false,
              error: 'Could not find submit button'
            };
          }
        } catch (error) {
          console.log('❌ Error uploading file: ' + error.message);
          results.formFunctionality = {
            success: false,
            error: error.message
          };
        }
      } else {
        console.log('❌ Could not find file input element');
        results.formFunctionality = {
          success: false,
          error: 'Could not find file input element'
        };
      }
    } else {
      console.log('❌ Cannot test form functionality because required components are missing');
      results.formFunctionality = {
        success: false,
        error: 'Required components are missing'
      };
    }
    
    // Set overall success
    results.success = results.found === results.total;
    if (results.formFunctionality && !results.formFunctionality.success) {
      results.success = false;
    }
    
  } catch (error) {
    console.error(`Error testing upload page: ${error.message}`);
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
    path.join(resultsDir, 'upload-test-results.json'),
    JSON.stringify(results, null, 2)
  );
  
  console.log(`Upload test completed. Found ${results.found}/${results.total} components.`);
  console.log(`Success: ${results.success}`);
  
  return results;
}

// Run the test if this file is executed directly
if (require.main === module) {
  runTest().catch(console.error);
}

module.exports = runTest;
