/**
 * Financial PDF Routes
 * Routes for processing financial PDF documents
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { processPdf, extractText, extractTables, extractMetadata } = require('../services/pdf-processor');
// Use our enhanced financial data extractor
const { extractFinancialData } = require('../services/enhanced-financial-extractor');
const {
  handleDocumentAnalyzerQuery,
  handleTableUnderstandingQuery,
  handleSecuritiesExtractorQuery,
  handleFinancialReasonerQuery,
  handleBloombergAgentQuery
} = require('../services/agent-handlers');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    const uploadDir = process.env.UPLOAD_FOLDER || path.join(__dirname, '..', 'uploads');
    fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: function(req, file, cb) {
    // Generate a unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// File filter to only allow PDFs
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed'), false);
  }
};

// Configure upload middleware
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

/**
 * Upload a financial PDF
 * Method: POST
 * Route: /api/financial-pdf/upload
 */
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Get document type from request body
    const documentType = req.body.documentType || 'financial';

    // Create document object
    const document = {
      id: `doc-${Date.now()}`,
      fileName: req.file.originalname,
      filePath: req.file.path,
      fileSize: req.file.size,
      documentType: documentType,
      uploadDate: new Date().toISOString(),
      processed: false
    };

    // Store document info in memory (in a real app, this would be in a database)
    if (!global.uploadedDocuments) {
      global.uploadedDocuments = [];
    }
    global.uploadedDocuments.push(document);

    // Return success response
    res.status(200).json({
      success: true,
      message: 'File uploaded successfully',
      document: {
        id: document.id,
        fileName: document.fileName,
        fileSize: document.fileSize,
        documentType: document.documentType,
        uploadDate: document.uploadDate
      }
    });
  } catch (error) {
    console.error(`Error uploading file: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Error uploading file',
      error: error.message
    });
  }
});

/**
 * Process a financial PDF
 * Method: POST
 * Route: /api/financial-pdf/process/:id
 */
router.post('/process/:id', async (req, res) => {
  try {
    const documentId = req.params.id;

    // Find document by ID
    const documents = global.uploadedDocuments || [];
    const document = documents.find(doc => doc.id === documentId);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Return immediate response
    res.status(200).json({
      success: true,
      message: 'Document processing started',
      documentId,
      status: 'processing'
    });

    // Get processing options
    const useOcr = req.body.useOcr === 'true' || req.body.useOcr === true;

    // Process the document asynchronously
    setTimeout(async () => {
      try {
        // Process the PDF with OCR if requested
        const pdfData = await processPdf(document.filePath, { useOcr });

        // Extract financial data
        const financialData = await extractFinancialData(pdfData.text, pdfData.tables);

        // Update document with processed data
        document.processed = true;
        document.processingDate = new Date().toISOString();
        document.data = {
          ...pdfData,
          financialData
        };

        console.log(`Document ${documentId} processed successfully${useOcr ? ' with OCR' : ''}`);
      } catch (error) {
        console.error(`Error processing document ${documentId}: ${error.message}`);
        document.processed = true;
        document.processingDate = new Date().toISOString();
        document.error = error.message;
      }
    }, 100);
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
 * Get processing status
 * Method: GET
 * Route: /api/financial-pdf/status/:id
 */
router.get('/status/:id', (req, res) => {
  try {
    const documentId = req.params.id;

    // Find document by ID
    const documents = global.uploadedDocuments || [];
    const document = documents.find(doc => doc.id === documentId);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Return document status
    res.status(200).json({
      success: true,
      documentId,
      status: document.processed ? 'completed' : 'processing',
      processingDate: document.processingDate,
      error: document.error
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
 * Get all documents
 * Method: GET
 * Route: /api/financial-pdf/documents
 */
router.get('/documents', (req, res) => {
  try {
    // Get all documents
    const documents = global.uploadedDocuments || [];

    // Return documents
    res.status(200).json({
      success: true,
      documents: documents.map(doc => ({
        id: doc.id,
        fileName: doc.fileName,
        fileSize: doc.fileSize,
        documentType: doc.documentType,
        uploadDate: doc.uploadDate,
        processed: doc.processed
      }))
    });
  } catch (error) {
    console.error(`Error getting documents: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Error getting documents',
      error: error.message
    });
  }
});

