/**
 * Feedback Routes
 */

const express = require('express');
const { submitFeedback, getFeedback, updateFeedbackStatus } = require('../controllers/feedbackController');
const { authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

// Submit feedback (public)
router.post('/', submitFeedback);

// Get feedback (admin only)
router.get('/', authMiddleware, getFeedback);

// Update feedback status (admin only)
router.put('/:id/status', authMiddleware, updateFeedbackStatus);

module.exports = router;
