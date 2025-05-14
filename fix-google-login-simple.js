/**
 * Simple Fix for Google Login 404 Issue
 * 
 * This script fixes the Google login 404 issue by updating the login button's href.
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// Configuration
const config = {
  baseUrl: 'https://backv2-app-brfi73d4ra-zf.a.run.app', // Cloud deployment URL
  localUrl: 'http://localhost:8080', // Local URL
  timeout: 30000, // 30 seconds
};

// Find login page HTML file
const findLoginPage = () => {
  const possiblePaths = [
    path.join(__dirname, 'public', 'login.html'),
    path.join(__dirname, 'login.html'),
    path.join(__dirname, 'backv2-github', 'DevDocs', 'findoc-app-engine-v2', 'public', 'login.html'),
    path.join(__dirname, 'DevDocs', 'findoc-app-engine-v2', 'public', 'login.html')
  ];
  
  for (const filePath of possiblePaths) {
    if (fs.existsSync(filePath)) {
      console.log(`Found login.html at ${filePath}`);
      return filePath;
    }
  }
  
  console.log('login.html not found');
  return null;
};

// Fix Google login button
const fixGoogleLoginButton = () => {
  const loginPagePath = findLoginPage();
  
  if (!loginPagePath) {
    console.error('Cannot fix Google login button: login.html not found');
    return false;
  }
  
  // Backup the original file
  const backupPath = `${loginPagePath}.backup`;
  fs.copyFileSync(loginPagePath, backupPath);
  console.log(`Backed up login.html to ${backupPath}`);
  
  // Read the current content
  const currentContent = fs.readFileSync(loginPagePath, 'utf8');
  
  // Check if the file has a Google login button
  if (!currentContent.includes('google-login-btn')) {
    console.error('Cannot fix Google login button: No Google login button found in login.html');
    return false;
  }
  
  // Fix the Google login button href
  let updatedContent = currentContent;
  
  // Replace the href attribute of the Google login button
  const googleLoginBtnRegex = /<a[^>]*id=["']google-login-btn["'][^>]*>/g;
  if (googleLoginBtnRegex.test(currentContent)) {
    updatedContent = currentContent.replace(
      googleLoginBtnRegex,
      '<a id="google-login-btn" href="javascript:void(0);" onclick="handleGoogleLogin()">'
    );
    
    // Add handleGoogleLogin function if it doesn't exist
    if (!currentContent.includes('function handleGoogleLogin')) {
      const scriptTag = '</script>';
      const googleLoginScript = `
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
${scriptTag}`;
      
      updatedContent = updatedContent.replace(scriptTag, googleLoginScript);
    }
    
    // Write the updated content
    fs.writeFileSync(loginPagePath, updatedContent);
    console.log('Updated login.html with fixed Google login button');
    
    return true;
  }
  
  console.error('Cannot fix Google login button: No matching Google login button found in login.html');
  return false;
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

// Main function
const main = async () => {
  console.log('Fixing Google login 404 issue...');
  
  // Fix Google login button
  const buttonFixed = fixGoogleLoginButton();
  
  // Create auth callback page
  const callbackCreated = createAuthCallbackPage();
  
  // Update server
  const serverUpdated = updateServer();
  
  if (buttonFixed && callbackCreated && serverUpdated) {
    console.log('Google login 404 issue fixed successfully');
    
    // Test the fix
    console.log('\nTesting the fix...');
    
    const browser = await chromium.launch({ 
      headless: false,
    });
    
    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 },
    });
    
    const page = await context.newPage();
    page.setDefaultTimeout(config.timeout);
    
    try {
      await page.goto(`${config.localUrl}/login`);
      await page.waitForLoadState('networkidle');
      
      console.log('Checking Google login button...');
      const googleLoginBtn = await page.$('#google-login-btn');
      if (googleLoginBtn) {
        console.log('✅ Google login button found');
        
        console.log('Testing Google login...');
        await googleLoginBtn.click();
        await page.waitForTimeout(2000);
        
        const currentUrl = page.url();
        console.log(`Current URL after clicking Google login: ${currentUrl}`);
        
        if (currentUrl.includes('accounts.google.com')) {
          console.log('✅ Google login redirects to Google OAuth');
        } else {
          console.error('❌ Google login does not redirect to Google OAuth');
        }
      } else {
        console.error('❌ Google login button not found');
      }
    } finally {
      await context.close();
      await browser.close();
    }
    
    return true;
  } else {
    console.error('Failed to fix Google login 404 issue');
    return false;
  }
};

// Run main function
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  main,
  fixGoogleLoginButton,
  createAuthCallbackPage,
  updateServer
};
