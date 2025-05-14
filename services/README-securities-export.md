# Securities Export Service

## Overview

The Securities Export Service provides functionality for exporting securities data to various formats (CSV, Excel, PDF, and JSON). It is designed to work with the FinDoc Analyzer application to export extracted securities data from financial documents and portfolio comparisons.

## Features

- Export securities to CSV, Excel, PDF, and JSON formats
- Export portfolio comparisons
- Schedule regular exports
- Fallback mechanisms for handling export failures
- Comprehensive error handling

## Usage

### Basic Usage

```javascript
const SecuritiesExportService = require('./services/securities-export-service');

// Initialize the service
const securitiesExportService = new SecuritiesExportService({
  // Specify export directory (defaults to './exports')
  resultsDir: './my-exports',
  // Enable fallback mechanisms
  fallbackToCSV: true,
  fallbackToJSON: true
});

// Export securities to JSON
const jsonResult = await securitiesExportService.exportSecuritiesToJson(securities, {
  fileName: 'my-securities-export.json',
  includeMetadata: true,
  documentInfo: {
    id: 'doc-123',
    name: 'Financial Report.pdf',
    type: 'Portfolio Statement',
    uploadDate: '2023-01-01T00:00:00.000Z',
    processingDate: '2023-01-01T01:00:00.000Z'
  }
});

// The result contains the path to the exported file
console.log(`Export saved to: ${jsonResult.exportPath}`);
console.log(`Download URL: ${jsonResult.exportUrl}`);
```

### Portfolio Comparison

```javascript
// Export portfolio comparison
const comparisonResult = await securitiesExportService.exportPortfolioComparison(
  portfolios, // Array of portfolio objects with securities
  'excel',    // Format: 'csv', 'excel', 'pdf', or 'json'
  {
    fileName: 'portfolio-comparison.xlsx',
    includeMetadata: true
  }
);
```

### Scheduled Exports

```javascript
// Schedule a regular export
const scheduleResult = await securitiesExportService.scheduleExport(
  'doc-123',  // Document ID
  'json',     // Format
  {
    frequency: 'daily', // 'daily', 'weekly', or 'monthly'
    time: '08:00'       // Time of day to run (24-hour format)
  },
  {
    includeMetadata: true
  }
);
```

## API Reference

### Constructor

```javascript
const service = new SecuritiesExportService(options);
```

Options:
- `resultsDir` - Directory to store export files (default: './exports')
- `useMockData` - Whether to use mock data (default: false)
- `fallbackToCSV` - Whether to fall back to CSV when Excel export fails (default: false)
- `fallbackToJSON` - Whether to fall back to JSON when PDF export fails (default: false)
- `fallbackToSimpleExport` - Whether to fall back to simple file creation when export service fails (default: false)

### Methods

#### `exportSecuritiesToCsv(securities, options)`

Export securities to CSV format.

Parameters:
- `securities` - Array of security objects
- `options` - Export options
  - `fileName` - Name of export file
  - `includeMetadata` - Whether to include metadata
  - `documentInfo` - Document information
  - `includeLogo` - Whether to include logo
  - `includeMarketData` - Whether to include market data (default: true)
  - `onlyEssentialFields` - Whether to include only essential fields (default: false)

Returns: Promise resolving to export result object

#### `exportSecuritiesToExcel(securities, options)`

Export securities to Excel format.

Parameters: Same as CSV export

#### `exportSecuritiesToPdf(securities, options)`

Export securities to PDF format.

Parameters:
- Same as CSV export, plus:
  - `title` - PDF title
  - `subtitle` - PDF subtitle
  - `includeCharts` - Whether to include charts
  - `pageSize` - PDF page size ('letter', 'a4', etc.)
  - `orientation` - PDF orientation ('portrait' or 'landscape')

#### `exportSecuritiesToJson(securities, options)`

Export securities to JSON format.

Parameters:
- Same as CSV export, plus:
  - `pretty` - Whether to format JSON (default: true)

#### `exportPortfolioComparison(portfolios, format, options)`

Export portfolio comparison.

Parameters:
- `portfolios` - Array of portfolio objects
  - Each portfolio should have `id`, `name`, `date`, `totalValue`, and `securities` properties
- `format` - Export format ('csv', 'excel', 'pdf', or 'json')
- `options` - Export options (same as above)

#### `scheduleExport(documentId, format, schedule, options)`

Schedule a regular export.

Parameters:
- `documentId` - Document ID
- `format` - Export format
- `schedule` - Schedule configuration
  - `frequency` - 'daily', 'weekly', or 'monthly'
  - `time` - Time of day (24-hour format, e.g., '08:00')
- `options` - Export options

## Error Handling

The service includes robust error handling and fallback mechanisms:

1. If an export fails, detailed error information is logged
2. Excel export failures can fall back to CSV if `fallbackToCSV` is enabled
3. PDF export failures can fall back to JSON if `fallbackToJSON` is enabled
4. Export service failures can fall back to simple file creation if `fallbackToSimpleExport` is enabled
5. Even in case of failures, the service attempts to return useful information rather than throwing errors

## Extensibility

The service is designed to be extensible:

- The underlying `ExportService` can be replaced or enhanced
- New export formats can be added by adding new methods
- Custom data transformations can be applied before export

## Testing

Comprehensive unit tests are available in `/tests/services/securities-export-service.test.js`.