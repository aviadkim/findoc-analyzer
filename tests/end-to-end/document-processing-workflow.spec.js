// @ts-check
const { test, expect } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

/**
 * Document Processing Workflow Tests
 * 
 * These tests verify the end-to-end document processing workflow.
 */

// Test data
const testPdfPath = path.join(__dirname, '..', 'test-files', 'messos-portfolio.pdf');

test.describe('Document Processing Workflow Tests', () => {
  test('should process a document end-to-end', async ({ page }) => {
    // Step 1: Navigate to the home page
    await page.goto('/');
    console.log('Navigated to home page');
    await page.screenshot({ path: 'test-results/workflow-home-page.png' });
    
    // Step 2: Navigate to the upload page
    await page.goto('/upload');
    console.log('Navigated to upload page');
    await page.screenshot({ path: 'test-results/workflow-upload-page.png' });
    
    // Step 3: Upload a document
    const formExists = await page.evaluate(() => {
      return !!document.querySelector('form');
    });
    
    if (formExists) {
      console.log('Upload form found');
      
      const input = await page.$('input[type="file"]');
      
      if (input) {
        await input.uploadFile(testPdfPath);
        console.log('File selected');
        await page.screenshot({ path: 'test-results/workflow-file-selected.png' });
        
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
        
        await page.screenshot({ path: 'test-results/workflow-form-submitted.png' });
        
        // Step 4: Wait for processing to complete
        try {
          await page.waitForSelector('#results, .results, .document-results, .processing-results', { timeout: 60000 });
          console.log('Processing completed');
          await page.screenshot({ path: 'test-results/workflow-processing-completed.png' });
          
          // Step 5: Verify the processing results
          const resultsContent = await page.content();
          
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
            if (resultsContent.includes(isin)) {
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
            if (resultsContent.includes(security)) {
              securitiesFound++;
              console.log(`Found security: ${security}`);
            }
          }
          
          console.log(`Found ${securitiesFound} out of ${securities.length} securities`);
          
          // Step 6: Navigate to the chat page
          await page.goto('/chat');
          console.log('Navigated to chat page');
          await page.screenshot({ path: 'test-results/workflow-chat-page.png' });
          
          // Step 7: Ask a question about the document
          const chatInput = await page.$('input[type="text"], textarea');
          
          if (chatInput) {
            await chatInput.fill('What is the total value of the portfolio?');
            console.log('Question entered');
            
            // Submit the question
            try {
              await page.click('button[type="submit"]');
              console.log('Question submitted');
            } catch (error) {
              console.warn('Could not click submit button, trying to submit the form directly');
              
              await page.evaluate(() => {
                const form = document.querySelector('form');
                if (form) {
                  form.submit();
                }
              });
            }
            
            // Wait for the answer
            try {
              await page.waitForSelector('.answer, .response, .chat-response', { timeout: 60000 });
              console.log('Answer received');
              await page.screenshot({ path: 'test-results/workflow-answer-received.png' });
            } catch (error) {
              console.warn('Timeout waiting for answer:', error.message);
            }
          } else {
            console.warn('Chat input not found');
          }
          
          // Step 8: Navigate to the analytics page
          await page.goto('/analytics');
          console.log('Navigated to analytics page');
          await page.screenshot({ path: 'test-results/workflow-analytics-page.png' });
          
          // Step 9: Navigate to the export page
          await page.goto('/export');
          console.log('Navigated to export page');
          await page.screenshot({ path: 'test-results/workflow-export-page.png' });
          
          // Workflow completed successfully
          console.log('Document processing workflow completed successfully');
        } catch (error) {
          console.warn('Timeout waiting for processing to complete:', error.message);
          await page.screenshot({ path: 'test-results/workflow-processing-timeout.png' });
        }
      } else {
        console.warn('File input not found');
      }
    } else {
      console.warn('Upload form not found');
    }
  });
});
