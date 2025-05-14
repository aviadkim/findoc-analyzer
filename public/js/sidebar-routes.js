/**
 * Sidebar Routes Configuration
 * 
 * This script defines the routes for the sidebar navigation.
 * It dynamically creates the sidebar links based on the routes configuration.
 */

document.addEventListener('DOMContentLoaded', function() {
  // Define routes
  const routes = [
    { path: '/', label: 'Dashboard', icon: '🏠' },
    { path: '/documents-new', label: 'Documents', icon: '📄' },
    { path: '/analytics-new', label: 'Analytics', icon: '📊' },
    { path: '/upload', label: 'Upload', icon: '📤' },
    { path: '/chat', label: 'Chat', icon: '💬' },
    { path: '/document-chat', label: 'Document Chat', icon: '💬' },
    { path: '/document-comparison', label: 'Document Comparison', icon: '🔄' },
    { path: '/portfolio-comparison', label: 'Portfolio Comparison', icon: '📈' },
    { path: '/user-dashboard', label: 'My Account', icon: '👤' },
    { path: '/api-key-test', label: 'API Key Test', icon: '🔑' },
    { path: '/admin/subscription-management', label: 'Subscription Management', icon: '⚙️', admin: true },
    { path: '/feedback', label: 'Feedback', icon: '📝' }
  ];
  
  // Create sidebar navigation
  createSidebarNavigation(routes);
});

/**
 * Create sidebar navigation based on routes
 * @param {Array} routes - Array of route objects
 */
function createSidebarNavigation(routes) {
  const sidebarNav = document.querySelector('.sidebar-nav');
  
  // If sidebar navigation doesn't exist, create it
  if (!sidebarNav) {
    console.warn('Sidebar navigation not found, creating it');
    
    // Create sidebar if it doesn't exist
    let sidebar = document.querySelector('.sidebar');
    if (!sidebar) {
      sidebar = document.createElement('aside');
      sidebar.className = 'sidebar';
      
      // Create sidebar header
      const sidebarHeader = document.createElement('div');
      sidebarHeader.className = 'sidebar-header';
      sidebarHeader.innerHTML = '<a href="/" class="sidebar-logo">FinDoc Analyzer</a>';
      
      sidebar.appendChild(sidebarHeader);
      
      // Add sidebar to layout
      const layout = document.querySelector('.findoc-layout');
      if (layout) {
        layout.insertBefore(sidebar, layout.firstChild);
      } else {
        // Create layout if it doesn't exist
        const layout = document.createElement('div');
        layout.className = 'findoc-layout';
        
        // Move body content to main content
        const mainContent = document.createElement('main');
        mainContent.className = 'main-content';
        
        // Move all body children to main content
        while (document.body.firstChild) {
          mainContent.appendChild(document.body.firstChild);
        }
        
        layout.appendChild(sidebar);
        layout.appendChild(mainContent);
        document.body.appendChild(layout);
      }
    }
    
    // Create sidebar navigation
    const nav = document.createElement('ul');
    nav.className = 'sidebar-nav';
    sidebar.appendChild(nav);
    
    // Update sidebarNav reference
    sidebarNav = nav;
  }
  
  // Clear existing navigation
  sidebarNav.innerHTML = '';
  
  // Check if user is admin
  const isAdmin = checkIfUserIsAdmin();
  
  // Add routes to navigation
  routes.forEach(route => {
    // Skip admin routes if user is not admin
    if (route.admin && !isAdmin) {
      return;
    }
    
    const li = document.createElement('li');
    li.innerHTML = `<a href="${route.path}"><span class="icon">${route.icon}</span>${route.label}</a>`;
    sidebarNav.appendChild(li);
  });
  
  // Set active link
  if (typeof setActiveSidebarLink === 'function') {
    setActiveSidebarLink();
  }
}

/**
 * Check if the current user is an admin
 * @returns {boolean} - True if user is admin, false otherwise
 */
function checkIfUserIsAdmin() {
  // Check if auth is available
  if (window.auth && window.auth.currentUser) {
    // Check if user has admin role
    return window.auth.currentUser.role === 'admin';
  }
  
  // Check if tenant manager is available
  if (window.tenantManager && window.tenantManager.currentTenant) {
    // Check if tenant has admin role
    return window.tenantManager.currentTenant.role === 'admin';
  }
  
  // Default to false
  return false;
}
