import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Page object model for the document details page
 */
export class DocumentDetailsPage extends BasePage {
  // Main elements
  readonly documentTitle: Locator;
  readonly documentDetails: Locator;
  readonly exportButton: Locator;
  readonly askQuestionsButton: Locator;
  readonly analyzeButton: Locator;
  readonly securitySection: Locator;
  readonly securitiesTable: Locator;
  readonly exportFormatSelector: Locator;
  readonly exportModal: Locator;
  readonly mobileDocumentViewer: Locator;
  readonly enhancedSecuritiesViewer: Locator;

  constructor(page: Page) {
    // The path is dynamic based on document ID, so we'll just use the base for navigation checking
    super(page, '/document/');
    
    // Initialize locators
    this.documentTitle = page.locator('.document-title');
    this.documentDetails = page.locator('.document-details');
    this.exportButton = page.locator('button:has-text("Export")');
    this.askQuestionsButton = page.locator('button:has-text("Ask Questions")');
    this.analyzeButton = page.locator('button:has-text("Analyze")');
    this.securitySection = page.locator('text=Securities');
    this.securitiesTable = page.locator('.securities-table');
    this.exportFormatSelector = page.locator('.export-format-selector');
    this.exportModal = page.locator('.export-modal');
    this.mobileDocumentViewer = page.locator('.mobile-document-viewer');
    this.enhancedSecuritiesViewer = page.locator('.enhanced-securities-viewer');
  }

  /**
   * Get document ID from URL
   * @returns Document ID
   */
  async getDocumentId() {
    const url = this.page.url();
    const match = url.match(/\/document\/([^/]+)/);
    return match ? match[1] : null;
  }

  /**
   * Get document title
   * @returns Document title text
   */
  async getDocumentTitle() {
    return this.documentTitle.innerText();
  }

  /**
   * Click export button and select format
   * @param format Format to export (CSV, XLSX, JSON)
   */
  async exportDocument(format: string) {
    await this.exportButton.click();
    await this.exportFormatSelector.click();
    await this.page.click(`text=${format}`);
    
    // Setup download handler
    const downloadPromise = this.page.waitForEvent('download');
    
    // Click export in modal
    await this.page.click('.export-modal button:has-text("Export")');
    
    // Wait for download to start
    return downloadPromise;
  }

  /**
   * Click Ask Questions button and open chat interface
   */
  async openChatInterface() {
    await this.askQuestionsButton.click();
    await expect(this.page.locator('.chat-interface')).toBeVisible();
  }

  /**
   * Send a question in the chat interface
   * @param question Question to send
   */
  async sendQuestion(question: string) {
    await this.page.fill('.chat-input', question);
    await this.page.click('button:has-text("Send")');
    
    // Wait for response
    await expect(this.page.locator('.chat-response')).toBeVisible({ timeout: 15000 });
  }

  /**
   * Get the chat response text
   * @returns Text of the chat response
   */
  async getChatResponse() {
    return this.page.locator('.chat-response').innerText();
  }

  /**
   * Click Analyze button and wait for analysis to complete
   */
  async analyzeDocument() {
    await this.analyzeButton.click();
    await expect(this.page.locator('text=Analysis complete')).toBeVisible({ timeout: 15000 });
  }

  /**
   * Check if analysis results are displayed
   */
  async verifyAnalysisResults() {
    await expect(this.page.locator('.analysis-results')).toBeVisible();
    await expect(this.page.locator('.portfolio-summary')).toBeVisible();
    await expect(this.page.locator('.asset-allocation-chart')).toBeVisible();
  }

  /**
   * Check if mobile document viewer is used for mobile viewport
   */
  async isMobileViewerActive() {
    const isMobile = await this.isMobileViewport();
    if (isMobile) {
      await expect(this.mobileDocumentViewer).toBeVisible();
      return true;
    }
    return false;
  }

  /**
   * Test mobile-specific document viewer features
   */
  async testMobileViewerFeatures() {
    if (await this.isMobileViewerActive()) {
      // Test double-tap to zoom
      await this.page.locator('.document-page').dblclick();
      await expect(this.page.locator('.document-page.zoomed')).toBeVisible();
      
      // Verify mobile controls
      await expect(this.page.locator('.mobile-controls')).toBeVisible();
      
      return true;
    }
    return false;
  }

  /**
   * Check the securities viewer behavior based on viewport size
   */
  async checkSecuritiesViewerBehavior() {
    const viewportSize = await this.getViewportSize();
    const width = viewportSize ? viewportSize.width : 1024;
    
    // Verify securities viewer is visible
    await expect(this.enhancedSecuritiesViewer).toBeVisible();
    
    // Check responsive behavior based on viewport size
    if (width < 640) {
      // On small screens, expect compact view
      await expect(this.page.locator('.enhanced-securities-viewer.compact-view')).toBeVisible();
      
      // Check column count
      const columnCount = await this.page.locator('.securities-table th').count();
      expect(columnCount).toBeLessThanOrEqual(3);
      
      // Check for expand controls
      await expect(this.page.locator('.expand-row-button')).toBeVisible();
      
      return 'mobile';
    } else if (width < 1024) {
      // Medium screens
      const columnCount = await this.page.locator('.securities-table th').count();
      expect(columnCount).toBeGreaterThan(3);
      expect(columnCount).toBeLessThan(8);
      
      return 'tablet';
    } else {
      // Large screens
      const columnCount = await this.page.locator('.securities-table th').count();
      expect(columnCount).toBeGreaterThanOrEqual(7);
      
      return 'desktop';
    }
  }
}
