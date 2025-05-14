/**
 * Sidebar Navigation Component
 *
 * This script handles the sidebar navigation functionality, including:
 * - Highlighting the active link based on the current page
 * - Handling responsive sidebar behavior
 */

document.addEventListener('DOMContentLoaded', function() {
  // Set active link based on current page
  setActiveSidebarLink();

  // Add event listeners for responsive sidebar
  setupResponsiveSidebar();
});

/**
 * Set the active link in the sidebar based on the current page
 */
function setActiveSidebarLink() {
  // Get the current page path
  const currentPath = window.location.pathname;

  console.log('Current path:', currentPath);

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

  // Add click event listeners to all sidebar links
  document.querySelectorAll('.sidebar-nav a').forEach(link => {
    // Remove existing event listeners
    link.removeEventListener('click', handleSidebarLinkClick);

    // Add new event listener
    link.addEventListener('click', handleSidebarLinkClick);
  });
}

/**
 * Handle sidebar link click
 * @param {Event} event - Click event
 */
function handleSidebarLinkClick(event) {
  const href = event.currentTarget.getAttribute('href');
  console.log('Sidebar link clicked:', href);

  // Prevent default behavior to handle navigation manually
  event.preventDefault();

  // Use the router's navigateTo function if available
  if (window.navigateTo) {
    window.navigateTo(href);
  } else {
    // Fallback if router is not loaded
    console.warn('Router not loaded, using default navigation');
    window.location.href = href;
  }
}

/**
 * Set up responsive sidebar behavior
 */
function setupResponsiveSidebar() {
  // Add toggle button for mobile view
  const sidebar = document.querySelector('.sidebar');
  const mainContent = document.querySelector('.main-content');

  // Create toggle button
  const toggleButton = document.createElement('button');
  toggleButton.className = 'sidebar-toggle';
  toggleButton.innerHTML = '☰';
  toggleButton.setAttribute('aria-label', 'Toggle Sidebar');

  // Add toggle button to the page
  document.querySelector('.findoc-layout').appendChild(toggleButton);

  // Add toggle functionality
  toggleButton.addEventListener('click', function() {
    sidebar.classList.toggle('sidebar-open');
  });

  // Close sidebar when clicking on main content (mobile only)
  mainContent.addEventListener('click', function() {
    if (window.innerWidth <= 768 && sidebar.classList.contains('sidebar-open')) {
      sidebar.classList.remove('sidebar-open');
    }
  });

  // Add CSS for responsive sidebar
  const style = document.createElement('style');
  style.textContent = `
    .sidebar-toggle {
      display: none;
      position: fixed;
      top: 10px;
      left: 10px;
      z-index: 1000;
      background-color: #2c3e50;
      color: white;
      border: none;
      border-radius: 4px;
      padding: 8px 12px;
      font-size: 20px;
      cursor: pointer;
    }

    @media (max-width: 768px) {
      .sidebar {
        transform: translateX(-100%);
        transition: transform 0.3s ease;
      }

      .sidebar-open {
        transform: translateX(0);
      }

      .sidebar-toggle {
        display: block;
      }

      .main-content {
        margin-left: 0;
        width: 100%;
      }
    }
  `;

  document.head.appendChild(style);
}
