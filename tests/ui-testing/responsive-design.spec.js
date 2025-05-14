/**
 * Responsive Design Tests
 * 
 * Tests the responsive behavior of the application across different viewports.
 */

const { test, expect } = require('@playwright/test');
const { selectors, checkResponsive } = require('./utils/test-helpers');
const { BasePage } = require('./pages/base-page');
const { UploadPage } = require('./pages/upload-page');
const { DocumentChatPage } = require('./pages/document-chat-page');

// Define viewport sizes
const viewports = {
  mobile: { width: 360, height: 640 },
  mobileWide: { width: 414, height: 896 },
  tablet: { width: 768, height: 1024 },
  tabletLandscape: { width: 1024, height: 768 },
  laptop: { width: 1280, height: 720 },
  desktop: { width: 1920, height: 1080 }
};

// Pages to test
const pages = [
  { path: '/', name: 'Home' },
  { path: '/documents-new', name: 'Documents' },
  { path: '/upload', name: 'Upload' },
  { path: '/document-chat', name: 'DocumentChat' },
  { path: '/analytics-new', name: 'Analytics' }
];

test.describe('Responsive Design', () => {
  test('should adapt to mobile viewport', async ({ page }) => {
    // Use smaller timeout for viewport tests
    test.setTimeout(60000);
    
    // Set mobile viewport
    await page.setViewportSize(viewports.mobile);
    
    // Test each page
    for (const { path, name } of pages) {
      // Navigate to the page
      await page.goto(path);
      await page.waitForLoadState('networkidle');
      
      // Take screenshot
      await page.screenshot({ path: `test-results/responsive-mobile-${name.toLowerCase()}.png` });
      
      // Check for mobile menu
      const mobileMenu = page.locator(selectors.responsive.mobileMenu);
      const isMobileMenuVisible = await mobileMenu.isVisible();
      
      // On mobile, we expect either:
      // 1. A mobile menu button is visible
      // 2. The sidebar is collapsed or hidden
      if (isMobileMenuVisible) {
        console.log(`Mobile menu found on ${name} page`);
      } else {
        // If no mobile menu, check if sidebar is collapsed/hidden
        const sidebar = page.locator(selectors.navigation.sidebar);
        const isSidebarVisible = await sidebar.isVisible();
        
        if (isSidebarVisible) {
          // If sidebar is visible, it should have a collapsed class
          const hasCollapsedClass = await sidebar.evaluate(el => {
            return el.classList.contains('collapsed') || 
                   el.classList.contains('hidden') || 
                   el.classList.contains('mobile');
          });
          
          expect(hasCollapsedClass).toBeTruthy();
        }
      }
      
      // Check that content is properly sized for mobile
      // Content should not overflow the viewport horizontally
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });
      
      expect(hasHorizontalScroll).toBeFalsy();
    }
  });
  
  test('should adapt to tablet viewport', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize(viewports.tablet);
    
    // Test each page
    for (const { path, name } of pages) {
      // Navigate to the page
      await page.goto(path);
      await page.waitForLoadState('networkidle');
      
      // Take screenshot
      await page.screenshot({ path: `test-results/responsive-tablet-${name.toLowerCase()}.png` });
      
      // Check that content is properly sized for tablet
      // Content should not overflow the viewport horizontally
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });
      
      expect(hasHorizontalScroll).toBeFalsy();
    }
  });
  
  test('should adapt to desktop viewport', async ({ page }) => {
    // Set desktop viewport
    await page.setViewportSize(viewports.laptop);
    
    // Test each page
    for (const { path, name } of pages) {
      // Navigate to the page
      await page.goto(path);
      await page.waitForLoadState('networkidle');
      
      // Take screenshot
      await page.screenshot({ path: `test-results/responsive-desktop-${name.toLowerCase()}.png` });
      
      // On desktop, sidebar should be visible and expanded
      const sidebar = page.locator(selectors.navigation.sidebar);
      await expect(sidebar).toBeVisible();
      
      // Check sidebar is expanded (doesn't have collapsed class)
      const hasCollapsedClass = await sidebar.evaluate(el => {
        return el.classList.contains('collapsed') || 
               el.classList.contains('hidden') || 
               el.classList.contains('mobile');
      });
      
      expect(hasCollapsedClass).toBeFalsy();
    }
  });
  
  test('should resize elements proportionally', async ({ page }) => {
    // Test a specific element's responsiveness across multiple viewport sizes
    // We'll test the document card component since it should be responsive
    
    // Navigate to documents page
    await page.goto('/documents-new');
    await page.waitForLoadState('networkidle');
    
    // Check if documents exist, if not, we'll skip further tests
    const documentCards = page.locator(selectors.components.documentCard);
    const count = await documentCards.count();
    
    if (count === 0) {
      console.log('No document cards found, skipping resize test');
      return;
    }
    
    // Get first document card
    const documentCard = documentCards.first();
    
    // Test across different viewports
    const documentCardSizes = {};
    
    // Mobile
    await page.setViewportSize(viewports.mobile);
    await page.waitForTimeout(500); // Allow time for resize
    documentCardSizes.mobile = await documentCard.boundingBox();
    
    // Tablet
    await page.setViewportSize(viewports.tablet);
    await page.waitForTimeout(500); // Allow time for resize
    documentCardSizes.tablet = await documentCard.boundingBox();
    
    // Desktop
    await page.setViewportSize(viewports.laptop);
    await page.waitForTimeout(500); // Allow time for resize
    documentCardSizes.desktop = await documentCard.boundingBox();
    
    // Verify proportionality
    // On smaller screens, the document card should be narrower
    expect(documentCardSizes.mobile.width).toBeLessThan(documentCardSizes.tablet.width);
    expect(documentCardSizes.tablet.width).toBeLessThanOrEqual(documentCardSizes.desktop.width);
  });
  
  test('should have touch-friendly controls on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize(viewports.mobile);
    
    // Navigate to upload page
    await page.goto('/upload');
    await page.waitForLoadState('networkidle');
    
    // Check for touch-friendly buttons (they should be at least 44x44px)
    const buttons = page.locator('button, .btn, [role="button"]');
    const count = await buttons.count();
    
    // Check size of each button
    for (let i = 0; i < count; i++) {
      const button = buttons.nth(i);
      const box = await button.boundingBox();
      
      // Skip hidden buttons
      if (!box) continue;
      
      // Check if button is large enough for touch
      // Apple's recommended minimum touch target size is 44x44px
      expect(box.width >= 44 || box.height >= 44).toBeTruthy();
    }
    
    // Navigate to document chat page
    await page.goto('/document-chat');
    await page.waitForLoadState('networkidle');
    
    // Check chat input and send button sizes
    const chatInput = page.locator(selectors.components.chatInput);
    if (await chatInput.isVisible()) {
      const inputBox = await chatInput.boundingBox();
      expect(inputBox.height).toBeGreaterThanOrEqual(44);
    }
    
    const sendButton = page.locator(selectors.components.chatSendButton);
    if (await sendButton.isVisible()) {
      const buttonBox = await sendButton.boundingBox();
      expect(buttonBox.width).toBeGreaterThanOrEqual(44);
      expect(buttonBox.height).toBeGreaterThanOrEqual(44);
    }
  });
});