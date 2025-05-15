/**
 * Feedback Routes
 * 
 * Routes for user feedback and analytics collection.
 */

const express = require('express');
const router = express.Router();
const { asyncHandler } = require('../../middleware/errorMiddleware');
const { authMiddleware, adminMiddleware } = require('../../middleware/authMiddleware');
const feedbackController = require('../../controllers/feedbackController');

// Public routes - none currently

// Protected routes - require authentication
router.use(authMiddleware);

// User feedback routes
router.post('/', asyncHandler(feedbackController.submitFeedback));
router.get('/', asyncHandler(feedbackController.getFeedbackHistory));
router.get('/categories', asyncHandler(feedbackController.getFeedbackCategories));
router.get('/:id', asyncHandler(feedbackController.getFeedbackById));
router.put('/:id', asyncHandler(feedbackController.updateFeedback));
router.delete('/:id', asyncHandler(feedbackController.deleteFeedback));

// Analytics tracking
router.post('/analytics', asyncHandler(feedbackController.trackAnalyticsEvent));

// Admin routes - require admin role
router.get('/admin/all', asyncHandler(adminMiddleware), asyncHandler(feedbackController.getAllFeedback));
router.get('/admin/analytics', asyncHandler(adminMiddleware), asyncHandler(feedbackController.getAnalyticsSummary));
router.put('/admin/:id', asyncHandler(adminMiddleware), asyncHandler(feedbackController.updateFeedbackStatus));
router.post('/admin/:id/responses', asyncHandler(adminMiddleware), asyncHandler(feedbackController.addFeedbackResponse));

module.exports = router;