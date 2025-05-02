/**
 * FinDoc Analyzer - Document Processor
 *
 * This file contains the JavaScript code for the document processing functionality.
 */

class DocumentProcessor {
  constructor(options = {}) {
    this.apiUrl = options.apiUrl || '/api/documents/process';
    this.pollingInterval = options.pollingInterval || 2000;
    this.maxRetries = options.maxRetries || 30;
    this.files = [];
    this.processing = false;
    this.taskId = null;
    this.progress = 0;
    this.result = null;
    this.error = null;
    this.onProgressChange = options.onProgressChange || (() => {});
    this.onStatusChange = options.onStatusChange || (() => {});
    this.onError = options.onError || (() => {});
    this.onComplete = options.onComplete || (() => {});

    this.pollingIntervalId = null;
    this.retryCount = 0;
  }

  /**
   * Add files to the processor
   * @param {FileList|File[]} files - Files to add
   */
  addFiles(files) {
    if (!files || files.length === 0) return;

    // Convert FileList to array if needed
    const fileArray = Array.from(files);

    // Filter out unsupported file types
    const supportedFiles = fileArray.filter(file => {
      const fileType = file.type.toLowerCase();
      return fileType === 'application/pdf' ||
             fileType === 'application/vnd.ms-excel' ||
             fileType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
             fileType === 'text/csv';
    });

    // Add files to the list
    this.files = [...this.files, ...supportedFiles];

    // Notify status change
    this.onStatusChange({
      status: 'ready',
      files: this.files
    });

    return this.files;
  }

  /**
   * Remove a file from the processor
   * @param {number} index - Index of the file to remove
   */
  removeFile(index) {
    if (index < 0 || index >= this.files.length) return;

    this.files.splice(index, 1);

    // Notify status change
    this.onStatusChange({
      status: 'ready',
      files: this.files
    });

    return this.files;
  }

  /**
   * Clear all files
   */
  clearFiles() {
    this.files = [];

    // Notify status change
    this.onStatusChange({
      status: 'ready',
      files: this.files
    });

    return this.files;
  }

