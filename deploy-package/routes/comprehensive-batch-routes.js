/**
 * Comprehensive Batch Routes
 * 
 * RESTful API routes for advanced batch document processing
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const ComprehensiveBatchService = require('../services/comprehensive-batch-service');

// Create batch service instance
const batchService = new ComprehensiveBatchService();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(process.cwd(), 'uploads', 'batch');
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB limit
  },
  fileFilter: function (req, file, cb) {
    // Accept PDFs and Excel files by default
    const allowedTypes = ['application/pdf', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
    
    // Check if explicit types are specified
    const allowedMimeTypes = req.body.allowedMimeTypes 
      ? JSON.parse(req.body.allowedMimeTypes) 
      : allowedTypes;

    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`File type not supported. Allowed types: ${allowedMimeTypes.join(', ')}`));
    }
  }
});

/**
 * @route POST /api/batch/upload-and-process
 * @description Upload files and create a batch processing job
 * @access Public
 */
router.post('/upload-and-process', upload.array('files', 50), async (req, res) => {
  try {
    // Get uploaded files
    const files = req.files;
    
    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }
    
    // Get processing options
    const processingOptions = req.body.processingOptions
      ? JSON.parse(req.body.processingOptions)
      : {};
    
    // Create batch job options
    const batchOptions = {
      tenantId: req.body.tenantId,
      userId: req.body.userId,
      name: req.body.name || `Batch upload ${new Date().toISOString()}`,
      description: req.body.description,
      priority: req.body.priority || 'medium',
      documentType: req.body.documentType,
      processingOptions,
      autoQueue: req.body.autoQueue !== 'false'
    };
    
    // Create batch job
    const batchJob = await batchService.createBatchJob(files, batchOptions);
    
    res.status(201).json({
      success: true,
      message: `Created batch job with ${files.length} files`,
      batchJob: {
        id: batchJob.id,
        name: batchJob.name,
        status: batchJob.status,
        totalFiles: batchJob.totalFiles,
        priority: batchJob.priority,
        createdAt: batchJob.createdAt
      }
    });
  } catch (error) {
    console.error('Error creating batch job:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create batch job',
      error: error.message
    });
  }
});

/**
 * @route POST /api/batch/create
 * @description Create a batch job from existing document IDs
 * @access Public
 */
router.post('/create', async (req, res) => {
  try {
    const { documentIds, processingOptions } = req.body;
    
    if (!documentIds || !Array.isArray(documentIds) || documentIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Document IDs are required'
      });
    }
    
    // Convert document IDs to file objects
    const files = documentIds.map(id => ({
      documentId: id,
      name: `Document ${id}`,
      path: `/virtual/document/${id}`
    }));
    
    // Create batch job options
    const batchOptions = {
      tenantId: req.body.tenantId,
      userId: req.body.userId,
      name: req.body.name || `Batch processing ${new Date().toISOString()}`,
      description: req.body.description,
      priority: req.body.priority || 'medium',
      documentType: req.body.documentType,
      processingOptions: processingOptions || {},
      autoQueue: req.body.autoQueue !== 'false'
    };
    
    // Create batch job
    const batchJob = await batchService.createBatchJob(files, batchOptions);
    
    res.status(201).json({
      success: true,
      message: `Created batch job with ${files.length} documents`,
      batchJob: {
        id: batchJob.id,
        name: batchJob.name,
        status: batchJob.status,
        totalFiles: batchJob.totalFiles,
        priority: batchJob.priority,
        createdAt: batchJob.createdAt
      }
    });
  } catch (error) {
    console.error('Error creating batch job:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create batch job',
      error: error.message
    });
  }
});

/**
 * @route GET /api/batch/jobs
 * @description Get all batch jobs with optional filtering
 * @access Public
 */
