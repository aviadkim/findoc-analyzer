# Financial PDF Types for Testing

This document identifies the different types of financial PDFs needed for comprehensive testing of the FinDoc Analyzer application.

## 1. Bank Statements

### Characteristics:
- Account information (account number, holder name, period)
- Transaction history (date, description, amount, balance)
- Summary section (opening balance, closing balance, total deposits, total withdrawals)
- May include charts or graphs showing spending patterns
- Usually has a structured tabular format

### Testing Focus:
- Extraction of account details
- Accurate parsing of transaction tables
- Identification of financial totals
- Handling of multi-page transaction lists

## 2. Investment Portfolio Statements

### Characteristics:
- Portfolio summary (total value, asset allocation, performance)
- List of securities (name, ISIN, quantity, price, value, weight)
- Performance metrics (returns, benchmarks)
- Asset allocation charts
- May include complex tables with nested information

### Testing Focus:
- Extraction of security details including ISINs
- Accurate parsing of portfolio tables
- Identification of asset allocation data
- Extraction of performance metrics

## 3. Financial Statements (Annual/Quarterly Reports)

### Characteristics:
- Balance sheet
- Income statement
- Cash flow statement
- Notes to financial statements
- Complex tables with financial data
- May include footnotes and annotations

### Testing Focus:
- Extraction of financial metrics
- Handling of complex financial tables
- Identification of key financial ratios
- Parsing of footnotes and annotations

## 4. Trade Confirmations

### Characteristics:
- Trade details (security, quantity, price, date)
- Settlement information
- Commission and fee details
- Account information
- Usually has a structured format with specific sections

### Testing Focus:
- Extraction of trade details
- Identification of security information
- Parsing of fee structures
- Extraction of settlement dates

## 5. Fund Factsheets

### Characteristics:
- Fund overview (name, ISIN, strategy)
- Performance data
- Holdings breakdown
- Risk metrics
- Fee structure
- Usually includes charts and tables

### Testing Focus:
- Extraction of fund details
- Parsing of performance tables
- Identification of top holdings
- Extraction of fee information

## 6. Tax Documents (1099, etc.)

### Characteristics:
- Tax identification information
- Income details
- Dividend information
- Capital gains/losses
- Structured format with specific boxes and sections

### Testing Focus:
- Extraction of tax identification details
- Parsing of income tables
- Identification of dividend information
- Extraction of capital gains/losses

## 7. Account Statements (Brokerage/Retirement)

### Characteristics:
- Account summary
- Asset allocation
- Transaction history
- Holdings details
- Performance summary
- May include multiple sections and tables

### Testing Focus:
- Extraction of account details
- Parsing of transaction tables
- Identification of holdings information
- Extraction of performance data

## 8. Research Reports

### Characteristics:
- Company analysis
- Financial projections
- Valuation metrics
- Industry comparisons
- Mix of text, tables, and charts

### Testing Focus:
- Extraction of company details
- Parsing of financial projection tables
- Identification of valuation metrics
- Handling of mixed content formats

## 9. Prospectuses

### Characteristics:
- Fund/security details
- Investment strategy
- Risk factors
- Fee structure
- Performance history
- Dense text with tables and charts

### Testing Focus:
- Extraction of fund/security details
- Parsing of fee tables
- Identification of risk factors
- Handling of dense text with tables

## 10. Edge Case Documents

### Types:
- Large PDFs (>10MB)
- Scanned PDFs (image-based)
- Password-protected PDFs
- PDFs with non-standard fonts
- PDFs with watermarks
- PDFs with form fields
- Corrupted PDFs
- PDFs with images only
- PDFs with tables spanning multiple pages

### Testing Focus:
- System performance with large files
- OCR capabilities
- Error handling
- Font rendering
- Handling of watermarks
- Form field extraction
- Error messaging for corrupted files
- Image processing capabilities
- Table continuity across pages

## Priority for Testing

1. Investment Portfolio Statements (highest priority)
2. Bank Statements
3. Account Statements
4. Financial Statements
5. Fund Factsheets
6. Trade Confirmations
7. Tax Documents
8. Research Reports
9. Prospectuses
10. Edge Case Documents

This prioritization focuses on the core functionality of the FinDoc Analyzer application, which is primarily designed to process investment portfolio statements and extract security information.
