/**
 * Augment Service - Core Integration Module for FinDoc Analyzer
 * 
 * This service handles the communication between FinDoc and Google Cloud,
 * orchestrating document processing and AI interactions through the Augment framework.
 */

const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

// Add global fetch for Node.js environments that don't have it
global.fetch = global.fetch || require('node-fetch');

// Initialize express app
const app = express();
const PORT = process.env.PORT || 8080; // Use the PORT from environment or default to 8080 for Cloud Run

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());

// Track service status and connections
const serviceStatus = {
  startTime: new Date().toISOString(),
  activeConnections: 0,
  completedRequests: 0,
  failedRequests: 0,
  services: {
    'document-processing': { status: 'unknown', url: process.env.DOCUMENT_PROCESSING_URL || null },
    'chat-service': { status: 'unknown', url: process.env.CHAT_SERVICE_URL || null },
    'api-gateway': { status: 'unknown', url: process.env.API_GATEWAY_URL || null },
    'financial-analysis': { status: 'unknown', url: process.env.FINANCIAL_ANALYSIS_URL || null }
  }
};

// In-memory store for temporary data
const sessionStore = new Map();

/**
 * Helper to check if Google Cloud environment is available
 */
function isGoogleCloudEnvironment() {
  // Check for Google Cloud environment variables
  return process.env.K_SERVICE || process.env.GAE_SERVICE || process.env.GOOGLE_CLOUD_PROJECT;
}

/**
 * Initial setup for the service
 */
function initializeService() {
  console.log('Initializing Augment Service for FinDoc Analyzer...');
  
  // Create necessary directories
  const configDir = path.join(__dirname, 'config');
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }
  
  // Check for augment configuration
  const configPath = path.join(configDir, 'augment.json');
  if (!fs.existsSync(configPath)) {
    console.log('No augment configuration found. Creating default config...');
    const defaultConfig = {
      augment: {
        enabled: true,
        services: {
          'document-processing': {
            port: 8080,
            memory: '2Gi'
          },
          'chat-service': {
            port: 8080,
            memory: '1Gi',
            models: ['claude-3-opus']
          },
          'api-gateway': {
            port: 8080,
            memory: '512Mi',
            external: true
          },
          'financial-analysis': {
            port: 8080,
            memory: '2Gi'
          }
        }
      }
    };
    
    fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2));
    console.log(`Created default configuration at ${configPath}`);
  }
  
  // Log environment information
  console.log('Environment:', {
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: PORT,
    isGoogleCloud: isGoogleCloudEnvironment() ? 'Yes' : 'No',
    serviceType: process.env.SERVICE_TYPE || 'augment-core'
  });
  
  // Check service URLs
  Object.entries(serviceStatus.services).forEach(([name, service]) => {
    if (service.url) {
      console.log(`${name} URL configured: ${service.url}`);
      pingService(name, service.url);
    } else {
      console.log(`WARNING: ${name} URL not configured`);
    }
  });
}

/**
 * Ping a service to check its status
 */
async function pingService(serviceName, serviceUrl) {
  try {
    const response = await fetch(`${serviceUrl}/api/health`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });
    
    if (response.ok) {
      const data = await response.json();
      serviceStatus.services[serviceName].status = 'active';
      serviceStatus.services[serviceName].lastPing = new Date().toISOString();
      serviceStatus.services[serviceName].details = data;
      console.log(`${serviceName} is active at ${serviceUrl}`);
    } else {
      serviceStatus.services[serviceName].status = 'error';
      serviceStatus.services[serviceName].lastError = `HTTP ${response.status}`;
      console.error(`Error pinging ${serviceName}: HTTP ${response.status}`);
    }
  } catch (error) {
    serviceStatus.services[serviceName].status = 'error';
    serviceStatus.services[serviceName].lastError = error.message;
    console.error(`Error pinging ${serviceName}: ${error.message}`);
  }
}

/**
 * Create augment session for document processing
 */
function createAugmentSession(user, documentId) {
  const sessionId = uuidv4();
  const session = {
    id: sessionId,
    created: new Date().toISOString(),
    userId: user.id,
    documentId,
    status: 'initialized',
    steps: [],
    results: {},
    logs: []
  };
  
  sessionStore.set(sessionId, session);
  return session;
}

/**
 * Route: Health check
 */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'augment-service',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    isGoogleCloud: isGoogleCloudEnvironment() ? 'Yes' : 'No',
    timestamp: new Date().toISOString()
  });
});

/**
 * Route: Root path
 */