router.get('/jobs', async (req, res) => {
  try {
    // Get query parameters
    const {
      status,
      tenantId,
      userId,
      documentType,
      sortBy,
      sortOrder,
      limit,
      offset
    } = req.query;
    
    // Convert limit and offset to numbers
    const parsedLimit = limit ? parseInt(limit, 10) : undefined;
    const parsedOffset = offset ? parseInt(offset, 10) : undefined;
    
    // Get batch jobs
    const batchJobs = await batchService.getAllBatchJobs({
      status,
      tenantId,
      userId,
      documentType,
      sortBy,
      sortOrder,
      limit: parsedLimit,
      offset: parsedOffset
    });
    
    // Get service stats
    const stats = batchService.getServiceStats();
    
    res.json({
      success: true,
      stats: {
        totalJobs: stats.totalJobs,
        activeJobs: stats.activeJobs,
        queuedJobs: stats.queues.total
      },
      count: batchJobs.length,
      batchJobs: batchJobs.map(job => ({
        id: job.id,
        name: job.name,
        description: job.description,
        status: job.status,
        progress: job.progress,
        priority: job.priority,
        totalFiles: job.totalFiles,
        processedFiles: job.processedFiles,
        failedFiles: job.failedFiles || 0,
        tenantId: job.tenantId,
        userId: job.userId,
        documentType: job.documentType,
        createdAt: job.createdAt,
        updatedAt: job.updatedAt,
        startedAt: job.startedAt,
        completedAt: job.completedAt
      }))
    });
  } catch (error) {
    console.error('Error getting batch jobs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get batch jobs',
      error: error.message
    });
  }
});

/**
 * @route GET /api/batch/stats
 * @description Get batch service statistics
 * @access Public
 */
router.get('/stats', (req, res) => {
  try {
    // Get service stats
    const stats = batchService.getServiceStats();
    
    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Error getting batch stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get batch stats',
      error: error.message
    });
  }
});

/**
 * @route GET /api/batch/jobs/:id
 * @description Get a batch job by ID
 * @access Public
 */
router.get('/jobs/:id', async (req, res) => {
  try {
    const jobId = req.params.id;
    
    // Get batch job
    const batchJob = await batchService.getBatchJob(jobId);
    
    res.json({
      success: true,
      batchJob
    });
  } catch (error) {
    console.error(`Error getting batch job ${req.params.id}:`, error);
    res.status(error.message.includes('not found') ? 404 : 500).json({
      success: false,
      message: 'Failed to get batch job',
      error: error.message
    });
  }
});

/**
 * @route GET /api/batch/jobs/:id/status
 * @description Get batch job status
 * @access Public
 */
router.get('/jobs/:id/status', async (req, res) => {
  try {
    const jobId = req.params.id;
    
    // Get batch job
    const batchJob = await batchService.getBatchJob(jobId);
    
    // Extract status information
    const statusInfo = {
      id: batchJob.id,
      name: batchJob.name,
      status: batchJob.status,
      progress: batchJob.progress,
      totalFiles: batchJob.totalFiles,
      processedFiles: batchJob.processedFiles,
      failedFiles: batchJob.failedFiles || 0,
      createdAt: batchJob.createdAt,
      updatedAt: batchJob.updatedAt,
      startedAt: batchJob.startedAt,
      completedAt: batchJob.completedAt
    };
    
    // Add summary if completed
    if (batchJob.status === 'completed' || batchJob.status === 'failed') {
      statusInfo.summary = batchJob.summary;
    }
    
    res.json({
      success: true,
      status: statusInfo
    });
  } catch (error) {
    console.error(`Error getting batch job status ${req.params.id}:`, error);
    res.status(error.message.includes('not found') ? 404 : 500).json({
      success: false,
      message: 'Failed to get batch job status',
      error: error.message
    });
  }
});

/**
 * @route POST /api/batch/jobs/:id/queue
 * @description Queue a batch job
 * @access Public
 */
