/**
 * PDF Processor
 * Handles PDF processing functionality with detailed logging
 */

document.addEventListener('DOMContentLoaded', function() {
  console.log('PDF Processor loaded');

  // Create global PDF processor
  window.pdfProcessor = {
    // Processing status
    status: {
      isProcessing: false,
      currentFile: null,
      progress: 0,
      stage: null,
      error: null
    },

    // Processing stages
    STAGES: {
      INITIALIZING: 'initializing',
      EXTRACTING_TEXT: 'extracting_text',
      ANALYZING_STRUCTURE: 'analyzing_structure',
      IDENTIFYING_TABLES: 'identifying_tables',
      EXTRACTING_TABLE_DATA: 'extracting_table_data',
      IDENTIFYING_SECURITIES: 'identifying_securities',
      PROCESSING_FINANCIAL_DATA: 'processing_financial_data',
      GENERATING_INSIGHTS: 'generating_insights',
      FINALIZING: 'finalizing',
      COMPLETE: 'complete',
      FAILED: 'failed'
    },

    // Process a PDF file
    processFile: function(fileId) {
      console.log('Processing file:', fileId);

      // Get file info
      const files = JSON.parse(localStorage.getItem('localFiles') || '[]');
      const fileIndex = files.findIndex(f => f.id === fileId);

      if (fileIndex === -1) {
        const error = 'File not found';
        console.error(error);
        this.updateStatus(null, 0, this.STAGES.FAILED, error);
        return Promise.reject(new Error(error));
      }

      const file = files[fileIndex];

      // Update status
      this.updateStatus(file, 0, this.STAGES.INITIALIZING);

      // Update file status
      files[fileIndex].processing = true;
      localStorage.setItem('localFiles', JSON.stringify(files));

      // Update UI
      this.updateUI();

      // Process the file
      return this.simulateProcessing(file)
        .then(processedData => {
          // Update file with processed data
          files[fileIndex].processed = true;
          files[fileIndex].processing = false;
          files[fileIndex].processedDate = new Date().toISOString();
          files[fileIndex].data = processedData;

          // Save to localStorage
          localStorage.setItem('localFiles', JSON.stringify(files));

          // Update status
          this.updateStatus(file, 100, this.STAGES.COMPLETE);

          // Update UI
          this.updateUI();

          return processedData;
        })
        .catch(error => {
          console.error('Error processing file:', error);

          // Update file status
          files[fileIndex].processing = false;
          files[fileIndex].error = error.message;

          // Save to localStorage
          localStorage.setItem('localFiles', JSON.stringify(files));

          // Update status
          this.updateStatus(file, 0, this.STAGES.FAILED, error.message);

          // Update UI
          this.updateUI();

          throw error;
        });
    },

    // Simulate processing
    simulateProcessing: function(file) {
      console.log('Simulating processing for file:', file.name);

      // Processing stages with timing
      const stages = [
        { stage: this.STAGES.INITIALIZING, progress: 10, time: 500 },
        { stage: this.STAGES.EXTRACTING_TEXT, progress: 20, time: 1000 },
        { stage: this.STAGES.ANALYZING_STRUCTURE, progress: 30, time: 800 },
        { stage: this.STAGES.IDENTIFYING_TABLES, progress: 40, time: 1200 },
        { stage: this.STAGES.EXTRACTING_TABLE_DATA, progress: 50, time: 1500 },
        { stage: this.STAGES.IDENTIFYING_SECURITIES, progress: 60, time: 1000 },
        { stage: this.STAGES.PROCESSING_FINANCIAL_DATA, progress: 70, time: 1200 },
        { stage: this.STAGES.GENERATING_INSIGHTS, progress: 80, time: 1000 },
        { stage: this.STAGES.FINALIZING, progress: 90, time: 800 },
        { stage: this.STAGES.COMPLETE, progress: 100, time: 500 }
      ];

      // Process each stage
      return stages.reduce((promise, stage) => {
        return promise.then(() => {
          return new Promise(resolve => {
            // Update status
            this.updateStatus(file, stage.progress, stage.stage);

            // Update UI
            this.updateUI();

            // Wait for the specified time
            setTimeout(resolve, stage.time);
          });
        });
      }, Promise.resolve())
        .then(() => {
          // Generate processed data
          return this.generateProcessedData(file);
        });
    },

    // Generate processed data
    generateProcessedData: function(file) {
      console.log('Generating processed data for file:', file.name);

      // Generate random data based on file name
      const seed = file.name.length;
      const randomFactor = 1 + (seed % 10) / 10;

      return {
        totalValue: '$' + (1250000 * randomFactor).toFixed(2),
        topHoldings: [
          { name: 'Apple Inc. (AAPL)', value: '$' + (175000 * randomFactor).toFixed(2), percentage: (14.0 * randomFactor).toFixed(1) + '%' },
          { name: 'Microsoft Corp. (MSFT)', value: '$' + (240000 * randomFactor).toFixed(2), percentage: (19.2 * randomFactor).toFixed(1) + '%' },
          { name: 'Alphabet Inc. (GOOG)', value: '$' + (260000 * randomFactor).toFixed(2), percentage: (20.8 * randomFactor).toFixed(1) + '%' }
        ],
        assetAllocation: {
          equities: { value: '$' + (750000 * randomFactor).toFixed(2), percentage: '60%' },
          fixedIncome: { value: '$' + (375000 * randomFactor).toFixed(2), percentage: '30%' },
          cash: { value: '$' + (125000 * randomFactor).toFixed(2), percentage: '10%' }
        },
        securities: [
          { name: 'Apple Inc.', symbol: 'AAPL', isin: 'US0378331005', quantity: 1000, price: 175.00 * randomFactor, value: 175000.00 * randomFactor },
          { name: 'Microsoft Corp.', symbol: 'MSFT', isin: 'US5949181045', quantity: 800, price: 300.00 * randomFactor, value: 240000.00 * randomFactor },
          { name: 'Alphabet Inc.', symbol: 'GOOG', isin: 'US02079K1079', quantity: 200, price: 1300.00 * randomFactor, value: 260000.00 * randomFactor },
          { name: 'Amazon.com Inc.', symbol: 'AMZN', isin: 'US0231351067', quantity: 150, price: 1000.00 * randomFactor, value: 150000.00 * randomFactor },
          { name: 'Tesla Inc.', symbol: 'TSLA', isin: 'US88160R1014', quantity: 300, price: 250.00 * randomFactor, value: 75000.00 * randomFactor }
        ],
        extractedText: `This is a financial report for ${file.name}.
The total portfolio value is ${(1250000 * randomFactor).toFixed(2)} USD.
Asset allocation: 60% equities, 30% fixed income, 10% cash.
Top holdings include Apple Inc., Microsoft Corp., and Alphabet Inc.`,
        tables: [
          {
            title: 'Securities',
            headers: ['Name', 'Symbol', 'ISIN', 'Quantity', 'Price', 'Value'],
            rows: [
              ['Apple Inc.', 'AAPL', 'US0378331005', '1000', '$' + (175.00 * randomFactor).toFixed(2), '$' + (175000.00 * randomFactor).toFixed(2)],
              ['Microsoft Corp.', 'MSFT', 'US5949181045', '800', '$' + (300.00 * randomFactor).toFixed(2), '$' + (240000.00 * randomFactor).toFixed(2)],
              ['Alphabet Inc.', 'GOOG', 'US02079K1079', '200', '$' + (1300.00 * randomFactor).toFixed(2), '$' + (260000.00 * randomFactor).toFixed(2)],
              ['Amazon.com Inc.', 'AMZN', 'US0231351067', '150', '$' + (1000.00 * randomFactor).toFixed(2), '$' + (150000.00 * randomFactor).toFixed(2)],
              ['Tesla Inc.', 'TSLA', 'US88160R1014', '300', '$' + (250.00 * randomFactor).toFixed(2), '$' + (75000.00 * randomFactor).toFixed(2)]
            ]
          },
          {
            title: 'Asset Allocation',
            headers: ['Asset Class', 'Value', 'Percentage'],
            rows: [
              ['Equities', '$' + (750000 * randomFactor).toFixed(2), '60%'],
              ['Fixed Income', '$' + (375000 * randomFactor).toFixed(2), '30%'],
              ['Cash', '$' + (125000 * randomFactor).toFixed(2), '10%']
            ]
          }
        ]
      };
    },

    // Update status
    updateStatus: function(file, progress, stage, error) {
      this.status.isProcessing = stage !== this.STAGES.COMPLETE && stage !== this.STAGES.FAILED;
      this.status.currentFile = file;
      this.status.progress = progress;
      this.status.stage = stage;
      this.status.error = error;

      console.log('Processing status updated:', this.status);
    },

    // Update UI
    updateUI: function() {
      try {
        // Update progress bar
        const progressBar = document.getElementById('processing-progress-bar');
        const progressText = document.getElementById('processing-progress-text');
        const statusText = document.getElementById('processing-status');

        if (progressBar) {
          progressBar.style.width = this.status.progress + '%';
        }

        if (progressText) {
          progressText.textContent = this.status.progress + '%';
        }

        if (statusText) {
          statusText.textContent = this.getStatusText();

          if (this.status.stage === this.STAGES.COMPLETE) {
            statusText.style.color = '#28a745';
            statusText.style.fontWeight = 'bold';
          } else if (this.status.stage === this.STAGES.FAILED) {
            statusText.style.color = '#dc3545';
            statusText.style.fontWeight = 'bold';
          } else {
            statusText.style.color = '';
            statusText.style.fontWeight = '';
          }
        }

        // Update process buttons
        document.querySelectorAll('#process-btn, #process-document-btn, #floating-process-btn').forEach(btn => {
          if (this.status.isProcessing) {
            btn.disabled = true;
            btn.style.opacity = '0.5';
            btn.innerHTML = 'Processing...';
          } else {
            btn.disabled = false;
            btn.style.opacity = '1';
            btn.innerHTML = this.status.stage === this.STAGES.COMPLETE ? 'Process Complete' : 'Process Document';
          }
        });
      } catch (error) {
        console.error('Error updating UI:', error);
      }
    },

    // Get status text
    getStatusText: function() {
      switch (this.status.stage) {
        case this.STAGES.INITIALIZING:
          return 'Initializing document processing...';
        case this.STAGES.EXTRACTING_TEXT:
          return 'Extracting text from document...';
        case this.STAGES.ANALYZING_STRUCTURE:
          return 'Analyzing document structure...';
        case this.STAGES.IDENTIFYING_TABLES:
          return 'Identifying tables and charts...';
        case this.STAGES.EXTRACTING_TABLE_DATA:
          return 'Extracting table data...';
        case this.STAGES.IDENTIFYING_SECURITIES:
          return 'Identifying securities information...';
        case this.STAGES.PROCESSING_FINANCIAL_DATA:
          return 'Processing financial data...';
        case this.STAGES.GENERATING_INSIGHTS:
          return 'Generating insights...';
        case this.STAGES.FINALIZING:
          return 'Finalizing document processing...';
        case this.STAGES.COMPLETE:
          return 'Processing complete!';
        case this.STAGES.FAILED:
          return 'Processing failed: ' + (this.status.error || 'Unknown error');
        default:
          return 'Processing document...';
      }
    }
  };
});
