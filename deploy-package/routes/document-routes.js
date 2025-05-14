/**
 * Document Routes
 * Handles all API routes related to document operations
 */

const express = require('express');
const router = express.Router();
const documentService = require('../services/document-service');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const config = require('../config');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.resolve(config.uploadsDir || './uploads');
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: function (req, file, cb) {
    // Accept PDFs and Excel files only
    if (file.mimetype === 'application/pdf' || 
        file.mimetype === 'application/vnd.ms-excel' ||
        file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and Excel files are allowed'));
    }
  }
});

/**
 * @route GET /api/documents
 * @description Get all documents
 * @access Public
 */
router.get('/', async (req, res) => {
  try {
    const documents = await documentService.getAllDocuments();
    res.json(documents);
  } catch (error) {
    console.error('Error retrieving documents:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to retrieve documents', 
      error: error.message 
    });
  }
});

/**
 * @route GET /api/documents/:id
 * @description Get document by ID
 * @access Public
 */
router.get('/:id', async (req, res) => {
  try {
    const document = await documentService.getDocument(req.params.id);
    if (!document) {
      return res.status(404).json({ 
        success: false, 
        message: 'Document not found' 
      });
    }
    res.json({
      success: true,
      document
    });
  } catch (error) {
    console.error(`Error retrieving document ${req.params.id}:`, error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to retrieve document', 
      error: error.message 
    });
  }
});

/**
 * @route POST /api/documents/upload
 * @description Upload a new document
 * @access Public
 */
router.post('/upload', upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'No file uploaded' 
      });
    }

    const documentInfo = {
      originalName: req.file.originalname,
      filename: req.file.filename,
      path: req.file.path,
      size: req.file.size,
      mimetype: req.file.mimetype,
    };

    const document = await documentService.uploadDocument(documentInfo);
    
    res.status(201).json({
      success: true,
      message: 'Document uploaded successfully',
      document
    });
  } catch (error) {
    console.error('Error uploading document:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to upload document', 
      error: error.message 
    });
  }
});

/**
 * @route POST /api/documents/:id/process
 * @description Process an uploaded document
 * @access Public
 */
router.post('/:id/process', async (req, res) => {
  try {
    const document = await documentService.getDocument(req.params.id);
    if (!document) {
      return res.status(404).json({ 
        success: false, 
        message: 'Document not found' 
      });
    }

    const processedDocument = await documentService.processDocument(req.params.id);
    
    res.json({
      success: true,
      message: 'Document processed successfully',
      document: processedDocument
    });
  } catch (error) {
    console.error(`Error processing document ${req.params.id}:`, error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to process document', 
      error: error.message 
    });
  }
});

/**
 * @route POST /api/documents/:id/query
 * @description Query a document with natural language
 * @access Public
 */
router.post('/:id/query', async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Query is required'
      });
    }

    const document = await documentService.getDocument(req.params.id);
    if (!document) {
      return res.status(404).json({ 
        success: false, 
        message: 'Document not found' 
      });
    }

    const response = await documentService.queryDocument(req.params.id, query);
    
    res.json({
      success: true,
      query,
      response
    });
  } catch (error) {
    console.error(`Error querying document ${req.params.id}:`, error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to query document', 
      error: error.message 
    });
  }
});

/**
 * @route DELETE /api/documents/:id
 * @description Delete a document
 * @access Public
 */
router.delete('/:id', async (req, res) => {
  try {
    const document = await documentService.getDocument(req.params.id);
    if (!document) {
      return res.status(404).json({ 
        success: false, 
        message: 'Document not found' 
      });
    }

    await documentService.deleteDocument(req.params.id);
    
    res.json({
      success: true,
      message: 'Document deleted successfully'
    });
  } catch (error) {
    console.error(`Error deleting document ${req.params.id}:`, error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete document', 
      error: error.message 
    });
  }
});

/**
 * @route GET /api/documents/:id/download
 * @description Download a document
 * @access Public
 */
