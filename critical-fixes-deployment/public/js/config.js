/**
 * FinDoc Analyzer Client Configuration
 *
 * This file provides configuration for the client-side application.
 * It adapts to the current environment (development or production).
 */

(function() {
  // Determine the base URL based on the current environment
  const baseUrl = window.location.origin;

  // Create a global configuration object
  window.appConfig = {
    // API URL - use the current origin
    apiUrl: baseUrl,

    // Feature flags
    features: {
      uploadForm: true,
      chatInterface: true,
      analytics: true,
      export: true
    },

    // Mock API configuration
    mockApi: {
      enabled: true,  // Enable mock API in all environments for now
      delay: 500      // Simulate network delay (ms)
    },

    // Debug mode
    debug: baseUrl.includes('localhost') || baseUrl.includes('127.0.0.1')
  };

  // Log configuration in debug mode
  if (window.appConfig.debug) {
    console.log('App config initialized:', window.appConfig);
  }
})();
