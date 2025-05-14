/**
 * ResponsiveWrapper Component
 * 
 * This component provides a wrapper for other components to make them
 * responsive across different device sizes.
 * 
 * Usage:
 * <ResponsiveWrapper>
 *   <YourComponent />
 * </ResponsiveWrapper>
 */

class ResponsiveWrapper {
  /**
   * Create a new ResponsiveWrapper instance
   * @param {Object} options - Configuration options
   * @param {boolean} options.mobileFirst - Whether to use mobile-first approach
   * @param {Object} options.breakpoints - Custom breakpoints
   */
  constructor(options = {}) {
    this.options = {
      mobileFirst: true,
      breakpoints: {
        xs: 0,
        sm: 576,
        md: 768,
        lg: 992,
        xl: 1200,
        xxl: 1400
      },
      ...options
    };
    
    this.currentBreakpoint = this.getCurrentBreakpoint();
    this.initialized = false;
    
    // Bind methods
    this.init = this.init.bind(this);
    this.handleResize = this.handleResize.bind(this);
    this.wrap = this.wrap.bind(this);
    this.getCurrentBreakpoint = this.getCurrentBreakpoint.bind(this);
    this.isViewport = this.isViewport.bind(this);
  }
  
  /**
   * Initialize the wrapper
   */
  init() {
    if (this.initialized) return;
    
    // Add responsive viewport meta tag if not present
    if (!document.querySelector('meta[name="viewport"]')) {
      const viewportMeta = document.createElement('meta');
      viewportMeta.name = 'viewport';
      viewportMeta.content = 'width=device-width, initial-scale=1.0';
      document.head.appendChild(viewportMeta);
    }
    
    // Add event listener for resize
    window.addEventListener('resize', this.handleResize);
    
    // Add device type class to document body
    this.updateDeviceClass();
    
    this.initialized = true;
  }
  
  /**
   * Handle window resize events
   */
  handleResize() {
    const breakpoint = this.getCurrentBreakpoint();
    
    // Only update if breakpoint changed
    if (breakpoint !== this.currentBreakpoint) {
      this.currentBreakpoint = breakpoint;
      this.updateDeviceClass();
      
      // Dispatch custom event for breakpoint change
      const event = new CustomEvent('breakpointchange', { 
        detail: { 
          breakpoint: this.currentBreakpoint,
          width: window.innerWidth,
          height: window.innerHeight
        } 
      });
      window.dispatchEvent(event);
    }
  }
  
  /**
   * Update device class on document body
   */
  updateDeviceClass() {
    // Remove existing device classes
    document.body.classList.remove('device-mobile', 'device-tablet', 'device-desktop');
    
    // Add appropriate device class
    if (this.currentBreakpoint === 'xs' || this.currentBreakpoint === 'sm') {
      document.body.classList.add('device-mobile');
    } else if (this.currentBreakpoint === 'md') {
      document.body.classList.add('device-tablet');
    } else {
      document.body.classList.add('device-desktop');
    }
    
    // Update breakpoint class
    document.body.classList.forEach(cls => {
      if (cls.startsWith('breakpoint-')) {
        document.body.classList.remove(cls);
      }
    });
    document.body.classList.add(`breakpoint-${this.currentBreakpoint}`);
  }
  
  /**
   * Get current breakpoint based on window width
   * @returns {string} Current breakpoint name (xs, sm, md, lg, xl, xxl)
   */
  getCurrentBreakpoint() {
    const width = window.innerWidth;
    const { breakpoints } = this.options;
    
    if (width < breakpoints.sm) return 'xs';
    if (width < breakpoints.md) return 'sm';
    if (width < breakpoints.lg) return 'md';
    if (width < breakpoints.xl) return 'lg';
    if (width < breakpoints.xxl) return 'xl';
    return 'xxl';
  }
  
