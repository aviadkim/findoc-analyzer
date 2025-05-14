/**
 * Batch Processing API Tests
 * 
 * This test suite validates the functionality of the Batch Processing API.
 * It ensures that batch jobs can be created, started, monitored, and completed successfully.
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Test configuration
const config = {
  baseUrl: process.env.API_BASE_URL || 'http://localhost:8080',
  timeout: 5000, // 5 seconds
  testDocuments: [
    { id: 'doc-test-1', name: 'Test Document 1' },
    { id: 'doc-test-2', name: 'Test Document 2' },
    { id: 'doc-test-3', name: 'Test Document 3' }
  ],
  testSecurities: [
    { isin: 'US0378331005', name: 'Apple Inc.' },
    { isin: 'US5949181045', name: 'Microsoft Corporation' },
    { isin: 'US02079K1079', name: 'Alphabet Inc.' }
  ]
};

// Create HTTP client with default configuration
const client = axios.create({
  baseURL: config.baseUrl,
  timeout: config.timeout,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Test results storage
const testResults = {
  startTime: new Date(),
  endTime: null,
  totalTests: 0,
  passedTests: 0,
  failedTests: 0,
  skippedTests: 0,
  tests: []
};

// Helper function to record test results
function recordTestResult(testName, status, message, error = null, details = null) {
  const result = {
    name: testName,
    status, // 'passed', 'failed', 'skipped'
    message,
    timestamp: new Date()
  };

  if (error) {
    result.error = typeof error === 'object' ? 
      {
        message: error.message,
        stack: error.stack,
        response: error.response ? {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data
        } : null
      } : 
      error;
  }

  if (details) {
    result.details = details;
  }

  testResults.tests.push(result);
  testResults.totalTests++;

  if (status === 'passed') {
    testResults.passedTests++;
    console.log(`✅ PASSED: ${testName}`);
  } else if (status === 'failed') {
    testResults.failedTests++;
    console.error(`❌ FAILED: ${testName}`);
    if (error) {
      if (error.response) {
        console.error(`  Status: ${error.response.status}`);
        console.error(`  Response: ${JSON.stringify(error.response.data, null, 2)}`);
      } else {
        console.error(`  Error: ${error.message}`);
      }
    }
  } else {
    testResults.skippedTests++;
    console.warn(`⚠️ SKIPPED: ${testName}`);
  }

  return result;
}

// Helper function to save test results
function saveTestResults() {
  testResults.endTime = new Date();
  testResults.duration = (testResults.endTime - testResults.startTime) / 1000; // in seconds

  const resultsDir = path.join(__dirname, '..', 'test-results');
  fs.mkdirSync(resultsDir, { recursive: true });

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const jsonFilePath = path.join(resultsDir, `batch-processing-test-results-${timestamp}.json`);
  const htmlFilePath = path.join(resultsDir, `batch-processing-test-report-${timestamp}.html`);

  // Save JSON results
  fs.writeFileSync(jsonFilePath, JSON.stringify(testResults, null, 2));
  console.log(`\nTest results saved to ${jsonFilePath}`);

  // Generate HTML report
  const htmlReport = generateHtmlReport(testResults);
  fs.writeFileSync(htmlFilePath, htmlReport);
  console.log(`Test report saved to ${htmlFilePath}`);

  return {
    jsonFilePath,
    htmlFilePath
  };
}

// Helper function to generate HTML report
function generateHtmlReport(results) {
  const passRate = results.totalTests > 0 ? 
    Math.round((results.passedTests / results.totalTests) * 100) : 0;

  const statusBadgeClass = passRate >= 90 ? 'success' : 
                           passRate >= 70 ? 'warning' : 'danger';

  const testsHtml = results.tests.map(test => {
    const statusClass = test.status === 'passed' ? 'success' : 
                       test.status === 'failed' ? 'danger' : 'warning';
    
    const statusIcon = test.status === 'passed' ? '✅' : 
                      test.status === 'failed' ? '❌' : '⚠️';
    
    let errorHtml = '';
    if (test.error) {
      errorHtml = `
        <div class="error-details">
          <h5>Error Details</h5>
          <div class="code-block">${test.error.message || JSON.stringify(test.error)}</div>
          ${test.error.response ? `
            <h6>Response</h6>
            <div class="code-block">
              Status: ${test.error.response.status} ${test.error.response.statusText}
              <pre>${JSON.stringify(test.error.response.data, null, 2)}</pre>
            </div>` : ''}
        </div>
      `;
    }

    let detailsHtml = '';
    if (test.details) {
      detailsHtml = `
        <div class="test-details">
          <h5>Test Details</h5>
          <pre>${JSON.stringify(test.details, null, 2)}</pre>
        </div>
      `;
    }

    return `
      <div class="test-case ${statusClass}">
        <div class="test-header">
          <span class="status-icon">${statusIcon}</span>
          <span class="test-name">${test.name}</span>
          <span class="test-status badge badge-${statusClass}">${test.status}</span>
        </div>
        <div class="test-message">${test.message}</div>
        ${errorHtml}
        ${detailsHtml}
        <div class="test-timestamp">
          <small>Executed at: ${new Date(test.timestamp).toLocaleString()}</small>
        </div>
      </div>
    `;
  }).join('');

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Batch Processing API Test Report</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
        }
        h1, h2, h3, h4 {
          color: #2c3e50;
        }
        .badge {
          display: inline-block;
          padding: 3px 7px;
          font-size: 12px;
          font-weight: bold;
          line-height: 1;
          text-align: center;
          white-space: nowrap;
          vertical-align: baseline;
          border-radius: 10px;
          color: white;
        }
        .badge-success {
          background-color: #28a745;
        }
        .badge-warning {
          background-color: #ffc107;
          color: #212529;
        }
        .badge-danger {
          background-color: #dc3545;
        }
        .summary {
          background-color: #f8f9fa;
          border-radius: 5px;
          padding: 15px;
          margin-bottom: 20px;
          display: flex;
          justify-content: space-between;
          flex-wrap: wrap;
        }
        .summary-item {
          margin: 5px 10px;
        }
        .test-case {
          margin-bottom: 15px;
          border: 1px solid #ddd;
          border-radius: 5px;
          padding: 15px;
        }
        .test-case.success {
          border-left: 5px solid #28a745;
        }
        .test-case.warning {
          border-left: 5px solid #ffc107;
        }
        .test-case.danger {
          border-left: 5px solid #dc3545;
        }
        .test-header {
          display: flex;
          align-items: center;
          margin-bottom: 10px;
        }
        .status-icon {
          margin-right: 10px;
        }
        .test-name {
          font-weight: bold;
          flex-grow: 1;
        }
        .test-message {
          margin-bottom: 10px;
        }
        .error-details, .test-details {
          background-color: #f8f9fa;
          border-radius: 5px;
          padding: 10px;
          margin-top: 10px;
          margin-bottom: 10px;
          font-size: 14px;
        }
        .code-block {
          font-family: monospace;
          white-space: pre-wrap;
          background-color: #f1f1f1;
          padding: 10px;
          border-radius: 3px;
          overflow-x: auto;
        }
        .test-timestamp {
          text-align: right;
          color: #6c757d;
        }
        pre {
          margin: 0;
          overflow-x: auto;
        }
      </style>
    </head>
    <body>
      <h1>Batch Processing API Test Report</h1>
      
      <div class="summary">
        <div class="summary-item">
          <strong>Start Time:</strong> ${new Date(results.startTime).toLocaleString()}
        </div>
        <div class="summary-item">
          <strong>End Time:</strong> ${new Date(results.endTime).toLocaleString()}
        </div>
        <div class="summary-item">
          <strong>Duration:</strong> ${results.duration.toFixed(2)}s
        </div>
        <div class="summary-item">
          <strong>Total Tests:</strong> ${results.totalTests}
        </div>
        <div class="summary-item">
          <strong>Pass Rate:</strong> <span class="badge badge-${statusBadgeClass}">${passRate}%</span>
        </div>
        <div class="summary-item">
          <strong>Passed:</strong> <span class="badge badge-success">${results.passedTests}</span>
        </div>
        <div class="summary-item">
          <strong>Failed:</strong> <span class="badge badge-danger">${results.failedTests}</span>
        </div>
        <div class="summary-item">
          <strong>Skipped:</strong> <span class="badge badge-warning">${results.skippedTests}</span>
        </div>
      </div>
      
      <h2>Test Cases</h2>
      <div class="test-cases">
        ${testsHtml}
      </div>
    </body>
    </html>
  `;
}

// Test Functions

/**
 * Test creating a batch job
 */
