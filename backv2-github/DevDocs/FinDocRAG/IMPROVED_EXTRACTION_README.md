# Improved Financial Document Extraction

This module provides dramatically enhanced capabilities for extracting information from financial documents, with a focus on accurate and complete securities extraction from tables in PDF documents.

## Key Improvements

### 1. Advanced Image Processing

The new `AdvancedImageProcessor` module provides sophisticated image processing capabilities:

- **Enhanced OCR**: Improved text extraction with language support and preprocessing
- **Table Detection**: Multiple methods for detecting tables in images (line detection, grid detection, contour detection)
- **Grid Structure Analysis**: Advanced analysis of table grid structures
- **Cell Text Extraction**: Accurate extraction of text from individual table cells

### 2. Enhanced Table Analysis

The `EnhancedTableAnalyzer` module provides specialized analysis for financial tables:

- **Financial Column Detection**: Specialized detection of financial column types (ISIN, security name, quantity, price, etc.)
- **Table Type Classification**: Automatic classification of financial table types
- **Header and Footer Detection**: Intelligent detection of header and footer rows
- **Security Row Identification**: Accurate identification of rows containing security information

### 3. Improved Securities Extraction

The `ImprovedSecuritiesExtractor` module combines image processing and table analysis for better securities extraction:

- **Multi-Method Extraction**: Extracts securities using multiple methods (table analysis, OCR text)
- **Security Merging**: Merges and deduplicates securities from different sources
- **Field Normalization**: Normalizes security fields (numeric values, percentages, etc.)
- **Context-Aware Extraction**: Uses context to extract additional information about securities

### 4. Comprehensive Document Processing

The `FinancialDocumentProcessor` provides end-to-end processing of financial documents:

- **Document Type Detection**: Automatic detection of financial document types
- **Portfolio Summary Extraction**: Extraction of portfolio summary information
- **Portfolio Analysis**: Analysis of portfolio composition and completeness
- **Multi-Format Support**: Support for PDF, Excel, and image documents

## Usage

### Running the Test Script

To test the improved extraction on a financial document:

```powershell
.\run-improved-extraction.ps1 -DocumentPath "path\to\document.pdf" -OutputDir "output" -Languages "eng" -Debug
```

Parameters:
- `DocumentPath`: Path to the financial document (required)
- `OutputDir`: Directory to save output files (default: "output")
- `Languages`: Comma-separated list of language codes for OCR (default: "eng")
- `Debug`: Enable debug mode (optional)

### Using the API

You can also use the API directly in your code:

```python
from financial_document_processor import FinancialDocumentProcessor

# Initialize processor
processor = FinancialDocumentProcessor(
    languages=['eng'],
    debug=True,
    output_dir='output'
)

# Process document
result = processor.process_document('path/to/document.pdf')

# Access results
securities = result.get('securities')
portfolio_summary = result.get('portfolio_summary')
portfolio_analysis = result.get('portfolio_analysis')
```

## Requirements

- Python 3.7+
- PyMuPDF (fitz)
- OpenCV (cv2)
- Pandas
- NumPy
- Pytesseract
- PIL (Pillow)
- Tabulate (for display)

## Installation

1. Install Python dependencies:
   ```
   pip install pymupdf opencv-python pandas numpy pytesseract pillow tabulate
   ```

2. Install Tesseract OCR:
   - Windows: Download and install from https://github.com/UB-Mannheim/tesseract/wiki
   - Linux: `sudo apt-get install tesseract-ocr`
   - macOS: `brew install tesseract`

## Future Improvements

- Integration with financial data APIs for security information enrichment
- Support for more languages and document formats
- Machine learning-based table structure recognition
- Improved handling of complex multi-page tables
- Enhanced portfolio analysis with risk metrics and performance indicators
