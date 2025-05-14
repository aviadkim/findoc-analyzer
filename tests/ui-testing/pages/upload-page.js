/**
 * Upload Page Object Model
 * 
 * This class provides functionality for the Upload page.
 */

const { BasePage } = require('./base-page');
const path = require('path');

class UploadPage extends BasePage {
  /**
   * Create a new upload page object
   * @param {import('@playwright/test').Page} page - Playwright page
   */
  constructor(page) {
    super(page);
    
    // Specific selectors for upload page
    this.pageSelectors = {
      uploadForm: 'form.upload-form, form#upload-form, form[action*="upload"]',
      fileInput: 'input[type="file"]',
      submitButton: 'button[type="submit"], .submit-button, #submit-btn',
      processButton: '#process-document-btn, .process-button, button.process',
      dropZone: '.drop-zone, .dropzone, .file-drop-area',
      fileList: '.file-list, .uploaded-files, .selected-files',
      fileItem: '.file-item, .uploaded-file, .selected-file',
      uploadProgress: '.upload-progress, .progress-bar, progress',
      uploadError: '.upload-error, .error-message, .alert-danger',
      uploadSuccess: '.upload-success, .success-message, .alert-success',
      processingOptions: '.processing-options, .options-panel, .settings-panel',
      processingOptionCheckbox: 'input[type="checkbox"].processing-option',
      processingOptionRadio: 'input[type="radio"].processing-option',
    };
  }

  /**
   * Navigate to upload page
   * @returns {Promise<void>}
   */
  async goto() {
    await super.goto('/upload');
  }

  /**
   * Check if upload form is visible
   * @returns {Promise<boolean>} - Whether upload form is visible
   */
  async hasUploadForm() {
    return await this.isVisible(this.pageSelectors.uploadForm);
  }

  /**
   * Check if process button is visible
   * @returns {Promise<boolean>} - Whether process button is visible
   */
  async hasProcessButton() {
    return await this.isVisible(this.pageSelectors.processButton);
  }

  /**
   * Upload a file
   * @param {string} filePath - Path to file
   * @returns {Promise<void>}
   */
  async uploadFile(filePath) {
    const fileInput = this.page.locator(this.pageSelectors.fileInput);
    await fileInput.setInputFiles(filePath);
  }

  /**
   * Submit upload form
   * @returns {Promise<void>}
   */
  async submitForm() {
    await this.click(this.pageSelectors.submitButton);
    await this.waitForLoading();
  }

  /**
   * Click process button
   * @returns {Promise<void>}
   */
  async clickProcessButton() {
    await this.click(this.pageSelectors.processButton);
    await this.waitForLoading();
  }

  /**
   * Get uploaded files
   * @returns {Promise<string[]>} - List of uploaded file names
   */
  async getUploadedFiles() {
    const fileItems = this.page.locator(this.pageSelectors.fileItem);
    const count = await fileItems.count();
    
    const files = [];
    for (let i = 0; i < count; i++) {
      const text = await fileItems.nth(i).textContent();
      files.push(text.trim());
    }
    
    return files;
  }

  /**
   * Check if file is uploaded
   * @param {string} fileName - File name
   * @returns {Promise<boolean>} - Whether file is uploaded
   */
  async isFileUploaded(fileName) {
    const files = await this.getUploadedFiles();
    return files.some(file => file.includes(fileName));
  }

  /**
   * Get upload error
   * @returns {Promise<string|null>} - Upload error message
   */
  async getUploadError() {
    if (await this.isVisible(this.pageSelectors.uploadError)) {
      return await this.getText(this.pageSelectors.uploadError);
    }
    return null;
  }

  /**
   * Get upload success message
   * @returns {Promise<string|null>} - Upload success message
   */
  async getUploadSuccess() {
    if (await this.isVisible(this.pageSelectors.uploadSuccess)) {
      return await this.getText(this.pageSelectors.uploadSuccess);
    }
    return null;
  }

  /**
   * Set processing options
   * @param {Object} options - Processing options
   * @returns {Promise<void>}
   */
  async setProcessingOptions(options) {
    // Check if processing options are visible
    if (await this.isVisible(this.pageSelectors.processingOptions)) {
      // Set checkboxes
      if (options.checkboxes) {
        for (const [name, value] of Object.entries(options.checkboxes)) {
          const checkbox = this.page.locator(`${this.pageSelectors.processingOptionCheckbox}[name="${name}"]`);
          if (await checkbox.isVisible()) {
            if (value) {
              await checkbox.check();
            } else {
              await checkbox.uncheck();
            }
          }
        }
      }
      
      // Set radio buttons
      if (options.radios) {
        for (const [name, value] of Object.entries(options.radios)) {
          const radio = this.page.locator(`${this.pageSelectors.processingOptionRadio}[name="${name}"][value="${value}"]`);
          if (await radio.isVisible()) {
            await radio.check();
          }
        }
      }
    }
  }

  /**
   * Upload and process a file
   * @param {string} filePath - Path to file
   * @param {Object} options - Processing options
   * @returns {Promise<void>}
   */
  async uploadAndProcess(filePath, options = {}) {
    // Navigate to upload page
    await this.goto();
    
    // Upload file
    await this.uploadFile(filePath);
    
    // Set processing options
    await this.setProcessingOptions(options);
    
    // Submit form
    await this.submitForm();
    
    // Click process button if available
    if (await this.hasProcessButton()) {
      await this.clickProcessButton();
    }
  }
}

module.exports = { UploadPage };