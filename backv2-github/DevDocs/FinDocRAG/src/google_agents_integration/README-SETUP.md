# FinDocRAG with Google Agent Technologies - Setup Guide

This guide provides comprehensive instructions for setting up and using the Google Agent technologies with FinDocRAG.

## Overview

The FinDocRAG system is enhanced with Google's agent technologies:

1. **ADK (Agent Development Kit)** - For building flexible, code-first agents
2. **Agent Starter Pack** - For deployment infrastructure and observability
3. **A2A Protocol** - For enabling communication between specialized agents

These technologies enable advanced document processing, financial analysis, and natural language querying capabilities.

## Prerequisites

- Python 3.10 or higher
- Node.js 16 or higher (for Memory MCP)
- Google Cloud account (for deployment)
- Gemini API key

## Quick Start

### Windows

1. Run the setup script:
   ```powershell
   .\setup.ps1
   ```

2. Update the `.env` file with your Gemini API key:
   ```
   GEMINI_API_KEY=your_gemini_api_key
   ```

3. Update `google-credentials.json` with your Google Cloud credentials (if using Google Cloud).

4. Start all components:
   ```powershell
   .\start-all.bat
   ```

5. Access the application at http://localhost:8080

### Linux/macOS

1. Run the setup script:
   ```bash
   chmod +x setup.sh
   ./setup.sh
   ```

2. Update the `.env` file with your Gemini API key:
   ```
   GEMINI_API_KEY=your_gemini_api_key
   ```

3. Update `google-credentials.json` with your Google Cloud credentials (if using Google Cloud).

4. Start all components:
   ```bash
   ./start-all.sh
   ```

5. Access the application at http://localhost:8080

## Detailed Setup

### 1. Environment Setup

The setup script creates the following:

- Python virtual environment (`venv`)
- Necessary directories (`uploads`, `temp`, `results`)
- Environment configuration (`.env`)
- Google Cloud credentials placeholder (`google-credentials.json`)
- Start scripts for various components

### 2. Google Cloud Setup (Optional)

If you want to use Google Cloud for deployment:

1. Create a Google Cloud project:
   ```bash
   gcloud projects create [PROJECT_ID]
   ```

2. Enable required APIs:
   ```bash
   gcloud services enable generativeai.googleapis.com
   gcloud services enable logging.googleapis.com
   gcloud services enable monitoring.googleapis.com
   gcloud services enable storage.googleapis.com
   gcloud services enable secretmanager.googleapis.com
   gcloud services enable run.googleapis.com
   gcloud services enable cloudbuild.googleapis.com
   ```

3. Create a service account:
   ```bash
   gcloud iam service-accounts create findoc-rag-sa
   ```

4. Grant permissions to the service account:
   ```bash
   gcloud projects add-iam-policy-binding [PROJECT_ID] \
       --member="serviceAccount:findoc-rag-sa@[PROJECT_ID].iam.gserviceaccount.com" \
       --role="roles/storage.admin"
   ```

5. Download the service account key:
   ```bash
   gcloud iam service-accounts keys create google-credentials.json \
       --iam-account=findoc-rag-sa@[PROJECT_ID].iam.gserviceaccount.com
   ```

### 3. Memory MCP Integration

The setup script configures integration with the Memory MCP:

1. It looks for the Memory MCP at the default location
2. Creates a start script for the Memory MCP
3. Configures the application to use the Memory MCP

If the Memory MCP is not found at the default location, you'll need to update the path in the start script.

### 4. Running Tests

To run the tests:

#### Windows
```powershell
.\run-tests.bat
```

#### Linux/macOS
```bash
./run-tests.sh
```

### 5. Docker Setup (Optional)

If you prefer to use Docker:

1. Build the Docker image:
   ```bash
   docker build -t findoc-rag -f docker/Dockerfile.dev .
   ```

2. Run the Docker container:
   ```bash
   docker run -p 8080:8080 -v $(pwd):/app -e GEMINI_API_KEY=your_gemini_api_key findoc-rag
   ```

## Architecture

The FinDocRAG system with Google Agent technologies follows a multi-agent architecture:

1. **Document Processing Agent**: Extracts text, tables, and financial data from documents
2. **Financial Analysis Agent**: Analyzes financial data and provides insights
3. **Query Agent**: Handles natural language queries about financial documents
4. **Coordinator Agent**: Orchestrates the specialized agents

## Integration with FinDoc Analyzer

To integrate with the existing FinDoc Analyzer:

1. Import the integration module in your Flask application:
   ```python
   from google_agents_integration.integration_with_findoc import integrate_with_findoc
   
   # Initialize your Flask app
   app = Flask(__name__)
   
   # Integrate with FinDoc Analyzer
   integrate_with_findoc(app)
   ```

2. Import the React components in your frontend:
   ```jsx
   import FinDocRAGComponent from './components/google_agents_integration/FinDocRAGComponent';
   
   // Use the component in your application
   <FinDocRAGComponent apiBaseUrl="" />
   ```

## Deployment

### Local Deployment

Follow the Quick Start guide above.

### Docker Deployment

1. Build and run with Docker Compose:
   ```bash
   docker-compose -f docker/docker-compose.dev.yml up -d --build
   ```

### Google Cloud Deployment

1. Deploy to Google Cloud Run:
   ```bash
   cd google_cloud
   ./deploy-to-cloud-run.sh
   ```

## Troubleshooting

### Common Issues

1. **Missing API Key**:
   - Ensure the `GEMINI_API_KEY` environment variable is set in the `.env` file.

2. **Permission Issues**:
   - Ensure the application has write permissions to the upload, temp, and results folders.

3. **Memory MCP Not Found**:
   - Update the path to the Memory MCP in the start script.

4. **Google Cloud Authentication Issues**:
   - Ensure the `google-credentials.json` file is properly configured.
   - Ensure the service account has the necessary permissions.

### Getting Help

If you encounter any issues, please check the logs for error messages and refer to the documentation for the specific component causing the issue.

## Additional Resources

- [Google ADK Documentation](https://cloud.google.com/vertex-ai/docs/generative-ai/agent-development-kit/overview)
- [Agent Starter Pack Documentation](https://github.com/google-gemini/agent-starter-pack)
- [A2A Protocol Documentation](https://github.com/google-gemini/a2a)
- [Gemini API Documentation](https://ai.google.dev/docs/gemini_api_overview)
- [Google Cloud Run Documentation](https://cloud.google.com/run/docs)

## License

This project is proprietary and confidential.
