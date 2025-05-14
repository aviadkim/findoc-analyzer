# FinDoc Analyzer SaaS

A comprehensive financial document processing system designed to extract, analyze, and provide insights from financial documents with high accuracy. Delivered as a Software as a Service (SaaS) solution with secure API key management.

## About the Project

FinDoc Analyzer helps financial professionals and individuals extract meaningful information from various financial documents such as portfolio statements, investment reports, and financial summaries. The application uses advanced document processing techniques and specialized agents to analyze documents and provide valuable insights.

## Key Features

- **Automated Document Processing**: Extract data from various financial document formats (PDF, Excel, CSV)
- **Specialized Financial Agents**: Twelve specialized agents for different processing tasks
- **Interactive Analytics Dashboard**: Visualization of portfolio data with customizable views
- **Agent Pipeline System**: Configurable processing pipelines for document analysis
- **Document Comparison**: Compare multiple financial documents with side-by-side and diff views
- **Financial Recommendations**: Personalized investment advice based on portfolio analysis
- **Export Capabilities**: Export data in various formats (JSON, CSV, Excel, PDF, HTML)
- **Responsive UI**: Intuitive user interface that works on all screen sizes
- **Accessibility Features**: WCAG-compliant interface with various accessibility options
- **Secure API Key Management**: API keys are securely stored and managed in Google Secret Manager
- **Multi-Tenant Support**: Support for multiple tenants with isolated data and API keys
- **SaaS Deployment**: Easy deployment to Google Cloud Run for SaaS delivery

### New Enhanced Features (June 2024)

- **Interactive Drill-Down Visualizations**: Explore portfolio data at multiple levels with interactive charts
- **Comparative Document Analysis**: Advanced side-by-side comparison with change highlighting
- **Portfolio Performance Tracking**: Track portfolio performance over time with benchmarks
- **Advanced Security Extraction**: Enhanced ISIN, CUSIP, and SEDOL detection and validation
- **Table Comparison**: Identify changes in financial tables across documents
- **Multi-Document Analysis**: Analyze trends across multiple financial statements
- **Improved Error Handling**: Robust error handling with detailed error messages and recovery options
- **Enhanced UI**: Modern, responsive UI with improved user experience
- **Document Comparison Tool**: Compare multiple financial documents side-by-side
- **Export Functionality**: Export document data in various formats (CSV, Excel, PDF, JSON)
- **Local Authentication**: Simplified authentication for local development
- **Comprehensive Testing**: Automated testing for all features

## Quick Start

### Prerequisites

- Node.js (v16+)
- npm (v7+)
- For PDF processing: Python 3.8+ with PyMuPDF and Camelot-py

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/findoc-analyzer.git
   cd findoc-analyzer
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Install Python dependencies:
   ```bash
   pip install -r DevDocs/backend/requirements.txt
   ```

4. Start the development server:
   ```bash
   # Run the backend server
   node server.js

   # Or use the PowerShell script for both frontend and backend
   powershell -ExecutionPolicy Bypass -File .\run-findoc-with-rag.ps1
   ```

5. Open http://localhost:8080 in your browser.

### Using Docker

1. Build and run using Docker:
   ```bash
   docker-compose up
   ```

2. Open http://localhost:8080 in your browser.

## Running Tests

```bash
# Run all tests
node test-all-functionality.js

# Run specific test categories
node test-login.js             # Authentication tests
node test-upload-process.js    # Document upload and processing tests
node test-document-chat.js     # Document chat tests
node test-comparison.js        # Document comparison tests
node test-export.js            # Export functionality tests
node test-error-handling.js    # Error handling tests
```

### UI Validation Tests

```bash
# Run UI validation tests
node ui-validation.js

# Run UI validation tests on deployed application
$env:DEPLOYMENT_URL="https://your-deployed-app-url.com" node ui-validation.js
```

## Deployment

### Local Development Setup

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd findoc-analyzer
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file with required API keys:
   ```
   API_KEY_GEMINI=your_gemini_api_key
   API_KEY_OPENAI=your_openai_api_key
   API_KEY_OPENROUTER=your_openrouter_api_key
   API_KEY_ANTHROPIC=your_anthropic_api_key
   ```

4. Start the development server:
   ```bash
   npm start
   ```

5. Run local tests:
   ```bash
   chmod +x run-local-tests.sh
   ./run-local-tests.sh
   ```

### Google Cloud Deployment Options

#### Option 1: Google App Engine Deployment

1. Set up your Google Cloud environment:
   ```bash
   # Install Google Cloud SDK if not already installed
   # https://cloud.google.com/sdk/docs/install

   # Login to Google Cloud
   gcloud auth login

   # Set your project ID
   gcloud config set project findoc-deploy
   ```

2. Update API keys in Secret Manager (replace with your actual keys):
   ```bash
   echo "your_gemini_api_key" | gcloud secrets versions add gemini-api-key --data-file=-
   echo "your_openai_api_key" | gcloud secrets versions add openai-api-key --data-file=-
   echo "your_openrouter_api_key" | gcloud secrets versions add openrouter-api-key --data-file=-
   echo "your_anthropic_api_key" | gcloud secrets versions add anthropic-api-key --data-file=-
   ```

3. Deploy to Google App Engine using the provided script:
   ```bash
   # On Windows
   .\deploy-to-gae.ps1

   # On Linux/Mac
   chmod +x deploy-to-gae.sh
   ./deploy-to-gae.sh
   ```

4. Access your SaaS application:
   ```
   https://findoc-deploy.ey.r.appspot.com
   ```

#### Option 2: Google Cloud Run Deployment

