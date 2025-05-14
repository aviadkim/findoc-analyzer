/**
 * File Upload Routes
 * Routes for handling file uploads
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

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
 * Upload a file
 * Method: POST
 * Route: /api/upload
 */
router.post('/', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Get document type from request body
    const documentType = req.body.documentType || 'other';

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
 * Get all uploaded files
 * Method: GET
 * Route: /api/upload
 */
router.get('/', (req, res) => {
  try {
    // Return list of uploaded documents
    const documents = global.uploadedDocuments || [];
    
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
    console.error(`Error getting uploaded files: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Error getting uploaded files',
      error: error.message
    });
  }
});

/**
 * Get a specific uploaded file
 * Method: GET
 * Route: /api/upload/:id
 */
router.get('/:id', (req, res) => {
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
    
    res.status(200).json({
      success: true,
      document: {
        id: document.id,
        fileName: document.fileName,
        fileSize: document.fileSize,
        documentType: document.documentType,
        uploadDate: document.uploadDate,
        processed: document.processed
      }
    });
  } catch (error) {
    console.error(`Error getting uploaded file: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Error getting uploaded file',
      error: error.message
    });
  }
});

// Export router
module.exports = router;