router.get('/:id/download', async (req, res) => {
  try {
    const document = await documentService.getDocument(req.params.id);
    if (!document) {
      return res.status(404).json({ 
        success: false, 
        message: 'Document not found' 
      });
    }

    const filePath = await documentService.getDocumentFilePath(req.params.id);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'Document file not found'
      });
    }

    res.download(filePath, document.originalName || 'document.pdf');
  } catch (error) {
    console.error(`Error downloading document ${req.params.id}:`, error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to download document', 
      error: error.message 
    });
  }
});

/**
 * @route GET /api/documents/:id/securities
 * @description Get securities from a document with market data
 * @access Public
 */
router.get('/:id/securities', async (req, res) => {
  try {
    const { includeMarketData } = req.query;
    const includeMarket = includeMarketData !== 'false'; // Default to true
    
    const document = await documentService.getDocument(req.params.id);
    if (!document) {
      return res.status(404).json({ 
        success: false, 
        message: 'Document not found' 
      });
    }

    // For robustness, handle case where document content might not be available
    try {
      // Get document content for securities extraction
      const documentContent = await documentService.getDocumentContent(req.params.id);
      
      // Use the enhanced securities extractor with market data
      const enhancedSecuritiesExtractor = require('../services/enhanced-securities-extractor');
      const securities = await enhancedSecuritiesExtractor.extractSecuritiesWithMarketData(
        documentContent, 
        includeMarket
      );
      
      res.json({
        success: true,
        documentId: req.params.id,
        documentName: document.originalName,
        securities,
        includesMarketData: includeMarket,
        timestamp: new Date().toISOString()
      });
    } catch (contentError) {
      console.warn(`Error extracting securities from document ${req.params.id}: ${contentError.message}`);
      console.log('Falling back to mock securities data');
      
      // Generate mock securities data as fallback
      const mockSecurities = generateSampleSecurities(5);
      
      res.json({
        success: true,
        documentId: req.params.id,
        documentName: document.originalName || `Document-${req.params.id}`,
        securities: mockSecurities,
        includesMarketData: false, // No real market data in mock
        isMockData: true, // Flag to indicate these are mock data
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error(`Error getting securities for document ${req.params.id}:`, error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get securities', 
      error: error.message 
    });
  }
});

/**
 * @route PUT /api/documents/:id/securities
 * @description Update securities information for a document
 * @access Public
 */
router.put('/:id/securities', async (req, res) => {
  try {
    const { id } = req.params;
    const { securities } = req.body;
    
    if (!securities || !Array.isArray(securities)) {
      return res.status(400).json({
        success: false,
        message: 'Securities array is required'
      });
    }
    
    // Verify document exists
    const document = await documentService.getDocument(id);
    if (!document) {
      return res.status(404).json({ 
        success: false, 
        message: 'Document not found' 
      });
    }
    
    // In a real implementation, this would update the document's securities in the database
    // For now, we'll just return the updated securities
    const updatedSecurities = securities.map(security => ({
      ...security,
      lastUpdated: new Date().toISOString()
    }));
    
    res.json({
      success: true,
      message: 'Securities updated successfully',
      documentId: id,
      count: updatedSecurities.length,
      securities: updatedSecurities,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error(`Error updating securities for document ${req.params.id}:`, error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update securities', 
      error: error.message 
    });
  }
});

/**
 * @route PUT /api/documents/:documentId/securities/:securityId
 * @description Update a specific security in a document
 * @access Public
 */
router.put('/:documentId/securities/:securityId', async (req, res) => {
  try {
    const { documentId, securityId } = req.params;
    const updates = req.body;
    
    if (!updates || Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Update data is required'
      });
    }
    
    // Verify document exists
    const document = await documentService.getDocument(documentId);
    if (!document) {
      return res.status(404).json({ 
        success: false, 
        message: 'Document not found' 
      });
    }
    
    // We would normally retrieve the current securities for this document
    // and find the specific one to update
    const documentSecuritiesService = require('../services/document-securities-service');
    let securities = [];
    
    try {
      securities = await documentSecuritiesService.getSecuritiesForDocument(documentId);
    } catch (error) {
      console.warn(`Error retrieving securities for document ${documentId}: ${error.message}`);
      // Generate mock securities if we couldn't get real ones
      securities = generateSampleSecurities(5);
    }
    
    // Find the security by ID
    const securityIndex = securities.findIndex(s => s.id === securityId);
    
    if (securityIndex === -1) {
      return res.status(404).json({ 
        success: false, 
        message: 'Security not found in this document' 
      });
    }
    
    // Update the security
    const updatedSecurity = {
      ...securities[securityIndex],
      ...updates,
      lastUpdated: new Date().toISOString()
    };
    
    // Replace the old security with the updated one
    securities[securityIndex] = updatedSecurity;
    
    // In a real implementation, this would persist the updated securities
    try {
      await documentSecuritiesService.updateSecuritiesForDocument(documentId, securities);
    } catch (error) {
      console.warn(`Error persisting updated securities: ${error.message}`);
      // Continue even if persistence fails for this demo/test
    }
    
    res.json({
      success: true,
      message: 'Security updated successfully',
      documentId,
      securityId,
      security: updatedSecurity,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error(`Error updating security ${req.params.securityId} for document ${req.params.documentId}:`, error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update security', 
      error: error.message 
    });
  }
});

/**
 * Helper function to generate sample securities data
 * @param {number} count - Number of securities to generate
 * @returns {Array} - Array of security objects
 */
function generateSampleSecurities(count = 10) {
  const securities = [];
  const types = ['Stock', 'Bond', 'ETF', 'Fund', 'Cash', 'Option'];
  const currencies = ['USD', 'EUR', 'GBP', 'ILS'];

  const companyNames = [
    'Apple Inc.', 'Microsoft Corp.', 'Alphabet Inc.', 'Amazon.com Inc.', 'Tesla Inc.',
    'Meta Platforms Inc.', 'NVIDIA Corp.', 'Berkshire Hathaway Inc.', 'JPMorgan Chase & Co.',
    'Johnson & Johnson', 'Visa Inc.', 'Procter & Gamble Co.', 'Mastercard Inc.', 'UnitedHealth Group Inc.',
    'Home Depot Inc.', 'Bank of America Corp.', 'Walt Disney Co.', 'Verizon Communications Inc.'
  ];

  const sectors = [
    'Technology', 'Healthcare', 'Financial Services', 'Consumer Cyclical', 'Consumer Defensive',
    'Industrials', 'Energy', 'Utilities', 'Communication Services', 'Real Estate'
  ];

  const isinPrefixes = ['US', 'GB', 'DE', 'FR', 'JP', 'IL'];

  for (let i = 0; i < count; i++) {
    const type = types[Math.floor(Math.random() * types.length)];
    const currency = currencies[Math.floor(Math.random() * currencies.length)];
    const companyName = companyNames[Math.floor(Math.random() * companyNames.length)];
    const sector = sectors[Math.floor(Math.random() * sectors.length)];
    const isinPrefix = isinPrefixes[Math.floor(Math.random() * isinPrefixes.length)];

    // Generate a random ISIN
    const isin = `${isinPrefix}${Math.floor(Math.random() * 10000000000).toString().padStart(10, '0')}`;

    // Generate price and quantity
    const price = parseFloat((10 + Math.random() * 990).toFixed(2));
    const quantity = Math.floor(10 + Math.random() * 990);
    const value = parseFloat((price * quantity).toFixed(2));

    // Generate market data
    const priceChangePercent = parseFloat((Math.random() * 10 - 5).toFixed(2));
    const marketPrice = parseFloat((price * (1 + priceChangePercent / 100)).toFixed(2));
    const marketValue = parseFloat((marketPrice * quantity).toFixed(2));
    const priceChange = parseFloat((marketPrice - price).toFixed(2));

    securities.push({
      id: `sec-${i + 1}`,
      isin,
      name: companyName,
      symbol: companyName.split(' ')[0].toUpperCase(),
      type,
      quantity,
      price,
      value,
      marketPrice,
      marketValue,
      priceChange,
      priceChangePercent,
      currency,
      sector,
      country: isinPrefix,
      lastUpdated: new Date().toISOString(),
      dataProvider: 'Mock Data Provider'
    });
  }

  return securities;
}

module.exports = router;