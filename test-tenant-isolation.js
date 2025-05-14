/**
 * Tenant Isolation Test
 * 
 * This script tests the tenant isolation for the FinDoc Analyzer application.
 */

const axios = require('axios');
const assert = require('assert');
const fs = require('fs');
const path = require('path');

// Test configuration
const config = {
  baseUrl: process.env.BASE_URL || 'http://localhost:8080',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000'
};

// Test results directory
const RESULTS_DIR = path.join(__dirname, 'test-tenant-isolation-results');

// Create results directory if it doesn't exist
if (!fs.existsSync(RESULTS_DIR)) {
  fs.mkdirSync(RESULTS_DIR, { recursive: true });
}

// Test results
const testResults = {
  tests: [],
  summary: {
    total: 0,
    passed: 0,
    failed: 0
  },
  tenant1Id: null,
  tenant2Id: null,
  document1Id: null,
  document2Id: null
};

/**
 * Run a test
 * @param {string} name - Test name
 * @param {Function} testFn - Test function
 */
async function runTest(name, testFn) {
  console.log(`Running test: ${name}`);
  
  const startTime = Date.now();
  let status = 'passed';
  let error = null;
  
  try {
    await testFn();
    console.log(`✅ Test passed: ${name}`);
    testResults.summary.passed++;
  } catch (err) {
    status = 'failed';
    error = err.message;
    console.error(`❌ Test failed: ${name}`);
    console.error(err);
    testResults.summary.failed++;
  }
  
  const endTime = Date.now();
  const duration = endTime - startTime;
  
  testResults.tests.push({
    name,
    status,
    duration,
    error
  });
  
  testResults.summary.total++;
}

/**
 * Generate test report
 */
function generateTestReport() {
  // Calculate test duration
  const totalDuration = testResults.tests.reduce((total, test) => total + test.duration, 0);
  
  // Generate HTML report
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tenant Isolation Test Report</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      margin: 0;
      padding: 20px;
      color: #333;
    }
    
    h1, h2, h3 {
      color: #0066cc;
    }
    
    .summary {
      background-color: #f5f5f5;
      padding: 15px;
      border-radius: 5px;
      margin-bottom: 20px;
    }
    
    .summary-item {
      margin-bottom: 10px;
    }
    
    .test {
      margin-bottom: 15px;
      padding: 15px;
      border-radius: 5px;
    }
    
    .test-passed {
      background-color: #e6ffe6;
      border-left: 5px solid #00cc00;
    }
    
    .test-failed {
      background-color: #ffe6e6;
      border-left: 5px solid #cc0000;
    }
    
    .test-name {
      font-weight: bold;
      margin-bottom: 5px;
    }
    
    .test-duration {
      color: #666;
      font-size: 0.9em;
    }
    
    .test-error {
      color: #cc0000;
      margin-top: 10px;
      font-family: monospace;
      white-space: pre-wrap;
    }
    
    .progress-bar {
      height: 20px;
      background-color: #f5f5f5;
      border-radius: 10px;
      margin-bottom: 20px;
      overflow: hidden;
    }
    
    .progress {
      height: 100%;
      background-color: #0066cc;
      text-align: center;
      line-height: 20px;
      color: white;
    }
  </style>
</head>
<body>
  <h1>Tenant Isolation Test Report</h1>
  
  <div class="summary">
    <h2>Summary</h2>
    
    <div class="progress-bar">
      <div class="progress" style="width: ${testResults.summary.passed / testResults.summary.total * 100}%">
        ${testResults.summary.passed}/${testResults.summary.total} (${Math.round(testResults.summary.passed / testResults.summary.total * 100)}%)
      </div>
    </div>
    
    <div class="summary-item">
      <strong>Total Tests:</strong> ${testResults.summary.total}
    </div>
    
    <div class="summary-item">
      <strong>Passed:</strong> ${testResults.summary.passed}
    </div>
    
    <div class="summary-item">
      <strong>Failed:</strong> ${testResults.summary.failed}
    </div>
    
    <div class="summary-item">
      <strong>Duration:</strong> ${(totalDuration / 1000).toFixed(2)}s
    </div>
    
    <div class="summary-item">
      <strong>Tenant 1 ID:</strong> ${testResults.tenant1Id || 'N/A'}
    </div>
    
    <div class="summary-item">
      <strong>Tenant 2 ID:</strong> ${testResults.tenant2Id || 'N/A'}
    </div>
  </div>
  
  <h2>Test Results</h2>
  
  ${testResults.tests.map(test => `
    <div class="test ${test.status === 'passed' ? 'test-passed' : 'test-failed'}">
      <div class="test-name">${test.name}</div>
      <div class="test-duration">Duration: ${(test.duration / 1000).toFixed(2)}s</div>
      ${test.error ? `<div class="test-error">${test.error}</div>` : ''}
    </div>
  `).join('')}
