# Enhanced Securities Formats Support

This document provides information about the additional financial document formats supported by the Enhanced Securities Extractor.

## Overview

The Enhanced Securities Extractor now supports the following financial document formats:

- Interactive Brokers statements
- Charles Schwab portfolio statements
- Vanguard account statements
- Fidelity investment reports
- TD Ameritrade statements
- E*TRADE account summaries
- Messos (previously supported)
- Bank of America/Merrill Lynch statements (previously supported)
- UBS statements (previously supported)
- Deutsche Bank statements (previously supported)
- Morgan Stanley statements (previously supported)
- Generic format (fallback for unrecognized formats)

## Format-Specific Features

Each format is supported with specialized extraction logic tailored to the unique layout and structure of the respective brokerage statements.

### Interactive Brokers

- Detection: Recognizes keywords like "Interactive Brokers", "IBKR", "IB Account Statement"
- Securities Table Structure: Typically has columns for Symbol, Description, Quantity, Price, and Value
- Default Currency: USD
- Special Handling: Extracts ISINs which are commonly included, recognizes various position table formats

### Charles Schwab

- Detection: Recognizes keywords like "Charles Schwab", "Schwab One Account", "Schwab Brokerage Account"
- Securities Table Structure: Typically has columns for Symbol, Security Description, Shares, Price, and Market Value
- Default Currency: USD
- Special Handling: Recognizes Schwab-specific fund naming patterns

### Vanguard

- Detection: Recognizes keywords like "Vanguard", "The Vanguard Group", "Vanguard Brokerage Services"
- Securities Table Structure: Typically has columns for Fund Name, Symbol, Shares, Price, and Balance
- Default Currency: USD
- Special Handling: Specifically optimized for Vanguard fund naming patterns and automatically categorizes securities as funds, ETFs, etc.

### Fidelity

- Detection: Recognizes keywords like "Fidelity Investments", "FMR LLC", "Fidelity Brokerage Services"
- Securities Table Structure: Typically has columns for Symbol, Security Name, Shares, Last Price, and Current Value
- Default Currency: USD
- Special Handling: Recognizes Fidelity-specific fund naming patterns and handles their decimal quantity formats

### TD Ameritrade

- Detection: Recognizes keywords like "TD Ameritrade", "TDA", "TD Ameritrade Clearing"
- Securities Table Structure: Typically has columns for Symbol, Security Name, Shares, Market Price, and Value
- Default Currency: USD
- Special Handling: Extracts options positions correctly when present

### E*TRADE

- Detection: Recognizes keywords like "E*TRADE", "E*TRADE Securities", "E*TRADE Financial"
- Securities Table Structure: Typically has columns for Symbol, Security Description, Shares, Last Price, and Market Value
- Default Currency: USD
- Special Handling: Recognizes E*TRADE's security categorization patterns

## Implementation Details

The format support is implemented through the following components:

1. **Format Detection**: Each document is analyzed to determine its type using pattern matching against known format indicators
2. **Format-Specific Extraction**: Once a format is identified, specialized extraction logic is applied
3. **Common Post-Processing**: After extraction, all securities go through common post-processing to standardize data and validate values

## Usage

To use the enhanced format support:

```python
from enhanced_securities_extractor import SecurityExtractor

# Create an extractor
extractor = SecurityExtractor(debug=True)

# Extract securities from a document
result = extractor.extract_from_pdf('/path/to/your/statement.pdf')

# The result contains the document type and extracted securities
print(f"Document type: {result['document_type']}")
print(f"Found {len(result['securities'])} securities")

# Display extracted securities
for security in result['securities']:
    print(f"- {security.get('description', 'Unknown')}: {security.get('value', 'N/A')} {result['currency']}")
```

## Testing

Each supported format has accompanying test cases. If you have sample statements from these brokerages, you can run:

```bash
python test_enhanced_formats.py
```

The tests will try to find appropriate sample files in the current directory and its subdirectories, or can use mock data for basic functionality testing.

## Limitations

- PDF extraction is dependent on the quality and structure of the document
- Some formats may have variations that aren't fully supported yet
- Handwritten or image-based statements may not extract correctly
- Some brokerages may periodically change their statement formats

## Extending Support

To add support for additional formats:

1. Add new format patterns to `DOCUMENT_TYPE_PATTERNS` in `enhanced_securities_formats.py`
2. Implement a format-specific extraction function
3. Add the function to `EXTRACTION_FUNCTIONS` mapping
4. Update the document currency map if needed
5. Add tests for the new format