/**
 * FinDoc Analyzer Application - Enhanced Version
 *
 * This version includes enhanced document processing and chat capabilities.
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

// Create required directories if they don't exist
try {
  // Define required directories
  const requiredDirs = [
    process.env.TEMP_FOLDER || path.join(process.cwd(), 'temp'),
    process.env.UPLOAD_FOLDER || path.join(process.cwd(), 'uploads'),
    process.env.RESULTS_FOLDER || path.join(process.cwd(), 'results')
  ];
  
  // Create directories
  requiredDirs.forEach(dir => {
    console.log(`Checking directory: ${dir}`);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`Created directory: ${dir}`);
    } else {
      console.log(`Directory already exists: ${dir}`);
    }
  });
} catch (error) {
  console.error(`Error creating directories: ${error.message}`);
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
const enhancedRoutes = require('./api/routes/enhancedRoutes');

// Import middleware
const { authMiddleware, optionalAuthMiddleware, testModeMiddleware } = require('./api/middleware/authMiddleware');

// Import enhanced controllers
const { 
  createDocument, 
  processDocumentUnified 
} = require('./api/controllers/enhancedDocumentController');

const { 
  askQuestion,
  generateTable
} = require('./api/controllers/enhancedChatController');

// Health check route
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'FinDoc Analyzer API is running',
    version: '1.1.0', // Updated version to reflect enhancements
    timestamp: new Date().toISOString(),
    enhanced: true
  });
});

// Test routes with enhanced functionality
app.post('/api/test/process-pdf', testModeMiddleware, (req, res) => {
  console.log('Enhanced test PDF processing endpoint hit');

  // Add tenant_id and user to the request object
  req.tenantId = 'test-tenant';
  req.user = {
    id: 'test-user',
    email: 'test@example.com',
    name: 'Test User'
  };

  // Process with enhanced functionality
  try {
    createDocument(req, res);
  } catch (error) {
    console.error('Error in enhanced test PDF processing endpoint:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error in test PDF processing endpoint',
      details: error.message
    });
  }
});

// Enhanced test route for processing a document
app.post('/api/test/process-document/:id', testModeMiddleware, (req, res) => {
  console.log('Enhanced test document processing endpoint hit');

  // Add tenant_id and user to the request object
  req.tenantId = 'test-tenant';
  req.user = {
    id: 'test-user',
    email: 'test@example.com',
    name: 'Test User'
  };

  // Process with enhanced functionality
  try {
    processDocumentUnified(req, res);
  } catch (error) {
    console.error('Error in enhanced test document processing endpoint:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error in test document processing endpoint',
      details: error.message
    });
  }
});

// Enhanced test route for asking questions
app.post('/api/test/document/:id/ask', testModeMiddleware, (req, res) => {
  console.log('Enhanced test ask question endpoint hit');

  // Add tenant_id and user to the request object
  req.tenantId = 'test-tenant';
  req.user = {
    id: 'test-user',
    email: 'test@example.com',
    name: 'Test User'
  };

  // Process with enhanced functionality
  try {
    askQuestion(req, res);
  } catch (error) {
    console.error('Error in enhanced test ask question endpoint:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error in test ask question endpoint',
      details: error.message
    });
  }
});

// Enhanced test route for generating tables
app.post('/api/test/document/:id/table', testModeMiddleware, (req, res) => {
  console.log('Enhanced test generate table endpoint hit');

  // Add tenant_id and user to the request object
  req.tenantId = 'test-tenant';
  req.user = {
    id: 'test-user',
    email: 'test@example.com',
    name: 'Test User'
  };

  // Process with enhanced functionality
  try {
    generateTable(req, res);
  } catch (error) {
    console.error('Error in enhanced test generate table endpoint:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error in test generate table endpoint',
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

// Use enhanced routes for document and chat functionality
app.use('/api/enhanced', enhancedRoutes);

// Original routes (kept for backward compatibility)
app.use('/api/documents', documentRoutes);
app.use('/api/chat', chatRoutes);

// Health check routes (no authentication required)
app.use('/api/health', healthRoutes);

// Mock PDF routes for testing without authentication
app.use('/api/mock', mockPdfRoutes);

// Import original controllers directly
const { getScan1Status, verifyGeminiApiKey } = require('./api/controllers/scan1Controller');

// Direct API routes for compatibility
app.get('/api/documents/scan1/status', (req, res) => {
  console.log('Direct Scan1 status endpoint hit in app-enhanced.js');
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
  console.log('Direct Gemini API key verification endpoint hit in app-enhanced.js');
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

// Replace the original process document with Scan1 route with the enhanced version
app.post('/api/documents/:id/scan1', testModeMiddleware, (req, res) => {
  console.log('Enhanced document processing endpoint hit in app-enhanced.js');
  
  // Add tenant_id and user to the request object if not already there
  req.tenantId = req.tenantId || 'test-tenant';
  req.user = req.user || {
    id: 'test-user',
    email: 'test@example.com',
    name: 'Test User'
  };
  
  try {
    // Process with enhanced functionality
    processDocumentUnified(req, res);
  } catch (error) {
    console.error('Error in enhanced document processing endpoint:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error in enhanced document processing endpoint',
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
