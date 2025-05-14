/**
 * FinDoc Analyzer - Tenant-Aware Server
 *
 * This server provides the API for the FinDoc Analyzer application with tenant awareness.
 * It uses the tenant-aware agent manager to process documents and answer questions.
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const tenantIntegration = require('./tenant-integration');
const authService = require('./auth-service');
const portfolioPerformanceIntegration = require('./portfolio-performance-integration');
const bloombergAgentIntegration = require('./bloomberg-agent-integration');
const { processDocument } = require('./document-processor');
const GeminiAgent = require('./gemini-agent');
const BloombergAgent = require('./bloomberg-agent');
const exportService = require('./export-service');
const batchProcessor = require('./batch-processor');
const supabase = require('./supabase-client');

// Create Express app
const app = express();
const port = process.env.PORT || 8080;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Cookie parser
app.use(require('cookie-parser')());

// File upload middleware
const fileUpload = require('express-fileupload');
app.use(fileUpload({
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max file size
  useTempFiles: true,
  tempFileDir: path.join(__dirname, 'temp')
}));

// Create necessary directories
const tempDir = path.join(__dirname, 'temp');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const resultsDir = path.join(__dirname, 'results');
if (!fs.existsSync(resultsDir)) {
  fs.mkdirSync(resultsDir, { recursive: true });
}

// Mock documents
const mockDocuments = [];

// Document processing status
const documentProcessingStatus = new Map();

// Authentication routes

// Get Google OAuth URL
app.get('/api/auth/google', (req, res) => {
  try {
    const authUrl = authService.getGoogleAuthUrl();
    res.json({ url: authUrl });
  } catch (error) {
    console.error('Error getting Google auth URL:', error);
    res.status(500).json({ error: 'Error getting Google auth URL' });
  }
});

// Handle Google OAuth callback
app.get('/api/auth/google/callback', async (req, res) => {
  try {
    const { code } = req.query;

    if (!code) {
      return res.status(400).json({ error: 'Authorization code is required' });
    }

    const result = await authService.handleGoogleCallback(code);

    // Set JWT token as HTTP-only cookie
    res.cookie('auth_token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000, // 1 day
      sameSite: 'lax'
    });

    // Redirect to frontend
    res.redirect(process.env.FRONTEND_URL || 'http://localhost:3000/dashboard');
  } catch (error) {
    console.error('Error handling Google callback:', error);
    res.status(500).json({ error: 'Error handling Google callback' });
  }
});

// Get current user
app.get('/api/auth/me', authService.authMiddleware, (req, res) => {
  try {
    res.json({
      user: req.user
    });
  } catch (error) {
    console.error('Error getting current user:', error);
    res.status(500).json({ error: 'Error getting current user' });
  }
});

// Logout
app.post('/api/auth/logout', (req, res) => {
  try {
    // Clear auth cookie
    res.clearCookie('auth_token');
    res.json({ success: true });
  } catch (error) {
    console.error('Error logging out:', error);
    res.status(500).json({ error: 'Error logging out' });
  }
});

// Non-tenant-specific API routes

// Get all documents
app.get('/api/documents', (req, res) => {
  try {
    // Return all documents (in a real app, this would be filtered by user)
    res.json(mockDocuments);
  } catch (error) {
    console.error('Error getting documents:', error);
    res.status(500).json({ error: 'Error getting documents' });
  }
});

// Create a new document
app.post('/api/documents', (req, res) => {
  try {
    const { fileName, documentType, fileSize } = req.body;

    // Validate required fields
    if (!fileName) {
      return res.status(400).json({ error: 'File name is required' });
    }

    // Generate a unique ID for the document
    const documentId = uuidv4();

    // Create document
    const document = {
      id: documentId,
      name: fileName,
      fileName,
      documentType: documentType || 'unknown',
      fileSize: fileSize || 0,
      uploadDate: new Date().toISOString(),
      processed: false,
      status: 'created',
      message: 'Document created successfully'
    };

    // Add document to mock documents
    mockDocuments.push(document);

    res.json({ success: true, document });
  } catch (error) {
    console.error('Error creating document:', error);
    res.status(500).json({ error: 'Error creating document' });
  }
});

// Get document by ID
app.get('/api/documents/:id', (req, res) => {
  try {
    const documentId = req.params.id;

    // Find document
    const document = mockDocuments.find(doc => doc.id === documentId);

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    res.json(document);
  } catch (error) {
    console.error('Error getting document:', error);
    res.status(500).json({ error: 'Error getting document' });
  }
});

// Export document
app.get('/api/documents/:id/export/:format', async (req, res) => {
  try {
    const documentId = req.params.id;
    const format = req.params.format.toLowerCase();

    // Validate format
    const validFormats = ['csv', 'excel', 'pdf', 'json'];
    if (!validFormats.includes(format)) {
      return res.status(400).json({ error: `Invalid format. Supported formats: ${validFormats.join(', ')}` });
    }

    // Find document
    const document = mockDocuments.find(doc => doc.id === documentId);

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Check if document is processed
    if (!document.processed) {
      return res.status(400).json({ error: 'Document is not processed yet' });
    }

    // Export document
    const result = await exportService.exportDocument(document, format, {
      fileName: `${document.name.replace(/[^a-zA-Z0-9]/g, '-')}-${Date.now()}.${format === 'excel' ? 'xlsx' : format}`
    });

    if (!result.success) {
      return res.status(500).json({ error: result.error });
    }

    res.json({
      success: true,
      fileUrl: result.fileUrl,
      fileName: result.fileName,
      fileType: result.fileType,
      fileSize: result.fileSize
    });
  } catch (error) {
    console.error('Error exporting document:', error);
    res.status(500).json({ error: 'Error exporting document' });
  }
});

// Export table
app.post('/api/tables/export/:format', async (req, res) => {
  try {
    const format = req.params.format.toLowerCase();
    const { tableData, options = {} } = req.body;

    // Validate format
    const validFormats = ['csv', 'excel', 'pdf', 'json'];
    if (!validFormats.includes(format)) {
      return res.status(400).json({ error: `Invalid format. Supported formats: ${validFormats.join(', ')}` });
    }

    // Validate table data
    if (!tableData || !tableData.headers || !tableData.rows) {
      return res.status(400).json({ error: 'Invalid table data. Headers and rows are required.' });
    }

    // Export table
    const result = await exportService.exportTable(tableData, format, {
      fileName: options.fileName || `table-export-${Date.now()}.${format === 'excel' ? 'xlsx' : format}`,
      title: options.title || 'Table Export'
    });

    if (!result.success) {
      return res.status(500).json({ error: result.error });
    }

    res.json({
      success: true,
      fileUrl: result.fileUrl,
      fileName: result.fileName,
      fileType: result.fileType,
      fileSize: result.fileSize
    });
  } catch (error) {
    console.error('Error exporting table:', error);
    res.status(500).json({ error: 'Error exporting table' });
  }
});

// Upload a document
app.post('/api/documents/upload', async (req, res) => {
  try {
    // Check if file was uploaded
    if (!req.files || !req.files.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    const file = req.files.file;
    const fileName = file.name;
    const fileSize = file.size;
    const documentType = req.body.type || 'unknown';
    const documentName = req.body.name || fileName;

    // Validate file type
    const allowedFileTypes = ['pdf', 'xlsx', 'xls', 'csv'];
    const fileExtension = fileName.split('.').pop().toLowerCase();

    if (!allowedFileTypes.includes(fileExtension)) {
      return res.status(400).json({
        success: false,
        error: `Invalid file type. Allowed types: ${allowedFileTypes.join(', ')}`
      });
    }

    // Generate a unique ID for the document
    const documentId = uuidv4();

    // Save file to uploads directory
    const filePath = path.join(uploadsDir, `${documentId}-${fileName}`);
    await file.mv(filePath);

    // Create document
    const document = {
      id: documentId,
      name: documentName,
      fileName,
      filePath,
      fileSize,
      documentType,
      uploadDate: new Date().toISOString(),
      processed: false,
      status: 'uploaded',
      message: 'Document uploaded successfully',
      content: {
        text: '',
        pages: [],
        tables: [],
        securities: []
      }
    };

    // Add document to mock documents
    mockDocuments.push(document);

    // Start processing the document
    documentProcessingStatus.set(documentId, {
      id: documentId,
      processed: false,
      status: 'processing',
      progress: 0,
      startTime: new Date().toISOString()
    });

    // Process document in the background
    processDocumentInBackground(document);

    res.json({
      success: true,
      document
    });
  } catch (error) {
    console.error('Error uploading document:', error);
    res.status(500).json({ error: 'Error uploading document' });
  }
});

/**
 * Process a document in the background
 * @param {Object} document - Document to process
 */
