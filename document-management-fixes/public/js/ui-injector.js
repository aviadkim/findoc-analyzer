/**
 * UI Injector
 * Injects UI components directly into the page
 */

// Load UI components script
(function() {
  // Create script element
  var script = document.createElement('script');
  script.src = '/js/ui-components-deploy.js';
  script.async = true;
  
  // Add script to head
  document.head.appendChild(script);
  
  // Log success
  console.log('UI components script loaded successfully!');
})();
