/**
 * Authentication Service for FinDoc Analyzer
 * 
 * This script handles user authentication for the application.
 */

// Authentication state - make variable names consistent with what's used in login/signup
// This also handles the case of old users who have auth_token and auth_user
let authToken = localStorage.getItem('authToken') || localStorage.getItem('auth_token');
let currentUser = JSON.parse(localStorage.getItem('currentUser') || localStorage.getItem('auth_user') || 'null');

// Migrate old token format to new format if needed
if (localStorage.getItem('auth_token') && !localStorage.getItem('authToken')) {
  localStorage.setItem('authToken', localStorage.getItem('auth_token'));
}

if (localStorage.getItem('auth_user') && !localStorage.getItem('currentUser')) {
  localStorage.setItem('currentUser', localStorage.getItem('auth_user'));
}

/**
 * Initialize authentication
 */
function initAuth() {
  console.log('Initializing authentication');

  // Check if user is authenticated
  if (authToken) {
    // Verify token
    verifyToken();
  } else {
    // Update UI for unauthenticated user
    updateAuthUI(false);
  }

  // Add event listeners
  setupAuthListeners();
}

/**
 * Verify authentication token
 */
async function verifyToken() {
  try {
    const response = await fetch('/api/auth/me', {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to verify token');
    }

    const data = await response.json();
    
    // Update current user
    currentUser = data.user;
    localStorage.setItem('authToken', authToken); // Ensure token is in new format
    localStorage.setItem('currentUser', JSON.stringify(currentUser));

    // Clean up old format keys
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');

    // Update UI for authenticated user
    updateAuthUI(true);
  } catch (error) {
    console.error('Error verifying token:', error);
    
    // Clear authentication state
    logout();
  }
}

/**
 * Login with Google
 */
async function loginWithGoogle() {
  try {
    // In a real implementation, we would call the Google OAuth endpoint
    // For now, use the existing mock Google login with a direct API call
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email: 'google@example.com', password: 'google_password' })
    });

    if (!response.ok) {
      // Fallback if the mock login fails
      const user = {
        id: '3',
        name: 'Google User',
        email: 'google@example.com',
        role: 'user'
      };
      
      authToken = 'google_token';
      currentUser = user;
      
      localStorage.setItem('authToken', authToken);
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
      
      // Update UI and redirect
      updateAuthUI(true);
      window.location.href = '/';
      return;
    }

    const data = await response.json();
    
    // Save authentication state
    authToken = data.token;
    currentUser = data.user;
    
    localStorage.setItem('authToken', authToken);
    localStorage.setItem('currentUser', JSON.stringify(currentUser));

    // Clean up old format keys
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');

    // Update UI for authenticated user
    updateAuthUI(true);

    // Redirect to dashboard
    window.location.href = '/';
  } catch (error) {
    console.error('Error logging in with Google:', error);
    showAuthError('Failed to login with Google');
  }
}

/**
 * Login with email and password
 * @param {string} email - User email
 * @param {string} password - User password
 */
async function login(email, password) {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      throw new Error('Failed to login');
    }

    const data = await response.json();
    
    // Save authentication state
    authToken = data.token;
    currentUser = data.user;
    
    localStorage.setItem('authToken', authToken);
    localStorage.setItem('currentUser', JSON.stringify(currentUser));

    // Clean up old format keys
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');

    // Update UI for authenticated user
    updateAuthUI(true);

    // Redirect to dashboard
    window.location.href = '/';
  } catch (error) {
    console.error('Error logging in:', error);
    showAuthError('Invalid email or password');
  }
}

/**
 * Register a new user
 * @param {string} name - User name
 * @param {string} email - User email
 * @param {string} password - User password
 */
async function register(name, email, password) {
  try {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name, email, password })
    });

    if (!response.ok) {
      throw new Error('Failed to register');
    }

    const data = await response.json();
    
    // Save authentication state
    authToken = data.token;
    currentUser = data.user;
    
    localStorage.setItem('authToken', authToken);
    localStorage.setItem('currentUser', JSON.stringify(currentUser));

    // Clean up old format keys
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');

    // Update UI for authenticated user
    updateAuthUI(true);

    // Redirect to dashboard
    window.location.href = '/';
  } catch (error) {
    console.error('Error registering:', error);
    showAuthError('Failed to register. Email may already be in use.');
  }
}

