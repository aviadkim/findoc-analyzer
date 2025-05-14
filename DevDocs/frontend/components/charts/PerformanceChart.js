import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend,
  Filler
} from 'chart.js';
import { FiTrendingUp, FiDollarSign, FiPercent, FiPieChart, FiBarChart, FiInfo } from 'react-icons/fi';
import AccessibilityWrapper from '../AccessibilityWrapper';

// Register the required chart components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Helper functions for metrics calculations
function calculateVolatility(values) {
  // Calculate percentage changes
  const changes = [];
  for (let i = 1; i < values.length; i++) {
    changes.push((values[i] - values[i-1]) / values[i-1] * 100);
  }
  
  // Calculate standard deviation of changes
  const mean = changes.reduce((sum, val) => sum + val, 0) / changes.length;
  const squaredDiffs = changes.map(val => Math.pow(val - mean, 2));
  const variance = squaredDiffs.reduce((sum, val) => sum + val, 0) / squaredDiffs.length;
  return Math.sqrt(variance);
}

function calculateMaxDrawdown(values) {
  let maxDrawdown = 0;
  let peak = values[0];
  
  for (let i = 1; i < values.length; i++) {
    if (values[i] > peak) {
      peak = values[i];
    } else {
      const drawdown = (peak - values[i]) / peak * 100;
      maxDrawdown = Math.max(maxDrawdown, drawdown);
    }
  }
  
  return maxDrawdown;
}

function calculateSharpeRatio(returns, riskFreeRate = 2) {
  const mean = returns.reduce((sum, val) => sum + val, 0) / returns.length;
  const excessReturn = mean - riskFreeRate;
  
  // Calculate standard deviation (risk)
  const squaredDiffs = returns.map(val => Math.pow(val - mean, 2));
  const variance = squaredDiffs.reduce((sum, val) => sum + val, 0) / squaredDiffs.length;
  const stdDev = Math.sqrt(variance);
  
  return stdDev === 0 ? 0 : excessReturn / stdDev;
}

// Calculate percentage changes from starting point
const calculatePercentageChanges = (series) => {
  const startValue = series[0];
  return series.map(value => ((value - startValue) / startValue) * 100);
};

// Create portfolio performance tracking data
const createPerformanceTrackingData = (data) => {
  if (!data || !data.portfolioTimeSeries) return null;
  
  const { dates, values, assetPerformance, benchmarks } = data.portfolioTimeSeries;
  
  // Prepare time series data
  const timeSeriesData = {
    labels: dates,
    datasets: [
      {
        label: 'Portfolio Value',
        data: values,
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.4,
        fill: true,
        yAxisID: 'y'
      }
    ]
  };
  
  // Prepare performance comparison data (percentage change)
  const performanceData = {
    labels: dates,
    datasets: [
      {
        label: 'Portfolio',
        data: calculatePercentageChanges(values),
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'transparent',
        tension: 0.4,
        borderWidth: 2
      },
      // Add benchmark comparisons
      ...Object.entries(benchmarks || {}).map(([name, series], index) => {
        const colors = ['rgba(255, 99, 132, 1)', 'rgba(54, 162, 235, 1)'];
        return {
          label: name,
          data: calculatePercentageChanges(series),
          borderColor: colors[index % colors.length],
          backgroundColor: 'transparent',
          tension: 0.4,
          borderWidth: 2,
          borderDash: [5, 5]
        };
      })
    ]
  };
  
  // Prepare asset class breakdown over time
  const assetClassData = {
    labels: dates,
    datasets: Object.entries(assetPerformance || {}).map(([assetClass, series], index) => {
      // Generate distinct colors for each asset class
      const hue = (220 + index * (360 / Object.keys(assetPerformance || {}).length)) % 360;
      const color = `hsla(${hue}, 70%, 60%, 0.8)`;
      
      return {
        label: assetClass,
        data: series,
        borderColor: color.replace('0.8', '1'),
        backgroundColor: color,
        tension: 0.4,
        fill: true
      };
    })
  };
  
  // Calculate key metrics
  const metrics = {
    totalReturn: ((values[values.length - 1] - values[0]) / values[0] * 100).toFixed(2) + '%',
    volatility: calculateVolatility(values).toFixed(2) + '%',
    maxDrawdown: calculateMaxDrawdown(values).toFixed(2) + '%',
    sharpeRatio: calculateSharpeRatio(calculatePercentageChanges(values)).toFixed(2)
  };
  
  return {
    timeSeriesData,
    performanceData,
    assetClassData,
    metrics
  };
};

