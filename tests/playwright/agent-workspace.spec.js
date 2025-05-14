const { test, expect } = require('@playwright/test');
const path = require('path');
const { login } = require('./utils/test-helpers');

test.describe('Agent Workspace', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await login(page);
  });

  test('should display agent workspace', async ({ page }) => {
    await page.goto('/agents');
    await expect(page).toHaveTitle(/Agents/);
    await expect(page.locator('[data-testid="agent-workspace"]')).toBeVisible();
  });

  test('should list available agents', async ({ page }) => {
    await page.goto('/agents');
    
    // Check that agent list is shown
    await expect(page.locator('[data-testid="agent-list"]')).toBeVisible();
    
    // Check that some agents are listed
    await expect(page.locator('[data-testid="agent-item"]')).toHaveCount({ min: 3 });
    
    // Check specific agents
    await expect(page.locator('[data-testid="agent-item"]:has-text("ISINExtractorAgent")')).toBeVisible();
    await expect(page.locator('[data-testid="agent-item"]:has-text("FinancialTableDetectorAgent")')).toBeVisible();
    await expect(page.locator('[data-testid="agent-item"]:has-text("FinancialDataAnalyzerAgent")')).toBeVisible();
  });

  test('should show agent details', async ({ page }) => {
    await page.goto('/agents');
    
    // Click on an agent
    await page.click('[data-testid="agent-item"]:has-text("ISINExtractorAgent")');
    
    // Check that agent details are shown
    await expect(page.locator('[data-testid="agent-details"]')).toBeVisible();
    await expect(page.locator('[data-testid="agent-name"]')).toContainText('ISINExtractorAgent');
    await expect(page.locator('[data-testid="agent-description"]')).toBeVisible();
    await expect(page.locator('[data-testid="agent-parameters"]')).toBeVisible();
  });

  test('should create a new pipeline', async ({ page }) => {
    await page.goto('/agents');
    
    // Click create pipeline button
    await page.click('[data-testid="create-pipeline-button"]');
    
    // Check that pipeline builder is shown
    await expect(page.locator('[data-testid="pipeline-builder"]')).toBeVisible();
    
    // Add agents to pipeline
    await page.dragAndDrop(
      '[data-testid="agent-item"]:has-text("ISINExtractorAgent")',
      '[data-testid="pipeline-drop-zone"]'
    );
    
    await page.dragAndDrop(
      '[data-testid="agent-item"]:has-text("FinancialTableDetectorAgent")',
      '[data-testid="pipeline-drop-zone"]'
    );
    
    // Verify agents are added to pipeline
    await expect(page.locator('[data-testid="pipeline-agent"]')).toHaveCount(2);
    
    // Name the pipeline
    await page.fill('[data-testid="pipeline-name-input"]', 'Test Pipeline');
    
    // Save pipeline
    await page.click('[data-testid="save-pipeline-button"]');
    
    // Check that pipeline is saved
    await expect(page.locator('[data-testid="pipeline-saved-message"]')).toBeVisible();
  });

  test('should load a saved pipeline', async ({ page }) => {
    await page.goto('/agents');
    
    // Click load pipeline button
    await page.click('[data-testid="load-pipeline-button"]');
    
    // Check that pipeline list is shown
    await expect(page.locator('[data-testid="pipeline-list"]')).toBeVisible();
    
    // Select a pipeline
    await page.click('[data-testid="pipeline-list-item"]:first-child');
    
    // Load pipeline
    await page.click('[data-testid="load-pipeline-button-confirm"]');
    
    // Check that pipeline is loaded
    await expect(page.locator('[data-testid="pipeline-loaded-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="pipeline-agent"]')).toHaveCount({ min: 1 });
  });

  test('should execute an agent on a document', async ({ page }) => {
    await page.goto('/agents');
    
    // Select an agent
    await page.click('[data-testid="agent-item"]:has-text("ISINExtractorAgent")');
    
    // Click execute button
    await page.click('[data-testid="execute-agent-button"]');
    
    // Select a document
    await page.click('[data-testid="document-selector"]');
    await page.click('[data-testid="document-option"]:first-child');
    
    // Configure agent parameters
    await page.check('[data-testid="agent-param-validateISIN"]');
    
    // Start execution
    await page.click('[data-testid="start-execution-button"]');
    
    // Wait for execution to complete
    await page.waitForSelector('[data-testid="execution-complete"]', { timeout: 60000 });
    
    // Check execution results
    await expect(page.locator('[data-testid="execution-results"]')).toBeVisible();
    await expect(page.locator('[data-testid="extraction-results"]')).toBeVisible();
  }, 90000); // Longer timeout for execution

  test('should execute a pipeline on a document', async ({ page }) => {
    await page.goto('/agents');
    
    // Make sure there's a pipeline
    if (await page.locator('[data-testid="pipeline-agent"]').count() === 0) {
      // Create a simple pipeline if none exists
      await page.click('[data-testid="create-pipeline-button"]');
      
      await page.dragAndDrop(
        '[data-testid="agent-item"]:has-text("ISINExtractorAgent")',
        '[data-testid="pipeline-drop-zone"]'
      );
      
      await page.fill('[data-testid="pipeline-name-input"]', 'Test Pipeline');
      await page.click('[data-testid="save-pipeline-button"]');
      await page.waitForSelector('[data-testid="pipeline-saved-message"]');
    }
    
    // Click execute pipeline button
    await page.click('[data-testid="execute-pipeline-button"]');
    
    // Select a document
    await page.click('[data-testid="document-selector"]');
    await page.click('[data-testid="document-option"]:first-child');
    
    // Start execution
    await page.click('[data-testid="start-pipeline-execution-button"]');
    
    // Wait for execution to complete
    await page.waitForSelector('[data-testid="pipeline-execution-complete"]', { timeout: 90000 });
    
    // Check execution results
    await expect(page.locator('[data-testid="pipeline-execution-results"]')).toBeVisible();
  }, 120000); // Longer timeout for pipeline execution

  test('should view execution history', async ({ page }) => {
    await page.goto('/agents/executions');
    
    // Check that execution history is shown
    await expect(page.locator('[data-testid="execution-history"]')).toBeVisible();
    
    // Check that some executions are listed
    await expect(page.locator('[data-testid="execution-history-item"]')).toHaveCount({ min: 1 });
    
    // Click on an execution
    await page.click('[data-testid="execution-history-item"]:first-child');
    
    // Check that execution details are shown
    await expect(page.locator('[data-testid="execution-details"]')).toBeVisible();
    await expect(page.locator('[data-testid="execution-timestamp"]')).toBeVisible();
    await expect(page.locator('[data-testid="execution-status"]')).toBeVisible();
    await expect(page.locator('[data-testid="execution-results"]')).toBeVisible();
  });

  test('should configure agent parameters', async ({ page }) => {
    await page.goto('/agents');
    
    // Select an agent
    await page.click('[data-testid="agent-item"]:has-text("FinancialAdvisorAgent")');
    
    // Check that agent parameters are shown
    await expect(page.locator('[data-testid="agent-parameters"]')).toBeVisible();
    
    // Change a parameter
    await page.selectOption('[data-testid="agent-param-riskProfile"]', 'aggressive');
    
    // Save configuration
    await page.click('[data-testid="save-agent-config-button"]');
    
    // Check that configuration is saved
    await expect(page.locator('[data-testid="agent-config-saved-message"]')).toBeVisible();
  });
});