async function testCreateBatchJob() {
  const testName = 'Create Batch Job';
  
  try {
    const response = await client.post('/api/batch/jobs', {
      name: 'Test Batch Job',
      items: config.testDocuments
    });
    
    if (response.status !== 201) {
      return recordTestResult(testName, 'failed', 'Expected status 201 but got ' + response.status);
    }
    
    const { data } = response;
    
    if (!data.success) {
      return recordTestResult(testName, 'failed', 'Expected success: true but got ' + data.success);
    }
    
    if (!data.job || !data.job.id) {
      return recordTestResult(testName, 'failed', 'Response does not contain job.id');
    }
    
    return recordTestResult(
      testName, 
      'passed', 
      'Successfully created batch job', 
      null, 
      { jobId: data.job.id, response: data }
    );
  } catch (error) {
    return recordTestResult(testName, 'failed', 'Failed to create batch job', error);
  }
}

/**
 * Test getting all batch jobs
 */
async function testGetAllBatchJobs() {
  const testName = 'Get All Batch Jobs';
  
  try {
    const response = await client.get('/api/batch/jobs');
    
    if (response.status !== 200) {
      return recordTestResult(testName, 'failed', 'Expected status 200 but got ' + response.status);
    }
    
    const { data } = response;
    
    if (!data.success) {
      return recordTestResult(testName, 'failed', 'Expected success: true but got ' + data.success);
    }
    
    if (!Array.isArray(data.jobs)) {
      return recordTestResult(testName, 'failed', 'Response does not contain jobs array');
    }
    
    return recordTestResult(
      testName, 
      'passed', 
      'Successfully retrieved all batch jobs', 
      null, 
      { jobCount: data.jobs.length, response: data }
    );
  } catch (error) {
    return recordTestResult(testName, 'failed', 'Failed to retrieve batch jobs', error);
  }
}

