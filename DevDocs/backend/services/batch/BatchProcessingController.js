/**
 * Batch Processing Controller
 * 
 * Central coordinator for batch document processing operations.
 * Manages job queues, worker allocation, status tracking, and error handling.
 */

const { Worker } = require('worker_threads');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { EventEmitter } = require('events');
const fs = require('fs').promises;
const os = require('os');
const { logger } = require('../../utils/logger');

// Job status constants
const JOB_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
  PAUSED: 'paused',
  CANCELLED: 'cancelled'
};

// Task status constants
const TASK_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
  SKIPPED: 'skipped'
};

// Priority levels
const PRIORITY = {
  HIGH: 'high',
  NORMAL: 'normal',
  LOW: 'low'
};

/**
 * BatchProcessingController class
 */
class BatchProcessingController extends EventEmitter {
  constructor(options = {}) {
    super();
    
    // Configuration options
    this.options = {
      maxWorkers: options.maxWorkers || Math.max(1, os.cpus().length - 1),
      jobStoragePath: options.jobStoragePath || path.join(os.tmpdir(), 'batch-jobs'),
      defaultPriority: options.defaultPriority || PRIORITY.NORMAL,
      persistenceEnabled: options.persistenceEnabled !== false,
      retryCount: options.retryCount || 3,
      retryDelay: options.retryDelay || 1000, // ms
      taskTimeout: options.taskTimeout || 300000, // 5 minutes
      jobTimeout: options.jobTimeout || 3600000, // 1 hour
      ...options
    };
    
    // Initialize job queues (separate queue for each priority)
    this.jobQueues = {
      [PRIORITY.HIGH]: [],
      [PRIORITY.NORMAL]: [],
      [PRIORITY.LOW]: []
    };
    
    // Job registry (stores all job details)
    this.jobs = new Map();
    
    // Active workers
    this.workers = new Map();
    
    // Initialize system
    this.initialize();
  }
  
  /**
   * Initialize the batch processing system
   */
  async initialize() {
    try {
      logger.info('Initializing batch processing controller');
      
      // Ensure job storage directory exists
      if (this.options.persistenceEnabled) {
        await fs.mkdir(this.options.jobStoragePath, { recursive: true });
        
        // Restore any persisted jobs from previous sessions
        await this.restorePersistedJobs();
      }
      
      // Set up periodic monitoring
      this.setupMonitoring();
      
      logger.info(`Batch processing controller initialized with ${this.options.maxWorkers} workers`);
    } catch (error) {
      logger.error('Failed to initialize batch processing controller:', error);
      throw error;
    }
  }
  
  /**
   * Set up periodic monitoring of jobs and workers
   */
  setupMonitoring() {
    // Monitor active jobs and workers
    setInterval(() => this.monitorJobs(), 10000);
    
    // Check for stalled jobs
    setInterval(() => this.checkStalledJobs(), 30000);
    
    // Cleanup completed jobs
    setInterval(() => this.cleanupJobs(), 60000);
  }
  
  /**
   * Create a new batch job
   * @param {Object} jobConfig - Job configuration
   * @returns {Object} - Created job object
   */
  createJob(jobConfig) {
    const jobId = jobConfig.id || uuidv4();
    const priority = jobConfig.priority || this.options.defaultPriority;
    
    // Validate tasks
    if (!jobConfig.tasks || !Array.isArray(jobConfig.tasks) || jobConfig.tasks.length === 0) {
      throw new Error('Job must contain at least one task');
    }
    
    // Create job object
    const job = {
      id: jobId,
      name: jobConfig.name || `Batch Job ${jobId}`,
      priority,
      status: JOB_STATUS.PENDING,
      createdAt: new Date(),
      updatedAt: new Date(),
      startedAt: null,
      completedAt: null,
      progress: 0,
      tasks: jobConfig.tasks.map((task, index) => ({
        id: task.id || `${jobId}-task-${index}`,
        name: task.name || `Task ${index + 1}`,
        status: TASK_STATUS.PENDING,
        data: task.data || {},
        retries: 0,
        error: null,
        startedAt: null,
        completedAt: null,
        result: null
      })),
      metadata: jobConfig.metadata || {},
      options: {
        retryCount: jobConfig.retryCount !== undefined ? 
          jobConfig.retryCount : this.options.retryCount,
        retryDelay: jobConfig.retryDelay !== undefined ? 
          jobConfig.retryDelay : this.options.retryDelay,
        taskTimeout: jobConfig.taskTimeout !== undefined ? 
          jobConfig.taskTimeout : this.options.taskTimeout,
        jobTimeout: jobConfig.jobTimeout !== undefined ? 
          jobConfig.jobTimeout : this.options.jobTimeout,
        continueOnFailure: jobConfig.continueOnFailure !== undefined ? 
          jobConfig.continueOnFailure : false,
        webhookUrl: jobConfig.webhookUrl || null,
        ...(jobConfig.options || {})
      }
    };
    
    // Register job
    this.jobs.set(jobId, job);
    
    // Add to appropriate queue
    this.jobQueues[priority].push(jobId);
    
    // Emit event
    this.emit('job:created', { jobId, job: this.getJobSummary(job) });
    
    // Persist job
    if (this.options.persistenceEnabled) {
      this.persistJob(job).catch(error => {
        logger.error(`Failed to persist job ${jobId}:`, error);
      });
    }
    
    // Process queue if workers are available
    this.processNextJob();
    
    logger.info(`Created batch job ${jobId} with ${job.tasks.length} tasks (priority: ${priority})`);
    
    return this.getJobSummary(job);
  }
  
