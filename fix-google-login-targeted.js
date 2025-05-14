/**
 * Targeted Fix for Google Login 404 Issue
 * 
 * This script fixes the Google login 404 issue by creating a proper login page and auth callback.
 */

const fs = require('fs');
const path = require('path');

// Create login page
const createLoginPage = () => {
  const publicDir = path.join(__dirname, 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  
  const loginPagePath = path.join(publicDir, 'login.html');
  
  // Backup the original file if it exists
  if (fs.existsSync(loginPagePath)) {
    const backupPath = `${loginPagePath}.backup`;
    fs.copyFileSync(loginPagePath, backupPath);
    console.log(`Backed up login.html to ${backupPath}`);
  }
  
  // Create login page content
  const loginPageContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>FinDoc Analyzer - Login</title>
  <link rel="stylesheet" href="/css/styles.css">
  <style>
    .login-container {
      max-width: 400px;
      margin: 100px auto;
      padding: 20px;
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .login-header {
      text-align: center;
      margin-bottom: 20px;
    }
    
    .login-form {
      display: flex;
      flex-direction: column;
      gap: 15px;
    }
    
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 5px;
    }
    
    .form-group label {
      font-weight: 500;
    }
    
    .form-group input {
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 16px;
    }
    
    .login-button {
      padding: 12px;
      background-color: #4caf50;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 16px;
      font-weight: 500;
    }
    
    .login-button:hover {
      background-color: #45a049;
    }
    
    .google-login-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      padding: 12px;
      background-color: white;
      color: #757575;
      border: 1px solid #ddd;
      border-radius: 4px;
      cursor: pointer;
      font-size: 16px;
      font-weight: 500;
      text-decoration: none;
    }
    
    .google-login-btn:hover {
      background-color: #f5f5f5;
    }
    
    .google-icon {
      width: 18px;
      height: 18px;
    }
    
    .login-divider {
      display: flex;
      align-items: center;
      margin: 20px 0;
    }
    
    .login-divider::before,
    .login-divider::after {
      content: "";
      flex: 1;
      border-bottom: 1px solid #ddd;
    }
    
    .login-divider span {
      padding: 0 10px;
      color: #757575;
      font-size: 14px;
    }
    
    .login-footer {
      text-align: center;
      margin-top: 20px;
      font-size: 14px;
      color: #757575;
    }
    
    .login-footer a {
      color: #4caf50;
      text-decoration: none;
    }
    
    .login-footer a:hover {
      text-decoration: underline;
    }
    
    #auth-error {
      display: none;
      padding: 10px;
      background-color: #f8d7da;
      color: #721c24;
      border-radius: 4px;
      margin-bottom: 15px;
    }
  </style>
</head>
<body>
  <div class="login-container">
    <div class="login-header">
      <h1>FinDoc Analyzer</h1>
      <p>Sign in to your account</p>
    </div>
    
    <div id="auth-error"></div>
    
    <form id="login-form" class="login-form">
      <div class="form-group">
        <label for="email">Email</label>
        <input type="email" id="email" name="email" required>
      </div>
      
      <div class="form-group">
        <label for="password">Password</label>
        <input type="password" id="password" name="password" required>
      </div>
      
      <button type="submit" class="login-button">Sign In</button>
    </form>
    
    <div class="login-divider">
      <span>OR</span>
    </div>
    
    <a href="javascript:void(0);" id="google-login-btn" class="google-login-btn">
      <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" class="google-icon">
      <span>Sign in with Google</span>
    </a>
    
    <div class="login-footer">
      <p>Don't have an account? <a href="/signup">Sign up</a></p>
    </div>
  </div>
  
  <script>
    // Handle form submission
    document.getElementById('login-form').addEventListener('submit', function(event) {
      event.preventDefault();
      
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      
      // Simple validation
      if (!email || !password) {
        showAuthError('Please enter email and password');
        return;
      }
      
      // Mock login for demo purposes
      if (email === 'demo@example.com' && password === 'password') {
        // Store user info in localStorage
        const user = {
          id: '123',
          name: 'Demo User',
          email: 'demo@example.com'
        };
        
        localStorage.setItem('auth_token', 'demo_token');
        localStorage.setItem('auth_user', JSON.stringify(user));
        
        // Redirect to dashboard
        window.location.href = '/';
      } else {
        showAuthError('Invalid email or password');
      }
    });
    
    // Handle Google login
    document.getElementById('google-login-btn').addEventListener('click', function() {
      handleGoogleLogin();
    });
    
    // Google login handler
    function handleGoogleLogin() {
      console.log('Google login clicked');
      
      // Create OAuth URL
      const clientId = '1234567890-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com'; // Replace with your actual client ID
      const redirectUri = window.location.origin + '/auth/google/callback';
      const scope = 'email profile';
      const responseType = 'token';
      const state = generateRandomString(16);
      
      // Store state in localStorage for verification
      localStorage.setItem('auth_state', state);
      
      const authUrl = \`https://accounts.google.com/o/oauth2/v2/auth?client_id=\${clientId}&redirect_uri=\${encodeURIComponent(redirectUri)}&response_type=\${responseType}&scope=\${encodeURIComponent(scope)}&state=\${state}\`;
      
      // Redirect to Google OAuth
      window.location.href = authUrl;
    }
    
    // Generate random string for state parameter
    function generateRandomString(length) {
      const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      let result = '';
      
      for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length);
        result += charset[randomIndex];
      }
      
      return result;
    }
    
    // Show auth error
    function showAuthError(message) {
      const authError = document.getElementById('auth-error');
      authError.textContent = message;
      authError.style.display = 'block';
    }
  </script>
</body>
</html>`;
  
  // Write the file
  fs.writeFileSync(loginPagePath, loginPageContent);
  console.log(`Created login.html at ${loginPagePath}`);
  
  return true;
};

