import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Page object model for the upload page
 */
export class UploadPage extends BasePage {
  // Main elements
  readonly fileInput: Locator;
  readonly processButton: Locator;
  readonly uploadStatusMessage: Locator;
  readonly processingStatusMessage: Locator;
  readonly securitySection: Locator;
  readonly viewDetailsLink: Locator;

  constructor(page: Page) {
    super(page, '/upload');
    
    // Initialize locators
    this.fileInput = page.locator('input[type="file"]');
    this.processButton = page.locator('button:has-text("Process")');
    this.uploadStatusMessage = page.locator('text=File uploaded successfully');
    this.processingStatusMessage = page.locator('text=Processing complete');
    this.securitySection = page.locator('text=Securities');
    this.viewDetailsLink = page.locator('a:has-text("View Details")');
  }

  /**
   * Upload a file
   * @param filePath Path to the file to upload
   */
  async uploadFile(filePath: string) {
    await this.fileInput.setInputFiles(filePath);
    await expect(this.uploadStatusMessage).toBeVisible({ timeout: 10000 });
  }

  /**
   * Process the uploaded file
   */
  async processFile() {
    await this.processButton.click();
    await expect(this.processingStatusMessage).toBeVisible({ timeout: 30000 });
  }

  /**
   * Navigate to document details page
   */
  async viewDocumentDetails() {
    await this.viewDetailsLink.click();
    await this.waitForNavigation();
  }

  /**
   * Upload and process a file in one step
   * @param filePath Path to the file to upload
   */
  async uploadAndProcessFile(filePath: string) {
    await this.uploadFile(filePath);
    await this.processFile();
  }

  /**
   * Check if securities data was extracted successfully
   */
  async verifySecuritiesExtracted() {
    await expect(this.securitySection).toBeVisible();
  }

  /**
   * Get processing results content
   * @returns Text content of the processing results
   */
  async getProcessingResults() {
    const resultsElement = this.page.locator('text=Processing Results').locator('..');
    return resultsElement.innerText();
  }
}
