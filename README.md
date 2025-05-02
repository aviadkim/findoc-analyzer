# FinDoc Analyzer - MAIN APPLICATION

## IMPORTANT: APPLICATION IDENTIFICATION

**The FinDoc Analyzer with the dark sidebar UI is the MAIN and DEFAULT application for this project.**

This README serves as the definitive guide for the FinDoc Analyzer application, clarifying its status as the main application and documenting the extensive development work completed over the past 30 weeks.

![FinDoc Analyzer UI](DevDocs/assets/findoc-analyzer-ui.png)

## RUNNING THE MAIN APPLICATION

```powershell
powershell -ExecutionPolicy Bypass -File .\run-findoc-fixed.ps1
```

This script:
1. Stops any existing Node.js and Python processes
2. Starts the backend server (Flask) from the `DevDocs/backend` directory
3. Starts the frontend server (Next.js) from the `DevDocs/frontend` directory
4. Opens the application in the browser at http://localhost:3002

## 30-WEEK DEVELOPMENT SUMMARY

Over the past 30 weeks, we have developed a comprehensive financial document analysis platform with the following components:

### Core Application
- **FinDoc Analyzer UI**: Dark sidebar interface with comprehensive navigation
- **Backend API**: Flask-based API for document processing and financial analysis
- **Frontend**: Next.js application with React components
- **Database**: Supabase PostgreSQL database for document and financial data storage

### Financial Agents (12 Total)
1. **DocumentPreprocessorAgent**: Prepares documents for analysis
2. **HebrewOCRAgent**: Optimized OCR for Hebrew financial documents
3. **FinancialTableDetectorAgent**: Identifies and extracts tables from financial documents
4. **FinancialDataAnalyzerAgent**: Analyzes financial data from documents
5. **DocumentIntegrationAgent**: Integrates data from multiple documents
6. **QueryEngineAgent**: Answers questions about financial documents
7. **ISINExtractorAgent**: Extracts ISIN codes from financial documents
8. **DocumentMergeAgent**: Merges data from multiple documents
9. **DataExportAgent**: Exports financial data in various formats
10. **DocumentComparisonAgent**: Compares multiple financial documents
11. **FinancialReportGeneratorAgent**: Generates financial reports
12. **PortfolioAnalysisAgent**: Analyzes investment portfolios

### Key Features
- **Document Upload and Storage**: Secure document management
- **OCR Processing**: Advanced OCR with Hebrew optimization
- **RAG Multimodal Processing**: AI-powered document understanding
- **Financial Data Analysis**: Securities identification and portfolio metrics
- **Query Engine**: Natural language questions about financial documents
- **Document Comparison**: Identify changes and trends across documents
- **Data Export**: Multiple export formats (Excel, CSV, PDF, JSON)
- **Financial Advisor**: AI-powered financial recommendations
- **Portfolio Analysis**: Comprehensive investment portfolio analysis
- **ISIN Processing**: Extraction and validation of ISIN codes

## Tech Stack

- **Frontend**: Next.js, React
- **Backend**: Flask, Python
- **Database**: Supabase (PostgreSQL)
- **AI**: OpenRouter API (Claude, GPT-4), RAG (Retrieval-Augmented Generation)
- **OCR**: Tesseract, Camelot, PDFPlumber, Unstructured
- **Deployment**: Google Cloud Run
- **CI/CD**: GitHub Actions

## DEVELOPMENT RULES

### 1. Application Identification
- **ALWAYS** refer to the FinDoc Analyzer with dark sidebar UI as the main application
- **ALL** development work must be focused on this application
- **NEVER** create alternative UIs or applications without explicit approval

### 2. Code Organization
- Backend code goes in `DevDocs/backend/`
- Frontend code goes in `DevDocs/frontend/`
- Agent implementations go in `DevDocs/backend/agents/`
- Tests go in `DevDocs/` with appropriate naming (e.g., `test_agent_name.py`)

