// @ts-check
const { test, expect } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

/**
 * Document Processing Tests
 * 
 * These tests verify the document processing functionality of the FinDoc Analyzer application.
 */

// Test configuration
const config = {
  baseUrl: 'http://localhost:8080',
  testPdfsDir: path.join(__dirname, 'test-pdfs'),
  screenshotsDir: path.join(__dirname, 'screenshots'),
  testTimeout: 60000 // 60 seconds
};

// Create directories if they don't exist
fs.mkdirSync(config.testPdfsDir, { recursive: true });
fs.mkdirSync(config.screenshotsDir, { recursive: true });

// Create a simple test PDF if it doesn't exist
const testPdfPath = path.join(config.testPdfsDir, 'test-document.pdf');
if (!fs.existsSync(testPdfPath)) {
  // Create a simple PDF with text content
  const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');
  
  async function createTestPdf() {
    const pdfDoc = await PDFDocument.create();
    const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
    
    const page = pdfDoc.addPage([600, 800]);
    const { width, height } = page.getSize();
    
    page.drawText('FinDoc Analyzer Test Document', {
      x: 50,
      y: height - 50,
      size: 24,
      font: timesRomanFont,
      color: rgb(0, 0, 0),
    });
    
    page.drawText('This is a test document for the FinDoc Analyzer application.', {
      x: 50,
      y: height - 100,
      size: 12,
      font: timesRomanFont,
      color: rgb(0, 0, 0),
    });
    
    page.drawText('It contains sample financial data for testing purposes.', {
      x: 50,
      y: height - 120,
      size: 12,
      font: timesRomanFont,
      color: rgb(0, 0, 0),
    });
    
    // Add a simple table
    page.drawText('Portfolio Summary', {
      x: 50,
      y: height - 170,
      size: 16,
      font: timesRomanFont,
      color: rgb(0, 0, 0),
    });
    
    // Table headers
    page.drawText('Asset Class', {
      x: 50,
      y: height - 200,
      size: 12,
      font: timesRomanFont,
      color: rgb(0, 0, 0),
    });
    
    page.drawText('Allocation (%)', {
      x: 200,
      y: height - 200,
      size: 12,
      font: timesRomanFont,
      color: rgb(0, 0, 0),
    });
    
    page.drawText('Value (USD)', {
      x: 350,
      y: height - 200,
      size: 12,
      font: timesRomanFont,
      color: rgb(0, 0, 0),
    });
    
    // Table rows
    page.drawText('Equities', {
      x: 50,
      y: height - 230,
      size: 12,
      font: timesRomanFont,
      color: rgb(0, 0, 0),
    });
    
    page.drawText('45%', {
      x: 200,
      y: height - 230,
      size: 12,
      font: timesRomanFont,
      color: rgb(0, 0, 0),
    });
    
    page.drawText('$450,000', {
      x: 350,
      y: height - 230,
      size: 12,
      font: timesRomanFont,
      color: rgb(0, 0, 0),
    });
    
    page.drawText('Fixed Income', {
      x: 50,
      y: height - 260,
      size: 12,
      font: timesRomanFont,
      color: rgb(0, 0, 0),
    });
    
    page.drawText('30%', {
      x: 200,
      y: height - 260,
      size: 12,
      font: timesRomanFont,
      color: rgb(0, 0, 0),
    });
    
    page.drawText('$300,000', {
      x: 350,
      y: height - 260,
      size: 12,
      font: timesRomanFont,
      color: rgb(0, 0, 0),
    });
    
    // Add securities section
    page.drawText('Securities', {
      x: 50,
      y: height - 310,
      size: 16,
      font: timesRomanFont,
      color: rgb(0, 0, 0),
    });
    
    // Securities headers
    page.drawText('Name', {
      x: 50,
      y: height - 340,
      size: 12,
      font: timesRomanFont,
      color: rgb(0, 0, 0),
    });
    
    page.drawText('ISIN', {
      x: 200,
      y: height - 340,
      size: 12,
      font: timesRomanFont,
      color: rgb(0, 0, 0),
    });
    
    page.drawText('Quantity', {
      x: 350,
      y: height - 340,
      size: 12,
      font: timesRomanFont,
      color: rgb(0, 0, 0),
    });
    
    page.drawText('Price', {
      x: 450,
      y: height - 340,
      size: 12,
      font: timesRomanFont,
      color: rgb(0, 0, 0),
    });
    
    // Securities rows
    page.drawText('Apple Inc.', {
      x: 50,
      y: height - 370,
      size: 12,
      font: timesRomanFont,
      color: rgb(0, 0, 0),
    });
    
    page.drawText('US0378331005', {
      x: 200,
      y: height - 370,
      size: 12,
      font: timesRomanFont,
      color: rgb(0, 0, 0),
    });
    
    page.drawText('1,200', {
      x: 350,
      y: height - 370,
      size: 12,
      font: timesRomanFont,
      color: rgb(0, 0, 0),
    });
    
    page.drawText('$175.00', {
      x: 450,
      y: height - 370,
      size: 12,
      font: timesRomanFont,
      color: rgb(0, 0, 0),
    });
    
    page.drawText('Microsoft Corp.', {
      x: 50,
      y: height - 400,
      size: 12,
      font: timesRomanFont,
      color: rgb(0, 0, 0),
    });
    
    page.drawText('US5949181045', {
      x: 200,
      y: height - 400,
      size: 12,
      font: timesRomanFont,
      color: rgb(0, 0, 0),
    });
    
    page.drawText('800', {
      x: 350,
      y: height - 400,
      size: 12,
      font: timesRomanFont,
      color: rgb(0, 0, 0),
    });
    
    page.drawText('$225.00', {
      x: 450,
      y: height - 400,
      size: 12,
      font: timesRomanFont,
      color: rgb(0, 0, 0),
    });
    
    const pdfBytes = await pdfDoc.save();
    fs.writeFileSync(testPdfPath, pdfBytes);
    console.log(`Created test PDF at ${testPdfPath}`);
  }
  
  createTestPdf().catch(console.error);
}

