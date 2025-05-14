/**
 * Optimized PDF Processing Server
 * 
 * Enhanced server for testing PDF processing functionality with optimizations for timeouts and large files
 */

const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
const util = require('util');
const stream = require('stream');
const pipeline = util.promisify(stream.pipeline);

// Services
const pdfProcessor = require('./services/pdf-processor');
const mcpDocumentProcessor = require('./services/mcp-document-processor');
const entityExtractor = require('./services/entity-extractor');

// Create Express app
const app = express();
const port = process.env.PORT || 8080;

// Setup middleware
app.use(cors());
app.use(bodyParser.json({ limit: '20mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '20mb' }));
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
    if (file.mimetype === 'application/pdf' || file.originalname.toLowerCase().endsWith('.pdf')) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  },
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB max file size
  }
});

// In-memory storage for processed documents
const documents = new Map();

// Create upload directory if it doesn't exist
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Create html file for testing if it doesn't exist
const htmlFilePath = path.join(__dirname, 'public', 'pdf-processing-ui.html');
if (!fs.existsSync(htmlFilePath)) {
  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PDF Processing Test</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }
        .container {
            border: 1px solid #ddd;
            padding: 20px;
            border-radius: 5px;
        }
        .form-group {
            margin-bottom: 15px;
        }
        label {
            display: block;
            margin-bottom: 5px;
        }
        button {
            background-color: #4CAF50;
            color: white;
            padding: 10px 15px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
        }
        button:hover {
            background-color: #45a049;
        }
        #result {
            margin-top: 20px;
            padding: 15px;
            border: 1px solid #ddd;
            border-radius: 5px;
            display: none;
        }
        progress {
            width: 100%;
            margin: 10px 0;
        }
        .document-list {
            margin-top: 20px;
        }
        .document-item {
            padding: 10px;
            border: 1px solid #ddd;
            margin-bottom: 10px;
            border-radius: 5px;
        }
        .question-form {
            margin-top: 15px;
            display: none;
        }
    </style>
</head>
<body>
    <h1>PDF Processing Test</h1>
    
    <div class="container">
        <h2>Upload and Process PDF</h2>
        <form id="uploadForm" enctype="multipart/form-data">
            <div class="form-group">
                <label for="pdfFile">Select PDF File:</label>
                <input type="file" id="pdfFile" name="pdf" accept=".pdf" required>
            </div>
            <div class="form-group">
                <label>
                    <input type="checkbox" id="useOcr" name="useOcr" value="true">
                    Use OCR (for scanned PDFs)
                </label>
            </div>
            <button type="submit">Upload and Process</button>
        </form>
        
        <div id="progress-container" style="display: none;">
            <h3>Processing...</h3>
            <progress id="progress-bar"></progress>
        </div>
        
        <div id="result">
            <h3>Processing Result</h3>
            <pre id="resultContent"></pre>
            
            <div class="question-form">
                <h3>Ask a Question</h3>
                <div class="form-group">
                    <label for="question">Your Question:</label>
                    <input type="text" id="question" style="width: 100%;" placeholder="What is this document about?">
                </div>
                <button type="button" id="askButton">Ask</button>
                <div id="answer-container" style="margin-top: 15px; display: none;">
                    <h4>Answer</h4>
                    <div id="answer"></div>
                </div>
            </div>
        </div>
    </div>
    
    <div class="document-list">
        <h2>Processed Documents</h2>
        <div id="documentsList"></div>
    </div>
    
    <script>
        // Upload form submission
        document.getElementById('uploadForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(e.target);
            const progressContainer = document.getElementById('progress-container');
            const progressBar = document.getElementById('progress-bar');
            
            // Show progress
            progressContainer.style.display = 'block';
            progressBar.removeAttribute('value');
            
            try {
                const response = await fetch('/api/process-pdf', {
                    method: 'POST',
                    body: formData
                });
                
                if (!response.ok) {
                    throw new Error('Error processing PDF');
                }
                
                const data = await response.json();
                
                // Show result
                document.getElementById('result').style.display = 'block';
                document.getElementById('resultContent').textContent = JSON.stringify(data, null, 2);
                document.querySelector('.question-form').style.display = 'block';
                document.getElementById('askButton').dataset.documentId = data.id;
                
                // Hide progress
                progressContainer.style.display = 'none';
                
                // Refresh document list
                loadDocuments();
            } catch (error) {
                console.error('Error:', error);
                alert('Error processing PDF: ' + error.message);
                progressContainer.style.display = 'none';
            }
        });
        
        // Ask question
        document.getElementById('askButton').addEventListener('click', async () => {
            const questionInput = document.getElementById('question');
            const question = questionInput.value.trim();
            const documentId = document.getElementById('askButton').dataset.documentId;
            
            if (!question) {
                alert('Please enter a question');
                return;
            }
            
            try {
                const response = await fetch(\`/api/documents/\${documentId}/questions\`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ question })
                });
                
                if (!response.ok) {
                    throw new Error('Error asking question');
                }
                
                const data = await response.json();
                
                // Show answer
                document.getElementById('answer-container').style.display = 'block';
                document.getElementById('answer').textContent = data.answer;
            } catch (error) {
                console.error('Error:', error);
                alert('Error asking question: ' + error.message);
            }
        });
        
        // Load documents
        async function loadDocuments() {
            try {
                const response = await fetch('/api/documents');
                
                if (!response.ok) {
                    throw new Error('Error loading documents');
                }
                
                const data = await response.json();
                const documentsList = document.getElementById('documentsList');
                
                if (data.length === 0) {
                    documentsList.innerHTML = '<p>No documents processed yet</p>';
                    return;
                }
                
                documentsList.innerHTML = '';
                
                data.forEach(doc => {
                    const docItem = document.createElement('div');
                    docItem.className = 'document-item';
                    
                    docItem.innerHTML = \`
                        <h3>\${doc.filename}</h3>
                        <p><strong>Processed:</strong> \${new Date(doc.timestamp).toLocaleString()}</p>
                        <p><strong>ID:</strong> \${doc.id}</p>
                        <p><strong>Text Length:</strong> \${doc.textLength} characters</p>
                        <p>
                            <button class="view-tables-btn" data-id="\${doc.id}">View Tables</button>
                            <button class="view-entities-btn" data-id="\${doc.id}">View Entities</button>
                            <button class="ask-question-btn" data-id="\${doc.id}">Ask Questions</button>
                        </p>
                    \`;
                    
                    documentsList.appendChild(docItem);
                });
                
                // Add event listeners to buttons
                document.querySelectorAll('.view-tables-btn').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const id = e.target.dataset.id;
                        window.open(\`/api/documents/\${id}/tables\`, '_blank');
                    });
                });
                
                document.querySelectorAll('.view-entities-btn').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const id = e.target.dataset.id;
                        window.open(\`/api/documents/\${id}/entities\`, '_blank');
                    });
                });
                
                document.querySelectorAll('.ask-question-btn').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const id = e.target.dataset.id;
                        document.getElementById('result').style.display = 'block';
                        document.querySelector('.question-form').style.display = 'block';
                        document.getElementById('askButton').dataset.documentId = id;
                        document.getElementById('question').focus();
                        
                        // Scroll to question form
                        document.querySelector('.question-form').scrollIntoView({ behavior: 'smooth' });
                    });
                });
            } catch (error) {
                console.error('Error:', error);
            }
        }
        
        // Initial load
        window.addEventListener('load', loadDocuments);
    </script>
</body>
</html>
  `;
  
  fs.writeFileSync(htmlFilePath, htmlContent);
  console.log(`Created test UI file at ${htmlFilePath}`);
}

// Routes

// Root route - serve HTML form for testing
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'pdf-processing-ui.html'));
});

