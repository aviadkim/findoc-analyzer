/**
 * Document Processing Routes
 * This module provides routes for document processing
 */

const express = require('express');
const router = express.Router();

// Get all documents
router.get('/', (req, res) => {
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

// Get document by ID
router.get('/:id', (req, res) => {
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

// Upload document
router.post('/', (req, res) => {
  // Mock document creation
  res.json({
    id: 'doc-' + Date.now(),
    fileName: req.body.fileName || 'Unnamed Document',
    documentType: req.body.documentType || 'other',
    uploadDate: new Date().toISOString(),
    processed: false
  });
});

// Process document
router.post('/process', (req, res) => {
  // Mock document processing
  res.json({
    id: req.body.documentId || 'doc-' + Date.now(),
    processed: true,
    processingDate: new Date().toISOString()
  });
});

// Reprocess document
router.post('/reprocess', (req, res) => {
  // Mock document reprocessing
  res.json({
    id: req.body.documentId || 'doc-' + Date.now(),
    processed: true,
    processingDate: new Date().toISOString()
  });
});

// Ask question about document
router.post('/:id/questions', (req, res) => {
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

module.exports = router;
