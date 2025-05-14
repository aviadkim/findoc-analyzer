// Helper functions for Playwright tests

/**
 * Login to the application
 * @param {import('@playwright/test').Page} page - Playwright page
 * @param {Object} user - User credentials
 * @returns {Promise<void>}
 */
async function login(page, user = { email: 'test@example.com', password: 'password123' }) {
  await page.goto('/login');
  await page.fill('[data-testid="email-input"]', user.email);
  await page.fill('[data-testid="password-input"]', user.password);
  await page.click('[data-testid="login-button"]');
  
  // Wait for navigation to dashboard after login
  await page.waitForURL('**/dashboard');
}

/**
 * Upload a document
 * @param {import('@playwright/test').Page} page - Playwright page
 * @param {string} filePath - Path to the document to upload
 * @returns {Promise<void>}
 */
async function uploadDocument(page, filePath) {
  await page.goto('/documents');
  await page.click('[data-testid="upload-button"]');
  
  // Set file input
  const fileInput = page.locator('input[type="file"]');
  await fileInput.setInputFiles(filePath);
  
  // Click upload
  await page.click('[data-testid="upload-submit-button"]');
  
  // Wait for upload to complete
  await page.waitForSelector('[data-testid="upload-success-message"]');
}

/**
 * Process a document
 * @param {import('@playwright/test').Page} page - Playwright page
 * @param {string} documentName - Name of the document to process
 * @returns {Promise<void>}
 */
async function processDocument(page, documentName) {
  await page.goto('/documents');
  
  // Find and click the document
  await page.click(`[data-testid="document-item"]:has-text("${documentName}")`);
  
  // Click process button
  await page.click('[data-testid="process-button"]');
  
  // Wait for processing to complete
  await page.waitForSelector('[data-testid="processing-complete-message"]', { timeout: 60000 });
}

/**
 * Navigate to document analysis
 * @param {import('@playwright/test').Page} page - Playwright page
 * @param {string} documentName - Name of the document to analyze
 * @returns {Promise<void>}
 */
async function navigateToAnalysis(page, documentName) {
  await page.goto('/documents');
  
  // Find and click the document
  await page.click(`[data-testid="document-item"]:has-text("${documentName}")`);
  
  // Click analyze button
  await page.click('[data-testid="analyze-button"]');
  
  // Wait for analysis page to load
  await page.waitForSelector('[data-testid="analysis-dashboard"]');
}

/**
 * Generate a random string for test data
 * @param {number} length - Length of the string
 * @returns {string}
 */
function generateRandomString(length = 8) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

module.exports = {
  login,
  uploadDocument,
  processDocument,
  navigateToAnalysis,
  generateRandomString
};
