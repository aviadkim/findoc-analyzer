const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const uuid = require('uuid').v4;
const multer = require('multer');
const apiKeyManager = require('./api-key-manager');
const agentManager = require('./agent-manager');

// Create Express app
const app = express();
const port = process.env.PORT || 8080;

// Enhanced startup logging
console.log(`FinDoc Analyzer starting with ENV:
- NODE_ENV: ${process.env.NODE_ENV || 'not set'}
- PORT: ${process.env.PORT || '8080 (default)'}
- MCP_ENABLED: ${process.env.MCP_ENABLED || 'not set'}
- AUGMENT_ENABLED: ${process.env.AUGMENT_ENABLED || 'not set'}
- Working directory: ${process.cwd()}
`);

// Configure middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create upload directories
const uploadDir = process.env.UPLOAD_FOLDER || path.join(__dirname, 'uploads');
const tempDir = process.env.TEMP_FOLDER || path.join(__dirname, 'temp');
const resultsDir = process.env.RESULTS_FOLDER || path.join(__dirname, 'results');

try {
  fs.mkdirSync(uploadDir, { recursive: true });
  fs.mkdirSync(tempDir, { recursive: true });
  fs.mkdirSync(resultsDir, { recursive: true });
  console.log('Created directories:', { uploadDir, tempDir, resultsDir });
} catch (error) {
  console.error('Error creating directories:', error);
}

// Configure multer storage for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniquePrefix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniquePrefix + '-' + file.originalname);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max file size
  },
  fileFilter: function (req, file, cb) {
    // Accept PDFs, Excel files, and images
    if (
      file.mimetype === 'application/pdf' ||
      file.mimetype === 'application/vnd.ms-excel' ||
      file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      file.mimetype.startsWith('image/')
    ) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, Excel, and image files are allowed!'), false);
    }
  }
});

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// API health check route for Cloud Run
app.get('/api/health', (req, res) => {
  console.log('Health check requested from:', req.ip);
  res.json({
    status: 'ok',
    message: 'FinDoc Analyzer API is running',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    port: process.env.PORT || '8080',
    mcp_enabled: process.env.MCP_ENABLED === 'true',
    augment_enabled: process.env.AUGMENT_ENABLED === 'true'
  });
});

// API key management endpoints
app.get('/api/config/api-keys', async (req, res) => {
  try {
    // Test all API keys
    const testResults = await apiKeyManager.testAllApiKeys();

    // Return API key status (not the actual keys for security)
    res.json({
      openrouter: {
        configured: apiKeyManager.hasValidApiKey('openrouter'),
        valid: testResults.openrouter
      },
      gemini: {
        configured: apiKeyManager.hasValidApiKey('gemini'),
        valid: testResults.gemini
      },
      deepseek: {
        configured: apiKeyManager.hasValidApiKey('deepseek'),
        valid: testResults.deepseek
      },
      supabase: {
        configured: apiKeyManager.hasValidApiKey('supabase'),
        valid: testResults.supabase
      }
    });
  } catch (error) {
    console.error('Error getting API key status:', error);
    res.status(500).json({
      error: 'Error getting API key status'
    });
  }
});

app.post('/api/config/api-keys', (req, res) => {
  try {
    const { service, key } = req.body;

    // Validate input
    if (!service || !key) {
      return res.status(400).json({
        error: 'Service and key are required'
      });
    }

    // Validate service
    if (!['openrouter', 'gemini', 'deepseek', 'supabase'].includes(service)) {
      return res.status(400).json({
        error: 'Invalid service'
      });
    }

    // Set API key
    const success = apiKeyManager.setApiKey(service, key);

    if (success) {
      res.json({
        success: true,
        message: `API key for ${service} updated successfully`
      });
    } else {
      res.status(500).json({
        error: `Error updating API key for ${service}`
      });
    }
  } catch (error) {
    console.error('Error updating API key:', error);
    res.status(500).json({
      error: 'Error updating API key'
    });
  }
});

