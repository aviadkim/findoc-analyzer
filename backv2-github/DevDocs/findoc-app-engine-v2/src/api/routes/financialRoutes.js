/**
 * Financial Routes
 */

const express = require('express');
const { getMarketData } = require('../controllers/financialController');

const router = express.Router();

// Get market data
router.get('/market-data', getMarketData);

module.exports = router;
