/**
 * Analytics Dashboard Component
 * Adds an analytics dashboard to the Analytics page
 */

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  console.log('Analytics Dashboard Component initializing...');
  
  // Add analytics dashboard if on Analytics page
  if (window.location.pathname.includes('/analytics') || window.location.pathname.includes('/analytics-new')) {
    addAnalyticsDashboard();
  }
  
  console.log('Analytics Dashboard Component initialized');
});

/**
 * Add analytics dashboard to page
 */
function addAnalyticsDashboard() {
  // Check if analytics dashboard already exists
  if (document.querySelector('.analytics-dashboard')) {
    return;
  }
  
  // Create container for analytics dashboard
  const analyticsDashboardContainer = document.createElement('div');
  analyticsDashboardContainer.className = 'analytics-dashboard-container';
  analyticsDashboardContainer.style.margin = '20px 0';
  
  // Create analytics dashboard header
  const analyticsDashboardHeader = document.createElement('div');
  analyticsDashboardHeader.className = 'analytics-dashboard-header';
  analyticsDashboardHeader.style.display = 'flex';
  analyticsDashboardHeader.style.justifyContent = 'space-between';
  analyticsDashboardHeader.style.alignItems = 'center';
  analyticsDashboardHeader.style.marginBottom = '20px';
  
  const analyticsDashboardTitle = document.createElement('h2');
  analyticsDashboardTitle.textContent = 'Analytics Dashboard';
  analyticsDashboardTitle.style.margin = '0';
  
  const analyticsDashboardActions = document.createElement('div');
  analyticsDashboardActions.className = 'analytics-dashboard-actions';
  
  const refreshButton = document.createElement('button');
  refreshButton.className = 'btn btn-secondary';
  refreshButton.textContent = 'Refresh';
  refreshButton.style.marginRight = '10px';
  
  const exportButton = document.createElement('button');
  exportButton.className = 'btn btn-primary';
  exportButton.textContent = 'Export';
  
  refreshButton.addEventListener('click', function() {
    loadAnalytics();
  });
  
  exportButton.addEventListener('click', function() {
    alert('Analytics data exported!');
  });
  
  analyticsDashboardActions.appendChild(refreshButton);
  analyticsDashboardActions.appendChild(exportButton);
  
  analyticsDashboardHeader.appendChild(analyticsDashboardTitle);
  analyticsDashboardHeader.appendChild(analyticsDashboardActions);
  
  // Create analytics dashboard
  const analyticsDashboard = document.createElement('div');
  analyticsDashboard.className = 'analytics-dashboard';
  
  // Create analytics filters
  const analyticsFilters = document.createElement('div');
  analyticsFilters.className = 'analytics-filters';
  analyticsFilters.style.display = 'flex';
  analyticsFilters.style.justifyContent = 'space-between';
  analyticsFilters.style.alignItems = 'center';
  analyticsFilters.style.padding = '15px';
  analyticsFilters.style.backgroundColor = '#f5f5f5';
  analyticsFilters.style.borderRadius = '5px';
  analyticsFilters.style.marginBottom = '20px';
  
  const dateRangeFilter = document.createElement('div');
  dateRangeFilter.className = 'date-range-filter';
  
  const dateRangeLabel = document.createElement('label');
  dateRangeLabel.textContent = 'Date Range:';
  dateRangeLabel.style.marginRight = '10px';
  
  const dateRangeSelect = document.createElement('select');
  dateRangeSelect.style.padding = '5px 10px';
  dateRangeSelect.style.border = '1px solid #ddd';
  dateRangeSelect.style.borderRadius = '3px';
  
  const dateRangeOptions = [
    { value: 'last7days', text: 'Last 7 Days' },
    { value: 'last30days', text: 'Last 30 Days' },
    { value: 'last90days', text: 'Last 90 Days' },
    { value: 'lastYear', text: 'Last Year' },
    { value: 'custom', text: 'Custom Range' }
  ];
  
  dateRangeOptions.forEach(option => {
    const optionElement = document.createElement('option');
    optionElement.value = option.value;
    optionElement.textContent = option.text;
    dateRangeSelect.appendChild(optionElement);
  });
  
  dateRangeFilter.appendChild(dateRangeLabel);
  dateRangeFilter.appendChild(dateRangeSelect);
  
  const documentTypeFilter = document.createElement('div');
  documentTypeFilter.className = 'document-type-filter';
  
  const documentTypeLabel = document.createElement('label');
  documentTypeLabel.textContent = 'Document Type:';
  documentTypeLabel.style.marginRight = '10px';
  
  const documentTypeSelect = document.createElement('select');
  documentTypeSelect.style.padding = '5px 10px';
  documentTypeSelect.style.border = '1px solid #ddd';
  documentTypeSelect.style.borderRadius = '3px';
  
  const documentTypeOptions = [
    { value: 'all', text: 'All Types' },
    { value: 'pdf', text: 'PDF Documents' },
    { value: 'excel', text: 'Excel Documents' },
    { value: 'csv', text: 'CSV Documents' }
  ];
  
  documentTypeOptions.forEach(option => {
    const optionElement = document.createElement('option');
    optionElement.value = option.value;
    optionElement.textContent = option.text;
    documentTypeSelect.appendChild(optionElement);
  });
  
  documentTypeFilter.appendChild(documentTypeLabel);
  documentTypeFilter.appendChild(documentTypeSelect);
  
  const applyFiltersButton = document.createElement('button');
  applyFiltersButton.className = 'btn btn-primary';
  applyFiltersButton.textContent = 'Apply Filters';
  applyFiltersButton.addEventListener('click', function() {
    loadAnalytics();
  });
  
  analyticsFilters.appendChild(dateRangeFilter);
  analyticsFilters.appendChild(documentTypeFilter);
  analyticsFilters.appendChild(applyFiltersButton);
  
  // Create analytics charts container
  const analyticsChartsContainer = document.createElement('div');
  analyticsChartsContainer.className = 'analytics-charts-container';
  analyticsChartsContainer.style.display = 'flex';
  analyticsChartsContainer.style.flexWrap = 'wrap';
  analyticsChartsContainer.style.gap = '20px';
  
  // Create document count chart
  const documentCountChart = createChart('Document Count', 'bar');
  documentCountChart.className = 'analytics-chart';
  
  // Create document size chart
  const documentSizeChart = createChart('Document Size', 'bar');
  documentSizeChart.className = 'analytics-chart';
  
  // Create document type chart
  const documentTypeChart = createChart('Document Types', 'pie');
  documentTypeChart.className = 'analytics-chart';
  
  // Create document upload trend chart
  const documentUploadTrendChart = createChart('Upload Trend', 'line');
  documentUploadTrendChart.className = 'analytics-chart';
  
  // Add charts to container
  analyticsChartsContainer.appendChild(documentCountChart);
  analyticsChartsContainer.appendChild(documentSizeChart);
  analyticsChartsContainer.appendChild(documentTypeChart);
  analyticsChartsContainer.appendChild(documentUploadTrendChart);
  
  // Create analytics stats container
  const analyticsStatsContainer = document.createElement('div');
  analyticsStatsContainer.className = 'analytics-stats-container';
  analyticsStatsContainer.style.display = 'flex';
  analyticsStatsContainer.style.flexWrap = 'wrap';
  analyticsStatsContainer.style.gap = '20px';
  analyticsStatsContainer.style.marginTop = '20px';
  
  // Create total documents stat
  const totalDocumentsStat = createStat('Total Documents', '25');
  
  // Create total size stat
  const totalSizeStat = createStat('Total Size', '45.2 MB');
  
  // Create average size stat
  const averageSizeStat = createStat('Average Size', '1.8 MB');
  
  // Create most common type stat
  const mostCommonTypeStat = createStat('Most Common Type', 'PDF (60%)');
  
  // Add stats to container
  analyticsStatsContainer.appendChild(totalDocumentsStat);
  analyticsStatsContainer.appendChild(totalSizeStat);
  analyticsStatsContainer.appendChild(averageSizeStat);
  analyticsStatsContainer.appendChild(mostCommonTypeStat);
  
  // Create analytics loading state
  const loadingState = document.createElement('div');
  loadingState.id = 'analytics-loading';
  loadingState.style.padding = '50px 20px';
  loadingState.style.textAlign = 'center';
  loadingState.style.display = 'none';
  
  const loadingSpinner = document.createElement('div');
  loadingSpinner.className = 'loading-spinner';
  loadingSpinner.style.display = 'inline-block';
  loadingSpinner.style.width = '40px';
  loadingSpinner.style.height = '40px';
  loadingSpinner.style.border = '4px solid #f3f3f3';
  loadingSpinner.style.borderTop = '4px solid #3498db';
  loadingSpinner.style.borderRadius = '50%';
  loadingSpinner.style.animation = 'spin 1s linear infinite';
  
  const loadingText = document.createElement('p');
  loadingText.textContent = 'Loading analytics...';
  loadingText.style.marginTop = '20px';
  
  loadingState.appendChild(loadingSpinner);
  loadingState.appendChild(loadingText);
  
  // Add loading animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);
  
  // Add elements to analytics dashboard
  analyticsDashboard.appendChild(analyticsFilters);
  analyticsDashboard.appendChild(analyticsChartsContainer);
  analyticsDashboard.appendChild(analyticsStatsContainer);
  analyticsDashboard.appendChild(loadingState);
  
  // Add elements to analytics dashboard container
  analyticsDashboardContainer.appendChild(analyticsDashboardHeader);
  analyticsDashboardContainer.appendChild(analyticsDashboard);
  
  // Find a good place to insert the analytics dashboard
  const main = document.querySelector('main') || document.querySelector('.main-content');
  if (main) {
    // Check if there's a welcome message
    const welcomeMessage = main.querySelector('h1');
    if (welcomeMessage) {
      // Insert after the welcome message
      welcomeMessage.parentNode.insertBefore(analyticsDashboardContainer, welcomeMessage.nextSibling);
    } else {
      // Insert at the beginning of main
      main.insertBefore(analyticsDashboardContainer, main.firstChild);
    }
  } else {
    // Insert in the body
    document.body.appendChild(analyticsDashboardContainer);
  }
  
  console.log('Analytics dashboard added successfully!');
  
  // Load analytics
  loadAnalytics();
}