  /**
   * Check if current viewport matches a specific breakpoint
   * @param {string} breakpoint - Breakpoint to check
   * @param {string} operator - Comparison operator (up, down, only)
   * @returns {boolean} True if viewport matches the breakpoint condition
   */
  isViewport(breakpoint, operator = 'only') {
    const current = this.getCurrentBreakpoint();
    const breakpoints = ['xs', 'sm', 'md', 'lg', 'xl', 'xxl'];
    const currentIndex = breakpoints.indexOf(current);
    const targetIndex = breakpoints.indexOf(breakpoint);
    
    if (operator === 'up') {
      return currentIndex >= targetIndex;
    } else if (operator === 'down') {
      return currentIndex <= targetIndex;
    } else if (operator === 'only') {
      return current === breakpoint;
    } else {
      console.error(`Invalid operator: ${operator}. Use 'up', 'down', or 'only'.`);
      return false;
    }
  }
  
  /**
   * Wrap an element with responsive features
   * @param {HTMLElement} element - Element to wrap
   * @returns {HTMLElement} The wrapped element
   */
  wrap(element) {
    if (!this.initialized) {
      this.init();
    }
    
    // Check if element is already wrapped
    if (element.dataset.responsiveWrapped) {
      return element;
    }
    
    // Mark element as wrapped
    element.dataset.responsiveWrapped = 'true';
    element.classList.add('responsive-element');
    
    // Apply responsive classes based on element type
    if (element.tagName === 'TABLE') {
      this.makeTableResponsive(element);
    } else if (element.tagName === 'FORM') {
      this.makeFormResponsive(element);
    } else if (element.classList.contains('findoc-layout')) {
      this.makeLayoutResponsive(element);
    } else if (element.classList.contains('dashboard-cards')) {
      this.makeDashboardResponsive(element);
    } else if (element.classList.contains('document-item')) {
      this.makeDocumentItemResponsive(element);
    } else if (element.classList.contains('chat-container')) {
      this.makeChatResponsive(element);
    }
    
    return element;
  }
  