/**
 * Test getting a specific batch job's status
 */
async function testGetBatchJobStatus(jobId) {
  const testName = 'Get Batch Job Status';
  
  if (!jobId) {
    return recordTestResult(testName, 'skipped', 'No job ID provided');
  }
  
  try {
    const response = await client.get(`/api/batch/jobs/${jobId}`);
    
    if (response.status !== 200) {
      return recordTestResult(testName, 'failed', 'Expected status 200 but got ' + response.status);
    }
    
    const { data } = response;
    
    if (!data.success) {
      return recordTestResult(testName, 'failed', 'Expected success: true but got ' + data.success);
    }
    
    if (!data.job || !data.job.id) {
      return recordTestResult(testName, 'failed', 'Response does not contain job.id');
    }
    
    return recordTestResult(
      testName, 
      'passed', 
      'Successfully retrieved batch job status', 
      null, 
      { job: data.job, response: data }
    );
  } catch (error) {
    return recordTestResult(testName, 'failed', 'Failed to retrieve batch job status', error);
  }
}

/**
 * Test starting a batch job
 */
async function testStartBatchJob(jobId) {
  const testName = 'Start Batch Job';
  
  if (!jobId) {
    return recordTestResult(testName, 'skipped', 'No job ID provided');
  }
  
  try {
    const response = await client.post(`/api/batch/jobs/${jobId}/start`);
    
    if (response.status !== 200) {
      return recordTestResult(testName, 'failed', 'Expected status 200 but got ' + response.status);
    }
    
    const { data } = response;
    
    if (!data.success) {
      return recordTestResult(testName, 'failed', 'Expected success: true but got ' + data.success);
    }
    
    if (!data.job || !data.job.id) {
      return recordTestResult(testName, 'failed', 'Response does not contain job.id');
    }
    
    return recordTestResult(
      testName, 
      'passed', 
      'Successfully started batch job', 
      null, 
      { job: data.job, response: data }
    );
  } catch (error) {
    return recordTestResult(testName, 'failed', 'Failed to start batch job', error);
  }
}

