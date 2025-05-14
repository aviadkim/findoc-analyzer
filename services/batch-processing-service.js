/**
 * Batch Processing Service
 *
 * This service provides functionality for batch processing of documents.
 */

const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const EnhancedPdfProcessor = require('./enhanced-pdf-service');

/**
 * Batch Processing Service
 */
class BatchProcessingService {
  /**
   * Initialize the service
   * @param {object} options - Options
   */
  constructor(options = {}) {
    this.options = {
      tempDir: options.tempDir || path.join(process.cwd(), 'temp'),
      resultsDir: options.resultsDir || path.join(process.cwd(), 'results'),
      uploadsDir: options.uploadsDir || path.join(process.cwd(), 'uploads'),
      useMockData: options.useMockData || process.env.USE_MOCK_DATA === 'true' || false,
      ...options
    };

    // Create directories if they don't exist
    try {
      fs.mkdirSync(this.options.tempDir, { recursive: true });
      fs.mkdirSync(this.options.resultsDir, { recursive: true });
      fs.mkdirSync(this.options.uploadsDir, { recursive: true });
    } catch (error) {
      console.warn('Error creating directories:', error);
    }

    // Create enhanced PDF processor
    this.pdfProcessor = new EnhancedPdfProcessor({
      tempDir: this.options.tempDir,
      resultsDir: this.options.resultsDir,
      useMockData: this.options.useMockData
    });

    // Batch jobs
    this.batchJobs = new Map();
  }

  /**
   * Create a batch job
   * @param {Array} files - Array of file paths or file objects
   * @param {object} options - Processing options
   * @returns {Promise<object>} - Batch job
   */
  async createBatchJob(files, options = {}) {
    try {
      console.log('Creating batch job...');

      // Generate batch ID
      const batchId = uuidv4();

      // Create batch job
      const batchJob = {
        id: batchId,
        status: 'created',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        files: [],
        options,
        results: [],
        progress: 0,
        totalFiles: files.length,
        processedFiles: 0,
        errors: []
      };

      // Add files to batch job
      for (const file of files) {
        let filePath;
        let fileName;

        if (typeof file === 'string') {
          filePath = file;
          fileName = path.basename(file);
        } else if (file.path) {
          filePath = file.path;
          fileName = file.originalname || path.basename(file.path);
        } else {
          throw new Error('Invalid file object');
        }

        batchJob.files.push({
          path: filePath,
          name: fileName,
          status: 'pending',
          result: null,
          error: null
        });
      }

      // Save batch job
      this.batchJobs.set(batchId, batchJob);

      // Save batch job to file
      const batchPath = path.join(this.options.resultsDir, `batch-${batchId}.json`);
      fs.writeFileSync(batchPath, JSON.stringify(batchJob, null, 2));

      // Start processing in the background
      this.processBatchJob(batchId);

      return batchJob;
    } catch (error) {
      console.error('Error creating batch job:', error);
      throw error;
    }
  }

  /**
   * Process a batch job
   * @param {string} batchId - Batch ID
   * @returns {Promise<void>}
   */
  async processBatchJob(batchId) {
    try {
      console.log(`Processing batch job: ${batchId}`);

      // Get batch job
      const batchJob = this.batchJobs.get(batchId);

      if (!batchJob) {
        throw new Error(`Batch job not found: ${batchId}`);
      }

      // Update batch job status
      batchJob.status = 'processing';
      batchJob.updatedAt = new Date().toISOString();

      // Save batch job to file
      const batchPath = path.join(this.options.resultsDir, `batch-${batchId}.json`);
      fs.writeFileSync(batchPath, JSON.stringify(batchJob, null, 2));

      // Process files
      for (let i = 0; i < batchJob.files.length; i++) {
        const file = batchJob.files[i];

        try {
          console.log(`Processing file ${i + 1}/${batchJob.files.length}: ${file.name}`);

          // Update file status
          file.status = 'processing';
          batchJob.updatedAt = new Date().toISOString();
          fs.writeFileSync(batchPath, JSON.stringify(batchJob, null, 2));

          // Process file
          const result = await this.pdfProcessor.processPdf(file.path, batchJob.options);

          // Update file status
          file.status = 'completed';
          file.result = result;
          batchJob.processedFiles++;
          batchJob.progress = Math.round((batchJob.processedFiles / batchJob.totalFiles) * 100);
          batchJob.results.push(result);
          batchJob.updatedAt = new Date().toISOString();
          fs.writeFileSync(batchPath, JSON.stringify(batchJob, null, 2));
        } catch (error) {
          console.error(`Error processing file: ${file.name}`, error);

          // Update file status
          file.status = 'error';
          file.error = error.message;
          batchJob.processedFiles++;
          batchJob.progress = Math.round((batchJob.processedFiles / batchJob.totalFiles) * 100);
          batchJob.errors.push({
            file: file.name,
            error: error.message
          });
          batchJob.updatedAt = new Date().toISOString();
          fs.writeFileSync(batchPath, JSON.stringify(batchJob, null, 2));
        }
      }

      // Update batch job status
      batchJob.status = 'completed';
      batchJob.updatedAt = new Date().toISOString();
      fs.writeFileSync(batchPath, JSON.stringify(batchJob, null, 2));

      console.log(`Batch job completed: ${batchId}`);
    } catch (error) {
      console.error(`Error processing batch job: ${batchId}`, error);

      // Get batch job
      const batchJob = this.batchJobs.get(batchId);

      if (batchJob) {
        // Update batch job status
        batchJob.status = 'error';
        batchJob.error = error.message;
        batchJob.updatedAt = new Date().toISOString();

        // Save batch job to file
        const batchPath = path.join(this.options.resultsDir, `batch-${batchId}.json`);
        fs.writeFileSync(batchPath, JSON.stringify(batchJob, null, 2));
      }
    }
  }

