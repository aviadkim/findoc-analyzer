/**
 * Batch Status Tracker
 * 
 * System for tracking and reporting the status of batch processing jobs.
 * Provides real-time monitoring, metrics collection, and alerts.
 */

const fs = require('fs').promises;
const path = require('path');
const { EventEmitter } = require('events');
const { logger } = require('../../utils/logger');

// Status update types
const UPDATE_TYPE = {
  JOB_CREATED: 'job_created',
  JOB_STARTED: 'job_started',
  JOB_PROGRESS: 'job_progress',
  JOB_COMPLETED: 'job_completed',
  JOB_FAILED: 'job_failed',
  JOB_PAUSED: 'job_paused',
  JOB_RESUMED: 'job_resumed',
  JOB_CANCELLED: 'job_cancelled',
  TASK_STARTED: 'task_started',
  TASK_PROGRESS: 'task_progress',
  TASK_COMPLETED: 'task_completed',
  TASK_FAILED: 'task_failed',
  SYSTEM_ALERT: 'system_alert'
};

// Alert levels
const ALERT_LEVEL = {
  INFO: 'info',
  WARNING: 'warning',
  ERROR: 'error',
  CRITICAL: 'critical'
};

/**
 * BatchStatusTracker class
 */
class BatchStatusTracker extends EventEmitter {
  constructor(options = {}) {
    super();
    
    // Configuration options
    this.options = {
      storageEnabled: options.storageEnabled !== false,
      storagePath: options.storagePath || path.join(process.cwd(), 'status'),
      maxStatusHistory: options.maxStatusHistory || 1000,
      statusCleanupInterval: options.statusCleanupInterval || 60 * 60 * 1000, // 1 hour
      metricsInterval: options.metricsInterval || 60 * 1000, // 1 minute
      alertThresholds: options.alertThresholds || {
        jobFailureRate: 0.1, // 10% failure rate
        taskFailureRate: 0.2, // 20% failure rate
        longRunningJobThreshold: 60 * 60 * 1000, // 1 hour
        highQueueBacklogThreshold: 100 // 100 jobs in queue
      },
      ...options
    };
    
    // Status storage path
    this.statusPath = path.join(this.options.storagePath, 'batch-status');
    
    // Job status tracking
    this.jobStatus = new Map();
    this.jobHistory = [];
    
    // System metrics
    this.metrics = {
      jobs: {
        created: 0,
        started: 0,
        completed: 0,
        failed: 0,
        cancelled: 0,
        total: 0
      },
      tasks: {
        started: 0,
        completed: 0,
        failed: 0,
        total: 0
      },
      performance: {
        avgJobDuration: 0,
        avgTaskDuration: 0,
        throughput: 0 // jobs per minute
      },
      currentPeriod: {
        startTime: Date.now(),
        jobsCompleted: 0,
        jobsFailed: 0
      }
    };
    
    // Alert tracking
    this.activeAlerts = new Map();
    this.alertHistory = [];
    
    // Status listeners
    this.statusListeners = new Set();
    
    // Timers
    this.statusCleanupTimer = null;
    this.metricsTimer = null;
    
    // Initialize
    this.initialize();
  }
  
  /**
   * Initialize the status tracker
   */
  async initialize() {
    try {
      logger.info('Initializing batch status tracker');
      
      // Ensure status storage directory exists
      if (this.options.storageEnabled) {
        await fs.mkdir(this.statusPath, { recursive: true });
      }
      
      // Start status cleanup timer
      this.statusCleanupTimer = setInterval(() => {
        this.cleanupStatusHistory();
      }, this.options.statusCleanupInterval);
      
      // Start metrics collection timer
      this.metricsTimer = setInterval(() => {
        this.collectMetrics();
      }, this.options.metricsInterval);
      
      logger.info('Batch status tracker initialized');
    } catch (error) {
      logger.error('Failed to initialize batch status tracker:', error);
      throw error;
    }
  }
  
