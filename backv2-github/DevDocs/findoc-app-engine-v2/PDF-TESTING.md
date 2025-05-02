# FinDoc Analyzer PDF Processing Testing Guide

This guide provides instructions for testing the PDF processing functionality of the FinDoc Analyzer application.

## Overview

The PDF processing tests verify that the application can correctly:

1. Upload PDF files
2. Process PDF files
3. Extract text from PDF files
4. Extract tables from PDF files
5. Extract security information from PDF files
6. Answer questions about the processed PDF files

## Test Types

### 1. Mock Tests

Mock tests use mock data to simulate the PDF processing functionality. These tests are fast and don't require a running server or API.

### 2. Integration Tests

Integration tests use the actual API to test the PDF processing functionality. These tests require a running server and API.

### 3. End-to-End Tests

End-to-end tests use the web interface to test the PDF processing functionality. These tests require a running server, API, and web interface.

## Test Data

The tests use the following test PDF files:

1. **Financial Statement**: A PDF file containing financial statement data
2. **Text Only**: A PDF file containing only text
3. **Tables Only**: A PDF file containing only tables
4. **Small File**: A small PDF file for testing small file processing

## Running Tests

### Option 1: Using npm scripts

```bash
# Generate test PDFs
npm run generate-pdfs

# Run PDF processing tests
npm run test:pdf

# Generate HTML report
npm run generate-report

# Run all tests (unit tests and PDF processing tests)
npm run test:all
```

### Option 2: Using Batch Script

```bash
# Run all PDF processing tests
run-pdf-tests.bat
```

### Option 3: Using PowerShell Script

```bash
# Run all PDF processing tests
.\run-pdf-tests.ps1
```

## Test Results

Test results are saved in the `test_results` directory:

- JSON files for each test
- `summary.json` with a summary of all tests
- `report.html` with an HTML report

## Web Interface Testing

You can also test the PDF processing functionality using the web interface:

1. Start the server:
   ```bash
   npm start
   ```

2. Open the test page in your browser:
   ```
   http://localhost:3000/test-pdf-processing.html
   ```

3. Upload a PDF file and test the processing functionality

## Automated Testing

The PDF processing tests are also run as part of the CI/CD pipeline. The workflow is defined in `.github/workflows/deploy-to-gae.yml`.

## Troubleshooting

### Test Failures

If tests fail, check the following:

1. **Test PDFs**: Verify that the test PDFs are generated correctly
   ```bash
   npm run generate-pdfs
   ```

2. **Test Results**: Check the test results in the `test_results` directory
   ```bash
   cat test_results/summary.json
   ```

3. **HTML Report**: Check the HTML report for more details
   ```bash
   open test_results/report.html
   ```

### Mock Data Issues

If you're having issues with mock data, check the following:

1. **Mock Data**: Verify that the mock data is correct
   ```bash
   cat src/api/controllers/mockPdfController.js
   ```

2. **Mock Routes**: Verify that the mock routes are correct
   ```bash
   cat src/api/routes/mockPdfRoutes.js
   ```

## Adding New Tests

To add new tests:

1. Add new test PDF files to the `generate-test-pdfs.js` script
2. Add new test cases to the `run-tests.js` script
3. Run the tests to verify that the new tests work correctly

## Best Practices

1. **Run Tests Regularly**: Run the tests regularly to catch issues early
2. **Add New Tests**: Add new tests for new features and bug fixes
3. **Keep Test Data Up-to-Date**: Update the test data when the application changes
4. **Check Test Results**: Check the test results and fix any issues
5. **Automate Testing**: Use the CI/CD pipeline to automate testing
