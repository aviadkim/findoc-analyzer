/**
 * Portfolio Charts Component
 * Displays portfolio visualization charts
 * 
 * This component can be included in any page to display portfolio charts
 * It uses Chart.js for rendering the charts
 */

class PortfolioCharts {
  constructor(options = {}) {
    this.options = {
      containerId: options.containerId || 'portfolio-charts-container',
      theme: options.theme || 'light',
      timeframe: options.timeframe || '1y',
      animationDuration: options.animationDuration || 1000,
      showLegend: options.showLegend ?? true,
      height: options.height || 300,
      width: options.width || '100%',
      ...options
    };
    
    this.data = null;
    this.charts = {};
    this.loaded = false;
    
    this.init();
  }
  
  /**
   * Initialize the charts component
   */
  init() {
    // Create container if it doesn't exist
    this.container = document.getElementById(this.options.containerId);
    
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.id = this.options.containerId;
      document.body.appendChild(this.container);
    }
    
    this.container.classList.add('portfolio-charts-container');
    
    // Apply styles
    this.container.style.width = this.options.width;
    
    // Set theme 
    this.setTheme(this.options.theme);
    
    // Load required scripts
    this.loadDependencies()
      .then(() => {
        this.loaded = true;
        if (this.options.autoLoad !== false) {
          this.loadData();
        }
      })
      .catch(error => {
        console.error('Error loading Portfolio Charts dependencies:', error);
        this.showError('Failed to load chart dependencies. Please try again later.');
      });
    
    // Add theme toggle if requested
    if (this.options.showThemeToggle) {
      this.addThemeToggle();
    }
    
