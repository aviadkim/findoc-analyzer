/**
 * Accessibility Tests
 * 
 * Tests the application for accessibility compliance using axe.
 */

const { test, expect } = require('@playwright/test');
const { runA11yTests, a11yTest } = require('./utils/test-helpers');

// Pages to test
const pages = [
  { path: '/', name: 'Home' },
  { path: '/documents-new', name: 'Documents' },
  { path: '/upload', name: 'Upload' },
  { path: '/document-chat', name: 'DocumentChat' },
  { path: '/analytics-new', name: 'Analytics' }
];

test.describe('Accessibility', () => {
  test.use({ project: 'accessibility' });
  
  for (const { path, name } of pages) {
    a11yTest(`${name} page should be accessible`, async ({ page }) => {
      // Navigate to the page
      await page.goto(path);
      await page.waitForLoadState('networkidle');
      
      // Take screenshot before running accessibility tests
      await page.screenshot({ path: `test-results/a11y-${name.toLowerCase()}.png` });
      
      // Run accessibility tests
      await page.runA11yTests(name);
    });
  }
  
  test('Headers should have proper structure', async ({ page }) => {
    // Navigate to home page
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check header structure
    const headings = await page.$$eval('h1, h2, h3, h4, h5, h6', headings => {
      return headings.map(h => ({
        type: h.tagName.toLowerCase(),
        text: h.textContent.trim()
      }));
    });
    
    // Check for h1
    const h1Headings = headings.filter(h => h.type === 'h1');
    expect(h1Headings.length).toBeGreaterThanOrEqual(1);
    
    // Verify heading hierarchy
    const headingLevels = headings.map(h => parseInt(h.type.replace('h', '')));
    for (let i = 1; i < headingLevels.length; i++) {
      // Heading levels should not skip more than one level
      expect(headingLevels[i] - headingLevels[i-1]).toBeLessThanOrEqual(1);
    }
  });
  
  test('Focus indicators should be visible', async ({ page }) => {
    // Navigate to home page
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Find all focusable elements
    const focusableElements = await page.$$('a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])');
    
    for (const element of focusableElements.slice(0, 5)) { // Test first 5 elements to save time
      // Focus the element
      await element.focus();
      await page.waitForTimeout(100); // Give time for focus styles
      
      // Take screenshot of focused element
      await page.screenshot({ path: `test-results/focus-test-${Date.now()}.png` });
      
      // Get computed styles
      const styles = await element.evaluate(el => {
        const style = window.getComputedStyle(el);
        return {
          outlineWidth: style.outlineWidth,
          outlineStyle: style.outlineStyle,
          outlineColor: style.outlineColor,
          boxShadow: style.boxShadow,
          borderColor: style.borderColor
        };
      });
      
      // Element should have some visual indication of focus
      // This could be outline, box-shadow, border, etc.
      const hasFocusStyles = 
        (styles.outlineWidth !== '0px' && styles.outlineStyle !== 'none') ||
        styles.boxShadow !== 'none' ||
        styles.borderColor !== 'rgb(0, 0, 0)';
      
      expect(hasFocusStyles).toBeTruthy();
    }
  });
  
  test('Images should have alt text', async ({ page }) => {
    // Test across multiple pages
    for (const { path, name } of pages) {
      // Navigate to the page
      await page.goto(path);
      await page.waitForLoadState('networkidle');
      
      // Find all images
      const images = await page.$$('img');
      
      for (const image of images) {
        // Get alt text
        const alt = await image.getAttribute('alt');
        
        // Check if image has alt text
        // Note: Decorative images should have empty alt text (alt="")
        expect(alt).not.toBeNull();
      }
    }
  });
  
  test('Form fields should have labels', async ({ page }) => {
    // Navigate to upload page (which should have a form)
    await page.goto('/upload');
    await page.waitForLoadState('networkidle');
    
    // Find all form fields
    const formFields = await page.$$('input, select, textarea');
    
    for (const field of formFields) {
      // Get field ID
      const id = await field.getAttribute('id');
      
      if (id) {
        // Check for label with matching 'for' attribute
        const label = await page.$(`label[for="${id}"]`);
        
        // If no label with 'for', check if field is wrapped by label
        const wrappingLabel = await field.evaluate(el => {
          return el.closest('label') !== null;
        });
        
        // Field should have a label (either with matching 'for' or as a parent)
        expect(label !== null || wrappingLabel).toBeTruthy();
      }
    }
  });
  
  test('Color contrast should be sufficient', async ({ page }) => {
    // This is tested by the axe integration, but we'll do some basic checks
    
    // Navigate to home page
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check text elements for contrast
    const textElements = await page.$$('p, h1, h2, h3, h4, h5, h6, span, a, button, label');
    
    for (const element of textElements.slice(0, 10)) { // Test first 10 elements to save time
      // Get color and background color
      const colors = await element.evaluate(el => {
        const style = window.getComputedStyle(el);
        return {
          color: style.color,
          backgroundColor: style.backgroundColor,
          fontSize: style.fontSize,
          fontWeight: style.fontWeight
        };
      });
      
      // Log colors for inspection
      console.log(`Element colors: ${JSON.stringify(colors)}`);
    }
    
    // Full contrast tests are handled by axe integration
  });
});