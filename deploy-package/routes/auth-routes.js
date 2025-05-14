/**
 * Authentication Routes
 * Handles login, logout, password reset, and session management
 */

const express = require('express');
const router = express.Router();
const authService = require('../services/auth-service');
const logger = require('../services/logger-service');
const errorHandler = require('../services/error-handler-service');

// Mock user database for testing
const users = [
  {
    id: 'user-1',
    email: 'test@example.com',
    password: 'password123', // In a real app, this would be hashed
    name: 'Test User',
    mfaEnabled: false,
    mfaSecret: null,
    phone: '+11234567890'
  }
];

// Store password reset tokens
const resetTokens = {};

// Store MFA verification codes
const mfaVerificationCodes = {};

// Mock sessions for testing
const sessions = {};

/**
 * Validation schema for login requests
 */
const loginSchema = {
  email: {
    required: true,
    type: 'string',
    pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    patternMessage: 'Email is invalid'
  },
  password: {
    required: true,
    type: 'string',
    minLength: 6
  }
};

/**
 * Login endpoint
 * Accepts email and password, returns user info and session token
 * If MFA is enabled, requires verification
 */
router.post('/login', errorHandler.asyncHandler(async (req, res) => {
  const { email, password, mfaCode } = req.body;
  
  // Log login attempt (with redacted password)
  logger.info('Login attempt', { email, hasMfaCode: !!mfaCode });
  
  // Validate request
  errorHandler.validateRequest(req.body, loginSchema);
  
  // Find user by email
  const user = users.find(u => u.email === email);
  
  // Check if user exists and password matches
  if (!user || user.password !== password) {
    logger.warn('Login failed: Invalid credentials', { email });
    throw new logger.AuthenticationError('Invalid email or password');
  }
  
  // Check if MFA is enabled for this user
  if (user.mfaEnabled) {
    // If MFA is enabled but no code was provided, send a verification code
    if (!mfaCode) {
      // Generate and store a verification code
      const verificationId = 'mfa-' + Date.now();
      
      // Use email for verification - in a real app this could be SMS or authenticator app
      const verificationCode = await authService.sendMfaCode(user.id, user.email, 'email');
      
      // Store the verification code with expiration
      mfaVerificationCodes[verificationId] = {
        userId: user.id,
        code: verificationCode,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 minutes
        attempts: 0
      };
      
      logger.info('MFA verification required', { userId: user.id, email: user.email, method: 'email' });
      
      // Return verification info but no session token yet
      return res.status(200).json({
        success: true,
        message: 'MFA verification required',
        requiresMfa: true,
        mfaMethod: 'email', // or 'sms', 'totp'
        verificationId,
        user: {
          id: user.id,
          email: user.email,
          name: user.name
        }
      });
    } else {
      // MFA code was provided, verify it
      const { verificationId } = req.body;
      
      if (!verificationId) {
        throw new logger.ValidationError('Verification ID is required for MFA');
      }
      
      // Check if verification ID exists
      if (!mfaVerificationCodes[verificationId]) {
        throw new logger.AuthenticationError('Invalid or expired verification ID');
      }
      
      const verification = mfaVerificationCodes[verificationId];
      
      // Check if verification is expired
      if (new Date(verification.expiresAt) < new Date()) {
        // Remove expired verification
        delete mfaVerificationCodes[verificationId];
        
        throw new logger.AuthenticationError('MFA verification code has expired');
      }
      
      // Check if user ID matches
      if (verification.userId !== user.id) {
        throw new logger.AuthenticationError('Invalid verification ID for this user');
      }
      
      // Check if too many attempts
      if (verification.attempts >= 3) {
        // Remove verification after too many attempts
        delete mfaVerificationCodes[verificationId];
        
        throw new logger.AuthenticationError('Too many failed verification attempts');
      }
      
      // Check if code matches
      if (verification.code !== mfaCode) {
        // Increment attempts
        verification.attempts++;
        
        logger.warn('Invalid MFA code', {
          userId: user.id,
          attempts: verification.attempts,
          attemptsRemaining: 3 - verification.attempts
        });
        
        return res.status(401).json({
          success: false,
          message: 'Invalid MFA verification code',
          attemptsRemaining: 3 - verification.attempts
        });
      }
      
      // MFA verification successful, remove verification
      delete mfaVerificationCodes[verificationId];
      
      logger.info('MFA verification successful', { userId: user.id, email: user.email });
    }
  }
  
  // At this point, authentication is successful (either no MFA or MFA verified)
  
  // Generate session token
  const sessionToken = 'session-' + Date.now();
  
  // Store session
  sessions[sessionToken] = {
    userId: user.id,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
  };
  
  logger.info('Login successful', { userId: user.id, email: user.email });
  
  // Return user info and session token
  res.status(200).json({
    success: true,
    message: 'Login successful',
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      mfaEnabled: user.mfaEnabled
    },
    sessionToken,
    expiresAt: sessions[sessionToken].expiresAt
  });
}));

