/**
 * FinDoc Analyzer Interactive Element Tests
 * 
 * This script tests the interactive elements of the FinDoc Analyzer application.
 */

const { TestRunner, config } = require('./puppeteer-test-framework');
const fs = require('fs');
const path = require('path');

// Interactive element tests
const interactiveElementTests = [
  // Button tests
  {
    name: 'Button Click Test',
    test: async (page, runner) => {
      await runner.navigateTo('/feedback');
      
      // Check if rating buttons exist
      const ratingButtonsExist = await runner.elementExists('.rating-btn');
      if (!ratingButtonsExist) {
        throw new Error('Rating buttons do not exist on feedback page');
      }
      
      // Get all rating buttons
      const ratingButtons = await page.$$('.rating-btn');
      if (ratingButtons.length === 0) {
        throw new Error('No rating buttons found on feedback page');
      }
      
      // Click each rating button and check if it becomes active
      for (let i = 0; i < ratingButtons.length; i++) {
        // Click the button
        await ratingButtons[i].click();
        
        // Wait for the active class to be applied
        await page.waitForTimeout(100);
        
        // Check if the button has the active class
        const isActive = await page.evaluate(el => el.classList.contains('active'), ratingButtons[i]);
        if (!isActive) {
          throw new Error(`Rating button ${i + 1} did not become active after clicking`);
        }
        
        // Check if other buttons are not active
        for (let j = 0; j < ratingButtons.length; j++) {
          if (j !== i) {
            const otherIsActive = await page.evaluate(el => el.classList.contains('active'), ratingButtons[j]);
            if (otherIsActive) {
              throw new Error(`Rating button ${j + 1} is active when it should not be`);
            }
          }
        }
        
        // Take a screenshot
        await runner.takeScreenshot(`rating-button-${i + 1}`);
      }
    }
  },
  
  // Form input tests
  {
    name: 'Form Input Test',
    test: async (page, runner) => {
      await runner.navigateTo('/feedback');
      
      // Check if form inputs exist
      const nameInputExists = await runner.elementExists('#name');
      if (!nameInputExists) {
        throw new Error('Name input does not exist on feedback page');
      }
      
      const emailInputExists = await runner.elementExists('#email');
      if (!emailInputExists) {
        throw new Error('Email input does not exist on feedback page');
      }
      
      const messageInputExists = await runner.elementExists('#message');
      if (!messageInputExists) {
        throw new Error('Message input does not exist on feedback page');
      }
      
      // Type in the name input
      await runner.typeText('#name', 'Test User');
      
      // Check if the name input has the correct value
      const nameValue = await page.evaluate(() => document.querySelector('#name').value);
      if (nameValue !== 'Test User') {
        throw new Error(`Name input value is "${nameValue}", expected "Test User"`);
      }
      
      // Type in the email input
      await runner.typeText('#email', 'test@example.com');
      
      // Check if the email input has the correct value
      const emailValue = await page.evaluate(() => document.querySelector('#email').value);
      if (emailValue !== 'test@example.com') {
        throw new Error(`Email input value is "${emailValue}", expected "test@example.com"`);
      }
      
      // Type in the message input
      await runner.typeText('#message', 'This is a test message');
      
      // Check if the message input has the correct value
      const messageValue = await page.evaluate(() => document.querySelector('#message').value);
      if (messageValue !== 'This is a test message') {
        throw new Error(`Message input value is "${messageValue}", expected "This is a test message"`);
      }
      
      // Take a screenshot
      await runner.takeScreenshot('form-inputs');
    }
  },
  
  // Select tests
  {
    name: 'Select Option Test',
    test: async (page, runner) => {
      await runner.navigateTo('/feedback');
      
      // Check if feedback type select exists
      const feedbackTypeSelectExists = await runner.elementExists('#feedbackType');
      if (!feedbackTypeSelectExists) {
        throw new Error('Feedback type select does not exist on feedback page');
      }
      
      // Get all options
      const options = await page.evaluate(() => {
        const select = document.querySelector('#feedbackType');
        return Array.from(select.options).map(option => option.value);
      });
      
      if (options.length === 0) {
        throw new Error('No options found in feedback type select');
      }
      
      // Select each option and check if it's selected
      for (const option of options) {
        // Select the option
        await runner.selectOption('#feedbackType', option);
        
        // Check if the option is selected
        const selectedValue = await page.evaluate(() => document.querySelector('#feedbackType').value);
        if (selectedValue !== option) {
          throw new Error(`Selected value is "${selectedValue}", expected "${option}"`);
        }
        
        // Take a screenshot
        await runner.takeScreenshot(`select-option-${option}`);
      }
    }
  },
  
  // Form submission test
  {
    name: 'Form Submission Test',
    test: async (page, runner) => {
      await runner.navigateTo('/feedback');
      
      // Fill out the form
      await runner.typeText('#name', 'Test User');
      await runner.typeText('#email', 'test@example.com');
      await runner.selectOption('#feedbackType', 'feature');
      
      // Click a rating button
      await runner.clickElement('.rating-btn:nth-child(4)');
      
      // Type in the message input
      await runner.typeText('#message', 'This is a test message');
      
      // Set up dialog handler
      page.on('dialog', async dialog => {
        // Check if the dialog message is correct
        const message = dialog.message();
        if (message !== 'Form submitted successfully!') {
          throw new Error(`Dialog message is "${message}", expected "Form submitted successfully!"`);
        }
        
        // Accept the dialog
        await dialog.accept();
      });
      
      // Submit the form
      await runner.clickElement('.submit-btn');
      
      // Take a screenshot
      await runner.takeScreenshot('form-submission');
    }
  },
  
  // Upload page tests
  {
    name: 'Upload Page Interaction Test',
    test: async (page, runner) => {
      await runner.navigateTo('/upload');
      
      // Check if upload area exists
      const uploadAreaExists = await runner.elementExists('.upload-area');
      if (!uploadAreaExists) {
        throw new Error('Upload area does not exist on upload page');
      }
      
      // Check if document type select exists
      const documentTypeSelectExists = await runner.elementExists('#document-type');
      if (!documentTypeSelectExists) {
        throw new Error('Document type select does not exist on upload page');
      }
      
      // Select a document type
      await runner.selectOption('#document-type', 'portfolio');
      
      // Check if the option is selected
      const selectedValue = await page.evaluate(() => document.querySelector('#document-type').value);
      if (selectedValue !== 'portfolio') {
        throw new Error(`Selected value is "${selectedValue}", expected "portfolio"`);
      }
      
      // Check if checkboxes exist
      const extractTextCheckboxExists = await runner.elementExists('#extract-text');
      if (!extractTextCheckboxExists) {
        throw new Error('Extract text checkbox does not exist on upload page');
      }
      
      // Check if the checkbox is checked
      const isChecked = await page.evaluate(() => document.querySelector('#extract-text').checked);
      if (!isChecked) {
        throw new Error('Extract text checkbox is not checked by default');
      }
      
      // Click the checkbox to uncheck it
      await runner.clickElement('#extract-text');
      
      // Check if the checkbox is unchecked
      const isUnchecked = await page.evaluate(() => !document.querySelector('#extract-text').checked);
      if (!isUnchecked) {
        throw new Error('Extract text checkbox did not uncheck after clicking');
      }
      
      // Take a screenshot
      await runner.takeScreenshot('upload-page-interaction');
    }
  },
  
  // Document comparison page tests
  {
    name: 'Document Comparison Page Interaction Test',
    test: async (page, runner) => {
      await runner.navigateTo('/document-comparison');
      
      // Check if document selection exists
      const documentSelectionExists = await runner.elementExists('.document-selection');
      if (!documentSelectionExists) {
        throw new Error('Document selection does not exist on document comparison page');
      }
      
      // Check if document list exists
      const documentListExists = await runner.elementExists('.document-list');
      if (!documentListExists) {
        throw new Error('Document list does not exist on document comparison page');
      }
      
      // Check if document items exist
      const documentItemExists = await runner.elementExists('.document-item');
      if (!documentItemExists) {
        throw new Error('Document items do not exist on document comparison page');
      }
      
      // Click a document item
      await runner.clickElement('.document-item:nth-child(1)');
      
      // Check if compare button exists
      const compareButtonExists = await runner.elementExists('.compare-btn');
      if (!compareButtonExists) {
        throw new Error('Compare button does not exist on document comparison page');
      }
      
      // Click the compare button
      await runner.clickElement('.compare-btn');
      
      // Take a screenshot
      await runner.takeScreenshot('document-comparison-interaction');
    }
  }
];

/**
 * Run the interactive element tests
 */
async function runInteractiveElementTests() {
  const runner = new TestRunner();
  
  try {
    await runner.init();
    
    // Run interactive element tests
    for (const test of interactiveElementTests) {
      await runner.runTest(test.name, test.test);
    }
    
    // Generate report
    const reportPath = await runner.generateReport();
    
    // Open report in browser
    console.log(`Interactive element tests completed. Report saved to: ${reportPath}`);
    console.log(`Open the report in your browser: file://${reportPath}`);
  } catch (error) {
    console.error('Error running interactive element tests:', error);
  } finally {
    await runner.close();
  }
}

// Run the tests
runInteractiveElementTests();
