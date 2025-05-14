/**
 * FinDoc Analyzer UI Components Library
 * This file exports all UI components for the application
 */

// Import all component modules
const ProcessButton = require('./process-button');
const ChatInterface = require('./chat-interface');
const LoginComponents = require('./login-components');
const AgentCards = require('./agent-cards');
const ValidationSystem = require('./validation-system');

// Export all components
module.exports = {
  ProcessButton,
  ChatInterface,
  LoginComponents,
  AgentCards,
  ValidationSystem,
  
  // Initialize all components
  initializeAll: function() {
    console.log('Initializing all UI components...');
    
    // Initialize process button on upload pages
    if (window.location.pathname.includes('/upload')) {
      ProcessButton.initialize();
    }
    
    // Initialize chat interface on all pages
    ChatInterface.initialize();
    
    // Initialize login components on login pages
    if (window.location.pathname.includes('/login')) {
      LoginComponents.initialize();
    }
    
    // Initialize agent cards on test pages
    if (window.location.pathname.includes('/test')) {
      AgentCards.initialize();
    }
    
    // Initialize validation system on all pages
    ValidationSystem.initialize();
    
    console.log('All UI components initialized successfully!');
  }
};
