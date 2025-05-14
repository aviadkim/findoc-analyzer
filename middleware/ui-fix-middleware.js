/**
 * UI Fix Middleware
 * Injects the UI fix script into all HTML responses
 */

/**
 * UI Fix Middleware
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
function uiFixMiddleware(req, res, next) {
  // Store original send function
  const originalSend = res.send;
  
  // Override send function
  res.send = function(body) {
    try {
      // Only modify HTML responses
      if (typeof body === 'string' && body.includes('<!DOCTYPE html>')) {
        console.log(`Injecting UI fix script into response for ${req.path}`);
        
        // Inject UI fix script before </head>
        const headEndPos = body.indexOf('</head>');
        if (headEndPos > 0) {
          const uiFixScript = `
<script src="/js/permanent-ui-fix.js"></script>
`;
          body = body.substring(0, headEndPos) + uiFixScript + body.substring(headEndPos);
          console.log(`Successfully injected UI fix script into response for ${req.path}`);
        } else {
          console.warn(`Could not find </head> tag in response for ${req.path}`);
        }
      }
    } catch (error) {
      console.error(`Error injecting UI fix script: ${error.message}`);
    }
    
    // Call original send function
    return originalSend.call(this, body);
  };
  
  // Continue to next middleware
  next();
}

module.exports = uiFixMiddleware;