  /**
   * Register a batch controller to track
   * @param {Object} batchController - The batch controller to track
   */
  registerBatchController(batchController) {
    if (!batchController || typeof batchController.on !== 'function') {
      throw new Error('Invalid batch controller');
    }
    
    logger.info('Registering batch controller with status tracker');
    
    // Register event listeners for all batch controller events
    batchController.on('job:created', (data) => this.updateStatus(UPDATE_TYPE.JOB_CREATED, data));
    batchController.on('job:started', (data) => this.updateStatus(UPDATE_TYPE.JOB_STARTED, data));
    batchController.on('job:progress', (data) => this.updateStatus(UPDATE_TYPE.JOB_PROGRESS, data));
    batchController.on('job:completed', (data) => this.updateStatus(UPDATE_TYPE.JOB_COMPLETED, data));
    batchController.on('job:failed', (data) => this.updateStatus(UPDATE_TYPE.JOB_FAILED, data));
    batchController.on('job:paused', (data) => this.updateStatus(UPDATE_TYPE.JOB_PAUSED, data));
    batchController.on('job:resumed', (data) => this.updateStatus(UPDATE_TYPE.JOB_RESUMED, data));
    batchController.on('job:cancelled', (data) => this.updateStatus(UPDATE_TYPE.JOB_CANCELLED, data));
    batchController.on('task:started', (data) => this.updateStatus(UPDATE_TYPE.TASK_STARTED, data));
    batchController.on('task:progress', (data) => this.updateStatus(UPDATE_TYPE.TASK_PROGRESS, data));
    batchController.on('task:completed', (data) => this.updateStatus(UPDATE_TYPE.TASK_COMPLETED, data));
    batchController.on('task:failed', (data) => this.updateStatus(UPDATE_TYPE.TASK_FAILED, data));
  }
  
  /**
   * Update job status
   * @param {string} updateType - Type of status update
   * @param {Object} data - Status update data
   */
  updateStatus(updateType, data) {
    // Create status update object
    const statusUpdate = {
      type: updateType,
      timestamp: new Date().toISOString(),
      data
    };
    
    // Add to job history
    this.jobHistory.push(statusUpdate);
    
    // Trim history if needed
    if (this.jobHistory.length > this.options.maxStatusHistory) {
      this.jobHistory.shift(); // Remove oldest entry
    }
    
    // Update job status map
    if (data.jobId) {
      let jobStatus = this.jobStatus.get(data.jobId);
      
      if (!jobStatus) {
        // Initialize job status
        jobStatus = {
          jobId: data.jobId,
          status: 'unknown',
          progress: 0,
          createdAt: statusUpdate.timestamp,
          updatedAt: statusUpdate.timestamp,
          tasks: {}
        };
        
        this.jobStatus.set(data.jobId, jobStatus);
      }
      
      // Update job status based on update type
      switch (updateType) {
        case UPDATE_TYPE.JOB_CREATED:
          jobStatus.status = 'created';
          jobStatus.job = data.job;
          this.metrics.jobs.created++;
          this.metrics.jobs.total++;
          break;
          
        case UPDATE_TYPE.JOB_STARTED:
          jobStatus.status = 'processing';
          jobStatus.startedAt = statusUpdate.timestamp;
          jobStatus.job = data.job;
          this.metrics.jobs.started++;
          break;
          
        case UPDATE_TYPE.JOB_PROGRESS:
          jobStatus.progress = data.progress;
          jobStatus.job = data.job;
          break;
          
        case UPDATE_TYPE.JOB_COMPLETED:
          jobStatus.status = 'completed';
          jobStatus.progress = 100;
          jobStatus.completedAt = statusUpdate.timestamp;
          jobStatus.job = data.job;
          this.metrics.jobs.completed++;
          this.metrics.currentPeriod.jobsCompleted++;
          break;
          
        case UPDATE_TYPE.JOB_FAILED:
          jobStatus.status = 'failed';
          jobStatus.error = data.error;
          jobStatus.job = data.job;
          this.metrics.jobs.failed++;
          this.metrics.currentPeriod.jobsFailed++;
          break;
          
        case UPDATE_TYPE.JOB_PAUSED:
          jobStatus.status = 'paused';
          jobStatus.job = data.job;
          break;
          
        case UPDATE_TYPE.JOB_RESUMED:
          jobStatus.status = 'processing';
          jobStatus.job = data.job;
          break;
          
        case UPDATE_TYPE.JOB_CANCELLED:
          jobStatus.status = 'cancelled';
          jobStatus.job = data.job;
          this.metrics.jobs.cancelled++;
          break;
          
        case UPDATE_TYPE.TASK_STARTED:
          if (data.taskId) {
            jobStatus.tasks[data.taskId] = {
              status: 'processing',
              startedAt: statusUpdate.timestamp,
              updatedAt: statusUpdate.timestamp
            };
          }
          this.metrics.tasks.started++;
          this.metrics.tasks.total++;
          break;
          
        case UPDATE_TYPE.TASK_PROGRESS:
          if (data.taskId) {
            jobStatus.tasks[data.taskId] = {
              ...jobStatus.tasks[data.taskId],
              progress: data.progress,
              updatedAt: statusUpdate.timestamp
            };
          }
          break;
          
        case UPDATE_TYPE.TASK_COMPLETED:
          if (data.taskId) {
            jobStatus.tasks[data.taskId] = {
              ...jobStatus.tasks[data.taskId],
              status: 'completed',
              progress: 100,
              completedAt: statusUpdate.timestamp,
              updatedAt: statusUpdate.timestamp
            };
          }
          this.metrics.tasks.completed++;
          break;
          
        case UPDATE_TYPE.TASK_FAILED:
          if (data.taskId) {
            jobStatus.tasks[data.taskId] = {
              ...jobStatus.tasks[data.taskId],
              status: 'failed',
              error: data.error,
              updatedAt: statusUpdate.timestamp
            };
          }
          this.metrics.tasks.failed++;
          break;
      }
      
      // Update last updated timestamp
      jobStatus.updatedAt = statusUpdate.timestamp;
      
      // Check for alerts
      this.checkForAlerts(updateType, data, jobStatus);
    }
    
    // Store status update
    if (this.options.storageEnabled) {
      this.storeStatusUpdate(statusUpdate).catch(error => {
        logger.error('Failed to store status update:', error);
      });
    }
    
    // Notify status listeners
    this.notifyStatusListeners(statusUpdate);
    
    // Emit events
    this.emit(updateType, statusUpdate);
    this.emit('status:update', statusUpdate);
  }
  