router.post('/jobs/:id/queue', async (req, res) => {
  try {
    const jobId = req.params.id;
    
    // Get options
    const options = {
      priority: req.body.priority
    };
    
    // Queue batch job
    const batchJob = await batchService.queueBatchJob(jobId, options);
    
    res.json({
      success: true,
      message: `Batch job ${jobId} queued successfully`,
      batchJob: {
        id: batchJob.id,
        status: batchJob.status,
        priority: batchJob.priority
      }
    });
  } catch (error) {
    console.error(`Error queuing batch job ${req.params.id}:`, error);
    res.status(error.message.includes('not found') ? 404 : 500).json({
      success: false,
      message: 'Failed to queue batch job',
      error: error.message
    });
  }
});

/**
 * @route POST /api/batch/jobs/:id/cancel
 * @description Cancel a batch job
 * @access Public
 */
router.post('/jobs/:id/cancel', async (req, res) => {
  try {
    const jobId = req.params.id;
    
    // Cancel batch job
    const batchJob = await batchService.cancelBatchJob(jobId);
    
    res.json({
      success: true,
      message: `Batch job ${jobId} cancelled successfully`,
      batchJob: {
        id: batchJob.id,
        status: batchJob.status
      }
    });
  } catch (error) {
    console.error(`Error cancelling batch job ${req.params.id}:`, error);
    res.status(error.message.includes('not found') ? 404 : 500).json({
      success: false,
      message: 'Failed to cancel batch job',
      error: error.message
    });
  }
});

/**
 * @route POST /api/batch/jobs/:id/pause
 * @description Pause a batch job
 * @access Public
 */
router.post('/jobs/:id/pause', async (req, res) => {
  try {
    const jobId = req.params.id;
    
    // Pause batch job
    const batchJob = await batchService.pauseBatchJob(jobId);
    
    res.json({
      success: true,
      message: `Batch job ${jobId} paused successfully`,
      batchJob: {
        id: batchJob.id,
        status: batchJob.status
      }
    });
  } catch (error) {
    console.error(`Error pausing batch job ${req.params.id}:`, error);
    res.status(error.message.includes('not found') ? 404 : 500).json({
      success: false,
      message: 'Failed to pause batch job',
      error: error.message
    });
  }
});

/**
 * @route POST /api/batch/jobs/:id/resume
 * @description Resume a batch job
 * @access Public
 */
router.post('/jobs/:id/resume', async (req, res) => {
  try {
    const jobId = req.params.id;
    
    // Get options
    const options = {
      priority: req.body.priority
    };
    
    // Resume batch job
    const batchJob = await batchService.resumeBatchJob(jobId, options);
    
    res.json({
      success: true,
      message: `Batch job ${jobId} resumed successfully`,
      batchJob: {
        id: batchJob.id,
        status: batchJob.status,
        priority: batchJob.priority
      }
    });
  } catch (error) {
    console.error(`Error resuming batch job ${req.params.id}:`, error);
    res.status(error.message.includes('not found') ? 404 : 500).json({
      success: false,
      message: 'Failed to resume batch job',
      error: error.message
    });
  }
});

/**
 * @route DELETE /api/batch/jobs/:id
 * @description Delete a batch job
 * @access Public
 */
router.delete('/jobs/:id', async (req, res) => {
  try {
    const jobId = req.params.id;
    
    // Delete batch job
    await batchService.deleteBatchJob(jobId);
    
    res.json({
      success: true,
      message: `Batch job ${jobId} deleted successfully`
    });
  } catch (error) {
    console.error(`Error deleting batch job ${req.params.id}:`, error);
    res.status(error.message.includes('not found') ? 404 : 500).json({
      success: false,
      message: 'Failed to delete batch job',
      error: error.message
    });
  }
});

/**
 * @route POST /api/batch/cleanup
 * @description Clean up old batch jobs
 * @access Public
 */