1. Set up your Google Cloud environment:
   ```bash
   # Login to Google Cloud
   gcloud auth login

   # Set your project ID
   gcloud config set project findoc-deploy
   ```

2. Update API keys in Secret Manager (same as above)

3. Deploy to Google Cloud Run using the provided script:
   ```bash
   # On Windows
   .\deploy-to-cloud-run.ps1

   # On Linux/Mac
   chmod +x deploy-to-cloud-run.sh
   ./deploy-to-cloud-run.sh
   ```

4. Access your SaaS application:
   ```
   https://findoc-analyzer-[PROJECT-ID].a.run.app
   ```

#### Option 3: Automated CI/CD with GitHub Actions

1. Set up GitHub repository secrets:
   - `GCP_PROJECT_ID`: Your Google Cloud project ID
   - `GCP_SA_KEY`: Your Google Cloud service account key (JSON)
   - `GEMINI_API_KEY`: Your Gemini API key
   - `DEEPSEEK_API_KEY`: Your DeepSeek API key
   - `SUPABASE_KEY`: Your Supabase key
   - `SUPABASE_SERVICE_KEY`: Your Supabase service key

2. Push to GitHub to trigger deployment:
   ```bash
   git push origin main     # Deploys to staging
   git push origin develop  # Deploys to development
   ```

3. For production deployment, use the GitHub Actions workflow dispatch with environment set to "production"

### Docker Deployment

1. Build the Docker image:
   ```bash
   docker build -t findoc-analyzer:latest .
   ```

2. Run the Docker container:
   ```bash
   docker run -p 8080:8080 \
     -e API_KEY_GEMINI=your_gemini_api_key \
     -e API_KEY_OPENAI=your_openai_api_key \
     -e API_KEY_OPENROUTER=your_openrouter_api_key \
     -e API_KEY_ANTHROPIC=your_anthropic_api_key \
     findoc-analyzer:latest
   ```

## Project Structure

```
findoc-analyzer/
├── DevDocs/                  # Documentation and backend code
│   ├── backend/              # Backend server code
│   │   ├── agents/           # Financial processing agents
│   │   ├── routes/           # API routes
│   │   └── services/         # Service implementations
│   ├── frontend/             # Frontend UI code
│   │   ├── components/       # UI components
│   │   │   ├── charts/       # Visualization components
│   │   │   └── ...
│   │   ├── pages/            # Next.js pages
│   │   └── ...
│   └── docs/                 # Documentation files
├── FinDocRAG/                # Financial Document RAG implementation
├── public/                   # Static assets
├── services/                 # Service implementations
├── controllers/              # API controllers
├── routes/                   # API routes
├── middleware/               # Express middleware
├── tests/                    # Test suites
└── uploads/                  # Uploaded files directory
```

## Technologies Used

- **Frontend**: Next.js with React, Tailwind CSS for styling
- **Backend**: Flask API with Python for document processing, Node.js with Express for web server
- **Database**: Supabase (PostgreSQL) for data storage
- **Financial Analysis**: Python-based agents for document processing
- **Visualization**: Chart.js, React-ChartJS-2 for interactive visualizations
- **AI Integration**: Multiple AI models integrated:
  - OpenRouter API for financial analysis and RAG
  - Gemini API for enhanced document understanding
  - OpenAI API for financial reasoning
  - Anthropic Claude for advanced financial insights
- **OCR Processing**: Tesseract, Camelot, PDFPlumber, Unstructured
- **Testing**: Jest, Playwright for testing
- **Deployment**: Google Cloud Run
- **Security**: Google Secret Manager for API key management
- **API Management**: Custom API key provider with round-robin support

## Documentation

- [Project Summary](./DevDocs/PROJECT_SUMMARY.md)
- [Implementation Plan](./DevDocs/IMPLEMENTATION_PLAN.md)
- [Implementation Report](./DevDocs/IMPLEMENTATION_REPORT.md)
- [Enhanced Visualizations Guide](./DevDocs/docs/ENHANCED_VISUALIZATIONS_GUIDE.md)
- [API Documentation](./DevDocs/API_DOCUMENTATION.md)
- [User Guide](./DevDocs/USER_GUIDE.md)
- [Developer Guide](./DevDocs/DEVELOPER_GUIDE.md)

## Financial Agents (12 Total)

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

## API Key Management

FinDoc Analyzer uses a secure API key management system:

- In development: API keys are stored in environment variables (.env file)
- In production: API keys are securely stored in Google Secret Manager
- Multi-tenant support: Different API keys for different tenants

### Managing API Keys

API keys can be managed through the `/api/keys/` endpoints:

- `GET /api/keys/status/:service` - Check if API key exists for a service
- `POST /api/keys/:service` - Store API key for a service
- `DELETE /api/keys/:service` - Delete API key for a service

Example for storing an API key:

```bash
curl -X POST http://localhost:8080/api/keys/gemini \
  -H "Content-Type: application/json" \
  -d '{"apiKey": "your-api-key", "tenantId": "optional-tenant-id"}'
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

Distributed under the MIT License. See `LICENSE` for more information.

## Contact

Project Link: [https://github.com/aviadkim/backv2-main](https://github.com/aviadkim/backv2-main)

## Acknowledgements

- [Chart.js](https://www.chartjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Next.js](https://nextjs.org/)
- [PyMuPDF](https://pymupdf.readthedocs.io/)
- [Camelot-py](https://camelot-py.readthedocs.io/)
- [OpenRouter API](https://openrouter.ai/)
- [Tesseract OCR](https://github.com/tesseract-ocr/tesseract)
- [PDFPlumber](https://github.com/jsvine/pdfplumber)
- [Unstructured](https://unstructured.io/)
