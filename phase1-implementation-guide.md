# Phase 1 Implementation Guide: Enhance OCR and Document Processing

## Overview
This guide provides detailed implementation instructions for enhancing the OCR and document processing capabilities in the FinDoc Analyzer application. The implementation follows the Sequential Thinking methodology to ensure thorough analysis and high-quality implementation.

## 1. Update OCR Implementation

### Sequential Thinking Analysis
1. **Thought 1**: The current OCR implementation uses basic PyMuPDF text extraction, which may not be optimal for financial documents.
2. **Thought 2**: We need to enhance the OCR capabilities to better handle financial documents with complex layouts.
3. **Thought 3**: Tesseract OCR with financial document optimizations would provide better results.
4. **Thought 4**: We need to handle multi-column layouts and financial notation better.
5. **Thought 5**: The implementation should be integrated with the existing document processing workflow.

### Implementation Steps

#### 1.1 Update Python Dependencies
Add the following dependencies to the Python script in `scan1Controller.js`:

```python
import pytesseract
from PIL import Image
import numpy as np
```

#### 1.2 Create Enhanced OCR Function
Add the following function to the Python script:

```python
def enhanced_ocr(pdf_path, page_numbers=None):
    """
    Perform enhanced OCR on a PDF document.
    
    Args:
        pdf_path: Path to the PDF file
        page_numbers: List of page numbers to process (None for all pages)
        
    Returns:
        Dictionary containing extracted text by page
    """
    doc = fitz.open(pdf_path)
    result = {}
    
    # Process all pages if page_numbers is None
    if page_numbers is None:
        page_numbers = range(len(doc))
    
    for page_num in page_numbers:
        if page_num >= len(doc):
            continue
            
        page = doc[page_num]
        
        # Try to extract text directly first
        text = page.get_text()
        
        # If text extraction yields little text, apply OCR
        if len(text.strip()) < 100:
            # Convert page to image
            pix = page.get_pixmap(matrix=fitz.Matrix(300/72, 300/72))
            img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
            
            # Apply OCR with financial document optimizations
            custom_config = r'--oem 3 --psm 6 -c preserve_interword_spaces=1'
            ocr_text = pytesseract.image_to_string(img, config=custom_config)
            
            # Use OCR text if it's longer than the extracted text
            if len(ocr_text.strip()) > len(text.strip()):
                text = ocr_text
        
        # Store the text
        result[page_num] = text
    
    doc.close()
    return result
```

#### 1.3 Update Text Extraction in Main Function
Replace the existing text extraction code in the `extract_securities_from_pdf` function:

```python
def extract_securities_from_pdf(pdf_path):
    """
    Extract securities information from a PDF file.

    Args:
        pdf_path: Path to the PDF file

    Returns:
        Dictionary containing extracted information
    """
    print(f"Processing {pdf_path} to extract securities information...")

    # Extract text from PDF using enhanced OCR
    extracted_text = enhanced_ocr(pdf_path)
    
    # Combine all text
    text = ""
    for page_num in sorted(extracted_text.keys()):
        text += extracted_text[page_num]

    # Detect document type
    doc_type = detect_document_type(text)

    # Extract tables from all pages
    tables = camelot.read_pdf(
        pdf_path,
        pages='all',
        flavor='stream',
        suppress_stdout=True
    )

    # Rest of the function remains the same...
```

## 2. Improve Table Extraction

### Sequential Thinking Analysis
1. **Thought 1**: The current table extraction uses Camelot with basic settings.
2. **Thought 2**: We need to enhance the table extraction to handle complex financial tables.
3. **Thought 3**: We should try different Camelot flavors (stream and lattice) based on the document type.
4. **Thought 4**: We need to handle merged cells and complex table structures better.
5. **Thought 5**: The implementation should validate extracted tables to ensure accuracy.

### Implementation Steps

#### 2.1 Create Enhanced Table Extraction Function
Add the following function to the Python script:

