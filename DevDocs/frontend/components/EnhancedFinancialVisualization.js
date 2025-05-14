import React, { useState, useEffect } from 'react';
import AccessibilityWrapper from './AccessibilityWrapper';
import { FiBarChart2, FiPieChart, FiTrendingUp, FiGrid, FiFileText } from 'react-icons/fi';
import { DrilldownChart, ComparativeChart, PerformanceChart } from './charts';

const EnhancedFinancialVisualization = ({ data, documents, performanceData, type = 'portfolio' }) => {
  const [visualizationType, setVisualizationType] = useState('portfolio');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // If type is explicitly provided, use it
    if (type !== 'portfolio') {
      setVisualizationType(type);
    }
    
    // Automatically detect if we should show comparison or performance view
    if (documents && documents.length >= 2) {
      setVisualizationType('comparison');
    } else if (performanceData && performanceData.portfolioTimeSeries) {
      setVisualizationType('performance');
    }
  }, [type, documents, performanceData]);

  const renderVisualization = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64 bg-gray-100 rounded-lg">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      );
    }

    switch (visualizationType) {
      case 'portfolio':
        return (
          <DrilldownChart 
            data={data} 
            height={400} 
            initialChartType="doughnut"
          />
        );
      case 'comparison':
        return (
          <ComparativeChart 
            documents={documents} 
            height={400} 
            title="Document Comparison"
          />
        );
      case 'performance':
        return (
          <PerformanceChart 
            data={performanceData} 
            height={400} 
            title="Portfolio Performance"
          />
        );
      default:
        return (
          <div className="flex justify-center items-center h-64 bg-gray-100 rounded-lg">
            <div className="text-gray-500">Select a visualization type</div>
          </div>
        );
    }
  };

  return (
    <AccessibilityWrapper>
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Financial Data Visualization</h3>
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={() => setVisualizationType('portfolio')}
              className={`p-2 rounded-md ${visualizationType === 'portfolio' ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:bg-gray-100'}`}
              title="Portfolio Breakdown"
              disabled={!data}
            >
              <FiPieChart className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => setVisualizationType('comparison')}
              className={`p-2 rounded-md ${visualizationType === 'comparison' ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:bg-gray-100'}`}
              title="Document Comparison"
              disabled={!documents || documents.length < 2}
            >
              <FiFileText className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => setVisualizationType('performance')}
              className={`p-2 rounded-md ${visualizationType === 'performance' ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:bg-gray-100'}`}
              title="Performance Tracking"
              disabled={!performanceData}
            >
              <FiTrendingUp className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="h-[480px]">
          {renderVisualization()}
        </div>

        {data && data.summary && visualizationType === 'portfolio' && (
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {Object.entries(data.summary).map(([key, value]) => {
              if (key === 'totalValue') {
                return (
                  <div key={key} className="bg-blue-50 p-3 rounded-lg">
                    <h4 className="text-xs font-medium text-blue-500 uppercase">Total Value</h4>
                    <p className="mt-1 text-lg font-semibold text-blue-700">{value}</p>
                  </div>
                );
              }

              if (typeof value === 'object') {
                return null; // Skip nested objects, they're visualized in the chart
              }

              return (
                <div key={key} className="bg-gray-50 p-3 rounded-lg">
                  <h4 className="text-xs font-medium text-gray-500 uppercase">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </h4>
                  <p className="mt-1 text-lg font-semibold text-gray-700">{value}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AccessibilityWrapper>
  );
};

export default EnhancedFinancialVisualization;
