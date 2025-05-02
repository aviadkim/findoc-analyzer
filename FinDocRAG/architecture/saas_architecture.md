# FinDoc Analyzer SaaS Architecture

## Agent as a Service (AaaS) Architecture with Centralized API Key Management and Client Data Isolation

This document outlines the architecture for the FinDoc Analyzer SaaS platform, which provides financial document processing capabilities as a service with centralized API key management and strict data isolation between clients.

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                     FinDoc Analyzer SaaS Platform                                │
│                                                                                                 │
│  ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐   │
│  │                 │     │                 │     │                 │     │                 │   │
│  │  Client A UI    │     │  Client B UI    │     │  Client C UI    │     │  Admin Portal   │   │
│  │                 │     │                 │     │                 │     │                 │   │
│  └────────┬────────┘     └────────┬────────┘     └────────┬────────┘     └────────┬────────┘   │
│           │                       │                       │                       │            │
│           │                       │                       │                       │            │
│           ▼                       ▼                       ▼                       ▼            │
│  ┌─────────────────────────────────────────────────────────────────────────────────────────┐   │
│  │                                                                                         │   │
│  │                                   API Gateway / Load Balancer                           │   │
│  │                                                                                         │   │
│  └───────────────────────────────────────┬─────────────────────────────────────────────────┘   │
│                                          │                                                     │
│                                          │                                                     │
│                                          ▼                                                     │
│  ┌─────────────────────────────────────────────────────────────────────────────────────────┐   │
│  │                                                                                         │   │
│  │                              Authentication & Authorization                             │   │
│  │                                                                                         │   │
│  └───────────────────────────────────────┬─────────────────────────────────────────────────┘   │
│                                          │                                                     │
│                                          │                                                     │
│                                          ▼                                                     │
│  ┌─────────────────────────────────────────────────────────────────────────────────────────┐   │
│  │                                                                                         │   │
│  │                                  API Key Management                                     │   │
│  │                                                                                         │   │
│  └───────────────────────────────────────┬─────────────────────────────────────────────────┘   │
│                                          │                                                     │
│                                          │                                                     │
│                                          ▼                                                     │
│  ┌─────────────────────────────────────────────────────────────────────────────────────────┐   │
│  │                                                                                         │   │
│  │                                 Multi-Tenant Router                                     │   │
│  │                                                                                         │   │
│  └───┬───────────────────┬───────────────────┬───────────────────┬───────────────────┬─────┘   │
│      │                   │                   │                   │                   │         │
│      │                   │                   │                   │                   │         │
│      ▼                   ▼                   ▼                   ▼                   ▼         │
│  ┌─────────┐       ┌─────────┐       ┌─────────────┐     ┌─────────────┐     ┌─────────────┐  │
│  │         │       │         │       │             │     │             │     │             │  │
│  │ Client A│       │ Client B│       │ Client C    │     │ Document    │     │ Agent       │  │
│  │ Service │       │ Service │       │ Service     │     │ Processor   │     │ Orchestrator│  │
│  │         │       │         │       │             │     │             │     │             │  │
│  └────┬────┘       └────┬────┘       └──────┬──────┘     └──────┬──────┘     └──────┬──────┘  │
│       │                 │                   │                   │                   │         │
│       │                 │                   │                   │                   │         │
│       ▼                 ▼                   ▼                   ▼                   ▼         │
│  ┌─────────┐       ┌─────────┐       ┌─────────────┐     ┌─────────────────────────────────┐  │
│  │         │       │         │       │             │     │                                 │  │
│  │ Client A│       │ Client B│       │ Client C    │     │        Agent System            │  │
│  │ Database│       │ Database│       │ Database    │     │                                 │  │
│  │         │       │         │       │             │     │  ┌─────────┐    ┌─────────┐    │  │
│  └─────────┘       └─────────┘       └─────────────┘     │  │Document │    │ Table   │    │  │
│                                                          │  │Analyzer │    │Understand│    │  │
│                                                          │  └─────────┘    └─────────┘    │  │
│                                                          │                                 │  │
│                                                          │  ┌─────────┐    ┌─────────┐    │  │
│                                                          │  │Securities│    │Financial│    │  │
│                                                          │  │Extractor│    │Reasoner │    │  │
│                                                          │  └─────────┘    └─────────┘    │  │
│                                                          └─────────────────────────────────┘  │
│                                                                                               │
│                                                                                               │
│  ┌─────────────────────────────────────────────────────────────────────────────────────────┐  │
│  │                                                                                         │  │
│  │                             Centralized API Key Storage                                 │  │
│  │                                                                                         │  │
│  │     ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐                │  │
│  │     │                 │     │                 │     │                 │                │  │
│  │     │  Gemini API Key │     │  OpenAI API Key │     │  Other API Keys │                │  │
│  │     │                 │     │                 │     │                 │                │  │
│  │     └─────────────────┘     └─────────────────┘     └─────────────────┘                │  │
│  │                                                                                         │  │
│  └─────────────────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                               │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

