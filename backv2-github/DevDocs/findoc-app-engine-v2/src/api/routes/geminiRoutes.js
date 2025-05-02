/**
 * Gemini Routes
 */

const express = require('express');
const { generateContent, chatWithDocument } = require('../controllers/geminiController');
const { authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

// Generate content
router.post('/generate', authMiddleware, generateContent);

// Chat with document
router.post('/chat/:documentId', authMiddleware, chatWithDocument);

module.exports = router;
