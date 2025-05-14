# FinDoc Analyzer - Quick Start Testing Guide

This guide provides instructions for running tests on the FinDoc Analyzer application and fixing common issues.

## Prerequisites

Make sure you have the following installed:
- Node.js (v16+)
- npm (v7+)
- Google Chrome (for Puppeteer tests)

## Running the Application Locally

1. Start the local server:
   ```bash
   cd C:/Users/aviad/OneDrive/Desktop/backv2-main
   npm start
   ```

2. The application should be available at:
   - [http://localhost:8080](http://localhost:8080)

## Running Tests

### 1. Running Comprehensive Tests

Our comprehensive test suite checks all aspects of the application:

```bash
cd C:/Users/aviad/OneDrive/Desktop/backv2-main/tests
node comprehensive-test.js --local
```

This will:
- Test authentication
- Test navigation
- Test document upload
- Test document management
- Test analytics
- Test chat functionality

The test results and screenshots will be saved in the `test-results` directory.

### 2. Running Playwright Tests

For more detailed UI testing:

```bash
cd C:/Users/aviad/OneDrive/Desktop/backv2-main
npm run test:playwright
```

This will run the Playwright tests defined in the `tests/playwright` directory.

### 3. Running Specific Test Categories

You can also run specific test categories:

```bash
cd C:/Users/aviad/OneDrive/Desktop/backv2-main/tests
node test-ui.js                 # Test UI only
node test-document-processing.js # Test document processing only
node test-chat-functionality.js  # Test chat functionality only
```

## Fixing Common Issues

### 1. Missing Docling Integration

The Docling integration module was missing, causing errors during application startup. We've created the missing module:

```bash
# This file has been added:
C:/Users/aviad/OneDrive/Desktop/backv2-main/docling-scan1-integration.js
```

### 2. Authentication Issues

If you encounter authentication issues:

1. Check the auth service implementation:
   ```bash
   # Edit the auth service
   code C:/Users/aviad/OneDrive/Desktop/backv2-main/services/auth-service.js
   ```

2. Make sure JWT token handling is properly implemented and session persistence works correctly.

### 3. Document Processing Issues

If document processing doesn't work:

1. Check the document processor implementation:
   ```bash
   # Edit the document processor
   code C:/Users/aviad/OneDrive/Desktop/backv2-main/document-processor.js
   ```

2. Ensure error handling is robust and supports different document formats.

### 4. UI Rendering Issues

For UI rendering issues:

1. Inspect the component implementations in the frontend directory:
   ```bash
   cd C:/Users/aviad/OneDrive/Desktop/backv2-main/frontend
   ```

2. Check for CSS conflicts or missing dependencies.

## Deploying to Google Cloud

After making fixes locally, you can deploy to Google Cloud:

```bash
cd C:/Users/aviad/OneDrive/Desktop/backv2-main
powershell -ExecutionPolicy Bypass -File .\deploy-to-cloud.ps1
```

This will:
1. Build the application
2. Create a Docker container
3. Deploy to Google Cloud Run

## Running Tests on the Deployed Application

To test the deployed application:

```bash
cd C:/Users/aviad/OneDrive/Desktop/backv2-main/tests
node comprehensive-test.js
```

Without the `--local` flag, the tests will run against the cloud deployment.

## Best Practices for Testing

1. **Run Tests Regularly**: Run tests after each significant code change.
2. **Focus on Failing Tests**: Prioritize fixing failing tests.
3. **Add Test Coverage**: Add new tests for any bugs you fix.
4. **Test Cross-Browser**: Ensure the application works in all major browsers.
5. **Test Mobile Responsiveness**: Verify the application on different screen sizes.

## Getting Help

If you encounter issues not covered in this guide, check:
- The error logs in the `logs` directory
- The test reports in the `test-results` directory
- The detailed findings and recommendations in the `FINDINGS_AND_RECOMMENDATIONS.md` file

## Resources

- [Project Summary](C:/Users/aviad/OneDrive/Desktop/backv2-main/DevDocs/PROJECT_SUMMARY.md)
- [Findings and Recommendations](C:/Users/aviad/OneDrive/Desktop/backv2-main/tests/FINDINGS_AND_RECOMMENDATIONS.md)
- [Run Guide](C:/Users/aviad/OneDrive/Desktop/backv2-main/run1.md)
