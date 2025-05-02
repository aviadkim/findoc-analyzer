/**
 * FinDoc Analyzer Navigation Tests
 * 
 * This script tests the navigation of the FinDoc Analyzer application.
 */

const { TestRunner, config } = require('./puppeteer-test-framework');
const fs = require('fs');
const path = require('path');

// Pages to test
const pages = [
  { path: '/', name: 'Dashboard' },
  { path: '/documents-new', name: 'Documents' },
  { path: '/analytics-new', name: 'Analytics' },
  { path: '/feedback', name: 'Feedback' },
  { path: '/document-comparison', name: 'Document Comparison' },
  { path: '/upload', name: 'Upload' }
];

// Navigation tests
const navigationTests = [
  // Sidebar navigation tests
  {
    name: 'Sidebar Navigation Links Test',
    test: async (page, runner) => {
      await runner.navigateTo('/');
      
      // Check if sidebar navigation exists
      const sidebarNavExists = await runner.elementExists('.sidebar-nav');
      if (!sidebarNavExists) {
        throw new Error('Sidebar navigation does not exist');
      }
      
      // Check if sidebar links exist
      const sidebarLinks = await page.$$('.sidebar-nav a');
      if (sidebarLinks.length === 0) {
        throw new Error('Sidebar links do not exist');
      }
      
      // Check each sidebar link
      for (const link of sidebarLinks) {
        const href = await page.evaluate(el => el.getAttribute('href'), link);
        const text = await page.evaluate(el => el.innerText.trim(), link);
        
        // Check if href is valid
        if (!href || href === '#') {
          throw new Error(`Sidebar link "${text}" has an invalid href: ${href}`);
        }
        
        // Check if text is valid
        if (!text) {
          throw new Error(`Sidebar link has no text. Href: ${href}`);
        }
      }
    }
  },
  
  // Active link tests
  {
    name: 'Active Link Test',
    test: async (page, runner) => {
      // Test each page
      for (const pageInfo of pages) {
        await runner.navigateTo(pageInfo.path);
        
        // Check if the correct link is active
        const activeLinks = await page.$$('.sidebar-nav a.active');
        
        // There should be exactly one active link
        if (activeLinks.length !== 1) {
          throw new Error(`Expected 1 active link, found ${activeLinks.length} on page ${pageInfo.path}`);
        }
        
        // The active link should have the correct href
        const activeHref = await page.evaluate(el => el.getAttribute('href'), activeLinks[0]);
        if (activeHref !== pageInfo.path) {
          throw new Error(`Active link href is ${activeHref}, expected ${pageInfo.path}`);
        }
        
        // Take a screenshot
        await runner.takeScreenshot(`active-link-${pageInfo.path.replace(/[^a-zA-Z0-9]/g, '-')}`);
      }
    }
  },
  
  // Navigation click tests
  {
    name: 'Navigation Click Test',
    test: async (page, runner) => {
      await runner.navigateTo('/');
      
      // Test navigation to each page by clicking the sidebar links
      for (const pageInfo of pages) {
        // Find the link with the correct href
        const linkSelector = `.sidebar-nav a[href="${pageInfo.path}"]`;
        const linkExists = await runner.elementExists(linkSelector);
        
        if (!linkExists) {
          throw new Error(`Link with href ${pageInfo.path} does not exist`);
        }
        
        // Click the link
        await runner.clickElement(linkSelector);
        
        // Check if we navigated to the correct page
        const url = page.url();
        if (!url.endsWith(pageInfo.path)) {
          throw new Error(`Navigation failed. Expected URL to end with ${pageInfo.path}, got ${url}`);
        }
        
        // Check if the correct content is displayed
        const pageContentExists = await runner.elementExists('#page-content');
        if (!pageContentExists) {
          throw new Error(`Page content does not exist on page ${pageInfo.path}`);
        }
        
        // Take a screenshot
        await runner.takeScreenshot(`navigation-to-${pageInfo.path.replace(/[^a-zA-Z0-9]/g, '-')}`);
      }
    }
  },
  
  // Action button navigation tests
  {
    name: 'Action Button Navigation Test',
    test: async (page, runner) => {
      // Test navigation from documents page to upload page
      await runner.navigateTo('/documents-new');
      
      // Check if upload button exists
      const uploadButtonExists = await runner.elementExists('.upload-btn');
      if (!uploadButtonExists) {
        throw new Error('Upload button does not exist on documents page');
      }
      
      // Click the upload button
      await runner.clickElement('.upload-btn');
      
      // Check if we navigated to the upload page
      const url = page.url();
      if (!url.endsWith('/upload')) {
        throw new Error(`Navigation failed. Expected URL to end with /upload, got ${url}`);
      }
      
      // Check if the upload page content is displayed
      const uploadPageExists = await runner.elementExists('.upload-page');
      if (!uploadPageExists) {
        throw new Error('Upload page content does not exist');
      }
      
      // Take a screenshot
      await runner.takeScreenshot('navigation-to-upload');
    }
  },
  
  // Action button click tests
  {
    name: 'Action Button Click Test',
    test: async (page, runner) => {
      // Test clicking action buttons on documents page
      await runner.navigateTo('/documents-new');
      
      // Check if action buttons exist
      const actionButtonsExist = await runner.elementExists('.action-buttons');
      if (!actionButtonsExist) {
        throw new Error('Action buttons do not exist on documents page');
      }
      
      // Get all action buttons
      const actionButtons = await page.$$('.action-btn');
      if (actionButtons.length === 0) {
        throw new Error('No action buttons found on documents page');
      }
      
      // Click each action button
      for (let i = 0; i < actionButtons.length; i++) {
        const buttonText = await page.evaluate(el => el.innerText.trim(), actionButtons[i]);
        
        // Set up dialog handler
        page.on('dialog', async dialog => {
          // Check if the dialog message contains the button text
          const message = dialog.message();
          if (!message.includes(buttonText)) {
            throw new Error(`Dialog message "${message}" does not contain button text "${buttonText}"`);
          }
          
          // Accept the dialog
          await dialog.accept();
        });
        
        // Click the button
        await actionButtons[i].click();
        
        // Take a screenshot
        await runner.takeScreenshot(`action-button-click-${i}`);
      }
    }
  }
];

/**
 * Run the navigation tests
 */
async function runNavigationTests() {
  const runner = new TestRunner();
  
  try {
    await runner.init();
    
    // Run navigation tests
    for (const test of navigationTests) {
      await runner.runTest(test.name, test.test);
    }
    
    // Generate report
    const reportPath = await runner.generateReport();
    
    // Open report in browser
    console.log(`Navigation tests completed. Report saved to: ${reportPath}`);
    console.log(`Open the report in your browser: file://${reportPath}`);
  } catch (error) {
    console.error('Error running navigation tests:', error);
  } finally {
    await runner.close();
  }
}

// Run the tests
runNavigationTests();