test.describe('Document Processing Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto(config.baseUrl);
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Take a screenshot of the homepage
    await page.screenshot({ path: path.join(config.screenshotsDir, '01-homepage.png') });
  });
  
  test('Upload and process a document', async ({ page }) => {
    // Navigate to the upload page
    await page.click('a:has-text("Upload")');
    await page.waitForLoadState('networkidle');
    
    // Take a screenshot of the upload page
    await page.screenshot({ path: path.join(config.screenshotsDir, '02-upload-page.png') });
    
    // Check if the upload form is visible
    const uploadForm = page.locator('.upload-form');
    await expect(uploadForm).toBeVisible();
    
    // Set the document type
    await page.selectOption('select#document-type', 'Financial Report');
    
    // Upload the test PDF
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(testPdfPath);
    
    // Wait for the file to be selected
    await page.waitForSelector('.file-info:has-text("test-document.pdf")');
    
    // Take a screenshot of the upload form with file selected
    await page.screenshot({ path: path.join(config.screenshotsDir, '03-file-selected.png') });
    
    // Click the upload button
    await page.click('button:has-text("Upload")');
    
    // Wait for the upload to complete
    await page.waitForSelector('.upload-success', { timeout: config.testTimeout });
    
    // Take a screenshot of the upload success
    await page.screenshot({ path: path.join(config.screenshotsDir, '04-upload-success.png') });
    
    // Navigate to the documents page
    await page.click('a:has-text("Documents")');
    await page.waitForLoadState('networkidle');
    
    // Take a screenshot of the documents page
    await page.screenshot({ path: path.join(config.screenshotsDir, '05-documents-page.png') });
    
    // Check if the document is listed
    const documentCard = page.locator('.document-card');
    await expect(documentCard).toBeVisible();
    
    // Click on the document to view details
    await documentCard.click();
    await page.waitForLoadState('networkidle');
    
    // Take a screenshot of the document details page
    await page.screenshot({ path: path.join(config.screenshotsDir, '06-document-details.png') });
    
    // Check if the document details are displayed
    const documentHeader = page.locator('.document-header');
    await expect(documentHeader).toBeVisible();
    
    // Check if the process button is visible
    const processButton = page.locator('#process-document-btn');
    await expect(processButton).toBeVisible();
    
    // Click the process button
    await processButton.click();
    
    // Wait for processing to start
    await page.waitForSelector('#processing-status:visible', { timeout: config.testTimeout });
    
    // Take a screenshot of the processing status
    await page.screenshot({ path: path.join(config.screenshotsDir, '07-processing-started.png') });
    
    // Wait for processing to complete (this may take some time)
    await page.waitForSelector('.status-processed', { timeout: config.testTimeout * 2 });
    
    // Take a screenshot of the processed document
    await page.screenshot({ path: path.join(config.screenshotsDir, '08-processing-complete.png') });
    
    // Check if the processed content is displayed
    const processedContent = page.locator('.processed-content');
    await expect(processedContent).toBeVisible();
    
    // Check if the extracted text is displayed
    const textContent = page.locator('.text-content');
    await expect(textContent).toBeVisible();
    
    // Check if the tables are displayed
    const tablesSection = page.locator('.tables-list');
    await expect(tablesSection).toBeVisible();
    
    // Check if the securities are displayed
    const securitiesSection = page.locator('.securities-list');
    await expect(securitiesSection).toBeVisible();
    
    // Take a screenshot of the processed content
    await page.screenshot({ path: path.join(config.screenshotsDir, '09-processed-content.png') });
  });
  
  test('View document details and reprocess', async ({ page }) => {
    // Navigate to the documents page
    await page.click('a:has-text("Documents")');
    await page.waitForLoadState('networkidle');
    
    // Take a screenshot of the documents page
    await page.screenshot({ path: path.join(config.screenshotsDir, '10-documents-page.png') });
    
    // Check if any document is listed
    const documentCard = page.locator('.document-card');
    if (await documentCard.count() === 0) {
      test.skip('No documents found to test');
    }
    
    // Click on the first document to view details
    await documentCard.first().click();
    await page.waitForLoadState('networkidle');
    
    // Take a screenshot of the document details page
    await page.screenshot({ path: path.join(config.screenshotsDir, '11-document-details.png') });
    
    // Check if the document details are displayed
    const documentHeader = page.locator('.document-header');
    await expect(documentHeader).toBeVisible();
    
    // Check if the document is already processed
    const reprocessButton = page.locator('#reprocess-document-btn');
    if (await reprocessButton.isVisible()) {
      // Click the reprocess button
      await reprocessButton.click();
      
      // Wait for processing to start
      await page.waitForSelector('#processing-status:visible', { timeout: config.testTimeout });
      
      // Take a screenshot of the reprocessing status
      await page.screenshot({ path: path.join(config.screenshotsDir, '12-reprocessing-started.png') });
      
      // Wait for processing to complete (this may take some time)
      await page.waitForSelector('.status-processed', { timeout: config.testTimeout * 2 });
      
      // Take a screenshot of the reprocessed document
      await page.screenshot({ path: path.join(config.screenshotsDir, '13-reprocessing-complete.png') });
      
      // Check if the processed content is displayed
      const processedContent = page.locator('.processed-content');
      await expect(processedContent).toBeVisible();
    } else {
      // If the document is not processed, check for the process button
      const processButton = page.locator('#process-document-btn');
      if (await processButton.isVisible()) {
        // Click the process button
        await processButton.click();
        
        // Wait for processing to start
        await page.waitForSelector('#processing-status:visible', { timeout: config.testTimeout });
        
        // Take a screenshot of the processing status
        await page.screenshot({ path: path.join(config.screenshotsDir, '12-processing-started.png') });
        
        // Wait for processing to complete (this may take some time)
        await page.waitForSelector('.status-processed', { timeout: config.testTimeout * 2 });
        
        // Take a screenshot of the processed document
        await page.screenshot({ path: path.join(config.screenshotsDir, '13-processing-complete.png') });
        
        // Check if the processed content is displayed
        const processedContent = page.locator('.processed-content');
        await expect(processedContent).toBeVisible();
      } else {
        console.log('Document is neither processed nor has a process button');
      }
    }
  });
  
  test('Process document from documents page', async ({ page }) => {
    // Navigate to the documents page
    await page.click('a:has-text("Documents")');
    await page.waitForLoadState('networkidle');
    
    // Take a screenshot of the documents page
    await page.screenshot({ path: path.join(config.screenshotsDir, '14-documents-page.png') });
    
    // Check if any unprocessed document is listed
    const processButton = page.locator('.process-btn');
    if (await processButton.count() === 0) {
      test.skip('No unprocessed documents found to test');
    }
    
    // Click the process button on the first unprocessed document
    await processButton.first().click();
    
    // Wait for processing to start
    await page.waitForTimeout(1000); // Wait for the UI to update
    
    // Take a screenshot of the processing status
    await page.screenshot({ path: path.join(config.screenshotsDir, '15-processing-started-from-list.png') });
    
    // Wait for processing to complete (this may take some time)
    await page.waitForTimeout(10000); // Wait for processing to complete
    
    // Refresh the documents page
    await page.click('a:has-text("Documents")');
    await page.waitForLoadState('networkidle');
    
    // Take a screenshot of the documents page after processing
    await page.screenshot({ path: path.join(config.screenshotsDir, '16-documents-page-after-processing.png') });
    
    // Check if the document is now processed
    const documentCard = page.locator('.document-card:has(.status-processed)');
    await expect(documentCard).toBeVisible();
  });
  
  test('Download a processed document', async ({ page }) => {
    // Navigate to the documents page
    await page.click('a:has-text("Documents")');
    await page.waitForLoadState('networkidle');
    
    // Take a screenshot of the documents page
    await page.screenshot({ path: path.join(config.screenshotsDir, '17-documents-page.png') });
    
    // Check if any document is listed
    const documentCard = page.locator('.document-card');
    if (await documentCard.count() === 0) {
      test.skip('No documents found to test');
    }
    
    // Click on the first document to view details
    await documentCard.first().click();
    await page.waitForLoadState('networkidle');
    
    // Take a screenshot of the document details page
    await page.screenshot({ path: path.join(config.screenshotsDir, '18-document-details.png') });
    
    // Check if the download button is visible
    const downloadButton = page.locator('#download-document-btn');
    await expect(downloadButton).toBeVisible();
    
    // Set up download listener
    const downloadPromise = page.waitForEvent('download');
    
    // Click the download button
    await downloadButton.click();
    
    // Wait for the download to start
    const download = await downloadPromise;
    
    // Get the download path
    const downloadPath = path.join(config.screenshotsDir, download.suggestedFilename());
    
    // Save the downloaded file
    await download.saveAs(downloadPath);
    
    // Check if the file was downloaded
    expect(fs.existsSync(downloadPath)).toBeTruthy();
    
    // Take a screenshot after download
    await page.screenshot({ path: path.join(config.screenshotsDir, '19-after-download.png') });
  });
});