const PerformanceChart = ({ data, height = 400, width = '100%', title = "Portfolio Performance" }) => {
  const [chartMode, setChartMode] = useState('value'); // 'value', 'percentage', 'allocation'
  const [chartData, setChartData] = useState(null);
  const [options, setOptions] = useState({});
  const [metrics, setMetrics] = useState(null);
  const [timeframe, setTimeframe] = useState('all'); // 'all', '1y', '6m', '3m', '1m'
  
  useEffect(() => {
    if (!data) return;
    
    const processedData = createPerformanceTrackingData(data);
    if (processedData) {
      setChartData(processedData);
      setMetrics(processedData.metrics);
    }
  }, [data]);
  
  useEffect(() => {
    // Update chart options based on chart mode
    if (!chartData) return;
    
    let currentData;
    let yAxisLabel = '';
    
    switch (chartMode) {
      case 'value':
        currentData = chartData.timeSeriesData;
        yAxisLabel = 'Value';
        break;
      case 'percentage':
        currentData = chartData.performanceData;
        yAxisLabel = 'Change (%)';
        break;
      case 'allocation':
        currentData = chartData.assetClassData;
        yAxisLabel = 'Value';
        break;
      default:
        currentData = chartData.timeSeriesData;
        yAxisLabel = 'Value';
    }
    
    // Filter data based on selected timeframe
    if (timeframe !== 'all' && currentData.labels.length > 0) {
      const now = new Date(currentData.labels[currentData.labels.length - 1]);
      let cutoffDate = new Date(now);
      
      switch (timeframe) {
        case '1y':
          cutoffDate.setFullYear(now.getFullYear() - 1);
          break;
        case '6m':
          cutoffDate.setMonth(now.getMonth() - 6);
          break;
        case '3m':
          cutoffDate.setMonth(now.getMonth() - 3);
          break;
        case '1m':
          cutoffDate.setMonth(now.getMonth() - 1);
          break;
        default:
          // 'all' - do nothing
      }
      
      // Find the index of the cutoff date or nearest date after it
      let startIndex = 0;
      for (let i = 0; i < currentData.labels.length; i++) {
        if (new Date(currentData.labels[i]) >= cutoffDate) {
          startIndex = i;
          break;
        }
      }
      
      // Filter data
      const filteredData = {
        labels: currentData.labels.slice(startIndex),
        datasets: currentData.datasets.map(dataset => ({
          ...dataset,
          data: dataset.data.slice(startIndex)
        }))
      };
      
      currentData = filteredData;
    }
    
    const newOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: !!title,
          text: title,
          font: {
            size: 16,
            weight: 'bold'
          }
        },
        tooltip: {
          mode: 'index',
          intersect: false,
          callbacks: {
            label: function(context) {
              const label = context.dataset.label || '';
              const value = context.parsed.y;
              
              if (chartMode === 'percentage') {
                return `${label}: ${value.toFixed(2)}%`;
              }
              
              return `${label}: ${value.toLocaleString()}`;
            }
          }
        }
      },
      scales: {
        x: {
          title: {
            display: true,
            text: 'Date'
          }
        },
        y: {
          beginAtZero: chartMode === 'percentage',
          title: {
            display: true,
            text: yAxisLabel
          },
          ticks: {
            callback: function(value) {
              if (chartMode === 'percentage') {
                return value + '%';
              }
              return value.toLocaleString();
            }
          }
        }
      },
      interaction: {
        mode: 'nearest',
        axis: 'x',
        intersect: false
      }
    };
    
    // For stacked area chart in allocation mode
    if (chartMode === 'allocation') {
      newOptions.scales.y.stacked = true;
    }
    
    setOptions(newOptions);
  }, [chartData, chartMode, title, timeframe]);
  
  const renderChart = () => {
    if (!chartData) return (
      <div className="flex justify-center items-center h-64 bg-gray-100 rounded-lg">
        Loading chart data...
      </div>
    );
    
    let currentData;
    
    switch (chartMode) {
      case 'value':
        currentData = chartData.timeSeriesData;
        break;
      case 'percentage':
        currentData = chartData.performanceData;
        break;
      case 'allocation':
        currentData = chartData.assetClassData;
        break;
      default:
        currentData = chartData.timeSeriesData;
    }
    
    // Filter data based on selected timeframe
    if (timeframe !== 'all' && currentData.labels.length > 0) {
      const now = new Date(currentData.labels[currentData.labels.length - 1]);
      let cutoffDate = new Date(now);
      
      switch (timeframe) {
        case '1y':
          cutoffDate.setFullYear(now.getFullYear() - 1);
          break;
        case '6m':
          cutoffDate.setMonth(now.getMonth() - 6);
          break;
        case '3m':
          cutoffDate.setMonth(now.getMonth() - 3);
          break;
        case '1m':
          cutoffDate.setMonth(now.getMonth() - 1);
          break;
        default:
          // 'all' - do nothing
      }
      
      // Find the index of the cutoff date or nearest date after it
      let startIndex = 0;
      for (let i = 0; i < currentData.labels.length; i++) {
        if (new Date(currentData.labels[i]) >= cutoffDate) {
          startIndex = i;
          break;
        }
      }
      
      // Filter data
      const filteredData = {
        labels: currentData.labels.slice(startIndex),
        datasets: currentData.datasets.map(dataset => ({
          ...dataset,
          data: dataset.data.slice(startIndex)
        }))
      };
      
      currentData = filteredData;
    }
    
    return <Line data={currentData} options={options} />;
  };
  
  const renderMetrics = () => {
    if (!metrics) return null;
    
    const { totalReturn, volatility, maxDrawdown, sharpeRatio } = metrics;
    
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
        <div className="bg-blue-50 p-3 rounded-lg">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-medium text-blue-500 uppercase">Total Return</h4>
            <span className="text-blue-400 cursor-pointer" title="Total return since inception">
              <FiInfo />
            </span>
          </div>
          <p className={`mt-1 text-lg font-semibold ${parseFloat(totalReturn) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {totalReturn}
          </p>
        </div>
        
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-medium text-gray-500 uppercase">Volatility</h4>
            <span className="text-gray-400 cursor-pointer" title="Standard deviation of returns, measuring risk">
              <FiInfo />
            </span>
          </div>
          <p className="mt-1 text-lg font-semibold text-gray-700">{volatility}</p>
        </div>
        
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-medium text-gray-500 uppercase">Max Drawdown</h4>
            <span className="text-gray-400 cursor-pointer" title="Maximum observed loss from a peak to a trough">
              <FiInfo />
            </span>
          </div>
          <p className="mt-1 text-lg font-semibold text-red-600">-{maxDrawdown}</p>
        </div>
        
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-medium text-gray-500 uppercase">Sharpe Ratio</h4>
            <span className="text-gray-400 cursor-pointer" title="Risk-adjusted return (higher is better)">
              <FiInfo />
            </span>
          </div>
          <p className="mt-1 text-lg font-semibold text-gray-700">{sharpeRatio}</p>
        </div>
      </div>
    );
  };
  
  return (
    <AccessibilityWrapper>
      <div style={{ width, height }} className="flex flex-col">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
          <div className="flex space-x-1 border border-gray-200 rounded overflow-hidden">
            <button
              onClick={() => setChartMode('value')}
              className={`px-3 py-1 text-sm flex items-center ${chartMode === 'value' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700'}`}
              title="Portfolio Value"
            >
              <FiDollarSign className="mr-1 h-4 w-4" />
              <span>Value</span>
            </button>
            <button
              onClick={() => setChartMode('percentage')}
              className={`px-3 py-1 text-sm flex items-center ${chartMode === 'percentage' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700'}`}
              title="Percentage Change"
            >
              <FiPercent className="mr-1 h-4 w-4" />
              <span>Change</span>
            </button>
            <button
              onClick={() => setChartMode('allocation')}
              className={`px-3 py-1 text-sm flex items-center ${chartMode === 'allocation' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700'}`}
              title="Asset Allocation"
            >
              <FiPieChart className="mr-1 h-4 w-4" />
              <span>Allocation</span>
            </button>
          </div>
          
          <div className="flex space-x-1 border border-gray-200 rounded overflow-hidden">
            <button
              onClick={() => setTimeframe('1m')}
              className={`px-2 py-1 text-xs ${timeframe === '1m' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700'}`}
            >
              1M
            </button>
            <button
              onClick={() => setTimeframe('3m')}
              className={`px-2 py-1 text-xs ${timeframe === '3m' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700'}`}
            >
              3M
            </button>
            <button
              onClick={() => setTimeframe('6m')}
              className={`px-2 py-1 text-xs ${timeframe === '6m' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700'}`}
            >
              6M
            </button>
            <button
              onClick={() => setTimeframe('1y')}
              className={`px-2 py-1 text-xs ${timeframe === '1y' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700'}`}
            >
              1Y
            </button>
            <button
              onClick={() => setTimeframe('all')}
              className={`px-2 py-1 text-xs ${timeframe === 'all' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700'}`}
            >
              All
            </button>
          </div>
        </div>
        
        <div className="flex-1 relative">
          {renderChart()}
        </div>
        
        {renderMetrics()}
      </div>
    </AccessibilityWrapper>
  );
};

export default PerformanceChart;
