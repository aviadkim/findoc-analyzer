/**
 * Tenant Middleware
 * 
 * Middleware for handling multi-tenant functionality in API requests
 */

const { TenantService } = require('../services/tenant-service');
const tenantService = new TenantService();

/**
 * Tenant identification middleware
 * Identifies tenant from request headers, query, or body
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const identifyTenant = async (req, res, next) => {
  try {
    // Get tenant ID from various sources
    const tenantId = req.header('X-Tenant-ID') || 
                     req.query.tenantId || 
                     (req.body && req.body.tenantId);
    
    // If no tenant ID, use default tenant
    if (!tenantId) {
      req.tenantId = 'default';
      return next();
    }
    
    // Check if tenant exists
    try {
      const tenant = await tenantService.getTenant(tenantId);
      req.tenantId = tenant.id;
      req.tenant = tenant;
    } catch (error) {
      // If tenant not found, use default tenant
      console.warn(`Tenant ${tenantId} not found, using default tenant`);
      req.tenantId = 'default';
    }
    
    next();
  } catch (error) {
    console.error('Error in tenant identification middleware:', error);
    // Continue with default tenant in case of error
    req.tenantId = 'default';
    next();
  }
};

/**
 * Tenant validation middleware
 * Validates that the tenant exists and is active
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const validateTenant = async (req, res, next) => {
  try {
    // Get tenant ID from request
    const tenantId = req.tenantId;
    
    if (!tenantId) {
      return res.status(400).json({
        success: false,
        message: 'Tenant ID is required'
      });
    }
    
    // Check if tenant exists
    try {
      const tenant = await tenantService.getTenant(tenantId);
      
      // Check if tenant is active
      if (tenant.status !== 'active') {
        return res.status(403).json({
          success: false,
          message: `Tenant ${tenantId} is not active`
        });
      }
      
      // Check if tenant has expired
      if (new Date(tenant.expiresAt) < new Date()) {
        return res.status(403).json({
          success: false,
          message: `Tenant ${tenantId} has expired`
        });
      }
      
      // Set tenant in request
      req.tenant = tenant;
      
      next();
    } catch (error) {
      return res.status(404).json({
        success: false,
        message: `Tenant ${tenantId} not found`
      });
    }
  } catch (error) {
    console.error('Error in tenant validation middleware:', error);
    return res.status(500).json({
      success: false,
      message: 'Error validating tenant',
      error: error.message
    });
  }
};

/**
 * API key validation middleware
 * Validates API key and tenant
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const validateApiKey = async (req, res, next) => {
  try {
    // Get API key from header
    const apiKey = req.header('X-API-Key');
    
    if (!apiKey) {
      return res.status(401).json({
        success: false,
        message: 'API key is required'
      });
    }
    
    // Validate API key
    const validationResult = await tenantService.validateApiKey(apiKey);
    
    if (!validationResult.valid) {
      return res.status(401).json({
        success: false,
        message: validationResult.error || 'Invalid API key'
      });
    }
    
    // Set tenant ID and permissions in request
    req.tenantId = validationResult.tenantId;
    req.apiPermissions = validationResult.permissions;
    
    // Get tenant
    const tenant = await tenantService.getTenant(validationResult.tenantId);
    req.tenant = tenant;
    
    next();
  } catch (error) {
    console.error('Error in API key validation middleware:', error);
    return res.status(500).json({
      success: false,
      message: 'Error validating API key',
      error: error.message
    });
  }
};

/**
 * Tenant action authorization middleware
 * Checks if tenant can perform the specified action
 * 
 * @param {string} action - Action to check
 * @returns {Function} - Express middleware
 */
const authorizeAction = (action) => {
  return async (req, res, next) => {
    try {
      // Get tenant ID from request
      const tenantId = req.tenantId;
      
      if (!tenantId) {
        return res.status(400).json({
          success: false,
          message: 'Tenant ID is required'
        });
      }
      
      // Check if tenant can perform action
      const canPerform = await tenantService.canPerformAction(tenantId, action);
      
      if (!canPerform) {
        return res.status(403).json({
          success: false,
          message: `Tenant ${tenantId} cannot perform action: ${action}`
        });
      }
      
      next();
    } catch (error) {
      console.error(`Error in tenant action authorization middleware for ${action}:`, error);
      return res.status(500).json({
        success: false,
        message: 'Error authorizing tenant action',
        error: error.message
      });
    }
  };
};

