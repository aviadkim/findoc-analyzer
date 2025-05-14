/**
 * Document Comparison
 * Provides functionality to compare multiple financial documents
 */

document.addEventListener('DOMContentLoaded', function() {
  console.log('Document comparison loaded');

  // Check if we're on the comparison page
  const isComparisonPage = window.location.pathname.includes('/compare');

  if (isComparisonPage) {
    console.log('On comparison page, initializing comparison functionality');
    initializeComparison();
  }

  // Initialize comparison functionality
  function initializeComparison() {
    // Create comparison container if it doesn't exist
    let comparisonContainer = document.getElementById('comparison-container');

    if (!comparisonContainer) {
      comparisonContainer = document.createElement('div');
      comparisonContainer.id = 'comparison-container';
      comparisonContainer.className = 'comparison-container';

      // Add to page
      const mainContent = document.querySelector('.main-content');
      if (mainContent) {
        mainContent.appendChild(comparisonContainer);
      } else {
        document.body.appendChild(comparisonContainer);
      }
    }

    // Get processed files
    let files = JSON.parse(localStorage.getItem('localFiles') || '[]');
    let processedFiles = files.filter(f => f.processed);

    // If no processed files, add mock data
    if (processedFiles.length < 2) {
      console.log('Adding mock documents for comparison');

      // Create mock documents
      const comparisonMockDocuments = [
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
        },
        {
          id: 'mock-doc-2',
          name: 'Investment Portfolio 2024.pdf',
          uploadDate: new Date().toISOString(),
          processedDate: new Date().toISOString(),
          processed: true,
          data: {
            totalValue: '$1,375,000.00',
            topHoldings: [
              { name: 'Apple Inc. (AAPL)', value: '$200,000.00', percentage: '14.5%' },
              { name: 'Microsoft Corp. (MSFT)', value: '$275,000.00', percentage: '20.0%' },
              { name: 'Alphabet Inc. (GOOG)', value: '$280,000.00', percentage: '20.4%' }
            ],
            assetAllocation: {
              equities: { value: '$825,000.00', percentage: '60%' },
              fixedIncome: { value: '$412,500.00', percentage: '30%' },
              cash: { value: '$137,500.00', percentage: '10%' }
            },
            securities: [
              { name: 'Apple Inc.', symbol: 'AAPL', isin: 'US0378331005', quantity: 1000, price: 200.00, value: 200000.00 },
              { name: 'Microsoft Corp.', symbol: 'MSFT', isin: 'US5949181045', quantity: 800, price: 343.75, value: 275000.00 },
              { name: 'Alphabet Inc.', symbol: 'GOOG', isin: 'US02079K1079', quantity: 200, price: 1400.00, value: 280000.00 },
              { name: 'Amazon.com Inc.', symbol: 'AMZN', isin: 'US0231351067', quantity: 150, price: 1100.00, value: 165000.00 },
              { name: 'Tesla Inc.', symbol: 'TSLA', isin: 'US88160R1014', quantity: 300, price: 275.00, value: 82500.00 },
              { name: 'NVIDIA Corp.', symbol: 'NVDA', isin: 'US67066G1040', quantity: 100, price: 800.00, value: 80000.00 }
            ]
          }
        }
      ];

      // Add mock documents to localStorage
      files = [...files, ...mockDocuments];
      localStorage.setItem('localFiles', JSON.stringify(files));

      // Update processed files
      processedFiles = files.filter(f => f.processed);
    }

    // Create document selector
    createDocumentSelector(processedFiles, comparisonContainer);

    // Create comparison view
    createComparisonView(comparisonContainer);
  }

  // Create document selector
  function createDocumentSelector(processedFiles, container) {
    const selectorContainer = document.createElement('div');
    selectorContainer.className = 'document-selector-container';
    selectorContainer.style.marginBottom = '20px';

    // Create title
    const title = document.createElement('h2');
    title.textContent = 'Compare Documents';
    title.style.marginBottom = '20px';

    // Create document selectors
    const selectorsDiv = document.createElement('div');
    selectorsDiv.className = 'document-selectors';
    selectorsDiv.style.display = 'flex';
    selectorsDiv.style.gap = '20px';

    // Create first document selector
    const firstSelectorDiv = document.createElement('div');
    firstSelectorDiv.className = 'document-selector';
    firstSelectorDiv.style.flex = '1';

    const firstSelectorLabel = document.createElement('label');
    firstSelectorLabel.htmlFor = 'first-document';
    firstSelectorLabel.textContent = 'First Document';

    const firstSelector = document.createElement('select');
    firstSelector.id = 'first-document';
    firstSelector.className = 'form-control';
    firstSelector.style.marginTop = '5px';

    // Add options
    const firstDefaultOption = document.createElement('option');
    firstDefaultOption.value = '';
    firstDefaultOption.textContent = '-- Select a document --';
    firstSelector.appendChild(firstDefaultOption);

    processedFiles.forEach(file => {
      const option = document.createElement('option');
      option.value = file.id;
      option.textContent = file.name;
      firstSelector.appendChild(option);
    });

    // Create second document selector
    const secondSelectorDiv = document.createElement('div');
    secondSelectorDiv.className = 'document-selector';
    secondSelectorDiv.style.flex = '1';

    const secondSelectorLabel = document.createElement('label');
    secondSelectorLabel.htmlFor = 'second-document';
    secondSelectorLabel.textContent = 'Second Document';

    const secondSelector = document.createElement('select');
    secondSelector.id = 'second-document';
    secondSelector.className = 'form-control';
    secondSelector.style.marginTop = '5px';

    // Add options
    const secondDefaultOption = document.createElement('option');
    secondDefaultOption.value = '';
    secondDefaultOption.textContent = '-- Select a document --';
    secondSelector.appendChild(secondDefaultOption);

    processedFiles.forEach(file => {
      const option = document.createElement('option');
      option.value = file.id;
      option.textContent = file.name;
      secondSelector.appendChild(option);
    });

    // Create compare button
    const compareBtn = document.createElement('button');
    compareBtn.id = 'compare-btn';
    compareBtn.className = 'btn btn-primary';
    compareBtn.textContent = 'Compare Documents';
    compareBtn.style.marginTop = '20px';

    // Add event listener
    compareBtn.addEventListener('click', function() {
      const firstDocId = firstSelector.value;
      const secondDocId = secondSelector.value;

      if (!firstDocId || !secondDocId) {
        alert('Please select two documents to compare');
        return;
      }

      if (firstDocId === secondDocId) {
        alert('Please select two different documents');
        return;
      }

      compareDocuments(firstDocId, secondDocId);
    });

    // Assemble selectors
    firstSelectorDiv.appendChild(firstSelectorLabel);
    firstSelectorDiv.appendChild(firstSelector);

    secondSelectorDiv.appendChild(secondSelectorLabel);
    secondSelectorDiv.appendChild(secondSelector);

    selectorsDiv.appendChild(firstSelectorDiv);
    selectorsDiv.appendChild(secondSelectorDiv);

    // Assemble container
    selectorContainer.appendChild(title);
    selectorContainer.appendChild(selectorsDiv);
    selectorContainer.appendChild(compareBtn);

    // Add to main container
    container.appendChild(selectorContainer);
  }

  // Create comparison view
  function createComparisonView(container) {
    const comparisonView = document.createElement('div');
    comparisonView.id = 'comparison-view';
    comparisonView.className = 'comparison-view';
    comparisonView.style.display = 'none';

    // Add to container
    container.appendChild(comparisonView);
  }

  // Compare documents
  function compareDocuments(firstDocId, secondDocId) {
    console.log(`Comparing documents: ${firstDocId} and ${secondDocId}`);

    // Get files
    const files = JSON.parse(localStorage.getItem('localFiles') || '[]');
    const firstDoc = files.find(f => f.id === firstDocId);
    const secondDoc = files.find(f => f.id === secondDocId);

    if (!firstDoc || !secondDoc) {
      alert('One or both documents not found');
      return;
    }

    // Get comparison view
    const comparisonView = document.getElementById('comparison-view');
    if (!comparisonView) {
      alert('Comparison view not found');
      return;
    }

    // Show comparison view
    comparisonView.style.display = 'block';

    // Create comparison content
    comparisonView.innerHTML = `
      <h3>Comparison Results</h3>
      <div class="comparison-header">
        <div class="comparison-doc-info">
          <h4>${firstDoc.name}</h4>
          <p>Processed on: ${new Date(firstDoc.processedDate).toLocaleString()}</p>
        </div>
        <div class="comparison-doc-info">
          <h4>${secondDoc.name}</h4>
          <p>Processed on: ${new Date(secondDoc.processedDate).toLocaleString()}</p>
        </div>
      </div>

      <div class="comparison-section">
        <h4>Portfolio Value Comparison</h4>
        <div class="comparison-table-container">
          <table class="comparison-table">
            <thead>
              <tr>
                <th>Metric</th>
                <th>${firstDoc.name}</th>
                <th>${secondDoc.name}</th>
                <th>Difference</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Total Value</td>
                <td>${firstDoc.data.totalValue}</td>
                <td>${secondDoc.data.totalValue}</td>
                <td>${calculateDifference(firstDoc.data.totalValue, secondDoc.data.totalValue)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="comparison-section">
        <h4>Top Holdings Comparison</h4>
        <div class="comparison-table-container">
          <table class="comparison-table">
            <thead>
              <tr>
                <th>Security</th>
                <th>${firstDoc.name} Value</th>
                <th>${secondDoc.name} Value</th>
                <th>Difference</th>
              </tr>
            </thead>
            <tbody>
              ${compareHoldings(firstDoc.data.securities, secondDoc.data.securities)}
            </tbody>
          </table>
        </div>
      </div>

      <div class="comparison-section">
        <h4>Asset Allocation Comparison</h4>
        <div class="comparison-table-container">
          <table class="comparison-table">
            <thead>
              <tr>
                <th>Asset Class</th>
                <th>${firstDoc.name}</th>
                <th>${secondDoc.name}</th>
                <th>Difference</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Equities</td>
                <td>${firstDoc.data.assetAllocation.equities.percentage}</td>
                <td>${secondDoc.data.assetAllocation.equities.percentage}</td>
                <td>${calculatePercentageDifference(firstDoc.data.assetAllocation.equities.percentage, secondDoc.data.assetAllocation.equities.percentage)}</td>
              </tr>
              <tr>
                <td>Fixed Income</td>
                <td>${firstDoc.data.assetAllocation.fixedIncome.percentage}</td>
                <td>${secondDoc.data.assetAllocation.fixedIncome.percentage}</td>
                <td>${calculatePercentageDifference(firstDoc.data.assetAllocation.fixedIncome.percentage, secondDoc.data.assetAllocation.fixedIncome.percentage)}</td>
              </tr>
              <tr>
                <td>Cash</td>
                <td>${firstDoc.data.assetAllocation.cash.percentage}</td>
                <td>${secondDoc.data.assetAllocation.cash.percentage}</td>
                <td>${calculatePercentageDifference(firstDoc.data.assetAllocation.cash.percentage, secondDoc.data.assetAllocation.cash.percentage)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    `;

    // Style the comparison view
    styleComparisonView();
  }

  // Compare holdings
  function compareHoldings(firstSecurities, secondSecurities) {
    // Create a map of all securities
    const securitiesMap = new Map();

    // Add first document securities
    firstSecurities.forEach(security => {
      securitiesMap.set(security.symbol, {
        name: security.name,
        symbol: security.symbol,
        firstValue: security.value,
        secondValue: 0
      });
    });

    // Add second document securities
    secondSecurities.forEach(security => {
      if (securitiesMap.has(security.symbol)) {
        // Update existing security
        const existingSecurity = securitiesMap.get(security.symbol);
        existingSecurity.secondValue = security.value;
      } else {
        // Add new security
        securitiesMap.set(security.symbol, {
          name: security.name,
          symbol: security.symbol,
          firstValue: 0,
          secondValue: security.value
        });
      }
    });

    // Convert map to array and sort by name
    const securities = Array.from(securitiesMap.values())
      .sort((a, b) => a.name.localeCompare(b.name));

    // Generate table rows
    return securities.map(security => `
      <tr>
        <td>${security.name} (${security.symbol})</td>
        <td>$${security.firstValue.toFixed(2)}</td>
        <td>$${security.secondValue.toFixed(2)}</td>
        <td>${calculateValueDifference(security.firstValue, security.secondValue)}</td>
      </tr>
    `).join('');
  }

  // Calculate difference
  function calculateDifference(first, second) {
    // Extract numeric values
    const firstValue = parseFloat(first.replace(/[^0-9.-]+/g, ''));
    const secondValue = parseFloat(second.replace(/[^0-9.-]+/g, ''));

    const difference = secondValue - firstValue;
    const percentChange = (difference / firstValue) * 100;

    const formattedDifference = difference.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD'
    });

    const formattedPercent = percentChange.toFixed(2) + '%';

    const color = difference > 0 ? 'green' : difference < 0 ? 'red' : 'black';

    return `<span style="color: ${color}">${formattedDifference} (${formattedPercent})</span>`;
  }

  // Calculate value difference
  function calculateValueDifference(first, second) {
    const difference = second - first;
    const percentChange = first === 0 ? 0 : (difference / first) * 100;

    const formattedDifference = difference.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD'
    });

    const formattedPercent = percentChange.toFixed(2) + '%';

    const color = difference > 0 ? 'green' : difference < 0 ? 'red' : 'black';

    return `<span style="color: ${color}">${formattedDifference} (${formattedPercent})</span>`;
  }

  // Calculate percentage difference
  function calculatePercentageDifference(first, second) {
    // Extract numeric values
    const firstValue = parseFloat(first.replace(/[^0-9.-]+/g, ''));
    const secondValue = parseFloat(second.replace(/[^0-9.-]+/g, ''));

    const difference = secondValue - firstValue;

    const formattedDifference = difference.toFixed(1) + '%';

    const color = difference > 0 ? 'green' : difference < 0 ? 'red' : 'black';

    return `<span style="color: ${color}">${formattedDifference}</span>`;
  }

  // Style comparison view
  function styleComparisonView() {
    const style = document.createElement('style');
    style.textContent = `
      .comparison-header {
        display: flex;
        justify-content: space-between;
        margin-bottom: 20px;
      }

      .comparison-doc-info {
        flex: 1;
        padding: 10px;
        background-color: #f5f5f5;
        border-radius: 5px;
        margin: 0 10px;
      }

      .comparison-doc-info h4 {
        margin-top: 0;
      }

      .comparison-section {
        margin-bottom: 30px;
      }

      .comparison-table-container {
        overflow-x: auto;
      }

      .comparison-table {
        width: 100%;
        border-collapse: collapse;
      }

      .comparison-table th, .comparison-table td {
        padding: 10px;
        text-align: left;
        border-bottom: 1px solid #ddd;
      }

      .comparison-table th {
        background-color: #f5f5f5;
      }

      .comparison-table tr:hover {
        background-color: #f9f9f9;
      }
    `;

    document.head.appendChild(style);
  }
});
