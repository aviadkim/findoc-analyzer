# UI Testing Strategy with Playwright

This document explains the comprehensive UI testing strategy implemented using Playwright for the FinDoc Analyzer application.

## Overview

Our UI testing strategy consists of several key components:

1. **Component Tests**: Testing individual UI components in isolation
2. **Page Tests**: Testing full pages and their functionality
3. **Responsive Design Tests**: Testing UI across different viewports and devices
4. **Accessibility Tests**: Testing for accessibility compliance using axe
5. **Visual Regression Tests**: Testing for unexpected visual changes

## Directory Structure

```
tests/ui-testing/
├── components/      # UI component tests
├── pages/           # Page object models and page tests
├── utils/           # Testing utilities and helpers
├── fixtures/        # Test fixtures and data
├── playwright.config.js  # Playwright configuration
├── responsive-design.spec.js  # Responsive design tests
├── accessibility.spec.js      # Accessibility tests
├── visual-regression.spec.js  # Visual regression tests
├── run-tests.js               # Test runner script
└── README.md                  # Documentation
```

## Getting Started

### Installation

Install the required dependencies:

```bash
npm install
```

### Running Tests

You can run tests using the following npm scripts:

```bash
# Run all tests
npm run test:ui

# Run only component tests
npm run test:ui:components

# Run only page tests
npm run test:ui:pages

# Run only responsive tests
npm run test:ui:responsive

# Run only accessibility tests
npm run test:ui:a11y

# Run only visual regression tests
npm run test:ui:visual
```

### Test Reports

Test reports are generated in the following locations:
- HTML report: `test-reports/html-report/`
- JSON results: `test-reports/test-results.json`
- Screenshots: `test-results/`
- Videos: `test-results/`

## Key Concepts

### Page Object Model

We use the Page Object Model (POM) pattern to encapsulate page functionality and make tests more maintainable. Page objects are located in the `pages/` directory and extend the `BasePage` class.

Example usage:

```javascript
const { test } = require('@playwright/test');
const { UploadPage } = require('../pages/upload-page');

test('should upload a document', async ({ page }) => {
  const uploadPage = new UploadPage(page);
  await uploadPage.goto();
  await uploadPage.uploadFile('/path/to/document.pdf');
  await uploadPage.submitForm();
  // Assertions...
});
```

### Responsive Testing

We test the application on multiple viewports to ensure it works well on different devices:

- Mobile: 360x640
- Tablet: 768x1024
- Desktop: 1280x720

The `responsive-design.spec.js` file contains tests that verify the application's behavior across these viewports.

### Accessibility Testing

We use the axe-core library to test for accessibility compliance. The `accessibility.spec.js` file contains tests that check for:

- Properly structured headings
- Visible focus indicators
- Images with alt text
- Form fields with labels
- Sufficient color contrast

### Visual Regression Testing

We use screenshot comparison to detect unexpected visual changes. The `visual-regression.spec.js` file contains tests that:

1. Take screenshots of pages and components
2. Compare them with reference screenshots
3. Generate diff images for visual inspection
4. Fail tests if the difference exceeds a threshold

## Adding New Tests

### Adding a Component Test

1. Create a new file in the `components/` directory, e.g., `my-component.spec.js`
2. Write tests using the Playwright test framework
3. Use selectors from the `utils/test-helpers.js` file or add new selectors if needed

```javascript
const { test, expect } = require('@playwright/test');
const { selectors } = require('../utils/test-helpers');

test.describe('My Component', () => {
  test('should do something', async ({ page }) => {
    // Test code here
  });
});
```

### Adding a Page Object

1. Create a new file in the `pages/` directory, e.g., `my-page.js`
2. Extend the `BasePage` class
3. Implement page-specific methods

```javascript
const { BasePage } = require('./base-page');

class MyPage extends BasePage {
  constructor(page) {
    super(page);
    
    // Page-specific selectors
    this.pageSelectors = {
      // Selectors here
    };
  }
  
  // Page-specific methods
  async goto() {
    await super.goto('/my-page');
  }
  
  // More methods...
}

module.exports = { MyPage };
```

## Best Practices

1. **Use Page Objects**: Encapsulate page functionality in page objects
2. **Make Tests Independent**: Each test should be independent of others
3. **Clean Test Data**: Use clean test data for each test
4. **Test Mobile First**: Test mobile views first, then tablet, then desktop
5. **Test Accessibility**: Include accessibility testing in your workflow
6. **Visual Testing**: Use visual regression testing for UI-heavy components
7. **Keep Tests Fast**: Optimize tests for speed (use shared authentication state, minimize waits)

## Troubleshooting

### Common Issues

1. **Tests Fail Randomly**: This may be due to timing issues. Try increasing timeouts or adding explicit waits.

2. **Visual Regression Tests Fail**: This may be due to minor rendering differences. Try increasing the threshold or updating reference screenshots.

3. **Test Runner Crashes**: This may be due to memory issues. Try running fewer tests at once or increasing memory allocation.

### Debugging Tips

1. **Use Screenshots**: Take screenshots during tests to debug visual issues
2. **Check Trace Viewer**: Use Playwright's trace viewer to analyze test execution
3. **Slow Down Tests**: Use `page.setDefaultTimeout()` or `slowMo` to slow down test execution
4. **Run in Headed Mode**: Run tests in headed mode for visual debugging

## Adding to CI/CD

To integrate UI tests into your CI/CD pipeline, you can use the following command:

```bash
npm run test:ui
```

This will run all UI tests and generate reports that can be published as artifacts.

## Extending the Framework

### Adding New Test Types

1. Create a new test file in the main directory, e.g., `performance.spec.js`
2. Add a new test type to `run-tests.js`
3. Add a new npm script to `package.json`

### Adding Custom Utilities

1. Add new utility functions to `utils/test-helpers.js`
2. Use them in your tests

## Conclusion

This UI testing strategy provides comprehensive coverage of the application's user interface, ensuring it works well across different devices, is accessible to all users, and maintains visual consistency across updates.

By following this strategy, you can maintain a high level of UI quality and catch issues early in the development process.