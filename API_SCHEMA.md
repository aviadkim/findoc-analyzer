# FinDoc Analyzer API Schema

## Overview

This document outlines the API endpoints for the FinDoc Analyzer system. The API follows RESTful principles and uses JSON for request and response bodies.

## Base URL

```
https://api.findocanalyzer.com/v1
```

## Authentication

All API requests require authentication using a JWT token. The token should be included in the `Authorization` header:

```
Authorization: Bearer <token>
```

## Endpoints

### Authentication

#### Login

```
POST /auth/login
```

Request:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

Response:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "user@example.com",
    "name": "John Doe",
    "tenantId": "123e4567-e89b-12d3-a456-426614174001"
  }
}
```

#### Google Login

```
POST /auth/google
```

Request:
```json
{
  "idToken": "google-id-token"
}
```

Response:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "user@example.com",
    "name": "John Doe",
    "tenantId": "123e4567-e89b-12d3-a456-426614174001"
  }
}
```

#### Logout

```
POST /auth/logout
```

Response:
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

### Documents

#### List Documents

```
GET /documents
```

Query Parameters:
- `page` (optional): Page number (default: 1)
- `limit` (optional): Number of documents per page (default: 10)
- `type` (optional): Filter by document type
- `processed` (optional): Filter by processing status (true/false)

Response:
```json
{
  "documents": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "fileName": "Financial Report 2023.pdf",
      "fileType": "pdf",
      "fileSize": 1024000,
      "uploadDate": "2023-12-31T12:00:00Z",
      "documentType": "financial",
      "processed": true,
      "thumbnail": "https://storage.findocanalyzer.com/thumbnails/123e4567-e89b-12d3-a456-426614174000.jpg"
    },
    {
      "id": "123e4567-e89b-12d3-a456-426614174001",
      "fileName": "Investment Portfolio.pdf",
      "fileType": "pdf",
      "fileSize": 512000,
      "uploadDate": "2023-12-15T10:30:00Z",
      "documentType": "portfolio",
      "processed": true,
      "thumbnail": "https://storage.findocanalyzer.com/thumbnails/123e4567-e89b-12d3-a456-426614174001.jpg"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 2,
    "pages": 1
  }
}
```

#### Get Document

```
GET /documents/{id}
```

Response:
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "fileName": "Financial Report 2023.pdf",
  "fileType": "pdf",
  "fileSize": 1024000,
  "uploadDate": "2023-12-31T12:00:00Z",
  "documentType": "financial",
  "processed": true,
  "userId": "123e4567-e89b-12d3-a456-426614174002",
  "tenantId": "123e4567-e89b-12d3-a456-426614174001",
  "storagePath": "documents/123e4567-e89b-12d3-a456-426614174000.pdf",
  "thumbnail": "https://storage.findocanalyzer.com/thumbnails/123e4567-e89b-12d3-a456-426614174000.jpg",
  "content": {
    "pageCount": 15,
    "metadata": {
      "title": "Financial Report 2023",
      "author": "ABC Corporation",
      "creationDate": "2023-12-31T12:00:00Z"
    }
  }
}
```

#### Create Document

```
POST /documents
```

Request:
```json
{
  "fileName": "Financial Report 2023.pdf",
  "fileSize": 1024000,
  "documentType": "financial"
}
```

Response:
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "fileName": "Financial Report 2023.pdf",
  "fileType": "pdf",
  "fileSize": 1024000,
  "uploadDate": "2023-12-31T12:00:00Z",
  "documentType": "financial",
  "processed": false,
  "userId": "123e4567-e89b-12d3-a456-426614174002",
  "tenantId": "123e4567-e89b-12d3-a456-426614174001",
  "uploadUrl": "https://storage.findocanalyzer.com/upload/123e4567-e89b-12d3-a456-426614174000"
}
```

#### Upload Document File

```
PUT /documents/{id}/upload
```

Request:
- Content-Type: multipart/form-data
- Body: File data

Response:
```json
{
  "success": true,
  "message": "File uploaded successfully",
  "document": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "fileName": "Financial Report 2023.pdf",
    "fileType": "pdf",
    "fileSize": 1024000,
    "uploadDate": "2023-12-31T12:00:00Z",
    "documentType": "financial",
    "processed": false
  }
}
```

#### Delete Document

```
DELETE /documents/{id}
```

Response:
```json
{
  "success": true,
  "message": "Document deleted successfully"
}
```

#### Get Document Processing Status

```
GET /documents/{id}/status
```