/**
 * Create a chart
 * @param {string} title - Chart title
 * @param {string} type - Chart type (bar, line, pie)
 * @returns {HTMLElement} Chart element
 */
function createChart(title, type) {
  const chart = document.createElement('div');
  chart.style.width = 'calc(50% - 10px)';
  chart.style.minWidth = '300px';
  chart.style.border = '1px solid #ddd';
  chart.style.borderRadius = '5px';
  chart.style.overflow = 'hidden';
  chart.style.marginBottom = '20px';
  
  const chartHeader = document.createElement('div');
  chartHeader.style.backgroundColor = '#f5f5f5';
  chartHeader.style.padding = '10px';
  chartHeader.style.borderBottom = '1px solid #ddd';
  
  const chartTitle = document.createElement('h3');
  chartTitle.textContent = title;
  chartTitle.style.margin = '0';
  chartTitle.style.fontSize = '16px';
  
  chartHeader.appendChild(chartTitle);
  
  const chartBody = document.createElement('div');
  chartBody.style.padding = '20px';
  chartBody.style.height = '250px';
  chartBody.style.display = 'flex';
  chartBody.style.justifyContent = 'center';
  chartBody.style.alignItems = 'center';
  
  // Create mock chart based on type
  if (type === 'bar') {
    const barChart = createBarChart();
    chartBody.appendChild(barChart);
  } else if (type === 'line') {
    const lineChart = createLineChart();
    chartBody.appendChild(lineChart);
  } else if (type === 'pie') {
    const pieChart = createPieChart();
    chartBody.appendChild(pieChart);
  }
  
  chart.appendChild(chartHeader);
  chart.appendChild(chartBody);
  
  return chart;
}

