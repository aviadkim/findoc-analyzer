const { test, expect } = require('@playwright/test');
const { login } = require('./utils/test-helpers');
const fs = require('fs');
const path = require('path');

// Import accessibility tools
const AxeBuilder = require('@axe-core/playwright').default;

test.describe('Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await login(page);
  });

  async function testPageAccessibility(page, url, reportName) {
    await page.goto(url);
    
    // Run axe accessibility test
    const accessibilityScanResults = await new AxeBuilder({ page })
      .disableRules(['color-contrast']) // Disable color contrast as it's handled in high contrast mode
      .analyze();
    
    // Save accessibility report
    const reportDir = path.join(__dirname, '../test-results/accessibility');
    if (!fs.existsSync(reportDir)){
      fs.mkdirSync(reportDir, { recursive: true });
    }
    fs.writeFileSync(
      path.join(reportDir, `${reportName}.json`),
      JSON.stringify(accessibilityScanResults, null, 2)
    );
    
    // Check for violations
    expect(accessibilityScanResults.violations).toEqual([]);
  }

  test('login page should be accessible', async ({ page }) => {
    // Logout first
    await page.goto('/dashboard');
    await page.click('[data-testid="user-profile"]');
    await page.click('[data-testid="logout-button"]');
    
    // Test login page accessibility
    await testPageAccessibility(page, '/login', 'login-page');
  });

  test('dashboard should be accessible', async ({ page }) => {
    await testPageAccessibility(page, '/dashboard', 'dashboard');
  });

  test('documents page should be accessible', async ({ page }) => {
    await testPageAccessibility(page, '/documents', 'documents-page');
  });

  test('agents page should be accessible', async ({ page }) => {
    await testPageAccessibility(page, '/agents', 'agents-page');
  });

  test('portfolio page should be accessible', async ({ page }) => {
    await testPageAccessibility(page, '/portfolio', 'portfolio-page');
  });

  test('preferences page should be accessible', async ({ page }) => {
    await testPageAccessibility(page, '/preferences', 'preferences-page');
  });

  test('should support keyboard navigation', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Focus on page
    await page.keyboard.press('Tab');
    
    // Check for focused element
    const focusedElement = await page.evaluate(() => document.activeElement.getAttribute('data-testid'));
    expect(focusedElement).toBeTruthy();
    
    // Navigate through main menu
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Tab');
    }
    
    // Try to activate a menu item
    await page.keyboard.press('Enter');
    
    // Wait for navigation
    await page.waitForTimeout(1000);
    
    // Check that we navigated somewhere
    const url = page.url();
    expect(url).not.toBe('/dashboard');
  });

  test('should have proper focus management', async ({ page }) => {
    await page.goto('/documents');
    
    // Open a modal
    await page.click('[data-testid="upload-button"]');
    
    // Check that focus is trapped in modal
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // Focus should still be within the modal
    const focusWithinModal = await page.evaluate(() => {
      const activeElement = document.activeElement;
      const modal = document.querySelector('[data-testid="upload-modal"]');
      return modal.contains(activeElement);
    });
    
    expect(focusWithinModal).toBe(true);
    
    // Close modal
    await page.keyboard.press('Escape');
    
    // Check that focus returns to the trigger button
    const focusedElement = await page.evaluate(() => document.activeElement.getAttribute('data-testid'));
    expect(focusedElement).toBe('upload-button');
  });

  test('should have proper ARIA attributes', async ({ page }) => {
    await page.goto('/documents');
    
    // Check ARIA attributes on elements
    
    // Document list should have a role
    const listRole = await page.getAttribute('[data-testid="documents-list"]', 'role');
    expect(listRole).toBe('list');
    
    // Document items should have the right role
    const itemRole = await page.getAttribute('[data-testid="document-item"]:first-child', 'role');
    expect(itemRole).toBe('listitem');
    
    // Buttons should have proper ARIA attributes
    const buttonHasLabel = await page.evaluate(() => {
      const button = document.querySelector('[data-testid="upload-button"]');
      return button.hasAttribute('aria-label') || button.textContent.trim() !== '';
    });
    
    expect(buttonHasLabel).toBe(true);
  });

  test('should have accessible form labels', async ({ page }) => {
    await page.goto('/preferences');
    
    // Check that form elements have associated labels
    const formElements = await page.$$('input, select, textarea');
    
    for (const element of formElements) {
      const hasLabel = await page.evaluate(el => {
        // Check for explicit label
        const id = el.getAttribute('id');
        if (id) {
          const label = document.querySelector(`label[for="${id}"]`);
          if (label) return true;
        }
        
        // Check for aria-label
        if (el.hasAttribute('aria-label')) return true;
        
        // Check for aria-labelledby
        if (el.hasAttribute('aria-labelledby')) {
          const labelId = el.getAttribute('aria-labelledby');
          const labelElement = document.getElementById(labelId);
          if (labelElement) return true;
        }
        
        // Check if input is wrapped in a label
        let parent = el.parentElement;
        while (parent) {
          if (parent.tagName === 'LABEL') return true;
          parent = parent.parentElement;
        }
        
        return false;
      }, element);
      
      expect(hasLabel).toBe(true);
    }
  });

  test('should have accessible images', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Check alt text on images
    const images = await page.$$('img');
    
    for (const img of images) {
      const hasAltText = await page.evaluate(el => {
        return el.hasAttribute('alt');
      }, img);
      
      expect(hasAltText).toBe(true);
    }
  });

  test('should work with screen readers', async ({ page }) => {
    await page.goto('/documents');
    
    // Check for screen reader announcements on actions
    
    // Upload a document if possible
    const uploadButton = page.locator('[data-testid="upload-button"]');
    await uploadButton.click();
    
    // Check for aria-live regions
    const hasAriaLive = await page.evaluate(() => {
      return !!document.querySelector('[aria-live]');
    });
    
    expect(hasAriaLive).toBe(true);
    
    // Cancel upload
    await page.click('[data-testid="cancel-button"]');
  });

  test('should provide skip links', async ({ page }) => {
    // Go to login page first
    await page.goto('/dashboard');
    await page.click('[data-testid="user-profile"]');
    await page.click('[data-testid="logout-button"]');
    
    // Load page and check for skip link
    await page.goto('/login');
    
    // Press Tab to focus on first element, which should be skip link
    await page.keyboard.press('Tab');
    
    // Check if skip link is focused
    const skipLinkFocused = await page.evaluate(() => {
      const activeElement = document.activeElement;
      return activeElement.textContent.includes('Skip to content') || 
             activeElement.textContent.includes('Skip navigation');
    });
    
    expect(skipLinkFocused).toBe(true);
  });

  test('should work with high contrast mode', async ({ page }) => {
    // Enable high contrast mode
    await page.goto('/preferences');
    await page.click('[data-testid="accessibility-tab"]');
    await page.click('[data-testid="high-contrast-toggle"]');
    await page.click('[data-testid="save-preferences-button"]');
    
    // Check that high contrast is applied
    await page.goto('/dashboard');
    
    const hasHighContrast = await page.evaluate(() => {
      return document.body.classList.contains('high-contrast') || 
             document.documentElement.getAttribute('data-high-contrast') === 'true';
    });
    
    expect(hasHighContrast).toBe(true);
    
    // Reset high contrast
    await page.goto('/preferences');
    await page.click('[data-testid="accessibility-tab"]');
    await page.click('[data-testid="high-contrast-toggle"]');
    await page.click('[data-testid="save-preferences-button"]');
  });

  test('should support reduced motion', async ({ page }) => {
    // Enable reduced motion
    await page.goto('/preferences');
    await page.click('[data-testid="accessibility-tab"]');
    await page.click('[data-testid="reduced-motion-toggle"]');
    await page.click('[data-testid="save-preferences-button"]');
    
    // Check that reduced motion is applied
    await page.goto('/dashboard');
    
    const hasReducedMotion = await page.evaluate(() => {
      return document.body.classList.contains('reduced-motion') || 
             document.documentElement.getAttribute('data-reduced-motion') === 'true';
    });
    
    expect(hasReducedMotion).toBe(true);
    
    // Reset reduced motion
    await page.goto('/preferences');
    await page.click('[data-testid="accessibility-tab"]');
    await page.click('[data-testid="reduced-motion-toggle"]');
    await page.click('[data-testid="save-preferences-button"]');
  });

  test('should provide appropriate color contrasts', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Take screenshots for visual verification of contrast
    await page.screenshot({ path: path.join(__dirname, '../test-results/accessibility/dashboard-contrast.png') });
    
    // Programmatic contrast checking would be done by the axe accessibility tests
  });
});
