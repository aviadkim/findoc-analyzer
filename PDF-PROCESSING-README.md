# PDF Processing in FinDoc Analyzer

This document explains how to use the PDF processing functionality in FinDoc Analyzer.

## Overview

FinDoc Analyzer provides a comprehensive PDF processing pipeline that extracts and analyzes financial data from PDF documents. The processing pipeline includes:

1. **Text Extraction**: Extracts all text content from the PDF.
2. **Structure Analysis**: Analyzes the document structure to identify sections, headers, and content.
3. **Table Detection**: Identifies tables in the document.
4. **Table Data Extraction**: Extracts data from tables.
5. **Securities Identification**: Identifies securities mentioned in the document.
6. **Financial Data Processing**: Processes financial data to extract key metrics.
7. **Insights Generation**: Generates insights based on the extracted data.

## How to Use

### Upload and Process a Document

1. Navigate to the upload page at http://localhost:8080/upload-new
2. Select the document type from the dropdown menu
3. Drag and drop a PDF file or click "Browse Files" to select a file
4. Click "Upload" to upload the file
5. The system will automatically start processing the document
6. You can monitor the processing progress in real-time
7. Once processing is complete, you will be redirected to the document chat page

### Chat with a Processed Document

1. Navigate to the document chat page at http://localhost:8080/document-chat
2. Select a processed document from the dropdown menu
3. Type a question about the document in the input field
4. Press Enter or click the "Send" button to submit your question
5. The system will analyze the document and provide an answer based on the extracted data

## Implementation Details

### PDF Processor Module

The PDF processor module (`pdf-processor.js`) handles the PDF processing pipeline. It provides the following functionality:

- **Document Processing**: Processes PDF documents with detailed logging and progress tracking.
- **Progress Tracking**: Tracks processing progress and updates the UI in real-time.
- **Error Handling**: Handles errors during processing and provides detailed error messages.
- **Data Generation**: Generates structured data from the processed document.

### Document Chat Module

The document chat module (`document-chat-fix.js`) provides a chat interface for interacting with processed documents. It includes:

- **Document Selection**: Allows users to select a processed document to chat with.
- **Chat Interface**: Provides a chat interface for asking questions about the document.
- **Question Answering**: Analyzes the document to answer user questions.
- **Conversation History**: Saves conversation history for each document.

## Testing

The system includes comprehensive testing for the PDF processing functionality:

1. **Upload Testing**: Tests the document upload functionality.
2. **Processing Testing**: Tests the document processing pipeline.
3. **Chat Testing**: Tests the document chat functionality.

To run the tests, use the following command:

```bash
node test-pdf-processing-new.js
```

## Troubleshooting

If you encounter issues with the PDF processing functionality, try the following:

1. **Check the Console**: Open the browser console to check for error messages.
2. **Verify File Format**: Ensure the file is a valid PDF document.
3. **Check File Size**: Large files may take longer to process.
4. **Restart the Server**: Try restarting the server if processing fails.

## Future Improvements

Planned improvements for the PDF processing functionality include:

1. **Enhanced OCR**: Improved OCR for better text extraction from scanned documents.
2. **Advanced Table Extraction**: Better table extraction for complex tables.
3. **Multi-Language Support**: Support for processing documents in multiple languages.
4. **Batch Processing**: Support for processing multiple documents at once.
5. **Custom Processing Rules**: Allow users to define custom processing rules for specific document types.

## API Reference

### PDF Processor API

```javascript
// Process a document
window.pdfProcessor.processFile(fileId)
  .then(data => {
    // Handle processed data
  })
  .catch(error => {
    // Handle error
  });

// Get processing status
const status = window.pdfProcessor.status;
```

### Document Chat API

```javascript
// Send a chat message
function sendChatMessage() {
  const message = document.getElementById('document-chat-input').value;
  const documentId = document.getElementById('document-select').value;
  
  // Add message to chat
  addUserMessage(message);
  
  // Save to history
  saveToHistory(documentId, 'user', message);
  
  // Generate response
  // ...
}
```