  /**
   * Store a status update to disk
   * @param {Object} statusUpdate - The status update to store
   */
  async storeStatusUpdate(statusUpdate) {
    if (!this.options.storageEnabled) {
      return;
    }
    
    try {
      const jobId = statusUpdate.data.jobId;
      
      if (!jobId) {
        return;
      }
      
      // Create job directory
      const jobDir = path.join(this.statusPath, jobId);
      await fs.mkdir(jobDir, { recursive: true });
      
      // Generate a unique filename
      const filename = `${Date.now()}-${statusUpdate.type}.json`;
      const filePath = path.join(jobDir, filename);
      
      // Write status update to file
      await fs.writeFile(filePath, JSON.stringify(statusUpdate, null, 2), 'utf8');
    } catch (error) {
      logger.error('Failed to store status update:', error);
      throw error;
    }
  }
  
  /**
   * Check for alerts based on status updates
   * @param {string} updateType - Type of status update
   * @param {Object} data - Status update data
   * @param {Object} jobStatus - Current job status
   */
  checkForAlerts(updateType, data, jobStatus) {
    // Check for job failure alert
    if (updateType === UPDATE_TYPE.JOB_FAILED) {
      this.createAlert(
        ALERT_LEVEL.ERROR,
        'JOB_FAILURE',
        `Job ${data.jobId} failed`,
        { jobId: data.jobId, error: data.error }
      );
    }
    
    // Check for task failure alert
    if (updateType === UPDATE_TYPE.TASK_FAILED) {
      this.createAlert(
        ALERT_LEVEL.WARNING,
        'TASK_FAILURE',
        `Task ${data.taskId} in job ${data.jobId} failed`,
        { jobId: data.jobId, taskId: data.taskId, error: data.error }
      );
    }
    
    // Check for long-running job alert
    if (updateType === UPDATE_TYPE.JOB_PROGRESS && jobStatus.startedAt) {
      const jobStartTime = new Date(jobStatus.startedAt).getTime();
      const currentTime = Date.now();
      const jobDuration = currentTime - jobStartTime;
      
      if (jobDuration > this.options.alertThresholds.longRunningJobThreshold) {
        // Create alert if one doesn't already exist for this job
        const alertId = `LONG_RUNNING_JOB_${data.jobId}`;
        
        if (!this.activeAlerts.has(alertId)) {
          this.createAlert(
            ALERT_LEVEL.WARNING,
            'LONG_RUNNING_JOB',
            `Job ${data.jobId} has been running for ${Math.floor(jobDuration / 60000)} minutes`,
            { jobId: data.jobId, duration: jobDuration, progress: data.progress }
          );
        }
      }
    }
  }
  
