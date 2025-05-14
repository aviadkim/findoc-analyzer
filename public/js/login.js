/**
 * Login Fix
 * This script fixes the login functionality
 */

(function() {
  console.log('Login Fix loaded');

  // Wait for DOM to be ready
  document.addEventListener('DOMContentLoaded', function() {
    initLogin();
  });

  // Initialize login
  function initLogin() {
    console.log('Initializing login');

    // Get elements
    const loginForm = document.getElementById('login-form');
    const googleLoginBtn = document.getElementById('google-login-btn');

    // If we're on the login page, show the login form and Google login button
    if (document.body.classList.contains('login-page') || window.location.pathname.includes('/login')) {
      if (loginForm) {
        loginForm.style.display = 'block';
      }
      if (googleLoginBtn) {
        googleLoginBtn.style.display = 'block';
      }
    }

    // Handle login form submission
    if (loginForm) {
      loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form data
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        // Validate form data
        if (!email || !password) {
          showError('Please enter both email and password');
          return;
        }
        
        // Simulate login
        simulateLogin(email, password);
      });
    }

    // Handle Google login button click
    if (googleLoginBtn) {
      googleLoginBtn.addEventListener('click', function() {
        // Simulate Google login
        simulateGoogleLogin();
      });
    }

    // Function to simulate login
    function simulateLogin(email, password) {
      console.log('Simulating login with email:', email);
      
      // Show loading state
      showLoading();
      
      // Simulate API call
      setTimeout(function() {
        // Simulate successful login
        if (email.includes('@') && password.length >= 6) {
          // Save user info to localStorage
          const user = {
            email: email,
            name: email.split('@')[0],
            isLoggedIn: true
          };
          localStorage.setItem('user', JSON.stringify(user));
          
          // Redirect to home page
          window.location.href = '/';
        } else {
          // Show error
          showError('Invalid email or password');
          hideLoading();
        }
      }, 1000);
    }

    // Function to simulate Google login
    function simulateGoogleLogin() {
      console.log('Simulating Google login');
      
      // Show loading state
      showLoading();
      
      // Simulate API call
      setTimeout(function() {
        // Simulate successful login
        const user = {
          email: 'user@gmail.com',
          name: 'Google User',
          isLoggedIn: true,
          provider: 'google'
        };
        localStorage.setItem('user', JSON.stringify(user));
        
        // Redirect to home page
        window.location.href = '/';
      }, 1000);
    }

    // Function to show loading state
    function showLoading() {
      // Disable form elements
      if (loginForm) {
        const inputs = loginForm.querySelectorAll('input, button');
        inputs.forEach(function(input) {
          input.disabled = true;
        });
      }
      
      // Disable Google login button
      if (googleLoginBtn) {
        googleLoginBtn.disabled = true;
      }
      
      // Show loading message
      const loadingElement = document.createElement('div');
      loadingElement.id = 'login-loading';
      loadingElement.style.textAlign = 'center';
      loadingElement.style.marginTop = '10px';
      loadingElement.textContent = 'Logging in...';
      
      if (loginForm) {
        loginForm.appendChild(loadingElement);
      }
    }

    // Function to hide loading state
    function hideLoading() {
      // Enable form elements
      if (loginForm) {
        const inputs = loginForm.querySelectorAll('input, button');
        inputs.forEach(function(input) {
          input.disabled = false;
        });
      }
      
      // Enable Google login button
      if (googleLoginBtn) {
        googleLoginBtn.disabled = false;
      }
      
      // Remove loading message
      const loadingElement = document.getElementById('login-loading');
      if (loadingElement) {
        loadingElement.remove();
      }
    }

    // Function to show error message
    function showError(message) {
      // Remove existing error message
      const existingError = document.getElementById('login-error');
      if (existingError) {
        existingError.remove();
      }
      
      // Create error message
      const errorElement = document.createElement('div');
      errorElement.id = 'login-error';
      errorElement.style.color = 'red';
      errorElement.style.marginTop = '10px';
      errorElement.textContent = message;
      
      if (loginForm) {
        loginForm.appendChild(errorElement);
      }
    }

    // Check if user is already logged in
    function checkLoggedInStatus() {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (user.isLoggedIn) {
        // If on login page, redirect to home page
        if (document.body.classList.contains('login-page') || window.location.pathname.includes('/login')) {
          window.location.href = '/';
        }
        
        // Update UI to show logged in state
        updateUIForLoggedInUser(user);
      }
    }

    // Update UI for logged in user
    function updateUIForLoggedInUser(user) {
      // Create user info element if it doesn't exist
      let userInfoElement = document.getElementById('user-info');
      if (!userInfoElement) {
        userInfoElement = document.createElement('div');
        userInfoElement.id = 'user-info';
        userInfoElement.style.position = 'absolute';
        userInfoElement.style.top = '10px';
        userInfoElement.style.right = '10px';
        userInfoElement.style.padding = '5px 10px';
        userInfoElement.style.backgroundColor = '#f8f9fa';
        userInfoElement.style.border = '1px solid #ddd';
        userInfoElement.style.borderRadius = '4px';
        userInfoElement.style.fontSize = '14px';
        document.body.appendChild(userInfoElement);
      }
      
      // Update user info element
      userInfoElement.innerHTML = `
        <span>Welcome, ${user.name}</span>
        <button id="logout-btn" style="margin-left: 10px; padding: 2px 5px; font-size: 12px;">Logout</button>
      `;
      
      // Add logout button event listener
      const logoutBtn = document.getElementById('logout-btn');
      if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
          // Clear user info from localStorage
          localStorage.removeItem('user');
          
          // Redirect to login page
          window.location.href = '/login.html';
        });
      }
    }

    // Check if user is already logged in
    checkLoggedInStatus();
  }
})();
