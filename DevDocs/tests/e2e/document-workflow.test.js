/**
 * End-to-End Test for Document Workflow
 * 
 * This test verifies the complete workflow for document processing in the FinDoc Analyzer application.
 * It tests uploading, processing, analyzing, and exporting a financial document.
 */

const { setupBrowser, login, uploadDocument, processDocument, navigateToAnalysis, teardownBrowser } = require('./setup');
const path = require('path');

describe('Document Workflow End-to-End Test', () => {
  let browser, page;
  const testDocumentPath = path.join(__dirname, '../../test-data/sample_portfolio.pdf');
  const documentName = 'sample_portfolio.pdf';

  // Set up browser before tests
  beforeAll(async () => {
    const setup = await setupBrowser({ recordVideo: true });
    browser = setup.browser;
    page = setup.page;
  });

  // Clean up after tests
  afterAll(async () => {
    await teardownBrowser(browser);
  });

  // Test the complete document workflow
  test('Complete document workflow', async () => {
    // Step 1: Login
    await login(page);
    await page.takeScreenshot('after_login');

    // Step 2: Upload document
    await uploadDocument(page, testDocumentPath);
    await page.takeScreenshot('after_upload');

    // Step 3: Process document
    await processDocument(page, documentName);
    await page.takeScreenshot('after_processing');

    // Step 4: Navigate to analysis page
    await navigateToAnalysis(page, documentName);
    await page.takeScreenshot('analysis_dashboard');

    // Step 5: Verify portfolio data
    await expect(page.locator('.portfolio-summary')).toBeVisible();
    await expect(page.locator('.security-list')).toContainText('Apple Inc.');
    await expect(page.locator('.total-value')).toContainText('$');

    // Step 6: Test visualization components
    await page.click('.chart-selector >> text=Allocation');
    await expect(page.locator('.pie-chart')).toBeVisible();
    await page.takeScreenshot('allocation_chart');

    await page.click('.chart-selector >> text=Performance');
    await expect(page.locator('.line-chart')).toBeVisible();
    await page.takeScreenshot('performance_chart');

    // Step 7: Test agent execution
    await page.click('.run-agent-button');
    await page.selectOption('.agent-selector', 'FinancialAdvisorAgent');
    await page.click('.execute-agent-button');
    await page.waitForSelector('.agent-results', { state: 'visible' });
    await page.takeScreenshot('agent_results');

    // Step 8: Test data export
    await page.click('.export-button');
    await page.selectOption('.export-format', 'PDF');
    const downloadPromise = page.waitForEvent('download');
    await page.click('.download-button');
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('analysis');
    await page.takeScreenshot('after_export');
  }, 300000); // 5 minutes timeout for the entire test

  // Test document comparison workflow
  test('Document comparison workflow', async () => {
    // Step 1: Login (if not already logged in)
    if (!await page.isVisible('header .user-profile')) {
      await login(page);
    }

    // Step 2: Navigate to documents page
    await page.goto(BASE_URL + '/documents');
    await page.takeScreenshot('documents_page');

    // Step 3: Select documents for comparison
    await page.click('.document-list .document-item:nth-child(1) .checkbox');
    await page.click('.document-list .document-item:nth-child(2) .checkbox');
    
    // Step 4: Click compare button
    await page.click('.compare-button');
    await page.waitForSelector('.comparison-results', { state: 'visible' });
    await page.takeScreenshot('comparison_results');

    // Step 5: Verify comparison results
    await expect(page.locator('.comparison-summary')).toBeVisible();
    await expect(page.locator('.changes-table')).toBeVisible();
    
    // Step 6: Test different comparison views
    await page.click('.view-selector >> text=Changes Only');
    await page.takeScreenshot('changes_only_view');
    
    await page.click('.view-selector >> text=Side by Side');
    await page.takeScreenshot('side_by_side_view');
    
    // Step 7: Export comparison report
    await page.click('.export-comparison-button');
    const downloadPromise = page.waitForEvent('download');
    await page.click('.download-button');
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('comparison');
    await page.takeScreenshot('after_comparison_export');
  }, 300000); // 5 minutes timeout for the entire test
});