```python
def extract_tables_enhanced(pdf_path, doc_type):
    """
    Extract tables from a PDF file with enhanced settings.
    
    Args:
        pdf_path: Path to the PDF file
        doc_type: Type of document
        
    Returns:
        List of extracted tables
    """
    tables = []
    
    # Try stream flavor first (good for tables without clear borders)
    stream_tables = camelot.read_pdf(
        pdf_path,
        pages='all',
        flavor='stream',
        edge_tol=50,  # More tolerant of whitespace
        row_tol=10,   # More tolerant of row variations
        suppress_stdout=True
    )
    
    # Try lattice flavor (good for tables with clear borders)
    lattice_tables = camelot.read_pdf(
        pdf_path,
        pages='all',
        flavor='lattice',
        line_scale=40,  # More sensitive to light lines
        suppress_stdout=True
    )
    
    # Choose the best tables based on accuracy
    for i in range(min(len(stream_tables), len(lattice_tables))):
        stream_table = stream_tables[i] if i < len(stream_tables) else None
        lattice_table = lattice_tables[i] if i < len(lattice_tables) else None
        
        if stream_table is None:
            tables.append(lattice_table)
        elif lattice_table is None:
            tables.append(stream_table)
        else:
            # Choose the table with better accuracy
            stream_accuracy = stream_table.accuracy
            lattice_accuracy = lattice_table.accuracy
            
            if stream_accuracy > lattice_accuracy:
                tables.append(stream_table)
            else:
                tables.append(lattice_table)
    
    # Add any remaining tables
    for i in range(len(tables), max(len(stream_tables), len(lattice_tables))):
        if i < len(stream_tables):
            tables.append(stream_tables[i])
        elif i < len(lattice_tables):
            tables.append(lattice_tables[i])
    
    return tables
```

#### 2.2 Update Table Extraction in Main Function
Replace the existing table extraction code in the `extract_securities_from_pdf` function:

```python
def extract_securities_from_pdf(pdf_path):
    """
    Extract securities information from a PDF file.

    Args:
        pdf_path: Path to the PDF file

    Returns:
        Dictionary containing extracted information
    """
    print(f"Processing {pdf_path} to extract securities information...")

    # Extract text from PDF using enhanced OCR
    extracted_text = enhanced_ocr(pdf_path)
    
    # Combine all text
    text = ""
    for page_num in sorted(extracted_text.keys()):
        text += extracted_text[page_num]

    # Detect document type
    doc_type = detect_document_type(text)

    # Extract tables with enhanced settings
    tables = extract_tables_enhanced(pdf_path, doc_type)

    # Rest of the function remains the same...
```

## 3. Enhance Metadata Extraction

### Sequential Thinking Analysis
1. **Thought 1**: The current metadata extraction is limited to basic information.
2. **Thought 2**: We need to extract more comprehensive metadata from financial documents.
3. **Thought 3**: We should extract document structure (sections, headings) for better analysis.
4. **Thought 4**: We need to extract financial entities (companies, securities) more accurately.
5. **Thought 5**: The implementation should be integrated with the existing document processing workflow.

### Implementation Steps

#### 3.1 Create Enhanced Metadata Extraction Function
Add the following function to the Python script:

