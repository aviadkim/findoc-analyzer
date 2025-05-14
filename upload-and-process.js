const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');

// Configuration
const API_URL = 'https://backv2-app-brfi73d4ra-zf.a.run.app';
const PDF_PATH = path.join(__dirname, 'messos.pdf');
const DOCUMENT_TYPE = 'portfolio';

async function uploadPDF() {
  try {
    console.log(`Uploading ${PDF_PATH} to ${API_URL}...`);
    
    // Create form data
    const formData = new FormData();
    formData.append('file', fs.createReadStream(PDF_PATH));
    formData.append('documentType', DOCUMENT_TYPE);
    
    // Upload the file
    const uploadResponse = await axios.post(`${API_URL}/api/upload`, formData, {
      headers: {
        ...formData.getHeaders(),
      },
    });
    
    console.log('Upload response:', uploadResponse.data);
    
    if (uploadResponse.data.success) {
      const documentId = uploadResponse.data.documentId;
      console.log(`Document uploaded successfully with ID: ${documentId}`);
      
      // Process the document
      console.log(`Processing document ${documentId}...`);
      const processResponse = await axios.post(`${API_URL}/api/process`, {
        documentId,
      });
      
      console.log('Process response:', processResponse.data);
      
      if (processResponse.data.success) {
        console.log('Document processed successfully!');
        
        // Ask questions about the document
        await askQuestions(documentId);
      } else {
        console.error('Failed to process document:', processResponse.data.error);
      }
    } else {
      console.error('Failed to upload document:', uploadResponse.data.error);
    }
  } catch (error) {
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
  }
}

async function askQuestions(documentId) {
  const questions = [
    'What is the total value of the portfolio?',
    'What are the top 3 holdings in the portfolio?',
    'What is the percentage of Apple stock in the portfolio?',
    'What is the average acquisition price of Microsoft shares?'
  ];
  
  console.log('\n--- Asking questions about the document ---\n');
  
  for (const question of questions) {
    try {
      console.log(`Q: ${question}`);
      
      const response = await axios.post(`${API_URL}/api/chat`, {
        documentId,
        message: question,
      });
      
      if (response.data.success) {
        console.log(`A: ${response.data.response}`);
      } else {
        console.error('Failed to get answer:', response.data.error);
      }
      
      console.log(); // Add empty line for readability
    } catch (error) {
      console.error(`Error asking question "${question}":`, error.message);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
      }
    }
  }
}

// Run the script
uploadPDF();