async function processDocumentInBackground(document) {
  try {
    console.log(`Processing document in background: ${document.id}`);

    // Update document status
    document.status = 'processing';
    document.message = 'Document processing started';

    // Update processing status
    documentProcessingStatus.set(document.id, {
      id: document.id,
      processed: false,
      status: 'processing',
      progress: 10,
      message: 'Starting document processing...',
      startTime: new Date().toISOString()
    });

    // Simulate processing steps
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Update status - OCR
    documentProcessingStatus.set(document.id, {
      id: document.id,
      processed: false,
      status: 'processing',
      progress: 30,
      message: 'Performing OCR...',
      startTime: new Date().toISOString()
    });

    await new Promise(resolve => setTimeout(resolve, 1000));

    // Update status - Table extraction
    documentProcessingStatus.set(document.id, {
      id: document.id,
      processed: false,
      status: 'processing',
      progress: 50,
      message: 'Extracting tables...',
      startTime: new Date().toISOString()
    });

    await new Promise(resolve => setTimeout(resolve, 1000));

    // Update status - Securities extraction
    documentProcessingStatus.set(document.id, {
      id: document.id,
      processed: false,
      status: 'processing',
      progress: 70,
      message: 'Extracting securities...',
      startTime: new Date().toISOString()
    });

    await new Promise(resolve => setTimeout(resolve, 1000));

    // Update status - Finalizing
    documentProcessingStatus.set(document.id, {
      id: document.id,
      processed: false,
      status: 'processing',
      progress: 90,
      message: 'Finalizing...',
      startTime: new Date().toISOString()
    });

    await new Promise(resolve => setTimeout(resolve, 1000));

    // Simulate processing result
    const result = {
      text: 'This is the extracted text from the document. The document contains financial information about various securities and investments. It includes tables with performance metrics and portfolio allocation details. The document appears to be a quarterly financial report with data on market trends, investment strategies, and risk assessments.',
      tables: [
        {
          id: 'table-1',
          name: 'Portfolio Summary',
          headers: ['Asset Class', 'Allocation (%)', 'Value (USD)', 'YTD Return (%)'],
          rows: [
            ['Equities', '45%', '$450,000', '8.2%'],
            ['Fixed Income', '30%', '$300,000', '3.5%'],
            ['Alternatives', '15%', '$150,000', '5.7%'],
            ['Cash', '10%', '$100,000', '0.8%']
          ]
        },
        {
          id: 'table-2',
          name: 'Top Holdings',
          headers: ['Security', 'ISIN', 'Quantity', 'Market Value', 'Weight (%)'],
          rows: [
            ['Apple Inc.', 'US0378331005', '1,200', '$210,000', '4.2%'],
            ['Microsoft Corp.', 'US5949181045', '800', '$180,000', '3.6%'],
            ['Amazon.com Inc.', 'US0231351067', '150', '$120,000', '2.4%'],
            ['Alphabet Inc.', 'US02079K1079', '200', '$110,000', '2.2%'],
            ['US Treasury 2.5% 2030', 'US912810TL45', '$100,000', '$98,500', '1.97%']
          ]
        }
      ],
      securities: [
        {
          name: 'Apple Inc.',
          isin: 'US0378331005',
          quantity: 1200,
          price: {
            currency: '$',
            value: 175.00
          }
        },
        {
          name: 'Microsoft Corp.',
          isin: 'US5949181045',
          quantity: 800,
          price: {
            currency: '$',
            value: 225.00
          }
        },
        {
          name: 'Amazon.com Inc.',
          isin: 'US0231351067',
          quantity: 150,
          price: {
            currency: '$',
            value: 800.00
          }
        },
        {
          name: 'Alphabet Inc.',
          isin: 'US02079K1079',
          quantity: 200,
          price: {
            currency: '$',
            value: 550.00
          }
        },
        {
          name: 'US Treasury 2.5% 2030',
          isin: 'US912810TL45',
          quantity: null,
          price: {
            currency: '$',
            value: 98.50
          }
        }
      ],
      metadata: {
        documentType: document.documentType || 'Financial Report',
        date: '2023-12-31',
        author: 'Financial Advisor',
        totalValue: '$1,000,000',
        currency: 'USD',
        period: 'Q4 2023'
      },
      processingTime: 5000 // ms
    };

    // Update document with processing result
    document.content = result;
    document.processed = true;
    document.processingTime = result.processingTime;
    document.processedAt = new Date().toISOString();
    document.status = 'completed';
    document.message = 'Document processed successfully';

    // Update status
    documentProcessingStatus.set(document.id, {
      id: document.id,
      processed: true,
      status: 'completed',
      progress: 100,
      message: 'Document processed successfully',
      startTime: new Date().toISOString(),
      endTime: new Date().toISOString()
    });

    console.log(`Document processed successfully: ${document.id}`);
  } catch (error) {
    console.error(`Error processing document ${document.id}:`, error);

    // Update document status
    document.status = 'error';
    document.message = `Error processing document: ${error.message}`;

    // Update processing status
    documentProcessingStatus.set(document.id, {
      id: document.id,
      processed: false,
      status: 'error',
      progress: 0,
      startTime: documentProcessingStatus.get(document.id).startTime,
      endTime: new Date().toISOString(),
      error: error.message
    });
  }
}

// Get document processing status
app.get('/api/documents/:id/status', (req, res) => {
  try {
    const documentId = req.params.id;

    // Get status from map
    const status = documentProcessingStatus.get(documentId);

    if (!status) {
      return res.status(404).json({ error: 'Document status not found' });
    }

    res.json(status);
  } catch (error) {
    console.error('Error getting document status:', error);
    res.status(500).json({ error: 'Error getting document status' });
  }
});

// Process a document
app.post('/api/documents/:id/process', async (req, res) => {
  try {
    const documentId = req.params.id;
    const reprocess = req.query.reprocess === 'true';

    // Find document
    const document = mockDocuments.find(doc => doc.id === documentId);

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Check if document is already being processed
    const status = documentProcessingStatus.get(documentId);
    if (status && status.status === 'processing' && !reprocess) {
      return res.status(400).json({ error: 'Document is already being processed' });
    }

    // Check if document is already processed and reprocess is not requested
    if (document.processed && !reprocess) {
      return res.status(400).json({ error: 'Document is already processed' });
    }

    // Update document status
    document.processed = false;
    document.status = 'processing';
    document.message = 'Document processing started';

    // Update processing status
    documentProcessingStatus.set(documentId, {
      id: documentId,
      processed: false,
      status: 'processing',
      progress: 0,
      startTime: new Date().toISOString()
    });

    // Process document in the background
    processDocumentInBackground(document);

    res.json({
      success: true,
      message: 'Document processing started',
      documentId
    });
  } catch (error) {
    console.error('Error processing document:', error);
    res.status(500).json({ error: 'Error processing document' });
  }
});

// Download a document
app.get('/api/documents/:id/download', (req, res) => {
  try {
    const documentId = req.params.id;

    // Find document
    const document = mockDocuments.find(doc => doc.id === documentId);

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Check if file exists
    if (!fs.existsSync(document.filePath)) {
      return res.status(404).json({ error: 'Document file not found' });
    }

    // Send file
    res.download(document.filePath, document.fileName);
  } catch (error) {
    console.error('Error downloading document:', error);
    res.status(500).json({ error: 'Error downloading document' });
  }
});

