# FinDocRAG Implementation Guide with Google Agent Technologies

This guide provides comprehensive instructions for implementing the Google Agent technologies with FinDocRAG and integrating it with the existing FinDoc Analyzer application.

## Overview

The FinDocRAG system is enhanced with Google's agent technologies:

1. **ADK (Agent Development Kit)** - For building flexible, code-first agents
2. **Agent Starter Pack** - For deployment infrastructure and observability
3. **A2A Protocol** - For enabling communication between specialized agents

These technologies enable advanced document processing, financial analysis, and natural language querying capabilities.

## Prerequisites

- Python 3.8 or higher
- Node.js 16 or higher
- Docker (for containerized deployment)
- Google Cloud account (for cloud deployment)
- Gemini API key (centralized for all clients)

## Implementation Steps

### 1. Local Development Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/aviadkim/backv2.git
   cd backv2
   ```

2. **Set up the development environment**:
   ```bash
   cd backv2-github/DevDocs/FinDocRAG/src/google_agents_integration
   pip install -r requirements.txt
   ```

3. **Configure environment variables**:
   - Create a `.env` file with the following content:
   ```
   GEMINI_API_KEY=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
   UPLOAD_FOLDER=./uploads
   TEMP_FOLDER=./temp
   RESULTS_FOLDER=./results
   ```

### 2. Implement the Specialized Agents

1. **Document Processing Agent**:
   - Create `agents/document_processor_agent.py`
   - Implement ISIN extraction with regex patterns
   - Implement security details extraction
   - Implement table extraction and processing

2. **Financial Analysis Agent**:
   - Create `agents/financial_analyst_agent.py`
   - Implement portfolio composition analysis
   - Implement diversification score calculation
   - Implement risk profile determination
   - Implement recommendation generation

3. **Query Agent**:
   - Create `agents/query_agent.py`
   - Implement natural language query processing
   - Implement context-aware response generation
   - Implement financial data retrieval

4. **Coordinator Agent**:
   - Create `agents/coordinator_agent.py`
   - Implement agent orchestration
   - Implement request routing
   - Implement result aggregation

### 3. Implement A2A Protocol Integration

1. **Define Agent Cards**:
   - Create `a2a/agent_cards.py`
   - Define capabilities for each specialized agent
   - Define endpoints for each specialized agent

2. **Implement Message Passing**:
   - Create `a2a/message_handler.py`
   - Implement message serialization/deserialization
   - Implement message routing

### 4. Integrate with FinDoc Analyzer

1. **Backend Integration**:
   - Create `integration/backend_integration.py`
   - Implement Flask routes for document processing
   - Implement Flask routes for querying
   - Implement Flask routes for feedback collection

2. **Frontend Integration**:
   - Create `integration/frontend_integration.js`
   - Implement React components for document upload
   - Implement React components for query interface
   - Implement React components for result visualization

### 5. Implement SaaS Key Management

1. **Centralized API Key Management**:
   - Create `key_management/key_manager.py`
   - Implement secure key storage
   - Implement key rotation
   - Implement usage tracking

2. **Client Authentication**:
   - Create `key_management/client_auth.py`
   - Implement client authentication
   - Implement request validation
   - Implement rate limiting

### 6. Testing

1. **Unit Tests**:
   - Create `tests/test_document_processor.py`
   - Create `tests/test_financial_analyst.py`
   - Create `tests/test_query_agent.py`
   - Create `tests/test_coordinator.py`

2. **Integration Tests**:
   - Create `tests/test_integration.py`
   - Test end-to-end document processing
   - Test end-to-end querying
   - Test integration with FinDoc Analyzer

### 7. Deployment

1. **Docker Deployment**:
   - Create `Dockerfile` and `docker-compose.yml`
   - Build and run the Docker container
   - Test the containerized application

2. **Google Cloud Deployment**:
   - Create `deploy/cloud_run.sh`
   - Deploy to Google Cloud Run
   - Configure environment variables in Google Cloud
   - Set up monitoring and logging

## Running the Application

### Local Development

1. **Start the FinDoc Analyzer**:
   ```bash
   cd backv2-main
   powershell -ExecutionPolicy Bypass -File .\run-findoc-simple.ps1
   ```

2. **Access the application**:
   - Open http://localhost:3002 in your browser
   - Use the dark sidebar UI to navigate to the FinDocRAG features

### Docker Deployment

1. **Build and run the Docker container**:
   ```bash
   cd backv2-github/DevDocs/FinDocRAG
   docker-compose up -d
   ```

2. **Access the application**:
   - Open http://localhost:8080 in your browser

### Google Cloud Deployment

1. **Deploy to Google Cloud Run**:
   ```bash
   cd backv2-github/DevDocs/FinDocRAG/deploy
   ./cloud_run.sh
   ```

2. **Access the application**:
   - Open the provided Google Cloud Run URL in your browser

## Troubleshooting

### Common Issues

1. **ChakraProvider Error**:
   - If you encounter `Cannot read properties of undefined (reading '_config')` error, fix it by completely removing the ChakraProvider component from `_app.js`.

2. **Missing Dependencies**:
   - If you encounter missing dependencies, run `pip install -r requirements.txt` to install all required packages.

3. **API Key Issues**:
   - If you encounter API key issues, check that the `GEMINI_API_KEY` environment variable is set correctly.

4. **Docker Issues**:
   - If you encounter Docker issues, check that Docker is running and that the ports are not in use.

## Additional Resources

- [Google ADK Documentation](https://cloud.google.com/vertex-ai/docs/generative-ai/agent-development-kit/overview)
- [Agent Starter Pack Documentation](https://github.com/google-gemini/agent-starter-pack)
- [A2A Protocol Documentation](https://github.com/google-gemini/a2a)
- [Gemini API Documentation](https://ai.google.dev/docs/gemini_api_overview)
- [Google Cloud Run Documentation](https://cloud.google.com/run/docs)
