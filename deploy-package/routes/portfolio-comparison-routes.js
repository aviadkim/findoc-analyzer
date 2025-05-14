/**
 * Portfolio Comparison Routes
 * 
 * API routes for portfolio comparison functionality
 */

const express = require('express');
const router = express.Router();
const portfolioComparisonController = require('../controllers/portfolioComparisonController');

// Compare two portfolios
router.post('/compare', portfolioComparisonController.comparePortfolios);

// Get comparison by ID
router.get('/:id', portfolioComparisonController.getComparisonById);

// List recent comparisons
router.get('/', portfolioComparisonController.listRecentComparisons);

module.exports = router;