  /**
   * Create a system alert
   * @param {string} level - Alert level (info, warning, error, critical)
   * @param {string} type - Alert type
   * @param {string} message - Alert message
   * @param {Object} data - Additional alert data
   * @returns {Object} - The created alert
   */
  createAlert(level, type, message, data = {}) {
    // Generate alert ID
    const alertId = `${type}_${Date.now()}`;
    
    // Create alert object
    const alert = {
      id: alertId,
      level,
      type,
      message,
      timestamp: new Date().toISOString(),
      data
    };
    
    // Add to active alerts
    this.activeAlerts.set(alertId, alert);
    
    // Add to alert history
    this.alertHistory.push(alert);
    
    // Trim alert history if needed
    if (this.alertHistory.length > this.options.maxStatusHistory) {
      this.alertHistory.shift(); // Remove oldest entry
    }
    
    // Create system alert status update
    this.updateStatus(UPDATE_TYPE.SYSTEM_ALERT, {
      alert
    });
    
    logger.warn(`Batch processing alert: ${message}`);
    
    return alert;
  }
  
  /**
   * Resolve an active alert
   * @param {string} alertId - ID of the alert to resolve
   * @param {string} resolution - Resolution message
   */
  resolveAlert(alertId, resolution) {
    const alert = this.activeAlerts.get(alertId);
    
    if (!alert) {
      return;
    }
    
    // Update alert
    alert.resolved = true;
    alert.resolvedAt = new Date().toISOString();
    alert.resolution = resolution;
    
    // Remove from active alerts
    this.activeAlerts.delete(alertId);
    
    // Create system alert status update for resolution
    this.updateStatus(UPDATE_TYPE.SYSTEM_ALERT, {
      alert,
      resolution
    });
    
    logger.info(`Resolved batch processing alert ${alertId}: ${resolution}`);
  }
  
  /**
   * Collect system metrics
   */
  collectMetrics() {
    const now = Date.now();
    const currentPeriod = this.metrics.currentPeriod;
    const periodDuration = (now - currentPeriod.startTime) / 60000; // minutes
    
    // Calculate jobs per minute (throughput)
    this.metrics.performance.throughput = 
      periodDuration > 0 ? currentPeriod.jobsCompleted / periodDuration : 0;
    
    // Calculate average job duration
    const completedJobs = Array.from(this.jobStatus.values())
      .filter(job => job.status === 'completed' && job.startedAt && job.completedAt);
    
    if (completedJobs.length > 0) {
      const totalDuration = completedJobs.reduce((sum, job) => {
        const startTime = new Date(job.startedAt).getTime();
        const endTime = new Date(job.completedAt).getTime();
        return sum + (endTime - startTime);
      }, 0);
      
      this.metrics.performance.avgJobDuration = totalDuration / completedJobs.length;
    }
    
    // Calculate job failure rate
    const totalJobsProcessed = currentPeriod.jobsCompleted + currentPeriod.jobsFailed;
    const failureRate = totalJobsProcessed > 0 ? 
      currentPeriod.jobsFailed / totalJobsProcessed : 0;
    
    // Check for high failure rate alert
    if (failureRate > this.options.alertThresholds.jobFailureRate && totalJobsProcessed >= 5) {
      this.createAlert(
        ALERT_LEVEL.ERROR,
        'HIGH_JOB_FAILURE_RATE',
        `High job failure rate detected: ${(failureRate * 100).toFixed(1)}%`,
        {
          failureRate,
          jobsCompleted: currentPeriod.jobsCompleted,
          jobsFailed: currentPeriod.jobsFailed,
          period: periodDuration
        }
      );
    }
    
    // Reset metrics for next period if enough time has passed
    if (periodDuration >= 5) { // Reset every 5 minutes
      this.metrics.currentPeriod = {
        startTime: now,
        jobsCompleted: 0,
        jobsFailed: 0
      };
    }
    
    // Emit metrics event
    this.emit('metrics:update', this.getMetrics());
  }
  