// In-memory storage for document processing status
const documentProcessingStatus = new Map();

// In-memory database for users and documents
const users = [
  {
    id: '1',
    name: 'Demo User',
    email: 'demo@example.com',
    password: 'password', // In a real app, this would be hashed
    role: 'user'
  },
  {
    id: '2',
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'admin123', // In a real app, this would be hashed
    role: 'admin'
  }
];

// Mock document database (expanded from original)
const documents = [
  {
    id: 'doc-1',
    userId: '1',
    fileName: 'Financial Report 2023.pdf',
    documentType: 'financial',
    uploadDate: '2023-12-31T12:00:00Z',
    processed: true,
    metadata: {
      pageCount: 15,
      hasSecurities: true,
      hasTables: true
    }
  },
  {
    id: 'doc-2',
    userId: '1',
    fileName: 'Investment Portfolio.pdf',
    documentType: 'portfolio',
    uploadDate: '2023-12-15T10:30:00Z',
    processed: true,
    metadata: {
      pageCount: 8,
      hasSecurities: true,
      hasTables: true,
      securities: [
        { isin: 'US0378331005', name: 'Apple Inc.', quantity: 100, value: 18000 },
        { isin: 'US5949181045', name: 'Microsoft Corp.', quantity: 150, value: 51000 },
        { isin: 'US0231351067', name: 'Amazon.com Inc.', quantity: 50, value: 6500 }
      ]
    }
  },
  {
    id: 'doc-3',
    userId: '1',
    fileName: 'Tax Documents 2023.pdf',
    documentType: 'tax',
    uploadDate: '2023-11-20T14:45:00Z',
    processed: true,
    metadata: {
      pageCount: 12,
      hasSecurities: false,
      hasTables: true
    }
  },
  {
    id: 'doc-4',
    userId: '1',
    fileName: 'Messos Portfolio.pdf',
    documentType: 'portfolio',
    uploadDate: '2023-12-01T09:15:00Z',
    processed: true,
    metadata: {
      pageCount: 10,
      hasSecurities: true,
      hasTables: true,
      securities: [
        { isin: 'FR0000121014', name: 'LVMH', quantity: 1200, value: 900000 },
        { isin: 'DE0007236101', name: 'Siemens', quantity: 2500, value: 375000 },
        { isin: 'DE0007164600', name: 'SAP', quantity: 3000, value: 375000 },
        { isin: 'DE0005557508', name: 'Deutsche Telekom', quantity: 10000, value: 200000 },
        { isin: 'DE0008404005', name: 'Allianz', quantity: 800, value: 176000 }
      ]
    }
  }
];

// Simple middleware to check if the user is authenticated
function isAuthenticated(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = authHeader.split(' ')[1];

  // In a real app, you would verify the token
  // For this demo, we'll just check if it's one of our known tokens
  const validTokens = ['demo_token', 'google_token', 'admin_token'];

  if (!validTokens.includes(token)) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  // Set user based on token (simplistic approach)
  if (token === 'demo_token') {
    req.user = users.find(u => u.email === 'demo@example.com');
  } else if (token === 'admin_token') {
    req.user = users.find(u => u.email === 'admin@example.com');
  } else {
    req.user = {
      id: '3',
      name: 'Google User',
      email: 'google@example.com',
      role: 'user'
    };
  }

  next();
}

// Authentication routes
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  // Find user
  const user = users.find(u => u.email === email && u.password === password);

  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  // In a real app, you would generate a JWT token
  const token = user.email === 'admin@example.com' ? 'admin_token' : 'demo_token';

  // Return user data and token
  const userData = { ...user };
  delete userData.password;

  res.json({
    user: userData,
    token
  });
});

app.post('/api/auth/register', (req, res) => {
  const { name, email, password } = req.body;

  // Check if user already exists
  if (users.find(u => u.email === email)) {
    return res.status(400).json({ error: 'Email already in use' });
  }

  // Create new user
  const newUser = {
    id: (users.length + 1).toString(),
    name,
    email,
    password,
    role: 'user'
  };

  users.push(newUser);

  // Return user data and token
  const userData = { ...newUser };
  delete userData.password;

  res.json({
    user: userData,
    token: 'demo_token'
  });
});