  /**
   * Get a summary of the job for API responses
   * @param {Object} job - The job object
   * @returns {Object} - Job summary
   */
  getJobSummary(job) {
    return {
      id: job.id,
      name: job.name,
      status: job.status,
      priority: job.priority,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
      startedAt: job.startedAt,
      completedAt: job.completedAt,
      progress: job.progress,
      totalTasks: job.tasks.length,
      completedTasks: job.tasks.filter(task => 
        task.status === TASK_STATUS.COMPLETED || task.status === TASK_STATUS.SKIPPED
      ).length,
      failedTasks: job.tasks.filter(task => task.status === TASK_STATUS.FAILED).length,
      metadata: job.metadata
    };
  }
  
  /**
   * Get detailed job information including task details
   * @param {string} jobId - Job ID
   * @returns {Object} - Detailed job information
   */
  getJobDetails(jobId) {
    const job = this.jobs.get(jobId);
    
    if (!job) {
      throw new Error(`Job ${jobId} not found`);
    }
    
    return {
      ...this.getJobSummary(job),
      tasks: job.tasks.map(task => ({
        id: task.id,
        name: task.name,
        status: task.status,
        startedAt: task.startedAt,
        completedAt: task.completedAt,
        retries: task.retries,
        error: task.error ? {
          message: task.error.message,
          code: task.error.code
        } : null
      })),
      options: job.options
    };
  }
  
  /**
   * Get specific task details from a job
   * @param {string} jobId - Job ID
   * @param {string} taskId - Task ID
   * @returns {Object} - Task details
   */
  getTaskDetails(jobId, taskId) {
    const job = this.jobs.get(jobId);
    
    if (!job) {
      throw new Error(`Job ${jobId} not found`);
    }
    
    const task = job.tasks.find(t => t.id === taskId);
    
    if (!task) {
      throw new Error(`Task ${taskId} not found in job ${jobId}`);
    }
    
    return {
      id: task.id,
      name: task.name,
      status: task.status,
      startedAt: task.startedAt,
      completedAt: task.completedAt,
      retries: task.retries,
      error: task.error ? {
        message: task.error.message,
        code: task.error.code,
        stack: task.error.stack
      } : null,
      result: task.result
    };
  }
  
  /**
   * Process the next job in the queue
   */
  processNextJob() {
    // Check if we have capacity to process more jobs
    if (this.workers.size >= this.options.maxWorkers) {
      return;
    }
    
    // Find the next job to process (check high priority first, then normal, then low)
    let nextJobId = null;
    let priority = null;
    
    for (const p of [PRIORITY.HIGH, PRIORITY.NORMAL, PRIORITY.LOW]) {
      if (this.jobQueues[p].length > 0) {
        nextJobId = this.jobQueues[p][0];
        priority = p;
        break;
      }
    }
    
    // No jobs to process
    if (!nextJobId) {
      return;
    }
    
    const job = this.jobs.get(nextJobId);
    
    // Ensure job exists and is in pending state
    if (!job || job.status !== JOB_STATUS.PENDING) {
      // Remove job from queue if it's not pending
      this.jobQueues[priority] = this.jobQueues[priority].filter(id => id !== nextJobId);
      return this.processNextJob();
    }
    
    // Remove job from queue
    this.jobQueues[priority] = this.jobQueues[priority].filter(id => id !== nextJobId);
    
    // Start processing the job
    this.startJob(job);
  }
  
  /**
   * Start processing a job
   * @param {Object} job - The job to process
   */
  startJob(job) {
    // Update job status
    job.status = JOB_STATUS.PROCESSING;
    job.startedAt = new Date();
    job.updatedAt = new Date();
    
    // Emit event
    this.emit('job:started', { jobId: job.id, job: this.getJobSummary(job) });
    
    // Setup job timeout
    const jobTimeoutId = setTimeout(() => {
      this.handleJobTimeout(job);
    }, job.options.jobTimeout);
    
    // Store timeout ID
    job.timeoutId = jobTimeoutId;
    
    // Persist job status
    if (this.options.persistenceEnabled) {
      this.persistJob(job).catch(error => {
        logger.error(`Failed to persist job ${job.id} status:`, error);
      });
    }
    
    logger.info(`Started processing job ${job.id}`);
    
    // Process tasks in parallel up to maxWorkers limit
    this.processJobTasks(job);
  }
  
