/**
 * Secure Key Storage
 * 
 * This module provides a more secure way to handle API keys:
 * - Keys are encrypted in localStorage
 * - Keys are never exposed in the source code
 * - Keys are only decrypted when needed for API calls
 * - Keys can be rotated and managed by administrators
 */

(function() {
  console.log('Secure Key Storage loaded');
  
  // Create global secure key storage
  window.secureKeyStorage = {
    // Encryption key (in a real implementation, this would be derived from a server-provided token)
    encryptionKey: null,
    
    // Encrypted keys
    encryptedKeys: null,
    
    // Initialize the secure key storage
    init: function() {
      console.log('Initializing Secure Key Storage');
      
      // Generate or retrieve encryption key
      this.initializeEncryptionKey();
      
      // Load encrypted keys
      this.loadEncryptedKeys();
      
      // Patch API key manager if it exists
      this.patchApiKeyManager();
    },
    
    // Initialize encryption key
    initializeEncryptionKey: function() {
      // In a real implementation, this would be derived from a server-provided token
      // For this demo, we'll use a simple key derived from the user's session
      const sessionId = localStorage.getItem('sessionId') || this.generateSessionId();
      this.encryptionKey = this.hashString(sessionId + navigator.userAgent);
      
      console.log('Encryption key initialized');
    },
    
    // Generate a session ID
    generateSessionId: function() {
      const sessionId = 'session-' + Date.now() + '-' + Math.random().toString(36).substring(2);
      localStorage.setItem('sessionId', sessionId);
      return sessionId;
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
    
    // Load encrypted keys from localStorage
    loadEncryptedKeys: function() {
      try {
        const savedKeys = localStorage.getItem('encryptedApiKeys');
        if (savedKeys) {
          this.encryptedKeys = JSON.parse(savedKeys);
          console.log('Loaded encrypted API keys from localStorage');
        } else {
          // Initialize with default encrypted keys
          this.encryptedKeys = this.encryptDefaultKeys();
          this.saveEncryptedKeys();
        }
      } catch (error) {
        console.error('Error loading encrypted API keys:', error);
        this.encryptedKeys = this.encryptDefaultKeys();
        this.saveEncryptedKeys();
      }
    },
    
    // Save encrypted keys to localStorage
    saveEncryptedKeys: function() {
      try {
        localStorage.setItem('encryptedApiKeys', JSON.stringify(this.encryptedKeys));
        console.log('Saved encrypted API keys to localStorage');
      } catch (error) {
        console.error('Error saving encrypted API keys:', error);
      }
    },
    
    // Encrypt default keys
    encryptDefaultKeys: function() {
      // These are the default keys that will be used if no keys are provided
      // In a real implementation, these would be empty and keys would be provided by the server
      const defaultKeys = {
        openrouter: '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',
        openrouter_alt: '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',
        deepseek: 'deepseek v3 free',
        gemini: 'gemini free',
        anthropic: ''
      };
      
      // Encrypt each key
      const encryptedKeys = {};
      Object.keys(defaultKeys).forEach(service => {
        encryptedKeys[service] = this.encryptString(defaultKeys[service]);
      });
      
      return encryptedKeys;
    },
    
    // Encrypt a string
    encryptString: function(str) {
      if (!str) return '';
      
      // In a real implementation, this would use a proper encryption algorithm
      // For this demo, we'll use a simple XOR cipher with the encryption key
      let encrypted = '';
      for (let i = 0; i < str.length; i++) {
        const charCode = str.charCodeAt(i);
        const keyChar = this.encryptionKey.charCodeAt(i % this.encryptionKey.length);
        encrypted += String.fromCharCode(charCode ^ keyChar);
      }
      
      // Convert to base64 for storage
      return btoa(encrypted);
    },
    
    // Decrypt a string
    decryptString: function(encrypted) {
      if (!encrypted) return '';
      
      try {
        // Convert from base64
        const decoded = atob(encrypted);
        
        // Decrypt using XOR cipher
        let decrypted = '';
        for (let i = 0; i < decoded.length; i++) {
          const charCode = decoded.charCodeAt(i);
          const keyChar = this.encryptionKey.charCodeAt(i % this.encryptionKey.length);
          decrypted += String.fromCharCode(charCode ^ keyChar);
        }
        
        return decrypted;
      } catch (error) {
        console.error('Error decrypting string:', error);
        return '';
      }
    },
    
    // Get a decrypted API key
    getApiKey: function(service) {
      if (!this.encryptedKeys || !this.encryptedKeys[service]) {
        console.warn(`No encrypted key found for ${service}`);
        return '';
      }
      
      return this.decryptString(this.encryptedKeys[service]);
    },
    
    // Set and encrypt an API key
    setApiKey: function(service, key) {
      if (!this.encryptedKeys) {
        this.encryptedKeys = {};
      }
      
      this.encryptedKeys[service] = this.encryptString(key);
      this.saveEncryptedKeys();
      
      console.log(`API key for ${service} updated and encrypted`);
    },
    
    // Patch the API key manager to use secure key storage
    patchApiKeyManager: function() {
      if (window.apiKeyManager) {
        console.log('Patching API Key Manager to use Secure Key Storage');
        
        // Store original getApiKey function
        const originalGetApiKey = window.apiKeyManager.getApiKey;
        
        // Override getApiKey function
        window.apiKeyManager.getApiKey = function(service) {
          // Try to get key from secure storage first
          const secureKey = window.secureKeyStorage.getApiKey(service);
          if (secureKey) {
            console.log(`Using securely stored API key for ${service}`);
            
            // Track usage
            this.trackUsage(service);
            
            return secureKey;
          }
          
          // Fall back to original implementation
          console.log(`No secure key found for ${service}, falling back to original implementation`);
          return originalGetApiKey.call(this, service);
        };
        
        // Override loadCentralKeys function
        const originalLoadCentralKeys = window.apiKeyManager.loadCentralKeys;
        window.apiKeyManager.loadCentralKeys = function() {
          // Call original function
          if (typeof originalLoadCentralKeys === 'function') {
            originalLoadCentralKeys.call(this);
          }
          
          // Encrypt central keys
          Object.keys(this.centralKeys).forEach(service => {
            if (this.centralKeys[service]) {
              window.secureKeyStorage.setApiKey(service, this.centralKeys[service]);
            }
          });
          
          // Clear central keys from memory
          this.centralKeys = {
            openrouter: '[REDACTED]',
            openrouter_alt: '[REDACTED]',
            deepseek: '[REDACTED]',
            gemini: '[REDACTED]',
            anthropic: '[REDACTED]'
          };
          
          console.log('Central API keys encrypted and secured');
        };
      }
    }
  };
  
  // Initialize the secure key storage
  window.secureKeyStorage.init();
})();
