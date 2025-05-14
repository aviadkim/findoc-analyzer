/**
 * Authentication Service for FinDoc Analyzer
 * 
 * This script handles user authentication for the application.
 */

// Authentication state
let authToken = localStorage.getItem('authToken');
let currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');

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
    localStorage.setItem('currentUser', JSON.stringify(currentUser));

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
    const response = await fetch('/api/auth/google');
    const data = await response.json();
    
    // Redirect to Google OAuth URL
    window.location.href = data.url;
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
  
  if (authError) {
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
  // Login form
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const email = document.getElementById('login-email').value;
      const password = document.getElementById('login-password').value;
      
      login(email, password);
    });
  }
  
  // Register form
  const registerForm = document.getElementById('register-form');
  if (registerForm) {
    registerForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const name = document.getElementById('register-name').value;
      const email = document.getElementById('register-email').value;
      const password = document.getElementById('register-password').value;
      
      register(name, email, password);
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
  getAuthHeaders
};

