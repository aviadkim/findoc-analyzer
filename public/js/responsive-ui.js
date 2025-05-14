/**
 * FinDoc Analyzer Responsive UI
 * 
 * This script adds responsive behavior to the application UI
 * and handles touch-friendly interactions for mobile/tablet devices.
 */

document.addEventListener('DOMContentLoaded', function() {
  console.log('Responsive UI initializing...');
  
  // Initialize responsive components
  initSidebar();
  initResponsiveBreakpoints();
  initTouchFriendlyComponents();
  
  console.log('Responsive UI initialized');
});

/**
 * Initialize responsive sidebar with toggle functionality
 */
function initSidebar() {
  // Create sidebar toggle button if it doesn't exist
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
    
    // Add click event to toggle sidebar
    sidebarToggle.addEventListener('click', toggleSidebar);
  }
  
  // Add swipe gestures for mobile devices
  initSwipeGestures();
  
  // Add resize listener to handle window size changes
  window.addEventListener('resize', handleResize);
  
  // Initial call to set correct states
  handleResize();
}

/**
 * Toggle sidebar visibility
 */
function toggleSidebar() {
  const sidebar = document.querySelector('.sidebar');
  const mainContent = document.querySelector('.main-content');
  
  if (sidebar) {
    sidebar.classList.toggle('active');
    
    // Add overlay for mobile when sidebar is active
    if (window.innerWidth < 992) {
      if (sidebar.classList.contains('active')) {
        addSidebarOverlay();
      } else {
        removeSidebarOverlay();
      }
    }
  }
  
  // Toggle main content on desktop
  if (window.innerWidth >= 992 && mainContent) {
    if (sidebar && sidebar.classList.contains('collapsed')) {
      mainContent.classList.add('expanded');
    } else {
      mainContent.classList.remove('expanded');
    }
  }
}

/**
 * Add overlay behind sidebar for mobile views
 */
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
    overlay.addEventListener('click', toggleSidebar);
    
    document.body.appendChild(overlay);
    
    // Fade in overlay
    setTimeout(() => {
      overlay.style.opacity = '1';
    }, 10);
  }
}

/**
 * Remove sidebar overlay
 */
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

/**
 * Initialize swipe gestures for mobile devices
 */
function initSwipeGestures() {
  let touchStartX = 0;
  let touchEndX = 0;
  
  // Handle touch start
  document.addEventListener('touchstart', e => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });
  
  // Handle touch end
  document.addEventListener('touchend', e => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  }, { passive: true });
  
  // Process swipe direction
  function handleSwipe() {
    const sidebar = document.querySelector('.sidebar');
    if (!sidebar) return;
    
    // Only apply swipe gestures on mobile
    if (window.innerWidth >= 992) return;
    
    const swipeDistance = touchEndX - touchStartX;
    const threshold = 100; // Minimum distance to register as a swipe
    
    if (swipeDistance > threshold) {
      // Right swipe - open sidebar
      if (!sidebar.classList.contains('active')) {
        toggleSidebar();
      }
    } else if (swipeDistance < -threshold) {
      // Left swipe - close sidebar
      if (sidebar.classList.contains('active')) {
        toggleSidebar();
      }
    }
  }
}

/**
 * Handle window resize events
 */
function handleResize() {
  const sidebar = document.querySelector('.sidebar');
  const sidebarToggle = document.querySelector('.sidebar-toggle');
  const overlay = document.querySelector('.sidebar-overlay');
  
  // Remove overlay if window is resized to desktop
  if (window.innerWidth >= 992 && overlay) {
    overlay.parentNode.removeChild(overlay);
  }
  
  // Show toggle button on mobile, hide on desktop
  if (sidebarToggle) {
    sidebarToggle.style.display = window.innerWidth < 992 ? 'flex' : 'none';
  }
  
  // On mobile, sidebar is hidden by default
  if (window.innerWidth < 992 && sidebar) {
    sidebar.classList.remove('active');
  }
}

/**
 * Initialize viewport-specific functionality
 */
function initResponsiveBreakpoints() {
  const currentBreakpoint = getCurrentBreakpoint();
  
  // Add current breakpoint as a class to body
  document.body.classList.add(`breakpoint-${currentBreakpoint}`);
  
  // Initialize viewport-specific features
  if (currentBreakpoint === 'xs' || currentBreakpoint === 'sm') {
    initMobileSpecificFeatures();
  } else if (currentBreakpoint === 'md') {
    initTabletSpecificFeatures();
  }
}

/**
 * Get current breakpoint based on window width
 * @returns {string} Current breakpoint name (xs, sm, md, lg, xl)
 */
function getCurrentBreakpoint() {
  const width = window.innerWidth;
  
  if (width < 576) return 'xs';
  if (width < 768) return 'sm';
  if (width < 992) return 'md';
  if (width < 1200) return 'lg';
  return 'xl';
}

/**
 * Initialize mobile-specific features
 */
function initMobileSpecificFeatures() {
  // Simplify tables for better mobile viewing
  simplifyTables();
  
  // Convert multi-column layouts to single column
  adjustColumnLayouts();
  
  // Make document cards more compact
  compactDocumentCards();
}

