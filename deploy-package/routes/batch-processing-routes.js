/**
 * Batch Processing Routes
 * 
 * Enhanced implementation for batch document processing.
 * Supports advanced job management, reporting, and tracking.
 */

const express = require('express');
const router = express.Router();
const batchController = require('../controllers/batch-controller');

/**
 * @route POST /api/batch/jobs
 * @description Create a new batch processing job
 * @access Public
 */
router.post('/jobs', batchController.createBatchJob);

/**
 * @route GET /api/batch/jobs
 * @description Get all batch jobs with optional status filter
 * @access Public
 */
router.get('/jobs', batchController.getAllBatchJobs);

/**
 * @route GET /api/batch/jobs/:jobId
 * @description Get batch job status
 * @access Public
 */
router.get('/jobs/:jobId', batchController.getBatchJobStatus);

/**
 * @route GET /api/batch/jobs/:jobId/details
 * @description Get detailed batch job information
 * @access Public
 */
router.get('/jobs/:jobId/details', batchController.getBatchJobDetails);

/**
 * @route GET /api/batch/jobs/:jobId/results
 * @description Get batch job results
 * @access Public
 */
router.get('/jobs/:jobId/results', batchController.getBatchJobResults);

/**
 * @route GET /api/batch/jobs/:jobId/errors
 * @description Get batch job errors
 * @access Public
 */
router.get('/jobs/:jobId/errors', batchController.getBatchJobErrors);

/**
 * @route POST /api/batch/jobs/:jobId/start
 * @description Start a batch job
 * @access Public
 */
router.post('/jobs/:jobId/start', batchController.startBatchJob);

/**
 * @route POST /api/batch/jobs/:jobId/cancel
 * @description Cancel a batch job
 * @access Public
 */
router.post('/jobs/:jobId/cancel', batchController.cancelBatchJob);

/**
 * @route POST /api/batch/documents/process
 * @description Process multiple documents in batch
 * @access Public
 */
router.post('/documents/process', batchController.batchProcessDocuments);

/**
 * @route POST /api/batch/securities/extract
 * @description Extract securities from multiple documents in batch
 * @access Public
 */
router.post('/securities/extract', batchController.batchExtractSecurities);

/**
 * @route POST /api/batch/securities/update
 * @description Update multiple securities information in batch
 * @access Public
 */
router.post('/securities/update', batchController.batchUpdateSecurities);

/**
 * @route GET /api/batch/history
 * @description Get batch processing history
 * @access Public
 */
router.get('/history', batchController.getBatchJobHistory);

/**
 * @route POST /api/batch/cleanup
 * @description Clean up old batch jobs
 * @access Admin
 */
router.post('/cleanup', batchController.cleanupBatchJobs);

// Legacy routes support
/**
 * @route POST /api/batch/start
 * @description Start batch processing (legacy)
 * @access Public
 */
router.post('/start', batchController.legacyStartBatch);

/**
 * @route GET /api/batch/:id
 * @description Get batch processing status (legacy)
 * @access Public
 */
router.get('/:id', batchController.legacyGetBatchStatus);

/**
 * @route POST /api/batch/:id/cancel
 * @description Cancel batch processing (legacy)
 * @access Public
 */
router.post('/:id/cancel', batchController.legacyCancelBatch);

module.exports = router;
