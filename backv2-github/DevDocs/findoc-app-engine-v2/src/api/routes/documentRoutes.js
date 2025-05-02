/**
 * Document Routes
 */

const express = require('express');
const multer = require('multer');
const {
  getDocuments,
  getDocumentById,
  createDocument,
  processDocument,
  deleteDocument
} = require('../controllers/documentController');
const {
  processDocumentWithScan1,
  getScan1Status,
  verifyGeminiApiKey,
  verifyOpenRouterApiKey,
  getApiUsage,
  resetApiUsage
} = require('../controllers/scan1Controller');
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
      'text/csv'
    ];

    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, XLSX, XLS, and CSV files are allowed.'), false);
    }
  }
});

const router = express.Router();

// Special routes that need to come before /:id routes to avoid conflicts
// Get Scan1 status - use optional auth to allow public access for status checks
router.get('/scan1/status', (req, res) => {
  console.log('Direct Scan1 status endpoint hit');
  getScan1Status(req, res);
});

// Verify Gemini API key
router.get('/scan1/verify-gemini', (req, res) => {
  console.log('Direct Gemini API key verification endpoint hit');
  verifyGeminiApiKey(req, res);
});

// Verify OpenRouter API key
router.get('/scan1/verify-openrouter', (req, res) => {
  console.log('Direct OpenRouter API key verification endpoint hit');
  verifyOpenRouterApiKey(req, res);
});

// Get API usage statistics
router.get('/scan1/api-usage', (req, res) => {
  console.log('API usage statistics endpoint hit');
  getApiUsage(req, res);
});

// Reset API usage statistics
router.post('/scan1/reset-api-usage', authMiddleware, (req, res) => {
  console.log('Reset API usage statistics endpoint hit');
  resetApiUsage(req, res);
});

// Get all documents
router.get('/', authMiddleware, getDocuments);

// Create document - use multer middleware for file upload
// Use testModeMiddleware to allow testing without authentication
router.post('/', testModeMiddleware, authMiddleware, upload.single('file'), createDocument);

// Get document by ID - must come after specific routes to avoid conflicts
// Use testModeMiddleware to allow testing without authentication
router.get('/:id', testModeMiddleware, authMiddleware, getDocumentById);

// Process document
// Use testModeMiddleware to allow testing without authentication
router.post('/:id/process', testModeMiddleware, authMiddleware, processDocument);

// Process document with Scan1
// Use testModeMiddleware to allow testing without authentication
router.post('/:id/scan1', testModeMiddleware, authMiddleware, processDocumentWithScan1);

// Delete document
router.delete('/:id', authMiddleware, deleteDocument);

// Error handler for this router
router.use((err, req, res, next) => {
  console.error('Document routes error handler:', err);

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
    error: err.message || 'Internal server error in document routes'
  });
});

module.exports = router;
