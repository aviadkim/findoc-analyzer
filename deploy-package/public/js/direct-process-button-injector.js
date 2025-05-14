console.log('Direct process button injector loaded');

(function() {
  // Initialize when DOM is loaded
  document.addEventListener('DOMContentLoaded', function() {
    // Find the process button
    const processBtn = document.getElementById('process-document-btn');
    if (processBtn) {
      // Make sure it's visible and styled correctly
      processBtn.style.display = 'inline-flex';
      processBtn.style.alignItems = 'center';
      processBtn.style.backgroundColor = '#007bff';
      processBtn.style.color = 'white';
      processBtn.style.border = 'none';
      processBtn.style.borderRadius = '4px';
      processBtn.style.padding = '10px 15px';
      processBtn.style.margin = '10px';
      processBtn.style.cursor = 'pointer';
      
      // Add click event if it doesn't already have one
      processBtn.addEventListener('click', function() {
        console.log('Process button clicked');
        window.location.href = '/documents-new';
      });
    }
  });
})();