app.get('/api/auth/me', isAuthenticated, (req, res) => {
  const userData = { ...req.user };
  delete userData.password;

  res.json({
    user: userData
  });
});

// Document API routes
app.get('/api/documents', isAuthenticated, (req, res) => {
  // Return documents for the authenticated user
  const userDocuments = documents.filter(doc => doc.userId === req.user.id || req.user.role === 'admin');

  res.json({
    documents: userDocuments
  });
});

app.get('/api/documents/:id', isAuthenticated, (req, res) => {
  const documentId = req.params.id;

  // Find document
  const document = documents.find(doc => doc.id === documentId);

  if (!document) {
    return res.status(404).json({ error: 'Document not found' });
  }

  // Check if user has access to document
  if (document.userId !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied' });
  }

  res.json({
    document
  });
});

// Document upload and processing
app.post('/api/documents/upload', isAuthenticated, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Create document record
    const documentId = 'doc-' + uuid();
    const document = {
      id: documentId,
      userId: req.user.id,
      fileName: req.file.originalname,
      filePath: req.file.path,
      documentType: req.body.documentType || 'unknown',
      uploadDate: new Date().toISOString(),
      processed: false,
      metadata: {
        fileSize: req.file.size,
        mimeType: req.file.mimetype
      }
    };

    // Add to documents array
    documents.push(document);

    // Start processing in background (don't wait for it to complete)
    processDocument(document);

    res.json({
      success: true,
      document: {
        id: document.id,
        fileName: document.fileName,
        uploadDate: document.uploadDate,
        status: 'processing'
      }
    });
  } catch (error) {
    console.error('Error uploading document:', error);
    res.status(500).json({
      error: 'Error uploading document',
      message: error.message
    });
  }
});

app.get('/api/documents/:id/status', isAuthenticated, (req, res) => {
  const documentId = req.params.id;

  // Find document
  const document = documents.find(doc => doc.id === documentId);

  if (!document) {
    return res.status(404).json({ error: 'Document not found' });
  }

  // Check if user has access to document
  if (document.userId !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied' });
  }

  // Get processing status
  const status = documentProcessingStatus.get(documentId) || {
    id: documentId,
    processed: document.processed,
    status: document.processed ? 'completed' : 'pending',
    progress: document.processed ? 100 : 0
  };

  res.json({
    status
  });
});

// Document processing endpoint
app.post('/api/documents/:id/process', isAuthenticated, async (req, res) => {
  const documentId = req.params.id;

  // Find document
  const document = documents.find(doc => doc.id === documentId);

  if (!document) {
    return res.status(404).json({ error: 'Document not found' });
  }

  // Check if user has access to document
  if (document.userId !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied' });
  }

  // Start processing in background
  processDocument(document);

  res.json({
    success: true,
    message: 'Document processing started',
    documentId
  });
});

