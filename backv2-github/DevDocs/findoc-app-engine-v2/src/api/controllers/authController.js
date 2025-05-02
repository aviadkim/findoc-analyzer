/**
 * Authentication Controller
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { supabase } = require('../services/supabaseService');

// Test user credentials for public testing
const TEST_USER = {
  email: 'test@example.com',
  password: 'password123',
  name: 'Test User',
  organization: 'Test Organization'
};

/**
 * Register user
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @returns {Promise<void>}
 */
const register = async (req, res) => {
  try {
    const { name, email, password, organization } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide name, email, and password'
      });
    }

    // Check if user already exists
    const { data: existingUser, error: existingUserError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'User already exists'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate tenant ID
    const tenantId = uuidv4();

    // Create user
    const { data: user, error } = await supabase
      .from('users')
      .insert({
        id: uuidv4(),
        name,
        email,
        encrypted_password: hashedPassword,
        organization: organization || '',
        role: 'user',
        tenant_id: tenantId,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating user:', error);
      return res.status(500).json({
        success: false,
        error: 'Error creating user'
      });
    }

    // Generate token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        tenantId: user.tenant_id
      },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    // Return user and token
    return res.status(201).json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          organization: user.organization,
          tenantId: user.tenant_id,
          createdAt: user.created_at
        }
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Login user
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @returns {Promise<void>}
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide email and password'
      });
    }

    // Check if user exists
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.encrypted_password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Generate token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        tenantId: user.tenant_id
      },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    // Return user and token
    return res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          organization: user.organization,
          tenantId: user.tenant_id,
          createdAt: user.created_at
        }
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Get current user
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @returns {Promise<void>}
 */
const getCurrentUser = async (req, res) => {
  try {
    // User is already set in request by auth middleware
    return res.json({
      success: true,
      data: req.user
    });
  } catch (error) {
    console.error('Get current user error:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Validate token
 * @param {string} token - JWT token
 * @returns {Promise<object|null>} User data or null
 */
const validateToken = async (token) => {
  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from database
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', decoded.id)
      .single();

    if (error || !user) {
      return null;
    }

    // Return user data
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      organization: user.organization,
      tenantId: user.tenant_id,
      createdAt: user.created_at
    };
  } catch (error) {
    console.error('Validate token error:', error);
    return null;
  }
};

/**
 * Create a test user for public testing
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @returns {Promise<void>}
 */
const createTestUser = async (req, res) => {
  try {
    // Check if test user already exists
    const { data: existingUser, error: existingUserError } = await supabase
      .from('users')
      .select('*')
      .eq('email', TEST_USER.email)
      .single();

    if (existingUser) {
      // User already exists, just return login credentials
      return res.status(200).json({
        success: true,
        message: 'Test user already exists',
        data: {
          email: TEST_USER.email,
          password: TEST_USER.password
        }
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(TEST_USER.password, salt);

    // Generate tenant ID
    const tenantId = uuidv4();

    // Create test user
    const { data: user, error } = await supabase
      .from('users')
      .insert({
        id: uuidv4(),
        name: TEST_USER.name,
        email: TEST_USER.email,
        encrypted_password: hashedPassword,
        organization: TEST_USER.organization,
        role: 'user',
        tenant_id: tenantId,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating test user:', error);
      return res.status(500).json({
        success: false,
        error: 'Error creating test user'
      });
    }

    // Return test user credentials
    return res.status(201).json({
      success: true,
      message: 'Test user created successfully',
      data: {
        email: TEST_USER.email,
        password: TEST_USER.password
      }
    });
  } catch (error) {
    console.error('Create test user error:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

module.exports = {
  register,
  login,
  getCurrentUser,
  validateToken,
  createTestUser
};
