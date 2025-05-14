# Batch Processing Guide for FinDoc Analyzer

This guide documents the batch processing functionality implemented in the FinDoc Analyzer application. It provides details on the architecture, API endpoints, and usage examples.

## Overview

The batch processing system allows for the efficient processing of multiple documents or securities in a single operation. This is especially useful for:

- Processing large sets of financial documents
- Extracting securities information from multiple documents
- Updating market data for multiple securities
- Generating aggregated reports

The implementation follows a job-based architecture where batch operations are tracked as jobs with detailed status information and results.

## Architecture

The batch processing system consists of several key components:

1. **Batch Processor Utility** (`utils/batch-processor.js`)
   - Core functionality for job creation, execution, and management
   - In-memory job storage with event-based tracking
   - Status tracking and reporting capabilities

2. **Batch Controller** (`controllers/batch-controller.js`)
   - API handlers for batch operations
   - Integration with document and securities services
   - Support for legacy endpoints

3. **Batch Routes** (`routes/batch-processing-routes.js`)
   - RESTful API endpoints for batch operations
   - Comprehensive set of endpoints for job management
   - Backward compatibility with legacy batch endpoints

4. **Test Suite** (`tests/batch-processing-test.js`)
   - Comprehensive tests for all batch processing functionality
   - Automated test reporting with HTML report generation

## API Endpoints

### Job Management Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/batch/jobs` | Create a new batch job |
| GET | `/api/batch/jobs` | Get all batch jobs |
| GET | `/api/batch/jobs/:jobId` | Get batch job status |
| GET | `/api/batch/jobs/:jobId/details` | Get detailed batch job information |
| GET | `/api/batch/jobs/:jobId/results` | Get batch job results |
| GET | `/api/batch/jobs/:jobId/errors` | Get batch job errors |
| POST | `/api/batch/jobs/:jobId/start` | Start a batch job |
| POST | `/api/batch/jobs/:jobId/cancel` | Cancel a batch job |
| GET | `/api/batch/history` | Get batch job history |
| POST | `/api/batch/cleanup` | Clean up old batch jobs |

### Document Processing Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/batch/documents/process` | Process multiple documents in batch |

### Securities Processing Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/batch/securities/extract` | Extract securities from multiple documents |
| POST | `/api/batch/securities/update` | Update multiple securities information |

### Legacy Endpoints (Backward Compatibility)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/batch/start` | Legacy endpoint to start batch processing |
| GET | `/api/batch/:id` | Legacy endpoint to get batch status |
| POST | `/api/batch/:id/cancel` | Legacy endpoint to cancel batch processing |

## Usage Examples

### Creating and Running a Batch Job

```javascript
// Step 1: Create a batch job
const createResponse = await fetch('/api/batch/jobs', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Process Monthly Statements',
    items: [
      { id: 'doc123', name: 'January Statement' },
      { id: 'doc124', name: 'February Statement' },
      { id: 'doc125', name: 'March Statement' }
    ]
  })
});

const { job } = await createResponse.json();
const jobId = job.id;

// Step 2: Start the job
await fetch(`/api/batch/jobs/${jobId}/start`, {
  method: 'POST'
});

// Step 3: Poll for job status
const pollInterval = setInterval(async () => {
  const statusResponse = await fetch(`/api/batch/jobs/${jobId}`);
  const { job } = await statusResponse.json();
  
  console.log(`Job status: ${job.status}, Progress: ${job.progress}%`);
  
  if (job.status === 'completed' || job.status === 'failed' || job.status === 'cancelled') {
    clearInterval(pollInterval);
    
    // Step 4: Get results if completed
    if (job.status === 'completed') {
      const resultsResponse = await fetch(`/api/batch/jobs/${jobId}/results`);
      const { results } = await resultsResponse.json();
      console.log('Job results:', results);
    }
  }
}, 2000);
```

### Batch Processing Documents

```javascript
const response = await fetch('/api/batch/documents/process', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    documents: [
      { id: 'doc1', name: 'Financial Statement 1' },
      { id: 'doc2', name: 'Financial Statement 2' },
      { id: 'doc3', name: 'Financial Statement 3' }
    ],
    options: {
      extractText: true,
      extractTables: true,
      extractSecurities: true
    }
  })
});

const { job } = await response.json();
console.log(`Batch processing started with job ID: ${job.id}`);
```

### Extracting Securities from Multiple Documents

```javascript
const response = await fetch('/api/batch/securities/extract', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    documents: [
      { id: 'doc1', name: 'Portfolio Statement 1' },
      { id: 'doc2', name: 'Portfolio Statement 2' }
    ],
    options: {
      includeMetadata: true,
      validateISINs: true
    }
  })
});

const { job } = await response.json();
console.log(`Securities extraction started with job ID: ${job.id}`);
```

### Updating Multiple Securities

```javascript
const response = await fetch('/api/batch/securities/update', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    securities: [
      { isin: 'US0378331005', name: 'Apple Inc.' },
      { isin: 'US5949181045', name: 'Microsoft Corporation' },
      { isin: 'US02079K1079', name: 'Alphabet Inc.' }
    ],
    options: {
      updatePricing: true,
      updateMetadata: true
    }
  })
});

const { job } = await response.json();
console.log(`Securities update started with job ID: ${job.id}`);
```

## Job States

Batch jobs can have the following states:

- `queued`: Job has been created but not yet started
- `processing`: Job is currently processing items
- `completed`: Job has successfully processed all items
- `failed`: Job has failed due to an error
- `cancelled`: Job was cancelled by the user

## Event System

The batch processor includes an event emitter that broadcasts events during job processing:

- `job:created` - Triggered when a new job is created
- `job:started` - Triggered when a job starts processing
- `job:completed` - Triggered when a job completes successfully
- `job:failed` - Triggered when a job fails
- `job:cancelled` - Triggered when a job is cancelled
- `item:processed` - Triggered when an individual item is processed
- `item:failed` - Triggered when an individual item fails processing

Applications can subscribe to these events to implement real-time monitoring and notifications.

## Batch Job Cleanup

To prevent memory leaks and ensure system performance, the batch processor includes a cleanup mechanism that can remove old completed, failed, or cancelled jobs after a specified time period.

```javascript
// Clean up jobs older than 24 hours
fetch('/api/batch/cleanup', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    maxAgeHours: 24,
    statuses: ['completed', 'failed', 'cancelled']
  })
});
```

## Running Tests

To test the batch processing functionality, run:

```bash
node run-batch-tests.js
```

This will execute a comprehensive test suite that validates all batch processing endpoints and functionality. Test results are saved in the `test-results` directory, including:

- JSON results file with detailed test information
- HTML report with visual representation of test results

## Future Enhancements

1. **Database Integration**: Replace in-memory storage with a database for job persistence
2. **Worker Processes**: Use worker processes for parallel processing of batch items
3. **Progress Streaming**: Implement WebSocket-based real-time progress updates
4. **Enhanced Reporting**: Add detailed analytics and reporting for batch jobs
5. **User Notifications**: Integrate with notification system to alert users when jobs complete

## Troubleshooting

Common issues and their solutions:

1. **Job Not Found**: Ensure you're using the correct job ID and that it hasn't been cleaned up
2. **Job Stuck in Processing**: Check for errors in individual items; cancel and restart if necessary
3. **High Memory Usage**: Adjust batch sizes and implement batch job cleanup on a schedule
4. **Slow Processing**: Consider using smaller batch sizes or increasing server resources

For any issues, check the server logs for detailed error information.