// Document chat endpoint
app.post('/api/documents/:id/chat', isAuthenticated, async (req, res) => {
  const documentId = req.params.id;
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  // Find document
  const document = documents.find(doc => doc.id === documentId);

  if (!document) {
    return res.status(404).json({ error: 'Document not found' });
  }

  // Check if user has access to document
  if (document.userId !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied' });
  }

  // Check if document is processed
  if (!document.processed) {
    return res.status(400).json({
      error: 'Document is not processed yet',
      documentId,
      status: documentProcessingStatus.get(documentId)?.status || 'pending'
    });
  }

  // Check if MCP is enabled
  if (process.env.MCP_ENABLED === 'true') {
    try {
      console.log('Attempting to use MCP for chat');
      const mcpGatewayUrl = process.env.MCP_API_GATEWAY_URL || 'http://api-gateway-mcp:3003';

      const response = await axios.post(
        `${mcpGatewayUrl}/document-chat`,
        { documentId, message }
      );

      if (response.data) {
        console.log(`MCP successfully processed chat request`);
        return res.json({
          ...response.data,
          timestamp: new Date().toISOString(),
          source: 'mcp-service'
        });
      }
    } catch (error) {
      console.error('Error using MCP for chat:', error);
      // Fall back to agent manager
    }
  }

  // Try to use agent manager as fallback
  try {
    console.log('Attempting to use agent manager for chat');
    const result = await agentManager.askQuestion(documentId, message);

    if (result.success) {
      console.log(`Agent manager successfully answered question in ${result.processingTime}s`);
      return res.json({
        documentId,
        message,
        response: result.answer,
        timestamp: new Date().toISOString(),
        source: 'agent-manager',
        processingTime: result.processingTime
      });
    }
  } catch (error) {
    console.error('Error using agent manager for chat:', error);
  }

  // Simple fallback response based on document content
  let response = '';

  if (message.toLowerCase().includes('securities') || message.toLowerCase().includes('stocks')) {
    response = 'The document contains the following securities:\n\n';

    if (document.metadata && document.metadata.securities) {
      document.metadata.securities.forEach((security, index) => {
        response += `${index + 1}. ${security.name} (ISIN: ${security.isin}) - ${security.quantity} shares valued at $${security.value}\n`;
      });
    } else {
      response += 'No securities information found in this document.';
    }
  } else if (message.toLowerCase().includes('summary') || message.toLowerCase().includes('overview')) {
    response = `Document Summary for "${document.fileName}":\n`;
    response += `- Type: ${document.documentType}\n`;
    response += `- Uploaded: ${new Date(document.uploadDate).toLocaleDateString()}\n`;

    if (document.metadata) {
      if (document.metadata.pageCount) {
        response += `- Pages: ${document.metadata.pageCount}\n`;
      }
      if (document.metadata.hasSecurities) {
        response += '- Contains securities information\n';
      }
      if (document.metadata.hasTables) {
        response += '- Contains tables with financial data\n';
      }
    }
  } else {
    response = `I've analyzed "${document.fileName}" and can answer questions about its contents. What would you like to know specifically about this document?`;
  }

  res.json({
    documentId,
    message,
    response,
    timestamp: new Date().toISOString(),
    source: 'fallback'
  });
});

// Feedback routes
app.post('/api/feedback', isAuthenticated, async (req, res) => {
  const { type, content, context, rating } = req.body;

  if (!type || !content) {
    return res.status(400).json({ error: 'Type and content are required' });
  }

  console.log('Received feedback:', {
    userId: req.user.id,
    userName: req.user.name,
    type,
    content,
    context,
    rating,
    timestamp: new Date().toISOString()
  });

  res.json({
    success: true,
    message: 'Feedback submitted successfully',
    feedbackId: uuid()
  });
});

// Catch-all route to handle 404s for API routes
app.all('/api/*', (req, res) => {
  res.status(404).json({
    error: 'API endpoint not found',
    path: req.path
  });
});