/**
 * Create a bar chart
 * @returns {HTMLElement} Bar chart element
 */
function createBarChart() {
  const chart = document.createElement('div');
  chart.style.width = '100%';
  chart.style.height = '100%';
  chart.style.display = 'flex';
  chart.style.alignItems = 'flex-end';
  chart.style.justifyContent = 'space-around';
  
  const barColors = ['#4e73df', '#1cc88a', '#36b9cc', '#f6c23e', '#e74a3b'];
  
  for (let i = 0; i < 5; i++) {
    const barHeight = Math.floor(Math.random() * 80) + 20; // Random height between 20% and 100%
    
    const barContainer = document.createElement('div');
    barContainer.style.display = 'flex';
    barContainer.style.flexDirection = 'column';
    barContainer.style.alignItems = 'center';
    barContainer.style.width = '15%';
    
    const bar = document.createElement('div');
    bar.style.width = '100%';
    bar.style.height = `${barHeight}%`;
    bar.style.backgroundColor = barColors[i % barColors.length];
    bar.style.borderRadius = '3px 3px 0 0';
    
    const label = document.createElement('div');
    label.textContent = `Label ${i + 1}`;
    label.style.marginTop = '5px';
    label.style.fontSize = '12px';
    
    barContainer.appendChild(bar);
    barContainer.appendChild(label);
    
    chart.appendChild(barContainer);
  }
  
  return chart;
}

