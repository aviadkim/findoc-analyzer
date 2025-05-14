/**
 * Google Authentication Fix Script
 * This script adds Google authentication functionality
 */

document.addEventListener('DOMContentLoaded', function() {
  console.log('Google authentication fix script loaded');

  // Create mock Google auth functionality
  const setupGoogleAuth = function() {
    // Check if auth object exists
    if (!window.auth) {
      console.log('Auth object not found, creating mock implementation');

      // Create mock auth object
      window.auth = {
        isAuthenticated: false,
        currentUser: null,

        // Initialize authentication
        init: function() {
          console.log('Initializing mock authentication');

          // Check if user is already logged in (from localStorage)
          const savedUser = localStorage.getItem('mockUser');
          if (savedUser) {
            try {
              this.currentUser = JSON.parse(savedUser);
              this.isAuthenticated = true;
              this.updateUI();
            } catch (error) {
              console.error('Error parsing saved user:', error);
              localStorage.removeItem('mockUser');
            }
          }

          return Promise.resolve();
        },

        // Google login
        googleLogin: function() {
          console.log('Mock Google login');

          // Simulate Google login popup
          const email = prompt('Enter your Gmail address for mock login:');

          if (email && email.includes('@')) {
            // Create mock user
            this.currentUser = {
              id: 'google-' + Date.now(),
              name: email.split('@')[0],
              email: email,
              provider: 'google'
            };

            this.isAuthenticated = true;

            // Save to localStorage
            localStorage.setItem('mockUser', JSON.stringify(this.currentUser));

            // Update UI
            this.updateUI();

            // Dispatch user login event for tenant manager
            document.dispatchEvent(new CustomEvent('userLogin', {
              detail: {
                id: this.currentUser.id,
                name: this.currentUser.name,
                email: this.currentUser.email,
                provider: this.currentUser.provider
              }
            }));

            // Show success notification
            if (window.notification) {
              window.notification.showSuccess('Logged in successfully as ' + email);
            } else {
              alert('Logged in successfully as ' + email);
            }

            // Redirect to dashboard
            if (typeof navigateTo === 'function') {
              navigateTo('/');
            } else {
              window.location.href = '/';
            }
          } else {
            // Show error
            if (window.notification) {
              window.notification.showError('Invalid email address');
            } else {
              alert('Invalid email address');
            }
          }
        },

        // Logout
        logout: function() {
          console.log('Mock logout');

          const previousUser = this.currentUser;

          this.currentUser = null;
          this.isAuthenticated = false;

          // Remove from localStorage
          localStorage.removeItem('mockUser');

          // Update UI
          this.updateUI();

          // Dispatch user logout event for tenant manager
          document.dispatchEvent(new CustomEvent('userLogout', {
            detail: previousUser ? {
              id: previousUser.id,
              name: previousUser.name,
              email: previousUser.email,
              provider: previousUser.provider
            } : null
          }));

          // Show notification
          if (window.notification) {
            window.notification.showInfo('Logged out successfully');
          }

          // Redirect to home
          if (typeof navigateTo === 'function') {
            navigateTo('/');
          } else {
            window.location.href = '/';
          }
        },

        // Update UI based on authentication state
        updateUI: function() {
          const authNav = document.getElementById('auth-nav');
          const userNav = document.getElementById('user-nav');
          const userName = document.getElementById('user-name');
          const logoutBtn = document.getElementById('logout-btn');

          if (this.isAuthenticated && this.currentUser) {
            // User is logged in
            if (authNav) authNav.style.display = 'none';
            if (userNav) userNav.style.display = 'flex';
            if (userName) userName.textContent = this.currentUser.name;

            // Add logout event listener
            if (logoutBtn) {
              // Remove existing listeners
              const newLogoutBtn = logoutBtn.cloneNode(true);
              if (logoutBtn.parentNode) {
                logoutBtn.parentNode.replaceChild(newLogoutBtn, logoutBtn);
              }

              // Add new listener
              newLogoutBtn.addEventListener('click', () => this.logout());
            }
          } else {
            // User is not logged in
            if (authNav) authNav.style.display = 'flex';
            if (userNav) userNav.style.display = 'none';
          }
        },

        // Get auth headers for API requests
        getAuthHeaders: function() {
          if (this.isAuthenticated && this.currentUser) {
            return {
              'Authorization': 'Bearer mock-token-' + this.currentUser.id
            };
          }
          return {};
        }
      };

      // Initialize auth
      window.auth.init();
    }

    // Make sure Google login button is visible and working
    const googleLoginBtn = document.getElementById('google-login-btn');
    if (googleLoginBtn) {
      googleLoginBtn.style.display = 'block';

      // Remove existing listeners
      const newGoogleLoginBtn = googleLoginBtn.cloneNode(true);
      if (googleLoginBtn.parentNode) {
        googleLoginBtn.parentNode.replaceChild(newGoogleLoginBtn, googleLoginBtn);
      }

      // Add new listener
      newGoogleLoginBtn.addEventListener('click', () => {
        if (window.auth && typeof window.auth.googleLogin === 'function') {
          window.auth.googleLogin();
        } else {
          console.error('Google login function not found');
          alert('Google login functionality not implemented yet');
        }
      });
    }

    // Add login form if not present
    const loginForm = document.getElementById('login-form');
    if (!loginForm) {
      const newLoginForm = document.createElement('form');
      newLoginForm.id = 'login-form';
      newLoginForm.className = 'auth-form';
      newLoginForm.style.display = 'none';
      document.body.appendChild(newLoginForm);
    }

    // Check if we're on the login or signup page
    const isLoginPage = window.location.pathname === '/login';
    const isSignupPage = window.location.pathname === '/signup';

    if (isLoginPage || isSignupPage) {
      // Create auth form container
      const authFormContainer = document.createElement('div');
      authFormContainer.className = 'auth-form-container';

      // Set form title
      const formTitle = document.createElement('h2');
      formTitle.className = 'auth-form-title';
      formTitle.textContent = isLoginPage ? 'Login to Your Account' : 'Create an Account';

      // Create form
      const form = document.createElement('form');
      form.className = 'auth-form';
      form.id = isLoginPage ? 'login-form' : 'signup-form';

      // Add Google login button
      const googleBtn = document.createElement('button');
      googleBtn.type = 'button';
      googleBtn.className = 'btn btn-outline-secondary btn-block google-login-btn';
      googleBtn.id = 'google-login-btn';

      googleBtn.innerHTML = `
        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" class="google-icon">
        <span>${isLoginPage ? 'Login with Google' : 'Sign up with Google'}</span>
      `;

      googleBtn.addEventListener('click', () => {
        if (window.auth && typeof window.auth.googleLogin === 'function') {
          window.auth.googleLogin();
        } else {
          console.error('Google login function not found');
          alert('Google login functionality not implemented yet');
        }
      });

      // Add form footer
      const formFooter = document.createElement('div');
      formFooter.className = 'auth-form-footer';

      if (isLoginPage) {
        formFooter.innerHTML = `
          <p>Don't have an account? <a href="/signup">Sign up</a></p>
        `;
      } else {
        formFooter.innerHTML = `
          <p>Already have an account? <a href="/login">Login</a></p>
        `;
      }

      // Assemble form
      form.appendChild(googleBtn);

      // Assemble container
      authFormContainer.appendChild(formTitle);
      authFormContainer.appendChild(form);
      authFormContainer.appendChild(formFooter);

      // Add to page content
      const pageContent = document.getElementById('page-content');
      if (pageContent) {
        pageContent.innerHTML = '';
        pageContent.appendChild(authFormContainer);
      }
    }
  };

  // Apply fixes
  setupGoogleAuth();
});
