/**
 * Chat API Routes
 * Routes for chat functionality
 */

const express = require('express');
const router = express.Router();

/**
 * Get chat history
 * Method: GET
 * Route: /api/chat/history
 */
router.get('/chat/history', (req, res) => {
  // Mock chat history
  const chatHistory = [
    {
      id: 'msg1',
      role: 'user',
      content: 'What is the total value of my portfolio?',
      timestamp: new Date(Date.now() - 3600000).toISOString()
    },
    {
      id: 'msg2',
      role: 'assistant',
      content: 'The total value of your portfolio is $1,250,000.',
      timestamp: new Date(Date.now() - 3590000).toISOString()
    },
    {
      id: 'msg3',
      role: 'user',
      content: 'What are my top holdings?',
      timestamp: new Date(Date.now() - 1800000).toISOString()
    },
    {
      id: 'msg4',
      role: 'assistant',
      content: 'Your top holdings are:\n1. Apple Inc. (AAPL) - $250,000\n2. Microsoft Corp. (MSFT) - $200,000\n3. Amazon.com Inc. (AMZN) - $150,000',
      timestamp: new Date(Date.now() - 1790000).toISOString()
    }
  ];

  res.json({
    success: true,
    history: chatHistory
  });
});

/**
 * Send a chat message
 * Method: POST
 * Route: /api/chat/send
 */
router.post('/chat/send', (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({
      success: false,
      message: 'Message content is required'
    });
  }

  // Generate a response based on the message
  let response = '';
  if (message.toLowerCase().includes('portfolio') && message.toLowerCase().includes('value')) {
    response = 'The total value of your portfolio is $1,250,000.';
  } else if (message.toLowerCase().includes('top') && message.toLowerCase().includes('holdings')) {
    response = 'Your top holdings are:\n1. Apple Inc. (AAPL) - $250,000\n2. Microsoft Corp. (MSFT) - $200,000\n3. Amazon.com Inc. (AMZN) - $150,000';
  } else if (message.toLowerCase().includes('performance') || message.toLowerCase().includes('return')) {
    response = 'Your portfolio has a year-to-date return of 8.5%, outperforming the S&P 500 by 1.2%.';
  } else {
    response = 'I don\'t have specific information about that. Would you like to know about your portfolio value, top holdings, or performance?';
  }

  // Return response
  res.json({
    success: true,
    message: {
      id: `msg${Date.now()}`,
      role: 'assistant',
      content: response,
      timestamp: new Date().toISOString()
    }
  });
});

module.exports = router;