### 3. UI Components
- The main UI is defined in `DevDocs/frontend/components/FinDocLayout.js`
- The sidebar navigation is defined in this component
- **NEVER** modify the core UI structure without approval
- New features should be added as pages or components within the existing structure

### 4. Agent Development
- All agents must follow the established pattern in `DevDocs/backend/agents/`
- Each agent must have a corresponding test file
- Agents must be integrated into the main application
- New agents must be added to the sidebar navigation

### 5. Testing
- All code must have corresponding tests
- Tests must verify 100% accuracy in financial document processing
- Tests must check all ISINs, holdings names, values, and quantities
- Run tests before pushing to GitHub

### 6. API Keys and Secrets
- **NEVER** commit API keys or secrets to GitHub
- Use GitHub secrets for CI/CD
- The OpenRouter API key should be stored in GitHub secrets
- Local development should use `.env.local` files (not committed to GitHub)

### 7. Deployment
- The application will be deployed to Google Cloud Run
- Deployment is configured in `cloudbuild.yaml`
- The main branch is the source for deployment
- The service account is `github@github-456508.iam.gserviceaccount.com`

## RECENT UPDATES

### UI Improvements
- **Fixed UI Implementation Issues**: Updated the deployment process to properly deploy React components
- **Enhanced Document Page**: Improved the Documents page with a modern, responsive design
- **Enhanced Analytics Page**: Improved the Analytics page with better visualizations
- **Added Feedback Page**: Created a dedicated page for user feedback
- **Added Document Comparison Page**: Created a page for comparing documents
- **Enhanced Upload Functionality**: Improved the document upload process with drag-and-drop support and progress tracking

### Testing Improvements
- **Comprehensive UI Tests**: Created a comprehensive test suite for all UI elements
- **Automated Testing**: Implemented Puppeteer tests for automated UI testing
- **Test Reports**: Generated detailed test reports with screenshots and statistics

### Documentation Improvements
- **Updated Documentation**: Created detailed documentation for the application
- **API Documentation**: Documented all API endpoints
- **Development Guide**: Created a guide for setting up the development environment

### Next Steps
1. **Enhance OCR Implementation**
   - Improve OCR accuracy for financial documents
   - Add support for more languages
   - Optimize OCR performance

2. **Expand RAG Processor**
   - Add support for more document types
   - Improve document understanding capabilities
   - Enhance query answering

3. **Add More Visualizations**
   - Implement interactive charts for portfolio analysis
   - Add data visualization for financial metrics
   - Create customizable dashboards

4. **Implement Multi-Tenant Features**
   - Add user authentication and authorization
   - Implement data isolation between tenants
   - Create tenant-specific settings

5. **Enhance Testing**
   - Expand test coverage for all components
   - Implement end-to-end testing
   - Create performance tests

## DEPLOYMENT

This project is configured for deployment on Google Cloud Run in the me-west1 (Tel Aviv) region:

```yaml
Project: github (ID: github-456508, Number: 683496987674)
Service Account: github@github-456508.iam.gserviceaccount.com (ID: 104645681997583496565)
Region: me-west1 (Tel Aviv)
Allows unauthenticated invocations
```

See [DevDocs/DEPLOYMENT.md](DevDocs/DEPLOYMENT.md) for detailed deployment instructions.

## SECURITY

### API Keys and Secrets

This project uses several API keys and secrets that should never be committed to the repository:

- **OpenRouter API Key**: `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`
- **Supabase Database**: `db.dnjnsotemnfrjlotgved.supabase.co:5432/postgres`
- **Google Cloud Service Account**: `github@github-456508.iam.gserviceaccount.com`

### Security Best Practices

1. **Environment Variables**: Store all secrets as environment variables in `.env.local`
2. **GitHub Secrets**: Use GitHub secrets for CI/CD pipelines
3. **Access Control**: Limit access to production environments
4. **Git Hygiene**: Never commit secrets to the repository

## CONTACT

For questions or support, please contact aviadkim@gmail.com.
