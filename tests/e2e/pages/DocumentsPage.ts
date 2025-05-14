import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Page object model for the documents page
 */
export class DocumentsPage extends BasePage {
  // Main elements
  readonly documentCards: Locator;
  readonly searchInput: Locator;
  readonly filterDropdown: Locator;
  readonly sortDropdown: Locator;
  readonly paginationControls: Locator;
  readonly emptyStateMessage: Locator;

  constructor(page: Page) {
    super(page, '/documents');
    
    // Initialize locators
    this.documentCards = page.locator('.document-card');
    this.searchInput = page.locator('input[placeholder*="Search"]');
    this.filterDropdown = page.locator('select[aria-label="Filter"]');
    this.sortDropdown = page.locator('select[aria-label="Sort"]');
    this.paginationControls = page.locator('.pagination-controls');
    this.emptyStateMessage = page.locator('text=No documents found');
  }

  /**
   * Get the count of document cards displayed
   * @returns Number of document cards
   */
  async getDocumentCount() {
    return this.documentCards.count();
  }

  /**
   * Click on a document card by index (0-based)
   * @param index Index of the document card to click
   */
  async clickDocumentCard(index = 0) {
    await this.documentCards.nth(index).click();
    await this.waitForNavigation();
  }

  /**
   * Search for documents
   * @param searchTerm Term to search for
   */
  async searchDocuments(searchTerm: string) {
    await this.searchInput.fill(searchTerm);
    await this.searchInput.press('Enter');
    await this.waitForNavigation();
  }

  /**
   * Filter documents by category
   * @param category Category to filter by
   */
  async filterByCategory(category: string) {
    await this.filterDropdown.selectOption({ label: category });
    await this.waitForNavigation();
  }

  /**
   * Sort documents
   * @param sortOption Sort option to select
   */
  async sortDocuments(sortOption: string) {
    await this.sortDropdown.selectOption({ label: sortOption });
    await this.waitForNavigation();
  }

  /**
   * Check if the documents page is empty
   * @returns True if no documents are displayed
   */
  async isEmpty() {
    const count = await this.getDocumentCount();
    return count === 0;
  }

  /**
   * Get the text of document titles
   * @returns Array of document titles
   */
  async getDocumentTitles() {
    const titles = [];
    const count = await this.getDocumentCount();
    
    for (let i = 0; i < count; i++) {
      const titleElement = this.documentCards.nth(i).locator('.document-title');
      titles.push(await titleElement.innerText());
    }
    
    return titles;
  }
}
