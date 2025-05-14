/**
 * MobileDocumentViewer Component
 * 
 * A touch-optimized document viewer component for mobile and tablet devices.
 * Provides gesture controls, zoom functionality, and efficient rendering of large documents.
 */

class MobileDocumentViewer {
  /**
   * Create a new MobileDocumentViewer
   * @param {Object} options - Configuration options
   * @param {HTMLElement} options.container - Container element for the viewer
   * @param {string} options.documentId - ID of the document to view
   * @param {string} options.documentUrl - URL to the document content
   * @param {string} options.documentType - Type of document (pdf, html, image, etc.)
   * @param {boolean} options.enableGestures - Whether to enable touch gestures (default: true)
   * @param {number} options.initialZoom - Initial zoom level (default: 1)
   */
  constructor(options = {}) {
    this.options = {
      container: null,
      documentId: null,
      documentUrl: null,
      documentType: 'pdf',
      enableGestures: true,
      initialZoom: 1,
      ...options
    };
    
    // State variables
    this.isInitialized = false;
    this.currentPage = 1;
    this.totalPages = 1;
    this.zoom = this.options.initialZoom;
    this.originalWidth = 0;
    this.originalHeight = 0;
    this.containerWidth = 0;
    this.containerHeight = 0;
    this.isLoading = false;
    this.viewerElement = null;
    this.documentContent = null;
    
    // For touch navigation
    this.touchStartX = 0;
    this.touchStartY = 0;
    this.touchEndX = 0;
    this.touchEndY = 0;
    this.touchMoveX = 0;
    this.touchMoveY = 0;
    this.isDragging = false;
    this.lastTouchTime = 0;
    this.lastPinchDistance = 0;
    this.isPinching = false;
    
    // Bind methods
    this.init = this.init.bind(this);
    this.loadDocument = this.loadDocument.bind(this);
    this.render = this.render.bind(this);
    this.handleTouchStart = this.handleTouchStart.bind(this);
    this.handleTouchMove = this.handleTouchMove.bind(this);
    this.handleTouchEnd = this.handleTouchEnd.bind(this);
    this.handleDoubleTap = this.handleDoubleTap.bind(this);
    this.handlePinch = this.handlePinch.bind(this);
    this.zoomIn = this.zoomIn.bind(this);
    this.zoomOut = this.zoomOut.bind(this);
    this.resetZoom = this.resetZoom.bind(this);
    this.nextPage = this.nextPage.bind(this);
    this.prevPage = this.prevPage.bind(this);
    this.goToPage = this.goToPage.bind(this);
    this.resize = this.resize.bind(this);
  }
  
  /**
   * Initialize the viewer
   * @returns {boolean} Whether initialization was successful
   */
  init() {
    if (this.isInitialized) return true;
    
    const { container } = this.options;
    
    // Check if container is valid
    if (!container || !(container instanceof HTMLElement)) {
      console.error('MobileDocumentViewer: Invalid container element');
      return false;
    }
    
    // Create main viewer element
    this.viewerElement = document.createElement('div');
    this.viewerElement.className = 'mobile-document-viewer';
    this.viewerElement.style.position = 'relative';
    this.viewerElement.style.width = '100%';
    this.viewerElement.style.height = '100%';
    this.viewerElement.style.overflow = 'hidden';
    this.viewerElement.style.backgroundColor = '#f0f0f0';
    this.viewerElement.style.touchAction = 'none'; // Disable browser's handling of touch gestures
    
    // Create document container
    this.documentContent = document.createElement('div');
    this.documentContent.className = 'document-content';
    this.documentContent.style.transformOrigin = '0 0';
    this.documentContent.style.transition = 'transform 0.1s ease';
    this.documentContent.style.width = '100%';
    this.documentContent.style.height = '100%';
    this.documentContent.style.position = 'absolute';
    this.viewerElement.appendChild(this.documentContent);
    
    // Create loading indicator
    this.loadingIndicator = document.createElement('div');
    this.loadingIndicator.className = 'document-loading';
    this.loadingIndicator.innerHTML = `
      <div class="loading-spinner">
        <div></div><div></div><div></div><div></div>
      </div>
      <div class="loading-text">Loading document...</div>
    `;
    this.loadingIndicator.style.position = 'absolute';
    this.loadingIndicator.style.top = '0';
    this.loadingIndicator.style.left = '0';
    this.loadingIndicator.style.right = '0';
    this.loadingIndicator.style.bottom = '0';
    this.loadingIndicator.style.display = 'flex';
    this.loadingIndicator.style.flexDirection = 'column';
    this.loadingIndicator.style.alignItems = 'center';
    this.loadingIndicator.style.justifyContent = 'center';
    this.loadingIndicator.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
    this.loadingIndicator.style.zIndex = '100';
    this.viewerElement.appendChild(this.loadingIndicator);
    
    // Create controls overlay
    this.createControls();
    
    // Add to container
    container.appendChild(this.viewerElement);
    
    // Calculate container dimensions
    this.resize();
    
    // Add event listeners
    if (this.options.enableGestures) {
      this.viewerElement.addEventListener('touchstart', this.handleTouchStart, { passive: false });
      this.viewerElement.addEventListener('touchmove', this.handleTouchMove, { passive: false });
      this.viewerElement.addEventListener('touchend', this.handleTouchEnd, { passive: false });
    }
    
    // Add resize event listener
    window.addEventListener('resize', this.resize);
    
    // Load document if URL is provided
    if (this.options.documentUrl) {
      this.loadDocument(this.options.documentUrl);
    }
    
    this.isInitialized = true;
    return true;
  }
  
