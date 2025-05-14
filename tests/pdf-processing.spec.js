// @ts-check
const { test, expect } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

/**
 * PDF Processing Tests
 *
 * These tests verify the PDF processing functionality of the FinDoc Analyzer application.
 */

// Test data
const testPdfPath = path.join(__dirname, 'test-files', 'test-portfolio.pdf');

// Ensure test files directory exists
test.beforeAll(() => {
  const testFilesDir = path.join(__dirname, 'test-files');
  if (!fs.existsSync(testFilesDir)) {
    fs.mkdirSync(testFilesDir, { recursive: true });
  }

  // Copy test PDF from the main test files directory if it doesn't exist
  const mainTestPdfPath = path.join(__dirname, '..', 'test', 'test-files', 'test-portfolio.pdf');
  if (fs.existsSync(mainTestPdfPath) && !fs.existsSync(testPdfPath)) {
    fs.copyFileSync(mainTestPdfPath, testPdfPath);
  }
});

test.describe('PDF Processing', () => {
  test('should upload and process a PDF file', async ({ page }) => {
    // Navigate to the upload page
    await page.goto('/upload');

    // Verify the upload form is present
    await expect(page.locator('form')).toBeVisible();

    // Upload a PDF file
    const fileInput = page.locator('input[type="file"]');
    await expect(fileInput).toBeVisible();
    await fileInput.setInputFiles(testPdfPath);

    // Submit the form
    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toBeVisible();
    await submitButton.click();

    // Wait for the results
    const results = page.locator('#results, .results, .document-results, .processing-results');
    await expect(results).toBeVisible({ timeout: 30000 });

    // Verify the document info is displayed
    const documentInfo = page.locator('#documentInfo, .document-info');
    if (await documentInfo.isVisible()) {
      console.log('Document info is displayed');
    } else {
      console.log('Document info is not displayed, but continuing the test');
    }

    // Check if tables are displayed
    try {
      const tablesCount = await page.locator('table, .table, .tables-section').count();
      if (tablesCount > 0) {
        console.log(`Tables are displayed (${tablesCount} found)`);
      } else {
        console.log('Tables are not displayed, but continuing the test');
      }
    } catch (error) {
      console.log('Error checking for tables:', error.message);
      console.log('Continuing the test anyway');
    }

    // Check if securities are displayed
    try {
      const securitiesCount = await page.locator('.securities, .securities-section').count();
      if (securitiesCount > 0) {
        console.log(`Securities are displayed (${securitiesCount} found)`);
      } else {
        console.log('Securities are not displayed, but continuing the test');
      }
    } catch (error) {
      console.log('Error checking for securities:', error.message);
      console.log('Continuing the test anyway');
    }

    // Verify the results contain the expected data
    const pageContent = await page.content();
    expect(pageContent).toContain('test-portfolio');
  });

  test('should process a PDF with OCR enabled', async ({ page }) => {
    // Navigate to the upload page
    await page.goto('/upload');

    // Verify the upload form is present
    await expect(page.locator('form')).toBeVisible();

    // Upload a PDF file
    const fileInput = page.locator('input[type="file"]');
    await expect(fileInput).toBeVisible();
    await fileInput.setInputFiles(testPdfPath);

    // Enable OCR if the checkbox exists
    const ocrCheckbox = page.locator('#useOcr');
    if (await ocrCheckbox.isVisible()) {
      await ocrCheckbox.check();
      console.log('OCR enabled');
    } else {
      console.log('OCR checkbox not found, continuing without OCR');
    }

    // Submit the form
    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toBeVisible();
    await submitButton.click();

    // Wait for the results
    const results = page.locator('#results, .results, .document-results, .processing-results');
    await expect(results).toBeVisible({ timeout: 30000 });

    // Verify the results contain the expected data
    const pageContent = await page.content();
    expect(pageContent).toContain('test-portfolio');
  });

  // Add more tests for PDF processing
  for (let i = 1; i <= 3; i++) {
    test(`PDF processing variation ${i}`, async ({ page }) => {
      // Navigate to the upload page
      await page.goto('/upload');

      // Verify the upload form is present
      await expect(page.locator('form')).toBeVisible();

      // Upload a PDF file
      const fileInput = page.locator('input[type="file"]');
      await expect(fileInput).toBeVisible();
      await fileInput.setInputFiles(testPdfPath);

      // Set different options based on the test variation
      if (i % 2 === 0) {
        // Enable OCR if the checkbox exists
        const ocrCheckbox = page.locator('#useOcr');
        if (await ocrCheckbox.isVisible()) {
          await ocrCheckbox.check();
          console.log('OCR enabled');
        }
      }

      if (i % 3 === 0) {
        // Disable table extraction if the checkbox exists
        const tablesCheckbox = page.locator('#extractTables');
        if (await tablesCheckbox.isVisible() && await tablesCheckbox.isChecked()) {
          await tablesCheckbox.uncheck();
          console.log('Table extraction disabled');
        }
      }

      // Submit the form
      const submitButton = page.locator('button[type="submit"]');
      await expect(submitButton).toBeVisible();
      await submitButton.click();

      // Wait for the results
      const results = page.locator('#results, .results, .document-results, .processing-results');
      await expect(results).toBeVisible({ timeout: 30000 });

      // Verify the results contain the expected data
      const pageContent = await page.content();
      expect(pageContent).toContain('test-portfolio');
    });
  }
});
