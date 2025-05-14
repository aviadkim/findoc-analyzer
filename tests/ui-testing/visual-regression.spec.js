/**
 * Visual Regression Tests
 * 
 * Tests the application for visual regressions using screenshot comparisons.
 * 
 * Note: This test assumes that reference screenshots have been generated previously.
 * If not, it will generate reference screenshots on the first run.
 */

const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');
const pixelmatch = require('pixelmatch');
const { PNG } = require('pngjs');

// Pages to test
const pages = [
  { path: '/', name: 'Home' },
  { path: '/documents-new', name: 'Documents' },
  { path: '/upload', name: 'Upload' },
  { path: '/document-chat', name: 'DocumentChat' },
  { path: '/analytics-new', name: 'Analytics' }
];

// Viewports to test
const viewports = {
  mobile: { width: 360, height: 640 },
  tablet: { width: 768, height: 1024 },
  desktop: { width: 1280, height: 720 }
};

// Directories for screenshots
const screenshotsDir = path.join(__dirname, 'visual-regression');
const referenceDir = path.join(screenshotsDir, 'reference');
const currentDir = path.join(screenshotsDir, 'current');
const diffDir = path.join(screenshotsDir, 'diff');

// Create directories if they don't exist
[screenshotsDir, referenceDir, currentDir, diffDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

/**
 * Compare screenshots
 * @param {string} name - Screenshot name
 * @returns {Promise<{diffPixels: number, diffPercentage: number}>} - Comparison results
 */
async function compareScreenshots(name) {
  const referencePath = path.join(referenceDir, `${name}.png`);
  const currentPath = path.join(currentDir, `${name}.png`);
  const diffPath = path.join(diffDir, `${name}.png`);
  
  // If reference doesn't exist, copy current as reference
  if (!fs.existsSync(referencePath)) {
    console.log(`Reference screenshot doesn't exist: ${name}. Creating it.`);
    fs.copyFileSync(currentPath, referencePath);
    return { diffPixels: 0, diffPercentage: 0 };
  }
  
  // Read screenshots
  const referenceImg = PNG.sync.read(fs.readFileSync(referencePath));
  const currentImg = PNG.sync.read(fs.readFileSync(currentPath));
  
  // Create diff image
  const { width, height } = referenceImg;
  const diffImg = new PNG({ width, height });
  
  // Compare images
  const diffPixels = pixelmatch(
    referenceImg.data,
    currentImg.data,
    diffImg.data,
    width,
    height,
    { threshold: 0.1 }
  );
  
  // Calculate percentage
  const totalPixels = width * height;
  const diffPercentage = (diffPixels / totalPixels) * 100;
  
  // Save diff image
  fs.writeFileSync(diffPath, PNG.sync.write(diffImg));
  
  return { diffPixels, diffPercentage };
}

test.describe('Visual Regression', () => {
  
  for (const [viewportName, viewport] of Object.entries(viewports)) {
    for (const { path, name } of pages) {
      test(`${name} page should match reference on ${viewportName}`, async ({ page }) => {
        // Set viewport
        await page.setViewportSize(viewport);
        
        // Navigate to the page
        await page.goto(path);
        await page.waitForLoadState('networkidle');
        
        // Wait a bit for any animations to complete
        await page.waitForTimeout(1000);
        
        // Take screenshot
        const screenshotName = `${name.toLowerCase()}-${viewportName}`;
        await page.screenshot({ path: path.join(currentDir, `${screenshotName}.png`), fullPage: true });
        
        // Compare with reference
        const { diffPixels, diffPercentage } = await compareScreenshots(screenshotName);
        
        // Log results
        console.log(`Comparison results for ${screenshotName}:`);
        console.log(`  Diff pixels: ${diffPixels}`);
        console.log(`  Diff percentage: ${diffPercentage.toFixed(2)}%`);
        
        // Verify difference is below threshold
        // A small threshold allows for minor rendering differences
        expect(diffPercentage).toBeLessThan(5);
      });
    }
  }
  
  // Test specific UI components
  const components = [
    { name: 'sidebar', selector: '.sidebar, .side-nav, #sidebar' },
    { name: 'document-card', selector: '.document-card, .card.document' },
    { name: 'upload-form', selector: 'form.upload-form, form#upload-form, form[action*="upload"]' },
    { name: 'chat-container', selector: '.chat-container, .chat-panel' }
  ];
  
  for (const { name, selector } of components) {
    test(`Component ${name} should match reference`, async ({ page }) => {
      // Set desktop viewport
      await page.setViewportSize(viewports.desktop);
      
      // Determine which page to use for the component
      let pagePath = '/';
      
      switch (name) {
        case 'document-card':
          pagePath = '/documents-new';
          break;
        case 'upload-form':
          pagePath = '/upload';
          break;
        case 'chat-container':
          pagePath = '/document-chat';
          break;
      }
      
      // Navigate to the page
      await page.goto(pagePath);
      await page.waitForLoadState('networkidle');
      
      // Wait a bit for any animations to complete
      await page.waitForTimeout(1000);
      
      // Check if component exists
      const component = page.locator(selector);
      const isVisible = await component.isVisible();
      
      if (!isVisible) {
        console.log(`Component ${name} not found on page ${pagePath}`);
        return;
      }
      
      // Take screenshot of component
      const screenshotName = `component-${name}`;
      await component.screenshot({ path: path.join(currentDir, `${screenshotName}.png`) });
      
      // Compare with reference
      const { diffPixels, diffPercentage } = await compareScreenshots(screenshotName);
      
      // Log results
      console.log(`Comparison results for ${screenshotName}:`);
      console.log(`  Diff pixels: ${diffPixels}`);
      console.log(`  Diff percentage: ${diffPercentage.toFixed(2)}%`);
      
      // Verify difference is below threshold
      expect(diffPercentage).toBeLessThan(5);
    });
  }
});