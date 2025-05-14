# Real-Time Market Data Integration

This document describes the implementation of real-time market data integration for securities in the FinDoc Analyzer application. This feature enhances the application by adding current market prices and values to the extracted securities, providing users with up-to-date information about their investments.

## Overview

The market data integration enhances the FinDoc Analyzer in the following ways:

1. Retrieves current market prices for securities using their ISIN codes
2. Updates security values based on current prices and quantities
3. Shows price changes compared to document values
4. Provides historical price data for trend analysis
5. Implements caching to reduce API calls
6. Supports multiple data providers with fallback options
7. Handles rate limiting and API quotas

## Architecture

The market data integration consists of the following components:

1. **Market Data Service** - Core service for retrieving market data from providers
2. **Market Data Routes** - API endpoints for accessing market data
3. **Enhanced Securities Extractor** - Enhanced version of the securities extractor that includes market data
4. **Enhanced Securities Viewer** - UI component to display securities with market data

## Supported Data Providers

The system supports multiple market data providers with fallback capabilities:

- **Yahoo Finance** (Primary) - Free API with good coverage and reliability
- **Alpha Vantage** - Alternative provider with good historical data
- **IEX Cloud** - Paid service with extensive market data
- **Finnhub** - Financial market data and alternative data API
- **Polygon.io** - Financial market data API with historical data

The system will first try the primary provider and then fall back to alternatives if needed.

## API Endpoints

### Get Current Market Price
```
GET /api/market-data/price/:isin
```

Parameters:
- `isin` (path parameter) - ISIN code of the security
- `provider` (query parameter, optional) - Specific provider to use
- `forceRefresh` (query parameter, optional) - Force refresh from API instead of cache

Returns current market price and related information for a security.

### Get Historical Price Data
```
GET /api/market-data/historical/:isin
```

Parameters:
- `isin` (path parameter) - ISIN code of the security
- `period` (query parameter, optional) - Time period ('1d', '1w', '1m', '3m', '6m', '1y', '5y')
- `interval` (query parameter, optional) - Data interval ('1m', '5m', '15m', '30m', '1h', '1d', '1wk', '1mo')
- `provider` (query parameter, optional) - Specific provider to use

Returns historical price data for a security over the specified period.

### Update Securities with Market Data
```
PUT /api/market-data/update-securities
```

Request body:
```json
{
  "securities": [
    {
      "isin": "US0378331005",
      "name": "Apple Inc.",
      "type": "equity",
      "quantity": 10,
      "price": 150.00,
      "value": 1500.00,
      "currency": "USD"
    },
    ...
  ],
  "provider": "yahoo",
  "forceRefresh": true
}
```

Returns the securities with updated market data.

### Get Securities from Document with Market Data
```
GET /api/documents/:id/securities
```

Parameters:
- `id` (path parameter) - Document ID
- `includeMarketData` (query parameter, optional) - Whether to include market data (default: true)

Returns securities extracted from the document with optional market data.

## Caching

The market data service implements caching to minimize API calls and improve performance:

- Price data is cached for 15 minutes
- Symbol conversion (ISIN to ticker) is cached indefinitely
- Historical data is cached for 1 hour

## Rate Limiting

The service implements rate limiting to prevent API quota exhaustion:

| Provider       | Rate Limit        |
|----------------|-------------------|
| Yahoo Finance  | 100 req/min       |
| Alpha Vantage  | 5 req/min         |
| IEX Cloud      | 50 req/min        |
| Finnhub        | 30 req/min        |
| Polygon.io     | 5 req/min         |

When a provider's rate limit is reached, the service automatically falls back to alternative providers.

## UI Enhancements

The enhanced securities viewer includes the following features:

1. Toggle between document values and market values
2. Visual indicators for price changes (green for positive, red for negative)
3. Portfolio summary with total value comparison
4. Detailed security view with historical price chart
5. Manual refresh of market data for individual securities or the entire portfolio
6. Export to CSV with both document and market values

## Testing

Run the market data integration test to verify functionality:

```
node test-market-data-integration.js
```

This test script:
1. Retrieves current price for a test security
2. Fetches historical price data
3. Updates a test portfolio with market data

## Configuration

To configure the market data providers, use the following API endpoint:

```
POST /api/market-data/configure
```

Request body:
```json
{
  "primaryProvider": "yahoo",
  "fallbackProviders": ["alphavantage", "finnhub"]
}
```

## API Key Management

API keys for market data providers are managed through the API Key Manager service. To add or update API keys:

```
POST /api/keys
```

Request body:
```json
{
  "name": "alphavantage",
  "key": "YOUR_API_KEY"
}
```

## Future Enhancements

Planned future enhancements include:

1. Additional market data providers (Bloomberg, Refinitiv, etc.)
2. More detailed historical charts with technical indicators
3. Portfolio performance analytics
4. Real-time price updates using WebSockets
5. Alerts for significant price changes
6. Integration with external portfolio management tools