/**
 * Tenant resource limits middleware
 * Checks if tenant has reached resource limits
 * 
 * @param {string} limitType - Limit type to check
 * @returns {Function} - Express middleware
 */
const checkResourceLimits = (limitType) => {
  return async (req, res, next) => {
    try {
      // Get tenant ID from request
      const tenantId = req.tenantId;
      
      if (!tenantId) {
        return res.status(400).json({
          success: false,
          message: 'Tenant ID is required'
        });
      }
      
      // Check tenant limits
      const limitResult = await tenantService.checkTenantLimits(tenantId, limitType);
      
      if (limitResult.reached) {
        return res.status(403).json({
          success: false,
          message: `Tenant ${tenantId} has reached ${limitType} limit`,
          limit: limitResult
        });
      }
      
      // Set limit info in request
      req.limitInfo = limitResult;
      
      next();
    } catch (error) {
      console.error(`Error in tenant resource limits middleware for ${limitType}:`, error);
      return res.status(500).json({
        success: false,
        message: 'Error checking tenant resource limits',
        error: error.message
      });
    }
  };
};

/**
 * Tenant storage path middleware
 * Adds tenant-specific storage paths to request
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const addTenantPaths = async (req, res, next) => {
  try {
    // Get tenant ID from request
    const tenantId = req.tenantId || 'default';
    
    // Add tenant paths to request
    req.tenantPaths = {
      data: await tenantService.getTenantStoragePath(tenantId, 'data'),
      uploads: await tenantService.getTenantStoragePath(tenantId, 'uploads'),
      results: await tenantService.getTenantStoragePath(tenantId, 'results'),
      exports: await tenantService.getTenantStoragePath(tenantId, 'exports')
    };
    
    next();
  } catch (error) {
    console.error('Error in tenant storage path middleware:', error);
    return res.status(500).json({
      success: false,
      message: 'Error getting tenant storage paths',
      error: error.message
    });
  }
};

/**
 * Update tenant usage middleware
 * Updates tenant usage statistics
 * 
 * @param {string} usageType - Type of usage to update
 * @param {Function} valueGetter - Function to get usage value from request
 * @returns {Function} - Express middleware
 */
const updateTenantUsage = (usageType, valueGetter) => {
  return async (req, res, next) => {
    try {
      // Get tenant ID from request
      const tenantId = req.tenantId;
      
      if (!tenantId) {
        // Skip if no tenant ID
        return next();
      }
      
      // Get usage value
      const value = typeof valueGetter === 'function' ? valueGetter(req) : 1;
      
      // Update usage asynchronously (don't wait for completion)
      if (usageType === 'storage') {
        tenantService.updateTenantUsage(tenantId, { storage: value }).catch(error => {
          console.error(`Error updating tenant ${tenantId} storage usage:`, error);
        });
      } else if (usageType === 'docs') {
        tenantService.updateTenantUsage(tenantId, { docs: tenant => tenant.usage.docs + value }).catch(error => {
          console.error(`Error updating tenant ${tenantId} document count:`, error);
        });
      } else if (usageType === 'apiCall') {
        tenantService.updateTenantUsage(tenantId, { apiCall: true }).catch(error => {
          console.error(`Error updating tenant ${tenantId} API call count:`, error);
        });
      }
      
      next();
    } catch (error) {
      console.error(`Error in update tenant usage middleware for ${usageType}:`, error);
      // Continue processing even if usage update fails
      next();
    }
  };
};

module.exports = {
  identifyTenant,
  validateTenant,
  validateApiKey,
  authorizeAction,
  checkResourceLimits,
  addTenantPaths,
  updateTenantUsage
};