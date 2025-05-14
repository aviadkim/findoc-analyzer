# FinDoc Analyzer - Enhanced Edition

This enhanced version of FinDoc Analyzer provides improved document processing and chat capabilities. It includes unified document processing, enhanced chat interactions, and advanced table generation features.

## Features

- **Unified Document Processing**: Process PDF and Excel files with a streamlined pipeline that automatically selects the best processing method based on file type and available tools.
- **Enhanced Financial Data Extraction**: Better extraction of securities, portfolio summary, and asset allocation from financial documents.
- **Improved Chat Capabilities**: Ask questions about documents and get more accurate, context-aware answers.
- **Table Generation**: Generate tables based on document content for better data visualization.
- **Backward Compatibility**: All original API endpoints continue to work while new enhanced endpoints are available.

## Installation

```powershell
# Run the setup script
.\setup-enhanced.ps1
```

This will:
1. Create necessary directories
2. Install dependencies
3. Generate a sample PDF for testing

## Running the Application

```powershell
# Run the enhanced server
.\run-enhanced.ps1
```

The server will start on http://localhost:8080

## Testing the API

```powershell
# Run the API tests
.\test-enhanced.ps1
```

This will:
1. Start the server (if not already running)
2. Test document upload
3. Test document processing
4. Test asking questions about documents
5. Test generating tables from documents

## Directory Structure

```
/
├── src/
│   ├── api/
│   │   ├── controllers/
│   │   │   ├── enhancedDocumentController.js    # Enhanced document processing
│   │   │   ├── enhancedChatController.js        # Enhanced chat capabilities
│   │   │   └── ...
│   │   ├── services/
│   │   │   ├── unifiedDocumentProcessingService.js  # Unified document processing
│   │   │   └── ...
│   │   └── routes/
│   │       ├── enhancedRoutes.js                # Routes for enhanced features
│   │       └── ...
│   ├── app.js                                   # Original application
│   ├── app-enhanced.js                          # Enhanced application
│   └── ...
├── run-enhanced.js                              # Enhanced startup script
├── test-enhanced-api.js                         # Enhanced API test script
├── generate-test-pdf.js                         # Script to generate test PDF
└── ...
```

## API Endpoints

### Enhanced Document Endpoints

- **GET /api/enhanced/documents** - Get all documents
- **POST /api/enhanced/documents** - Upload and create a document
- **GET /api/enhanced/documents/:id** - Get document by ID
- **POST /api/enhanced/documents/:id/process** - Process a document
- **DELETE /api/enhanced/documents/:id** - Delete a document

### Enhanced Chat Endpoints

- **POST /api/enhanced/chat/message** - Send a message to the chat
- **GET /api/enhanced/chat/history/:documentId** - Get chat history for a document
- **DELETE /api/enhanced/chat/history/:documentId** - Clear chat history for a document
- **POST /api/enhanced/documents/:id/ask** - Ask a question about a document
- **POST /api/enhanced/documents/:id/table** - Generate a table from a document

## Using the API

### Processing a Document

1. Upload a document:
   ```javascript
   const formData = new FormData();
   formData.append('file', fileObject);
   
   const response = await fetch('/api/enhanced/documents', {
     method: 'POST',
     body: formData
   });
   ```

2. Process the document:
   ```javascript
   const documentId = /* ID from upload response */;
   
   const response = await fetch(`/api/enhanced/documents/${documentId}/process`, {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({
       options: {
         useGemini: true  // Use the Gemini AI model for processing
       }
     })
   });
   ```

### Asking Questions About Documents

```javascript
const documentId = /* Document ID */;
const question = 'What securities are in the portfolio?';

const response = await fetch(`/api/enhanced/documents/${documentId}/ask`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ question })
});
```

### Generating Tables

```javascript
const documentId = /* Document ID */;
const tableType = 'securities'; // 'securities', 'assetAllocation', 'portfolioSummary', or 'custom'

const response = await fetch(`/api/enhanced/documents/${documentId}/table`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    tableType,
    options: {
      // For custom tables:
      title: 'Custom Securities Table',
      description: 'Shows selected properties of securities',
      columns: ['name', 'isin', 'value', 'currency']
    }
  })
});
```

## Development

To further develop the enhanced features:

1. Add new controllers in `src/api/controllers/`
2. Add new services in `src/api/services/`
3. Add new routes in `src/api/routes/enhancedRoutes.js`
4. Update the `app-enhanced.js` file to include your new functionality

## Troubleshooting

If you encounter issues:

1. Check the logs in the `logs` directory
2. Ensure all required directories exist (uploads, temp, results)
3. Verify that the necessary API keys are set in the environment
4. Check that MongoDB is running if needed
