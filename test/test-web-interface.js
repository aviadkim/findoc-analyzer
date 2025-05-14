/**
 * Test Web Interface
 *
 * This script tests the web interface of the FinDoc Analyzer application using Puppeteer.
 */

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

// Configuration
const config = {
  baseUrl: 'http://localhost:8080',
  testFilesDir: path.join(__dirname, 'test-files'),
  screenshotsDir: path.join(__dirname, 'test-screenshots'),
  headless: false, // Set to true for headless mode
  slowMo: 50, // Slow down Puppeteer operations by 50ms
  timeout: 60000 // 60 seconds timeout
};

// Create screenshots directory if it doesn't exist
try {
  fs.mkdirSync(config.screenshotsDir, { recursive: true });
} catch (error) {
  console.warn('Error creating screenshots directory:', error);
}

/**
 * Run the test
 */
async function runTest() {
  let browser;

  try {
    console.log('Starting web interface test...');

    // Launch browser
    browser = await puppeteer.launch({
      headless: config.headless,
      slowMo: config.slowMo,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    // Create a new page
    const page = await browser.newPage();

    // Set viewport
    await page.setViewport({ width: 1280, height: 800 });

    // Set timeout
    page.setDefaultTimeout(config.timeout);

    // Navigate to the home page
    console.log('Navigating to the home page...');
    await page.goto(config.baseUrl, { waitUntil: 'networkidle2' });

    // Take a screenshot
    await page.screenshot({ path: path.join(config.screenshotsDir, '01-home-page.png') });

    // Check if the page has loaded
    const title = await page.title();
    console.log('Page title:', title);

    // Check if the sidebar is present
    const sidebarExists = await page.evaluate(() => {
      return !!document.querySelector('.sidebar');
    });

    if (sidebarExists) {
      console.log('Sidebar found');
    } else {
      console.warn('Sidebar not found');
    }

    // Navigate directly to the Upload page
    console.log('Navigating to the Upload page...');
    await page.goto(`${config.baseUrl}/upload`, { waitUntil: 'networkidle2' });

    // Take a screenshot
    await page.screenshot({ path: path.join(config.screenshotsDir, '02-documents-page.png') });

    // Check if the upload form is present
    const uploadFormExists = await page.evaluate(() => {
      return !!document.querySelector('form') || !!document.querySelector('input[type="file"]');
    });

    if (uploadFormExists) {
      console.log('Upload form found');
    } else {
      console.warn('Upload form not found');
    }

    // Try to find the file input
    const fileInputSelectors = [
      'input[type="file"]',
      'input[accept=".pdf"]',
      'input[name="file"]',
      'input[accept*="pdf"]',
      'form input[type="file"]'
    ];

    // Also try to find file inputs by looking at all inputs
    const fileInputByType = await page.evaluate(() => {
      const inputs = Array.from(document.querySelectorAll('input'));
      const fileInput = inputs.find(input =>
        input.type === 'file' ||
        (input.accept && input.accept.includes('pdf'))
      );
      return fileInput ? true : false;
    });

    if (fileInputByType) {
      console.log('Found file input by type');
    }

    let fileInputFound = false;
    let fileInputSelector = '';

    for (const selector of fileInputSelectors) {
      try {
        const fileInputExists = await page.evaluate((sel) => {
          return !!document.querySelector(sel);
        }, selector);

        if (fileInputExists) {
          console.log(`Found file input with selector: ${selector}`);
          fileInputFound = true;
          fileInputSelector = selector;
          break;
        }
      } catch (error) {
        console.warn(`Error finding file input with selector ${selector}:`, error.message);
      }
    }

    if (fileInputFound) {
      // Upload a PDF file
      console.log('Uploading a PDF file...');

      const testPdfPath = path.join(config.testFilesDir, 'test-portfolio.pdf');

      if (fs.existsSync(testPdfPath)) {
        // Use uploadFile instead of setInputFiles
        const input = await page.$(fileInputSelector);
        if (input) {
          await input.uploadFile(testPdfPath);
          console.log('File selected');
        } else {
          console.warn('Could not find file input element');
        }

        // Take a screenshot
        await page.screenshot({ path: path.join(config.screenshotsDir, '03-file-selected.png') });

        // Try to find the upload button
        const uploadButtonSelectors = [
          'button[type="submit"]',
          'button:contains("Upload")',
          'input[type="submit"]',
          'button.upload-button',
          'button.btn-primary'
        ];

        let uploadButtonClicked = false;

        for (const selector of uploadButtonSelectors) {
          try {
            const uploadButtonExists = await page.evaluate((sel) => {
              return !!document.querySelector(sel);
            }, selector);

            if (uploadButtonExists) {
              console.log(`Found upload button with selector: ${selector}`);
              await page.click(selector);
              uploadButtonClicked = true;
              break;
            }
          } catch (error) {
            console.warn(`Error clicking upload button with selector ${selector}:`, error.message);
          }
        }

        if (!uploadButtonClicked) {
          console.warn('Could not find upload button, trying to submit the form directly');

          await page.evaluate(() => {
            const form = document.querySelector('form');
            if (form) {
              form.submit();
            }
          });
        }

        // Wait for the upload to complete
        console.log('Waiting for the upload to complete...');

        try {
          await page.waitForSelector('.results, .document-results, .processing-results', { timeout: 30000 });
          console.log('Upload completed');

          // Take a screenshot
          await page.screenshot({ path: path.join(config.screenshotsDir, '04-upload-completed.png') });

          // Check if the results are displayed
          const resultsExist = await page.evaluate(() => {
            return !!document.querySelector('.results') ||
                   !!document.querySelector('.document-results') ||
                   !!document.querySelector('.processing-results');
          });

          if (resultsExist) {
            console.log('Results displayed');

            // Check if tables are displayed
            const tablesExist = await page.evaluate(() => {
              return !!document.querySelector('table') ||
                     !!document.querySelector('.table') ||
                     !!document.querySelector('.tables-section');
            });

            if (tablesExist) {
              console.log('Tables displayed');
            } else {
              console.warn('Tables not displayed');
            }

            // Check if securities are displayed
            const securitiesExist = await page.evaluate(() => {
              return !!document.querySelector('.securities') ||
                     !!document.querySelector('.securities-section');
            });

            if (securitiesExist) {
              console.log('Securities displayed');
            } else {
              console.warn('Securities not displayed');
            }
          } else {
            console.warn('Results not displayed');
          }
        } catch (error) {
          console.warn('Error waiting for upload to complete:', error.message);

          // Take a screenshot anyway
          await page.screenshot({ path: path.join(config.screenshotsDir, '04-upload-timeout.png') });
        }
      } else {
        console.error(`Test PDF file not found: ${testPdfPath}`);
      }
    } else {
      console.warn('File input not found, cannot upload PDF');
    }

    console.log('Web interface test completed');
  } catch (error) {
    console.error('Error running web interface test:', error);
  } finally {
    // Close the browser
    if (browser) {
      await browser.close();
    }
  }
}

// Run the test
runTest();
