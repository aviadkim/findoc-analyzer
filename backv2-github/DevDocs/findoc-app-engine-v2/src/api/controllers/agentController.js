/**
 * Agent Controller
 * 
 * This controller handles agent-related operations.
 */

const {
  processDocumentWithAgents,
  queryDocumentWithAgents,
  getAgentSystemStatus,
  runAgentSystem: runAgentSystemFn
} = require('../../agent_system');

/**
 * Query a document with agents
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @returns {Promise<void>}
 */
const queryDocument = async (req, res) => {
  try {
    const { documentId, query } = req.body;
    
    // Validate input
    if (!documentId) {
      return res.status(400).json({
        success: false,
        error: 'Document ID is required'
      });
    }
    
    if (!query) {
      return res.status(400).json({
        success: false,
        error: 'Query is required'
      });
    }
    
    // Query document
    const result = await queryDocumentWithAgents(documentId, query);
    
    // Return result
    return res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error querying document with agents:', error);
    
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Get agent status
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @returns {Promise<void>}
 */
const getAgentStatus = async (req, res) => {
  try {
    // Get agent status
    const status = await getAgentSystemStatus();
    
    // Return status
    return res.json({
      success: true,
      data: status
    });
  } catch (error) {
    console.error('Error getting agent status:', error);
    
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Run agent system
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @returns {Promise<void>}
 */
const runAgentSystem = async (req, res) => {
  try {
    const { documentId } = req.body;
    
    // Validate input
    if (!documentId) {
      return res.status(400).json({
        success: false,
        error: 'Document ID is required'
      });
    }
    
    // Run agent system
    const result = await runAgentSystemFn(documentId);
    
    // Return result
    return res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error running agent system:', error);
    
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

module.exports = {
  queryDocument,
  getAgentStatus,
  runAgentSystem
};
