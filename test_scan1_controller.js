/**
 * Test Scan1 Controller
 * 
 * This script tests the scan1 controller functionality directly.
 */

const fs = require('fs');
const path = require('path');

// Import the scan1 controller
const { processDocumentWithScan1 } = require('./backv2-github/DevDocs/findoc-app-engine-v2/src/api/controllers/scan1Controller');

// Mock Express request and response objects
const mockRequest = (params = {}, body = {}, files = null, user = null, tenantId = null) => {
  return {
    params,
    body,
    files,
    user,
    tenantId
  };
};

const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

// Test function
const testScan1Controller = async () => {
  console.log('Testing Scan1 Controller...');
  
  // Create mock request and response
  const req = mockRequest(
    { id: 'test-document-id' },
    {
      agents: ['Document Analyzer', 'Table Understanding', 'Securities Extractor', 'Financial Reasoner'],
      tableExtraction: true,
      isinDetection: true,
      securityInfo: true,
      portfolioAnalysis: true,
      ocrScanned: true,
      outputFormat: 'json'
    },
    null,
    { id: 'test-user-id', email: 'test@example.com', name: 'Test User' },
    'test-tenant-id'
  );
  
  const res = mockResponse();
  
  // Call the controller function
  try {
    await processDocumentWithScan1(req, res);
    
    // Check if the response was called with the correct status
    console.log('Response status:', res.status.mock.calls[0][0]);
    
    // Check if the response was called with the correct data
    console.log('Response data:', JSON.stringify(res.json.mock.calls[0][0], null, 2));
    
    console.log('Test completed successfully!');
  } catch (error) {
    console.error('Test failed:', error);
  }
};

// Run the test
testScan1Controller();
