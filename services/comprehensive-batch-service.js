/**
 * Comprehensive Batch Service
 * 
 * A comprehensive service for batch document processing with advanced features:
 * - Multi-tenant support
 * - Priority queue management
 * - Processing rate limiting
 * - Error handling and retry mechanism
 * - Event notifications
 * - Support for multiple document types
 * - Progress tracking and reporting
 * - Resource management
 */

const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { promisify } = require('util');
const EventEmitter = require('events');

// Existing services
const documentService = require('./document-service');
const enhancedPdfProcessor = require('./enhanced-pdf-service');

// Promisified fs functions
const writeFileAsync = promisify(fs.writeFile);
const readFileAsync = promisify(fs.readFile);
const mkdirAsync = promisify(fs.mkdir);
const unlinkAsync = promisify(fs.unlink);
const readdirAsync = promisify(fs.readdir);

// Batch job statuses
const BATCH_STATUS = {
  CREATED: 'created',
  QUEUED: 'queued',
  PROCESSING: 'processing',
  PAUSED: 'paused',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled'
};

// File statuses
const FILE_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
  SKIPPED: 'skipped'
};

// Priority levels
const PRIORITY = {
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low'
};

// Document types
const DOCUMENT_TYPES = {
  PDF: 'pdf',
  EXCEL: 'excel',
  FINANCIAL: 'financial',
  PORTFOLIO: 'portfolio'
};

// Default options
const DEFAULT_OPTIONS = {
  maxConcurrentJobs: 3,
  maxRetries: 3,
  retryDelay: 5000, // 5 seconds
  jobTimeout: 300000, // 5 minutes
  cleanupAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  notifyOnCompletion: true,
  notifyOnError: true,
  storeResults: true,
  resultsDir: path.join(process.cwd(), 'results', 'batches'),
  uploadsDir: path.join(process.cwd(), 'uploads'),
  useMockData: false,
  autoStartQueue: true
};

/**
 * Comprehensive Batch Service
 */
class ComprehensiveBatchService extends EventEmitter {
  /**
   * Initialize the batch service
   * @param {Object} options - Service options
   */
  constructor(options = {}) {
    super();
    
    // Merge options with defaults
    this.options = { ...DEFAULT_OPTIONS, ...options };
    
    // Initialize service
    this.initialize();
    
    // Create processing queues
    this.queues = {
      [PRIORITY.HIGH]: [],
      [PRIORITY.MEDIUM]: [],
      [PRIORITY.LOW]: []
    };
    
    // Active jobs
    this.activeJobs = new Map();
    
    // All jobs (including completed)
    this.allJobs = new Map();
    
    // Processing statistics
    this.stats = {
      totalJobs: 0,
      completedJobs: 0,
      failedJobs: 0,
      totalFiles: 0,
      processedFiles: 0,
      failedFiles: 0,
      startTime: new Date(),
      lastJobTime: null
    };
    
    // Start job processor if auto-start is enabled
    if (this.options.autoStartQueue) {
      this.startProcessor();
    }
  }
  
  /**
   * Initialize the service
   * @private
   */
  async initialize() {
    try {
      // Create directories
      await mkdirAsync(this.options.resultsDir, { recursive: true });
      await mkdirAsync(this.options.uploadsDir, { recursive: true });
      
      // Load existing jobs
      await this.loadExistingJobs();
      
      console.log(`Comprehensive Batch Service initialized (maxConcurrentJobs: ${this.options.maxConcurrentJobs})`);
    } catch (error) {
      console.error('Error initializing batch service:', error);
      throw error;
    }
  }
  
  /**
   * Load existing jobs from disk
   * @private
   */
  async loadExistingJobs() {
    try {
      // Get all batch job files
      const files = await readdirAsync(this.options.resultsDir);
      const batchFiles = files.filter(file => file.startsWith('batch-') && file.endsWith('.json'));
      
      console.log(`Found ${batchFiles.length} existing batch jobs`);
      
      // Load batch jobs
      for (const file of batchFiles) {
        try {
          const filePath = path.join(this.options.resultsDir, file);
          const batchJobData = await readFileAsync(filePath, 'utf8');
          const batchJob = JSON.parse(batchJobData);
          
          // Add to all jobs map
          this.allJobs.set(batchJob.id, batchJob);
          
          // Update stats
          this.stats.totalJobs++;
          this.stats.totalFiles += batchJob.files.length;
          this.stats.processedFiles += batchJob.processedFiles;
          
          if (batchJob.status === BATCH_STATUS.COMPLETED) {
            this.stats.completedJobs++;
          } else if (batchJob.status === BATCH_STATUS.FAILED) {
            this.stats.failedJobs++;
          } else if (
            batchJob.status === BATCH_STATUS.CREATED || 
            batchJob.status === BATCH_STATUS.QUEUED
          ) {
            // Re-queue unfinished jobs
            this.queues[batchJob.priority || PRIORITY.MEDIUM].push(batchJob.id);
          }
        } catch (error) {
          console.error(`Error loading batch job ${file}:`, error);
        }
      }
    } catch (error) {
      console.error('Error loading existing batch jobs:', error);
    }
  }
  
