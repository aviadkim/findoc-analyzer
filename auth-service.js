/**
 * Authentication Service
 * 
 * This module provides authentication services for the FinDoc Analyzer application.
 */

const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const tenantManager = require('./tenant-manager');
const supabase = require('./supabase-client');

// JWT secret for token signing
const JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(64).toString('hex');

// JWT expiration time (1 day)
const JWT_EXPIRATION = '1d';

// Google OAuth client
const googleClient = new OAuth2Client({
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  redirectUri: process.env.GOOGLE_REDIRECT_URI || 'http://localhost:8080/api/auth/google/callback'
});

/**
 * Generate Google OAuth URL
 * @returns {string} Google OAuth URL
 */
function getGoogleAuthUrl() {
  const scopes = [
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/userinfo.email'
  ];
  
  return googleClient.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent'
  });
}

/**
 * Handle Google OAuth callback
 * @param {string} code - Authorization code from Google
 * @returns {Promise<Object>} User data and JWT token
 */
async function handleGoogleCallback(code) {
  try {
    // Exchange code for tokens
    const { tokens } = await googleClient.getToken(code);
    
    // Set credentials
    googleClient.setCredentials(tokens);
    
    // Get user info
    const userInfoClient = new OAuth2Client();
    userInfoClient.setCredentials(tokens);
    
    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`
      }
    });
    
    if (!userInfoResponse.ok) {
      throw new Error('Failed to get user info from Google');
    }
    
    const userInfo = await userInfoResponse.json();
    
    // Check if user exists
    const { data: existingUser, error: userError } = await supabase
      .from('users')
      .select('id, tenant_id')
      .eq('email', userInfo.email)
      .single();
    
    if (userError && userError.message !== 'Item not found') {
      throw userError;
    }
    
    let userId, tenantId;
    
    if (existingUser) {
      // User exists, use existing tenant ID
      userId = existingUser.id;
      tenantId = existingUser.tenant_id;
    } else {
      // Create new tenant
      const tenantResult = await tenantManager.createTenant({
        name: userInfo.name,
        subscriptionTier: 'free',
        maxDocuments: 100,
        maxApiCalls: 1000
      });
      
      tenantId = tenantResult.tenant.id;
      
      // Create new user
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
          email: userInfo.email,
          name: userInfo.name,
          picture: userInfo.picture,
          tenant_id: tenantId,
          google_id: userInfo.sub,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select('id')
        .single();
      
      if (createError) {
        throw createError;
      }
      
      userId = newUser.id;
    }
    
    // Generate JWT token
    const token = generateToken({
      userId,
      email: userInfo.email,
      name: userInfo.name,
      tenantId
    });
    
    return {
      user: {
        id: userId,
        email: userInfo.email,
        name: userInfo.name,
        picture: userInfo.picture,
        tenantId
      },
      token
    };
  } catch (error) {
    console.error('Error handling Google callback:', error);
    throw error;
  }
}

/**
 * Generate JWT token
 * @param {Object} payload - Token payload
 * @returns {string} JWT token
 */
function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRATION });
}

/**
 * Verify JWT token
 * @param {string} token - JWT token
 * @returns {Object} Token payload
 */
function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

/**
 * Authentication middleware
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next function
 */
function authMiddleware(req, res, next) {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Unauthorized'
      });
    }
    
    const token = authHeader.split(' ')[1];
    
    // Verify token
    const payload = verifyToken(token);
    
    // Add user and tenant ID to request
    req.user = payload;
    req.tenantId = payload.tenantId;
    
    next();
  } catch (error) {
    console.error('Error authenticating user:', error);
    
    res.status(401).json({
      error: 'Unauthorized'
    });
  }
}

module.exports = {
  getGoogleAuthUrl,
  handleGoogleCallback,
  generateToken,
  verifyToken,
  authMiddleware
};