    // Add timeframe selector if requested
    if (this.options.showTimeframeSelector) {
      this.addTimeframeSelector();
    }
  }
  
  /**
   * Load Chart.js and other required dependencies
   */
  async loadDependencies() {
    // Check if Chart.js is already loaded
    if (window.Chart) {
      return Promise.resolve();
    }
    
    // Load Chart.js
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js';
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }
  
  /**
   * Set theme for charts (light or dark)
   * @param {string} theme - 'light' or 'dark'
   */
  setTheme(theme) {
    this.options.theme = theme;
    
    // Set CSS variables for theme
    this.container.classList.remove('theme-light', 'theme-dark');
    this.container.classList.add(`theme-${theme}`);
    
    // Add theme-specific styles
    if (!document.getElementById('portfolio-charts-styles')) {
      const style = document.createElement('style');
      style.id = 'portfolio-charts-styles';
      style.textContent = `
        .portfolio-charts-container {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
          box-sizing: border-box;
        }
        
        .portfolio-charts-container * {
          box-sizing: border-box;
        }
        
        .theme-light {
          --chart-bg: #ffffff;
          --chart-text: #333333;
          --chart-grid: #e0e0e0;
          --chart-border: #d0d0d0;
          --chart-tooltip-bg: rgba(255, 255, 255, 0.95);
          --chart-tooltip-border: #d0d0d0;
          --chart-container-bg: #f8f9fa;
        }
        
        .theme-dark {
          --chart-bg: #2d3436;
          --chart-text: #ecf0f1;
          --chart-grid: #636e72;
          --chart-border: #4a5568;
          --chart-tooltip-bg: rgba(45, 52, 54, 0.95);
          --chart-tooltip-border: #4a5568;
          --chart-container-bg: #1e272e;
        }
        
        .chart-card {
          background-color: var(--chart-bg);
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          padding: 16px;
          margin-bottom: 20px;
          border: 1px solid var(--chart-border);
        }
        
        .chart-title {
          font-size: 16px;
          font-weight: 600;
          margin: 0 0 12px 0;
          color: var(--chart-text);
        }
        
        .chart-container {
          position: relative;
          height: ${this.options.height}px;
        }
        
        .chart-error {
          color: #e74c3c;
          text-align: center;
          padding: 20px;
          background-color: #fdecea;
          border-radius: 4px;
          margin-top: 10px;
        }
        
        .chart-loading {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          color: var(--chart-text);
        }
        
        .chart-loading::after {
          content: '';
          width: 30px;
          height: 30px;
          border: 4px solid #ddd;
          border-top: 4px solid #3498db;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-left: 10px;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .charts-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 20px;
        }

        .charts-toolbar {
          display: flex;
          justify-content: space-between;
          margin-bottom: 16px;
          align-items: center;
        }
        
        .timeframe-selector {
          display: flex;
          gap: 8px;
        }
        
        .timeframe-btn {
          background-color: var(--chart-bg);
          border: 1px solid var(--chart-border);
          color: var(--chart-text);
          padding: 6px 12px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
        }
        
        .timeframe-btn.active {
          background-color: #4285F4;
          color: white;
          border-color: #3367d6;
        }
        
        .theme-toggle {
          background-color: var(--chart-bg);
          border: 1px solid var(--chart-border);
          color: var(--chart-text);
          padding: 6px 12px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        
        .theme-toggle svg {
          width: 16px;
          height: 16px;
        }
      `;
      document.head.appendChild(style);
    }
    
    // Update existing charts
    if (this.loaded && this.data) {
      this.renderCharts();
    }
  }
  
  /**
   * Load portfolio data from API
   * @param {string} portfolioId - Portfolio ID (optional)
   * @param {Object} options - Options for loading data
   */
  loadData(portfolioId = null, options = {}) {
    const queryParams = new URLSearchParams();
    
    if (portfolioId) {
      queryParams.set('id', portfolioId);
    }
    
    queryParams.set('timeframe', options.timeframe || this.options.timeframe);
    
    if (options.includeESG !== undefined) {
      queryParams.set('includeESG', options.includeESG);
    }
    
    if (options.includeRisk !== undefined) {
      queryParams.set('includeRisk', options.includeRisk);
    }
    
    // Show loading message
    this.showLoading();
    
    // Fetch data from API
    fetch(`/api/visualization/portfolio?${queryParams.toString()}`)
      .then(response => {
        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`);
        }
        return response.json();
      })
      .then(result => {
        if (result.success && result.data) {
          this.data = result.data;
          this.renderCharts();
        } else {
          throw new Error(result.message || 'Failed to load portfolio data');
        }
      })
      .catch(error => {
        console.error('Error loading portfolio data:', error);
        this.showError('Failed to load portfolio data. Please try again later.');
      });
  }
  
  /**
   * Show loading indicator
   */
  showLoading() {
    this.container.innerHTML = `
      <div class="chart-loading">
        Loading portfolio data...
      </div>
    `;
  }
  
  /**
   * Show error message
   * @param {string} message - Error message
   */
  showError(message) {
    this.container.innerHTML = `
      <div class="chart-error">
        ${message}
      </div>
    `;
  }
  
  /**
   * Add timeframe selector
   */
  addTimeframeSelector() {
    const timeframes = [
      { value: '1m', label: '1M' },
      { value: '3m', label: '3M' },
      { value: '6m', label: '6M' },
      { value: '1y', label: '1Y' },
      { value: '3y', label: '3Y' },
      { value: '5y', label: '5Y' },
      { value: 'max', label: 'Max' }
    ];
    
    const toolbar = document.createElement('div');
    toolbar.className = 'charts-toolbar';
    
    const selector = document.createElement('div');
    selector.className = 'timeframe-selector';
    
    timeframes.forEach(timeframe => {
      const btn = document.createElement('button');
      btn.className = `timeframe-btn ${timeframe.value === this.options.timeframe ? 'active' : ''}`;
      btn.textContent = timeframe.label;
      btn.dataset.timeframe = timeframe.value;
      
      btn.addEventListener('click', () => {
        // Update active state
        selector.querySelectorAll('.timeframe-btn').forEach(el => {
          el.classList.remove('active');
        });
        btn.classList.add('active');
        
        // Update timeframe and reload data
        this.options.timeframe = timeframe.value;
        this.loadData(null, { timeframe: timeframe.value });
      });
      
      selector.appendChild(btn);
    });
    
    toolbar.appendChild(selector);
    
    // Insert at the beginning of the container
    if (this.container.firstChild) {
      this.container.insertBefore(toolbar, this.container.firstChild);
    } else {
      this.container.appendChild(toolbar);
    }
  }
  
  /**
   * Add theme toggle button
   */
  addThemeToggle() {
    const toolbar = document.querySelector('.charts-toolbar') || document.createElement('div');
    
    if (!toolbar.classList.contains('charts-toolbar')) {
      toolbar.className = 'charts-toolbar';
      // Insert at the beginning of the container
      if (this.container.firstChild) {
        this.container.insertBefore(toolbar, this.container.firstChild);
      } else {
        this.container.appendChild(toolbar);
      }
    }
    
    const toggle = document.createElement('button');
    toggle.className = 'theme-toggle';
    
    const icon = this.options.theme === 'light' 
      ? '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 3a9 9 0 1 0 9 9c0-.46-.04-.92-.1-1.36a5.389 5.389 0 0 1-4.4 2.26 5.403 5.403 0 0 1-3.14-9.8c-.44-.06-.9-.1-1.36-.1z"></path></svg>'
      : '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58a.996.996 0 0 0-1.41 0 .996.996 0 0 0 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37a.996.996 0 0 0-1.41 0 .996.996 0 0 0 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0a.996.996 0 0 0 0-1.41l-1.06-1.06zm1.06-10.96a.996.996 0 0 0 0-1.41.996.996 0 0 0-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.36a.996.996 0 0 0 0-1.41.996.996 0 0 0-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z"></path></svg>';
    
    toggle.innerHTML = `${icon} ${this.options.theme === 'light' ? 'Dark' : 'Light'}`;
    
    toggle.addEventListener('click', () => {
      const newTheme = this.options.theme === 'light' ? 'dark' : 'light';
      this.setTheme(newTheme);
      
      // Update button text and icon
      const newIcon = newTheme === 'light' 
        ? '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58a.996.996 0 0 0-1.41 0 .996.996 0 0 0 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37a.996.996 0 0 0-1.41 0 .996.996 0 0 0 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0a.996.996 0 0 0 0-1.41l-1.06-1.06zm1.06-10.96a.996.996 0 0 0 0-1.41.996.996 0 0 0-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.36a.996.996 0 0 0 0-1.41.996.996 0 0 0-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z"></path></svg>'
        : '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 3a9 9 0 1 0 9 9c0-.46-.04-.92-.1-1.36a5.389 5.389 0 0 1-4.4 2.26 5.403 5.403 0 0 1-3.14-9.8c-.44-.06-.9-.1-1.36-.1z"></path></svg>';
      
      toggle.innerHTML = `${newIcon} ${newTheme === 'light' ? 'Dark' : 'Light'}`;
    });
    
    toolbar.appendChild(toggle);
  }
  
  /**
   * Render all portfolio charts
   */
  renderCharts() {
    if (!this.loaded || !this.data) {
      return;
    }
    
    // Clear previous charts
    Object.values(this.charts).forEach(chart => {
      if (chart && typeof chart.destroy === 'function') {
        chart.destroy();
      }
    });
    
    this.charts = {};
    
    // Create charts container
    this.container.innerHTML = '';
    
    // Add toolbar if needed
    if (this.options.showTimeframeSelector) {
      this.addTimeframeSelector();
    }
    
    if (this.options.showThemeToggle) {
      this.addThemeToggle();
    }
    
    // Create grid container
    const grid = document.createElement('div');
    grid.className = 'charts-grid';
    this.container.appendChild(grid);
    
    // Render asset allocation chart (pie chart)
    if (this.data.assetAllocation) {
      this.renderPieChart(grid, {
        title: 'Asset Allocation',
        id: 'asset-allocation-chart',
        data: this.data.assetAllocation
      });
    }
    
    // Render sector allocation chart (pie chart)
    if (this.data.sectorAllocation) {
      this.renderPieChart(grid, {
        title: 'Sector Allocation',
        id: 'sector-allocation-chart',
        data: this.data.sectorAllocation
      });
    }
    
    // Render geographic distribution chart (pie chart)
    if (this.data.geographicDistribution) {
      this.renderPieChart(grid, {
        title: 'Geographic Distribution',
        id: 'geographic-distribution-chart',
        data: this.data.geographicDistribution
      });
    }
    
    // Render performance history chart (line chart)
    if (this.data.performanceHistory) {
      this.renderLineChart(grid, {
        title: 'Performance History',
        id: 'performance-history-chart',
        data: this.data.performanceHistory,
        isPerformance: true
      });
    }
    
    // Render top holdings chart (bar chart)
    if (this.data.topHoldings) {
      this.renderBarChart(grid, {
        title: 'Top Holdings',
        id: 'top-holdings-chart',
        data: this.data.topHoldings
      });
    }
    
    // Render risk metrics
    if (this.data.riskMetrics) {
      this.renderMetricsCard(grid, {
        title: 'Risk Metrics',
        id: 'risk-metrics-card',
        data: this.data.riskMetrics
      });
    }
    
    // Render ESG metrics
    if (this.data.esgMetrics) {
      this.renderESGMetrics(grid, {
        title: 'ESG Metrics',
        id: 'esg-metrics-card',
        data: this.data.esgMetrics
      });
    }
  }
  
  /**
   * Render a pie chart
   * @param {HTMLElement} container - Container element
   * @param {Object} options - Chart options
   */
  renderPieChart(container, options) {
    const { title, id, data } = options;
    
    // Create chart card
    const card = document.createElement('div');
    card.className = 'chart-card';
    
    // Add title
    const titleElement = document.createElement('h3');
    titleElement.className = 'chart-title';
    titleElement.textContent = title;
    card.appendChild(titleElement);
    
    // Create chart container
    const chartContainer = document.createElement('div');
    chartContainer.className = 'chart-container';
    card.appendChild(chartContainer);
    
    // Create canvas
    const canvas = document.createElement('canvas');
    canvas.id = id;
    chartContainer.appendChild(canvas);
    
    // Add card to container
    container.appendChild(card);
    
    // Chart data
    const chartData = {
      labels: data.map(item => item.name),
      datasets: [{
        data: data.map(item => item.value),
        backgroundColor: data.map(item => item.color),
        borderWidth: 1,
        borderColor: this.options.theme === 'dark' ? '#2d3436' : '#ffffff'
      }]
    };
    
    // Chart options
    const chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right',
          display: this.options.showLegend,
          labels: {
            color: this.options.theme === 'dark' ? '#ecf0f1' : '#333333',
            padding: 10,
            font: {
              size: 12
            }
          }
        },
        tooltip: {
          backgroundColor: this.options.theme === 'dark' ? 'rgba(45, 52, 54, 0.95)' : 'rgba(255, 255, 255, 0.95)',
          titleColor: this.options.theme === 'dark' ? '#ecf0f1' : '#333333',
          bodyColor: this.options.theme === 'dark' ? '#ecf0f1' : '#333333',
          borderColor: this.options.theme === 'dark' ? '#4a5568' : '#d0d0d0',
          borderWidth: 1,
          padding: 10,
          callbacks: {
            label: function(context) {
              const item = data[context.dataIndex];
              return `${item.name}: ${item.value}% (${item.rawValue ? this.formatCurrency(item.rawValue) : ''})`;
            }.bind(this)
          }
        }
      },
      animation: {
        duration: this.options.animationDuration
      }
    };
    
    // Create chart
    this.charts[id] = new Chart(canvas, {
      type: 'pie',
      data: chartData,
      options: chartOptions
    });
  }
  
  /**
   * Render a line chart
   * @param {HTMLElement} container - Container element
   * @param {Object} options - Chart options
   */
  renderLineChart(container, options) {
    const { title, id, data, isPerformance } = options;
    
    // Create chart card
    const card = document.createElement('div');
    card.className = 'chart-card';
    
    // Add title
    const titleElement = document.createElement('h3');
    titleElement.className = 'chart-title';
    titleElement.textContent = title;
    card.appendChild(titleElement);
    
    // Create chart container
    const chartContainer = document.createElement('div');
    chartContainer.className = 'chart-container';
    card.appendChild(chartContainer);
    
    // Create canvas
    const canvas = document.createElement('canvas');
    canvas.id = id;
    chartContainer.appendChild(canvas);
    
    // Add card to container
    container.appendChild(card);
    
    // Prepare data
    const labels = data.map(item => item.date);
    const values = data.map(item => item.value);
    
    // Calculate performance if needed
    let performanceData = null;
    if (isPerformance && values.length > 0) {
      const initialValue = values[0];
      performanceData = values.map(value => ((value / initialValue) - 1) * 100);
    }
    
    // Chart data
    const chartData = {
      labels,
      datasets: [{
        label: isPerformance ? 'Performance (%)' : 'Value',
        data: isPerformance ? performanceData : values,
        borderColor: '#4285F4',
        borderWidth: 2,
        fill: false,
        tension: 0.2,
        pointRadius: 2,
        pointHoverRadius: 5
      }]
    };
    
    // Chart options
    const chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          grid: {
            color: this.options.theme === 'dark' ? '#636e72' : '#e0e0e0'
          },
          ticks: {
            color: this.options.theme === 'dark' ? '#ecf0f1' : '#333333',
            maxRotation: 0,
            autoSkip: true,
            maxTicksLimit: 8
          }
        },
        y: {
          grid: {
            color: this.options.theme === 'dark' ? '#636e72' : '#e0e0e0'
          },
          ticks: {
            color: this.options.theme === 'dark' ? '#ecf0f1' : '#333333',
            callback: function(value) {
              if (isPerformance) {
                return value.toFixed(2) + '%';
              } else {
                return this.formatCurrency(value);
              }
            }.bind(this)
          }
        }
      },
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: this.options.theme === 'dark' ? 'rgba(45, 52, 54, 0.95)' : 'rgba(255, 255, 255, 0.95)',
          titleColor: this.options.theme === 'dark' ? '#ecf0f1' : '#333333',
          bodyColor: this.options.theme === 'dark' ? '#ecf0f1' : '#333333',
          borderColor: this.options.theme === 'dark' ? '#4a5568' : '#d0d0d0',
          borderWidth: 1,
          padding: 10,
          callbacks: {
            label: function(context) {
              const idx = context.dataIndex;
              if (isPerformance) {
                return `Performance: ${performanceData[idx].toFixed(2)}%`;
              } else {
                return `Value: ${this.formatCurrency(values[idx])}`;
              }
            }.bind(this)
          }
        }
      },
      animation: {
        duration: this.options.animationDuration
      }
    };
    
    // Create chart
    this.charts[id] = new Chart(canvas, {
      type: 'line',
      data: chartData,
      options: chartOptions
    });
  }
  
  /**
   * Render a bar chart
   * @param {HTMLElement} container - Container element
   * @param {Object} options - Chart options
   */
  renderBarChart(container, options) {
    const { title, id, data } = options;
    
    // Create chart card
    const card = document.createElement('div');
    card.className = 'chart-card';
    
    // Add title
    const titleElement = document.createElement('h3');
    titleElement.className = 'chart-title';
    titleElement.textContent = title;
    card.appendChild(titleElement);
    
    // Create chart container
    const chartContainer = document.createElement('div');
    chartContainer.className = 'chart-container';
    card.appendChild(chartContainer);
    
    // Create canvas
    const canvas = document.createElement('canvas');
    canvas.id = id;
    chartContainer.appendChild(canvas);
    
    // Add card to container
    container.appendChild(card);
    
    // Prepare data
    const labels = data.map(item => item.name);
    const values = data.map(item => item.percentage);
    
    // Chart data
    const chartData = {
      labels,
      datasets: [{
        label: 'Percentage of Portfolio',
        data: values,
        backgroundColor: this.options.theme === 'dark' ? '#4285F4' : 'rgba(66, 133, 244, 0.8)',
        borderColor: '#4285F4',
        borderWidth: 1,
        borderRadius: 4
      }]
    };
    
    // Chart options
    const chartOptions = {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          grid: {
            color: this.options.theme === 'dark' ? '#636e72' : '#e0e0e0'
          },
          ticks: {
            color: this.options.theme === 'dark' ? '#ecf0f1' : '#333333'
          }
        },
        y: {
          grid: {
            display: false
          },
          ticks: {
            color: this.options.theme === 'dark' ? '#ecf0f1' : '#333333'
          }
        }
      },
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: this.options.theme === 'dark' ? 'rgba(45, 52, 54, 0.95)' : 'rgba(255, 255, 255, 0.95)',
          titleColor: this.options.theme === 'dark' ? '#ecf0f1' : '#333333',
          bodyColor: this.options.theme === 'dark' ? '#ecf0f1' : '#333333',
          borderColor: this.options.theme === 'dark' ? '#4a5568' : '#d0d0d0',
          borderWidth: 1,
          padding: 10,
          callbacks: {
            label: function(context) {
              const item = data[context.dataIndex];
              return `${item.percentage}% (${this.formatCurrency(item.value)})`;
            }.bind(this)
          }
        }
      },
      animation: {
        duration: this.options.animationDuration
      }
    };
    
    // Create chart
    this.charts[id] = new Chart(canvas, {
      type: 'bar',
      data: chartData,
      options: chartOptions
    });
  }
  
  /**
   * Render metrics card
   * @param {HTMLElement} container - Container element
   * @param {Object} options - Card options
   */
  renderMetricsCard(container, options) {
    const { title, id, data } = options;
    
    // Create card
    const card = document.createElement('div');
    card.className = 'chart-card';
    card.id = id;
    
    // Add title
    const titleElement = document.createElement('h3');
    titleElement.className = 'chart-title';
    titleElement.textContent = title;
    card.appendChild(titleElement);
    
    // Create metrics container
    const metricsContainer = document.createElement('div');
    metricsContainer.style.display = 'grid';
    metricsContainer.style.gridTemplateColumns = 'repeat(auto-fill, minmax(180px, 1fr))';
    metricsContainer.style.gap = '16px';
    metricsContainer.style.marginTop = '16px';
    
    // Add metrics
    Object.entries(data).forEach(([key, value]) => {
      const metricItem = document.createElement('div');
      
      const label = document.createElement('div');
      label.style.fontSize = '12px';
      label.style.color = this.options.theme === 'dark' ? '#b2bec3' : '#666666';
      label.style.marginBottom = '4px';
      label.textContent = this.formatMetricName(key);
      
      const valueElement = document.createElement('div');
      valueElement.style.fontSize = '18px';
      valueElement.style.fontWeight = 'bold';
      valueElement.style.color = this.options.theme === 'dark' ? '#ecf0f1' : '#333333';
      valueElement.textContent = value;
      
      metricItem.appendChild(label);
      metricItem.appendChild(valueElement);
      metricsContainer.appendChild(metricItem);
    });
    
    card.appendChild(metricsContainer);
    
    // Add card to container
    container.appendChild(card);
  }
  
  /**
   * Render ESG metrics card
   * @param {HTMLElement} container - Container element
   * @param {Object} options - Card options
   */
  renderESGMetrics(container, options) {
    const { title, id, data } = options;
    
    // Create card
    const card = document.createElement('div');
    card.className = 'chart-card';
    card.id = id;
    
    // Add title
    const titleElement = document.createElement('h3');
    titleElement.className = 'chart-title';
    titleElement.textContent = title;
    card.appendChild(titleElement);
    
    // Create chart container for ESG scores
    const chartContainer = document.createElement('div');
    chartContainer.className = 'chart-container';
    chartContainer.style.height = '200px';
    card.appendChild(chartContainer);
    
    // Create canvas
    const canvas = document.createElement('canvas');
    canvas.id = `${id}-chart`;
    chartContainer.appendChild(canvas);
    
    // Create metrics container for additional ESG info
    const metricsContainer = document.createElement('div');
    metricsContainer.style.display = 'flex';
    metricsContainer.style.justifyContent = 'space-around';
    metricsContainer.style.marginTop = '16px';
    
    // Add additional metrics
    ['carbonIntensity', 'controversyFlag'].forEach(key => {
      if (data[key]) {
        const metricItem = document.createElement('div');
        metricItem.style.textAlign = 'center';
        
        const label = document.createElement('div');
        label.style.fontSize = '12px';
        label.style.color = this.options.theme === 'dark' ? '#b2bec3' : '#666666';
        label.style.marginBottom = '4px';
        label.textContent = this.formatMetricName(key);
        
        const valueElement = document.createElement('div');
        valueElement.style.fontSize = '16px';
        valueElement.style.fontWeight = 'bold';
        valueElement.style.color = this.options.theme === 'dark' ? '#ecf0f1' : '#333333';
        valueElement.textContent = data[key];
        
        metricItem.appendChild(label);
        metricItem.appendChild(valueElement);
        metricsContainer.appendChild(metricItem);
      }
    });
    
    card.appendChild(metricsContainer);
    
    // Add card to container
    container.appendChild(card);
    
    // Prepare ESG chart data
    const chartData = {
      labels: ['Environmental', 'Social', 'Governance', 'Overall ESG'],
      datasets: [{
        data: [
          data.environmentalScore || 0,
          data.socialScore || 0,
          data.governanceScore || 0,
          data.overallESGScore || 0
        ],
        backgroundColor: [
          '#34A853',
          '#4285F4',
          '#FBBC05',
          '#8AB4F8'
        ],
        borderWidth: 1,
        borderRadius: 4
      }]
    };
    
    // Chart options
    const chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          grid: {
            color: this.options.theme === 'dark' ? '#636e72' : '#e0e0e0'
          },
          ticks: {
            color: this.options.theme === 'dark' ? '#ecf0f1' : '#333333'
          }
        },
        x: {
          grid: {
            display: false
          },
          ticks: {
            color: this.options.theme === 'dark' ? '#ecf0f1' : '#333333'
          }
        }
      },
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: this.options.theme === 'dark' ? 'rgba(45, 52, 54, 0.95)' : 'rgba(255, 255, 255, 0.95)',
          titleColor: this.options.theme === 'dark' ? '#ecf0f1' : '#333333',
          bodyColor: this.options.theme === 'dark' ? '#ecf0f1' : '#333333',
          borderColor: this.options.theme === 'dark' ? '#4a5568' : '#d0d0d0',
          borderWidth: 1,
          padding: 10
        }
      },
      animation: {
        duration: this.options.animationDuration
      }
    };
    
    // Create chart
    this.charts[`${id}-chart`] = new Chart(canvas, {
      type: 'bar',
      data: chartData,
      options: chartOptions
    });
  }
  
  /**
   * Format a currency value
   * @param {number} value - Value to format
   * @returns {string} - Formatted currency
   */
  formatCurrency(value) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  }
  
  /**
   * Format a metric name to be more readable
   * @param {string} name - Metric name in camelCase
   * @returns {string} - Formatted name
   */
  formatMetricName(name) {
    // Convert camelCase to Title Case with spaces
    const formatted = name.replace(/([A-Z])/g, ' $1');
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  }
}

// Export if in a Node.js environment
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PortfolioCharts;
}