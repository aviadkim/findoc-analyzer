# PDF Processing Test Plan

## Test Environments
1. Local Environment
   - URL: http://localhost:3000/test-pdf-processing.html
   - Server: Node.js local server

2. Google Website Environment
   - URL: https://findoc-deploy.ey.r.appspot.com/test-pdf-processing.html
   - Server: Google App Engine

## Test Categories

### 1. Basic Functionality Tests
- File Upload
- Document Processing
- Status Polling
- Results Display

### 2. Feature Tests
- Text Extraction
- Table Extraction
- Security Extraction
- Q&A Functionality

### 3. API Endpoint Tests
- Mock API (/api/mock)
- Test API (/api/test)
- Real API (/api/documents)

### 4. PDF Type Tests
- Financial Statements
- Portfolio Reports
- Investment Summaries
- Account Statements

### 5. Edge Case Tests
- Large Files (>10MB)
- Small Files (<100KB)
- Password-Protected PDFs
- Corrupted PDFs
- PDFs with Images Only
- PDFs with Tables Only
- PDFs with Text Only

## Test Cases

### Basic Functionality Tests

#### BF-01: File Upload
1. Select a PDF file
2. Enter document name
3. Select document type
4. Click "Upload and Process"
5. Verify that the file is uploaded successfully

#### BF-02: Document Processing
1. Upload a PDF file
2. Verify that processing is initiated
3. Verify that status polling works
4. Verify that processing completes successfully

#### BF-03: Results Display
1. Process a PDF file
2. Verify that results are displayed correctly
3. Verify that all tabs (overview, text, tables, securities, Q&A) work

### Feature Tests

#### FT-01: Text Extraction
1. Process a PDF file with text
2. Verify that text is extracted correctly
3. Verify that text is displayed in the "Extracted Text" tab

#### FT-02: Table Extraction
1. Process a PDF file with tables
2. Verify that tables are extracted correctly
3. Verify that tables are displayed in the "Tables" tab

#### FT-03: Security Extraction
1. Process a PDF file with securities information
2. Verify that securities are extracted correctly
3. Verify that securities are displayed in the "Securities" tab

#### FT-04: Q&A Functionality
1. Process a PDF file
2. Ask questions about the document
3. Verify that answers are generated correctly

### API Endpoint Tests

#### API-01: Mock API
1. Select "Mock API" endpoint
2. Process a PDF file
3. Verify that mock data is returned

#### API-02: Test API
1. Select "Test API" endpoint
2. Process a PDF file
3. Verify that test data is returned

#### API-03: Real API
1. Select "Real API" endpoint
2. Process a PDF file
3. Verify that real data is returned (if authentication is available)

### PDF Type Tests

#### PT-01: Financial Statements
1. Process a financial statement PDF
2. Verify that financial data is extracted correctly

#### PT-02: Portfolio Reports
1. Process a portfolio report PDF
2. Verify that portfolio data is extracted correctly

#### PT-03: Investment Summaries
1. Process an investment summary PDF
2. Verify that investment data is extracted correctly

#### PT-04: Account Statements
1. Process an account statement PDF
2. Verify that account data is extracted correctly

### Edge Case Tests

#### EC-01: Large Files
1. Process a large PDF file (>10MB)
2. Verify that the file is processed correctly

#### EC-02: Small Files
1. Process a small PDF file (<100KB)
2. Verify that the file is processed correctly

#### EC-03: Password-Protected PDFs
1. Process a password-protected PDF
2. Verify that an appropriate error message is displayed

#### EC-04: Corrupted PDFs
1. Process a corrupted PDF
2. Verify that an appropriate error message is displayed

#### EC-05: PDFs with Images Only
1. Process a PDF with images only
2. Verify that OCR is used to extract text

#### EC-06: PDFs with Tables Only
1. Process a PDF with tables only
2. Verify that tables are extracted correctly

#### EC-07: PDFs with Text Only
1. Process a PDF with text only
2. Verify that text is extracted correctly

## Test Data

### Sample PDFs
1. Financial Statement: `financial_statement.pdf`
2. Portfolio Report: `portfolio_report.pdf`
3. Investment Summary: `investment_summary.pdf`
4. Account Statement: `account_statement.pdf`
5. Large File: `large_file.pdf`
6. Small File: `small_file.pdf`
7. Password-Protected: `password_protected.pdf`
8. Corrupted: `corrupted.pdf`
9. Images Only: `images_only.pdf`
10. Tables Only: `tables_only.pdf`
11. Text Only: `text_only.pdf`

## Test Execution

### Test Execution Steps
1. Set up the test environment
2. Execute test cases
3. Record results
4. Analyze results
5. Report issues

### Test Reporting
- Test Case ID
- Test Case Description
- Test Environment
- Test Data
- Expected Result
- Actual Result
- Status (Pass/Fail)
- Comments