</body>
</html>
  `;
  
  // Write HTML report to file
  fs.writeFileSync(path.join(RESULTS_DIR, 'test-report.html'), html);
  
  // Write JSON results to file
  fs.writeFileSync(path.join(RESULTS_DIR, 'test-results.json'), JSON.stringify(testResults, null, 2));
  
  console.log(`\nTest report generated at ${path.join(RESULTS_DIR, 'test-report.html')}`);
  console.log(`\nTest Summary:`);
  console.log(`Total: ${testResults.summary.total}`);
  console.log(`Passed: ${testResults.summary.passed}`);
  console.log(`Failed: ${testResults.summary.failed}`);
  console.log(`Success Rate: ${Math.round(testResults.summary.passed / testResults.summary.total * 100)}%`);
}

/**
 * Create a tenant
 * @param {Object} tenantData - Tenant data
 * @returns {Promise<Object>} Created tenant
 */
async function createTenant(tenantData) {
  const response = await axios.post(`${config.baseUrl}/api/tenants`, tenantData);
  
  return response.data;
}

/**
 * Get API usage for a tenant
 * @param {string} tenantId - Tenant ID
 * @returns {Promise<Object>} API usage
 */
async function getApiUsage(tenantId) {
  const response = await axios.get(`${config.baseUrl}/api/tenant/api-usage`, {
    headers: {
      'x-tenant-id': tenantId
    }
  });
  
  return response.data;
}

/**
 * Get agent statuses for a tenant
 * @param {string} tenantId - Tenant ID
 * @returns {Promise<Object>} Agent statuses
 */
async function getAgentStatuses(tenantId) {
  const response = await axios.get(`${config.baseUrl}/api/tenant/agents`, {
    headers: {
      'x-tenant-id': tenantId
    }
  });
  
  return response.data;
}

/**
 * Create a document for a tenant
 * @param {string} tenantId - Tenant ID
 * @param {Object} documentData - Document data
 * @returns {Promise<Object>} Created document
 */
async function createDocument(tenantId, documentData) {
  const response = await axios.post(`${config.baseUrl}/api/tenant/documents`, documentData, {
    headers: {
      'Content-Type': 'application/json',
      'x-tenant-id': tenantId
    }
  });
  
  return response.data;
}

/**
 * Process a document for a tenant
 * @param {string} tenantId - Tenant ID
 * @param {string} documentId - Document ID
 * @returns {Promise<Object>} Processing result
 */
async function processDocument(tenantId, documentId) {
  const response = await axios.post(`${config.baseUrl}/api/tenant/documents/${documentId}/process`, {}, {
    headers: {
      'x-tenant-id': tenantId
    }
  });
  
  return response.data;
}

/**
 * Ask a question about a document for a tenant
 * @param {string} tenantId - Tenant ID
 * @param {string} documentId - Document ID
 * @param {string} question - Question to ask
 * @returns {Promise<Object>} Answer
 */
async function askQuestion(tenantId, documentId, question) {
  const response = await axios.post(`${config.baseUrl}/api/tenant/documents/${documentId}/chat`, { question }, {
    headers: {
      'Content-Type': 'application/json',
      'x-tenant-id': tenantId
    }
  });
  
  return response.data;
}

/**
 * Run all tests
 */
async function runTests() {
  try {
    // Test 1: Create tenants
    await runTest('Create first tenant', async () => {
      const tenant1 = await createTenant({
        name: 'Test Tenant 1',
        subscriptionTier: 'free',
        maxDocuments: 100,
        maxApiCalls: 1000
      });
      
      if (!tenant1 || !tenant1.tenant || !tenant1.tenant.id) {
        throw new Error('Failed to create first tenant');
      }
      
      // Store tenant ID for later tests
      testResults.tenant1Id = tenant1.tenant.id;
      
      console.log(`Created tenant 1 with ID: ${tenant1.tenant.id}`);
    });
    
    await runTest('Create second tenant', async () => {
      const tenant2 = await createTenant({
        name: 'Test Tenant 2',
        subscriptionTier: 'premium',
        maxDocuments: 500,
        maxApiCalls: 5000
      });
      
      if (!tenant2 || !tenant2.tenant || !tenant2.tenant.id) {
        throw new Error('Failed to create second tenant');
      }
      
      // Store tenant ID for later tests
      testResults.tenant2Id = tenant2.tenant.id;
      
      console.log(`Created tenant 2 with ID: ${tenant2.tenant.id}`);
    });
    
    // Test 2: Get API usage for tenants
    await runTest('Get API usage for first tenant', async () => {
      const apiUsage1 = await getApiUsage(testResults.tenant1Id);
      
      if (!apiUsage1 || !apiUsage1.tenant || !apiUsage1.usage) {
        throw new Error('Failed to get API usage for first tenant');
      }
      
      console.log(`API usage for tenant 1: ${JSON.stringify(apiUsage1)}`);
    });
    
    await runTest('Get API usage for second tenant', async () => {
      const apiUsage2 = await getApiUsage(testResults.tenant2Id);
      
      if (!apiUsage2 || !apiUsage2.tenant || !apiUsage2.usage) {
        throw new Error('Failed to get API usage for second tenant');
      }
      
      console.log(`API usage for tenant 2: ${JSON.stringify(apiUsage2)}`);
    });
    
    // Test 3: Get agent statuses for tenants
    await runTest('Get agent statuses for first tenant', async () => {
      const agentStatuses1 = await getAgentStatuses(testResults.tenant1Id);
      
      if (!agentStatuses1 || !agentStatuses1.agents) {
        throw new Error('Failed to get agent statuses for first tenant');
      }
      
      console.log(`Agent statuses for tenant 1: ${JSON.stringify(agentStatuses1)}`);
    });
    
    await runTest('Get agent statuses for second tenant', async () => {
      const agentStatuses2 = await getAgentStatuses(testResults.tenant2Id);
      
      if (!agentStatuses2 || !agentStatuses2.agents) {
        throw new Error('Failed to get agent statuses for second tenant');
      }
      
      console.log(`Agent statuses for tenant 2: ${JSON.stringify(agentStatuses2)}`);
    });
    
    // Test 4: Create documents for tenants
    await runTest('Create document for first tenant', async () => {
      const document1 = await createDocument(testResults.tenant1Id, {
        fileName: 'Test Document 1.pdf',
        fileSize: 1024000,
        documentType: 'portfolio'
      });
      
      if (!document1 || !document1.id) {
        throw new Error('Failed to create document for first tenant');
      }
      
      // Store document ID for later tests
      testResults.document1Id = document1.id;
      
      console.log(`Created document for tenant 1 with ID: ${document1.id}`);
    });
    
    await runTest('Create document for second tenant', async () => {
      const document2 = await createDocument(testResults.tenant2Id, {
        fileName: 'Test Document 2.pdf',
        fileSize: 2048000,
        documentType: 'portfolio'
      });
      
      if (!document2 || !document2.id) {
        throw new Error('Failed to create document for second tenant');
      }
      
      // Store document ID for later tests
      testResults.document2Id = document2.id;
      
      console.log(`Created document for tenant 2 with ID: ${document2.id}`);
    });
    
    // Test 5: Process documents for tenants
    await runTest('Process document for first tenant', async () => {
      const result1 = await processDocument(testResults.tenant1Id, testResults.document1Id);
      
      if (!result1 || !result1.id || !result1.status) {
        throw new Error('Failed to process document for first tenant');
      }
      
      console.log(`Processing document for tenant 1: ${JSON.stringify(result1)}`);
      
      // Wait for a moment to allow processing to start
      await new Promise(resolve => setTimeout(resolve, 1000));
    });
    
    await runTest('Process document for second tenant', async () => {
      const result2 = await processDocument(testResults.tenant2Id, testResults.document2Id);
      
      if (!result2 || !result2.id || !result2.status) {
        throw new Error('Failed to process document for second tenant');
      }
      
      console.log(`Processing document for tenant 2: ${JSON.stringify(result2)}`);
      
      // Wait for a moment to allow processing to start
      await new Promise(resolve => setTimeout(resolve, 1000));
    });
    
    // Test 6: Verify tenant isolation for documents
    await runTest('Verify tenant isolation for documents', async () => {
      try {
        // Try to access tenant 2's document with tenant 1's ID
        await axios.get(`${config.baseUrl}/api/tenant/documents/${testResults.document2Id}`, {
          headers: {
            'x-tenant-id': testResults.tenant1Id
          }
        });
        
        // If we get here, the test failed
        throw new Error('Tenant 1 was able to access tenant 2\'s document');
      } catch (error) {
        // Expect a 404 error
        if (error.response && error.response.status === 404) {
          console.log('Tenant isolation for documents verified: Tenant 1 cannot access tenant 2\'s document');
        } else {
          throw error;
        }
      }
    });
    
    // Test 7: Verify tenant isolation for document processing
    await runTest('Verify tenant isolation for document processing', async () => {
      try {
        // Try to process tenant 2's document with tenant 1's ID
        await axios.post(`${config.baseUrl}/api/tenant/documents/${testResults.document2Id}/process`, {}, {
          headers: {
            'x-tenant-id': testResults.tenant1Id
          }
        });
        
        // If we get here, the test failed
        throw new Error('Tenant 1 was able to process tenant 2\'s document');
      } catch (error) {
        // Expect a 404 error
        if (error.response && error.response.status === 404) {
          console.log('Tenant isolation for document processing verified: Tenant 1 cannot process tenant 2\'s document');
        } else {
          throw error;
        }
      }
    });
    
    // Test 8: Verify tenant isolation for question answering
    await runTest('Verify tenant isolation for question answering', async () => {
      try {
        // Try to ask a question about tenant 2's document with tenant 1's ID
        await axios.post(`${config.baseUrl}/api/tenant/documents/${testResults.document2Id}/chat`, {
          question: 'What is the total value of the portfolio?'
        }, {
          headers: {
            'x-tenant-id': testResults.tenant1Id
          }
        });
        
        // If we get here, the test failed
        throw new Error('Tenant 1 was able to ask a question about tenant 2\'s document');
      } catch (error) {
        // Expect a 404 error
        if (error.response && error.response.status === 404) {
          console.log('Tenant isolation for question answering verified: Tenant 1 cannot ask a question about tenant 2\'s document');
        } else {
          throw error;
        }
      }
    });
    
    // Test 9: Ask questions about documents for tenants
    await runTest('Ask question about document for first tenant', async () => {
      const answer1 = await askQuestion(testResults.tenant1Id, testResults.document1Id, 'What is the total value of the portfolio?');
      
      if (!answer1 || !answer1.answer) {
        throw new Error('Failed to ask question about document for first tenant');
      }
      
      console.log(`Answer for tenant 1: ${answer1.answer}`);
    });
    
    await runTest('Ask question about document for second tenant', async () => {
      const answer2 = await askQuestion(testResults.tenant2Id, testResults.document2Id, 'What is the total value of the portfolio?');
      
      if (!answer2 || !answer2.answer) {
        throw new Error('Failed to ask question about document for second tenant');
      }
      
      console.log(`Answer for tenant 2: ${answer2.answer}`);
    });
    
    // Test 10: Check API usage after operations
    await runTest('Check API usage for first tenant after operations', async () => {
      const apiUsage1 = await getApiUsage(testResults.tenant1Id);
      
      if (!apiUsage1 || !apiUsage1.tenant || !apiUsage1.usage) {
        throw new Error('Failed to get API usage for first tenant');
      }
      
      console.log(`API usage for tenant 1 after operations: ${JSON.stringify(apiUsage1)}`);
    });
    
    await runTest('Check API usage for second tenant after operations', async () => {
      const apiUsage2 = await getApiUsage(testResults.tenant2Id);
      
      if (!apiUsage2 || !apiUsage2.tenant || !apiUsage2.usage) {
        throw new Error('Failed to get API usage for second tenant');
      }
      
      console.log(`API usage for tenant 2 after operations: ${JSON.stringify(apiUsage2)}`);
    });
  } catch (error) {
    console.error('Error running tests:', error);
  } finally {
    // Generate test report
    generateTestReport();
  }
}

// Run tests
runTests();
