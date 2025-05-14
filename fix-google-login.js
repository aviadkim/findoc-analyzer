/**
 * Fix Google Login 404 Issue
 * 
 * This script fixes the Google login 404 issue by implementing a proper OAuth flow.
 */

const fs = require('fs');
const path = require('path');

// Check if the auth.js file exists
const findAuthFile = () => {
  const possiblePaths = [
    path.join(__dirname, 'public', 'js', 'auth.js'),
    path.join(__dirname, 'js', 'auth.js'),
    path.join(__dirname, 'backv2-github', 'DevDocs', 'findoc-app-engine-v2', 'public', 'js', 'auth.js'),
    path.join(__dirname, 'DevDocs', 'findoc-app-engine-v2', 'public', 'js', 'auth.js')
  ];
  
  for (const filePath of possiblePaths) {
    if (fs.existsSync(filePath)) {
      console.log(`Found auth.js at ${filePath}`);
      return filePath;
    }
  }
  
  console.log('auth.js not found');
  return null;
};

// Fix the Google login issue
const fixGoogleLogin = () => {
  const authFilePath = findAuthFile();
  
  if (!authFilePath) {
    console.error('Cannot fix Google login: auth.js not found');
    return false;
  }
  
  // Backup the original file
  const backupPath = `${authFilePath}.backup`;
  fs.copyFileSync(authFilePath, backupPath);
  console.log(`Backed up auth.js to ${backupPath}`);
  
  // Read the current content
  const currentContent = fs.readFileSync(authFilePath, 'utf8');
  
  // Check if the file already has a proper Google login implementation
  if (currentContent.includes('gapi.auth2') || currentContent.includes('google.accounts.oauth2')) {
    console.log('auth.js already has Google login implementation');
    
    // Fix any issues with the implementation
    let updatedContent = currentContent;
    
    // Fix 404 issue by ensuring the redirect URI is correct
    if (currentContent.includes('redirect_uri') && !currentContent.includes('window.location.origin')) {
      updatedContent = updatedContent.replace(
        /redirect_uri: ['"]([^'"]+)['"]/g, 
        `redirect_uri: window.location.origin + '/auth/google/callback'`
      );
      console.log('Fixed redirect URI in Google login implementation');
    }
    
    // Write the updated content
    fs.writeFileSync(authFilePath, updatedContent);
    console.log('Updated auth.js with fixed Google login implementation');
    
    return true;
  }
  
  // Create a new implementation
  const newContent = `/**
 * FinDoc Analyzer Authentication
 * 
 * This file handles authentication for the FinDoc Analyzer application.
 */

// Auth state
const auth = {
  isAuthenticated: false,
  user: null,
  token: null,
  
  // Initialize auth
  init: function() {
    console.log('Initializing auth...');
    
    // Check if user is already logged in
    const token = localStorage.getItem('auth_token');
    const user = localStorage.getItem('auth_user');
    
    if (token && user) {
      try {
        this.token = token;
        this.user = JSON.parse(user);
        this.isAuthenticated = true;
        this.updateUI();
        console.log('User already logged in:', this.user.name);
      } catch (error) {
        console.error('Error parsing auth user:', error);
        this.logout();
      }
    }
    
    // Initialize Google Sign-In
    this.initGoogleSignIn();
    
    // Add event listeners
    document.addEventListener('DOMContentLoaded', () => {
      // Login form
      const loginForm = document.getElementById('login-form');
      if (loginForm) {
        loginForm.addEventListener('submit', this.handleLoginSubmit.bind(this));
      }
      
      // Logout button
      const logoutBtn = document.getElementById('logout-btn');
      if (logoutBtn) {
        logoutBtn.addEventListener('click', this.logout.bind(this));
      }
      
      // Google login button
      const googleLoginBtn = document.getElementById('google-login-btn');
      if (googleLoginBtn) {
        googleLoginBtn.addEventListener('click', this.googleLogin.bind(this));
      }
      
      // Update UI based on auth state
      this.updateUI();
    });
    
    // Handle auth callback
    if (window.location.pathname === '/auth/google/callback') {
      this.handleGoogleCallback();
    }
  },
  
  // Initialize Google Sign-In
  initGoogleSignIn: function() {
    // Load Google Sign-In API script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
    
    console.log('Google Sign-In API script loaded');
  },
  
  // Handle Google login
  googleLogin: function() {
    console.log('Google login clicked');
    
    // Create OAuth URL
    const clientId = '${process.env.GOOGLE_CLIENT_ID || '1234567890-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com'}';
    const redirectUri = window.location.origin + '/auth/google/callback';
    const scope = 'email profile';
    const responseType = 'token';
    const state = this.generateRandomString(16);
    
    // Store state in localStorage for verification
    localStorage.setItem('auth_state', state);
    
    const authUrl = \`https://accounts.google.com/o/oauth2/v2/auth?client_id=\${clientId}&redirect_uri=\${encodeURIComponent(redirectUri)}&response_type=\${responseType}&scope=\${encodeURIComponent(scope)}&state=\${state}\`;
    
    // Redirect to Google OAuth
    window.location.href = authUrl;
  },
  
  // Handle Google callback
  handleGoogleCallback: function() {
    console.log('Handling Google callback');
    
    // Get hash parameters
    const params = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = params.get('access_token');
    const state = params.get('state');
    const storedState = localStorage.getItem('auth_state');
    
    // Verify state
    if (state !== storedState) {
      console.error('Invalid state parameter');
      this.showAuthError('Invalid state parameter');
      return;
    }
    
    // Clear state
    localStorage.removeItem('auth_state');
    
    // Verify access token
    if (!accessToken) {
      console.error('No access token received');
      this.showAuthError('No access token received');
      return;
    }
    
    // Get user info
    fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: {
        'Authorization': \`Bearer \${accessToken}\`
      }
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to get user info');
      }
      return response.json();
    })
    .then(data => {
      // Create user object
      const user = {
        id: data.sub,
        name: data.name,
        email: data.email,
        picture: data.picture
      };
      
      // Store user and token
      this.user = user;
      this.token = accessToken;
      this.isAuthenticated = true;
      
      // Save to localStorage
      localStorage.setItem('auth_token', accessToken);
      localStorage.setItem('auth_user', JSON.stringify(user));
      
      // Update UI
      this.updateUI();
      
      // Redirect to dashboard
      window.location.href = '/';
    })
    .catch(error => {
      console.error('Error getting user info:', error);
      this.showAuthError('Error getting user info');
    });
  },
  
  // Handle login form submission
  handleLoginSubmit: function(event) {
    event.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    // Validate inputs
    if (!email || !password) {
      this.showAuthError('Please enter email and password');
      return;
    }
    
    // Mock login for demo purposes
    if (email === 'demo@example.com' && password === 'password') {
      const user = {
        id: '123',
        name: 'Demo User',
        email: 'demo@example.com'
      };
      
      this.user = user;
      this.token = 'demo_token';
      this.isAuthenticated = true;
      
      // Save to localStorage
      localStorage.setItem('auth_token', this.token);
      localStorage.setItem('auth_user', JSON.stringify(user));
      
      // Update UI
      this.updateUI();
      
      // Redirect to dashboard
      window.location.href = '/';
    } else {
      this.showAuthError('Invalid email or password');
    }
  },
  
  // Logout
  logout: function() {
    console.log('Logging out...');
    
    // Clear auth state
    this.isAuthenticated = false;
    this.user = null;
    this.token = null;
    
    // Clear localStorage
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    
    // Update UI
    this.updateUI();
    
    // Redirect to login page
    window.location.href = '/login';
  },
  
  // Update UI based on auth state
  updateUI: function() {
    // Auth nav
    const authNav = document.getElementById('auth-nav');
    const userNav = document.getElementById('user-nav');
    const userName = document.getElementById('user-name');
    
    if (authNav && userNav) {
      if (this.isAuthenticated) {
        authNav.style.display = 'none';
        userNav.style.display = 'flex';
        
        if (userName && this.user) {
          userName.textContent = this.user.name;
        }
      } else {
        authNav.style.display = 'flex';
        userNav.style.display = 'none';
      }
    }
  },
  
  // Show auth error
  showAuthError: function(message) {
    const authError = document.getElementById('auth-error');
    
    if (authError) {
      authError.textContent = message;
      authError.style.display = 'block';
    } else {
      console.error('Auth error:', message);
    }
  },
  
  // Generate random string for state parameter
  generateRandomString: function(length) {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      result += charset[randomIndex];
    }
    
    return result;
  }
};

// Initialize auth
auth.init();

// Export auth object
window.auth = auth;
`;
  
  // Write the new content
  fs.writeFileSync(authFilePath, newContent);
  console.log('Created new auth.js with Google login implementation');
  
  return true;
};

