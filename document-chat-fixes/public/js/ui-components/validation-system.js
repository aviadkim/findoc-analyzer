/**
 * UI Validation System
 * Validates that all required UI elements are present on the page
 */

module.exports = {
  /**
   * Initialize the validation system
   */
  initialize: function() {
    console.log('Initializing UI validation system...');
    
    // Define required elements for each page
    this.requiredElements = {
      'all': [
        { selector: '#show-chat-btn', description: 'Show Chat Button' },
        { selector: '#document-chat-container', description: 'Document Chat Container', optional: true },
        { selector: '#document-chat-input', description: 'Document Chat Input', optional: true },
        { selector: '#document-send-btn', description: 'Document Chat Send Button', optional: true },
        { selector: '#login-form', description: 'Login Form', optional: true },
        { selector: '#google-login-btn', description: 'Google Login Button', optional: true }
      ],
      'upload': [
        { selector: '#process-document-btn', description: 'Process Document Button' },
        { selector: '#progress-container', description: 'Progress Container', optional: true },
        { selector: '#progress-bar', description: 'Progress Bar', optional: true },
        { selector: '#upload-status', description: 'Upload Status', optional: true }
      ],
      'test': [
        { selector: '.agent-card', description: 'Agent Cards' },
        { selector: '.status-indicator', description: 'Agent Status Indicators' },
        { selector: '.agent-action', description: 'Agent Action Buttons' }
      ],
      'document-details': [
        { selector: '.document-metadata', description: 'Document Metadata' },
        { selector: '.document-content', description: 'Document Content' },
        { selector: '.document-tables', description: 'Document Tables' }
      ],
      'documents-new': [
        { selector: '.document-list', description: 'Document List' },
        { selector: '.document-item', description: 'Document Items' },
        { selector: '.document-actions', description: 'Document Actions' }
      ],
      'analytics-new': [
        { selector: '.analytics-dashboard', description: 'Analytics Dashboard' },
        { selector: '.analytics-chart', description: 'Analytics Charts' },
        { selector: '.analytics-filters', description: 'Analytics Filters' }
      ],
      'document-chat': [
        { selector: '.document-selector', description: 'Document Selector' },
        { selector: '.chat-history', description: 'Chat History' },
        { selector: '.chat-input', description: 'Chat Input' }
      ],
      'document-comparison': [
        { selector: '.comparison-container', description: 'Comparison Container' },
        { selector: '.document-selector', description: 'Document Selectors' },
        { selector: '.comparison-results', description: 'Comparison Results' }
      ]
    };
    
    // Run validation
    this.validateElements();
    
    // Add validation report button
    this.addValidationReportButton();
  },
  
  /**
   * Validate required elements
   */
  validateElements: function() {
    console.log('Validating UI elements...');
    
    // Determine current page
    const currentPath = window.location.pathname;
    let pageType = 'all';
    
    if (currentPath.includes('/upload')) {
      pageType = 'upload';
    } else if (currentPath.includes('/test')) {
      pageType = 'test';
    } else if (currentPath.includes('/document-details')) {
      pageType = 'document-details';
    } else if (currentPath.includes('/documents-new')) {
      pageType = 'documents-new';
    } else if (currentPath.includes('/analytics-new')) {
      pageType = 'analytics-new';
    } else if (currentPath.includes('/document-chat')) {
      pageType = 'document-chat';
    } else if (currentPath.includes('/document-comparison')) {
      pageType = 'document-comparison';
    }
    
    // Get elements to validate
    const elementsToValidate = [...this.requiredElements['all']];
    if (this.requiredElements[pageType]) {
      elementsToValidate.push(...this.requiredElements[pageType]);
    }
    
    // Validate elements
    this.missingElements = [];
    this.foundElements = [];
    
    elementsToValidate.forEach(element => {
      const found = document.querySelector(element.selector);
      if (!found && !element.optional) {
        // Required element is missing
        this.missingElements.push(element);
        console.warn(`Missing UI element: ${element.description} (${element.selector})`);
      } else if (found) {
        // Element exists
        this.foundElements.push(element);
        console.log(`Found UI element: ${element.description} (${element.selector})`);
      } else {
        // Optional element is missing
        console.log(`Optional UI element not found: ${element.description} (${element.selector})`);
      }
    });
    
    // Report results
    if (this.missingElements.length > 0) {
      console.error(`UI Validation failed: ${this.missingElements.length} elements missing`);
    } else {
      console.log('UI Validation passed: All required elements are present');
    }
    
    // Store validation results
    window.uiValidationResults = {
      missingElements: this.missingElements,
      foundElements: this.foundElements,
      pageType: pageType,
      timestamp: new Date().toISOString()
    };
  },
  
  /**
   * Add validation report button
   */
  addValidationReportButton: function() {
    // Only add in development mode
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      // Create validation report button
      const reportButton = document.createElement('button');
      reportButton.id = 'validation-report-btn';
      reportButton.textContent = 'UI Validation';
      reportButton.style.position = 'fixed';
      reportButton.style.bottom = '20px';
      reportButton.style.left = '20px';
      reportButton.style.backgroundColor = this.missingElements.length > 0 ? '#dc3545' : '#28a745';
      reportButton.style.color = 'white';
      reportButton.style.border = 'none';
      reportButton.style.padding = '10px 20px';
      reportButton.style.borderRadius = '5px';
      reportButton.style.cursor = 'pointer';
      reportButton.style.zIndex = '9999';
      
      // Add event listener
      reportButton.addEventListener('click', this.showValidationReport.bind(this));
      
      document.body.appendChild(reportButton);
    }
  },
  
  /**
   * Show validation report
   */
  showValidationReport: function() {
    // Create validation report
    let reportContainer = document.getElementById('validation-report-container');
    
    if (!reportContainer) {
      reportContainer = document.createElement('div');
      reportContainer.id = 'validation-report-container';
      reportContainer.style.position = 'fixed';
      reportContainer.style.top = '50%';
      reportContainer.style.left = '50%';
      reportContainer.style.transform = 'translate(-50%, -50%)';
      reportContainer.style.backgroundColor = 'white';
      reportContainer.style.boxShadow = '0 0 10px rgba(0,0,0,0.2)';
      reportContainer.style.borderRadius = '10px';
      reportContainer.style.padding = '20px';
      reportContainer.style.maxWidth = '600px';
      reportContainer.style.maxHeight = '80vh';
      reportContainer.style.overflow = 'auto';
      reportContainer.style.zIndex = '10000';
      
      // Create report header
      const reportHeader = document.createElement('div');
      reportHeader.style.display = 'flex';
      reportHeader.style.justifyContent = 'space-between';
      reportHeader.style.alignItems = 'center';
      reportHeader.style.marginBottom = '20px';
      
      const reportTitle = document.createElement('h2');
      reportTitle.textContent = 'UI Validation Report';
      reportTitle.style.margin = '0';
      
      const closeButton = document.createElement('button');
      closeButton.textContent = '×';
      closeButton.style.background = 'none';
      closeButton.style.border = 'none';
      closeButton.style.fontSize = '24px';
      closeButton.style.cursor = 'pointer';
      closeButton.addEventListener('click', function() {
        reportContainer.style.display = 'none';
      });
      
      reportHeader.appendChild(reportTitle);
      reportHeader.appendChild(closeButton);
      
      // Create report content
      const reportContent = document.createElement('div');
      
      // Add page type
      const pageType = document.createElement('p');
      pageType.innerHTML = `<strong>Page Type:</strong> ${window.uiValidationResults.pageType}`;
      reportContent.appendChild(pageType);
      
      // Add timestamp
      const timestamp = document.createElement('p');
      timestamp.innerHTML = `<strong>Timestamp:</strong> ${new Date(window.uiValidationResults.timestamp).toLocaleString()}`;
      reportContent.appendChild(timestamp);
      
      // Add missing elements
      const missingElementsTitle = document.createElement('h3');
      missingElementsTitle.textContent = 'Missing Elements';
      missingElementsTitle.style.color = this.missingElements.length > 0 ? '#dc3545' : '#28a745';
      reportContent.appendChild(missingElementsTitle);
      
      if (this.missingElements.length > 0) {
        const missingElementsList = document.createElement('ul');
        this.missingElements.forEach(element => {
          const listItem = document.createElement('li');
          listItem.innerHTML = `<strong>${element.description}</strong> (${element.selector})`;
          missingElementsList.appendChild(listItem);
        });
        reportContent.appendChild(missingElementsList);
      } else {
        const noMissingElements = document.createElement('p');
        noMissingElements.textContent = 'No missing elements!';
        reportContent.appendChild(noMissingElements);
      }
      
      // Add found elements
      const foundElementsTitle = document.createElement('h3');
      foundElementsTitle.textContent = 'Found Elements';
      foundElementsTitle.style.color = '#28a745';
      reportContent.appendChild(foundElementsTitle);
      
      if (this.foundElements.length > 0) {
        const foundElementsList = document.createElement('ul');
        this.foundElements.forEach(element => {
          const listItem = document.createElement('li');
          listItem.innerHTML = `<strong>${element.description}</strong> (${element.selector})`;
          foundElementsList.appendChild(listItem);
        });
        reportContent.appendChild(foundElementsList);
      } else {
        const noFoundElements = document.createElement('p');
        noFoundElements.textContent = 'No elements found!';
        reportContent.appendChild(noFoundElements);
      }
      
      // Add report to container
      reportContainer.appendChild(reportHeader);
      reportContainer.appendChild(reportContent);
      
      // Add container to body
      document.body.appendChild(reportContainer);
    } else {
      reportContainer.style.display = 'block';
    }
  }
};
