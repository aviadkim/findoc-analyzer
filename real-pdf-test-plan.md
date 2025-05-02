# Real PDF Processing Test Plan

## Overview

This test plan outlines the approach for testing the PDF processing functionality with real PDFs on the Google App Engine deployed website. The tests will verify that the system can correctly process financial documents and that the bot can answer questions based on the processed data.

## Test Environment

- **Website**: https://findoc-deploy.ey.r.appspot.com/test-pdf-processing.html
- **API Endpoint**: /api/mock (for testing without authentication)
- **Browser**: Chrome/Edge/Firefox (latest version)

## Test Categories

### 1. Basic PDF Processing Tests

These tests verify that the system can process different types of PDFs:

| Test ID | Test Name | Description | Expected Result |
|---------|-----------|-------------|-----------------|
| BP-01 | Simple Financial Statement | Process a simple financial statement PDF | PDF processed successfully, data extracted correctly |
| BP-02 | Complex Financial Statement | Process a complex financial statement with multiple pages | PDF processed successfully, data extracted correctly |
| BP-03 | Portfolio Report | Process a portfolio report PDF | PDF processed successfully, data extracted correctly |
| BP-04 | Account Statement | Process an account statement PDF | PDF processed successfully, data extracted correctly |
| BP-05 | Investment Summary | Process an investment summary PDF | PDF processed successfully, data extracted correctly |

### 2. Table Extraction Tests

These tests verify that the system can extract tables from PDFs:

| Test ID | Test Name | Description | Expected Result |
|---------|-----------|-------------|-----------------|
| TE-01 | Simple Table | Process a PDF with a simple table | Table extracted correctly with all rows and columns |
| TE-02 | Complex Table | Process a PDF with a complex table (merged cells, etc.) | Table extracted correctly with all rows and columns |
| TE-03 | Multiple Tables | Process a PDF with multiple tables | All tables extracted correctly |
| TE-04 | Table with Images | Process a PDF with a table containing images | Table structure extracted correctly |
| TE-05 | Table Spanning Multiple Pages | Process a PDF with a table spanning multiple pages | Table extracted correctly as a single table |

### 3. Security Information Extraction Tests

These tests verify that the system can extract security information from PDFs:

| Test ID | Test Name | Description | Expected Result |
|---------|-----------|-------------|-----------------|
| SE-01 | ISIN Extraction | Process a PDF with ISINs | All ISINs extracted correctly |
| SE-02 | Security Name Extraction | Process a PDF with security names | All security names extracted correctly |
| SE-03 | Quantity Extraction | Process a PDF with security quantities | All quantities extracted correctly |
| SE-04 | Price Extraction | Process a PDF with security prices | All prices extracted correctly |
| SE-05 | Value Extraction | Process a PDF with security values | All values extracted correctly |
| SE-06 | Weight Extraction | Process a PDF with security weights | All weights extracted correctly |

### 4. Q&A Tests

These tests verify that the bot can answer questions based on the processed data:

| Test ID | Test Name | Description | Expected Result |
|---------|-----------|-------------|-----------------|
| QA-01 | Total Value Question | Ask about the total value of the portfolio | Correct total value returned |
| QA-02 | Security Count Question | Ask about the number of securities in the portfolio | Correct count returned |
| QA-03 | ISIN Question | Ask about the ISIN of a specific security | Correct ISIN returned |
| QA-04 | Weight Question | Ask about the weight of a specific security | Correct weight returned |
| QA-05 | Asset Allocation Question | Ask about the asset allocation of the portfolio | Correct asset allocation returned |
| QA-06 | Sector Allocation Question | Ask about the sector allocation of the portfolio | Correct sector allocation returned |
| QA-07 | Security Value Question | Ask about the value of a specific security | Correct value returned |
| QA-08 | Security Price Question | Ask about the price of a specific security | Correct price returned |
| QA-09 | Security Quantity Question | Ask about the quantity of a specific security | Correct quantity returned |
| QA-10 | Complex Question | Ask a complex question requiring multiple data points | Correct answer returned |

### 5. Edge Case Tests

These tests verify that the system can handle edge cases:

| Test ID | Test Name | Description | Expected Result |
|---------|-----------|-------------|-----------------|
| EC-01 | Large PDF | Process a large PDF (>10MB) | PDF processed successfully |
| EC-02 | Small PDF | Process a small PDF (<100KB) | PDF processed successfully |
| EC-03 | Scanned PDF | Process a scanned PDF | PDF processed successfully with OCR |
| EC-04 | Password-Protected PDF | Process a password-protected PDF | Appropriate error message displayed |
| EC-05 | Corrupted PDF | Process a corrupted PDF | Appropriate error message displayed |
| EC-06 | Non-Financial PDF | Process a non-financial PDF | Appropriate message indicating limited financial data |
| EC-07 | PDF with Images Only | Process a PDF with images only | OCR applied, text extracted from images |
| EC-08 | PDF with Non-Standard Fonts | Process a PDF with non-standard fonts | Text extracted correctly |
| EC-09 | PDF with Watermarks | Process a PDF with watermarks | Text extracted correctly, watermarks ignored |
| EC-10 | PDF with Form Fields | Process a PDF with form fields | Form field data extracted correctly |

## Test Data

### Real Financial PDFs

1. **Bank Statements**:
   - Bank of America statement
   - Chase statement
   - Wells Fargo statement

2. **Investment Reports**:
   - Vanguard investment report
   - Fidelity investment report
   - Charles Schwab investment report

3. **Portfolio Statements**:
   - Morgan Stanley portfolio statement
   - Goldman Sachs portfolio statement
   - UBS portfolio statement

4. **Financial Statements**:
   - Annual report
   - Quarterly report
   - Balance sheet

### Test Questions

For each processed PDF, the following questions will be asked:

1. What is the total value of the portfolio?
2. How many securities are in the portfolio?
3. What is the ISIN of [Security Name]?
4. What is the weight of [Security Name] in the portfolio?
5. What is the asset allocation of the portfolio?
6. What is the sector allocation of the portfolio?
7. What is the value of [Security Name]?
8. What is the price of [Security Name]?
9. What is the quantity of [Security Name]?
10. What are the top 3 securities by value in the portfolio?

## Test Execution

### Test Execution Steps

1. Access the test page: https://findoc-deploy.ey.r.appspot.com/test-pdf-processing.html
2. Select a PDF file from the test data
3. Enter a document name and select a document type
4. Select the appropriate processing options
5. Click "Upload and Process"
6. Wait for processing to complete
7. Verify that the document is processed successfully
8. Check the extracted text, tables, and securities
9. Ask questions about the processed document
10. Verify that the answers are correct

### Test Reporting

For each test, the following information will be recorded:

- Test ID
- Test Name
- Test Data (PDF file used)
- Test Steps
- Expected Result
- Actual Result
- Status (Pass/Fail)
- Comments

## Success Criteria

The test is considered successful if:

1. All PDFs are processed successfully
2. All tables are extracted correctly
3. All security information is extracted correctly
4. All questions are answered correctly
5. Edge cases are handled appropriately

## Test Schedule

The tests will be executed in the following order:

1. Basic PDF Processing Tests
2. Table Extraction Tests
3. Security Information Extraction Tests
4. Q&A Tests
5. Edge Case Tests

## Test Resources

- Test PDFs
- Test questions
- Test execution script
- Test report template

## Test Deliverables

- Test execution report
- Test results summary
- Issues identified during testing
- Recommendations for improvement
