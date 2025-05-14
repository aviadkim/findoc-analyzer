/**
 * Tenant Routes
 * 
 * RESTful API routes for managing multi-tenant functionality
 */

const express = require('express');
const router = express.Router();
const { TenantService, TENANT_STATUS, TENANT_TIER } = require('../services/tenant-service');

// Initialize tenant service
const tenantService = new TenantService();

/**
 * @route GET /api/tenants
 * @description Get all tenants
 * @access Admin
 */
router.get('/', async (req, res) => {
  try {
    // Get query parameters
    const { 
      status, 
      tier, 
      search, 
      sortBy, 
      sortOrder,
      limit,
      offset
    } = req.query;
    
    // Convert limit and offset to numbers
    const parsedLimit = limit ? parseInt(limit, 10) : undefined;
    const parsedOffset = offset ? parseInt(offset, 10) : undefined;
    
    // Get tenants
    const tenants = await tenantService.getAllTenants({
      status,
      tier,
      search,
      sortBy,
      sortOrder,
      limit: parsedLimit,
      offset: parsedOffset
    });
    
    res.json({
      success: true,
      count: tenants.length,
      tenants: tenants.map(tenant => ({
        id: tenant.id,
        name: tenant.name,
        tier: tenant.tier,
        status: tenant.status,
        createdAt: tenant.createdAt,
        expiresAt: tenant.expiresAt,
        adminEmail: tenant.adminEmail,
        usage: {
          users: tenant.usage.users,
          docs: tenant.usage.docs,
          storage: tenant.usage.storage,
          apiCalls: tenant.usage.apiCalls
        }
      }))
    });
  } catch (error) {
    console.error('Error getting tenants:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get tenants',
      error: error.message
    });
  }
});

/**
 * @route GET /api/tenants/:id
 * @description Get tenant by ID
 * @access Admin, Tenant Owner
 */
router.get('/:id', async (req, res) => {
  try {
    const tenantId = req.params.id;
    
    // Get tenant
    const tenant = await tenantService.getTenant(tenantId);
    
    res.json({
      success: true,
      tenant
    });
  } catch (error) {
    console.error(`Error getting tenant ${req.params.id}:`, error);
    res.status(error.message.includes('not found') ? 404 : 500).json({
      success: false,
      message: 'Failed to get tenant',
      error: error.message
    });
  }
});

/**
 * @route POST /api/tenants
 * @description Create a new tenant
 * @access Admin
 */
router.post('/', async (req, res) => {
  try {
    // Get tenant data
    const tenantData = req.body;
    
    // Validate required fields
    if (!tenantData.name) {
      return res.status(400).json({
        success: false,
        message: 'Tenant name is required'
      });
    }
    
    // Create tenant
    const tenant = await tenantService.createTenant(tenantData);
    
    res.status(201).json({
      success: true,
      message: 'Tenant created successfully',
      tenant
    });
  } catch (error) {
    console.error('Error creating tenant:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create tenant',
      error: error.message
    });
  }
});

/**
 * @route PUT /api/tenants/:id
 * @description Update tenant
 * @access Admin, Tenant Owner
 */
router.put('/:id', async (req, res) => {
  try {
    const tenantId = req.params.id;
    const updateData = req.body;
    
    // Validate update data
    if (!updateData || Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No update data provided'
      });
    }
    
    // Prevent changing tenant ID
    if (updateData.id && updateData.id !== tenantId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot change tenant ID'
      });
    }
    
    // Update tenant
    const tenant = await tenantService.updateTenant(tenantId, updateData);
    
    res.json({
      success: true,
      message: 'Tenant updated successfully',
      tenant
    });
  } catch (error) {
    console.error(`Error updating tenant ${req.params.id}:`, error);
    res.status(error.message.includes('not found') ? 404 : 500).json({
      success: false,
      message: 'Failed to update tenant',
      error: error.message
    });
  }
});

/**
 * @route DELETE /api/tenants/:id
 * @description Delete tenant
 * @access Admin
 */
router.delete('/:id', async (req, res) => {
  try {
    const tenantId = req.params.id;
    
    // Delete tenant
    await tenantService.deleteTenant(tenantId);
    
    res.json({
      success: true,
      message: 'Tenant deleted successfully'
    });
  } catch (error) {
    console.error(`Error deleting tenant ${req.params.id}:`, error);
    res.status(error.message.includes('not found') ? 404 : 500).json({
      success: false,
      message: 'Failed to delete tenant',
      error: error.message
    });
  }
});

/**
 * @route GET /api/tenants/:id/features
 * @description Get tenant features
 * @access Tenant Owner, Tenant User
 */
router.get('/:id/features', async (req, res) => {
  try {
    const tenantId = req.params.id;
    
    // Get tenant features
    const features = await tenantService.getTenantFeatures(tenantId);
    
    res.json({
      success: true,
      tenantId,
      features
    });
  } catch (error) {
    console.error(`Error getting tenant features for ${req.params.id}:`, error);
    res.status(error.message.includes('not found') ? 404 : 500).json({
      success: false,
      message: 'Failed to get tenant features',
      error: error.message
    });
  }
});

/**
 * @route GET /api/tenants/:id/storage
 * @description Get tenant storage usage
 * @access Admin, Tenant Owner
 */