  /**
   * Start the job processor
   * @returns {boolean} - Whether the processor was started
   */
  startProcessor() {
    if (this.processorInterval) {
      console.log('Job processor already running');
      return false;
    }
    
    console.log('Starting job processor');
    
    // Start processor interval
    this.processorInterval = setInterval(() => {
      this.processNextJob();
    }, 1000); // Check queue every second
    
    return true;
  }
  
  /**
   * Stop the job processor
   * @returns {boolean} - Whether the processor was stopped
   */
  stopProcessor() {
    if (!this.processorInterval) {
      console.log('Job processor not running');
      return false;
    }
    
    console.log('Stopping job processor');
    
    // Clear processor interval
    clearInterval(this.processorInterval);
    this.processorInterval = null;
    
    return true;
  }
  
  /**
   * Process the next job in the queue
   * @private
   */
  async processNextJob() {
    // Skip if max concurrent jobs reached
    if (this.activeJobs.size >= this.options.maxConcurrentJobs) {
      return;
    }
    
    // Get next job from priority queues
    const jobId = this.getNextJobFromQueues();
    
    if (!jobId) {
      return;
    }
    
    // Get job
    const job = this.allJobs.get(jobId);
    
    if (!job) {
      console.warn(`Job ${jobId} not found in all jobs map`);
      return;
    }
    
    // Process job
    this.processJob(job);
  }
  
  /**
   * Get the next job ID from priority queues
   * @private
   * @returns {string|null} - Next job ID or null if none
   */
  getNextJobFromQueues() {
    // Check high priority queue
    if (this.queues[PRIORITY.HIGH].length > 0) {
      return this.queues[PRIORITY.HIGH].shift();
    }
    
    // Check medium priority queue
    if (this.queues[PRIORITY.MEDIUM].length > 0) {
      return this.queues[PRIORITY.MEDIUM].shift();
    }
    
    // Check low priority queue
    if (this.queues[PRIORITY.LOW].length > 0) {
      return this.queues[PRIORITY.LOW].shift();
    }
    
    return null;
  }
  
  /**
   * Process a batch job
   * @private
   * @param {Object} job - Batch job
   */
  async processJob(job) {
    try {
      // Add to active jobs
      this.activeJobs.set(job.id, job);
      
      // Update job status
      job.status = BATCH_STATUS.PROCESSING;
      job.startedAt = job.startedAt || new Date().toISOString();
      job.updatedAt = new Date().toISOString();
      
      // Save job to disk
      await this.saveJobToDisk(job);
      
      // Emit event
      this.emit('jobStarted', { jobId: job.id, job });
      
      console.log(`Processing batch job ${job.id} (${job.files.length} files)`);
      
      // Process files
      for (let i = 0; i < job.files.length; i++) {
        const file = job.files[i];
        
        // Skip processed files
        if (file.status === FILE_STATUS.COMPLETED || file.status === FILE_STATUS.SKIPPED) {
          continue;
        }
        
        // Update file status
        file.status = FILE_STATUS.PROCESSING;
        job.updatedAt = new Date().toISOString();
        await this.saveJobToDisk(job);
        
        try {
          // Process file
          const result = await this.processFile(file, job);
          
          // Update file status
          file.status = FILE_STATUS.COMPLETED;
          file.result = result;
          file.processedAt = new Date().toISOString();
          job.processedFiles++;
          job.progress = Math.round((job.processedFiles / job.files.length) * 100);
          job.updatedAt = new Date().toISOString();
          
          // Update service stats
          this.stats.processedFiles++;
          
          // Save job to disk
          await this.saveJobToDisk(job);
          
          // Emit event
          this.emit('fileProcessed', { jobId: job.id, fileIndex: i, file, result });
        } catch (error) {
          console.error(`Error processing file ${file.name} (job ${job.id}):`, error);
          
          // Increment retry count
          file.retryCount = (file.retryCount || 0) + 1;
          
          // Check if max retries reached
          if (file.retryCount <= this.options.maxRetries) {
            // Reset file status for retry
            file.status = FILE_STATUS.PENDING;
            file.error = {
              message: error.message,
              timestamp: new Date().toISOString(),
              retryCount: file.retryCount
            };
          } else {
            // Mark file as failed
            file.status = FILE_STATUS.FAILED;
            file.error = {
              message: error.message,
              timestamp: new Date().toISOString(),
              retryCount: file.retryCount
            };
            job.failedFiles = (job.failedFiles || 0) + 1;
            
            // Update service stats
            this.stats.failedFiles++;
            
            // Emit event
            this.emit('fileError', { jobId: job.id, fileIndex: i, file, error });
          }
          
          job.updatedAt = new Date().toISOString();
          await this.saveJobToDisk(job);
        }
      }
      
      // Update job status
      if (job.failedFiles === job.files.length) {
        job.status = BATCH_STATUS.FAILED;
        this.stats.failedJobs++;
        this.emit('jobFailed', { jobId: job.id, job });
      } else {
        job.status = BATCH_STATUS.COMPLETED;
        this.stats.completedJobs++;
        this.emit('jobCompleted', { jobId: job.id, job });
      }
      
      job.completedAt = new Date().toISOString();
      job.updatedAt = job.completedAt;
      this.stats.lastJobTime = new Date();
      
      // Generate summary
      job.summary = this.generateJobSummary(job);
      
      // Save job to disk
      await this.saveJobToDisk(job);
      
      console.log(`Batch job ${job.id} completed with status: ${job.status}`);
      
      // Notify if enabled
      if (this.options.notifyOnCompletion) {
        this.notifyJobCompletion(job);
      }
    } catch (error) {
      console.error(`Error processing batch job ${job.id}:`, error);
      
      // Update job status
      job.status = BATCH_STATUS.FAILED;
      job.error = {
        message: error.message,
        timestamp: new Date().toISOString()
      };
      job.updatedAt = new Date().toISOString();
      
      // Save job to disk
      await this.saveJobToDisk(job);
      
      // Update service stats
      this.stats.failedJobs++;
      
      // Emit event
      this.emit('jobError', { jobId: job.id, job, error });
      
      // Notify if enabled
      if (this.options.notifyOnError) {
        this.notifyJobError(job, error);
      }
    } finally {
      // Remove from active jobs
      this.activeJobs.delete(job.id);
    }
  }
  
