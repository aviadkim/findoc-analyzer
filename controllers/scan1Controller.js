/**
 * Scan1 Controller
 * This controller handles document scanning and processing with Scan1 service
 * 
 * Enhanced by Claude AI Assistant on May 11, 2025
 */

// Import required modules
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

// Import services
const apiKeyProvider = require('../services/api-key-provider-service');

// Import docling integration
const doclingIntegration = require('../docling-scan1-integration');

// Base URL for Scan1 API (can be overridden with environment variable)
const SCAN1_API_BASE_URL = process.env.SCAN1_API_BASE_URL || 'https://api.findoc-scan1.com/v1';

/**
 * Process a document using Express middleware
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function processDocumentWithScan1(req, res) {
  console.log('Processing document with Scan1');
  
  try {
    // Get document ID from request
    const documentId = req.params.id;
    
    if (!documentId) {
      return res.status(400).json({
        success: false,
        message: 'Document ID is required'
      });
    }
    
    // Log the request
    console.log(`Processing document with ID: ${documentId}`);
    
    // Get API key from request or environment
    let apiKey = req.body.apiKey || req.query.apiKey;
    
    // If no API key provided, try to get from provider
    if (!apiKey) {
      try {
        const tenantId = req.body.tenantId || req.query.tenantId;
        apiKey = await apiKeyProvider.getApiKey('gemini', { tenantId });
      } catch (keyError) {
        console.warn(`Failed to get API key: ${keyError.message}`);
        // Continue without API key (will use basic processing)
      }
    }
    
    // Create a mock document for testing
    const document = {
      id: documentId,
      name: `Document-${documentId}`,
      type: 'pdf',
      createdAt: new Date().toISOString()
    };
    
    // Process the document
    // In a real implementation, this would be an asynchronous process
    setTimeout(() => {
      // Return success response
      res.status(200).json({
        success: true,
        message: 'Document processing started',
        document: {
          id: documentId,
          status: 'processing'
        }
      });
    }, 1000);
  } catch (error) {
    console.error(`Error processing document with Scan1: ${error.message}`);
    
    // Return error response
    res.status(500).json({
      success: false,
      message: 'Error processing document',
      error: error.message
    });
  }
}

/**
 * Process a document directly (non-Express)
 * @param {Object} document - Document object with file path
 * @param {Object} options - Processing options
 * @returns {Promise<Object>} - Processing result
 */
async function processDocument(document, options = {}) {
  try {
    const { id, filePath, name } = document;
    const { apiKey, extractText = true, extractTables = true, extractMetadata = true, extractSecurities = true } = options;
    
    console.log(`Processing document: ${name} (${id})`);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }
    
    // If API key provided, use enhanced processing
    if (apiKey) {
      console.log('Using enhanced processing with API key');
      
      try {
        return await processWithEnhancedApi(filePath, { 
          apiKey, 
          extractText, 
          extractTables, 
          extractMetadata, 
          extractSecurities 
        });
      } catch (enhancedError) {
        console.warn(`Enhanced processing failed: ${enhancedError.message}`);
        console.log('Falling back to basic processing');
      }
    }
    
    // Fallback to basic processing
    console.log('Using basic processing');
    return processWithBasicScanning(filePath);
  } catch (error) {
    console.error(`Error processing document: ${error.message}`);
    throw error;
  }
}

/**
 * Process a document with enhanced API
 * @param {string} filePath - Path to the document file
 * @param {Object} options - Processing options including API key
 * @returns {Promise<Object>} - Processing result
 */
