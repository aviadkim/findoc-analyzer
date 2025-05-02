# FinDocRAG - Financial Document Processing SaaS

A scalable, flexible system for processing financial documents using RAG (Retrieval-Augmented Generation) and agent orchestration.

## Features

- **Document Processing Pipeline**: Extract text, tables, and financial data from PDFs and Excel files
- **Agent Orchestration**: Coordinate specialized agents for different document types
- **AI Service Proxy**: Centralized management of API keys with usage tracking
- **Flexible Reporting**: Generate custom CSV reports based on extracted data
- **Docker Ready**: Containerized for easy deployment to Google Cloud

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Client Application                      │
└───────────────────────────────┬─────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                        API Gateway                           │
└───────────────────────────────┬─────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                     Document Processor                       │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐    │
│  │ OCR Engine    │  │ Table Extractor│  │ ISIN Extractor│    │
│  └───────┬───────┘  └───────┬───────┘  └───────┬───────┘    │
│          │                  │                  │            │
│          └──────────────────┼──────────────────┘            │
│                             │                               │
└─────────────────────────────┼───────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      Agent Orchestrator                      │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐    │
│  │Portfolio Agent│  │Statement Agent│  │ Report Agent  │    │
│  └───────────────┘  └───────────────┘  └───────────────┘    │
└───────────────────────────────┬─────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                       AI Service Proxy                       │
│  (Manages API keys and routes requests to appropriate APIs)  │
└─────────────────────────────────────────────────────────────┘
```

## Getting Started

1. Clone the repository
2. Install dependencies: `pip install -r requirements.txt`
3. Set up environment variables (see `.env.example`)
4. Run the development server: `python app.py`

## Docker Deployment

```bash
# Build the Docker image
docker build -t findocrag .

# Run the container
docker run -p 5000:5000 findocrag
```

## Google Cloud Deployment

See the `deployment/` directory for Google Cloud deployment scripts and instructions.

## API Documentation

API documentation is available at `/api/docs` when the server is running.

## License

This project is proprietary and confidential.
