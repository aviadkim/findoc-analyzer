/**
 * Test Real PDF Upload
 *
 * This script tests uploading a real PDF file to the FinDoc Analyzer application.
 */

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

// Configuration
const config = {
  apiBaseUrl: 'http://localhost:8080/api',
  pdfFilePath: process.argv[2] // Pass the PDF file path as a command-line argument
};

/**
 * Upload a PDF file
 * @param {string} filePath - Path to the PDF file
 * @returns {Promise<object>} - Upload response
 */
async function uploadPdf(filePath) {
  try {
    console.log(`Uploading PDF file: ${filePath}`);
    
    // Create form data
    const formData = new FormData();
    formData.append('file', fs.createReadStream(filePath));
    formData.append('extractText', 'true');
    formData.append('extractTables', 'true');
    formData.append('extractMetadata', 'true');
    formData.append('extractSecurities', 'true');
    formData.append('useOcr', 'false');
    
    // Upload PDF
    const response = await axios.post(`${config.apiBaseUrl}/enhanced-pdf/process`, formData, {
      headers: {
        ...formData.getHeaders()
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error uploading PDF:', error);
    
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
    
    throw error;
  }
}

/**
 * Run the test
 */
async function runTest() {
  try {
    // Check if PDF file path is provided
    if (!config.pdfFilePath) {
      console.error('Please provide a PDF file path as a command-line argument');
      process.exit(1);
    }
    
    // Check if file exists
    if (!fs.existsSync(config.pdfFilePath)) {
      console.error(`File not found: ${config.pdfFilePath}`);
      process.exit(1);
    }
    
    // Upload PDF
    const result = await uploadPdf(config.pdfFilePath);
    
    console.log('Upload successful!');
    console.log('Results:', JSON.stringify(result, null, 2));
    
    // Check if processing was successful
    if (result.success) {
      console.log('PDF processing successful');
      
      // Check if there was an error
      if (result.results.error) {
        console.warn('Warning: Processing error occurred:', result.results.error);
      } else {
        console.log('PDF processed without errors');
        
        // Check text extraction
        if (result.results.text) {
          console.log('Text extraction successful');
          console.log('Text length:', result.results.text.length);
          console.log('Text preview:', result.results.text.substring(0, 100) + '...');
        }
        
        // Check table extraction
        if (result.results.tables && result.results.tables.length > 0) {
          console.log('Table extraction successful');
          console.log('Number of tables:', result.results.tables.length);
        }
        
        // Check metadata extraction
        if (result.results.metadata) {
          console.log('Metadata extraction successful');
          console.log('Metadata:', JSON.stringify(result.results.metadata, null, 2));
        }
        
        // Check securities extraction
        if (result.results.securities && result.results.securities.length > 0) {
          console.log('Securities extraction successful');
          console.log('Number of securities:', result.results.securities.length);
        }
      }
    } else {
      console.error('PDF processing failed');
    }
  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  }
}

// Run the test
runTest();