  /**
   * Process a file in a batch job
   * @private
   * @param {Object} file - File object
   * @param {Object} job - Batch job
   * @returns {Promise<Object>} - Processing result
   */
  async processFile(file, job) {
    // Get document type
    const documentType = this.determineDocumentType(file, job);
    
    // Process based on document type
    switch (documentType) {
      case DOCUMENT_TYPES.PDF:
        return this.processPdfFile(file, job);
      case DOCUMENT_TYPES.EXCEL:
        return this.processExcelFile(file, job);
      case DOCUMENT_TYPES.FINANCIAL:
        return this.processFinancialFile(file, job);
      case DOCUMENT_TYPES.PORTFOLIO:
        return this.processPortfolioFile(file, job);
      default:
        return this.processGenericFile(file, job);
    }
  }
  
  /**
   * Process a PDF file
   * @private
   * @param {Object} file - File object
   * @param {Object} job - Batch job
   * @returns {Promise<Object>} - Processing result
   */
  async processPdfFile(file, job) {
    console.log(`Processing PDF file: ${file.name}`);
    
    // Get processing options
    const options = job.processingOptions || {};
    
    // Use enhanced PDF processor if available
    if (typeof enhancedPdfProcessor?.processPdf === 'function') {
      return enhancedPdfProcessor.processPdf(file.path, options);
    }
    
    // Use document service as fallback
    return documentService.processDocument(file.documentId || file.id);
  }
  
  /**
   * Process an Excel file
   * @private
   * @param {Object} file - File object
   * @param {Object} job - Batch job
   * @returns {Promise<Object>} - Processing result
   */
  async processExcelFile(file, job) {
    console.log(`Processing Excel file: ${file.name}`);
    
    // Mock implementation - replace with actual Excel processing
    return {
      type: 'excel',
      filename: file.name,
      sheets: ['Sheet1', 'Sheet2'],
      rowCount: 100,
      columnCount: 20,
      extractedData: {
        tables: [
          {
            name: 'Sheet1',
            headers: ['Column1', 'Column2', 'Column3'],
            rows: [
              ['Data1', 'Data2', 'Data3'],
              ['Data4', 'Data5', 'Data6']
            ]
          }
        ]
      }
    };
  }
  