/**
 * Logout endpoint
 * Invalidates the session token
 */
router.post('/logout', (req, res) => {
  console.log('Logout request received:', req.body);
  const { sessionToken } = req.body;

  // For testing purposes, allow logout without a session token
  if (!sessionToken) {
    console.log('Logout without session token - allowing for testing');
    return res.status(200).json({
      success: true,
      message: 'Logout successful (no session token provided)'
    });
  }

  // Check if session exists
  if (!sessions[sessionToken]) {
    console.log('Logout with invalid session token');
    // Still return success for testing purposes
    return res.status(200).json({
      success: true,
      message: 'Logout successful (invalid session token)'
    });
  }

  // Remove session
  delete sessions[sessionToken];
  console.log('Logout successful, session removed');

  res.status(200).json({
    success: true,
    message: 'Logout successful'
  });
});

/**
 * Session validation endpoint
 * Checks if a session token is valid
 */
router.post('/validate-session', (req, res) => {
  const { sessionToken } = req.body;

  if (!sessionToken) {
    return res.status(400).json({
      success: false,
      message: 'Session token is required'
    });
  }

  // Check if session exists
  if (!sessions[sessionToken]) {
    return res.status(401).json({
      success: false,
      message: 'Invalid session token'
    });
  }

  // Check if session is expired
  const session = sessions[sessionToken];
  const expiresAt = new Date(session.expiresAt);

  if (expiresAt < new Date()) {
    // Remove expired session
    delete sessions[sessionToken];

    return res.status(401).json({
      success: false,
      message: 'Session expired'
    });
  }

  // Find user
  const user = users.find(u => u.id === session.userId);

  // Return user info
  res.status(200).json({
    success: true,
    message: 'Session is valid',
    user: {
      id: user.id,
      email: user.email,
      name: user.name
    },
    expiresAt: session.expiresAt
  });
});

/**
 * Generate Google OAuth URL
 * Returns a URL for Google OAuth authentication
 */
router.get('/google', (req, res) => {
  try {
    // In a real implementation, this would generate a Google OAuth URL
    // For testing, just return a mock URL
    const oauthUrl = authService.generateGoogleAuthUrl();
    
    res.json({
      success: true,
      url: oauthUrl
    });
  } catch (error) {
    console.error('Error generating Google OAuth URL:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate Google OAuth URL',
      error: error.message
    });
  }
});

/**
 * Google OAuth callback endpoint
 * This would normally handle the OAuth callback from Google
 * For testing purposes, it just returns a mock user
 */
router.get('/google/callback', (req, res) => {
  try {
    // In a real implementation, this would validate the OAuth code
    // and exchange it for an access token
    const { code } = req.query;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Missing authorization code'
      });
    }

    // For testing, just create a mock session
    const sessionToken = 'google-session-' + Date.now();

    // Store session
    sessions[sessionToken] = {
      userId: 'google-user-1',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
    };

    // Add a mock Google user
    if (!users.find(u => u.id === 'google-user-1')) {
      users.push({
        id: 'google-user-1',
        email: 'google-user@example.com',
        name: 'Google User',
        authProvider: 'google'
      });
    }

    // Redirect to the frontend with the session token
    res.redirect(`/?sessionToken=${sessionToken}`);
  } catch (error) {
    console.error('Error in Google OAuth callback:', error);
    res.redirect(`/login?error=${encodeURIComponent('Failed to authenticate with Google')}`);
  }
});