async function processWithEnhancedApi(filePath, options) {
  try {
    const { apiKey, extractText, extractTables, extractMetadata, extractSecurities } = options;
    
    // In a real implementation, this would make API calls to a service
    // For now, return mock data
    return {
      metadata: {
        filename: path.basename(filePath),
        fileType: path.extname(filePath).toLowerCase().slice(1),
        pageCount: 5,
        createdAt: '2023-01-15T10:30:00Z',
        modifiedAt: '2023-02-20T14:45:00Z',
        author: 'Financial Services Inc.'
      },
      text: 'This is enhanced text extracted using the API key. It includes detailed financial information about Apple Inc. and Microsoft Corporation.',
      tables: [
        {
          id: 'table-1',
          title: 'Portfolio Summary',
          headers: ['Security', 'ISIN', 'Quantity', 'Market Value', 'Percentage'],
          rows: [
            ['Apple Inc.', 'US0378331005', '100', '$18,250.00', '14.6%'],
            ['Microsoft Corporation', 'US5949181045', '50', '$15,750.00', '12.6%'],
            ['Amazon.com Inc.', 'US0231351067', '30', '$9,300.00', '7.4%'],
            ['Alphabet Inc.', 'US02079K1079', '20', '$8,500.00', '6.8%'],
            ['Tesla Inc.', 'US88160R1014', '25', '$7,250.00', '5.8%']
          ]
        }
      ],
      securities: [
        { name: 'Apple Inc.', isin: 'US0378331005', ticker: 'AAPL', quantity: 100, marketValue: 18250.00 },
        { name: 'Microsoft Corporation', isin: 'US5949181045', ticker: 'MSFT', quantity: 50, marketValue: 15750.00 },
        { name: 'Amazon.com Inc.', isin: 'US0231351067', ticker: 'AMZN', quantity: 30, marketValue: 9300.00 },
        { name: 'Alphabet Inc.', isin: 'US02079K1079', ticker: 'GOOGL', quantity: 20, marketValue: 8500.00 },
        { name: 'Tesla Inc.', isin: 'US88160R1014', ticker: 'TSLA', quantity: 25, marketValue: 7250.00 }
      ]
    };
  } catch (error) {
    console.error(`Error in enhanced processing: ${error.message}`);
    throw error;
  }
}

/**
 * Process a document with basic scanning
 * @param {string} filePath - Path to the document file
 * @returns {Promise<Object>} - Processing result
 */
function processWithBasicScanning(filePath) {
  // This would implement basic document processing
  // For now, return mock data
  return {
    metadata: {
      filename: path.basename(filePath),
      fileType: path.extname(filePath).toLowerCase().slice(1),
      pageCount: 5
    },
    text: 'This is basic text extracted without using an API key. It contains some financial information.',
    tables: [
      {
        id: 'table-1',
        title: 'Portfolio Summary',
        headers: ['Security', 'ISIN', 'Quantity'],
        rows: [
          ['Apple Inc.', 'US0378331005', '100'],
          ['Microsoft Corporation', 'US5949181045', '50']
        ]
      }
    ],
    securities: [
      { name: 'Apple Inc.', isin: 'US0378331005', ticker: 'AAPL', quantity: 100 },
      { name: 'Microsoft Corporation', isin: 'US5949181045', ticker: 'MSFT', quantity: 50 }
    ]
  };
}

/**
 * Get Scan1 status
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function getScan1Status(req, res) {
  console.log('Getting Scan1 status');
  
  try {
    // Get API key from request or environment
    let apiKey = req.body.apiKey || req.query.apiKey;
    
    // If no API key provided, try to get from provider
    if (!apiKey) {
      try {
        const tenantId = req.body.tenantId || req.query.tenantId;
        apiKey = await apiKeyProvider.getApiKey('gemini', { tenantId });
      } catch (keyError) {
        console.warn(`Failed to get API key: ${keyError.message}`);
        // Continue without API key
      }
    }
    
    // Check if Scan1 is available
    const isAvailable = await isScan1Available(apiKey);
    
    // Get enhanced status if API key is provided
    let enhancedStatus = null;
    if (apiKey) {
      try {
        enhancedStatus = await getEnhancedStatus(apiKey);
      } catch (enhancedError) {
        console.warn(`Failed to get enhanced status: ${enhancedError.message}`);
      }
    }
    
    // Mock status for testing
    const status = enhancedStatus || {
      available: isAvailable,
      version: '1.5.0',
      uptime: '98.5%',
      lastChecked: new Date().toISOString()
    };
    
    // Return success response
    res.status(200).json({
      success: true,
      scan1Available: isAvailable,
      status,
      enhancedAvailable: !!enhancedStatus
    });
  } catch (error) {
    console.error(`Error getting Scan1 status: ${error.message}`);
    
    // Return error response
    res.status(500).json({
      success: false,
      message: 'Error getting Scan1 status',
      error: error.message
    });
  }
}

/**
 * Get enhanced status
 * @param {string} apiKey - API key
 * @returns {Promise<Object>} - Enhanced status
 */
