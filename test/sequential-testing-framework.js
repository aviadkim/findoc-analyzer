/**
 * Sequential Testing Framework for FinDoc Analyzer
 *
 * This framework provides a structured approach to testing document processing
 * using sequential thinking methodology.
 */

const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const axios = require('axios');

// Import services
const deepSeekService = require('../services/deepseek-service');

// Configuration
const config = {
  baseUrl: process.env.TEST_BASE_URL || 'http://localhost:8080',
  apiBaseUrl: process.env.TEST_API_BASE_URL || 'http://localhost:8080/api',
  testFilesDir: path.join(__dirname, 'test-files'),
  resultsDir: path.join(__dirname, 'test-results'),
  screenshotsDir: path.join(__dirname, 'test-screenshots'),
  headless: process.env.TEST_HEADLESS !== 'false',
  slowMo: parseInt(process.env.TEST_SLOW_MO || '50'),
  timeout: parseInt(process.env.TEST_TIMEOUT || '60000')
};

// Export config so it can be accessed by test scripts
module.exports.config = config;

// Create directories if they don't exist
try {
  fs.mkdirSync(config.testFilesDir, { recursive: true });
  fs.mkdirSync(config.resultsDir, { recursive: true });
  fs.mkdirSync(config.screenshotsDir, { recursive: true });
  console.log('Test directories created successfully');
} catch (error) {
  console.error('Error creating test directories:', error);
}

/**
 * Sequential Test Runner
 */
class SequentialTestRunner {
  constructor() {
    this.browser = null;
    this.context = null;
    this.page = null;
    this.testResults = {
      startTime: new Date().toISOString(),
      endTime: null,
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
      skippedTests: 0,
      tests: []
    };
  }

  /**
   * Initialize the test runner
   */
  async init() {
    this.browser = await chromium.launch({
      headless: config.headless,
      slowMo: config.slowMo
    });
    this.context = await this.browser.newContext();
    this.page = await this.context.newPage();
  }