```python
def extract_metadata_enhanced(text, doc_type):
    """
    Extract enhanced metadata from document text.
    
    Args:
        text: Document text
        doc_type: Type of document
        
    Returns:
        Dictionary containing extracted metadata
    """
    metadata = {
        "document_type": doc_type,
        "title": None,
        "author": None,
        "date": None,
        "sections": [],
        "entities": {
            "companies": [],
            "securities": [],
            "currencies": [],
            "dates": []
        }
    }
    
    # Extract title
    title_patterns = [
        r'(?i)^(.*?)(report|statement|analysis|portfolio|summary)',
        r'(?i)^(.*?)(financial|investment|asset|wealth|fund)',
        r'(?i)(quarterly|annual|monthly)\s+report'
    ]
    
    for pattern in title_patterns:
        match = re.search(pattern, text[:500])
        if match:
            metadata["title"] = match.group(0).strip()
            break
    
    # Extract date
    date_patterns = [
        r'(?i)(?:as of|dated|date[d:]|report date|valuation date|statement date)[\s:]*(\d{1,2}[\s./-]\d{1,2}[\s./-]\d{2,4})',
        r'(?i)(?:as of|dated|date[d:]|report date|valuation date|statement date)[\s:]*(\w+\s+\d{1,2}(?:st|nd|rd|th)?[\s,]+\d{4})',
        r'(\d{1,2}[\s./-]\d{1,2}[\s./-]\d{2,4})'
    ]
    
    for pattern in date_patterns:
        match = re.search(pattern, text[:1000])
        if match:
            metadata["date"] = match.group(1).strip()
            break
    
    # Extract sections
    section_pattern = r'(?i)^([A-Z][A-Z\s]{2,}):?\s*$'
    for line in text.split('\n'):
        if re.match(section_pattern, line.strip()):
            metadata["sections"].append(line.strip())
    
    # Extract companies
    company_patterns = [
        r'(?i)(?:company|corporation|inc\.|incorporated|ltd\.|limited|llc|plc|group|holding|bank|fund|trust):?\s*([A-Z][A-Za-z\s,\.]+)(?:\s|$)',
        r'([A-Z][A-Za-z]+(?:\s+[A-Z][A-Za-z]+){1,5})\s+(?:Inc\.|Corp\.|Ltd\.|LLC|PLC|Group|Holding|Bank|Fund|Trust)'
    ]
    
    for pattern in company_patterns:
        for match in re.finditer(pattern, text):
            company = match.group(1).strip()
            if company and company not in metadata["entities"]["companies"]:
                metadata["entities"]["companies"].append(company)
    
    # Extract currencies
    currency_pattern = r'(?:USD|EUR|GBP|CHF|JPY|CAD|AUD|NZD|HKD|SGD)'
    for match in re.finditer(currency_pattern, text):
        currency = match.group(0)
        if currency not in metadata["entities"]["currencies"]:
            metadata["entities"]["currencies"].append(currency)
    
    return metadata
```

#### 3.2 Update Metadata Extraction in Main Function
Add the enhanced metadata extraction to the `extract_securities_from_pdf` function:

```python
def extract_securities_from_pdf(pdf_path):
    """
    Extract securities information from a PDF file.

    Args:
        pdf_path: Path to the PDF file

    Returns:
        Dictionary containing extracted information
    """
    print(f"Processing {pdf_path} to extract securities information...")

    # Extract text from PDF using enhanced OCR
    extracted_text = enhanced_ocr(pdf_path)
    
    # Combine all text
    text = ""
    for page_num in sorted(extracted_text.keys()):
        text += extracted_text[page_num]

    # Detect document type
    doc_type = detect_document_type(text)

    # Extract enhanced metadata
    metadata = extract_metadata_enhanced(text, doc_type)

    # Extract tables with enhanced settings
    tables = extract_tables_enhanced(pdf_path, doc_type)

    # Rest of the function remains the same...

    # Add metadata to the result
    result = {
        "document_type": doc_type,
        "metadata": metadata,
        "securities": securities,
        "portfolio_summary": portfolio_summary,
        "asset_allocation": asset_allocation
    }

    return result
```

## 4. Implement Better ISIN Detection

### Sequential Thinking Analysis
1. **Thought 1**: The current ISIN detection uses basic regex patterns.
2. **Thought 2**: We need to implement more robust regex patterns for ISIN detection.
3. **Thought 3**: We should validate detected ISINs to ensure accuracy.
4. **Thought 4**: We need to extract related security information for each ISIN.
5. **Thought 5**: The implementation should be integrated with the existing document processing workflow.

### Implementation Steps

#### 4.1 Create Enhanced ISIN Detection Function
Add the following function to the Python script:

