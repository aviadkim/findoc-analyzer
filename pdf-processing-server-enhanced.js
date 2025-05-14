/**
 * Enhanced PDF Processing Server
 * 
 * Improved server for testing PDF processing functionality with enhanced text extraction,
 * entity recognition, and question answering capabilities.
 */

const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');

// Import enhanced services
const enhancedPdfProcessor = require('./services/enhanced-pdf-processor');
const mcpDocumentProcessor = require('./services/mcp-document-processor');
const entityExtractor = require('./services/entity-extractor');
const enhancedChatService = require('./services/enhanced-chat-service');

// Create Express app
const app = express();
const port = process.env.PORT || 8081; // Using port 8081 to avoid conflict with existing server

// Setup middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    // Allow PDF files and Excel files
    const allowedMimeTypes = [
      'application/pdf', 
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv'
    ];
    
    const allowedExtensions = ['.pdf', '.xls', '.xlsx', '.csv'];
    const fileExt = path.extname(file.originalname).toLowerCase();
    
    if (allowedMimeTypes.includes(file.mimetype) || allowedExtensions.includes(fileExt)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, Excel, and CSV files are allowed'));
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size
  }
});

// In-memory storage for processed documents
const documents = new Map();

// Keep track of document processing status
const processingStatus = new Map();

// Routes

// Root route - serve HTML form for testing
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'pdf-processing-ui.html'));
});

