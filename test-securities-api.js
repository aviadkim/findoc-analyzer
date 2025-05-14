/**
 * Securities API Test Script
 * Tests the securities API endpoints
 */
const express = require('express');
const app = express();
const port = 8082; // Use a different port to avoid conflicts

// Configure middleware
app.use(express.json());

// Create mock document for testing
const fs = require('fs');
const path = require('path');
const mockDocument = {
  id: 'doc-123',
  title: 'Test Financial Document',
  text: 'This is a test financial document with some stocks like Apple and Microsoft.',
  tables: [
    {
      title: 'Securities',
      headers: ['Name', 'ISIN', 'Quantity', 'Price'],
      rows: [
        ['Apple Inc.', 'US0378331005', '100', '150.00'],
        ['Microsoft Corp.', 'US5949181045', '50', '245.00'],
        ['Amazon.com Inc.', 'US0231351067', '25', '120.00']
      ]
    }
  ]
};

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Write mock document to disk
fs.writeFileSync(
  path.join(uploadsDir, 'doc-123.json'),
  JSON.stringify(mockDocument, null, 2)
);

// Import services needed for the test
const documentSecuritiesService = require('./services/document-securities-service');

// Set up document securities routes
app.get('/api/documents/:documentId/securities', async (req, res) => {
  const { documentId } = req.params;
  const { includeMarketData } = req.query;
  
  try {
    const securities = await documentSecuritiesService.getSecuritiesForDocument(documentId, { includeMarketData });
    res.json({
      success: true,
      documentId,
      count: securities.length,
      securities,
      includesMarketData: includeMarketData !== 'false',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error(`Error getting securities for document ${documentId}:`, error);
    res.status(500).json({
      success: false,
      message: 'Failed to get securities for document',
      error: error.message
    });
  }
});

app.put('/api/documents/:documentId/securities', async (req, res) => {
  const { documentId } = req.params;
  const { securities } = req.body;
  
  if (!securities || !Array.isArray(securities)) {
    return res.status(400).json({
      success: false,
      message: 'Valid securities array is required'
    });
  }
  
  try {
    const result = await documentSecuritiesService.updateSecuritiesForDocument(documentId, securities);
    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error(`Error updating securities for document ${documentId}:`, error);
    res.status(500).json({
      success: false,
      message: 'Failed to update securities for document',
      error: error.message
    });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Securities API Test Server running on port ${port}`);
  console.log('Test endpoints:');
  console.log(`- GET http://localhost:${port}/api/documents/doc-123/securities - Get securities for the test document`);
  console.log(`- PUT http://localhost:${port}/api/documents/doc-123/securities - Update securities for the test document`);
  console.log('Press Ctrl+C to stop the server');
});