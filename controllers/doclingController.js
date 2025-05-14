/**
 * Docling Controller
 *
 * This controller provides Docling integration for enhanced PDF processing.
 */

const fs = require('fs');
const path = require('path');
const doclingIntegration = require('../docling-integration');

/**
 * Process a document with Docling
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @returns {Promise<void>}
 */
const processDocumentWithDocling = async (req, res) => {
  try {
    console.log('Processing document with Docling...');
    
    // Get document ID
    const documentId = req.params.id;
    const documentPath = path.join(__dirname, '..', 'uploads', documentId);
    
    if (!fs.existsSync(documentPath)) {
      return res.status(404).json({
        success: false,
        error: 'Document not found',
        message: `Document with ID ${documentId} not found`
      });
    }
    
    // Process the document with Docling
    const results = await doclingIntegration.processDocument(documentId);
    
    // Return results
    res.status(200).json({
      success: true,
      message: 'Document processed successfully with Docling',
      data: results
    });
  } catch (error) {
    console.error('Error processing document with Docling:', error);
    
    res.status(500).json({
      success: false,
      error: 'Error processing document with Docling',
      message: error.message
    });
  }
};

/**
 * Extract tables from a document with Docling
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @returns {Promise<void>}
 */
const extractTablesWithDocling = async (req, res) => {
  try {
    console.log('Extracting tables with Docling...');
    
    // Get document ID
    const documentId = req.params.id;
    const documentPath = path.join(__dirname, '..', 'uploads', documentId);
    
    if (!fs.existsSync(documentPath)) {
      return res.status(404).json({
        success: false,
        error: 'Document not found',
        message: `Document with ID ${documentId} not found`
      });
    }
    
    // Extract tables with Docling
    const tables = await doclingIntegration.extractTables(documentId);
    
    // Return results
    res.status(200).json({
      success: true,
      message: 'Tables extracted successfully with Docling',
      data: tables
    });
  } catch (error) {
    console.error('Error extracting tables with Docling:', error);
    
    res.status(500).json({
      success: false,
      error: 'Error extracting tables with Docling',
      message: error.message
    });
  }
};

/**
 * Extract securities from a document with Docling
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @returns {Promise<void>}
 */
const extractSecuritiesWithDocling = async (req, res) => {
  try {
    console.log('Extracting securities with Docling...');
    
    // Get document ID
    const documentId = req.params.id;
    const documentPath = path.join(__dirname, '..', 'uploads', documentId);
    
    if (!fs.existsSync(documentPath)) {
      return res.status(404).json({
        success: false,
        error: 'Document not found',
        message: `Document with ID ${documentId} not found`
      });
    }
    
    // Extract securities with Docling
    const securities = await doclingIntegration.extractSecurities(documentId);
    
    // Return results
    res.status(200).json({
      success: true,
      message: 'Securities extracted successfully with Docling',
      data: securities
    });
  } catch (error) {
    console.error('Error extracting securities with Docling:', error);
    
    res.status(500).json({
      success: false,
      error: 'Error extracting securities with Docling',
      message: error.message
    });
  }
};

/**
 * Analyze a financial document with Docling
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @returns {Promise<void>}
 */
const analyzeFinancialDocumentWithDocling = async (req, res) => {
  try {
    console.log('Analyzing financial document with Docling...');
    
    // Get document ID
    const documentId = req.params.id;
    const documentPath = path.join(__dirname, '..', 'uploads', documentId);
    
    if (!fs.existsSync(documentPath)) {
      return res.status(404).json({
        success: false,
        error: 'Document not found',
        message: `Document with ID ${documentId} not found`
      });
    }
    
    // Analyze financial document with Docling
    const analysis = await doclingIntegration.analyzeFinancialDocument(documentId);
    
    // Return results
    res.status(200).json({
      success: true,
      message: 'Financial document analysis completed successfully with Docling',
      data: analysis
    });
  } catch (error) {
    console.error('Error analyzing financial document with Docling:', error);
    
    res.status(500).json({
      success: false,
      error: 'Error analyzing financial document with Docling',
      message: error.message
    });
  }
};

/**
 * Compare Docling results with scan1 results
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @returns {Promise<void>}
 */
const compareWithScan1 = async (req, res) => {
  try {
    console.log('Comparing Docling results with scan1 results...');
    
    // Get document ID
    const documentId = req.params.id;
    
    // Compare results
    const comparison = await doclingIntegration.compareWithScan1(documentId);
    
    // Return results
    res.status(200).json({
      success: true,
      message: 'Comparison completed successfully',
      data: comparison
    });
  } catch (error) {
    console.error('Error comparing results:', error);
    
    res.status(500).json({
      success: false,
      error: 'Error comparing results',
      message: error.message
    });
  }
};

/**
 * Get Docling status
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @returns {Promise<void>}
 */
const getDoclingStatus = async (req, res) => {
  try {
    console.log('Getting Docling status...');
    
    // Check if Docling API key is set
    const doclingApiKey = process.env.DOCLING_API_KEY || 'your-api-key';
    const isDoclingConfigured = doclingApiKey !== 'your-api-key';
    
    // Return status
    res.status(200).json({
      success: true,
      doclingConfigured: isDoclingConfigured,
      environment: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch
      }
    });
  } catch (error) {
    console.error('Error getting Docling status:', error);
    
    res.status(500).json({
      success: false,
      error: 'Error getting Docling status',
      message: error.message
    });
  }
};

module.exports = {
  processDocumentWithDocling,
  extractTablesWithDocling,
  extractSecuritiesWithDocling,
  analyzeFinancialDocumentWithDocling,
  compareWithScan1,
  getDoclingStatus
};
