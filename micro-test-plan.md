# FinDoc Analyzer Micro-Testing Plan

This document outlines a series of small, focused tests to verify the functionality of the FinDoc Analyzer application.

## Website Access Tests

### Test 1: Basic Website Access
- Open the website: https://findoc-deploy.ey.r.appspot.com/
- Verify the page loads correctly
- Verify the dashboard is visible

### Test 2: Navigation Menu
- Verify all sidebar menu items are visible
- Click on each menu item and verify the corresponding page loads

### Test 3: Dark Mode Toggle
- Locate the dark mode toggle (if available)
- Toggle dark mode on and verify UI changes
- Toggle dark mode off and verify UI returns to light mode

## Document Upload Tests

### Test 4: Upload Button Visibility
- Verify the "Upload Document" button is visible
- Click the "Upload Document" button
- Verify the upload dialog appears

### Test 5: File Selection
- Click "Choose File" in the upload dialog
- Select a simple PDF file
- Verify the file name appears in the dialog

### Test 6: Document Type Selection
- Verify document type dropdown is visible
- Click the dropdown and verify options are available
- Select "Financial Statement" as the document type

### Test 7: Upload Initiation
- Click the "Upload" button
- Verify upload progress indicator appears
- Wait for upload to complete or error message

## Document Processing Tests

### Test 8: Processing Status Check
- After upload, navigate to "Document Processing" section
- Verify the uploaded document appears in the list
- Check the processing status

### Test 9: Processing Completion
- Wait for processing to complete (may take several minutes)
- Verify status changes to "Completed" or shows an error
- Document any error messages

## Document Viewing Tests

### Test 10: Document List
- Navigate to "Documents" section
- Verify the uploaded document appears in the list
- Click on the document to view details

### Test 11: Document Details
- Verify document details page loads
- Check that document name, type, and upload date are correct
- Verify document preview or content is visible

## Data Extraction Tests

### Test 12: Text Extraction
- Navigate to the document details page
- Check if extracted text is visible
- Verify text content matches the original document

### Test 13: Table Extraction
- Check if extracted tables are visible
- Verify table structure matches the original document
- Check if table data is correctly formatted

### Test 14: Security Information
- Check if security information (ISINs, etc.) is extracted
- Verify security names, ISINs, and other details are correct
- Check if portfolio summary information is available

## Document Chat Tests

### Test 15: Chat Interface
- Navigate to "Document Chat" section
- Verify chat interface is visible
- Check if document selection is available

### Test 16: Basic Question
- Select a processed document
- Type a simple question: "What is this document about?"
- Submit the question and wait for response

### Test 17: Financial Question
- Type a financial question: "What is the total value of the portfolio?"
- Submit the question and wait for response
- Verify the answer contains financial information

### Test 18: Security Question
- Type a security-related question: "What securities are in the portfolio?"
- Submit the question and wait for response
- Verify the answer lists securities

## Analytics Tests

### Test 19: Analytics Dashboard
- Navigate to "Analytics" section
- Verify analytics dashboard loads
- Check if charts and graphs are visible

### Test 20: Portfolio Analysis
- Navigate to "Portfolio" section
- Verify portfolio overview is visible
- Check if asset allocation chart is displayed

## Error Handling Tests

### Test 21: Invalid File Upload
- Attempt to upload a non-PDF file (e.g., .txt or .docx)
- Verify appropriate error message is displayed
- Check if the system prevents the upload

### Test 22: Empty Question
- In Document Chat, try to submit an empty question
- Verify the system prevents submission or shows an error
- Check error message clarity

## Performance Tests

### Test 23: Page Load Time
- Measure time to load the dashboard
- Measure time to load the documents list
- Measure time to load document details

### Test 24: Processing Time
- Measure time from upload completion to processing start
- Measure time for document processing to complete
- Document any timeouts or excessive delays

## Mobile Responsiveness Tests

### Test 25: Mobile View
- Open the website on a mobile device or using browser developer tools
- Verify the layout adjusts appropriately
- Check if all functions are accessible on mobile

## Test Documentation

For each test, document:
1. Test ID and name
2. Steps performed
3. Expected result
4. Actual result
5. Pass/Fail status
6. Screenshots (if applicable)
7. Any error messages or unexpected behavior

## Test Execution Plan

1. Execute tests 1-5 first to verify basic access and upload functionality
2. If successful, proceed with tests 6-10 to verify document processing
3. Continue with tests 11-15 to verify data extraction
4. Execute tests 16-20 to verify document chat functionality
5. Complete with tests 21-25 to verify error handling and performance

## Test Reporting

After completing all tests, compile a report with:
1. Summary of test results
2. Pass/fail counts
3. List of issues found
4. Screenshots of issues
5. Recommendations for improvement
