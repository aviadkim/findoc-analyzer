import { test, expect } from '@playwright/test';
import { UploadPage } from './pages/UploadPage';
import { DocumentsPage } from './pages/DocumentsPage';
import { DocumentDetailsPage } from './pages/DocumentDetailsPage';
import { TestDataHelper } from './helpers/TestDataHelper';

test.describe('Document Processing Workflow with Page Object Model', () => {
  let uploadPage: UploadPage;
  let documentsPage: DocumentsPage;
  let documentDetailsPage: DocumentDetailsPage;
  let testDataHelper: TestDataHelper;

  // Before each test, create page object instances
  test.beforeEach(async ({ page }) => {
    uploadPage = new UploadPage(page);
    documentsPage = new DocumentsPage(page);
    documentDetailsPage = new DocumentDetailsPage(page);
    testDataHelper = TestDataHelper.getInstance();
    
    // Navigate to the upload page
    await uploadPage.goto();
  });

  test('should upload and process a document', async ({ page }) => {
    // Upload and process a file
    const samplePdfPath = 'test-data/sample_portfolio.pdf';
    await uploadPage.uploadAndProcessFile(samplePdfPath);
    
    // Verify securities were extracted
    await uploadPage.verifySecuritiesExtracted();
    
    // Navigate to document details
    await uploadPage.viewDocumentDetails();
    
    // Verify we're on the document details page
    expect(page.url()).toContain('/document/');
    
    // Verify document information is displayed
    await expect(documentDetailsPage.documentTitle).toBeVisible();
    await expect(documentDetailsPage.documentDetails).toBeVisible();
  });

  test('should show error for invalid document upload', async ({ page }) => {
    // Try to upload an invalid file
    const invalidFilePath = 'test-data/invalid-file.txt';
    await uploadPage.fileInput.setInputFiles(invalidFilePath);
    
    // Check for error message
    await expect(page.locator('text=Invalid file format')).toBeVisible({ timeout: 5000 });
  });

  test('should navigate through document workflow', async ({ page }) => {
    // Upload and process a file
    const samplePdfPath = 'test-data/sample_portfolio.pdf';
    await uploadPage.uploadAndProcessFile(samplePdfPath);
    
    // Navigate to documents page
    await page.click('a:has-text("Documents")');
    await expect(page.url()).toContain('/documents');
    
    // Verify document appears in the list
    await expect(documentsPage.documentCards).toBeVisible();
    
    // Click on the document
    await documentsPage.clickDocumentCard(0);
    
    // Verify document details page
    await expect(page.url()).toContain('/document/');
    
    // Check document actions are available
    await expect(documentDetailsPage.exportButton).toBeVisible();
    await expect(documentDetailsPage.askQuestionsButton).toBeVisible();
    
    // Open chat interface
    await documentDetailsPage.openChatInterface();
    
    // Send a question and verify response
    await documentDetailsPage.sendQuestion('What securities are in this document?');
    const responseText = await documentDetailsPage.getChatResponse();
    expect(responseText).toContain('securities');
  });

  test('should correctly display document on mobile viewport', async ({ page }) => {
    // Only run this test if viewport width is less than 768px
    const viewportSize = page.viewportSize();
    if (!viewportSize || viewportSize.width >= 768) {
      test.skip();
      return;
    }
    
    // Upload and process document
    const samplePdfPath = 'test-data/sample_portfolio.pdf';
    await uploadPage.uploadAndProcessFile(samplePdfPath);
    
    // Navigate to documents page
    await page.click('a:has-text("Documents")');
    
    // Click on document
    await documentsPage.clickDocumentCard(0);
    
    // Verify mobile-specific document viewer is used
    await documentDetailsPage.isMobileViewerActive();
    
    // Test mobile-specific features
    await documentDetailsPage.testMobileViewerFeatures();
  });

  test('should verify enhanced securities viewer behavior', async ({ page }) => {
    // Upload and process document
    const samplePdfPath = 'test-data/sample_portfolio.pdf';
    await uploadPage.uploadAndProcessFile(samplePdfPath);
    
    // Navigate to document details
    await uploadPage.viewDocumentDetails();
    
    // Check securities viewer behavior based on viewport size
    const viewportType = await documentDetailsPage.checkSecuritiesViewerBehavior();
    
    // Log the detected viewport type
    console.log(`Detected viewport type: ${viewportType}`);
  });

  test('should analyze document portfolio', async ({ page }) => {
    // Upload and process document
    const samplePdfPath = 'test-data/sample_portfolio.pdf';
    await uploadPage.uploadAndProcessFile(samplePdfPath);
    
    // Navigate to document details
    await uploadPage.viewDocumentDetails();
    
    // Run analysis
    await documentDetailsPage.analyzeDocument();
    
    // Verify analysis results
    await documentDetailsPage.verifyAnalysisResults();
  });

  test('should export document data', async ({ page, browserName }) => {
    // Skip this test in WebKit due to different download handling
    test.skip(browserName === 'webkit', 'Download handling needs different approach in WebKit');
    
    // Upload and process document
    const samplePdfPath = 'test-data/sample_portfolio.pdf';
    await uploadPage.uploadAndProcessFile(samplePdfPath);
    
    // Navigate to document details
    await uploadPage.viewDocumentDetails();
    
    // Export document as CSV
    const download = await documentDetailsPage.exportDocument('CSV');
    
    // Verify file name contains 'securities'
    expect(download.suggestedFilename()).toContain('securities');
    
    // Check file extension matches selected format
    expect(download.suggestedFilename()).toMatch(/\.csv$/i);
  });
});