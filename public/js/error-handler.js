/**
 * Error Handler
 * Provides robust error handling for the FinDoc Analyzer application
 */

document.addEventListener('DOMContentLoaded', function() {
  console.log('Error handler loaded');
  
  // Create global error handler
  window.errorHandler = {
    // Error types
    ERROR_TYPES: {
      AUTHENTICATION: 'authentication',
      UPLOAD: 'upload',
      PROCESSING: 'processing',
      CHAT: 'chat',
      API: 'api',
      NETWORK: 'network',
      UNKNOWN: 'unknown'
    },
    
    // Error severity levels
    SEVERITY: {
      INFO: 'info',
      WARNING: 'warning',
      ERROR: 'error',
      CRITICAL: 'critical'
    },
    
    // Error history
    errors: [],
    
    // Max errors to keep in history
    maxErrors: 50,
    
    // Handle error
    handleError: function(message, type, severity, details) {
      // Default values
      type = type || this.ERROR_TYPES.UNKNOWN;
      severity = severity || this.SEVERITY.ERROR;
      details = details || {};
      
      // Create error object
      const error = {
        message: message,
        type: type,
        severity: severity,
        details: details,
        timestamp: new Date().toISOString(),
        url: window.location.href
      };
      
      // Log error
      console.error(`[${error.type.toUpperCase()}] ${error.message}`, details);
      
      // Add to history
      this.errors.unshift(error);
      
      // Trim history if needed
      if (this.errors.length > this.maxErrors) {
        this.errors = this.errors.slice(0, this.maxErrors);
      }
      
      // Save to localStorage
      this.saveErrors();
      
      // Show error notification
      this.showErrorNotification(error);
      
      // Handle based on severity
      if (severity === this.SEVERITY.CRITICAL) {
        this.handleCriticalError(error);
      }
      
      return error;
    },
    
    // Show error notification
    showErrorNotification: function(error) {
      // Create notification container if it doesn't exist
      let notificationContainer = document.getElementById('notification-container');
      
      if (!notificationContainer) {
        notificationContainer = document.createElement('div');
        notificationContainer.id = 'notification-container';
        notificationContainer.style.position = 'fixed';
        notificationContainer.style.top = '20px';
        notificationContainer.style.right = '20px';
        notificationContainer.style.zIndex = '9999';
        document.body.appendChild(notificationContainer);
      }
      
      // Create notification
      const notification = document.createElement('div');
      notification.className = `notification ${error.severity}`;
      notification.style.backgroundColor = this.getSeverityColor(error.severity);
      notification.style.color = 'white';
      notification.style.padding = '15px';
      notification.style.marginBottom = '10px';
      notification.style.borderRadius = '5px';
      notification.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
      notification.style.position = 'relative';
      notification.style.minWidth = '300px';
      notification.style.maxWidth = '400px';
      
      // Add close button
      const closeBtn = document.createElement('span');
      closeBtn.innerHTML = '&times;';
      closeBtn.style.position = 'absolute';
      closeBtn.style.top = '5px';
      closeBtn.style.right = '10px';
      closeBtn.style.cursor = 'pointer';
      closeBtn.style.fontSize = '20px';
      closeBtn.onclick = function() {
        notification.remove();
      };
      
      // Add content
      const title = document.createElement('h4');
      title.textContent = this.getErrorTypeTitle(error.type);
      title.style.margin = '0 0 5px 0';
      
      const message = document.createElement('p');
      message.textContent = error.message;
      message.style.margin = '0';
      
      // Assemble notification
      notification.appendChild(closeBtn);
      notification.appendChild(title);
      notification.appendChild(message);
      
      // Add to container
      notificationContainer.appendChild(notification);
      
      // Auto-remove after timeout
      setTimeout(() => {
        if (notification.parentNode) {
          notification.remove();
        }
      }, 5000);
    },
    
    // Handle critical error
    handleCriticalError: function(error) {
      // Show modal with error details
      this.showErrorModal(error);
    },
    
    // Show error modal
    showErrorModal: function(error) {
      // Create modal backdrop
      const backdrop = document.createElement('div');
      backdrop.className = 'error-modal-backdrop';
      backdrop.style.position = 'fixed';
      backdrop.style.top = '0';
      backdrop.style.left = '0';
      backdrop.style.width = '100%';
      backdrop.style.height = '100%';
      backdrop.style.backgroundColor = 'rgba(0,0,0,0.5)';
      backdrop.style.zIndex = '9999';
      
      // Create modal
      const modal = document.createElement('div');
      modal.className = 'error-modal';
      modal.style.position = 'fixed';
      modal.style.top = '50%';
      modal.style.left = '50%';
      modal.style.transform = 'translate(-50%, -50%)';
      modal.style.backgroundColor = 'white';
      modal.style.padding = '20px';
      modal.style.borderRadius = '5px';
      modal.style.boxShadow = '0 2px 10px rgba(0,0,0,0.3)';
      modal.style.zIndex = '10000';
      modal.style.maxWidth = '500px';
      modal.style.width = '90%';
      
      // Create modal content
      const title = document.createElement('h3');
      title.textContent = 'Critical Error';
      title.style.color = this.getSeverityColor(this.SEVERITY.CRITICAL);
      title.style.marginTop = '0';
      
      const message = document.createElement('p');
      message.textContent = error.message;
      
      const details = document.createElement('pre');
      details.textContent = JSON.stringify(error.details, null, 2);
      details.style.backgroundColor = '#f5f5f5';
      details.style.padding = '10px';
      details.style.borderRadius = '3px';
      details.style.maxHeight = '200px';
      details.style.overflow = 'auto';
      
      const closeBtn = document.createElement('button');
      closeBtn.textContent = 'Close';
      closeBtn.className = 'btn btn-primary';
      closeBtn.style.marginTop = '15px';
      closeBtn.onclick = function() {
        backdrop.remove();
      };
      
      // Assemble modal
      modal.appendChild(title);
      modal.appendChild(message);
      modal.appendChild(details);
      modal.appendChild(closeBtn);
      
      // Add to backdrop
      backdrop.appendChild(modal);
      
      // Add to body
      document.body.appendChild(backdrop);
    },
    
    // Get severity color
    getSeverityColor: function(severity) {
      switch (severity) {
        case this.SEVERITY.INFO:
          return '#2196F3'; // Blue
        case this.SEVERITY.WARNING:
          return '#FF9800'; // Orange
        case this.SEVERITY.ERROR:
          return '#F44336'; // Red
        case this.SEVERITY.CRITICAL:
          return '#B71C1C'; // Dark Red
        default:
          return '#757575'; // Grey
      }
    },
    
    // Get error type title
    getErrorTypeTitle: function(type) {
      switch (type) {
        case this.ERROR_TYPES.AUTHENTICATION:
          return 'Authentication Error';
        case this.ERROR_TYPES.UPLOAD:
          return 'Upload Error';
        case this.ERROR_TYPES.PROCESSING:
          return 'Processing Error';
        case this.ERROR_TYPES.CHAT:
          return 'Chat Error';
        case this.ERROR_TYPES.API:
          return 'API Error';
        case this.ERROR_TYPES.NETWORK:
          return 'Network Error';
        default:
          return 'Error';
      }
    },
    
    // Save errors to localStorage
    saveErrors: function() {
      try {
        localStorage.setItem('errorHistory', JSON.stringify(this.errors));
      } catch (e) {
        console.error('Failed to save errors to localStorage:', e);
      }
    },
    
    // Load errors from localStorage
    loadErrors: function() {
      try {
        const savedErrors = localStorage.getItem('errorHistory');
        if (savedErrors) {
          this.errors = JSON.parse(savedErrors);
        }
      } catch (e) {
        console.error('Failed to load errors from localStorage:', e);
      }
    },
    
    // Clear error history
    clearErrors: function() {
      this.errors = [];
      this.saveErrors();
    }
  };
  
  // Load saved errors
  window.errorHandler.loadErrors();
  
  // Override global error handling
  window.onerror = function(message, source, lineno, colno, error) {
    window.errorHandler.handleError(
      message,
      window.errorHandler.ERROR_TYPES.UNKNOWN,
      window.errorHandler.SEVERITY.ERROR,
      {
        source: source,
        lineno: lineno,
        colno: colno,
        stack: error ? error.stack : null
      }
    );
    return true; // Prevent default error handling
  };
  
  // Override fetch to catch API errors
  const originalFetch = window.fetch;
  window.fetch = async function(...args) {
    try {
      const response = await originalFetch.apply(this, args);
      
      // Check if response is ok
      if (!response.ok) {
        window.errorHandler.handleError(
          `API request failed with status ${response.status}`,
          window.errorHandler.ERROR_TYPES.API,
          response.status >= 500 ? window.errorHandler.SEVERITY.ERROR : window.errorHandler.SEVERITY.WARNING,
          {
            url: args[0],
            status: response.status,
            statusText: response.statusText
          }
        );
      }
      
      return response;
    } catch (error) {
      window.errorHandler.handleError(
        'Network request failed',
        window.errorHandler.ERROR_TYPES.NETWORK,
        window.errorHandler.SEVERITY.ERROR,
        {
          url: args[0],
          error: error.message
        }
      );
      throw error;
    }
  };
});
