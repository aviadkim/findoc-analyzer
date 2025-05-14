# FinDoc API Overview

## Introduction

The FinDoc Analyzer API provides programmatic access to all functionality available in the FinDoc application. It allows you to upload and process financial documents, extract securities data, analyze portfolios, and compare documents.

This API is designed for:
- Financial advisors and wealth managers who want to integrate document processing into their workflows
- Financial software providers who want to add document analysis capabilities to their applications
- Enterprise users who need to process large volumes of financial documents

## Base URL

All API endpoints are relative to one of the following base URLs, depending on the environment:

- **Production**: `https://api.findoc.example.com/v1`
- **Staging**: `https://api-staging.findoc.example.com/v1`
- **Development**: `http://localhost:3000/api`

## Authentication

The API uses JWT (JSON Web Token) authentication. To access protected endpoints, you need to:

1. Obtain an authentication token by calling the `/auth/login` endpoint with your credentials
2. Include the token in the `Authorization` header for all subsequent requests:

```
Authorization: Bearer your_token_here
```

Tokens expire after 24 hours, after which you must either:
- Obtain a new token using `/auth/login`
- Use the refresh token obtained during login to request a new token via `/auth/refresh`

## Rate Limiting

API requests are subject to rate limiting to ensure fair usage and system stability:

- **Free tier**: 100 requests per hour
- **Professional tier**: 1,000 requests per hour
- **Enterprise tier**: 10,000 requests per hour

When a rate limit is exceeded, the API returns a `429 Too Many Requests` response with a `Retry-After` header indicating when you can resume making requests.

## Core Concepts

### Documents

Documents are the core entity in the FinDoc API. A document typically represents a financial statement, portfolio report, or other financial document. 

The document lifecycle is:
1. **Upload** - Upload a document file (PDF, Excel, etc.)
2. **Process** - Extract data from the document
3. **Query/Analyze** - Retrieve data, ask questions, or analyze the document
4. **Export** - Export document data in various formats

### Securities

Securities represent financial instruments extracted from documents, such as stocks, bonds, ETFs, and mutual funds. Each security includes information like:
- Name and identifier (symbol, ISIN)
- Quantity, price, and value
- Asset class, sector, and market information

### Processing

Document processing involves:
1. **Text extraction** - Extracting text from the document
2. **Table detection** - Identifying and parsing tables
3. **Securities extraction** - Locating and extracting securities information
4. **Data enrichment** - Adding metadata and additional information

Processing can be customized with options like OCR, processing tier, and specific extraction types.

### Comparison

The API allows comparing multiple documents to:
- Identify added, removed, or changed securities
- Compare asset allocation and sector allocation
- Calculate performance differences
- Generate comparison charts and reports

## API Structure

The API is organized into the following sections:

### Authentication
- `/auth/login` - Login with credentials
- `/auth/register` - Register a new user
- `/auth/refresh` - Refresh authentication token

### Documents
- `/documents` - List documents
- `/documents/upload` - Upload document
- `/documents/{documentId}` - Get/delete document
- `/documents/process` - Process document
- `/documents/process/status` - Check processing status
- `/documents/{documentId}/securities` - Get securities
- `/documents/{documentId}/export` - Export document
- `/documents/{documentId}/query` - Query document
- `/documents/{documentId}/analyze` - Analyze document

### Processor
- `/processor/extract` - Extract data from document
- `/processor/detect-language` - Detect document language
- `/processor/extract-isins` - Extract ISINs from document

### Comparison
- `/comparison/compare` - Compare documents
- `/comparison/securities-diff` - Compare securities between documents
- `/comparison/chart-data` - Get comparison chart data
- `/comparison/export` - Export comparison report

### System
- `/system/health` - System health check

## Error Handling

API responses use standard HTTP status codes:
- `2xx` - Successful operation
- `4xx` - Client error (invalid request, unauthorized, etc.)
- `5xx` - Server error

Error responses include:
- `success: false` - Indicates an error
- `error` - Error message
- `code` - Error code
- `status` - HTTP status code

Example error response:
```json
{
  "success": false,
  "error": "Document not found",
  "code": "DOCUMENT_NOT_FOUND",
  "status": 404
}
```

## Pagination

List endpoints support pagination via the following query parameters:
- `page` - Page number (starting from 1)
- `limit` - Number of items per page (1-100)

Paginated responses include a `pagination` object with:
- `page` - Current page number
- `limit` - Number of items per page
- `totalItems` - Total number of items
- `totalPages` - Total number of pages

## Webhooks

For long-running operations, the API supports webhooks to notify your application when operations complete. Configure webhooks in your account settings to receive notifications for:
- Document processing completion
- Batch processing completion
- Export job completion

## SDKs and Libraries

We provide official client libraries for:
- JavaScript/TypeScript
- Python
- Java
- C#

Visit our [Developer Portal](https://findoc.example.com/developers) for SDK documentation and samples.

## Support

For API support:
- Email: api-support@findoc.example.com
- Documentation: https://docs.findoc.example.com/api
- Status page: https://status.findoc.example.com

## Changelog

### v1.0.0 (2023-01-15)
- Initial release of the FinDoc API