// Create auth callback page
const createAuthCallbackPage = () => {
  const possiblePaths = [
    path.join(__dirname, 'public'),
    path.join(__dirname, 'backv2-github', 'DevDocs', 'findoc-app-engine-v2', 'public'),
    path.join(__dirname, 'DevDocs', 'findoc-app-engine-v2', 'public')
  ];
  
  let publicDir = null;
  
  for (const dirPath of possiblePaths) {
    if (fs.existsSync(dirPath)) {
      publicDir = dirPath;
      break;
    }
  }
  
  if (!publicDir) {
    console.error('Cannot create auth callback page: public directory not found');
    return false;
  }
  
  // Create auth directory
  const authDir = path.join(publicDir, 'auth', 'google');
  fs.mkdirSync(authDir, { recursive: true });
  
  // Create callback.html
  const callbackPath = path.join(authDir, 'callback.html');
  const callbackContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>FinDoc Analyzer - Google Auth Callback</title>
  <script src="/js/auth.js"></script>
  <style>
    body {
      font-family: Arial, sans-serif;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      margin: 0;
      background-color: #f5f5f5;
    }
    .container {
      text-align: center;
      padding: 20px;
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .spinner {
      border: 4px solid rgba(0, 0, 0, 0.1);
      border-radius: 50%;
      border-top: 4px solid #3498db;
      width: 40px;
      height: 40px;
      animation: spin 1s linear infinite;
      margin: 20px auto;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Authenticating...</h1>
    <div class="spinner"></div>
    <p>Please wait while we complete the authentication process.</p>
  </div>
  
  <script>
    // The auth.js script will handle the callback automatically
    // This page is just a placeholder while the authentication is processed
  </script>
</body>
</html>`;
  
  fs.writeFileSync(callbackPath, callbackContent);
  console.log(`Created auth callback page at ${callbackPath}`);
  
  return true;
};

// Update server to handle auth routes
const updateServer = () => {
  const possiblePaths = [
    path.join(__dirname, 'server.js'),
    path.join(__dirname, 'app.js'),
    path.join(__dirname, 'index.js'),
    path.join(__dirname, 'backv2-github', 'DevDocs', 'findoc-app-engine-v2', 'server.js'),
    path.join(__dirname, 'DevDocs', 'findoc-app-engine-v2', 'server.js')
  ];
  
  let serverPath = null;
  
  for (const filePath of possiblePaths) {
    if (fs.existsSync(filePath)) {
      serverPath = filePath;
      break;
    }
  }
  
  if (!serverPath) {
    console.error('Cannot update server: server file not found');
    return false;
  }
  
  // Backup the original file
  const backupPath = `${serverPath}.backup`;
  fs.copyFileSync(serverPath, backupPath);
  console.log(`Backed up server file to ${backupPath}`);
  
  // Read the current content
  const currentContent = fs.readFileSync(serverPath, 'utf8');
  
  // Check if the file already has auth routes
  if (currentContent.includes('/auth/google/callback')) {
    console.log('Server file already has auth routes');
    return true;
  }
  
  // Find the right place to add the auth routes
  let updatedContent = currentContent;
  
  // Look for express app initialization
  const appInitRegex = /const\s+app\s*=\s*express\(\)/;
  if (appInitRegex.test(currentContent)) {
    // Add auth routes after static files middleware
    const staticFilesRegex = /app\.use\(express\.static\([^)]+\)\)/;
    if (staticFilesRegex.test(currentContent)) {
      updatedContent = updatedContent.replace(
        staticFilesRegex,
        `$&\n\n// Auth routes\napp.get('/auth/google/callback', (req, res) => {\n  res.sendFile(path.join(__dirname, 'public', 'auth', 'google', 'callback.html'));\n});`
      );
    } else {
      // Add auth routes before the first route
      const firstRouteRegex = /app\.(get|post|put|delete)\(['"]/;
      if (firstRouteRegex.test(currentContent)) {
        updatedContent = updatedContent.replace(
          firstRouteRegex,
          `// Auth routes\napp.get('/auth/google/callback', (req, res) => {\n  res.sendFile(path.join(__dirname, 'public', 'auth', 'google', 'callback.html'));\n});\n\n$&`
        );
      } else {
        // Add auth routes at the end
        updatedContent += `\n\n// Auth routes\napp.get('/auth/google/callback', (req, res) => {\n  res.sendFile(path.join(__dirname, 'public', 'auth', 'google', 'callback.html'));\n});`;
      }
    }
    
    // Write the updated content
    fs.writeFileSync(serverPath, updatedContent);
    console.log('Updated server file with auth routes');
    
    return true;
  }
  
  console.error('Cannot update server: express app initialization not found');
  return false;
};

// Main function
const main = () => {
  console.log('Fixing Google login 404 issue...');
  
  // Fix Google login
  const authFixed = fixGoogleLogin();
  
  // Create auth callback page
  const callbackCreated = createAuthCallbackPage();
  
  // Update server
  const serverUpdated = updateServer();
  
  if (authFixed && callbackCreated && serverUpdated) {
    console.log('Google login 404 issue fixed successfully');
    return true;
  } else {
    console.error('Failed to fix Google login 404 issue');
    return false;
  }
};

// Run main function
if (require.main === module) {
  main();
}

module.exports = {
  main,
  fixGoogleLogin,
  createAuthCallbackPage,
  updateServer
};
