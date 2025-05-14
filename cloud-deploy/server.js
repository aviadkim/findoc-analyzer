const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// Load environment variables (if available)
try {
  require('dotenv').config();
} catch (error) {
  console.log('dotenv not available, continuing without it');
}

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

fs.mkdirSync(uploadDir, { recursive: true });
fs.mkdirSync(tempDir, { recursive: true });
fs.mkdirSync(resultsDir, { recursive: true });

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Auth routes
app.get('/auth/google/callback', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'auth', 'google', 'callback.html'));
});

// Import simple injector middleware
const simpleInjectorMiddleware = require('./middleware/simple-injector');

// Use simple injector middleware
app.use(simpleInjectorMiddleware);

// API routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'FinDoc Analyzer API is running' });
});

// Import scan1Controller
let scan1Controller;
try {
  scan1Controller = require('./backv2-github/DevDocs/findoc-app-engine-v2/src/api/controllers/scan1Controller');
  console.log('Successfully imported scan1Controller');
} catch (error) {
  console.warn('Error importing scan1Controller:', error.message);
  console.log('Trying alternative path...');

  try {
    scan1Controller = require('./src/api/controllers/scan1Controller');
    console.log('Successfully imported scan1Controller from alternative path');
  } catch (altError) {
    console.warn('Error importing scan1Controller from alternative path:', altError.message);

    // Create a mock scan1Controller
    console.log('Creating mock scan1Controller');
    scan1Controller = {
      processDocumentWithScan1: (req, res) => {
        res.status(500).json({
          success: false,
          error: 'scan1Controller not available',
          message: 'The scan1Controller module could not be loaded'
        });
      },
      getScan1Status: (req, res) => {
        res.status(200).json({
          success: true,
          scan1Available: false,
          message: 'scan1Controller not available',
          error: 'The scan1Controller module could not be loaded'
        });
      },
      verifyGeminiApiKey: (req, res) => {
        res.status(500).json({
          success: false,
          error: 'scan1Controller not available',
          message: 'The scan1Controller module could not be loaded'
        });
      },
      isScan1Available: async () => {
        return false;
      }
    };
  }
}

const {
  processDocumentWithScan1,
  getScan1Status,
  verifyGeminiApiKey
} = scan1Controller;

// Document processing routes
const documentProcessingRoutes = require('./routes/document-processing-routes');
app.use('/api/documents', documentProcessingRoutes);

// Document chat API route
app.get('/api/document-chat', (req, res) => {
  const documentId = req.query.documentId;
  const message = req.query.message;

  console.log(`Document chat request: documentId=${documentId}, message=${message}`);

  // Mock response
  res.json({
    success: true,
    documentId,
    message,
    response: 'I found the following information in the document: The document contains financial information for Apple Inc. (ISIN: US0378331005) and Microsoft Corporation (ISIN: US5949181045).'
  });
});

// DeepSeek API routes
const deepSeekRoutes = require('./routes/deepseek-routes');
app.use('/api/deepseek', deepSeekRoutes);

// Multi-document analysis routes
const multiDocumentRoutes = require('./routes/multi-document-routes');
app.use('/api/multi-document', multiDocumentRoutes);

// Supabase integration routes
const supabaseRoutes = require('./routes/supabase-routes');
app.use('/api/supabase', supabaseRoutes);

// Enhanced PDF processing routes
const enhancedPdfRoutes = require('./routes/enhanced-pdf-routes');
app.use('/api/enhanced-pdf', enhancedPdfRoutes);

// Advanced data visualization routes
const dataVisualizationRoutes = require('./routes/data-visualization-routes');
app.use('/api/visualization', dataVisualizationRoutes);

// Export routes
const exportRoutes = require('./routes/export-routes');
app.use('/api/export', exportRoutes);

// Batch processing routes
const batchProcessingRoutes = require('./routes/batch-processing-routes');
app.use('/api/batch', batchProcessingRoutes);

// Chat API routes
const chatApiRoutes = require('./routes/chat-api-routes');
app.use('/api', chatApiRoutes);
console.log('Successfully imported Chat API routes');

// Process API routes
const processApiRoutes = require('./routes/process-api-routes');
app.use('/api', processApiRoutes);
console.log('Successfully imported Process API routes');

