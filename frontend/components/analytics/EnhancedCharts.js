/**
 * EnhancedCharts.js
 * Enhanced chart components for financial analytics visualization
 * 
 * Created: May 9, 2025
 */

import React, { useState, useEffect, useCallback } from 'react';

/**
 * Enhanced Portfolio Chart component with drill-down capability
 * @param {Object} props Component properties
 * @returns {JSX.Element} Enhanced chart component
 */
export const EnhancedPortfolioChart = ({ portfolioData, onDrillDown }) => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [drillDownLevel, setDrillDownLevel] = useState(0);
  const [drillDownPath, setDrillDownPath] = useState([]);
  const [selectedSegment, setSelectedSegment] = useState(null);
  
  // Fetch chart data from API or use provided data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Use provided data or fetch from API
        if (portfolioData) {
          setChartData(portfolioData);
        } else {
          const response = await fetch('/api/visualization/portfolio');
          if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
          }
          const data = await response.json();
          if (data.success) {
            setChartData(data.data);
          } else {
            throw new Error(data.message || 'Failed to load portfolio data');
          }
        }
      } catch (err) {
        console.error('Error fetching portfolio data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [portfolioData]);
  
  // Handle drill down action
  const handleDrillDown = useCallback((segment) => {
    setSelectedSegment(segment);
    setDrillDownLevel(prevLevel => prevLevel + 1);
    setDrillDownPath(prevPath => [...prevPath, segment.name]);
    
    // Call external handler if provided
    if (onDrillDown) {
      onDrillDown(segment, drillDownLevel + 1, [...drillDownPath, segment.name]);
    }
  }, [drillDownLevel, drillDownPath, onDrillDown]);
  
  // Handle drill up action
  const handleDrillUp = useCallback(() => {
    if (drillDownLevel > 0) {
      setDrillDownLevel(prevLevel => prevLevel - 1);
      setDrillDownPath(prevPath => prevPath.slice(0, -1));
      setSelectedSegment(null);
    }
  }, [drillDownLevel]);
  
  // Render loading state
  if (loading) {
    return (
      <div className="chart-loading">
        <div className="spinner"></div>
        <p>Loading portfolio data...</p>
      </div>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <div className="chart-error">
        <p>Error loading chart: {error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }
  
  // Render empty state
  if (!chartData) {
    return (
      <div className="chart-empty">
        <p>No portfolio data available. Please upload financial documents first.</p>
      </div>
    );
  }
  
  // Determine which data to show based on drill down level
  let displayData = chartData.assetAllocation;
  let chartTitle = 'Asset Allocation';
  
  if (drillDownLevel === 1) {
    if (selectedSegment.name === 'Stocks') {
      displayData = chartData.sectorAllocation;
      chartTitle = 'Sector Allocation';
    } else if (selectedSegment.name === 'Bonds') {
      displayData = [
        { name: 'Government', value: 50, color: '#34A853' },
        { name: 'Corporate', value: 35, color: '#4285F4' },
        { name: 'Municipal', value: 15, color: '#FBBC05' }
      ];
      chartTitle = 'Bond Types';
    }
  } else if (drillDownLevel === 2 && selectedSegment.name === 'Technology') {
    displayData = chartData.topHoldings.filter(holding => 
      ['AAPL', 'MSFT', 'GOOGL'].includes(holding.ticker)
    ).map(holding => ({
      name: holding.name,
      value: holding.percentage,
      color: '#4285F4'
    }));
    chartTitle = 'Technology Holdings';
  }
  
  // Render the chart
  return (
    <div className="enhanced-chart">
      <div className="chart-header">
        <h3>{chartTitle}</h3>
        {drillDownLevel > 0 && (
          <button className="drill-up-btn" onClick={handleDrillUp}>
            ↑ Back to {drillDownPath[drillDownPath.length - 2] || 'Asset Allocation'}
          </button>
        )}
        <div className="drill-path">
          {drillDownPath.map((path, index) => (
            <span key={index}>
              {index > 0 && ' > '}
              {path}
            </span>
          ))}
        </div>
      </div>
      
      <div className="chart-container">
        {/* SVG Pie Chart */}
        <svg width="400" height="400" viewBox="0 0 400 400">
          <g transform="translate(200, 200)">
            {displayData.map((segment, index) => {
              // Calculate pie segments
              const total = displayData.reduce((sum, d) => sum + d.value, 0);
              const startAngle = displayData
                .slice(0, index)
                .reduce((sum, d) => sum + (d.value / total) * Math.PI * 2, 0);
              const endAngle = startAngle + (segment.value / total) * Math.PI * 2;
              
              // Calculate path
              const x1 = Math.sin(startAngle) * 150;
              const y1 = -Math.cos(startAngle) * 150;
              const x2 = Math.sin(endAngle) * 150;
              const y2 = -Math.cos(endAngle) * 150;
              
              const largeArcFlag = endAngle - startAngle > Math.PI ? 1 : 0;
              
              // Path definition
              const pathData = [
                `M 0 0`,
                `L ${x1} ${y1}`,
                `A 150 150 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                'Z'
              ].join(' ');
              
              return (
                <path
                  key={index}
                  d={pathData}
                  fill={segment.color}
                  stroke="#ffffff"
                  strokeWidth="1"
                  onClick={() => handleDrillDown(segment)}
                  style={{ cursor: 'pointer' }}
                >
                  <title>{segment.name}: {segment.value}%</title>
                </path>
              );
            })}
          </g>
        </svg>
        
        {/* Legend */}
        <div className="chart-legend">
          {displayData.map((segment, index) => (
            <div key={index} className="legend-item">
              <div className="legend-color" style={{ backgroundColor: segment.color }}></div>
              <div className="legend-label">{segment.name}: {segment.value}%</div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="chart-footer">
        <p className="chart-note">Click on segments to drill down</p>
      </div>
    </div>
  );
};

/**
 * Enhanced Performance Chart component with time period selection
 * @param {Object} props Component properties
 * @returns {JSX.Element} Enhanced performance chart component
 */
export const EnhancedPerformanceChart = ({ performanceData, onPeriodChange }) => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timePeriod, setTimePeriod] = useState('1Y'); // Default to 1 year
  
  // Fetch chart data from API or use provided data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Use provided data or fetch from API
        if (performanceData) {
          setChartData(performanceData);
        } else {
          const response = await fetch(`/api/visualization/performance?period=${timePeriod}`);
          if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
          }
          const data = await response.json();
          if (data.success) {
            setChartData(data.data);
          } else {
            throw new Error(data.message || 'Failed to load performance data');
          }
        }
      } catch (err) {
        console.error('Error fetching performance data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [performanceData, timePeriod]);
  
  // Handle period change
  const handlePeriodChange = (period) => {
    setTimePeriod(period);
    
    // Call external handler if provided
    if (onPeriodChange) {
      onPeriodChange(period);
    }
  };
  
  // Render loading state
  if (loading) {
    return (
      <div className="chart-loading">
        <div className="spinner"></div>
        <p>Loading performance data...</p>
      </div>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <div className="chart-error">
        <p>Error loading chart: {error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }
  
  // Render empty state
  if (!chartData) {
    return (
      <div className="chart-empty">
        <p>No performance data available. Please upload financial documents first.</p>
      </div>
    );
  }
  
  // Sample performance data if real data not available
  const performanceHistory = chartData.performanceHistory || [
    { date: '2024-05-01', value: 1000000 },
    { date: '2024-06-01', value: 1020000 },
    { date: '2024-07-01', value: 1050000 },
    { date: '2024-08-01', value: 1070000 },
    { date: '2024-09-01', value: 1100000 },
    { date: '2024-10-01', value: 1130000 },
    { date: '2024-11-01', value: 1160000 },
    { date: '2024-12-01', value: 1200000 },
    { date: '2025-01-01', value: 1180000 },
    { date: '2025-02-01', value: 1210000 },
    { date: '2025-03-01', value: 1240000 },
    { date: '2025-04-01', value: 1270000 },
    { date: '2025-05-01', value: 1300000 }
  ];
  
  // Calculate chart dimensions
  const chartWidth = 600;
  const chartHeight = 300;
  const padding = { top: 20, right: 30, bottom: 30, left: 60 };
  const innerWidth = chartWidth - padding.left - padding.right;
  const innerHeight = chartHeight - padding.top - padding.bottom;
  
  // Calculate chart scales
  const xDomain = performanceHistory.map(d => d.date);
  const yMin = Math.min(...performanceHistory.map(d => d.value)) * 0.9;
  const yMax = Math.max(...performanceHistory.map(d => d.value)) * 1.1;
  
  // Calculate x and y positions
  const xStep = innerWidth / (performanceHistory.length - 1);
  const yScale = value => {
    return innerHeight - (value - yMin) / (yMax - yMin) * innerHeight;
  };
  
  // Generate line path
  const linePath = performanceHistory.map((d, i) => {
    const x = padding.left + i * xStep;
    const y = padding.top + yScale(d.value);
    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');
  
  // Generate area path
  const areaPath = [
    ...performanceHistory.map((d, i) => {
      const x = padding.left + i * xStep;
      const y = padding.top + yScale(d.value);
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    }),
    `L ${padding.left + (performanceHistory.length - 1) * xStep} ${padding.top + innerHeight}`,
    `L ${padding.left} ${padding.top + innerHeight}`,
    'Z'
  ].join(' ');
  
  // Render the chart
  return (
    <div className="enhanced-chart">
      <div className="chart-header">
        <h3>Portfolio Performance</h3>
        <div className="time-period-selector">
          <button 
            className={timePeriod === '1M' ? 'active' : ''} 
            onClick={() => handlePeriodChange('1M')}
          >
            1M
          </button>
          <button 
            className={timePeriod === '3M' ? 'active' : ''} 
            onClick={() => handlePeriodChange('3M')}
          >
            3M
          </button>
          <button 
            className={timePeriod === '6M' ? 'active' : ''} 
            onClick={() => handlePeriodChange('6M')}
          >
            6M
          </button>
          <button 
            className={timePeriod === '1Y' ? 'active' : ''} 
            onClick={() => handlePeriodChange('1Y')}
          >
            1Y
          </button>
          <button 
            className={timePeriod === '5Y' ? 'active' : ''} 
            onClick={() => handlePeriodChange('5Y')}
          >
            5Y
          </button>
          <button 
            className={timePeriod === 'ALL' ? 'active' : ''} 
            onClick={() => handlePeriodChange('ALL')}
          >
            ALL
          </button>
        </div>
      </div>
      
      <div className="chart-container">
        <svg width={chartWidth} height={chartHeight}>
          {/* X-axis */}
          <g className="x-axis">
            <line
              x1={padding.left}
              y1={padding.top + innerHeight}
              x2={padding.left + innerWidth}
              y2={padding.top + innerHeight}
              stroke="#ccc"
            />
            {performanceHistory.map((d, i) => {
              // Only show every nth tick for readability
              const showTick = i === 0 || i === performanceHistory.length - 1 || 
                i % Math.ceil(performanceHistory.length / 5) === 0;
              
              if (!showTick) return null;
              
              const x = padding.left + i * xStep;
              return (
                <g key={i} transform={`translate(${x}, ${padding.top + innerHeight})`}>
                  <line y2="5" stroke="#ccc" />
                  <text
                    y="20"
                    textAnchor="middle"
                    fontSize="12"
                    fill="#666"
                  >
                    {new Date(d.date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })}
                  </text>
                </g>
              );
            })}
          </g>
          
          {/* Y-axis */}
          <g className="y-axis">
            <line
              x1={padding.left}
              y1={padding.top}
              x2={padding.left}
              y2={padding.top + innerHeight}
              stroke="#ccc"
            />
            {[0, 0.25, 0.5, 0.75, 1].map((percent, i) => {
              const value = yMin + (yMax - yMin) * percent;
              const y = padding.top + yScale(value);
              return (
                <g key={i} transform={`translate(${padding.left}, ${y})`}>
                  <line x2="-5" stroke="#ccc" />
                  <text
                    x="-10"
                    textAnchor="end"
                    dominantBaseline="middle"
                    fontSize="12"
                    fill="#666"
                  >
                    ${(value / 1000000).toFixed(1)}M
                  </text>
                </g>
              );
            })}
          </g>
          
          {/* Area */}
          <path
            d={areaPath}
            fill="rgba(66, 133, 244, 0.2)"
            stroke="none"
          />
          
          {/* Line */}
          <path
            d={linePath}
            fill="none"
            stroke="#4285F4"
            strokeWidth="2"
          />
          
          {/* Data points */}
          {performanceHistory.map((d, i) => {
            const x = padding.left + i * xStep;
            const y = padding.top + yScale(d.value);
            return (
              <g key={i}>
                <circle
                  cx={x}
                  cy={y}
                  r="4"
                  fill="#4285F4"
                  stroke="#fff"
                  strokeWidth="2"
                >
                  <title>${d.value.toLocaleString()}</title>
                </circle>
              </g>
            );
          })}
        </svg>
      </div>
      
      <div className="chart-footer">
        <div className="chart-statistics">
          <div className="stat">
            <div className="stat-label">Starting Value</div>
            <div className="stat-value">${performanceHistory[0].value.toLocaleString()}</div>
          </div>
          <div className="stat">
            <div className="stat-label">Current Value</div>
            <div className="stat-value">${performanceHistory[performanceHistory.length - 1].value.toLocaleString()}</div>
          </div>
          <div className="stat">
            <div className="stat-label">Change</div>
            <div className="stat-value">
              {(() => {
                const startValue = performanceHistory[0].value;
                const endValue = performanceHistory[performanceHistory.length - 1].value;
                const percentChange = ((endValue - startValue) / startValue) * 100;
                const isPositive = percentChange >= 0;
                
                return (
                  <span style={{ color: isPositive ? '#34A853' : '#EA4335' }}>
                    {isPositive ? '+' : ''}{percentChange.toFixed(2)}%
                  </span>
                );
              })()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Enhanced Comparison Chart component for multiple documents or assets
 * @param {Object} props Component properties
 * @returns {JSX.Element} Enhanced comparison chart component
 */
export const EnhancedComparisonChart = ({ comparisonData, onItemToggle }) => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  
  // Fetch chart data from API or use provided data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Use provided data or fetch from API
        if (comparisonData) {
          setChartData(comparisonData);
          // Initialize selected items with all items
          if (comparisonData.items) {
            setSelectedItems(comparisonData.items.map(item => item.id));
          }
        } else {
          const response = await fetch('/api/visualization/comparison');
          if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
          }
          const data = await response.json();
          if (data.success) {
            setChartData(data.data);
            // Initialize selected items with all items
            if (data.data.items) {
              setSelectedItems(data.data.items.map(item => item.id));
            }
          } else {
            throw new Error(data.message || 'Failed to load comparison data');
          }
        }
      } catch (err) {
        console.error('Error fetching comparison data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [comparisonData]);
  
  // Handle item toggle
  const handleItemToggle = (itemId) => {
    setSelectedItems(prevSelected => {
      if (prevSelected.includes(itemId)) {
        return prevSelected.filter(id => id !== itemId);
      } else {
        return [...prevSelected, itemId];
      }
    });
    
    // Call external handler if provided
    if (onItemToggle) {
      onItemToggle(itemId);
    }
  };
  
  // Render loading state
  if (loading) {
    return (
      <div className="chart-loading">
        <div className="spinner"></div>
        <p>Loading comparison data...</p>
      </div>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <div className="chart-error">
        <p>Error loading chart: {error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }
  
  // Render empty state
  if (!chartData) {
    return (
      <div className="chart-empty">
        <p>No comparison data available. Please select documents to compare.</p>
      </div>
    );
  }
  
  // Sample comparison data if real data not available
  const items = chartData.items || [
    { id: 'doc1', name: 'Portfolio 2023', color: '#4285F4' },
    { id: 'doc2', name: 'Portfolio 2024', color: '#34A853' },
    { id: 'doc3', name: 'Portfolio 2025', color: '#FBBC05' },
    { id: 'doc4', name: 'Benchmark', color: '#EA4335' }
  ];
  
  const metrics = chartData.metrics || [
    { name: 'Total Value', values: { doc1: 1000000, doc2: 1100000, doc3: 1250000, doc4: 1180000 } },
    { name: 'Stocks %', values: { doc1: 55, doc2: 58, doc3: 60, doc4: 65 } },
    { name: 'Bonds %', values: { doc1: 35, doc2: 32, doc3: 30, doc4: 30 } },
    { name: 'Cash %', values: { doc1: 10, doc2: 10, doc3: 10, doc4: 5 } },
    { name: 'Return %', values: { doc1: 5.2, doc2: 6.8, doc3: 8.5, doc4: 7.2 } }
  ];
  
  // Filtered items based on selection
  const filteredItems = items.filter(item => selectedItems.includes(item.id));
  
  // Calculate chart dimensions
  const chartWidth = 600;
  const chartHeight = 400;
  const padding = { top: 20, right: 30, bottom: 30, left: 150 };
  const innerWidth = chartWidth - padding.left - padding.right;
  const innerHeight = chartHeight - padding.top - padding.bottom;
  
  // Calculate bar chart dimensions
  const barHeight = innerHeight / metrics.length;
  const barPadding = barHeight * 0.2;
  const groupHeight = barHeight - barPadding;
  const barWidth = groupHeight / filteredItems.length;
  
  // Render the chart
  return (
    <div className="enhanced-chart">
      <div className="chart-header">
        <h3>Document Comparison</h3>
        <div className="item-selector">
          {items.map(item => (
            <label key={item.id} className="item-toggle">
              <input
                type="checkbox"
                checked={selectedItems.includes(item.id)}
                onChange={() => handleItemToggle(item.id)}
              />
              <span className="item-color" style={{ backgroundColor: item.color }}></span>
              <span className="item-name">{item.name}</span>
            </label>
          ))}
        </div>
      </div>
      
      <div className="chart-container">
        <svg width={chartWidth} height={chartHeight}>
          {/* Y-axis (Metrics) */}
          <g className="y-axis">
            {metrics.map((metric, i) => {
              const y = padding.top + i * barHeight + barHeight / 2;
              return (
                <g key={i} transform={`translate(${padding.left}, ${y})`}>
                  <text
                    x="-10"
                    textAnchor="end"
                    dominantBaseline="middle"
                    fontSize="12"
                    fill="#666"
                  >
                    {metric.name}
                  </text>
                </g>
              );
            })}
          </g>
          
          {/* Bars */}
          {metrics.map((metric, i) => {
            // Find max value for this metric
            const metricValues = Object.values(metric.values);
            const maxValue = Math.max(...metricValues);
            
            return (
              <g key={i} transform={`translate(0, ${padding.top + i * barHeight})`}>
                {/* Background line */}
                <line
                  x1={padding.left}
                  y1={barHeight / 2}
                  x2={padding.left + innerWidth}
                  y2={barHeight / 2}
                  stroke="#eee"
                  strokeWidth="1"
                />
                
                {/* Bars for each item */}
                {filteredItems.map((item, j) => {
                  const value = metric.values[item.id] || 0;
                  const width = (value / maxValue) * innerWidth;
                  const y = (barHeight - groupHeight) / 2 + j * barWidth;
                  
                  return (
                    <g key={`${i}-${j}`}>
                      <rect
                        x={padding.left}
                        y={y}
                        width={width}
                        height={barWidth}
                        fill={item.color}
                        opacity="0.8"
                      >
                        <title>{item.name}: {value}</title>
                      </rect>
                      <text
                        x={padding.left + width + 5}
                        y={y + barWidth / 2}
                        dominantBaseline="middle"
                        fontSize="10"
                        fill="#666"
                      >
                        {metric.name === 'Total Value' 
                          ? `$${(value / 1000000).toFixed(1)}M` 
                          : `${value}${metric.name.includes('%') ? '%' : ''}`}
                      </text>
                    </g>
                  );
                })}
              </g>
            );
          })}
        </svg>
      </div>
      
      <div className="chart-footer">
        <p className="chart-note">Select items to compare</p>
      </div>
    </div>
  );
};

/**
 * Dashboard component to organize multiple charts
 * @param {Object} props Component properties
 * @returns {JSX.Element} Dashboard component
 */
export const AnalyticsDashboard = ({ portfolioData, performanceData, comparisonData }) => {
  const [layout, setLayout] = useState('grid'); // grid or list
  
  return (
    <div className={`analytics-dashboard ${layout}`}>
      <div className="dashboard-header">
        <h2>Portfolio Analytics</h2>
        <div className="layout-toggles">
          <button 
            className={layout === 'grid' ? 'active' : ''} 
            onClick={() => setLayout('grid')}
            title="Grid Layout"
          >
            <span className="material-icons">grid_view</span>
          </button>
          <button 
            className={layout === 'list' ? 'active' : ''} 
            onClick={() => setLayout('list')}
            title="List Layout"
          >
            <span className="material-icons">view_list</span>
          </button>
        </div>
      </div>
      
      <div className="dashboard-content">
        <div className="chart-panel">
          <EnhancedPortfolioChart portfolioData={portfolioData} />
        </div>
        
        <div className="chart-panel">
          <EnhancedPerformanceChart performanceData={performanceData} />
        </div>
        
        <div className="chart-panel wide">
          <EnhancedComparisonChart comparisonData={comparisonData} />
        </div>
      </div>
    </div>
  );
};

// Export all components
export default {
  EnhancedPortfolioChart,
  EnhancedPerformanceChart,
  EnhancedComparisonChart,
  AnalyticsDashboard
};