/**
 * Test getting batch job results
 */
async function testGetBatchJobResults(jobId) {
  const testName = 'Get Batch Job Results';
  
  if (!jobId) {
    return recordTestResult(testName, 'skipped', 'No job ID provided');
  }
  
  try {
    const response = await client.get(`/api/batch/jobs/${jobId}/results`);
    
    if (response.status !== 200) {
      return recordTestResult(testName, 'failed', 'Expected status 200 but got ' + response.status);
    }
    
    const { data } = response;
    
    if (!data.success) {
      return recordTestResult(testName, 'failed', 'Expected success: true but got ' + data.success);
    }
    
    // Results might be empty if job is still processing
    if (!Array.isArray(data.results)) {
      return recordTestResult(testName, 'failed', 'Response does not contain results array');
    }
    
    return recordTestResult(
      testName, 
      'passed', 
      'Successfully retrieved batch job results', 
      null, 
      { resultCount: data.results.length, response: data }
    );
  } catch (error) {
    return recordTestResult(testName, 'failed', 'Failed to retrieve batch job results', error);
  }
}

/**
 * Test batch document processing
 */
async function testBatchProcessDocuments() {
  const testName = 'Batch Process Documents';
  
  try {
    const response = await client.post('/api/batch/documents/process', {
      documents: config.testDocuments,
      options: {
        extractText: true,
        extractTables: true,
        extractSecurities: true
      }
    });
    
    if (response.status !== 202) {
      return recordTestResult(testName, 'failed', 'Expected status 202 but got ' + response.status);
    }
    
    const { data } = response;
    
    if (!data.success) {
      return recordTestResult(testName, 'failed', 'Expected success: true but got ' + data.success);
    }
    
    if (!data.job || !data.job.id) {
      return recordTestResult(testName, 'failed', 'Response does not contain job.id');
    }
    
    return recordTestResult(
      testName, 
      'passed', 
      'Successfully started batch document processing', 
      null, 
      { jobId: data.job.id, response: data }
    );
  } catch (error) {
    return recordTestResult(testName, 'failed', 'Failed to start batch document processing', error);
  }
}

/**
 * Test batch securities extraction
 */
async function testBatchExtractSecurities() {
  const testName = 'Batch Extract Securities';
  
  try {
    const response = await client.post('/api/batch/securities/extract', {
      documents: config.testDocuments,
      options: {
        includeMetadata: true,
        validateISINs: true
      }
    });
    
    if (response.status !== 202) {
      return recordTestResult(testName, 'failed', 'Expected status 202 but got ' + response.status);
    }
    
    const { data } = response;
    
    if (!data.success) {
      return recordTestResult(testName, 'failed', 'Expected success: true but got ' + data.success);
    }
    
    if (!data.job || !data.job.id) {
      return recordTestResult(testName, 'failed', 'Response does not contain job.id');
    }
    
    return recordTestResult(
      testName, 
      'passed', 
      'Successfully started batch securities extraction', 
      null, 
      { jobId: data.job.id, response: data }
    );
  } catch (error) {
    return recordTestResult(testName, 'failed', 'Failed to start batch securities extraction', error);
  }
}

/**
 * Test batch securities update
 */