/**
 * Create a line chart
 * @returns {HTMLElement} Line chart element
 */
function createLineChart() {
  const chart = document.createElement('div');
  chart.style.width = '100%';
  chart.style.height = '100%';
  chart.style.position = 'relative';
  
  // Create grid lines
  for (let i = 0; i < 5; i++) {
    const gridLine = document.createElement('div');
    gridLine.style.position = 'absolute';
    gridLine.style.left = '0';
    gridLine.style.right = '0';
    gridLine.style.top = `${i * 25}%`;
    gridLine.style.borderBottom = '1px dashed #ddd';
    
    chart.appendChild(gridLine);
  }
  
  // Create line
  const line = document.createElement('svg');
  line.setAttribute('width', '100%');
  line.setAttribute('height', '100%');
  line.style.position = 'absolute';
  line.style.top = '0';
  line.style.left = '0';
  
  const points = [];
  for (let i = 0; i < 6; i++) {
    const x = (i / 5) * 100;
    const y = Math.floor(Math.random() * 80) + 10; // Random y between 10% and 90%
    points.push(`${x}%,${y}%`);
  }
  
  const polyline = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
  polyline.setAttribute('points', points.join(' '));
  polyline.setAttribute('fill', 'none');
  polyline.setAttribute('stroke', '#4e73df');
  polyline.setAttribute('stroke-width', '2');
  
  line.appendChild(polyline);
  
  // Create dots
  points.forEach(point => {
    const [x, y] = point.split(',');
    
    const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    dot.setAttribute('cx', x);
    dot.setAttribute('cy', y);
    dot.setAttribute('r', '4');
    dot.setAttribute('fill', '#4e73df');
    
    line.appendChild(dot);
  });
  
  chart.appendChild(line);
  
  // Create x-axis labels
  for (let i = 0; i < 6; i++) {
    const label = document.createElement('div');
    label.textContent = `Day ${i + 1}`;
    label.style.position = 'absolute';
    label.style.bottom = '-25px';
    label.style.left = `${(i / 5) * 100}%`;
    label.style.transform = 'translateX(-50%)';
    label.style.fontSize = '12px';
    
    chart.appendChild(label);
  }
  
  return chart;
}

/**
 * Create a pie chart
 * @returns {HTMLElement} Pie chart element
 */
