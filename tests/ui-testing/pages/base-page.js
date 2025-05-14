/**
 * Base Page Object Model
 * 
 * This class provides common functionality for page objects.
 * It is extended by specific page classes.
 */

const { expect } = require('@playwright/test');
const { selectors } = require('../utils/test-helpers');

class BasePage {
  /**
   * Create a new page object
   * @param {import('@playwright/test').Page} page - Playwright page
   */
  constructor(page) {
    this.page = page;
    this.selectors = selectors;
  }

  /**
   * Navigate to a page
   * @param {string} path - Path to navigate to
   * @returns {Promise<void>}
   */
  async goto(path) {
    await this.page.goto(path);
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Get page title
   * @returns {Promise<string>} - Page title
   */
  async getTitle() {
    return await this.page.title();
  }

  /**
   * Check if element is visible
   * @param {string} selector - Element selector
   * @returns {Promise<boolean>} - Whether element is visible
   */
  async isVisible(selector) {
    const element = this.page.locator(selector);
    return await element.isVisible();
  }

  /**
   * Wait for element to be visible
   * @param {string} selector - Element selector
   * @param {Object} options - Wait options
   * @returns {Promise<void>}
   */
  async waitForVisible(selector, options = {}) {
    const element = this.page.locator(selector);
    await expect(element).toBeVisible(options);
  }

  /**
   * Click an element
   * @param {string} selector - Element selector
   * @returns {Promise<void>}
   */
  async click(selector) {
    const element = this.page.locator(selector);
    await element.click();
  }

  /**
   * Fill an input
   * @param {string} selector - Input selector
   * @param {string} value - Value to fill
   * @returns {Promise<void>}
   */
  async fill(selector, value) {
    const element = this.page.locator(selector);
    await element.fill(value);
  }

  /**
   * Get element text
   * @param {string} selector - Element selector
   * @returns {Promise<string>} - Element text
   */
  async getText(selector) {
    const element = this.page.locator(selector);
    return await element.textContent();
  }

  /**
   * Navigate using sidebar
   * @param {string} destination - Destination name (home, documents, upload, documentChat, analytics)
   * @returns {Promise<void>}
   */
  async navigateTo(destination) {
    const selector = this.selectors.navigation[destination];
    if (!selector) {
      throw new Error(`Unknown destination: ${destination}`);
    }
    
    // Check if mobile menu needs to be opened first
    if (this.page.viewportSize().width < 768) {
      const mobileMenu = this.page.locator(this.selectors.responsive.mobileMenu);
      if (await mobileMenu.isVisible()) {
        await mobileMenu.click();
        await this.page.waitForTimeout(500); // Wait for menu animation
      }
    }
    
    await this.click(selector);
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Take screenshot
   * @param {string} name - Screenshot name
   * @returns {Promise<void>}
   */
  async takeScreenshot(name) {
    await this.page.screenshot({ path: `test-results/${name}.png`, fullPage: true });
  }

  /**
   * Check if page has errors
   * @returns {Promise<boolean>} - Whether page has errors
   */
  async hasErrors() {
    const errorMessage = this.page.locator(this.selectors.components.errorMessage);
    return await errorMessage.isVisible();
  }

  /**
   * Check if page is loading
   * @returns {Promise<boolean>} - Whether page is loading
   */
  async isLoading() {
    const loadingIndicator = this.page.locator(this.selectors.components.loadingIndicator);
    return await loadingIndicator.isVisible();
  }

  /**
   * Wait for loading to complete
   * @param {Object} options - Wait options
   * @returns {Promise<void>}
   */
  async waitForLoading(options = { timeout: 30000 }) {
    // Wait for loading indicator to appear
    const loadingIndicator = this.page.locator(this.selectors.components.loadingIndicator);
    
    // First check if it's even visible right now
    const isVisible = await loadingIndicator.isVisible();
    if (!isVisible) {
      return; // No loading indicator, so no need to wait
    }
    
    // Wait for loading indicator to disappear
    await expect(loadingIndicator).not.toBeVisible({ timeout: options.timeout });
  }
  
  /**
   * Test responsive behavior
   * @returns {Promise<void>}
   */
  async testResponsive() {
    // Test mobile viewport (360x640)
    await this.page.setViewportSize({ width: 360, height: 640 });
    await this.page.waitForTimeout(500);
    await this.takeScreenshot(`${this.constructor.name}-mobile`);
    
    // Test tablet viewport (768x1024)
    await this.page.setViewportSize({ width: 768, height: 1024 });
    await this.page.waitForTimeout(500);
    await this.takeScreenshot(`${this.constructor.name}-tablet`);
    
    // Test desktop viewport (1280x720)
    await this.page.setViewportSize({ width: 1280, height: 720 });
    await this.page.waitForTimeout(500);
    await this.takeScreenshot(`${this.constructor.name}-desktop`);
  }
  
  /**
   * Run accessibility tests
   * @returns {Promise<void>}
   */
  async testAccessibility() {
    await this.page.runA11yTests(this.constructor.name);
  }
}

module.exports = { BasePage };