async function testBatchUpdateSecurities() {
  const testName = 'Batch Update Securities';
  
  try {
    const response = await client.post('/api/batch/securities/update', {
      securities: config.testSecurities,
      options: {
        updatePricing: true,
        updateMetadata: true
      }
    });
    
    if (response.status !== 202) {
      return recordTestResult(testName, 'failed', 'Expected status 202 but got ' + response.status);
    }
    
    const { data } = response;
    
    if (!data.success) {
      return recordTestResult(testName, 'failed', 'Expected success: true but got ' + data.success);
    }
    
    if (!data.job || !data.job.id) {
      return recordTestResult(testName, 'failed', 'Response does not contain job.id');
    }
    
    return recordTestResult(
      testName, 
      'passed', 
      'Successfully started batch securities update', 
      null, 
      { jobId: data.job.id, response: data }
    );
  } catch (error) {
    return recordTestResult(testName, 'failed', 'Failed to start batch securities update', error);
  }
}

/**
 * Test getting batch job history
 */
async function testGetBatchJobHistory() {
  const testName = 'Get Batch Job History';
  
  try {
    const response = await client.get('/api/batch/history');
    
    if (response.status !== 200) {
      return recordTestResult(testName, 'failed', 'Expected status 200 but got ' + response.status);
    }
    
    const { data } = response;
    
    if (!data.success) {
      return recordTestResult(testName, 'failed', 'Expected success: true but got ' + data.success);
    }
    
    if (!Array.isArray(data.history)) {
      return recordTestResult(testName, 'failed', 'Response does not contain history array');
    }
    
    return recordTestResult(
      testName, 
      'passed', 
      'Successfully retrieved batch job history', 
      null, 
      { historyCount: data.history.length, response: data }
    );
  } catch (error) {
    return recordTestResult(testName, 'failed', 'Failed to retrieve batch job history', error);
  }
}

/**
 * Test cancelling a batch job
 */
async function testCancelBatchJob(jobId) {
  const testName = 'Cancel Batch Job';
  
  if (!jobId) {
    return recordTestResult(testName, 'skipped', 'No job ID provided');
  }
  
  try {
    const response = await client.post(`/api/batch/jobs/${jobId}/cancel`);
    
    if (response.status !== 200) {
      return recordTestResult(testName, 'failed', 'Expected status 200 but got ' + response.status);
    }
    
    const { data } = response;
    
    if (!data.success) {
      return recordTestResult(testName, 'failed', 'Expected success: true but got ' + data.success);
    }
    
    if (!data.job || !data.job.id) {
      return recordTestResult(testName, 'failed', 'Response does not contain job.id');
    }
    
    return recordTestResult(
      testName, 
      'passed', 
      'Successfully cancelled batch job', 
      null, 
      { job: data.job, response: data }
    );
  } catch (error) {
    return recordTestResult(testName, 'failed', 'Failed to cancel batch job', error);
  }
}

/**
 * Test cleaning up batch jobs
 */
async function testCleanupBatchJobs() {
  const testName = 'Cleanup Batch Jobs';
  
  try {
    const response = await client.post('/api/batch/cleanup', {
      maxAgeHours: 24
    });
    
    if (response.status !== 200) {
      return recordTestResult(testName, 'failed', 'Expected status 200 but got ' + response.status);
    }
    
    const { data } = response;
    
    if (!data.success) {
      return recordTestResult(testName, 'failed', 'Expected success: true but got ' + data.success);
    }
    
    if (typeof data.count !== 'number') {
      return recordTestResult(testName, 'failed', 'Response does not contain count');
    }
    
    return recordTestResult(
      testName, 
      'passed', 
      'Successfully cleaned up batch jobs', 
      null, 
      { cleanedCount: data.count, response: data }
    );
  } catch (error) {
    return recordTestResult(testName, 'failed', 'Failed to clean up batch jobs', error);
  }
}

/**
 * Test legacy batch processing endpoints
 */