  /**
   * Process a financial file
   * @private
   * @param {Object} file - File object
   * @param {Object} job - Batch job
   * @returns {Promise<Object>} - Processing result
   */
  async processFinancialFile(file, job) {
    console.log(`Processing financial file: ${file.name}`);
    
    // Get processing options
    const options = job.processingOptions || {};
    
    // Process with enhanced PDF processor first
    const pdfResult = await this.processPdfFile(file, job);
    
    // Extract securities if enabled
    let securities = [];
    if (options.extractSecurities !== false) {
      try {
        // Use enhanced securities extractor if available
        const enhancedSecuritiesExtractor = require('./enhanced-securities-extractor');
        securities = await enhancedSecuritiesExtractor.extractSecuritiesWithMarketData(
          pdfResult.text || pdfResult.content?.text || '',
          options.includeMarketData !== false
        );
      } catch (error) {
        console.warn(`Error extracting securities from ${file.name}:`, error);
      }
    }
    
    return {
      ...pdfResult,
      documentType: 'financial',
      securities,
      financialData: {
        // Add financial-specific data
        hasFinancialData: true,
        extractedSecurities: securities.length,
        processingOptions: options
      }
    };
  }
  
  /**
   * Process a portfolio file
   * @private
   * @param {Object} file - File object
   * @param {Object} job - Batch job
   * @returns {Promise<Object>} - Processing result
   */
  async processPortfolioFile(file, job) {
    console.log(`Processing portfolio file: ${file.name}`);
    
    // Get processing options
    const options = job.processingOptions || {};
    
    // Process with financial processor first
    const financialResult = await this.processFinancialFile(file, job);
    
    // Add portfolio-specific processing
    return {
      ...financialResult,
      documentType: 'portfolio',
      portfolioData: {
        // Add portfolio-specific data
        totalHoldings: financialResult.securities?.length || 0,
        assetClasses: ['Stocks', 'Bonds', 'Cash', 'Other'],
        portfolioValue: 1000000, // Mock value
        currency: 'USD'
      }
    };
  }
  
  /**
   * Process a generic file
   * @private
   * @param {Object} file - File object
   * @param {Object} job - Batch job
   * @returns {Promise<Object>} - Processing result
   */
  async processGenericFile(file, job) {
    console.log(`Processing generic file: ${file.name}`);
    
    // Use document service
    if (file.documentId) {
      return documentService.processDocument(file.documentId);
    }
    
    // Mock result for generic file
    return {
      type: 'generic',
      filename: file.name,
      path: file.path,
      size: fs.statSync(file.path).size,
      processed: true,
      timestamp: new Date().toISOString()
    };
  }
  
  /**
   * Determine document type from file and job
   * @private
   * @param {Object} file - File object
   * @param {Object} job - Batch job
   * @returns {string} - Document type
   */
  determineDocumentType(file, job) {
    // Use explicit document type if provided
    if (file.documentType) {
      return file.documentType;
    }
    
    if (job.documentType) {
      return job.documentType;
    }
    
    // Determine from file name and extension
    const fileName = file.name.toLowerCase();
    const extension = path.extname(fileName).toLowerCase();
    
    if (extension === '.pdf') {
      if (
        fileName.includes('portfolio') || 
        fileName.includes('investment') || 
        fileName.includes('holdings')
      ) {
        return DOCUMENT_TYPES.PORTFOLIO;
      }
      
      if (
        fileName.includes('financial') || 
        fileName.includes('statement') || 
        fileName.includes('report') ||
        fileName.includes('balance')
      ) {
        return DOCUMENT_TYPES.FINANCIAL;
      }
      
      return DOCUMENT_TYPES.PDF;
    }
    
    if (extension === '.xlsx' || extension === '.xls') {
      return DOCUMENT_TYPES.EXCEL;
    }
    
    return 'generic';
  }
  
  /**
   * Save job to disk
   * @private
   * @param {Object} job - Batch job
   */
  async saveJobToDisk(job) {
    if (!this.options.storeResults) {
      return;
    }
    
    const filePath = path.join(this.options.resultsDir, `batch-${job.id}.json`);
    
    // Create a sanitized copy for storage
    const jobCopy = { ...job };
    
    // Sanitize large result data if needed
    if (jobCopy.files) {
      jobCopy.files = jobCopy.files.map(file => {
        const fileCopy = { ...file };
        
        // Limit result size if too large
        if (fileCopy.result && JSON.stringify(fileCopy.result).length > 10000) {
          fileCopy.result = {
            truncated: true,
            summary: fileCopy.result.summary || 'Result data too large, truncated for storage',
            documentType: fileCopy.result.documentType,
            extractedData: fileCopy.result.extractedData ? {
              tableCount: fileCopy.result.extractedData.tables?.length || 0,
              entityCount: Object.keys(fileCopy.result.extractedData.entities || {}).length || 0
            } : undefined
          };
        }
        
        return fileCopy;
      });
    }
    
    await writeFileAsync(filePath, JSON.stringify(jobCopy, null, 2));
  }
  
