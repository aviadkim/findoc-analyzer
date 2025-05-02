/**
 * Authentication Middleware
 */

const jwt = require('jsonwebtoken');
const { supabase } = require('../services/supabaseService');
const { v4: uuidv4 } = require('uuid');

/**
 * Authenticate user
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next function
 * @returns {Promise<void>}
 */
const authMiddleware = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.headers.authorization?.split(' ')[1] || req.query?.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'No token, authorization denied'
      });
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'findoc-secret-key');
    } catch (jwtError) {
      console.error('JWT verification error:', jwtError);
      return res.status(401).json({
        success: false,
        error: 'Invalid token'
      });
    }

    // Get user from database
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', decoded.id)
      .single();

    if (error) {
      console.error('Supabase user fetch error:', error);
      return res.status(401).json({
        success: false,
        error: 'Database error'
      });
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'User not found'
      });
    }

    // Set user and tenant ID in request
    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role || 'user',
      organization: user.organization,
      tenantId: user.tenant_id
    };

    req.tenantId = user.tenant_id;

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({
      success: false,
      error: 'Authentication error'
    });
  }
};

/**
 * Optional authentication middleware
 * Authenticates if token is present, but doesn't require it
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next function
 * @returns {Promise<void>}
 */
const optionalAuthMiddleware = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.headers.authorization?.split(' ')[1] || req.query?.token;

    if (!token) {
      // No token, but that's okay - continue without authentication
      return next();
    }

    // Verify token
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'findoc-secret-key');

      // Get user from database
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', decoded.id)
        .single();

      if (!error && user) {
        // Set user and tenant ID in request
        req.user = {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role || 'user',
          organization: user.organization,
          tenantId: user.tenant_id
        };

        req.tenantId = user.tenant_id;
      }
    } catch (jwtError) {
      // Invalid token, but that's okay for optional auth
      console.warn('Optional auth - invalid token:', jwtError.message);
    }

    next();
  } catch (error) {
    console.error('Optional auth middleware error:', error);
    next();
  }
};

/**
 * Test mode middleware
 * Bypasses authentication for testing purposes
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next function
 * @returns {void}
 */
const testModeMiddleware = (req, res, next) => {
  // Check for test mode headers
  if (req.headers['x-bypass-auth'] === 'true' && req.headers['x-test-mode'] === 'true') {
    console.log('Test mode activated - bypassing authentication');

    // Create a test user
    req.user = {
      id: 'test-user-' + uuidv4(),
      name: 'Test User',
      email: 'test@example.com',
      role: 'user',
      organization: 'Test Organization',
      tenantId: 'test-tenant-' + uuidv4()
    };

    req.tenantId = req.user.tenantId;

    return next();
  }

  // Not in test mode, continue with normal authentication
  next();
};

module.exports = {
  authMiddleware,
  optionalAuthMiddleware,
  testModeMiddleware
};
