const { test, expect } = require('@playwright/test');
const { login } = require('./utils/test-helpers');

test.describe('User Preferences', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await login(page);
  });

  test('should display preferences page', async ({ page }) => {
    await page.goto('/preferences');
    await expect(page).toHaveTitle(/Preferences/);
    await expect(page.locator('[data-testid="preferences-page"]')).toBeVisible();
  });

  test('should change theme', async ({ page }) => {
    await page.goto('/preferences');
    
    // Click theme selector
    await page.click('[data-testid="theme-selector"]');
    
    // Select dark theme
    await page.click('[data-testid="theme-option-dark"]');
    
    // Save preferences
    await page.click('[data-testid="save-preferences-button"]');
    
    // Check that theme is applied
    await expect(page.locator('body')).toHaveClass(/dark-theme/);
    
    // Go to another page to verify theme persists
    await page.goto('/dashboard');
    await expect(page.locator('body')).toHaveClass(/dark-theme/);
    
    // Reset theme
    await page.goto('/preferences');
    await page.click('[data-testid="theme-selector"]');
    await page.click('[data-testid="theme-option-light"]');
    await page.click('[data-testid="save-preferences-button"]');
  });

  test('should enable high contrast mode', async ({ page }) => {
    await page.goto('/preferences');
    
    // Go to accessibility tab
    await page.click('[data-testid="accessibility-tab"]');
    
    // Toggle high contrast mode
    await page.click('[data-testid="high-contrast-toggle"]');
    
    // Save preferences
    await page.click('[data-testid="save-preferences-button"]');
    
    // Check that high contrast mode is applied
    await expect(page.locator('body')).toHaveClass(/high-contrast/);
    
    // Reset high contrast mode
    await page.click('[data-testid="high-contrast-toggle"]');
    await page.click('[data-testid="save-preferences-button"]');
  });

  test('should enable large text mode', async ({ page }) => {
    await page.goto('/preferences');
    
    // Go to accessibility tab
    await page.click('[data-testid="accessibility-tab"]');
    
    // Toggle large text mode
    await page.click('[data-testid="large-text-toggle"]');
    
    // Save preferences
    await page.click('[data-testid="save-preferences-button"]');
    
    // Check that large text mode is applied
    await expect(page.locator('body')).toHaveClass(/large-text/);
    
    // Reset large text mode
    await page.click('[data-testid="large-text-toggle"]');
    await page.click('[data-testid="save-preferences-button"]');
  });

  test('should enable reduced motion', async ({ page }) => {
    await page.goto('/preferences');
    
    // Go to accessibility tab
    await page.click('[data-testid="accessibility-tab"]');
    
    // Toggle reduced motion
    await page.click('[data-testid="reduced-motion-toggle"]');
    
    // Save preferences
    await page.click('[data-testid="save-preferences-button"]');
    
    // Check that reduced motion is applied
    await expect(page.locator('body')).toHaveClass(/reduced-motion/);
    
    // Reset reduced motion
    await page.click('[data-testid="reduced-motion-toggle"]');
    await page.click('[data-testid="save-preferences-button"]');
  });

  test('should configure notification preferences', async ({ page }) => {
    await page.goto('/preferences');
    
    // Go to notifications tab
    await page.click('[data-testid="notifications-tab"]');
    
    // Toggle email notifications
    const emailToggle = page.locator('[data-testid="email-notifications-toggle"]');
    const initialState = await emailToggle.isChecked();
    await emailToggle.click();
    
    // Toggle browser notifications
    const browserToggle = page.locator('[data-testid="browser-notifications-toggle"]');
    const initialBrowserState = await browserToggle.isChecked();
    await browserToggle.click();
    
    // Save preferences
    await page.click('[data-testid="save-preferences-button"]');
    
    // Verify changes were saved
    await page.reload();
    await page.click('[data-testid="notifications-tab"]');
    
    if (initialState) {
      await expect(emailToggle).not.toBeChecked();
    } else {
      await expect(emailToggle).toBeChecked();
    }
    
    if (initialBrowserState) {
      await expect(browserToggle).not.toBeChecked();
    } else {
      await expect(browserToggle).toBeChecked();
    }
    
    // Reset to original state
    await emailToggle.click();
    await browserToggle.click();
    await page.click('[data-testid="save-preferences-button"]');
  });

  test('should customize dashboard layout', async ({ page }) => {
    await page.goto('/preferences');
    
    // Go to display tab
    await page.click('[data-testid="display-tab"]');
    
    // Change documents per page
    await page.selectOption('[data-testid="documents-per-page-select"]', '25');
    
    // Change default sort
    await page.selectOption('[data-testid="default-sort-select"]', 'name');
    
    // Save preferences
    await page.click('[data-testid="save-preferences-button"]');
    
    // Check that settings are saved
    await page.reload();
    await page.click('[data-testid="display-tab"]');
    
    const docsPerPage = await page.locator('[data-testid="documents-per-page-select"]').inputValue();
    expect(docsPerPage).toBe('25');
    
    const defaultSort = await page.locator('[data-testid="default-sort-select"]').inputValue();
    expect(defaultSort).toBe('name');
    
    // Reset to defaults
    await page.selectOption('[data-testid="documents-per-page-select"]', '10');
    await page.selectOption('[data-testid="default-sort-select"]', 'date');
    await page.click('[data-testid="save-preferences-button"]');
  });

  test('should configure keyboard shortcuts', async ({ page }) => {
    await page.goto('/preferences');
    
    // Go to keyboard shortcuts tab
    await page.click('[data-testid="keyboard-shortcuts-tab"]');
    
    // Edit a shortcut
    await page.click('[data-testid="edit-shortcut-button"]:first-child');
    
    // Clear current shortcut
    await page.click('[data-testid="shortcut-input"]');
    await page.keyboard.press('Backspace');
    
    // Set new shortcut
    await page.keyboard.press('Control+F');
    
    // Save shortcut
    await page.click('[data-testid="save-shortcut-button"]');
    
    // Save preferences
    await page.click('[data-testid="save-preferences-button"]');
    
    // Verify shortcut was saved
    await page.reload();
    await page.click('[data-testid="keyboard-shortcuts-tab"]');
    
    await expect(page.locator('[data-testid="shortcut-value"]:first-child')).toContainText('Ctrl+F');
  });

  test('should reset preferences', async ({ page }) => {
    await page.goto('/preferences');
    
    // Click reset button
    await page.click('[data-testid="reset-preferences-button"]');
    
    // Confirm reset
    await page.click('[data-testid="confirm-reset-button"]');
    
    // Check that preferences are reset
    await expect(page.locator('[data-testid="preferences-reset-message"]')).toBeVisible();
    
    // Verify default values
    await page.click('[data-testid="display-tab"]');
    
    const docsPerPage = await page.locator('[data-testid="documents-per-page-select"]').inputValue();
    expect(docsPerPage).toBe('10');
    
    const defaultSort = await page.locator('[data-testid="default-sort-select"]').inputValue();
    expect(defaultSort).toBe('date');
  });
});