/**
 * Get document data
 * Method: GET
 * Route: /api/financial-pdf/data/:id
 */
router.get('/data/:id', (req, res) => {
  try {
    const documentId = req.params.id;

    // Find document by ID
    const documents = global.uploadedDocuments || [];
    const document = documents.find(doc => doc.id === documentId);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    if (!document.processed) {
      return res.status(400).json({
        success: false,
        message: 'Document is not processed yet'
      });
    }

    if (document.error) {
      return res.status(400).json({
        success: false,
        message: 'Error processing document',
        error: document.error
      });
    }

    // Return document data
    res.status(200).json({
      success: true,
      documentId,
      data: document.data
    });
  } catch (error) {
    console.error(`Error getting document data: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Error getting document data',
      error: error.message
    });
  }
});

/**
 * Chat with document
 * Method: POST
 * Route: /api/financial-pdf/chat/:id
 */
router.post('/chat/:id', (req, res) => {
  try {
    const documentId = req.params.id;
    const { message, agent } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Message is required'
      });
    }

    // Find document by ID
    const documents = global.uploadedDocuments || [];
    const document = documents.find(doc => doc.id === documentId);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    if (!document.processed) {
      return res.status(400).json({
        success: false,
        message: 'Document is not processed yet'
      });
    }

    if (document.error) {
      return res.status(400).json({
        success: false,
        message: 'Error processing document',
        error: document.error
      });
    }

    // Generate response based on the document data and message
    const response = generateResponse(document.data, message, agent);

    // Return response
    res.status(200).json({
      success: true,
      documentId,
      message,
      response,
      agent: response.agent
    });
  } catch (error) {
    console.error(`Error chatting with document: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Error chatting with document',
      error: error.message
    });
  }
});

/**
 * Generate a response based on document data and message
 * @param {object} data - Document data
 * @param {string} message - User message
 * @param {string} agent - Agent type
 * @returns {object} - Response
 */
function generateResponse(data, message, agent) {
  // Determine agent type if not specified
  let agentType = agent || 'auto';

  if (agentType === 'auto') {
    // Auto-select agent based on the message
    if (message.toLowerCase().includes('table') || message.toLowerCase().includes('allocation')) {
      agentType = 'tableUnderstanding';
    } else if (message.toLowerCase().includes('security') || message.toLowerCase().includes('securities') ||
               message.toLowerCase().includes('bond') || message.toLowerCase().includes('stock')) {
      agentType = 'securitiesExtractor';
    } else if (message.toLowerCase().includes('performance') || message.toLowerCase().includes('risk') ||
               message.toLowerCase().includes('return')) {
      agentType = 'financialReasoner';
    } else if (message.toLowerCase().includes('current') || message.toLowerCase().includes('market') ||
               message.toLowerCase().includes('price')) {
      agentType = 'bloombergAgent';
    } else {
      agentType = 'documentAnalyzer';
    }
  }

  // Generate response based on agent type and message
  let responseText = '';

  switch (agentType) {
    case 'documentAnalyzer':
      responseText = handleDocumentAnalyzerQuery(data, message);
      break;
    case 'tableUnderstanding':
      responseText = handleTableUnderstandingQuery(data, message);
      break;
    case 'securitiesExtractor':
      responseText = handleSecuritiesExtractorQuery(data, message);
      break;
    case 'financialReasoner':
      responseText = handleFinancialReasonerQuery(data, message);
      break;
    case 'bloombergAgent':
      responseText = handleBloombergAgentQuery(data, message);
      break;
    default:
      responseText = "I'm not sure how to answer that question. Please try asking about the document content, tables, securities, financial analysis, or market data.";
  }

  return {
    text: responseText,
    agent: agentType
  };
}

// Export router
module.exports = router;
