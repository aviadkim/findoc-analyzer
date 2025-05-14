/**
 * Batch Processor Utility for FinDoc Analyzer
 * 
 * This module provides utilities for batch processing of financial documents.
 * It handles job scheduling, processing, tracking, and error handling.
 */

const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const EventEmitter = require('events');

// In-memory storage for batch jobs
// In a production environment, this would be stored in a database
const batchJobs = new Map();

// Event emitter for batch job events
const jobEvents = new EventEmitter();

// Batch job statuses
const JOB_STATUS = {
  QUEUED: 'queued',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled'
};

/**
 * Creates a new batch job
 * 
 * @param {Object} options - Job options
 * @param {string} options.name - Job name
 * @param {Array} options.items - Array of items to process
 * @param {Object} options.options - Additional job options
 * @param {Function} options.processFn - Function to process each item
 * @returns {Object} The created job
 */
function createBatchJob(options) {
  const { name, items, options: jobOptions = {}, processFn } = options;
  
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error('Batch job must have at least one item to process');
  }
  
  if (typeof processFn !== 'function') {
    throw new Error('Process function must be provided');
  }
  
  const jobId = uuidv4();
  const job = {
    id: jobId,
    name: name || `Batch Job ${jobId}`,
    status: JOB_STATUS.QUEUED,
    createdAt: new Date(),
    startedAt: null,
    completedAt: null,
    totalItems: items.length,
    processedItems: 0,
    failedItems: 0,
    errors: [],
    results: [],
    options: jobOptions,
    items
  };
  
  batchJobs.set(jobId, job);
  
  jobEvents.emit('job:created', { jobId, job });
  
  return {
    id: jobId,
    status: job.status,
    name: job.name,
    totalItems: job.totalItems
  };
}

/**
 * Starts processing a batch job
 * 
 * @param {string} jobId - ID of the job to start
 * @param {Function} processFn - Function to process each item
 * @returns {Object} The updated job
 */
async function startBatchJob(jobId, processFn) {
  const job = batchJobs.get(jobId);
  
  if (!job) {
    throw new Error(`Job with ID ${jobId} not found`);
  }
  
  if (job.status !== JOB_STATUS.QUEUED) {
    throw new Error(`Job with ID ${jobId} cannot be started. Current status: ${job.status}`);
  }
  
  // Update job status
  job.status = JOB_STATUS.PROCESSING;
  job.startedAt = new Date();
  batchJobs.set(jobId, job);
  
  jobEvents.emit('job:started', { jobId, job });
  
  // Process items sequentially to avoid overwhelming the system
  try {
    for (const [index, item] of job.items.entries()) {
      try {
        const result = await processFn(item, index, job);
        job.results.push(result);
        job.processedItems++;
        
        jobEvents.emit('item:processed', { 
          jobId, 
          itemIndex: index, 
          item, 
          result,
          progress: {
            current: job.processedItems,
            total: job.totalItems,
            percentage: Math.round((job.processedItems / job.totalItems) * 100)
          }
        });
      } catch (error) {
        job.failedItems++;
        job.errors.push({
          item,
          index,
          error: error.message || 'Unknown error',
          stack: error.stack
        });
        
        jobEvents.emit('item:failed', { 
          jobId, 
          itemIndex: index, 
          item, 
          error,
          progress: {
            current: job.processedItems + job.failedItems,
            total: job.totalItems,
            percentage: Math.round(((job.processedItems + job.failedItems) / job.totalItems) * 100)
          }
        });
      }
      
      // Check if job was cancelled during processing
      const updatedJob = batchJobs.get(jobId);
      if (updatedJob.status === JOB_STATUS.CANCELLED) {
        break;
      }
    }
    
    // Update job status if not cancelled
    const updatedJob = batchJobs.get(jobId);
    if (updatedJob.status !== JOB_STATUS.CANCELLED) {
      updatedJob.status = JOB_STATUS.COMPLETED;
      updatedJob.completedAt = new Date();
      batchJobs.set(jobId, updatedJob);
      
      jobEvents.emit('job:completed', { jobId, job: updatedJob });
    }
    
    return getBatchJobStatus(jobId);
  } catch (error) {
    job.status = JOB_STATUS.FAILED;
    job.completedAt = new Date();
    job.errors.push({
      error: error.message || 'Unknown error',
      stack: error.stack
    });
    
    batchJobs.set(jobId, job);
    
    jobEvents.emit('job:failed', { jobId, job, error });
    
    return getBatchJobStatus(jobId);
  }
}

/**
 * Cancels a batch job
 * 
 * @param {string} jobId - ID of the job to cancel
 * @returns {Object} The updated job
 */
function cancelBatchJob(jobId) {
  const job = batchJobs.get(jobId);
  
  if (!job) {
    throw new Error(`Job with ID ${jobId} not found`);
  }
  
  if (job.status === JOB_STATUS.COMPLETED || job.status === JOB_STATUS.FAILED) {
    throw new Error(`Job with ID ${jobId} cannot be cancelled. Current status: ${job.status}`);
  }
  
  job.status = JOB_STATUS.CANCELLED;
  job.completedAt = new Date();
  
  batchJobs.set(jobId, job);
  
  jobEvents.emit('job:cancelled', { jobId, job });
  
  return getBatchJobStatus(jobId);
}

