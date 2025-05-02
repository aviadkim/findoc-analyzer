const express = require('express');
const path = require('path');
const { parse } = require('url');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 8080;

// Serve the document details page
app.get('/document-details.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'document-details.html'));
});

// Serve the documents page
app.get('/documents-new', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'documents-new.html'));
});

// Serve the upload page
app.get('/upload', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'upload.html'));
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'FinDoc Analyzer API is running',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Add mock API endpoints
app.use(express.json());

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

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Serve static files from the Next.js build (for backward compatibility)
app.use('/_next', express.static(path.join(__dirname, 'frontend/.next')));
app.use('/public', express.static(path.join(__dirname, 'frontend/public')));

// Map of routes to their corresponding JS files
const routeMap = {
  '/': 'index.js',
  '/documents': 'documents-new.js',
  '/documents-new': 'documents-new.js',
  '/analytics': 'analytics-new.js',
  '/analytics-new': 'analytics-new.js',
  '/feedback': 'feedback.js',
  '/document-comparison': 'document-comparison.js',
  '/dashboard': 'dashboard.js',
  '/portfolio': 'portfolio.js',
  '/settings': 'settings.js',
  '/upload': 'upload.js'
};

// Serve all other requests with the Next.js app
app.get('*', (req, res) => {
  const parsedUrl = parse(req.url, true);
  let { pathname } = parsedUrl;

  // Remove trailing slash if present
  if (pathname.endsWith('/') && pathname !== '/') {
    pathname = pathname.slice(0, -1);
  }

  // Check if the pathname has a .html extension
  if (pathname.endsWith('.html')) {
    // Remove the .html extension
    pathname = pathname.slice(0, -5);

    // Redirect to the clean URL
    return res.redirect(pathname);
  }

  // Get the corresponding JS file for the route
  const jsFile = routeMap[pathname] || `${pathname.slice(1)}.js`;

  // Check if the JS file exists
  const jsFilePath = path.join(__dirname, 'frontend/.next/server/pages', jsFile);

  if (fs.existsSync(jsFilePath)) {
    // Serve the HTML for the route
    const html = generateHtml(jsFile);
    res.send(html);
  } else {
    // Try to serve a static file
    const staticFilePath = path.join(__dirname, 'frontend/public', pathname);

    if (fs.existsSync(staticFilePath)) {
      res.sendFile(staticFilePath);
    } else {
      // Serve the 404 page
      const html = generateHtml('_error.js');
      res.status(404).send(html);
    }
  }
});

