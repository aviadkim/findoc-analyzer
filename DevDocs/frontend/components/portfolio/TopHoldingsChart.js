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

const TopHoldingsChart = ({ data }) => {
  const [displayCount, setDisplayCount] = useState(5);

  if (!data || data.length === 0) {
    return <div className="h-64 flex items-center justify-center text-gray-500">No holdings data available</div>;
  }

  // Sort data by value (descending) and limit to display count
  const sortedData = [...data]
    .sort((a, b) => b.value - a.value)
    .slice(0, displayCount);

  // Generate colors for bars
  const generateColors = (count) => {
    const baseColor = 'rgba(54, 162, 235, 0.8)';
    const colors = [];
    
    for (let i = 0; i < count; i++) {
      // Vary the opacity slightly to differentiate bars
      const opacity = 0.9 - (i * 0.1);
      colors.push(baseColor.replace('0.8', opacity.toFixed(1)));
    }
    
    return colors;
  };

  const backgroundColor = generateColors(sortedData.length);
  const borderColor = backgroundColor.map(color => color.replace(/[0-9].[0-9]/, '1'));

  // Format labels to show name (truncated if needed)
  const formatLabel = (name) => {
    if (!name) return 'Unknown';
    // Truncate long names
    return name.length > 20 ? name.substring(0, 17) + '...' : name;
  };

  // Prepare chart data
  const chartData = {
    labels: sortedData.map(item => formatLabel(item.name)),
    datasets: [
      {
        data: sortedData.map(item => item.value),
        backgroundColor,
        borderColor,
        borderWidth: 1,
      },
    ],
  };

  // Chart options
  const options = {
    indexAxis: 'y', // Horizontal bar chart
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const value = context.raw;
            const item = sortedData[context.dataIndex];
            const total = data.reduce((acc, h) => acc + h.value, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            
            return [
              `Value: ${value.toLocaleString('en-US', {
                style: 'currency',
                currency: 'USD',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
              })}`,
              `Weight: ${percentage}%`,
              item.isin ? `ISIN: ${item.isin}` : '',
              item.sector ? `Sector: ${item.sector}` : '',
              item.assetClass ? `Type: ${item.assetClass}` : ''
            ].filter(Boolean);
          },
          title: function(context) {
            const item = sortedData[context[0].dataIndex];
            return item.name || 'Unknown';
          }
        }
      }
    },
    scales: {
      y: {
        ticks: {
          callback: function(value) {
            const label = this.getLabelForValue(value);
            return formatLabel(label);
          }
        }
      },
      x: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Value (USD)'
        },
        ticks: {
          callback: function(value) {
            if (value >= 1000000) {
              return '$' + (value / 1000000).toFixed(1) + 'M';
            } else if (value >= 1000) {
              return '$' + (value / 1000).toFixed(1) + 'k';
            }
            return '$' + value;
          }
        }
      }
    }
  };

  // Calculate total value
  const totalValue = data.reduce((acc, item) => acc + item.value, 0);
  const displayedValue = sortedData.reduce((acc, item) => acc + item.value, 0);
  const percentageOfTotal = ((displayedValue / totalValue) * 100).toFixed(1);

  return (
    <div className="space-y-4">
      <div className="h-64 relative">
        <Bar data={chartData} options={options} />
      </div>
      
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-500">
          {`Showing top ${displayCount} holdings (${percentageOfTotal}% of portfolio)`}
        </div>
        <select
          value={displayCount}
          onChange={(e) => setDisplayCount(Number(e.target.value))}
          className="block py-1 px-2 text-sm border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md"
        >
          <option value={5}>Top 5</option>
          <option value={10}>Top 10</option>
          <option value={15}>Top 15</option>
          <option value={20}>Top 20</option>
        </select>
      </div>
      
      <div className="overflow-auto max-h-64">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Security
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Value
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                % of Total
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedData.map((item, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-6 py-2 text-sm font-medium text-gray-900">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: backgroundColor[index] }}></div>
                    <div>
                      <div className="font-medium">{item.name}</div>
                      {item.isin && (
                        <div className="text-xs text-gray-500">{item.isin}</div>
                      )}
                    </div>
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
                  {((item.value / totalValue) * 100).toFixed(1)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TopHoldingsChart;