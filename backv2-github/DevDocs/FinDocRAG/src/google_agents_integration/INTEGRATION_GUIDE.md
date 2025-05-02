# FinDocRAG Integration Guide

This guide provides step-by-step instructions for integrating the Google Agent Technologies-powered FinDocRAG system with the existing FinDoc Analyzer application.

## Overview

The FinDocRAG system enhances the FinDoc Analyzer with advanced document processing, financial analysis, and natural language querying capabilities using Google's agent technologies:

1. **ADK (Agent Development Kit)** - For building flexible, code-first agents
2. **Agent Starter Pack** - For deployment infrastructure and observability
3. **A2A Protocol** - For enabling communication between specialized agents

## Prerequisites

- Python 3.10 or higher
- Node.js 16 or higher
- Google Cloud account (for deployment)
- Gemini API key

## Installation

1. **Install Python dependencies**:

```bash
cd backv2-github/DevDocs/FinDocRAG/src/google_agents_integration
pip install -r requirements.txt
```

2. **Set environment variables**:

```bash
export GEMINI_API_KEY=your_gemini_api_key
export UPLOAD_FOLDER=./uploads
export TEMP_FOLDER=./temp
export RESULTS_FOLDER=./results
```

## Backend Integration

1. **Import the integration module in your Flask application**:

```python
from google_agents_integration.integration_with_findoc import integrate_with_findoc

# Initialize your Flask app
app = Flask(__name__)

# Integrate with FinDoc Analyzer
integrate_with_findoc(app)
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
- `POST /api/rag/feedback/submit`: Submit user feedback
- `GET /api/rag/feedback/stats`: Get feedback statistics

## Frontend Integration

The integration script automatically copies the necessary React components to your frontend directory. You can import and use them in your React application:

### Main FinDocRAG Component

```jsx
import FinDocRAGComponent from './components/google_agents_integration/FinDocRAGComponent';

// Use the component in your application
<FinDocRAGComponent apiBaseUrl="" />
```

### Feedback Component

```jsx
import FeedbackComponent from './components/google_agents_integration/FeedbackComponent';

// Use the component in your application
<FeedbackComponent sessionId="your-session-id" apiBaseUrl="" />
```

### Feedback Dashboard

```jsx
import FeedbackDashboard from './components/google_agents_integration/FeedbackDashboard';

// Use the component in your application
<FeedbackDashboard apiBaseUrl="" />
```

## Testing

1. **Run the tests**:

```bash
cd backv2-github/DevDocs/FinDocRAG/src/google_agents_integration/tests
python run_tests.py
```

2. **Test the integration with the example script**:

```bash
cd backv2-github/DevDocs/FinDocRAG/src/google_agents_integration
python example_integration.py
```

## Deployment

### Local Development

1. **Run the application**:

```bash
cd backv2-github/DevDocs/FinDocRAG/src/google_agents_integration
python app.py
```

### Docker Deployment

1. **Build and run with Docker Compose**:

```bash
cd backv2-github/DevDocs/FinDocRAG/src/google_agents_integration
docker-compose up --build
```

### Google Cloud Deployment

1. **Deploy to Google Cloud Run**:

```bash
cd backv2-github/DevDocs/FinDocRAG/src/google_agents_integration/deployment
./deploy.sh
```

2. **Set up monitoring**:

```bash
cd backv2-github/DevDocs/FinDocRAG/src/google_agents_integration/monitoring
python setup_monitoring.py --project-id your-project-id --service-name findoc-rag
```

## Usage Examples

### Upload a Document

```javascript
// Example using fetch API
const formData = new FormData();
formData.append('file', file);

const response = await fetch('/api/rag/document/upload', {
  method: 'POST',
  body: formData
});

const result = await response.json();
const documentId = result.document_id;
```

### Query a Document

```javascript
// Example using fetch API
const response = await fetch('/api/rag/document/query', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    document_id: documentId,
    query: 'What is the total portfolio value?'
  })
});

const result = await response.json();
console.log(result.answer);
```

### Submit Feedback

```javascript
// Example using fetch API
const response = await fetch('/api/rag/feedback/submit', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    sessionId: 'user-session-id',
    feedbackType: 'query',
    rating: 5,
    comment: 'This was very helpful!',
    documentId: documentId,
    query: 'What is the total portfolio value?',
    answer: 'The total portfolio value is 30,000 USD.'
  })
});

const result = await response.json();
console.log(result.feedbackId);
```

## Troubleshooting

### Common Issues

1. **Missing API Key**:
   - Ensure the `GEMINI_API_KEY` environment variable is set.

2. **Permission Issues**:
   - Ensure the application has write permissions to the upload, temp, and results folders.

3. **Integration Issues**:
   - Check the logs for error messages.
   - Ensure all dependencies are installed.

### Getting Help

If you encounter any issues, please contact the FinDocRAG team for assistance.

## Next Steps

1. **Customize the components** to match your application's design.
2. **Add additional agents** for specialized tasks.
3. **Extend the feedback system** to collect more detailed feedback.
4. **Set up continuous integration** for automated testing and deployment.

## License

This project is proprietary and confidential.
