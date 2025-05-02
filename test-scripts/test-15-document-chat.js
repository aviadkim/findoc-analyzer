/**
 * Test 15: Document Chat Interface
 *
 * This script tests the document chat interface of the FinDoc Analyzer website.
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// Configuration
const config = {
  url: 'https://findoc-deploy.ey.r.appspot.com/',
  screenshotsDir: path.join(__dirname, 'screenshots'),
  headless: false,
  slowMo: 100
};

// Create screenshots directory if it doesn't exist
fs.mkdirSync(config.screenshotsDir, { recursive: true });

/**
 * Run the test
 */
async function runTest() {
  console.log('Starting Test 15: Document Chat Interface...');

  // Initialize results
  const results = {
    testId: 'Test-15',
    testName: 'Document Chat Interface',
    date: new Date().toISOString(),
    steps: [],
    issues: [],
    screenshots: [],
    overallStatus: 'Pass'
  };

  // Launch browser
  const browser = await chromium.launch({
    headless: config.headless,
    slowMo: config.slowMo
  });

  // Create context and page
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Step 1: Open the website
    console.log('Step 1: Opening the website...');

    await page.goto(config.url);

    // Take screenshot
    const screenshotPath1 = path.join(config.screenshotsDir, 'test-15-step-01.png');
    await page.screenshot({ path: screenshotPath1 });
    results.screenshots.push('test-15-step-01.png');

    results.steps.push({
      step: 1,
      description: 'Open the website',
      expectedResult: 'Website loads successfully',
      actualResult: 'Website loaded successfully',
      status: 'Pass'
    });

    // Step 2: Navigate to Document Chat
    console.log('Step 2: Navigating to Document Chat...');

    const documentChatLink = await page.isVisible('text=Document Chat');

    if (documentChatLink) {
      await page.click('text=Document Chat');
    } else {
      // Try alternative navigation methods
      const sidebarLinks = await page.$$('nav a');
      let chatLinkFound = false;

      for (const link of sidebarLinks) {
        const text = await link.textContent();
        if (text.includes('Chat') || text.includes('Document Chat')) {
          await link.click();
          chatLinkFound = true;
          break;
        }
      }

      if (!chatLinkFound) {
        throw new Error('Document Chat link not found');
      }
    }

    // Wait for navigation
    await page.waitForTimeout(2000);

    // Take screenshot
    const screenshotPath2 = path.join(config.screenshotsDir, 'test-15-step-02.png');
    await page.screenshot({ path: screenshotPath2 });
    results.screenshots.push('test-15-step-02.png');

    // Check if we're on the chat page
    const chatPageVisible = await page.isVisible('text=/Chat|Document Chat|Ask/i');

    results.steps.push({
      step: 2,
      description: 'Navigate to Document Chat',
      expectedResult: 'Document Chat page loads',
      actualResult: chatPageVisible
        ? 'Document Chat page loaded'
        : 'Failed to navigate to Document Chat page',
      status: chatPageVisible ? 'Pass' : 'Fail'
    });

    if (!chatPageVisible) {
      results.issues.push('Failed to navigate to Document Chat page');
      results.overallStatus = 'Fail';
      throw new Error('Failed to navigate to Document Chat page');
    }

    // Step 3: Check if chat interface is visible
    console.log('Step 3: Checking if chat interface is visible...');

    // Look for chat input field
    const chatInputVisible = await page.isVisible('input[type="text"]') ||
                             await page.isVisible('textarea');

    // Take screenshot
    const screenshotPath3 = path.join(config.screenshotsDir, 'test-15-step-03.png');
    await page.screenshot({ path: screenshotPath3 });
    results.screenshots.push('test-15-step-03.png');

    results.steps.push({
      step: 3,
      description: 'Check if chat interface is visible',
      expectedResult: 'Chat input field is visible',
      actualResult: chatInputVisible
        ? 'Chat input field is visible'
        : 'Chat input field is not visible',
      status: chatInputVisible ? 'Pass' : 'Fail'
    });

    if (!chatInputVisible) {
      results.issues.push('Chat input field is not visible');
      results.overallStatus = 'Fail';
    }

    // Step 4: Check if document selection is available
    console.log('Step 4: Checking if document selection is available...');

    // Check for document selection with multiple selectors
    console.log('Checking for document selection with multiple selectors...');
    const documentSelectionSelectors = [
      'select',
      '[role="combobox"]',
      'text=/Select Document|Choose Document/i',
      '.document-selector',
      '[aria-label="Select Document"]',
      'button:has-text("Select")',
      '.document-dropdown',
      '#documentSelector',
      '[data-testid="document-selector"]',
      '.document-list',
      '.chat-document-selector'
    ];

    let documentSelectionVisible = false;
    let documentSelectionSelector = '';

    for (const selector of documentSelectionSelectors) {
      const isVisible = await page.isVisible(selector).catch(() => false);
      console.log(`- ${selector}: ${isVisible}`);

      if (isVisible) {
        documentSelectionVisible = true;
        documentSelectionSelector = selector;
        break;
      }
    }

    // Take screenshot
    const screenshotPath4 = path.join(config.screenshotsDir, 'test-15-step-04.png');
    await page.screenshot({ path: screenshotPath4 });
    results.screenshots.push('test-15-step-04.png');

    results.steps.push({
      step: 4,
      description: 'Check if document selection is available',
      expectedResult: 'Document selection is available',
      actualResult: documentSelectionVisible
        ? `Document selection is available (selector: ${documentSelectionSelector})`
        : 'Document selection is not available with any of the tried selectors',
      status: documentSelectionVisible ? 'Pass' : 'Fail'
    });

    if (!documentSelectionVisible) {
      results.issues.push('Document selection is not available with any of the tried selectors');
      // This is not a critical failure, so we don't change the overall status
      console.log('Document selection is not available, but this is not a critical failure. Continuing test...');
    }

    // Step 5: Check if there are any documents available
    console.log('Step 5: Checking if there are any documents available...');

    // This is a complex check that depends on the UI implementation
    // We'll look for document names or empty state messages
    const documentsAvailable = await page.isVisible('text=/No documents|No documents available/i') === false ||
                               await page.$$('select option').then(options => options.length > 1);

    // Take screenshot
    const screenshotPath5 = path.join(config.screenshotsDir, 'test-15-step-05.png');
    await page.screenshot({ path: screenshotPath5 });
    results.screenshots.push('test-15-step-05.png');

    results.steps.push({
      step: 5,
      description: 'Check if there are any documents available',
      expectedResult: 'Documents are available for chat',
      actualResult: documentsAvailable
        ? 'Documents are available'
        : 'No documents are available',
      status: 'Info' // This is informational, not a pass/fail
    });

    // Step 6: Try to type a question
    console.log('Step 6: Trying to type a question...');

    if (chatInputVisible) {
      // Find the input field
      const inputField = await page.$('input[type="text"]') ||
                         await page.$('textarea');

      if (inputField) {
        await inputField.fill('What is this document about?');

        // Check if text was entered
        const textEntered = await inputField.inputValue() === 'What is this document about?';

        // Take screenshot
        const screenshotPath6 = path.join(config.screenshotsDir, 'test-15-step-06.png');
        await page.screenshot({ path: screenshotPath6 });
        results.screenshots.push('test-15-step-06.png');

        results.steps.push({
          step: 6,
          description: 'Try to type a question',
          expectedResult: 'Question text can be entered',
          actualResult: textEntered
            ? 'Question text was entered successfully'
            : 'Failed to enter question text',
          status: textEntered ? 'Pass' : 'Fail'
        });

        if (!textEntered) {
          results.issues.push('Failed to enter question text');
          results.overallStatus = 'Fail';
        }
      } else {
        results.steps.push({
          step: 6,
          description: 'Try to type a question',
          expectedResult: 'Question text can be entered',
          actualResult: 'Could not find input field to type question',
          status: 'Fail'
        });

        results.issues.push('Could not find input field to type question');
        results.overallStatus = 'Fail';
      }
    } else {
      results.steps.push({
        step: 6,
        description: 'Try to type a question',
        expectedResult: 'Question text can be entered',
        actualResult: 'Chat input field is not visible',
        status: 'Fail'
      });

      results.issues.push('Chat input field is not visible');
      results.overallStatus = 'Fail';
    }

    // Step 7: Check for send button
    console.log('Step 7: Checking for send button...');

    // Look for send button
    const sendButtonVisible = await page.isVisible('button:has-text("Send")') ||
                              await page.isVisible('button:has-text("Ask")') ||
                              await page.isVisible('button[type="submit"]');

    // Take screenshot
    const screenshotPath7 = path.join(config.screenshotsDir, 'test-15-step-07.png');
    await page.screenshot({ path: screenshotPath7 });
    results.screenshots.push('test-15-step-07.png');

    results.steps.push({
      step: 7,
      description: 'Check for send button',
      expectedResult: 'Send button is visible',
      actualResult: sendButtonVisible
        ? 'Send button is visible'
        : 'Send button is not visible',
      status: sendButtonVisible ? 'Pass' : 'Fail'
    });

    if (!sendButtonVisible) {
      results.issues.push('Send button is not visible');
      results.overallStatus = 'Fail';
    }

  } catch (error) {
    console.error('Test failed:', error);

    results.steps.push({
      step: results.steps.length + 1,
      description: 'Unexpected error',
      expectedResult: 'No errors',
      actualResult: `Error: ${error.message}`,
      status: 'Fail'
    });

    results.issues.push(`Unexpected error: ${error.message}`);
    results.overallStatus = 'Fail';

    // Take error screenshot
    const screenshotPath = path.join(config.screenshotsDir, 'test-15-error.png');
    await page.screenshot({ path: screenshotPath });
    results.screenshots.push('test-15-error.png');
  } finally {
    // Close browser
    await browser.close();
  }

  // Save results
  const resultsPath = path.join(__dirname, 'results', 'test-15-results.json');
  fs.mkdirSync(path.dirname(resultsPath), { recursive: true });
  fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));

  console.log(`Test completed with status: ${results.overallStatus}`);
  console.log(`Results saved to: ${resultsPath}`);

  return results;
}

// Run the test if this script is executed directly
if (require.main === module) {
  runTest().catch(console.error);
}

module.exports = runTest;
