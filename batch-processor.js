/**
 * Batch Processor for FinDoc Analyzer
 * 
 * This module provides functionality for batch processing of documents,
 * including background processing, progress tracking, and error handling.
 */

const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { processDocument } = require('./document-processor');

// Batch status
const BATCH_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed'
};

// Store for batch jobs
const batchJobs = new Map();

/**
 * Create a new batch job
 * @param {Array} files - Array of file objects
 * @param {Object} options - Batch options
 * @returns {Object} - Batch job
 */
function createBatchJob(files, options = {}) {
  const {
    tenantId,
    userId,
    documentType = 'unknown',
    priority = 1,
    callback = null
  } = options;
  
  // Create batch job
  const batchId = uuidv4();
  const timestamp = new Date().toISOString();
  
  const batchJob = {
    id: batchId,
    tenantId,
    userId,
    documentType,
    priority,
    callback,
    status: BATCH_STATUS.PENDING,
    progress: 0,
    totalFiles: files.length,
    processedFiles: 0,
    successfulFiles: 0,
    failedFiles: 0,
    files: files.map(file => ({
      id: uuidv4(),
      name: file.name,
      path: file.path,
      size: file.size,
      type: file.type,
      status: BATCH_STATUS.PENDING,
      result: null,
      error: null
    })),
    errors: [],
    createdAt: timestamp,
    updatedAt: timestamp,
    startedAt: null,
    completedAt: null
  };
  
  // Store batch job
  batchJobs.set(batchId, batchJob);
  
  // Start processing in the background
  setTimeout(() => processBatchJob(batchId), 0);
  
  return {
    id: batchId,
    status: batchJob.status,
    totalFiles: batchJob.totalFiles,
    createdAt: batchJob.createdAt
  };
}

/**
 * Process a batch job
 * @param {string} batchId - Batch job ID
 * @returns {Promise<void>}
 */
async function processBatchJob(batchId) {
  // Get batch job
  const batchJob = batchJobs.get(batchId);
  
  if (!batchJob) {
    console.error(`Batch job ${batchId} not found`);
    return;
  }
  
  // Update batch job status
  batchJob.status = BATCH_STATUS.PROCESSING;
  batchJob.startedAt = new Date().toISOString();
  batchJob.updatedAt = batchJob.startedAt;
  
  // Process files
  for (const file of batchJob.files) {
    try {
      // Skip already processed files
      if (file.status !== BATCH_STATUS.PENDING) {
        continue;
      }
      
      // Update file status
      file.status = BATCH_STATUS.PROCESSING;
      updateBatchProgress(batchJob);
      
      // Process file
      const result = await processDocument(file.path, batchJob.documentType);
      
      // Update file status
      file.status = BATCH_STATUS.COMPLETED;
      file.result = result;
      batchJob.processedFiles++;
      batchJob.successfulFiles++;
      
      // Update batch progress
      updateBatchProgress(batchJob);
    } catch (error) {
      console.error(`Error processing file ${file.name}:`, error);
      
      // Update file status
      file.status = BATCH_STATUS.FAILED;
      file.error = error.message;
      batchJob.processedFiles++;
      batchJob.failedFiles++;
      batchJob.errors.push({
        fileId: file.id,
        fileName: file.name,
        error: error.message,
        timestamp: new Date().toISOString()
      });
      
      // Update batch progress
      updateBatchProgress(batchJob);
    }
  }
  
  // Update batch job status
  batchJob.status = batchJob.failedFiles === batchJob.totalFiles
    ? BATCH_STATUS.FAILED
    : BATCH_STATUS.COMPLETED;
  batchJob.completedAt = new Date().toISOString();
  batchJob.updatedAt = batchJob.completedAt;
  
  // Call callback if provided
  if (typeof batchJob.callback === 'function') {
    try {
      batchJob.callback(batchJob);
    } catch (error) {
      console.error(`Error calling batch job callback for ${batchId}:`, error);
    }
  }
}

/**
 * Update batch job progress
 * @param {Object} batchJob - Batch job
 */
function updateBatchProgress(batchJob) {
  // Calculate progress
  batchJob.progress = Math.round((batchJob.processedFiles / batchJob.totalFiles) * 100);
  batchJob.updatedAt = new Date().toISOString();
}

/**
 * Get batch job status
 * @param {string} batchId - Batch job ID
 * @returns {Object} - Batch job status
 */
function getBatchJobStatus(batchId) {
  // Get batch job
  const batchJob = batchJobs.get(batchId);
  
  if (!batchJob) {
    return null;
  }
  
  // Return status
  return {
    id: batchJob.id,
    status: batchJob.status,
    progress: batchJob.progress,
    totalFiles: batchJob.totalFiles,
    processedFiles: batchJob.processedFiles,
    successfulFiles: batchJob.successfulFiles,
    failedFiles: batchJob.failedFiles,
    errors: batchJob.errors,
    createdAt: batchJob.createdAt,
    updatedAt: batchJob.updatedAt,
    startedAt: batchJob.startedAt,
    completedAt: batchJob.completedAt
  };
}