  /**
   * Process tasks for a given job
   * @param {Object} job - The job to process tasks for
   */
  processJobTasks(job) {
    // Find pending tasks
    const pendingTasks = job.tasks.filter(task => task.status === TASK_STATUS.PENDING);
    
    // Check if all tasks are completed
    if (pendingTasks.length === 0) {
      // If we have no pending tasks but some failed, and continueOnFailure is false,
      // then mark the job as failed
      const failedTasks = job.tasks.filter(task => task.status === TASK_STATUS.FAILED);
      
      if (failedTasks.length > 0 && !job.options.continueOnFailure) {
        this.completeJob(job, JOB_STATUS.FAILED);
        return;
      }
      
      // Otherwise, mark the job as completed
      this.completeJob(job, JOB_STATUS.COMPLETED);
      return;
    }
    
    // Check if we have capacity to process more tasks
    if (this.workers.size >= this.options.maxWorkers) {
      return;
    }
    
    // Get the next pending task
    const nextTask = pendingTasks[0];
    
    // Mark task as processing
    nextTask.status = TASK_STATUS.PROCESSING;
    nextTask.startedAt = new Date();
    
    // Update job
    job.updatedAt = new Date();
    this.updateJobProgress(job);
    
    // Emit event
    this.emit('task:started', { 
      jobId: job.id, 
      taskId: nextTask.id, 
      job: this.getJobSummary(job) 
    });
    
    // Create worker for this task
    this.createTaskWorker(job, nextTask);
    
    // Persist job status
    if (this.options.persistenceEnabled) {
      this.persistJob(job).catch(error => {
        logger.error(`Failed to persist job ${job.id} status:`, error);
      });
    }
    
    // If we still have capacity, process more tasks
    if (this.workers.size < this.options.maxWorkers) {
      this.processJobTasks(job);
    }
  }
  
  /**
   * Create a worker thread to process a task
   * @param {Object} job - The job
   * @param {Object} task - The task to process
   */
  createTaskWorker(job, task) {
    try {
      // Create worker
      const worker = new Worker(path.join(__dirname, 'TaskWorker.js'), {
        workerData: {
          jobId: job.id,
          taskId: task.id,
          taskData: task.data
        }
      });
      
      // Generate unique worker ID
      const workerId = `worker-${uuidv4()}`;
      
      // Store worker reference
      this.workers.set(workerId, {
        worker,
        jobId: job.id,
        taskId: task.id,
        startedAt: new Date()
      });
      
      // Setup task timeout
      const taskTimeoutId = setTimeout(() => {
        this.handleTaskTimeout(job, task, workerId);
      }, job.options.taskTimeout);
      
      // Store timeout ID with worker
      this.workers.get(workerId).timeoutId = taskTimeoutId;
      
      // Handle worker messages
      worker.on('message', message => {
        this.handleWorkerMessage(workerId, message);
      });
      
      // Handle worker errors
      worker.on('error', error => {
        this.handleWorkerError(workerId, error);
      });
      
      // Handle worker exit
      worker.on('exit', code => {
        this.handleWorkerExit(workerId, code);
      });
      
      logger.info(`Created worker for job ${job.id}, task ${task.id}`);
      
    } catch (error) {
      logger.error(`Failed to create worker for job ${job.id}, task ${task.id}:`, error);
      
      // Handle task failure
      this.handleTaskFailure(job, task, error);
      
      // Continue processing other tasks
      if (this.workers.size < this.options.maxWorkers) {
        this.processJobTasks(job);
      }
    }
  }
  
  /**
   * Handle messages from a worker
   * @param {string} workerId - Worker ID
   * @param {Object} message - Message from worker
   */
  handleWorkerMessage(workerId, message) {
    const workerInfo = this.workers.get(workerId);
    
    if (!workerInfo) {
      logger.warn(`Received message from unknown worker ${workerId}`);
      return;
    }
    
    const { jobId, taskId } = workerInfo;
    const job = this.jobs.get(jobId);
    
    if (!job) {
      logger.warn(`Received message for unknown job ${jobId} from worker ${workerId}`);
      return;
    }
    
    const task = job.tasks.find(t => t.id === taskId);
    
    if (!task) {
      logger.warn(`Received message for unknown task ${taskId} in job ${jobId} from worker ${workerId}`);
      return;
    }
    
    // Handle different message types
    switch (message.type) {
      case 'progress':
        // Update task progress
        task.progress = message.data.progress;
        this.updateJobProgress(job);
        
        // Emit progress event
        this.emit('task:progress', {
          jobId,
          taskId,
          progress: task.progress,
          job: this.getJobSummary(job)
        });
        
        break;
        
      case 'complete':
        // Clear task timeout
        if (workerInfo.timeoutId) {
          clearTimeout(workerInfo.timeoutId);
        }
        
        // Mark task as completed
        task.status = TASK_STATUS.COMPLETED;
        task.completedAt = new Date();
        task.result = message.data.result;
        
        // Update job
        job.updatedAt = new Date();
        this.updateJobProgress(job);
        
        // Emit event
        this.emit('task:completed', {
          jobId,
          taskId,
          job: this.getJobSummary(job)
        });
        
        // Terminate worker
        this.terminateWorker(workerId);
        
        // Process next task if available
        if (this.workers.size < this.options.maxWorkers) {
          this.processJobTasks(job);
        }
        
        // Persist job
        if (this.options.persistenceEnabled) {
          this.persistJob(job).catch(error => {
            logger.error(`Failed to persist job ${jobId} status:`, error);
          });
        }
        
        break;
        
      default:
        logger.debug(`Received unknown message type ${message.type} from worker ${workerId}`);
    }
  }
  