## Key Components

### 1. Client-Facing Components

- **Client UIs**: Web interfaces for different clients to access the platform
- **Admin Portal**: Interface for system administrators to manage the platform, clients, and API keys
- **API Gateway / Load Balancer**: Entry point for all client requests, handles routing and load balancing

### 2. Authentication and Authorization

- **Authentication Service**: Verifies user identity and issues tokens
- **Authorization Service**: Controls access to resources based on user roles and permissions
- **Multi-Tenant Router**: Routes requests to the appropriate client service based on tenant ID

### 3. API Key Management

- **Centralized API Key Storage**: Securely stores all external API keys (Gemini, OpenAI, etc.)
- **API Key Rotation Service**: Automatically rotates API keys for security
- **Usage Monitoring**: Tracks API key usage for billing and quota management

### 4. Client Data Isolation (Chinese Walls)

- **Separate Client Services**: Each client has a dedicated service instance
- **Isolated Databases**: Each client's data is stored in a separate database or schema
- **Data Access Controls**: Strict controls prevent cross-client data access

### 5. Document Processing Pipeline

- **Document Processor**: Handles document upload, parsing, and initial processing
- **Agent Orchestrator**: Coordinates the multi-agent system for document analysis
- **Agent System**: Collection of specialized agents for document analysis
  - Document Analyzer Agent
  - Table Understanding Agent
  - Securities Extractor Agent
  - Financial Reasoner Agent

## Data Flow

1. Client authenticates through the UI and receives an authentication token
2. Client uploads a financial document through the UI
3. Request passes through API Gateway, Authentication, and Multi-Tenant Router
4. Document is processed by the Document Processor
5. Agent Orchestrator coordinates the analysis using the Agent System
6. System uses centrally managed API keys for external AI services (Gemini, OpenAI)
7. Results are stored in the client's isolated database
8. Client can query and visualize the results through the UI

## Security Features

1. **API Key Isolation**: Clients never see or handle external API keys
2. **Data Isolation**: Strict separation between client data (Chinese Walls)
3. **Access Controls**: Role-based access control for all resources
4. **Audit Logging**: Comprehensive logging of all system activities
5. **Encryption**: Data encryption at rest and in transit

## Scaling and Deployment

1. **Containerization**: All components are containerized using Docker
2. **Kubernetes Orchestration**: Deployed on Kubernetes for scalability and reliability
3. **Cloud Deployment**: Hosted on Google Cloud Platform
4. **Auto-scaling**: Components scale based on demand
5. **High Availability**: Redundant components for fault tolerance

## Benefits of This Architecture

1. **Centralized API Key Management**: Clients don't need to manage their own API keys
2. **Strong Data Isolation**: Ensures client data privacy and compliance
3. **Scalability**: System can handle many clients with varying workloads
4. **Flexibility**: Clients can use their own API keys if desired
5. **Cost Efficiency**: Shared infrastructure reduces costs
6. **Security**: Comprehensive security controls protect client data and API keys
