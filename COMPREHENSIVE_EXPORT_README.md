# Comprehensive Export Service

A unified service for exporting data in various formats (JSON, CSV, Excel, PDF, HTML) with robust error handling and advanced features.

## Features

- Support for all major export formats (JSON, CSV, Excel, PDF, HTML)
- Proper error handling with fallbacks for each format
- Support for large dataset pagination and streaming
- Customizable templates for PDF and HTML exports
- Support for scheduling regular exports
- Export history tracking
- Data transformation adapters for different data types

## API Endpoints

### Document Export
- **POST /api/exports/document/:documentId**
  - Export a document in various formats
  - Supports JSON, CSV, Excel, PDF, HTML formats
  - Includes document metadata, securities, tables, and extracted data

### Analytics Export
- **POST /api/exports/analytics**
  - Export analytics data in various formats
  - Supports metrics like portfolio value, asset allocation, performance, etc.
  - Customizable time ranges

### Portfolio Export
- **POST /api/exports/portfolio/:portfolioId**
  - Export portfolio data in various formats
  - Customize which sections to include (summary, holdings, performance, allocation)
  - Support for comprehensive portfolio data visualization

### Securities Export
- **POST /api/exports/securities**
  - Export securities data in various formats
  - Options to include/exclude market data, metadata, etc.
  - Support for customizable securities data

### Portfolio Comparison
- **POST /api/exports/portfolio-comparison**
  - Export comparison data for multiple portfolios
  - Analyze differences across portfolios
  - Generate comprehensive comparison reports

### Export Scheduling
- **POST /api/exports/schedule**
  - Schedule regular exports (daily, weekly, monthly)
  - Specify format and options for scheduled exports
  - Automate reporting processes

### Export History
- **GET /api/exports/history**
  - Get history of past exports
  - Filter by type, date range, etc.
  - Pagination support

### Download Exports
- **GET /api/exports/download/:fileName**
  - Download previously exported files
  - Direct file access with proper content type

## Implementation

The export service is implemented as a comprehensive solution with the following components:

1. **ComprehensiveExportService**: Core service handling all export functionality
2. **comprehensive-export-routes.js**: Express routes for the export API
3. **Integration with existing services**: Works with document, portfolio, and securities services

## Data Formats

### JSON
- Full fidelity data export
- Nested structure representing the original data
- Ideal for programmatic use

### CSV
- Tabular format for spreadsheet software
- Flattened data structure
- Great for data analysis

### Excel
- Rich spreadsheet format with multiple sheets
- Support for formatting, formulas
- Professional reports

### PDF
- Formatted document with tables and charts
- Print-ready output
- Professional presentation

### HTML
- Interactive web-based format
- Support for styling and structure
- Can be viewed in browsers

## Usage Examples

### Export a Document to PDF

```javascript
// Client-side example
const response = await fetch(`/api/exports/document/doc-12345`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    format: 'pdf',
    options: {
      includeMetadata: true,
      includeTables: true,
      includeSecurities: true,
      title: 'Investment Portfolio Report'
    }
  })
});

const result = await response.json();
if (result.success) {
  // Download file from result.export.downloadUrl
  window.location.href = result.export.downloadUrl;
}
```

### Export Analytics Data to Excel

```javascript
// Client-side example
const response = await fetch('/api/exports/analytics', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    metrics: ['portfolioValue', 'assetAllocation', 'performance'],
    timeRange: {
      start: '2024-01-01',
      end: '2024-05-01'
    },
    format: 'excel',
    options: {
      includeCharts: true,
      includeRawData: true
    }
  })
});

const result = await response.json();
if (result.success) {
  // Download file from result.export.downloadUrl
  window.location.href = result.export.downloadUrl;
}
```

## Test Page

A test page is available at `/export-test.html` that allows you to test the various export features through a web interface.

## Getting Started

1. Make sure you have the necessary dependencies installed:
   - For PDF exports: Python with reportlab
   - For Excel exports: Python with pandas and xlsxwriter

2. Run the update script to add the export routes to your server:
   ```bash
   node update-server-exports.js
   ```

3. Start your server and navigate to the test page:
   ```bash
   http://localhost:8080/export-test.html
   ```

## Error Handling

The export service includes robust error handling:

- Automatic fallback to JSON when other formats fail
- Detailed error messages
- Graceful degradation
- Mock data generation for testing

## Future Enhancements

- Support for streaming large datasets
- Enhanced chart integration in PDF/Excel reports
- Email delivery of scheduled exports
- Advanced templating system for custom reports
- Integration with BI tools