/**
 * Test Enhanced API
 * 
 * This script tests the enhanced document processing and chat API.
 */

const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');

// Configuration
const config = {
  baseUrl: 'http://localhost:8080',
  testPdfPath: path.join(__dirname, 'test_pdfs', 'sample.pdf'),
  sampleQuestion: 'What securities are in the portfolio?'
};

// Test uploading a document
const testUploadDocument = async () => {
  try {
    console.log('Testing document upload...');
    
    // Check if test PDF exists
    if (!fs.existsSync(config.testPdfPath)) {
      console.error(`Test PDF not found: ${config.testPdfPath}`);
      return { success: false, error: 'Test PDF not found' };
    }
    
    // Create form data
    const formData = new FormData();
    formData.append('file', fs.createReadStream(config.testPdfPath));
    
    // Upload document
    const response = await axios.post(
      `${config.baseUrl}/api/enhanced/documents`,
      formData,
      {
        headers: {
          ...formData.getHeaders()
        }
      }
    );
    
    console.log('Document upload response:', response.data);
    
    return { success: true, data: response.data, documentId: response.data.data.id };
  } catch (error) {
    console.error('Error testing document upload:', error.response?.data || error.message);
    return { success: false, error: error.response?.data || error.message };
  }
};

// Test processing a document
const testProcessDocument = async (documentId) => {
  try {
    console.log(`Testing document processing for document ID: ${documentId}...`);
    
    // Process document
    const response = await axios.post(
      `${config.baseUrl}/api/enhanced/documents/${documentId}/process`,
      { options: { useGemini: true } }
    );
    
    console.log('Document processing response:', response.data);
    
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error testing document processing:', error.response?.data || error.message);
    return { success: false, error: error.response?.data || error.message };
  }
};

// Test asking a question about a document
const testAskQuestion = async (documentId, question) => {
  try {
    console.log(`Testing asking question about document ID: ${documentId}...`);
    console.log(`Question: ${question}`);
    
    // Ask question
    const response = await axios.post(
      `${config.baseUrl}/api/enhanced/documents/${documentId}/ask`,
      { question }
    );
    
    console.log('Ask question response:', response.data);
    
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error testing ask question:', error.response?.data || error.message);
    return { success: false, error: error.response?.data || error.message };
  }
};

// Test generating a table from a document
const testGenerateTable = async (documentId, tableType) => {
  try {
    console.log(`Testing generating ${tableType} table for document ID: ${documentId}...`);
    
    // Generate table
    const response = await axios.post(
      `${config.baseUrl}/api/enhanced/documents/${documentId}/table`,
      { tableType }
    );
    
    console.log(`${tableType} table generation response:`, response.data);
    
    return { success: true, data: response.data };
  } catch (error) {
    console.error(`Error testing ${tableType} table generation:`, error.response?.data || error.message);
    return { success: false, error: error.response?.data || error.message };
  }
};

// Run all tests
const runTests = async () => {
  try {
    console.log('Running tests for enhanced API...');
    
    // Test document upload
    const uploadResult = await testUploadDocument();
    if (!uploadResult.success) {
      console.error('Document upload test failed. Aborting further tests.');
      return;
    }
    
    const documentId = uploadResult.documentId;
    console.log(`Successfully uploaded document with ID: ${documentId}`);
    
    // Test document processing
    const processResult = await testProcessDocument(documentId);
    if (!processResult.success) {
      console.error('Document processing test failed. Aborting further tests.');
      return;
    }
    
    console.log('Successfully processed document');
    
    // Test asking a question
    const askResult = await testAskQuestion(documentId, config.sampleQuestion);
    if (!askResult.success) {
      console.error('Ask question test failed. Aborting further tests.');
      return;
    }
    
    console.log('Successfully asked question and received answer');
    
    // Test generating tables
    const tableTypes = ['securities', 'assetAllocation', 'portfolioSummary'];
    
    for (const tableType of tableTypes) {
      const tableResult = await testGenerateTable(documentId, tableType);
      if (!tableResult.success) {
        console.error(`${tableType} table generation test failed.`);
      } else {
        console.log(`Successfully generated ${tableType} table`);
      }
    }
    
    console.log('All tests completed');
  } catch (error) {
    console.error('Error running tests:', error);
  }
};

// Run the tests
runTests();
