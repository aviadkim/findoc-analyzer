/**
 * FinDoc Analyzer UI Validator
 */
document.addEventListener('DOMContentLoaded', function() {
  console.log('UI Validator running...');
  
  // Define required elements
  const requiredElements = [
    { selector: '#process-document-btn', description: 'Process Document Button' },
    { selector: '#document-chat-container', description: 'Document Chat Container' },
    { selector: '#document-send-btn', description: 'Document Chat Send Button' },
    { selector: '#show-chat-btn', description: 'Show Chat Button' }
  ];
  
  // Validate elements
  const missingElements = [];
  
  requiredElements.forEach(function(element) {
    const found = document.querySelector(element.selector);
    if (!found) {
      // Element is missing
      missingElements.push(element);
      console.warn('Missing UI element: ' + element.description + ' (' + element.selector + ')');
    } else {
      // Element exists
      console.log('Found UI element: ' + element.description + ' (' + element.selector + ')');
    }
  });
  
  // Report results
  if (missingElements.length > 0) {
    console.error('UI Validation failed: ' + missingElements.length + ' elements missing');
  } else {
    console.log('UI Validation passed: All required elements are present');
  }
});