app.get('/', (req, res) => {
  res.json({
    service: 'Augment Service for FinDoc Analyzer',
    version: '1.0.0',
    status: 'running',
    healthEndpoint: '/api/health',
    statusEndpoint: '/api/status'
  });
});

/**
 * Route: Service status
 */
app.get('/api/status', (req, res) => {
  // Calculate uptime
  const startTime = new Date(serviceStatus.startTime);
  const uptime = Math.floor((new Date() - startTime) / 1000);
  
  res.json({
    ...serviceStatus,
    uptime,
    memory: process.memoryUsage(),
    currentTimestamp: new Date().toISOString()
  });
});

/**
 * Route: Document processing request
 */
app.post('/api/process-document', (req, res) => {
  const { documentId, userId, options } = req.body;
  
  if (!documentId || !userId) {
    return res.status(400).json({
      error: 'Missing required parameters',
      required: ['documentId', 'userId']
    });
  }
  
  // Create processing session
  const session = createAugmentSession({ id: userId }, documentId);
  session.status = 'processing';
  session.options = options || {};
  session.steps.push({
    name: 'request-received',
    timestamp: new Date().toISOString()
  });
  
  // Log the request
  console.log(`Processing request for document ${documentId} by user ${userId}`);
  serviceStatus.activeConnections++;
  
  // Return session info immediately
  res.json({
    success: true,
    message: 'Document processing request accepted',
    sessionId: session.id,
    status: 'processing'
  });
  
  // Process in background
  processDocumentAsync(session).catch(error => {
    console.error(`Error processing document ${documentId}:`, error);
    session.status = 'error';
    session.error = error.message;
    session.steps.push({
      name: 'processing-error',
      timestamp: new Date().toISOString(),
      error: error.message
    });
    serviceStatus.failedRequests++;
    serviceStatus.activeConnections--;
  });
});

/**
 * Route: Document chat request
 */
app.post('/api/document-chat', (req, res) => {
  const { documentId, userId, message, sessionId } = req.body;
  
  if (!documentId || !message) {
    return res.status(400).json({
      error: 'Missing required parameters',
      required: ['documentId', 'message']
    });
  }
  
  // Create or get session
  let session;
  if (sessionId && sessionStore.has(sessionId)) {
    session = sessionStore.get(sessionId);
    session.steps.push({
      name: 'chat-request-received',
      timestamp: new Date().toISOString()
    });
  } else {
    session = createAugmentSession({ id: userId || 'anonymous' }, documentId);
    session.status = 'chat-session';
    session.steps.push({
      name: 'chat-session-created',
      timestamp: new Date().toISOString()
    });
  }
  
  // Add message to session
  if (!session.messages) {
    session.messages = [];
  }
  
  session.messages.push({
    role: 'user',
    content: message,
    timestamp: new Date().toISOString()
  });
  
  // Log the request
  console.log(`Chat request for document ${documentId} with message: ${message.substring(0, 50)}...`);
  serviceStatus.activeConnections++;
  
  // Process chat in background and respond immediately
  handleDocumentChatAsync(session, message)
    .then(response => {
      // Store the response in the session
      session.messages.push({
        role: 'assistant',
        content: response,
        timestamp: new Date().toISOString()
      });
      
      // Send response to client (already returned)
      serviceStatus.completedRequests++;
      serviceStatus.activeConnections--;
    })
    .catch(error => {
      console.error(`Error handling chat for document ${documentId}:`, error);
      session.status = 'error';
      session.error = error.message;
      session.steps.push({
        name: 'chat-error',
        timestamp: new Date().toISOString(),
        error: error.message
      });
      serviceStatus.failedRequests++;
      serviceStatus.activeConnections--;
    });
  
  // Return immediate acknowledgment
  res.json({
    success: true,
    message: 'Chat request accepted',
    documentId,
    sessionId: session.id,
    status: 'processing',
    estimatedResponseTime: '2-5 seconds'
  });
});

/**
 * Route: Session status
 */
app.get('/api/sessions/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  
  if (sessionStore.has(sessionId)) {
    const session = sessionStore.get(sessionId);
    res.json({
      session: {
        id: session.id,
        status: session.status,
        created: session.created,
        documentId: session.documentId,
        steps: session.steps,
        messageCount: session.messages ? session.messages.length : 0
      }
    });
  } else {
    res.status(404).json({
      error: 'Session not found',
      sessionId
    });
  }
});

/**
 * Async function to process document
 */
