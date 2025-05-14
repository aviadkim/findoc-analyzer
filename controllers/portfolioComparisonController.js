/**
 * Portfolio Comparison Controller
 * 
 * Handles requests for comparing portfolios across different documents and time periods.
 */

const portfolioComparisonService = require('../services/portfolio-comparison-service');

/**
 * Compare two portfolios
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
async function comparePortfolios(req, res) {
  try {
    const { document1Id, document2Id, options } = req.body;
    
    // Validate request
    if (!document1Id || !document2Id) {
      return res.status(400).json({
        success: false,
        message: 'Both document IDs are required'
      });
    }
    
    // Process comparison
    const result = await portfolioComparisonService.comparePortfolios(
      document1Id,
      document2Id,
      options || {}
    );
    
    // Return result
    return res.status(200).json({
      success: true,
      comparison: result
    });
  } catch (error) {
    console.error(`Error in portfolio comparison controller: ${error.message}`);
    
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

/**
 * Get a specific comparison by ID
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
async function getComparisonById(req, res) {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Comparison ID is required'
      });
    }
    
    const comparison = await portfolioComparisonService.getComparisonById(id);
    
    return res.status(200).json({
      success: true,
      comparison
    });
  } catch (error) {
    console.error(`Error getting comparison by ID: ${error.message}`);
    
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

/**
 * List recent comparisons
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
async function listRecentComparisons(req, res) {
  try {
    const { limit, userId, tenantId } = req.query;
    
    const comparisons = await portfolioComparisonService.listRecentComparisons({
      limit: parseInt(limit) || 10,
      userId,
      tenantId
    });
    
    return res.status(200).json({
      success: true,
      comparisons
    });
  } catch (error) {
    console.error(`Error listing recent comparisons: ${error.message}`);
    
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

module.exports = {
  comparePortfolios,
  getComparisonById,
  listRecentComparisons
};