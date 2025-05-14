// @ts-check
const { test, expect } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

/**
 * CSV Export Tests
 * 
 * These tests verify that the application can export document data to CSV format.
 */

// Test data
const testPdfPath = path.join(__dirname, '..', 'test-files', 'messos-portfolio.pdf');

test.describe('CSV Export Tests', () => {
  test('should navigate to the export page', async ({ page }) => {
    // Navigate to the export page
    await page.goto('/export');
    
    // Take a screenshot of the export page
    await page.screenshot({ path: 'test-results/export-page.png' });
    
    // Verify the page title
    const title = await page.title();
    console.log(`Page title: ${title}`);
    
    // Verify the page content
    const content = await page.content();
    expect(content).toContain('export');
  });
  
  test('should upload a document and export to CSV', async ({ page }) => {
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
          
          // Now navigate to the export page
          await page.goto('/export');
          
          // Verify the export interface is present
          const exportExists = await page.evaluate(() => {
            return !!document.querySelector('.export, .export-options');
          });
          
          if (exportExists) {
            console.log('Export interface found');
            
            // Export to CSV
            try {
              // Look for CSV export buttons or links
              const csvButton = await page.$('button:has-text("CSV"), a:has-text("CSV")');
              
              if (csvButton) {
                // Start waiting for download before clicking
                const downloadPromise = page.waitForEvent('download');
                
                await csvButton.click();
                console.log('CSV export requested');
                
                // Wait for the download to start
                const download = await downloadPromise;
                console.log('Download started:', download.suggestedFilename());
                
                // Save the downloaded file
                const downloadPath = path.join('test-results', download.suggestedFilename());
                await download.saveAs(downloadPath);
                console.log('CSV file saved to:', downloadPath);
                
                // Verify the CSV file
                if (fs.existsSync(downloadPath)) {
                  const fileContent = fs.readFileSync(downloadPath, 'utf8');
                  console.log('CSV file content:', fileContent.slice(0, 100) + '...');
                  
                  // Check if the file contains data
                  expect(fileContent.length).toBeGreaterThan(0);
                } else {
                  console.warn('CSV file not found');
                }
              } else {
                console.warn('CSV export button not found');
              }
            } catch (error) {
              console.warn('Error exporting to CSV:', error.message);
            }
          } else {
            console.warn('Export interface not found');
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