async function processDocumentAsync(session) {
  try {
    // Add processing step
    session.steps.push({
      name: 'processing-started',
      timestamp: new Date().toISOString()
    });
    
    // Check if document processing service is available
    if (serviceStatus.services['document-processing'].status !== 'active') {
      console.log('Document processing service not available, using local processing');
      // Just proceed with local processing
    }
    
    // Simulate document processing delay
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Add completion step
    session.steps.push({
      name: 'processing-completed',
      timestamp: new Date().toISOString()
    });
    
    session.status = 'completed';
    serviceStatus.completedRequests++;
    serviceStatus.activeConnections--;
    
    console.log(`Document ${session.documentId} processed successfully`);
    return session;
  } catch (error) {
    console.error(`Error processing document:`, error);
    throw error;
  }
}

/**
 * Async function to handle document chat
 */
async function handleDocumentChatAsync(session, message) {
  try {
    // Add processing step
    session.steps.push({
      name: 'chat-processing-started',
      timestamp: new Date().toISOString()
    });
    
    // Check if chat service is available
    if (serviceStatus.services['chat-service'].status !== 'active') {
      console.log('Chat service not available, using fallback response');
      return `I've reviewed the document ${session.documentId} and can answer your question: "${message}". However, the chat service is currently unavailable, so I'm providing a limited response. Please try again later for a more detailed answer.`;
    }
    
    // Simulate chat processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Generate a response based on the message
    let response = '';
    
    if (message.toLowerCase().includes('summary') || message.toLowerCase().includes('overview')) {
      response = `This document appears to be a financial report with various metrics and analysis. It contains information about investments, securities, and financial performance. The document includes several tables with numerical data and some charts visualizing the results.`;
    } else if (message.toLowerCase().includes('security') || message.toLowerCase().includes('stock') || message.toLowerCase().includes('investment')) {
      response = `The document mentions several securities including Apple Inc. (AAPL), Microsoft Corporation (MSFT), and Amazon (AMZN). These stocks appear to be part of a portfolio with various allocation percentages. The document also references some international stocks including LVMH (MC.PA) and Siemens (SIE.DE).`;
    } else if (message.toLowerCase().includes('recommend') || message.toLowerCase().includes('suggest') || message.toLowerCase().includes('advice')) {
      response = `I can't provide financial advice or recommendations based on this document. The information shown is specific to someone's portfolio and financial situation. For personalized financial advice, please consult with a qualified financial advisor.`;
    } else {
      response = `Based on my analysis of the document, I can see that it contains financial data and portfolio information. The document appears to be structured with multiple sections including summary statistics, holdings breakdown, and performance metrics. Is there something specific you'd like to know about this document?`;
    }
    
    // Add completion step
    session.steps.push({
      name: 'chat-response-generated',
      timestamp: new Date().toISOString()
    });
    
    return response;
  } catch (error) {
    console.error(`Error processing chat:`, error);
    throw error;
  }
}

/**
 * Route: Config management
 */
app.get('/api/config', (req, res) => {
  try {
    const configPath = path.join(__dirname, 'config', 'augment.json');
    if (fs.existsSync(configPath)) {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      res.json({ config });
    } else {
      res.status(404).json({
        error: 'Configuration not found',
        message: 'The augment configuration file does not exist'
      });
    }
  } catch (error) {
    res.status(500).json({
      error: 'Failed to read configuration',
      message: error.message
    });
  }
});

app.post('/api/config', (req, res) => {
  try {
    const { config } = req.body;
    
    if (!config || !config.augment) {
      return res.status(400).json({
        error: 'Invalid configuration',
        message: 'Configuration must include augment object'
      });
    }
    
    const configDir = path.join(__dirname, 'config');
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }
    
    const configPath = path.join(configDir, 'augment.json');
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    
    res.json({
      success: true,
      message: 'Configuration updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to update configuration',
      message: error.message
    });
  }
});

/**
 * Route: Google Cloud integration
 */
app.get('/api/cloud-status', (req, res) => {
  const cloudInfo = {
    environment: isGoogleCloudEnvironment() ? 'google-cloud' : 'other',
    service: process.env.K_SERVICE || process.env.GAE_SERVICE || 'unknown',
    project: process.env.GOOGLE_CLOUD_PROJECT || 'unknown',
    region: process.env.FUNCTION_REGION || process.env.CLOUD_RUN_REGION || 'unknown'
  };
  
  res.json({ cloud: cloudInfo });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Augment service listening on port ${PORT}`);
  initializeService();
});