  /**
   * Handle worker errors
   * @param {string} workerId - Worker ID
   * @param {Error} error - Error from worker
   */
  handleWorkerError(workerId, error) {
    const workerInfo = this.workers.get(workerId);
    
    if (!workerInfo) {
      logger.warn(`Received error from unknown worker ${workerId}:`, error);
      return;
    }
    
    const { jobId, taskId } = workerInfo;
    const job = this.jobs.get(jobId);
    
    if (!job) {
      logger.warn(`Received error for unknown job ${jobId} from worker ${workerId}:`, error);
      return;
    }
    
    const task = job.tasks.find(t => t.id === taskId);
    
    if (!task) {
      logger.warn(`Received error for unknown task ${taskId} in job ${jobId} from worker ${workerId}:`, error);
      return;
    }
    
    logger.error(`Worker error for job ${jobId}, task ${taskId}:`, error);
    
    // Clear task timeout
    if (workerInfo.timeoutId) {
      clearTimeout(workerInfo.timeoutId);
    }
    
    // Handle task failure
    this.handleTaskFailure(job, task, error);
    
    // Terminate worker
    this.terminateWorker(workerId);
    
    // Process next task if available
    if (this.workers.size < this.options.maxWorkers) {
      this.processJobTasks(job);
    }
  }
  
  /**
   * Handle worker exit
   * @param {string} workerId - Worker ID
   * @param {number} code - Exit code
   */
  handleWorkerExit(workerId, code) {
    const workerInfo = this.workers.get(workerId);
    
    if (!workerInfo) {
      logger.debug(`Unknown worker ${workerId} exited with code ${code}`);
      return;
    }
    
    const { jobId, taskId } = workerInfo;
    
    logger.debug(`Worker for job ${jobId}, task ${taskId} exited with code ${code}`);
    
    // Remove worker from active workers
    this.workers.delete(workerId);
    
    // Process next job if available
    this.processNextJob();
  }
  
  /**
   * Terminate a worker
   * @param {string} workerId - Worker ID
   */
  terminateWorker(workerId) {
    const workerInfo = this.workers.get(workerId);
    
    if (!workerInfo) {
      return;
    }
    
    // Clear timeout if exists
    if (workerInfo.timeoutId) {
      clearTimeout(workerInfo.timeoutId);
    }
    
    // Terminate worker
    try {
      workerInfo.worker.terminate();
    } catch (error) {
      logger.warn(`Error terminating worker ${workerId}:`, error);
    }
    
    // Remove from active workers
    this.workers.delete(workerId);
  }
  
  /**
   * Handle task failure
   * @param {Object} job - The job
   * @param {Object} task - The failed task
   * @param {Error} error - The error
   */
  handleTaskFailure(job, task, error) {
    // Store error details
    task.error = {
      message: error.message,
      code: error.code || 'TASK_ERROR',
      stack: error.stack
    };
    
    // Check if we should retry
    if (task.retries < job.options.retryCount) {
      // Increment retry counter
      task.retries++;
      
      // Reset task status to pending for retry
      task.status = TASK_STATUS.PENDING;
      
      // Update job
      job.updatedAt = new Date();
      
      // Emit event
      this.emit('task:retry', {
        jobId: job.id,
        taskId: task.id,
        retryCount: task.retries,
        error: task.error,
        job: this.getJobSummary(job)
      });
      
      // Schedule retry after delay
      setTimeout(() => {
        // Only retry if job is still processing
        if (job.status === JOB_STATUS.PROCESSING) {
          this.processJobTasks(job);
        }
      }, job.options.retryDelay);
      
      logger.info(`Scheduled retry #${task.retries} for job ${job.id}, task ${task.id} after ${job.options.retryDelay}ms`);
    } else {
      // Mark task as failed
      task.status = TASK_STATUS.FAILED;
      task.completedAt = new Date();
      
      // Update job
      job.updatedAt = new Date();
      this.updateJobProgress(job);
      
      // Emit event
      this.emit('task:failed', {
        jobId: job.id,
        taskId: task.id,
        error: task.error,
        job: this.getJobSummary(job)
      });
      
      // Check if we should continue on failure
      if (!job.options.continueOnFailure) {
        // Check if all tasks are complete (processed in some way)
        const pendingTasks = job.tasks.filter(t => 
          t.status === TASK_STATUS.PENDING || t.status === TASK_STATUS.PROCESSING
        );
        
        if (pendingTasks.length === 0) {
          // All tasks are finished (either completed, failed, or skipped)
          this.completeJob(job, JOB_STATUS.FAILED);
        }
      } else {
        // Process next task if available
        this.processJobTasks(job);
      }
      
      logger.error(`Task ${task.id} failed after ${task.retries} retries in job ${job.id}: ${error.message}`);
    }
    
    // Persist job
    if (this.options.persistenceEnabled) {
      this.persistJob(job).catch(error => {
        logger.error(`Failed to persist job ${job.id} status:`, error);
      });
    }
  }
  
