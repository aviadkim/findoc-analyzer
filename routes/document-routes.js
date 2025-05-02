/**
 * Document Routes
 * 
 * This file contains routes for document-related operations, including:
 * - Document upload
 * - Document processing
 * - Document retrieval
 * - Document deletion
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// Import services
const documentProcessor = require('../services/document-processor');

// Configuration
const config = {
  uploadDir: process.env.UPLOAD_FOLDER || path.join(__dirname, '../uploads'),
  tempDir: process.env.TEMP_FOLDER || path.join(__dirname, '../temp'),
  resultsDir: process.env.RESULTS_FOLDER || path.join(__dirname, '../results'),
  maxFileSize: 50 * 1024 * 1024, // 50 MB
  allowedFileTypes: ['.pdf', '.xlsx', '.xls', '.csv']
};

// Create directories if they don't exist
fs.mkdirSync(config.uploadDir, { recursive: true });
fs.mkdirSync(config.tempDir, { recursive: true });
fs.mkdirSync(config.resultsDir, { recursive: true });

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, config.uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate a unique filename
    const uniqueId = uuidv4();
    const fileExt = path.extname(file.originalname);
    const fileName = `${uniqueId}${fileExt}`;
    
    cb(null, fileName);
  }
});

// File filter to only allow certain file types
const fileFilter = (req, file, cb) => {
  const fileExt = path.extname(file.originalname).toLowerCase();
  
  if (config.allowedFileTypes.includes(fileExt)) {
    cb(null, true);
  } else {
    cb(new Error(`File type not allowed. Allowed types: ${config.allowedFileTypes.join(', ')}`), false);
  }
};

// Create multer upload instance
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: config.maxFileSize
  }
});

// In-memory document storage (replace with database in production)
const documents = [];

/**
 * @route POST /api/documents/upload
 * @description Upload a document
 * @access Public
 */
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    // Create document record
    const document = {
      id: path.basename(req.file.filename, path.extname(req.file.filename)),
      fileName: req.file.originalname,
      fileType: path.extname(req.file.originalname).toLowerCase(),
      filePath: req.file.path,
      fileSize: req.file.size,
      uploadDate: new Date().toISOString(),
      processed: false,
      processingOptions: {
        extractText: req.body.extractText !== 'false',
        extractTables: req.body.extractTables !== 'false',
        extractMetadata: req.body.extractMetadata !== 'false'
      }
    };
    
    // Add document to storage
    documents.push(document);
    
    // Return document info
    res.status(201).json({
      id: document.id,
      fileName: document.fileName,
      fileType: document.fileType,
      fileSize: document.fileSize,
      uploadDate: document.uploadDate,
      processed: document.processed
    });
  } catch (error) {
    console.error('Error uploading document:', error);
    res.status(500).json({ error: 'Failed to upload document' });
  }
});

/**
 * @route POST /api/documents/:id/process
 * @description Process a document
 * @access Public
 */
router.post('/:id/process', async (req, res) => {
  try {
    const documentId = req.params.id;
    
    // Find document
    const document = documents.find(doc => doc.id === documentId);
    
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }
    
    // Check if document is already processed
    if (document.processed) {
      return res.status(400).json({ error: 'Document already processed' });
    }
    
    // Process document
    const result = await documentProcessor.processDocument(document.filePath, document.processingOptions);
    
    // Update document
    document.processed = true;
    document.processingDate = new Date().toISOString();
    document.content = result;
    
    // Return document info
    res.status(200).json({
      id: document.id,
      fileName: document.fileName,
      fileType: document.fileType,
      fileSize: document.fileSize,
      uploadDate: document.uploadDate,
      processingDate: document.processingDate,
      processed: document.processed
    });
  } catch (error) {
    console.error('Error processing document:', error);
    res.status(500).json({ error: 'Failed to process document' });
  }
});

/**
 * @route GET /api/documents
 * @description Get all documents
 * @access Public
 */
router.get('/', (req, res) => {
  try {
    // Return documents without content
    const documentsWithoutContent = documents.map(doc => ({
      id: doc.id,
      fileName: doc.fileName,
      fileType: doc.fileType,
      fileSize: doc.fileSize,
      uploadDate: doc.uploadDate,
      processingDate: doc.processingDate,
      processed: doc.processed
    }));
    
    res.status(200).json(documentsWithoutContent);
  } catch (error) {
    console.error('Error getting documents:', error);
    res.status(500).json({ error: 'Failed to get documents' });
  }
});

/**
 * @route GET /api/documents/:id
 * @description Get a document by ID
 * @access Public
 */
router.get('/:id', (req, res) => {
  try {
    const documentId = req.params.id;
    
    // Find document
    const document = documents.find(doc => doc.id === documentId);
    
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }
    
    res.status(200).json({
      id: document.id,
      fileName: document.fileName,
      fileType: document.fileType,
      fileSize: document.fileSize,
      uploadDate: document.uploadDate,
      processingDate: document.processingDate,
      processed: document.processed,
      content: document.content
    });
  } catch (error) {
    console.error('Error getting document:', error);
    res.status(500).json({ error: 'Failed to get document' });
  }
});

/**
 * @route DELETE /api/documents/:id
 * @description Delete a document
 * @access Public
 */
router.delete('/:id', (req, res) => {
  try {
    const documentId = req.params.id;
    
    // Find document
    const documentIndex = documents.findIndex(doc => doc.id === documentId);
    
    if (documentIndex === -1) {
      return res.status(404).json({ error: 'Document not found' });
    }
    
    const document = documents[documentIndex];
    
    // Delete file
    if (fs.existsSync(document.filePath)) {
      fs.unlinkSync(document.filePath);
    }
    
    // Remove document from storage
    documents.splice(documentIndex, 1);
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({ error: 'Failed to delete document' });
  }
});

/**
 * @route POST /api/documents/:id/questions
 * @description Ask a question about a document
 * @access Public
 */
router.post('/:id/questions', async (req, res) => {
  try {
    const documentId = req.params.id;
    const { question } = req.body;
    
    if (!question) {
      return res.status(400).json({ error: 'Question is required' });
    }
    
    // Find document
    const document = documents.find(doc => doc.id === documentId);
    
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }
    
    // Check if document is processed
    if (!document.processed) {
      return res.status(400).json({ error: 'Document not processed yet' });
    }
    
    // For now, return a mock answer
    // In a real implementation, we would use the API service to generate an answer
    let answer = 'I don\'t know the answer to that question.';
    
    if (question.toLowerCase().includes('revenue')) {
      answer = 'The total revenue is $10,500,000.';
    } else if (question.toLowerCase().includes('profit')) {
      answer = 'The net profit is $3,300,000 with a profit margin of 31.4%.';
    } else if (question.toLowerCase().includes('asset')) {
      answer = 'The total assets are $25,000,000.';
    } else if (question.toLowerCase().includes('liabilit')) {
      answer = 'The total liabilities are $12,000,000.';
    } else if (question.toLowerCase().includes('equity')) {
      answer = 'The shareholders\' equity is $13,000,000.';
    }
    
    res.status(200).json({
      question,
      answer,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error answering question:', error);
    res.status(500).json({ error: 'Failed to answer question' });
  }
});

module.exports = router;
