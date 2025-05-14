/**
 * Enhanced Routes
 * 
 * This file provides enhanced routes for document processing and chat functionality.
 */

const express = require('express');
const multer = require('multer');
const {
  getDocuments,
  getDocumentById,
  createDocument,
  processDocumentUnified,
  deleteDocument
} = require('../controllers/enhancedDocumentController');
const {
  sendMessage,
  getChatHistory,
  clearChatHistory,
  askQuestion,
  generateTable
} = require('../controllers/enhancedChatController');
const { authMiddleware, optionalAuthMiddleware, testModeMiddleware } = require('../middleware/authMiddleware');

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 1 // Only allow one file per request
  },
  fileFilter: (req, file, cb) => {
    // Check file type
    const allowedMimeTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv',
      'application/vnd.ms-excel.sheet.macroEnabled.12'
    ];

    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, XLSX, XLS, and CSV files are allowed.'), false);
    }
  }
});

const router = express.Router();

// Document routes
router.get('/documents', testModeMiddleware, getDocuments);
router.post('/documents', testModeMiddleware, upload.single('file'), createDocument);
router.get('/documents/:id', testModeMiddleware, getDocumentById);
router.post('/documents/:id/process', testModeMiddleware, processDocumentUnified);
router.delete('/documents/:id', testModeMiddleware, deleteDocument);

// Chat routes
router.post('/chat/message', testModeMiddleware, sendMessage);
router.get('/chat/history/:documentId', testModeMiddleware, getChatHistory);
router.delete('/chat/history/:documentId', testModeMiddleware, clearChatHistory);
router.post('/documents/:id/ask', testModeMiddleware, askQuestion);
router.post('/documents/:id/table', testModeMiddleware, generateTable);

// Error handler
router.use((err, req, res, next) => {
  console.error('Enhanced routes error:', err);

  // Handle multer errors
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: 'File too large. Maximum size is 10MB.'
      });
    }

    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        error: 'Too many files. Only one file is allowed.'
      });
    }

    return res.status(400).json({
      success: false,
      error: `File upload error: ${err.message}`
    });
  }

  // Handle other errors
  return res.status(500).json({
    success: false,
    error: err.message || 'Internal server error in enhanced routes'
  });
});

module.exports = router;