// Get all documents
app.get('/api/documents', (req, res) => {
  // Create an array of simplified document summaries
  const documentList = Array.from(documents.values()).map(doc => ({
    id: doc.id,
    filename: doc.filename,
    timestamp: doc.timestamp,
    textLength: doc.standard?.textLength || 0,
    tableCount: doc.standard?.tableCount || 0,
    entityCount: doc.mcp?.entityCount || 0
  }));
  
  res.json(documentList);
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
    
    // Get file size
    const stats = fs.statSync(filePath);
    const fileSizeMB = stats.size / (1024 * 1024);
    console.log(`File size: ${fileSizeMB.toFixed(2)} MB`);
    
    // Set timeout based on file size (larger files need more time)
    const timeoutMs = Math.max(30000, Math.min(300000, stats.size / 50)); // 30s to 5min
    
    // Process with standard processor (with timeout)
    console.log(`Using standard processor (timeout: ${timeoutMs/1000}s)...`);
    const standardProcessingPromise = new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error('Standard processing timed out'));
      }, timeoutMs);
      
      pdfProcessor.processPdf(filePath, { useOcr })
        .then(result => {
          clearTimeout(timer);
          resolve(result);
        })
        .catch(error => {
          clearTimeout(timer);
          reject(error);
        });
    }).catch(error => {
      console.warn(`Standard processing error: ${error.message}`);
      return { 
        text: `Error: ${error.message}`, 
        tables: [], 
        metadata: { title: originalname } 
      };
    });
    
    // Process with MCP processor (with timeout)
    console.log(`Using MCP processor (timeout: ${timeoutMs/1000}s)...`);
    const mcpProcessingPromise = new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error('MCP processing timed out'));
      }, timeoutMs);
      
      mcpDocumentProcessor.processDocument(filePath)
        .then(result => {
          clearTimeout(timer);
          resolve(result);
        })
        .catch(error => {
          clearTimeout(timer);
          reject(error);
        });
    }).catch(error => {
      console.warn(`MCP processing error: ${error.message}`);
      return { 
        text: `Error: ${error.message}`, 
        tables: [], 
        entities: [],
        metadata: { title: originalname } 
      };
    });
    
    // Wait for both processes to complete
    const [standardResult, mcpResult] = await Promise.all([
      standardProcessingPromise,
      mcpProcessingPromise
    ]);
    
    // Extract basic entities if MCP entities are not available
    let entities = mcpResult.entities || [];
    if (entities.length === 0 && standardResult.text) {
      try {
        const extractedEntities = await entityExtractor.extractBasicFinancialEntities(standardResult.text);
        console.log(`Extracted ${extractedEntities.length} entities using entity-extractor service`);
        entities = extractedEntities;
      } catch (extractionError) {
        console.warn(`Error using entity-extractor service: ${extractionError.message}`);
      }
    }
    
    // Create a summarized version for storage (to avoid memory issues)
    const summarizedStandardResult = summarizeResult(standardResult);
    const summarizedMcpResult = summarizeResult({
      ...mcpResult,
      entities
    });
    
    // Store results
    const document = {
      id: documentId,
      filename: originalname,
      filePath,
      useOcr,
      fileSize: fileSizeMB.toFixed(2) + ' MB',
      standard: summarizedStandardResult,
      mcp: summarizedMcpResult,
      timestamp: new Date().toISOString()
    };
    
    documents.set(documentId, document);
    
    // Prepare response with summary
    const response = {
      id: documentId,
      filename: originalname,
      timestamp: document.timestamp,
      textLength: standardResult.text ? standardResult.text.length : 0,
      summary: {
        tables: {
          standard: standardResult.tables ? standardResult.tables.length : 0,
          mcp: mcpResult.tables ? mcpResult.tables.length : 0
        },
        entities: entities ? entities.length : 0,
        metadata: {
          title: standardResult.metadata?.title || originalname,
          pages: standardResult.metadata?.pages || 0
        }
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
      text: document.standard.text ? truncateText(document.standard.text, 200) : ''
    },
    mcp: {
      ...document.mcp,
      text: document.mcp.text ? truncateText(document.mcp.text, 200) : ''
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
    tables: document.standard.tableSample ? [document.standard.tableSample] : [],
    mcpTables: document.mcp.tableSample ? [document.mcp.tableSample] : []
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
    entities: document.mcp.entitySamples || []
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
  
  // Generate answer
  const answer = generateAnswer(question, document);
  
  res.json({
    id,
    question,
    answer
  });
});

