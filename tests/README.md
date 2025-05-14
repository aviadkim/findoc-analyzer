# FinDoc Analyzer - Testing Suite

## Overview

This directory contains a comprehensive testing suite for the FinDoc Analyzer application, including various types of tests to ensure the application works correctly across different browsers, devices, and user scenarios.

## Test Types

- **Unit Tests**: Tests for individual components and functions
- **Integration Tests**: Tests for interactions between components
- **End-to-End (E2E) Tests**: Tests for complete user journeys
- **Accessibility Tests**: Tests for WCAG compliance and accessibility features
- **Performance Tests**: Tests for application performance and responsiveness
- **Mobile Responsiveness Tests**: Tests for various device sizes and orientations

## Directory Structure

```
tests/
├── playwright/             # Playwright test files
│   ├── accessibility.spec.js           # Accessibility tests
│   ├── agent-workspace.spec.js         # Agent workspace tests
│   ├── analytics-visualization.spec.js # Analytics tests
│   ├── authentication.spec.js          # Auth tests
│   ├── document-management.spec.js     # Document management tests
│   ├── document-processing.spec.js     # Document processing tests
│   ├── mobile-responsiveness.spec.js   # Mobile tests
│   ├── playwright.config.js            # Playwright config
│   ├── simple.spec.js                  # Basic test
│   ├── user-preferences.spec.js        # User preferences tests
│   └── utils/                          # Test utilities
│       └── test-helpers.js             # Common test functions
├── test-data/              # Test data files
│   └── generate-sample-pdf.js          # Sample PDF generator
├── test-results/           # Test results (generated)
├── issues-found.md         # List of issues found
├── package.json            # Test dependencies and scripts
├── README.md               # This file
└── run-playwright-tests.js # Test runner script
```

## Setup

1. Install dependencies:
   ```bash
   cd tests
   npm install
   ```

2. Generate sample test PDF:
   ```bash
   npm run generate-test-pdf
   ```

## Running Tests

### Run All Tests

```bash
npm test
```

### Run Tests with UI

```bash
npm run test:ui
```

### Run Specific Test Suites

```bash
npm run test:auth        # Authentication tests
npm run test:docs        # Document management tests
npm run test:processing  # Document processing tests
npm run test:analytics   # Analytics and visualization tests
npm run test:agents      # Agent workspace tests
npm run test:preferences # User preferences tests
npm run test:mobile      # Mobile responsiveness tests
npm run test:a11y        # Accessibility tests
```

### Run Tests in Different Browsers

```bash
npm run test:all-browsers # Run in Chromium, Firefox, and WebKit
npm run test:firefox      # Run in Firefox
npm run test:webkit       # Run in WebKit
```

### Debug Tests

```bash
npm run test:debug
```

### View Test Report

```bash
npm run show-report
```

## Issues Found

See [issues-found.md](./issues-found.md) for a list of potential issues discovered during testing.

## Writing New Tests

1. Create a new test file in the `playwright` directory with a `.spec.js` extension
2. Import the required test utilities from Playwright and the test helpers
3. Write your test using the Playwright API
4. Run the tests to verify your changes

Example:

```javascript
const { test, expect } = require('@playwright/test');
const { login } = require('./utils/test-helpers');

test.describe('My Feature', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await login(page);
  });

  test('should work correctly', async ({ page }) => {
    await page.goto('/my-feature');
    await expect(page.locator('[data-testid="feature-title"]')).toBeVisible();
  });
});
```

## Best Practices

1. **Test data isolation**: Each test should use isolated test data
2. **Clean state**: Tests should not depend on the results of other tests
3. **Descriptive names**: Use descriptive test names that explain the expected behavior
4. **Minimal assertions**: Focus on testing one thing per test
5. **Stable selectors**: Use data-testid attributes for selecting elements
6. **Wait for conditions**: Use proper waiting mechanisms instead of arbitrary delays
7. **Test accessibility**: Include accessibility checks in your tests
8. **Test responsiveness**: Verify your UI works across different screen sizes
9. **Test error states**: Verify error handling works correctly

## Further Information

For more information about the testing tools used:

- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Playwright API Reference](https://playwright.dev/docs/api/class-playwright)
- [Axe Accessibility Testing](https://github.com/dequelabs/axe-core)
