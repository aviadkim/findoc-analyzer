import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Page object model for the analytics page
 */
export class AnalyticsPage extends BasePage {
  // Main elements
  readonly portfolioCharts: Locator;
  readonly chartContainers: Locator;
  readonly dateRangeSelector: Locator;
  readonly filterOptions: Locator;
  readonly legendItems: Locator;
  readonly touchControls: Locator;
  readonly mobileChartControls: Locator;
  readonly chartPaginationIndicator: Locator;

  constructor(page: Page) {
    super(page, '/analytics');
    
    // Initialize locators
    this.portfolioCharts = page.locator('.portfolio-charts');
    this.chartContainers = page.locator('.chart-container');
    this.dateRangeSelector = page.locator('.date-range-selector');
    this.filterOptions = page.locator('.filter-options');
    this.legendItems = page.locator('.chart-legend-item');
    this.touchControls = page.locator('.touch-controls');
    this.mobileChartControls = page.locator('.mobile-chart-controls');
    this.chartPaginationIndicator = page.locator('.chart-pagination-indicator');
  }

  /**
   * Check chart layout based on viewport size
   * @returns Layout type ('stacked' for mobile, 'grid' for desktop)
   */
  async getChartLayout() {
    const isMobile = await this.isMobileViewport();
    
    if (isMobile) {
      await expect(this.portfolioCharts.locator('.stacked-layout')).toBeVisible();
      await expect(this.touchControls).toBeVisible();
      return 'stacked';
    } else {
      await expect(this.portfolioCharts.locator('.grid-layout')).toBeVisible();
      return 'grid';
    }
  }

  /**
   * Get chart container heights
   * @returns Array of chart container heights
   */
  async getChartContainerHeights() {
    const count = await this.chartContainers.count();
    const heights = [];
    
    for (let i = 0; i < count; i++) {
      const height = await this.chartContainers.nth(i).evaluate(el => {
        return window.getComputedStyle(el).height;
      });
      heights.push(parseInt(height));
    }
    
    return heights;
  }

  /**
   * Get chart container widths
   * @returns Array of chart container widths
   */
  async getChartContainerWidths() {
    const count = await this.chartContainers.count();
    const widths = [];
    
    for (let i = 0; i < count; i++) {
      const width = await this.chartContainers.nth(i).evaluate(el => {
        return window.getComputedStyle(el).width;
      });
      widths.push(parseInt(width));
    }
    
    return widths;
  }

  /**
   * Change date range for charts
   * @param range Date range option (e.g., '1M', '3M', '1Y', etc.)
   */
  async changeDateRange(range: string) {
    await this.dateRangeSelector.click();
    await this.page.click(`text=${range}`);
    await this.waitForNavigation();
  }

  /**
   * Toggle legend item visibility
   * @param index Index of legend item to toggle
   */
  async toggleLegendItem(index: number) {
    await this.legendItems.nth(index).click();
  }

  /**
   * Test mobile-specific chart interactions
   */
  async testMobileChartInteractions() {
    if (await this.isMobileViewport()) {
      // Test specific mobile interactions
      const firstChart = this.chartContainers.first();
      
      // Double-tap to zoom
      await firstChart.dblclick();
      await expect(firstChart.locator('.zoomed-view')).toBeVisible();
      
      // Click to reset zoom
      await firstChart.click();
      await expect(firstChart.locator('.zoomed-view')).not.toBeVisible();
      
      // Swipe to navigate
      await firstChart.swipe({ direction: 'left', speed: 1000 });
      
      // Verify second chart is visible
      await expect(this.chartPaginationIndicator.locator('[data-index="1"]')).toHaveClass(/active/);
      
      return true;
    }
    return false;
  }

  /**
   * Check if charts are consistent in grid layout
   * @returns True if charts have consistent width in grid layout
   */
  async areChartsConsistentInGridLayout() {
    if (await this.getChartLayout() === 'grid') {
      const widths = await this.getChartContainerWidths();
      
      // Check if all widths are within 10px of each other
      const maxDiff = Math.max(...widths) - Math.min(...widths);
      return maxDiff < 10;
    }
    return false;
  }
}
