/**
 * Test Document Upload and Processing
 * 
 * This script tests the document upload and processing functionality of the FinDoc Analyzer application.
 */

const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');

// Configuration
const config = {
  apiUrl: 'https://findoc-deploy.ey.r.appspot.com',
  testPdfPath: path.join(__dirname, 'test-pdfs', 'simple-financial-statement.pdf'),
  timeout: 60000 // 60 seconds
};

/**
 * Upload a document
 * @param {string} filePath - Path to the file to upload
 * @returns {Promise<string>} Document ID
 */
async function uploadDocument(filePath) {
  console.log(`Uploading document: ${filePath}...`);
  
  // Check if file exists
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }
  
  // Create form data
  const formData = new FormData();
  formData.append('file', fs.createReadStream(filePath));
  formData.append('documentType', 'financial_statement');
  
  try {
    // Upload file
    const response = await axios.post(`${config.apiUrl}/api/documents/upload`, formData, {
      headers: {
        ...formData.getHeaders()
      },
      timeout: config.timeout
    });
    
    console.log('Upload response:', response.data);
    
    if (response.data.success) {
      console.log(`Document uploaded successfully. Document ID: ${response.data.documentId}`);
      return response.data.documentId;
    } else {
      throw new Error(`Upload failed: ${response.data.error}`);
    }
  } catch (error) {
    console.error('Upload failed:', error.message);
    throw error;
  }
}

/**
 * Check document processing status
 * @param {string} documentId - Document ID
 * @returns {Promise<string>} Processing status
 */
async function checkProcessingStatus(documentId) {
  console.log(`Checking processing status for document: ${documentId}...`);
  
  try {
    const response = await axios.get(`${config.apiUrl}/api/documents/${documentId}/status`, {
      timeout: config.timeout
    });
    
    console.log('Status response:', response.data);
    
    if (response.data.success) {
      console.log(`Processing status: ${response.data.status}`);
      return response.data.status;
    } else {
      throw new Error(`Status check failed: ${response.data.error}`);
    }
  } catch (error) {
    console.error('Status check failed:', error.message);
    throw error;
  }
}

/**
 * Wait for document processing to complete
 * @param {string} documentId - Document ID
 * @param {number} maxWaitTime - Maximum wait time in milliseconds
 * @returns {Promise<boolean>} True if processing completed successfully, false otherwise
 */
async function waitForProcessingComplete(documentId, maxWaitTime = 300000) {
  console.log(`Waiting for processing to complete for document: ${documentId}...`);
  
  const startTime = Date.now();
  let status = 'processing';
  
  while (status === 'processing' && Date.now() - startTime < maxWaitTime) {
    // Wait for 5 seconds
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Check status
    try {
      status = await checkProcessingStatus(documentId);
      
      if (status === 'completed') {
        console.log('Processing completed successfully');
        return true;
      } else if (status === 'error') {
        console.log('Processing failed with error');
        return false;
      }
    } catch (error) {
      console.error('Error checking status:', error.message);
      // Continue waiting
    }
  }
  
  if (status === 'processing') {
    console.log('Processing timed out');
    return false;
  }
  
  return status === 'completed';
}

/**
 * Ask a question about a document
 * @param {string} documentId - Document ID
 * @param {string} question - Question to ask
 * @returns {Promise<string>} Answer
 */
async function askQuestion(documentId, question) {
  console.log(`Asking question: "${question}" for document: ${documentId}...`);
  
  try {
    const response = await axios.post(`${config.apiUrl}/api/documents/${documentId}/query`, {
      query: question
    }, {
      timeout: config.timeout
    });
    
    console.log('Query response:', response.data);
    
    if (response.data.success) {
      console.log(`Answer: ${response.data.answer}`);
      return response.data.answer;
    } else {
      throw new Error(`Query failed: ${response.data.error}`);
    }
  } catch (error) {
    console.error('Query failed:', error.message);
    throw error;
  }
}

/**
 * Run the test
 */
async function runTest() {
  console.log('Starting document upload and processing test...');
  
  try {
    // Upload document
    const documentId = await uploadDocument(config.testPdfPath);
    
    // Wait for processing to complete
    const processingSuccess = await waitForProcessingComplete(documentId);
    
    if (!processingSuccess) {
      console.error('Document processing failed');
      return;
    }
    
    // Ask questions
    const questions = [
      'What is this document about?',
      'What is the total value of the portfolio?',
      'What securities are in the portfolio?',
      'What is the asset allocation?'
    ];
    
    for (const question of questions) {
      try {
        const answer = await askQuestion(documentId, question);
        console.log(`Question: ${question}`);
        console.log(`Answer: ${answer}`);
        console.log('---');
      } catch (error) {
        console.error(`Failed to get answer for question: ${question}`);
      }
    }
    
    console.log('Test completed successfully');
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

// Run the test
runTest();
