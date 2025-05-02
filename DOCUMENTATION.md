# FinDoc Analyzer Documentation

## Overview

FinDoc Analyzer is a SaaS application for financial document processing and analysis. It allows users to upload, process, and analyze financial documents such as PDFs, Excel files, and CSV files. The application uses advanced AI technologies to extract and understand financial data, enabling users to query their documents, build tables, and perform various financial analyses.

## Architecture

### Frontend

The frontend of FinDoc Analyzer is built using React.js. It provides a modern, responsive user interface for interacting with the application. The frontend is organized as follows:

- **Components**: Reusable UI components such as buttons, forms, and cards
- **Pages**: Complete page layouts for different sections of the application
- **Services**: API client services for communicating with the backend
- **Contexts**: React contexts for state management
- **Hooks**: Custom React hooks for shared functionality
- **Utils**: Utility functions for common tasks

### Backend

The backend of FinDoc Analyzer is built using Node.js with Express. It provides RESTful APIs for the frontend to interact with. The backend is organized as follows:

- **Routes**: API route definitions
- **Controllers**: Business logic for handling API requests
- **Models**: Data models for interacting with the database
- **Services**: Services for external API integrations
- **Utils**: Utility functions for common tasks

### Deployment

FinDoc Analyzer is deployed to Google App Engine. The deployment process is as follows:

1. Build the React application
2. Copy the build files to the server directory
3. Deploy the server to Google App Engine

## Pages

### Dashboard

The Dashboard page provides an overview of the user's documents, recent activity, and key metrics. It includes:

- Document count
- Processed document count
- Portfolio count
- Total value
- Recent activity
- Recent documents

### Documents

The Documents page allows users to view, search, and filter their uploaded documents. It includes:

- Document grid/list view
- Search functionality
- Filtering by type and status
- Document actions (view, download, delete)

### Analytics

The Analytics page provides visualizations and insights based on the user's financial data. It includes:

- Portfolio performance chart
- Asset allocation chart
- Financial metrics

### Feedback

The Feedback page allows users to provide feedback on the application. It includes:

- Feedback form with name, email, and message fields
- Feedback type selection
- Rating system

### Document Comparison

The Document Comparison page allows users to compare two documents to identify changes and differences. It includes:

- Document selection interface
- Document list with search functionality
- Comparison results area

### Upload

The Upload page allows users to upload documents to the application. It includes:

- Drag-and-drop file upload
- File browser
- Document type selection
- Processing options
- Upload progress tracking
- Upload history

## API Endpoints

### Document API

- `GET /api/documents`: Get all documents
- `GET /api/documents/:id`: Get a document by ID
- `POST /api/documents`: Upload a new document
- `DELETE /api/documents/:id`: Delete a document

### Analytics API

- `GET /api/analytics/portfolio`: Get portfolio analytics
- `GET /api/analytics/allocation`: Get asset allocation analytics

### Feedback API

- `POST /api/feedback`: Submit feedback

## Development

### Prerequisites

- Node.js 18 or higher
- npm 8 or higher

### Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Start the development server: `npm run dev`

### Building

1. Build the application: `npm run build`
2. The build files will be in the `frontend/.next` directory

### Deployment

1. Build the application: `npm run build`
2. Deploy to Google App Engine: `gcloud app deploy app.yaml`

## Testing

### Unit Tests

Run unit tests with: `npm test`

### UI Tests

Run UI tests with: `node comprehensive-ui-test.js`

The UI tests will generate a report in the `ui-test-results` directory.

## Troubleshooting

### Common Issues

#### Application not loading

- Check if the server is running
- Check if the API endpoints are accessible
- Check if the frontend is built correctly

#### Document upload failing

- Check if the file size is within limits
- Check if the file type is supported
- Check if the server has enough disk space

#### Analytics not showing

- Check if there are documents uploaded
- Check if the documents have been processed
- Check if the analytics API is returning data

## Contact

For support or questions, contact:

- Email: aviad@kimfo-fs.com