// Agents API routes
const agentsApiRoutes = require('./routes/agents-api-routes');
app.use('/api', agentsApiRoutes);
console.log('Successfully imported Agents API routes');

// Direct scan1 routes
app.post('/api/scan1/:id', processDocumentWithScan1);
app.get('/api/scan1/status', getScan1Status);
app.post('/api/scan1/verify-gemini-key', verifyGeminiApiKey);

// Document upload endpoint
app.post('/api/documents/upload', (req, res) => {
  // Mock response for testing
  res.status(200).json({
    success: true,
    documentId: doc-\,
    fileName: req.body.fileName || 'document.pdf',
    fileSize: req.body.fileSize || 1024 * 1024,
    uploadTime: new Date().toISOString(),
    status: 'uploaded'
  });
});

// Document processing endpoint
app.post('/api/documents/process', (req, res) => {
  const { documentId } = req.body;

  // Mock response for testing
  res.status(200).json({
    success: true,
    documentId: documentId || doc-\,
    status: 'completed',
    processingTime: '3.7 seconds',
    agents: {
      'Document Analyzer': { status: 'completed', time: '1.2s' },
      'Table Understanding': { status: 'completed', time: '0.8s' },
      'Securities Extractor': { status: 'completed', time: '1.1s' },
      'Financial Reasoner': { status: 'completed', time: '0.6s' }
    }
  });
});

// Document reprocessing endpoint
app.post('/api/documents/reprocess', (req, res) => {
  const { documentId } = req.body;

  // Mock response for testing
  res.status(200).json({
    success: true,
    documentId: documentId || doc-\,
    status: 'completed',
    processingTime: '2.3 seconds',
    agents: {
      'Enhanced Document Analyzer': { status: 'completed', time: '0.7s' },
      'Advanced Table Understanding': { status: 'completed', time: '0.5s' },
      'Securities Extractor v2': { status: 'completed', time: '0.6s' },
      'Financial Reasoner with Market Data': { status: 'completed', time: '0.5s' },
      'Bloomberg Agent': { status: 'completed', time: '0.4s' }
    },
    improvements: [
      'Enhanced table extraction with 98.7% accuracy',
      'Added market data comparison',
      'Improved securities identification',
      'Added trend analysis'
    ]
  });
});

// Document chat endpoint
app.post('/api/documents/chat', (req, res) => {
  const { documentId, message } = req.body;

  // Mock responses based on the question
  let response = '';

  if (message.toLowerCase().includes('total value') || message.toLowerCase().includes('portfolio value')) {
    response = 'The total value of the portfolio is ,250,000.00 as of the latest valuation date.';
  } else if (message.toLowerCase().includes('top 3') || message.toLowerCase().includes('top three') || message.toLowerCase().includes('largest holdings')) {
    response = 'The top 3 holdings in the portfolio are:\\n1. Alphabet Inc. (GOOG) - ,000.00 (20.8%)\\n2. Microsoft Corp. (MSFT) - ,000.00 (19.2%)\\n3. Apple Inc. (AAPL) - ,000.00 (14.0%)';
  } else if (message.toLowerCase().includes('apple') && message.toLowerCase().includes('percentage')) {
    response = 'Apple Inc. (AAPL) represents 14.0% of the total portfolio value.';
  } else if (message.toLowerCase().includes('microsoft') && message.toLowerCase().includes('acquisition price')) {
    response = 'The average acquisition price for Microsoft shares is .50 per share. The current price is .00, representing a gain of 8.9%.';
  } else if (message.toLowerCase().includes('asset allocation') || message.toLowerCase().includes('allocation')) {
    response = 'The asset allocation of the portfolio is:\\n- Equities: 60% (,000.00)\\n- Fixed Income: 30% (,000.00)\\n- Cash: 10% (,000.00)';
  } else if (message.toLowerCase().includes('performance') || message.toLowerCase().includes('return')) {
    response = 'The portfolio has a year-to-date return of 7.14% (,000.00). The best performing asset is Microsoft Corp. with a return of 12.3%.';
  } else if (message.toLowerCase().includes('risk') || message.toLowerCase().includes('volatility')) {
    response = 'The portfolio has a moderate risk profile with a volatility (standard deviation) of 12.5%. The Sharpe ratio is 1.2, indicating good risk-adjusted returns.';
  } else {
    response = 'I don\\'t have specific information about that in the document. Would you like to know about the total portfolio value, top holdings, asset allocation, or performance?';
  }

  // Mock response for testing
  res.status(200).json({
    success: true,
    documentId: documentId || doc-\,
    message: message,
    response: response,
    timestamp: new Date().toISOString()
  });
});