/**
 * User registration endpoint
 */
router.post('/register', (req, res) => {
  const { email, password, name } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({
      success: false,
      message: 'Email, password, and name are required'
    });
  }

  // Check if user already exists
  if (users.find(u => u.email === email)) {
    return res.status(409).json({
      success: false,
      message: 'User with this email already exists'
    });
  }

  // Create new user
  const newUser = {
    id: 'user-' + Date.now(),
    email,
    password, // In a real app, this would be hashed
    name
  };

  // Add user to database
  users.push(newUser);

  // Generate session token
  const sessionToken = 'session-' + Date.now();

  // Store session
  sessions[sessionToken] = {
    userId: newUser.id,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
  };

  // Return user info and session token
  res.status(201).json({
    success: true,
    message: 'Registration successful',
    user: {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name
    },
    sessionToken,
    expiresAt: sessions[sessionToken].expiresAt
  });
});

/**
 * Password reset request endpoint
 * Initiates the password reset process by sending an email with a reset link
 */
router.post('/password-reset/request', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    // Check if user exists
    const user = users.find(u => u.email === email);
    if (!user) {
      // For security reasons, don't reveal that the email doesn't exist
      return res.status(200).json({
        success: true,
        message: 'If a user with that email exists, a password reset link has been sent'
      });
    }

    // Generate reset token
    const resetToken = 'reset-' + Date.now() + '-' + Math.random().toString(36).substring(2, 15);
    
    // Store token with expiration (15 minutes)
    resetTokens[resetToken] = {
      userId: user.id,
      email: user.email,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString() // 15 minutes
    };

    // In a real implementation, send an email with the reset link
    // For testing, just log the reset token
    console.log(`Password reset requested for ${email}. Reset token: ${resetToken}`);
    
    // Call service to "send" the email (mocked)
    await authService.sendPasswordResetEmail(email, resetToken);

    res.status(200).json({
      success: true,
      message: 'If a user with that email exists, a password reset link has been sent',
      // Include the token directly in the response for testing purposes only
      // In a real app, this would not be returned in the response
      debug: { resetToken }
    });
  } catch (error) {
    console.error('Error requesting password reset:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process password reset request',
      error: error.message
    });
  }
});

/**
 * Verify password reset token endpoint
 * Checks if a password reset token is valid
 */
router.get('/password-reset/verify', (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Reset token is required'
      });
    }

    // Check if token exists
    if (!resetTokens[token]) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    // Check if token is expired
    const resetData = resetTokens[token];
    const expiresAt = new Date(resetData.expiresAt);

    if (expiresAt < new Date()) {
      // Remove expired token
      delete resetTokens[token];

      return res.status(401).json({
        success: false,
        message: 'Reset token has expired'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Reset token is valid',
      email: resetData.email
    });
  } catch (error) {
    console.error('Error verifying reset token:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify reset token',
      error: error.message
    });
  }
});

/**
 * Password reset completion endpoint
 * Resets the user's password using a valid reset token
 */
router.post('/password-reset/complete', (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Reset token and new password are required'
      });
    }

    // Validate password strength (simplified)
    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long'
      });
    }

    // Check if token exists
    if (!resetTokens[token]) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    // Check if token is expired
    const resetData = resetTokens[token];
    const expiresAt = new Date(resetData.expiresAt);

    if (expiresAt < new Date()) {
      // Remove expired token
      delete resetTokens[token];

      return res.status(401).json({
        success: false,
        message: 'Reset token has expired'
      });
    }

    // Find user
    const userIndex = users.findIndex(u => u.id === resetData.userId);
    if (userIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update user's password
    users[userIndex].password = newPassword; // In a real app, this would be hashed

    // Remove used token
    delete resetTokens[token];

    // Log all active sessions for this user
    const userSessions = Object.entries(sessions)
      .filter(([_, session]) => session.userId === resetData.userId);
    
    // Invalidate all sessions for this user (for security)
    userSessions.forEach(([sessionToken, _]) => {
      delete sessions[sessionToken];
    });

    console.log(`Password reset completed for user ${resetData.email}. Invalidated ${userSessions.length} sessions.`);

    res.status(200).json({
      success: true,
      message: 'Password has been reset successfully'
    });
  } catch (error) {
    console.error('Error completing password reset:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reset password',
      error: error.message
    });
  }
});

