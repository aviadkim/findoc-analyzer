# Excel Exporter Plugin

This plugin provides Excel export functionality for the FinDoc Analyzer application. It allows exporting financial data to Excel (.xlsx and .xls) formats.

## Features

- Export financial data to Excel formats (XLSX, XLS)
- Configurable sheet naming and formatting
- Currency formatting for financial values
- Optional metadata inclusion

## Installation

1. Place the plugin directory in the plugins directory of your FinDoc Analyzer installation
2. Restart the FinDoc Analyzer application
3. Enable the plugin from the plugin management interface

## Configuration

The plugin supports the following configuration options:

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `defaultSheetName` | String | "Financial Data" | Default name for the Excel sheet |
| `includeMetadata` | Boolean | true | Whether to include metadata in the export |
| `formatCurrencyCells` | Boolean | true | Whether to format currency cells |

You can configure these options in the plugin settings page of the FinDoc Analyzer application.

## Usage

Once installed, the Excel export option will appear in the export menu of the FinDoc Analyzer application. You can export financial data by:

1. Opening a financial document
2. Clicking on the "Export" button
3. Selecting "Excel (.xlsx)" or "Excel (.xls)" from the format options
4. Configuring any export options
5. Clicking "Export"

## Development

This plugin is built using the FinDoc Plugin SDK. To make changes:

1. Clone the repository
2. Install dependencies
3. Make your changes
4. Build the plugin
5. Test in your FinDoc Analyzer installation

## License

MIT