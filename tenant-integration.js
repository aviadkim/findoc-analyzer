/**
 * Tenant Integration
 *
 * This module integrates the tenant-aware agent manager with the main application.
 * It provides middleware and utility functions for tenant management.
 */

const tenantManager = require('./tenant-manager');
const agentManager = require('./tenant-aware-agent-manager');

// Tenant cache
const tenantCache = new Map();

/**
 * Get tenant ID from request
 * @param {Object} req - Express request object
 * @returns {string|null} Tenant ID
 */
function getTenantIdFromRequest(req) {
  // Check for tenant ID in headers
  const tenantId = req.headers['x-tenant-id'];

  if (tenantId) {
    return tenantId;
  }

  // Check for tenant ID in session
  if (req.session && req.session.tenantId) {
    return req.session.tenantId;
  }

  // Check for tenant ID in user
  if (req.user && req.user.tenantId) {
    return req.user.tenantId;
  }

  // Check for tenant ID in Supabase auth
  if (req.supabaseAuth && req.supabaseAuth.user && req.supabaseAuth.user.id) {
    return req.supabaseAuth.user.id;
  }

  return null;
}

/**
 * Tenant middleware
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
async function tenantMiddleware(req, res, next) {
  try {
    // Get tenant ID from request
    const tenantId = getTenantIdFromRequest(req);

    if (!tenantId) {
      return res.status(401).json({
        error: 'Tenant ID not found'
      });
    }

    // Check if tenant exists
    try {
      // Check cache first
      if (!tenantCache.has(tenantId)) {
        const tenant = await tenantManager.getTenant(tenantId);

        if (!tenant) {
          return res.status(404).json({
            error: 'Tenant not found'
          });
        }

        // Cache tenant
        tenantCache.set(tenantId, tenant);
      }

      // Add tenant to request
      req.tenantId = tenantId;
      req.tenant = tenantCache.get(tenantId);

      // Continue
      next();
    } catch (error) {
      console.error(`Error getting tenant ${tenantId}:`, error);

      return res.status(500).json({
        error: 'Error getting tenant'
      });
    }
  } catch (error) {
    console.error('Error in tenant middleware:', error);

    return res.status(500).json({
      error: 'Internal server error'
    });
  }
}

/**
 * Process document with tenant-aware agent manager
 * @param {string} tenantId - Tenant ID
 * @param {Object} document - Document to process
 * @returns {Promise<Object>} Processing result
 */
async function processDocument(tenantId, document) {
  try {
    // Initialize agents for tenant if not already initialized
    const tenantStatus = agentManager.getAllAgentStatuses(tenantId);

    if (Object.keys(tenantStatus).length === 0) {
      await agentManager.initializeTenant(tenantId);
    }

    // Process document
    return await agentManager.processDocument(tenantId, document);
  } catch (error) {
    console.error(`Error processing document for tenant ${tenantId}:`, error);
    throw error;
  }
}

/**
 * Ask question about document with tenant-aware agent manager
 * @param {string} tenantId - Tenant ID
 * @param {string} documentId - Document ID
 * @param {string} question - Question to ask
 * @returns {Promise<Object>} Answer
 */
async function askQuestion(tenantId, documentId, question) {
  try {
    // Initialize agents for tenant if not already initialized
    const tenantStatus = agentManager.getAllAgentStatuses(tenantId);

    if (Object.keys(tenantStatus).length === 0) {
      await agentManager.initializeTenant(tenantId);
    }

    // Ask question
    return await agentManager.askQuestion(tenantId, documentId, question);
  } catch (error) {
    console.error(`Error asking question for tenant ${tenantId}:`, error);
    throw error;
  }
}

/**
 * Create a new tenant
 * @param {Object} tenantData - Tenant data
 * @returns {Promise<Object>} Created tenant
 */
async function createTenant(tenantData) {
  try {
    // Create tenant
    const result = await tenantManager.createTenant(tenantData);

    // Initialize agents for tenant
    await agentManager.initializeTenant(result.tenant.id);

    return result;
  } catch (error) {
    console.error('Error creating tenant:', error);
    throw error;
  }
}

/**
 * Get API key for tenant
 * @param {string} tenantId - Tenant ID
 * @param {string} provider - Provider name
 * @returns {Promise<string>} API key
 */
async function getApiKey(tenantId, provider) {
  try {
    return await tenantManager.getApiKey(tenantId, provider);
  } catch (error) {
    console.error(`Error getting API key for tenant ${tenantId} and provider ${provider}:`, error);
    throw error;
  }
}

/**
 * Get agent statuses for tenant
 * @param {string} tenantId - Tenant ID
 * @returns {Promise<Object>} Agent statuses
 */
async function getAgentStatuses(tenantId) {
  try {
    // Initialize agents for tenant if not already initialized
    const tenantStatus = agentManager.getAllAgentStatuses(tenantId);

    if (Object.keys(tenantStatus).length === 0) {
      await agentManager.initializeTenant(tenantId);
    }

    // Get agent statuses
    const agentStatuses = agentManager.getAllAgentStatuses(tenantId);

    return {
      agents: agentStatuses,
      activeAgents: Object.values(agentStatuses).filter(agent => agent.status === 'active').length,
      totalAgents: Object.keys(agentStatuses).length
    };
  } catch (error) {
    console.error(`Error getting agent statuses for tenant ${tenantId}:`, error);
    throw error;
  }
}

/**
 * Get API usage for tenant
 * @param {string} tenantId - Tenant ID
 * @returns {Promise<Object>} API usage
 */
async function getApiUsage(tenantId) {
  try {
    // Get API usage from tenant manager
    const apiUsage = await tenantManager.getApiUsage(tenantId);

    return apiUsage;
  } catch (error) {
    console.error(`Error getting API usage for tenant ${tenantId}:`, error);
    throw error;
  }
}

module.exports = {
  tenantMiddleware,
  processDocument,
  askQuestion,
  createTenant,
  getApiKey,
  getTenantIdFromRequest,
  getAgentStatuses,
  getApiUsage
};
