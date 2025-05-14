/**
 * End-to-End Test for Agent Workspace
 * 
 * This test verifies the functionality of the Agent Workspace, including
 * agent selection, pipeline creation, execution, and results visualization.
 */

const { setupBrowser, login, uploadDocument, teardownBrowser } = require('./setup');
const path = require('path');

describe('Agent Workspace End-to-End Test', () => {
  let browser, page;
  const testDocumentPath = path.join(__dirname, '../../test-data/sample_portfolio.pdf');
  const documentName = 'sample_portfolio.pdf';

  // Set up browser before tests
  beforeAll(async () => {
    const setup = await setupBrowser({ recordVideo: true });
    browser = setup.browser;
    page = setup.page;
    
    // Login and upload a test document for use in tests
    await login(page);
    await uploadDocument(page, testDocumentPath);
  });

  // Clean up after tests
  afterAll(async () => {
    await teardownBrowser(browser);
  });

  // Test navigating to agent workspace
  test('Navigate to agent workspace', async () => {
    // Navigate to agent workspace
    await page.goto(BASE_URL + '/agents');
    await page.waitForSelector('.agent-workspace', { state: 'visible' });
    await page.takeScreenshot('agent_workspace');
    
    // Verify workspace components are visible
    await expect(page.locator('.agent-list')).toBeVisible();
    await expect(page.locator('.pipeline-builder')).toBeVisible();
    await expect(page.locator('.agent-details')).toBeVisible();
  }, 30000);

  // Test agent selection and details
  test('Agent selection and details', async () => {
    // Select an agent from the list
    await page.click('.agent-list .agent-item:has-text("ISINExtractorAgent")');
    await page.takeScreenshot('agent_details');
    
    // Verify agent details are displayed
    await expect(page.locator('.agent-details .agent-name')).toContainText('ISINExtractorAgent');
    await expect(page.locator('.agent-details .agent-description')).toBeVisible();
    await expect(page.locator('.agent-details .agent-parameters')).toBeVisible();
    
    // Select a different agent
    await page.click('.agent-list .agent-item:has-text("FinancialAdvisorAgent")');
    await page.takeScreenshot('financial_advisor_agent');
    
    // Verify new agent details are displayed
    await expect(page.locator('.agent-details .agent-name')).toContainText('FinancialAdvisorAgent');
  }, 30000);

  // Test creating a pipeline
  test('Create agent pipeline', async () => {
    // Clear existing pipeline if any
    if (await page.isVisible('.pipeline-builder .clear-pipeline-button')) {
      await page.click('.pipeline-builder .clear-pipeline-button');
    }
    
    // Add agents to pipeline
    await page.dragAndDrop(
      '.agent-list .agent-item:has-text("ISINExtractorAgent")', 
      '.pipeline-builder .drop-zone'
    );
    await page.takeScreenshot('first_agent_added');
    
    await page.dragAndDrop(
      '.agent-list .agent-item:has-text("FinancialTableDetectorAgent")', 
      '.pipeline-builder .drop-zone'
    );
    await page.takeScreenshot('second_agent_added');
    
    await page.dragAndDrop(
      '.agent-list .agent-item:has-text("FinancialDataAnalyzerAgent")', 
      '.pipeline-builder .drop-zone'
    );
    await page.takeScreenshot('third_agent_added');
    
    // Verify agents appear in the pipeline
    const pipelineAgentsCount = await page.locator('.pipeline-builder .pipeline-agent').count();
    expect(pipelineAgentsCount).toBe(3);
    
    // Save pipeline
    await page.fill('.pipeline-name-input', 'Test Pipeline');
    await page.click('.save-pipeline-button');
    await page.waitForSelector('.pipeline-saved-message', { state: 'visible' });
    await page.takeScreenshot('pipeline_saved');
  }, 60000);

  // Test executing a pipeline
  test('Execute agent pipeline', async () => {
    // Select a document
    await page.click('.document-selector');
    await page.click(`.document-dropdown-item:has-text("${documentName}")`);
    await page.takeScreenshot('document_selected');
    
    // Execute pipeline
    await page.click('.execute-pipeline-button');
    await page.waitForSelector('.execution-progress', { state: 'visible' });
    await page.takeScreenshot('execution_in_progress');
    
    // Wait for execution to complete
    await page.waitForSelector('.execution-complete', { state: 'visible', timeout: 60000 });
    await page.takeScreenshot('execution_complete');
    
    // Verify results are displayed
    await expect(page.locator('.results-panel')).toBeVisible();
    await expect(page.locator('.execution-status')).toContainText('Successful');
    
    // Check individual agent results
    await page.click('.agent-result-item:has-text("ISINExtractorAgent")');
    await page.takeScreenshot('isin_extractor_results');
    await expect(page.locator('.result-details')).toContainText('ISIN');
    
    await page.click('.agent-result-item:has-text("FinancialTableDetectorAgent")');
    await page.takeScreenshot('table_detector_results');
    await expect(page.locator('.result-details')).toContainText('Table');
    
    await page.click('.agent-result-item:has-text("FinancialDataAnalyzerAgent")');
    await page.takeScreenshot('data_analyzer_results');
    await expect(page.locator('.result-details')).toContainText('Analysis');
  }, 120000);

  // Test loading a saved pipeline
  test('Load saved pipeline', async () => {
    // Clear existing pipeline
    await page.click('.pipeline-builder .clear-pipeline-button');
    await page.takeScreenshot('pipeline_cleared');
    
    // Open load pipeline dialog
    await page.click('.load-pipeline-button');
    await page.waitForSelector('.pipeline-list', { state: 'visible' });
    await page.takeScreenshot('pipeline_list');
    
    // Select the previously saved pipeline
    await page.click('.pipeline-list-item:has-text("Test Pipeline")');
    await page.click('.load-selected-pipeline-button');
    await page.takeScreenshot('pipeline_loaded');
    
    // Verify pipeline was loaded correctly
    const pipelineAgentsCount = await page.locator('.pipeline-builder .pipeline-agent').count();
    expect(pipelineAgentsCount).toBe(3);
  }, 30000);

  // Test pipeline configuration
  test('Configure pipeline parameters', async () => {
    // Select the first agent in the pipeline
    await page.click('.pipeline-builder .pipeline-agent:first-child');
    await page.takeScreenshot('agent_selected_for_config');
    
    // Modify configuration
    await page.click('.agent-parameters .parameter-item:first-child .edit-button');
    await page.fill('.parameter-edit-input', 'test-value');
    await page.click('.save-parameter-button');
    await page.takeScreenshot('parameter_updated');
    
    // Verify configuration was saved
    await expect(page.locator('.agent-parameters .parameter-item:first-child .parameter-value'))
      .toContainText('test-value');
    
    // Save pipeline with new configuration
    await page.click('.save-pipeline-button');
    await page.waitForSelector('.pipeline-saved-message', { state: 'visible' });
    await page.takeScreenshot('configured_pipeline_saved');
  }, 30000);

  // Test viewing execution history
  test('View execution history', async () => {
    // Navigate to execution history
    await page.click('.execution-history-tab');
    await page.waitForSelector('.execution-history-list', { state: 'visible' });
    await page.takeScreenshot('execution_history');
    
    // Select an execution from history
    await page.click('.execution-history-item:first-child');
    await page.takeScreenshot('historical_execution');
    
    // Verify execution details are displayed
    await expect(page.locator('.execution-details')).toBeVisible();
    await expect(page.locator('.execution-timestamp')).toBeVisible();
    await expect(page.locator('.execution-pipeline-name')).toBeVisible();
    
    // Check historical results
    await expect(page.locator('.historical-results')).toBeVisible();
  }, 30000);
});
