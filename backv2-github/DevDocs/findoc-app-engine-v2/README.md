# FinDoc Analyzer

FinDoc Analyzer is a SaaS application for financial document processing and analysis. It uses advanced AI techniques to extract, analyze, and provide insights from financial documents.

## Features

- **Document Processing**: Upload and process financial documents (PDF, Excel, etc.)
- **Securities Extraction**: Automatically extract securities information from financial documents
- **Portfolio Analysis**: Analyze portfolios, generate insights, and provide recommendations
- **Document Comparison**: Compare multiple financial documents to identify differences
- **Chat Interface**: Ask questions about processed documents using natural language
- **Multi-tenant Architecture**: Secure data isolation between clients

## Technology Stack

- **Backend**: Node.js, Express
- **Frontend**: HTML, CSS, JavaScript
- **Database**: Supabase (PostgreSQL)
- **AI/ML**: Google Gemini API
- **Deployment**: Google App Engine, Docker
- **CI/CD**: GitHub Actions

## Getting Started

### Prerequisites

- Node.js 18 or higher
- Python 3.8 or higher (for PDF processing)
- Supabase account
- Google Gemini API key

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/findoc-analyzer.git
   cd findoc-analyzer
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up environment variables:
   ```
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. Initialize the database:
   ```
   npm run init-db
   ```

5. Start the development server:
   ```
   npm run dev
   ```

6. Open your browser and navigate to `http://localhost:3000`

### Running with PowerShell

For Windows users, you can use the provided PowerShell script:

```
.\run-app.ps1
```

### Testing

The application includes comprehensive testing:

1. Run unit tests:
   ```
   npm test
   ```

2. Run PDF processing tests:
   ```
   npm run test:pdf
   ```

3. Generate test report:
   ```
   npm run generate-report
   ```

4. Run all tests:
   ```
   npm run test:all
   ```

You can also use the test interface at `/test-pdf-processing.html` to test PDF processing functionality.

## Database Schema

The application uses Supabase (PostgreSQL) with the following tables:

- **users**: User accounts and authentication
- **documents**: Uploaded and processed documents
- **api_keys**: API keys for external services
- **portfolios**: Portfolio data and analysis
- **comparisons**: Document comparison results
- **chat_history**: Chat messages and history

## API Endpoints

The application provides the following API endpoints:

- **Authentication**: `/api/auth/*`
- **Documents**: `/api/documents/*`
- **API Keys**: `/api/api-keys/*`
- **Portfolio**: `/api/portfolio/*`
- **Comparisons**: `/api/comparisons/*`
- **Chat**: `/api/chat/*`
- **Gemini**: `/api/gemini/*`
- **Health**: `/api/health/*`
- **Mock PDF Processing**: `/api/mock/*` (for testing)

## Deployment

### Google App Engine

1. Set up Google Cloud SDK
2. Configure app.yaml with your settings
3. Deploy:
   ```
   gcloud app deploy app.yaml
   ```

### Docker

1. Build the Docker image:
   ```
   docker build -t findoc-analyzer .
   ```

2. Run the container:
   ```
   docker run -p 3000:3000 findoc-analyzer
   ```

## CI/CD

The application uses GitHub Actions for continuous integration and deployment:

1. On push to the `main` branch, the workflow runs tests
2. If tests pass, the application is deployed to Google App Engine
3. A post-deployment verification is performed to ensure the application is running correctly

The workflow is defined in `.github/workflows/deploy-to-gae.yml`.

## License

This project is proprietary and confidential. Unauthorized copying, distribution, or use is strictly prohibited.

## Contact

For questions or support, please contact [aviad@kimfo-fs.com](mailto:aviad@kimfo-fs.com).
