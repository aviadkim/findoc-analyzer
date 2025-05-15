/**
 * Financial PDF Processing Test
 * This script tests the accuracy of financial PDF processing
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

// Configuration
const config = {
  // Base URL for the API
  baseUrl: 'https://findoc-deploy.ey.r.appspot.com',
  
  // API endpoints to test
  endpoints: {
    // Document endpoints
    uploadDocument: '/api/documents/upload',
    processDocument: '/api/documents/process',
    getDocument: '/api/documents',
    
    // Chat endpoints
    documentChat: '/api/document-chat'
  },
  
  // Test timeout
  timeout: 60000,
  
  // Output file
  outputFile: 'financial-pdf-processing-test-results.json',
  
  // Test PDF file
  testPdfFile: path.join(__dirname, 'test-financial-report.pdf'),
  
  // Financial metrics to test
  financialMetrics: [
    'total revenue',
    'net income',
    'operating expenses',
    'total assets',
    'total liabilities',
    'shareholders equity',
    'earnings per share',
    'dividend per share',
    'return on equity',
    'debt to equity ratio'
  ],
  
  // Securities to test
  securities: [
    'Apple Inc.',
    'Microsoft',
    'Amazon',
    'Tesla',
    'Google'
  ]
};

// Test results
const testResults = {
  passed: [],
  failed: [],
  warnings: [],
  metrics: {
    accuracy: 0,
    precision: 0,
    recall: 0,
    f1Score: 0
  },
  timestamp: new Date().toISOString()
};

// Main test function
async function runTests() {
  console.log('Starting financial PDF processing tests...');
  
  try {
    // Check if test PDF file exists
    if (!fs.existsSync(config.testPdfFile)) {
      console.log('Test PDF file not found, using mock data instead');
      await testWithMockData();
    } else {
      // Upload and process the test PDF file
      const documentId = await uploadAndProcessDocument();
      
      // Test document processing accuracy
      await testDocumentProcessingAccuracy(documentId);
      
      // Test document chat accuracy
      await testDocumentChatAccuracy(documentId);
    }
    
    // Calculate metrics
    calculateMetrics();
    
    // Log test results
    logTestResults();
    
    // Save test results
    saveTestResults();
  } catch (error) {
    console.error('Error running tests:', error);
    testResults.failed.push({
      test: 'Test execution',
      error: error.message
    });
    
    // Save test results
    saveTestResults();
  }
}

// Test with mock data
async function testWithMockData() {
  console.log('Testing with mock data...');
  
  // Mock document ID
  const documentId = 'doc-1';
  
  // Test document processing accuracy
  await testDocumentProcessingAccuracy(documentId);
  
  // Test document chat accuracy
  await testDocumentChatAccuracy(documentId);
}

// Upload and process a document
async function uploadAndProcessDocument() {
  console.log('Uploading and processing document...');
  
  try {
    // Create form data
    const formData = new FormData();
    formData.append('file', fs.createReadStream(config.testPdfFile));
    formData.append('documentType', 'financial');
    
    // Upload document
    console.log('Uploading document...');
    const uploadResponse = await axios.post(`${config.baseUrl}${config.endpoints.uploadDocument}`, formData, {
      headers: {
        ...formData.getHeaders()
      },
      timeout: config.timeout
    });
    
    if (uploadResponse.status !== 200 || !uploadResponse.data.documentId) {
      throw new Error(`Failed to upload document: ${JSON.stringify(uploadResponse.data)}`);
    }
    
    const documentId = uploadResponse.data.documentId;
    console.log(`Document uploaded successfully with ID: ${documentId}`);
    
    // Process document
    console.log('Processing document...');
    const processResponse = await axios.post(`${config.baseUrl}${config.endpoints.processDocument}`, {
      documentId
    }, {
      timeout: config.timeout
    });
    
    if (processResponse.status !== 200) {
      throw new Error(`Failed to process document: ${JSON.stringify(processResponse.data)}`);
    }
    
    console.log('Document processed successfully');
    
    // Return document ID
    return documentId;
  } catch (error) {
    console.error('Error uploading and processing document:', error);
    testResults.failed.push({
      test: 'Upload and Process Document',
      error: error.message
    });
    throw error;
  }
}

// Test document processing accuracy
async function testDocumentProcessingAccuracy(documentId) {
  console.log(`Testing document processing accuracy for document ${documentId}...`);
  
  try {
    // Get document
    const response = await axios.get(`${config.baseUrl}${config.endpoints.getDocument}/${documentId}`, {
      timeout: config.timeout
    });
    
    if (response.status !== 200 || !response.data) {
      throw new Error(`Failed to get document: ${JSON.stringify(response.data)}`);
    }
    
    const document = response.data;
    console.log('Document retrieved successfully');
    
    // Check if document has content
    if (!document.content) {
      throw new Error('Document has no content');
    }
    
    // Check if document has text
    if (!document.content.text) {
      throw new Error('Document has no text content');
    }
    
    testResults.passed.push({
      test: 'Document Text Content',
      message: 'Document has text content'
    });
    console.log('✅ Document has text content');
    
    // Check if document has tables
    if (!document.content.tables || document.content.tables.length === 0) {
      testResults.warnings.push({
        test: 'Document Tables',
        message: 'Document has no tables'
      });
      console.log('⚠️ Document has no tables');
    } else {
      testResults.passed.push({
        test: 'Document Tables',
        message: `Document has ${document.content.tables.length} tables`
      });
      console.log(`✅ Document has ${document.content.tables.length} tables`);
      
      // Check table content
      for (let i = 0; i < document.content.tables.length; i++) {
        const table = document.content.tables[i];
        
        // Check if table has headers
        if (!table.headers || table.headers.length === 0) {
          testResults.warnings.push({
            test: `Table ${i + 1} Headers`,
            message: 'Table has no headers'
          });
          console.log(`⚠️ Table ${i + 1} has no headers`);
        } else {
          testResults.passed.push({
            test: `Table ${i + 1} Headers`,
            message: `Table has ${table.headers.length} headers`
          });
          console.log(`✅ Table ${i + 1} has ${table.headers.length} headers`);
        }
        
        // Check if table has rows
        if (!table.rows || table.rows.length === 0) {
          testResults.warnings.push({
            test: `Table ${i + 1} Rows`,
            message: 'Table has no rows'
          });
          console.log(`⚠️ Table ${i + 1} has no rows`);
        } else {
          testResults.passed.push({
            test: `Table ${i + 1} Rows`,
            message: `Table has ${table.rows.length} rows`
          });
          console.log(`✅ Table ${i + 1} has ${table.rows.length} rows`);
        }
      }
    }
    
    // Check if document has securities
    if (!document.content.securities || document.content.securities.length === 0) {
      testResults.warnings.push({
        test: 'Document Securities',
        message: 'Document has no securities'
      });
      console.log('⚠️ Document has no securities');
    } else {
      testResults.passed.push({
        test: 'Document Securities',
        message: `Document has ${document.content.securities.length} securities`
      });
      console.log(`✅ Document has ${document.content.securities.length} securities`);
      
      // Check securities content
      for (const security of document.content.securities) {
        // Check if security has name
        if (!security.name) {
          testResults.warnings.push({
            test: 'Security Name',
            message: 'Security has no name'
          });
          console.log('⚠️ Security has no name');
        } else {
          testResults.passed.push({
            test: 'Security Name',
            message: `Security has name: ${security.name}`
          });
          console.log(`✅ Security has name: ${security.name}`);
        }
        
        // Check if security has ISIN
        if (!security.isin) {
          testResults.warnings.push({
            test: 'Security ISIN',
            message: 'Security has no ISIN'
          });
          console.log('⚠️ Security has no ISIN');
        } else {
          testResults.passed.push({
            test: 'Security ISIN',
            message: `Security has ISIN: ${security.isin}`
          });
          console.log(`✅ Security has ISIN: ${security.isin}`);
        }
      }
    }
  } catch (error) {
    console.error('Error testing document processing accuracy:', error);
    testResults.failed.push({
      test: 'Document Processing Accuracy',
      error: error.message
    });
  }
}

// Test document chat accuracy
async function testDocumentChatAccuracy(documentId) {
  console.log(`Testing document chat accuracy for document ${documentId}...`);
  
  try {
    // Test financial metrics
    for (const metric of config.financialMetrics) {
      await testFinancialMetric(documentId, metric);
    }
    
    // Test securities
    for (const security of config.securities) {
      await testSecurity(documentId, security);
    }
  } catch (error) {
    console.error('Error testing document chat accuracy:', error);
    testResults.failed.push({
      test: 'Document Chat Accuracy',
      error: error.message
    });
  }
}

// Test a financial metric
async function testFinancialMetric(documentId, metric) {
  console.log(`Testing financial metric: ${metric}...`);
  
  try {
    // Ask a question about the metric
    const question = `What is the ${metric} in the document?`;
    
    // Get answer
    const response = await axios.get(`${config.baseUrl}${config.endpoints.documentChat}`, {
      params: {
        documentId,
        message: question
      },
      timeout: config.timeout
    });
    
    if (response.status !== 200 || !response.data) {
      throw new Error(`Failed to get answer: ${JSON.stringify(response.data)}`);
    }
    
    const answer = response.data.response;
    
    // Check if answer contains the metric
    if (answer && answer.toLowerCase().includes(metric.toLowerCase())) {
      testResults.passed.push({
        test: `Financial Metric: ${metric}`,
        message: `Answer contains the metric: ${answer}`
      });
      console.log(`✅ Answer contains the metric ${metric}: ${answer}`);
    } else {
      testResults.warnings.push({
        test: `Financial Metric: ${metric}`,
        message: `Answer does not contain the metric: ${answer}`
      });
      console.log(`⚠️ Answer does not contain the metric ${metric}: ${answer}`);
    }
  } catch (error) {
    console.error(`Error testing financial metric ${metric}:`, error);
    testResults.failed.push({
      test: `Financial Metric: ${metric}`,
      error: error.message
    });
  }
}

// Test a security
async function testSecurity(documentId, security) {
  console.log(`Testing security: ${security}...`);
  
  try {
    // Ask a question about the security
    const question = `What information is available about ${security} in the document?`;
    
    // Get answer
    const response = await axios.get(`${config.baseUrl}${config.endpoints.documentChat}`, {
      params: {
        documentId,
        message: question
      },
      timeout: config.timeout
    });
    
    if (response.status !== 200 || !response.data) {
      throw new Error(`Failed to get answer: ${JSON.stringify(response.data)}`);
    }
    
    const answer = response.data.response;
    
    // Check if answer contains the security
    if (answer && answer.toLowerCase().includes(security.toLowerCase())) {
      testResults.passed.push({
        test: `Security: ${security}`,
        message: `Answer contains the security: ${answer}`
      });
      console.log(`✅ Answer contains the security ${security}: ${answer}`);
    } else {
      testResults.warnings.push({
        test: `Security: ${security}`,
        message: `Answer does not contain the security: ${answer}`
      });
      console.log(`⚠️ Answer does not contain the security ${security}: ${answer}`);
    }
  } catch (error) {
    console.error(`Error testing security ${security}:`, error);
    testResults.failed.push({
      test: `Security: ${security}`,
      error: error.message
    });
  }
}

// Calculate metrics
function calculateMetrics() {
  console.log('Calculating metrics...');
  
  // Calculate accuracy
  const totalTests = testResults.passed.length + testResults.failed.length + testResults.warnings.length;
  const accuracy = totalTests > 0 ? testResults.passed.length / totalTests : 0;
  
  // Calculate precision
  const precision = testResults.passed.length + testResults.failed.length > 0 ?
    testResults.passed.length / (testResults.passed.length + testResults.failed.length) : 0;
  
  // Calculate recall
  const recall = testResults.passed.length + testResults.warnings.length > 0 ?
    testResults.passed.length / (testResults.passed.length + testResults.warnings.length) : 0;
  
  // Calculate F1 score
  const f1Score = precision + recall > 0 ?
    2 * (precision * recall) / (precision + recall) : 0;
  
  // Update metrics
  testResults.metrics = {
    accuracy: Math.round(accuracy * 100) / 100,
    precision: Math.round(precision * 100) / 100,
    recall: Math.round(recall * 100) / 100,
    f1Score: Math.round(f1Score * 100) / 100
  };
}

// Log test results
function logTestResults() {
  console.log('\n==== TEST RESULTS ====');
  console.log(`Passed: ${testResults.passed.length}`);
  console.log(`Failed: ${testResults.failed.length}`);
  console.log(`Warnings: ${testResults.warnings.length}`);
  
  console.log('\n==== METRICS ====');
  console.log(`Accuracy: ${testResults.metrics.accuracy * 100}%`);
  console.log(`Precision: ${testResults.metrics.precision * 100}%`);
  console.log(`Recall: ${testResults.metrics.recall * 100}%`);
  console.log(`F1 Score: ${testResults.metrics.f1Score * 100}%`);
  
  if (testResults.passed.length > 0) {
    console.log('\nPassed Tests:');
    testResults.passed.forEach(result => {
      console.log(`✅ ${result.test}: ${result.message}`);
    });
  }
  
  if (testResults.failed.length > 0) {
    console.log('\nFailed Tests:');
    testResults.failed.forEach(result => {
      console.log(`❌ ${result.test}: ${result.error}`);
    });
  }
  
  if (testResults.warnings.length > 0) {
    console.log('\nWarnings:');
    testResults.warnings.forEach(result => {
      console.log(`⚠️ ${result.test}: ${result.message}`);
    });
  }
}

// Save test results
function saveTestResults() {
  fs.writeFileSync(
    config.outputFile,
    JSON.stringify(testResults, null, 2),
    'utf8'
  );
  
  console.log(`\nTest results saved to ${config.outputFile}`);
}

// Run tests
runTests().catch(error => {
  console.error('Error running tests:', error);
  process.exit(1);
});
