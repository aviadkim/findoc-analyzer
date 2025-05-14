/**
 * Enhanced PDF Routes
 * This module provides routes for enhanced PDF operations
 */

const express = require('express');
const router = express.Router();

// Get enhanced PDF status
router.get('/status', (req, res) => {
  res.json({
    status: 'ok',
    available: true,
    message: 'Enhanced PDF processing is available'
  });
});

// Process PDF with enhanced processing
router.post('/process', (req, res) => {
  // Mock enhanced PDF processing
  res.json({
    success: true,
    documentId: req.body.documentId || 'doc-' + Date.now(),
    processed: true,
    processingDate: new Date().toISOString(),
    enhancedProcessing: true
  });
});

// Extract tables from PDF
router.post('/extract-tables', (req, res) => {
  // Mock table extraction
  res.json({
    success: true,
    documentId: req.body.documentId || 'doc-' + Date.now(),
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
  });
});

// Extract securities from PDF
router.post('/extract-securities', (req, res) => {
  // Mock securities extraction
  res.json({
    success: true,
    documentId: req.body.documentId || 'doc-' + Date.now(),
    securities: [
      {
        name: 'Apple Inc.',
        isin: 'US0378331005',
        quantity: 1000,
        acquisitionPrice: 150.00,
        currentValue: 175.00,
        percentOfAssets: 7.0
      },
      {
        name: 'Microsoft',
        isin: 'US5949181045',
        quantity: 800,
        acquisitionPrice: 250.00,
        currentValue: 300.00,
        percentOfAssets: 9.6
      },
      {
        name: 'Amazon',
        isin: 'US0231351067',
        quantity: 500,
        acquisitionPrice: 120.00,
        currentValue: 140.00,
        percentOfAssets: 2.8
      },
      {
        name: 'Tesla',
        isin: 'US88160R1014',
        quantity: 300,
        acquisitionPrice: 200.00,
        currentValue: 180.00,
        percentOfAssets: 2.2
      },
      {
        name: 'Google',
        isin: 'US02079K1079',
        quantity: 200,
        acquisitionPrice: 1200.00,
        currentValue: 1300.00,
        percentOfAssets: 10.4
      }
    ]
  });
});

module.exports = router;
