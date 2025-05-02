/**
 * Authentication Routes
 */

const express = require('express');
const { register, login, getCurrentUser, createTestUser } = require('../controllers/authController');
const { authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

// Register user
router.post('/register', register);

// Login user
router.post('/login', login);

// Get current user
router.get('/me', authMiddleware, getCurrentUser);

// Create test user (public endpoint for testing)
router.post('/test-user', createTestUser);

module.exports = router;