  /**
   * Handle task timeout
   * @param {Object} job - The job
   * @param {Object} task - The task
   * @param {string} workerId - Worker ID
   */
  handleTaskTimeout(job, task, workerId) {
    logger.warn(`Task ${task.id} in job ${job.id} timed out after ${job.options.taskTimeout}ms`);
    
    // Create timeout error
    const timeoutError = new Error(`Task timed out after ${job.options.taskTimeout}ms`);
    timeoutError.code = 'TASK_TIMEOUT';
    
    // Handle as a task failure
    this.handleTaskFailure(job, task, timeoutError);
    
    // Terminate worker
    this.terminateWorker(workerId);
  }
  
  /**
   * Handle job timeout
   * @param {Object} job - The job that timed out
   */
  handleJobTimeout(job) {
    // Only handle timeout if job is still processing
    if (job.status !== JOB_STATUS.PROCESSING) {
      return;
    }
    
    logger.warn(`Job ${job.id} timed out after ${job.options.jobTimeout}ms`);
    
    // Mark job as failed
    job.status = JOB_STATUS.FAILED;
    job.completedAt = new Date();
    job.updatedAt = new Date();
    job.error = {
      message: `Job timed out after ${job.options.jobTimeout}ms`,
      code: 'JOB_TIMEOUT'
    };
    
    // Terminate all workers for this job
    for (const [workerId, workerInfo] of this.workers.entries()) {
      if (workerInfo.jobId === job.id) {
        this.terminateWorker(workerId);
      }
    }
    
    // Mark pending tasks as skipped
    for (const task of job.tasks) {
      if (task.status === TASK_STATUS.PENDING || task.status === TASK_STATUS.PROCESSING) {
        task.status = TASK_STATUS.SKIPPED;
        if (task.status === TASK_STATUS.PROCESSING) {
          task.completedAt = new Date(); // Mark as complete even though it was skipped
        }
      }
    }
    
    // Emit event
    this.emit('job:timeout', {
      jobId: job.id,
      job: this.getJobSummary(job)
    });
    
    // Persist job
    if (this.options.persistenceEnabled) {
      this.persistJob(job).catch(error => {
        logger.error(`Failed to persist job ${job.id} status:`, error);
      });
    }
    
    // Process next job if available
    this.processNextJob();
  }
  
  /**
   * Update job progress based on task status
   * @param {Object} job - The job to update
   */
  updateJobProgress(job) {
    const totalTasks = job.tasks.length;
    const completedTasks = job.tasks.filter(task => 
      task.status === TASK_STATUS.COMPLETED || task.status === TASK_STATUS.SKIPPED
    ).length;
    
    // Calculate progress percentage
    job.progress = Math.floor((completedTasks / totalTasks) * 100);
    
    // Emit progress event
    this.emit('job:progress', {
      jobId: job.id,
      progress: job.progress,
      job: this.getJobSummary(job)
    });
    
    // Send webhook notification if configured
    if (job.options.webhookUrl) {
      this.sendWebhookNotification(job, 'progress');
    }
  }
  
  /**
   * Complete a job
   * @param {Object} job - The job to complete
   * @param {string} status - Final status (completed or failed)
   */
  completeJob(job, status) {
    // Clear job timeout
    if (job.timeoutId) {
      clearTimeout(job.timeoutId);
      delete job.timeoutId;
    }
    
    // Update job status
    job.status = status;
    job.completedAt = new Date();
    job.updatedAt = new Date();
    
    // Ensure progress is updated
    this.updateJobProgress(job);
    
    // Emit event
    this.emit(`job:${status.toLowerCase()}`, {
      jobId: job.id,
      job: this.getJobSummary(job)
    });
    
    logger.info(`Job ${job.id} ${status.toLowerCase()} with ${job.progress}% completion`);
    
    // Send webhook notification if configured
    if (job.options.webhookUrl) {
      this.sendWebhookNotification(job, status.toLowerCase());
    }
    
    // Persist job
    if (this.options.persistenceEnabled) {
      this.persistJob(job).catch(error => {
        logger.error(`Failed to persist job ${job.id} status:`, error);
      });
    }
    
    // Process next job if available
    this.processNextJob();
  }
  