router.post('/cleanup', async (req, res) => {
  try {
    // Get max age
    const maxAgeDays = parseInt(req.body.maxAgeDays || 30, 10);
    const maxAgeMs = maxAgeDays * 24 * 60 * 60 * 1000;
    
    // Clean up batch jobs
    const count = await batchService.cleanupBatchJobs(maxAgeMs);
    
    res.json({
      success: true,
      message: `Cleaned up ${count} batch jobs older than ${maxAgeDays} days`
    });
  } catch (error) {
    console.error('Error cleaning up batch jobs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clean up batch jobs',
      error: error.message
    });
  }
});

/**
 * @route GET /api/batch/tenant/:tenantId/jobs
 * @description Get batch jobs for a tenant
 * @access Public
 */
router.get('/tenant/:tenantId/jobs', async (req, res) => {
  try {
    const tenantId = req.params.tenantId;
    
    // Get query parameters
    const {
      status,
      documentType,
      sortBy,
      sortOrder,
      limit,
      offset
    } = req.query;
    
    // Convert limit and offset to numbers
    const parsedLimit = limit ? parseInt(limit, 10) : undefined;
    const parsedOffset = offset ? parseInt(offset, 10) : undefined;
    
    // Get batch jobs for tenant
    const batchJobs = await batchService.getBatchJobsForTenant(tenantId, {
      status,
      documentType,
      sortBy,
      sortOrder,
      limit: parsedLimit,
      offset: parsedOffset
    });
    
    res.json({
      success: true,
      tenantId,
      count: batchJobs.length,
      batchJobs: batchJobs.map(job => ({
        id: job.id,
        name: job.name,
        status: job.status,
        progress: job.progress,
        totalFiles: job.totalFiles,
        processedFiles: job.processedFiles,
        failedFiles: job.failedFiles || 0,
        documentType: job.documentType,
        createdAt: job.createdAt,
        updatedAt: job.updatedAt
      }))
    });
  } catch (error) {
    console.error(`Error getting batch jobs for tenant ${req.params.tenantId}:`, error);
    res.status(500).json({
      success: false,
      message: 'Failed to get batch jobs for tenant',
      error: error.message
    });
  }
});

/**
 * @route GET /api/batch/user/:userId/jobs
 * @description Get batch jobs for a user
 * @access Public
 */
router.get('/user/:userId/jobs', async (req, res) => {
  try {
    const userId = req.params.userId;
    
    // Get query parameters
    const {
      status,
      documentType,
      sortBy,
      sortOrder,
      limit,
      offset
    } = req.query;
    
    // Convert limit and offset to numbers
    const parsedLimit = limit ? parseInt(limit, 10) : undefined;
    const parsedOffset = offset ? parseInt(offset, 10) : undefined;
    
    // Get batch jobs for user
    const batchJobs = await batchService.getBatchJobsForUser(userId, {
      status,
      documentType,
      sortBy,
      sortOrder,
      limit: parsedLimit,
      offset: parsedOffset
    });
    
    res.json({
      success: true,
      userId,
      count: batchJobs.length,
      batchJobs: batchJobs.map(job => ({
        id: job.id,
        name: job.name,
        status: job.status,
        progress: job.progress,
        totalFiles: job.totalFiles,
        processedFiles: job.processedFiles,
        failedFiles: job.failedFiles || 0,
        documentType: job.documentType,
        createdAt: job.createdAt,
        updatedAt: job.updatedAt
      }))
    });
  } catch (error) {
    console.error(`Error getting batch jobs for user ${req.params.userId}:`, error);
    res.status(500).json({
      success: false,
      message: 'Failed to get batch jobs for user',
      error: error.message
    });
  }
});

// Start the batch processor
batchService.startProcessor();

// Clean up on application exit
process.on('SIGTERM', () => {
  batchService.stopProcessor();
});

process.on('SIGINT', () => {
  batchService.stopProcessor();
});

module.exports = router;