  /**
   * Get the current system metrics
   * @returns {Object} - System metrics
   */
  getMetrics() {
    // Calculate additional metrics
    const now = Date.now();
    
    // Count jobs by status
    const jobStatusCounts = {
      created: 0,
      processing: 0,
      completed: 0,
      failed: 0,
      paused: 0,
      cancelled: 0,
      unknown: 0
    };
    
    for (const job of this.jobStatus.values()) {
      if (job.status in jobStatusCounts) {
        jobStatusCounts[job.status]++;
      } else {
        jobStatusCounts.unknown++;
      }
    }
    
    return {
      timestamp: new Date().toISOString(),
      jobs: {
        ...this.metrics.jobs,
        current: jobStatusCounts
      },
      tasks: this.metrics.tasks,
      performance: this.metrics.performance,
      alerts: {
        active: this.activeAlerts.size,
        byLevel: {
          info: this.alertHistory.filter(a => a.level === ALERT_LEVEL.INFO && !a.resolved).length,
          warning: this.alertHistory.filter(a => a.level === ALERT_LEVEL.WARNING && !a.resolved).length,
          error: this.alertHistory.filter(a => a.level === ALERT_LEVEL.ERROR && !a.resolved).length,
          critical: this.alertHistory.filter(a => a.level === ALERT_LEVEL.CRITICAL && !a.resolved).length
        }
      }
    };
  }
  
  /**
   * Get detailed status for a specific job
   * @param {string} jobId - Job ID
   * @returns {Object} - Job status
   */
  getJobStatus(jobId) {
    const status = this.jobStatus.get(jobId);
    
    if (!status) {
      return null;
    }
    
    return {
      ...status,
      metrics: {
        duration: status.startedAt ? 
          (status.completedAt ? 
            new Date(status.completedAt) - new Date(status.startedAt) : 
            Date.now() - new Date(status.startedAt)) : 
          null,
        taskCount: Object.keys(status.tasks).length,
        completedTasks: Object.values(status.tasks)
          .filter(task => task.status === 'completed').length,
        failedTasks: Object.values(status.tasks)
          .filter(task => task.status === 'failed').length
      },
      alerts: this.alertHistory
        .filter(alert => alert.data.jobId === jobId)
        .map(alert => ({
          id: alert.id,
          level: alert.level,
          type: alert.type,
          message: alert.message,
          timestamp: alert.timestamp,
          resolved: alert.resolved,
          resolvedAt: alert.resolvedAt,
          resolution: alert.resolution
        }))
    };
  }
  
  /**
   * Get recent status updates for a job
   * @param {string} jobId - Job ID
   * @param {number} limit - Maximum number of updates to return
   * @returns {Array} - Status updates
   */
  getJobStatusHistory(jobId, limit = 100) {
    return this.jobHistory
      .filter(update => update.data.jobId === jobId)
      .slice(-limit)
      .reverse();
  }
  
  /**
   * Get all active alerts
   * @returns {Array} - Active alerts
   */
  getActiveAlerts() {
    return Array.from(this.activeAlerts.values());
  }
  
  /**
   * Get alert history
   * @param {number} limit - Maximum number of alerts to return
   * @returns {Array} - Alert history
   */
  getAlertHistory(limit = 100) {
    return this.alertHistory.slice(-limit).reverse();
  }
  