async function testLegacyBatchProcessing() {
  const testName = 'Legacy Batch Processing';
  
  try {
    // Test legacy start endpoint
    const startResponse = await client.post('/api/batch/start', {
      documentIds: config.testDocuments.map(doc => doc.id),
      processingOptions: {
        extractText: true,
        extractTables: true,
        extractMetadata: true
      }
    });
    
    if (startResponse.status !== 200) {
      return recordTestResult(testName, 'failed', 'Expected legacy start status 200 but got ' + startResponse.status);
    }
    
    const startData = startResponse.data;
    
    if (!startData.success) {
      return recordTestResult(testName, 'failed', 'Expected legacy start success: true but got ' + startData.success);
    }
    
    if (!startData.batch || !startData.batch.batchId) {
      return recordTestResult(testName, 'failed', 'Legacy start response does not contain batch.batchId');
    }
    
    const batchId = startData.batch.batchId;
    
    // Test legacy status endpoint
    const statusResponse = await client.get(`/api/batch/${batchId}`);
    
    if (statusResponse.status !== 200) {
      return recordTestResult(testName, 'failed', 'Expected legacy status status 200 but got ' + statusResponse.status);
    }
    
    const statusData = statusResponse.data;
    
    if (!statusData.success) {
      return recordTestResult(testName, 'failed', 'Expected legacy status success: true but got ' + statusData.success);
    }
    
    // Test legacy cancel endpoint
    const cancelResponse = await client.post(`/api/batch/${batchId}/cancel`);
    
    if (cancelResponse.status !== 200) {
      return recordTestResult(testName, 'failed', 'Expected legacy cancel status 200 but got ' + cancelResponse.status);
    }
    
    const cancelData = cancelResponse.data;
    
    if (!cancelData.success) {
      return recordTestResult(testName, 'failed', 'Expected legacy cancel success: true but got ' + cancelData.success);
    }
    
    return recordTestResult(
      testName, 
      'passed', 
      'Successfully tested legacy batch processing endpoints', 
      null, 
      { 
        batchId,
        startResponse: startData,
        statusResponse: statusData,
        cancelResponse: cancelData
      }
    );
  } catch (error) {
    return recordTestResult(testName, 'failed', 'Failed to test legacy batch processing', error);
  }
}

/**
 * Run all tests
 */
async function runTests() {
  console.log('Starting Batch Processing API Tests...');
  
  try {
    // Test 1: Create a batch job
    const createResult = await testCreateBatchJob();
    const jobId = createResult.status === 'passed' ? createResult.details.jobId : null;
    
    // Test 2: Get all batch jobs
    await testGetAllBatchJobs();
    
    // Test 3: Get batch job status
    await testGetBatchJobStatus(jobId);
    
    // Test 4: Start batch job
    await testStartBatchJob(jobId);
    
    // Test 5: Get batch job results
    await testGetBatchJobResults(jobId);
    
    // Test 6: Batch process documents
    const processResult = await testBatchProcessDocuments();
    const processJobId = processResult.status === 'passed' ? processResult.details.jobId : null;
    
    // Test 7: Batch extract securities
    const extractResult = await testBatchExtractSecurities();
    const extractJobId = extractResult.status === 'passed' ? extractResult.details.jobId : null;
    
    // Test 8: Batch update securities
    await testBatchUpdateSecurities();
    
    // Test 9: Get batch job history
    await testGetBatchJobHistory();
    
    // Test 10: Cancel batch job (use extract job ID for this test)
    await testCancelBatchJob(extractJobId);
    
    // Test 11: Clean up batch jobs
    await testCleanupBatchJobs();
    
    // Test 12: Legacy batch processing
    await testLegacyBatchProcessing();
    
  } catch (error) {
    console.error('Error running tests:', error);
  } finally {
    // Save test results
    const { jsonFilePath, htmlFilePath } = saveTestResults();
    
    // Print summary
    console.log('\n--- Test Summary ---');
    console.log(`Total Tests: ${testResults.totalTests}`);
    console.log(`Passed: ${testResults.passedTests}`);
    console.log(`Failed: ${testResults.failedTests}`);
    console.log(`Skipped: ${testResults.skippedTests}`);
    console.log(`Pass Rate: ${testResults.totalTests > 0 ? Math.round((testResults.passedTests / testResults.totalTests) * 100) : 0}%`);
    console.log('-------------------');
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests();
}

module.exports = {
  runTests,
  testResults
};