async function getEnhancedStatus(apiKey) {
  try {
    // In a real implementation, this would make an API call
    // For now, return mock status
    return {
      available: true,
      version: '2.0.0',
      uptime: '99.8%',
      lastChecked: new Date().toISOString(),
      apiQuota: {
        daily: 1000,
        used: 357,
        remaining: 643,
        resetAt: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString()
      },
      enhancedFeatures: {
        ocr: true,
        tableDetection: true,
        documentClassification: true,
        entityExtraction: true,
        financialAnalysis: true
      }
    };
  } catch (error) {
    console.error(`Error getting enhanced status: ${error.message}`);
    throw error;
  }
}

/**
 * Verify Gemini API key
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function verifyGeminiApiKey(req, res) {
  console.log('Verifying Gemini API key');
  
  try {
    // Get API key from request
    const apiKey = req.body.apiKey;
    
    if (!apiKey) {
      return res.status(400).json({
        success: false,
        message: 'API key is required'
      });
    }
    
    // Verify API key
    const isValid = await validateApiKey(apiKey);
    
    // Get additional info if API key is valid
    let apiKeyInfo = null;
    if (isValid) {
      try {
        apiKeyInfo = await getApiKeyInfo(apiKey);
      } catch (infoError) {
        console.warn(`Failed to get API key info: ${infoError.message}`);
      }
    }
    
    // Return success response
    res.status(200).json({
      success: true,
      valid: isValid,
      message: isValid ? 'API key is valid' : 'API key is invalid',
      info: apiKeyInfo
    });
  } catch (error) {
    console.error(`Error verifying Gemini API key: ${error.message}`);
    
    // Return error response
    res.status(500).json({
      success: false,
      message: 'Error verifying API key',
      error: error.message
    });
  }
}

/**
 * Validate API key
 * @param {string} apiKey - API key to validate
 * @returns {Promise<boolean>} - Whether the API key is valid
 */
async function validateApiKey(apiKey) {
  try {
    // In a real implementation, this would make an API call
    // For now, use a simple validation
    return apiKey.startsWith('gemini_') && apiKey.length >= 20;
  } catch (error) {
    console.error(`Error validating API key: ${error.message}`);
    throw error;
  }
}

/**
 * Get API key info
 * @param {string} apiKey - API key
 * @returns {Promise<Object>} - API key info
 */
async function getApiKeyInfo(apiKey) {
  try {
    // In a real implementation, this would make an API call
    // For now, return mock info
    return {
      keyType: 'full',
      createdAt: '2023-01-01T00:00:00Z',
      expiresAt: '2024-01-01T00:00:00Z',
      usageLimit: 1000,
      usageCount: 357,
      usageReset: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString()
    };
  } catch (error) {
    console.error(`Error getting API key info: ${error.message}`);
    throw error;
  }
}

/**
 * Check if Scan1 is available
 * @param {string} apiKey - Optional API key for enhanced check
 * @returns {Promise<boolean>} - Whether Scan1 is available
 */
async function isScan1Available(apiKey) {
  try {
    // In a real implementation, this would check the service
    // For now, return mock availability
    return true;
  } catch (error) {
    console.error(`Error checking Scan1 availability: ${error.message}`);
    return false;
  }
}

// Check for Docling integration
let enhancedController = null;
try {
  // Try to enhance the controller with Docling integration
  enhancedController = doclingIntegration.enhanceScan1Controller({
    processDocumentWithScan1,
    processDocument,
    getScan1Status,
    verifyGeminiApiKey,
    isScan1Available
  });
  
  if (enhancedController) {
    console.log('Successfully enhanced scan1Controller with Docling integration');
  } else {
    console.warn('Could not enhance scan1Controller with Docling integration');
  }
} catch (error) {
  console.error(`Error enhancing scan1Controller with Docling: ${error.message}`);
}

// Export the enhanced controller if available, otherwise export the basic controller
module.exports = enhancedController || {
  processDocumentWithScan1,
  processDocument,
  getScan1Status,
  verifyGeminiApiKey,
  isScan1Available
};