/**
 * Gets batch job status
 * 
 * @param {string} jobId - ID of the job
 * @returns {Object} The job status
 */
function getBatchJobStatus(jobId) {
  const job = batchJobs.get(jobId);
  
  if (!job) {
    throw new Error(`Job with ID ${jobId} not found`);
  }
  
  return {
    id: job.id,
    name: job.name,
    status: job.status,
    createdAt: job.createdAt,
    startedAt: job.startedAt,
    completedAt: job.completedAt,
    totalItems: job.totalItems,
    processedItems: job.processedItems,
    failedItems: job.failedItems,
    progress: job.totalItems > 0 
      ? Math.round(((job.processedItems + job.failedItems) / job.totalItems) * 100) 
      : 0,
    hasErrors: job.errors.length > 0
  };
}

/**
 * Gets detailed batch job information
 * 
 * @param {string} jobId - ID of the job
 * @returns {Object} The job details
 */
function getBatchJobDetails(jobId) {
  const job = batchJobs.get(jobId);
  
  if (!job) {
    throw new Error(`Job with ID ${jobId} not found`);
  }
  
  return {
    ...job,
    // Add processing time statistics
    processTime: job.completedAt && job.startedAt
      ? ((job.completedAt - job.startedAt) / 1000).toFixed(2) + 's'
      : null,
    queueTime: job.startedAt && job.createdAt
      ? ((job.startedAt - job.createdAt) / 1000).toFixed(2) + 's'
      : null,
    totalTime: job.completedAt && job.createdAt
      ? ((job.completedAt - job.createdAt) / 1000).toFixed(2) + 's'
      : null
  };
}

/**
 * Gets all batch jobs
 * 
 * @param {Object} options - Filter options
 * @param {string} options.status - Filter by status
 * @returns {Array} Array of jobs
 */
function getAllBatchJobs(options = {}) {
  const jobs = Array.from(batchJobs.values());
  
  if (options.status) {
    return jobs
      .filter(job => job.status === options.status)
      .map(job => ({
        id: job.id,
        name: job.name,
        status: job.status,
        createdAt: job.createdAt,
        totalItems: job.totalItems,
        processedItems: job.processedItems,
        failedItems: job.failedItems,
        progress: job.totalItems > 0 
          ? Math.round(((job.processedItems + job.failedItems) / job.totalItems) * 100) 
          : 0
      }));
  }
  
  return jobs.map(job => ({
    id: job.id,
    name: job.name,
    status: job.status,
    createdAt: job.createdAt,
    totalItems: job.totalItems,
    processedItems: job.processedItems,
    failedItems: job.failedItems,
    progress: job.totalItems > 0 
      ? Math.round(((job.processedItems + job.failedItems) / job.totalItems) * 100) 
      : 0
  }));
}

/**
 * Gets job results
 * 
 * @param {string} jobId - ID of the job
 * @returns {Array} Array of job results
 */
function getBatchJobResults(jobId) {
  const job = batchJobs.get(jobId);
  
  if (!job) {
    throw new Error(`Job with ID ${jobId} not found`);
  }
  
  return job.results;
}

/**
 * Gets job errors
 * 
 * @param {string} jobId - ID of the job
 * @returns {Array} Array of job errors
 */
function getBatchJobErrors(jobId) {
  const job = batchJobs.get(jobId);
  
  if (!job) {
    throw new Error(`Job with ID ${jobId} not found`);
  }
  
  return job.errors;
}

/**
 * Cleans up completed jobs older than the specified age
 * 
 * @param {Object} options - Cleanup options
 * @param {number} options.maxAgeMs - Maximum age in milliseconds
 * @param {string[]} options.statuses - Job statuses to clean up
 * @returns {number} Number of jobs cleaned up
 */
function cleanupBatchJobs(options = {}) {
  const {
    maxAgeMs = 24 * 60 * 60 * 1000, // Default: 24 hours
    statuses = [JOB_STATUS.COMPLETED, JOB_STATUS.FAILED, JOB_STATUS.CANCELLED]
  } = options;
  
  const now = new Date();
  let cleanedCount = 0;
  
  for (const [jobId, job] of batchJobs.entries()) {
    if (
      statuses.includes(job.status) &&
      job.completedAt &&
      (now - job.completedAt) > maxAgeMs
    ) {
      batchJobs.delete(jobId);
      cleanedCount++;
    }
  }
  
  return cleanedCount;
}

/**
 * Subscribe to batch job events
 * 
 * @param {string} eventName - Event name
 * @param {Function} callback - Event callback
 * @returns {Function} Function to unsubscribe
 */
function subscribeToBatchJobEvents(eventName, callback) {
  jobEvents.on(eventName, callback);
  
  return () => {
    jobEvents.off(eventName, callback);
  };
}

module.exports = {
  // Job statuses
  JOB_STATUS,
  
  // Job management
  createBatchJob,
  startBatchJob,
  cancelBatchJob,
  
  // Job information
  getBatchJobStatus,
  getBatchJobDetails,
  getAllBatchJobs,
  getBatchJobResults,
  getBatchJobErrors,
  
  // Maintenance
  cleanupBatchJobs,
  
  // Events
  subscribeToBatchJobEvents
};