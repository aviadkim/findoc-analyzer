/**
 * Test Document Upload
 * 
 * A script to test uploading a document to the enhanced API.
 */

const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');

const testDocumentUpload = async () => {
  try {
    console.log('Testing document upload to enhanced API...');
    
    // Check if sample PDF exists
    const samplePdfPath = path.join(__dirname, 'test_pdfs', 'sample.pdf');
    
    if (!fs.existsSync(samplePdfPath)) {
      console.error(`Sample PDF not found at ${samplePdfPath}`);
      return false;
    }
    
    console.log(`Found sample PDF at ${samplePdfPath}`);
    
    // Create form data
    const formData = new FormData();
    formData.append('file', fs.createReadStream(samplePdfPath));
    
    // Upload document
    console.log('Uploading document to /api/enhanced/documents...');
    
    const response = await axios.post(
      'http://localhost:8080/api/enhanced/documents',
      formData,
      {
        headers: {
          ...formData.getHeaders()
        }
      }
    );
    
    console.log('Upload response:', response.data);
    
    if (response.data.success) {
      console.log('Document uploaded successfully!');
      
      // Store document ID for further testing
      const documentId = response.data.data.id;
      console.log(`Document ID: ${documentId}`);
      
      // Save document ID to a file for later use
      fs.writeFileSync('last-document-id.txt', documentId);
      
      return documentId;
    } else {
      console.error('Document upload failed:', response.data.error);
      return false;
    }
  } catch (error) {
    console.error('Error uploading document:', error.message);
    
    if (error.response) {
      console.error('Server response:', error.response.data);
    }
    
    return false;
  }
};

testDocumentUpload().then(result => {
  if (!result) {
    process.exit(1);
  }
});
