/**
 * Financial Document Processor API Routes
 * 
 * This file contains the API routes for the Financial Document Processor.
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const { v4: uuidv4 } = require('uuid');

// Configuration
const config = {
  uploadFolder: process.env.UPLOAD_FOLDER || './uploads',
  tempFolder: process.env.TEMP_FOLDER || './temp',
  resultsFolder: process.env.RESULTS_FOLDER || './results',
  pythonPath: process.env.PYTHON_PATH || 'python',
  processorScript: path.join(__dirname, '../../../DevDocs/backend/enhanced_processing/financial_document_processor.py'),
  enableFinancialDocumentProcessor: process.env.ENABLE_FINANCIAL_DOCUMENT_PROCESSOR === 'true',
  cacheEnabled: process.env.FINANCIAL_DOCUMENT_PROCESSOR_CACHE_ENABLED === 'true',
  cacheDir: process.env.FINANCIAL_DOCUMENT_PROCESSOR_CACHE_DIR || '/tmp/financial_document_processor_cache',
  batchSize: parseInt(process.env.FINANCIAL_DOCUMENT_PROCESSOR_BATCH_SIZE || '10'),
  nltkData: process.env.NLTK_DATA || '/tmp/nltk_data',
  spacyModelDir: process.env.SPACY_MODEL_DIR || '/tmp/spacy_models'
};

// Create directories if they don't exist
[config.uploadFolder, config.tempFolder, config.resultsFolder, config.cacheDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, config.uploadFolder);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only PDF files
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  }
});

// Batch processing state
const batchProcessingState = new Map();

/**
 * Process a document using the Financial Document Processor
 */
router.post('/process-document', upload.single('file'), async (req, res) => {
  if (!config.enableFinancialDocumentProcessor) {
    return res.status(501).json({ error: 'Financial Document Processor is not enabled' });
  }

  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const filePath = req.file.path;
    const fileName = req.file.filename;
    const options = req.body.options ? JSON.parse(req.body.options) : {};

    // Set up environment variables for the Python process
    const env = {
      ...process.env,
      NLTK_DATA: config.nltkData,
      PYTHONPATH: process.env.PYTHONPATH || ''
    };

    // Prepare arguments for the Python script
    const args = [
      config.processorScript,
      '--input', filePath,
      '--output', path.join(config.resultsFolder, fileName + '.json'),
      '--cache-dir', config.cacheDir
    ];

    if (options.languages) {
      args.push('--languages', options.languages.join(','));
    }

    if (options.extractTables === false) {
      args.push('--no-extract-tables');
    }

    if (options.extractSecurities === false) {
      args.push('--no-extract-securities');
    }

    if (options.extractMetrics === false) {
      args.push('--no-extract-metrics');
    }

    if (options.includeText === false) {
      args.push('--no-include-text');
    }

    if (options.includeSecurities === false) {
      args.push('--no-include-securities');
    }

    if (options.includeTables === false) {
      args.push('--no-include-tables');
    }

    if (config.cacheEnabled) {
      args.push('--cache-enabled');
    }

    // Spawn the Python process
    const pythonProcess = spawn(config.pythonPath, args, { env });

    let stdoutData = '';
    let stderrData = '';

    pythonProcess.stdout.on('data', (data) => {
      stdoutData += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      stderrData += data.toString();
    });

    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        console.error(`Financial Document Processor exited with code ${code}`);
        console.error(`stderr: ${stderrData}`);
        return res.status(500).json({ error: 'Error processing document', details: stderrData });
      }

      try {
        // Read the results file
        const resultsPath = path.join(config.resultsFolder, fileName + '.json');
        if (!fs.existsSync(resultsPath)) {
          return res.status(500).json({ error: 'Results file not found' });
        }

        const results = JSON.parse(fs.readFileSync(resultsPath, 'utf8'));
        
        // Return the results
        res.json({
          success: true,
          filename: fileName,
          results
        });
      } catch (error) {
        console.error('Error reading results file:', error);
        res.status(500).json({ error: 'Error reading results file', details: error.message });
      }
    });
  } catch (error) {
    console.error('Error processing document:', error);
    res.status(500).json({ error: 'Error processing document', details: error.message });
  }
});

/**
 * Get document text
 */
router.get('/get-document-text/:filename', async (req, res) => {
  if (!config.enableFinancialDocumentProcessor) {
    return res.status(501).json({ error: 'Financial Document Processor is not enabled' });
  }

  try {
    const fileName = req.params.filename;
    const resultsPath = path.join(config.resultsFolder, fileName + '.json');

    if (!fs.existsSync(resultsPath)) {
      return res.status(404).json({ error: 'Results file not found' });
    }

    const results = JSON.parse(fs.readFileSync(resultsPath, 'utf8'));
    
    if (!results.text_result || !results.text_result.text) {
      return res.status(404).json({ error: 'Text not found in results' });
    }

    res.json({
      success: true,
      filename: fileName,
      text: results.text_result.text
    });
  } catch (error) {
    console.error('Error getting document text:', error);
    res.status(500).json({ error: 'Error getting document text', details: error.message });
  }
});

/**
 * Get document securities
 */
router.get('/get-document-securities/:filename', async (req, res) => {
  if (!config.enableFinancialDocumentProcessor) {
    return res.status(501).json({ error: 'Financial Document Processor is not enabled' });
  }

  try {
    const fileName = req.params.filename;
    const resultsPath = path.join(config.resultsFolder, fileName + '.json');

    if (!fs.existsSync(resultsPath)) {
      return res.status(404).json({ error: 'Results file not found' });
    }

    const results = JSON.parse(fs.readFileSync(resultsPath, 'utf8'));
    
    if (!results.securities_result || !results.securities_result.securities) {
      return res.status(404).json({ error: 'Securities not found in results' });
    }

    res.json({
      success: true,
      filename: fileName,
      securities: results.securities_result.securities
    });
  } catch (error) {
    console.error('Error getting document securities:', error);
    res.status(500).json({ error: 'Error getting document securities', details: error.message });
  }
});