// Create auth callback page
const createAuthCallbackPage = () => {
  const publicDir = path.join(__dirname, 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
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
    // Handle the OAuth callback
    function handleCallback() {
      console.log('Handling Google callback');
      
      // Get hash parameters
      const params = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = params.get('access_token');
      const state = params.get('state');
      const storedState = localStorage.getItem('auth_state');
      
      // Verify state
      if (state !== storedState) {
        console.error('Invalid state parameter');
        showError('Invalid state parameter');
        return;
      }
      
      // Clear state
      localStorage.removeItem('auth_state');
      
      // Verify access token
      if (!accessToken) {
        console.error('No access token received');
        showError('No access token received');
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
        localStorage.setItem('auth_token', accessToken);
        localStorage.setItem('auth_user', JSON.stringify(user));
        
        // Redirect to dashboard
        window.location.href = '/';
      })
      .catch(error => {
        console.error('Error getting user info:', error);
        showError('Error getting user info');
      });
    }
    
    // Show error message
    function showError(message) {
      document.querySelector('.container').innerHTML = \`
        <h1>Authentication Error</h1>
        <p>\${message}</p>
        <a href="/login">Back to Login</a>
      \`;
    }
    
    // Run the callback handler
    handleCallback();
  </script>
</body>
</html>`;
  
  fs.writeFileSync(callbackPath, callbackContent);
  console.log(`Created auth callback page at ${callbackPath}`);
  
  return true;
};

// Update server to handle auth routes
const updateServer = () => {
  const serverPath = path.join(__dirname, 'server.js');
  
  // Create server file if it doesn't exist
  if (!fs.existsSync(serverPath)) {
    const serverContent = `const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Auth routes
app.get('/auth/google/callback', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'auth', 'google', 'callback.html'));
});

// Document chat API route
app.get('/api/document-chat', (req, res) => {
  const documentId = req.query.documentId;
  const message = req.query.message;
  
  console.log(\`Document chat request: documentId=\${documentId}, message=\${message}\`);
  
  // Mock response
  res.json({
    success: true,
    documentId,
    message,
    response: 'I found the following information in the document: The document contains financial information for Apple Inc. (ISIN: US0378331005) and Microsoft Corporation (ISIN: US5949181045).'
  });
});

// Documents API route
app.get('/api/documents', (req, res) => {
  // Mock documents
  const documents = [
    { id: 'doc1', name: 'Financial Report Q1 2023' },
    { id: 'doc2', name: 'Investment Portfolio 2023' },
    { id: 'doc3', name: 'Stock Analysis Report' }
  ];
  
  res.json({
    success: true,
    documents
  });
});

// Catch-all route for SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
});
`;
    
    fs.writeFileSync(serverPath, serverContent);
    console.log(`Created server.js at ${serverPath}`);
    return true;
  }
  
  // Backup the original file
  const backupPath = `${serverPath}.backup`;
  if (!fs.existsSync(backupPath)) {
    fs.copyFileSync(serverPath, backupPath);
    console.log(`Backed up server file to ${backupPath}`);
  }
  
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

// Create package.json if it doesn't exist
const createPackageJson = () => {
  const packageJsonPath = path.join(__dirname, 'package.json');
  
  if (fs.existsSync(packageJsonPath)) {
    console.log('package.json already exists');
    return true;
  }
  
  const packageJsonContent = `{
  "name": "findoc-analyzer",
  "version": "1.0.0",
  "description": "Financial Document Analyzer",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "node simple-test.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "playwright": "^1.35.0"
  },
  "devDependencies": {
    "nodemon": "^2.0.22"
  }
}`;
  
  fs.writeFileSync(packageJsonPath, packageJsonContent);
  console.log(`Created package.json at ${packageJsonPath}`);
  
  return true;
};

// Main function
const main = () => {
  console.log('Fixing Google login 404 issue (targeted approach)...');
  
  // Create login page
  const loginPageCreated = createLoginPage();
  
  // Create auth callback page
  const callbackCreated = createAuthCallbackPage();
  
  // Update server
  const serverUpdated = updateServer();
  
  // Create package.json
  const packageJsonCreated = createPackageJson();
  
  if (loginPageCreated && callbackCreated && serverUpdated && packageJsonCreated) {
    console.log('Google login 404 issue fixed successfully (targeted approach)');
    return true;
  } else {
    console.error('Failed to fix Google login 404 issue (targeted approach)');
    return false;
  }
};

// Run main function
if (require.main === module) {
  main();
}

module.exports = {
  main,
  createLoginPage,
  createAuthCallbackPage,
  updateServer,
  createPackageJson
};
