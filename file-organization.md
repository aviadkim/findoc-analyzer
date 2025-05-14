# PDF Processing System File Organization

This document provides an overview of the file organization for the PDF processing system, including which files to use and which are legacy or experimental.

## Primary Files

These are the main files you should use for PDF processing:

### Core Services

| File | Purpose | Description |
|------|---------|-------------|
| `services/pdf-processor.js` | Basic PDF processing | Extracts text, tables, and metadata from PDFs |
| `services/mcp-document-processor.js` | Enhanced processing | Adds AI-powered entity extraction capabilities |
| `services/sequential-thinking-mcp.js` | Entity extraction | Custom MCP for extracting financial entities |
| `services/brave-search-mcp.js` | Entity enrichment | Custom MCP for enriching extracted entities |
| `services/entity-extractor.js` | Entity extraction | Extracts financial entities using various methods |
| `services/table-detector.js` | Table detection | Detects tables in document text |
| `services/table-extractor.js` | Table extraction | Extracts structured table data |
| `services/ocr-integration.js` | OCR processing | Provides OCR capabilities for scanned documents |
| `services/api-key-manager.js` | API key management | Manages API keys for external services |

### Testing and Running

| File | Purpose | Description |
|------|---------|-------------|
| `test-pdf-simple.js` | Simple testing | Quick test of PDF processing capabilities |
| `test-pdf-optimized.js` | Comprehensive testing | Advanced test with better error handling and reporting |
| `pdf-processing-server-optimized.js` | Server implementation | REST API server for PDF processing |
| `run-pdf-tests.sh` | Test runner (Linux/Mac) | Script to run all PDF tests |
| `run-pdf-tests.bat` | Test runner (Windows) | Script to run all PDF tests |
| `install-pdf-dependencies.sh` | Dependency installer (Linux/Mac) | Script to install all required dependencies |
| `install-pdf-dependencies.bat` | Dependency installer (Windows) | Script to install all required dependencies |

### Documentation

| File | Purpose | Description |
|------|---------|-------------|
| `README-PDF-PROCESSING.md` | Overview | Main documentation file for the PDF processing system |
| `PDF-PROCESSING-GUIDE.md` | Detailed guide | Comprehensive guide to the system architecture and usage |
| `PDF-PROCESSING-FINAL.md` | Implementation status | Current status of the implementation and next steps |
| `PDF-PROCESSING-SUMMARY.md` | Testing summary | Summary of testing results and findings |

### Test Data

| Directory | Purpose | Description |
|-----------|---------|-------------|
| `test-pdfs/` | Test PDFs | Contains test PDF files for processing |
| `pdf-test-results/` | Test results | Contains the output of PDF processing tests |

## Deprecated/Legacy Files

These files are older versions or experimental files that should not be used:

| File | Status | Notes |
|------|--------|-------|
| `pdf-processing-server.js` | Deprecated | Original server implementation with timeout issues |
| `pdf-processing-fix.js` | Legacy | Old file with fixes for original implementation |
| `pdf-upload-fix.js` | Legacy | Original file for PDF upload fixes |
| `pdf-processing-test.js` | Legacy | Original incomplete test file |
| `pdf-processing-auth-fix.js` | Legacy | Authentication fixes for original implementation |
| `pdf-upload-test.js` | Legacy | Original PDF upload test |
| `test-document-processing.js` | Legacy | Older test implementation |
| `test-pdf-processing.js` | Legacy | Older test implementation |
| `test-pdf-processing-new.js` | Legacy | Intermediate test implementation |
| `test-pdf-processing-real.js` | Legacy | Real-world test with specific PDFs |
| `test-document-processor.js` | Legacy | Test focusing on document processor |

## File Relationships

```
                                ┌─────────────────────┐
                                │ pdf-processor.js    │
                                └─────────────┬───────┘
                                              │
                                              ▼
┌────────────────────┐          ┌─────────────────────┐          ┌─────────────────────┐
│sequential-thinking-│◄─────────┤mcp-document-       ◄│──────────►brave-search-mcp.js │
│mcp.js              │          │processor.js         │          └─────────────────────┘
└────────────────────┘          └─────────────┬───────┘
                                              │
                                              ▼
                                ┌─────────────────────┐
                                │entity-extractor.js  │
                                └─────────────────────┘
```

## Repository Structure

The PDF processing system is spread across several repositories and directories in the project. Here's how they map:

1. **Main Repository**: `/mnt/c/Users/aviad/OneDrive/Desktop/backv2-main/`
   - Contains the core PDF processing system

2. **GitHub Repository**: `/mnt/c/Users/aviad/OneDrive/Desktop/backv2-main/backv2-github/`
   - Contains older versions of the code
   - Should not be used directly

3. **DevDocs Repository**: `/mnt/c/Users/aviad/OneDrive/Desktop/backv2-main/DevDocs/`
   - Contains developer documentation
   - Has some utility code but not directly related to PDF processing

## Best Practices for Using the System

1. **Always Use the Primary Files**: Stick to the primary files listed above to ensure consistent behavior
2. **Run the Installation Script First**: Always run the appropriate installation script before testing
3. **Start with Simple Tests**: Begin testing with `test-pdf-simple.js` before moving to more complex tests
4. **Use the Test Runner**: For comprehensive testing, use `run-pdf-tests.sh` or `run-pdf-tests.bat`
5. **Check Logs for Errors**: Review the `mcp-logs` directory for any errors during processing
6. **Keep Test PDFs Small**: Start with small, simple PDFs before testing with complex documents

## Adding New Files

When adding new files to the system:

1. Place service files in the `services/` directory
2. Place test files in the root directory with a descriptive name
3. Document new files in this file organization document
4. Update the README and guide documents as needed