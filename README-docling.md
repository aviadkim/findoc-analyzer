# Docling Integration for FinDoc Analyzer

This repository contains the integration of [Docling](https://docling-project.github.io/docling/) with the FinDoc Analyzer application, enhancing the scan1 component for improved PDF processing capabilities.

## Quick Start

To install and run the Docling integration:

1. Make sure Python 3.8 or higher is installed.
2. Run the integration script:

```powershell
.\run-docling-integration.ps1
```

3. Restart the application to apply the changes.

## Features

- **Advanced PDF Understanding**: Improved page layout analysis, reading order detection, table structure recognition, and more.
- **Code and Formula Recognition**: Better detection and extraction of code blocks and mathematical formulas in documents.
- **Image Classification**: Automatic classification of images in documents (charts, diagrams, logos, etc.).
- **Image Description**: AI-powered descriptions of images using Vision Language Models (VLMs).
- **Enhanced Table Extraction**: More accurate extraction of tables from documents.
- **Securities Detection**: Improved detection of securities information (ISIN codes, etc.) in financial documents.

## Components

- **docling-scan1-integration.js**: Main integration module that provides functions for processing documents with Docling and enhancing the scan1 controller.
- **test-docling-integration.js**: Test script for verifying the Docling integration.
- **integrate-docling-with-scan1.js**: Script for integrating Docling with the scan1 controller.
- **run-docling-integration.ps1**: PowerShell script for running the Docling integration.
- **docling-integration-docs.md**: Detailed documentation for the Docling integration.

## API Endpoints

- **GET /api/docling/status**: Check if Docling is available.
- **POST /api/docling/process/:id**: Process a document with Docling.
- **POST /api/scan1/process/:id?useDocling=true**: Process a document with scan1, using Docling if the `useDocling` parameter is set to `true`.

## Requirements

- Python 3.8 or higher
- Node.js 18 or higher
- Docling Python package (installed automatically by the integration script)

## Documentation

For detailed documentation, see [docling-integration-docs.md](./docling-integration-docs.md).

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [Docling](https://docling-project.github.io/docling/) - Document processing library
- [FinDoc Analyzer](https://github.com/aviadkim/backv2) - Financial document analysis application
