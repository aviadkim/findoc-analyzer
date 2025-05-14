# FinDoc Analyzer: Comprehensive Processing Schema

## Overview

This document outlines the complete end-to-end process of the FinDoc Analyzer system, from document upload to data extraction, storage, analysis, and user interaction through the chat interface.

## System Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│  User Interface │────▶│  Backend API    │────▶│  Database       │
│                 │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
        │                       │                       │
        │                       │                       │
        ▼                       ▼                       ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│  Document       │     │  AI Agents      │     │  Export &       │
│  Processing     │     │                 │     │  Reporting      │
│                 │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

## Document Processing Flow

### 1. Document Upload and Initial Processing

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│             │     │             │     │             │     │             │
│  User       │────▶│  Upload     │────▶│  Document   │────▶│  Status     │
│  Selects    │     │  Document   │     │  Processing │     │  Tracking   │
│  Document   │     │             │     │             │     │             │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
                                               │
                                               │
                                               ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│             │     │             │     │             │
│  Document   │◀───▶│  Temporary  │◀───▶│  Processing │
│  Storage    │     │  Storage    │     │  Queue      │
│             │     │             │     │             │
└─────────────┘     └─────────────┘     └─────────────┘
```

**Sequential Steps:**

1. **User Selects Document**:
   - User navigates to the upload page
   - User selects a PDF, Excel, or CSV file
   - User selects document type (financial report, portfolio, tax document, etc.)
   - User selects processing options (extract text, tables, metadata, securities)

2. **Upload Document**:
   - Frontend validates file type and size
   - File is uploaded to the server
   - Server creates a document record in the database with status "pending"
   - Server returns document ID to the frontend

3. **Document Processing**:
   - Server adds document to processing queue
   - Server starts asynchronous processing
   - Document is stored in temporary storage
   - Processing status is updated in real-time

4. **Status Tracking**:
   - Frontend polls for processing status
   - Server returns current status, progress, and agent information
   - Frontend displays progress to the user

### 2. AI Agent Processing

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│             │     │             │     │             │     │             │
│  Document   │────▶│  Document   │────▶│  Table      │────▶│  Securities │
│  Analyzer   │     │  OCR        │     │  Extraction │     │  Extraction │
│             │     │             │     │             │     │             │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
      │                   │                   │                   │
      │                   │                   │                   │
      ▼                   ▼                   ▼                   ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│                         Financial Reasoner                              │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
                                   │
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│                         Structured Data Storage                         │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

**Sequential Steps:**

1. **Document Analyzer**:
   - Analyzes document structure
   - Identifies document type
   - Extracts metadata (title, author, date, etc.)
   - Determines if OCR is needed

2. **Document OCR** (if needed):
   - Performs OCR on scanned documents
   - Extracts text from images
   - Enhances text quality

3. **Table Extraction**:
   - Identifies tables in the document
   - Extracts table structure and data
   - Converts tables to structured format
   - Identifies table headers and data types

4. **Securities Extraction**:
   - Identifies securities mentioned in the document
   - Extracts security details (ISIN, name, quantity, price, value)
   - Validates security information
   - Enriches security data with additional information

5. **Financial Reasoner**:
   - Analyzes financial data
   - Calculates financial metrics
   - Identifies trends and patterns
   - Generates insights

6. **Structured Data Storage**:
   - Stores extracted data in structured format
   - Links data to document record
   - Indexes data for fast retrieval
   - Ensures data consistency

### 3. Database Schema

```
┌─────────────────────┐     ┌─────────────────────┐     ┌─────────────────────┐
│                     │     │                     │     │                     │
│  Users              │────▶│  Documents          │────▶│  DocumentContent    │
│                     │     │                     │     │                     │
└─────────────────────┘     └─────────────────────┘     └─────────────────────┘
                                     │                             │
                                     │                             │
                                     ▼                             ▼
┌─────────────────────┐     ┌─────────────────────┐     ┌─────────────────────┐
│                     │     │                     │     │                     │
│  ProcessingStatus   │◀───▶│  Securities         │◀───▶│  Tables             │
│                     │     │                     │     │                     │
└─────────────────────┘     └─────────────────────┘     └─────────────────────┘
        │                             │                             │
        │                             │                             │
        ▼                             ▼                             ▼
