const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const apiKeyManager = require('./api-key-manager');
const agentManager = require('./agent-manager');

// Create Express app
const app = express();
const port = process.env.PORT || 8080;

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

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// API routes
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'FinDoc Analyzer API is running',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
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

app.post('/api/config/api-keys/test', async (req, res) => {
  try {
    const { service, key } = req.body;

    // Validate input
    if (!service || !key) {
      return res.status(400).json({
        error: 'Service and key are required'
      });
    }

    // Test API key
    let isValid = false;

    switch (service) {
      case 'openrouter':
        isValid = await apiKeyManager.testOpenRouterApiKey(key);
        break;
      case 'gemini':
        isValid = await apiKeyManager.testGeminiApiKey(key);
        break;
      case 'deepseek':
        isValid = await apiKeyManager.testDeepSeekApiKey(key);
        break;
      case 'supabase':
        isValid = await apiKeyManager.testSupabaseApiKey(
          key,
          process.env.SUPABASE_URL || 'https://dnjnsotemnfrjlotgved.supabase.co'
        );
        break;
      default:
        return res.status(400).json({
          error: 'Invalid service'
        });
    }

    res.json({
      service,
      valid: isValid
    });
  } catch (error) {
    console.error('Error testing API key:', error);
    res.status(500).json({
      error: 'Error testing API key'
    });
  }
});

// In-memory storage for document processing status
const documentProcessingStatus = new Map();

