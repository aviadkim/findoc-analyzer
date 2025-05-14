/**
 * HTML Injector Simple
 * Injects HTML elements into the page
 */

// Load UI components
(function() {
  console.log('HTML Injector Simple initializing...');

  // Load chat button script
  loadScript('/js/chat-button.js');

  // Load process button script if on upload page
  if (window.location.pathname.includes('/upload')) {
    loadScript('/js/process-button.js');
  }

  // Load agent cards script if on test page
  if (window.location.pathname.includes('/test')) {
    loadScript('/js/agent-cards.js');
  }

  // Load document list script if on documents page
  if (window.location.pathname.includes('/documents') || window.location.pathname.includes('/documents-new')) {
    loadScript('/js/document-list.js');
  }

  // Load analytics dashboard script if on analytics page
  if (window.location.pathname.includes('/analytics') || window.location.pathname.includes('/analytics-new')) {
    loadScript('/js/analytics-dashboard.js');
  }

  // Load document details script if on document details page
  if (window.location.pathname.includes('/document-details')) {
    loadScript('/js/document-details.js');
  }

  console.log('HTML Injector Simple initialized');

  /**
   * Load a script
   * @param {string} src - Script source
   */
  function loadScript(src) {
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    document.head.appendChild(script);
    console.log(`Script loaded: ${src}`);
  }
})();
