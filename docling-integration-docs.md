# Docling Integration with FinDoc Analyzer

This document provides an overview of the Docling integration with the FinDoc Analyzer application, specifically enhancing the scan1 component for improved PDF processing capabilities.

## Overview

[Docling](https://docling-project.github.io/docling/) is a powerful document processing library that simplifies parsing diverse formats, including advanced PDF understanding, and provides seamless integrations with the gen AI ecosystem. By integrating Docling with the scan1 component, FinDoc Analyzer gains enhanced capabilities for processing financial documents.

## Features

Docling integration adds the following features to FinDoc Analyzer:

- **Advanced PDF Understanding**: Improved page layout analysis, reading order detection, table structure recognition, and more.
- **Code and Formula Recognition**: Better detection and extraction of code blocks and mathematical formulas in documents.
- **Image Classification**: Automatic classification of images in documents (charts, diagrams, logos, etc.).
- **Image Description**: AI-powered descriptions of images using Vision Language Models (VLMs).
- **Enhanced Table Extraction**: More accurate extraction of tables from documents.
- **Securities Detection**: Improved detection of securities information (ISIN codes, etc.) in financial documents.

## Architecture

The integration consists of the following components:

1. **docling-scan1-integration.js**: Main integration module that provides functions for processing documents with Docling and enhancing the scan1 controller.
2. **test-docling-integration.js**: Test script for verifying the Docling integration.
3. **integrate-docling-with-scan1.js**: Script for integrating Docling with the scan1 controller.
4. **run-docling-integration.ps1**: PowerShell script for running the Docling integration.

## API Endpoints

The integration adds the following API endpoints:

- **GET /api/docling/status**: Check if Docling is available.
- **POST /api/docling/process/:id**: Process a document with Docling.
- **POST /api/scan1/process/:id?useDocling=true**: Process a document with scan1, using Docling if the `useDocling` parameter is set to `true`.

## Usage

### Processing a Document with Docling

To process a document with Docling, you can use the following API endpoint:

```
POST /api/docling/process/:id
```

Where `:id` is the ID of the document to process.

### Processing a Document with Scan1 and Docling

To process a document with scan1 and Docling, you can use the following API endpoint:

```
POST /api/scan1/process/:id?useDocling=true
```

Where `:id` is the ID of the document to process.

### Checking Docling Status

To check if Docling is available, you can use the following API endpoint:

```
GET /api/docling/status
```

## Installation

The Docling integration is installed by running the `run-docling-integration.ps1` PowerShell script:

```powershell
.\run-docling-integration.ps1
```

This script performs the following steps:

1. Installs required Node.js packages.
2. Runs the Docling integration test.
3. Integrates Docling with scan1.
4. Prompts to restart the application to apply the changes.

## Requirements

- Python 3.8 or higher
- Node.js 18 or higher
- Docling Python package (installed automatically by the integration script)

## Troubleshooting

If you encounter issues with the Docling integration, check the following:

1. Make sure Python 3.8 or higher is installed and available in the PATH.
2. Check if the Docling Python package is installed by running `pip show docling`.
3. Check the application logs for any error messages related to Docling.
4. Verify that the scan1 controller has been enhanced with Docling by checking for the `enhanceScan1WithDocling` function call at the end of the file.

## References

- [Docling Documentation](https://docling-project.github.io/docling/)
- [Docling GitHub Repository](https://github.com/docling-project/docling)
