/**
 * Docling Routes
 *
 * This file defines the routes for the Docling API.
 */

const express = require('express');
const router = express.Router();
const doclingController = require('../controllers/doclingController');

/**
 * @route GET /api/docling/status
 * @description Get Docling status
 * @access Public
 */
router.get('/status', doclingController.getDoclingStatus);

/**
 * @route POST /api/docling/process/:id
 * @description Process a document with Docling
 * @access Public
 */
router.post('/process/:id', doclingController.processDocumentWithDocling);

/**
 * @route POST /api/docling/extract-tables/:id
 * @description Extract tables from a document with Docling
 * @access Public
 */
router.post('/extract-tables/:id', doclingController.extractTablesWithDocling);

/**
 * @route POST /api/docling/extract-securities/:id
 * @description Extract securities from a document with Docling
 * @access Public
 */
router.post('/extract-securities/:id', doclingController.extractSecuritiesWithDocling);

/**
 * @route POST /api/docling/analyze-financial/:id
 * @description Analyze a financial document with Docling
 * @access Public
 */
router.post('/analyze-financial/:id', doclingController.analyzeFinancialDocumentWithDocling);

/**
 * @route GET /api/docling/compare/:id
 * @description Compare Docling results with scan1 results
 * @access Public
 */
router.get('/compare/:id', doclingController.compareWithScan1);

module.exports = router;
