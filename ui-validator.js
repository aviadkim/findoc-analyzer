// ui-validator.js - Script to detect missing UI elements using Puppeteer directly
const puppeteer = require('puppeteer');

async function validateInterface(deployedUrl, expectedElements) {
  console.log(`Validating interface at: ${deployedUrl}`);

  // Launch browser
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    // Create a new page
    const page = await browser.newPage();

    // Navigate to the URL
    console.log(`Navigating to ${deployedUrl}...`);
    await page.goto(deployedUrl, { waitUntil: 'networkidle2', timeout: 60000 });

    // Analyze DOM for missing elements
    const missingElements = [];
    const foundElements = [];

    for (const element of expectedElements) {
      console.log(`Checking for element: ${element.description} (${element.selector})`);

      try {
        // Check if the element exists
        const elementHandle = await page.$(element.selector);

        if (!elementHandle) {
          console.log(`Element not found: ${element.description}`);
          missingElements.push({
            element: element.description,
            selector: element.selector,
            expectedLocation: element.location
          });
        } else {
          console.log(`Element found: ${element.description}`);
          foundElements.push({
            element: element.description,
            selector: element.selector,
            location: element.location
          });

          // Release the element handle
          await elementHandle.dispose();
        }
      } catch (error) {
        console.error(`Error checking element ${element.description}:`, error);
        missingElements.push({
          element: element.description,
          selector: element.selector,
          expectedLocation: element.location,
          error: error.message
        });
      }
    }

    // Generate report
    return {
      url: deployedUrl,
      timestamp: new Date().toISOString(),
      totalExpectedElements: expectedElements.length,
      foundElements: foundElements,
      missingElements: missingElements,
      complete: missingElements.length === 0
    };
  } finally {
    // Close the browser
    await browser.close();
  }
}

module.exports = { validateInterface };
