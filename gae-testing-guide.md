# Google App Engine Testing Guide

This guide provides step-by-step instructions for testing the PDF processing functionality on the deployed Google App Engine website.

## Testing URL

The deployed application is available at:
https://findoc-deploy.ey.r.appspot.com/test-pdf-processing.html

## Testing Process

### 1. Access the Test Page

1. Open the test page in your browser: https://findoc-deploy.ey.r.appspot.com/test-pdf-processing.html
2. You should see the PDF Processing Test interface
3. Note: The dark theme toggle is in the top-right corner (🌞/🌙 icons)

### 2. Run Mock Tests

The easiest way to test the functionality is to use the built-in mock tests:

1. Click the "Test Financial Statement" button at the bottom of the upload form
2. Wait for the processing to complete (should take a few seconds)
3. Review the results in the "Processing Results" section
4. Check the "Overview", "Extracted Text", "Tables", and "Securities" tabs
5. Test the Q&A functionality by asking questions in the "Q&A" tab:
   - "What is the total value of the portfolio?"
   - "How many securities are in the portfolio?"
   - "What is the ISIN of Apple Inc?"
   - "What is the weight of Microsoft Corp in the portfolio?"
   - "What is the asset allocation of the portfolio?"

### 3. Upload and Test Real PDFs

To test with real PDFs:

1. Select a PDF file using the "Choose File" button
2. Enter a document name (e.g., "Test Financial Statement")
3. Select a document type (e.g., "Financial Statement")
4. Make sure all processing options are checked:
   - Enable OCR
   - Extract Tables
   - Detect ISINs
   - Extract Security Info
   - Portfolio Analysis
5. Select "Mock API (/api/mock)" from the API Endpoint dropdown
6. Click "Upload and Process"
7. Wait for the processing to complete (may take a few minutes for complex PDFs)
8. Review the results in the "Processing Results" section
9. Test the Q&A functionality with relevant questions

### 4. Test Different PDF Types

Test with different types of PDFs to evaluate the system's performance:

1. **Investment Portfolio Statements**:
   - Upload a portfolio statement PDF
   - Check if securities, ISINs, and asset allocation are correctly extracted
   - Ask questions about the portfolio composition

2. **Bank Statements**:
   - Upload a bank statement PDF
   - Check if transaction data is correctly extracted
   - Ask questions about account balances and transactions

3. **Account Statements**:
   - Upload an account statement PDF
   - Check if account details and transactions are correctly extracted
   - Ask questions about account activity

### 5. Test Edge Cases

Test with edge case PDFs to evaluate the system's robustness:

1. **Large PDFs**: Upload a large PDF (>5MB) and check processing performance
2. **Scanned PDFs**: Upload a scanned PDF and check OCR performance
3. **Complex Tables**: Upload a PDF with complex tables and check table extraction
4. **Multiple Pages**: Upload a multi-page PDF and check processing of all pages
5. **Non-Financial PDFs**: Upload a non-financial PDF and check error handling

### 6. Evaluate Results

For each test, evaluate the following:

1. **Upload Success**: Did the PDF upload successfully?
2. **Processing Time**: How long did the processing take?
3. **Text Extraction**: Was the text correctly extracted?
4. **Table Extraction**: Were tables correctly extracted with proper structure?
5. **Security Detection**: Were securities and ISINs correctly identified?
6. **Q&A Accuracy**: Were questions answered correctly based on the document content?

### 7. Document Issues

Document any issues encountered during testing:

1. **Upload Issues**: Problems with uploading PDFs
2. **Processing Errors**: Errors during PDF processing
3. **Extraction Issues**: Problems with text or table extraction
4. **Security Detection Issues**: Problems with identifying securities or ISINs
5. **Q&A Issues**: Incorrect or missing answers to questions
6. **UI Issues**: Problems with the user interface

## Test Reporting

After completing the tests, create a test report with the following information:

1. **Test Summary**: Overview of tests performed and results
2. **Test Details**: Detailed results for each test case
3. **Issues**: List of issues encountered during testing
4. **Recommendations**: Suggestions for improvement

## Sample Test Cases

### Test Case 1: Mock Financial Statement

1. Click "Test Financial Statement" button
2. Verify that processing completes successfully
3. Check that the overview shows correct portfolio value and asset allocation
4. Verify that securities are correctly displayed with ISINs
5. Ask "What is the total value of the portfolio?" and verify the answer

### Test Case 2: Real Portfolio Statement

1. Upload a real portfolio statement PDF
2. Verify that processing completes successfully
3. Check that text extraction includes key portfolio information
4. Verify that tables are correctly extracted with proper structure
5. Check that securities are correctly identified with ISINs
6. Ask questions about the portfolio and verify the answers

### Test Case 3: Edge Case - Scanned PDF

1. Upload a scanned PDF document
2. Verify that OCR is applied and text is extracted
3. Check the quality of text extraction from the scanned document
4. Verify that any tables in the scanned document are identified
5. Test Q&A functionality with the scanned document

## Conclusion

This testing guide provides a structured approach to evaluating the PDF processing functionality on the deployed Google App Engine website. By following these steps, you can thoroughly test the system's performance with different types of PDFs and identify any issues that need to be addressed.
