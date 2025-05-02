/**
 * Visualization Routes
 */

const express = require('express');
const { getAnalyticsDashboard } = require('../controllers/visualizationController');

const router = express.Router();

// Get analytics dashboard
router.get('/dashboard', getAnalyticsDashboard);

module.exports = router;