  /**
   * Get a batch job
   * @param {string} batchId - Batch ID
   * @returns {Promise<object>} - Batch job
   */
  async getBatchJob(batchId) {
    try {
      console.log(`Getting batch job: ${batchId}`);

      // Get batch job from file
      const batchPath = path.join(this.options.resultsDir, `batch-${batchId}.json`);

      if (!fs.existsSync(batchPath)) {
        throw new Error(`Batch job not found: ${batchId}`);
      }

      const batchJob = JSON.parse(fs.readFileSync(batchPath, 'utf-8'));

      return batchJob;
    } catch (error) {
      console.error(`Error getting batch job: ${batchId}`, error);
      throw error;
    }
  }

  /**
   * Get all batch jobs
   * @returns {Promise<Array>} - Batch jobs
   */
  async getAllBatchJobs() {
    try {
      console.log('Getting all batch jobs...');

      // Get all batch job files
      const batchFiles = fs.readdirSync(this.options.resultsDir)
        .filter(file => file.startsWith('batch-') && file.endsWith('.json'));

      // Load batch jobs
      const batchJobs = [];

      for (const batchFile of batchFiles) {
        try {
          const batchPath = path.join(this.options.resultsDir, batchFile);
          const batchJob = JSON.parse(fs.readFileSync(batchPath, 'utf-8'));
          batchJobs.push(batchJob);
        } catch (error) {
          console.error(`Error loading batch job: ${batchFile}`, error);
        }
      }

      return batchJobs;
    } catch (error) {
      console.error('Error getting all batch jobs:', error);
      throw error;
    }
  }

  /**
   * Cancel a batch job
   * @param {string} batchId - Batch ID
   * @returns {Promise<object>} - Batch job
   */
  async cancelBatchJob(batchId) {
    try {
      console.log(`Cancelling batch job: ${batchId}`);

      // Get batch job
      const batchJob = await this.getBatchJob(batchId);

      // Update batch job status
      batchJob.status = 'cancelled';
      batchJob.updatedAt = new Date().toISOString();

      // Save batch job to file
      const batchPath = path.join(this.options.resultsDir, `batch-${batchId}.json`);
      fs.writeFileSync(batchPath, JSON.stringify(batchJob, null, 2));

      return batchJob;
    } catch (error) {
      console.error(`Error cancelling batch job: ${batchId}`, error);
      throw error;
    }
  }

  /**
   * Delete a batch job
   * @param {string} batchId - Batch ID
   * @returns {Promise<boolean>} - Success
   */
  async deleteBatchJob(batchId) {
    try {
      console.log(`Deleting batch job: ${batchId}`);

      // Get batch job path
      const batchPath = path.join(this.options.resultsDir, `batch-${batchId}.json`);

      if (!fs.existsSync(batchPath)) {
        throw new Error(`Batch job not found: ${batchId}`);
      }

      // Delete batch job file
      fs.unlinkSync(batchPath);

      // Remove from memory
      this.batchJobs.delete(batchId);

      return true;
    } catch (error) {
      console.error(`Error deleting batch job: ${batchId}`, error);
      throw error;
    }
  }
}

module.exports = BatchProcessingService;
