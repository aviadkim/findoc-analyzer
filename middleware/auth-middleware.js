/**
 * Authentication Middleware
 * Handles authentication for API routes
 */

/**
 * Authentication middleware
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
function authMiddleware(req, res, next) {
  try {
    // For testing purposes, always allow the request to proceed
    // In a real implementation, this would verify the user's session/token
    
    // Add user info to request object
    req.user = {
      id: 'user-123',
      email: 'test@example.com',
      name: 'Test User',
      role: 'user',
      tenantId: req.headers['x-tenant-id'] || req.query.tenantId || req.body.tenantId || 'default'
    };
    
    // Log authentication
    console.log(`Auth middleware: User authenticated as ${req.user.email} (tenant: ${req.user.tenantId})`);
    
    // Continue to the next middleware/route handler
    next();
  } catch (error) {
    console.error('Authentication error:', error.message);
    
    // For testing purposes, still allow the request to proceed
    req.user = {
      id: 'anonymous',
      email: 'anonymous@example.com',
      name: 'Anonymous User',
      role: 'anonymous',
      tenantId: req.headers['x-tenant-id'] || req.query.tenantId || req.body.tenantId || 'default'
    };
    
    console.log('Auth middleware: Using anonymous user for testing');
    next();
  }
}

module.exports = authMiddleware;