/**
 * Setup MFA endpoint
 * Initiates MFA setup for a user
 */
router.post('/mfa/setup', (req, res) => {
  try {
    const { sessionToken, method } = req.body;
    
    if (!sessionToken) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    
    // Validate session
    if (!sessions[sessionToken]) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired session'
      });
    }
    
    // Get user from session
    const userId = sessions[sessionToken].userId;
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    const user = users[userIndex];
    
    // Generate MFA secret for TOTP (time-based one-time password)
    const secret = authService.generateMfaSecret();
    
    // Store the secret temporarily (not enabled yet until verified)
    user.pendingMfaSecret = secret;
    
    // Generate QR code URL for setting up authenticator app
    const qrCodeUrl = authService.generateQrCodeUrl(secret, user.email);
    
    res.status(200).json({
      success: true,
      message: 'MFA setup initiated',
      method: 'totp', // Currently only supporting TOTP
      secret, // This would be shown as text for manual entry
      qrCodeUrl, // This would be displayed as a QR code in the UI
      recoveryCodes: [
        // In a real app, generate and store recovery codes
        'RECOVERY1', 'RECOVERY2', 'RECOVERY3', 'RECOVERY4', 'RECOVERY5'
      ]
    });
  } catch (error) {
    console.error('Error setting up MFA:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to set up MFA',
      error: error.message
    });
  }
});

/**
 * Verify and enable MFA endpoint
 * Verifies the MFA setup and enables it for the user
 */
router.post('/mfa/verify', (req, res) => {
  try {
    const { sessionToken, code } = req.body;
    
    if (!sessionToken || !code) {
      return res.status(400).json({
        success: false,
        message: 'Session token and verification code are required'
      });
    }
    
    // Validate session
    if (!sessions[sessionToken]) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired session'
      });
    }
    
    // Get user from session
    const userId = sessions[sessionToken].userId;
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    const user = users[userIndex];
    
    // Check if user has a pending MFA secret
    if (!user.pendingMfaSecret) {
      return res.status(400).json({
        success: false,
        message: 'No pending MFA setup found'
      });
    }
    
    // Verify the code against the secret
    const isValid = authService.verifyTotpCode(user.pendingMfaSecret, code);
    
    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid verification code'
      });
    }
    
    // Enable MFA for the user
    user.mfaEnabled = true;
    user.mfaSecret = user.pendingMfaSecret;
    delete user.pendingMfaSecret;
    
    res.status(200).json({
      success: true,
      message: 'MFA has been successfully enabled',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        mfaEnabled: user.mfaEnabled
      }
    });
  } catch (error) {
    console.error('Error verifying MFA setup:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify MFA setup',
      error: error.message
    });
  }
});

/**
 * Disable MFA endpoint
 * Turns off MFA for a user
 */
router.post('/mfa/disable', (req, res) => {
  try {
    const { sessionToken, password } = req.body;
    
    if (!sessionToken || !password) {
      return res.status(400).json({
        success: false,
        message: 'Session token and password are required'
      });
    }
    
    // Validate session
    if (!sessions[sessionToken]) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired session'
      });
    }
    
    // Get user from session
    const userId = sessions[sessionToken].userId;
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    const user = users[userIndex];
    
    // Confirm password for security
    if (user.password !== password) {
      return res.status(401).json({
        success: false,
        message: 'Invalid password'
      });
    }
    
    // Disable MFA for the user
    user.mfaEnabled = false;
    user.mfaSecret = null;
    
    res.status(200).json({
      success: true,
      message: 'MFA has been successfully disabled',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        mfaEnabled: user.mfaEnabled
      }
    });
  } catch (error) {
    console.error('Error disabling MFA:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to disable MFA',
      error: error.message
    });
  }
});

module.exports = router;
