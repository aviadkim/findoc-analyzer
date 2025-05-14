/**
 * Background Processing Queue
 * 
 * Persistent queue system for batch processing jobs.
 * Manages job queues with priorities and persistence.
 */

const fs = require('fs').promises;
const path = require('path');
const { EventEmitter } = require('events');
const { v4: uuidv4 } = require('uuid');
const { logger } = require('../../utils/logger');

// Queue item status constants
const QUEUE_ITEM_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed'
};

// Priority levels
const PRIORITY = {
  HIGH: 'high',
  NORMAL: 'normal',
  LOW: 'low'
};

/**
 * BackgroundProcessingQueue class
 */
class BackgroundProcessingQueue extends EventEmitter {
  constructor(options = {}) {
    super();
    
    // Configuration options
    this.options = {
      queueName: options.queueName || 'default',
      storagePath: options.storagePath || path.join(process.cwd(), 'queues'),
      persistenceEnabled: options.persistenceEnabled !== false,
      pollingInterval: options.pollingInterval || 1000, // ms
      maxRetries: options.maxRetries || 3,
      retryDelay: options.retryDelay || 5000, // ms
      visibilityTimeout: options.visibilityTimeout || 30000, // 30 seconds
      ...options
    };
    
    // Queue persistence path
    this.queuePath = path.join(this.options.storagePath, this.options.queueName);
    
    // Queue data structure (in-memory)
    this.queueItems = {
      [PRIORITY.HIGH]: [],   // High priority items
      [PRIORITY.NORMAL]: [], // Normal priority items
      [PRIORITY.LOW]: []     // Low priority items
    };
    
    // In-flight items (items being processed)
    this.inFlightItems = new Map();
    
    // Queue processing state
    this.isProcessing = false;
    this.pollingInterval = null;
    
    // Initialize queue
    this.initialize();
  }
  
  /**
   * Initialize the queue
   */
  async initialize() {
    try {
      logger.info(`Initializing background processing queue: ${this.options.queueName}`);
      
      // Ensure queue storage directory exists
      if (this.options.persistenceEnabled) {
        await fs.mkdir(this.queuePath, { recursive: true });
        
        // Restore queue state from disk
        await this.restoreQueueState();
      }
      
      logger.info(`Queue initialized: ${this.options.queueName}`);
    } catch (error) {
      logger.error(`Failed to initialize queue ${this.options.queueName}:`, error);
      throw error;
    }
  }
  
  /**
   * Restore queue state from disk
   */
  async restoreQueueState() {
    try {
      logger.info(`Restoring queue state for ${this.options.queueName}`);
      
      // Read all queue item files
      const files = await fs.readdir(this.queuePath);
      const itemFiles = files.filter(file => file.endsWith('.json'));
      
      logger.info(`Found ${itemFiles.length} queue items to restore`);
      
      // Process each item file
      for (const file of itemFiles) {
        try {
          const filePath = path.join(this.queuePath, file);
          const data = await fs.readFile(filePath, 'utf8');
          const item = JSON.parse(data);
          
          // Validate item data
          if (!item.id || !item.priority || !item.status) {
            logger.warn(`Invalid queue item in file ${file}, skipping`);
            continue;
          }
          
          // Handle different item statuses
          switch (item.status) {
            case QUEUE_ITEM_STATUS.PENDING:
              // Add to appropriate queue
              this.queueItems[item.priority].push(item);
              break;
              
            case QUEUE_ITEM_STATUS.PROCESSING:
              // Check if item processing has timed out
              const visibilityTimeout = item.visibilityTimeout || this.options.visibilityTimeout;
              const processingStartTime = new Date(item.processingStartTime || 0);
              const now = new Date();
              
              if (now - processingStartTime > visibilityTimeout) {
                // Item processing timed out, return to pending state
                logger.info(`Queue item ${item.id} processing timed out, returning to pending state`);
                
                item.status = QUEUE_ITEM_STATUS.PENDING;
                item.processingStartTime = null;
                item.retries = (item.retries || 0) + 1;
                
                // Add to appropriate queue
                this.queueItems[item.priority].push(item);
              } else {
                // Item is still being processed, add to in-flight items
                this.inFlightItems.set(item.id, item);
              }
              break;
              
            case QUEUE_ITEM_STATUS.COMPLETED:
            case QUEUE_ITEM_STATUS.FAILED:
              // Remove completed or failed items older than 24 hours
              const completionTime = new Date(item.completionTime || 0);
              const age = now - completionTime;
              
              if (age > 24 * 60 * 60 * 1000) { // 24 hours
                // Delete item file
                await fs.unlink(filePath);
              }
              break;
              
            default:
              logger.warn(`Unknown queue item status: ${item.status} for item ${item.id}`);
          }
        } catch (error) {
          logger.error(`Failed to restore queue item from file ${file}:`, error);
        }
      }
      
      // Sort queues by priority and creation time
      for (const priority of Object.values(PRIORITY)) {
        this.queueItems[priority].sort((a, b) => {
          return new Date(a.createdAt) - new Date(b.createdAt);
        });
      }
      
      // Log queue state
      this.logQueueState();
      
    } catch (error) {
      logger.error(`Failed to restore queue state for ${this.options.queueName}:`, error);
      throw error;
    }
  }
  
