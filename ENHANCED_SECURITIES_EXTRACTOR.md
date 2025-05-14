# Enhanced Securities Extractor

This module provides a robust securities extraction system for various financial PDF documents, with a special focus on Messos format PDFs.

## Features

- Extract securities information including ISIN, name, quantity, price, and value
- Automatic detection of document type (messos, bofa, ubs, db, ms, generic)
- Currency detection and normalization
- Cross-validation between security properties
- Reference database for security name validation
- Comprehensive error handling with detailed logging
- Unit tests to ensure reliability

## Usage

Basic usage:

```python
from enhanced_securities_extractor import SecurityExtractor, configure_file_logging

# Set up file logging (optional)
configure_file_logging('extraction.log')

# Create extractor instance
extractor = SecurityExtractor(debug=True, log_level="INFO")

# Extract securities from PDF
result = extractor.extract_from_pdf("path/to/document.pdf")

# Process the results
for security in result["securities"]:
    print(f"ISIN: {security.get('isin')}")
    print(f"Description: {security.get('description')}")
    print(f"Value: {security.get('value')}")
    print(f"Currency: {security.get('currency')}")
    print("-" * 40)
```

## Error Handling

The extractor includes robust error handling to ensure graceful processing even with invalid inputs or malformed PDFs.

All methods return well-structured data with error information when needed:

```python
result = extractor.extract_from_pdf("invalid.pdf")
if result.get("error"):
    print(f"Extraction failed: {result['error']}")
else:
    print(f"Extracted {len(result['securities'])} securities successfully")
```

## Logging

Logging can be configured at different levels:

```python
# Configure console and file logging
from enhanced_securities_extractor import configure_file_logging

# Set up file logging
configure_file_logging('extraction.log')

# Create extractor with desired logging level
extractor = SecurityExtractor(log_level="DEBUG")  # Options: DEBUG, INFO, WARNING, ERROR, CRITICAL
```

## Implementation Details

### Document Type Detection

The extractor automatically detects the following document types:
- messos - Messos Enterprises / Cornèr Banca
- bofa - Bank of America / Merrill Lynch
- ubs - UBS
- db - Deutsche Bank
- ms - Morgan Stanley
- generic - Default fallback

### Currency Detection

Currencies are detected using:
1. Explicit currency mentions (USD, EUR, CHF, etc.)
2. Currency symbols ($, €, £, etc.)
3. Document-type specific defaults

### Securities Extraction

For each security, the extractor attempts to identify:
- ISIN
- Security name/description
- Type (bond, equity, etc.)
- Nominal/quantity
- Price
- Value
- Currency
- Maturity date (for bonds)
- Coupon rate (for bonds)

### Error Handling

The extraction process is wrapped in comprehensive error handling to ensure it never fails catastrophically. Each component has its own error handling with fallbacks to ensure maximum data extraction even when some parts fail.

## Testing

To run the tests for error handling:

```bash
python test_error_handling.py
```

## Integration

The enhanced securities extractor integrates with the FinDoc Analyzer SaaS as one of the specialized financial agents. It powers the extraction of securities information from investment portfolio documents, providing high-quality structured data for further analysis and visualization.

## License

[MIT License](LICENSE)