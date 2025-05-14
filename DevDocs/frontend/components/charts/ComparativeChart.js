import React, { useState, useEffect, useRef } from 'react';
import { Bar, Line } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  PointElement, 
  LineElement,
  Title, 
  Tooltip, 
  Legend 
} from 'chart.js';
import { FiBarChart2, FiTrendingUp, FiList, FiArrowRight } from 'react-icons/fi';
import AccessibilityWrapper from '../AccessibilityWrapper';

// Register the required chart components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// Create data for comparative visualization
const createComparisonVisualizationData = (documents) => {
  if (!documents || !Array.isArray(documents) || documents.length < 1) return null;
  
  // Get all unique asset classes across documents
  const allAssetClasses = [...new Set(
    documents.flatMap(doc => (doc.holdings || []).map(h => h.name))
  )];
  
  // Create comparative datasets
  const labels = allAssetClasses;
  const datasets = documents.map((doc, index) => {
    const colors = [
      'rgba(75, 192, 192, 0.8)',
      'rgba(255, 99, 132, 0.8)',
      'rgba(54, 162, 235, 0.8)',
      'rgba(255, 206, 86, 0.8)',
      'rgba(153, 102, 255, 0.8)'
    ];
    const color = colors[index % colors.length];
    const borderColor = color.replace('0.8', '1');
    
    // Map values to match all asset classes
    const values = allAssetClasses.map(assetClass => {
      const holding = (doc.holdings || []).find(h => h.name === assetClass);
      return holding ? holding.value : 0;
    });
    
    return {
      label: doc.name || `Document ${index + 1}`,
      data: values,
      backgroundColor: color,
      borderColor: borderColor,
      borderWidth: 1
    };
  });
  
  // Calculate percentage change between documents
  const percentageChanges = {};
  if (documents.length >= 2) {
    allAssetClasses.forEach(assetClass => {
      const doc1Holding = (documents[0].holdings || []).find(h => h.name === assetClass);
      const doc2Holding = (documents[1].holdings || []).find(h => h.name === assetClass);
      
      const doc1Value = doc1Holding ? doc1Holding.value : 0;
      const doc2Value = doc2Holding ? doc2Holding.value : 0;
      
      if (doc1Value > 0) {
        const change = ((doc2Value - doc1Value) / doc1Value) * 100;
        percentageChanges[assetClass] = change.toFixed(1);
      } else if (doc2Value > 0) {
        percentageChanges[assetClass] = "∞"; // Infinity if starting from zero
      } else {
        percentageChanges[assetClass] = "0.0";
      }
    });
  }
  
  // Generate growth datasets for line chart
  const growthDatasets = documents.map((doc, index) => {
    const colors = [
      'rgba(75, 192, 192, 1)',
      'rgba(255, 99, 132, 1)',
      'rgba(54, 162, 235, 1)',
      'rgba(255, 206, 86, 1)',
      'rgba(153, 102, 255, 1)'
    ];
    
    return {
      label: doc.name || `Document ${index + 1}`,
      data: allAssetClasses.map(assetClass => {
        const holding = (doc.holdings || []).find(h => h.name === assetClass);
        return holding ? holding.value : 0;
      }),
      borderColor: colors[index % colors.length],
      backgroundColor: 'transparent',
      tension: 0.4,
      borderWidth: 2
    };
  });
  
  // Calculate summary metrics
  const summaryMetrics = {
    totalValueChange: documents.length >= 2 ? calculateTotalValueChange(documents) : null,
    percentageChangeByAsset: percentageChanges,
    dates: documents.map(doc => doc.summary?.asOfDate || 'N/A')
  };
  
  return {
    barChartData: {
      labels,
      datasets
    },
    lineChartData: {
      labels,
      datasets: growthDatasets
    },
    summaryData: summaryMetrics
  };
};

// Calculate total value change between two documents
const calculateTotalValueChange = (documents) => {
  if (!documents || documents.length < 2) return null;
  
  const extractValue = (doc) => {
    if (!doc.summary) return 0;
    
    if (doc.summary.totalValue) {
      // Handle currency string format
      if (typeof doc.summary.totalValue === 'string') {
        return parseFloat(doc.summary.totalValue.replace(/[^0-9.-]+/g, ""));
      }
      return doc.summary.totalValue;
    }
    
    // If no totalValue, sum up the holdings
    return (doc.holdings || []).reduce((sum, holding) => sum + (holding.value || 0), 0);
  };
  
  const doc1Value = extractValue(documents[0]);
  const doc2Value = extractValue(documents[1]);
  
  return {
    absolute: doc2Value - doc1Value,
    percentage: doc1Value > 0 ? ((doc2Value - doc1Value) / doc1Value) * 100 : 0
  };
};

