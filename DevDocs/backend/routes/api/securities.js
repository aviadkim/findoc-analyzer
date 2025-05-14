/**
 * Securities Routes
 * 
 * Handles enhanced securities extraction API routes.
 */

const express = require('express');
const router = express.Router();
const securitiesController = require('../../controllers/securitiesController');
const { authenticate, authorizePermission } = require('../../middleware/authMiddleware');
const { rateLimit } = require('../../middleware/securityMiddleware');

// Apply authentication middleware to all routes
router.use(authenticate);

// Apply securities-specific rate limiting
const securitiesRateLimit = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 20, // Limit each IP to 20 requests per windowMs for securities endpoints
  message: 'Too many requests for securities extraction, please try again later'
});

/**
 * @route POST /api/securities/extract
 * @description Extract securities from an existing document
 * @access Private
 */
router.post(
  '/extract',
  securitiesRateLimit,
  authorizePermission('extract_securities'),
  securitiesController.extractSecurities
);

/**
 * @route POST /api/securities/extract-upload
 * @description Upload and extract securities from a new document
 * @access Private
 */
router.post(
  '/extract-upload',
  securitiesRateLimit,
  authorizePermission('extract_securities'),
  securitiesController.extractUpload
);

/**
 * @route GET /api/securities/validate/:isin
 * @description Validate an ISIN code
 * @access Private
 */
router.get(
  '/validate/:isin',
  authorizePermission('view_securities'),
  securitiesController.validateIsin
);

/**
 * @route GET /api/securities/lookup/:query
 * @description Look up securities by name or identifier
 * @access Private
 */
router.get(
  '/lookup/:query',
  authorizePermission('view_securities'),
  securitiesController.lookupSecurity
);

module.exports = router;