  /**
   * Notify job completion
   * @private
   * @param {Object} job - Batch job
   */
  notifyJobCompletion(job) {
    // Placeholder for notification system
    console.log(`NOTIFICATION: Batch job ${job.id} completed with status: ${job.status}`);
    
    // Emit notification event
    this.emit('notification', {
      type: 'jobCompleted',
      jobId: job.id,
      status: job.status,
      tenantId: job.tenantId,
      userId: job.userId,
      timestamp: new Date().toISOString()
    });
  }
  
  /**
   * Notify job error
   * @private
   * @param {Object} job - Batch job
   * @param {Error} error - Error object
   */
  notifyJobError(job, error) {
    // Placeholder for error notification system
    console.log(`NOTIFICATION: Batch job ${job.id} failed: ${error.message}`);
    
    // Emit notification event
    this.emit('notification', {
      type: 'jobError',
      jobId: job.id,
      error: error.message,
      tenantId: job.tenantId,
      userId: job.userId,
      timestamp: new Date().toISOString()
    });
  }
  
  /**
   * Generate job summary
   * @private
   * @param {Object} job - Batch job
   * @returns {Object} - Job summary
   */
  generateJobSummary(job) {
    // Calculate duration
    const startTime = job.startedAt ? new Date(job.startedAt) : null;
    const endTime = job.completedAt ? new Date(job.completedAt) : new Date();
    const duration = startTime ? (endTime - startTime) : 0;
    
    // Calculate success rate
    const successRate = job.files.length > 0 
      ? ((job.processedFiles - (job.failedFiles || 0)) / job.files.length) * 100 
      : 0;
    
    // Document type breakdown
    const documentTypes = {};
    job.files.forEach(file => {
      const type = file.documentType || this.determineDocumentType(file, job);
      documentTypes[type] = (documentTypes[type] || 0) + 1;
    });
    
    // Create summary
    return {
      status: job.status,
      totalFiles: job.files.length,
      processedFiles: job.processedFiles,
      failedFiles: job.failedFiles || 0,
      successRate: Math.round(successRate * 100) / 100,
      duration: duration,
      durationFormatted: this.formatDuration(duration),
      startedAt: job.startedAt,
      completedAt: job.completedAt,
      documentTypes,
      processingOptions: job.processingOptions || {}
    };
  }
  
  /**
   * Format duration in milliseconds to human-readable string
   * @private
   * @param {number} duration - Duration in milliseconds
   * @returns {string} - Formatted duration
   */
  formatDuration(duration) {
    if (duration < 1000) {
      return `${duration}ms`;
    }
    
    const seconds = Math.floor(duration / 1000) % 60;
    const minutes = Math.floor(duration / (1000 * 60)) % 60;
    const hours = Math.floor(duration / (1000 * 60 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    }
    
    if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    }
    
    return `${seconds}s`;
  }
  
  /**
   * Create a new batch job
   * @param {Array} files - Array of files to process
   * @param {Object} options - Job options
   * @returns {Promise<Object>} - Created batch job
   */
  async createBatchJob(files, options = {}) {
    try {
      // Generate job ID
      const jobId = options.jobId || uuidv4();
      
      // Get job priority
      const priority = options.priority || PRIORITY.MEDIUM;
      
      // Create files array
      const jobFiles = files.map(file => {
        // Handle different file input formats
        if (typeof file === 'string') {
          // String path
          return {
            id: uuidv4(),
            path: file,
            name: path.basename(file),
            documentType: this.determineDocumentTypeFromFileName(file),
            status: FILE_STATUS.PENDING
          };
        } else if (file.path) {
          // File object with path
          return {
            id: file.id || uuidv4(),
            path: file.path,
            name: file.originalname || file.name || path.basename(file.path),
            documentId: file.documentId,
            documentType: file.documentType || this.determineDocumentTypeFromFileName(file.originalname || file.name || ''),
            size: file.size,
            status: FILE_STATUS.PENDING
          };
        } else {
          throw new Error(`Invalid file format: ${JSON.stringify(file)}`);
        }
      });
      
      // Create job object
      const job = {
        id: jobId,
        tenantId: options.tenantId,
        userId: options.userId,
        name: options.name || `Batch ${jobId}`,
        description: options.description,
        status: BATCH_STATUS.CREATED,
        priority,
        progress: 0,
        files: jobFiles,
        totalFiles: jobFiles.length,
        processedFiles: 0,
        failedFiles: 0,
        processingOptions: options.processingOptions || {},
        documentType: options.documentType,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        startedAt: null,
        completedAt: null
      };
      
      // Add to maps
      this.allJobs.set(jobId, job);
      
      // Add to queue if auto-queue is enabled
      if (options.autoQueue !== false) {
        this.queues[priority].push(jobId);
        job.status = BATCH_STATUS.QUEUED;
      }
      
      // Save to disk
      await this.saveJobToDisk(job);
      
      // Update stats
      this.stats.totalJobs++;
      this.stats.totalFiles += jobFiles.length;
      
      // Emit event
      this.emit('jobCreated', { jobId, job });
      
      console.log(`Created batch job ${jobId} with ${jobFiles.length} files (priority: ${priority})`);
      
      return job;
    } catch (error) {
      console.error('Error creating batch job:', error);
      throw error;
    }
  }
  
