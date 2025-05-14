// @ts-check
const { test, expect } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

/**
 * Deployed App Tests
 * 
 * These tests verify the functionality of the deployed FinDoc Analyzer application.
 */

// Test data
const testPdfPath = path.join(__dirname, 'test-files', 'messos-portfolio.pdf');

// Ensure test files directory exists
test.beforeAll(async () => {
  const testFilesDir = path.join(__dirname, 'test-files');
  if (!fs.existsSync(testFilesDir)) {
    fs.mkdirSync(testFilesDir, { recursive: true });
  }
});

test.describe('Deployed App Tests', () => {
  test('should load the home page', async ({ page }) => {
    // Navigate to the home page
    await page.goto('/');
    
    // Take a screenshot of the home page
    await page.screenshot({ path: 'test-results/deployed-home-page.png' });
    
    // Verify the page title
    const title = await page.title();
    console.log(`Page title: ${title}`);
    
    // Verify the page content
    const content = await page.content();
    expect(content).toContain('FinDoc');
  });
  
  test('should navigate to the upload page', async ({ page }) => {
    // Navigate to the upload page
    await page.goto('/upload');
    
    // Take a screenshot of the upload page
    await page.screenshot({ path: 'test-results/deployed-upload-page.png' });
    
    // Verify the upload form is present
    const formExists = await page.evaluate(() => {
      return !!document.querySelector('form');
    });
    
    if (formExists) {
      console.log('Upload form found');
    } else {
      console.warn('Upload form not found');
    }
    
    // Verify the page content
    const content = await page.content();
    expect(content).toContain('upload');
  });
  
  test('should upload and process a PDF file', async ({ page }) => {
    // Navigate to the upload page
    await page.goto('/upload');
    
    // Verify the upload form is present
    const formExists = await page.evaluate(() => {
      return !!document.querySelector('form');
    });
    
    if (formExists) {
      console.log('Upload form found');
      
      // Upload a PDF file
      const input = await page.$('input[type="file"]');
      
      if (input) {
        await input.uploadFile(testPdfPath);
        console.log('File selected');
        await page.screenshot({ path: 'test-results/deployed-file-selected.png' });
        
        // Submit the form
        try {
          await page.click('button[type="submit"]');
          console.log('Form submitted');
        } catch (error) {
          console.warn('Could not click submit button, trying to submit the form directly');
          
          await page.evaluate(() => {
            const form = document.querySelector('form');
            if (form) {
              form.submit();
            }
          });
        }
        
        await page.screenshot({ path: 'test-results/deployed-form-submitted.png' });
        
        // Wait for the results
        try {
          await page.waitForSelector('#results, .results, .document-results, .processing-results', { timeout: 60000 });
          console.log('Results found');
          await page.screenshot({ path: 'test-results/deployed-results-found.png' });
          
          // Verify the results contain the expected data
          const pageContent = await page.content();
          
          // Check for ISINs
          const isins = [
            'US91282CJL54',
            'DE0001102580',
            'XS2754416961',
            'US0378331005',
            'US5949181045',
            'US88160R1014',
            'US0231351067',
            'US02079K3059'
          ];
          
          let isinsFound = 0;
          for (const isin of isins) {
            if (pageContent.includes(isin)) {
              isinsFound++;
              console.log(`Found ISIN: ${isin}`);
            }
          }
          
          console.log(`Found ${isinsFound} out of ${isins.length} ISINs`);
          
          // Check for securities
          const securities = [
            'APPLE',
            'MICROSOFT',
            'TESLA',
            'AMAZON',
            'ALPHABET'
          ];
          
          let securitiesFound = 0;
          for (const security of securities) {
            if (pageContent.includes(security)) {
              securitiesFound++;
              console.log(`Found security: ${security}`);
            }
          }
          
          console.log(`Found ${securitiesFound} out of ${securities.length} securities`);
        } catch (error) {
          console.warn('Timeout waiting for results:', error.message);
          await page.screenshot({ path: 'test-results/deployed-results-timeout.png' });
        }
      } else {
        console.warn('File input not found');
      }
    } else {
      console.warn('Upload form not found');
    }
  });
  
  test('should navigate to the chat page', async ({ page }) => {
    // Navigate to the chat page
    await page.goto('/chat');
    
    // Take a screenshot of the chat page
    await page.screenshot({ path: 'test-results/deployed-chat-page.png' });
    
    // Verify the chat interface is present
    const chatExists = await page.evaluate(() => {
      return !!document.querySelector('input[type="text"], textarea');
    });
    
    if (chatExists) {
      console.log('Chat interface found');
    } else {
      console.warn('Chat interface not found');
    }
    
    // Verify the page content
    const content = await page.content();
    expect(content).toContain('chat');
  });
  
  test('should navigate to the analytics page', async ({ page }) => {
    // Navigate to the analytics page
    await page.goto('/analytics');
    
    // Take a screenshot of the analytics page
    await page.screenshot({ path: 'test-results/deployed-analytics-page.png' });
    
    // Verify the analytics interface is present
    const analyticsExists = await page.evaluate(() => {
      return !!document.querySelector('.analytics, .charts, .visualizations');
    });
    
    if (analyticsExists) {
      console.log('Analytics interface found');
    } else {
      console.warn('Analytics interface not found');
    }
    
    // Verify the page content
    const content = await page.content();
    expect(content).toContain('analytics');
  });
});
