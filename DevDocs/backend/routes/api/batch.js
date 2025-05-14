/**
 * Batch Processing API Routes
 * 
 * API endpoints for batch document processing operations.
 */

const express = require('express');
const router = express.Router();
const { BatchProcessingController, JOB_STATUS, PRIORITY } = require('../../services/batch/BatchProcessingController');
const { logger } = require('../../utils/logger');
const { authenticateUser, authorizeRole } = require('../../middleware/authMiddleware');
const apiValidation = require('../../services/security/apiValidation');
const { validateRequestBody } = require('../../middleware/validationMiddleware');

// Initialize batch processing controller
const batchController = new BatchProcessingController({
  persistenceEnabled: true,
  jobStoragePath: process.env.BATCH_STORAGE_PATH || './data/batch-jobs'
});

// Validation schemas
const createBatchJobSchema = {
  type: 'object',
  required: ['name', 'tasks'],
  properties: {
    name: { type: 'string', minLength: 1, maxLength: 100 },
    priority: { type: 'string', enum: ['high', 'normal', 'low'], default: 'normal' },
    tasks: {
      type: 'array',
      items: {
        type: 'object',
        required: ['type', 'data'],
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          type: { 
            type: 'string', 
            enum: [
              'document-processing', 
              'data-export', 
              'document-comparison', 
              'portfolio-analysis',
              'bulk-import',
              'test'
            ] 
          },
          data: { type: 'object' }
        }
      },
      minItems: 1
    },
    metadata: { type: 'object' },
    options: {
      type: 'object',
      properties: {
        retryCount: { type: 'integer', minimum: 0, maximum: 10 },
        retryDelay: { type: 'integer', minimum: 0, maximum: 60000 },
        continueOnFailure: { type: 'boolean' },
        webhookUrl: { type: 'string', format: 'uri' }
      }
    }
  }
};

// Register validation schema
apiValidation.registerSchema('/api/batch/jobs', createBatchJobSchema);

/**
 * @route POST /api/batch/jobs
 * @description Create a new batch processing job
 * @access Private
 */