┌─────────────────────┐     ┌─────────────────────┐     ┌─────────────────────┐
│                     │     │                     │     │                     │
│  ChatHistory        │     │  Reports            │     │  ExportHistory      │
│                     │     │                     │     │                     │
└─────────────────────┘     └─────────────────────┘     └─────────────────────┘
```

**Tables and Relationships:**

1. **Users**:
   - UserID (PK)
   - Email
   - Name
   - CreatedAt
   - LastLogin

2. **Documents**:
   - DocumentID (PK)
   - UserID (FK)
   - FileName
   - FileType
   - FileSize
   - UploadDate
   - DocumentType
   - Processed (boolean)

3. **DocumentContent**:
   - ContentID (PK)
   - DocumentID (FK)
   - ExtractedText
   - Metadata (JSON)
   - PageCount

4. **ProcessingStatus**:
   - StatusID (PK)
   - DocumentID (FK)
   - Status (pending, processing, completed, failed)
   - Progress (0-100)
   - StartTime
   - EndTime
   - ProcessingTime
   - AgentStatus (JSON)
   - ErrorMessage

5. **Securities**:
   - SecurityID (PK)
   - DocumentID (FK)
   - ISIN
   - Name
   - Quantity
   - Price
   - Value
   - Currency
   - PercentOfAssets

6. **Tables**:
   - TableID (PK)
   - DocumentID (FK)
   - TableName
   - Headers (JSON)
   - Rows (JSON)
   - PageNumber

7. **ChatHistory**:
   - ChatID (PK)
   - UserID (FK)
   - DocumentID (FK)
   - Message
   - Response
   - Timestamp

8. **Reports**:
   - ReportID (PK)
   - UserID (FK)
   - DocumentID (FK)
   - ReportType
   - ReportContent (JSON)
   - GeneratedAt

9. **ExportHistory**:
   - ExportID (PK)
   - UserID (FK)
   - DocumentID (FK)
   - ExportType (CSV, Excel, PDF, JSON)
   - ExportDate
   - FileSize

### 4. Document Chat and Q&A

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│             │     │             │     │             │     │             │
│  User       │────▶│  Question   │────▶│  Context    │────▶│  AI         │
│  Question   │     │  Processing │     │  Retrieval  │     │  Response   │
│             │     │             │     │             │     │             │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
                                                                   │
                                                                   │
                                                                   ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│             │     │             │     │             │     │             │
│  Response   │◀───▶│  Chat       │◀───▶│  Follow-up  │◀───▶│  Knowledge  │
│  Formatting │     │  History    │     │  Questions  │     │  Base       │
│             │     │             │     │             │     │             │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
```

**Sequential Steps:**

1. **User Question**:
   - User selects a document
   - User types a question about the document
   - Question is sent to the server

2. **Question Processing**:
   - Server analyzes the question
   - Identifies question type (summary, specific data, analysis, etc.)
   - Determines required information to answer the question

3. **Context Retrieval**:
   - Server retrieves document content
   - Server retrieves extracted data (tables, securities, etc.)
   - Server retrieves chat history for context

4. **AI Response Generation**:
   - AI model generates response based on question and context
   - Response is formatted for display
   - Response is stored in chat history

5. **Response Formatting**:
   - Server formats response for display
   - Server adds formatting for tables, lists, etc.
   - Server adds links to related information

6. **Follow-up Questions**:
   - System suggests follow-up questions
   - System maintains context for conversation
   - System tracks user interests

### 5. Report Generation and Export

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│             │     │             │     │             │     │             │
│  User       │────▶│  Report     │────▶│  Data       │────▶│  Template   │
│  Request    │     │  Type       │     │  Collection │     │  Selection  │
│             │     │             │     │             │     │             │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
                                                                   │
                                                                   │
                                                                   ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│             │     │             │     │             │     │             │