/**
 * Get batch job details
 * @param {string} batchId - Batch job ID
 * @returns {Object} - Batch job details
 */
function getBatchJobDetails(batchId) {
  // Get batch job
  const batchJob = batchJobs.get(batchId);
  
  if (!batchJob) {
    return null;
  }
  
  // Return details
  return {
    id: batchJob.id,
    tenantId: batchJob.tenantId,
    userId: batchJob.userId,
    documentType: batchJob.documentType,
    priority: batchJob.priority,
    status: batchJob.status,
    progress: batchJob.progress,
    totalFiles: batchJob.totalFiles,
    processedFiles: batchJob.processedFiles,
    successfulFiles: batchJob.successfulFiles,
    failedFiles: batchJob.failedFiles,
    files: batchJob.files.map(file => ({
      id: file.id,
      name: file.name,
      size: file.size,
      type: file.type,
      status: file.status,
      error: file.error
    })),
    errors: batchJob.errors,
    createdAt: batchJob.createdAt,
    updatedAt: batchJob.updatedAt,
    startedAt: batchJob.startedAt,
    completedAt: batchJob.completedAt
  };
}

/**
 * Get all batch jobs for a tenant
 * @param {string} tenantId - Tenant ID
 * @returns {Array} - Array of batch jobs
 */
function getBatchJobsForTenant(tenantId) {
  // Get batch jobs for tenant
  const tenantBatchJobs = [];
  
  for (const [_, batchJob] of batchJobs) {
    if (batchJob.tenantId === tenantId) {
      tenantBatchJobs.push({
        id: batchJob.id,
        status: batchJob.status,
        progress: batchJob.progress,
        totalFiles: batchJob.totalFiles,
        processedFiles: batchJob.processedFiles,
        successfulFiles: batchJob.successfulFiles,
        failedFiles: batchJob.failedFiles,
        createdAt: batchJob.createdAt,
        updatedAt: batchJob.updatedAt,
        startedAt: batchJob.startedAt,
        completedAt: batchJob.completedAt
      });
    }
  }
  
  // Sort by creation date (newest first)
  tenantBatchJobs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  
  return tenantBatchJobs;
}

/**
 * Cancel a batch job
 * @param {string} batchId - Batch job ID
 * @returns {boolean} - True if job was cancelled, false otherwise
 */
function cancelBatchJob(batchId) {
  // Get batch job
  const batchJob = batchJobs.get(batchId);
  
  if (!batchJob) {
    return false;
  }
  
  // Check if job can be cancelled
  if (batchJob.status === BATCH_STATUS.COMPLETED || batchJob.status === BATCH_STATUS.FAILED) {
    return false;
  }
  
  // Update batch job status
  batchJob.status = BATCH_STATUS.FAILED;
  batchJob.updatedAt = new Date().toISOString();
  batchJob.completedAt = batchJob.updatedAt;
  batchJob.errors.push({
    error: 'Batch job cancelled by user',
    timestamp: batchJob.updatedAt
  });
  
  // Update pending files
  for (const file of batchJob.files) {
    if (file.status === BATCH_STATUS.PENDING) {
      file.status = BATCH_STATUS.FAILED;
      file.error = 'Batch job cancelled by user';
    }
  }
  
  return true;
}

/**
 * Delete a batch job
 * @param {string} batchId - Batch job ID
 * @returns {boolean} - True if job was deleted, false otherwise
 */
function deleteBatchJob(batchId) {
  // Get batch job
  const batchJob = batchJobs.get(batchId);
  
  if (!batchJob) {
    return false;
  }
  
  // Check if job can be deleted
  if (batchJob.status === BATCH_STATUS.PROCESSING) {
    return false;
  }
  
  // Delete batch job
  return batchJobs.delete(batchId);
}

/**
 * Clean up old batch jobs
 * @param {number} maxAge - Maximum age in milliseconds
 * @returns {number} - Number of jobs cleaned up
 */
function cleanupBatchJobs(maxAge = 7 * 24 * 60 * 60 * 1000) { // 7 days
  let cleanedCount = 0;
  const now = Date.now();
  
  for (const [batchId, batchJob] of batchJobs.entries()) {
    // Check if job is completed or failed
    if (batchJob.status === BATCH_STATUS.COMPLETED || batchJob.status === BATCH_STATUS.FAILED) {
      // Check if job is old enough
      const jobDate = new Date(batchJob.updatedAt).getTime();
      
      if (now - jobDate > maxAge) {
        // Delete job
        batchJobs.delete(batchId);
        cleanedCount++;
      }
    }
  }
  
  return cleanedCount;
}

module.exports = {
  createBatchJob,
  getBatchJobStatus,
  getBatchJobDetails,
  getBatchJobsForTenant,
  cancelBatchJob,
  deleteBatchJob,
  cleanupBatchJobs,
  BATCH_STATUS
};
