/**
 * Export Functionality
 * Provides functionality to export document data in various formats
 */

document.addEventListener('DOMContentLoaded', function() {
  console.log('Export functionality loaded');

  // Check if we're on a page with document data
  const isDocumentPage = window.location.pathname.includes('/document/') ||
                         window.location.pathname.includes('/documents') ||
                         window.location.pathname.includes('/document-chat');

  if (isDocumentPage) {
    console.log('On document page, initializing export functionality');
    initializeExport();
  }

  // Initialize export functionality
  function initializeExport() {
    // Add export button to the page
    addExportButton();

    // Add mock documents if needed
    addMockDocumentsIfNeeded();
  }

  // Add mock documents if needed
  function addMockDocumentsIfNeeded() {
    // Get processed files
    let files = JSON.parse(localStorage.getItem('localFiles') || '[]');
    let processedFiles = files.filter(f => f.processed);

    // If no processed files, add mock data
    if (processedFiles.length === 0) {
      console.log('Adding mock documents for export');

      // Create mock documents
      const mockDocuments = [
        {
          id: 'mock-doc-1',
          name: 'Financial Report 2023.pdf',
          uploadDate: new Date().toISOString(),
          processedDate: new Date().toISOString(),
          processed: true,
          data: {
            totalValue: '$1,250,000.00',
            topHoldings: [
              { name: 'Apple Inc. (AAPL)', value: '$175,000.00', percentage: '14.0%' },
              { name: 'Microsoft Corp. (MSFT)', value: '$240,000.00', percentage: '19.2%' },
              { name: 'Alphabet Inc. (GOOG)', value: '$260,000.00', percentage: '20.8%' }
            ],
            assetAllocation: {
              equities: { value: '$750,000.00', percentage: '60%' },
              fixedIncome: { value: '$375,000.00', percentage: '30%' },
              cash: { value: '$125,000.00', percentage: '10%' }
            },
            securities: [
              { name: 'Apple Inc.', symbol: 'AAPL', isin: 'US0378331005', quantity: 1000, price: 175.00, value: 175000.00 },
              { name: 'Microsoft Corp.', symbol: 'MSFT', isin: 'US5949181045', quantity: 800, price: 300.00, value: 240000.00 },
              { name: 'Alphabet Inc.', symbol: 'GOOG', isin: 'US02079K1079', quantity: 200, price: 1300.00, value: 260000.00 },
              { name: 'Amazon.com Inc.', symbol: 'AMZN', isin: 'US0231351067', quantity: 150, price: 1000.00, value: 150000.00 },
              { name: 'Tesla Inc.', symbol: 'TSLA', isin: 'US88160R1014', quantity: 300, price: 250.00, value: 75000.00 }
            ]
          }
        }
      ];

      // Add mock documents to localStorage
      files = [...files, ...mockDocuments];
      localStorage.setItem('localFiles', JSON.stringify(files));
    }
  }

  // Add export button
  function addExportButton() {
    // Check if button already exists
    if (document.getElementById('export-btn')) {
      return;
    }

    // Create button
    const exportBtn = document.createElement('button');
    exportBtn.id = 'export-btn';
    exportBtn.className = 'btn btn-outline';
    exportBtn.innerHTML = '<i class="fas fa-download"></i> Export';
    exportBtn.style.position = 'fixed';
    exportBtn.style.bottom = '80px';
    exportBtn.style.right = '20px';
    exportBtn.style.zIndex = '999';
    exportBtn.style.padding = '10px 15px';
    exportBtn.style.backgroundColor = '#fff';
    exportBtn.style.border = '1px solid #ddd';
    exportBtn.style.borderRadius = '5px';
    exportBtn.style.boxShadow = '0 2px 5px rgba(0,0,0,0.1)';

    // Add event listener
    exportBtn.addEventListener('click', function() {
      showExportOptions();
    });

    // Add to page
    document.body.appendChild(exportBtn);

    // Force immediate display for testing
    setTimeout(() => {
      // Create a second export button that's always visible for testing
      const testExportBtn = document.createElement('button');
      testExportBtn.id = 'export-btn-test';
      testExportBtn.className = 'btn btn-outline';
      testExportBtn.innerHTML = '<i class="fas fa-download"></i> Export';
      testExportBtn.style.position = 'fixed';
      testExportBtn.style.top = '20px';
      testExportBtn.style.right = '20px';
      testExportBtn.style.zIndex = '9999';
      testExportBtn.style.padding = '10px 15px';
      testExportBtn.style.backgroundColor = '#fff';
      testExportBtn.style.border = '1px solid #ddd';
      testExportBtn.style.borderRadius = '5px';
      testExportBtn.style.boxShadow = '0 2px 5px rgba(0,0,0,0.1)';

      // Add event listener
      testExportBtn.addEventListener('click', function() {
        showExportOptions();
      });

      // Add to page
      document.body.appendChild(testExportBtn);

      console.log('Export buttons added to page');
    }, 500);
  }

  // Show export options
  function showExportOptions() {
    // Create modal backdrop
    const backdrop = document.createElement('div');
    backdrop.className = 'export-modal-backdrop';
    backdrop.style.position = 'fixed';
    backdrop.style.top = '0';
    backdrop.style.left = '0';
    backdrop.style.width = '100%';
    backdrop.style.height = '100%';
    backdrop.style.backgroundColor = 'rgba(0,0,0,0.5)';
    backdrop.style.zIndex = '1000';
    backdrop.style.display = 'flex';
    backdrop.style.justifyContent = 'center';
    backdrop.style.alignItems = 'center';

    // Create modal
    const modal = document.createElement('div');
    modal.className = 'export-modal';
    modal.style.backgroundColor = '#fff';
    modal.style.borderRadius = '5px';
    modal.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
    modal.style.width = '400px';
    modal.style.maxWidth = '90%';
    modal.style.padding = '20px';

    // Create modal content
    const title = document.createElement('h3');
    title.textContent = 'Export Options';
    title.style.marginTop = '0';

    const description = document.createElement('p');
    description.textContent = 'Select a document and export format:';

    // Create document selector
    const documentSelector = document.createElement('select');
    documentSelector.id = 'export-document-select';
    documentSelector.className = 'form-control';
    documentSelector.style.marginBottom = '15px';

    // Add options
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = '-- Select a document --';
    documentSelector.appendChild(defaultOption);

    // Get processed files
    const files = JSON.parse(localStorage.getItem('localFiles') || '[]');
    const processedFiles = files.filter(f => f.processed);

    processedFiles.forEach(file => {
      const option = document.createElement('option');
      option.value = file.id;
      option.textContent = file.name;
      documentSelector.appendChild(option);
    });

    // Create format selector
    const formatSelector = document.createElement('select');
    formatSelector.id = 'export-format-select';
    formatSelector.className = 'form-control';
    formatSelector.style.marginBottom = '20px';

    // Add format options
    const formats = [
      { value: 'csv', label: 'CSV' },
      { value: 'excel', label: 'Excel' },
      { value: 'pdf', label: 'PDF' },
      { value: 'json', label: 'JSON' }
    ];

    const formatDefaultOption = document.createElement('option');
    formatDefaultOption.value = '';
    formatDefaultOption.textContent = '-- Select a format --';
    formatSelector.appendChild(formatDefaultOption);

    formats.forEach(format => {
      const option = document.createElement('option');
      option.value = format.value;
      option.textContent = format.label;
      formatSelector.appendChild(option);
    });

    // Create buttons
    const buttonContainer = document.createElement('div');
    buttonContainer.style.display = 'flex';
    buttonContainer.style.justifyContent = 'flex-end';
    buttonContainer.style.gap = '10px';

    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = 'Cancel';
    cancelBtn.className = 'btn btn-outline';
    cancelBtn.onclick = function() {
      backdrop.remove();
    };

    const exportBtn = document.createElement('button');
    exportBtn.textContent = 'Export';
    exportBtn.className = 'btn btn-primary';
    exportBtn.onclick = function() {
      const documentId = documentSelector.value;
      const format = formatSelector.value;

      if (!documentId) {
        alert('Please select a document');
        return;
      }

      if (!format) {
        alert('Please select an export format');
        return;
      }

      exportDocument(documentId, format);
      backdrop.remove();
    };

    buttonContainer.appendChild(cancelBtn);
    buttonContainer.appendChild(exportBtn);

    // Assemble modal
    modal.appendChild(title);
    modal.appendChild(description);
    modal.appendChild(documentSelector);
    modal.appendChild(formatSelector);
    modal.appendChild(buttonContainer);

    // Add to backdrop
    backdrop.appendChild(modal);

    // Add to body
    document.body.appendChild(backdrop);
  }

  // Export document using server API
  function exportDocument(documentId, format) {
    console.log(`Exporting document ${documentId} in ${format} format`);

    // Get document data
    const files = JSON.parse(localStorage.getItem('localFiles') || '[]');
    const file = files.find(f => f.id === documentId);

    if (!file) {
      alert('Document not found');
      return;
    }

    // Show loading indicator
    const loadingIndicator = document.createElement('div');
    loadingIndicator.id = 'export-loading';
    loadingIndicator.style.position = 'fixed';
    loadingIndicator.style.top = '50%';
    loadingIndicator.style.left = '50%';
    loadingIndicator.style.transform = 'translate(-50%, -50%)';
    loadingIndicator.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
    loadingIndicator.style.padding = '20px';
    loadingIndicator.style.borderRadius = '5px';
    loadingIndicator.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.2)';
    loadingIndicator.style.zIndex = '9999';
    loadingIndicator.innerHTML = `<div>Exporting ${format.toUpperCase()} file...</div>`;
    document.body.appendChild(loadingIndicator);

    // Use server API instead of client-side export
    fetch(`/api/securities-export/document/${documentId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        format,
        options: {
          includeMetadata: true,
          includeLogo: false,
          includeMarketData: true,
          documentInfo: {
            id: file.id,
            name: file.name,
            type: file.type || 'Financial Document',
            uploadDate: file.uploadDate,
            processingDate: file.processedDate
          }
        }
      })
    })
    .then(response => response.json())
    .then(data => {
      // Remove loading indicator
      document.body.removeChild(loadingIndicator);

      if (data.success) {
        // Create download link
        const downloadLink = document.createElement('a');
        downloadLink.href = data.export.downloadUrl;
        downloadLink.target = '_blank';
        downloadLink.download = data.export.fileName || `export.${format}`;
        
        // Trigger download
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        
        console.log('Export successful:', data);
      } else {
        console.error('Export failed:', data);
        alert(`Export failed: ${data.error || 'Unknown error'}`);
      }
    })
    .catch(error => {
      // Remove loading indicator
      if (document.getElementById('export-loading')) {
        document.body.removeChild(loadingIndicator);
      }

      console.error('Error during export:', error);
      alert(`Export error: ${error.message}`);
      
      // Fall back to client-side export
      console.log('Falling back to client-side export');
      switch (format) {
        case 'csv':
          exportCSV(file);
          break;
        case 'excel':
          exportExcel(file);
          break;
        case 'pdf':
          exportPDF(file);
          break;
        case 'json':
          exportJSON(file);
          break;
      }
    });
  }

  // Export as CSV (fallback method)
  function exportCSV(file) {
    // Create CSV content
    let csvContent = 'Symbol,Name,ISIN,Quantity,Price,Value\n';

    file.data.securities.forEach(security => {
      csvContent += `${security.symbol},${security.name},${security.isin},${security.quantity},${security.price},${security.value}\n`;
    });

    // Create download link
    const encodedUri = encodeURI('data:text/csv;charset=utf-8,' + csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${file.name.replace(/\.[^/.]+$/, '')}_securities.csv`);
    document.body.appendChild(link);

    // Trigger download
    link.click();

    // Clean up
    document.body.removeChild(link);
    console.log('CSV export completed (client-side fallback)');
  }

  // Export as Excel (fallback method)
  function exportExcel(file) {
    // For simplicity, we'll use CSV format with .xlsx extension
    // In a real application, you would use a library like SheetJS

    // Create CSV content
    let csvContent = 'Symbol,Name,ISIN,Quantity,Price,Value\n';

    file.data.securities.forEach(security => {
      csvContent += `${security.symbol},${security.name},${security.isin},${security.quantity},${security.price},${security.value}\n`;
    });

    // Create download link
    const blob = new Blob([csvContent], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${file.name.replace(/\.[^/.]+$/, '')}_securities.xlsx`);
    document.body.appendChild(link);

    // Trigger download
    link.click();

    // Clean up
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    console.log('Excel export completed (client-side fallback)');
  }

  // Export as PDF (fallback method)
  function exportPDF(file) {
    // Create a printable div
    const printDiv = document.createElement('div');
    printDiv.style.display = 'none';

    // Create content
    printDiv.innerHTML = `
      <h1>${file.name}</h1>
      <p>Processed on: ${new Date(file.processedDate).toLocaleString()}</p>

      <h2>Portfolio Summary</h2>
      <p>Total Value: ${file.data.totalValue}</p>

      <h3>Asset Allocation</h3>
      <ul>
        <li>Equities: ${file.data.assetAllocation.equities.percentage} (${file.data.assetAllocation.equities.value})</li>
        <li>Fixed Income: ${file.data.assetAllocation.fixedIncome.percentage} (${file.data.assetAllocation.fixedIncome.value})</li>
        <li>Cash: ${file.data.assetAllocation.cash.percentage} (${file.data.assetAllocation.cash.value})</li>
      </ul>

      <h3>Top Holdings</h3>
      <ul>
        ${file.data.topHoldings.map(holding => `<li>${holding.name} - ${holding.value} (${holding.percentage})</li>`).join('')}
      </ul>

      <h3>Securities</h3>
      <table border="1" cellpadding="5" cellspacing="0" width="100%">
        <thead>
          <tr>
            <th>Symbol</th>
            <th>Name</th>
            <th>ISIN</th>
            <th>Quantity</th>
            <th>Price</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
          ${file.data.securities.map(security => `
            <tr>
              <td>${security.symbol}</td>
              <td>${security.name}</td>
              <td>${security.isin}</td>
              <td>${security.quantity}</td>
              <td>$${security.price.toFixed(2)}</td>
              <td>$${security.value.toFixed(2)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;

    // Add to body
    document.body.appendChild(printDiv);

    // Print
    window.print();

    // Clean up
    document.body.removeChild(printDiv);
    console.log('PDF export completed (client-side fallback)');
  }

  // Export as JSON (fallback method)
  function exportJSON(file) {
    // Create JSON content
    const jsonContent = JSON.stringify(file.data, null, 2);

    // Create download link
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${file.name.replace(/\.[^/.]+$/, '')}_data.json`);
    document.body.appendChild(link);

    // Trigger download
    link.click();

    // Clean up
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    console.log('JSON export completed (client-side fallback)');
  }
  
  // Export portfolio comparison
  function exportPortfolioComparison(portfolioIds, format) {
    console.log(`Exporting portfolio comparison for portfolios ${portfolioIds.join(', ')} in ${format} format`);
    
    if (!portfolioIds || portfolioIds.length === 0) {
      alert('Please select at least one portfolio to export');
      return;
    }
    
    // Show loading indicator
    const loadingIndicator = document.createElement('div');
    loadingIndicator.id = 'comparison-export-loading';
    loadingIndicator.style.position = 'fixed';
    loadingIndicator.style.top = '50%';
    loadingIndicator.style.left = '50%';
    loadingIndicator.style.transform = 'translate(-50%, -50%)';
    loadingIndicator.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
    loadingIndicator.style.padding = '20px';
    loadingIndicator.style.borderRadius = '5px';
    loadingIndicator.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.2)';
    loadingIndicator.style.zIndex = '9999';
    loadingIndicator.innerHTML = `<div>Exporting portfolio comparison as ${format.toUpperCase()}...</div>`;
    document.body.appendChild(loadingIndicator);
    
    // Use server API for portfolio comparison export
    fetch('/api/securities-export/comparison', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        documentIds: portfolioIds,
        format,
        options: {
          includeMetadata: true,
          includeMarketData: true,
          fileName: `portfolio_comparison_${Date.now()}.${format === 'excel' ? 'xlsx' : format}`
        }
      })
    })
    .then(response => response.json())
    .then(data => {
      // Remove loading indicator
      document.body.removeChild(loadingIndicator);
      
      if (data.success) {
        // Create download link
        const downloadLink = document.createElement('a');
        downloadLink.href = data.export.downloadUrl;
        downloadLink.target = '_blank';
        downloadLink.download = `portfolio_comparison.${format === 'excel' ? 'xlsx' : format}`;
        
        // Trigger download
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        
        console.log('Portfolio comparison export successful:', data);
      } else {
        console.error('Portfolio comparison export failed:', data);
        alert(`Export failed: ${data.error || 'Unknown error'}`);
      }
    })
    .catch(error => {
      // Remove loading indicator
      if (document.getElementById('comparison-export-loading')) {
        document.body.removeChild(loadingIndicator);
      }
      
      console.error('Error during portfolio comparison export:', error);
      alert(`Export error: ${error.message}`);
    });
  }
});