router.get('/:id/storage', async (req, res) => {
  try {
    const tenantId = req.params.id;
    
    // Calculate tenant storage
    const storageUsage = await tenantService.calculateTenantStorage(tenantId);
    
    // Get tenant
    const tenant = await tenantService.getTenant(tenantId);
    
    res.json({
      success: true,
      tenantId,
      storage: {
        usage: storageUsage,
        limit: tenant.limits.maxStorage,
        percentage: Math.round((storageUsage / tenant.limits.maxStorage) * 100),
        formattedUsage: formatBytes(storageUsage),
        formattedLimit: formatBytes(tenant.limits.maxStorage)
      }
    });
  } catch (error) {
    console.error(`Error getting tenant storage for ${req.params.id}:`, error);
    res.status(error.message.includes('not found') ? 404 : 500).json({
      success: false,
      message: 'Failed to get tenant storage',
      error: error.message
    });
  }
});

/**
 * @route GET /api/tenants/:id/limits
 * @description Check tenant limits
 * @access Admin, Tenant Owner
 */
router.get('/:id/limits', async (req, res) => {
  try {
    const tenantId = req.params.id;
    const limitType = req.query.type || 'all';
    
    if (limitType === 'all') {
      // Check all limits
      const [usersLimit, storageLimit, docsLimit, processingLimit] = await Promise.all([
        tenantService.checkTenantLimits(tenantId, 'users'),
        tenantService.checkTenantLimits(tenantId, 'storage'),
        tenantService.checkTenantLimits(tenantId, 'docs'),
        tenantService.checkTenantLimits(tenantId, 'concurrentProcessing')
      ]);
      
      res.json({
        success: true,
        tenantId,
        limits: {
          users: usersLimit,
          storage: {
            ...storageLimit,
            formattedCurrent: formatBytes(storageLimit.current),
            formattedLimit: formatBytes(storageLimit.limit)
          },
          docs: docsLimit,
          concurrentProcessing: processingLimit
        }
      });
    } else {
      // Check specific limit
      const limitResult = await tenantService.checkTenantLimits(tenantId, limitType);
      
      // Format storage values if applicable
      if (limitType === 'storage' && !limitResult.error) {
        limitResult.formattedCurrent = formatBytes(limitResult.current);
        limitResult.formattedLimit = formatBytes(limitResult.limit);
      }
      
      res.json({
        success: true,
        tenantId,
        limitType,
        limit: limitResult
      });
    }
  } catch (error) {
    console.error(`Error checking tenant limits for ${req.params.id}:`, error);
    res.status(error.message.includes('not found') ? 404 : 500).json({
      success: false,
      message: 'Failed to check tenant limits',
      error: error.message
    });
  }
});

/**
 * @route POST /api/tenants/:id/api-keys
 * @description Generate API key for tenant
 * @access Admin, Tenant Owner
 */
router.post('/:id/api-keys', async (req, res) => {
  try {
    const tenantId = req.params.id;
    const keyData = req.body;
    
    // Generate API key
    const apiKey = await tenantService.generateApiKey(tenantId, keyData);
    
    res.status(201).json({
      success: true,
      message: 'API key generated successfully',
      apiKey
    });
  } catch (error) {
    console.error(`Error generating API key for tenant ${req.params.id}:`, error);
    res.status(error.message.includes('not found') ? 404 : 500).json({
      success: false,
      message: 'Failed to generate API key',
      error: error.message
    });
  }
});

/**
 * @route DELETE /api/tenants/:id/api-keys/:keyId
 * @description Delete API key
 * @access Admin, Tenant Owner
 */
router.delete('/:id/api-keys/:keyId', async (req, res) => {
  try {
    const tenantId = req.params.id;
    const keyId = req.params.keyId;
    
    // Get tenant
    const tenant = await tenantService.getTenant(tenantId);
    
    // Remove API key
    const apiKeys = tenant.apiKeys.filter(key => key.id !== keyId);
    
    // Update tenant
    await tenantService.updateTenant(tenantId, { apiKeys });
    
    res.json({
      success: true,
      message: 'API key deleted successfully'
    });
  } catch (error) {
    console.error(`Error deleting API key ${req.params.keyId} for tenant ${req.params.id}:`, error);
    res.status(error.message.includes('not found') ? 404 : 500).json({
      success: false,
      message: 'Failed to delete API key',
      error: error.message
    });
  }
});

/**
 * @route GET /api/tenants/validate-key
 * @description Validate API key
 * @access Public
 */
router.get('/validate-key', async (req, res) => {
  try {
    const apiKey = req.header('X-API-Key');
    
    if (!apiKey) {
      return res.status(400).json({
        success: false,
        message: 'API key is required'
      });
    }
    
    // Validate API key
    const validationResult = await tenantService.validateApiKey(apiKey);
    
    if (!validationResult.valid) {
      return res.status(401).json({
        success: false,
        message: validationResult.error
      });
    }
    
    res.json({
      success: true,
      tenantId: validationResult.tenantId,
      permissions: validationResult.permissions
    });
  } catch (error) {
    console.error('Error validating API key:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to validate API key',
      error: error.message
    });
  }
});

/**
 * @route POST /api/tenants/:id/can-perform
 * @description Check if tenant can perform action
 * @access Tenant User
 */
router.post('/:id/can-perform', async (req, res) => {
  try {
    const tenantId = req.params.id;
    const { action } = req.body;
    
    if (!action) {
      return res.status(400).json({
        success: false,
        message: 'Action is required'
      });
    }
    
    // Check if tenant can perform action
    const canPerform = await tenantService.canPerformAction(tenantId, action);
    
    res.json({
      success: true,
      tenantId,
      action,
      canPerform
    });
  } catch (error) {
    console.error(`Error checking if tenant ${req.params.id} can perform action:`, error);
    res.status(error.message.includes('not found') ? 404 : 500).json({
      success: false,
      message: 'Failed to check if tenant can perform action',
      error: error.message
    });
  }
});

/**
 * Format bytes to human-readable string
 * @param {number} bytes - Bytes
 * @param {number} decimals - Decimal places
 * @returns {string} - Formatted string
 */
function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

module.exports = router;