Response:
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "status": "completed",
  "progress": 100,
  "startTime": "2023-12-31T12:00:00Z",
  "endTime": "2023-12-31T12:05:00Z",
  "processingTime": "5 minutes",
  "agents": {
    "Document Analyzer": {
      "status": "completed",
      "time": "1.2 seconds"
    },
    "Table Understanding": {
      "status": "completed",
      "time": "2.1 seconds"
    },
    "Securities Extractor": {
      "status": "completed",
      "time": "1.5 seconds"
    },
    "Financial Reasoner": {
      "status": "completed",
      "time": "0.2 seconds"
    }
  }
}
```

#### Get Document Content

```
GET /documents/{id}/content
```

Response:
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "extractedText": "Financial Report 2023 for ABC Corporation...",
  "metadata": {
    "title": "Financial Report 2023",
    "author": "ABC Corporation",
    "creationDate": "2023-12-31T12:00:00Z"
  },
  "pageCount": 15
}
```

#### Get Document Tables

```
GET /documents/{id}/tables
```

Response:
```json
{
  "tables": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174003",
      "tableName": "Income Statement",
      "headers": ["Item", "2023", "2022", "Change"],
      "rows": [
        ["Revenue", "$10,500,000", "$9,300,000", "+12.9%"],
        ["Cost of Goods Sold", "$6,300,000", "$5,700,000", "+10.5%"],
        ["Gross Profit", "$4,200,000", "$3,600,000", "+16.7%"],
        ["Operating Expenses", "$900,000", "$800,000", "+12.5%"],
        ["Net Profit", "$3,300,000", "$2,800,000", "+17.9%"]
      ],
      "pageNumber": 5
    },
    {
      "id": "123e4567-e89b-12d3-a456-426614174004",
      "tableName": "Balance Sheet",
      "headers": ["Item", "2023", "2022", "Change"],
      "rows": [
        ["Total Assets", "$25,000,000", "$22,000,000", "+13.6%"],
        ["Total Liabilities", "$12,000,000", "$11,000,000", "+9.1%"],
        ["Shareholders' Equity", "$13,000,000", "$11,000,000", "+18.2%"]
      ],
      "pageNumber": 8
    }
  ]
}
```

#### Get Document Securities

```
GET /documents/{id}/securities
```

Response:
```json
{
  "securities": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174005",
      "isin": "US0378331005",
      "name": "Apple Inc.",
      "quantity": 100,
      "price": 180.00,
      "value": 18000.00,
      "currency": "USD",
      "percentOfAssets": 1.6
    },
    {
      "id": "123e4567-e89b-12d3-a456-426614174006",
      "isin": "US5949181045",
      "name": "Microsoft Corp.",
      "quantity": 150,
      "price": 340.00,
      "value": 51000.00,
      "currency": "USD",
      "percentOfAssets": 4.5
    }
  ]
}
```

### Chat

#### Get Chat History

```
GET /documents/{id}/chat
```

Response:
```json
{
  "chat": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174007",
      "message": "What is the total revenue?",
      "response": "The total revenue is $10,500,000.",
      "timestamp": "2023-12-31T14:00:00Z"
    },
    {
      "id": "123e4567-e89b-12d3-a456-426614174008",
      "message": "What is the net profit?",
      "response": "The net profit is $3,300,000 with a profit margin of 31.4%.",
      "timestamp": "2023-12-31T14:01:00Z"
    }
  ]
}
```

#### Send Chat Message

```
POST /chat
```

Request:
```json
{
  "documentId": "123e4567-e89b-12d3-a456-426614174000",
  "message": "What is the total revenue?"
}
```

Response:
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174007",
  "documentId": "123e4567-e89b-12d3-a456-426614174000",
  "message": "What is the total revenue?",
  "response": "The total revenue is $10,500,000.",
  "timestamp": "2023-12-31T14:00:00Z"
}
```

### Reports

#### Generate Report

```
POST /reports
```

Request:
```json
{
  "documentId": "123e4567-e89b-12d3-a456-426614174000",
  "reportType": "securities",
  "format": "pdf"
}
```

Response:
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174009",
  "documentId": "123e4567-e89b-12d3-a456-426614174000",
  "reportType": "securities",
  "generatedAt": "2023-12-31T15:00:00Z",
  "downloadUrl": "https://storage.findocanalyzer.com/reports/123e4567-e89b-12d3-a456-426614174009.pdf"
}
```

#### Get Report

```
GET /reports/{id}
```