/**
 * Logout user
 */
async function logout() {
  try {
    // Call logout API
    await fetch('/api/auth/logout', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
  } catch (error) {
    console.error('Error logging out:', error);
  } finally {
    // Clear authentication state
    authToken = null;
    currentUser = null;
    
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');

    // Update UI for unauthenticated user
    updateAuthUI(false);

    // Redirect to login page
    window.location.href = '/login';
  }
}

/**
 * Update authentication UI
 * @param {boolean} isAuthenticated - Whether user is authenticated
 */
function updateAuthUI(isAuthenticated) {
  // Get auth elements
  const authNav = document.getElementById('auth-nav');
  const userNav = document.getElementById('user-nav');
  const userNameElement = document.getElementById('user-name');
  
  if (!authNav || !userNav) {
    return;
  }
  
  if (isAuthenticated && currentUser) {
    // Show user nav
    authNav.style.display = 'none';
    userNav.style.display = 'flex';
    
    // Update user name
    if (userNameElement) {
      userNameElement.textContent = currentUser.name || 'User';
    }
  } else {
    // Show auth nav
    authNav.style.display = 'flex';
    userNav.style.display = 'none';
  }
}

/**
 * Show authentication error
 * @param {string} message - Error message
 */
function showAuthError(message) {
  const authError = document.getElementById('auth-error');
  const authErrorMessage = document.getElementById('auth-error-message');
  
  if (authError && authErrorMessage) {
    authErrorMessage.textContent = message;
    authError.style.display = 'block';
    
    // Add shake animation if supported
    if (authError.classList) {
      authError.classList.add('shake');
      setTimeout(() => {
        authError.classList.remove('shake');
      }, 500);
    }
  } else if (authError) {
    authError.textContent = message;
    authError.style.display = 'block';
  } else {
    alert(message);
  }
}

/**
 * Setup authentication listeners
 */
function setupAuthListeners() {
  // Login form - add support for both ID formats
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      // Support both ID formats
      const emailField = document.getElementById('login-email') || document.getElementById('email');
      const passwordField = document.getElementById('login-password') || document.getElementById('password');
      
      if (!emailField || !passwordField) {
        console.error('Login form fields not found');
        return;
      }
      
      login(emailField.value, passwordField.value);
    });
  }
  
  // Register form - add support for both ID formats
  const registerForm = document.getElementById('register-form') || document.getElementById('signup-form');
  if (registerForm) {
    registerForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      // Support both ID formats
      const nameField = document.getElementById('register-name') || document.getElementById('name');
      const emailField = document.getElementById('register-email') || document.getElementById('email');
      const passwordField = document.getElementById('register-password') || document.getElementById('password');
      
      if (!nameField || !emailField || !passwordField) {
        console.error('Register form fields not found');
        return;
      }
      
      register(nameField.value, emailField.value, passwordField.value);
    });
  }
  
  // Google login button
  const googleLoginBtn = document.getElementById('google-login-btn');
  if (googleLoginBtn) {
    googleLoginBtn.addEventListener('click', function(e) {
      e.preventDefault();
      loginWithGoogle();
    });
  }
  
  // Logout button
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function(e) {
      e.preventDefault();
      logout();
    });
  }
}

/**
 * Get authentication token
 * @returns {string|null} - Authentication token
 */
function getAuthToken() {
  return authToken;
}

/**
 * Get current user
 * @returns {Object|null} - Current user
 */
function getCurrentUser() {
  return currentUser;
}

/**
 * Check if user is authenticated
 * @returns {boolean} - Whether user is authenticated
 */
function isAuthenticated() {
  return !!authToken && !!currentUser;
}

/**
 * Get authentication headers
 * @returns {Object} - Authentication headers
 */
function getAuthHeaders() {
  if (!authToken) {
    return {};
  }
  
  return {
    'Authorization': `Bearer ${authToken}`
  };
}

// Initialize authentication when the DOM is loaded
document.addEventListener('DOMContentLoaded', initAuth);

// Export authentication functions
window.auth = {
  login,
  loginWithGoogle,
  register,
  logout,
  getAuthToken,
  getCurrentUser,
  isAuthenticated,
  getAuthHeaders,
  showAuthError
};