  /**
   * Process the files
   * @param {Object} options - Processing options
   */
  async process(options = {}) {
    if (this.processing) return;
    if (this.files.length === 0) {
      this.error = 'No files to process';
      this.onError(this.error);
      return;
    }

    this.processing = true;
    this.progress = 0;
    this.result = null;
    this.error = null;
    this.retryCount = 0;
    this.currentStep = 'upload';

    // Notify status change
    this.onStatusChange({
      status: 'processing',
      files: this.files,
      progress: this.progress,
      step: this.currentStep
    });

    // Update progress
    this.onProgressChange(this.progress);

    try {
      // First, upload the file to create a document
      const formData = new FormData();

      // Add the first file (currently we only support one file at a time)
      const file = this.files[0];
      formData.append('file', file);

      // Update progress for upload step
      this.progress = 5;
      this.onProgressChange(this.progress);
      this.onStatusChange({
        status: 'processing',
        files: this.files,
        progress: this.progress,
        step: 'upload',
        message: 'Uploading file to the server...'
      });

      // Upload the file to create a document
      const uploadResponse = await fetch('/api/documents', {
        method: 'POST',
        body: formData
      });

      if (!uploadResponse.ok) {
        throw new Error(`Failed to upload document: ${uploadResponse.statusText}`);
      }

      const uploadData = await uploadResponse.json();

      if (!uploadData.success) {
        throw new Error(uploadData.error || 'Failed to upload document');
      }

      const documentId = uploadData.data.id;

      // Update progress for upload completion
      this.progress = 10;
      this.onProgressChange(this.progress);
      this.onStatusChange({
        status: 'processing',
        files: this.files,
        progress: this.progress,
        step: 'upload',
        message: 'File uploaded successfully. Starting processing...'
      });

      // Now process the document with Scan1
      const processOptions = {};

      // Add options
      Object.keys(options).forEach(key => {
        processOptions[key] = options[key];
      });

      // Send request to process the document
      const processResponse = await fetch(`/api/documents/${documentId}/scan1`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(processOptions)
      });

      if (!processResponse.ok) {
        throw new Error(`Failed to process document: ${processResponse.statusText}`);
      }

      const processData = await processResponse.json();

      if (!processData.success) {
        throw new Error(processData.error || 'Failed to process document');
      }

      this.taskId = processData.task_id || documentId;

      // Update progress for processing start
      this.progress = 20;
      this.onProgressChange(this.progress);
      this.onStatusChange({
        status: 'processing',
        files: this.files,
        progress: this.progress,
        step: 'ocr',
        message: 'Processing started. Extracting text from document...'
      });

      // Start polling for status
      this.startPolling();
    } catch (error) {
      this.processing = false;
      this.error = error.message;

      // Notify error
      this.onError(this.error);

      // Notify status change
      this.onStatusChange({
        status: 'error',
        files: this.files,
        error: this.error,
        step: this.currentStep,
        message: `Error: ${error.message}`
      });
    }
  }

  /**
   * Start polling for task status
   */
  startPolling() {
    if (!this.taskId) return;

    this.pollingIntervalId = setInterval(() => {
      this.checkStatus();
    }, this.pollingInterval);
  }

  /**
   * Stop polling for task status
   */
  stopPolling() {
    if (this.pollingIntervalId) {
      clearInterval(this.pollingIntervalId);
      this.pollingIntervalId = null;
    }
  }

  /**
   * Check task status
   */
  async checkStatus() {
    if (!this.taskId) return;

    try {
      // Get document status
      const response = await fetch(`/api/documents/${this.taskId}`);

      if (!response.ok) {
        throw new Error(`Failed to check status: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to check status');
      }

      // Map document status to our status format
      const documentStatus = data.data.status;
      let status = 'processing';
      let progress = this.progress;

      if (documentStatus === 'processed') {
        status = 'completed';
        progress = 100;
      } else if (documentStatus === 'error') {
        status = 'error';
      } else if (documentStatus === 'processing') {
        // Increment progress based on time elapsed
        progress = Math.min(progress + 5, 95);
      }

      // Update progress
      this.progress = progress;
      this.onProgressChange(this.progress);

      // Determine current processing step based on progress
      let step = 'upload';
      let message = 'Processing document...';

      if (this.progress >= 20 && this.progress < 40) {
        step = 'ocr';
        message = 'Extracting text from document...';
      } else if (this.progress >= 40 && this.progress < 60) {
        step = 'tables';
        message = 'Identifying and extracting tables...';
      } else if (this.progress >= 60 && this.progress < 80) {
        step = 'securities';
        message = 'Extracting securities information...';
      } else if (this.progress >= 80) {
        step = 'analysis';
        message = 'Analyzing extracted data...';
      }

      // Update current step
      this.currentStep = step;

      // Notify status change
      this.onStatusChange({
        status: status,
        files: this.files,
        progress: this.progress,
        step: this.currentStep,
        message: message
      });

      // Check if processing is complete
      if (status === 'completed') {
        this.result = data.data.metadata || {};
        this.processing = false;
        this.stopPolling();

        // Notify completion
        this.onComplete(this.result);

        // Notify status change
        this.onStatusChange({
          status: 'completed',
          files: this.files,
          result: this.result,
          step: 'analysis',
          message: 'Processing completed successfully!'
        });
      } else if (status === 'error') {
        this.error = data.data.metadata?.error || 'Failed to process document';
        this.processing = false;
        this.stopPolling();

        // Notify error
        this.onError(this.error);

        // Notify status change
        this.onStatusChange({
          status: 'error',
          files: this.files,
          error: this.error,
          step: this.currentStep,
          message: `Error: ${this.error}`
        });
      } else if (this.retryCount >= this.maxRetries) {
        this.error = 'Processing timeout';
        this.processing = false;
        this.stopPolling();

        // Notify error
        this.onError(this.error);

        // Notify status change
        this.onStatusChange({
          status: 'error',
          files: this.files,
          error: this.error,
          step: this.currentStep,
          message: 'Processing timed out. Please try again.'
        });
      } else {
        this.retryCount++;
      }
    } catch (error) {
      this.retryCount++;

      if (this.retryCount >= this.maxRetries) {
        this.error = error.message;
        this.processing = false;
        this.stopPolling();

        // Notify error
        this.onError(this.error);

        // Notify status change
        this.onStatusChange({
          status: 'error',
          files: this.files,
          error: this.error,
          step: this.currentStep,
          message: `Error: ${error.message}`
        });
      }
    }
  }

  /**
   * Cancel processing
   */
  cancel() {
    if (!this.processing) return;

    this.stopPolling();
    this.processing = false;

    // Notify status change
    this.onStatusChange({
      status: 'cancelled',
      files: this.files
    });
  }

  /**
   * Reset the processor
   */
  reset() {
    this.stopPolling();
    this.files = [];
    this.processing = false;
    this.taskId = null;
    this.progress = 0;
    this.result = null;
    this.error = null;
    this.retryCount = 0;

    // Notify status change
    this.onStatusChange({
      status: 'ready',
      files: this.files
    });
  }

  /**
   * Get file size in human-readable format
   * @param {number} bytes - File size in bytes
   * @returns {string} Human-readable file size
   */
  static formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Get file icon based on file type
   * @param {File} file - File object
   * @returns {string} Font Awesome icon class
   */
  static getFileIcon(file) {
    const fileType = file.type.toLowerCase();

    if (fileType === 'application/pdf') {
      return 'fas fa-file-pdf';
    } else if (fileType === 'application/vnd.ms-excel' ||
               fileType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
      return 'fas fa-file-excel';
    } else if (fileType === 'text/csv') {
      return 'fas fa-file-csv';
    } else {
      return 'fas fa-file';
    }
  }
}

// Initialize document processor when the page loads
document.addEventListener('DOMContentLoaded', () => {
  // Get DOM elements
  const fileUpload = document.getElementById('file-upload');
  const fileInput = document.getElementById('file-input');
  const fileList = document.getElementById('file-list');
  const processDocumentsBtn = document.getElementById('process-documents');
  const clearAllFilesBtn = document.getElementById('clear-all-files');
  const agentCards = document.querySelectorAll('.agent-card');
  const selectAllAgentsBtn = document.getElementById('select-all-agents');

  // Feature checkboxes
  const tableExtractionCheckbox = document.getElementById('table-extraction');
  const isinDetectionCheckbox = document.getElementById('isin-detection');
  const securityInfoCheckbox = document.getElementById('security-info');
  const portfolioAnalysisCheckbox = document.getElementById('portfolio-analysis');
  const ocrScannedCheckbox = document.getElementById('ocr-scanned');

  // Output format radios
  const formatJsonRadio = document.getElementById('format-json');
  const formatCsvRadio = document.getElementById('format-csv');
  const formatExcelRadio = document.getElementById('format-excel');

  // Create document processor
  const documentProcessor = new DocumentProcessor({
    apiUrl: '/api/documents/scan1',
    onProgressChange: (progress) => {
      // Update progress UI
      console.log(`Processing progress: ${progress}%`);
    },
    onStatusChange: (status) => {
      // Update status UI
      console.log('Status changed:', status);

      // Update file list
      updateFileList(status.files);

      // Update process button
      if (status.status === 'processing') {
        processDocumentsBtn.disabled = true;
        processDocumentsBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Processing...';
      } else {
        processDocumentsBtn.disabled = false;
        processDocumentsBtn.innerHTML = '<i class="fas fa-cogs mr-2"></i> Process Documents';
      }
    },
    onError: (error) => {
      // Show error
      console.error('Processing error:', error);
      alert(`Error: ${error}`);
    },
    onComplete: (result) => {
      // Show result
      console.log('Processing complete:', result);

      // Scroll to results
      document.querySelector('.card:last-child').scrollIntoView({ behavior: 'smooth' });
    }
  });

  // Update file list UI
  function updateFileList(files) {
    // Clear file list
    fileList.innerHTML = '';

    // Add files to list
    files.forEach((file, index) => {
      const fileItem = document.createElement('div');
      fileItem.className = 'file-item';

      const fileInfo = document.createElement('div');
      fileInfo.className = 'file-info';

      const fileIcon = document.createElement('div');
      fileIcon.className = 'file-icon';
      fileIcon.innerHTML = `<i class="${DocumentProcessor.getFileIcon(file)}"></i>`;

      const fileDetails = document.createElement('div');
      fileDetails.className = 'file-details';

      const fileName = document.createElement('div');
      fileName.className = 'file-name';
      fileName.textContent = file.name;
      fileName.title = file.name; // Add tooltip for long filenames

      const fileSize = document.createElement('div');
      fileSize.className = 'file-size';
      fileSize.textContent = DocumentProcessor.formatFileSize(file.size);

      fileDetails.appendChild(fileName);
      fileDetails.appendChild(fileSize);

      fileInfo.appendChild(fileIcon);
      fileInfo.appendChild(fileDetails);

      const fileActions = document.createElement('div');
      fileActions.className = 'file-actions';

      // Add file status if available
      if (file.status) {
        const fileStatus = document.createElement('div');
        fileStatus.className = `file-status ${file.status}`;

        let statusText = '';
        let statusIcon = '';

        switch (file.status) {
          case 'uploaded':
            statusText = 'Uploaded';
            statusIcon = '<i class="fas fa-check-circle mr-1"></i>';
            break;
          case 'processing':
            statusText = 'Processing';
            statusIcon = '<i class="fas fa-spinner fa-spin mr-1"></i>';
            break;
          case 'error':
            statusText = 'Error';
            statusIcon = '<i class="fas fa-exclamation-circle mr-1"></i>';
            break;
          case 'completed':
            statusText = 'Completed';
            statusIcon = '<i class="fas fa-check-circle mr-1"></i>';
            break;
          default:
            statusText = 'Ready';
            statusIcon = '<i class="fas fa-check mr-1"></i>';
        }

        fileStatus.innerHTML = `${statusIcon} ${statusText}`;
        fileActions.appendChild(fileStatus);
      }

      const viewButton = document.createElement('button');
      viewButton.className = 'btn btn-sm btn-outline';
      viewButton.innerHTML = '<i class="fas fa-eye"></i>';
      viewButton.title = 'View file';
      viewButton.addEventListener('click', () => {
        // Open file in new tab
        const url = URL.createObjectURL(file);
        window.open(url, '_blank');
      });

      const removeButton = document.createElement('button');
      removeButton.className = 'btn btn-sm btn-danger';
      removeButton.innerHTML = '<i class="fas fa-trash"></i>';
      removeButton.title = 'Remove file';
      removeButton.addEventListener('click', () => {
        // Remove file
        documentProcessor.removeFile(index);
      });

      fileActions.appendChild(viewButton);
      fileActions.appendChild(removeButton);

      fileItem.appendChild(fileInfo);
      fileItem.appendChild(fileActions);

      fileList.appendChild(fileItem);
    });

    // Update file list container visibility
    const fileListContainer = document.querySelector('.file-list-container');
    if (fileListContainer) {
      if (files.length > 0) {
        fileListContainer.style.display = 'block';
        document.getElementById('clear-all-files').style.display = 'block';
      } else {
        document.getElementById('clear-all-files').style.display = 'none';
      }
    }
  }

  // File upload event handlers
  fileUpload.addEventListener('click', () => {
    fileInput.click();
  });

  fileUpload.addEventListener('dragover', (e) => {
    e.preventDefault();
    fileUpload.style.borderColor = 'var(--primary-500)';
    fileUpload.style.backgroundColor = 'var(--primary-50)';
  });

  fileUpload.addEventListener('dragleave', () => {
    fileUpload.style.borderColor = 'var(--neutral-300)';
    fileUpload.style.backgroundColor = 'var(--neutral-50)';
  });

  fileUpload.addEventListener('drop', (e) => {
    e.preventDefault();
    fileUpload.style.borderColor = 'var(--neutral-300)';
    fileUpload.style.backgroundColor = 'var(--neutral-50)';

    if (e.dataTransfer.files.length) {
      documentProcessor.addFiles(e.dataTransfer.files);
    }
  });

  fileInput.addEventListener('change', () => {
    if (fileInput.files.length) {
      documentProcessor.addFiles(fileInput.files);
    }
  });

  // Clear all files
  clearAllFilesBtn.addEventListener('click', () => {
    documentProcessor.clearFiles();
  });

  // Process documents
  processDocumentsBtn.addEventListener('click', () => {
    // Get selected agents
    const selectedAgents = [];
    agentCards.forEach(card => {
      if (card.classList.contains('active')) {
        selectedAgents.push(card.querySelector('.agent-card-title').textContent);
      }
    });

    // Get processing options
    const options = {
      agents: selectedAgents,
      tableExtraction: tableExtractionCheckbox.checked,
      isinDetection: isinDetectionCheckbox.checked,
      securityInfo: securityInfoCheckbox.checked,
      portfolioAnalysis: portfolioAnalysisCheckbox.checked,
      ocrScanned: ocrScannedCheckbox.checked,
      outputFormat: formatJsonRadio.checked ? 'json' : (formatCsvRadio.checked ? 'csv' : 'excel')
    };

    console.log('Processing documents with options:', options);

    // Process documents
    documentProcessor.process(options);
  });

  // Select all agents
  selectAllAgentsBtn.addEventListener('click', () => {
    const allSelected = [...agentCards].every(card => card.classList.contains('active'));

    agentCards.forEach(card => {
      if (allSelected) {
        card.classList.remove('active');
      } else {
        card.classList.add('active');
      }
    });
  });

  // Agent cards
  agentCards.forEach(card => {
    card.addEventListener('click', () => {
      // Toggle active class on the clicked card
      card.classList.toggle('active');
      console.log(`Agent card clicked: ${card.querySelector('.agent-card-title').textContent}, Active: ${card.classList.contains('active')}`);
    });
  });
});