// Catch-all route to serve the main HTML for client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server with enhanced error handling
const server = app.listen(port, () => {
  console.log(`✅ FinDoc Analyzer server successfully started and listening on port ${port}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`MCP Enabled: ${process.env.MCP_ENABLED === 'true' ? 'Yes' : 'No'}`);
  console.log(`Augment Enabled: ${process.env.AUGMENT_ENABLED === 'true' ? 'Yes' : 'No'}`);
  console.log(`Server URL: http://localhost:${port}`);

  // Create a health check file that Cloud Run can use to verify the server is running
  try {
    fs.writeFileSync(path.join(__dirname, 'server-running.txt'), `Server started at ${new Date().toISOString()}`);
    console.log('Created server-running.txt health check file');
  } catch (error) {
    console.warn('Could not create health check file:', error.message);
  }
});

// Handle server errors
server.on('error', (error) => {
  console.error('❌ SERVER ERROR:', error);

  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${port} is already in use. Please choose a different port or stop the other process.`);
  } else if (error.code === 'EACCES') {
    console.error(`Port ${port} requires elevated privileges. Please run with sudo or choose a port > 1024.`);
  }

  // Exit with error code
  process.exit(1);
});

// Handle process termination
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });

  // Force close after 10s
  setTimeout(() => {
    console.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
});

// Document processing function
async function processDocument(document) {
  console.log(`Starting processing for document ${document.id}: ${document.fileName}`);

  // Update status to processing
  documentProcessingStatus.set(document.id, {
    id: document.id,
    processed: false,
    status: 'processing',
    progress: 0,
    startTime: new Date().toISOString(),
    agents: {
      'Document Analyzer': { status: 'pending', time: null },
      'Table Understanding': { status: 'pending', time: null },
      'Securities Extractor': { status: 'pending', time: null },
      'Financial Reasoner': { status: 'pending', time: null }
    }
  });

  // Simulate Document Analyzer agent
  await new Promise(resolve => setTimeout(resolve, 1000));
  const status = documentProcessingStatus.get(document.id);
  status.progress = 20;
  status.agents['Document Analyzer'] = {
    status: 'completed',
    time: '1.2 seconds'
  };
  documentProcessingStatus.set(document.id, status);
  console.log(`Document Analyzer completed for ${document.id}`);

  // Simulate Table Understanding agent
  await new Promise(resolve => setTimeout(resolve, 1500));
  status.progress = 40;
  status.agents['Table Understanding'] = {
    status: 'completed',
    time: '1.5 seconds'
  };
  documentProcessingStatus.set(document.id, status);
  console.log(`Table Understanding completed for ${document.id}`);

  // Simulate Securities Extractor agent
  await new Promise(resolve => setTimeout(resolve, 1200));
  status.progress = 70;
  status.agents['Securities Extractor'] = {
    status: 'completed',
    time: '1.2 seconds'
  };
  documentProcessingStatus.set(document.id, status);
  console.log(`Securities Extractor completed for ${document.id}`);

  // Simulate Financial Reasoner agent
  await new Promise(resolve => setTimeout(resolve, 800));
  status.progress = 100;
  status.agents['Financial Reasoner'] = {
    status: 'completed',
    time: '0.8 seconds'
  };
  documentProcessingStatus.set(document.id, status);
  console.log(`Financial Reasoner completed for ${document.id}`);

  // Calculate processing time
  const startTime = new Date(status.startTime);
  const endTime = new Date();
  const processingTimeMs = endTime - startTime;
  const processingTime = (processingTimeMs / 1000).toFixed(1) + ' seconds';

  // Update document with mock results
  const updatedDocument = documents.find(d => d.id === document.id);

  if (updatedDocument) {
    updatedDocument.processed = true;
    updatedDocument.metadata = {
      ...updatedDocument.metadata,
      pageCount: Math.floor(Math.random() * 20) + 5,
      hasSecurities: Math.random() > 0.3,
      hasTables: Math.random() > 0.2,
      securities: [
        { isin: 'US0378331005', name: 'Apple Inc.', quantity: Math.floor(Math.random() * 200) + 50, value: Math.floor(Math.random() * 50000) + 10000 },
        { isin: 'US5949181045', name: 'Microsoft Corp.', quantity: Math.floor(Math.random() * 300) + 100, value: Math.floor(Math.random() * 100000) + 30000 },
        { isin: 'US0231351067', name: 'Amazon.com Inc.', quantity: Math.floor(Math.random() * 100) + 30, value: Math.floor(Math.random() * 40000) + 5000 }
      ]
    };
  }

  // Update status to completed
  status.processed = true;
  status.status = 'completed';
  status.progress = 100;
  status.endTime = endTime.toISOString();
  status.processingTime = processingTime;
  documentProcessingStatus.set(document.id, status);

  console.log(`Document processing completed for ${document.id} in ${processingTime}`);
}

// Export for testing
module.exports = app;