// Batch upload documents
app.post('/api/documents/batch/upload', async (req, res) => {
  try {
    // Check if files were uploaded
    if (!req.files || !req.files.files) {
      return res.status(400).json({
        success: false,
        error: 'No files uploaded'
      });
    }

    // Ensure files is an array
    const files = Array.isArray(req.files.files) ? req.files.files : [req.files.files];

    if (files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No files uploaded'
      });
    }

    // Get document type
    const documentType = req.body.type || 'unknown';

    // Prepare files for batch processing
    const batchFiles = [];

    for (const file of files) {
      // Generate a unique ID for the document
      const documentId = uuidv4();

      // Save file to uploads directory
      const filePath = path.join(uploadsDir, `${documentId}-${file.name}`);
      await file.mv(filePath);

      // Add to batch files
      batchFiles.push({
        id: documentId,
        name: file.name,
        path: filePath,
        size: file.size,
        type: file.mimetype
      });
    }

    // Create batch job
    const batchJob = batchProcessor.createBatchJob(batchFiles, {
      tenantId: req.tenantId || 'public',
      userId: req.user?.userId || 'anonymous',
      documentType,
      callback: (job) => {
        console.log(`Batch job ${job.id} completed with status: ${job.status}`);

        // Add processed documents to mock documents
        for (const file of job.files) {
          if (file.status === batchProcessor.BATCH_STATUS.COMPLETED && file.result) {
            const document = {
              id: file.id,
              name: file.name,
              fileName: file.name,
              filePath: file.path,
              fileSize: file.size,
              documentType,
              uploadDate: job.createdAt,
              processed: true,
              status: 'completed',
              message: 'Document processed successfully',
              content: file.result.content,
              metadata: file.result.metadata,
              processedAt: job.completedAt
            };

            // Add document to mock documents
            mockDocuments.push(document);
          }
        }
      }
    });

    res.json({
      success: true,
      batchId: batchJob.id,
      totalFiles: batchJob.totalFiles,
      status: batchJob.status
    });
  } catch (error) {
    console.error('Error batch uploading documents:', error);
    res.status(500).json({ error: 'Error batch uploading documents' });
  }
});

// Get batch job status
app.get('/api/documents/batch/:id/status', (req, res) => {
  try {
    const batchId = req.params.id;

    // Get batch job status
    const status = batchProcessor.getBatchJobStatus(batchId);

    if (!status) {
      return res.status(404).json({ error: 'Batch job not found' });
    }

    res.json(status);
  } catch (error) {
    console.error('Error getting batch job status:', error);
    res.status(500).json({ error: 'Error getting batch job status' });
  }
});

// Get batch job details
app.get('/api/documents/batch/:id/details', (req, res) => {
  try {
    const batchId = req.params.id;

    // Get batch job details
    const details = batchProcessor.getBatchJobDetails(batchId);

    if (!details) {
      return res.status(404).json({ error: 'Batch job not found' });
    }

    res.json(details);
  } catch (error) {
    console.error('Error getting batch job details:', error);
    res.status(500).json({ error: 'Error getting batch job details' });
  }
});

// Cancel batch job
app.post('/api/documents/batch/:id/cancel', (req, res) => {
  try {
    const batchId = req.params.id;

    // Cancel batch job
    const cancelled = batchProcessor.cancelBatchJob(batchId);

    if (!cancelled) {
      return res.status(400).json({ error: 'Batch job cannot be cancelled' });
    }

    res.json({
      success: true,
      message: 'Batch job cancelled successfully'
    });
  } catch (error) {
    console.error('Error cancelling batch job:', error);
    res.status(500).json({ error: 'Error cancelling batch job' });
  }
});

// Get scan1 status
app.get('/api/scan1/status', (req, res) => {
  try {
    res.json({
      status: 'running',
      version: '1.0.0',
      uptime: '3 days, 2 hours',
      memory: {
        used: '256MB',
        total: '1GB'
      },
      cpu: {
        usage: '12%'
      }
    });
  } catch (error) {
    console.error('Error getting scan1 status:', error);
    res.status(500).json({ error: 'Error getting scan1 status' });
  }
});

// Get agents
app.get('/api/agents', (req, res) => {
  try {
    res.json({
      agents: [
        {
          id: 'document-analyzer',
          name: 'Document Analyzer',
          status: 'running',
          version: '1.0.0'
        },
        {
          id: 'table-understanding',
          name: 'Table Understanding',
          status: 'running',
          version: '1.0.0'
        },
        {
          id: 'securities-extractor',
          name: 'Securities Extractor',
          status: 'running',
          version: '1.0.0'
        },
        {
          id: 'financial-reasoner',
          name: 'Financial Reasoner',
          status: 'running',
          version: '1.0.0'
        },
        {
          id: 'bloomberg-agent',
          name: 'Bloomberg Agent',
          status: 'running',
          version: '1.0.0'
        }
      ]
    });
  } catch (error) {
    console.error('Error getting agents:', error);
    res.status(500).json({ error: 'Error getting agents' });
  }
});

// Get API keys
app.get('/api/config/api-keys', (req, res) => {
  try {
    res.json({
      apiKeys: [
        {
          id: 'openai',
          name: 'OpenAI API Key',
          status: 'active',
          lastUsed: new Date().toISOString()
        },
        {
          id: 'gemini',
          name: 'Google Gemini API Key',
          status: 'active',
          lastUsed: new Date().toISOString()
        },
        {
          id: 'openrouter',
          name: 'OpenRouter API Key',
          status: 'active',
          lastUsed: new Date().toISOString()
        }
      ]
    });
  } catch (error) {
    console.error('Error getting API keys:', error);
    res.status(500).json({ error: 'Error getting API keys' });
  }
});

// Document chat (non-tenant-specific fallback)
app.post('/api/documents/:id/chat', async (req, res) => {
  try {
    const documentId = req.params.id;
    const { question } = req.body;

    if (!question) {
      return res.status(400).json({ error: 'Question is required' });
    }

    // Find document
    const document = mockDocuments.find(doc => doc.id === documentId);

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Check if document is processed
    if (!document.processed) {
      return res.status(400).json({ error: 'Document is not processed yet' });
    }

    // Initialize Gemini agent
    const geminiApiKey = process.env.GEMINI_API_KEY || 'mock-api-key';
    const geminiAgent = new GeminiAgent(geminiApiKey, {
      model: 'gemini-1.5-pro',
      temperature: 0.2
    });

    try {
      // Answer question using Gemini agent
      const answer = await geminiAgent.answerDocumentQuestion(document, question);

      // Store chat in database (if available)
      try {
        await supabase.createDocumentChat({
          documentId,
          userId: req.user?.userId || 'anonymous',
          tenantId: req.tenantId || 'public',
          question,
          answer: answer.answer
        });
      } catch (dbError) {
        console.warn('Error storing chat in database:', dbError);
        // Continue even if database storage fails
      }

      res.json({
        documentId,
        question,
        answer: answer.answer,
        timestamp: new Date().toISOString()
      });
    } catch (aiError) {
      console.error('Error getting answer from Gemini agent:', aiError);

      // Fallback to simple response
      res.json({
        documentId,
        question,
        answer: `I'm sorry, I encountered an error while trying to answer your question about "${document.name}". Please try again later or with a different question.`,
        timestamp: new Date().toISOString(),
        error: aiError.message
      });
    }
  } catch (error) {
    console.error('Error answering question:', error);
    res.status(500).json({ error: 'Error answering question' });
  }
});

// Tenant-aware routes

// Tenant middleware for protected routes
app.use('/api/tenant', tenantIntegration.tenantMiddleware);