router.post('/jobs', authenticateUser, validateRequestBody('/api/batch/jobs'), async (req, res) => {
  try {
    // Create batch job
    const job = batchController.createJob({
      name: req.body.name,
      priority: req.body.priority || 'normal',
      tasks: req.body.tasks,
      metadata: {
        ...req.body.metadata,
        userId: req.user.id,
        username: req.user.username
      },
      options: req.body.options || {}
    });
    
    logger.info(`Created batch job ${job.id} with ${job.totalTasks} tasks`);
    
    res.status(201).json({
      success: true,
      job
    });
  } catch (error) {
    logger.error('Error creating batch job:', error);
    
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route GET /api/batch/jobs
 * @description Get all batch jobs
 * @access Private
 */
router.get('/jobs', authenticateUser, async (req, res) => {
  try {
    // Get filter parameters
    const status = req.query.status;
    const limit = parseInt(req.query.limit) || 100;
    const offset = parseInt(req.query.offset) || 0;
    
    // Get all jobs
    const allJobs = Array.from(batchController.jobs.values())
      .map(job => batchController.getJobSummary(job));
    
    // Filter by status if provided
    const filteredJobs = status ? 
      allJobs.filter(job => job.status === status) : 
      allJobs;
    
    // Sort by creation date (newest first)
    filteredJobs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    // Apply pagination
    const paginatedJobs = filteredJobs.slice(offset, offset + limit);
    
    res.json({
      success: true,
      count: filteredJobs.length,
      jobs: paginatedJobs
    });
  } catch (error) {
    logger.error('Error getting batch jobs:', error);
    
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route GET /api/batch/jobs/:id
 * @description Get a specific batch job
 * @access Private
 */
router.get('/jobs/:id', authenticateUser, async (req, res) => {
  try {
    const jobId = req.params.id;
    
    // Check if job exists
    const job = batchController.jobs.get(jobId);
    
    if (!job) {
      return res.status(404).json({
        success: false,
        error: `Job ${jobId} not found`
      });
    }
    
    // Get job details
    const jobDetails = batchController.getJobDetails(jobId);
    
    res.json({
      success: true,
      job: jobDetails
    });
  } catch (error) {
    logger.error(`Error getting batch job ${req.params.id}:`, error);
    
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route GET /api/batch/jobs/:id/tasks
 * @description Get tasks for a specific batch job
 * @access Private
 */
router.get('/jobs/:id/tasks', authenticateUser, async (req, res) => {
  try {
    const jobId = req.params.id;
    
    // Check if job exists
    const job = batchController.jobs.get(jobId);
    
    if (!job) {
      return res.status(404).json({
        success: false,
        error: `Job ${jobId} not found`
      });
    }
    
    // Get job details
    const jobDetails = batchController.getJobDetails(jobId);
    
    res.json({
      success: true,
      jobId,
      tasks: jobDetails.tasks
    });
  } catch (error) {
    logger.error(`Error getting tasks for batch job ${req.params.id}:`, error);
    
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route GET /api/batch/jobs/:id/tasks/:taskId
 * @description Get a specific task from a batch job
 * @access Private
 */
router.get('/jobs/:id/tasks/:taskId', authenticateUser, async (req, res) => {
  try {
    const { id: jobId, taskId } = req.params;
    
    // Check if job exists
    const job = batchController.jobs.get(jobId);
    
    if (!job) {
      return res.status(404).json({
        success: false,
        error: `Job ${jobId} not found`
      });
    }
    
    // Get task details
    try {
      const taskDetails = batchController.getTaskDetails(jobId, taskId);
      
      res.json({
        success: true,
        jobId,
        taskId,
        task: taskDetails
      });
    } catch (error) {
      return res.status(404).json({
        success: false,
        error: error.message
      });
    }
  } catch (error) {
    logger.error(`Error getting task ${req.params.taskId} for batch job ${req.params.id}:`, error);
    
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route PUT /api/batch/jobs/:id/pause
 * @description Pause a running batch job
 * @access Private
 */
router.put('/jobs/:id/pause', authenticateUser, async (req, res) => {
  try {
    const jobId = req.params.id;
    
    // Check if job exists
    const job = batchController.jobs.get(jobId);
    
    if (!job) {
      return res.status(404).json({
        success: false,
        error: `Job ${jobId} not found`
      });
    }
    
    // Check if job can be paused
    if (job.status !== JOB_STATUS.PROCESSING) {
      return res.status(400).json({
        success: false,
        error: `Cannot pause job with status ${job.status}`
      });
    }
    
    // Pause job
    const updatedJob = batchController.pauseJob(jobId);
    
    res.json({
      success: true,
      job: updatedJob
    });
  } catch (error) {
    logger.error(`Error pausing batch job ${req.params.id}:`, error);
    
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route PUT /api/batch/jobs/:id/resume
 * @description Resume a paused batch job
 * @access Private
 */
router.put('/jobs/:id/resume', authenticateUser, async (req, res) => {
  try {
    const jobId = req.params.id;
    
    // Check if job exists
    const job = batchController.jobs.get(jobId);
    
    if (!job) {
      return res.status(404).json({
        success: false,
        error: `Job ${jobId} not found`
      });
    }
    
    // Check if job can be resumed
    if (job.status !== JOB_STATUS.PAUSED) {
      return res.status(400).json({
        success: false,
        error: `Cannot resume job with status ${job.status}`
      });
    }
    
    // Resume job
    const updatedJob = batchController.resumeJob(jobId);
    
    res.json({
      success: true,
      job: updatedJob
    });
  } catch (error) {
    logger.error(`Error resuming batch job ${req.params.id}:`, error);
    
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route DELETE /api/batch/jobs/:id
 * @description Cancel a batch job
 * @access Private
 */
router.delete('/jobs/:id', authenticateUser, async (req, res) => {
  try {
    const jobId = req.params.id;
    
    // Check if job exists
    const job = batchController.jobs.get(jobId);
    
    if (!job) {
      return res.status(404).json({
        success: false,
        error: `Job ${jobId} not found`
      });
    }
    
    // Check if job can be cancelled
    if (job.status !== JOB_STATUS.PENDING && job.status !== JOB_STATUS.PROCESSING) {
      return res.status(400).json({
        success: false,
        error: `Cannot cancel job with status ${job.status}`
      });
    }
    
    // Cancel job
    const updatedJob = batchController.cancelJob(jobId);
    
    res.json({
      success: true,
      job: updatedJob
    });
  } catch (error) {
    logger.error(`Error cancelling batch job ${req.params.id}:`, error);
    
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route GET /api/batch/metrics
 * @description Get batch processing metrics
 * @access Private (Admin only)
 */
router.get('/metrics', authenticateUser, authorizeRole(['admin']), async (req, res) => {
  try {
    // Get metrics
    const metrics = batchController.getMetrics();
    
    res.json({
      success: true,
      metrics
    });
  } catch (error) {
    logger.error('Error getting batch metrics:', error);
    
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Error handling middleware
 */
router.use((err, req, res, next) => {
  logger.error('Batch API error:', err);
  
  res.status(500).json({
    success: false,
    error: err.message
  });
});

module.exports = router;