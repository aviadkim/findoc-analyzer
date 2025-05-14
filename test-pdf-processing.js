/**
 * Test PDF Processing Script
 * 
 * This script demonstrates processing a PDF file through the PDF processing server
 */

const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');

// API endpoint - based on server implementation
const API_URL = 'http://localhost:8080/api/process';
const API_SAMPLE_URL = 'http://localhost:8080/api/process-sample';

// Sample PDF path
const PDF_PATH = path.join(__dirname, 'test-pdfs', 'messos.pdf');

// Process the PDF using the sample endpoint for simplicity
async function processPdf() {
  console.log('Processing sample PDF...');
  
  try {
    // Send request to process a sample
    console.log('Sending request to server...');
    const response = await axios.get(`${API_SAMPLE_URL}?processingType=mcp`);
    
    // Save the document ID for later use
    const documentId = response.data.id;
    
    console.log('PDF processing successful\!');
    console.log('Document ID:', documentId);
    
    if (response.data.summary) {
      console.log('Summary:', JSON.stringify(response.data.summary, null, 2));
    } else {
      console.log('Response data:', JSON.stringify(response.data, null, 2));
    }
    
    // Get all processed documents
    console.log('\nFetching all processed documents...');
    const documentsResponse = await axios.get('http://localhost:8080/api/documents');
    console.log('Documents:', JSON.stringify(documentsResponse.data, null, 2));
    
    // Save response to file
    fs.writeFileSync(
      path.join(__dirname, 'pdf-processing-results.json'),
      JSON.stringify(response.data, null, 2)
    );
    
    console.log('\nResults saved to pdf-processing-results.json');
    console.log('\nPDF processing demonstration complete\!');
    console.log('You can view the full UI interface at: http://localhost:8080');
  } catch (error) {
    console.error('Error processing PDF:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
  }
}

// Run the function
processPdf();

