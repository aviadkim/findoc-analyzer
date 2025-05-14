/**
 * Process API Routes
 * Routes for document processing
 */

const express = require('express');
const router = express.Router();
const documentService = require('../services/document-service');

/**
 * Process a document
 * Method: POST
 * Route: /api/process/document
 */
router.post('/process/document', async (req, res) => {
  try {
    const { documentId } = req.body;

    if (!documentId) {
      return res.status(400).json({
        success: false,
        message: 'Document ID is required'
      });
    }

    // Get the document
    const document = await documentService.getDocument(documentId);
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Process the document
    const processedDocument = await documentService.processDocument(documentId);

    res.json({
      success: true,
      message: 'Document processed successfully',
      document: processedDocument
    });
  } catch (error) {
    console.error(`Error processing document:`, error);
    res.status(500).json({
      success: false,
      message: 'Failed to process document',
      error: error.message
    });
  }
});

/**
 * Get processing status
 * Method: GET
 * Route: /api/process/status
 */
router.get('/process/status', (req, res) => {
  // Mock processing status
  const status = {
    active: true,
    queued: 2,
    completed: 15,
    failed: 1,
    lastUpdated: new Date().toISOString()
  };

  res.json({
    success: true,
    status
  });
});

/**
 * Get processing history
 * Method: GET
 * Route: /api/process/history
 */
router.get('/process/history', (req, res) => {
  // Mock processing history
  const history = [
    {
      id: 'proc1',
      documentId: 'doc1',
      status: 'completed',
      startTime: new Date(Date.now() - 3600000).toISOString(),
      endTime: new Date(Date.now() - 3540000).toISOString(),
      duration: '1m 0s'
    },
    {
      id: 'proc2',
      documentId: 'doc2',
      status: 'completed',
      startTime: new Date(Date.now() - 2700000).toISOString(),
      endTime: new Date(Date.now() - 2640000).toISOString(),
      duration: '1m 0s'
    },
    {
      id: 'proc3',
      documentId: 'doc3',
      status: 'failed',
      startTime: new Date(Date.now() - 1800000).toISOString(),
      endTime: new Date(Date.now() - 1785000).toISOString(),
      duration: '0m 15s',
      error: 'Document format not supported'
    },
    {
      id: 'proc4',
      documentId: 'doc4',
      status: 'processing',
      startTime: new Date(Date.now() - 300000).toISOString(),
      endTime: null,
      duration: 'ongoing'
    }
  ];

  res.json({
    success: true,
    history
  });
});

/**
 * Cancel processing
 * Method: POST
 * Route: /api/process/cancel
 */
router.post('/process/cancel', (req, res) => {
  const { processId } = req.body;

  if (!processId) {
    return res.status(400).json({
      success: false,
      message: 'Process ID is required'
    });
  }

  // Mock cancellation
  res.json({
    success: true,
    message: `Process ${processId} has been cancelled`,
    processId
  });
});

module.exports = router;
