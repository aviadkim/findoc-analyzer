/**
 * HTML Injector
 * Injects HTML elements into the page
 */

class HTMLInjector {
  /**
   * Constructor
   */
  constructor() {
    this.initialized = false;
  }
  
  /**
   * Initialize the injector
   */
  initialize() {
    if (this.initialized) {
      return;
    }
    
    console.log('HTML Injector initializing...');
    
    // Load UI components
    this.loadScript('/js/ui-components-simple.js');
    
    this.initialized = true;
    console.log('HTML Injector initialized');
  }
  
  /**
   * Load a script
   * @param {string} src - Script source
   */
  loadScript(src) {
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    document.head.appendChild(script);
    console.log(`Script loaded: ${src}`);
  }
}

// Create and initialize the injector
const htmlInjector = new HTMLInjector();
htmlInjector.initialize();
