# Getting Started with the FinDoc API

This guide will help you start using the FinDoc API to process financial documents, extract securities data, and analyze portfolios.

## Prerequisites

To use the FinDoc API, you need:

1. A FinDoc account with API access
2. Your API credentials (username and password)
3. Basic knowledge of REST APIs and your programming language of choice

## Step 1: Obtain an Authentication Token

Before making API requests, you need to obtain an authentication token:

```bash
curl -X POST https://api.findoc.example.com/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "your_username",
    "password": "your_password"
  }'
```

Response:

```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user-123",
    "username": "your_username",
    "email": "your_email@example.com",
    "role": "user"
  }
}
```

Store this token securely and include it in the `Authorization` header for all subsequent requests:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Step 2: Upload a Document

To upload a financial document:

```bash
curl -X POST https://api.findoc.example.com/v1/documents/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@/path/to/your/document.pdf" \
  -F "description=Q1 2023 Portfolio Statement"
```

Response:

```json
{
  "success": true,
  "documentId": "doc-123",
  "fileName": "document.pdf"
}
```

Save the `documentId` for subsequent operations on this document.

## Step 3: Process the Document

After uploading, process the document to extract financial data:

```bash
curl -X POST https://api.findoc.example.com/v1/documents/process \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "documentId": "doc-123",
    "options": {
      "useOcr": true,
      "processingTier": "comprehensive"
    }
  }'
```

Response:

```json
{
  "success": true,
  "processingId": "proc-456",
  "documentId": "doc-123"
}
```

## Step 4: Check Processing Status

Document processing is asynchronous. Check the status with:

```bash
curl -X GET https://api.findoc.example.com/v1/documents/process/status?id=proc-456 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Response (in progress):

```json
{
  "status": "processing",
  "progress": 45.5,
  "message": "Extracting securities data"
}
```

Response (completed):

```json
{
  "status": "completed",
  "progress": 100,
  "message": "Processing complete"
}
```

## Step 5: Retrieve Securities Data

Once processing is complete, retrieve the extracted securities:

```bash
curl -X GET https://api.findoc.example.com/v1/documents/doc-123/securities \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Response:

```json
{
  "success": true,
  "securities": [
    {
      "id": "sec-123",
      "name": "Apple Inc.",
      "symbol": "AAPL",
      "isin": "US0378331005",
      "assetClass": "Equity",
      "quantity": 100,
      "price": 175.25,
      "value": 17525.00,
      "currency": "USD",
      "sector": "Technology"
    },
    {
      "id": "sec-124",
      "name": "Microsoft Corporation",
      "symbol": "MSFT",
      "isin": "US5949181045",
      "assetClass": "Equity",
      "quantity": 50,
      "price": 325.89,
      "value": 16294.50,
      "currency": "USD",
      "sector": "Technology"
    }
  ]
}
```

## Step 6: Analyze the Portfolio

Analyze the portfolio for insights:

```bash
curl -X POST https://api.findoc.example.com/v1/documents/doc-123/analyze \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "options": {
      "detailLevel": "detailed"
    }
  }'
```

Response:

```json
{
  "analysis": {
    "summary": {
      "totalValue": 125000.00,
      "securityCount": 12,
      "assetClassCount": 3,
      "currency": "USD"
    },
    "assetAllocation": {
      "Equity": 65.4,
      "Fixed Income": 25.3,
      "Cash": 9.3
    },
    "sectorAllocation": {
      "Technology": 32.5,
      "Healthcare": 18.2,
      "Financials": 14.7,
      "Consumer": 10.6,
      "Other": 24.0
    },
    "riskMetrics": {
      "diversificationScore": 72.5,
      "riskScore": 58.3,
      "volatility": 12.4
    },
    "insights": [
      {
        "type": "warning",
        "message": "Your portfolio has a high concentration in technology stocks, consider diversifying to reduce sector risk.",
        "importance": 0.8
      },
      {
        "type": "suggestion",
        "message": "Consider adding more fixed income assets to better balance your portfolio.",
        "importance": 0.6
      }
    ]
  }
}
```