const ComparativeChart = ({ documents, height = 400, width = '100%', title = "Document Comparison" }) => {
  const [chartType, setChartType] = useState('bar');
  const [chartData, setChartData] = useState(null);
  const [activeTab, setActiveTab] = useState('chart');
  const [options, setOptions] = useState({});
  const [summaryData, setSummaryData] = useState(null);
  
  // Animation refs
  const animationRef = useRef(null);
  const [isChangesAnimated, setIsChangesAnimated] = useState(false);
  
  useEffect(() => {
    if (!documents) return;
    
    const processedData = createComparisonVisualizationData(documents);
    if (processedData) {
      setChartData(processedData);
      setSummaryData(processedData.summaryData);
      
      // Reset animation state
      setIsChangesAnimated(false);
    }
  }, [documents]);
  
  useEffect(() => {
    // Update chart options based on chart type
    if (!chartData) return;
    
    let newOptions = {
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
          callbacks: {
            label: function(context) {
              const label = context.dataset.label || '';
              const value = context.parsed.y || context.parsed || 0;
              
              // If we have percentage change data for this asset, show it
              const assetName = context.label;
              const percentChange = summaryData?.percentageChangeByAsset[assetName];
              
              const valueFormatted = value.toLocaleString();
              
              if (documents.length >= 2 && percentChange && context.datasetIndex === 1) {
                return `${label}: ${valueFormatted} (${percentChange}% change)`;
              }
              
              return `${label}: ${valueFormatted}`;
            }
          }
        }
      }
    };
    
    // Add specific options for bar chart
    if (chartType === 'bar') {
      newOptions.scales = {
        x: {
          title: {
            display: true,
            text: 'Asset'
          }
        },
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Value'
          }
        }
      };
    }
    
    // Add specific options for line chart
    if (chartType === 'line') {
      newOptions.scales = {
        x: {
          title: {
            display: true,
            text: 'Asset'
          }
        },
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Value'
          }
        }
      };
    }
    
    setOptions(newOptions);
  }, [chartData, chartType, title, documents, summaryData]);
  
  // Animate the changes when tab changes to "changes"
  useEffect(() => {
    if (activeTab === 'changes' && !isChangesAnimated && summaryData) {
      const animateChanges = () => {
        const elements = document.querySelectorAll('.change-value');
        elements.forEach((el, index) => {
          setTimeout(() => {
            el.classList.add('animate-pulse');
            setTimeout(() => {
              el.classList.remove('animate-pulse');
            }, 1000);
          }, index * 300);
        });
        
        setIsChangesAnimated(true);
      };
      
      animationRef.current = setTimeout(animateChanges, 500);
      
      return () => {
        if (animationRef.current) {
          clearTimeout(animationRef.current);
        }
      };
    }
  }, [activeTab, isChangesAnimated, summaryData]);
  
  const renderChart = () => {
    if (!chartData) return (
      <div className="flex justify-center items-center h-64 bg-gray-100 rounded-lg">
        Loading chart data...
      </div>
    );
    
    switch (chartType) {
      case 'bar':
        return <Bar data={chartData.barChartData} options={options} />;
      case 'line':
        return <Line data={chartData.lineChartData} options={options} />;
      default:
        return <Bar data={chartData.barChartData} options={options} />;
    }
  };
  
  const renderChanges = () => {
    if (!summaryData || !documents || documents.length < 2) {
      return (
        <div className="p-4 text-center text-gray-500">
          At least two documents are required to show changes.
        </div>
      );
    }
    
    const { totalValueChange, percentageChangeByAsset, dates } = summaryData;
    
    return (
      <div className="p-4">
        <div className="mb-6 bg-blue-50 p-4 rounded-lg shadow-sm">
          <h4 className="text-blue-700 text-lg font-semibold mb-2">Total Portfolio Value Change</h4>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="text-gray-600">
                {dates[0] || 'Initial'}
              </div>
              <FiArrowRight className="mx-3 text-gray-400" />
              <div className="text-gray-600">
                {dates[1] || 'Current'}
              </div>
            </div>
            {totalValueChange && (
              <div className={`text-2xl font-bold change-value ${totalValueChange.absolute >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {totalValueChange.absolute >= 0 ? '+' : ''}{totalValueChange.absolute.toLocaleString()} 
                <span className="text-sm ml-1">
                  ({totalValueChange.percentage.toFixed(1)}%)
                </span>
              </div>
            )}
          </div>
        </div>
        
        <div>
          <h4 className="text-gray-700 text-lg font-semibold mb-3">Asset Class Changes</h4>
          <div className="grid grid-cols-1 gap-2">
            {Object.entries(percentageChangeByAsset).map(([asset, change]) => {
              const changeValue = parseFloat(change);
              const isPositive = changeValue > 0;
              const isZero = changeValue === 0 || change === "0.0";
              
              // Find the actual values from the documents
              const doc1Asset = (documents[0].holdings || []).find(h => h.name === asset);
              const doc2Asset = (documents[1].holdings || []).find(h => h.name === asset);
              const value1 = doc1Asset ? doc1Asset.value : 0;
              const value2 = doc2Asset ? doc2Asset.value : 0;
              const absoluteChange = value2 - value1;
              
              return (
                <div key={asset} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="font-medium">{asset}</div>
                  <div className="flex items-center">
                    <div className="text-gray-600 text-sm mr-3">
                      {value1.toLocaleString()} → {value2.toLocaleString()}
                    </div>
                    <div 
                      className={`change-value font-semibold ${
                        isZero ? 'text-gray-500' : (isPositive ? 'text-green-600' : 'text-red-600')
                      }`}
                    >
                      {isPositive ? '+' : ''}{absoluteChange.toLocaleString()} 
                      <span className="ml-1">({change}%)</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };
  
  const renderTable = () => {
    if (!chartData || !documents) {
      return (
        <div className="p-4 text-center text-gray-500">
          No data available.
        </div>
      );
    }
    
    const { barChartData } = chartData;
    
    return (
      <div className="p-4 overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 rounded-lg overflow-hidden">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Asset
              </th>
              {barChartData.datasets.map((dataset, idx) => (
                <th key={idx} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {dataset.label}
                </th>
              ))}
              {documents.length >= 2 && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Change
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {barChartData.labels.map((label, idx) => (
              <tr key={idx}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {label}
                </td>
                {barChartData.datasets.map((dataset, dataIdx) => (
                  <td key={dataIdx} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {dataset.data[idx].toLocaleString()}
                  </td>
                ))}
                {documents.length >= 2 && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {summaryData.percentageChangeByAsset[label] && (
                      <span className={`font-medium ${
                        parseFloat(summaryData.percentageChangeByAsset[label]) > 0 
                          ? 'text-green-600' 
                          : parseFloat(summaryData.percentageChangeByAsset[label]) < 0 
                            ? 'text-red-600'
                            : 'text-gray-500'
                      }`}>
                        {parseFloat(summaryData.percentageChangeByAsset[label]) > 0 ? '+' : ''}
                        {summaryData.percentageChangeByAsset[label]}%
                      </span>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };
  
  return (
    <AccessibilityWrapper>
      <div style={{ width, height }} className="flex flex-col border border-gray-200 rounded-lg overflow-hidden">
        <div className="flex justify-between items-center px-4 py-3 bg-gray-50 border-b border-gray-200">
          <div className="text-lg font-semibold text-gray-800">{title}</div>
          
          <div className="flex">
            <div className="flex mr-4 border border-gray-200 rounded overflow-hidden">
              <button
                onClick={() => setActiveTab('chart')}
                className={`px-3 py-1 text-sm ${activeTab === 'chart' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700'}`}
              >
                Chart
              </button>
              <button
                onClick={() => setActiveTab('changes')}
                className={`px-3 py-1 text-sm ${activeTab === 'changes' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700'}`}
              >
                Changes
              </button>
              <button
                onClick={() => setActiveTab('table')}
                className={`px-3 py-1 text-sm ${activeTab === 'table' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700'}`}
              >
                Table
              </button>
            </div>
            
            {activeTab === 'chart' && (
              <div className="flex space-x-1 border border-gray-200 rounded overflow-hidden">
                <button
                  onClick={() => setChartType('bar')}
                  className={`p-1 ${chartType === 'bar' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700'}`}
                  title="Bar Chart"
                >
                  <FiBarChart2 className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setChartType('line')}
                  className={`p-1 ${chartType === 'line' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700'}`}
                  title="Line Chart"
                >
                  <FiTrendingUp className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex-1 overflow-hidden">
          {activeTab === 'chart' && (
            <div className="h-full">
              {renderChart()}
            </div>
          )}
          
          {activeTab === 'changes' && (
            <div className="h-full overflow-y-auto">
              {renderChanges()}
            </div>
          )}
          
          {activeTab === 'table' && (
            <div className="h-full overflow-y-auto">
              {renderTable()}
            </div>
          )}
        </div>
      </div>
    </AccessibilityWrapper>
  );
};

export default ComparativeChart;
