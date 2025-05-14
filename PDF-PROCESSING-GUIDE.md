# PDF Processing System Guide

## Overview

The FinDoc PDF Processing System is designed to extract, analyze, and process financial data from PDF documents. This guide provides a comprehensive overview of the system architecture, key components, and how to run tests effectively.

## System Architecture

The system follows a modular design with the following core components:

### 1. Core PDF Processing (`services/pdf-processor.js`)
Responsible for basic PDF processing including:
- Text extraction
- Table detection
- Metadata extraction
- OCR integration for scanned documents

### 2. MCP Document Processing (`services/mcp-document-processor.js`)
Extends the core PDF processing with AI-powered capabilities:
- Entity extraction from text (companies, ISINs, metrics)
- Entity enrichment with additional information
- Enhanced table structure analysis

### 3. MCP Implementations
Custom MCP (Model Context Protocol) implementations for AI functionality:
- `services/sequential-thinking-mcp.js` - For entity extraction
- `services/brave-search-mcp.js` - For entity enrichment

### 4. Specialized Extractors
Domain-specific extractors for financial data:
- `services/entity-extractor.js` - Extracts financial entities
- `services/table-detector.js` - Detects tables in document text
- `services/table-extractor.js` - Extracts structured table data

### 5. OCR Integration (`services/ocr-integration.js`)
Provides OCR capabilities for processing scanned documents.

### 6. Server Implementation (`pdf-processing-server-optimized.js`)
The server that exposes the PDF processing capabilities through a REST API.

## Directory Structure

```
/backv2-main/
├── services/              # Core service implementations
│   ├── pdf-processor.js          # Basic PDF processing
│   ├── mcp-document-processor.js # Enhanced document processing
│   ├── sequential-thinking-mcp.js # Custom MCP for entity extraction
│   ├── brave-search-mcp.js       # Custom MCP for entity enrichment
│   ├── entity-extractor.js       # Financial entity extraction
│   ├── table-detector.js         # Table detection in text
│   ├── table-extractor.js        # Table structure extraction
│   ├── ocr-integration.js        # OCR capabilities
│   └── api-key-manager.js        # API key management
│
├── test-pdfs/             # Test PDF files for processing
│   ├── messos.pdf                # Complex financial statement
│   ├── sample_portfolio.pdf      # Sample portfolio statement
│   └── financial-report.pdf      # Simple financial report
│
├── pdf-test-results/      # Output directory for test results
│
├── test-pdf-simple.js     # Simple PDF processing test
├── test-pdf-optimized.js  # Optimized PDF processing test
├── pdf-processing-server-optimized.js # PDF processing server
└── install-pdf-dependencies.sh # Script to install dependencies
```

## Key Functions

### PDF Processing

```javascript
// Basic PDF processing
const result = await pdfProcessor.processPdf(filePath, { useOcr });

// Enhanced processing with entity extraction
const result = await mcpDocumentProcessor.processDocument(filePath);
```

### Entity Extraction

```javascript
// Extract financial entities from text
const entities = await sequentialThinkingMcp.handleRequest({
  action: 'think',
  params: {
    question: `Extract all financial entities from this text: ${text}`,
    maxSteps: 3
  }
});
```

### Table Extraction

```javascript
// Extract tables from text
const tables = pdfProcessor.extractTables(filePath, text);
```

## Running Tests

### 1. Simple Test (Fastest)

For a quick test of the PDF processing system:

```bash
node test-pdf-simple.js
```

This will process the PDFs in the test-pdfs directory and output results to pdf-test-results.

### 2. Optimized Test (Comprehensive)

For a more thorough test with better error handling and memory management:

```bash
node test-pdf-optimized.js
```

### 3. Server Test (Interactive)

To start the PDF processing server and test via web interface:

```bash
node pdf-processing-server-optimized.js
```

Then open your browser to http://localhost:8080

## Test PDFs

The system includes several test PDFs:

1. **messos.pdf** - A complex financial statement
2. **sample_portfolio.pdf** - A portfolio statement with holdings
3. **simple-financial-statement.pdf** - A simple financial statement
4. **financial-report.pdf** - A basic financial report

## Installation

Before running tests, install all necessary dependencies:

### On Linux/Mac:
```bash
chmod +x install-pdf-dependencies.sh
./install-pdf-dependencies.sh
```

### On Windows:
```bash
install-pdf-dependencies.bat
```

## Testing Workflow

1. Install dependencies
2. Run the simple test to verify basic functionality
3. Run the optimized test for comprehensive evaluation
4. Start the server for interactive testing

## Implementation Details

### Entity Extraction

The system can extract the following entity types:

- **Companies** - Business entities mentioned in the document
- **Securities** - Financial instruments with associated ISINs
- **ISINs** - International Securities Identification Numbers
- **Financial Metrics** - Numerical data points like percentages and values
- **Currencies** - Monetary values with currency symbols

### Table Extraction

Table extraction works by:
1. Detecting potential table regions in the text
2. Analyzing line patterns and separator characters
3. Reconstructing table structure with headers and rows
4. Providing structured data in JSON format

### OCR Integration

For scanned documents, the system:
1. Detects if text extraction returns very little text
2. Falls back to OCR processing if available
3. Uses external tools (tesseract, pdftotext) for OCR

## Common Issues and Solutions

1. **MCP Dependencies**
   - Problem: Sequential Thinking or Brave Search MCPs not found
   - Solution: Use the provided custom implementations in the services directory

2. **Python Dependencies**
   - Problem: Missing Python packages (PyMuPDF, pandas) for advanced extraction
   - Solution: Run the installation script or install manually with pip

3. **OCR Capabilities**
   - Problem: OCR not working for scanned documents
   - Solution: Install Tesseract OCR and related tools via the installation script

4. **Memory Issues with Large PDFs**
   - Problem: Processing very large PDFs causes memory problems
   - Solution: Use the optimized test script with chunking and streaming

## API Integration

To integrate with the PDF processing server:

```javascript
// Upload and process a PDF
const formData = new FormData();
formData.append('pdf', pdfFile);
formData.append('useOcr', 'true'); // Optional

const response = await fetch('http://localhost:8080/api/process-pdf', {
  method: 'POST',
  body: formData
});

const result = await response.json();
const documentId = result.id;

// Ask questions about the document
const questionResponse = await fetch(`http://localhost:8080/api/documents/${documentId}/questions`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ question: 'What is this document about?' })
});

const answer = await questionResponse.json();
```

## Next Steps

1. Improve entity extraction with more specialized extractors
2. Enhance table detection for complex formats
3. Add support for additional languages
4. Implement caching for faster processing
5. Add more comprehensive testing for edge cases

## Conclusion

This PDF processing system provides a powerful foundation for extracting, analyzing, and processing financial data from PDF documents. By using the modular architecture and extending with custom MCPs, the system can be adapted to various financial document types and use cases.