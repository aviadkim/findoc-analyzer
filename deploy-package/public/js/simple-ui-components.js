console.log('Simple UI components loaded');

(function() {
  // Run when DOM is loaded
  document.addEventListener('DOMContentLoaded', function() {
    console.log('Initializing simple UI components');
    
    // Ensure critical UI components are visible
    const criticalComponents = document.getElementById('critical-ui-components');
    if (criticalComponents) {
      criticalComponents.style.display = 'block';
    }
    
    // Create Upload button if on upload page
    if (window.location.pathname.includes('upload')) {
      console.log('On upload page, adding upload form enhancements');
      
      const uploadForm = document.querySelector('form');
      if (uploadForm) {
        // Add styling
        uploadForm.style.margin = '20px';
        uploadForm.style.padding = '20px';
        uploadForm.style.border = '1px solid #ddd';
        uploadForm.style.borderRadius = '8px';
        uploadForm.style.backgroundColor = '#f9f9f9';
        
        // Add header if missing
        if (\!uploadForm.querySelector('h1, h2')) {
          const header = document.createElement('h2');
          header.textContent = 'Upload Financial Document';
          header.style.marginBottom = '20px';
          uploadForm.insertBefore(header, uploadForm.firstChild);
        }
        
        // Enhance file input
        const fileInput = uploadForm.querySelector('input[type="file"]');
        if (fileInput) {
          fileInput.style.padding = '10px';
          fileInput.style.border = '1px solid #ddd';
          fileInput.style.borderRadius = '4px';
          fileInput.style.width = '100%';
          fileInput.style.marginBottom = '15px';
        }
        
        // Enhance submit button
        const submitBtn = uploadForm.querySelector('button[type="submit"]');
        if (submitBtn) {
          submitBtn.style.backgroundColor = '#007bff';
          submitBtn.style.color = 'white';
          submitBtn.style.border = 'none';
          submitBtn.style.borderRadius = '4px';
          submitBtn.style.padding = '10px 15px';
          submitBtn.style.cursor = 'pointer';
        }
      }
    }
    
    // Enhance document list if on documents page
    if (window.location.pathname.includes('documents')) {
      console.log('On documents page, enhancing document list');
      
      const documentList = document.querySelector('.document-list');
      if (documentList) {
        // Add styling
        documentList.style.margin = '20px';
        
        // Fix document cards
        const documentCards = documentList.querySelectorAll('.document-card');
        documentCards.forEach(card => {
          card.style.border = '1px solid #ddd';
          card.style.borderRadius = '8px';
          card.style.padding = '15px';
          card.style.margin = '10px 0';
          card.style.backgroundColor = 'white';
          card.style.boxShadow = '0 2px 5px rgba(0,0,0,0.1)';
          card.style.transition = 'transform 0.3s';
          
          // Add hover effect
          card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px)';
            this.style.boxShadow = '0 5px 15px rgba(0,0,0,0.1)';
          });
          
          card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = '0 2px 5px rgba(0,0,0,0.1)';
          });
        });
      }
    }
  });
})();