  /**
   * Make a table element responsive
   * @param {HTMLElement} table - Table element
   */
  makeTableResponsive(table) {
    // Add responsive table wrapper if not already present
    if (!table.parentElement.classList.contains('table-responsive')) {
      const wrapper = document.createElement('div');
      wrapper.className = 'table-responsive';
      table.parentNode.insertBefore(wrapper, table);
      wrapper.appendChild(table);
    }
    
    // Add data attributes for mobile view
    const headers = Array.from(table.querySelectorAll('th')).map(th => th.textContent.trim());
    
    if (headers.length) {
      const rows = table.querySelectorAll('tbody tr');
      
      rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        cells.forEach((cell, index) => {
          if (headers[index]) {
            cell.setAttribute('data-label', headers[index]);
          }
        });
      });
    }
    
    table.classList.add('table');
  }
  
  /**
   * Make a form element responsive
   * @param {HTMLElement} form - Form element
   */
  makeFormResponsive(form) {
    // Make form elements touch-friendly
    const formElements = form.querySelectorAll('input, select, textarea, button');
    
    formElements.forEach(element => {
      // Add touch-friendly classes
      element.classList.add('touch-friendly');
      
      // For small screens, ensure adequate size for touch
      if (this.isViewport('xs') || this.isViewport('sm')) {
        element.style.minHeight = '44px';
        
        // For input elements, ensure large enough font to prevent zoom
        if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
          element.style.fontSize = '16px';
        }
      }
      
      // Wrap checkbox and radio inputs
      if (element.type === 'checkbox' || element.type === 'radio') {
        const wrapper = document.createElement('div');
        wrapper.className = element.type === 'checkbox' ? 'touch-friendly-checkbox' : 'touch-friendly-radio';
        
        // Get the element's parent and label
        const parent = element.parentElement;
        const label = parent.querySelector(`label[for="${element.id}"]`);
        
        // If there's a label, include it in the wrapper
        if (label) {
          element.parentNode.insertBefore(wrapper, element);
          wrapper.appendChild(element);
          wrapper.appendChild(label);
        }
      }
    });
    
    // Handle file inputs specially
    const fileInputs = form.querySelectorAll('input[type="file"]');
    
    fileInputs.forEach(input => {
      if (!input.parentElement.classList.contains('touch-file-input')) {
        const wrapper = document.createElement('div');
        wrapper.className = 'touch-file-input';
        
        const button = document.createElement('div');
        button.className = 'touch-file-btn';
        button.textContent = 'Choose File';
        
        const label = document.createElement('div');
        label.className = 'touch-file-label';
        label.textContent = 'No file chosen';
        
        // Listen for file selection
        input.addEventListener('change', function() {
          if (this.files && this.files.length > 0) {
            label.textContent = this.files[0].name;
          } else {
            label.textContent = 'No file chosen';
          }
        });
        
        input.parentNode.insertBefore(wrapper, input);
        wrapper.appendChild(button);
        wrapper.appendChild(input);
        wrapper.appendChild(label);
      }
    });
  }
  
  /**
   * Make layout responsive
   * @param {HTMLElement} layout - Layout element
   */
  makeLayoutResponsive(layout) {
    const sidebar = layout.querySelector('.sidebar');
    const mainContent = layout.querySelector('.main-content');
    
    if (sidebar && mainContent) {
      // Create sidebar toggle if not exists
      if (!document.querySelector('.sidebar-toggle')) {
        const sidebarToggle = document.createElement('button');
        sidebarToggle.className = 'sidebar-toggle';
        sidebarToggle.setAttribute('aria-label', 'Toggle sidebar navigation');
        sidebarToggle.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        `;
        document.body.appendChild(sidebarToggle);
        
        // Toggle sidebar on click
        sidebarToggle.addEventListener('click', function() {
          sidebar.classList.toggle('active');
          
          // Add/remove overlay on mobile
          if (window.innerWidth < 992) {
            if (sidebar.classList.contains('active')) {
              addSidebarOverlay();
            } else {
              removeSidebarOverlay();
            }
          }
        });
      }
      
      // Create mobile bottom navigation for small screens
      if (!document.querySelector('.mobile-bottom-nav') && (this.isViewport('xs') || this.isViewport('sm'))) {
        this.createMobileBottomNav(sidebar);
      }
    }
  }
  
  /**
   * Create mobile bottom navigation bar
   * @param {HTMLElement} sidebar - Sidebar element with navigation links
   */
  createMobileBottomNav(sidebar) {
    // Get main navigation items from sidebar
    const navItems = sidebar.querySelectorAll('.sidebar-nav a');
    if (navItems.length === 0) return;
    
    // Create bottom navigation
    const bottomNav = document.createElement('div');
    bottomNav.className = 'mobile-bottom-nav';
    
    // Add up to 5 main navigation items
    const maxItems = Math.min(5, navItems.length);
    for (let i = 0; i < maxItems; i++) {
      const item = navItems[i];
      const iconEl = item.querySelector('.icon');
      const icon = iconEl ? iconEl.textContent : '📄';
      const label = item.textContent.replace(icon, '').trim();
      
      const navItem = document.createElement('a');
      navItem.href = item.href;
      navItem.className = 'mobile-nav-item';
      if (item.classList.contains('active')) {
        navItem.classList.add('active');
      }
      
      navItem.innerHTML = `
        <div class="mobile-nav-icon">${icon}</div>
        <div class="mobile-nav-label">${label}</div>
      `;
      
      bottomNav.appendChild(navItem);
    }
    
    document.body.appendChild(bottomNav);
  }
  
  /**
   * Make dashboard responsive
   * @param {HTMLElement} dashboard - Dashboard element
   */
  makeDashboardResponsive(dashboard) {
    // Add responsive classes to cards based on viewport
    const cards = dashboard.querySelectorAll('.dashboard-card');
    
    if (this.isViewport('xs') || this.isViewport('sm')) {
      // Stack cards vertically on mobile
      dashboard.style.gridTemplateColumns = 'repeat(1, 1fr)';
    } else if (this.isViewport('md')) {
      // Two columns on tablet
      dashboard.style.gridTemplateColumns = 'repeat(2, 1fr)';
    }
    
    // Make card actions more touch-friendly
    cards.forEach(card => {
      const actions = card.querySelector('.dashboard-card-actions');
      if (actions) {
        actions.querySelectorAll('.btn').forEach(btn => {
          btn.classList.add('touch-friendly');
        });
      }
    });
  }
  
  /**
   * Make document item responsive
   * @param {HTMLElement} item - Document item element
   */
  makeDocumentItemResponsive(item) {
    if (this.isViewport('xs') || this.isViewport('sm')) {
      // Add mobile-specific document item class
      item.classList.add('document-item-compact');
      
      // Reorder elements if needed
      const info = item.querySelector('.document-info');
      const actions = item.querySelector('.document-actions');
      
      if (info && actions && actions.previousElementSibling !== info) {
        item.appendChild(info);
        item.appendChild(actions);
      }
    }
  }
  
  /**
   * Make chat interface responsive
   * @param {HTMLElement} chatContainer - Chat container element
   */
  makeChatResponsive(chatContainer) {
    // Adjust height on mobile
    if (this.isViewport('xs') || this.isViewport('sm')) {
      const chat = chatContainer.querySelector('.chat');
      if (chat) {
        chat.style.height = '75vh';
      }
      
      // Ensure messages aren't too wide
      const messages = chatContainer.querySelectorAll('.message');
      messages.forEach(message => {
        message.style.maxWidth = '90%';
      });
      
      // Add touch-scroll
      const chatMessages = chatContainer.querySelector('.chat-messages');
      if (chatMessages) {
        chatMessages.classList.add('touch-scroll');
        
        // Ensure chat scrolls to bottom when messages are added
        const observer = new MutationObserver(mutations => {
          mutations.forEach(mutation => {
            if (mutation.type === 'childList' && mutation.addedNodes.length) {
              chatMessages.scrollTop = chatMessages.scrollHeight;
            }
          });
        });
        
        observer.observe(chatMessages, { childList: true });
      }
      
      // Make input larger for touch
      const input = chatContainer.querySelector('input');
      if (input) {
        input.style.fontSize = '16px';
        input.style.minHeight = '44px';
      }
    }
  }
}

// Add sidebar overlay function
function addSidebarOverlay() {
  if (!document.querySelector('.sidebar-overlay')) {
    const overlay = document.createElement('div');
    overlay.className = 'sidebar-overlay';
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.right = '0';
    overlay.style.bottom = '0';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    overlay.style.zIndex = '999';
    overlay.style.transition = 'opacity 0.3s ease';
    overlay.style.opacity = '0';
    
    // Add click event to close sidebar
    overlay.addEventListener('click', function() {
      const sidebar = document.querySelector('.sidebar');
      if (sidebar) {
        sidebar.classList.remove('active');
      }
      removeSidebarOverlay();
    });
    
    document.body.appendChild(overlay);
    
    // Fade in overlay
    setTimeout(() => {
      overlay.style.opacity = '1';
    }, 10);
  }
}

// Remove sidebar overlay function
function removeSidebarOverlay() {
  const overlay = document.querySelector('.sidebar-overlay');
  if (overlay) {
    // Fade out before removing
    overlay.style.opacity = '0';
    setTimeout(() => {
      overlay.parentNode.removeChild(overlay);
    }, 300);
  }
}

// Create and export singleton instance
const responsiveWrapper = new ResponsiveWrapper();

// Initialize on DOM loaded
document.addEventListener('DOMContentLoaded', function() {
  responsiveWrapper.init();
  
  // Auto-wrap known responsive components
  document.querySelectorAll('.findoc-layout, .dashboard-cards, table:not(.table-simple), form, .document-item, .chat-container').forEach(element => {
    responsiveWrapper.wrap(element);
  });
});

// Export the responsive wrapper
if (typeof module !== 'undefined' && module.exports) {
  module.exports = responsiveWrapper;
} else {
  window.responsiveWrapper = responsiveWrapper;
}