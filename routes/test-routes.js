/**
 * Test Routes
 * Provides endpoints for testing the document and chat services
 */

const express = require('express');
const router = express.Router();
const documentService = require('../services/document-service');
const chatService = require('../services/chat-service');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { promisify } = require('util');

const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.resolve('./uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: function (req, file, cb) {
    // Accept PDFs and Excel files only
    if (file.mimetype === 'application/pdf' || 
        file.mimetype === 'application/vnd.ms-excel' ||
        file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and Excel files are allowed'));
    }
  }
});

/**
 * @route GET /api/test/ping
 * @description Simple health check
 * @access Public
 */
router.get('/ping', (req, res) => {
  res.json({
    success: true,
    message: 'FinDoc Analyzer API is running',
    timestamp: new Date().toISOString()
  });
});

/**
 * @route GET /api/test/documents
 * @description Get all documents
 * @access Public
 */
router.get('/documents', async (req, res) => {
  try {
    const documents = await documentService.getAllDocuments();
    res.json({
      success: true,
      count: documents.length,
      documents
    });
  } catch (error) {
    console.error('Error retrieving documents:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve documents',
      error: error.message
    });
  }
});

/**
 * @route GET /api/test/documents/:id
 * @description Get document by ID
 * @access Public
 */
router.get('/documents/:id', async (req, res) => {
  try {
    const documentId = req.params.id;
    const document = await documentService.getDocument(documentId);
    
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }
    
    res.json({
      success: true,
      document
    });
  } catch (error) {
    console.error(`Error retrieving document ${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve document',
      error: error.message
    });
  }
});

/**
 * @route POST /api/test/documents/upload
 * @description Upload a document
 * @access Public
 */
router.post('/documents/upload', upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }
    
    // Create document object
    const documentInfo = {
      originalname: req.file.originalname,
      filename: req.file.filename,
      path: req.file.path,
      size: req.file.size,
      mimetype: req.file.mimetype
    };
    
    const document = await documentService.uploadDocument(documentInfo);
    
    res.json({
      success: true,
      message: 'Document uploaded successfully',
      document
    });
  } catch (error) {
    console.error('Error uploading document:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload document',
      error: error.message
    });
  }
});

/**
 * @route POST /api/test/documents/:id/process
 * @description Process a document
 * @access Public
 */
router.post('/documents/:id/process', async (req, res) => {
  try {
    const documentId = req.params.id;
    const document = await documentService.getDocument(documentId);
    
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }
    
    const processedDocument = await documentService.processDocument(documentId);
    
    res.json({
      success: true,
      message: 'Document processed successfully',
      document: processedDocument
    });
  } catch (error) {
    console.error(`Error processing document ${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      message: 'Failed to process document',
      error: error.message
    });
  }
});

/**
 * @route POST /api/test/chat/document/:id
 * @description Chat with a document
 * @access Public
 */
router.post('/chat/document/:id', async (req, res) => {
  try {
    const documentId = req.params.id;
    const { message, sessionId } = req.body;
    
    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Message is required'
      });
    }
    
    const response = await chatService.chatWithDocument(documentId, message, sessionId);
    
    res.json({
      success: true,
      ...response
    });
  } catch (error) {
    console.error(`Error in document chat ${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      message: 'Failed to process chat message',
      error: error.message
    });
  }
});

/**
 * @route POST /api/test/chat/general
 * @description General chat
 * @access Public
 */
router.post('/chat/general', async (req, res) => {
  try {
    const { message, sessionId } = req.body;
    
    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Message is required'
      });
    }
    
    const response = await chatService.generalChat(message, sessionId);
    
    res.json({
      success: true,
      ...response
    });
  } catch (error) {
    console.error('Error in general chat:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process chat message',
      error: error.message
    });
  }
});

/**
 * @route GET /api/test/sample-documents
 * @description Create sample documents for testing
 * @access Public
 */
router.get('/sample-documents', async (req, res) => {
  try {
    // Create sample documents in the results directory
    const resultsDir = path.resolve('./results');
    if (!fs.existsSync(resultsDir)) {
      fs.mkdirSync(resultsDir, { recursive: true });
    }
    
    // Sample document 1
    const document1 = {
      id: 'doc-1',
      fileName: 'Financial Report 2023.pdf',
      documentType: 'financial',
      uploadDate: '2023-12-31T12:00:00Z',
      processed: true,
      status: 'completed',
      securityCount: 5,
      totalValue: '$1,250,000',
      content: {
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
        ]
      }
    };
    
    // Sample document 2
    const document2 = {
      id: 'doc-2',
      fileName: 'Investment Portfolio.pdf',
      documentType: 'portfolio',
      uploadDate: '2023-12-15T10:30:00Z',
      processed: true,
      status: 'completed',
      securityCount: 3,
      totalValue: '$750,000',
      content: {
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
        ]
      }
    };
    
    // Sample document 3
    const document3 = {
      id: 'doc-3',
      fileName: 'Tax Documents 2023.pdf',
      documentType: 'tax',
      uploadDate: '2023-11-20T14:45:00Z',
      processed: true,
      status: 'completed',
      taxableIncome: '$95,000',
      taxDue: '$23,750',
      content: {
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
        ]
      }
    };
    
    // Write sample documents to files
    await writeFileAsync(path.join(resultsDir, 'doc-1.json'), JSON.stringify(document1, null, 2));
    await writeFileAsync(path.join(resultsDir, 'doc-2.json'), JSON.stringify(document2, null, 2));
    await writeFileAsync(path.join(resultsDir, 'doc-3.json'), JSON.stringify(document3, null, 2));
    
    res.json({
      success: true,
      message: 'Sample documents created successfully',
      documents: [
        { id: 'doc-1', fileName: 'Financial Report 2023.pdf' },
        { id: 'doc-2', fileName: 'Investment Portfolio.pdf' },
        { id: 'doc-3', fileName: 'Tax Documents 2023.pdf' }
      ]
    });
  } catch (error) {
    console.error('Error creating sample documents:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create sample documents',
      error: error.message
    });
  }
});

module.exports = router;