const { test, expect } = require('@playwright/test');
const { generateRandomString } = require('./utils/test-helpers');

test.describe('Authentication', () => {
  test('should show login page', async ({ page }) => {
    await page.goto('/login');
    await expect(page).toHaveTitle(/Login/);
    await expect(page.locator('[data-testid="login-form"]')).toBeVisible();
  });

  test('should login with valid credentials', async ({ page }) => {
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="login-button"]');
    
    // Should redirect to dashboard
    await page.waitForURL('**/dashboard');
    await expect(page.locator('[data-testid="user-profile"]')).toBeVisible();
  });

  test('should show error with invalid credentials', async ({ page }) => {
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', 'invalid@example.com');
    await page.fill('[data-testid="password-input"]', 'wrongpassword');
    await page.click('[data-testid="login-button"]');
    
    // Should show error message
    await expect(page.locator('[data-testid="login-error"]')).toBeVisible();
    await expect(page).toHaveURL(/.*login/);
  });

  test('should register a new user', async ({ page }) => {
    const randomEmail = `test-${generateRandomString()}@example.com`;
    
    await page.goto('/register');
    await page.fill('[data-testid="name-input"]', 'Test User');
    await page.fill('[data-testid="email-input"]', randomEmail);
    await page.fill('[data-testid="password-input"]', 'Test123!');
    await page.fill('[data-testid="confirm-password-input"]', 'Test123!');
    await page.click('[data-testid="register-button"]');
    
    // Should redirect to login page with success message
    await page.waitForURL('**/login');
    await expect(page.locator('[data-testid="registration-success"]')).toBeVisible();
  });

  test('should prevent registration with existing email', async ({ page }) => {
    await page.goto('/register');
    await page.fill('[data-testid="name-input"]', 'Existing User');
    await page.fill('[data-testid="email-input"]', 'test@example.com'); // Existing email
    await page.fill('[data-testid="password-input"]', 'Test123!');
    await page.fill('[data-testid="confirm-password-input"]', 'Test123!');
    await page.click('[data-testid="register-button"]');
    
    // Should show error message
    await expect(page.locator('[data-testid="registration-error"]')).toBeVisible();
    await expect(page).toHaveURL(/.*register/);
  });

  test('should reset password', async ({ page }) => {
    await page.goto('/forgot-password');
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.click('[data-testid="reset-password-button"]');
    
    // Should show success message
    await expect(page.locator('[data-testid="reset-password-success"]')).toBeVisible();
  });

  test('should logout', async ({ page }) => {
    // First login
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="login-button"]');
    
    // Wait for dashboard to load
    await page.waitForURL('**/dashboard');
    
    // Click logout
    await page.click('[data-testid="user-profile"]');
    await page.click('[data-testid="logout-button"]');
    
    // Should redirect to login page
    await page.waitForURL('**/login');
    await expect(page.locator('[data-testid="login-form"]')).toBeVisible();
  });
});
