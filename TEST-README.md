# FinDoc PDF Processing Tests

This directory contains tests for the FinDoc PDF processing functionality.

## Overview

The tests are designed to verify that the PDF processing functionality works correctly in both local and Google website environments. The tests cover:

1. File upload
2. Document processing
3. Text extraction
4. Table extraction
5. Security extraction
6. Q&A functionality

## Prerequisites

- Node.js (v14 or later)
- Python (v3.6 or later)
- ReportLab Python library (`pip install reportlab`)
- Axios and Form-Data Node.js libraries (`npm install axios form-data`)

## Test Files

- `generate-test-pdf.py`: Generates test PDF files
- `run-tests.js`: Runs the tests
- `generate-html-report.js`: Generates an HTML report from the test results
- `setup-local-test.bat`: Sets up the local test environment
- `run-all-tests.bat`: Runs all tests

## Running the Tests

### Option 1: Run All Tests

```
run-all-tests.bat
```

This will:
1. Set up the local test environment
2. Generate test PDFs
3. Run the tests
4. Generate an HTML report

### Option 2: Run Individual Steps

1. Set up the local test environment:
   ```
   setup-local-test.bat
   ```

2. Generate test PDFs:
   ```
   python generate-test-pdf.py
   ```

3. Run the tests:
   ```
   node run-tests.js
   ```

4. Generate an HTML report:
   ```
   node generate-html-report.js
   ```

## Test Results

Test results are saved in the `test_results` directory:
- JSON files for each test
- `summary.json` with a summary of all tests
- `report.html` with an HTML report

## Test Environments

The tests are run in the following environments:
1. Local: http://localhost:3000
2. Google Website: https://findoc-deploy.ey.r.appspot.com

## API Endpoints

The tests use the following API endpoints:
1. Mock API: /api/mock
2. Test API: /api/test
3. Real API: /api/documents

## Test PDFs

The tests use the following test PDFs:
1. Financial Statement: `test_pdfs/financial_statement.pdf`
2. Text Only: `test_pdfs/text_only.pdf`
3. Tables Only: `test_pdfs/tables_only.pdf`
4. Small File: `test_pdfs/small_file.pdf`

## Troubleshooting

### Local Server Not Running

If the local server is not running, start it with:
```
cd backv2-github\DevDocs\findoc-app-engine-v2
node app.js
```

### Missing Dependencies

If you're missing dependencies, install them with:
```
pip install reportlab
npm install axios form-data
```

### Test Failures

If tests fail, check the test results in the `test_results` directory for more information.
