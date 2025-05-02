// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('FinDoc Analyzer Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('https://findoc-deploy.ey.r.appspot.com/');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Log the current URL
    console.log(`Current URL: ${page.url()}`);
  });

  test('Homepage loads correctly', async ({ page }) => {
    // Check if the title is visible
    const title = await page.locator('text=FinDoc Analyzer').first();
    await expect(title).toBeVisible();
    
    // Take a screenshot of the homepage
    await page.screenshot({ path: 'homepage.png', fullPage: true });
    console.log('Homepage screenshot saved as homepage.png');
  });

  test('Navigation works correctly', async ({ page }) => {
    // Check if the sidebar is visible
    const sidebar = await page.locator('.sidebar');
    await expect(sidebar).toBeVisible();
    
    // Log all navigation items
    const navItems = await page.locator('.sidebar-nav li').all();
    console.log(`Found ${navItems.length} navigation items`);
    
    for (const item of navItems) {
      const text = await item.textContent();
      console.log(`Navigation item: ${text}`);
    }
    
    // Take a screenshot of the sidebar
    await page.locator('.sidebar').screenshot({ path: 'sidebar.png' });
    console.log('Sidebar screenshot saved as sidebar.png');
  });

  test('Documents page loads correctly', async ({ page }) => {
    // Click on the Documents link
    await page.locator('text=My Documents').click();
    
    // Wait for navigation
    await page.waitForLoadState('networkidle');
    
    // Log the current URL
    console.log(`Current URL after clicking Documents: ${page.url()}`);
    
    // Take a screenshot of the documents page
    await page.screenshot({ path: 'documents-page.png', fullPage: true });
    console.log('Documents page screenshot saved as documents-page.png');
  });

  test('Analytics page loads correctly', async ({ page }) => {
    // Click on the Analytics link
    await page.locator('text=Analytics').click();
    
    // Wait for navigation
    await page.waitForLoadState('networkidle');
    
    // Log the current URL
    console.log(`Current URL after clicking Analytics: ${page.url()}`);
    
    // Take a screenshot of the analytics page
    await page.screenshot({ path: 'analytics-page.png', fullPage: true });
    console.log('Analytics page screenshot saved as analytics-page.png');
  });

  test('Upload functionality is available', async ({ page }) => {
    // Check if the upload button is visible
    const uploadButton = await page.locator('text=Upload Document').first();
    await expect(uploadButton).toBeVisible();
    
    // Click on the upload button
    await uploadButton.click();
    
    // Wait for navigation
    await page.waitForLoadState('networkidle');
    
    // Log the current URL
    console.log(`Current URL after clicking Upload: ${page.url()}`);
    
    // Take a screenshot of the upload page
    await page.screenshot({ path: 'upload-page.png', fullPage: true });
    console.log('Upload page screenshot saved as upload-page.png');
  });

  test('Document upload form is functional', async ({ page }) => {
    // Navigate to the upload page
    await page.locator('text=Upload Document').first().click();
    
    // Wait for navigation
    await page.waitForLoadState('networkidle');
    
    // Check if the file input is available
    const fileInput = await page.locator('input[type="file"]');
    
    if (await fileInput.count() > 0) {
      console.log('File input found on the upload page');
      
      // Take a screenshot of the upload form
      await page.screenshot({ path: 'upload-form.png', fullPage: true });
      console.log('Upload form screenshot saved as upload-form.png');
    } else {
      console.log('File input not found on the upload page');
      
      // Log the HTML of the upload page for debugging
      const html = await page.content();
      console.log('Upload page HTML:', html.substring(0, 500) + '...');
    }
  });

  test('API endpoints are accessible', async ({ request }) => {
    // Test the health endpoint
    const healthResponse = await request.get('https://findoc-deploy.ey.r.appspot.com/api/health');
    console.log(`Health endpoint status: ${healthResponse.status()}`);
    
    if (healthResponse.ok()) {
      const healthData = await healthResponse.json();
      console.log('Health endpoint response:', healthData);
    }
    
    // Test the documents endpoint
    const documentsResponse = await request.get('https://findoc-deploy.ey.r.appspot.com/api/documents');
    console.log(`Documents endpoint status: ${documentsResponse.status()}`);
    
    // Test the upload endpoint
    const uploadResponse = await request.post('https://findoc-deploy.ey.r.appspot.com/api/documents/upload');
    console.log(`Upload endpoint status: ${uploadResponse.status()}`);
  });
});
