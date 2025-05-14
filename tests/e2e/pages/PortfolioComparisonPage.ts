import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Page object model for the portfolio comparison page
 */
export class PortfolioComparisonPage extends BasePage {
  // Main elements
  readonly portfolioComparison: Locator;
  readonly portfolioComparisonSelector: Locator;
  readonly desktopPortfolioSelect: Locator;
  readonly mobileSelectionCards: Locator;
  readonly compareButton: Locator;
  readonly comparisonResults: Locator;
  readonly comparisonChart: Locator;
  readonly performanceMetrics: Locator;
  readonly portfolioDifferences: Locator;
  readonly toggleViewButton: Locator;
  readonly alternateView: Locator;

  constructor(page: Page) {
    super(page, '/portfolio-comparison');
    
    // Initialize locators
    this.portfolioComparison = page.locator('.portfolio-comparison');
    this.portfolioComparisonSelector = page.locator('.portfolio-comparison-selector');
    this.desktopPortfolioSelect = page.locator('select.portfolio-select');
    this.mobileSelectionCards = page.locator('.selection-card');
    this.compareButton = page.locator('button:has-text("Compare")');
    this.comparisonResults = page.locator('.comparison-results');
    this.comparisonChart = page.locator('.comparison-chart');
    this.performanceMetrics = page.locator('.performance-metrics');
    this.portfolioDifferences = page.locator('.portfolio-differences');
    this.toggleViewButton = page.locator('.toggle-view-button');
    this.alternateView = page.locator('.alternate-view');
  }

  /**
   * Check if the page is using mobile layout
   * @returns True if using mobile layout
   */
  async isMobileLayout() {
    const isMobile = await this.isMobileViewport();
    
    if (isMobile) {
      await expect(this.portfolioComparison.locator('.vertical-layout')).toBeVisible();
      await expect(this.portfolioComparisonSelector.locator('.mobile-view')).toBeVisible();
      return true;
    } else {
      await expect(this.portfolioComparison.locator('.horizontal-layout')).toBeVisible();
      await expect(this.portfolioComparisonSelector.locator('.desktop-view')).toBeVisible();
      return false;
    }
  }

  /**
   * Select portfolios for comparison
   * @param firstIndex Index of first portfolio (0-based)
   * @param secondIndex Index of second portfolio (0-based)
   */
  async selectPortfolios(firstIndex: number, secondIndex: number) {
    const isMobile = await this.isMobileLayout();
    
    if (isMobile) {
      // Mobile selection using cards
      await this.mobileSelectionCards.nth(firstIndex).click();
      await expect(this.mobileSelectionCards.nth(firstIndex).locator('.selected')).toBeVisible();
      
      await this.mobileSelectionCards.nth(secondIndex).click();
      await expect(this.mobileSelectionCards.nth(secondIndex).locator('.selected')).toBeVisible();
    } else {
      // Desktop selection using dropdowns
      await this.desktopPortfolioSelect.nth(0).selectOption({ index: firstIndex });
      await this.desktopPortfolioSelect.nth(1).selectOption({ index: secondIndex });
    }
  }

  /**
   * Compare selected portfolios
   */
  async comparePortfolios() {
    await this.compareButton.click();
    await expect(this.comparisonResults).toBeVisible({ timeout: 10000 });
  }

  /**
   * Select portfolios and compare them in one step
   * @param firstIndex Index of first portfolio
   * @param secondIndex Index of second portfolio
   */
  async selectAndComparePortfolios(firstIndex: number, secondIndex: number) {
    await this.selectPortfolios(firstIndex, secondIndex);
    await this.comparePortfolios();
  }

  /**
   * Toggle between different comparison views
   */
  async toggleView() {
    await this.toggleViewButton.click();
    await expect(this.alternateView).toBeVisible();
  }

  /**
   * Verify comparison results are displayed
   */
  async verifyComparisonResults() {
    await expect(this.comparisonChart).toBeVisible();
    await expect(this.performanceMetrics).toBeVisible();
    await expect(this.portfolioDifferences).toBeVisible();
  }

  /**
   * Get comparison metrics text
   * @returns Performance metrics text
   */
  async getPerformanceMetricsText() {
    return this.performanceMetrics.innerText();
  }
}
