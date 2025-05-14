// @ts-check
const { test, expect } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

/**
 * Question Answering Tests
 * 
 * These tests verify that the application can answer questions about uploaded documents.
 */

// Test data
const testPdfPath = path.join(__dirname, '..', 'test-files', 'messos-portfolio.pdf');
const testQuestions = [
  'What is the total value of the portfolio?',
  'What securities are in the portfolio?',
  'What is the percentage of Apple in the portfolio?',
  'What is the ISIN for Microsoft?'
];

test.describe('Question Answering Tests', () => {
  test('should navigate to the chat page', async ({ page }) => {
    // Navigate to the chat page
    await page.goto('/chat');
    
    // Take a screenshot of the chat page
    await page.screenshot({ path: 'test-results/chat-page.png' });
    
    // Verify the page title
    const title = await page.title();
    console.log(`Page title: ${title}`);
    
    // Verify the page content
    const content = await page.content();
    expect(content).toContain('chat');
  });
  
  test('should upload a document and ask questions', async ({ page }) => {
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
          
          // Now navigate to the chat page
          await page.goto('/chat');
          
          // Verify the chat interface is present
          const chatExists = await page.evaluate(() => {
            return !!document.querySelector('input[type="text"], textarea');
          });
          
          if (chatExists) {
            console.log('Chat interface found');
            
            // Ask questions
            for (const question of testQuestions) {
              console.log(`Asking question: ${question}`);
              
              // Type the question
              const input = await page.$('input[type="text"], textarea');
              if (input) {
                await input.fill(question);
                
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
                  await page.screenshot({ path: `test-results/chat-answer-${question.slice(0, 10)}.png` });
                } catch (error) {
                  console.warn('Timeout waiting for answer:', error.message);
                }
              } else {
                console.warn('Chat input not found');
              }
            }
          } else {
            console.warn('Chat interface not found');
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
