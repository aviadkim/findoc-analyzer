/**
 * End-to-End Testing Setup for FinDoc Analyzer
 * 
 * This file configures the environment for end-to-end testing of the FinDoc Analyzer application.
 * It uses Playwright for browser automation and provides utility functions for common testing tasks.
 */

const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

// Configuration
const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';
const SCREENSHOT_DIR = path.join(__dirname, '../../../test-results/e2e-screenshots');
const VIDEO_DIR = path.join(__dirname, '../../../test-results/e2e-videos');
const TEST_USER = {
  email: 'test@example.com',
  password: 'TestPassword123!'
};

// Make sure directories exist
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

if (!fs.existsSync(VIDEO_DIR)) {
  fs.mkdirSync(VIDEO_DIR, { recursive: true });
}

/**
 * Setup a new browser session for testing
 * @param {Object} options - Configuration options for the browser
 * @returns {Promise<Object>} Object containing browser, context, and page
 */
async function setupBrowser(options = {}) {
  const browser = await chromium.launch({
    headless: process.env.HEADLESS !== 'false', // Default to headless unless explicitly set to false
    slowMo: process.env.SLOW_MO ? parseInt(process.env.SLOW_MO) : 0,
  });

  const contextOptions = {
    recordVideo: options.recordVideo ? {
      dir: VIDEO_DIR,
      size: { width: 1280, height: 720 }
    } : undefined
  };

  const context = await browser.newContext(contextOptions);
  const page = await context.newPage();

  // Add helper methods to page
  page.takeScreenshot = async (name) => {
    const screenshotPath = path.join(SCREENSHOT_DIR, `${name}_${new Date().toISOString().replace(/:/g, '-')}.png`);
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`Screenshot saved to ${screenshotPath}`);
    return screenshotPath;
  };

  // Set default timeout
  page.setDefaultTimeout(60000); // 60 seconds
  
  return { browser, context, page };
}

/**
 * Login to the application
 * @param {Page} page - Playwright page object
 * @param {Object} user - User credentials
 * @returns {Promise<void>}
 */
async function login(page, user = TEST_USER) {
  await page.goto(`${BASE_URL}/login`);
  await page.waitForSelector('form');
  
  // Fill login form
  await page.fill('input[type="email"]', user.email);
  await page.fill('input[type="password"]', user.password);
  
  // Submit form
  await page.click('button[type="submit"]');
  
  // Wait for navigation to complete
  await page.waitForNavigation();
  
  // Verify login success
  await page.waitForSelector('header .user-profile', { state: 'visible' });
}

/**
 * Upload a test document
 * @param {Page} page - Playwright page object
 * @param {string} filePath - Path to the file to upload
 * @returns {Promise<void>}
 */
async function uploadDocument(page, filePath) {
  await page.goto(`${BASE_URL}/documents`);
  await page.waitForSelector('.upload-button');
  
  // Click upload button
  await page.click('.upload-button');
  
  // Upload file
  const fileInput = await page.waitForSelector('input[type="file"]');
  await fileInput.setInputFiles(filePath);
  
  // Submit form
  await page.click('.upload-submit-button');
  
  // Wait for upload to complete
  await page.waitForSelector('.upload-success-message', { state: 'visible' });
}

/**
 * Run a document through processing pipeline
 * @param {Page} page - Playwright page object
 * @param {string} documentName - Name of the document to process
 * @returns {Promise<void>}
 */
async function processDocument(page, documentName) {
  await page.goto(`${BASE_URL}/documents`);
  
  // Find the document
  await page.waitForSelector(`.document-item:has-text("${documentName}")`);
  await page.click(`.document-item:has-text("${documentName}")`);
  
  // Click process button
  await page.waitForSelector('.process-button');
  await page.click('.process-button');
  
  // Wait for processing to complete
  await page.waitForSelector('.processing-complete-message', { state: 'visible' });
}

/**
 * Navigate to a document's analysis page
 * @param {Page} page - Playwright page object
 * @param {string} documentName - Name of the document to analyze
 * @returns {Promise<void>}
 */
async function navigateToAnalysis(page, documentName) {
  await page.goto(`${BASE_URL}/documents`);
  
  // Find the document
  await page.waitForSelector(`.document-item:has-text("${documentName}")`);
  await page.click(`.document-item:has-text("${documentName}")`);
  
  // Click analyze button
  await page.waitForSelector('.analyze-button');
  await page.click('.analyze-button');
  
  // Wait for analysis page to load
  await page.waitForSelector('.analysis-dashboard', { state: 'visible' });
}

/**
 * Clean up browser session
 * @param {Object} browser - Playwright browser object
 * @returns {Promise<void>}
 */
async function teardownBrowser(browser) {
  await browser.close();
}

module.exports = {
  setupBrowser,
  login,
  uploadDocument,
  processDocument,
  navigateToAnalysis,
  teardownBrowser,
  BASE_URL,
  TEST_USER
};
