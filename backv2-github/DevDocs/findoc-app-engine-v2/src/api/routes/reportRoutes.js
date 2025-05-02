/**
 * Report Routes
 */

const express = require('express');
const { getReports } = require('../controllers/reportController');

const router = express.Router();

// Get all reports
router.get('/', getReports);

module.exports = router;