// Upload and process document
app.post('/api/process-pdf', upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const { path: filePath, originalname } = req.file;
    const useOcr = req.body.useOcr === 'true';
    const documentId = uuidv4();
    
    console.log(`Processing ${originalname} (useOcr: ${useOcr})...`);
    
    // Set processing status
    processingStatus.set(documentId, {
      status: 'processing',
      progress: 0,
      stage: 'Initializing'
    });
    
    // Return initial response right away
    res.json({
      id: documentId,
      filename: originalname,
      status: 'processing',
      message: 'Processing started'
    });
    
    // Process document in background
    processDocumentAsync(documentId, filePath, originalname, useOcr);
  } catch (error) {
    console.error('Error processing document:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get document processing status
app.get('/api/documents/:id/status', (req, res) => {
  const { id } = req.params;
  
  if (!processingStatus.has(id)) {
    return res.status(404).json({ error: 'Document not found' });
  }
  
  res.json(processingStatus.get(id));
});

// Get all documents
app.get('/api/documents', (req, res) => {
  const documentList = [];
  
  documents.forEach((doc, id) => {
    documentList.push({
      id,
      filename: doc.filename,
      timestamp: doc.timestamp,
      textLength: doc.standard?.text?.length || 0,
      tableCount: (doc.standard?.tables?.length || 0) + (doc.mcp?.tables?.length || 0),
      entityCount: doc.mcp?.entities?.length || 0
    });
  });
  
  // Sort by timestamp (newest first)
  documentList.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  
  res.json(documentList);
});

// Get document details
app.get('/api/documents/:id', (req, res) => {
  const { id } = req.params;
  
  if (!documents.has(id)) {
    return res.status(404).json({ error: 'Document not found' });
  }
  
  const document = documents.get(id);
  
  // Remove full text from response to reduce payload size
  const response = {
    ...document,
    standard: document.standard ? {
      ...document.standard,
      text: document.standard.text ? `${document.standard.text.substring(0, 200)}... (${document.standard.text.length} chars)` : ''
    } : null,
    mcp: document.mcp ? {
      ...document.mcp,
      text: document.mcp.text ? `${document.mcp.text.substring(0, 200)}... (${document.mcp.text.length} chars)` : ''
    } : null,
    enhanced: document.enhanced ? {
      ...document.enhanced,
      text: document.enhanced.text ? `${document.enhanced.text.substring(0, 200)}... (${document.enhanced.text.length} chars)` : ''
    } : null
  };
  
  res.json(response);
});

// Get document text
app.get('/api/documents/:id/text', (req, res) => {
  const { id } = req.params;
  
  if (!documents.has(id)) {
    return res.status(404).json({ error: 'Document not found' });
  }
  
  const document = documents.get(id);
  
  res.json({
    id,
    filename: document.filename,
    text: document.enhanced?.text || document.standard?.text || document.mcp?.text || ''
  });
});

// Get document tables
app.get('/api/documents/:id/tables', (req, res) => {
  const { id } = req.params;
  
  if (!documents.has(id)) {
    return res.status(404).json({ error: 'Document not found' });
  }
  
  const document = documents.get(id);
  
  res.json({
    id,
    filename: document.filename,
    tables: document.enhanced?.tables || document.standard?.tables || [],
    mcpTables: document.mcp?.tables || []
  });
});

// Get document entities
app.get('/api/documents/:id/entities', (req, res) => {
  const { id } = req.params;
  
  if (!documents.has(id)) {
    return res.status(404).json({ error: 'Document not found' });
  }
  
  const document = documents.get(id);
  
  res.json({
    id,
    filename: document.filename,
    entities: document.enhanced?.entities || document.mcp?.entities || []
  });
});

// Ask questions about a document
app.post('/api/documents/:id/questions', async (req, res) => {
  const { id } = req.params;
  const { question } = req.body;
  
  if (!question) {
    return res.status(400).json({ error: 'Question is required' });
  }
  
  if (!documents.has(id)) {
    return res.status(404).json({ error: 'Document not found' });
  }
  
  const document = documents.get(id);
  
  try {
    // Use enhanced chat service for better answers
    const answer = await enhancedChatService.generateEnhancedAnswer(
      question, 
      document.enhanced || document.mcp || document.standard || {}
    );
    
    res.json({
      id,
      question,
      answer
    });
  } catch (error) {
    console.error('Error generating answer:', error);
    res.status(500).json({ error: 'Error generating answer' });
  }
});

// Process document asynchronously
async function processDocumentAsync(documentId, filePath, originalname, useOcr) {
  try {
    // Update status
    updateProcessingStatus(documentId, 'processing', 10, 'Processing with standard extractor');
    
    // Process with standard processor
    console.log('Using standard processor...');
    const standardResult = await enhancedPdfProcessor.processEnhancedPdf(filePath, { 
      useOcr,
      extractEntities: false,  // Will do entity extraction later
      extractTables: true
    });
    
    updateProcessingStatus(documentId, 'processing', 30, 'Processing with MCP processor');
    
    // Process with MCP processor
    console.log('Using MCP processor...');
    const mcpResult = await mcpDocumentProcessor.processDocument(filePath);
    
    updateProcessingStatus(documentId, 'processing', 60, 'Extracting and enriching entities');
    
    // Create enhanced result with improved text and entities
    const enhancedResult = {
      text: standardResult.text || mcpResult.text || '',
      tables: standardResult.tables || mcpResult.tables || [],
      metadata: standardResult.metadata || mcpResult.metadata || {},
      entities: mcpResult.entities || []
    };
    
    // If enhanced result has no entities, extract them
    if (!enhancedResult.entities || enhancedResult.entities.length === 0) {
      console.log('Extracting entities...');
      enhancedResult.entities = await entityExtractor.extractEntities(enhancedResult.text, enhancedResult.tables);
    }
    
    updateProcessingStatus(documentId, 'processing', 90, 'Finalizing document processing');
    
    // Store results
    const document = {
      id: documentId,
      filename: originalname,
      filePath,
      useOcr,
      standard: standardResult,
      mcp: mcpResult,
      enhanced: enhancedResult,
      timestamp: new Date().toISOString()
    };
    
    documents.set(documentId, document);
    
    // Update status to complete
    updateProcessingStatus(documentId, 'complete', 100, 'Processing complete');
    
    console.log(`Document ${documentId} processing completed`);
  } catch (error) {
    console.error(`Error processing document ${documentId}:`, error);
    updateProcessingStatus(documentId, 'error', 0, `Error: ${error.message}`);
  }
}

// Update processing status
function updateProcessingStatus(documentId, status, progress, stage) {
  processingStatus.set(documentId, {
    status,
    progress,
    stage,
    timestamp: new Date().toISOString()
  });
}

// Start server
app.listen(port, () => {
  console.log(`Enhanced PDF Processing Server running at http://localhost:${port}`);
  console.log(`Open your browser to http://localhost:${port} to test PDF processing`);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down server...');
  
  // Clean up uploaded files
  const uploadDir = path.join(__dirname, 'uploads');
  if (fs.existsSync(uploadDir)) {
    fs.readdirSync(uploadDir).forEach(file => {
      fs.unlinkSync(path.join(uploadDir, file));
    });
  }
  
  process.exit(0);
});