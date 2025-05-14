/**
 * Sidebar Component Tests
 * 
 * Tests the responsive behavior of the sidebar component.
 */

const { test, expect } = require('@playwright/test');
const { selectors, checkResponsive } = require('../utils/test-helpers');

test.describe('Sidebar Component', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navigate to home page
    await page.goto('/');
    
    // Ensure page has loaded
    await page.waitForLoadState('networkidle');
  });
  
  test('should be visible on desktop', async ({ page }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1280, height: 720 });
    
    // Verify sidebar is visible
    const sidebar = page.locator(selectors.navigation.sidebar);
    await expect(sidebar).toBeVisible();
    
    // Verify navigation links are visible
    await expect(page.locator(selectors.navigation.home)).toBeVisible();
    await expect(page.locator(selectors.navigation.documents)).toBeVisible();
    await expect(page.locator(selectors.navigation.upload)).toBeVisible();
    await expect(page.locator(selectors.navigation.documentChat)).toBeVisible();
    
    // Take screenshot
    await page.screenshot({ path: 'test-results/sidebar-desktop.png' });
  });
  
  test('should collapse or hide on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 360, height: 640 });
    
    // Check for mobile menu button
    const mobileMenu = page.locator(selectors.responsive.mobileMenu);
    await expect(mobileMenu).toBeVisible();
    
    // The sidebar should either be:
    // 1. Not visible (hidden off-screen)
    // 2. Visible but with a collapsed class
    const sidebar = page.locator(selectors.navigation.sidebar);
    
    if (await sidebar.isVisible()) {
      // If visible, it should have a collapsed class
      await expect(sidebar).toHaveClass(/collapsed|hidden|mobile/);
    }
    
    // Take screenshot
    await page.screenshot({ path: 'test-results/sidebar-mobile.png' });
    
    // If there's a mobile menu, click it to expand the sidebar
    if (await mobileMenu.isVisible()) {
      await mobileMenu.click();
      await page.waitForTimeout(500); // Wait for animation
      
      // Now the sidebar should be visible
      await expect(sidebar).toBeVisible();
      
      // Take screenshot
      await page.screenshot({ path: 'test-results/sidebar-mobile-expanded.png' });
    }
  });
  
  test('should adapt to tablet size', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    
    // The sidebar behavior on tablet can vary:
    // 1. It might be visible but collapsed (showing icons only)
    // 2. It might be fully visible but narrower
    // 3. It might be hidden behind a menu button
    
    const sidebar = page.locator(selectors.navigation.sidebar);
    const mobileMenu = page.locator(selectors.responsive.mobileMenu);
    
    // If the mobile menu is visible, click it
    if (await mobileMenu.isVisible()) {
      await mobileMenu.click();
      await page.waitForTimeout(500); // Wait for animation
    }
    
    // The sidebar should be visible now
    await expect(sidebar).toBeVisible();
    
    // Take screenshot
    await page.screenshot({ path: 'test-results/sidebar-tablet.png' });
  });
  
  test('should navigate correctly on all viewport sizes', async ({ page }) => {
    // Test navigation on desktop
    await page.setViewportSize({ width: 1280, height: 720 });
    
    // Click documents link
    await page.click(selectors.navigation.documents);
    await page.waitForURL('**/documents-new**');
    
    // Click upload link
    await page.click(selectors.navigation.upload);
    await page.waitForURL('**/upload**');
    
    // Click document chat link
    await page.click(selectors.navigation.documentChat);
    await page.waitForURL('**/document-chat**');
    
    // Click home link
    await page.click(selectors.navigation.home);
    await page.waitForURL('**/');
    
    // Test navigation on mobile
    await page.setViewportSize({ width: 360, height: 640 });
    
    // The mobile menu might need to be clicked first
    const mobileMenu = page.locator(selectors.responsive.mobileMenu);
    if (await mobileMenu.isVisible()) {
      await mobileMenu.click();
      await page.waitForTimeout(500); // Wait for animation
    }
    
    // Click documents link
    await page.click(selectors.navigation.documents);
    await page.waitForURL('**/documents-new**');
    
    // The menu might close automatically after navigation
    // Click mobile menu button again if needed
    if (await mobileMenu.isVisible()) {
      await mobileMenu.click();
      await page.waitForTimeout(500); // Wait for animation
    }
    
    // Click upload link
    await page.click(selectors.navigation.upload);
    await page.waitForURL('**/upload**');
  });
  
  test('should check responsive behavior across multiple viewport sizes', async ({ page }) => {
    // Define multiple viewport sizes to test
    const viewports = [
      { width: 320, height: 568 },  // iPhone SE
      { width: 375, height: 667 },  // iPhone 8
      { width: 414, height: 896 },  // iPhone 11 Pro Max
      { width: 768, height: 1024 }, // iPad
      { width: 1024, height: 768 }, // iPad landscape
      { width: 1280, height: 720 }, // Small laptop
      { width: 1920, height: 1080 } // Large desktop
    ];
    
    // Run responsive check
    await checkResponsive(page, viewports);
  });
});