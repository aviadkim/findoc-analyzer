/**
 * FinDoc Integration Script
 *
 * This script integrates all the components of the FinDoc Analyzer:
 * - API Key Manager
 * - Tenant Manager
 * - Agent Manager
 * - Google Authentication
 * - Document Chat
 *
 * It ensures that all components are loaded in the correct order
 * and properly initialized.
 */

(function() {
  console.log('FinDoc Integration Script loaded');

  // Configuration
  const config = {
    // Default API keys (for development/testing only)
    defaultApiKeys: {
      openrouter: 'sk-or-v1-...',  // Replace with your default OpenRouter API key
      openai: 'sk-...',            // Replace with your default OpenAI API key
      gemini: 'AIza...',           // Replace with your default Gemini API key
      anthropic: 'sk-ant-...'      // Replace with your default Anthropic API key
    },

    // Module paths
    modulePaths: {
      apiKeyManager: '/js/api-key-manager.js',
      secureKeyStorage: '/js/secure-key-storage.js',
      tenantManager: '/js/tenant-manager.js',
      agentManagerFix: '/js/agent-manager-fix.js',
      googleAuthFix: '/js/google-auth-fix.js',
      documentChatFix: '/js/document-chat-fix.js'
    },

    // Debug mode
    debug: true
  };

  // Load a script dynamically
  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  // Check if a script is already loaded
  function isScriptLoaded(src) {
    return Array.from(document.scripts).some(script => script.src.includes(src));
  }

  // Load a module if it's not already loaded
  async function loadModule(name, path) {
    if (isScriptLoaded(path)) {
      console.log(`Module ${name} is already loaded`);
      return;
    }

    console.log(`Loading module ${name} from ${path}`);

    try {
      await loadScript(path);
      console.log(`Module ${name} loaded successfully`);
    } catch (error) {
      console.error(`Error loading module ${name}:`, error);
    }
  }

  // Initialize the integration
  async function init() {
    console.log('Initializing FinDoc Integration');

    try {
      // Load API Key Manager
      await loadModule('apiKeyManager', config.modulePaths.apiKeyManager);

      // Load Secure Key Storage
      await loadModule('secureKeyStorage', config.modulePaths.secureKeyStorage);

      // Load Tenant Manager
      await loadModule('tenantManager', config.modulePaths.tenantManager);

      // Load Agent Manager Fix
      await loadModule('agentManagerFix', config.modulePaths.agentManagerFix);

      // Load Google Auth Fix
      await loadModule('googleAuthFix', config.modulePaths.googleAuthFix);

      // Load Document Chat Fix
      await loadModule('documentChatFix', config.modulePaths.documentChatFix);

      // Set default API keys
      if (window.apiKeyManager) {
        window.apiKeyManager.centralKeys = config.defaultApiKeys;

        // Trigger key encryption if secure key storage is available
        if (window.secureKeyStorage && typeof window.apiKeyManager.loadCentralKeys === 'function') {
          window.apiKeyManager.loadCentralKeys();
        }
      }

      console.log('FinDoc Integration initialized successfully');

      // Dispatch integration ready event
      document.dispatchEvent(new CustomEvent('findocIntegrationReady'));
    } catch (error) {
      console.error('Error initializing FinDoc Integration:', error);
    }
  }

  // Initialize when DOM is loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose integration to window
  window.findocIntegration = {
    config,
    loadModule,
    init
  };
})();
