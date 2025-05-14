/**
 * Test Docling Integration with Cloud Deployment
 * 
 * This script tests the Docling integration with the cloud deployment of FinDoc Analyzer.
 */

const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');

// Configuration
const config = {
  cloudUrl: 'https://backv2-app-brfi73d4ra-zf.a.run.app', // Cloud deployment URL
  testPdfPath: path.join(__dirname, 'test-files', 'test.pdf'),
  outputDir: path.join(__dirname, 'test-results'),
  tempDir: path.join(__dirname, 'temp')
};

// Create test directories
fs.mkdirSync(config.outputDir, { recursive: true });
fs.mkdirSync(config.tempDir, { recursive: true });
fs.mkdirSync(path.join(__dirname, 'test-files'), { recursive: true });

// Create a test PDF if it doesn't exist
const createTestPdf = () => {
  if (fs.existsSync(config.testPdfPath)) {
    console.log(`Test PDF already exists at ${config.testPdfPath}`);
    return;
  }
  
  console.log(`Creating test PDF at ${config.testPdfPath}`);
  
  // Create a simple PDF with some text and an ISIN code
  const pdfContent = `
%PDF-1.5
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>
endobj
4 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
5 0 obj
<< /Length 178 >>
stream
BT
/F1 12 Tf
72 720 Td
(This is a test PDF document for Docling integration testing.) Tj
0 -20 Td
(It contains an ISIN code: US0378331005 (Apple Inc.)) Tj
0 -20 Td
(And another one: US5949181045 (Microsoft Corporation)) Tj
ET
endstream
endobj
xref
0 6
0000000000 65535 f
0000000010 00000 n
0000000059 00000 n
0000000118 00000 n
0000000217 00000 n
0000000284 00000 n
trailer
<< /Size 6 /Root 1 0 R >>
startxref
514
%%EOF
`;
  
  fs.writeFileSync(config.testPdfPath, pdfContent);
};

// Check Docling status on cloud deployment
const checkDoclingStatus = async () => {
  try {
    console.log('Checking Docling status on cloud deployment...');
    
    const response = await axios.get(`${config.cloudUrl}/api/docling/status`);
    
    console.log('Docling status response:', response.data);
    
    return response.data;
  } catch (error) {
    console.error('Error checking Docling status:', error.message);
    
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
    
    return { success: false, error: error.message };
  }
};

// Upload a document to the cloud deployment
const uploadDocument = async () => {
  try {
    console.log(`Uploading document ${config.testPdfPath} to cloud deployment...`);
    
    const formData = new FormData();
    formData.append('file', fs.createReadStream(config.testPdfPath));
    
    const response = await axios.post(`${config.cloudUrl}/api/documents/upload`, formData, {
      headers: {
        ...formData.getHeaders()
      }
    });
    
    console.log('Upload response:', response.data);
    
    return response.data;
  } catch (error) {
    console.error('Error uploading document:', error.message);
    
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
    
    return { success: false, error: error.message };
  }
};

// Process a document with Docling on cloud deployment
const processDocumentWithDocling = async (documentId) => {
  try {
    console.log(`Processing document ${documentId} with Docling on cloud deployment...`);
    
    const response = await axios.post(`${config.cloudUrl}/api/docling/process/${documentId}`);
    
    console.log('Processing response:', response.data);
    
    // Save the results
    const resultsPath = path.join(config.outputDir, 'docling-cloud-results.json');
    fs.writeFileSync(resultsPath, JSON.stringify(response.data, null, 2));
    console.log(`Results saved to ${resultsPath}`);
    
    return response.data;
  } catch (error) {
    console.error('Error processing document with Docling:', error.message);
    
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
    
    return { success: false, error: error.message };
  }
};

// Process a document with scan1 and Docling on cloud deployment
const processDocumentWithScan1AndDocling = async (documentId) => {
  try {
    console.log(`Processing document ${documentId} with scan1 and Docling on cloud deployment...`);
    
    const response = await axios.post(`${config.cloudUrl}/api/scan1/process/${documentId}?useDocling=true`);
    
    console.log('Processing response:', response.data);
    
    // Save the results
    const resultsPath = path.join(config.outputDir, 'scan1-docling-cloud-results.json');
    fs.writeFileSync(resultsPath, JSON.stringify(response.data, null, 2));
    console.log(`Results saved to ${resultsPath}`);
    
    return response.data;
  } catch (error) {
    console.error('Error processing document with scan1 and Docling:', error.message);
    
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
    
    return { success: false, error: error.message };
  }
};

// Run the tests
const runTests = async () => {
  try {
    // Create test PDF
    createTestPdf();
    
    // Check Docling status on cloud deployment
    const doclingStatus = await checkDoclingStatus();
    
    if (!doclingStatus.success) {
      console.log('Docling is not available on cloud deployment, skipping document processing');
      return;
    }
    
    // Upload document to cloud deployment
    const uploadResult = await uploadDocument();
    
    if (!uploadResult.success) {
      console.log('Failed to upload document to cloud deployment, skipping document processing');
      return;
    }
    
    const documentId = uploadResult.data.id;
    
    // Process document with Docling on cloud deployment
    await processDocumentWithDocling(documentId);
    
    // Process document with scan1 and Docling on cloud deployment
    await processDocumentWithScan1AndDocling(documentId);
    
    console.log('Tests completed');
  } catch (error) {
    console.error('Error running tests:', error);
  }
};

// Run the tests if this file is executed directly
if (require.main === module) {
  runTests();
}

module.exports = {
  runTests,
  checkDoclingStatus,
  uploadDocument,
  processDocumentWithDocling,
  processDocumentWithScan1AndDocling
};