/**
 * Initialize tablet-specific features
 */
function initTabletSpecificFeatures() {
  // Optimize forms for touch input
  optimizeFormsForTouch();
  
  // Adjust sidebar to compact mode
  adjustSidebarForTablet();
}

/**
 * Convert complex tables to a more mobile-friendly format
 */
function simplifyTables() {
  const tables = document.querySelectorAll('table:not(.table-simple)');
  
  tables.forEach(table => {
    // Add responsive wrapper if not already present
    if (!table.parentElement.classList.contains('table-responsive')) {
      const wrapper = document.createElement('div');
      wrapper.className = 'table-responsive';
      table.parentNode.insertBefore(wrapper, table);
      wrapper.appendChild(table);
    }
    
    // Add mobile data attributes for responsive display
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
  });
}

/**
 * Adjust column layouts for mobile
 */
function adjustColumnLayouts() {
  // Convert multi-column layouts to single column on mobile
  const rows = document.querySelectorAll('.row');
  
  rows.forEach(row => {
    const columns = row.querySelectorAll('[class*="col-"]');
    
    columns.forEach(column => {
      // Add mobile-specific classes if not present
      if (!column.classList.contains('col-12') && 
          !column.classList.contains('col-sm-12') && 
          !column.classList.contains('col-xs-12')) {
        column.classList.add('col-12');
      }
    });
  });
}

/**
 * Make document cards more compact for mobile
 */
function compactDocumentCards() {
  const documentItems = document.querySelectorAll('.document-item');
  
  documentItems.forEach(item => {
    item.classList.add('document-item-compact');
  });
}

/**
 * Optimize forms for touch input
 */
function optimizeFormsForTouch() {
  const formControls = document.querySelectorAll('input, select, textarea, button, .btn');
  
  formControls.forEach(control => {
    control.classList.add('touch-friendly');
  });
}

/**
 * Adjust sidebar for tablet view
 */
function adjustSidebarForTablet() {
  const sidebar = document.querySelector('.sidebar');
  if (sidebar) {
    sidebar.classList.add('sidebar-tablet');
  }
}

/**
 * Initialize touch-friendly components for mobile/tablet
 */
function initTouchFriendlyComponents() {
  // Add touch-friendly classes to interactive elements
  const touchTargets = document.querySelectorAll('a, button, .btn, input[type="checkbox"], input[type="radio"]');
  
  touchTargets.forEach(target => {
    target.classList.add('touch-target');
  });
  
  // Add double-tap protection for links that show tooltips
  const tooltipLinks = document.querySelectorAll('[data-toggle="tooltip"]');
  
  tooltipLinks.forEach(link => {
    link.addEventListener('touchend', e => {
      if (!link.dataset.tapped) {
        // First tap shows tooltip
        e.preventDefault();
        link.dataset.tapped = true;
        
        // Reset after delay
        setTimeout(() => {
          delete link.dataset.tapped;
        }, 300);
      }
    });
  });
  
  // Enhance form elements for touch devices
  enhanceFormElements();
}

/**
 * Enhance form elements for touch devices
 */
function enhanceFormElements() {
  // Make inputs and selects more touch-friendly
  const formControls = document.querySelectorAll('input[type="text"], input[type="email"], input[type="password"], input[type="number"], select, textarea');
  
  formControls.forEach(control => {
    // Ensure adequate size for touch input
    control.style.minHeight = '44px';
    
    // Prevent iOS zoom on focus
    if (control.tagName === 'INPUT' || control.tagName === 'TEXTAREA') {
      control.style.fontSize = '16px';
    }
  });
  
  // Make custom select dropdowns more mobile-friendly
  const selects = document.querySelectorAll('select');
  
  selects.forEach(select => {
    select.classList.add('mobile-select');
  });
}

/**
 * Enhance chat interface for mobile
 * @param {string} containerId - ID of the chat container element
 */
function enhanceChatForMobile(containerId = 'chat-messages') {
  const chatContainer = document.getElementById(containerId);
  if (!chatContainer) return;
  
  // Add mobile-specific enhancements
  chatContainer.classList.add('chat-mobile');
  
  // Ensure chat is scrolled to bottom when messages are added
  const observer = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
      if (mutation.type === 'childList' && mutation.addedNodes.length) {
        chatContainer.scrollTop = chatContainer.scrollHeight;
      }
    });
  });
  
  observer.observe(chatContainer, { childList: true });
  
  // Handle input field focus (scroll to bottom and fix position)
  const chatInput = document.querySelector('#question-input, .chat-input input');
  
  if (chatInput) {
    chatInput.addEventListener('focus', () => {
      // Scroll chat to bottom when input is focused
      chatContainer.scrollTop = chatContainer.scrollHeight;
      
      // Delay to allow virtual keyboard to appear before scrolling
      setTimeout(() => {
        chatContainer.scrollTop = chatContainer.scrollHeight;
      }, 300);
    });
  }
}

/**
 * Public API for responsive UI
 */
window.responsiveUI = {
  enhanceChatForMobile: enhanceChatForMobile,
  toggleSidebar: toggleSidebar,
  getBreakpoint: getCurrentBreakpoint
};