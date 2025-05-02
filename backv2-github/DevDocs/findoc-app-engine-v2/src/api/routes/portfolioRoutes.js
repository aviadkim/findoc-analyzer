/**
 * Portfolio Routes
 */

const express = require('express');
const {
  getPortfolios,
  getPortfolioById,
  createPortfolio,
  updatePortfolio,
  deletePortfolio,
  createPortfolioFromDocument
} = require('../controllers/portfolioController');
const { authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

// Get all portfolios
router.get('/', authMiddleware, getPortfolios);

// Get portfolio by ID
router.get('/:id', authMiddleware, getPortfolioById);

// Create portfolio
router.post('/', authMiddleware, createPortfolio);

// Update portfolio
router.put('/:id', authMiddleware, updatePortfolio);

// Delete portfolio
router.delete('/:id', authMiddleware, deletePortfolio);

// Create portfolio from document
router.post('/from-document/:documentId', authMiddleware, createPortfolioFromDocument);

module.exports = router;
