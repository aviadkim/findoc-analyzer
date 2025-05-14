/**
 * UI Components Server-Side Validator Middleware
 * This middleware validates that all required UI components are present in the HTML response
 * and logs warnings for missing components
 */

function uiComponentsValidatorMiddleware(req, res, next) {
  console.log(`UI Components Validator middleware called for ${req.path}`);

  // Store original send function
  const originalSend = res.send;

  // Override send function
  res.send = function(body) {
    try {
      // Only validate HTML responses
      if (typeof body === 'string' && body.includes('<!DOCTYPE html>')) {
        console.log(`Validating UI components in HTML for ${req.path}`);

        // Define required components for different page types
        const requiredComponents = {
          'all': [
            { id: 'process-document-btn', name: 'Process Button' },
            { id: 'document-chat-container', name: 'Chat Container' },
            { id: 'show-chat-btn', name: 'Show Chat Button' },
            { id: 'send-btn', name: 'Chat Send Button' },
            { id: 'login-form', name: 'Login Form' },
            { id: 'google-login-btn', name: 'Google Login Button' }
          ],
          'test': [
            { selector: '.agent-card', name: 'Agent Cards' },
            { selector: '.status-indicator', name: 'Agent Status Indicators' },
            { selector: '.agent-action', name: 'Agent Action Buttons' }
          ],
          'document-chat': [
            { id: 'document-select', name: 'Document Selector' },
            { id: 'document-send-btn', name: 'Document Chat Send Button' }
          ],
          'upload': [
            { id: 'progress-bar-fill', name: 'Progress Bar' }
          ]
        };

        // Determine the page type based on the path
        let pageTypes = ['all'];
        if (req.path.includes('/test')) pageTypes.push('test');
        if (req.path.includes('/document-chat')) pageTypes.push('document-chat');
        if (req.path.includes('/upload')) pageTypes.push('upload');

        // Collect all required components for this page
        const componentsToValidate = [];
        pageTypes.forEach(type => {
          if (requiredComponents[type]) {
            componentsToValidate.push(...requiredComponents[type]);
          }
        });

        // Check for each component
        const missingComponents = [];

        componentsToValidate.forEach(component => {
          const searchPattern = component.id ? 
            new RegExp(`id=["']${component.id}["']`) : 
            new RegExp(component.selector.replace('.', '\\.'));
          
          if (!searchPattern.test(body)) {
            missingComponents.push(component);
          }
        });

        // Log validation results
        if (missingComponents.length > 0) {
          console.warn(`[UI Validator] Found ${missingComponents.length} missing components in ${req.path}:`);
          missingComponents.forEach(component => {
            console.warn(`[UI Validator] - Missing: ${component.name} (${component.id || component.selector})`);
          });

          // Add validation report to the HTML if in development environment
          if (process.env.NODE_ENV !== 'production') {
            const validationReport = `
<div id="server-validation-report" style="position:fixed; bottom:10px; left:10px; background-color:rgba(255,0,0,0.8); color:white; padding:15px; border-radius:5px; z-index:10000; max-width:350px; max-height:300px; overflow:auto; font-family:sans-serif; font-size:14px;">
  <h3 style="margin-top:0; margin-bottom:10px;">Server-Side UI Validation Failed</h3>
  <p>Found ${missingComponents.length} missing components:</p>
  <ul style="margin-bottom:0; padding-left:20px;">
    ${missingComponents.map(component => `<li>${component.name} (${component.id || component.selector})</li>`).join('')}
  </ul>
  <button onclick="this.parentNode.style.display='none'" style="margin-top:10px; padding:5px 10px; background:#f44336; border:none; color:white; cursor:pointer; border-radius:3px;">Dismiss</button>
</div>
`;
            // Insert validation report before </body>
            const bodyEndPos = body.indexOf('</body>');
            if (bodyEndPos > 0) {
              body = body.substring(0, bodyEndPos) + validationReport + body.substring(bodyEndPos);
            }
          }
        } else {
          console.log(`[UI Validator] All ${componentsToValidate.length} required components found in ${req.path}`);
        }
      }
    } catch (error) {
      console.error(`Error validating UI components: ${error.message}`);
    }

    // Call original send function with possibly modified body
    return originalSend.call(this, body);
  };

  // Continue to next middleware
  next();
}

module.exports = uiComponentsValidatorMiddleware;