  /**
   * Pause a job
   * @param {string} jobId - Job ID
   * @returns {Object} - Updated job summary
   */
  pauseJob(jobId) {
    const job = this.jobs.get(jobId);
    
    if (!job) {
      throw new Error(`Job ${jobId} not found`);
    }
    
    // Can only pause processing jobs
    if (job.status !== JOB_STATUS.PROCESSING) {
      throw new Error(`Cannot pause job with status ${job.status}`);
    }
    
    // Set job status to paused
    job.status = JOB_STATUS.PAUSED;
    job.updatedAt = new Date();
    
    // Terminate all workers for this job
    for (const [workerId, workerInfo] of this.workers.entries()) {
      if (workerInfo.jobId === jobId) {
        this.terminateWorker(workerId);
      }
    }
    
    // Emit event
    this.emit('job:paused', {
      jobId: job.id,
      job: this.getJobSummary(job)
    });
    
    logger.info(`Job ${jobId} paused`);
    
    // Persist job
    if (this.options.persistenceEnabled) {
      this.persistJob(job).catch(error => {
        logger.error(`Failed to persist job ${job.id} status:`, error);
      });
    }
    
    // Process next job if available
    this.processNextJob();
    
    return this.getJobSummary(job);
  }
  
  /**
   * Resume a paused job
   * @param {string} jobId - Job ID
   * @returns {Object} - Updated job summary
   */
  resumeJob(jobId) {
    const job = this.jobs.get(jobId);
    
    if (!job) {
      throw new Error(`Job ${jobId} not found`);
    }
    
    // Can only resume paused jobs
    if (job.status !== JOB_STATUS.PAUSED) {
      throw new Error(`Cannot resume job with status ${job.status}`);
    }
    
    // Reset status for processing tasks back to pending
    for (const task of job.tasks) {
      if (task.status === TASK_STATUS.PROCESSING) {
        task.status = TASK_STATUS.PENDING;
      }
    }
    
    // Set job status to processing
    job.status = JOB_STATUS.PROCESSING;
    job.updatedAt = new Date();
    
    // Emit event
    this.emit('job:resumed', {
      jobId: job.id,
      job: this.getJobSummary(job)
    });
    
    logger.info(`Job ${jobId} resumed`);
    
    // Persist job
    if (this.options.persistenceEnabled) {
      this.persistJob(job).catch(error => {
        logger.error(`Failed to persist job ${job.id} status:`, error);
      });
    }
    
    // Process tasks
    this.processJobTasks(job);
    
    return this.getJobSummary(job);
  }
  
  /**
   * Cancel a job
   * @param {string} jobId - Job ID
   * @returns {Object} - Updated job summary
   */
  cancelJob(jobId) {
    const job = this.jobs.get(jobId);
    
    if (!job) {
      throw new Error(`Job ${jobId} not found`);
    }
    
    // Can only cancel pending or processing jobs
    if (job.status !== JOB_STATUS.PENDING && job.status !== JOB_STATUS.PROCESSING) {
      throw new Error(`Cannot cancel job with status ${job.status}`);
    }
    
    // If job is pending, remove from queue
    if (job.status === JOB_STATUS.PENDING) {
      this.jobQueues[job.priority] = this.jobQueues[job.priority].filter(id => id !== jobId);
    }
    
    // Clear job timeout
    if (job.timeoutId) {
      clearTimeout(job.timeoutId);
      delete job.timeoutId;
    }
    
    // Set job status to cancelled
    job.status = JOB_STATUS.CANCELLED;
    job.completedAt = new Date();
    job.updatedAt = new Date();
    
    // Terminate all workers for this job
    for (const [workerId, workerInfo] of this.workers.entries()) {
      if (workerInfo.jobId === jobId) {
        this.terminateWorker(workerId);
      }
    }
    
    // Mark pending tasks as skipped
    for (const task of job.tasks) {
      if (task.status === TASK_STATUS.PENDING || task.status === TASK_STATUS.PROCESSING) {
        task.status = TASK_STATUS.SKIPPED;
        if (task.status === TASK_STATUS.PROCESSING) {
          task.completedAt = new Date(); // Mark as complete even though it was skipped
        }
      }
    }
    
    // Emit event
    this.emit('job:cancelled', {
      jobId: job.id,
      job: this.getJobSummary(job)
    });
    
    logger.info(`Job ${jobId} cancelled`);
    
    // Persist job
    if (this.options.persistenceEnabled) {
      this.persistJob(job).catch(error => {
        logger.error(`Failed to persist job ${job.id} status:`, error);
      });
    }
    
    // Process next job if available
    this.processNextJob();
    
    return this.getJobSummary(job);
  }
  
  /**
   * Persist job to storage
   * @param {Object} job - Job to persist
   */
  async persistJob(job) {
    if (!this.options.persistenceEnabled) {
      return;
    }
    
    try {
      const jobFilePath = path.join(this.options.jobStoragePath, `${job.id}.json`);
      
      // Create a copy of the job without circular references
      const jobCopy = JSON.parse(JSON.stringify({
        ...job,
        // Remove the worker instances and timeouts which can't be serialized
        workers: undefined,
        timeoutId: undefined
      }));
      
      await fs.writeFile(jobFilePath, JSON.stringify(jobCopy, null, 2), 'utf8');
      
      logger.debug(`Persisted job ${job.id} to ${jobFilePath}`);
    } catch (error) {
      logger.error(`Failed to persist job ${job.id}:`, error);
      throw error;
    }
  }
  
