/**
 * Test Scan1 Integration
 * 
 * This script tests the integration with the scan1 controller.
 */

const fs = require('fs');
const path = require('path');
const axios = require('axios');

// Configuration
const config = {
  apiUrl: 'http://localhost:8080',
  testPdfPath: path.join(__dirname, 'test-files', 'test.pdf'),
  outputDir: path.join(__dirname, 'test-results')
};

// Create directories if they don't exist
fs.mkdirSync(path.dirname(config.testPdfPath), { recursive: true });
fs.mkdirSync(config.outputDir, { recursive: true });

// Create a simple PDF for testing
const createTestPdf = () => {
  const pdfContent = `%PDF-1.5
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R >>
endobj
4 0 obj
<< /Length 200 >>
stream
BT
/F1 12 Tf
100 700 Td
(Financial Report 2023) Tj
/F1 10 Tf
100 680 Td
(ISIN: US0378331005 - Apple Inc.) Tj
100 660 Td
(ISIN: US5949181045 - Microsoft) Tj
100 640 Td
(ISIN: US0231351067 - Amazon) Tj
ET
endstream
endobj
xref
0 5
0000000000 65535 f
0000000010 00000 n
0000000059 00000 n
0000000118 00000 n
0000000196 00000 n
trailer
<< /Size 5 /Root 1 0 R >>
startxref
450
%%EOF`;

  fs.writeFileSync(config.testPdfPath, pdfContent);
  console.log(`Created test PDF at ${config.testPdfPath}`);
};

// Check if scan1 is available
const checkScan1Status = async () => {
  try {
    console.log('Checking scan1 status...');
    const response = await axios.get(`${config.apiUrl}/api/scan1/status`);
    console.log('Scan1 status:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error checking scan1 status:', error.message);
    return { available: false };
  }
};

// Check if scan1 is available via document routes
const checkDocumentScan1Status = async () => {
  try {
    console.log('Checking document scan1 status...');
    const response = await axios.get(`${config.apiUrl}/api/documents/scan1/status`);
    console.log('Document scan1 status:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error checking document scan1 status:', error.message);
    return { available: false };
  }
};

// Process a document with scan1
const processDocumentWithScan1 = async (filePath) => {
  try {
    console.log(`Processing document ${filePath} with scan1...`);
    
    // Upload the document
    const formData = new FormData();
    formData.append('document', fs.createReadStream(filePath));
    
    const uploadResponse = await axios.post(`${config.apiUrl}/api/documents/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    console.log('Document uploaded:', uploadResponse.data);
    
    // Process the document with scan1
    const documentId = uploadResponse.data.id;
    const processResponse = await axios.post(`${config.apiUrl}/api/documents/${documentId}/scan1`, {
      options: {
        extractText: true,
        extractTables: true,
        extractSecurities: true,
        generateFinancialSummary: true
      }
    });
    
    console.log('Document processed with scan1:', processResponse.data);
    
    // Save the results
    const resultsPath = path.join(config.outputDir, 'scan1-results.json');
    fs.writeFileSync(resultsPath, JSON.stringify(processResponse.data, null, 2));
    console.log(`Results saved to ${resultsPath}`);
    
    return processResponse.data;
  } catch (error) {
    console.error('Error processing document with scan1:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
    return { success: false, error: error.message };
  }
};

// Process a document with direct scan1 endpoint
const processDocumentWithDirectScan1 = async (filePath) => {
  try {
    console.log(`Processing document ${filePath} with direct scan1 endpoint...`);
    
    // Upload the document to a temporary location
    const tempDir = path.join(__dirname, 'temp');
    fs.mkdirSync(tempDir, { recursive: true });
    const tempFilePath = path.join(tempDir, 'test.pdf');
    fs.copyFileSync(filePath, tempFilePath);
    
    // Process the document with scan1
    const processResponse = await axios.post(`${config.apiUrl}/api/scan1/temp/test.pdf`, {
      options: {
        extractText: true,
        extractTables: true,
        extractSecurities: true,
        generateFinancialSummary: true
      }
    });
    
    console.log('Document processed with direct scan1 endpoint:', processResponse.data);
    
    // Save the results
    const resultsPath = path.join(config.outputDir, 'direct-scan1-results.json');
    fs.writeFileSync(resultsPath, JSON.stringify(processResponse.data, null, 2));
    console.log(`Results saved to ${resultsPath}`);
    
    return processResponse.data;
  } catch (error) {
    console.error('Error processing document with direct scan1 endpoint:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
    return { success: false, error: error.message };
  }
};

// Run the tests
const runTests = async () => {
  try {
    // Create test PDF
    createTestPdf();
    
    // Check scan1 status
    const scan1Status = await checkScan1Status();
    
    // Check document scan1 status
    const documentScan1Status = await checkDocumentScan1Status();
    
    // Process document with scan1
    if (scan1Status.available || documentScan1Status.scan1Available) {
      console.log('Scan1 is available, processing document...');
      
      // Process with document routes
      await processDocumentWithScan1(config.testPdfPath);
      
      // Process with direct scan1 endpoint
      await processDocumentWithDirectScan1(config.testPdfPath);
    } else {
      console.log('Scan1 is not available, skipping document processing');
    }
    
    console.log('Tests completed');
  } catch (error) {
    console.error('Error running tests:', error);
  }
};

// Run the tests
runTests();