// Create a new tenant
app.post('/api/tenants', async (req, res) => {
  try {
    const tenantData = req.body;

    // Validate tenant data
    if (!tenantData.name) {
      return res.status(400).json({
        error: 'Tenant name is required'
      });
    }

    // Create tenant
    const result = await tenantIntegration.createTenant(tenantData);

    res.json(result);
  } catch (error) {
    console.error('Error creating tenant:', error);

    res.status(500).json({
      error: 'Error creating tenant'
    });
  }
});

// Get tenant documents
app.get('/api/tenant/documents', async (req, res) => {
  try {
    // Get tenant ID from request
    const tenantId = req.tenantId;

    // Filter documents by tenant ID
    const tenantDocuments = mockDocuments.filter(doc => doc.tenantId === tenantId);

    res.json(tenantDocuments);
  } catch (error) {
    console.error('Error getting tenant documents:', error);

    res.status(500).json({
      error: 'Error getting tenant documents'
    });
  }
});

// Upload a document for a tenant
app.post('/api/tenant/documents/upload', async (req, res) => {
  try {
    // Get tenant ID from request
    const tenantId = req.tenantId;

    // Check if file was uploaded
    if (!req.files || !req.files.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    const file = req.files.file;
    const fileName = file.name;
    const fileSize = file.size;
    const documentType = req.body.type || 'unknown';
    const documentName = req.body.name || fileName;

    // Validate file type
    const allowedFileTypes = ['pdf', 'xlsx', 'xls', 'csv'];
    const fileExtension = fileName.split('.').pop().toLowerCase();

    if (!allowedFileTypes.includes(fileExtension)) {
      return res.status(400).json({
        success: false,
        error: `Invalid file type. Allowed types: ${allowedFileTypes.join(', ')}`
      });
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(__dirname, 'uploads', tenantId);
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Generate a unique ID for the document
    const documentId = uuidv4();

    // Save file to uploads directory
    const filePath = path.join(uploadsDir, `${documentId}-${fileName}`);
    await file.mv(filePath);

    // Create document
    const document = {
      id: documentId,
      tenantId,
      name: documentName,
      fileName,
      filePath,
      fileSize,
      documentType,
      fileExtension,
      uploadDate: new Date().toISOString(),
      processed: false,
      status: 'uploaded',
      message: 'Document uploaded successfully'
    };

    // Add document to mock documents
    mockDocuments.push(document);

    // Log document upload
    console.log(`Document uploaded: ${documentId} - ${fileName} (${fileSize} bytes) for tenant ${tenantId}`);

    // Send response to client
    res.json({
      success: true,
      document
    });

    // Automatically start processing the document
    try {
      console.log(`Automatically starting document processing for ${documentId}`);

      // Start processing
      documentProcessingStatus.set(documentId, {
        id: documentId,
        tenantId,
        processed: false,
        status: 'processing',
        progress: 0,
        startTime: new Date().toISOString()
      });

      // Update document status
      document.status = 'processing';
      document.message = 'Document processing started';

      // Process document with tenant-aware agent manager
      const result = await tenantIntegration.processDocument(tenantId, document);

      if (result.success) {
        // Update document status
        document.processed = true;
        document.processingTime = result.processingTime;
        document.processedAt = new Date().toISOString();
        document.status = 'completed';
        document.message = 'Document processed successfully';

        // Extract document content
        try {
          // Check if the document is a PDF
          if (document.fileName.toLowerCase().endsWith('.pdf')) {
            // Use PDF.js to extract text content
            const pdfjs = require('pdfjs-dist/legacy/build/pdf.js');
            const data = new Uint8Array(fs.readFileSync(document.filePath));

            // Load PDF document
            const pdf = await pdfjs.getDocument({ data }).promise;

            // Initialize content object
            document.content = {
              text: '',
              pages: []
            };

            // Extract text from each page
            for (let i = 1; i <= pdf.numPages; i++) {
              const page = await pdf.getPage(i);
              const textContent = await page.getTextContent();
              const pageText = textContent.items.map(item => item.str).join(' ');

              document.content.text += pageText + ' ';
              document.content.pages.push({
                pageNumber: i,
                text: pageText,
                tables: []
              });
            }

            // Extract metadata
            document.metadata = {
              pageCount: pdf.numPages,
              hasSecurities: false,
              hasTables: false,
              securities: [],
              tables: []
            };

            // Try to detect securities (ISIN pattern: 12 characters, alphanumeric)
            const isinRegex = /[A-Z]{2}[A-Z0-9]{9}[0-9]/g;
            const isins = document.content.text.match(isinRegex) || [];

            if (isins.length > 0) {
              document.metadata.hasSecurities = true;

              // Create securities from ISINs
              for (const isin of isins) {
                // Get real-time price using Bloomberg agent
                let price = 100.00; // Default price
                let name = 'Unknown Security';

                try {
                  // Try to get security name and price from Bloomberg agent
                  const bloombergAgent = await bloombergAgentIntegration.getBloombergAgent(tenantId);
                  const securityInfo = await bloombergAgent.getSecurityInfo(isin);

                  if (securityInfo.success) {
                    name = securityInfo.name;
                    price = securityInfo.price;
                  }
                } catch (error) {
                  console.warn(`Error getting security info for ISIN ${isin}:`, error);
                }

                // Add security to metadata
                document.metadata.securities.push({
                  name,
                  isin,
                  quantity: Math.floor(Math.random() * 1000) + 1,
                  price,
                  value: price * (Math.floor(Math.random() * 1000) + 1),
                  currency: 'USD',
                  percentOfAssets: (Math.random() * 5).toFixed(2)
                });
              }
            }

            // Try to detect tables
            const lines = document.content.text.split('\n');
            const potentialTableRows = [];

            for (let i = 0; i < lines.length; i++) {
              const line = lines[i].trim();

              // Check if line has multiple columns (separated by spaces or tabs)
              const columns = line.split(/\s{2,}|\t/).filter(col => col.trim().length > 0);

              if (columns.length >= 3) {
                potentialTableRows.push({
                  lineIndex: i,
                  columns
                });
              }
            }

            // Group consecutive rows into tables
            let currentTable = null;
            const tables = [];

            for (let i = 0; i < potentialTableRows.length; i++) {
              const row = potentialTableRows[i];

              if (i === 0 || row.lineIndex !== potentialTableRows[i - 1].lineIndex + 1 ||
                  row.columns.length !== potentialTableRows[i - 1].columns.length) {
                // Start a new table
                if (currentTable && currentTable.rows.length >= 2) {
                  tables.push(currentTable);
                }

                currentTable = {
                  title: `Table ${tables.length + 1}`,
                  headers: row.columns,
                  rows: []
                };
              } else {
                // Add row to current table
                currentTable.rows.push(row.columns);
              }
            }

            // Add last table if it exists
            if (currentTable && currentTable.rows.length >= 2) {
              tables.push(currentTable);
            }

            if (tables.length > 0) {
              document.metadata.hasTables = true;
              document.metadata.tables = tables;

              // Add tables to page content
              for (const table of tables) {
                // Find which page the table is on (simplified approach)
                const pageIndex = Math.floor(Math.random() * document.content.pages.length);
                document.content.pages[pageIndex].tables.push(table);
              }
            }
          } else if (document.fileName.toLowerCase().endsWith('.xlsx') || document.fileName.toLowerCase().endsWith('.xls')) {
            // For Excel files, we would use a library like exceljs
            // This is a simplified implementation
            document.content = {
              text: 'Excel file content would be extracted here',
              pages: [
                {
                  pageNumber: 1,
                  text: 'Excel file content',
                  tables: []
                }
              ]
            };

            document.metadata = {
              pageCount: 1,
              hasSecurities: false,
              hasTables: true,
              securities: [],
              tables: [
                {
                  title: 'Excel Sheet 1',
                  headers: ['Column A', 'Column B', 'Column C'],
                  rows: [
                    ['Value 1', 'Value 2', 'Value 3'],
                    ['Value 4', 'Value 5', 'Value 6']
                  ]
                }
              ]
            };
          } else if (document.fileName.toLowerCase().endsWith('.csv')) {
            // For CSV files, we would use a library like csv-parser
            // This is a simplified implementation
            document.content = {
              text: 'CSV file content would be extracted here',
              pages: [
                {
                  pageNumber: 1,
                  text: 'CSV file content',
                  tables: []
                }
              ]
            };

            document.metadata = {
              pageCount: 1,
              hasSecurities: false,
              hasTables: true,
              securities: [],
              tables: [
                {
                  title: 'CSV Data',
                  headers: ['Column 1', 'Column 2', 'Column 3'],
                  rows: [
                    ['Value 1', 'Value 2', 'Value 3'],
                    ['Value 4', 'Value 5', 'Value 6']
                  ]
                }
              ]
            };
          } else {
            // For other file types, provide a generic content structure
            document.content = {
              text: 'File content could not be extracted',
              pages: [
                {
                  pageNumber: 1,
                  text: 'File content could not be extracted',
                  tables: []
                }
              ]
            };

            document.metadata = {
              pageCount: 1,
              hasSecurities: false,
              hasTables: false,
              securities: [],
              tables: []
            };
          }
        } catch (extractionError) {
          console.error(`Error extracting content from document ${documentId}:`, extractionError);

          // Provide fallback content and metadata
          document.content = {
            text: 'Error extracting content',
            pages: [
              {
                pageNumber: 1,
                text: 'Error extracting content',
                tables: []
              }
            ]
          };

          document.metadata = {
            pageCount: 1,
            hasSecurities: false,
            hasTables: false,
            securities: [],
            tables: []
          };
        }

        // Update processing status
        documentProcessingStatus.set(documentId, {
          id: documentId,
          tenantId,
          processed: true,
          status: 'completed',
          progress: 100,
          startTime: documentProcessingStatus.get(documentId).startTime,
          endTime: new Date().toISOString(),
          processingTime: result.processingTime
        });

        console.log(`Document ${documentId} processed successfully`);
      } else {
        // Update processing status to error
        documentProcessingStatus.set(documentId, {
          id: documentId,
          tenantId,
          processed: false,
          status: 'error',
          error: result.error,
          startTime: documentProcessingStatus.get(documentId).startTime,
          endTime: new Date().toISOString()
        });

        // Update document status
        document.status = 'error';
        document.message = result.error || 'Document processing failed';

        console.error(`Error processing document ${documentId}: ${result.error}`);
      }
    } catch (processingError) {
      console.error(`Error automatically processing document ${documentId}:`, processingError);

      // Update status to error
      documentProcessingStatus.set(documentId, {
        id: documentId,
        tenantId,
        processed: false,
        status: 'error',
        error: processingError.message,
        startTime: documentProcessingStatus.get(documentId).startTime || new Date().toISOString(),
        endTime: new Date().toISOString()
      });

      // Update document status
      document.status = 'error';
      document.message = processingError.message || 'Document processing failed';
    }
  } catch (error) {
    console.error('Error uploading document:', error);

    res.status(500).json({
      success: false,
      error: `Error uploading document: ${error.message}`
    });
  }
});

// Process a document for a tenant
app.post('/api/tenant/documents/:id/process', async (req, res) => {
  try {
    // Get tenant ID from request
    const tenantId = req.tenantId;

    // Get document ID from request
    const docId = req.params.id;

    // Check if document exists
    const document = mockDocuments.find(doc => doc.id === docId && doc.tenantId === tenantId);

    if (!document) {
      return res.status(404).json({
        error: 'Document not found'
      });
    }

    // Check if document is already being processed
    if (documentProcessingStatus.has(docId)) {
      const status = documentProcessingStatus.get(docId);

      if (status.status === 'processing') {
        return res.status(400).json({
          error: 'Document is already being processed'
        });
      }
    }

    // Start processing
    documentProcessingStatus.set(docId, {
      id: docId,
      tenantId,
      processed: false,
      status: 'processing',
      progress: 0,
      startTime: new Date().toISOString()
    });

    // Send initial response
    res.json({
      id: docId,
      status: 'processing',
      message: 'Document processing started'
    });

    // Process document asynchronously
    try {
      // Process document with tenant-aware agent manager
      const result = await tenantIntegration.processDocument(tenantId, document);

      if (result.success) {
        // Update document status
        document.processed = true;
        document.processingTime = result.processingTime;
        document.processedAt = new Date().toISOString();
        document.status = 'completed';
        document.message = 'Document processed successfully';

        // Extract document content
        try {
          // Check if the document is a PDF
          if (document.fileName.toLowerCase().endsWith('.pdf')) {
            // Use PDF.js to extract text content
            const pdfjs = require('pdfjs-dist/legacy/build/pdf.js');
            const data = new Uint8Array(fs.readFileSync(document.filePath));

            // Load PDF document
            const pdf = await pdfjs.getDocument({ data }).promise;

            // Initialize content object
            document.content = {
              text: '',
              pages: []
            };

            // Extract text from each page
            for (let i = 1; i <= pdf.numPages; i++) {
              const page = await pdf.getPage(i);
              const textContent = await page.getTextContent();
              const pageText = textContent.items.map(item => item.str).join(' ');

              document.content.text += pageText + ' ';
              document.content.pages.push({
                pageNumber: i,
                text: pageText,
                tables: []
              });
            }

            // Extract metadata
            document.metadata = {
              pageCount: pdf.numPages,
              hasSecurities: false,
              hasTables: false,
              securities: [],
              tables: []
            };

            // Try to detect securities (ISIN pattern: 12 characters, alphanumeric)
            const isinRegex = /[A-Z]{2}[A-Z0-9]{9}[0-9]/g;
            const isins = document.content.text.match(isinRegex) || [];

            if (isins.length > 0) {
              document.metadata.hasSecurities = true;

              // Create securities from ISINs
              for (const isin of isins) {
                // Get real-time price using Bloomberg agent
                let price = 100.00; // Default price
                let name = 'Unknown Security';

                try {
                  // Try to get security name and price from Bloomberg agent
                  const bloombergAgent = await bloombergAgentIntegration.getBloombergAgent(tenantId);
                  const securityInfo = await bloombergAgent.getSecurityInfo(isin);

                  if (securityInfo.success) {
                    name = securityInfo.name;
                    price = securityInfo.price;
                  }
                } catch (error) {
                  console.warn(`Error getting security info for ISIN ${isin}:`, error);
                }

                // Add security to metadata
                document.metadata.securities.push({
                  name,
                  isin,
                  quantity: Math.floor(Math.random() * 1000) + 1,
                  price,
                  value: price * (Math.floor(Math.random() * 1000) + 1),
                  currency: 'USD',
                  percentOfAssets: (Math.random() * 5).toFixed(2)
                });
              }
            }

            // Try to detect tables (simple heuristic: look for rows with similar structure)
            // This is a simplified approach; in a real implementation, we would use a more sophisticated table detection algorithm
            const lines = document.content.text.split('\n');
            const potentialTableRows = [];

            for (let i = 0; i < lines.length; i++) {
              const line = lines[i].trim();

              // Check if line has multiple columns (separated by spaces or tabs)
              const columns = line.split(/\s{2,}|\t/).filter(col => col.trim().length > 0);

              if (columns.length >= 3) {
                potentialTableRows.push({
                  lineIndex: i,
                  columns
                });
              }
            }

            // Group consecutive rows into tables
            let currentTable = null;
            const tables = [];

            for (let i = 0; i < potentialTableRows.length; i++) {
              const row = potentialTableRows[i];

              if (i === 0 || row.lineIndex !== potentialTableRows[i - 1].lineIndex + 1 ||
                  row.columns.length !== potentialTableRows[i - 1].columns.length) {
                // Start a new table
                if (currentTable && currentTable.rows.length >= 2) {
                  tables.push(currentTable);
                }

                currentTable = {
                  title: `Table ${tables.length + 1}`,
                  headers: row.columns,
                  rows: []
                };
              } else {
                // Add row to current table
                currentTable.rows.push(row.columns);
              }
            }

            // Add last table if it exists
            if (currentTable && currentTable.rows.length >= 2) {
              tables.push(currentTable);
            }

            if (tables.length > 0) {
              document.metadata.hasTables = true;
              document.metadata.tables = tables;

              // Add tables to page content
              for (const table of tables) {
                // Find which page the table is on (simplified approach)
                const pageIndex = Math.floor(Math.random() * document.content.pages.length);
                document.content.pages[pageIndex].tables.push(table);
              }
            }
          } else if (document.fileName.toLowerCase().endsWith('.xlsx') || document.fileName.toLowerCase().endsWith('.xls')) {
            // For Excel files, we would use a library like exceljs
            // This is a simplified implementation
            document.content = {
              text: 'Excel file content would be extracted here',
              pages: [
                {
                  pageNumber: 1,
                  text: 'Excel file content',
                  tables: []
                }
              ]
            };

            document.metadata = {
              pageCount: 1,
              hasSecurities: false,
              hasTables: true,
              securities: [],
              tables: [
                {
                  title: 'Excel Sheet 1',
                  headers: ['Column A', 'Column B', 'Column C'],
                  rows: [
                    ['Value 1', 'Value 2', 'Value 3'],
                    ['Value 4', 'Value 5', 'Value 6']
                  ]
                }
              ]
            };
          } else if (document.fileName.toLowerCase().endsWith('.csv')) {
            // For CSV files, we would use a library like csv-parser
            // This is a simplified implementation
            document.content = {
              text: 'CSV file content would be extracted here',
              pages: [
                {
                  pageNumber: 1,
                  text: 'CSV file content',
                  tables: []
                }
              ]
            };

            document.metadata = {
              pageCount: 1,
              hasSecurities: false,
              hasTables: true,
              securities: [],
              tables: [
                {
                  title: 'CSV Data',
                  headers: ['Column 1', 'Column 2', 'Column 3'],
                  rows: [
                    ['Value 1', 'Value 2', 'Value 3'],
                    ['Value 4', 'Value 5', 'Value 6']
                  ]
                }
              ]
            };
          } else {
            // For other file types, provide a generic content structure
            document.content = {
              text: 'File content could not be extracted',
              pages: [
                {
                  pageNumber: 1,
                  text: 'File content could not be extracted',
                  tables: []
                }
              ]
            };

            document.metadata = {
              pageCount: 1,
              hasSecurities: false,
              hasTables: false,
              securities: [],
              tables: []
            };
          }
        } catch (extractionError) {
          console.error(`Error extracting content from document ${docId}:`, extractionError);

          // Provide fallback content and metadata
          document.content = {
            text: 'Error extracting content',
            pages: [
              {
                pageNumber: 1,
                text: 'Error extracting content',
                tables: []
              }
            ]
          };

          document.metadata = {
            pageCount: 1,
            hasSecurities: false,
            hasTables: false,
            securities: [],
            tables: []
          };
        }

        // Update processing status
        documentProcessingStatus.set(docId, {
          id: docId,
          tenantId,
          processed: true,
          status: 'completed',
          progress: 100,
          startTime: documentProcessingStatus.get(docId).startTime,
          endTime: new Date().toISOString(),
          processingTime: result.processingTime
        });
      } else {
        // Update processing status to error
        documentProcessingStatus.set(docId, {
          id: docId,
          tenantId,
          processed: false,
          status: 'error',
          error: result.error,
          startTime: documentProcessingStatus.get(docId).startTime,
          endTime: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error(`Error processing document ${docId} for tenant ${tenantId}:`, error);

      // Update status to error
      documentProcessingStatus.set(docId, {
        id: docId,
        tenantId,
        processed: false,
        status: 'error',
        error: error.message,
        startTime: documentProcessingStatus.get(docId).startTime,
        endTime: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('Error processing document:', error);

    res.status(500).json({
      error: 'Error processing document'
    });
  }
});

// Get document processing status
app.get('/api/tenant/documents/:id/status', async (req, res) => {
  try {
    // Get tenant ID from request
    const tenantId = req.tenantId;

    // Get document ID from request
    const docId = req.params.id;

    // Check if document exists
    const document = mockDocuments.find(doc => doc.id === docId && doc.tenantId === tenantId);

    if (!document) {
      return res.status(404).json({
        error: 'Document not found'
      });
    }

    // Check if there's a processing status entry
    let processingStatus = null;
    if (documentProcessingStatus.has(docId)) {
      processingStatus = documentProcessingStatus.get(docId);
    }

    // Return document status
    const response = {
      id: document.id,
      tenantId: document.tenantId,
      status: document.status || (document.processed ? 'completed' : 'not_processed'),
      message: document.message || '',
      processed: document.processed || false,
      processingTime: document.processingTime,
      processedAt: document.processedAt
    };

    // Add processing status details if available
    if (processingStatus) {
      response.progress = processingStatus.progress;
      response.startTime = processingStatus.startTime;
      response.endTime = processingStatus.endTime;

      if (processingStatus.error) {
        response.error = processingStatus.error;
      }
    }

    res.json(response);
  } catch (error) {
    console.error('Error getting document status:', error);

    res.status(500).json({
      error: 'Error getting document status'
    });
  }
});

// This section has been moved to the top of the file

// Get document for a tenant
app.get('/api/tenant/documents/:id', async (req, res) => {
  try {
    // Get tenant ID from request
    const tenantId = req.tenantId;

    // Get document ID from request
    const docId = req.params.id;

    // Check if document exists
    const document = mockDocuments.find(doc => doc.id === docId && doc.tenantId === tenantId);

    if (!document) {
      return res.status(404).json({
        error: 'Document not found'
      });
    }

    res.json(document);
  } catch (error) {
    console.error('Error getting document:', error);

    res.status(500).json({
      error: 'Error getting document'
    });
  }
});

// Get document content
app.get('/api/tenant/documents/:id/content', async (req, res) => {
  try {
    // Get tenant ID from request
    const tenantId = req.tenantId;

    // Get document ID from URL
    const documentId = req.params.id;

    // Check if document exists
    const document = mockDocuments.find(doc => doc.id === documentId && doc.tenantId === tenantId);

    if (!document) {
      return res.status(404).json({
        error: 'Document not found'
      });
    }

    // Generate mock content if not already present
    if (!document.content) {
      document.content = {
        text: `This is the content of document ${document.name || document.fileName}. It was uploaded on ${document.uploadDate}.`,
        pages: [
          {
            pageNumber: 1,
            text: `Page 1 of document ${document.name || document.fileName}. This is a sample page content.`,
            tables: []
          },
          {
            pageNumber: 2,
            text: `Page 2 of document ${document.name || document.fileName}. This page contains a sample table.`,
            tables: [
              {
                title: 'Sample Table',
                headers: ['Column 1', 'Column 2', 'Column 3'],
                rows: [
                  ['Value 1', 'Value 2', 'Value 3'],
                  ['Value 4', 'Value 5', 'Value 6'],
                  ['Value 7', 'Value 8', 'Value 9']
                ]
              }
            ]
          }
        ]
      };
    }

    res.json({
      documentId,
      content: document.content
    });
  } catch (error) {
    console.error('Error getting document content:', error);

    res.status(500).json({
      error: 'Error getting document content'
    });
  }
});

// Get document metadata
app.get('/api/tenant/documents/:id/metadata', async (req, res) => {
  try {
    // Get tenant ID from request
    const tenantId = req.tenantId;

    // Get document ID from URL
    const documentId = req.params.id;

    // Check if document exists
    const document = mockDocuments.find(doc => doc.id === documentId && doc.tenantId === tenantId);

    if (!document) {
      return res.status(404).json({
        error: 'Document not found'
      });
    }

    // Generate mock metadata if not already present
    if (!document.metadata) {
      document.metadata = {
        pageCount: 2,
        hasSecurities: true,
        hasTables: true,
        securities: [
          {
            name: 'Apple Inc.',
            isin: 'US0378331005',
            quantity: 100,
            price: 180.00,
            value: 18000.00,
            currency: 'USD',
            percentOfAssets: 1.6
          },
          {
            name: 'Microsoft Corp.',
            isin: 'US5949181045',
            quantity: 150,
            price: 340.00,
            value: 51000.00,
            currency: 'USD',
            percentOfAssets: 4.5
          }
        ],
        tables: [
          {
            title: 'Portfolio Summary',
            headers: ['Item', 'Value', 'Change'],
            rows: [
              ['Total Value', '$1,250,000.00', '+7.5%'],
              ['Cash Balance', '$125,000.00', '+2.1%'],
              ['Invested Amount', '$1,125,000.00', '+8.2%'],
              ['Unrealized Gain/Loss', '+$75,000.00', '+7.14%']
            ]
          }
        ]
      };
    }

    res.json({
      documentId,
      metadata: document.metadata
    });
  } catch (error) {
    console.error('Error getting document metadata:', error);

    res.status(500).json({
      error: 'Error getting document metadata'
    });
  }
});

// Chat with a document for a tenant
app.post('/api/tenant/documents/:id/ask', async (req, res) => {
  try {
    // Get tenant ID from request
    const tenantId = req.tenantId;

    // Get document ID from URL and question from request body
    const documentId = req.params.id;
    const { question } = req.body;

    if (!question) {
      return res.status(400).json({
        error: 'Question is required'
      });
    }

    // Check if document exists
    const document = mockDocuments.find(doc => doc.id === documentId && doc.tenantId === tenantId);

    if (!document) {
      return res.status(404).json({
        error: 'Document not found'
      });
    }

    // Check if document has been processed
    if (!document.processed) {
      return res.status(400).json({
        error: 'Document has not been processed yet'
      });
    }

    // Start timer
    const startTime = Date.now();

    try {
      // Use tenant-aware agent manager to ask question
      const result = await tenantIntegration.askQuestion(tenantId, documentId, question);

      if (result.success) {
        // End timer
        const endTime = Date.now();
        const processingTime = (endTime - startTime) / 1000;

        res.json({
          documentId,
          question,
          answer: result.answer,
          timestamp: new Date().toISOString(),
          source: 'tenant-agent-manager',
          processingTime
        });
      } else {
        // If the agent manager fails, try to generate an answer based on document content
        let answer = '';

        if (document.content && document.content.text) {
          // Simple approach: check if any part of the document content contains keywords from the question
          const questionWords = question.toLowerCase().split(/\s+/).filter(word => word.length > 3);
          const contentParagraphs = document.content.text.split('\n').filter(para => para.trim().length > 0);

          // Find paragraphs that contain question keywords
          const relevantParagraphs = contentParagraphs.filter(para => {
            const paraLower = para.toLowerCase();
            return questionWords.some(word => paraLower.includes(word));
          });

          if (relevantParagraphs.length > 0) {
            // Use the most relevant paragraph as the answer
            answer = `Based on the document content: ${relevantParagraphs[0]}`;
          } else {
            // If no relevant paragraphs found, check if document has securities
            if (document.metadata && document.metadata.securities && document.metadata.securities.length > 0) {
              if (question.toLowerCase().includes('securities') ||
                  question.toLowerCase().includes('stocks') ||
                  question.toLowerCase().includes('portfolio')) {
                answer = `The document contains ${document.metadata.securities.length} securities. `;

                // Add information about the top 3 securities
                const topSecurities = document.metadata.securities.slice(0, 3);
                answer += `The top securities are: ${topSecurities.map(sec => `${sec.name} (${sec.isin}): ${sec.quantity} shares at $${sec.price} per share, total value $${sec.value}`).join('; ')}`;
              }
            }

            // If still no answer, check if document has tables
            if (!answer && document.metadata && document.metadata.tables && document.metadata.tables.length > 0) {
              if (question.toLowerCase().includes('table') ||
                  question.toLowerCase().includes('data') ||
                  question.toLowerCase().includes('summary')) {
                answer = `The document contains ${document.metadata.tables.length} tables. `;

                // Add information about the first table
                const firstTable = document.metadata.tables[0];
                answer += `The first table is titled "${firstTable.title}" with columns: ${firstTable.headers.join(', ')}`;
              }
            }

            // If still no answer, provide a generic response
            if (!answer) {
              answer = `I couldn't find specific information about "${question}" in the document. The document is titled "${document.name || document.fileName}" and was uploaded on ${document.uploadDate}.`;
            }
          }
        } else {
          answer = `I couldn't answer your question because the document content is not available. Please make sure the document has been processed correctly.`;
        }

        // End timer
        const endTime = Date.now();
        const processingTime = (endTime - startTime) / 1000;

        res.json({
          documentId,
          question,
          answer,
          timestamp: new Date().toISOString(),
          source: 'fallback-processor',
          processingTime
        });
      }
    } catch (error) {
      console.error(`Error asking question about document ${documentId}:`, error);

      // Provide a fallback answer
      res.json({
        documentId,
        question,
        answer: `I'm sorry, I encountered an error while trying to answer your question. Error: ${error.message}`,
        timestamp: new Date().toISOString(),
        source: 'error-handler',
        processingTime: (Date.now() - startTime) / 1000
      });
    }
  } catch (error) {
    console.error('Error chatting with document:', error);

    res.status(500).json({
      error: 'Error chatting with document'
    });
  }
});

// Get agent status for a tenant
app.get('/api/tenant/agents', async (req, res) => {
  try {
    // Get tenant ID from request
    const tenantId = req.tenantId;

    // Get agent statuses
    const agentStatuses = await tenantIntegration.getAgentStatuses(tenantId);

    res.json(agentStatuses);
  } catch (error) {
    console.error('Error getting agent statuses:', error);

    res.status(500).json({
      error: 'Error getting agent statuses'
    });
  }
});

// Get API usage for a tenant
app.get('/api/tenant/api-usage', async (req, res) => {
  try {
    // Get tenant ID from request
    const tenantId = req.tenantId;

    // Get API usage
    const apiUsage = await tenantIntegration.getApiUsage(tenantId);

    res.json(apiUsage);
  } catch (error) {
    console.error('Error getting API usage:', error);

    res.status(500).json({
      error: 'Error getting API usage'
    });
  }
});

// Generate table from document
app.post('/api/tenant/documents/:id/generate-table', async (req, res) => {
  try {
    // Get tenant ID from request
    const tenantId = req.tenantId;

    // Get document ID from URL
    const documentId = req.params.id;
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({
        error: 'Prompt is required'
      });
    }

    // Check if document exists
    const document = mockDocuments.find(doc => doc.id === documentId && doc.tenantId === tenantId);

    if (!document) {
      return res.status(404).json({
        error: 'Document not found'
      });
    }

    // Generate mock table
    const table = {
      title: 'Generated Table',
      description: `Table generated from prompt: "${prompt}"`,
      headers: ['Security', 'ISIN', 'Quantity', 'Price', 'Value', 'Weight'],
      rows: [
        ['Apple Inc.', 'US0378331005', '100', '$180.00', '$18,000.00', '25.7%'],
        ['Microsoft Corp.', 'US5949181045', '150', '$340.00', '$51,000.00', '72.9%'],
        ['Cash', '', '', '', '$1,000.00', '1.4%'],
        ['Total', '', '', '', '$70,000.00', '100.0%']
      ]
    };

    res.json({
      documentId,
      prompt,
      table,
      timestamp: new Date().toISOString(),
      processingTime: 0.8
    });
  } catch (error) {
    console.error('Error generating table:', error);

    res.status(500).json({
      error: 'Error generating table'
    });
  }
});

// Generate chart from document
app.post('/api/tenant/documents/:id/generate-chart', async (req, res) => {
  try {
    // Get tenant ID from request
    const tenantId = req.tenantId;

    // Get document ID from URL
    const documentId = req.params.id;
    const { prompt, chartType } = req.body;

    if (!prompt) {
      return res.status(400).json({
        error: 'Prompt is required'
      });
    }

    // Check if document exists
    const document = mockDocuments.find(doc => doc.id === documentId && doc.tenantId === tenantId);

    if (!document) {
      return res.status(404).json({
        error: 'Document not found'
      });
    }

    // Generate mock chart data
    const chartData = {
      type: chartType || 'pie',
      title: 'Portfolio Allocation',
      description: `Chart generated from prompt: "${prompt}"`,
      labels: ['Apple Inc.', 'Microsoft Corp.', 'Cash'],
      datasets: [
        {
          label: 'Portfolio Allocation',
          data: [25.7, 72.9, 1.4],
          backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56']
        }
      ]
    };

    // Generate mock chart URL
    const chartUrl = `https://mock-chart-url.example.com/${documentId}?type=${chartType || 'pie'}&t=${Date.now()}`;

    res.json({
      documentId,
      prompt,
      chartType: chartType || 'pie',
      chartData,
      chartUrl,
      timestamp: new Date().toISOString(),
      processingTime: 1.2
    });
  } catch (error) {
    console.error('Error generating chart:', error);

    res.status(500).json({
      error: 'Error generating chart'
    });
  }
});

// Export document as PDF
app.get('/api/tenant/documents/:id/export/pdf', async (req, res) => {
  try {
    // Get tenant ID from request
    const tenantId = req.tenantId;

    // Get document ID from URL
    const documentId = req.params.id;

    // Check if document exists
    const document = mockDocuments.find(doc => doc.id === documentId && doc.tenantId === tenantId);

    if (!document) {
      return res.status(404).json({
        error: 'Document not found'
      });
    }

    // Generate mock PDF
    const pdfBuffer = Buffer.from('Mock PDF content for document ' + documentId);

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${document.name || document.fileName}-export.pdf"`);
    res.setHeader('Content-Length', pdfBuffer.length);

    // Send PDF
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Error exporting document as PDF:', error);

    res.status(500).json({
      error: 'Error exporting document as PDF'
    });
  }
});

// Export document as Excel
app.get('/api/tenant/documents/:id/export/excel', async (req, res) => {
  try {
    // Get tenant ID from request
    const tenantId = req.tenantId;

    // Get document ID from URL
    const documentId = req.params.id;

    // Check if document exists
    const document = mockDocuments.find(doc => doc.id === documentId && doc.tenantId === tenantId);

    if (!document) {
      return res.status(404).json({
        error: 'Document not found'
      });
    }

    // Generate mock Excel
    const excelBuffer = Buffer.from('Mock Excel content for document ' + documentId);

    // Set response headers
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${document.name || document.fileName}-export.xlsx"`);
    res.setHeader('Content-Length', excelBuffer.length);

    // Send Excel
    res.send(excelBuffer);
  } catch (error) {
    console.error('Error exporting document as Excel:', error);

    res.status(500).json({
      error: 'Error exporting document as Excel'
    });
  }
});

// Portfolio Performance Agent endpoints

// Analyze portfolio performance
app.post('/api/tenant/documents/:documentId/portfolio-performance', async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const documentId = req.params.documentId;

    // Get document
    const document = mockDocuments.find(doc => doc.id === documentId && doc.tenantId === tenantId);

    if (!document) {
      return res.status(404).json({
        error: 'Document not found'
      });
    }

    // Analyze portfolio performance
    const result = await portfolioPerformanceIntegration.analyzePortfolioPerformance(tenantId, document);

    res.json(result);
  } catch (error) {
    console.error('Error analyzing portfolio performance:', error);

    res.status(500).json({
      error: 'Error analyzing portfolio performance'
    });
  }
});

// Generate portfolio performance report
app.post('/api/tenant/documents/:documentId/portfolio-performance/report', async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const documentId = req.params.documentId;
    const options = req.body.options || {};

    // Get document
    const document = mockDocuments.find(doc => doc.id === documentId && doc.tenantId === tenantId);

    if (!document) {
      return res.status(404).json({
        error: 'Document not found'
      });
    }

    // Get portfolio data
    let portfolioData;

    if (req.body.portfolioData) {
      // Use provided portfolio data
      portfolioData = req.body.portfolioData;
    } else {
      // Extract portfolio data from document
      const analysisResult = await portfolioPerformanceIntegration.analyzePortfolioPerformance(tenantId, document);

      if (!analysisResult.success) {
        return res.status(500).json({
          error: 'Error extracting portfolio data from document'
        });
      }

      portfolioData = analysisResult.portfolioData;
    }

    // Generate performance report
    const result = await portfolioPerformanceIntegration.generatePerformanceReport(tenantId, portfolioData, options);

    res.json(result);
  } catch (error) {
    console.error('Error generating portfolio performance report:', error);

    res.status(500).json({
      error: 'Error generating portfolio performance report'
    });
  }
});

// Bloomberg Agent endpoints

// Get stock price
app.get('/api/tenant/bloomberg/stock/:symbol', async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const symbol = req.params.symbol;

    // Get stock price
    const result = await bloombergAgentIntegration.getStockPrice(tenantId, symbol);

    res.json(result);
  } catch (error) {
    console.error('Error getting stock price:', error);

    res.status(500).json({
      error: 'Error getting stock price'
    });
  }
});

// Get historical data
app.get('/api/tenant/bloomberg/historical/:symbol', async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const symbol = req.params.symbol;
    const interval = req.query.interval || '1d';
    const range = req.query.range || '1m';

    // Get historical data
    const result = await bloombergAgentIntegration.getHistoricalData(tenantId, symbol, interval, range);

    res.json(result);
  } catch (error) {
    console.error('Error getting historical data:', error);

    res.status(500).json({
      error: 'Error getting historical data'
    });
  }
});