  /**
   * Restore persisted jobs from storage
   */
  async restorePersistedJobs() {
    try {
      logger.info(`Restoring persisted jobs from ${this.options.jobStoragePath}`);
      
      // Get all job files
      const files = await fs.readdir(this.options.jobStoragePath);
      const jobFiles = files.filter(file => file.endsWith('.json'));
      
      logger.info(`Found ${jobFiles.length} persisted jobs`);
      
      // Restore each job
      for (const jobFile of jobFiles) {
        try {
          // Read job data
          const jobFilePath = path.join(this.options.jobStoragePath, jobFile);
          const jobData = await fs.readFile(jobFilePath, 'utf8');
          const job = JSON.parse(jobData);
          
          // Skip completed, failed, or cancelled jobs that are older than 24 hours
          if ([JOB_STATUS.COMPLETED, JOB_STATUS.FAILED, JOB_STATUS.CANCELLED].includes(job.status)) {
            const completedAt = new Date(job.completedAt);
            const now = new Date();
            const ageInHours = (now - completedAt) / (1000 * 60 * 60);
            
            if (ageInHours > 24) {
              logger.debug(`Skipping restore of completed job ${job.id} (age: ${ageInHours.toFixed(1)} hours)`);
              continue;
            }
          }
          
          // Register job
          this.jobs.set(job.id, job);
          
          // For pending jobs, add to queue
          if (job.status === JOB_STATUS.PENDING) {
            this.jobQueues[job.priority].push(job.id);
          }
          // For processing or paused jobs that were interrupted
          else if (job.status === JOB_STATUS.PROCESSING) {
            // Mark as pending to restart processing
            job.status = JOB_STATUS.PENDING;
            
            // Reset any processing tasks to pending
            for (const task of job.tasks) {
              if (task.status === TASK_STATUS.PROCESSING) {
                task.status = TASK_STATUS.PENDING;
              }
            }
            
            // Add to queue
            this.jobQueues[job.priority].push(job.id);
          }
          
          logger.info(`Restored job ${job.id} with status ${job.status}`);
        } catch (error) {
          logger.error(`Failed to restore job from ${jobFile}:`, error);
        }
      }
      
      logger.info(`Restored ${this.jobs.size} jobs`);
      
      // Start processing jobs
      this.processNextJob();
    } catch (error) {
      logger.error('Failed to restore persisted jobs:', error);
    }
  }
  
