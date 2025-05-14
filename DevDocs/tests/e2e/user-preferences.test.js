/**
 * End-to-End Test for User Preferences
 * 
 * This test verifies that user preferences functionality works correctly,
 * including theme switching, accessibility features, and settings persistence.
 */

const { setupBrowser, login, teardownBrowser } = require('./setup');

describe('User Preferences End-to-End Test', () => {
  let browser, page;

  // Set up browser before tests
  beforeAll(async () => {
    const setup = await setupBrowser({ recordVideo: true });
    browser = setup.browser;
    page = setup.page;
  });

  // Clean up after tests
  afterAll(async () => {
    await teardownBrowser(browser);
  });

  // Test theme switching
  test('Theme switching', async () => {
    // Login
    await login(page);
    
    // Navigate to preferences page
    await page.click('header .user-profile');
    await page.click('.preferences-link');
    await page.waitForSelector('.preferences-page', { state: 'visible' });
    await page.takeScreenshot('preferences_page');
    
    // Switch to dark theme
    await page.click('.theme-selector >> text=Dark');
    await page.takeScreenshot('dark_theme');
    
    // Verify dark theme is applied
    const isDarkTheme = await page.evaluate(() => {
      return document.body.classList.contains('dark-theme') || 
             document.documentElement.classList.contains('dark') ||
             window.getComputedStyle(document.body).backgroundColor === 'rgb(18, 18, 18)';
    });
    expect(isDarkTheme).toBe(true);
    
    // Navigate to home page and verify theme persists
    await page.click('.logo');
    await page.waitForSelector('.dashboard', { state: 'visible' });
    await page.takeScreenshot('dark_theme_home');
    
    const isDarkThemeOnHome = await page.evaluate(() => {
      return document.body.classList.contains('dark-theme') || 
             document.documentElement.classList.contains('dark') ||
             window.getComputedStyle(document.body).backgroundColor === 'rgb(18, 18, 18)';
    });
    expect(isDarkThemeOnHome).toBe(true);
    
    // Switch back to light theme
    await page.click('header .user-profile');
    await page.click('.preferences-link');
    await page.waitForSelector('.preferences-page', { state: 'visible' });
    await page.click('.theme-selector >> text=Light');
    await page.takeScreenshot('light_theme');
    
    // Verify light theme is applied
    const isLightTheme = await page.evaluate(() => {
      return !document.body.classList.contains('dark-theme') && 
             !document.documentElement.classList.contains('dark');
    });
    expect(isLightTheme).toBe(true);
  }, 60000);

  // Test accessibility features
  test('Accessibility features', async () => {
    // Navigate to preferences page
    await page.click('header .user-profile');
    await page.click('.preferences-link');
    await page.waitForSelector('.preferences-page', { state: 'visible' });
    
    // Enable high contrast mode
    await page.click('.accessibility-section .high-contrast-toggle');
    await page.takeScreenshot('high_contrast_mode');
    
    // Verify high contrast mode is applied
    const isHighContrast = await page.evaluate(() => {
      return document.body.classList.contains('high-contrast') ||
             document.documentElement.getAttribute('data-high-contrast') === 'true';
    });
    expect(isHighContrast).toBe(true);
    
    // Enable large text mode
    await page.click('.accessibility-section .large-text-toggle');
    await page.takeScreenshot('large_text_mode');
    
    // Verify large text mode is applied
    const isLargeText = await page.evaluate(() => {
      return document.body.classList.contains('large-text') ||
             document.documentElement.getAttribute('data-large-text') === 'true' ||
             parseFloat(window.getComputedStyle(document.body).fontSize) >= 18;
    });
    expect(isLargeText).toBe(true);
    
    // Enable reduced motion
    await page.click('.accessibility-section .reduced-motion-toggle');
    await page.takeScreenshot('reduced_motion');
    
    // Verify reduced motion is applied
    const isReducedMotion = await page.evaluate(() => {
      return document.body.classList.contains('reduced-motion') ||
             document.documentElement.getAttribute('data-reduced-motion') === 'true';
    });
    expect(isReducedMotion).toBe(true);
    
    // Navigate to home and verify settings persist
    await page.click('.logo');
    await page.waitForSelector('.dashboard', { state: 'visible' });
    await page.takeScreenshot('accessibility_settings_home');
    
    const settingsPersist = await page.evaluate(() => {
      return (document.body.classList.contains('high-contrast') ||
              document.documentElement.getAttribute('data-high-contrast') === 'true') &&
             (document.body.classList.contains('large-text') ||
              document.documentElement.getAttribute('data-large-text') === 'true') &&
             (document.body.classList.contains('reduced-motion') ||
              document.documentElement.getAttribute('data-reduced-motion') === 'true');
    });
    expect(settingsPersist).toBe(true);
    
    // Reset accessibility settings
    await page.click('header .user-profile');
    await page.click('.preferences-link');
    await page.waitForSelector('.preferences-page', { state: 'visible' });
    await page.click('.reset-accessibility-button');
    await page.takeScreenshot('reset_accessibility');
  }, 60000);

  // Test keyboard shortcuts
  test('Keyboard shortcuts', async () => {
    // Navigate to preferences page
    await page.click('header .user-profile');
    await page.click('.preferences-link');
    await page.waitForSelector('.preferences-page', { state: 'visible' });
    
    // Open keyboard shortcuts section
    await page.click('.keyboard-shortcuts-section .expand-button');
    await page.takeScreenshot('keyboard_shortcuts_section');
    
    // Verify shortcuts are displayed
    const shortcutsVisible = await page.isVisible('.shortcuts-list');
    expect(shortcutsVisible).toBe(true);
    
    // Customize a shortcut
    await page.click('.shortcut-item:first-child .edit-button');
    await page.keyboard.press('Control+F');
    await page.click('.save-shortcut-button');
    await page.takeScreenshot('custom_shortcut');
    
    // Navigate to home page
    await page.click('.logo');
    await page.waitForSelector('.dashboard', { state: 'visible' });
    
    // Test the shortcut
    await page.keyboard.press('Control+F');
    await page.takeScreenshot('shortcut_result');
    
    // Verify shortcut worked (this depends on what the shortcut actually does)
    const shortcutWorked = await page.isVisible('.search-box');
    expect(shortcutWorked).toBe(true);
  }, 60000);

  // Test notification settings
  test('Notification settings', async () => {
    // Navigate to preferences page
    await page.click('header .user-profile');
    await page.click('.preferences-link');
    await page.waitForSelector('.preferences-page', { state: 'visible' });
    
    // Navigate to notifications tab
    await page.click('.preferences-tabs >> text=Notifications');
    await page.takeScreenshot('notifications_tab');
    
    // Toggle email notifications
    const initialEmailState = await page.isChecked('.email-notifications-toggle');
    await page.click('.email-notifications-toggle');
    await page.takeScreenshot('email_notifications_toggle');
    
    // Verify toggle changed
    const newEmailState = await page.isChecked('.email-notifications-toggle');
    expect(newEmailState).not.toBe(initialEmailState);
    
    // Toggle browser notifications
    const initialBrowserState = await page.isChecked('.browser-notifications-toggle');
    await page.click('.browser-notifications-toggle');
    await page.takeScreenshot('browser_notifications_toggle');
    
    // Verify toggle changed
    const newBrowserState = await page.isChecked('.browser-notifications-toggle');
    expect(newBrowserState).not.toBe(initialBrowserState);
    
    // Save preferences
    await page.click('.save-preferences-button');
    await page.waitForSelector('.preferences-saved-message', { state: 'visible' });
    await page.takeScreenshot('preferences_saved');
  }, 60000);
});
