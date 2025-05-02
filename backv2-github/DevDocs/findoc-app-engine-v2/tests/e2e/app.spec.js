/**
 * End-to-end tests for the application
 */

const { test, expect } = require('@playwright/test');

test.describe('FinDoc Analyzer App', () => {
  test('should load the homepage', async ({ page }) => {
    await page.goto('/');
    
    // Check if the title is correct
    await expect(page).toHaveTitle(/FinDoc Analyzer/);
    
    // Check if the sidebar is visible
    await expect(page.locator('.sidebar')).toBeVisible();
    
    // Check if the app title is visible
    await expect(page.locator('.app-title')).toBeVisible();
    await expect(page.locator('.app-title')).toHaveText('FinDocs Pro');
  });
  
  test('should navigate to different sections', async ({ page }) => {
    await page.goto('/');
    
    // Navigate to Upload section
    await page.locator('a[data-section="upload"]').click();
    await expect(page.locator('#upload-section')).toBeVisible();
    await expect(page.locator('#upload-section .page-title')).toHaveText('Upload Document');
    
    // Navigate to Analytics section
    await page.locator('a[data-section="analytics"]').click();
    await expect(page.locator('#analytics-section')).toBeVisible();
    await expect(page.locator('#analytics-section .page-title')).toHaveText('Analytics');
    
    // Navigate to RAG section
    await page.locator('a[data-section="rag"]').click();
    await expect(page.locator('#rag-section')).toBeVisible();
    await expect(page.locator('#rag-section .page-title')).toHaveText('RAG Precision');
  });
  
  test('should show upload interface', async ({ page }) => {
    await page.goto('/');
    
    // Navigate to Upload section
    await page.locator('a[data-section="upload"]').click();
    
    // Check if upload area is visible
    await expect(page.locator('#upload-area')).toBeVisible();
    
    // The file input is hidden but should exist
    await expect(page.locator('#file-input')).toBeHidden();
    
    // Check if upload button is present
    await expect(page.locator('.upload-button')).toBeVisible();
  });
  
  test('should show RAG chat interface', async ({ page }) => {
    await page.goto('/');
    
    // Navigate to RAG section
    await page.locator('a[data-section="rag"]').click();
    
    // Check if chat interface is visible
    await expect(page.locator('.rag-chat')).toBeVisible();
    
    // Check if chat input is present
    await expect(page.locator('#rag-chat-input-field')).toBeVisible();
    
    // Check if send button is present
    await expect(page.locator('#rag-chat-send-btn')).toBeVisible();
    
    // Check if example questions are present
    await expect(page.locator('.rag-examples-list')).toBeVisible();
    await expect(page.locator('.rag-example-btn').first()).toBeVisible();
  });
  
  // Add more tests for other UI components and interactions
});
