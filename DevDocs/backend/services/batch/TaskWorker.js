/**
 * Task Worker
 * 
 * Worker thread for processing individual batch tasks.
 * Runs in a separate thread and communicates with the batch controller.
 */

const { workerData, parentPort } = require('worker_threads');
const { processors } = require('./TaskProcessors');

// Extract worker data
const { jobId, taskId, taskData } = workerData;

// Send a message to the parent thread
function sendMessage(type, data) {
  parentPort.postMessage({ type, data });
}

// Report progress to the parent thread
function reportProgress(progress) {
  sendMessage('progress', { progress });
}

// Process the task
async function processTask() {
  try {
    // Log start time
    const startTime = Date.now();
    
    // Send initial progress update
    reportProgress(0);
    
    // Get the appropriate processor for this task
    const processor = getTaskProcessor(taskData.type);
    
    if (!processor) {
      throw new Error(`Unknown task type: ${taskData.type}`);
    }
    
    // Set up progress callback
    const progressCallback = (progress) => {
      reportProgress(progress);
    };
    
    // Process the task
    const result = await processor(taskData, progressCallback);
    
    // Calculate processing time
    const processingTime = Date.now() - startTime;
    
    // Send completion message
    sendMessage('complete', { 
      result, 
      processingTime 
    });
    
  } catch (error) {
    // Send error message
    parentPort.postMessage({
      type: 'error',
      data: {
        message: error.message,
        stack: error.stack,
        code: error.code || 'TASK_ERROR'
      }
    });
  }
}

/**
 * Get the task processor based on task type
 * @param {string} taskType - The type of task to process
 * @returns {Function} - The task processor function
 */
function getTaskProcessor(taskType) {
  return processors[taskType];
}

// Start task processing
processTask().catch(error => {
  // Last resort error handling if the try/catch in processTask fails
  parentPort.postMessage({
    type: 'error',
    data: {
      message: error.message,
      stack: error.stack,
      code: error.code || 'CATASTROPHIC_ERROR'
    }
  });
});