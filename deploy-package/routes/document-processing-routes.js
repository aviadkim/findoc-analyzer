/**
 * Document Processing Routes
 * Routes for document processing
 */

const express = require('express');
const router = express.Router();

// Import services
const documentProcessor = require('../services/document-processor');

/**
 * Process a document
 * Method: POST
 * Route: /api/documents/process
 */
router.post('/', async (req, res) => {
  try {
    const { documentId, options } = req.body;
    
    if (!documentId) {
      return res.status(400).json({
        success: false,
        message: 'Document ID is required'
      });
    }
    
    console.log(`Processing document ${documentId} with options:`, options);
    
    // Start processing in the background
    setTimeout(async () => {
      try {
        await documentProcessor.processDocument(documentId, options);
        console.log(`Background processing completed for document: ${documentId}`);
      } catch (error) {
        console.error(`Background processing failed for document ${documentId}: ${error.message}`);
      }
    }, 0);
    
    // Return immediate response
    res.status(200).json({
      success: true,
      message: 'Document processing started',
      documentId,
      status: 'processing'
    });
  } catch (error) {
    console.error(`Error processing document: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Error processing document',
      error: error.message
    });
  }
});

/**
 * Get document status
 * Method: GET
 * Route: /api/documents/:id/status
 */
router.get('/:id/status', async (req, res) => {
  try {
    const documentId = req.params.id;
    
    if (!documentId) {
      return res.status(400).json({
        success: false,
        message: 'Document ID is required'
      });
    }
    
    const status = await documentProcessor.getDocumentStatus(documentId);
    
    res.status(200).json({
      success: true,
      documentId,
      status
    });
  } catch (error) {
    console.error(`Error getting document status: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Error getting document status',
      error: error.message
    });
  }
});

/**
 * Get document content
 * Method: GET
 * Route: /api/documents/:id
 */
router.get('/:id', async (req, res) => {
  try {
    const documentId = req.params.id;
    
    if (!documentId) {
      return res.status(400).json({
        success: false,
        message: 'Document ID is required'
      });
    }
    
    const document = await documentProcessor.getDocumentContent(documentId);
    
    res.status(200).json({
      success: true,
      document
    });
  } catch (error) {
    console.error(`Error getting document content: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Error getting document content',
      error: error.message
    });
  }
});

// Export router
module.exports = router;
