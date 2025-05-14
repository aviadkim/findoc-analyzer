# FinDoc Analyzer - API Reference

## Version 1.0 (July 3, 2025)

## Table of Contents

- [Introduction](#introduction)
- [Authentication](#authentication)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)
- [Endpoints](#endpoints)
  - [Authentication](#authentication-endpoints)
  - [Documents](#document-endpoints)
  - [Agents](#agent-endpoints)
  - [Analytics](#analytics-endpoints)
  - [User](#user-endpoints)

## Introduction

The FinDoc Analyzer API provides RESTful endpoints for interacting with the application. All requests and responses use JSON format. The base URL for all API endpoints is:

```
https://findoc-analyzer.example.com/api
```

For local development, use:

```
http://localhost:3000/api
```

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. To access protected endpoints, include the JWT token in the `Authorization` header of your request:

```
Authorization: Bearer <your_token>
```

### Obtaining a Token

To obtain a token, make a POST request to the `/api/auth/login` endpoint with your credentials.

## Error Handling

The API returns appropriate HTTP status codes for different scenarios:

- **200 OK**: Request successful
- **201 Created**: Resource created successfully
- **400 Bad Request**: Invalid request parameters
- **401 Unauthorized**: Authentication required
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Resource not found
- **500 Internal Server Error**: Server-side error

Error responses follow a standard format:

```json
{
  "error": true,
  "message": "A human-readable error message",
  "details": {
    "field1": "Error details for field1",
    "field2": "Error details for field2"
  }
}
```

## Rate Limiting

The API implements rate limiting to prevent abuse. Current limits are:

- 100 requests per minute for authenticated users
- 20 requests per minute for unauthenticated users

Rate limit information is included in the response headers:

- `X-RateLimit-Limit`: Maximum number of requests per minute
- `X-RateLimit-Remaining`: Number of requests remaining in the current window
- `X-RateLimit-Reset`: Time (in seconds) until the rate limit resets

When a rate limit is exceeded, the API returns a 429 Too Many Requests status code.

## Endpoints

### Authentication Endpoints

#### Register a new user

```
POST /api/auth/register
```

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "name": "John Doe"
}
```

**Response (201 Created):**

```json
{
  "message": "User registered successfully",
  "userId": "123456789"
}
```

#### Login

```
POST /api/auth/login
```

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Response (200 OK):**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "123456789",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

#### Refresh Token

```
POST /api/auth/refresh
```

**Request Body:**

```json
{
  "refreshToken": "refresh_token_value"
}
```

**Response (200 OK):**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "new_refresh_token_value"
}
```

#### Logout

```
POST /api/auth/logout
```

**Request Headers:**

```
Authorization: Bearer <your_token>
```

**Response (200 OK):**

```json
{
  "message": "Logged out successfully"
}
```

### Document Endpoints

#### List Documents

```
GET /api/documents
```

**Query Parameters:**

- `page` (optional): Page number for pagination (default: 1)
- `limit` (optional): Number of items per page (default: 10)
- `sort` (optional): Field to sort by (default: 'createdAt')
- `order` (optional): Sort order ('asc' or 'desc', default: 'desc')
- `filter` (optional): Filter criteria (e.g., 'status=processed')

**Response (200 OK):**

```json
{
  "documents": [
    {
      "id": "doc-123456",
      "name": "Portfolio_Statement_Q2_2025.pdf",
      "type": "application/pdf",
      "size": 1245678,
      "status": "processed",
      "createdAt": "2025-06-15T10:30:00Z",
      "updatedAt": "2025-06-15T10:35:00Z"
    },
    {
      "id": "doc-789012",
      "name": "Investment_Report_2025.pdf",
      "type": "application/pdf",
      "size": 2345678,
      "status": "pending",
      "createdAt": "2025-06-14T15:45:00Z",
      "updatedAt": "2025-06-14T15:45:00Z"
    }
  ],
  "pagination": {
    "total": 42,
    "page": 1,
    "limit": 10,
    "pages": 5
  }
}
```

#### Get Document Details

```
GET /api/documents/:documentId
```

**Response (200 OK):**

```json
{
  "id": "doc-123456",
  "name": "Portfolio_Statement_Q2_2025.pdf",
  "type": "application/pdf",
  "size": 1245678,
  "status": "processed",
  "metadata": {
    "author": "ABC Financial",
    "creationDate": "2025-06-01T00:00:00Z",
    "pageCount": 5
  },
  "extractedData": {
    "securities": [
      {
        "name": "Apple Inc.",
        "isin": "US0378331005",
        "quantity": 50,
        "price": 205.45,
        "value": 10272.5,
        "weight": 12.5
      },
      {
        "name": "Microsoft Corp",
        "isin": "US5949181045",
        "quantity": 75,
        "price": 410.2,
        "value": 30765,
        "weight": 37.4
      }
    ],
    "totalValue": 82309.25
  },
  "createdAt": "2025-06-15T10:30:00Z",
  "updatedAt": "2025-06-15T10:35:00Z"
}
```

#### Upload Document

```
POST /api/documents/upload
```

**Request Headers:**

```
Content-Type: multipart/form-data
```

**Request Body:**

Form data with the following fields:
- `file`: The document file
- `metadata` (optional): JSON string with additional metadata

**Response (201 Created):**

```json
{
  "id": "doc-123456",
  "name": "Portfolio_Statement_Q2_2025.pdf",
  "type": "application/pdf",
  "size": 1245678,
  "status": "uploaded",
  "createdAt": "2025-06-15T10:30:00Z",
  "updatedAt": "2025-06-15T10:30:00Z"
}
```

#### Process Document

```
POST /api/documents/:documentId/process
```

**Request Body:**

```json
{
  "agentPipeline": [
    "ISINExtractorAgent",
    "FinancialTableDetectorAgent",
    "FinancialDataAnalyzerAgent"
  ],
  "options": {
    "validateISIN": true,
    "extractCurrency": true
  }
}
```

**Response (202 Accepted):**

```json
{
  "jobId": "job-123456",
  "status": "processing",
  "documentId": "doc-123456",
  "message": "Document processing started"
}
```

#### Get Processing Status

```
GET /api/documents/process/status/:jobId
```

**Response (200 OK):**

```json
{
  "jobId": "job-123456",
  "status": "completed",
  "documentId": "doc-123456",
  "progress": 100,
  "result": {
    "securities": 7,
    "tables": 2,
    "totalValue": 82309.25
  },
  "completedAt": "2025-06-15T10:35:00Z"
}
```

#### Delete Document

```
DELETE /api/documents/:documentId
```

**Response (200 OK):**

```json
{
  "message": "Document deleted successfully",
  "documentId": "doc-123456"
}
```

### Agent Endpoints

#### List Available Agents

```
GET /api/agents
```

**Response (200 OK):**

```json
{
  "agents": [
    {
      "id": "ISINExtractorAgent",
      "name": "ISIN Extractor Agent",
      "description": "Extracts ISIN codes from financial documents",
      "version": "1.0.0",
      "parameters": [
        {
          "name": "validateISIN",
          "type": "boolean",
          "default": true,
          "description": "Validate ISIN codes"
        },
        {
          "name": "extractCurrency",
          "type": "boolean",
          "default": true,
          "description": "Extract currency information"
        }
      ]
    },
    {
      "id": "FinancialTableDetectorAgent",
      "name": "Financial Table Detector Agent",
      "description": "Detects tables in financial documents",
      "version": "1.0.0",
      "parameters": [
        {
          "name": "minConfidence",
          "type": "number",
          "default": 0.8,
          "description": "Minimum confidence score"
        }
      ]
    }
  ]
}
```

#### Get Agent Details

```
GET /api/agents/:agentId
```

**Response (200 OK):**

```json
{
  "id": "ISINExtractorAgent",
  "name": "ISIN Extractor Agent",
  "description": "Extracts ISIN codes from financial documents",
  "version": "1.0.0",
  "parameters": [
    {
      "name": "validateISIN",
      "type": "boolean",
      "default": true,
      "description": "Validate ISIN codes"
    },
    {
      "name": "extractCurrency",
      "type": "boolean",
      "default": true,
      "description": "Extract currency information"
    }
  ],
  "inputFormat": {
    "type": "object",
    "properties": {
      "content": {
        "type": "string",
        "description": "Document content"
      }
    }
  },
  "outputFormat": {
    "type": "object",
    "properties": {
      "isins": {
        "type": "array",
        "items": {
          "type": "object",
          "properties": {
            "isin": {
              "type": "string",
              "description": "ISIN code"
            },
            "security_name": {
              "type": "string",
              "description": "Security name"
            },
            "position": {
              "type": "object",
              "description": "Position in document"
            }
          }
        }
      }
    }
  }
}
```

#### Execute Agent

```
POST /api/agents/:agentId/execute
```

**Request Body:**

```json
{
  "data": {
    "content": "Document content here..."
  },
  "parameters": {
    "validateISIN": true,
    "extractCurrency": true
  }
}
```

**Response (200 OK):**

```json
{
  "status": "success",
  "result": {
    "isins": [
      {
        "isin": "US0378331005",
        "security_name": "Apple Inc.",
        "position": {
          "page": 1,
          "top": 150,
          "left": 200,
          "bottom": 170,
          "right": 300
        }
      },
      {
        "isin": "US5949181045",
        "security_name": "Microsoft Corp",
        "position": {
          "page": 1,
          "top": 180,
          "left": 200,
          "bottom": 200,
          "right": 300
        }
      }
    ]
  },
  "executionTime": 0.75
}
```

#### List Agent Pipelines

```
GET /api/agents/pipelines
```

**Response (200 OK):**

```json
{
  "pipelines": [
    {
      "id": "pipeline-123456",
      "name": "Standard Document Processing",
      "description": "Standard pipeline for financial document processing",
      "agents": [
        {
          "id": "ISINExtractorAgent",
          "parameters": {
            "validateISIN": true,
            "extractCurrency": true
          }
        },
        {
          "id": "FinancialTableDetectorAgent",
          "parameters": {
            "minConfidence": 0.8
          }
        },
        {
          "id": "FinancialDataAnalyzerAgent",
          "parameters": {
            "includeRatios": true
          }
        }
      ],
      "createdAt": "2025-06-01T10:00:00Z",
      "updatedAt": "2025-06-01T10:00:00Z"
    }
  ]
}
```

#### Create Agent Pipeline

```
POST /api/agents/pipelines
```

**Request Body:**

```json
{
  "name": "Custom Document Processing",
  "description": "Custom pipeline for specialized document processing",
  "agents": [
    {
      "id": "ISINExtractorAgent",
      "parameters": {
        "validateISIN": true,
        "extractCurrency": false
      }
    },
    {
      "id": "FinancialAdvisorAgent",
      "parameters": {
        "riskProfile": "moderate"
      }
    }
  ]
}
```

**Response (201 Created):**

```json
{
  "id": "pipeline-789012",
  "name": "Custom Document Processing",
  "description": "Custom pipeline for specialized document processing",
  "agents": [
    {
      "id": "ISINExtractorAgent",
      "parameters": {
        "validateISIN": true,
        "extractCurrency": false
      }
    },
    {
      "id": "FinancialAdvisorAgent",
      "parameters": {
        "riskProfile": "moderate"
      }
    }
  ],
  "createdAt": "2025-06-15T11:30:00Z",
  "updatedAt": "2025-06-15T11:30:00Z"
}
```

### Analytics Endpoints

#### Get Portfolio Summary

```
GET /api/analytics/portfolio
```

**Query Parameters:**

- `documentId` (optional): Filter by document ID
- `timeframe` (optional): Timeframe for analysis (e.g., '1m', '3m', '1y')

**Response (200 OK):**

```json
{
  "totalValue": 82309.25,
  "securities": 7,
  "allocation": {
    "equity": 79.6,
    "bonds": 0,
    "etf": 6.5,
    "cash": 13.9
  },
  "topHoldings": [
    {
      "name": "Microsoft Corp",
      "isin": "US5949181045",
      "value": 30765,
      "weight": 37.4
    },
    {
      "name": "JP Morgan Chase & Co.",
      "isin": "US46625H1005",
      "value": 15240,
      "weight": 18.5
    },
    {
      "name": "Tesla Inc.",
      "isin": "US88160R1014",
      "value": 12632,
      "weight": 15.3
    }
  ],
  "sectorAllocation": [
    {
      "sector": "Technology",
      "weight": 59.7
    },
    {
      "sector": "Financials",
      "weight": 18.5
    },
    {
      "sector": "Consumer Discretionary",
      "weight": 4.3
    },
    {
      "sector": "Communication Services",
      "weight": 5.5
    },
    {
      "sector": "Index Funds",
      "weight": 6.5
    },
    {
      "sector": "Cash",
      "weight": 5.5
    }
  ],
  "currencyExposure": [
    {
      "currency": "USD",
      "weight": 100
    }
  ],
  "timestamp": "2025-06-15T12:00:00Z"
}
```

#### Get Performance Analysis

```
GET /api/analytics/performance
```

**Query Parameters:**

- `documentId` (optional): Filter by document ID
- `timeframe` (optional): Timeframe for analysis (e.g., '1m', '3m', '1y')
- `benchmark` (optional): Benchmark for comparison (e.g., 'SP500', 'NASDAQ')

**Response (200 OK):**

```json
{
  "returns": {
    "1m": 2.5,
    "3m": 7.8,
    "6m": 12.4,
    "1y": 18.6,
    "ytd": 9.7
  },
  "benchmarkReturns": {
    "name": "S&P 500",
    "1m": 1.8,
    "3m": 5.2,
    "6m": 9.1,
    "1y": 14.3,
    "ytd": 7.5
  },
  "performanceChart": {
    "timestamps": [
      "2024-06-15T00:00:00Z",
      "2024-07-15T00:00:00Z",
      "2024-08-15T00:00:00Z",
      // ... more timestamps
      "2025-06-15T00:00:00Z"
    ],
    "portfolio": [
      100,
      102.3,
      105.1,
      // ... more values
      118.6
    ],
    "benchmark": [
      100,
      101.2,
      102.8,
      // ... more values
      114.3
    ]
  },
  "riskMetrics": {
    "volatility": 12.4,
    "sharpeRatio": 1.2,
    "maxDrawdown": -8.5,
    "beta": 0.95,
    "alpha": 2.3
  },
  "timestamp": "2025-06-15T12:00:00Z"
}
```

#### Get Document Analytics

```
GET /api/analytics/documents
```

**Response (200 OK):**

```json
{
  "total": 42,
  "processed": 38,
  "pending": 3,
  "failed": 1,
  "byType": [
    {
      "type": "pdf",
      "count": 36
    },
    {
      "type": "excel",
      "count": 4
    },
    {
      "type": "csv",
      "count": 2
    }
  ],
  "processingTimes": {
    "average": 12.5,
    "median": 10.2,
    "min": 3.1,
    "max": 45.7
  },
  "uploadTrend": {
    "timestamps": [
      "2025-05-01T00:00:00Z",
      "2025-05-08T00:00:00Z",
      "2025-05-15T00:00:00Z",
      "2025-05-22T00:00:00Z",
      "2025-05-29T00:00:00Z",
      "2025-06-05T00:00:00Z",
      "2025-06-12T00:00:00Z"
    ],
    "counts": [4, 6, 5, 8, 7, 6, 6]
  },
  "timestamp": "2025-06-15T12:00:00Z"
}
```

#### Get Financial Advisor Recommendations

```
GET /api/analytics/recommendations
```

**Query Parameters:**

- `documentId` (required): Document ID for recommendation
- `riskProfile` (optional): User risk profile (e.g., 'conservative', 'moderate', 'aggressive')

**Response (200 OK):**

```json
{
  "summary": {
    "status": "moderate",
    "score": 72,
    "message": "Your portfolio has a balanced risk profile with good diversification. There are some opportunities for improvement."
  },
  "recommendations": [
    {
      "type": "diversification",
      "priority": "high",
      "issue": "Technology sector overweight",
      "recommendation": "Consider reducing technology exposure by 15-20% and reallocating to other sectors.",
      "reasoning": "Your portfolio has 59.7% allocation to technology, which is significantly higher than the benchmark of 28.9%."
    },
    {
      "type": "asset_allocation",
      "priority": "medium",
      "issue": "No fixed income exposure",
      "recommendation": "Consider adding 10-15% allocation to investment-grade bonds.",
      "reasoning": "Adding fixed income can provide stability and reduce overall portfolio volatility."
    },
    {
      "type": "costs",
      "priority": "low",
      "issue": "High expense ratios",
      "recommendation": "Consider lower-cost alternatives for some holdings.",
      "reasoning": "The average expense ratio of your funds is 0.65%, which could be reduced with similar ETFs."
    }
  ],
  "suggested_actions": [
    {
      "action": "Reduce Microsoft position by 10%",
      "impact": "Lower technology exposure, improve diversification"
    },
    {
      "action": "Add bond ETF (15% allocation)",
      "impact": "Improve asset allocation, reduce volatility"
    },
    {
      "action": "Replace higher-cost ETF with lower-cost alternative",
      "impact": "Reduce expenses by approximately 0.2% annually"
    }
  ],
  "timestamp": "2025-06-15T12:00:00Z"
}
```

### User Endpoints

#### Get User Profile

```
GET /api/user/profile
```

**Response (200 OK):**

```json
{
  "id": "123456789",
  "email": "user@example.com",
  "name": "John Doe",
  "settings": {
    "theme": "light",
    "notifications": {
      "email": true,
      "browser": true
    },
    "defaultRiskProfile": "moderate"
  },
  "createdAt": "2025-01-15T00:00:00Z"
}
```

#### Update User Profile

```
PUT /api/user/profile
```

**Request Body:**

```json
{
  "name": "John Smith",
  "settings": {
    "theme": "dark",
    "notifications": {
      "email": true,
      "browser": false
    },
    "defaultRiskProfile": "aggressive"
  }
}
```

**Response (200 OK):**

```json
{
  "id": "123456789",
  "email": "user@example.com",
  "name": "John Smith",
  "settings": {
    "theme": "dark",
    "notifications": {
      "email": true,
      "browser": false
    },
    "defaultRiskProfile": "aggressive"
  },
  "updatedAt": "2025-06-15T14:30:00Z"
}
```

#### Change Password

```
PUT /api/user/password
```

**Request Body:**

```json
{
  "currentPassword": "OldSecurePassword123!",
  "newPassword": "NewSecurePassword456!"
}
```

**Response (200 OK):**

```json
{
  "message": "Password updated successfully",
  "updatedAt": "2025-06-15T14:35:00Z"
}
```

#### Get User Preferences

```
GET /api/user/preferences
```

**Response (200 OK):**

```json
{
  "theme": "dark",
  "language": "en",
  "timezone": "America/New_York",
  "dateFormat": "MM/DD/YYYY",
  "accessibility": {
    "highContrast": false,
    "largeText": false,
    "reducedMotion": true
  },
  "display": {
    "defaultSort": "date",
    "documentsPerPage": 20,
    "showThumbnails": true
  },
  "dashboard": {
    "layout": "standard",
    "widgets": [
      {
        "id": "portfolio-summary",
        "position": {
          "x": 0,
          "y": 0,
          "w": 6,
          "h": 2
        },
        "visible": true
      },
      {
        "id": "allocation-chart",
        "position": {
          "x": 6,
          "y": 0,
          "w": 6,
          "h": 2
        },
        "visible": true
      }
    ]
  },
  "shortcuts": {
    "upload": "alt+u",
    "search": "alt+s",
    "process": "alt+p"
  }
}
```

#### Update User Preferences

```
PUT /api/user/preferences
```

**Request Body:**

```json
{
  "theme": "light",
  "accessibility": {
    "highContrast": true
  },
  "display": {
    "documentsPerPage": 50
  }
}
```

**Response (200 OK):**

```json
{
  "message": "Preferences updated successfully",
  "updatedAt": "2025-06-15T14:40:00Z"
}
```