  /**
   * Create viewer controls
   */
  createControls() {
    // Create bottom controls
    this.controls = document.createElement('div');
    this.controls.className = 'document-controls';
    this.controls.style.position = 'absolute';
    this.controls.style.bottom = '0';
    this.controls.style.left = '0';
    this.controls.style.right = '0';
    this.controls.style.display = 'flex';
    this.controls.style.justifyContent = 'space-between';
    this.controls.style.padding = '10px';
    this.controls.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
    this.controls.style.zIndex = '50';
    this.controls.style.transition = 'transform 0.3s ease';
    
    // Page navigation controls
    this.pageControls = document.createElement('div');
    this.pageControls.className = 'page-controls';
    this.pageControls.style.display = 'flex';
    this.pageControls.style.alignItems = 'center';
    
    // Previous page button
    this.prevButton = document.createElement('button');
    this.prevButton.className = 'control-button prev-page';
    this.prevButton.innerHTML = '◀';
    this.prevButton.style.width = '40px';
    this.prevButton.style.height = '40px';
    this.prevButton.style.border = 'none';
    this.prevButton.style.borderRadius = '50%';
    this.prevButton.style.backgroundColor = '#3498db';
    this.prevButton.style.color = 'white';
    this.prevButton.style.fontSize = '18px';
    this.prevButton.style.margin = '0 5px';
    this.prevButton.addEventListener('click', this.prevPage);
    this.pageControls.appendChild(this.prevButton);
    
    // Page indicator
    this.pageIndicator = document.createElement('div');
    this.pageIndicator.className = 'page-indicator';
    this.pageIndicator.textContent = `${this.currentPage} / ${this.totalPages}`;
    this.pageIndicator.style.margin = '0 10px';
    this.pageIndicator.style.fontSize = '16px';
    this.pageControls.appendChild(this.pageIndicator);
    
    // Next page button
    this.nextButton = document.createElement('button');
    this.nextButton.className = 'control-button next-page';
    this.nextButton.innerHTML = '▶';
    this.nextButton.style.width = '40px';
    this.nextButton.style.height = '40px';
    this.nextButton.style.border = 'none';
    this.nextButton.style.borderRadius = '50%';
    this.nextButton.style.backgroundColor = '#3498db';
    this.nextButton.style.color = 'white';
    this.nextButton.style.fontSize = '18px';
    this.nextButton.style.margin = '0 5px';
    this.nextButton.addEventListener('click', this.nextPage);
    this.pageControls.appendChild(this.nextButton);
    
    // Zoom controls
    this.zoomControls = document.createElement('div');
    this.zoomControls.className = 'zoom-controls';
    this.zoomControls.style.display = 'flex';
    this.zoomControls.style.alignItems = 'center';
    
    // Zoom out button
    this.zoomOutButton = document.createElement('button');
    this.zoomOutButton.className = 'control-button zoom-out';
    this.zoomOutButton.innerHTML = '−';
    this.zoomOutButton.style.width = '40px';
    this.zoomOutButton.style.height = '40px';
    this.zoomOutButton.style.border = 'none';
    this.zoomOutButton.style.borderRadius = '50%';
    this.zoomOutButton.style.backgroundColor = '#3498db';
    this.zoomOutButton.style.color = 'white';
    this.zoomOutButton.style.fontSize = '20px';
    this.zoomOutButton.style.margin = '0 5px';
    this.zoomOutButton.addEventListener('click', this.zoomOut);
    this.zoomControls.appendChild(this.zoomOutButton);
    
    // Reset zoom button
    this.resetZoomButton = document.createElement('button');
    this.resetZoomButton.className = 'control-button reset-zoom';
    this.resetZoomButton.innerHTML = '◎';
    this.resetZoomButton.style.width = '40px';
    this.resetZoomButton.style.height = '40px';
    this.resetZoomButton.style.border = 'none';
    this.resetZoomButton.style.borderRadius = '50%';
    this.resetZoomButton.style.backgroundColor = '#3498db';
    this.resetZoomButton.style.color = 'white';
    this.resetZoomButton.style.fontSize = '18px';
    this.resetZoomButton.style.margin = '0 5px';
    this.resetZoomButton.addEventListener('click', this.resetZoom);
    this.zoomControls.appendChild(this.resetZoomButton);
    
    // Zoom in button
    this.zoomInButton = document.createElement('button');
    this.zoomInButton.className = 'control-button zoom-in';
    this.zoomInButton.innerHTML = '+';
    this.zoomInButton.style.width = '40px';
    this.zoomInButton.style.height = '40px';
    this.zoomInButton.style.border = 'none';
    this.zoomInButton.style.borderRadius = '50%';
    this.zoomInButton.style.backgroundColor = '#3498db';
    this.zoomInButton.style.color = 'white';
    this.zoomInButton.style.fontSize = '20px';
    this.zoomInButton.style.margin = '0 5px';
    this.zoomInButton.addEventListener('click', this.zoomIn);
    this.zoomControls.appendChild(this.zoomInButton);
    
    // Add controls to the viewer
    this.controls.appendChild(this.pageControls);
    this.controls.appendChild(this.zoomControls);
    this.viewerElement.appendChild(this.controls);
    
    // Add styles for loading spinner
    const style = document.createElement('style');
    style.textContent = `
      .loading-spinner {
        display: inline-block;
        position: relative;
        width: 80px;
        height: 80px;
      }
      .loading-spinner div {
        position: absolute;
        top: 33px;
        width: 13px;
        height: 13px;
        border-radius: 50%;
        background: #3498db;
        animation-timing-function: cubic-bezier(0, 1, 1, 0);
      }
      .loading-spinner div:nth-child(1) {
        left: 8px;
        animation: loading-spinner1 0.6s infinite;
      }
      .loading-spinner div:nth-child(2) {
        left: 8px;
        animation: loading-spinner2 0.6s infinite;
      }
      .loading-spinner div:nth-child(3) {
        left: 32px;
        animation: loading-spinner2 0.6s infinite;
      }
      .loading-spinner div:nth-child(4) {
        left: 56px;
        animation: loading-spinner3 0.6s infinite;
      }
      @keyframes loading-spinner1 {
        0% { transform: scale(0); }
        100% { transform: scale(1); }
      }
      @keyframes loading-spinner3 {
        0% { transform: scale(1); }
        100% { transform: scale(0); }
      }
      @keyframes loading-spinner2 {
        0% { transform: translate(0, 0); }
        100% { transform: translate(24px, 0); }
      }
      .loading-text {
        margin-top: 20px;
        font-size: 16px;
        color: #333;
      }
    `;
    document.head.appendChild(style);
  }
  
