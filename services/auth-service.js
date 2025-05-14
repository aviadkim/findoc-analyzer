/**
 * Authentication Service
 * Handles user authentication, session management, MFA, and OAuth integrations
 */

// Mock configuration for Google OAuth
const googleConfig = {
  clientId: process.env.GOOGLE_CLIENT_ID || 'mock-client-id',
  clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'mock-client-secret',
  redirectUri: process.env.GOOGLE_REDIRECT_URI || 'http://localhost:8080/auth/google/callback'
};

// MFA configuration
const mfaConfig = {
  codeLength: 6, // Length of verification code
  codeExpiry: 10 * 60 * 1000, // 10 minutes in milliseconds
  maxAttempts: 3, // Maximum number of verification attempts
};

/**
 * Generate a Google OAuth URL for authentication
 * @returns {string} Google OAuth URL
 */
function generateGoogleAuthUrl() {
  try {
    // For testing purposes, just return a mock URL
    // In a real implementation, this would generate a proper Google OAuth URL
    const mockUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${googleConfig.clientId}&redirect_uri=${encodeURIComponent(googleConfig.redirectUri)}&response_type=code&scope=email%20profile&state=${Date.now()}`;
    
    console.log('Generated Google OAuth URL (mock):', mockUrl);
    return mockUrl;
  } catch (error) {
    console.error('Error generating Google OAuth URL:', error);
    throw error;
  }
}

/**
 * Handle Google OAuth callback
 * @param {string} code - Authorization code from Google
 * @returns {Object} User data and session token
 */
async function handleGoogleCallback(code) {
  try {
    console.log('Processing Google OAuth callback with code:', code);
    
    // For testing purposes, just return mock user data
    // In a real implementation, this would exchange the code for tokens
    // and fetch the user's Google profile
    
    const mockUser = {
      id: 'google-user-' + Date.now(),
      email: 'google-user@example.com',
      name: 'Google User',
      authProvider: 'google'
    };
    
    const sessionToken = 'google-session-' + Date.now();
    
    return {
      user: mockUser,
      sessionToken,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
    };
  } catch (error) {
    console.error('Error handling Google OAuth callback:', error);
    throw error;
  }
}

/**
 * Create a JWT token for authentication
 * @param {Object} user - User data
 * @returns {string} JWT token
 */
function createJwtToken(user) {
  try {
    // For testing purposes, just return a mock token
    // In a real implementation, this would generate a proper JWT token
    return 'jwt-' + Date.now() + '-' + user.id;
  } catch (error) {
    console.error('Error creating JWT token:', error);
    throw error;
  }
}

/**
 * Verify a JWT token
 * @param {string} token - JWT token to verify
 * @returns {Object} Decoded token payload
 */
function verifyJwtToken(token) {
  try {
    // For testing purposes, just return a mock payload
    // In a real implementation, this would verify and decode the JWT token
    
    if (!token) {
      throw new Error('Token is required');
    }
    
    if (!token.startsWith('jwt-')) {
      throw new Error('Invalid token format');
    }
    
    // Extract user ID from token (mock implementation)
    const parts = token.split('-');
    const userId = parts[2];
    
    return {
      userId,
      exp: Date.now() + 24 * 60 * 60 * 1000 // 24 hours from now
    };
  } catch (error) {
    console.error('Error verifying JWT token:', error);
    throw error;
  }
}

/**
 * Reset user password
 * @param {string} email - User email
 * @returns {boolean} Success indicator
 */
async function resetPassword(email) {
  try {
    console.log('Password reset requested for:', email);
    
    // For testing purposes, just return success
    // In a real implementation, this would send a password reset email
    return true;
  } catch (error) {
    console.error('Error resetting password:', error);
    throw error;
  }
}

/**
 * Send password reset email
 * @param {string} email - User email
 * @param {string} resetToken - Password reset token
 * @returns {boolean} Success indicator
 */
async function sendPasswordResetEmail(email, resetToken) {
  try {
    console.log(`Sending password reset email to ${email} with token ${resetToken}`);
    
    // For testing purposes, just log the email contents
    // In a real implementation, this would use a mail service like SendGrid, Mailgun, etc.
    
    const resetLink = `http://localhost:8080/reset-password?token=${resetToken}`;
    
    console.log('========== MOCK EMAIL ==========');
    console.log(`To: ${email}`);
    console.log('Subject: Reset your password');
    console.log('Body:');
    console.log('Dear user,');
    console.log('');
    console.log('You have requested to reset your password. Please click the link below to set a new password:');
    console.log(resetLink);
    console.log('');
    console.log('This link will expire in 15 minutes.');
    console.log('');
    console.log('If you did not request this, please ignore this email.');
    console.log('');
    console.log('Regards,');
    console.log('The Financial Document Analysis Team');
    console.log('================================');
    
    return true;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw error;
  }
}

