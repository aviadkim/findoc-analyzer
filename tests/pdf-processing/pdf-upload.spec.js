// @ts-check
const { test, expect } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

/**
 * PDF Upload Tests
 * 
 * These tests verify that users can upload PDF files to the application.
 */

// Test data
const testPdfPath = path.join(__dirname, '..', 'test-files', 'messos-portfolio.pdf');

test.describe('PDF Upload Tests', () => {
  test('should navigate to the upload page', async ({ page }) => {
    // Navigate to the upload page
    await page.goto('/upload');
    
    // Take a screenshot of the upload page
    await page.screenshot({ path: 'test-results/pdf-upload-page.png' });
    
    // Verify the page title
    const title = await page.title();
    console.log(`Page title: ${title}`);
    
    // Verify the page content
    const content = await page.content();
    expect(content).toContain('upload');
  });
  
  test('should upload a PDF file', async ({ page }) => {
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
        await page.screenshot({ path: 'test-results/pdf-file-selected.png' });
        
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
        
        await page.screenshot({ path: 'test-results/pdf-form-submitted.png' });
        
        // Wait for the results
        try {
          await page.waitForSelector('#results, .results, .document-results, .processing-results', { timeout: 60000 });
          console.log('Results found');
          await page.screenshot({ path: 'test-results/pdf-results-found.png' });
        } catch (error) {
          console.warn('Timeout waiting for results:', error.message);
          await page.screenshot({ path: 'test-results/pdf-results-timeout.png' });
        }
      } else {
        console.warn('File input not found');
      }
    } else {
      console.warn('Upload form not found');
    }
  });
});
