/**
 * DeepSeek Routes
 * This module provides routes for DeepSeek API
 */

const express = require('express');
const router = express.Router();

// Get DeepSeek status
router.get('/status', (req, res) => {
  res.json({
    status: 'ok',
    available: true,
    message: 'DeepSeek API is available'
  });
});

// Process document with DeepSeek
router.post('/process', (req, res) => {
  // Mock DeepSeek processing
  res.json({
    success: true,
    documentId: req.body.documentId || 'doc-' + Date.now(),
    processed: true,
    processingDate: new Date().toISOString()
  });
});

// Ask question with DeepSeek
router.post('/ask', (req, res) => {
  // Mock DeepSeek Q&A
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
    success: true,
    question,
    answer,
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
