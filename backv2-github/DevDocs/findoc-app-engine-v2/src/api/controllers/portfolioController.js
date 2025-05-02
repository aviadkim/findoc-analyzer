/**
 * Portfolio Controller
 */

const { v4: uuidv4 } = require('uuid');
const { supabase } = require('../services/supabaseService');

/**
 * Get all portfolios
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @returns {Promise<void>}
 */
const getPortfolios = async (req, res) => {
  try {
    // Get portfolios from database
    const { data, error } = await supabase
      .from('portfolios')
      .select('*')
      .eq('tenant_id', req.tenantId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error getting portfolios:', error);
      return res.status(500).json({
        success: false,
        error: 'Error getting portfolios'
      });
    }

    return res.json({
      success: true,
      data: data || []
    });
  } catch (error) {
    console.error('Error in getPortfolios:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Get portfolio by ID
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @returns {Promise<void>}
 */
const getPortfolioById = async (req, res) => {
  try {
    const { id } = req.params;

    // Get portfolio from database
    const { data, error } = await supabase
      .from('portfolios')
      .select('*')
      .eq('id', id)
      .eq('tenant_id', req.tenantId)
      .single();

    if (error) {
      console.error('Error getting portfolio:', error);
      return res.status(404).json({
        success: false,
        error: 'Portfolio not found'
      });
    }

    return res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Error in getPortfolioById:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Create portfolio
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @returns {Promise<void>}
 */
const createPortfolio = async (req, res) => {
  try {
    const { name, description, securities } = req.body;

    // Validate input
    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'Name is required'
      });
    }

    // Calculate total value
    const totalValue = (securities || []).reduce((sum, security) => {
      return sum + (parseFloat(security.value) || 0);
    }, 0);

    // Create portfolio
    const portfolio = {
      id: uuidv4(),
      name,
      description: description || '',
      securities: securities || [],
      total_value: totalValue,
      historical_data: [
        {
          date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          value: totalValue * 0.9
        },
        {
          date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          value: totalValue * 0.95
        },
        {
          date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          value: totalValue * 0.98
        },
        {
          date: new Date().toISOString().split('T')[0],
          value: totalValue
        }
      ],
      user_id: req.user.id,
      tenant_id: req.tenantId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Insert portfolio into database
    const { data, error } = await supabase
      .from('portfolios')
      .insert(portfolio)
      .select()
      .single();

    if (error) {
      console.error('Error creating portfolio:', error);
      return res.status(500).json({
        success: false,
        error: 'Error creating portfolio'
      });
    }

    return res.status(201).json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Error in createPortfolio:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Update portfolio
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @returns {Promise<void>}
 */
const updatePortfolio = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, securities } = req.body;

    // Get portfolio
    const { data: portfolio, error: portfolioError } = await supabase
      .from('portfolios')
      .select('*')
      .eq('id', id)
      .eq('tenant_id', req.tenantId)
      .single();

    if (portfolioError || !portfolio) {
      return res.status(404).json({
        success: false,
        error: 'Portfolio not found'
      });
    }

    // Calculate total value
    const totalValue = (securities || portfolio.securities || []).reduce((sum, security) => {
      return sum + (parseFloat(security.value) || 0);
    }, 0);

    // Update portfolio
    const { data, error } = await supabase
      .from('portfolios')
      .update({
        name: name || portfolio.name,
        description: description !== undefined ? description : portfolio.description,
        securities: securities || portfolio.securities,
        total_value: totalValue,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('tenant_id', req.tenantId)
      .select()
      .single();

    if (error) {
      console.error('Error updating portfolio:', error);
      return res.status(500).json({
        success: false,
        error: 'Error updating portfolio'
      });
    }

    return res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Error in updatePortfolio:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Delete portfolio
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @returns {Promise<void>}
 */
const deletePortfolio = async (req, res) => {
  try {
    const { id } = req.params;

    // Delete portfolio
    const { error } = await supabase
      .from('portfolios')
      .delete()
      .eq('id', id)
      .eq('tenant_id', req.tenantId);

    if (error) {
      console.error('Error deleting portfolio:', error);
      return res.status(500).json({
        success: false,
        error: 'Error deleting portfolio'
      });
    }

    return res.json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error('Error in deletePortfolio:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Create portfolio from document
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @returns {Promise<void>}
 */
const createPortfolioFromDocument = async (req, res) => {
  try {
    const { documentId } = req.params;
    const { name, description } = req.body;

    // Get document
    const { data: document, error: documentError } = await supabase
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .eq('tenant_id', req.tenantId)
      .single();

    if (documentError || !document) {
      return res.status(404).json({
        success: false,
        error: 'Document not found'
      });
    }

    // Check if document has securities
    if (!document.metadata?.securities || document.metadata.securities.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Document does not contain securities data'
      });
    }

    // Calculate total value
    const totalValue = document.metadata.securities.reduce((sum, security) => {
      return sum + (parseFloat(security.value) || 0);
    }, 0);

    // Create portfolio
    const portfolio = {
      id: uuidv4(),
      name: name || `Portfolio from ${document.name}`,
      description: description || `Created from document ${document.name}`,
      securities: document.metadata.securities,
      total_value: totalValue,
      historical_data: [
        {
          date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          value: totalValue * 0.9
        },
        {
          date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          value: totalValue * 0.95
        },
        {
          date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          value: totalValue * 0.98
        },
        {
          date: new Date().toISOString().split('T')[0],
          value: totalValue
        }
      ],
      user_id: req.user.id,
      tenant_id: req.tenantId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Insert portfolio into database
    const { data, error } = await supabase
      .from('portfolios')
      .insert(portfolio)
      .select()
      .single();

    if (error) {
      console.error('Error creating portfolio from document:', error);
      return res.status(500).json({
        success: false,
        error: 'Error creating portfolio from document'
      });
    }

    return res.status(201).json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Error in createPortfolioFromDocument:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

module.exports = {
  getPortfolios,
  getPortfolioById,
  createPortfolio,
  updatePortfolio,
  deletePortfolio,
  createPortfolioFromDocument
};