// Mock document database
const mockDocuments = [
  {
    id: 'doc-1',
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

// Function to process a document asynchronously
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
  documentProcessingStatus.get(document.id).progress = 20;
  documentProcessingStatus.get(document.id).agents['Document Analyzer'] = {
    status: 'completed',
    time: '1.2 seconds'
  };
  console.log(`Document Analyzer completed for ${document.id}`);

  // Simulate Table Understanding agent
  await new Promise(resolve => setTimeout(resolve, 1500));
  documentProcessingStatus.get(document.id).progress = 40;
  documentProcessingStatus.get(document.id).agents['Table Understanding'] = {
    status: 'completed',
    time: '1.5 seconds'
  };
  console.log(`Table Understanding completed for ${document.id}`);

  // Simulate Securities Extractor agent
  await new Promise(resolve => setTimeout(resolve, 1200));
  documentProcessingStatus.get(document.id).progress = 70;
  documentProcessingStatus.get(document.id).agents['Securities Extractor'] = {
    status: 'completed',
    time: '1.2 seconds'
  };
  console.log(`Securities Extractor completed for ${document.id}`);

  // Simulate Financial Reasoner agent
  await new Promise(resolve => setTimeout(resolve, 800));
  documentProcessingStatus.get(document.id).progress = 100;
  documentProcessingStatus.get(document.id).agents['Financial Reasoner'] = {
    status: 'completed',
    time: '0.8 seconds'
  };
  console.log(`Financial Reasoner completed for ${document.id}`);

  // Calculate processing time
  const startTime = new Date(documentProcessingStatus.get(document.id).startTime);
  const endTime = new Date();
  const processingTimeMs = endTime - startTime;
  const processingTime = (processingTimeMs / 1000).toFixed(1) + ' seconds';

  // Update status to completed
  documentProcessingStatus.set(document.id, {
    ...documentProcessingStatus.get(document.id),
    processed: true,
    status: 'completed',
    progress: 100,
    endTime: endTime.toISOString(),
    processingTime,
    metadata: {
      pageCount: 8,
      hasSecurities: true,
      hasTables: true,
      securities: [
        { isin: 'US0378331005', name: 'Apple Inc.', quantity: 100, value: 18000 },
        { isin: 'US5949181045', name: 'Microsoft Corp.', quantity: 150, value: 51000 },
        { isin: 'US0231351067', name: 'Amazon.com Inc.', quantity: 50, value: 6500 },
        { isin: 'US88160R1014', name: 'Tesla Inc.', quantity: 75, value: 18750 },
        { isin: 'US30303M1027', name: 'Meta Platforms Inc.', quantity: 80, value: 23200 }
      ]
    }
  });

  // Add the document to the mock database
  mockDocuments.push({
    ...document,
    processed: true,
    metadata: documentProcessingStatus.get(document.id).metadata
  });

  console.log(`Document ${document.id} processed successfully in ${processingTime}`);
  return documentProcessingStatus.get(document.id);
}

// Add API endpoints
app.post('/api/documents', (req, res) => {
  // Create a new document
  const docId = 'doc-' + Date.now();
  const fileName = req.body.fileName || 'Unnamed Document';
  const documentType = req.body.documentType || 'other';
  const fileSize = req.body.fileSize || 0;

  // Create a document object
  const document = {
    id: docId,
    fileName,
    documentType,
    fileSize,
    uploadDate: new Date().toISOString(),
    processed: false
  };

  // Return the document ID immediately
  res.json(document);

  // Process the document asynchronously with agent manager
  try {
    // First use the old processing function for backward compatibility
    processDocument(document).catch(error => {
      console.error(`Error processing document ${docId} with old processor:`, error);
    });

    // Then use the agent manager for enhanced processing
    agentManager.processDocument(document).then(result => {
      if (result.success) {
        console.log(`Document ${docId} processed successfully with agent manager`);
      } else {
        console.error(`Error processing document ${docId} with agent manager:`, result.error);
      }
    }).catch(error => {
      console.error(`Error processing document ${docId} with agent manager:`, error);
    });
  } catch (error) {
    console.error(`Error processing document ${docId}:`, error);

    // Update status to error
    documentProcessingStatus.set(docId, {
      id: docId,
      processed: false,
      status: 'error',
      error: error.message,
      endTime: new Date().toISOString()
    });
  }
});

app.get('/api/documents', (req, res) => {
  // Return the mock document list
  res.json(mockDocuments);
});

// Get a specific document by ID
app.get('/api/documents/:id', (req, res) => {
  const docId = req.params.id;

  // Find the document in the mock database
  const document = mockDocuments.find(doc => doc.id === docId);

  if (!document) {
    return res.status(404).json({
      error: 'Document not found'
    });
  }

  res.json(document);
});

// Add endpoint to check processing status
app.get('/api/documents/:id/status', (req, res) => {
  const docId = req.params.id;

  // Check if we have status information for this document
  if (documentProcessingStatus.has(docId)) {
    // Return the actual processing status
    res.json(documentProcessingStatus.get(docId));
  } else {
    // Find the document in the mock database
    const document = mockDocuments.find(doc => doc.id === docId);

    if (!document) {
      return res.status(404).json({
        error: 'Document not found'
      });
    }

    // For documents that don't have processing status (e.g., pre-existing mock documents),
    // create a mock status
    const status = {
      id: docId,
      processed: document.processed,
      status: document.processed ? 'completed' : 'pending',
      progress: document.processed ? 100 : 0,
      processingTime: '5.2 seconds',
      agents: {
        'Document Analyzer': { status: 'completed', time: '1.2 seconds' },
        'Table Understanding': { status: 'completed', time: '2.1 seconds' },
        'Securities Extractor': { status: 'completed', time: '1.5 seconds' },
        'Financial Reasoner': { status: 'completed', time: '0.4 seconds' }
      },
      metadata: document.metadata || {
        pageCount: 8,
        hasSecurities: true,
        hasTables: true
      }
    };

    res.json(status);
  }
});

// Add endpoint for document chat
app.post('/api/chat', async (req, res) => {
  const { documentId, message } = req.body;

  try {
    // Try to use agent manager first
    try {
      const result = await agentManager.askQuestion(documentId, message);

      if (result.success) {
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
      // Fall back to API keys
    }

    // Check if we have valid API keys
    const openrouterKey = apiKeyManager.getApiKey('openrouter');
    const geminiKey = apiKeyManager.getApiKey('gemini');

    // Find the document
    const document = mockDocuments.find(doc => doc.id === documentId);

    if (!document) {
      return res.status(404).json({
        error: 'Document not found'
      });
    }

    // Prepare document context
    let documentContext = `
Document ID: ${document.id}
Document Name: ${document.fileName}
Document Type: ${document.documentType}
Upload Date: ${document.uploadDate}
    `;

    // Add metadata if available
    if (document.metadata) {
      const metadata = document.metadata;

      if (metadata.pageCount) {
        documentContext += `Page Count: ${metadata.pageCount}\n`;
      }

      if (metadata.securities && metadata.securities.length > 0) {
        documentContext += `\nSecurities:\n`;
        metadata.securities.forEach((security, index) => {
          documentContext += `${index + 1}. ${security.name} (ISIN: ${security.isin}) - ${security.quantity} shares valued at $${security.value}\n`;
        });
      }
    }

    // Try to use Gemini API if available
    if (geminiKey) {
      try {
        const axios = require('axios');

        const response = await axios.post(
          'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=' + geminiKey,
          {
            contents: [
              {
                parts: [
                  {
                    text: `You are a financial document assistant. Answer the following question based on the document information provided.

Document Information:
${documentContext}

User Question: ${message}

Please provide a clear, concise, and accurate answer based on the document information. If the information is not available in the document, please say so.`
                  }
                ]
              }
            ],
            generationConfig: {
              temperature: 0.2,
              maxOutputTokens: 1000
            }
          }
        );

        if (response.data && response.data.candidates && response.data.candidates.length > 0) {
          const content = response.data.candidates[0].content;

          if (content && content.parts && content.parts.length > 0) {
            const aiResponse = content.parts[0].text;

            return res.json({
              documentId,
              message,
              response: aiResponse,
              timestamp: new Date().toISOString(),
              source: 'gemini'
            });
          }
        }
      } catch (error) {
        console.error('Error using Gemini API:', error);
        // Fall back to OpenRouter or mock response
      }
    }

    // Try to use OpenRouter API if available
    if (openrouterKey) {
      try {
        const axios = require('axios');

        const response = await axios.post(
          'https://openrouter.ai/api/v1/chat/completions',
          {
            model: "anthropic/claude-3-opus:beta",
            messages: [
              {
                role: "system",
                content: "You are a financial document assistant. Your job is to answer questions about financial documents accurately and concisely."
              },
              {
                role: "user",
                content: `Here is information about a document:

${documentContext}

Please answer the following question about this document: ${message}`
              }
            ],
            temperature: 0.2,
            max_tokens: 1000
          },
          {
            headers: {
              'Authorization': `Bearer ${openrouterKey}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (response.data && response.data.choices && response.data.choices.length > 0) {
          const aiResponse = response.data.choices[0].message.content;

          return res.json({
            documentId,
            message,
            response: aiResponse,
            timestamp: new Date().toISOString(),
            source: 'openrouter'
          });
        }
      } catch (error) {
        console.error('Error using OpenRouter API:', error);
        // Fall back to mock response
      }
    }

    // If we get here, use mock response
    console.log('Using mock response for chat');
    let response = '';

    if (message.toLowerCase().includes('securities') || message.toLowerCase().includes('stocks')) {
      response = 'The document contains the following securities:\n\n';

      if (document.metadata && document.metadata.securities) {
        document.metadata.securities.forEach((security, index) => {
          response += `${index + 1}. ${security.name} (ISIN: ${security.isin}) - ${security.quantity} shares valued at $${security.value}\n`;
        });
      } else {
        response += '1. Apple Inc. (ISIN: US0378331005) - 100 shares valued at $18,000\n' +
          '2. Microsoft Corp. (ISIN: US5949181045) - 150 shares valued at $51,000\n' +
          '3. Amazon.com Inc. (ISIN: US0231351067) - 50 shares valued at $6,500\n' +
          '4. Tesla Inc. (ISIN: US88160R1014) - 75 shares valued at $18,750\n' +
          '5. Meta Platforms Inc. (ISIN: US30303M1027) - 80 shares valued at $23,200';
      }
    } else if (message.toLowerCase().includes('table') || message.toLowerCase().includes('tables')) {
      response = 'The document contains several tables:\n\n' +
        '1. Portfolio Summary\n' +
        '2. Asset Allocation\n' +
        '3. Securities Holdings\n' +
        '4. Fixed Income Holdings\n' +
        '5. Recent Transactions';
    } else if (message.toLowerCase().includes('portfolio') || message.toLowerCase().includes('summary')) {
      response = 'Portfolio Summary:\n\n' +
        'Total Value: $1,250,000.00\n' +
        'Cash Balance: $125,000.00\n' +
        'Invested Amount: $1,125,000.00\n' +
        'Unrealized Gain/Loss: +$75,000.00 (+7.14%)';
    } else if (message.toLowerCase().includes('asset') || message.toLowerCase().includes('allocation')) {
      response = 'Asset Allocation:\n\n' +
        'Equities: 60% ($750,000.00)\n' +
        'Fixed Income: 30% ($375,000.00)\n' +
        'Cash: 10% ($125,000.00)';
    } else {
      response = 'I found the following information in the document:\n\n' +
        `This is a ${document.documentType} document named "${document.fileName}" uploaded on ${new Date(document.uploadDate).toLocaleDateString()}. `;

      if (document.documentType === 'portfolio') {
        response += 'The portfolio has a total value of $1,250,000.00 with investments in equities (60%), ' +
          'fixed income (30%), and cash (10%). The document contains details about securities holdings, ' +
          'fixed income investments, and recent transactions.';
      } else if (document.documentType === 'financial') {
        response += 'This financial report contains information about the company\'s performance, ' +
          'including income statements, balance sheets, and cash flow statements.';
      } else if (document.documentType === 'tax') {
        response += 'This tax document contains information about income, deductions, and tax calculations.';
      } else {
        response += 'The document contains various financial information that you can ask about.';
      }
    }

    // Add a small delay to simulate processing time
    setTimeout(() => {
      res.json({
        documentId,
        message,
        response,
        timestamp: new Date().toISOString(),
        source: 'mock'
      });
    }, 1000);
  } catch (error) {
    console.error('Error in chat endpoint:', error);
    res.status(500).json({
      error: 'Error processing chat request'
    });
  }
});

// Add proper routes for all pages
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/documents-new', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'documents-new.html'));
});

app.get('/upload', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'upload-form.html'));
});

app.get('/chat', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'document-chat.html'));
});

app.get('/document-chat', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'document-chat.html'));
});

app.get('/analytics-new', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'analytics-new.html'));
});

app.get('/document-comparison', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'document-comparison.html'));
});

app.get('/feedback', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'feedback.html'));
});

app.get('/test', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'test.html'));
});

app.get('/simple-test', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'simple-test.html'));
});

// Catch-all route to serve the frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Agent management endpoints
app.get('/api/agents', (req, res) => {
  try {
    const agentStatuses = agentManager.getAllAgentStatuses();
    const systemStats = agentManager.getSystemStats();

    res.json({
      agents: agentStatuses,
      systemStats
    });
  } catch (error) {
    console.error('Error getting agent statuses:', error);
    res.status(500).json({
      error: 'Error getting agent statuses'
    });
  }
});

app.get('/api/agents/:agentType', (req, res) => {
  try {
    const { agentType } = req.params;

    const agentStatus = agentManager.getAgentStatus(agentType);

    if (!agentStatus) {
      return res.status(404).json({
        error: `Agent type ${agentType} not found`
      });
    }

    res.json(agentStatus);
  } catch (error) {
    console.error('Error getting agent status:', error);
    res.status(500).json({
      error: 'Error getting agent status'
    });
  }
});

app.post('/api/agents/:agentType/start', (req, res) => {
  try {
    const { agentType } = req.params;

    const success = agentManager.startAgent(agentType);

    if (!success) {
      return res.status(400).json({
        error: `Failed to start agent ${agentType}`
      });
    }

    res.json({
      success: true,
      message: `Agent ${agentType} started successfully`
    });
  } catch (error) {
    console.error('Error starting agent:', error);
    res.status(500).json({
      error: 'Error starting agent'
    });
  }
});

app.post('/api/agents/:agentType/stop', (req, res) => {
  try {
    const { agentType } = req.params;

    const success = agentManager.stopAgent(agentType);

    if (!success) {
      return res.status(400).json({
        error: `Failed to stop agent ${agentType}`
      });
    }

    res.json({
      success: true,
      message: `Agent ${agentType} stopped successfully`
    });
  } catch (error) {
    console.error('Error stopping agent:', error);
    res.status(500).json({
      error: 'Error stopping agent'
    });
  }
});

app.post('/api/agents/:agentType/test', (req, res) => {
  try {
    const { agentType } = req.params;

    const success = agentManager.testAgent(agentType);

    if (!success) {
      return res.status(400).json({
        error: `Failed to test agent ${agentType}`
      });
    }

    res.json({
      success: true,
      message: `Agent ${agentType} tested successfully`
    });
  } catch (error) {
    console.error('Error testing agent:', error);
    res.status(500).json({
      error: 'Error testing agent'
    });
  }
});

// Add route for agent status page
app.get('/agent-status', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'agent-status.html'));
});

// Add route for API keys page
app.get('/api-keys', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'api-keys.html'));
});

// Initialize agent manager
agentManager.initialize();

// Start the server
app.listen(port, () => {
  console.log(`FinDoc Analyzer server running on port ${port}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Server started at: ${new Date().toISOString()}`);
});
