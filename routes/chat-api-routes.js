/**
 * Chat API Routes
 * This module provides routes for chat functionality
 */

const express = require('express');
const router = express.Router();

// Get chat status
router.get('/chat/status', (req, res) => {
  res.json({
    status: 'ok',
    available: true,
    message: 'Chat API is available'
  });
});

// Send chat message
router.post('/chat/message', (req, res) => {
  // Mock chat message
  const message = req.body.message || '';
  let response = 'I don\'t know the answer to that question.';

  if (message.toLowerCase().includes('hello') || message.toLowerCase().includes('hi')) {
    response = 'Hello! How can I help you today?';
  } else if (message.toLowerCase().includes('help')) {
    response = 'I can help you analyze financial documents, extract information, and answer questions about your portfolio.';
  } else if (message.toLowerCase().includes('document')) {
    response = 'You can upload documents on the upload page and then process them to extract information.';
  } else if (message.toLowerCase().includes('portfolio')) {
    response = 'I can help you analyze your investment portfolio, track performance, and provide insights.';
  } else if (message.toLowerCase().includes('revenue')) {
    response = 'The total revenue is $10,500,000.';
  } else if (message.toLowerCase().includes('profit')) {
    response = 'The net profit is $3,300,000 with a profit margin of 31.4%.';
  } else if (message.toLowerCase().includes('asset')) {
    response = 'The total assets are $25,000,000.';
  } else if (message.toLowerCase().includes('liabilit')) {
    response = 'The total liabilities are $12,000,000.';
  } else if (message.toLowerCase().includes('equity')) {
    response = 'The shareholders\' equity is $13,000,000.';
  } else if (message.toLowerCase().includes('apple') || message.toLowerCase().includes('microsoft') || message.toLowerCase().includes('amazon') || message.toLowerCase().includes('tesla') || message.toLowerCase().includes('google')) {
    response = 'The investment portfolio includes holdings in Apple Inc., Microsoft, Amazon, Tesla, and Google. Would you like specific details about any of these securities?';
  }

  res.json({
    success: true,
    message,
    response,
    timestamp: new Date().toISOString()
  });
});

// Get chat history
router.get('/chat/history', (req, res) => {
  // Mock chat history
  res.json([
    {
      id: 'msg-1',
      sender: 'user',
      message: 'Hello',
      timestamp: new Date(Date.now() - 3600000).toISOString()
    },
    {
      id: 'msg-2',
      sender: 'ai',
      message: 'Hello! How can I help you today?',
      timestamp: new Date(Date.now() - 3590000).toISOString()
    },
    {
      id: 'msg-3',
      sender: 'user',
      message: 'What is the total revenue?',
      timestamp: new Date(Date.now() - 3580000).toISOString()
    },
    {
      id: 'msg-4',
      sender: 'ai',
      message: 'The total revenue is $10,500,000.',
      timestamp: new Date(Date.now() - 3570000).toISOString()
    }
  ]);
});

// Clear chat history
router.post('/chat/clear', (req, res) => {
  // Mock clear chat history
  res.json({
    success: true,
    message: 'Chat history cleared',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
