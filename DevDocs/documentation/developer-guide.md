# FinDoc Analyzer - Developer Guide

## Version 1.0 (July 3, 2025)

## Table of Contents

1. [Introduction](#introduction)
2. [Getting Started](#getting-started)
   - [Prerequisites](#prerequisites)
   - [Installation](#installation)
   - [Project Structure](#project-structure)
3. [Architecture Overview](#architecture-overview)
   - [Frontend Architecture](#frontend-architecture)
   - [Backend Architecture](#backend-architecture)
   - [Agent System](#agent-system)
   - [Database Design](#database-design)
4. [Development Environment](#development-environment)
   - [Development Workflow](#development-workflow)
   - [Code Style and Guidelines](#code-style-and-guidelines)
   - [Debugging](#debugging)
5. [Frontend Development](#frontend-development)
   - [Component Structure](#component-structure)
   - [State Management](#state-management)
   - [UI Component Library](#ui-component-library)
   - [Analytics Dashboard](#analytics-dashboard)
6. [Backend Development](#backend-development)
   - [API Endpoints](#api-endpoints)
   - [Authentication](#authentication)
   - [Error Handling](#error-handling)
   - [Logging](#logging)
7. [Agent Development](#agent-development)
   - [Agent Interface](#agent-interface)
   - [Creating a New Agent](#creating-a-new-agent)
   - [Testing Agents](#testing-agents)
   - [Agent Pipeline Integration](#agent-pipeline-integration)
8. [Testing](#testing)
   - [Unit Testing](#unit-testing)
   - [Integration Testing](#integration-testing)
   - [End-to-End Testing](#end-to-end-testing)
   - [Performance Testing](#performance-testing)
9. [Deployment](#deployment)
   - [Development Deployment](#development-deployment)
   - [Staging Deployment](#staging-deployment)
   - [Production Deployment](#production-deployment)
   - [CI/CD Pipeline](#cicd-pipeline)
10. [Security Considerations](#security-considerations)
11. [Troubleshooting](#troubleshooting)
12. [Contributing](#contributing)
13. [Appendix](#appendix)

## Introduction

The FinDoc Analyzer is a comprehensive financial document processing system designed to extract, analyze, and provide insights from financial documents with high accuracy. This developer guide provides detailed information for developers who want to understand, modify, or extend the system.

The application consists of:
- A Next.js-based frontend with React
- A Node.js-based backend with Express
- Python-based financial agents for document processing
- SQLite for local development and Supabase for production

## Getting Started

### Prerequisites

To develop for the FinDoc Analyzer, you need:

- Node.js (v16 or higher)
- Python 3.9+
- SQLite for local development
- Git

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/findoc-analyzer.git
   cd findoc-analyzer
   ```

2. Install Node.js dependencies:
   ```bash
   npm install
   ```

3. Install Python dependencies:
   ```bash
   cd backend/agents
   pip install -r requirements.txt
   cd ../..
   ```

4. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   Edit the `.env` file with your configuration values.

5. Initialize the development database:
   ```bash
   npm run init-db
   ```

6. Start the development server:
   ```bash
   npm run dev
   ```

The application should now be running at http://localhost:3000.

### Project Structure

```
findoc-analyzer/
├── .github/             # GitHub Actions workflows
├── .zap/                # ZAP security scan configurations
├── DevDocs/             # Development documentation
├── public/              # Static assets
├── src/                 # Source code
│   ├── components/      # React components
│   ├── contexts/        # React contexts
│   ├── hooks/           # Custom React hooks
│   ├── pages/           # Next.js pages
│   ├── styles/          # CSS styles
│   └── utils/           # Utility functions
├── backend/             # Backend code
│   ├── agents/          # Financial agents
│   │   ├── ISINExtractorAgent/
│   │   ├── FinancialTableDetectorAgent/
│   │   ├── FinancialDataAnalyzerAgent/
│   │   ├── DocumentMergeAgent/
│   │   ├── FinancialAdvisorAgent/
│   │   ├── DataExportAgent/
│   │   └── DocumentComparisonAgent/
│   ├── api/             # API routes
│   ├── config/          # Backend configuration
│   ├── controllers/     # API controllers
│   ├── middleware/      # Express middleware
│   ├── models/          # Data models
│   └── services/        # Business logic services
├── tests/               # Tests
│   ├── unit/            # Unit tests
│   ├── integration/     # Integration tests
│   ├── e2e/             # End-to-end tests
│   └── performance/     # Performance tests
└── package.json         # Project metadata and dependencies
```

## Architecture Overview

The FinDoc Analyzer follows a modern web application architecture with a clear separation of concerns.

### Frontend Architecture

The frontend uses Next.js, a React framework that provides server-side rendering, static site generation, and API routes. Key aspects include:

- **Component-Based Structure**: UI elements are organized as reusable React components
- **Context API**: Used for state management throughout the application
- **API Integration**: Communicates with the backend via RESTful API calls
- **Responsive Design**: Implemented with Tailwind CSS for all screen sizes

### Backend Architecture

The backend is built with Node.js and Express, providing a RESTful API for the frontend. Key aspects include:

- **MVC Pattern**: Controllers handle requests, services contain business logic, and models define data structures
- **Middleware**: For authentication, validation, error handling, and logging
- **Agent Integration**: Interfaces with Python-based financial agents
- **Database Access**: Abstracts database operations through a data access layer

### Agent System

The agent system is built in Python and includes specialized agents for various financial document processing tasks:

- **Agent Manager**: Orchestrates agent execution and manages workflow
- **Agent Pipeline**: Allows sequential execution of multiple agents
- **Agent Communication**: JSON-based communication protocol between agents and the backend

### Database Design

The application uses SQLite for development and Supabase (PostgreSQL) for production. The database schema includes:

- **Users**: User authentication and profile information
- **Documents**: Document metadata and storage references
- **ProcessingJobs**: Document processing job status and results
- **Securities**: Extracted financial securities information
- **Portfolios**: Portfolio data and analysis results

A detailed entity-relationship diagram is available in the [database-schema.md](./database-schema.md) file.

## Development Environment

### Development Workflow

1. Create a new branch for your feature or bugfix:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes and ensure all tests pass:
   ```bash
   npm run test
   ```

3. Commit your changes with a descriptive message:
   ```bash
   git commit -m "Add feature XYZ"
   ```

4. Push your branch to the remote repository:
   ```bash
   git push origin feature/your-feature-name
   ```

5. Create a pull request on GitHub for code review.

### Code Style and Guidelines

- JavaScript/TypeScript code follows ESLint rules defined in `.eslintrc.js`
- Python code follows PEP 8 style guidelines
- Use meaningful variable and function names
- Write clear comments for complex logic
- Include JSDoc or docstring documentation for all functions

### Debugging

#### Frontend Debugging

- Use React Developer Tools browser extension
- Use console.log or debugger statement for basic debugging
- For component-specific issues, use the React profiler

#### Backend Debugging

- Use Node.js inspector (`--inspect` flag)
- For API debugging, use tools like Postman or Insomnia
- Use winston logger for tracking application flow

#### Agent Debugging

- Use Python debugger (pdb) for step-by-step debugging
- Use pytest for testing specific agent functionality
- Check agent logs in the `logs/agents` directory

## Frontend Development

### Component Structure

The frontend follows a modular component structure:

- **Atoms**: Basic UI elements (buttons, inputs, etc.)
- **Molecules**: Combinations of atoms (form fields, card items, etc.)
- **Organisms**: Complex UI sections (navigation bars, document lists, etc.)
- **Templates**: Page layouts
- **Pages**: Complete pages with specific functionality

### State Management

The application uses React Context API for state management:

- **AuthContext**: Manages user authentication state
- **DocumentContext**: Manages document state
- **AgentContext**: Manages agent configuration and execution
- **PreferencesContext**: Manages user preferences

For complex state management needs, consider using React Query for server state and React Context for UI state.

### UI Component Library

The UI is built using a combination of:

- **Tailwind CSS**: For styling and responsive design
- **Custom Components**: For application-specific UI elements
- **React Icons**: For iconography

Documentation for available components can be found in the [UI Components Guide](./ui-components.md).

### Analytics Dashboard

The dashboard uses:

- **Recharts**: For data visualization components
- **React DnD**: For drag-and-drop dashboard customization
- **React Grid Layout**: For responsive grid-based layouts

For creating new visualizations, see the [Dashboard Development Guide](./dashboard-development.md).

## Backend Development

### API Endpoints

The API follows RESTful conventions with JSON responses:

- **Authentication**: `/api/auth/*`
- **Documents**: `/api/documents/*`
- **Agents**: `/api/agents/*`
- **Analytics**: `/api/analytics/*`

Detailed API documentation is available in the [API Reference](./api-reference.md).

### Authentication

The application uses JWT (JSON Web Tokens) for authentication:

- Token is issued on successful login
- Token must be included in the `Authorization` header as a Bearer token
- Tokens expire after 24 hours by default

For protected routes, use the `authenticateJWT` middleware.

### Error Handling

The backend uses a standardized error handling approach:

- Centralized error handling middleware
- HTTP status codes for different error types
- Structured error responses with `error`, `message`, and `details` fields

Example error handling:

```javascript
try {
  // Operation that might fail
} catch (error) {
  next(new AppError(error.message, 400));
}
```

### Logging

The backend uses winston for logging:

- **Error Level**: Errors and exceptions
- **Info Level**: Important application events
- **Debug Level**: Detailed debugging information

Logs are stored in the `logs` directory and also sent to the console during development.

## Agent Development

### Agent Interface

All agents must implement the standard Agent interface:

```python
class Agent:
    def __init__(self, config=None):
        self.config = config or {}
        
    def process(self, input_data):
        """
        Process the input data and return results
        
        Args:
            input_data: The input data for the agent to process
            
        Returns:
            dict: The processing results
        """
        raise NotImplementedError("Agent must implement process method")
```

### Creating a New Agent

To create a new agent:

1. Create a new directory in `backend/agents` with your agent name
2. Implement the Agent interface in `__init__.py`
3. Add any additional files needed for your agent
4. Create unit tests in `tests/unit/agents/test_your_agent.py`
5. Register your agent in the agent manager configuration

Example new agent:

```python
# backend/agents/YourNewAgent/__init__.py
class YourNewAgent:
    def __init__(self, config=None):
        self.config = config or {}
        
    def process(self, input_data):
        # Your processing logic here
        return {
            "status": "success",
            "results": {
                # Your results here
            }
        }
```

### Testing Agents

All agents should have comprehensive tests:

- **Unit Tests**: Test individual agent methods
- **Integration Tests**: Test agent interaction with other agents
- **System Tests**: Test the agent in the complete pipeline

Use pytest for agent testing:

```bash
cd backend/agents
pytest tests/test_your_agent.py -v
```

### Agent Pipeline Integration

Agents can be combined into a pipeline for sequential processing:

1. Configure the pipeline in the agent manager
2. Define input/output mapping between agents
3. Set up error handling and fallback strategies

Example pipeline configuration:

```javascript
const pipeline = [
  {
    agent: "ISINExtractorAgent",
    config: { validateISIN: true }
  },
  {
    agent: "FinancialTableDetectorAgent",
    config: { minConfidence: 0.8 }
  },
  {
    agent: "FinancialDataAnalyzerAgent",
    config: { includeRatios: true }
  }
];
```

## Testing

### Unit Testing

The application uses:

- **Jest**: For JavaScript/TypeScript unit tests
- **pytest**: For Python unit tests

Run unit tests with:

```bash
npm run test:unit
```

### Integration Testing

Integration tests verify the interaction between components:

- Backend services integration
- Agent integration
- Database integration

Run integration tests with:

```bash
npm run test:integration
```

### End-to-End Testing

End-to-end tests use Playwright to test complete user journeys:

- Document upload and processing
- User authentication
- Dashboard interaction

Run E2E tests with:

```bash
npm run test:e2e
```

### Performance Testing

Performance tests use k6 to verify application performance:

- Load testing
- Stress testing
- Endurance testing

Run performance tests with:

```bash
npm run test:performance
```

## Deployment

### Development Deployment

For local development:

```bash
npm run dev
```

### Staging Deployment

For staging deployment:

```bash
npm run build
npm run start
```

### Production Deployment

The application is deployed to Google Cloud Run for production:

1. Build Docker image:
   ```bash
   docker build -t findoc-analyzer .
   ```

2. Push to Container Registry:
   ```bash
   docker tag findoc-analyzer gcr.io/your-project/findoc-analyzer
   docker push gcr.io/your-project/findoc-analyzer
   ```

3. Deploy to Cloud Run:
   ```bash
   gcloud run deploy findoc-analyzer --image gcr.io/your-project/findoc-analyzer
   ```

### CI/CD Pipeline

The application uses GitHub Actions for CI/CD:

- **Pull Request**: Run linting and tests
- **Merge to develop**: Deploy to staging environment
- **Merge to main**: Deploy to production environment

The workflow is defined in `.github/workflows/ci-cd.yml`.

## Security Considerations

- **Authentication**: JWT with appropriate expiration and refresh strategy
- **Authorization**: Role-based access control for API endpoints
- **Data Encryption**: Sensitive data encrypted at rest
- **Input Validation**: All user inputs validated server-side
- **OWASP Top 10**: Protection against common web vulnerabilities
- **Dependency Security**: Regular scanning of dependencies for vulnerabilities

See [Security Best Practices](./security-best-practices.md) for detailed guidance.

## Troubleshooting

### Common Issues

- **Database Connection Errors**: Check database credentials in `.env`
- **Agent Execution Errors**: Check Python environment and dependencies
- **JWT Authentication Errors**: Check token expiration and secret
- **API Request Failures**: Check network status and API endpoint URLs

### Logging and Monitoring

- Check application logs in the `logs` directory
- Use monitoring dashboard in production
- Set up alerts for critical errors

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests
5. Submit a pull request

See [Contributing Guidelines](./contributing.md) for more details.

## Appendix

- [Database Schema](./database-schema.md)
- [API Reference](./api-reference.md)
- [UI Components Guide](./ui-components.md)
- [Agent Development Guide](./agent-development.md)
- [Dashboard Development Guide](./dashboard-development.md)
- [Security Best Practices](./security-best-practices.md)
- [Contributing Guidelines](./contributing.md)
