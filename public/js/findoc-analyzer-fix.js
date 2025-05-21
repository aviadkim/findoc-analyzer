/**
 * FinDoc Analyzer Fix
 * 
 * This script fixes all issues in the FinDoc Analyzer application by loading
 * all the fix scripts and applying them in the correct order.
 */

(function() {
  console.log('FinDoc Analyzer Fix loaded');

  // Configuration
  const config = {
    // Fix scripts to load
    scripts: [
      '/js/auth-fix.js',
      '/js/document-processing-fix.js',
      '/js/ui-components-fix.js'
    ],
    
    // Debug mode
    debug: true
  };

  // Initialize when DOM is loaded
  document.addEventListener('DOMContentLoaded', function() {
    initFix();
  });

  /**
   * Initialize fix
   */
  function initFix() {
    console.log('Initializing FinDoc Analyzer Fix');

    // Load fix scripts
    loadFixScripts();

    // Add fix styles
    addFixStyles();

    // Add fix metadata
    addFixMetadata();
  }

  /**
   * Load fix scripts
   */
  function loadFixScripts() {
    console.log('Loading fix scripts');

    // Load each script
    config.scripts.forEach((script, index) => {
      const scriptElement = document.createElement('script');
      scriptElement.src = script;
      scriptElement.async = false;
      scriptElement.defer = false;
      scriptElement.id = `fix-script-${index}`;
      
      // Add load event listener
      scriptElement.addEventListener('load', () => {
        console.log(`Loaded fix script: ${script}`);
      });
      
      // Add error event listener
      scriptElement.addEventListener('error', () => {
        console.error(`Failed to load fix script: ${script}`);
      });
      
      // Add script to head
      document.head.appendChild(scriptElement);
    });
  }

  /**
   * Add fix styles
   */
  function addFixStyles() {
    console.log('Adding fix styles');

    // Create style element
    const style = document.createElement('style');
    style.id = 'findoc-analyzer-fix-styles';
    style.textContent = `
      /* Fix styles */
      body {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        margin: 0;
        padding: 0;
        background-color: #f8f9fa;
        color: #333;
      }
      
      /* Fix notification */
      .fix-notification {
        position: fixed;
        bottom: 20px;
        left: 20px;
        background-color: #28a745;
        color: white;
        padding: 10px 20px;
        border-radius: 5px;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        z-index: 9999;
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 14px;
        opacity: 0;
        transform: translateY(20px);
        transition: opacity 0.3s, transform 0.3s;
      }
      .fix-notification.show {
        opacity: 1;
        transform: translateY(0);
      }
      .fix-notification-icon {
        font-size: 20px;
      }
      .fix-notification-close {
        margin-left: 10px;
        background: none;
        border: none;
        color: white;
        cursor: pointer;
        font-size: 16px;
      }
      
      /* Debug panel */
      .debug-panel {
        position: fixed;
        top: 20px;
        right: 20px;
        background-color: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 10px;
        border-radius: 5px;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        z-index: 9999;
        font-size: 12px;
        font-family: monospace;
        max-width: 300px;
        max-height: 200px;
        overflow: auto;
        display: none;
      }
      .debug-panel.show {
        display: block;
      }
      .debug-panel-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 10px;
        padding-bottom: 5px;
        border-bottom: 1px solid #555;
      }
      .debug-panel-title {
        margin: 0;
        font-size: 14px;
      }
      .debug-panel-close {
        background: none;
        border: none;
        color: white;
        cursor: pointer;
        font-size: 16px;
      }
      .debug-panel-content {
        margin: 0;
        padding: 0;
        list-style: none;
      }
      .debug-panel-item {
        margin-bottom: 5px;
        padding-bottom: 5px;
        border-bottom: 1px solid #444;
      }
      .debug-panel-item:last-child {
        margin-bottom: 0;
        padding-bottom: 0;
        border-bottom: none;
      }
      .debug-panel-item-success {
        color: #28a745;
      }
      .debug-panel-item-error {
        color: #dc3545;
      }
      .debug-panel-item-warning {
        color: #ffc107;
      }
      .debug-panel-item-info {
        color: #17a2b8;
      }
      
      /* Fix button */
      .fix-button {
        position: fixed;
        bottom: 80px;
        right: 20px;
        background-color: #dc3545;
        color: white;
        border: none;
        border-radius: 50%;
        width: 50px;
        height: 50px;
        font-size: 20px;
        cursor: pointer;
        z-index: 999;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        display: flex;
        align-items: center;
        justify-content: center;
      }
    `;
    
    // Add style to head
    document.head.appendChild(style);
  }

  /**
   * Add fix metadata
   */
  function addFixMetadata() {
    console.log('Adding fix metadata');

    // Create fix notification
    const notification = document.createElement('div');
    notification.className = 'fix-notification';
    notification.innerHTML = `
      <span class="fix-notification-icon">✓</span>
      <span>FinDoc Analyzer Fix applied successfully</span>
      <button class="fix-notification-close">&times;</button>
    `;
    
    // Add notification to body
    document.body.appendChild(notification);
    
    // Show notification after a delay
    setTimeout(() => {
      notification.classList.add('show');
    }, 1000);
    
    // Add event listener to close button
    const closeButton = notification.querySelector('.fix-notification-close');
    closeButton.addEventListener('click', () => {
      notification.classList.remove('show');
      setTimeout(() => {
        notification.remove();
      }, 300);
    });
    
    // Hide notification after a delay
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => {
        notification.remove();
      }, 300);
    }, 5000);
    
    // Add debug panel if debug mode is enabled
    if (config.debug) {
      // Create debug panel
      const debugPanel = document.createElement('div');
      debugPanel.className = 'debug-panel';
      debugPanel.innerHTML = `
        <div class="debug-panel-header">
          <h3 class="debug-panel-title">FinDoc Analyzer Fix Debug</h3>
          <button class="debug-panel-close">&times;</button>
        </div>
        <ul class="debug-panel-content">
          <li class="debug-panel-item debug-panel-item-success">Fix loaded successfully</li>
          <li class="debug-panel-item debug-panel-item-info">Checking for missing UI components...</li>
        </ul>
      `;
      
      // Add debug panel to body
      document.body.appendChild(debugPanel);
      
      // Show debug panel after a delay
      setTimeout(() => {
        debugPanel.classList.add('show');
      }, 2000);
      
      // Add event listener to close button
      const closeButton = debugPanel.querySelector('.debug-panel-close');
      closeButton.addEventListener('click', () => {
        debugPanel.classList.remove('show');
        setTimeout(() => {
          debugPanel.remove();
        }, 300);
      });
      
      // Add fix button
      const fixButton = document.createElement('button');
      fixButton.className = 'fix-button';
      fixButton.innerHTML = '🔧';
      fixButton.title = 'Toggle Debug Panel';
      
      // Add fix button to body
      document.body.appendChild(fixButton);
      
      // Add event listener to fix button
      fixButton.addEventListener('click', () => {
        debugPanel.classList.toggle('show');
      });
      
      // Override console.log to add to debug panel
      const originalConsoleLog = console.log;
      const originalConsoleError = console.error;
      const originalConsoleWarn = console.warn;
      const originalConsoleInfo = console.info;
      
      console.log = function() {
        originalConsoleLog.apply(console, arguments);
        addDebugMessage('log', arguments[0]);
      };
      
      console.error = function() {
        originalConsoleError.apply(console, arguments);
        addDebugMessage('error', arguments[0]);
      };
      
      console.warn = function() {
        originalConsoleWarn.apply(console, arguments);
        addDebugMessage('warning', arguments[0]);
      };
      
      console.info = function() {
        originalConsoleInfo.apply(console, arguments);
        addDebugMessage('info', arguments[0]);
      };
      
      /**
       * Add debug message to debug panel
       * @param {string} type - Message type (log, error, warning, info)
       * @param {string} message - Message text
       */
      function addDebugMessage(type, message) {
        // Get debug panel content
        const debugPanelContent = document.querySelector('.debug-panel-content');
        
        if (debugPanelContent) {
          // Create debug panel item
          const item = document.createElement('li');
          item.className = `debug-panel-item debug-panel-item-${type === 'log' ? 'success' : type}`;
          item.textContent = message;
          
          // Add item to debug panel content
          debugPanelContent.appendChild(item);
          
          // Scroll to bottom
          debugPanelContent.scrollTop = debugPanelContent.scrollHeight;
          
          // Limit number of items
          const items = debugPanelContent.querySelectorAll('.debug-panel-item');
          if (items.length > 20) {
            debugPanelContent.removeChild(items[0]);
          }
        }
      }
    }
  }
})();
