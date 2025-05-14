/**
 * Basic Test
 * 
 * This script runs a basic test to verify the core functionality of the FinDoc Analyzer application.
 */

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

// Configuration
const config = {
  baseUrl: 'http://localhost:8080',
  testFilesDir: path.join(__dirname, 'test-files'),
  screenshotsDir: path.join(__dirname, 'test-screenshots'),
  headless: false,
  timeout: 30000
};

// Create screenshots directory if it doesn't exist
try {
  fs.mkdirSync(config.screenshotsDir, { recursive: true });
} catch (error) {
  console.warn(`Error creating directory ${config.screenshotsDir}:`, error);
}

/**
 * Run the test
 */
async function runTest() {
  let browser;
  
  try {
    console.log('Starting basic test...');
    
    // Launch browser
    browser = await puppeteer.launch({
      headless: config.headless,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    // Create a new page
    const page = await browser.newPage();
    
    // Set viewport
    await page.setViewport({ width: 1280, height: 800 });
    
    // Set timeout
    page.setDefaultTimeout(config.timeout);
    
    // Navigate to the upload page
    console.log('Navigating to the upload page...');
    await page.goto(`${config.baseUrl}/upload`, { waitUntil: 'networkidle2' });
    await page.screenshot({ path: path.join(config.screenshotsDir, 'basic-01-upload-page.png') });
    
    // Check if the upload form exists
    const formExists = await page.evaluate(() => {
      return !!document.querySelector('form');
    });
    
    if (formExists) {
      console.log('Upload form found');
    } else {
      console.warn('Upload form not found');
      throw new Error('Upload form not found');
    }
    
    // Upload a PDF file
    console.log('Uploading a PDF file...');
    
    const testPdfPath = path.join(config.testFilesDir, 'test-portfolio.pdf');
    
    if (fs.existsSync(testPdfPath)) {
      const input = await page.$('input[type="file"]');
      
      if (input) {
        await input.uploadFile(testPdfPath);
        console.log('File selected');
        await page.screenshot({ path: path.join(config.screenshotsDir, 'basic-02-file-selected.png') });
      } else {
        console.warn('File input not found');
        throw new Error('File input not found');
      }
      
      // Submit the form
      console.log('Submitting the form...');
      
      try {
        await page.click('button[type="submit"]');
      } catch (error) {
        console.warn('Could not click submit button, trying to submit the form directly');
        
        await page.evaluate(() => {
          const form = document.querySelector('form');
          if (form) {
            form.submit();
          }
        });
      }
      
      await page.screenshot({ path: path.join(config.screenshotsDir, 'basic-03-form-submitted.png') });
      
      // Wait for the results
      console.log('Waiting for the results...');
      
      try {
        await page.waitForSelector('#results.show, .results, .document-results, .processing-results', { timeout: config.timeout });
        console.log('Results found');
        await page.screenshot({ path: path.join(config.screenshotsDir, 'basic-04-results-found.png') });
      } catch (error) {
        console.warn('Timeout waiting for results, checking if they exist anyway');
        
        const resultsExist = await page.evaluate(() => {
          return !!document.querySelector('#results') || 
                 !!document.querySelector('.results') || 
                 !!document.querySelector('.document-results') || 
                 !!document.querySelector('.processing-results');
        });
        
        if (resultsExist) {
          console.log('Results exist even though waitForSelector timed out');
          await page.screenshot({ path: path.join(config.screenshotsDir, 'basic-04-results-exist.png') });
        } else {
          console.warn('Results not found');
          await page.screenshot({ path: path.join(config.screenshotsDir, 'basic-04-results-not-found.png') });
          throw new Error('Results not found');
        }
      }
      
      // Check if tables are displayed
      console.log('Checking if tables are displayed...');
      
      const tablesExist = await page.evaluate(() => {
        return !!document.querySelector('table') || 
               !!document.querySelector('.table') || 
               !!document.querySelector('.tables-section');
      });
      
      if (tablesExist) {
        console.log('Tables found');
      } else {
        console.warn('Tables not found');
      }
      
      // Check if securities are displayed
      console.log('Checking if securities are displayed...');
      
      const securitiesExist = await page.evaluate(() => {
        return !!document.querySelector('.securities') || 
               !!document.querySelector('.securities-section');
      });
      
      if (securitiesExist) {
        console.log('Securities found');
      } else {
        console.warn('Securities not found');
      }
      
      console.log('Basic test completed successfully');
    } else {
      console.error(`Test PDF file not found: ${testPdfPath}`);
      throw new Error(`Test PDF file not found: ${testPdfPath}`);
    }
  } catch (error) {
    console.error('Error running basic test:', error);
    throw error;
  } finally {
    // Close the browser
    if (browser) {
      await browser.close();
    }
  }
}

// Run the test
runTest()
  .then(() => {
    console.log('Test completed successfully');
    process.exit(0);
  })
  .catch(error => {
    console.error('Test failed:', error);
    process.exit(1);
  });