// Docling API status endpoint
app.get('/api/docling/status', (req, res) => {
  // Mock response for testing
  res.status(200).json({
    success: true,
    doclingConfigured: true,
    doclingAvailable: true,
    environment: {
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch
    }
  });
});

// Alternative Docling API status endpoint (for backward compatibility)
app.get('/api/docling-status', (req, res) => {
  res.status(200).json({
    success: true,
    doclingConfigured: true,
    doclingAvailable: true,
    environment: {
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch
    }
  });
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

app.get('/document-details.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'document-details.html'));
});

app.get('/analytics-new', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'analytics-new.html'));
});

app.get('/document-comparison', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'document-comparison.html'));
});

app.get('/document-chat', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'document-chat.html'));
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

app.get('/ui-components-test', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'ui-components-test.html'));
});

app.get('/html-injector-bookmarklet', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'html-injector-bookmarklet.html'));
});

app.get('/ui-injector', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'ui-injector.html'));
});

// Add a health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'FinDoc Analyzer API is running',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

// Add mock API endpoints
app.post('/api/documents', (req, res) => {
  // Mock document creation
  res.json({
    id: 'doc-' + Date.now(),
    fileName: req.body.fileName || 'Unnamed Document',
    documentType: req.body.documentType || 'other',
    uploadDate: new Date().toISOString(),
    processed: false
  });
});

app.get('/api/documents', (req, res) => {
  // Mock document list
  res.json([
    {
      id: 'doc-1',
      fileName: 'Financial Report 2023.pdf',
      documentType: 'financial',
      uploadDate: '2023-12-31T12:00:00Z',
      processed: true
    },
    {
      id: 'doc-2',
      fileName: 'Investment Portfolio.pdf',
      documentType: 'portfolio',
      uploadDate: '2023-12-15T10:30:00Z',
      processed: true
    },
    {
      id: 'doc-3',
      fileName: 'Tax Documents 2023.pdf',
      documentType: 'tax',
      uploadDate: '2023-11-20T14:45:00Z',
      processed: true
    }
  ]);
});

app.post('/api/documents/process', (req, res) => {
  // Mock document processing
  res.json({
    id: req.body.documentId,
    processed: true,
    processingDate: new Date().toISOString()
  });
});

