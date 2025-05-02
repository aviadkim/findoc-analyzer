# FinDoc Analyzer QA Testing Framework

This directory contains a comprehensive QA testing framework for the FinDoc Analyzer application. The framework uses Playwright to automate testing of the web interface.

## Overview

The testing framework is designed to test the following aspects of the FinDoc Analyzer application:

1. **Website Access**: Tests basic access to the website and navigation
2. **Document Upload**: Tests the document upload functionality
3. **Document Processing**: Tests the document processing functionality
4. **Document Chat**: Tests the document chat functionality

## Directory Structure

- `test-scripts/`: Contains all test scripts
  - `test-01-website-access.js`: Tests basic website access
  - `test-04-document-upload.js`: Tests document upload functionality
  - `test-15-document-chat.js`: Tests document chat functionality
  - `create-test-pdf.js`: Creates a test PDF for testing
  - `test-files/`: Contains test files for testing
  - `screenshots/`: Contains screenshots taken during testing
  - `results/`: Contains test results

## Setup

1. Install dependencies:

```bash
cd test-scripts
npm install
```

2. Create test PDF:

```bash
npm run create-pdf
```

## Running Tests

### Run All Tests

```bash
npm test
```

### Run Individual Tests

```bash
# Test website access
npm run test:website

# Test document upload
npm run test:upload

# Test document chat
npm run test:chat
```

## Test Results

Test results are saved in the `results/` directory as JSON files. A consolidated HTML report is generated at `test-results/report.html`.

## Adding New Tests

To add a new test:

1. Create a new test script in the `test-scripts/` directory
2. Follow the pattern of existing test scripts
3. Add the test to the `run-micro-tests.js` file
4. Add a script to `package.json` to run the test individually

## Test Plan

A comprehensive test plan is available in the `micro-test-plan.md` file. The plan outlines all the tests to be performed and the expected results.

## Test Execution Template

A template for recording test results is available in the `test-execution-template.md` file. The template can be used to manually record test results.

## Continuous Integration

The tests can be integrated into a CI/CD pipeline to run automatically on each commit or pull request. The tests are designed to be run in a headless mode for CI/CD integration.

## Troubleshooting

If you encounter issues running the tests:

1. Make sure all dependencies are installed
2. Check that the test PDF has been created
3. Verify that the application is accessible at the configured URL
4. Check for any error messages in the test output

## Contributing

To contribute to the testing framework:

1. Follow the existing patterns and coding style
2. Add comprehensive documentation for new tests
3. Ensure all tests are independent and can be run individually
4. Add appropriate error handling and reporting