// Generate HTML for a route
function generateHtml(jsFile) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>FinDoc Analyzer</title>
  <style>
    /* Base styles */
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      margin: 0;
      padding: 0;
      background-color: #f8f9fa;
      color: #333;
    }

    /* Layout */
    .app-container {
      display: flex;
      min-height: 100vh;
      position: relative;
    }

    .sidebar {
      width: 280px;
      background-color: #2c3e50;
      color: white;
      padding: 20px 0;
      box-shadow: 2px 0 5px rgba(0,0,0,0.1);
      position: fixed;
      top: 0;
      left: 0;
      bottom: 0;
      z-index: 100;
      overflow-y: auto;
    }

    .main-content {
      flex: 1;
      padding: 20px;
      overflow-y: auto;
      margin-left: 280px;
      width: calc(100% - 280px);
    }

    /* Sidebar */
    .sidebar-header {
      padding: 0 20px 20px;
      border-bottom: 1px solid rgba(255,255,255,0.1);
      margin-bottom: 20px;
    }

    .sidebar-logo {
      font-size: 1.5rem;
      font-weight: bold;
      color: white;
      text-decoration: none;
      display: flex;
      align-items: center;
    }

    .sidebar-nav {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .sidebar-nav li {
      margin-bottom: 5px;
    }

    .sidebar-nav a {
      display: flex;
      align-items: center;
      padding: 10px 20px;
      color: rgba(255,255,255,0.8);
      text-decoration: none;
      transition: all 0.3s;
    }

    .sidebar-nav a:hover, .sidebar-nav a.active {
      background-color: rgba(255,255,255,0.1);
      color: white;
    }

    .sidebar-nav a i, .sidebar-nav a .icon {
      margin-right: 10px;
      width: 20px;
      text-align: center;
    }

    /* Documents page */
    .documents-page {
      padding: 20px;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    .page-title {
      font-size: 1.75rem;
      margin: 0;
    }

    .action-buttons {
      display: flex;
      gap: 10px;
      margin-bottom: 20px;
    }

    .action-btn {
      display: flex;
      align-items: center;
      padding: 8px 15px;
      background-color: #f8f9fa;
      border: 1px solid #dee2e6;
      border-radius: 4px;
      color: #495057;
      text-decoration: none;
      font-size: 0.9rem;
      transition: all 0.2s;
    }

    .action-btn:hover {
      background-color: #e9ecef;
      border-color: #ced4da;
    }

    .action-btn .icon {
      margin-right: 5px;
    }

    .document-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 20px;
    }

    .document-card {
      background-color: rgb(249, 250, 251);
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
      overflow: hidden;
      transition: transform 0.3s, box-shadow 0.3s;
    }

    .document-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 5px 15px rgba(0,0,0,0.1);
    }

    .document-card-header {
      padding: 15px;
      border-bottom: 1px solid #eee;
    }

    .document-card-body {
      padding: 15px;
    }

    .document-card-footer {
      padding: 15px;
      border-top: 1px solid #eee;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    /* Analytics page */
    .analytics-page {
      padding: 20px;
    }

    .chart-container {
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
      padding: 20px;
      margin-bottom: 20px;
    }

    /* Feedback page */
    .feedback-page {
      padding: 20px;
      max-width: 800px;
      margin: 0 auto;
    }

    .feedback-form {
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
      padding: 30px;
      border: 1px solid #e2e8f0;
    }

    .form-group {
      margin-bottom: 20px;
    }

    .rating-container {
      display: flex;
      gap: 10px;
    }

    /* Document comparison page */
    .document-comparison-page {
      padding: 20px;
    }

    .comparison-container {
      display: grid;
      grid-template-columns: 350px 1fr;
      gap: 20px;
    }

    .document-selection {
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
      border: 1px solid #e2e8f0;
      display: flex;
      flex-direction: column;
      height: calc(100vh - 180px);
    }

    /* Upload page */
    .upload-page {
      padding: 20px;
    }

    .upload-container {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 30px;
    }

    .upload-area {
      background-color: white;
      border: 2px dashed #cbd5e0;
      border-radius: 8px;
      padding: 40px;
      text-align: center;
      transition: all 0.3s;
      cursor: pointer;
    }

    .upload-area.dragover {
      background-color: #ebf8ff;
      border-color: #3498db;
    }

    .upload-icon {
      font-size: 48px;
      margin-bottom: 15px;
    }

    .upload-btn {
      display: inline-block;
      background-color: #3498db;
      color: white;
      padding: 10px 20px;
      border-radius: 4px;
      cursor: pointer;
      margin-top: 15px;
      transition: background-color 0.3s;
    }

    .upload-btn:hover {
      background-color: #2980b9;
    }

    .upload-options {
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
      padding: 20px;
      border: 1px solid #e2e8f0;
    }

    .checkbox-group {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      margin-top: 10px;
    }

    .checkbox {
      display: flex;
      align-items: center;
      gap: 5px;
    }

    .upload-status {
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
      padding: 20px;
      margin-bottom: 30px;
      border: 1px solid #e2e8f0;
    }

    .progress-container {
      background-color: #edf2f7;
      border-radius: 4px;
      height: 10px;
      margin: 15px 0;
      overflow: hidden;
    }

    .progress-bar {
      background-color: #3498db;
      height: 100%;
      width: 0%;
      transition: width 0.3s;
    }

    .status-text {
      font-size: 0.9rem;
      color: #718096;
    }

    .upload-history {
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
      padding: 20px;
      border: 1px solid #e2e8f0;
    }

    .upload-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 15px;
    }

    .upload-table th, .upload-table td {
      padding: 12px 15px;
      text-align: left;
      border-bottom: 1px solid #e2e8f0;
    }

    .upload-table th {
      background-color: #f7fafc;
      font-weight: 600;
    }

    .status-badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 0.75rem;
    }

    .status-badge.success {
      background-color: #c6f6d5;
      color: #2f855a;
    }

    .status-badge.processing {
      background-color: #fefcbf;
      color: #975a16;
    }

    .status-badge.error {
      background-color: #fed7d7;
      color: #c53030;
    }
  </style>