/**
 * Get document metrics
 */
router.get('/get-document-metrics/:filename', async (req, res) => {
  if (!config.enableFinancialDocumentProcessor) {
    return res.status(501).json({ error: 'Financial Document Processor is not enabled' });
  }

  try {
    const fileName = req.params.filename;
    const resultsPath = path.join(config.resultsFolder, fileName + '.json');

    if (!fs.existsSync(resultsPath)) {
      return res.status(404).json({ error: 'Results file not found' });
    }

    const results = JSON.parse(fs.readFileSync(resultsPath, 'utf8'));
    
    if (!results.metrics_result) {
      return res.status(404).json({ error: 'Metrics not found in results' });
    }

    res.json({
      success: true,
      filename: fileName,
      metrics: results.metrics_result
    });
  } catch (error) {
    console.error('Error getting document metrics:', error);
    res.status(500).json({ error: 'Error getting document metrics', details: error.message });
  }
});

/**
 * Process a batch of documents
 */
router.post('/process-batch', upload.array('files', config.batchSize), async (req, res) => {
  if (!config.enableFinancialDocumentProcessor) {
    return res.status(501).json({ error: 'Financial Document Processor is not enabled' });
  }

  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const batchId = uuidv4();
    const options = req.body.options ? JSON.parse(req.body.options) : {};
    const files = req.files.map(file => ({
      path: file.path,
      filename: file.filename,
      status: 'pending',
      result: null,
      error: null
    }));

    // Initialize batch processing state
    batchProcessingState.set(batchId, {
      id: batchId,
      totalFiles: files.length,
      processedFiles: 0,
      status: 'processing',
      files,
      startTime: Date.now(),
      endTime: null
    });

    // Start processing the batch asynchronously
    processBatch(batchId, files, options);

    // Return the batch ID
    res.json({
      success: true,
      batchId,
      totalFiles: files.length
    });
  } catch (error) {
    console.error('Error processing batch:', error);
    res.status(500).json({ error: 'Error processing batch', details: error.message });
  }
});

/**
 * Get batch status
 */
router.get('/batch-status/:batchId', async (req, res) => {
  if (!config.enableFinancialDocumentProcessor) {
    return res.status(501).json({ error: 'Financial Document Processor is not enabled' });
  }

  try {
    const batchId = req.params.batchId;
    const batchState = batchProcessingState.get(batchId);

    if (!batchState) {
      return res.status(404).json({ error: 'Batch not found' });
    }

    res.json({
      success: true,
      batchId,
      status: batchState.status,
      totalFiles: batchState.totalFiles,
      processedFiles: batchState.processedFiles,
      progress: Math.round((batchState.processedFiles / batchState.totalFiles) * 100),
      startTime: batchState.startTime,
      endTime: batchState.endTime,
      files: batchState.files.map(file => ({
        filename: file.filename,
        status: file.status,
        error: file.error
      }))
    });
  } catch (error) {
    console.error('Error getting batch status:', error);
    res.status(500).json({ error: 'Error getting batch status', details: error.message });
  }
});

/**
 * Process a batch of documents asynchronously
 */
async function processBatch(batchId, files, options) {
  const batchState = batchProcessingState.get(batchId);
  
  if (!batchState) {
    console.error(`Batch ${batchId} not found`);
    return;
  }

  try {
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      try {
        // Set up environment variables for the Python process
        const env = {
          ...process.env,
          NLTK_DATA: config.nltkData,
          PYTHONPATH: process.env.PYTHONPATH || ''
        };

        // Prepare arguments for the Python script
        const args = [
          config.processorScript,
          '--input', file.path,
          '--output', path.join(config.resultsFolder, file.filename + '.json'),
          '--cache-dir', config.cacheDir
        ];

        if (options.languages) {
          args.push('--languages', options.languages.join(','));
        }

        if (options.extractTables === false) {
          args.push('--no-extract-tables');
        }

        if (options.extractSecurities === false) {
          args.push('--no-extract-securities');
        }

        if (options.extractMetrics === false) {
          args.push('--no-extract-metrics');
        }

        if (config.cacheEnabled) {
          args.push('--cache-enabled');
        }

        // Update file status
        file.status = 'processing';
        batchProcessingState.set(batchId, batchState);

        // Process the file
        const result = await new Promise((resolve, reject) => {
          const pythonProcess = spawn(config.pythonPath, args, { env });

          let stdoutData = '';
          let stderrData = '';

          pythonProcess.stdout.on('data', (data) => {
            stdoutData += data.toString();
          });

          pythonProcess.stderr.on('data', (data) => {
            stderrData += data.toString();
          });

          pythonProcess.on('close', (code) => {
            if (code !== 0) {
              reject(new Error(`Process exited with code ${code}: ${stderrData}`));
            } else {
              resolve(stdoutData);
            }
          });
        });

        // Update file status
        file.status = 'completed';
        file.result = result;
      } catch (error) {
        console.error(`Error processing file ${file.filename}:`, error);
        file.status = 'error';
        file.error = error.message;
      }

      // Update batch state
      batchState.processedFiles++;
      batchProcessingState.set(batchId, batchState);
    }

    // Update batch status
    batchState.status = 'completed';
    batchState.endTime = Date.now();
    batchProcessingState.set(batchId, batchState);
  } catch (error) {
    console.error(`Error processing batch ${batchId}:`, error);
    batchState.status = 'error';
    batchState.endTime = Date.now();
    batchProcessingState.set(batchId, batchState);
  }
}

module.exports = router;