function createPieChart() {
  const chart = document.createElement('div');
  chart.style.width = '100%';
  chart.style.height = '100%';
  chart.style.display = 'flex';
  chart.style.justifyContent = 'center';
  chart.style.alignItems = 'center';
  
  const pieContainer = document.createElement('div');
  pieContainer.style.width = '150px';
  pieContainer.style.height = '150px';
  pieContainer.style.position = 'relative';
  
  const pieColors = ['#4e73df', '#1cc88a', '#36b9cc', '#f6c23e', '#e74a3b'];
  const pieData = [40, 20, 15, 15, 10]; // Percentages
  
  let cumulativePercentage = 0;
  
  pieData.forEach((percentage, index) => {
    const pieSlice = document.createElement('div');
    pieSlice.style.position = 'absolute';
    pieSlice.style.width = '100%';
    pieSlice.style.height = '100%';
    pieSlice.style.borderRadius = '50%';
    pieSlice.style.clip = 'rect(0, 150px, 150px, 75px)';
    
    const pieInner = document.createElement('div');
    pieInner.style.position = 'absolute';
    pieInner.style.width = '100%';
    pieInner.style.height = '100%';
    pieInner.style.borderRadius = '50%';
    pieInner.style.clip = 'rect(0, 75px, 150px, 0)';
    pieInner.style.transform = `rotate(${cumulativePercentage * 3.6}deg)`;
    pieInner.style.backgroundColor = pieColors[index % pieColors.length];
    
    pieSlice.appendChild(pieInner);
    pieContainer.appendChild(pieSlice);
    
    cumulativePercentage += percentage;
  });
  
  chart.appendChild(pieContainer);
  
  // Create legend
  const legend = document.createElement('div');
  legend.style.marginLeft = '20px';
  
  const legendItems = [
    { label: 'PDF', color: pieColors[0], percentage: pieData[0] },
    { label: 'Excel', color: pieColors[1], percentage: pieData[1] },
    { label: 'CSV', color: pieColors[2], percentage: pieData[2] },
    { label: 'Word', color: pieColors[3], percentage: pieData[3] },
    { label: 'Other', color: pieColors[4], percentage: pieData[4] }
  ];
  
  legendItems.forEach(item => {
    const legendItem = document.createElement('div');
    legendItem.style.display = 'flex';
    legendItem.style.alignItems = 'center';
    legendItem.style.marginBottom = '5px';
    
    const legendColor = document.createElement('div');
    legendColor.style.width = '12px';
    legendColor.style.height = '12px';
    legendColor.style.backgroundColor = item.color;
    legendColor.style.marginRight = '5px';
    
    const legendLabel = document.createElement('div');
    legendLabel.textContent = `${item.label} (${item.percentage}%)`;
    legendLabel.style.fontSize = '12px';
    
    legendItem.appendChild(legendColor);
    legendItem.appendChild(legendLabel);
    
    legend.appendChild(legendItem);
  });
  
  chart.appendChild(legend);
  
  return chart;
}

/**
 * Create a stat
 * @param {string} title - Stat title
 * @param {string} value - Stat value
 * @returns {HTMLElement} Stat element
 */
function createStat(title, value) {
  const stat = document.createElement('div');
  stat.style.width = 'calc(25% - 15px)';
  stat.style.minWidth = '200px';
  stat.style.border = '1px solid #ddd';
  stat.style.borderRadius = '5px';
  stat.style.overflow = 'hidden';
  
  const statHeader = document.createElement('div');
  statHeader.style.backgroundColor = '#f5f5f5';
  statHeader.style.padding = '10px';
  statHeader.style.borderBottom = '1px solid #ddd';
  
  const statTitle = document.createElement('h3');
  statTitle.textContent = title;
  statTitle.style.margin = '0';
  statTitle.style.fontSize = '16px';
  
  statHeader.appendChild(statTitle);
  
  const statBody = document.createElement('div');
  statBody.style.padding = '20px';
  statBody.style.textAlign = 'center';
  
  const statValue = document.createElement('div');
  statValue.textContent = value;
  statValue.style.fontSize = '24px';
  statValue.style.fontWeight = 'bold';
  
  statBody.appendChild(statValue);
  
  stat.appendChild(statHeader);
  stat.appendChild(statBody);
  
  return stat;
}

/**
 * Load analytics
 */
function loadAnalytics() {
  // Show loading state
  document.getElementById('analytics-loading').style.display = 'block';
  
  // Simulate loading delay
  setTimeout(function() {
    // Hide loading state
    document.getElementById('analytics-loading').style.display = 'none';
    
    // Analytics data is already loaded in the mock charts and stats
    console.log('Analytics loaded successfully!');
  }, 1000);
}