  /**
   * Send webhook notification for job events
   * @param {Object} job - The job
   * @param {string} event - Event type
   */
  sendWebhookNotification(job, event) {
    if (!job.options.webhookUrl) {
      return;
    }
    
    // Don't send progress updates too frequently (max once per 5% progress change)
    if (event === 'progress') {
      // Store last notified progress in job metadata
      if (!job.metadata.lastNotifiedProgress) {
        job.metadata.lastNotifiedProgress = 0;
      }
      
      // Check if progress change is significant enough
      if (job.progress - job.metadata.lastNotifiedProgress < 5 && job.progress < 100) {
        return;
      }
      
      // Update last notified progress
      job.metadata.lastNotifiedProgress = job.progress;
    }
    
    // Prepare payload
    const payload = {
      event: `batch.job.${event}`,
      job: this.getJobSummary(job),
      timestamp: new Date().toISOString()
    };
    
    // Send notification asynchronously
    fetch(job.options.webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'FinDocAnalyzer-BatchProcessor'
      },
      body: JSON.stringify(payload)
    }).catch(error => {
      logger.error(`Failed to send webhook notification for job ${job.id}:`, error);
    });
  }
  
  /**
   * Monitor active jobs and workers
   */
  monitorJobs() {
    // Check for stalled workers
    const now = new Date();
    const stalledWorkerThreshold = 60000; // 1 minute
    
    for (const [workerId, workerInfo] of this.workers.entries()) {
      const workerAge = now - workerInfo.startedAt;
      
      // Check if worker has been running for too long
      if (workerAge > stalledWorkerThreshold) {
        logger.warn(`Worker ${workerId} for job ${workerInfo.jobId}, task ${workerInfo.taskId} may be stalled (running for ${workerAge}ms)`);
      }
    }
    
    // Log active jobs
    const activeJobs = Array.from(this.jobs.values())
      .filter(job => job.status === JOB_STATUS.PROCESSING);
    
    if (activeJobs.length > 0) {
      logger.debug(`Active jobs: ${activeJobs.length}, Active workers: ${this.workers.size}/${this.options.maxWorkers}`);
      
      // Log job details
      for (const job of activeJobs) {
        const completedTasks = job.tasks.filter(task => 
          task.status === TASK_STATUS.COMPLETED || task.status === TASK_STATUS.SKIPPED
        ).length;
        
        const processingTasks = job.tasks.filter(task => 
          task.status === TASK_STATUS.PROCESSING
        ).length;
        
        logger.debug(`Job ${job.id}: ${completedTasks}/${job.tasks.length} completed, ${processingTasks} processing, ${job.progress}% complete`);
      }
    }
  }
  
  /**
   * Check for stalled jobs
   */
  checkStalledJobs() {
    const now = new Date();
    const stalledJobThreshold = 30 * 60000; // 30 minutes
    
    // Check for processing jobs that haven't been updated in a while
    for (const job of this.jobs.values()) {
      if (job.status === JOB_STATUS.PROCESSING) {
        const lastUpdateTime = now - new Date(job.updatedAt);
        
        if (lastUpdateTime > stalledJobThreshold) {
          logger.warn(`Job ${job.id} may be stalled (last updated ${lastUpdateTime / 60000}m ago)`);
          
          // Trigger job timeout
          this.handleJobTimeout(job);
        }
      }
    }
  }
  
  /**
   * Cleanup completed, failed, and cancelled jobs
   */
  cleanupJobs() {
    const now = new Date();
    const retentionPeriod = 24 * 60 * 60 * 1000; // 24 hours
    let cleanedCount = 0;
    
    // Check for old jobs to clean up
    for (const [jobId, job] of this.jobs.entries()) {
      if ([JOB_STATUS.COMPLETED, JOB_STATUS.FAILED, JOB_STATUS.CANCELLED].includes(job.status)) {
        const completedAt = new Date(job.completedAt);
        const age = now - completedAt;
        
        if (age > retentionPeriod) {
          // Remove from memory
          this.jobs.delete(jobId);
          cleanedCount++;
          
          // Delete persisted job file
          if (this.options.persistenceEnabled) {
            const jobFilePath = path.join(this.options.jobStoragePath, `${jobId}.json`);
            
            fs.unlink(jobFilePath).catch(error => {
              logger.error(`Failed to delete job file ${jobFilePath}:`, error);
            });
          }
        }
      }
    }
    
    if (cleanedCount > 0) {
      logger.info(`Cleaned up ${cleanedCount} old jobs`);
    }
  }
  
  /**
   * Get system metrics and stats
   * @returns {Object} - System metrics
   */
  getMetrics() {
    // Count jobs by status
    const jobCounts = {
      pending: 0,
      processing: 0,
      completed: 0,
      failed: 0,
      paused: 0,
      cancelled: 0,
      total: this.jobs.size
    };
    
    for (const job of this.jobs.values()) {
      jobCounts[job.status.toLowerCase()]++;
    }
    
    // Count tasks by status
    const taskCounts = {
      pending: 0,
      processing: 0,
      completed: 0,
      failed: 0,
      skipped: 0,
      total: 0
    };
    
    for (const job of this.jobs.values()) {
      taskCounts.total += job.tasks.length;
      
      for (const task of job.tasks) {
        taskCounts[task.status.toLowerCase()]++;
      }
    }
    
    // Queue sizes
    const queueSizes = {
      high: this.jobQueues[PRIORITY.HIGH].length,
      normal: this.jobQueues[PRIORITY.NORMAL].length,
      low: this.jobQueues[PRIORITY.LOW].length,
      total: this.jobQueues[PRIORITY.HIGH].length + 
             this.jobQueues[PRIORITY.NORMAL].length + 
             this.jobQueues[PRIORITY.LOW].length
    };
    
    // Worker stats
    const workerStats = {
      active: this.workers.size,
      capacity: this.options.maxWorkers,
      utilization: this.workers.size / this.options.maxWorkers
    };
    
    return {
      timestamp: new Date().toISOString(),
      jobs: jobCounts,
      tasks: taskCounts,
      queues: queueSizes,
      workers: workerStats,
      system: {
        cpus: os.cpus().length,
        freeMem: os.freemem(),
        totalMem: os.totalmem(),
        memUsage: process.memoryUsage()
      }
    };
  }
  
  /**
   * Shutdown the batch processing controller
   */
  async shutdown() {
    logger.info('Shutting down batch processing controller');
    
    // Pause all processing jobs
    for (const job of this.jobs.values()) {
      if (job.status === JOB_STATUS.PROCESSING) {
        // Mark as paused so we can resume on restart
        job.status = JOB_STATUS.PAUSED;
        job.updatedAt = new Date();
        
        // Persist job
        if (this.options.persistenceEnabled) {
          await this.persistJob(job).catch(error => {
            logger.error(`Failed to persist job ${job.id} status during shutdown:`, error);
          });
        }
      }
    }
    
    // Terminate all active workers
    for (const [workerId, workerInfo] of this.workers.entries()) {
      this.terminateWorker(workerId);
    }
    
    logger.info('Batch processing controller shutdown complete');
  }
}

// Export the controller and constants
module.exports = {
  BatchProcessingController,
  JOB_STATUS,
  TASK_STATUS,
  PRIORITY
};