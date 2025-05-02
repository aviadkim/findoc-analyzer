/**
 * ISIN Routes
 * 
 * This file contains the routes for ISIN-related operations.
 */

const express = require('express');
const router = express.Router();

// Import controllers
const {
  getIsins,
  getIsinById,
  getIsinDetails
} = require('../controllers/isinController');

// Routes
router.get('/', getIsins);
router.get('/:id', getIsinById);
router.get('/:id/details', getIsinDetails);

module.exports = router;
