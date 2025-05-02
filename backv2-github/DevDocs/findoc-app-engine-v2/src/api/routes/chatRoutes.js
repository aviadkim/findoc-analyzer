/**
 * Chat Routes
 * 
 * This file defines the routes for chat-related operations.
 */

const express = require('express');
const { authMiddleware } = require('../middleware/authMiddleware');
const { 
  sendMessage,
  getChatHistory,
  clearChatHistory
} = require('../controllers/chatController');

// Create router
const router = express.Router();

// Define routes
router.post('/message', authMiddleware, sendMessage);
router.get('/history/:documentId', authMiddleware, getChatHistory);
router.delete('/history/:documentId', authMiddleware, clearChatHistory);

module.exports = router;
