# FinDoc PDF Processing Testing Guide

## Overview

This guide walks you through testing the PDF processing capabilities of FinDoc Analyzer. You'll be able to upload and process PDF files, view extracted text, tables, and entities, and explore the system's capabilities.

## Getting Started

1. The PDF processing server is now running at: http://localhost:9090

2. Open this URL in your web browser to access the testing interface.

## Testing Options

### Option 1: Process Sample PDF

1. When the interface loads, click the **"Or Process Sample PDF"** button.
2. Choose the processing option:
   - **Standard Processing**: Basic text and table extraction
   - **Enhanced Processing with MCP**: Advanced entity extraction and analysis
3. Wait for processing to complete (you'll see the progress bar fill up).
4. View the results in the tabs on the right side.

### Option 2: Upload Your Own PDF

1. Click the **"Choose File"** button and select a PDF document.
2. Choose the processing option:
   - **Standard Processing**: Basic text and table extraction
   - **Enhanced Processing with MCP**: Advanced entity extraction and analysis
3. Click the **"Process Document"** button.
4. Wait for processing to complete.
5. View the results in the tabs on the right side.

## Exploring Results

The results are organized into several tabs:

1. **Text**: Shows the extracted text content from the PDF.
2. **Tables**: Displays tables found in the document. Use the dropdown to switch between tables.
3. **Entities**: Shows entities (like companies, ISINs, dates, etc.) extracted from the document.
4. **Metadata**: Displays metadata about the document (page count, author, etc.).
5. **Raw**: Shows the raw JSON output from the processor.

## Processing Statistics

The left panel shows statistics about the processed document:

- **Tables**: Number of tables found in the document
- **Entities**: Number of entities extracted
- **Pages**: Number of pages in the document
- **Words**: Total word count in the document

## Sample PDFs Available

The system has several sample PDFs you can use for testing:

1. **messos.pdf**: A financial portfolio statement
2. **sample_portfolio.pdf**: A simple portfolio summary
3. **test-document.pdf**: A basic test document

## Troubleshooting

If you encounter any issues:

1. Check the console for error messages
2. Try refreshing the page
3. Try a different PDF file
4. Try the alternative processing method

## Next Steps

After testing the PDF processing capabilities, you may want to:

1. Test integrating the extraction results with other components
2. Compare extraction from different PDFs
3. Test with complex financial documents
4. Try the Excel processing capabilities