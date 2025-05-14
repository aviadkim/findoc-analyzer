/**
 * Tenant Manager
 * 
 * This module provides functionality for:
 * - Multi-tenant data isolation
 * - Tenant authentication and session management
 * - Tenant-specific settings and preferences
 */

(function() {
  console.log('Tenant Manager loaded');
  
  // Create global tenant manager
  window.tenantManager = {
    // Current tenant
    currentTenant: null,
    
    // Tenant data (isolated by tenant ID)
    tenantData: {},
    
    // Initialize the tenant manager
    init: function() {
      console.log('Initializing Tenant Manager');
      
      // Load tenant data from localStorage
      this.loadTenantData();
      
      // Check for existing tenant session
      this.checkExistingSession();
      
      // Register event listeners
      document.addEventListener('userLogin', this.handleUserLogin.bind(this));
      document.addEventListener('userLogout', this.handleUserLogout.bind(this));
    },
    
    // Load tenant data from localStorage
    loadTenantData: function() {
      try {
        const savedData = localStorage.getItem('tenantData');
        if (savedData) {
          this.tenantData = JSON.parse(savedData);
          console.log('Loaded tenant data from localStorage');
        }
      } catch (error) {
        console.error('Error loading tenant data:', error);
        this.tenantData = {};
      }
    },
    
    // Save tenant data to localStorage
    saveTenantData: function() {
      try {
        localStorage.setItem('tenantData', JSON.stringify(this.tenantData));
        console.log('Saved tenant data to localStorage');
      } catch (error) {
        console.error('Error saving tenant data:', error);
      }
    },
    
    // Check for existing tenant session
    checkExistingSession: function() {
      const tenantId = localStorage.getItem('tenantId');
      const tenantSession = localStorage.getItem('tenantSession');
      
      if (tenantId && tenantSession) {
        try {
          const session = JSON.parse(tenantSession);
          
          // Check if session is still valid
          if (session.expiresAt && new Date(session.expiresAt) > new Date()) {
            console.log('Found valid tenant session:', tenantId);
            
            // Set current tenant
            this.setCurrentTenant(tenantId, session);
            return;
          }
        } catch (error) {
          console.error('Error parsing tenant session:', error);
        }
      }
      
      console.log('No valid tenant session found');
      
      // Set default tenant
      this.setCurrentTenant('default', {
        name: 'Default Tenant',
        email: null,
        role: 'guest',
        expiresAt: null
      });
    },
    
    // Set current tenant
    setCurrentTenant: function(tenantId, session) {
      this.currentTenant = {
        id: tenantId,
        name: session.name,
        email: session.email,
        role: session.role,
        expiresAt: session.expiresAt
      };
      
      // Save tenant ID to localStorage
      localStorage.setItem('tenantId', tenantId);
      
      // Save tenant session to localStorage
      localStorage.setItem('tenantSession', JSON.stringify(session));
      
      // Initialize tenant data if it doesn't exist
      if (!this.tenantData[tenantId]) {
        this.tenantData[tenantId] = {
          settings: {
            theme: 'light',
            language: 'en',
            dateFormat: 'MM/DD/YYYY',
            notifications: true
          },
          documents: [],
          conversations: {}
        };
        
        this.saveTenantData();
      }
      
      // Dispatch tenant login event
      document.dispatchEvent(new CustomEvent('tenantLogin', {
        detail: { tenantId: tenantId }
      }));
      
      console.log('Current tenant set to:', tenantId);
    },
    
    // Handle user login
    handleUserLogin: function(event) {
      const { email, name } = event.detail;
      
      // Generate tenant ID from email
      const tenantId = this.generateTenantId(email);
      
      // Create session
      const session = {
        name: name,
        email: email,
        role: 'user',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
      };
      
      // Set current tenant
      this.setCurrentTenant(tenantId, session);
    },
    
    // Handle user logout
    handleUserLogout: function() {
      // Clear tenant session
      localStorage.removeItem('tenantId');
      localStorage.removeItem('tenantSession');
      
      // Set default tenant
      this.setCurrentTenant('default', {
        name: 'Default Tenant',
        email: null,
        role: 'guest',
        expiresAt: null
      });
      
      // Dispatch tenant logout event
      document.dispatchEvent(new CustomEvent('tenantLogout'));
      
      console.log('Tenant logged out');
    },
    
    // Generate tenant ID from email
    generateTenantId: function(email) {
      if (!email) return 'default';
      
      // Use email domain as tenant ID for organizations
      if (email.includes('@')) {
        const domain = email.split('@')[1];
        
        // For common email providers, use the full email
        if (['gmail.com', 'outlook.com', 'hotmail.com', 'yahoo.com'].includes(domain)) {
          // Hash the email for privacy
          return 'user-' + this.hashString(email);
        }
        
        // For organizational emails, use the domain
        return 'org-' + this.hashString(domain);
      }
      
      // Fallback to hashed email
      return 'user-' + this.hashString(email);
    },
    
    // Simple string hashing function
    hashString: function(str) {
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
      }
      return Math.abs(hash).toString(16);
    },
    
    // Get current tenant ID
    getCurrentTenantId: function() {
      return this.currentTenant ? this.currentTenant.id : 'default';
    },
    
    // Get current tenant data
    getCurrentTenantData: function() {
      const tenantId = this.getCurrentTenantId();
      return this.tenantData[tenantId] || {};
    },
    
    // Get tenant setting
    getTenantSetting: function(key) {
      const tenantData = this.getCurrentTenantData();
      return tenantData.settings ? tenantData.settings[key] : null;
    },
    
    // Set tenant setting
    setTenantSetting: function(key, value) {
      const tenantId = this.getCurrentTenantId();
      
      if (!this.tenantData[tenantId]) {
        this.tenantData[tenantId] = { settings: {} };
      }
      
      if (!this.tenantData[tenantId].settings) {
        this.tenantData[tenantId].settings = {};
      }
      
      this.tenantData[tenantId].settings[key] = value;
      this.saveTenantData();
      
      return true;
    },
    
    // Get tenant documents
    getTenantDocuments: function() {
      const tenantData = this.getCurrentTenantData();
      return tenantData.documents || [];
    },
    
    // Add tenant document
    addTenantDocument: function(document) {
      const tenantId = this.getCurrentTenantId();
      
      if (!this.tenantData[tenantId]) {
        this.tenantData[tenantId] = { documents: [] };
      }
      
      if (!this.tenantData[tenantId].documents) {
        this.tenantData[tenantId].documents = [];
      }
      
      this.tenantData[tenantId].documents.push(document);
      this.saveTenantData();
      
      return true;
    },
    
    // Get tenant conversation
    getTenantConversation: function(documentId) {
      const tenantData = this.getCurrentTenantData();
      return tenantData.conversations && tenantData.conversations[documentId] 
        ? tenantData.conversations[documentId] 
        : [];
    },
    
    // Add tenant conversation message
    addTenantConversationMessage: function(documentId, message) {
      const tenantId = this.getCurrentTenantId();
      
      if (!this.tenantData[tenantId]) {
        this.tenantData[tenantId] = { conversations: {} };
      }
      
      if (!this.tenantData[tenantId].conversations) {
        this.tenantData[tenantId].conversations = {};
      }
      
      if (!this.tenantData[tenantId].conversations[documentId]) {
        this.tenantData[tenantId].conversations[documentId] = [];
      }
      
      this.tenantData[tenantId].conversations[documentId].push(message);
      this.saveTenantData();
      
      return true;
    }
  };
  
  // Initialize the tenant manager
  window.tenantManager.init();
})();
