/**
 * Test UI After Deployment
 * 
 * This script tests the UI of the FinDoc Analyzer application after deployment using Puppeteer.
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Configuration
const config = {
  url: 'https://findoc-deploy.ey.r.appspot.com',
  screenshotsDir: path.join(__dirname, 'screenshots-after-deploy'),
  timeout: 30000 // 30 seconds
};

// Create screenshots directory if it doesn't exist
if (!fs.existsSync(config.screenshotsDir)) {
  fs.mkdirSync(config.screenshotsDir, { recursive: true });
}

/**
 * Take a screenshot
 * @param {object} page - Puppeteer page
 * @param {string} name - Screenshot name
 * @returns {Promise<void>}
 */
async function takeScreenshot(page, name) {
  const screenshotPath = path.join(config.screenshotsDir, `${name}.png`);
  await page.screenshot({ path: screenshotPath, fullPage: true });
  console.log(`Screenshot saved: ${screenshotPath}`);
}

/**
 * Run the tests
 */
async function runTests() {
  console.log('Starting UI tests after deployment...');
  
  // Launch browser
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    // Create a new page
    const page = await browser.newPage();
    
    // Set viewport
    await page.setViewport({ width: 1280, height: 800 });
    
    // Navigate to the application
    console.log(`Navigating to ${config.url}...`);
    await page.goto(config.url, { timeout: config.timeout, waitUntil: 'networkidle2' });
    
    // Take a screenshot of the homepage
    await takeScreenshot(page, '01-homepage-after-deploy');
    
    // Log the title
    const title = await page.title();
    console.log(`Page title: ${title}`);
    
    // Check if the sidebar is visible
    const sidebarExists = await page.evaluate(() => {
      return !!document.querySelector('.sidebar');
    });
    
    console.log(`Sidebar exists: ${sidebarExists}`);
    
    if (sidebarExists) {
      // Get all navigation items
      const navItems = await page.evaluate(() => {
        const items = Array.from(document.querySelectorAll('.sidebar-nav li'));
        return items.map(item => item.textContent.trim());
      });
      
      console.log('Navigation items:', navItems);
      
      // Take a screenshot of the sidebar
      await page.evaluate(() => {
        const sidebar = document.querySelector('.sidebar');
        if (sidebar) {
          sidebar.style.border = '2px solid red';
        }
      });
      
      await takeScreenshot(page, '02-sidebar-after-deploy');
      
      // Click on the Documents link
      console.log('Clicking on Documents link...');
      const documentsLink = await page.evaluate(() => {
        const links = Array.from(document.querySelectorAll('.sidebar-nav li a'));
        const documentsLink = links.find(link => link.textContent.includes('Documents'));
        if (documentsLink) {
          documentsLink.click();
          return true;
        }
        return false;
      });
      
      if (documentsLink) {
        // Use setTimeout instead of waitForTimeout
        await new Promise(resolve => setTimeout(resolve, 2000));
        await takeScreenshot(page, '03-documents-page-after-deploy');
        
        // Get the current URL
        const url = page.url();
        console.log(`Current URL: ${url}`);
      } else {
        console.log('Documents link not found');
      }
      
      // Click on the Analytics link
      console.log('Clicking on Analytics link...');
      const analyticsLink = await page.evaluate(() => {
        const links = Array.from(document.querySelectorAll('.sidebar-nav li a'));
        const analyticsLink = links.find(link => link.textContent.includes('Analytics'));
        if (analyticsLink) {
          analyticsLink.click();
          return true;
        }
        return false;
      });
      
      if (analyticsLink) {
        // Use setTimeout instead of waitForTimeout
        await new Promise(resolve => setTimeout(resolve, 2000));
        await takeScreenshot(page, '04-analytics-page-after-deploy');
        
        // Get the current URL
        const url = page.url();
        console.log(`Current URL: ${url}`);
      } else {
        console.log('Analytics link not found');
      }
    }
    
    // Check if the upload button is visible
    const uploadButtonExists = await page.evaluate(() => {
      return !!document.querySelector('a.upload-btn, button.upload-btn');
    });
    
    console.log(`Upload button exists: ${uploadButtonExists}`);
    
    if (uploadButtonExists) {
      // Take a screenshot of the upload button
      await page.evaluate(() => {
        const uploadBtn = document.querySelector('a.upload-btn, button.upload-btn');
        if (uploadBtn) {
          uploadBtn.style.border = '2px solid red';
        }
      });
      
      await takeScreenshot(page, '05-upload-button-after-deploy');
      
      // Click on the upload button
      console.log('Clicking on Upload Document button...');
      const uploadButtonClicked = await page.evaluate(() => {
        const uploadBtn = document.querySelector('a.upload-btn, button.upload-btn');
        if (uploadBtn) {
          uploadBtn.click();
          return true;
        }
        return false;
      });
      
      if (uploadButtonClicked) {
        // Use setTimeout instead of waitForTimeout
        await new Promise(resolve => setTimeout(resolve, 2000));
        await takeScreenshot(page, '06-upload-page-after-deploy');
        
        // Get the current URL
        const url = page.url();
        console.log(`Current URL: ${url}`);
      } else {
        console.log('Failed to click upload button');
      }
    }
    
    console.log('UI tests after deployment completed.');
  } catch (error) {
    console.error('Error during UI tests:', error);
  } finally {
    // Close browser
    await browser.close();
  }
}

// Run the tests
runTests();
