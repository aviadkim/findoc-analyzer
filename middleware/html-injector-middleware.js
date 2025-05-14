/**
 * HTML Injector Middleware
 * Injects the HTML injector script into all HTML responses
 */

/**
 * HTML Injector Middleware
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
function htmlInjectorMiddleware(req, res, next) {
  // Store original send function
  const originalSend = res.send;
  
  // Override send function
  res.send = function(body) {
    try {
      // Only modify HTML responses
      if (typeof body === 'string' && body.includes('<!DOCTYPE html>')) {
        console.log(`Injecting HTML injector script into response for ${req.path}`);
        
        // Inject HTML injector script before </head>
        const headEndPos = body.indexOf('</head>');
        if (headEndPos > 0) {
          const injectorScript = `
<script src="/js/html-injector-simple.js"></script>
`;
          body = body.substring(0, headEndPos) + injectorScript + body.substring(headEndPos);
          console.log(`Successfully injected HTML injector script into response for ${req.path}`);
        } else {
          console.warn(`Could not find </head> tag in response for ${req.path}`);
        }
      }
    } catch (error) {
      console.error(`Error injecting HTML injector script: ${error.message}`);
    }
    
    // Call original send function
    return originalSend.call(this, body);
  };
  
  // Continue to next middleware
  next();
}

module.exports = htmlInjectorMiddleware;
