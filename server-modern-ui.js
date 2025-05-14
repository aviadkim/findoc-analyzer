/**
 * FinDoc Analyzer - Modern UI Server
 * A simple Express server to serve the modern UI
 */

const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// API routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'FinDoc Analyzer API is running' });
});

// Mock API for document processing
app.post('/api/documents/process', (req, res) => {
  // Simulate processing delay
  setTimeout(() => {
    res.json({
      success: true,
      message: 'Document processed successfully',
      documentId: 'doc-' + Date.now(),
      status: 'processed'
    });
  }, 2000);
});

// Mock API for document chat
app.post('/api/documents/chat', (req, res) => {
  const { message } = req.body;
  
  // Simulate AI response delay
  setTimeout(() => {
    const responses = [
      "Based on the document, the total portfolio value is $1,245,678.90.",
      "The document contains 15 securities, with the largest position being Apple Inc. at 12% of the portfolio.",
      "According to the financial report, the company's revenue increased by 8.3% year-over-year.",
      "The document shows that the debt-to-equity ratio is 0.45, which is considered healthy for this industry.",
      "Based on my analysis, the portfolio has a diversification score of 7.2/10, suggesting room for improvement in sector allocation.",
      "The document indicates that the annual return for this investment was 9.7%, outperforming the benchmark by 1.2%.",
      "I found that the document contains information about 3 different asset classes: equities (65%), fixed income (25%), and alternatives (10%).",
      "According to the financial statement, the company's operating margin improved from 15.3% to 17.8% in the last fiscal year."
    ];
    
    res.json({
      success: true,
      message: responses[Math.floor(Math.random() * responses.length)],
      timestamp: new Date().toISOString()
    });
  }, 1500);
});

// Serve index.html for all other routes
app.get('*', (req, res) => {
  // Check if the requested path exists as an HTML file
  const htmlPath = path.join(__dirname, 'public', req.path + '.html');
  
  if (fs.existsSync(htmlPath)) {
    res.sendFile(htmlPath);
  } else {
    // If not, send the index.html file
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`FinDoc Analyzer Modern UI server running on port ${PORT}`);
  console.log(`Server URL: http://localhost:${PORT}`);
  console.log(`Server started at: ${new Date().toISOString()}`);
});