  /**
   * Determine document type from file name
   * @private
   * @param {string} fileName - File name
   * @returns {string} - Document type
   */
  determineDocumentTypeFromFileName(fileName) {
    if (!fileName) return 'generic';
    
    const name = fileName.toLowerCase();
    const extension = path.extname(name).toLowerCase();
    
    if (extension === '.pdf') {
      if (
        name.includes('portfolio') || 
        name.includes('investment') || 
        name.includes('holdings')
      ) {
        return DOCUMENT_TYPES.PORTFOLIO;
      }
      
      if (
        name.includes('financial') || 
        name.includes('statement') || 
        name.includes('report') ||
        name.includes('balance')
      ) {
        return DOCUMENT_TYPES.FINANCIAL;
      }
      
      return DOCUMENT_TYPES.PDF;
    }
    
    if (extension === '.xlsx' || extension === '.xls') {
      return DOCUMENT_TYPES.EXCEL;
    }
    
    return 'generic';
  }
  
  /**
   * Get batch job by ID
   * @param {string} jobId - Job ID
   * @returns {Promise<Object>} - Batch job
   */
  async getBatchJob(jobId) {
    try {
      // Check in-memory map first
      let job = this.allJobs.get(jobId);
      
      if (!job) {
        // Try to load from disk
        const filePath = path.join(this.options.resultsDir, `batch-${jobId}.json`);
        
        if (fs.existsSync(filePath)) {
          const jobData = await readFileAsync(filePath, 'utf8');
          job = JSON.parse(jobData);
          
          // Add to map
          this.allJobs.set(jobId, job);
        }
      }
      
      if (!job) {
        throw new Error(`Batch job ${jobId} not found`);
      }
      
      return job;
    } catch (error) {
      console.error(`Error getting batch job ${jobId}:`, error);
      throw error;
    }
  }
  
  /**
   * Queue a batch job
   * @param {string} jobId - Job ID
   * @param {Object} options - Queue options
   * @returns {Promise<Object>} - Batch job
   */
  async queueBatchJob(jobId, options = {}) {
    try {
      // Get job
      const job = await this.getBatchJob(jobId);
      
      // Check if job can be queued
      if (
        job.status === BATCH_STATUS.PROCESSING || 
        job.status === BATCH_STATUS.COMPLETED ||
        job.status === BATCH_STATUS.CANCELLED
      ) {
        throw new Error(`Cannot queue job with status: ${job.status}`);
      }
      
      // Update priority if provided
      if (options.priority) {
        job.priority = options.priority;
      }
      
      // Add to queue
      this.queues[job.priority || PRIORITY.MEDIUM].push(jobId);
      
      // Update status
      job.status = BATCH_STATUS.QUEUED;
      job.updatedAt = new Date().toISOString();
      
      // Save to disk
      await this.saveJobToDisk(job);
      
      // Emit event
      this.emit('jobQueued', { jobId, job });
      
      console.log(`Queued batch job ${jobId} (priority: ${job.priority})`);
      
      return job;
    } catch (error) {
      console.error(`Error queuing batch job ${jobId}:`, error);
      throw error;
    }
  }
  
  /**
   * Pause a batch job
   * @param {string} jobId - Job ID
   * @returns {Promise<Object>} - Batch job
   */
  async pauseBatchJob(jobId) {
    try {
      // Get job
      const job = await this.getBatchJob(jobId);
      
      // Check if job can be paused
      if (job.status !== BATCH_STATUS.PROCESSING && job.status !== BATCH_STATUS.QUEUED) {
        throw new Error(`Cannot pause job with status: ${job.status}`);
      }
      
      // Remove from queue if queued
      if (job.status === BATCH_STATUS.QUEUED) {
        const queue = this.queues[job.priority || PRIORITY.MEDIUM];
        const index = queue.indexOf(jobId);
        
        if (index !== -1) {
          queue.splice(index, 1);
        }
      }
      
      // Update status
      job.status = BATCH_STATUS.PAUSED;
      job.updatedAt = new Date().toISOString();
      
      // Save to disk
      await this.saveJobToDisk(job);
      
      // Emit event
      this.emit('jobPaused', { jobId, job });
      
      console.log(`Paused batch job ${jobId}`);
      
      return job;
    } catch (error) {
      console.error(`Error pausing batch job ${jobId}:`, error);
      throw error;
    }
  }
  