Response:
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174009",
  "documentId": "123e4567-e89b-12d3-a456-426614174000",
  "reportType": "securities",
  "reportContent": {
    "title": "Securities Report",
    "document": "Financial Report 2023.pdf",
    "generatedAt": "2023-12-31T15:00:00Z",
    "securities": [
      {
        "isin": "US0378331005",
        "name": "Apple Inc.",
        "quantity": 100,
        "price": 180.00,
        "value": 18000.00,
        "currency": "USD",
        "percentOfAssets": 1.6
      },
      {
        "isin": "US5949181045",
        "name": "Microsoft Corp.",
        "quantity": 150,
        "price": 340.00,
        "value": 51000.00,
        "currency": "USD",
        "percentOfAssets": 4.5
      }
    ]
  },
  "generatedAt": "2023-12-31T15:00:00Z",
  "downloadUrl": "https://storage.findocanalyzer.com/reports/123e4567-e89b-12d3-a456-426614174009.pdf"
}
```

#### List Reports

```
GET /reports
```

Query Parameters:
- `page` (optional): Page number (default: 1)
- `limit` (optional): Number of reports per page (default: 10)
- `documentId` (optional): Filter by document ID
- `reportType` (optional): Filter by report type

Response:
```json
{
  "reports": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174009",
      "documentId": "123e4567-e89b-12d3-a456-426614174000",
      "reportType": "securities",
      "generatedAt": "2023-12-31T15:00:00Z",
      "downloadUrl": "https://storage.findocanalyzer.com/reports/123e4567-e89b-12d3-a456-426614174009.pdf"
    },
    {
      "id": "123e4567-e89b-12d3-a456-426614174010",
      "documentId": "123e4567-e89b-12d3-a456-426614174000",
      "reportType": "summary",
      "generatedAt": "2023-12-31T16:00:00Z",
      "downloadUrl": "https://storage.findocanalyzer.com/reports/123e4567-e89b-12d3-a456-426614174010.pdf"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 2,
    "pages": 1
  }
}
```

### Export

#### Export Document

```
POST /export
```

Request:
```json
{
  "documentId": "123e4567-e89b-12d3-a456-426614174000",
  "exportType": "csv",
  "content": ["tables", "securities"]
}
```

Response:
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174011",
  "documentId": "123e4567-e89b-12d3-a456-426614174000",
  "exportType": "csv",
  "exportDate": "2023-12-31T17:00:00Z",
  "downloadUrl": "https://storage.findocanalyzer.com/exports/123e4567-e89b-12d3-a456-426614174011.zip"
}
```

#### List Exports

```
GET /exports
```

Query Parameters:
- `page` (optional): Page number (default: 1)
- `limit` (optional): Number of exports per page (default: 10)
- `documentId` (optional): Filter by document ID
- `exportType` (optional): Filter by export type

Response:
```json
{
  "exports": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174011",
      "documentId": "123e4567-e89b-12d3-a456-426614174000",
      "exportType": "csv",
      "exportDate": "2023-12-31T17:00:00Z",
      "downloadUrl": "https://storage.findocanalyzer.com/exports/123e4567-e89b-12d3-a456-426614174011.zip"
    },
    {
      "id": "123e4567-e89b-12d3-a456-426614174012",
      "documentId": "123e4567-e89b-12d3-a456-426614174000",
      "exportType": "excel",
      "exportDate": "2023-12-31T18:00:00Z",
      "downloadUrl": "https://storage.findocanalyzer.com/exports/123e4567-e89b-12d3-a456-426614174012.xlsx"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 2,
    "pages": 1
  }
}
```

### Users

#### Get Current User

```
GET /users/me
```

Response:
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174002",
  "email": "user@example.com",
  "name": "John Doe",
  "tenantId": "123e4567-e89b-12d3-a456-426614174001",
  "createdAt": "2023-01-01T00:00:00Z",
  "lastLogin": "2023-12-31T12:00:00Z",
  "isAdmin": false
}
```

#### Update Current User

```
PATCH /users/me
```

Request:
```json
{
  "name": "John Smith"
}
```

Response:
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174002",
  "email": "user@example.com",
  "name": "John Smith",
  "tenantId": "123e4567-e89b-12d3-a456-426614174001",
  "createdAt": "2023-01-01T00:00:00Z",
  "lastLogin": "2023-12-31T12:00:00Z",
  "isAdmin": false
}
```

### Tenants (Admin Only)

#### List Tenants

```
GET /tenants
```

Response:
```json
{
  "tenants": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174001",
      "name": "ABC Corporation",
      "createdAt": "2023-01-01T00:00:00Z",
      "userCount": 10,
      "documentCount": 50,
      "storageUsed": 1024000000
    },
    {
      "id": "123e4567-e89b-12d3-a456-426614174013",
      "name": "XYZ Inc.",
      "createdAt": "2023-02-01T00:00:00Z",
      "userCount": 5,
      "documentCount": 25,
      "storageUsed": 512000000
    }
  ]
}
```

