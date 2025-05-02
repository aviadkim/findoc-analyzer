# Google Agent Technologies Integration for FinDoc Analyzer

This directory contains the integration of Google's agent technologies (ADK, Agent Starter Pack, A2A) with the FinDoc Analyzer system.

## Overview

The integration provides advanced document processing, financial analysis, and natural language querying capabilities to the existing FinDoc Analyzer application. It uses Google's Agent Development Kit (ADK) to create specialized agents for different tasks, the Agent-to-Agent (A2A) protocol for multi-agent communication, and the Agent Starter Pack for deployment.

## Components

- **ADK Agents**: Specialized agents for document processing, financial analysis, and query handling
- **A2A Protocol**: Implementation of the Agent-to-Agent protocol for multi-agent communication
- **Agent Starter Pack**: Deployment infrastructure and observability components
- **Integration Layer**: Connects the Google Agent technologies with the existing FinDoc Analyzer

## Integration with FinDoc Analyzer

### Backend Integration

To integrate with the existing FinDoc Analyzer backend:

1. Import the integration module in your Flask application:

```python
from google_agents_integration.integration import register_routes

# Register routes with your Flask app
register_routes(app)
```

This will add the following endpoints to your application:

- `GET /api/rag/health`: Health check endpoint
- `POST /api/rag/document/upload`: Upload a document for processing
- `GET /api/rag/document/status/<document_id>`: Get document processing status
- `POST /api/rag/document/query`: Query a document with natural language
- `GET /api/rag/document/summary/<document_id>`: Get document summary
- `GET /api/rag/document/securities/<document_id>`: Get document securities
- `GET /api/rag/document/export/<document_id>`: Export document data to CSV
- `GET /api/rag/document/download/<filename>`: Download an exported file

### Frontend Integration

To integrate with the existing FinDoc Analyzer frontend:

1. Include the frontend integration script in your HTML:

```html
<script src="/static/js/google_agents_integration/frontend_integration.js"></script>
```

2. Import the React component in your frontend code:

```jsx
import FinDocRAGComponent from './google_agents_integration/FinDocRAGComponent';

// Use the component in your application
<FinDocRAGComponent apiBaseUrl="" />
```

## Architecture

The architecture follows a multi-agent approach:

1. **Document Processing Agent**: Extracts text, tables, and financial data from documents
2. **Financial Analysis Agent**: Analyzes financial data and provides insights
3. **Query Agent**: Handles natural language queries about financial documents
4. **Coordinator Agent**: Orchestrates the specialized agents

## Deployment

### Local Development

1. Install dependencies:

```bash
pip install -r requirements.txt
```

2. Set environment variables:

```bash
export GEMINI_API_KEY=your_gemini_api_key
export UPLOAD_FOLDER=./uploads
export TEMP_FOLDER=./temp
export RESULTS_FOLDER=./results
```

3. Run the application:

```bash
python app.py
```

### Docker Deployment

1. Build and run with Docker Compose:

```bash
docker-compose up --build
```

### Google Cloud Deployment

The system is designed to be deployed on Google Cloud using:

- **Cloud Run**: For scalable, serverless deployment
- **Agent Engine**: For managed agent deployment
- **Cloud Build**: For CI/CD pipelines

1. Deploy to Google Cloud Run:

```bash
cd deployment
./deploy_to_cloud_run.sh
```

Or use GitHub Actions for CI/CD by setting up the following secrets:

- `GCP_PROJECT_ID`: Your Google Cloud project ID
- `GCP_SA_KEY`: Your Google Cloud service account key (JSON)
- `GEMINI_API_KEY`: Your Gemini API key

## Configuration

Configuration options can be set through environment variables:

- `GEMINI_API_KEY`: API key for Google's Gemini model
- `UPLOAD_FOLDER`: Folder for uploaded documents
- `TEMP_FOLDER`: Folder for temporary files
- `RESULTS_FOLDER`: Folder for results and exports
- `PORT`: Port for the application (default: 5000)

## License

This project is proprietary and confidential.
