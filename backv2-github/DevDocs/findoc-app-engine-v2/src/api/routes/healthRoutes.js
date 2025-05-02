/**
 * Health Routes
 * 
 * This file defines the routes for the health check endpoints.
 */

const express = require('express');
const healthController = require('../controllers/healthController');

const router = express.Router();

// Routes
router.get('/', healthController.getHealth);
router.get('/detailed', healthController.getDetailedHealth);

module.exports = router;
