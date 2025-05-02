document.addEventListener('DOMContentLoaded', function() {
  // Navigation
  const navLinks = document.querySelectorAll('.sidebar-nav a');
  const sections = document.querySelectorAll('.section-container');
  
  // Handle navigation
  navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      
      // Remove active class from all links
      navLinks.forEach(link => link.classList.remove('active'));
      
      // Add active class to clicked link
      this.classList.add('active');
      
      // Hide all sections
      sections.forEach(section => section.classList.add('hidden'));
      
      // Show the selected section
      const sectionId = this.getAttribute('data-section');
      document.getElementById(`${sectionId}-section`).classList.remove('hidden');
    });
  });
  
  // Upload button in header
  const uploadBtn = document.getElementById('upload-btn');
  if (uploadBtn) {
    uploadBtn.addEventListener('click', function(e) {
      e.preventDefault();
      
      // Remove active class from all links
      navLinks.forEach(link => link.classList.remove('active'));
      
      // Add active class to upload link
      document.querySelector('[data-section="upload"]').classList.add('active');
      
      // Hide all sections
      sections.forEach(section => section.classList.add('hidden'));
      
      // Show upload section
      document.getElementById('upload-section').classList.remove('hidden');
    });
  }
  
  // File upload functionality
  const fileInput = document.getElementById('file-input');
  const uploadArea = document.getElementById('upload-area');
  const uploadPreview = document.getElementById('upload-preview');
  const uploadProgress = document.getElementById('upload-progress');
  const uploadResult = document.getElementById('upload-result');
  const previewFilename = document.getElementById('preview-filename');
  const previewFilesize = document.getElementById('preview-filesize');
  const previewClose = document.getElementById('preview-close');
  const processDocumentBtn = document.getElementById('process-document-btn');
  const progressBar = document.getElementById('progress-bar');
  const progressText = document.getElementById('progress-text');
  const resultMessage = document.getElementById('result-message');
  const resultDetails = document.getElementById('result-details');
  const resultClose = document.getElementById('result-close');
  const viewAnalysisBtn = document.getElementById('view-analysis-btn');
  const uploadNewBtn = document.getElementById('upload-new-btn');
  
  let selectedFile = null;
  let documentId = null;
  
  // Handle file selection
  if (fileInput) {
    fileInput.addEventListener('change', function(e) {
      if (this.files.length > 0) {
        selectedFile = this.files[0];
        showFilePreview(selectedFile);
      }
    });
  }
  
  // Handle drag and drop
  if (uploadArea) {
    uploadArea.addEventListener('dragover', function(e) {
      e.preventDefault();
      this.classList.add('dragover');
    });
    
    uploadArea.addEventListener('dragleave', function(e) {
      e.preventDefault();
      this.classList.remove('dragover');
    });
    
    uploadArea.addEventListener('drop', function(e) {
      e.preventDefault();
      this.classList.remove('dragover');
      
      if (e.dataTransfer.files.length > 0) {
        selectedFile = e.dataTransfer.files[0];
        fileInput.files = e.dataTransfer.files;
        showFilePreview(selectedFile);
      }
    });
  }
  
  // Show file preview
  function showFilePreview(file) {
    if (!file) return;
    
    previewFilename.textContent = file.name;
    previewFilesize.textContent = formatFileSize(file.size);
    
    uploadArea.classList.add('hidden');
    uploadPreview.classList.remove('hidden');
    uploadProgress.classList.add('hidden');
    uploadResult.classList.add('hidden');
  }
  
  // Format file size
  function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
  
  // Handle preview close
  if (previewClose) {
    previewClose.addEventListener('click', function() {
      uploadArea.classList.remove('hidden');
      uploadPreview.classList.add('hidden');
      selectedFile = null;
      fileInput.value = '';
    });
  }
  
  // Handle process document button
  if (processDocumentBtn) {
    processDocumentBtn.addEventListener('click', function() {
      if (!selectedFile) return;
      
      uploadPreview.classList.add('hidden');
      uploadProgress.classList.remove('hidden');
      
      // Create form data
      const formData = new FormData();
      formData.append('file', selectedFile);
      
      // Upload and process document
      uploadDocument(formData);
    });
  }
  
  // Upload and process document
  function uploadDocument(formData) {
    // Reset progress
    progressBar.style.width = '0%';
    progressText.textContent = '0%';
    
    // Create XMLHttpRequest
    const xhr = new XMLHttpRequest();
    
    // Progress event
    xhr.upload.addEventListener('progress', function(e) {
      if (e.lengthComputable) {
        const percentComplete = Math.round((e.loaded / e.total) * 100);
        progressBar.style.width = percentComplete + '%';
        progressText.textContent = percentComplete + '%';
      }
    });
    
    // Load event
    xhr.addEventListener('load', function() {
      if (xhr.status >= 200 && xhr.status < 300) {
        const response = JSON.parse(xhr.responseText);
        
        if (response.success) {
          documentId = response.document_id;
          
          // Show success message
          resultMessage.textContent = 'Document processed successfully!';
          resultDetails.textContent = `Extracted ${response.result.securities.length} securities with total value $${response.result.portfolio.total_value.toFixed(2)}`;
          
          // Store analysis result
          localStorage.setItem('analysisResult', JSON.stringify(response.result));
          
          // Show result
          uploadProgress.classList.add('hidden');
          uploadResult.classList.remove('hidden');
        } else {
          showError(response.error || 'Error processing document');
        }
      } else {
        showError('Error processing document');
      }
    });
    
    // Error event
    xhr.addEventListener('error', function() {
      showError('Network error');
    });
    
    // Open request
    xhr.open('POST', '/api/documents/upload', true);
    
    // Send request
    xhr.send(formData);
  }
  
  // Show error
  function showError(message) {
    uploadProgress.classList.add('hidden');
    uploadResult.classList.remove('hidden');
    
    const resultIcon = uploadResult.querySelector('.result-icon');
    resultIcon.classList.remove('success');
    resultIcon.classList.add('error');
    resultIcon.innerHTML = '<i class="fas fa-times-circle"></i>';
    
    resultMessage.textContent = 'Error processing document';
    resultDetails.textContent = message;
    
    viewAnalysisBtn.classList.add('hidden');
  }
  
  // Handle result close
  if (resultClose) {
    resultClose.addEventListener('click', function() {
      uploadArea.classList.remove('hidden');
      uploadResult.classList.add('hidden');
      selectedFile = null;
      fileInput.value = '';
    });
  }
  
  // Handle view analysis button
  if (viewAnalysisBtn) {
    viewAnalysisBtn.addEventListener('click', function() {
      // Hide all sections
      sections.forEach(section => section.classList.add('hidden'));
      
      // Show analysis section
      document.getElementById('analysis-section').classList.remove('hidden');
      
      // Remove active class from all links
      navLinks.forEach(link => link.classList.remove('active'));
      
      // Add active class to analytics link
      document.querySelector('[data-section="analytics"]').classList.add('active');
      
      // Show analysis result
      showAnalysisResult();
    });
  }
  
  // Handle upload new button
  if (uploadNewBtn) {
    uploadNewBtn.addEventListener('click', function() {
      uploadArea.classList.remove('hidden');
      uploadResult.classList.add('hidden');
      selectedFile = null;
      fileInput.value = '';
    });
  }
  
  // Go to upload button in analysis section
  const goToUploadBtn = document.getElementById('go-to-upload-btn');
  if (goToUploadBtn) {
    goToUploadBtn.addEventListener('click', function() {
      // Hide all sections
      sections.forEach(section => section.classList.add('hidden'));
      
      // Show upload section
      document.getElementById('upload-section').classList.remove('hidden');
      
      // Remove active class from all links
      navLinks.forEach(link => link.classList.remove('active'));
      
      // Add active class to upload link
      document.querySelector('[data-section="upload"]').classList.add('active');
    });
  }
  
  // Show analysis result
  function showAnalysisResult() {
    const analysisContent = document.getElementById('analysis-content');
    const analysisResult = localStorage.getItem('analysisResult');
    
    if (!analysisResult) {
      return;
    }
    
    const result = JSON.parse(analysisResult);
    
    // Create analysis HTML
    let html = `
      <div class="analysis-result">
        <div class="analysis-header">
          <h2 class="analysis-title">${result.document_info.document_name}</h2>
          <div class="analysis-date">Processed: ${formatDate(result.document_info.processing_date)}</div>
        </div>
        
        <div class="analysis-summary">
          <h3 class="summary-title">Portfolio Summary</h3>
          <div class="summary-grid">
            <div class="summary-item">
              <div class="summary-label">Total Value</div>
              <div class="summary-value">$${result.portfolio.total_value.toFixed(2)}</div>
            </div>
            <div class="summary-item">
              <div class="summary-label">Securities</div>
              <div class="summary-value">${result.securities.length}</div>
            </div>
            <div class="summary-item">
              <div class="summary-label">Currency</div>
              <div class="summary-value">${result.portfolio.currency}</div>
            </div>
            <div class="summary-item">
              <div class="summary-label">Confidence</div>
              <div class="summary-value">${(result.accuracy.confidence * 100).toFixed(0)}%</div>
            </div>
          </div>
        </div>
        
        <div class="analysis-section">
          <h3 class="section-title">Securities</h3>
          <table class="securities-table">
            <thead>
              <tr>
                <th>ISIN</th>
                <th>Name</th>
                <th class="numeric">Quantity</th>
                <th class="numeric">Value</th>
                <th class="numeric">Currency</th>
              </tr>
            </thead>
            <tbody>
    `;
    
    // Add securities rows
    result.securities.forEach(security => {
      html += `
        <tr>
          <td>${security.code}</td>
          <td>${security.name}</td>
          <td class="numeric">${security.quantity}</td>
          <td class="numeric">${parseFloat(security.value).toFixed(2)}</td>
          <td class="numeric">${security.currency}</td>
        </tr>
      `;
    });
    
    html += `
            </tbody>
          </table>
        </div>
        
        <div class="analysis-actions">
          <button class="action-btn secondary">
            <i class="fas fa-download"></i>
            Export Data
          </button>
          <button class="action-btn primary">
            <i class="fas fa-chart-pie"></i>
            View Portfolio
          </button>
        </div>
      </div>
    `;
    
    // Update analysis content
    analysisContent.innerHTML = html;
  }
  
  // Format date
  function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  
  // Dashboard card buttons
  const viewDocumentsBtn = document.getElementById('view-documents-btn');
  const viewPortfolioBtn = document.getElementById('view-portfolio-btn');
  const startAnalysisBtn = document.getElementById('start-analysis-btn');
  const exportDataBtn = document.getElementById('export-data-btn');
  const viewIsinsBtn = document.getElementById('view-isins-btn');
  const getAdviceBtn = document.getElementById('get-advice-btn');
  
  // Handle dashboard card buttons
  if (viewDocumentsBtn) {
    viewDocumentsBtn.addEventListener('click', function() {
      alert('View Documents functionality will be implemented soon.');
    });
  }
  
  if (viewPortfolioBtn) {
    viewPortfolioBtn.addEventListener('click', function() {
      alert('View Portfolio functionality will be implemented soon.');
    });
  }
  
  if (startAnalysisBtn) {
    startAnalysisBtn.addEventListener('click', function() {
      // Hide all sections
      sections.forEach(section => section.classList.add('hidden'));
      
      // Show upload section
      document.getElementById('upload-section').classList.remove('hidden');
      
      // Remove active class from all links
      navLinks.forEach(link => link.classList.remove('active'));
      
      // Add active class to upload link
      document.querySelector('[data-section="upload"]').classList.add('active');
    });
  }
  
  if (exportDataBtn) {
    exportDataBtn.addEventListener('click', function() {
      alert('Export Data functionality will be implemented soon.');
    });
  }
  
  if (viewIsinsBtn) {
    viewIsinsBtn.addEventListener('click', function() {
      alert('View ISINs functionality will be implemented soon.');
    });
  }
  
  if (getAdviceBtn) {
    getAdviceBtn.addEventListener('click', function() {
      alert('Get Advice functionality will be implemented soon.');
    });
  }
  
  // Testing Dashboard button
  const testDashboardBtn = document.getElementById('test-dashboard-btn');
  if (testDashboardBtn) {
    testDashboardBtn.addEventListener('click', function() {
      // Hide all sections
      sections.forEach(section => section.classList.add('hidden'));
      
      // Show testing section
      document.getElementById('testing-section').classList.remove('hidden');
      
      // Remove active class from all links
      navLinks.forEach(link => link.classList.remove('active'));
      
      // Add active class to testing link
      document.querySelector('[data-section="testing"]').classList.add('active');
    });
  }
  
  // API Key button
  const apiKeyBtn = document.getElementById('api-key-btn');
  if (apiKeyBtn) {
    apiKeyBtn.addEventListener('click', function() {
      // Hide all sections
      sections.forEach(section => section.classList.add('hidden'));
      
      // Show settings section
      document.getElementById('settings-section').classList.remove('hidden');
      
      // Remove active class from all links
      navLinks.forEach(link => link.classList.remove('active'));
      
      // Add active class to settings link
      document.querySelector('[data-section="settings"]').classList.add('active');
    });
  }
});