  /**
   * Update the page indicator
   */
  updatePageIndicator() {
    if (this.pageIndicator) {
      this.pageIndicator.textContent = `${this.currentPage} / ${this.totalPages}`;
    }
  }
  
  /**
   * Show the loading indicator
   */
  showLoading() {
    this.isLoading = true;
    if (this.loadingIndicator) {
      this.loadingIndicator.style.display = 'flex';
    }
  }
  
  /**
   * Hide the loading indicator
   */
  hideLoading() {
    this.isLoading = false;
    if (this.loadingIndicator) {
      this.loadingIndicator.style.display = 'none';
    }
  }
  
  /**
   * Load a document into the viewer
   * @param {string} url - URL to the document
   * @returns {Promise} Promise that resolves when document is loaded
   */
  async loadDocument(url) {
    if (!this.isInitialized) {
      await this.init();
    }
    
    this.showLoading();
    
    try {
      const { documentType } = this.options;
      
      // Clear document content
      this.documentContent.innerHTML = '';
      
      if (documentType === 'pdf') {
        // For PDF documents - create iframe or use PDF.js
        const iframe = document.createElement('iframe');
        iframe.style.width = '100%';
        iframe.style.height = '100%';
        iframe.style.border = 'none';
        iframe.src = url;
        
        // When iframe loads, hide loading indicator
        iframe.onload = () => {
          this.hideLoading();
          this.resize();
        };
        
        this.documentContent.appendChild(iframe);
      } else if (documentType === 'image') {
        // For image documents
        const img = document.createElement('img');
        img.style.maxWidth = '100%';
        img.style.height = 'auto';
        
        img.onload = () => {
          this.hideLoading();
          this.originalWidth = img.naturalWidth;
          this.originalHeight = img.naturalHeight;
          this.resize();
        };
        
        img.src = url;
        this.documentContent.appendChild(img);
      } else if (documentType === 'html') {
        // For HTML content
        // Fetch HTML content and insert into container
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Failed to load document: ${response.statusText}`);
        }
        
        const html = await response.text();
        this.documentContent.innerHTML = html;
        
        // Apply viewport meta for HTML content
        const meta = document.createElement('meta');
        meta.name = 'viewport';
        meta.content = 'width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes';
        this.documentContent.prepend(meta);
        
        this.hideLoading();
        this.resize();
      } else {
        // For other document types (text, etc.)
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Failed to load document: ${response.statusText}`);
        }
        
        const text = await response.text();
        
        // Create pre element for text content
        const pre = document.createElement('pre');
        pre.style.whiteSpace = 'pre-wrap';
        pre.style.wordBreak = 'break-word';
        pre.style.padding = '20px';
        pre.style.margin = '0';
        pre.style.fontFamily = 'monospace';
        pre.style.fontSize = '16px';
        pre.style.lineHeight = '1.6';
        pre.textContent = text;
        
        this.documentContent.appendChild(pre);
        this.hideLoading();
        this.resize();
      }
      
