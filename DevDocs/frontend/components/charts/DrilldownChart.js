import React, { useState, useEffect, useCallback } from 'react';
import { Doughnut, Pie, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { FiArrowLeft, FiHome, FiBarChart2, FiPieChart } from 'react-icons/fi';
import AccessibilityWrapper from '../AccessibilityWrapper';

// Register the required chart components
ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// Generate color palette for consistency across drill levels
const generateColorPalette = (baseHue, count) => {
  const palette = {};
  const baseColors = [];
  
  // Generate base colors
  for (let i = 0; i < count; i++) {
    const hue = (baseHue + i * (360 / count)) % 360;
    baseColors.push(`hsla(${hue}, 70%, 60%, 0.8)`);
    palette[`level0_${i}`] = `hsla(${hue}, 70%, 60%, 0.8)`;
  }
  
  // Generate variations for sub-levels
  for (let i = 0; i < count; i++) {
    const hue = (baseHue + i * (360 / count)) % 360;
    for (let j = 0; j < 5; j++) { // Up to 5 sub-items per category
      palette[`level1_${i}_${j}`] = `hsla(${hue}, 70%, ${60 - j*5}%, 0.8)`;
    }
  }
  
  return { palette, baseColors };
};

// Parse hierarchical data for multi-level drill-down
const parseDataForDrillDown = (data, level = 0, parentIndex = null) => {
  if (!data || !Array.isArray(data)) return { labels: [], values: [], ids: [], hasChildren: [] };
  
  const labels = [];
  const values = [];
  const ids = [];
  const hasChildren = [];
  
  data.forEach((item, index) => {
    const id = parentIndex !== null ? `${parentIndex}_${index}` : `${index}`;
    labels.push(item.name || item.label || `Item ${index + 1}`);
    values.push(item.value || 0);
    ids.push(id);
    hasChildren.push(!!item.subHoldings && item.subHoldings.length > 0);
  });
  
  return { labels, values, ids, hasChildren };
};

// Create data structure for chart visualization
const createDrilldownData = (data) => {
  if (!data || !data.holdings) return null;
  
  const { palette, baseColors } = generateColorPalette(220, data.holdings.length);
  const { labels, values, ids, hasChildren } = parseDataForDrillDown(data.holdings);
  
  return {
    chartData: {
      labels,
      datasets: [
        {
          data: values,
          backgroundColor: baseColors,
          borderColor: baseColors.map(color => color.replace('0.8', '1')),
          borderWidth: 1
        }
      ]
    },
    drilldownData: {
      ids,
      hasChildren,
      palette,
      paths: [{ level: 0, title: "Portfolio Allocation" }],
      dataMap: {
        // Map top level data
        "root": { items: data.holdings, level: 0 },
        // Map each holding's sub-holdings
        ...data.holdings.reduce((acc, holding, idx) => {
          if (holding.subHoldings) {
            acc[idx] = { items: holding.subHoldings, level: 1 };
            
            // Map 3rd level if available
            if (holding.subHoldings.some(sub => sub.subHoldings)) {
              holding.subHoldings.forEach((subHolding, subIdx) => {
                if (subHolding.subHoldings) {
                  acc[`${idx}_${subIdx}`] = { items: subHolding.subHoldings, level: 2 };
                }
              });
            }
          }
          return acc;
        }, {})
      }
    }
  };
};

const DrilldownChart = ({ data, height = 400, width = '100%', initialChartType = 'doughnut' }) => {
  const [chartType, setChartType] = useState(initialChartType);
  const [chartData, setChartData] = useState(null);
  const [drilldownMeta, setDrilldownMeta] = useState(null);
  const [currentId, setCurrentId] = useState('root');
  const [currentPath, setCurrentPath] = useState([]);
  const [options, setOptions] = useState({});
  
  useEffect(() => {
    if (!data) return;
    
    const processedData = createDrilldownData(data);
    if (processedData) {
      setChartData(processedData.chartData);
      setDrilldownMeta(processedData.drilldownData);
      setCurrentPath(processedData.drilldownData.paths);
    }
  }, [data]);
  
  useEffect(() => {
    // Update chart options based on chart type and data
    if (!chartData) return;
    
    const newOptions = {
      responsive: true,
      maintainAspectRatio: false,
      onClick: handleChartClick,
      plugins: {
        legend: {
          position: chartType === 'bar' ? 'top' : 'right',
          labels: {
            boxWidth: 15,
            font: {
              size: 12
            }
          }
        },
        title: {
          display: true,
          text: currentPath.length > 0 ? currentPath[currentPath.length - 1].title : 'Portfolio Allocation',
          font: {
            size: 16,
            weight: 'bold'
          }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const label = context.label || '';
              const value = context.raw;
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const percentage = ((value / total) * 100).toFixed(1);
              return `${label}: ${value.toLocaleString()} (${percentage}%)`;
            }
          }
        }
      }
    };
    
    // Add specific options for bar chart
    if (chartType === 'bar') {
      newOptions.indexAxis = 'y'; // Horizontal bar chart
      newOptions.scales = {
        x: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Value'
          }
        }
      };
    }
    
    setOptions(newOptions);
  }, [chartData, chartType, currentPath]);
  
  const handleChartClick = useCallback((event, elements) => {
    if (!elements || !elements.length || !drilldownMeta) return;
    
    const clickedIndex = elements[0].index;
    const id = drilldownMeta.ids[clickedIndex];
    
    if (!drilldownMeta.hasChildren[clickedIndex]) return;
    
    drillDown(id);
  }, [drilldownMeta]);
  
  const drillDown = (id) => {
    if (!drilldownMeta || !drilldownMeta.dataMap[id]) return;
    
    const nextLevel = drilldownMeta.dataMap[id];
    const { items, level } = nextLevel;
    
    // Get parent element name for title
    const parentTitle = getParentTitle(id);
    
    const { labels, values, ids, hasChildren } = parseDataForDrillDown(items, level, id);
    
    // Get colors from palette for this level
    const parentIdx = id.includes('_') ? id.split('_')[0] : id;
    const backgroundColors = ids.map((itemId, idx) => {
      const paletteKey = level === 1 ? `level1_${parentIdx}_${idx}` : `level0_${idx}`;
      return drilldownMeta.palette[paletteKey] || `hsla(220, 70%, ${60 - idx*5}%, 0.8)`;
    });
    
    const newPath = [...currentPath, {
      level: level,
      title: `${parentTitle} Breakdown`,
      parentId: id
    }];
    
    setChartData({
      labels,
      datasets: [
        {
          data: values,
          backgroundColor: backgroundColors,
          borderColor: backgroundColors.map(color => color.replace('0.8', '1')),
          borderWidth: 1
        }
      ]
    });
    
    setCurrentPath(newPath);
    setCurrentId(id);
  };
  
  const drillUp = () => {
    if (currentPath.length <= 1) return;
    
    const newPath = [...currentPath];
    newPath.pop();
    const parentLevel = newPath[newPath.length - 1];
    
    // If going back to root
    if (newPath.length === 1) {
      setChartData(createDrilldownData(data).chartData);
      setCurrentId('root');
    } else {
      // Go to parent level
      drillDown(parentLevel.parentId);
    }
    
    setCurrentPath(newPath);
  };
  
  const resetDrill = () => {
    if (!data) return;
    
    const processedData = createDrilldownData(data);
    setChartData(processedData.chartData);
    setCurrentPath([{ level: 0, title: "Portfolio Allocation" }]);
    setCurrentId('root');
  };
  
  const getParentTitle = (id) => {
    if (id === 'root') return 'Portfolio';
    
    // For top level items
    if (!id.includes('_')) {
      const itemIndex = parseInt(id);
      return data.holdings[itemIndex]?.name || 'Item';
    }
    
    // For nested items
    const [parentId, childId] = id.split('_');
    const parent = data.holdings[parseInt(parentId)];
    if (parent && parent.subHoldings) {
      return parent.subHoldings[parseInt(childId)]?.name || 'Subitem';
    }
    
    return 'Item';
  };
  
  const renderChart = () => {
    if (!chartData) return (
      <div className="flex justify-center items-center h-64 bg-gray-100 rounded-lg">
        Loading chart data...
      </div>
    );
    
    switch (chartType) {
      case 'doughnut':
        return <Doughnut data={chartData} options={options} />;
      case 'pie':
        return <Pie data={chartData} options={options} />;
      case 'bar':
        return <Bar data={chartData} options={options} />;
      default:
        return <Doughnut data={chartData} options={options} />;
    }
  };
  
  const renderBreadcrumbs = () => {
    if (currentPath.length <= 1) return null;
    
    return (
      <div className="flex items-center text-sm mb-2 text-gray-600">
        <button 
          onClick={resetDrill}
          className="flex items-center mr-2 hover:text-blue-600"
        >
          <FiHome className="mr-1" />
          <span>Home</span>
        </button>
        
        {currentPath.slice(1).map((path, index) => (
          <React.Fragment key={index}>
            <span className="mx-1">/</span>
            <span className="mr-1">{path.title}</span>
          </React.Fragment>
        ))}
      </div>
    );
  };
  
  return (
    <AccessibilityWrapper>
      <div style={{ width, height }} className="flex flex-col">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center">
            {currentPath.length > 1 && (
              <button 
                onClick={drillUp}
                className="mr-2 p-1 rounded-full bg-gray-100 hover:bg-gray-200"
                aria-label="Go back"
              >
                <FiArrowLeft className="h-5 w-5" />
              </button>
            )}
            
            {renderBreadcrumbs()}
          </div>
          
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={() => setChartType('doughnut')}
              className={`p-2 rounded-md ${chartType === 'doughnut' ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:bg-gray-100'}`}
              title="Doughnut Chart"
              aria-pressed={chartType === 'doughnut'}
            >
              <FiPieChart className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => setChartType('pie')}
              className={`p-2 rounded-md ${chartType === 'pie' ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:bg-gray-100'}`}
              title="Pie Chart"
              aria-pressed={chartType === 'pie'}
            >
              <FiPieChart className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => setChartType('bar')}
              className={`p-2 rounded-md ${chartType === 'bar' ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:bg-gray-100'}`}
              title="Bar Chart"
              aria-pressed={chartType === 'bar'}
            >
              <FiBarChart2 className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        <div className="flex-1 relative">
          {renderChart()}
        </div>
        
        {chartData && (
          <div className="mt-2 text-xs text-gray-500">
            Click on a segment to drill down into details
          </div>
        )}
      </div>
    </AccessibilityWrapper>
  );
};

export default DrilldownChart;
