import { Page, Locator } from '@playwright/test';

/**
 * Base class for all page objects
 */
export class BasePage {
  readonly page: Page;
  readonly path: string;
  readonly baseUrl: string;

  constructor(page: Page, path = '') {
    this.page = page;
    this.path = path;
    this.baseUrl = process.env.BASE_URL || 'http://localhost:3000';
  }

  /**
   * Navigate to the page
   */
  async goto() {
    await this.page.goto(`${this.baseUrl}${this.path}`);
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Wait for navigation to complete
   */
  async waitForNavigation() {
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Get viewport size information
   * @returns Object with width and height, or null if not available
   */
  async getViewportSize() {
    return this.page.viewportSize();
  }

  /**
   * Check if the current viewport is mobile-sized
   * @returns True if viewport width is less than 768px
   */
  async isMobileViewport() {
    const viewport = await this.getViewportSize();
    return viewport ? viewport.width < 768 : false;
  }

  /**
   * Take a screenshot with a unique name
   * @param name Base name for the screenshot
   */
  async takeScreenshot(name: string) {
    await this.page.screenshot({ 
      path: `./test-results/screenshots/${name}-${Date.now()}.png`,
      fullPage: true
    });
  }

  /**
   * Wait for a specified amount of time
   * @param ms Time to wait in milliseconds
   */
  async wait(ms: number) {
    await this.page.waitForTimeout(ms);
  }
}