      return true;
    } catch (error) {
      console.error('Error loading document:', error);
      
      // Show error message
      this.documentContent.innerHTML = `
        <div style="padding: 20px; text-align: center;">
          <h3 style="color: #e74c3c;">Error Loading Document</h3>
          <p>${error.message}</p>
        </div>
      `;
      
      this.hideLoading();
      return false;
    }
  }
  
  /**
   * Render the document at current zoom level and page
   */
  render() {
    if (!this.documentContent) return;
    
    // Calculate transform
    const transform = `scale(${this.zoom})`;
    
    // Apply transform
    this.documentContent.style.transform = transform;
    
    // Update controls
    this.updatePageIndicator();
    
    // Update button states
    if (this.prevButton) {
      this.prevButton.disabled = this.currentPage <= 1;
      this.prevButton.style.opacity = this.currentPage <= 1 ? '0.5' : '1';
    }
    
    if (this.nextButton) {
      this.nextButton.disabled = this.currentPage >= this.totalPages;
      this.nextButton.style.opacity = this.currentPage >= this.totalPages ? '0.5' : '1';
    }
  }
  
  /**
   * Handle touch start event
   * @param {TouchEvent} event - Touch event
   */
  handleTouchStart(event) {
    if (this.isLoading) return;
    
    // Record time for double tap detection
    const currentTime = new Date().getTime();
    const tapLength = currentTime - this.lastTouchTime;
    
    this.lastTouchTime = currentTime;
    
    // Check for double tap
    if (tapLength < 300 && tapLength > 0) {
      event.preventDefault();
      this.handleDoubleTap(event);
      return;
    }
    
    const touches = event.touches;
    
    // Single touch (pan)
    if (touches.length === 1) {
      this.touchStartX = touches[0].clientX;
      this.touchStartY = touches[0].clientY;
      this.isDragging = true;
    } 
    // Multi-touch (pinch zoom)
    else if (touches.length === 2) {
      this.isPinching = true;
      
      // Calculate initial distance between two touches
      const dx = touches[0].clientX - touches[1].clientX;
      const dy = touches[0].clientY - touches[1].clientY;
      this.lastPinchDistance = Math.sqrt(dx * dx + dy * dy);
    }
  }
  
  /**
   * Handle touch move event
   * @param {TouchEvent} event - Touch event
   */
  handleTouchMove(event) {
    if (this.isLoading) return;
    
    const touches = event.touches;
    
    // Single touch (pan)
    if (this.isDragging && touches.length === 1) {
      this.touchMoveX = touches[0].clientX - this.touchStartX;
      this.touchMoveY = touches[0].clientY - this.touchStartY;
      
      // Calculate new position
      const currentX = parseFloat(this.documentContent.style.left || '0');
      const currentY = parseFloat(this.documentContent.style.top || '0');
      
      const newX = currentX + this.touchMoveX;
      const newY = currentY + this.touchMoveY;
      
      // Apply new position
      this.documentContent.style.left = `${newX}px`;
      this.documentContent.style.top = `${newY}px`;
      
      // Update start position for next move
      this.touchStartX = touches[0].clientX;
      this.touchStartY = touches[0].clientY;
      
      // Prevent default behavior (scrolling)
      event.preventDefault();
    }
    // Multi-touch (pinch zoom)
    else if (this.isPinching && touches.length === 2) {
      // Calculate new distance between touches
      const dx = touches[0].clientX - touches[1].clientX;
      const dy = touches[0].clientY - touches[1].clientY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // Calculate zoom change based on pinch distance change
      const deltaDistance = distance - this.lastPinchDistance;
      const zoomChange = deltaDistance * 0.01; // Adjust sensitivity as needed
      
      // Apply zoom
      this.zoom = Math.max(0.5, Math.min(3, this.zoom + zoomChange));
      this.render();
      
      // Update last pinch distance
      this.lastPinchDistance = distance;
      
      // Prevent default behavior (browser zoom)
      event.preventDefault();
    }
  }
  
  /**
   * Handle touch end event
   * @param {TouchEvent} event - Touch event
   */
  handleTouchEnd(event) {
    this.isDragging = false;
    this.isPinching = false;
    
    // Get touch end coordinates
    if (event.changedTouches && event.changedTouches.length > 0) {
      this.touchEndX = event.changedTouches[0].clientX;
      this.touchEndY = event.changedTouches[0].clientY;
      
      // Calculate swipe distance
      const deltaX = this.touchEndX - this.touchStartX;
      const deltaY = this.touchEndY - this.touchStartY;
      
      // Check for horizontal swipe (page turn)
      if (Math.abs(deltaX) > 100 && Math.abs(deltaY) < 50) {
        if (deltaX > 0) {
          // Swipe right - previous page
          this.prevPage();
        } else {
          // Swipe left - next page
          this.nextPage();
        }
      }
    }
  }
  
  /**
   * Handle double tap event (toggle zoom)
   * @param {TouchEvent} event - Touch event
   */
  handleDoubleTap(event) {
    const touch = event.touches[0];
    
    if (this.zoom > 1) {
      // Reset zoom
      this.resetZoom();
    } else {
      // Zoom in
      this.zoom = 2;
      this.render();
    }
  }
  
  /**
   * Handle pinch gesture for zooming
   * @param {TouchEvent} event - Touch event
   */
  handlePinch(event) {
    // This is handled in touchMove
  }
  
  /**
   * Zoom in
   */
  zoomIn() {
    this.zoom = Math.min(3, this.zoom + 0.25);
    this.render();
  }
  
  /**
   * Zoom out
   */
  zoomOut() {
    this.zoom = Math.max(0.5, this.zoom - 0.25);
    this.render();
  }
  
  /**
   * Reset zoom to default level
   */
  resetZoom() {
    this.zoom = 1;
    this.documentContent.style.left = '0';
    this.documentContent.style.top = '0';
    this.render();
  }
  
  /**
   * Go to next page
   */
  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.render();
      // In a real implementation, we would load the next page content here
    }
  }
  
  /**
   * Go to previous page
   */
  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.render();
      // In a real implementation, we would load the previous page content here
    }
  }
  
  /**
   * Go to specific page
   * @param {number} page - Page number to go to
   */
  goToPage(page) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.render();
      // In a real implementation, we would load the specified page content here
    }
  }
  
  /**
   * Handle resize events
   */
  resize() {
    if (!this.viewerElement || !this.options.container) return;
    
    // Get container dimensions
    const rect = this.options.container.getBoundingClientRect();
    this.containerWidth = rect.width;
    this.containerHeight = rect.height;
    
    // Apply container dimensions to viewer
    this.viewerElement.style.width = `${this.containerWidth}px`;
    this.viewerElement.style.height = `${this.containerHeight}px`;
    
    // Re-render
    this.render();
  }
  
  /**
   * Destroy the viewer and clean up resources
   */
  destroy() {
    if (!this.isInitialized) return;
    
    // Remove event listeners
    this.viewerElement.removeEventListener('touchstart', this.handleTouchStart);
    this.viewerElement.removeEventListener('touchmove', this.handleTouchMove);
    this.viewerElement.removeEventListener('touchend', this.handleTouchEnd);
    
    window.removeEventListener('resize', this.resize);
    
    // Remove from container
    if (this.options.container && this.viewerElement) {
      this.options.container.removeChild(this.viewerElement);
    }
    
    this.isInitialized = false;
  }
}

// Export the component
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MobileDocumentViewer;
} else {
  window.MobileDocumentViewer = MobileDocumentViewer;
}