  /**
   * Cancel a batch job
   * @param {string} jobId - Job ID
   * @returns {Promise<Object>} - Batch job
   */
  async cancelBatchJob(jobId) {
    try {
      // Get job
      const job = await this.getBatchJob(jobId);
      
      // Check if job can be cancelled
      if (
        job.status === BATCH_STATUS.COMPLETED || 
        job.status === BATCH_STATUS.CANCELLED
      ) {
        throw new Error(`Cannot cancel job with status: ${job.status}`);
      }
      
      // Remove from queue if queued
      if (job.status === BATCH_STATUS.QUEUED) {
        const queue = this.queues[job.priority || PRIORITY.MEDIUM];
        const index = queue.indexOf(jobId);
        
        if (index !== -1) {
          queue.splice(index, 1);
        }
      }
      
      // Update status
      job.status = BATCH_STATUS.CANCELLED;
      job.updatedAt = new Date().toISOString();
      job.completedAt = job.updatedAt;
      
      // Update files
      for (const file of job.files) {
        if (file.status === FILE_STATUS.PENDING || file.status === FILE_STATUS.PROCESSING) {
          file.status = FILE_STATUS.SKIPPED;
        }
      }
      
      // Add cancel reason
      job.cancelReason = 'Cancelled by user';
      
      // Save to disk
      await this.saveJobToDisk(job);
      
      // Emit event
      this.emit('jobCancelled', { jobId, job });
      
      console.log(`Cancelled batch job ${jobId}`);
      
      return job;
    } catch (error) {
      console.error(`Error cancelling batch job ${jobId}:`, error);
      throw error;
    }
  }
  
  /**
   * Resume a paused batch job
   * @param {string} jobId - Job ID
   * @param {Object} options - Resume options
   * @returns {Promise<Object>} - Batch job
   */
  async resumeBatchJob(jobId, options = {}) {
    try {
      // Get job
      const job = await this.getBatchJob(jobId);
      
      // Check if job can be resumed
      if (job.status !== BATCH_STATUS.PAUSED) {
        throw new Error(`Cannot resume job with status: ${job.status}`);
      }
      
      // Update priority if provided
      if (options.priority) {
        job.priority = options.priority;
      }
      
      // Add to queue
      this.queues[job.priority || PRIORITY.MEDIUM].push(jobId);
      
      // Update status
      job.status = BATCH_STATUS.QUEUED;
      job.updatedAt = new Date().toISOString();
      
      // Save to disk
      await this.saveJobToDisk(job);
      
      // Emit event
      this.emit('jobResumed', { jobId, job });
      
      console.log(`Resumed batch job ${jobId} (priority: ${job.priority})`);
      
      return job;
    } catch (error) {
      console.error(`Error resuming batch job ${jobId}:`, error);
      throw error;
    }
  }
  
  /**
   * Delete a batch job
   * @param {string} jobId - Job ID
   * @returns {Promise<boolean>} - Success
   */
  async deleteBatchJob(jobId) {
    try {
      // Get job
      const job = await this.getBatchJob(jobId);
      
      // Check if job can be deleted
      if (job.status === BATCH_STATUS.PROCESSING) {
        throw new Error(`Cannot delete job with status: ${job.status}`);
      }
      
      // Remove from queue if queued
      if (job.status === BATCH_STATUS.QUEUED) {
        const queue = this.queues[job.priority || PRIORITY.MEDIUM];
        const index = queue.indexOf(jobId);
        
        if (index !== -1) {
          queue.splice(index, 1);
        }
      }
      
      // Remove from maps
      this.allJobs.delete(jobId);
      
      // Delete file
      const filePath = path.join(this.options.resultsDir, `batch-${jobId}.json`);
      
      if (fs.existsSync(filePath)) {
        await unlinkAsync(filePath);
      }
      
      // Emit event
      this.emit('jobDeleted', { jobId });
      
      console.log(`Deleted batch job ${jobId}`);
      
      return true;
    } catch (error) {
      console.error(`Error deleting batch job ${jobId}:`, error);
      throw error;
    }
  }
  
