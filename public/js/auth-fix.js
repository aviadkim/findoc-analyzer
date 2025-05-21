/**
 * Authentication Fix
 * 
 * This script fixes authentication issues in the FinDoc Analyzer application,
 * particularly focusing on Google login functionality.
 */

(function() {
  console.log('Auth Fix loaded');

  // Initialize when DOM is loaded
  document.addEventListener('DOMContentLoaded', function() {
    initAuth();
  });

  /**
   * Initialize authentication
   */
  function initAuth() {
    console.log('Initializing authentication fixes');

    // Create auth object if it doesn't exist
    if (!window.auth) {
      window.auth = {
        isAuthenticated: false,
        currentUser: null,
        
        /**
         * Initialize authentication
         */
        init: function() {
          console.log('Initializing authentication');
          
          // Check if user is already logged in (from localStorage)
          const token = localStorage.getItem('auth_token');
          const userStr = localStorage.getItem('auth_user');
          
          if (token && userStr) {
            try {
              this.currentUser = JSON.parse(userStr);
              this.isAuthenticated = true;
              this.updateUI();
              console.log('User authenticated from localStorage:', this.currentUser.email);
            } catch (error) {
              console.error('Error parsing saved user:', error);
              localStorage.removeItem('auth_token');
              localStorage.removeItem('auth_user');
            }
          }
          
          return Promise.resolve();
        },
        
        /**
         * Login with email and password
         * @param {string} email - User email
         * @param {string} password - User password
         */
        login: function(email, password) {
          console.log('Login attempt:', email);
          
          return new Promise((resolve, reject) => {
            // For demo purposes, accept any credentials
            setTimeout(() => {
              // Create user object
              const user = {
                id: 'user-' + Date.now(),
                email: email,
                name: email.split('@')[0]
              };
              
              // Store user and token
              localStorage.setItem('auth_token', 'demo_token');
              localStorage.setItem('auth_user', JSON.stringify(user));
              
              // Update auth state
              this.currentUser = user;
              this.isAuthenticated = true;
              
              // Update UI
              this.updateUI();
              
              resolve(user);
            }, 1000);
          });
        },
        
        /**
         * Google login
         */
        googleLogin: function() {
          console.log('Google login clicked');
          
          // Create OAuth URL
          const clientId = '1234567890-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com';
          const redirectUri = window.location.origin + '/auth/google/callback';
          const scope = 'email profile';
          const responseType = 'token';
          const state = this.generateRandomString(16);
          
          // Store state in localStorage for verification
          localStorage.setItem('auth_state', state);
          
          // Create OAuth URL
          const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=${responseType}&scope=${encodeURIComponent(scope)}&state=${state}`;
          
          // For demo purposes, simulate Google login
          if (confirm('This is a demo. Would you like to simulate Google login?')) {
            // Simulate Google login
            const email = prompt('Enter your Gmail address for mock login:') || 'user@gmail.com';
            
            // Create user object
            const user = {
              id: 'google-user-' + Date.now(),
              email: email,
              name: email.split('@')[0],
              picture: 'https://ui-avatars.com/api/?name=' + encodeURIComponent(email.split('@')[0])
            };
            
            // Store user and token
            localStorage.setItem('auth_token', 'google_token');
            localStorage.setItem('auth_user', JSON.stringify(user));
            
            // Update auth state
            this.currentUser = user;
            this.isAuthenticated = true;
            
            // Update UI
            this.updateUI();
            
            // Redirect to dashboard
            window.location.href = '/';
          } else {
            // Redirect to Google OAuth URL
            window.location.href = authUrl;
          }
        },
        
        /**
         * Logout
         */
        logout: function() {
          console.log('Logout');
          
          // Clear localStorage
          localStorage.removeItem('auth_token');
          localStorage.removeItem('auth_user');
          
          // Update auth state
          this.currentUser = null;
          this.isAuthenticated = false;
          
          // Update UI
          this.updateUI();
          
          // Redirect to login page
          window.location.href = '/login';
        },
        
        /**
         * Update UI based on authentication state
         */
        updateUI: function() {
          console.log('Updating UI for auth state:', this.isAuthenticated);
          
          // Get elements
          const loginBtn = document.querySelector('.login-btn');
          const logoutBtn = document.querySelector('.logout-btn');
          const userInfo = document.querySelector('.user-info');
          const userName = document.querySelector('.user-name');
          const userAvatar = document.querySelector('.user-avatar');
          
          // Update elements if they exist
          if (this.isAuthenticated && this.currentUser) {
            // User is authenticated
            if (loginBtn) loginBtn.style.display = 'none';
            if (logoutBtn) logoutBtn.style.display = 'block';
            if (userInfo) userInfo.style.display = 'flex';
            if (userName) userName.textContent = this.currentUser.name;
            if (userAvatar && this.currentUser.picture) {
              userAvatar.src = this.currentUser.picture;
            }
            
            // Add logout event listener
            if (logoutBtn) {
              logoutBtn.addEventListener('click', () => this.logout());
            }
            
            // Hide login form if on login page
            const loginForm = document.getElementById('login-form');
            if (loginForm && window.location.pathname.includes('/login')) {
              loginForm.style.display = 'none';
              
              // Show welcome message
              const welcomeMessage = document.createElement('div');
              welcomeMessage.className = 'welcome-message';
              welcomeMessage.innerHTML = `
                <h2>Welcome back, ${this.currentUser.name}!</h2>
                <p>You are already logged in.</p>
                <button class="btn btn-primary" onclick="window.location.href='/'">Go to Dashboard</button>
              `;
              
              // Add welcome message after login form
              loginForm.parentNode.insertBefore(welcomeMessage, loginForm.nextSibling);
            }
          } else {
            // User is not authenticated
            if (loginBtn) loginBtn.style.display = 'block';
            if (logoutBtn) logoutBtn.style.display = 'none';
            if (userInfo) userInfo.style.display = 'none';
          }
        },
        
        /**
         * Generate random string for state parameter
         * @param {number} length - Length of string
         * @returns {string} Random string
         */
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
    }
    
    // Initialize auth
    window.auth.init();
    
    // Fix Google login button
    fixGoogleLoginButton();
    
    // Fix login form
    fixLoginForm();
  }
  
  /**
   * Fix Google login button
   */
  function fixGoogleLoginButton() {
    // Find Google login button
    let googleLoginBtn = document.getElementById('google-login-btn');
    
    // If button doesn't exist, create it
    if (!googleLoginBtn) {
      console.log('Creating Google login button');
      
      // Create button
      googleLoginBtn = document.createElement('button');
      googleLoginBtn.id = 'google-login-btn';
      googleLoginBtn.type = 'button';
      googleLoginBtn.className = 'btn btn-outline-secondary btn-block google-login-btn';
      
      // Add button content
      googleLoginBtn.innerHTML = `
        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" class="google-icon" style="margin-right: 10px; width: 18px; height: 18px;">
        <span>Login with Google</span>
      `;
      
      // Find login form
      const loginForm = document.getElementById('login-form');
      
      if (loginForm) {
        // Find auth divider
        const authDivider = loginForm.querySelector('.auth-divider');
        
        if (authDivider) {
          // Add button after auth divider
          authDivider.parentNode.insertBefore(googleLoginBtn, authDivider.nextSibling);
        } else {
          // Add button to end of form
          loginForm.appendChild(googleLoginBtn);
        }
      } else {
        // Add button to body (hidden)
        googleLoginBtn.style.display = 'none';
        document.body.appendChild(googleLoginBtn);
      }
    }
    
    // Add event listener
    googleLoginBtn.addEventListener('click', function() {
      if (window.auth && typeof window.auth.googleLogin === 'function') {
        window.auth.googleLogin();
      } else {
        console.error('Google login function not found');
      }
    });
  }
  
  /**
   * Fix login form
   */
  function fixLoginForm() {
    // Find login form
    const loginForm = document.getElementById('login-form');
    
    if (loginForm) {
      // Add submit event listener
      loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form data
        const email = loginForm.querySelector('input[name="email"]').value;
        const password = loginForm.querySelector('input[name="password"]').value;
        
        // Login
        if (window.auth && typeof window.auth.login === 'function') {
          window.auth.login(email, password)
            .then(() => {
              // Redirect to dashboard
              window.location.href = '/';
            })
            .catch(error => {
              console.error('Login error:', error);
              alert('Login failed: ' + error.message);
            });
        } else {
          console.error('Login function not found');
        }
      });
    }
  }
})();