  /**
   * Log the current queue state
   */
  logQueueState() {
    const highCount = this.queueItems[PRIORITY.HIGH].length;
    const normalCount = this.queueItems[PRIORITY.NORMAL].length;
    const lowCount = this.queueItems[PRIORITY.LOW].length;
    const inFlightCount = this.inFlightItems.size;
    
    logger.info(`Queue state for ${this.options.queueName}: ` +
      `High: ${highCount}, Normal: ${normalCount}, Low: ${lowCount}, InFlight: ${inFlightCount}`);
  }
  
  /**
   * Add an item to the queue
   * @param {Object} data - The item data
   * @param {string} priority - Priority level (high, normal, low)
   * @returns {Object} - The queued item
   */
  async enqueue(data, priority = PRIORITY.NORMAL) {
    // Validate priority
    if (!Object.values(PRIORITY).includes(priority)) {
      throw new Error(`Invalid priority: ${priority}`);
    }
    
    // Create queue item
    const item = {
      id: uuidv4(),
      data,
      priority,
      status: QUEUE_ITEM_STATUS.PENDING,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      retries: 0
    };
    
    // Add to appropriate queue
    this.queueItems[priority].push(item);
    
    // Persist item
    if (this.options.persistenceEnabled) {
      await this.persistQueueItem(item);
    }
    
    // Emit event
    this.emit('item:enqueued', item);
    
    logger.info(`Enqueued item ${item.id} with priority ${priority}`);
    
    return item;
  }
  
  /**
   * Dequeue an item from the queue
   * @returns {Object|null} - The dequeued item or null if queue is empty
   */
  async dequeue() {
    // Check if there are any items to dequeue
    let item = null;
    
    // Check queues in priority order (high -> normal -> low)
    for (const priority of [PRIORITY.HIGH, PRIORITY.NORMAL, PRIORITY.LOW]) {
      if (this.queueItems[priority].length > 0) {
        item = this.queueItems[priority].shift();
        break;
      }
    }
    
    // No items in any queue
    if (!item) {
      return null;
    }
    
    // Update item status
    item.status = QUEUE_ITEM_STATUS.PROCESSING;
    item.processingStartTime = new Date().toISOString();
    item.updatedAt = new Date().toISOString();
    
    // Add to in-flight items
    this.inFlightItems.set(item.id, item);
    
    // Persist item
    if (this.options.persistenceEnabled) {
      await this.persistQueueItem(item);
    }
    
    // Emit event
    this.emit('item:dequeued', item);
    
    logger.debug(`Dequeued item ${item.id} with priority ${item.priority}`);
    
    return item;
  }
  
  /**
   * Complete a queue item
   * @param {string} itemId - The item ID
   * @param {Object} result - The processing result
   */
  async completeItem(itemId, result) {
    // Get the item
    const item = this.inFlightItems.get(itemId);
    
    if (!item) {
      logger.warn(`Cannot complete unknown item ${itemId}`);
      return;
    }
    
    // Update item status
    item.status = QUEUE_ITEM_STATUS.COMPLETED;
    item.result = result;
    item.completionTime = new Date().toISOString();
    item.updatedAt = new Date().toISOString();
    
    // Remove from in-flight items
    this.inFlightItems.delete(itemId);
    
    // Persist item
    if (this.options.persistenceEnabled) {
      await this.persistQueueItem(item);
    }
    
    // Emit event
    this.emit('item:completed', item);
    
    logger.debug(`Completed item ${itemId}`);
  }
  
