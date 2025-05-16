# Enhanced Financial Document Processing

This module provides powerful document processing pipelines for financial documents using various techniques including OCR, table extraction, and AI-powered analysis.

## Components

### 1. RAG Multimodal Financial Document Processor

A comprehensive processor using Retrieval-Augmented Generation (RAG) and multimodal AI models.

### 2. Financial Document Processor

A lightweight processor focused on text extraction, table detection, and securities identification.

## Features

### RAG Multimodal Processor

- **Document OCR**: Extract text from financial documents with support for multiple languages
- **Table Detection**: Identify and extract tables from documents
- **Financial Data Extraction**: Extract securities, values, and other financial data
- **ISIN Extraction**: Identify and validate International Securities Identification Numbers (ISINs)
- **Asset Allocation Analysis**: Analyze portfolio composition and asset allocation
- **Visualization**: Generate visualizations of financial data
- **Accuracy Metrics**: Calculate accuracy metrics for extracted data

### Financial Document Processor

- **Text Extraction**: Extract text from PDFs with high accuracy using pdfminer.six
- **Table Extraction**: Extract tables from PDFs using camelot-py
- **Securities Extraction**: Identify and extract ISINs with surrounding context
- **Financial Metrics**: Calculate metrics to evaluate extraction quality
- **Multi-language Support**: Support for multiple languages
- **API Integration**: Exposed as a Flask API endpoint

## Usage

### Node.js API

```javascript
const RagMultimodalProcessor = require("./enhanced_processing/node_wrapper");

// Initialize processor
const processor = new RagMultimodalProcessor({
  apiKey: "your-api-key",
  languages: ["eng", "heb"],
  verbose: false,
});

// Set progress callback
processor.setProgressCallback((progress) => {
  console.log(`Processing progress: ${Math.round(progress * 100)}%`);
});

// Process document
processor
  .process("path/to/document.pdf", "path/to/output")
  .then((result) => {
    console.log("Processing complete!");
    console.log(
      `Total value: ${result.portfolio.total_value} ${result.portfolio.currency}`
    );
    console.log(`Securities: ${result.metrics.total_securities}`);
  })
  .catch((error) => {
    console.error("Processing failed:", error);
  });
```

### REST API

The processor is also available through a REST API:

#### Process Document

```
POST /api/enhanced/process
Content-Type: multipart/form-data

file: [PDF file]
languages: eng,heb
```

Response:

```json
{
  "task_id": "123e4567-e89b-12d3-a456-426614174000",
  "status": "processing",
  "progress": 0
}
```

#### Check Status

```
GET /api/enhanced/status/:taskId
```

Response:

```json
{
  "task_id": "123e4567-e89b-12d3-a456-426614174000",
  "status": "processing",
  "progress": 0.5
}
```

#### Get Result

```
GET /api/enhanced/result/:taskId
```

Response:

```json
{
  "document_info": {
    "document_id": "123e4567-e89b-12d3-a456-426614174000",
    "document_name": "portfolio_statement.pdf",
    "document_date": "2023-02-28",
    "processing_date": "2023-03-01T12:34:56Z",
    "processing_time": 45.2
  },
  "portfolio": {
    "total_value": 19510599,
    "currency": "USD",
    "securities": [
      {
        "isin": "US912810SP08",
        "name": "US Treasury Bond 3.375% 2048",
        "quantity": 2450000,
        "price": 1.0,
        "value": 2450000,
        "currency": "USD",
        "asset_class": "Bonds"
      }
      // ... more securities
    ],
    "asset_allocation": {
      "Bonds": {
        "value": 11562000,
        "weight": 0.5924
      },
      "Structured products": {
        "value": 7851000,
        "weight": 0.4024
      },
      "Other": {
        "value": 97599,
        "weight": 0.0052
      }
    }
  },
  "metrics": {
    "total_securities": 41,
    "total_asset_classes": 3
  },
  "accuracy": {
    "isin_accuracy": 1.0,
    "value_accuracy": 1.0,
    "quantity_accuracy": 0.98,
    "price_accuracy": 0.97,
    "overall_accuracy": 0.99
  }
}
```

#### Get Visualizations

```
GET /api/enhanced/visualizations/:taskId
```

Response:

```json
{
  "files": [
    "/output/123e4567-e89b-12d3-a456-426614174000/visualizations/asset_allocation.png",
    "/output/123e4567-e89b-12d3-a456-426614174000/visualizations/top_holdings.png"
  ]
}
```

## Requirements

- Python 3.8+
- Node.js 14+
- Tesseract OCR
- Poppler
- OpenAI API key or Google API key

## Configuration

The processor can be configured with the following options:

- `apiKey`: API key for AI services
- `languages`: Languages for OCR (default: ['eng', 'heb'])
- `verbose`: Enable verbose logging (default: false)

## Integration

### RAG Multimodal Processor

This processor is integrated with the FinDoc Analyzer application and can be accessed through the UI at `/rag-processor`.

### Financial Document Processor

This processor is integrated with the FinDoc Analyzer application and can be accessed through the UI at `/financial-document-processor`.

## Financial Document Processor API

The Financial Document Processor is also available through a REST API:

### Process Document

```
POST /api/financial/process-document
Content-Type: multipart/form-data

file: [PDF file]
options: {
  "languages": ["eng"],
  "extractTables": true,
  "extractSecurities": true,
  "extractMetrics": true,
  "includeText": true,
  "includeSecurities": true,
  "includeTables": true
}
```

Response:

```json
{
  "filename": "document.pdf",
  "file_path": "/uploads/processed_documents/document.pdf",
  "output_dir": "/uploads/processed_documents/document",
  "processing_time": 3.45,
  "text_length": 32937,
  "word_count": 5842,
  "page_count": 20,
  "security_count": 40,
  "table_count": 12,
  "metrics": {
    "word_count": 5842,
    "financial_terms": 156,
    "term_density": 0.0267,
    "securities_count": 40,
    "text_quality": 95.8,
    "securities_quality": 100.0,
    "overall_score": 97.06,
    "grade": "A"
  }
}
```

### Get Document Text

```
GET /api/financial/get-document-text/:filename
```

Response:

```json
{
  "filename": "document.pdf",
  "text": "..."
}
```

### Get Document Securities

```
GET /api/financial/get-document-securities/:filename
```

Response:

```json
{
  "filename": "document.pdf",
  "securities": [
    {
      "isin": "XS2530201644",
      "context": "...",
      "source": "text"
    },
    ...
  ]
}
```

### Get Document Metrics

```
GET /api/financial/get-document-metrics/:filename
```

Response:

```json
{
  "filename": "document.pdf",
  "metrics": {
    "word_count": 5842,
    "financial_terms": 156,
    "term_density": 0.0267,
    "securities_count": 40,
    "text_quality": 95.8,
    "securities_quality": 100.0,
    "overall_score": 97.06,
    "grade": "A"
  }
}
```
