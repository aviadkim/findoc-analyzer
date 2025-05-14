/**
 * Route Fix Script
 * This script fixes the routing issue where the path is undefined
 */

document.addEventListener('DOMContentLoaded', function() {
  console.log('Route fix script loaded');
  
  // Fix for undefined path issue
  const fixRouting = function() {
    // Check if the current path is undefined
    if (window.location.pathname === '/undefined') {
      console.log('Detected /undefined path, redirecting to home page');
      
      // Redirect to home page
      if (typeof navigateTo === 'function') {
        navigateTo('/');
      } else {
        window.location.href = '/';
      }
    }
    
    // Fix sidebar active link when path is undefined
    const setActiveSidebarLinkOriginal = window.setActiveSidebarLink;
    
    if (typeof setActiveSidebarLinkOriginal === 'function') {
      window.setActiveSidebarLink = function() {
        // Get the current page path
        let currentPath = window.location.pathname;
        
        // Fix undefined path
        if (currentPath === '/undefined') {
          currentPath = '/';
        }
        
        console.log('Fixed current path:', currentPath);
        
        // Remove active class from all links
        document.querySelectorAll('.sidebar-nav a').forEach(link => {
          link.classList.remove('active');
        });
        
        // Add active class to the current page link
        let activeLink = null;
        
        // Handle special cases
        if (currentPath === '/' || currentPath === '/index.html') {
          activeLink = document.querySelector('.sidebar-nav a[href="/"]');
        } else if (currentPath.includes('document-details.html')) {
          // For document details page, highlight the documents link
          activeLink = document.querySelector('.sidebar-nav a[href="/documents-new"]');
        } else {
          // For other pages, find the matching link
          activeLink = document.querySelector(`.sidebar-nav a[href="${currentPath}"]`);
          
          // If no exact match, try to match by partial path
          if (!activeLink) {
            document.querySelectorAll('.sidebar-nav a').forEach(link => {
              const href = link.getAttribute('href');
              if (currentPath.includes(href) && href !== '/') {
                activeLink = link;
              }
            });
          }
        }
        
        // Set the active class
        if (activeLink) {
          activeLink.classList.add('active');
          console.log('Active link set to:', activeLink.getAttribute('href'));
        } else {
          console.warn('No active link found for path:', currentPath);
        }
      };
    }
  };
  
  // Fix router's handleRoute function
  const fixRouterHandleRoute = function() {
    if (typeof handleRoute === 'function') {
      const originalHandleRoute = handleRoute;
      
      window.handleRoute = function(path) {
        // Fix undefined path
        if (path === '/undefined') {
          path = '/';
        }
        
        console.log('Fixed handleRoute path:', path);
        
        // Call original function with fixed path
        return originalHandleRoute(path);
      };
    }
  };
  
  // Apply fixes
  fixRouting();
  fixRouterHandleRoute();
  
  // Fix initial route if needed
  if (window.location.pathname === '/undefined') {
    if (typeof handleRoute === 'function') {
      handleRoute('/');
    }
  }
});