  /**
   * Fail a queue item
   * @param {string} itemId - The item ID
   * @param {Error} error - The error that occurred
   */
  async failItem(itemId, error) {
    // Get the item
    const item = this.inFlightItems.get(itemId);
    
    if (!item) {
      logger.warn(`Cannot fail unknown item ${itemId}`);
      return;
    }
    
    // Increment retry count
    item.retries = (item.retries || 0) + 1;
    
    // Check if we should retry
    if (item.retries < this.options.maxRetries) {
      // Return to pending state for retry
      item.status = QUEUE_ITEM_STATUS.PENDING;
      item.processingStartTime = null;
      item.error = {
        message: error.message,
        stack: error.stack,
        code: error.code || 'PROCESSING_ERROR'
      };
      item.updatedAt = new Date().toISOString();
      
      // Remove from in-flight items
      this.inFlightItems.delete(itemId);
      
      // Add back to queue with a delay
      setTimeout(() => {
        this.queueItems[item.priority].push(item);
        
        // Emit event
        this.emit('item:retry', item);
        
        logger.info(`Queued item ${itemId} for retry (${item.retries}/${this.options.maxRetries})`);
      }, this.options.retryDelay);
      
      // Persist item
      if (this.options.persistenceEnabled) {
        await this.persistQueueItem(item);
      }
    } else {
      // Mark as permanently failed
      item.status = QUEUE_ITEM_STATUS.FAILED;
      item.error = {
        message: error.message,
        stack: error.stack,
        code: error.code || 'PROCESSING_ERROR'
      };
      item.completionTime = new Date().toISOString();
      item.updatedAt = new Date().toISOString();
      
      // Remove from in-flight items
      this.inFlightItems.delete(itemId);
      
      // Persist item
      if (this.options.persistenceEnabled) {
        await this.persistQueueItem(item);
      }
      
      // Emit event
      this.emit('item:failed', item);
      
      logger.error(`Failed item ${itemId} after ${item.retries} retries: ${error.message}`);
    }
  }
  
  /**
   * Delete a queue item
   * @param {string} itemId - The item ID
   */
  async deleteItem(itemId) {
    // Check in-flight items
    if (this.inFlightItems.has(itemId)) {
      this.inFlightItems.delete(itemId);
    }
    
    // Check queue items
    for (const priority of Object.values(PRIORITY)) {
      const index = this.queueItems[priority].findIndex(item => item.id === itemId);
      
      if (index !== -1) {
        this.queueItems[priority].splice(index, 1);
      }
    }
    
    // Delete persisted item
    if (this.options.persistenceEnabled) {
      const itemPath = path.join(this.queuePath, `${itemId}.json`);
      
      try {
        await fs.unlink(itemPath);
      } catch (error) {
        // Ignore file not found errors
        if (error.code !== 'ENOENT') {
          logger.error(`Failed to delete queue item file ${itemPath}:`, error);
        }
      }
    }
    
    // Emit event
    this.emit('item:deleted', { id: itemId });
    
    logger.info(`Deleted queue item ${itemId}`);
  }
  
  /**
   * Persist a queue item to disk
   * @param {Object} item - The queue item
   */
  async persistQueueItem(item) {
    if (!this.options.persistenceEnabled) {
      return;
    }
    
    try {
      const itemPath = path.join(this.queuePath, `${item.id}.json`);
      await fs.writeFile(itemPath, JSON.stringify(item, null, 2), 'utf8');
    } catch (error) {
      logger.error(`Failed to persist queue item ${item.id}:`, error);
      throw error;
    }
  }
  
  /**
   * Check for timed out in-flight items
   */
  checkTimeouts() {
    const now = new Date();
    const visibilityTimeout = this.options.visibilityTimeout;
    
    for (const [itemId, item] of this.inFlightItems.entries()) {
      const processingStartTime = new Date(item.processingStartTime || 0);
      
      if (now - processingStartTime > visibilityTimeout) {
        logger.warn(`Queue item ${itemId} processing timed out, returning to queue`);
        
        // Simulate a failure to trigger retry logic
        this.failItem(itemId, new Error('Processing timed out'));
      }
    }
  }
  