app.get('/api/documents/:id', (req, res) => {
  // Mock document retrieval
  const documentId = req.params.id;

  // Mock document content based on ID
  let documentContent = null;

  if (documentId === 'doc-1') {
    documentContent = {
      text: `Financial Report 2023

Company: ABC Corporation
Date: December 31, 2023

Executive Summary

This financial report presents the financial performance of ABC Corporation for the fiscal year 2023.

Financial Highlights:
- Total Revenue: $10,500,000
- Operating Expenses: $7,200,000
- Net Profit: $3,300,000
- Profit Margin: 31.4%

Balance Sheet Summary:
- Total Assets: $25,000,000
- Total Liabilities: $12,000,000
- Shareholders' Equity: $13,000,000`,
      tables: [
        {
          id: 'table-1',
          title: 'Investment Portfolio',
          headers: ['Security', 'ISIN', 'Quantity', 'Acquisition Price', 'Current Value', '% of Assets'],
          rows: [
            ['Apple Inc.', 'US0378331005', '1,000', '$150.00', '$175.00', '7.0%'],
            ['Microsoft', 'US5949181045', '800', '$250.00', '$300.00', '9.6%'],
            ['Amazon', 'US0231351067', '500', '$120.00', '$140.00', '2.8%'],
            ['Tesla', 'US88160R1014', '300', '$200.00', '$180.00', '2.2%'],
            ['Google', 'US02079K1079', '200', '$1,200.00', '$1,300.00', '10.4%']
          ]
        }
      ],
      metadata: {
        author: 'John Smith',
        createdDate: 'December 31, 2023',
        modifiedDate: 'January 15, 2024',
        documentFormat: 'PDF 1.7',
        keywords: 'financial, report, 2023, ABC Corporation'
      }
    };
  } else if (documentId === 'doc-2') {
    documentContent = {
      text: `Investment Portfolio

Account: ABC123456
Date: December 15, 2023

Portfolio Summary

This document presents the current investment portfolio for account ABC123456.

Portfolio Highlights:
- Total Value: $1,250,000
- Annual Return: 8.5%
- Risk Level: Moderate
- Asset Allocation: 60% Stocks, 30% Bonds, 10% Cash`,
      tables: [
        {
          id: 'table-1',
          title: 'Asset Allocation',
          headers: ['Asset Class', 'Allocation', 'Value'],
          rows: [
            ['Stocks', '60%', '$750,000'],
            ['Bonds', '30%', '$375,000'],
            ['Cash', '10%', '$125,000']
          ]
        }
      ],
      metadata: {
        author: 'Jane Doe',
        createdDate: 'December 15, 2023',
        modifiedDate: 'December 15, 2023',
        documentFormat: 'PDF 1.7',
        keywords: 'investment, portfolio, stocks, bonds, cash'
      }
    };
  } else if (documentId === 'doc-3') {
    documentContent = {
      text: `Tax Documents 2023

Taxpayer: John Doe
Tax ID: XXX-XX-1234
Date: November 20, 2023

Tax Summary

This document contains tax information for the fiscal year 2023.

Tax Highlights:
- Total Income: $120,000
- Total Deductions: $25,000
- Taxable Income: $95,000
- Tax Due: $23,750`,
      tables: [
        {
          id: 'table-1',
          title: 'Income Sources',
          headers: ['Source', 'Amount'],
          rows: [
            ['Salary', '$100,000'],
            ['Dividends', '$15,000'],
            ['Interest', '$5,000']
          ]
        }
      ],
      metadata: {
        author: 'Tax Department',
        createdDate: 'November 20, 2023',
        modifiedDate: 'November 20, 2023',
        documentFormat: 'PDF 1.7',
        keywords: 'tax, 2023, income, deductions'
      }
    };
  } else {
    // For any other document ID, create generic content
    documentContent = {
      text: `Sample Document

This is a sample document with ID ${documentId}.`,
      tables: [],
      metadata: {
        author: 'Unknown',
        createdDate: new Date().toISOString(),
        modifiedDate: new Date().toISOString(),
        documentFormat: 'PDF',
        keywords: 'sample, document'
      }
    };
  }

  res.json({
    id: documentId,
    fileName: documentId === 'doc-1' ? 'Financial Report 2023.pdf' :
              documentId === 'doc-2' ? 'Investment Portfolio.pdf' :
              documentId === 'doc-3' ? 'Tax Documents 2023.pdf' :
              'Document ' + documentId + '.pdf',
    documentType: documentId === 'doc-1' ? 'financial' :
                  documentId === 'doc-2' ? 'portfolio' :
                  documentId === 'doc-3' ? 'tax' :
                  'other',
    uploadDate: new Date().toISOString(),
    processed: true,
    content: documentContent
  });
});

app.post('/api/documents/:id/questions', (req, res) => {
  // Mock Q&A
  const question = req.body.question || '';
  let answer = 'I don\'t know the answer to that question.';

  if (question.toLowerCase().includes('revenue')) {
    answer = 'The total revenue is $10,500,000.';
  } else if (question.toLowerCase().includes('profit')) {
    answer = 'The net profit is $3,300,000 with a profit margin of 31.4%.';
  } else if (question.toLowerCase().includes('asset')) {
    answer = 'The total assets are $25,000,000.';
  } else if (question.toLowerCase().includes('liabilit')) {
    answer = 'The total liabilities are $12,000,000.';
  } else if (question.toLowerCase().includes('equity')) {
    answer = 'The shareholders\' equity is $13,000,000.';
  } else if (question.toLowerCase().includes('apple') || question.toLowerCase().includes('microsoft') || question.toLowerCase().includes('amazon') || question.toLowerCase().includes('tesla') || question.toLowerCase().includes('google')) {
    answer = 'The investment portfolio includes holdings in Apple Inc., Microsoft, Amazon, Tesla, and Google. Would you like specific details about any of these securities?';
  }

  res.json({
    question,
    answer,
    timestamp: new Date().toISOString()
  });
});

// Catch-all route to serve the frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(port, () => {
  console.log(`FinDoc Analyzer server running on port ${port}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
});