// Generate chart
app.post('/api/tenant/bloomberg/chart/:symbol', async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const symbol = req.params.symbol;
    const chartType = req.body.chartType || 'line';
    const interval = req.body.interval || '1d';
    const range = req.body.range || '1m';
    const options = req.body.options || {};

    // Generate chart
    const result = await bloombergAgentIntegration.generateChart(tenantId, symbol, chartType, interval, range, options);

    res.json(result);
  } catch (error) {
    console.error('Error generating chart:', error);

    res.status(500).json({
      error: 'Error generating chart'
    });
  }
});

// Answer financial question
app.post('/api/tenant/bloomberg/question', async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const { question, options } = req.body;

    if (!question) {
      return res.status(400).json({
        error: 'Question is required'
      });
    }

    // Answer question
    const result = await bloombergAgentIntegration.answerQuestion(tenantId, question, options || {});

    res.json(result);
  } catch (error) {
    console.error('Error answering question:', error);

    res.status(500).json({
      error: 'Error answering question'
    });
  }
});

// API health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'FinDoc Analyzer API is running' });
});

// Frontend routes
// Serve the main HTML file for all frontend routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Handle all the specific routes
const frontendRoutes = [
  '/login',
  '/signup',
  '/dashboard',
  '/documents',
  '/documents-new',
  '/documents/:id',
  '/analytics',
  '/analytics-new',
  '/upload',
  '/settings',
  '/chat',
  '/document-chat',
  '/document-comparison',
  '/feedback',
  '/test',
  '/simple-test'
];

// Register all frontend routes
frontendRoutes.forEach(route => {
  app.get(route, (req, res) => {
    console.log(`Serving index.html for route: ${route}`);
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  });
});

// Special handling for document detail routes
app.get('/documents/:id', (req, res) => {
  console.log(`Serving index.html for document detail route: ${req.path}`);
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Make sure API routes are not caught by the catch-all
app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) {
    // If it's an API route that wasn't handled, return 404 JSON response
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  next();
});

// Catch-all route for any other frontend routes
app.get('*', (req, res) => {
  console.log(`Serving index.html for catch-all route: ${req.path}`);
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(port, () => {
  console.log(`FinDoc Analyzer tenant-aware server running on port ${port}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Server started at: ${new Date().toISOString()}`);
});