  /**
   * Get the queue statistics
   * @returns {Object} - Queue statistics
   */
  getStats() {
    return {
      name: this.options.queueName,
      counts: {
        high: this.queueItems[PRIORITY.HIGH].length,
        normal: this.queueItems[PRIORITY.NORMAL].length,
        low: this.queueItems[PRIORITY.LOW].length,
        inFlight: this.inFlightItems.size,
        total: this.queueItems[PRIORITY.HIGH].length +
               this.queueItems[PRIORITY.NORMAL].length +
               this.queueItems[PRIORITY.LOW].length +
               this.inFlightItems.size
      },
      oldestItem: this.getOldestItemAge()
    };
  }
  
  /**
   * Get the age of the oldest pending item
   * @returns {number|null} - Age in milliseconds or null if no items
   */
  getOldestItemAge() {
    let oldestCreatedAt = null;
    
    // Check all queues
    for (const priority of Object.values(PRIORITY)) {
      for (const item of this.queueItems[priority]) {
        const createdAt = new Date(item.createdAt);
        
        if (!oldestCreatedAt || createdAt < oldestCreatedAt) {
          oldestCreatedAt = createdAt;
        }
      }
    }
    
    if (!oldestCreatedAt) {
      return null;
    }
    
    return Date.now() - oldestCreatedAt;
  }
  
  /**
   * Start processing the queue
   * @param {Function} processor - Function to process queue items
   */
  startProcessing(processor) {
    if (typeof processor !== 'function') {
      throw new Error('Processor must be a function');
    }
    
    if (this.isProcessing) {
      logger.warn(`Queue ${this.options.queueName} is already processing`);
      return;
    }
    
    logger.info(`Starting queue processing for ${this.options.queueName}`);
    
    this.isProcessing = true;
    this.processor = processor;
    
    // Setup polling interval
    this.pollingInterval = setInterval(() => {
      this.processNextItem();
      this.checkTimeouts();
    }, this.options.pollingInterval);
    
    // Start processing immediately
    this.processNextItem();
  }
  
  /**
   * Stop processing the queue
   */
  stopProcessing() {
    if (!this.isProcessing) {
      return;
    }
    
    logger.info(`Stopping queue processing for ${this.options.queueName}`);
    
    this.isProcessing = false;
    
    // Clear polling interval
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }
  
  /**
   * Process the next item in the queue
   */
  async processNextItem() {
    if (!this.isProcessing || !this.processor) {
      return;
    }
    
    try {
      // Dequeue an item
      const item = await this.dequeue();
      
      if (!item) {
        // No items to process
        return;
      }
      
      // Process the item
      this.processor(item, 
        // Success callback
        async (result) => {
          await this.completeItem(item.id, result);
        },
        // Error callback
        async (error) => {
          await this.failItem(item.id, error);
        }
      );
    } catch (error) {
      logger.error(`Error processing queue item:`, error);
    }
  }
  
  /**
   * Shut down the queue
   */
  async shutdown() {
    logger.info(`Shutting down queue ${this.options.queueName}`);
    
    // Stop processing
    this.stopProcessing();
    
    // Persist all in-memory items
    if (this.options.persistenceEnabled) {
      // Persist in-flight items
      for (const item of this.inFlightItems.values()) {
        try {
          await this.persistQueueItem(item);
        } catch (error) {
          logger.error(`Failed to persist in-flight item ${item.id} during shutdown:`, error);
        }
      }
      
      // Persist queued items
      for (const priority of Object.values(PRIORITY)) {
        for (const item of this.queueItems[priority]) {
          try {
            await this.persistQueueItem(item);
          } catch (error) {
            logger.error(`Failed to persist queued item ${item.id} during shutdown:`, error);
          }
        }
      }
    }
    
    logger.info(`Queue ${this.options.queueName} shutdown complete`);
  }
}

// Export BackgroundProcessingQueue and constants
module.exports = {
  BackgroundProcessingQueue,
  QUEUE_ITEM_STATUS,
  PRIORITY
};