  /**
   * Get all batch jobs
   * @param {Object} options - Filter options
   * @returns {Promise<Array>} - Batch jobs
   */
  async getAllBatchJobs(options = {}) {
    try {
      // Get all jobs from map
      let jobs = Array.from(this.allJobs.values());
      
      // Apply filters
      if (options.status) {
        jobs = jobs.filter(job => job.status === options.status);
      }
      
      if (options.tenantId) {
        jobs = jobs.filter(job => job.tenantId === options.tenantId);
      }
      
      if (options.userId) {
        jobs = jobs.filter(job => job.userId === options.userId);
      }
      
      if (options.documentType) {
        jobs = jobs.filter(job => job.documentType === options.documentType);
      }
      
      // Apply sorting
      if (options.sortBy) {
        const sortField = options.sortBy;
        const sortOrder = options.sortOrder === 'asc' ? 1 : -1;
        
        jobs.sort((a, b) => {
          if (a[sortField] < b[sortField]) return -1 * sortOrder;
          if (a[sortField] > b[sortField]) return 1 * sortOrder;
          return 0;
        });
      } else {
        // Default sort by creation date (newest first)
        jobs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      }
      
      // Apply pagination
      if (options.limit) {
        const start = options.offset || 0;
        const end = start + options.limit;
        jobs = jobs.slice(start, end);
      }
      
      return jobs;
    } catch (error) {
      console.error('Error getting all batch jobs:', error);
      throw error;
    }
  }
  
  /**
   * Get batch jobs for a tenant
   * @param {string} tenantId - Tenant ID
   * @param {Object} options - Filter options
   * @returns {Promise<Array>} - Batch jobs
   */
  async getBatchJobsForTenant(tenantId, options = {}) {
    return this.getAllBatchJobs({ ...options, tenantId });
  }
  
  /**
   * Get batch jobs for a user
   * @param {string} userId - User ID
   * @param {Object} options - Filter options
   * @returns {Promise<Array>} - Batch jobs
   */
  async getBatchJobsForUser(userId, options = {}) {
    return this.getAllBatchJobs({ ...options, userId });
  }
  
  /**
   * Get service statistics
   * @returns {Object} - Service statistics
   */
  getServiceStats() {
    // Calculate additional stats
    const successRate = this.stats.totalFiles > 0
      ? ((this.stats.processedFiles - this.stats.failedFiles) / this.stats.totalFiles) * 100
      : 0;
    
    const jobSuccessRate = this.stats.totalJobs > 0
      ? ((this.stats.completedJobs - this.stats.failedJobs) / this.stats.totalJobs) * 100
      : 0;
    
    // Get queue sizes
    const queueSizes = {
      [PRIORITY.HIGH]: this.queues[PRIORITY.HIGH].length,
      [PRIORITY.MEDIUM]: this.queues[PRIORITY.MEDIUM].length,
      [PRIORITY.LOW]: this.queues[PRIORITY.LOW].length,
      total: this.queues[PRIORITY.HIGH].length + this.queues[PRIORITY.MEDIUM].length + this.queues[PRIORITY.LOW].length
    };
    
    // Calculate uptime
    const uptime = Date.now() - this.stats.startTime.getTime();
    
    return {
      ...this.stats,
      successRate: Math.round(successRate * 100) / 100,
      jobSuccessRate: Math.round(jobSuccessRate * 100) / 100,
      activeJobs: this.activeJobs.size,
      queues: queueSizes,
      uptime,
      uptimeFormatted: this.formatDuration(uptime),
      currentTime: new Date().toISOString()
    };
  }
  
  /**
   * Clean up old batch jobs
   * @param {number} maxAge - Maximum age in milliseconds
   * @returns {Promise<number>} - Number of jobs cleaned up
   */
  async cleanupBatchJobs(maxAge = this.options.cleanupAge) {
    try {
      console.log(`Cleaning up batch jobs older than ${this.formatDuration(maxAge)}`);
      
      let cleanedCount = 0;
      const now = Date.now();
      const cutoffDate = now - maxAge;
      
      // Get all jobs
      const allJobs = await this.getAllBatchJobs();
      
      // Filter jobs to clean
      const jobsToClean = allJobs.filter(job => {
        // Skip active jobs
        if (job.status === BATCH_STATUS.PROCESSING) {
          return false;
        }
        
        // Get job date
        const jobDate = new Date(job.updatedAt || job.createdAt).getTime();
        
        // Check if job is old enough
        return jobDate < cutoffDate;
      });
      
      // Delete jobs
      for (const job of jobsToClean) {
        try {
          await this.deleteBatchJob(job.id);
          cleanedCount++;
        } catch (error) {
          console.error(`Error cleaning up batch job ${job.id}:`, error);
        }
      }
      
      console.log(`Cleaned up ${cleanedCount} batch jobs`);
      
      return cleanedCount;
    } catch (error) {
      console.error('Error cleaning up batch jobs:', error);
      throw error;
    }
  }
}

module.exports = ComprehensiveBatchService;