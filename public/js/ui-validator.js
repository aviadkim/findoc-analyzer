/**
 * FinDoc Analyzer UI Validator
 * This script validates that all required UI elements are present on the page.
 */

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
  console.log('UI Validator running...');

  // Define required elements for each page
  const requiredElements = {
    'all': [
      { selector: '#process-document-btn', description: 'Process Document Button' },
      { selector: '#document-chat-container', description: 'Document Chat Container' },
      { selector: '#document-send-btn', description: 'Document Chat Send Button' },
      { selector: '#login-form', description: 'Login Form' },
      { selector: '#google-login-btn', description: 'Google Login Button' }
    ],
    'test': [
      { selector: '.agent-card', description: 'Agent Cards' },
      { selector: '.status-indicator', description: 'Agent Status Indicators' },
      { selector: '.agent-action', description: 'Agent Action Buttons' }
    ]
  };

  // Determine current page
  const currentPath = window.location.pathname;
  let pageName = 'all';

  if (currentPath.includes('/test')) {
    pageName = 'test';
  }

  // Get elements to validate
  const elementsToValidate = [...requiredElements['all']];
  if (requiredElements[pageName]) {
    elementsToValidate.push(...requiredElements[pageName]);
  }

  // Validate elements
  const missingElements = [];

  elementsToValidate.forEach(element => {
    const found = document.querySelector(element.selector);
    if (!found) {
      // Element is completely missing
      missingElements.push(element);
      console.warn(`Missing UI element: ${element.description} (${element.selector})`);
    } else {
      // Element exists, log success
      console.log(`Found UI element: ${element.description} (${element.selector})`);
    }
  });

  // Report results
  if (missingElements.length > 0) {
    console.error(`UI Validation failed: ${missingElements.length} elements missing`);

    // Add validation report to the page in development mode
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      const validationReport = document.createElement('div');
      validationReport.className = 'validation-report';
      validationReport.style.position = 'fixed';
      validationReport.style.bottom = '10px';
      validationReport.style.right = '10px';
      validationReport.style.backgroundColor = 'rgba(255, 0, 0, 0.8)';
      validationReport.style.color = 'white';
      validationReport.style.padding = '10px';
      validationReport.style.borderRadius = '5px';
      validationReport.style.zIndex = '9999';
      validationReport.style.maxWidth = '300px';
      validationReport.style.maxHeight = '200px';
      validationReport.style.overflow = 'auto';

      validationReport.innerHTML = `
        <h3>UI Validation Failed</h3>
        <p>${missingElements.length} elements missing:</p>
        <ul>
          ${missingElements.map(element => `<li>${element.description} (${element.selector})</li>`).join('')}
        </ul>
      `;

      document.body.appendChild(validationReport);
    }
  } else {
    console.log('UI Validation passed: All required elements are present');
  }
});
