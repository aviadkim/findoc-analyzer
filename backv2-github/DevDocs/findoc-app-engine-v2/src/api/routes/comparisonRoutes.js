/**
 * Comparison Routes
 * 
 * This file defines the routes for document comparison operations.
 */

const express = require('express');
const { authMiddleware } = require('../middleware/authMiddleware');
const {
  compareDocuments,
  getComparisons,
  getComparisonById,
  deleteComparison
} = require('../controllers/comparisonController');

// Create router
const router = express.Router();

// Define routes
router.post('/', authMiddleware, compareDocuments);
router.get('/', authMiddleware, getComparisons);
router.get('/:id', authMiddleware, getComparisonById);
router.delete('/:id', authMiddleware, deleteComparison);

module.exports = router;