</head>
<body>
  <div id="__next">
    <div class="app-container">
      <div class="sidebar">
        <div class="sidebar-header">
          <a href="/" class="sidebar-logo">FinDoc Analyzer</a>
        </div>
        <ul class="sidebar-nav">
          <li><a href="/"><span class="icon icon-home"></span>Dashboard</a></li>
          <li><a href="/documents-new"><span class="icon icon-file-text"></span>My Documents</a></li>
          <li><a href="/analytics-new"><span class="icon icon-bar-chart"></span>Analytics</a></li>
          <li><a href="/portfolio"><span class="icon icon-pie-chart"></span>Portfolio</a></li>
          <li><a href="/document-comparison"><span class="icon icon-git-compare"></span>Document Comparison</a></li>
          <li><a href="/feedback"><span class="icon icon-message-circle"></span>Feedback</a></li>
          <li><a href="/settings"><span class="icon icon-settings"></span>Settings</a></li>
        </ul>
      </div>
      <div class="main-content">
        <div id="page-content"></div>
      </div>
    </div>
  </div>
  <script>
    // Simple client-side routing
    document.addEventListener('DOMContentLoaded', function() {
      const pageContent = document.getElementById('page-content');
      const path = window.location.pathname;

      // Set active nav item
      document.querySelectorAll('.sidebar-nav a').forEach(link => {
        if (link.getAttribute('href') === path) {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      });

      // Add event listeners for interactive elements
      function addEventListeners() {
        // Rating buttons
        document.querySelectorAll('.rating-btn').forEach(button => {
          button.addEventListener('click', function() {
            document.querySelectorAll('.rating-btn').forEach(btn => {
              btn.classList.remove('active');
            });
            this.classList.add('active');
          });
        });

        // Submit buttons
        document.querySelectorAll('.submit-btn').forEach(button => {
          button.addEventListener('click', function(e) {
            e.preventDefault();
            alert('Form submitted successfully!');
          });
        });

        // Upload button
        const uploadBtn = document.querySelector('.upload-btn');
        if (uploadBtn) {
          uploadBtn.addEventListener('click', function(e) {
            if (path !== '/upload') {
              e.preventDefault();
              window.location.href = '/upload';
            }
          });
        }

        // Action buttons
        document.querySelectorAll('.action-btn').forEach(button => {
          button.addEventListener('click', function(e) {
            e.preventDefault();
            const action = this.textContent.trim();
            alert(`${action} action triggered!`);
          });
        });
      }

      // Call addEventListeners after the page content is loaded
      setTimeout(addEventListeners, 100);

      // Load page content based on path
      switch(path) {
        case '/documents-new':
          pageContent.innerHTML = '<div class="documents-page"><div class="page-header"><h1 class="page-title">My Documents</h1><a href="/upload" class="upload-btn">Upload Document</a></div><div class="action-buttons"><a href="/documents-new" class="action-btn"><span class="icon">📤</span>Export</a><a href="/documents-new" class="action-btn"><span class="icon">🔄</span>Refresh</a></div><div class="document-grid"><div class="document-card"><div class="document-card-header"><h3>Financial Report Q1 2024</h3></div><div class="document-card-body"><p>Quarterly financial report for Q1 2024</p></div><div class="document-card-footer"><span>PDF</span><span>April 15, 2024</span></div></div><div class="document-card"><div class="document-card-header"><h3>Investment Portfolio</h3></div><div class="document-card-body"><p>Current investment portfolio analysis</p></div><div class="document-card-footer"><span>PDF</span><span>April 10, 2024</span></div></div><div class="document-card"><div class="document-card-header"><h3>Tax Documents 2023</h3></div><div class="document-card-body"><p>Tax documents for fiscal year 2023</p></div><div class="document-card-footer"><span>PDF</span><span>March 20, 2024</span></div></div></div></div>';
          break;
        case '/analytics-new':
          pageContent.innerHTML = '<div class="analytics-page"><div class="page-header"><h1 class="page-title">Analytics</h1></div><div class="action-buttons"><a href="/analytics-new" class="action-btn"><span class="icon">📤</span>Export</a><a href="/analytics-new" class="action-btn"><span class="icon">🔄</span>Refresh</a></div><div class="chart-container"><h2>Portfolio Performance</h2><div class="chart-placeholder" style="height: 300px; background-color: #f5f5f5; display: flex; align-items: center; justify-content: center;">Chart Placeholder</div></div><div class="chart-container"><h2>Asset Allocation</h2><div class="chart-placeholder" style="height: 300px; background-color: #f5f5f5; display: flex; align-items: center; justify-content: center;">Chart Placeholder</div></div></div>';
          break;
        case '/feedback':
          pageContent.innerHTML = '<div class="feedback-page"><h1 class="page-title">Feedback</h1><p class="page-description">We value your feedback! Please let us know what you think about the FinDoc Analyzer application.</p><form class="feedback-form"><div class="form-group"><label for="name">Name</label><input type="text" id="name" name="name" placeholder="Your name" required></div><div class="form-group"><label for="email">Email</label><input type="email" id="email" name="email" placeholder="Your email address" required></div><div class="form-group"><label for="feedbackType">Feedback Type</label><select id="feedbackType" name="feedbackType" required><option value="general">General Feedback</option><option value="bug">Bug Report</option><option value="feature">Feature Request</option><option value="ui">UI/UX Feedback</option><option value="performance">Performance Issue</option></select></div><div class="form-group"><label>Rating</label><div class="rating-container"><button type="button" class="rating-btn">1</button><button type="button" class="rating-btn">2</button><button type="button" class="rating-btn active">3</button><button type="button" class="rating-btn">4</button><button type="button" class="rating-btn">5</button></div></div><div class="form-group"><label for="message">Feedback</label><textarea id="message" name="message" placeholder="Please provide your feedback here..." rows="5" required></textarea></div><button type="submit" class="submit-btn">Submit Feedback</button></form></div>';
          break;
        case '/document-comparison':
          pageContent.innerHTML = '<div class="document-comparison-page"><h1 class="page-title">Document Comparison</h1><p class="page-description">Compare two documents to identify changes and differences between them.</p><div class="comparison-container"><div class="document-selection"><div class="selection-header"><h2>Select Documents</h2><div class="search-box"><input type="text" placeholder="Search documents..."></div></div><div class="document-list"><div class="document-item"><div class="document-icon">📄</div><div class="document-info"><div class="document-name">Q1 Financial Report 2024</div><div class="document-meta">PDF • April 15, 2024</div></div></div><div class="document-item"><div class="document-icon">📄</div><div class="document-info"><div class="document-name">Q4 Financial Report 2023</div><div class="document-meta">PDF • January 10, 2024</div></div></div><div class="document-item"><div class="document-icon">📄</div><div class="document-info"><div class="document-name">Annual Report 2023</div><div class="document-meta">PDF • March 25, 2024</div></div></div></div><div class="selection-actions"><button class="compare-btn">Compare Documents</button></div></div><div class="comparison-results"><div class="no-results"><h3>No Comparison Results</h3><p>Select two documents and click "Compare Documents" to see the differences between them.</p></div></div></div></div>';
          break;
        case '/upload':
          pageContent.innerHTML = '<div class="upload-page"><h1 class="page-title">Upload Document</h1><p class="page-description">Upload a document to analyze and process with FinDoc Analyzer.</p><div class="upload-container"><div class="upload-area" id="dropzone"><div class="upload-icon">📤</div><h3>Drag & Drop Files Here</h3><p>or</p><label for="file-input" class="upload-btn">Browse Files</label><input type="file" id="file-input" style="display: none;" multiple accept=".pdf,.xlsx,.xls,.csv,.docx,.doc"></div><div class="upload-options"><h3>Upload Options</h3><div class="form-group"><label for="document-type">Document Type</label><select id="document-type"><option value="financial">Financial Report</option><option value="portfolio">Portfolio Statement</option><option value="tax">Tax Document</option><option value="other">Other</option></select></div><div class="form-group"><label for="processing-options">Processing Options</label><div class="checkbox-group"><div class="checkbox"><input type="checkbox" id="extract-text" checked><label for="extract-text">Extract Text</label></div><div class="checkbox"><input type="checkbox" id="extract-tables" checked><label for="extract-tables">Extract Tables</label></div><div class="checkbox"><input type="checkbox" id="extract-metadata" checked><label for="extract-metadata">Extract Metadata</label></div><div class="checkbox"><input type="checkbox" id="analyze-content" checked><label for="analyze-content">Analyze Content</label></div></div></div></div></div><div class="upload-status" style="display: none;"><h3>Upload Progress</h3><div class="progress-container"><div class="progress-bar" style="width: 0%;"></div></div><div class="status-text">Preparing to upload...</div></div><div class="upload-history"><h3>Recent Uploads</h3><table class="upload-table"><thead><tr><th>Filename</th><th>Type</th><th>Size</th><th>Upload Date</th><th>Status</th></tr></thead><tbody><tr><td>Annual Report 2023.pdf</td><td>PDF</td><td>2.4 MB</td><td>April 20, 2024</td><td><span class="status-badge success">Completed</span></td></tr><tr><td>Q1 Financial Report.xlsx</td><td>Excel</td><td>1.8 MB</td><td>April 18, 2024</td><td><span class="status-badge success">Completed</span></td></tr><tr><td>Investment Portfolio.pdf</td><td>PDF</td><td>3.2 MB</td><td>April 15, 2024</td><td><span class="status-badge processing">Processing</span></td></tr></tbody></table></div></div>';

          // Add upload functionality
          setTimeout(() => {
            const dropzone = document.getElementById('dropzone');
            const fileInput = document.getElementById('file-input');
            const uploadStatus = document.querySelector('.upload-status');
            const progressBar = document.querySelector('.progress-bar');
            const statusText = document.querySelector('.status-text');

            if (dropzone && fileInput) {
              // Handle file selection
              fileInput.addEventListener('change', function(e) {
                handleFiles(e.target.files);
              });

              // Handle drag and drop
              dropzone.addEventListener('dragover', function(e) {
                e.preventDefault();
                dropzone.classList.add('dragover');
              });

              dropzone.addEventListener('dragleave', function() {
                dropzone.classList.remove('dragover');
              });

              dropzone.addEventListener('drop', function(e) {
                e.preventDefault();
                dropzone.classList.remove('dragover');
                handleFiles(e.dataTransfer.files);
              });

              // Handle file upload
              function handleFiles(files) {
                if (files.length === 0) return;

                uploadStatus.style.display = 'block';
                statusText.textContent = 'Uploading files...';

                // Simulate upload progress
                let progress = 0;
                const interval = setInterval(() => {
                  progress += 5;
                  progressBar.style.width = progress + '%';

                  if (progress >= 100) {
                    clearInterval(interval);
                    statusText.textContent = 'Upload completed!';
                    setTimeout(() => {
                      alert('Files uploaded successfully!');
                      window.location.href = '/documents-new';
                    }, 1000);
                  }
                }, 200);
              }
            }
          }, 100);
          break;
        default:
          pageContent.innerHTML = '<div class="dashboard-page"><h1 class="page-title">Dashboard</h1><div class="dashboard-content"><div class="dashboard-card"><h2>Recent Documents</h2><ul><li>Financial Report Q1 2024</li><li>Investment Portfolio</li><li>Tax Documents 2023</li></ul></div><div class="dashboard-card"><h2>Analytics Overview</h2><div class="chart-placeholder" style="height: 200px; background-color: #f5f5f5; display: flex; align-items: center; justify-content: center;">Chart Placeholder</div></div></div></div>';
      }
    });
  </script>
</body>
</html>`;
}

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
});
