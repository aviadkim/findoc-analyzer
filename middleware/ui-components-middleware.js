/**
 * UI Components Middleware
 * Injects UI components into HTML responses
 */

const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

/**
 * Get UI components script
 * @returns {string} UI components script
 */
function getUIComponentsScript() {
  try {
    // Check if browserified version exists
    const browserifiedPath = path.join(__dirname, '..', 'public', 'js', 'ui-components-bundle.js');
    if (fs.existsSync(browserifiedPath)) {
      return `<script src="/js/ui-components-bundle.js"></script>`;
    }
    
    // Otherwise, use individual component files
    return `
      <script src="/js/ui-components/process-button.js"></script>
      <script src="/js/ui-components/chat-interface.js"></script>
      <script src="/js/ui-components/login-components.js"></script>
      <script src="/js/ui-components/agent-cards.js"></script>
      <script src="/js/ui-components/validation-system.js"></script>
      <script src="/js/ui-components/index.js"></script>
      <script>
        document.addEventListener('DOMContentLoaded', function() {
          if (window.UIComponents && typeof window.UIComponents.initializeAll === 'function') {
            window.UIComponents.initializeAll();
          } else {
            console.error('UI Components not loaded properly');
          }
        });
      </script>
    `;
  } catch (error) {
    console.error('Error getting UI components script:', error);
    return '';
  }
}

/**
 * UI Components Middleware
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
function uiComponentsMiddleware(req, res, next) {
  // Store original send function
  const originalSend = res.send;
  
  // Override send function
  res.send = function(body) {
    try {
      // Only modify HTML responses
      if (typeof body === 'string' && body.includes('<!DOCTYPE html>')) {
        console.log(`Injecting UI components into response for ${req.path}`);
        
        // Use cheerio for more robust HTML parsing
        const $ = cheerio.load(body);
        
        // Add UI components script to head
        const uiComponentsScript = getUIComponentsScript();
        $('head').append(uiComponentsScript);
        
        // Add UI components initialization script
        $('body').append(`
          <script>
            console.log('UI Components initialization script loaded for ${req.path}');
            document.addEventListener('DOMContentLoaded', function() {
              if (window.UIComponents && typeof window.UIComponents.initializeAll === 'function') {
                window.UIComponents.initializeAll();
              } else {
                console.error('UI Components not loaded properly');
              }
            });
          </script>
        `);
        
        // Get the modified HTML
        body = $.html();
        
        console.log(`Successfully injected UI components into response for ${req.path}`);
      }
    } catch (error) {
      console.error(`Error injecting UI components: ${error.message}`);
    }
    
    // Call original send function
    return originalSend.call(this, body);
  };
  
  // Continue to next middleware
  next();
}

module.exports = uiComponentsMiddleware;