│  Report     │◀───▶│  Format     │◀───▶│  Export     │◀───▶│  Download   │
│  Generation │     │  Conversion │     │  Options    │     │  or Share   │
│             │     │             │     │             │     │             │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
```

**Sequential Steps:**

1. **User Request**:
   - User requests a report or export
   - User selects document(s) to include
   - User specifies report parameters

2. **Report Type Selection**:
   - User selects report type (summary, detailed, custom)
   - User selects data to include (tables, securities, metrics)
   - User selects visualization options

3. **Data Collection**:
   - System retrieves required data
   - System aggregates data from multiple sources
   - System performs calculations

4. **Template Selection**:
   - System selects appropriate template
   - User customizes template (if applicable)
   - System applies branding and styling

5. **Report Generation**:
   - System generates report content
   - System creates visualizations
   - System formats report

6. **Format Conversion**:
   - System converts report to requested format (PDF, Excel, CSV, JSON)
   - System optimizes output for selected format
   - System validates output

7. **Export and Download**:
   - System makes report available for download
   - System stores report in user's history
   - System provides sharing options

## Example Use Cases

### Use Case 1: Portfolio Analysis

**User Request**: "What is the total value of my portfolio and the top 5 holdings?"

**Processing Steps**:

1. User uploads portfolio statement PDF
2. System processes document:
   - Document Analyzer identifies document as portfolio statement
   - Table Extraction extracts portfolio holdings table
   - Securities Extraction identifies securities and their values
   - Financial Reasoner calculates total value and percentages

3. User asks question in chat interface
4. System processes question:
   - Identifies request for total value and top holdings
   - Retrieves portfolio value from extracted data
   - Sorts securities by value to find top 5
   - Formats response with table of top holdings

5. System responds:
   ```
   The total value of your portfolio is $1,250,000.00.
   
   Top 5 holdings by value:
   1. Microsoft Corp.: $51,000 (4.5% of portfolio)
   2. Meta Platforms Inc.: $23,200 (2.1% of portfolio)
   3. Tesla Inc.: $18,750 (1.7% of portfolio)
   4. Apple Inc.: $18,000 (1.6% of portfolio)
   5. Amazon.com Inc.: $6,500 (0.6% of portfolio)
   ```

### Use Case 2: Financial Report Analysis

**User Request**: "Summarize the key financial metrics from this report"

**Processing Steps**:

1. User uploads financial report PDF
2. System processes document:
   - Document Analyzer identifies document as financial report
   - Table Extraction extracts financial tables
   - Financial Reasoner identifies key metrics

3. User asks question in chat interface
4. System processes question:
   - Identifies request for summary of key metrics
   - Retrieves revenue, profit, expenses, etc.
   - Calculates ratios and growth rates
   - Formats response with key metrics

5. System responds:
   ```
   Key Financial Metrics:
   
   Revenue: $10,500,000 (↑ 12% YoY)
   Operating Expenses: $7,200,000 (↑ 8% YoY)
   Net Profit: $3,300,000 (↑ 18% YoY)
   Profit Margin: 31.4% (↑ 1.6% YoY)
   
   Total Assets: $25,000,000
   Total Liabilities: $12,000,000
   Shareholders' Equity: $13,000,000
   
   Return on Equity (ROE): 25.4%
   Debt-to-Equity Ratio: 0.92
   ```

### Use Case 3: Custom Report Generation

**User Request**: "Generate a report of all securities with their ISINs and values"

**Processing Steps**:

1. User has already uploaded portfolio statement
2. User requests custom report
3. System processes request:
   - Identifies request for securities report
   - Retrieves securities data from database
   - Selects appropriate report template
   - Populates template with securities data

4. System generates report:
   - Creates table of securities
   - Adds visualization of asset allocation
   - Formats report as PDF

5. System provides download link:
   ```
   Report generated successfully. You can download it as:
   - PDF
   - Excel
   - CSV
   ```

## Integration with External Systems

### 1. Authentication and User Management

- Google Authentication for client login
- Role-based access control
- Multi-tenant data isolation

### 2. Data Storage

- Supabase database for structured data
- Row Level Security (RLS) policies for data isolation
- API key management in Google Cloud Secret Manager

### 3. Document Processing

- Google Cloud Storage for document storage
- Google Cloud Functions for serverless processing
- Google Cloud Run for API endpoints

### 4. AI and Machine Learning

- OpenRouter for access to Gemini models
- DeepSeek for specialized financial analysis
- Custom trained models for financial document understanding

## Security and Compliance

### 1. Data Isolation

- Multi-tenant architecture with strict data isolation
- Chinese walls between client data
- Row Level Security in database

### 2. API Key Management

- Centralized API key management
- Tenant-specific API keys
- Secure storage in Google Cloud Secret Manager

### 3. Authentication and Authorization

- Secure authentication with Google
- Fine-grained authorization controls
- Audit logging of all actions

## Conclusion

The FinDoc Analyzer system provides a comprehensive solution for financial document processing, analysis, and interaction. By leveraging AI agents and a structured data model, it enables users to extract valuable insights from their financial documents and interact with the data through a natural language interface.
