/**
 * Test Utilities and Helpers
 * Common functionality for UI tests
 */

const fs = require('fs');
const path = require('path');
const { test, expect } = require('@playwright/test');
const axeBuilder = require('@axe-core/playwright').default;

/**
 * Common selectors used across tests
 */
const selectors = {
  navigation: {
    sidebar: '.sidebar, .side-nav, #sidebar',
    home: '.sidebar a[href="/"], #sidebar a[href="/"], a[href="/"].nav-link',
    documents: '.sidebar a[href*="documents"], #sidebar a[href*="documents"], a[href*="documents"].nav-link',
    upload: '.sidebar a[href*="upload"], #sidebar a[href*="upload"], a[href*="upload"].nav-link',
    documentChat: '.sidebar a[href*="document-chat"], #sidebar a[href*="document-chat"], a[href*="document-chat"].nav-link',
    analytics: '.sidebar a[href*="analytics"], #sidebar a[href*="analytics"], a[href*="analytics"].nav-link',
  },
  components: {
    documentCard: '.document-card, .card.document',
    documentList: '.document-list, .documents-grid',
    uploadForm: 'form.upload-form, form#upload-form, form[action*="upload"]',
    fileInput: 'input[type="file"]',
    submitButton: 'button[type="submit"], .submit-button, #submit-btn',
    processButton: '#process-document-btn, .process-button, button.process',
    chatInput: '#document-chat-input, .chat-input, input.chat-input',
    chatSendButton: '#document-send-btn, .send-button, button.send',
    chatMessages: '.chat-messages, .message-list, .conversation',
    chatMessage: '.chat-message, .message',
    loadingIndicator: '.loading, .spinner, .loader',
    errorMessage: '.error, .error-message, .alert-danger',
    successMessage: '.success, .success-message, .alert-success',
  },
  responsive: {
    mobileMenu: '.mobile-menu, .hamburger-menu, .navbar-toggler',
    collapsedSidebar: '.sidebar.collapsed, .side-nav.collapsed, #sidebar.collapsed',
    expandedSidebar: '.sidebar.expanded, .side-nav.expanded, #sidebar.expanded',
  }
};

/**
 * Get test fixture from fixtures directory
 * @param {string} fixtureName - Name of the fixture file
 * @returns {Object} - Fixture data
 */
function getFixture(fixtureName) {
  const fixtureDir = path.join(__dirname, '..', 'fixtures');
  const fixturePath = path.join(fixtureDir, `${fixtureName}.json`);
  
  if (!fs.existsSync(fixturePath)) {
    throw new Error(`Fixture not found: ${fixtureName}`);
  }
  
  return JSON.parse(fs.readFileSync(fixturePath, 'utf8'));
}

/**
 * Upload a test file
 * @param {import('@playwright/test').Page} page - Playwright page
 * @param {string} filePath - Path to file
 * @param {string} selector - Selector for file input
 * @returns {Promise<void>}
 */
async function uploadFile(page, filePath, selector = selectors.components.fileInput) {
  const fileInput = page.locator(selector);
  await expect(fileInput).toBeVisible();
  await fileInput.setInputFiles(filePath);
}

/**
 * Wait for navigation to complete
 * @param {import('@playwright/test').Page} page - Playwright page
 * @returns {Promise<void>}
 */
async function waitForNavigation(page) {
  await page.waitForLoadState('networkidle');
}

/**
 * Wait for component to be ready
 * @param {import('@playwright/test').Page} page - Playwright page
 * @param {string} selector - Selector to wait for
 * @param {Object} options - Wait options
 * @returns {Promise<void>}
 */
async function waitForComponent(page, selector, options = {}) {
  const component = page.locator(selector);
  await expect(component).toBeVisible(options);
}

/**
 * Run accessibility tests on the current page
 * @param {import('@playwright/test').Page} page - Playwright page
 * @param {string} pageTitle - Page title for reporting
 * @returns {Promise<void>}
 */
async function runA11yTests(page, pageTitle) {
  // Run axe
  const accessibilityScanResults = await axeBuilder(page)
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();
  
  // Log results
  console.log(`Accessibility results for ${pageTitle}:`);
  console.log(`  Violations: ${accessibilityScanResults.violations.length}`);
  
  // Check for violations
  expect(accessibilityScanResults.violations).toEqual([]);
}

/**
 * Check page for responsive design
 * @param {import('@playwright/test').Page} page - Playwright page
 * @param {Array<{width: number, height: number}>} viewports - Viewports to test
 * @returns {Promise<void>}
 */
async function checkResponsive(page, viewports) {
  const originalViewport = page.viewportSize();
  
  for (const viewport of viewports) {
    // Set viewport
    await page.setViewportSize(viewport);
    
    if (viewport.width < 768) {
      // Mobile view
      // Check for hamburger menu
      const mobileMenu = page.locator(selectors.responsive.mobileMenu);
      await expect(mobileMenu).toBeVisible();
      
      // Check sidebar is collapsed or hidden
      const sidebar = page.locator(selectors.navigation.sidebar);
      const isVisible = await sidebar.isVisible();
      if (isVisible) {
        await expect(sidebar).toHaveClass(/collapsed|hidden|mobile/);
      }
      
    } else if (viewport.width >= 768 && viewport.width < 992) {
      // Tablet view
      // Sidebar might be visible but collapsed
      const sidebar = page.locator(selectors.navigation.sidebar);
      await expect(sidebar).toBeVisible();
      
    } else {
      // Desktop view
      // Sidebar should be visible and expanded
      const sidebar = page.locator(selectors.navigation.sidebar);
      await expect(sidebar).toBeVisible();
    }
  }
  
  // Restore original viewport
  if (originalViewport) {
    await page.setViewportSize(originalViewport);
  }
}

/**
 * Custom test function with accessibility testing
 */
const a11yTest = test.extend({
  page: async ({ page }, use) => {
    // Add accessibility testing functions
    page.runA11yTests = async (pageTitle) => {
      await runA11yTests(page, pageTitle);
    };
    
    await use(page);
  },
});

module.exports = {
  selectors,
  getFixture,
  uploadFile,
  waitForNavigation,
  waitForComponent,
  runA11yTests,
  checkResponsive,
  a11yTest,
};