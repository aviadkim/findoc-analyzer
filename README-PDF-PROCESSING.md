# FinDoc PDF Processing System

This repository contains a comprehensive system for processing financial PDF documents, extracting structured data, and enabling advanced financial analysis through AI-powered entity recognition.

## Quick Start

1. **Install Dependencies**:
   ```bash
   # On Linux/Mac
   chmod +x install-pdf-dependencies.sh
   ./install-pdf-dependencies.sh
   
   # On Windows
   install-pdf-dependencies.bat
   ```

2. **Run Basic Test**:
   ```bash
   node test-pdf-simple.js
   ```

3. **Start Processing Server**:
   ```bash
   node pdf-processing-server-optimized.js
   ```
   Then open your browser to http://localhost:8080

## Core Components

- **PDF Processor** (`services/pdf-processor.js`) - Extracts text, tables, and metadata from PDFs
- **MCP Document Processor** (`services/mcp-document-processor.js`) - Adds AI-powered entity extraction
- **Custom MCPs**:
  - Sequential Thinking MCP (`services/sequential-thinking-mcp.js`) - Entity extraction
  - Brave Search MCP (`services/brave-search-mcp.js`) - Entity enrichment

## Key Features

- Text extraction from PDFs with fallback to OCR
- Table detection and structured extraction
- Financial entity recognition (companies, securities, ISINs, metrics)
- Entity enrichment with additional data
- REST API for PDF processing
- Interactive UI for testing and visualization

## Test PDFs

The repository includes several test PDFs in the `test-pdfs` directory:
- `messos.pdf` - Complex financial statement
- `sample_portfolio.pdf` - Portfolio holdings
- `simple-financial-statement.pdf` - Simple financial document
- `financial-report.pdf` - Basic financial report

## Testing Options

- **Simple Test**: `node test-pdf-simple.js` - Quick testing of basic functionality
- **Optimized Test**: `node test-pdf-optimized.js` - Comprehensive testing with memory optimization
- **Server Test**: `node pdf-processing-server-optimized.js` - Interactive testing via web UI

## Documentation

For detailed documentation, refer to:
- [PDF Processing Guide](PDF-PROCESSING-GUIDE.md) - Comprehensive guide to the system
- [PDF Processing Final](PDF-PROCESSING-FINAL.md) - Implementation status and roadmap
- [PDF Processing Summary](PDF-PROCESSING-SUMMARY.md) - Summary of testing results

## Project Structure

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
│   └── ocr-integration.js        # OCR capabilities
│
├── test-pdfs/             # Test PDF files for processing
├── pdf-test-results/      # Output directory for test results
├── test-pdf-simple.js     # Simple PDF processing test
├── test-pdf-optimized.js  # Optimized PDF processing test
└── pdf-processing-server-optimized.js # PDF processing server
```

## Requirements

- Node.js 16+
- Python 3.6+ (for optional OCR features)
- Python packages: PyMuPDF, pandas (optional)
- System tools: Tesseract OCR (optional for scanned documents)

## API Usage

```javascript
// Basic processing
const pdfProcessor = require('./services/pdf-processor');
const result = await pdfProcessor.processPdf('path/to/document.pdf');

// Enhanced processing with entity extraction
const mcpDocumentProcessor = require('./services/mcp-document-processor');
const result = await mcpDocumentProcessor.processDocument('path/to/document.pdf');
```

## Contributing

Contributions are welcome! Please see the contributing guidelines for more details.

## License

This project is licensed under the MIT License - see the LICENSE file for details.