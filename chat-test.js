/**
 * FinDoc Analyzer Chat Test
 *
 * This script tests the document chat functionality of the FinDoc Analyzer application.
 */

const { MicroTestRunner } = require('./micro-test-framework');
const path = require('path');
const fs = require('fs');

// Test questions to ask
const testQuestions = [
  "What is the total value of the portfolio?",
  "List all securities in the portfolio with their ISINs",
  "What is the asset allocation of the portfolio?",
  "What is the performance of the portfolio?",
  "What are the top 5 holdings by value?"
];

/**
 * Run the chat test
 */
async function runChatTest() {
  const runner = new MicroTestRunner();

  try {
    await runner.init();

    // Test 1: Chat page loads
    await runner.runTest('Chat Page Loads', async (runner) => {
      await runner.navigateTo('/document-chat');

      // Check if the page title contains "FinDoc" or "Chat"
      const title = await runner.page.title();
      if (!title.includes('FinDoc') && !title.includes('Chat')) {
        throw new Error(`Page title does not contain "FinDoc" or "Chat": ${title}`);
      }

      // Check if the chat interface exists
      const chatInterfaceExists = await runner.elementExists('#chat-container, .chat-container');
      if (!chatInterfaceExists) {
        throw new Error('Chat interface not found on chat page');
      }

      // Check if the document select exists
      const documentSelectExists = await runner.elementExists('#document-select, select');
      if (!documentSelectExists) {
        throw new Error('Document select not found on chat page');
      }

      // Check if the question input exists
      const questionInputExists = await runner.elementExists('#question-input, input[type="text"], textarea');
      if (!questionInputExists) {
        throw new Error('Question input not found on chat page');
      }

      // Check if the send button exists
      const sendButtonExists = await runner.elementExists('#send-btn, button[type="submit"]');
      if (!sendButtonExists) {
        throw new Error('Send button not found on chat page');
      }
    });

    // Test 2: Document selection
    await runner.runTest('Document Selection', async (runner) => {
      await runner.navigateTo('/document-chat');

      // Check if document select exists
      const documentSelectExists = await runner.elementExists('#document-select, select');
      if (!documentSelectExists) {
        throw new Error('Document select not found on chat page');
      }

      // Get the document options
      const documentOptions = await runner.page.evaluate(() => {
        const select = document.querySelector('#document-select, select');
        if (!select) return [];
        return Array.from(select.options).map(option => ({
          value: option.value,
          text: option.textContent
        }));
      });

      console.log(`Document options: ${JSON.stringify(documentOptions)}`);

      if (documentOptions.length <= 1) {
        console.warn('No document options found in the select');
      } else {
        // Select the first document
        const firstDocumentValue = documentOptions[1].value;
        await runner.page.select('#document-select, select', firstDocumentValue);
        console.log(`Selected document: ${documentOptions[1].text} (${firstDocumentValue})`);

        // Take a screenshot after selection
        await runner.takeScreenshot('document-selected');

        // Check if the question input is enabled
        const isQuestionInputEnabled = await runner.page.evaluate(() => {
          const input = document.querySelector('#question-input, input[type="text"], textarea');
          return input && !input.disabled;
        });

        if (isQuestionInputEnabled) {
          console.log('Question input is enabled after document selection');
        } else {
          console.warn('Question input is still disabled after document selection');
          
          // Try to enable the input
          await runner.page.evaluate(() => {
            const input = document.querySelector('#question-input, input[type="text"], textarea');
            if (input) input.disabled = false;
          });
        }
      }
    });

    // Test 3: Ask questions
    await runner.runTest('Ask Questions', async (runner) => {
      await runner.navigateTo('/document-chat');

      // Select the first document
      const documentOptions = await runner.page.evaluate(() => {
        const select = document.querySelector('#document-select, select');
        if (!select) return [];
        return Array.from(select.options).map(option => ({
          value: option.value,
          text: option.textContent
        }));
      });

      if (documentOptions.length <= 1) {
        throw new Error('No document options found in the select');
      }

      // Select the first document
      const firstDocumentValue = documentOptions[1].value;
      await runner.page.select('#document-select, select', firstDocumentValue);
      console.log(`Selected document: ${documentOptions[1].text} (${firstDocumentValue})`);

      // Enable the question input if it's disabled
      await runner.page.evaluate(() => {
        const input = document.querySelector('#question-input, input[type="text"], textarea');
        if (input) input.disabled = false;
      });

      // Ask each test question
      for (let i = 0; i < testQuestions.length; i++) {
        const question = testQuestions[i];
        console.log(`Asking question ${i + 1}: ${question}`);

        // Type the question
        await runner.typeText('#question-input, input[type="text"], textarea', question);

        // Enable the send button if it's disabled
        await runner.page.evaluate(() => {
          const button = document.querySelector('#send-btn, button[type="submit"]');
          if (button) button.disabled = false;
        });

        // Click the send button
        await runner.clickElement('#send-btn, button[type="submit"]');

        // Wait for the response
        console.log('Waiting for response...');
        await runner.wait(5000);

        // Take a screenshot after response
        await runner.takeScreenshot(`question-${i + 1}-response`);

        // Check if there's a response
        const responseExists = await runner.elementExists('.message.ai-message, .response, .answer');
        if (responseExists) {
          const responseText = await runner.getElementText('.message.ai-message, .response, .answer');
          console.log(`Response: ${responseText.substring(0, 100)}...`);
        } else {
          console.warn('No response found for the question');
        }

        // Wait a bit before asking the next question
        await runner.wait(2000);
      }
    });

    // Generate report
    const reportPath = await runner.generateReport();
    console.log(`Test report saved to: ${reportPath}`);

    return reportPath;
  } finally {
    await runner.close();
  }
}

// Run the test if this script is executed directly
if (require.main === module) {
  runChatTest()
    .then(reportPath => {
      console.log(`Chat test completed. Report saved to: ${reportPath}`);
      process.exit(0);
    })
    .catch(error => {
      console.error('Chat test failed:', error);
      process.exit(1);
    });
}

module.exports = {
  runChatTest
};