// Helper functions

// Summarize results to reduce memory usage
function summarizeResult(result) {
  try {
    // Create a copy with summarized text
    const summarized = { ...result };
    
    // Summarize text (only keep first and last 1000 chars)
    if (summarized.text && typeof summarized.text === 'string') {
      const textLength = summarized.text.length;
      if (textLength > 2000) {
        summarized.text = 
          summarized.text.substring(0, 1000) + 
          `\n... [${textLength - 2000} characters omitted] ...\n` + 
          summarized.text.substring(textLength - 1000);
      }
      summarized.textLength = textLength;
    }
    
    // Keep only summary of tables
    if (Array.isArray(summarized.tables)) {
      summarized.tableCount = summarized.tables.length;
      // Only keep first table as sample
      if (summarized.tables.length > 0) {
        summarized.tableSample = summarized.tables[0];
      }
      delete summarized.tables;
    }
    
    // Keep only summary of entities
    if (Array.isArray(summarized.entities)) {
      summarized.entityCount = summarized.entities.length;
      // Only keep first 5 entities as samples
      if (summarized.entities.length > 0) {
        summarized.entitySamples = summarized.entities.slice(0, 5);
      }
      delete summarized.entities;
    }
    
    return summarized;
  } catch (error) {
    console.warn(`Error summarizing result: ${error.message}`);
    return result;
  }
}

// Truncate text with ellipsis
function truncateText(text, maxLength) {
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}... (${text.length} chars)`;
}

// Generate an answer to a question about a document
function generateAnswer(question, document) {
  const text = document.standard.text || '';
  const entities = document.mcp.entitySamples || [];
  
  // Simple question answering
  if (question.toLowerCase().includes('what is this document about')) {
    return `This appears to be a ${document.filename} containing financial information.`;
  }
  
  if (question.toLowerCase().includes('summary') || question.toLowerCase().includes('summarize')) {
    return `This document contains financial information about various securities and financial metrics. It includes details about portfolio holdings, performance metrics, and market data.`;
  }
  
  if (question.toLowerCase().includes('table')) {
    // Find any tables in the document
    if (document.standard.tableSample) {
      const table = document.standard.tableSample;
      
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
}

// Start server
app.listen(port, () => {
  console.log(`\n\n========================================`);
  console.log(`PDF Processing Server running at http://localhost:${port}`);
  console.log(`Open your browser to http://localhost:${port} to test PDF processing`);
  console.log(`========================================\n`);
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