/**
 * Validate token and change password
 * @param {string} token - Reset token
 * @param {string} newPassword - New password
 * @returns {boolean} Success indicator
 */
async function completePasswordReset(token, newPassword) {
  try {
    console.log(`Completing password reset with token ${token}`);
    
    // For testing purposes, just log the action
    // In a real implementation, this would validate the token and change the password
    
    return true;
  } catch (error) {
    console.error('Error completing password reset:', error);
    throw error;
  }
}

/**
 * Generate a random MFA verification code
 * @returns {string} Verification code
 */
function generateMfaCode() {
  // Generate a random 6-digit code
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  return code;
}

/**
 * Generate a unique MFA secret for a user
 * @returns {string} MFA secret key
 */
function generateMfaSecret() {
  // In a real implementation, this would use a library like speakeasy to generate a proper TOTP secret
  // For testing purposes, just generate a random string
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'; // Base32 alphabet
  let secret = '';
  for (let i = 0; i < 16; i++) {
    secret += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return secret;
}

/**
 * Send MFA verification code via SMS or email
 * @param {string} userId - User ID
 * @param {string} contact - Phone number or email
 * @param {string} method - 'sms' or 'email'
 * @returns {string} Verification code
 */
async function sendMfaCode(userId, contact, method = 'sms') {
  try {
    console.log(`Sending MFA code to user ${userId} via ${method}`);
    
    // Generate verification code
    const code = generateMfaCode();
    
    if (method === 'sms') {
      console.log(`[MOCK SMS] Sending verification code ${code} to ${contact}`);
      // In a real implementation, this would use Twilio or another SMS service
    } else if (method === 'email') {
      console.log(`[MOCK EMAIL] Sending verification code ${code} to ${contact}`);
      // In a real implementation, this would use an email service
      console.log('========== MOCK MFA EMAIL ==========');
      console.log(`To: ${contact}`);
      console.log('Subject: Your verification code');
      console.log('Body:');
      console.log('Dear user,');
      console.log('');
      console.log(`Your verification code is: ${code}`);
      console.log('');
      console.log('This code will expire in 10 minutes.');
      console.log('');
      console.log('If you did not request this code, please secure your account.');
      console.log('');
      console.log('Regards,');
      console.log('The Financial Document Analysis Team');
      console.log('====================================');
    }
    
    return code;
  } catch (error) {
    console.error('Error sending MFA code:', error);
    throw error;
  }
}

/**
 * Generate a QR code URL for TOTP setup
 * @param {string} secret - TOTP secret
 * @param {string} email - User email
 * @returns {string} QR code URL
 */
function generateQrCodeUrl(secret, email) {
  // In a real implementation, this would use a library like qrcode to generate a QR code
  // For testing purposes, just return a mock URL for demonstration
  const appName = encodeURIComponent('FinDoc Analyzer');
  const encodedEmail = encodeURIComponent(email);
  
  // Generate an otpauth URL for the QR code
  // Format: otpauth://totp/APP_NAME:EMAIL?secret=SECRET&issuer=APP_NAME
  const otpauthUrl = `otpauth://totp/${appName}:${encodedEmail}?secret=${secret}&issuer=${appName}`;
  
  // In a real app, we would convert this to a QR code image
  // For testing, we'll just use a fake QR code service URL
  return `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(otpauthUrl)}&size=200x200`;
}

/**
 * Verify a TOTP code against a secret
 * @param {string} secret - TOTP secret
 * @param {string} code - TOTP code to verify
 * @returns {boolean} True if code is valid
 */
function verifyTotpCode(secret, code) {
  try {
    // In a real implementation, this would use a library like speakeasy to verify the TOTP code
    // For testing purposes, just verify that the code is 6 digits and consider it valid
    const isValid = /^\d{6}$/.test(code);
    
    // For testing, log the "verification" process
    console.log(`Verifying TOTP code: ${code} against secret: ${secret}`);
    console.log(`[MOCK TOTP] Code is ${isValid ? 'valid' : 'invalid'}`);
    
    return isValid;
  } catch (error) {
    console.error('Error verifying TOTP code:', error);
    throw error;
  }
}

// Export functions
module.exports = {
  generateGoogleAuthUrl,
  handleGoogleCallback,
  createJwtToken,
  verifyJwtToken,
  resetPassword,
  sendPasswordResetEmail,
  completePasswordReset,
  generateMfaCode,
  generateMfaSecret,
  sendMfaCode,
  generateQrCodeUrl,
  verifyTotpCode
};