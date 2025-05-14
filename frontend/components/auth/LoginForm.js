import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import authService from '../../../services/auth-service';

/**
 * Login Form Component
 */
const LoginForm = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const router = useRouter();

  // Check for expired session message in URL
  useEffect(() => {
    if (router.query.expired === 'true') {
      setError('Your session has expired. Please log in again.');
    }
  }, [router.query]);

  // Initialize Google Auth on component mount
  useEffect(() => {
    authService.initGoogleAuth().catch(error => {
      console.error('Error initializing Google Auth:', error);
    });
  }, []);

  /**
   * Handle input change
   * @param {Event} e - Input change event
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
    
    // Clear error when user types
    if (error) {
      setError('');
    }
  };

  /**
   * Handle form submission
   * @param {Event} e - Form submit event
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.email || !formData.password) {
      setError('Please provide both email and password.');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      // Login with email and password
      await authService.login(formData.email, formData.password);
      
      // Redirect to dashboard on success
      router.push('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle Google sign-in
   */
  const handleGoogleSignIn = async () => {
    try {
      setGoogleLoading(true);
      setError('');
      
      // Sign in with Google
      await authService.signInWithGoogle();
      
      // Redirect to dashboard on success
      router.push('/dashboard');
    } catch (error) {
      console.error('Google sign-in error:', error);
      setError(error.message || 'Google sign-in failed. Please try again.');
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="login-form-container">
      <div className="login-form-card">
        <h2 className="login-form-title">Login to FinDoc Analyzer</h2>
        
        {error && (
          <div className="alert alert-danger" role="alert" data-testid="login-error">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} data-testid="login-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              className="form-control"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email address"
              data-testid="email-input"
              required
              disabled={loading || googleLoading}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              className="form-control"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              data-testid="password-input"
              required
              disabled={loading || googleLoading}
            />
          </div>
          
          <div className="form-group form-check">
            <input
              type="checkbox"
              className="form-check-input"
              id="rememberMe"
              name="rememberMe"
            />
            <label className="form-check-label" htmlFor="rememberMe">
              Remember me
            </label>
          </div>
          
          <div className="form-group">
            <button
              type="submit"
              className="btn btn-primary btn-block"
              disabled={loading || googleLoading}
              data-testid="login-button"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </div>
          
          <div className="form-group">
            <button
              type="button"
              className="btn btn-outline-secondary btn-block google-signin-btn"
              onClick={handleGoogleSignIn}
              disabled={loading || googleLoading}
              data-testid="google-login-button"
            >
              <img
                src="/images/google-icon.svg"
                alt="Google"
                className="google-icon"
              />
              {googleLoading ? 'Signing in...' : 'Sign in with Google'}
            </button>
          </div>
          
          <div className="login-links">
            <Link href="/forgot-password">
              <a className="login-link">Forgot Password?</a>
            </Link>
            <span className="login-divider">|</span>
            <Link href="/register">
              <a className="login-link">Sign up</a>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;
