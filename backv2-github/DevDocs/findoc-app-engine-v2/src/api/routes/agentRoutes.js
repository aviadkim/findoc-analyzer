/**
 * Agent Routes
 * 
 * This file contains the routes for agent-related operations.
 */

const express = require('express');
const router = express.Router();

// Import controllers
const {
  queryDocument,
  getAgentStatus,
  runAgentSystem
} = require('../controllers/agentController');

// Routes
router.post('/query', queryDocument);
router.get('/status', getAgentStatus);
router.post('/run', runAgentSystem);

module.exports = router;