#### Get Tenant

```
GET /tenants/{id}
```

Response:
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174001",
  "name": "ABC Corporation",
  "createdAt": "2023-01-01T00:00:00Z",
  "settings": {
    "maxUsers": 20,
    "maxStorage": 10737418240,
    "allowedFileTypes": ["pdf", "xlsx", "csv"]
  },
  "userCount": 10,
  "documentCount": 50,
  "storageUsed": 1024000000
}
```

#### Create Tenant

```
POST /tenants
```

Request:
```json
{
  "name": "New Tenant",
  "settings": {
    "maxUsers": 10,
    "maxStorage": 5368709120,
    "allowedFileTypes": ["pdf", "xlsx", "csv"]
  }
}
```

Response:
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174014",
  "name": "New Tenant",
  "createdAt": "2023-12-31T19:00:00Z",
  "settings": {
    "maxUsers": 10,
    "maxStorage": 5368709120,
    "allowedFileTypes": ["pdf", "xlsx", "csv"]
  },
  "userCount": 0,
  "documentCount": 0,
  "storageUsed": 0
}
```

#### Update Tenant

```
PATCH /tenants/{id}
```

Request:
```json
{
  "name": "Updated Tenant Name",
  "settings": {
    "maxUsers": 15
  }
}
```

Response:
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174014",
  "name": "Updated Tenant Name",
  "createdAt": "2023-12-31T19:00:00Z",
  "settings": {
    "maxUsers": 15,
    "maxStorage": 5368709120,
    "allowedFileTypes": ["pdf", "xlsx", "csv"]
  },
  "userCount": 0,
  "documentCount": 0,
  "storageUsed": 0
}
```

### API Keys (Admin Only)

#### List API Keys

```
GET /api-keys
```

Response:
```json
{
  "apiKeys": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174015",
      "keyName": "OpenRouter API Key",
      "service": "openrouter",
      "createdAt": "2023-12-01T00:00:00Z",
      "expiresAt": "2024-12-01T00:00:00Z",
      "isActive": true
    },
    {
      "id": "123e4567-e89b-12d3-a456-426614174016",
      "keyName": "DeepSeek API Key",
      "service": "deepseek",
      "createdAt": "2023-12-01T00:00:00Z",
      "expiresAt": "2024-12-01T00:00:00Z",
      "isActive": true
    }
  ]
}
```

#### Create API Key

```
POST /api-keys
```

Request:
```json
{
  "keyName": "New API Key",
  "keyValue": "sk-1234567890abcdef",
  "service": "openai",
  "expiresAt": "2024-12-31T00:00:00Z"
}
```

Response:
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174017",
  "keyName": "New API Key",
  "service": "openai",
  "createdAt": "2023-12-31T20:00:00Z",
  "expiresAt": "2024-12-31T00:00:00Z",
  "isActive": true
}
```

#### Update API Key

```
PATCH /api-keys/{id}
```

Request:
```json
{
  "keyName": "Updated API Key Name",
  "isActive": false
}
```

Response:
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174017",
  "keyName": "Updated API Key Name",
  "service": "openai",
  "createdAt": "2023-12-31T20:00:00Z",
  "expiresAt": "2024-12-31T00:00:00Z",
  "isActive": false
}
```

#### Delete API Key

```
DELETE /api-keys/{id}
```

Response:
```json
{
  "success": true,
  "message": "API key deleted successfully"
}
```

## Error Responses

### 400 Bad Request

```json
{
  "error": "Bad Request",
  "message": "Invalid request parameters",
  "details": {
    "field": "email",
    "issue": "Email is required"
  }
}
```

### 401 Unauthorized

```json
{
  "error": "Unauthorized",
  "message": "Invalid or expired token"
}
```

### 403 Forbidden

```json
{
  "error": "Forbidden",
  "message": "You do not have permission to access this resource"
}
```

### 404 Not Found

```json
{
  "error": "Not Found",
  "message": "Resource not found"
}
```

### 500 Internal Server Error

```json
{
  "error": "Internal Server Error",
  "message": "An unexpected error occurred"
}
```

## Rate Limiting

The API implements rate limiting to prevent abuse. The rate limits are as follows:

- 100 requests per minute per user
- 1000 requests per hour per user
- 10000 requests per day per user

Rate limit headers are included in all responses:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 1640995200
```

If the rate limit is exceeded, a 429 Too Many Requests response will be returned:

```json
{
  "error": "Too Many Requests",
  "message": "Rate limit exceeded",
  "retryAfter": 60
}
```
