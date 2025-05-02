/**
 * Tenant Middleware
 * 
 * This middleware ensures that users can only access data from their own tenant.
 */

/**
 * Tenant middleware
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next function
 * @returns {Promise<void>}
 */
const tenantMiddleware = async (req, res, next) => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    // Check if tenant ID is set
    if (!req.tenantId) {
      return res.status(403).json({
        success: false,
        error: 'Tenant ID not found'
      });
    }

    next();
  } catch (error) {
    console.error('Tenant middleware error:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

module.exports = {
  tenantMiddleware
};