  /**
   * Register a status listener
   * @param {Function} listener - Status listener function
   * @returns {string} - Listener ID
   */
  registerStatusListener(listener) {
    if (typeof listener !== 'function') {
      throw new Error('Status listener must be a function');
    }
    
    const listenerId = `listener-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Store listener with ID
    this.statusListeners.add({
      id: listenerId,
      callback: listener
    });
    
    logger.debug(`Registered status listener ${listenerId}`);
    
    return listenerId;
  }
  
  /**
   * Unregister a status listener
   * @param {string} listenerId - ID of listener to unregister
   * @returns {boolean} - Whether the listener was removed
   */
  unregisterStatusListener(listenerId) {
    // Find and remove listener
    for (const listener of this.statusListeners) {
      if (listener.id === listenerId) {
        this.statusListeners.delete(listener);
        logger.debug(`Unregistered status listener ${listenerId}`);
        return true;
      }
    }
    
    return false;
  }
  
  /**
   * Notify all status listeners
   * @param {Object} statusUpdate - Status update
   */
  notifyStatusListeners(statusUpdate) {
    for (const listener of this.statusListeners) {
      try {
        listener.callback(statusUpdate);
      } catch (error) {
        logger.error(`Error in status listener ${listener.id}:`, error);
      }
    }
  }
  
  /**
   * Clean up old status history
   */
  cleanupStatusHistory() {
    // Keep job status entries up to date
    const activeJobs = new Set();
    
    // Find active jobs (recent activity)
    const now = Date.now();
    const activeThreshold = 24 * 60 * 60 * 1000; // 24 hours
    
    for (const [jobId, status] of this.jobStatus.entries()) {
      const updatedAt = new Date(status.updatedAt).getTime();
      
      // If job is still active or recently updated, keep it
      if (status.status === 'processing' || status.status === 'paused' || 
          now - updatedAt < activeThreshold) {
        activeJobs.add(jobId);
      }
    }
    
    // Remove old, inactive jobs from status map
    for (const jobId of this.jobStatus.keys()) {
      if (!activeJobs.has(jobId)) {
        this.jobStatus.delete(jobId);
      }
    }
    
    // Remove old resolved alerts from alert history
    this.alertHistory = this.alertHistory.filter(alert => {
      if (!alert.resolved) {
        return true;
      }
      
      const resolvedAt = new Date(alert.resolvedAt).getTime();
      return now - resolvedAt < activeThreshold;
    });
    
    // Clean up status files on disk
    if (this.options.storageEnabled) {
      this.cleanupStatusFiles().catch(error => {
        logger.error('Failed to clean up status files:', error);
      });
    }
  }
  
  /**
   * Clean up old status files
   */
  async cleanupStatusFiles() {
    try {
      const statusDirs = await fs.readdir(this.statusPath);
      const now = Date.now();
      const retentionPeriod = 7 * 24 * 60 * 60 * 1000; // 7 days
      
      for (const dir of statusDirs) {
        const jobDir = path.join(this.statusPath, dir);
        
        // Check if directory
        const stat = await fs.stat(jobDir);
        
        if (!stat.isDirectory()) {
          continue;
        }
        
        // Check if job is active
        if (this.jobStatus.has(dir)) {
          continue;
        }
        
        // Check directory modification time
        if (now - stat.mtimeMs < retentionPeriod) {
          continue;
        }
        
        // Remove old job directory
        logger.debug(`Removing old status directory: ${jobDir}`);
        await fs.rm(jobDir, { recursive: true });
      }
    } catch (error) {
      logger.error('Failed to clean up status files:', error);
      throw error;
    }
  }
  
  /**
   * Shut down the status tracker
   */
  async shutdown() {
    logger.info('Shutting down batch status tracker');
    
    // Stop timers
    if (this.statusCleanupTimer) {
      clearInterval(this.statusCleanupTimer);
      this.statusCleanupTimer = null;
    }
    
    if (this.metricsTimer) {
      clearInterval(this.metricsTimer);
      this.metricsTimer = null;
    }
    
    // Final status update
    this.updateStatus(UPDATE_TYPE.SYSTEM_ALERT, {
      alert: {
        level: ALERT_LEVEL.INFO,
        type: 'SYSTEM_SHUTDOWN',
        message: 'Batch processing system shutting down'
      }
    });
    
    // Clear listeners
    this.statusListeners.clear();
    
    logger.info('Batch status tracker shutdown complete');
  }
}

// Export constants and class
module.exports = {
  BatchStatusTracker,
  UPDATE_TYPE,
  ALERT_LEVEL
};