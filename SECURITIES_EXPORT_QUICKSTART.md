# Securities Export Service Quick Start Guide

This guide provides a quick overview of how to use the Securities Export Service for exporting securities data from the FinDoc Analyzer application.

## Overview

The Securities Export Service allows you to:

- Export securities data extracted from financial documents in various formats (CSV, Excel, PDF, JSON)
- Export portfolio comparisons
- Schedule regular exports

## Server-Side Usage

### Basic Export

To export securities data from a document:

```javascript
const SecuritiesExportService = require('./services/securities-export-service');
const securitiesExportService = new SecuritiesExportService();

// Export securities to a specific format
async function exportDocument(documentId, format) {
  try {
    // Fetch securities data for the document
    const securities = await getSecuritiesForDocument(documentId);
    const documentInfo = await getDocumentInfo(documentId);
    
    // Export based on format
    let result;
    switch (format) {
      case 'csv':
        result = await securitiesExportService.exportSecuritiesToCsv(securities, {
          fileName: `securities_${documentId}.csv`,
          includeMetadata: true,
          documentInfo
        });
        break;
      case 'excel':
        result = await securitiesExportService.exportSecuritiesToExcel(securities, {
          fileName: `securities_${documentId}.xlsx`,
          includeMetadata: true,
          documentInfo
        });
        break;
      case 'pdf':
        result = await securitiesExportService.exportSecuritiesToPdf(securities, {
          fileName: `securities_${documentId}.pdf`,
          includeMetadata: true,
          documentInfo,
          title: 'Securities Export',
          subtitle: `Document: ${documentInfo.name}`
        });
        break;
      case 'json':
      default:
        result = await securitiesExportService.exportSecuritiesToJson(securities, {
          fileName: `securities_${documentId}.json`,
          includeMetadata: true,
          documentInfo,
          pretty: true
        });
        break;
    }
    
    return {
      success: true,
      exportUrl: result.exportUrl,
      exportPath: result.exportPath
    };
  } catch (error) {
    console.error('Export error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}
```

### Portfolio Comparison

To export a comparison of multiple portfolios:

```javascript
async function exportPortfolioComparison(portfolioIds, format) {
  try {
    // Fetch portfolios data
    const portfolios = await Promise.all(
      portfolioIds.map(async id => {
        const portfolio = await getPortfolioById(id);
        return {
          id,
          name: portfolio.name,
          date: portfolio.date,
          totalValue: portfolio.totalValue,
          securities: portfolio.securities
        };
      })
    );
    
    // Export the comparison
    const result = await securitiesExportService.exportPortfolioComparison(
      portfolios, 
      format, 
      {
        fileName: `portfolio_comparison.${format === 'excel' ? 'xlsx' : format}`,
        includeMetadata: true
      }
    );
    
    return {
      success: true,
      exportUrl: result.exportUrl,
      exportPath: result.exportPath
    };
  } catch (error) {
    console.error('Portfolio comparison export error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}
```

## API Routes

The service is exposed through the following API routes:

### Export Document Securities

**Endpoint:** `POST /api/securities-export/document/:documentId`

**Request:**
```json
{
  "format": "json", // "csv", "excel", "pdf", or "json"
  "options": {
    "includeMetadata": true,
    "includeMarketData": true,
    "documentInfo": {
      "id": "doc-123",
      "name": "Financial Report.pdf",
      "type": "Portfolio Statement",
      "uploadDate": "2023-01-01T00:00:00.000Z",
      "processingDate": "2023-01-01T01:00:00.000Z"
    }
  }
}
```

**Response:**
```json
{
  "success": true,
  "export": {
    "documentId": "doc-123",
    "format": "json",
    "exportedAt": "2023-05-12T14:25:36.123Z",
    "downloadUrl": "/exports/securities_export_doc-123_1683899136123.json",
    "expiresAt": "2023-05-13T14:25:36.123Z"
  }
}
```

### Export Portfolio Comparison

**Endpoint:** `POST /api/securities-export/comparison`

**Request:**
```json
{
  "documentIds": ["doc-123", "doc-456"],
  "format": "excel",
  "options": {
    "includeMetadata": true,
    "includeMarketData": true,
    "fileName": "portfolio_comparison.xlsx"
  }
}
```

**Response:**
```json
{
  "success": true,
  "export": {
    "documentIds": ["doc-123", "doc-456"],
    "format": "excel",
    "exportedAt": "2023-05-12T14:25:36.123Z",
    "downloadUrl": "/exports/portfolio_comparison_1683899136123.xlsx",
    "expiresAt": "2023-05-13T14:25:36.123Z"
  }
}
```

### Schedule Regular Export

**Endpoint:** `POST /api/securities-export/schedule`

**Request:**
```json
{
  "documentId": "doc-123",
  "format": "json",
  "schedule": {
    "frequency": "daily", // "daily", "weekly", or "monthly"
    "time": "08:00"
  },
  "options": {
    "includeMetadata": true,
    "includeMarketData": true
  }
}
```

**Response:**
```json
{
  "success": true,
  "schedule": {
    "id": "scheduled-export-1683899136123",
    "documentId": "doc-123",
    "format": "json",
    "schedule": {
      "frequency": "daily",
      "time": "08:00"
    },
    "createdAt": "2023-05-12T14:25:36.123Z",
    "nextExecution": "2023-05-13T08:00:00.000Z"
  }
}
```

## UI Integration

The service includes client-side JavaScript that integrates with the FinDoc Analyzer UI. This provides a user-friendly interface for exporting securities data.

### Export Button

The UI adds an export button to document and portfolio pages. Clicking this button opens a modal with export options.

### Export Options Modal

The export options modal allows users to:
- Select the document or portfolios to export
- Choose the export format (CSV, Excel, PDF, JSON)
- Configure export options

### Export Process

When the user clicks the Export button in the modal:
1. The UI makes an API request to the server
2. The server generates the export file
3. The UI receives the download URL
4. The UI initiates the download

## Customization Options

The Securities Export Service provides various options for customizing exports:

### CSV Export Options
- `fileName` - Name of the export file
- `includeMetadata` - Whether to include document metadata
- `includeMarketData` - Whether to include market data
- `onlyEssentialFields` - Whether to include only essential fields

### Excel Export Options
- Same as CSV, plus:
  - Additional sheet options for multi-sheet exports

### PDF Export Options
- Same as CSV, plus:
  - `title` - PDF title
  - `subtitle` - PDF subtitle
  - `includeLogo` - Whether to include logo
  - `includeCharts` - Whether to include charts
  - `pageSize` - PDF page size
  - `orientation` - PDF orientation

### JSON Export Options
- Same as CSV, plus:
  - `pretty` - Whether to format JSON

## Troubleshooting

If you encounter issues with the Securities Export Service:

1. Check the server logs for error messages
2. Verify that the exports directory exists and is writable
3. Ensure that the service is properly initialized
4. For PDF and Excel exports, verify that the required dependencies are installed

The service includes fallback mechanisms to ensure that exports succeed even when the preferred format fails. If an export fails, the service will attempt to fall back to a simpler format.

## For More Information

For detailed documentation, see:
- [Securities Export Service README](./services/README-securities-export.md)
- [API Documentation](./API_SCHEMA.md)