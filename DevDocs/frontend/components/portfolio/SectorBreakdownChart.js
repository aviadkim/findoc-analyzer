import React, { useState } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const SectorBreakdownChart = ({ data }) => {
  const [chartType, setChartType] = useState('vertical');
  const [showAll, setShowAll] = useState(false);

  if (!data || data.length === 0) {
    return <div className="h-64 flex items-center justify-center text-gray-500">No sector data available</div>;
  }

  // Sort data by value (descending)
  const sortedData = [...data].sort((a, b) => b.value - a.value);
  
  // Limit the number of sectors displayed if showAll is false
  const displayData = showAll ? sortedData : sortedData.slice(0, 10);

  // Generate sector colors
  const generateColors = (sectors) => {
    // Define common colors for typical sectors
    const sectorColors = {
      'Technology': 'rgba(54, 162, 235, 0.8)',
      'IT': 'rgba(54, 162, 235, 0.8)',
      'Information Technology': 'rgba(54, 162, 235, 0.8)',
      'Healthcare': 'rgba(255, 99, 132, 0.8)',
      'Health Care': 'rgba(255, 99, 132, 0.8)',
      'Financials': 'rgba(255, 206, 86, 0.8)',
      'Financial': 'rgba(255, 206, 86, 0.8)',
      'Consumer Discretionary': 'rgba(75, 192, 192, 0.8)',
      'Consumer Staples': 'rgba(153, 102, 255, 0.8)',
      'Industrials': 'rgba(255, 159, 64, 0.8)',
      'Industrial': 'rgba(255, 159, 64, 0.8)',
      'Energy': 'rgba(201, 203, 207, 0.8)',
      'Materials': 'rgba(54, 162, 190, 0.8)',
      'Utilities': 'rgba(255, 99, 71, 0.8)',
      'Utility': 'rgba(255, 99, 71, 0.8)',
      'Real Estate': 'rgba(46, 139, 87, 0.8)',
      'Communication Services': 'rgba(30, 144, 255, 0.8)',
      'Communications': 'rgba(30, 144, 255, 0.8)',
      'Telecom': 'rgba(30, 144, 255, 0.8)',
      'Telecommunications': 'rgba(30, 144, 255, 0.8)',
      'Other': 'rgba(220, 220, 220, 0.8)',
      'Unknown': 'rgba(220, 220, 220, 0.8)',
    };

    return sectors.map(item => {
      const sector = item.name || 'Other';
      return sectorColors[sector] || `hsl(${Math.floor(Math.random() * 360)}, 70%, 60%, 0.8)`;
    });
  };

  const backgroundColor = generateColors(displayData);
  const borderColor = backgroundColor.map(color => color.replace('0.8', '1'));

  // Prepare chart data
  const chartData = {
    labels: displayData.map(item => item.name),
    datasets: [
      {
        data: displayData.map(item => item.value),
        backgroundColor,
        borderColor,
        borderWidth: 1,
      },
    ],
  };

  // Chart options
  const options = {
    indexAxis: chartType === 'horizontal' ? 'y' : 'x',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.raw;
            const total = sortedData.reduce((a, b) => a + b.value, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${value.toLocaleString('en-US', {
              style: 'currency',
              currency: 'USD',
              minimumFractionDigits: 0,
              maximumFractionDigits: 0
            })} (${percentage}%)`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: chartType === 'vertical',
          text: chartType === 'vertical' ? 'Value (USD)' : ''
        },
        ticks: {
          callback: function(value) {
            if (chartType === 'horizontal') {
              return value;
            }
            
            if (value >= 1000000) {
              return '$' + (value / 1000000).toFixed(1) + 'M';
            } else if (value >= 1000) {
              return '$' + (value / 1000).toFixed(1) + 'k';
            }
            return '$' + value;
          }
        }
      },
      x: {
        title: {
          display: chartType === 'horizontal',
          text: chartType === 'horizontal' ? 'Value (USD)' : ''
        },
        ticks: {
          callback: function(value) {
            if (chartType === 'vertical') {
              return value;
            }
            
            if (value >= 1000000) {
              return '$' + (value / 1000000).toFixed(1) + 'M';
            } else if (value >= 1000) {
              return '$' + (value / 1000).toFixed(1) + 'k';
            }
            return '$' + value;
          }
        }
      }
    },
  };

  // Calculate total
  const total = sortedData.reduce((acc, item) => acc + item.value, 0);
  const displayedValue = displayData.reduce((acc, item) => acc + item.value, 0);
  const displayPercentage = ((displayedValue / total) * 100).toFixed(1);
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <button
            type="button"
            onClick={() => setChartType('vertical')}
            className={`px-3 py-1 text-sm rounded-md mr-2 ${
              chartType === 'vertical'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Vertical
          </button>
          <button
            type="button"
            onClick={() => setChartType('horizontal')}
            className={`px-3 py-1 text-sm rounded-md ${
              chartType === 'horizontal'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Horizontal
          </button>
        </div>
        
        {sortedData.length > 10 && (
          <button
            type="button"
            onClick={() => setShowAll(!showAll)}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            {showAll ? 'Show Top 10' : 'Show All Sectors'}
          </button>
        )}
      </div>
      
      <div className="h-96 relative">
        <Bar data={chartData} options={options} />
      </div>
      
      <div className="text-sm text-gray-500">
        {!showAll && sortedData.length > 10
          ? `Showing top 10 sectors (${displayPercentage}% of portfolio)`
          : 'Showing all sectors'}
      </div>
      
      <div className="overflow-auto max-h-64">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Sector
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Value
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Percentage
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedData.map((item, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-6 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                  <div className="flex items-center">
                    <div 
                      className="w-3 h-3 rounded-full mr-2" 
                      style={{ 
                        backgroundColor: index < backgroundColor.length 
                          ? backgroundColor[index] 
                          : `hsl(${Math.floor(Math.random() * 360)}, 70%, 60%, 0.8)`
                      }}
                    ></div>
                    {item.name}
                  </div>
                </td>
                <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-500 text-right">
                  {item.value.toLocaleString('en-US', {
                    style: 'currency',
                    currency: 'USD',
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                  })}
                </td>
                <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-500 text-right">
                  {((item.value / total) * 100).toFixed(1)}%
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-gray-50">
            <tr>
              <th scope="row" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total
              </th>
              <td className="px-6 py-3 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                {total.toLocaleString('en-US', {
                  style: 'currency',
                  currency: 'USD',
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0
                })}
              </td>
              <td className="px-6 py-3 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                100%
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

export default SectorBreakdownChart;