```python
def extract_isins_enhanced(text):
    """
    Extract ISINs from text with enhanced validation.
    
    Args:
        text: Text to extract ISINs from
        
    Returns:
        List of validated ISINs
    """
    # ISIN pattern: 2 letters followed by 9 alphanumeric characters and a check digit
    isin_pattern = r'\b([A-Z]{2}[A-Z0-9]{9}[0-9])\b'
    
    # Find all potential ISINs
    potential_isins = re.findall(isin_pattern, text)
    
    # Validate ISINs
    validated_isins = []
    for isin in potential_isins:
        if validate_isin(isin):
            validated_isins.append(isin)
    
    return validated_isins

def validate_isin(isin):
    """
    Validate an ISIN using the check digit.
    
    Args:
        isin: ISIN to validate
        
    Returns:
        True if valid, False otherwise
    """
    if len(isin) != 12:
        return False
    
    # Check country code
    country_code = isin[:2]
    if not country_code.isalpha():
        return False
    
    # Convert letters to numbers (A=10, B=11, ..., Z=35)
    values = []
    for char in isin[:-1]:  # Exclude check digit
        if char.isalpha():
            values.append(str(ord(char) - ord('A') + 10))
        else:
            values.append(char)
    
    # Join values and convert to string
    value_str = ''.join(values)
    
    # Apply Luhn algorithm
    total = 0
    for i, digit in enumerate(reversed(value_str)):
        n = int(digit)
        if i % 2 == 0:
            n *= 2
            if n > 9:
                n -= 9
        total += n
    
    check_digit = (10 - (total % 10)) % 10
    
    # Compare with the actual check digit
    return check_digit == int(isin[-1])
```

#### 4.2 Update ISIN Detection in Main Function
Replace the existing ISIN detection code in the `extract_securities_from_table` function:

```python
def extract_securities_from_table(df, page_number):
    """
    Extract securities from a table.

    Args:
        df: Pandas DataFrame containing the table
        page_number: Page number of the table

    Returns:
        List of dictionaries containing securities information
    """
    securities = []

    # Convert DataFrame to list of rows
    rows = df.values.tolist()

    # Find ISIN column
    isin_col = -1
    for i, header in enumerate(rows[0]):
        if 'ISIN' in header:
            isin_col = i
            break

    # If no ISIN column found, try to find it in the rows
    if isin_col == -1:
        for row in rows:
            for i, cell in enumerate(row):
                # Use enhanced ISIN detection
                isins = extract_isins_enhanced(cell)
                if isins:
                    isin_col = i
                    break
            if isin_col != -1:
                break

    # Process rows to extract securities
    for row in rows[1:]:  # Skip header row
        # Skip empty rows
        if not any(cell.strip() for cell in row):
            continue

        # Try to find ISIN in the row
        isin = None

        if isin_col != -1 and isin_col < len(row):
            # Use enhanced ISIN detection
            isins = extract_isins_enhanced(row[isin_col])
            if isins:
                isin = isins[0]

        if not isin:
            # Try to find ISIN in any cell
            for cell in row:
                isins = extract_isins_enhanced(cell)
                if isins:
                    isin = isins[0]
                    break

        if isin:
            # Create security
            security = {
                'isin': isin,
                'page': page_number
            }

            # Rest of the function remains the same...

            securities.append(security)

    return securities
```

## Integration and Testing

### Integration Steps
1. Update the Python script in `scan1Controller.js` with the enhanced functions.
2. Test the enhanced OCR and document processing with sample financial documents.
3. Verify that the enhanced functions are correctly integrated with the existing workflow.
4. Validate the results against expected outputs.

### Testing Steps
1. Create unit tests for each enhanced function.
2. Test with various financial document types (portfolio statements, account statements, fund fact sheets).
3. Verify that the enhanced OCR correctly handles multi-column layouts.
4. Test table extraction with complex table structures.
5. Validate ISIN detection with known ISINs.
6. Test metadata extraction with various document types.

## Conclusion
This implementation guide provides detailed instructions for enhancing the OCR and document processing capabilities in the FinDoc Analyzer application. By following these steps, you will significantly improve the accuracy and reliability of the document processing workflow.