## Step 7: Export the Data

Export the securities data in your preferred format:

```bash
curl -X GET https://api.findoc.example.com/v1/documents/doc-123/export?format=csv \
  -H "Authorization: Bearer YOUR_TOKEN" \
  --output securities.csv
```

This will download a CSV file with the securities data.

## Step 8: Compare Documents

To compare two documents:

```bash
curl -X POST https://api.findoc.example.com/v1/comparison/compare \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "documentIds": ["doc-123", "doc-456"],
    "options": {
      "includeDetails": true
    }
  }'
```

Response:

```json
{
  "comparisonId": "comp-789",
  "results": {
    "summary": {
      "documentCount": 2,
      "documentsInfo": {
        "doc-123": {
          "id": "doc-123",
          "name": "Q1 2023 Portfolio",
          "date": "2023-01-15T12:00:00Z",
          "totalValue": 125000.00
        },
        "doc-456": {
          "id": "doc-456",
          "name": "Q2 2023 Portfolio",
          "date": "2023-04-15T12:00:00Z",
          "totalValue": 140000.00
        }
      }
    },
    "differences": {
      "doc-123": {
        "addedSecurities": 0,
        "removedSecurities": 0,
        "changedSecurities": 0,
        "unchangedSecurities": 12,
        "totalValueChange": 0,
        "totalValueChangePercent": 0
      },
      "doc-456": {
        "addedSecurities": 2,
        "removedSecurities": 1,
        "changedSecurities": 5,
        "unchangedSecurities": 6,
        "totalValueChange": 15000.00,
        "totalValueChangePercent": 12.0
      }
    },
    "assetAllocationComparison": {
      "doc-123": {
        "Equity": 65.4,
        "Fixed Income": 25.3,
        "Cash": 9.3
      },
      "doc-456": {
        "Equity": 70.2,
        "Fixed Income": 20.5,
        "Cash": 9.3
      }
    }
  }
}
```

## Using SDKs

For a smoother experience, consider using our official SDKs:

### JavaScript/TypeScript

```bash
npm install findoc-api-client
```

```javascript
const FinDocAPI = require('findoc-api-client');

// Initialize client
const client = new FinDocAPI({
  baseUrl: 'https://api.findoc.example.com/v1'
});

// Authenticate
await client.authenticate('username', 'password');

// Upload document
const uploadResult = await client.uploadDocument('./portfolio.pdf');
const documentId = uploadResult.documentId;

// Process document
const processingId = await client.processDocument(documentId);

// Wait for processing to complete
await client.waitForProcessing(processingId);

// Get securities
const securities = await client.getSecurities(documentId);
console.log(securities);
```

### Python

```bash
pip install findoc-api-client
```

```python
from findoc_api_client import FinDocAPI

# Initialize client
client = FinDocAPI(base_url='https://api.findoc.example.com/v1')

# Authenticate
client.authenticate('username', 'password')

# Upload document
upload_result = client.upload_document('./portfolio.pdf')
document_id = upload_result['documentId']

# Process document
processing_id = client.process_document(document_id)

# Wait for processing to complete
client.wait_for_processing(processing_id)

# Get securities
securities = client.get_securities(document_id)
print(securities)
```

## Webhook Integration

For long-running operations, set up webhooks to receive notifications when operations complete:

1. Configure a webhook endpoint in your account settings
2. Specify which events you want to be notified about
3. Receive POST requests to your endpoint when events occur

Example webhook payload:

```json
{
  "event": "document.processed",
  "timestamp": "2023-01-15T12:10:00Z",
  "data": {
    "documentId": "doc-123",
    "processingId": "proc-456",
    "status": "completed"
  }
}
```

## Next Steps

Once you're familiar with the basic API operations, explore:

1. **Advanced Processing Options** - Customizing the document processing
2. **Batch Processing** - Processing multiple documents at once
3. **Custom Analysis** - Creating custom portfolio analysis rules
4. **Data Integration** - Integrating FinDoc with your existing systems

Visit our [Developer Portal](https://findoc.example.com/developers) for more examples, tutorials, and reference documentation.