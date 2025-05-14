/**
 * PDF Processing Server
 * 
 * Simple server for testing PDF processing functionality
 */

const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const bodyParser = require('body-parser');
const pdfProcessor = require('./services/pdf-processor');
const mcpDocumentProcessor = require('./services/mcp-document-processor');
const entityExtractor = require('./services/entity-extractor');
const { v4: uuidv4 } = require('uuid');

// Create Express app
const app = express();
const port = process.env.PORT || 8080;

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
    // Allow PDF files only
    if (file.mimetype === 'application/pdf' || file.originalname.endsWith('.pdf')) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size
  }
});

// In-memory storage for processed documents
const documents = new Map();

// Routes

// Root route - serve HTML form for testing
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'pdf-processing-ui.html'));
});

// Upload and process PDF
app.post('/api/process-pdf', upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const { path: filePath, originalname } = req.file;
    const useOcr = req.body.useOcr === 'true';
    const documentId = uuidv4();
    
    console.log(`Processing ${originalname} (useOcr: ${useOcr})...`);
    
    // Process with standard processor
    console.log('Using standard processor...');
    const standardResult = await pdfProcessor.processPdf(filePath, { useOcr });
    
    // Process with MCP processor
    console.log('Using MCP processor...');
    const mcpResult = await mcpDocumentProcessor.processDocument(filePath);
    
    // Store results
    const document = {
      id: documentId,
      filename: originalname,
      filePath,
      useOcr,
      standard: standardResult,
      mcp: mcpResult,
      timestamp: new Date().toISOString()
    };
    
    documents.set(documentId, document);
    
    // Prepare response with summary
    const response = {
      id: documentId,
      filename: originalname,
      timestamp: document.timestamp,
      summary: {
        textLength: standardResult.text ? standardResult.text.length : 0,
        tables: {
          standard: standardResult.tables ? standardResult.tables.length : 0,
          mcp: mcpResult.tables ? mcpResult.tables.length : 0
        },
        entities: mcpResult.entities ? mcpResult.entities.length : 0
      }
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error processing PDF:', error);
    res.status(500).json({ error: error.message });
  }
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
    standard: {
      ...document.standard,
      text: document.standard.text ? `${document.standard.text.substring(0, 200)}... (${document.standard.text.length} chars)` : ''
    },
    mcp: {
      ...document.mcp,
      text: document.mcp.text ? `${document.mcp.text.substring(0, 200)}... (${document.mcp.text.length} chars)` : ''
    }
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
    text: document.standard.text || '',
    mcpText: document.mcp.text || ''
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
    tables: document.standard.tables || [],
    mcpTables: document.mcp.tables || []
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
    entities: document.mcp.entities || []
  });
});

// Ask questions about a document
app.post('/api/documents/:id/questions', (req, res) => {
  const { id } = req.params;
  const { question } = req.body;
  
  if (!question) {
    return res.status(400).json({ error: 'Question is required' });
  }
  
  if (!documents.has(id)) {
    return res.status(404).json({ error: 'Document not found' });
  }
  
  const document = documents.get(id);
  
  // Mock answer generation function
  const generateAnswer = (question, document) => {
    const text = document.standard.text || '';
    const entities = document.mcp.entities || [];
    
    // Simple question answering
    if (question.toLowerCase().includes('what is this document about')) {
      return `This appears to be a ${document.filename} containing financial information.`;
    }
    
    if (question.toLowerCase().includes('summary') || question.toLowerCase().includes('summarize')) {
      return `This document contains financial information about various securities and financial metrics. It includes details about portfolio holdings, performance metrics, and market data.`;
    }
    
    if (question.toLowerCase().includes('table')) {
      // Find any tables in the document
      if (document.standard.tables && document.standard.tables.length > 0) {
        const table = document.standard.tables[0];
        
        // Generate markdown table
        let markdown = '| ' + table.headers.join(' | ') + ' |\n';
        markdown += '| ' + table.headers.map(() => '---').join(' | ') + ' |\n';
        
        // Add rows (limit to 5 for display)
        const rowsToShow = table.rows.slice(0, 5);
        for (const row of rowsToShow) {
          markdown += '| ' + row.join(' | ') + ' |\n';
        }
        
        return `Here's a table from the document:\n\n${markdown}`;
      } else {
        return `I couldn't find any tables in this document.`;
      }
    }
    
    // Check for entity-specific questions
    for (const entity of entities) {
      if (entity.name && question.toLowerCase().includes(entity.name.toLowerCase())) {
        if (entity.type === 'security') {
          return `${entity.name} is a security mentioned in the document. ${entity.isin ? `Its ISIN is ${entity.isin}.` : ''} ${entity.marketValue ? `Its market value is ${entity.marketValue}.` : ''}`;
        } else if (entity.type === 'company') {
          return `${entity.name} is a company mentioned in the document.`;
        } else if (entity.type === 'financialMetric') {
          return `The ${entity.name} mentioned in the document is ${entity.value}.`;
        }
      }
    }
    
    // Generic fallback
    return `Based on my analysis of the document, I can see it's a financial document that contains information about securities, financial metrics, and portfolio data. If you have specific questions about the content, please ask.`;
  };
  
  // Generate answer
  const answer = generateAnswer(question, document);
  
  res.json({
    id,
    question,
    answer
  });
});

// Start server
app.listen(port, () => {
  console.log(`PDF Processing Server running at http://localhost:${port}`);
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