  /**
   * Clean up resources
   */
  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
    this.browser = null;
    this.context = null;
    this.page = null;
  }

  /**
   * Run a test with sequential steps
   * @param {string} testId - Test ID
   * @param {string} testName - Test name
   * @param {Array<Function>} steps - Array of test step functions
   */
  async runTest(testId, testName, steps) {
    console.log(`\n=== Running Test: ${testId} - ${testName} ===`);

    const testResult = {
      id: testId,
      name: testName,
      status: 'pending',
      startTime: new Date().toISOString(),
      endTime: null,
      duration: 0,
      steps: [],
      error: null,
      screenshots: []
    };

    this.testResults.totalTests++;

    try {
      // Run each step sequentially
      for (let i = 0; i < steps.length; i++) {
        const stepNumber = i + 1;
        const stepName = `Step ${stepNumber}`;

        console.log(`\n--- Running ${stepName} ---`);

        const stepResult = {
          number: stepNumber,
          name: stepName,
          status: 'pending',
          startTime: new Date().toISOString(),
          endTime: null,
          duration: 0,
          error: null,
          screenshots: []
        };

        try {
          // Run the step
          await steps[i](this, stepResult);

          stepResult.status = 'passed';
          console.log(`✅ ${stepName} PASSED`);
        } catch (error) {
          stepResult.status = 'failed';
          stepResult.error = error.message;
          console.error(`❌ ${stepName} FAILED: ${error.message}`);

          // Take a screenshot on failure
          if (this.page) {
            const screenshotName = `${testId}-step-${stepNumber}-failure.png`;
            const screenshotPath = path.join(config.screenshotsDir, screenshotName);
            await this.page.screenshot({ path: screenshotPath });
            stepResult.screenshots.push(screenshotName);
          }

          // Stop the test after a failed step
          testResult.error = `Step ${stepNumber} failed: ${error.message}`;
          testResult.steps.push(stepResult);
          throw error;
        }

        stepResult.endTime = new Date().toISOString();
        stepResult.duration = new Date(stepResult.endTime) - new Date(stepResult.startTime);
        testResult.steps.push(stepResult);
      }

      testResult.status = 'passed';
      this.testResults.passedTests++;
      console.log(`✅ Test ${testId} - ${testName} PASSED`);
    } catch (error) {
      testResult.status = 'failed';
      testResult.error = error.message;
      this.testResults.failedTests++;
      console.error(`❌ Test ${testId} - ${testName} FAILED: ${error.message}`);
    }

    testResult.endTime = new Date().toISOString();
    testResult.duration = new Date(testResult.endTime) - new Date(testResult.startTime);

    this.testResults.tests.push(testResult);
    return testResult;
  }

  /**
   * Skip a test
   * @param {string} testId - Test ID
   * @param {string} testName - Test name
   * @param {string} reason - Reason for skipping
   */
  skipTest(testId, testName, reason) {
    console.log(`\n=== Skipping Test: ${testId} - ${testName} ===`);
    console.log(`Reason: ${reason}`);

    const testResult = {
      id: testId,
      name: testName,
      status: 'skipped',
      startTime: new Date().toISOString(),
      endTime: new Date().toISOString(),
      duration: 0,
      steps: [],
      error: null,
      reason: reason,
      screenshots: []
    };

    this.testResults.totalTests++;
    this.testResults.skippedTests++;
    this.testResults.tests.push(testResult);
  }

  /**
   * Take a screenshot
   * @param {string} testId - Test ID
   * @param {number} stepNumber - Step number
   * @param {string} name - Screenshot name
   * @returns {Promise<string>} - Screenshot path
   */
  async takeScreenshot(testId, stepNumber, name) {
    const screenshotName = `${testId}-step-${stepNumber}-${name.replace(/\s+/g, '-').toLowerCase()}.png`;
    const screenshotPath = path.join(config.screenshotsDir, screenshotName);

    await this.page.screenshot({ path: screenshotPath });

    // Add screenshot to step result
    const testResult = this.testResults.tests.find(test => test.id === testId);
    if (testResult) {
      const stepResult = testResult.steps.find(step => step.number === stepNumber);
      if (stepResult) {
        stepResult.screenshots.push(screenshotName);
      }
    }

    return screenshotPath;
  }

  /**
   * Save test results
   */
  saveTestResults() {
    this.testResults.endTime = new Date().toISOString();

    const resultsPath = path.join(config.resultsDir, `sequential-test-results-${new Date().toISOString().replace(/:/g, '-')}.json`);

    // Create a clean copy of test results without circular references
    const cleanResults = {
      totalTests: this.testResults.totalTests,
      passedTests: this.testResults.passedTests,
      failedTests: this.testResults.failedTests,
      skippedTests: this.testResults.skippedTests,
      startTime: this.testResults.startTime,
      endTime: this.testResults.endTime,
      tests: []
    };

    // Clean up each test result
    for (const test of this.testResults.tests) {
      const cleanTest = {
        id: test.id,
        title: test.title,
        status: test.status,
        error: test.error,
        steps: []
      };

      // Clean up each step result
      for (const step of test.steps) {
        const cleanStep = {
          title: step.title,
          status: step.status,
          error: step.error
        };

        // Add any custom properties that are safe to serialize
        for (const key in step) {
          if (key !== 'title' && key !== 'status' && key !== 'error' &&
              key !== 'response' && key !== 'request' &&
              typeof step[key] !== 'function' &&
              typeof step[key] !== 'object') {
            cleanStep[key] = step[key];
          }
        }

        cleanTest.steps.push(cleanStep);
      }

      cleanResults.tests.push(cleanTest);
    }

    try {
      fs.writeFileSync(resultsPath, JSON.stringify(cleanResults, null, 2));
    } catch (error) {
      console.error('Error saving test results:', error);
    }

    console.log(`\n=== Test Results ===`);
    console.log(`Total Tests: ${this.testResults.totalTests}`);
    console.log(`Passed Tests: ${this.testResults.passedTests}`);
    console.log(`Failed Tests: ${this.testResults.failedTests}`);
    console.log(`Skipped Tests: ${this.testResults.skippedTests}`);
    console.log(`Results saved to: ${resultsPath}`);
  }

  /**
   * Create a test PDF file
   * @param {string} fileName - File name
   * @param {string} content - File content
   * @returns {string} - File path
   */
  createTestPdf(fileName, content) {
    const filePath = path.join(config.testFilesDir, fileName);

    // Check if file already exists
    if (fs.existsSync(filePath)) {
      return filePath;
    }

    // For now, we'll just create a text file with .pdf extension
    // In a real scenario, you would use a PDF generation library
    fs.writeFileSync(filePath, content);

    return filePath;
  }

  /**
   * Wait for an element to be visible
   * @param {string} selector - Element selector
   * @param {object} options - Options
   * @returns {Promise<ElementHandle>} - Element handle
   */
  async waitForElement(selector, options = {}) {
    const timeout = options.timeout || config.timeout;
    return this.page.waitForSelector(selector, { state: 'visible', timeout });
  }

  /**
   * Wait for navigation to complete
   * @param {object} options - Options
   * @returns {Promise<Response>} - Navigation response
   */
  async waitForNavigation(options = {}) {
    const timeout = options.timeout || config.timeout;
    return this.page.waitForNavigation({ timeout });
  }

  /**
   * Upload a file
   * @param {string} selector - File input selector
   * @param {string} filePath - Path to the file
   * @returns {Promise<void>}
   */
  async uploadFile(selector, filePath) {
    const fileInput = await this.page.$(selector);
    await fileInput.setInputFiles(filePath);
  }

  /**
   * Call an API endpoint
   * @param {string} method - HTTP method
   * @param {string} endpoint - API endpoint
   * @param {object} data - Request data
   * @returns {Promise<object>} - API response
   */
  async callApi(method, endpoint, data = null) {
    try {
      const url = `${config.apiBaseUrl}${endpoint}`;
      const options = {
        method,
        headers: {
          'Content-Type': 'application/json'
        }
      };

      if (data) {
        options.data = data;
      }

      const response = await axios(url, options);
      return response.data;
    } catch (error) {
      console.error(`Error calling API ${method} ${endpoint}:`, error);
      throw error;
    }
  }
}

module.exports = {
  SequentialTestRunner,
  config
};
