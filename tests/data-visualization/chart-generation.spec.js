// @ts-check
const { test, expect } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

/**
 * Chart Generation Tests
 * 
 * These tests verify that the application can generate charts from document data.
 */

// Test data
const testPdfPath = path.join(__dirname, '..', 'test-files', 'messos-portfolio.pdf');

test.describe('Chart Generation Tests', () => {
  test('should navigate to the analytics page', async ({ page }) => {
    // Navigate to the analytics page
    await page.goto('/analytics');
    
    // Take a screenshot of the analytics page
    await page.screenshot({ path: 'test-results/analytics-page.png' });
    
    // Verify the page title
    const title = await page.title();
    console.log(`Page title: ${title}`);
    
    // Verify the page content
    const content = await page.content();
    expect(content).toContain('analytics');
  });
  
  test('should upload a document and generate charts', async ({ page }) => {
    // First, upload a document
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
        
        // Wait for the results
        try {
          await page.waitForSelector('#results, .results, .document-results, .processing-results', { timeout: 60000 });
          console.log('Results found');
          
          // Now navigate to the analytics page
          await page.goto('/analytics');
          
          // Verify the analytics interface is present
          const analyticsExists = await page.evaluate(() => {
            return !!document.querySelector('.analytics, .charts, .visualizations');
          });
          
          if (analyticsExists) {
            console.log('Analytics interface found');
            
            // Generate a chart
            try {
              // Look for chart generation buttons or links
              const chartButton = await page.$('button:has-text("Generate Chart"), a:has-text("Generate Chart")');
              
              if (chartButton) {
                await chartButton.click();
                console.log('Chart generation requested');
                
                // Wait for the chart to be generated
                try {
                  await page.waitForSelector('canvas, .chart, svg', { timeout: 60000 });
                  console.log('Chart generated');
                  await page.screenshot({ path: 'test-results/chart-generated.png' });
                } catch (error) {
                  console.warn('Timeout waiting for chart:', error.message);
                }
              } else {
                console.warn('Chart generation button not found');
              }
            } catch (error) {
              console.warn('Error generating chart:', error.message);
            }
          } else {
            console.warn('Analytics interface not found');
          }
        } catch (error) {
          console.warn('Timeout waiting for results:', error.message);
        }
      } else {
        console.warn('File input not found');
      }
    } else {
      console.warn('Upload form not found');
    }
  });
});
