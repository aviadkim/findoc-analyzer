# FinDoc Analyzer Testing Guide

This guide provides instructions for testing the PDF processing functionality of the FinDoc Analyzer application.

## Overview

The FinDoc Analyzer application is designed to process financial documents (PDFs, Excel, etc.) and extract valuable information such as securities, portfolio allocations, and other financial data. The application uses a tiered processing approach based on document complexity.

## Testing with Mock Data

Until the Google Authentication and other components are fully implemented, we're using mock data for testing. This allows us to test the UI and functionality without requiring authentication or actual API calls.

### Test HTML Page

We've created a simple HTML page for testing the PDF processing functionality:

- **File**: `pdf_processing_test.html`
- **Purpose**: Test the PDF processing functionality with mock data

### How to Test

1. Open the `pdf_processing_test.html` file in a web browser
2. Select a PDF file (any PDF will work as we're using mock data)
3. Enter a document name and select a document type
4. Configure the processing options as needed
5. Click "Upload and Process"
6. View the processing results in the tabs:
   - **Overview**: General information about the document
   - **Extracted Text**: The text extracted from the PDF
   - **Tables**: Tables extracted from the PDF
   - **Securities**: Securities extracted from the PDF
   - **Q&A**: Ask questions about the document

### Mock Data

The mock data includes:

- Sample portfolio data with securities, asset allocations, and other financial information
- Sample tables with headers and rows
- Sample text extracted from the PDF
- Sample Q&A functionality

## Testing with Real Data

Once the Google Authentication and other components are implemented, we'll be able to test with real data. The testing process will be similar, but will use actual API calls instead of mock data.

## TaskMaster AI

We're using TaskMaster AI to manage the development tasks for the FinDoc Analyzer application. The tasks are defined in the `taskmaster.json` file.

To use TaskMaster AI:

1. Run the `start-taskmaster-ai.bat` file
2. Use the TaskMaster AI commands to manage tasks

## Next Steps

1. Implement Google Authentication
2. Complete the tiered PDF processing implementation
3. Implement pricing and billing
4. Implement multi-tenant data isolation

## Feedback

If you encounter any issues or have suggestions for improvement, please let us know.
