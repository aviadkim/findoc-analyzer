import React, { useState } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend);

const CurrencyDistributionChart = ({ data }) => {
  const [showLegend, setShowLegend] = useState(true);

  if (!data || data.length === 0) {
    return <div className="h-64 flex items-center justify-center text-gray-500">No currency data available</div>;
  }

  // Sort data by value (descending)
  const sortedData = [...data].sort((a, b) => b.value - a.value);

  // Generate colors based on currency
  const generateColors = (currencies) => {
    // Define common colors for major currencies
    const currencyColors = {
      'USD': 'rgba(54, 162, 235, 0.8)',
      'EUR': 'rgba(75, 192, 192, 0.8)',
      'GBP': 'rgba(153, 102, 255, 0.8)',
      'JPY': 'rgba(255, 206, 86, 0.8)',
      'CHF': 'rgba(255, 99, 132, 0.8)',
      'CAD': 'rgba(255, 159, 64, 0.8)',
      'AUD': 'rgba(201, 203, 207, 0.8)',
      'NZD': 'rgba(54, 162, 190, 0.8)',
      'HKD': 'rgba(255, 99, 71, 0.8)',
      'SGD': 'rgba(46, 139, 87, 0.8)',
      'ILS': 'rgba(30, 144, 255, 0.8)',
      'CNY': 'rgba(220, 20, 60, 0.8)',
      'INR': 'rgba(255, 165, 0, 0.8)',
      'BRL': 'rgba(0, 128, 0, 0.8)',
      'RUB': 'rgba(139, 0, 0, 0.8)',
      'KRW': 'rgba(0, 0, 128, 0.8)',
      'TWD': 'rgba(128, 0, 128, 0.8)',
      'MXN': 'rgba(85, 107, 47, 0.8)',
      'SEK': 'rgba(0, 139, 139, 0.8)',
      'NOK': 'rgba(184, 134, 11, 0.8)',
      'DKK': 'rgba(153, 50, 204, 0.8)',
    };

    return currencies.map(item => {
      const currency = item.currency || 'Other';
      return currencyColors[currency] || `hsl(${Math.floor(Math.random() * 360)}, 70%, 60%, 0.8)`;
    });
  };

  const backgroundColor = generateColors(sortedData);
  const borderColor = backgroundColor.map(color => color.replace('0.8', '1'));

  // Prepare chart data
  const chartData = {
    labels: sortedData.map(item => item.currency),
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
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: showLegend,
        position: 'right',
        labels: {
          boxWidth: 15,
          padding: 15,
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.raw;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
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
  };

  // Get a mapping of currency codes to currency names
  const getCurrencyName = (code) => {
    const currencyNames = {
      'USD': 'US Dollar',
      'EUR': 'Euro',
      'GBP': 'British Pound',
      'JPY': 'Japanese Yen',
      'CHF': 'Swiss Franc',
      'CAD': 'Canadian Dollar',
      'AUD': 'Australian Dollar',
      'NZD': 'New Zealand Dollar',
      'HKD': 'Hong Kong Dollar',
      'SGD': 'Singapore Dollar',
      'ILS': 'Israeli Shekel',
      'CNY': 'Chinese Yuan',
      'INR': 'Indian Rupee',
      'BRL': 'Brazilian Real',
      'RUB': 'Russian Ruble',
      'KRW': 'South Korean Won',
      'TWD': 'Taiwan Dollar',
      'MXN': 'Mexican Peso',
      'SEK': 'Swedish Krona',
      'NOK': 'Norwegian Krone',
      'DKK': 'Danish Krone',
    };
    
    return currencyNames[code] || code;
  };

  // Calculate total and create breakdown table
  const total = sortedData.reduce((acc, item) => acc + item.value, 0);
  
  return (
    <div className="space-y-4">
      <div className="h-80 relative">
        <Pie data={chartData} options={options} />
        {!showLegend && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-xl font-bold">
                {total.toLocaleString('en-US', {
                  style: 'currency',
                  currency: 'USD',
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0
                })}
              </div>
              <div className="text-xs text-gray-500">Total Value</div>
            </div>
          </div>
        )}
      </div>
      
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setShowLegend(!showLegend)}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          {showLegend ? 'Hide Legend' : 'Show Legend'}
        </button>
      </div>
      
      <div className="overflow-auto max-h-64">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Currency
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
                    <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: backgroundColor[index] }}></div>
                    <div>
                      <div>{item.currency}</div>
                      <div className="text-xs text-gray-500">{getCurrencyName(item.currency)}</div>
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

export default CurrencyDistributionChart;