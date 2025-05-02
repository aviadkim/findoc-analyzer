/**
 * FinDoc Analyzer Application
 *
 * This is the main application file.
 */

const express = require('express');
const path = require('path');
const cors = require('cors');
const fs = require('fs');

// Create Express app
const app = express();

// CORS middleware
app.use(cors({
  origin: '*', // Allow all origins
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  credentials: true,
  maxAge: 86400 // 24 hours
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create temp directory for processing if it doesn't exist
try {
  // Use environment variable for temp directory if available
  const tempDir = process.env.TEMP_FOLDER || path.join(process.cwd(), 'temp');
  console.log(`Attempting to create temp directory: ${tempDir}`);

  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
    console.log(`Created temp directory: ${tempDir}`);
  } else {
    console.log(`Temp directory already exists: ${tempDir}`);
  }
} catch (error) {
  console.error(`Error creating temp directory: ${error.message}`);
  // Continue execution even if directory creation fails
}

// Serve static files
app.use(express.static(path.join(__dirname, '../public')));

// Import routes
const visualizationRoutes = require('./api/routes/visualizationRoutes');
const reportRoutes = require('./api/routes/reportRoutes');
const financialRoutes = require('./api/routes/financialRoutes');
const agentRoutes = require('./api/routes/agentRoutes');
const authRoutes = require('./api/routes/authRoutes');
const comparisonRoutes = require('./api/routes/comparisonRoutes');
const portfolioRoutes = require('./api/routes/portfolioRoutes');
const documentRoutes = require('./api/routes/documentRoutes');
const chatRoutes = require('./api/routes/chatRoutes');
const mockPdfRoutes = require('./api/routes/mockPdfRoutes');
const healthRoutes = require('./api/routes/healthRoutes');

// Import middleware
const { authMiddleware, optionalAuthMiddleware } = require('./api/middleware/authMiddleware');

// Health check route
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'FinDoc Analyzer API is running',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Test route for PDF processing without authentication
app.post('/api/test/process-pdf', (req, res) => {
  console.log('Test PDF processing endpoint hit');

  // Import necessary controllers
  const { processDocumentWithScan1 } = require('./api/controllers/scan1Controller');
  const { createDocument } = require('./api/controllers/documentController');

  // Add tenant_id and user to the request object
  req.tenantId = 'test-tenant';
  req.user = {
    id: 'test-user',
    email: 'test@example.com',
    name: 'Test User'
  };

  // Process the request
  try {
    // First, create the document
    createDocument(req, res);
  } catch (error) {
    console.error('Error in test PDF processing endpoint:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error in test PDF processing endpoint',
      details: error.message
    });
  }
});

// Test route for processing a document without authentication
app.post('/api/test/process-document/:id', (req, res) => {
  console.log('Test document processing endpoint hit');

  // Import necessary controllers
  const { processDocumentWithScan1 } = require('./api/controllers/scan1Controller');

  // Add tenant_id and user to the request object
  req.tenantId = 'test-tenant';
  req.user = {
    id: 'test-user',
    email: 'test@example.com',
    name: 'Test User'
  };

  // Process the request
  try {
    // Process the document
    processDocumentWithScan1(req, res);
  } catch (error) {
    console.error('Error in test document processing endpoint:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error in test document processing endpoint',
      details: error.message
    });
  }
});

// Test route for getting a document without authentication
app.get('/api/test/document/:id', (req, res) => {
  console.log('Test get document endpoint hit');

  // Import necessary controllers
  const { getDocumentById } = require('./api/controllers/documentController');

  // Add tenant_id and user to the request object
  req.tenantId = 'test-tenant';
  req.user = {
    id: 'test-user',
    email: 'test@example.com',
    name: 'Test User'
  };

  // Process the request
  try {
    // Get the document
    getDocumentById(req, res);
  } catch (error) {
    console.error('Error in test get document endpoint:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error in test get document endpoint',
      details: error.message
    });
  }
});

// Test route for asking questions about a document without authentication
app.post('/api/test/document/:id/ask', (req, res) => {
  console.log('Test ask question endpoint hit');

  // Import necessary controllers
  const { askQuestion } = require('./api/controllers/chatController');

  // Add tenant_id and user to the request object
  req.tenantId = 'test-tenant';
  req.user = {
    id: 'test-user',
    email: 'test@example.com',
    name: 'Test User'
  };

  // Process the request
  try {
    // Ask question
    askQuestion(req, res);
  } catch (error) {
    console.error('Error in test ask question endpoint:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error in test ask question endpoint',
      details: error.message
    });
  }
});

// API routes
app.use('/api/visualizations', visualizationRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/financial', financialRoutes);
app.use('/api/agents', agentRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/comparisons', comparisonRoutes);
app.use('/api/portfolios', portfolioRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/chat', chatRoutes);

// Health check routes (no authentication required)
app.use('/api/health', healthRoutes);

// Mock PDF routes for testing without authentication
app.use('/api/mock', mockPdfRoutes);

// Import controllers directly
const { getScan1Status, verifyGeminiApiKey, processDocumentWithScan1 } = require('./api/controllers/scan1Controller');

// Direct API routes - ensure these are defined before the document routes
// These routes need to be defined here to avoid conflicts with the /:id route in documentRoutes
app.get('/api/documents/scan1/status', (req, res) => {
  console.log('Direct Scan1 status endpoint hit in app.js');
  try {
    getScan1Status(req, res);
  } catch (error) {
    console.error('Error in Scan1 status endpoint:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error in Scan1 status endpoint',
      details: error.message
    });
  }
});

app.get('/api/documents/scan1/verify-gemini', (req, res) => {
  console.log('Direct Gemini API key verification endpoint hit in app.js');
  try {
    verifyGeminiApiKey(req, res);
  } catch (error) {
    console.error('Error in Gemini API key verification endpoint:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error in Gemini API key verification endpoint',
      details: error.message
    });
  }
});

app.post('/api/documents/:id/scan1', (req, res) => {
  console.log('Direct Process document with Scan1 endpoint hit in app.js');
  try {
    processDocumentWithScan1(req, res);
  } catch (error) {
    console.error('Error in Process document with Scan1 endpoint:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error in Process document with Scan1 endpoint',
      details: error.message
    });
  }
});

// API 404 handler - must be before the catch-all route
app.use('/api/*', (req, res) => {
  console.log('API 404 handler hit for:', req.originalUrl);
  res.status(404).json({
    success: false,
    error: 'API endpoint not found',
    path: req.originalUrl
  });
});

// Catch-all route for SPA - must be after all API routes
app.get('*', (req, res) => {
  console.log('Catch-all route hit for:', req.originalUrl);
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);

  // Check if the response has already been sent
  if (res.headersSent) {
    return next(err);
  }

  // Check if the request is an API request
  if (req.originalUrl.startsWith('/api/')) {
    return res.status(500).json({
      success: false,
      error: err.message || 'Internal server error'
    });
  }

  // For non-API requests, send the index.html file
  res.status(500).sendFile(path.join(__dirname, '../public/index.html'));
});

module.exports = app;
