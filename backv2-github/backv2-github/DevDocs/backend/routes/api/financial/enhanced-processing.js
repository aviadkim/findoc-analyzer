/**
 * Enhanced Financial Document Processing API
 * 
 * Handles the processing of financial documents using the enhanced multi-agent system:
 * - Receives document uploads
 * - Processes documents through the enhanced pipeline
 * - Returns processing results
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { spawn } = require('child_process');
const logger = require('../../../utils/logger');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads');
    
    // Create upload directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate a unique filename
    const uniqueId = uuidv4();
    const fileExt = path.extname(file.originalname);
    const fileName = `${uniqueId}${fileExt}`;
    
    cb(null, fileName);
  }
});

// Create multer upload instance
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB
  },
  fileFilter: (req, file, cb) => {
    // Accept only PDF, Excel, and CSV files
    const allowedExtensions = ['.pdf', '.xlsx', '.xls', '.csv'];
    const fileExt = path.extname(file.originalname).toLowerCase();
    
    if (allowedExtensions.includes(fileExt)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, Excel, and CSV files are allowed.'));
    }
  }
});

// In-memory storage for processed documents
const processedDocuments = {};

/**
 * @route POST /api/financial/enhanced-processing
 * @desc Process a financial document using the enhanced multi-agent system
 * @access Public
 */
router.post('/', upload.single('file'), async (req, res) => {
  try {
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    // Get document type from request
    const documentType = req.body.document_type || 'financial';
    
    // Get language from request
    const language = req.body.language || 'eng';
    
    // Get API key from request
    const apiKey = req.body.api_key || process.env.OPENROUTER_API_KEY || '';
    
    // Get metadata from request
    const metadata = req.body.metadata ? JSON.parse(req.body.metadata) : {};
    
    // Generate a document ID
    const documentId = uuidv4();
    
    // Store document info
    processedDocuments[documentId] = {
      filePath: req.file.path,
      originalFilename: req.file.originalname,
      uploadTime: new Date().toISOString(),
      status: 'processing',
      documentType,
      language,
      metadata: {
        ...metadata,
        originalFilename: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size
      }
    };
    
    // Return immediate response with document ID
    res.status(202).json({
      status: 'processing',
      message: 'Document uploaded and processing started',
      document_id: documentId
    });
    
    // Process the document in a separate process
    const outputDir = path.join(process.cwd(), 'enhanced_output', documentId);
    
    // Create output directory
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Get the path to the Python script
    const scriptPath = path.join(process.cwd(), 'FinDocRAG', 'run_enhanced_agent_system.py');
    
    // Spawn Python process
    const pythonProcess = spawn('python', [
      scriptPath,
      req.file.path,
      '--output-dir', outputDir,
      '--api-key', apiKey
    ]);
    
    // Handle process output
    let stdoutData = '';
    let stderrData = '';
    
    pythonProcess.stdout.on('data', (data) => {
      stdoutData += data.toString();
      logger.info(`Enhanced processing stdout: ${data.toString()}`);
    });
    
    pythonProcess.stderr.on('data', (data) => {
      stderrData += data.toString();
      logger.error(`Enhanced processing stderr: ${data.toString()}`);
    });
    
    // Handle process completion
    pythonProcess.on('close', (code) => {
      if (code === 0) {
        logger.info(`Enhanced processing completed successfully for document ${documentId}`);
        
        // Read results from file
        const resultsPath = path.join(outputDir, 'processing_results.json');
        
        if (fs.existsSync(resultsPath)) {
          try {
            const results = JSON.parse(fs.readFileSync(resultsPath, 'utf8'));
            
            // Update document info
            processedDocuments[documentId].status = 'completed';
            processedDocuments[documentId].results = results;
            processedDocuments[documentId].resultsPath = resultsPath;
          } catch (error) {
            logger.error(`Error reading results file: ${error.message}`);
            processedDocuments[documentId].status = 'error';
            processedDocuments[documentId].error = 'Error reading results file';
          }
        } else {
          logger.error(`Results file not found: ${resultsPath}`);
          processedDocuments[documentId].status = 'error';
          processedDocuments[documentId].error = 'Results file not found';
        }
      } else {
        logger.error(`Enhanced processing failed with code ${code} for document ${documentId}`);
        processedDocuments[documentId].status = 'error';
        processedDocuments[documentId].error = `Processing failed with code ${code}`;
        processedDocuments[documentId].stderr = stderrData;
      }
    });
  } catch (error) {
    logger.error(`Error processing document: ${error.message}`);
    return res.status(500).json({
      error: `Error processing document: ${error.message}`
    });
  }
});

/**
 * @route GET /api/financial/enhanced-processing/:id
 * @desc Get the status and results of a processed document
 * @access Public
 */
router.get('/:id', (req, res) => {
  const documentId = req.params.id;
  
  // Check if document exists
  if (!processedDocuments[documentId]) {
    return res.status(404).json({
      error: `Document ${documentId} not found`
    });
  }
  
  // Get document info
  const documentInfo = processedDocuments[documentId];
  
  // Return document info
  return res.json({
    document_id: documentId,
    status: documentInfo.status,
    original_filename: documentInfo.originalFilename,
    upload_time: documentInfo.uploadTime,
    document_type: documentInfo.documentType,
    ...(documentInfo.status === 'completed' && { results: documentInfo.results }),
    ...(documentInfo.status === 'error' && { error: documentInfo.error })
  });
});

/**
 * @route GET /api/financial/enhanced-processing/:id/securities
 * @desc Get the securities extracted from a processed document
 * @access Public
 */
router.get('/:id/securities', (req, res) => {
  const documentId = req.params.id;
  
  // Check if document exists
  if (!processedDocuments[documentId]) {
    return res.status(404).json({
      error: `Document ${documentId} not found`
    });
  }
  
  // Get document info
  const documentInfo = processedDocuments[documentId];
  
  // Check if document is completed
  if (documentInfo.status !== 'completed') {
    return res.status(400).json({
      error: `Document ${documentId} is not completed (status: ${documentInfo.status})`
    });
  }
  
  // Check if results exist
  if (!documentInfo.results) {
    return res.status(400).json({
      error: `No results found for document ${documentId}`
    });
  }
  
  // Get securities
  const securities = documentInfo.results.securities || [];
  
  // Return securities
  return res.json({
    document_id: documentId,
    securities_count: securities.length,
    securities
  });
});

/**
 * @route GET /api/financial/enhanced-processing/:id/download
 * @desc Download the results of a processed document as JSON
 * @access Public
 */
router.get('/:id/download', (req, res) => {
  const documentId = req.params.id;
  
  // Check if document exists
  if (!processedDocuments[documentId]) {
    return res.status(404).json({
      error: `Document ${documentId} not found`
    });
  }
  
  // Get document info
  const documentInfo = processedDocuments[documentId];
  
  // Check if document is completed
  if (documentInfo.status !== 'completed') {
    return res.status(400).json({
      error: `Document ${documentId} is not completed (status: ${documentInfo.status})`
    });
  }
  
  // Check if results path exists
  if (!documentInfo.resultsPath || !fs.existsSync(documentInfo.resultsPath)) {
    return res.status(400).json({
      error: `No results file found for document ${documentId}`
    });
  }
  
  // Send the file
  return res.download(documentInfo.resultsPath, `${documentInfo.originalFilename}.json`);
});

module.exports = router;
