/**
 * Securities Controller
 * 
 * Handles enhanced securities extraction API endpoints.
 */

const Document = require('../models/Document');
const logger = require('../utils/logger');
const { asyncHandler } = require('../middleware/errorMiddleware');
const { BadRequestError, NotFoundError } = require('../middleware/errorMiddleware');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const SecurityExtractor = require('../enhanced_processing/security_extractor');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/temp');
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size
  },
  fileFilter: (req, file, cb) => {
    // Accept only PDF files
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  }
});

// Initialize SecurityExtractor
const securityExtractor = new SecurityExtractor({ debug: false });

/**
 * Extract securities from an existing document
 * @route POST /api/securities/extract
 * @access Private
 */
const extractSecurities = asyncHandler(async (req, res) => {
  const { documentId } = req.body;

  if (!documentId) {
    throw new BadRequestError('Document ID is required');
  }

  // Get document
  const document = await Document.findById(documentId);

  if (!document) {
    throw new NotFoundError(`Document with ID ${documentId} not found`);
  }

  // Get file path from document
  const filePath = document.filePath;

  if (!filePath || !fs.existsSync(filePath)) {
    throw new NotFoundError('Document file not found');
  }

  try {
    // Extract securities
    const result = await securityExtractor.extract_from_pdf(filePath);

    // Save extraction results to the document
    await Document.update(documentId, {
      processingStatus: 'securities_extraction_completed',
      processingData: {
        ...document.processingData,
        securitiesExtraction: result
      }
    });

    res.json({
      status: 'success',
      data: {
        documentId,
        documentType: result.document_type,
        currency: result.currency,
        securities: result.securities,
        assetAllocation: result.asset_allocation,
        portfolioSummary: result.portfolio_summary
      }
    });
  } catch (error) {
    // Update document status
    await Document.update(documentId, {
      processingStatus: 'securities_extraction_failed',
      processingError: error.message
    });

    logger.error(`Securities extraction failed for document ${documentId}:`, error);
    throw new Error(`Securities extraction failed: ${error.message}`);
  }
});

/**
 * Upload and extract securities from a new document
 * @route POST /api/securities/extract-upload
 * @access Private
 */
const extractUpload = asyncHandler(async (req, res) => {
  // Handle file upload with multer middleware
  upload.single('file')(req, res, async (err) => {
    if (err) {
      logger.error('File upload error:', err);
      return res.status(400).json({
        status: 'error',
        message: err.message || 'File upload failed'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        status: 'error',
        message: 'No file uploaded'
      });
    }

    const filePath = req.file.path;
    const fileName = req.file.originalname;

    try {
      // Extract securities from the uploaded file
      const result = await securityExtractor.extract_from_pdf(filePath);

      // Create a new document in the database
      const documentData = {
        name: fileName,
        filePath: filePath,
        type: 'financial',
        processingStatus: 'securities_extraction_completed',
        userId: req.user.id,
        metadata: {
          originalName: fileName,
          fileSize: req.file.size,
          mimeType: req.file.mimetype
        },
        processingData: {
          securitiesExtraction: result
        }
      };

      const newDocument = await Document.create(documentData);

      res.json({
        status: 'success',
        data: {
          documentId: newDocument.id,
          documentType: result.document_type,
          currency: result.currency,
          securities: result.securities,
          assetAllocation: result.asset_allocation,
          portfolioSummary: result.portfolio_summary
        }
      });
    } catch (error) {
      // Remove the uploaded file
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      logger.error(`Securities extraction failed for uploaded file:`, error);
      res.status(500).json({
        status: 'error',
        message: `Securities extraction failed: ${error.message}`
      });
    }
  });
});

/**
 * Validate an ISIN code
 * @route GET /api/securities/validate/:isin
 * @access Private
 */
const validateIsin = asyncHandler(async (req, res) => {
  const { isin } = req.params;

  if (!isin) {
    throw new BadRequestError('ISIN is required');
  }

  // Basic ISIN format validation
  const isinRegex = /^[A-Z]{2}[A-Z0-9]{9}[0-9]$/;
  const isFormatValid = isinRegex.test(isin);

  // Use the securities database for validation if available
  const isValid = isFormatValid && securityExtractor.securities_db.validate_isin(isin);

  // Get additional information if valid
  let securityInfo = null;
  if (isValid) {
    securityInfo = {
      name: securityExtractor.securities_db.get_name_by_isin(isin) || 'Unknown',
      type: securityExtractor.securities_db.detect_security_type(isin) || 'Unknown'
    };
  }

  res.json({
    status: 'success',
    data: {
      isin,
      isValid,
      isFormatValid,
      securityInfo
    }
  });
});

/**
 * Look up securities by name or identifier
 * @route GET /api/securities/lookup/:query
 * @access Private
 */
const lookupSecurity = asyncHandler(async (req, res) => {
  const { query } = req.params;

  if (!query || query.length < 2) {
    throw new BadRequestError('Search query must be at least 2 characters');
  }

  // Search for securities by name
  const results = securityExtractor.securities_db.find_best_match_for_name(query, 10);

  res.json({
    status: 'success',
    data: {
      query,
      results: results || []
    }
  });
});

module.exports = {
  extractSecurities,
  extractUpload,
  validateIsin,
  lookupSecurity
};