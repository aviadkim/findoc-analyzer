/**
 * Advanced Data Visualization Components Test
 * 
 * This test file demonstrates how to use the advanced visualization components
 * and provides examples of the data structures required for each component.
 */

import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { ChakraProvider, Box, Tabs, TabList, Tab, TabPanels, TabPanel, Heading, VStack } from '@chakra-ui/react';

// Import the advanced visualization components
import InteractivePortfolioVisualization from './components/InteractivePortfolioVisualization';
import AdvancedFinancialComparison from './components/AdvancedFinancialComparison';
import TimeSeriesAnalyzer from './components/TimeSeriesAnalyzer';

// Mock data for testing
const generateMockPortfolioData = () => {
  return {
    holdings: [
      { 
        name: 'Stocks', 
        value: 750000, 
        assetClass: 'Equity',
        subHoldings: [
          { name: 'Technology', value: 300000 },
          { name: 'Financial', value: 200000 },
          { name: 'Healthcare', value: 150000 },
          { name: 'Consumer Goods', value: 100000 }
        ]
      },
      { 
        name: 'Bonds', 
        value: 450000, 
        assetClass: 'Fixed Income',
        subHoldings: [
          { name: 'Government', value: 200000 },
          { name: 'Corporate', value: 150000 },
          { name: 'Municipal', value: 100000 }
        ]
      },
      { name: 'Cash', value: 150000, assetClass: 'Cash' },
      { name: 'Real Estate', value: 200000, assetClass: 'Alternative' },
      { name: 'Commodities', value: 100000, assetClass: 'Alternative' }
    ],
    summary: {
      asOfDate: '2025-05-14',
      totalValue: 1650000,
      currency: 'USD',
      performanceYTD: 7.8,
      performance1Y: 12.4,
      performance3Y: 32.5,
      performance5Y: 54.2,
      riskScore: 72,
      expenseRatio: 0.45
    },
    assetAllocation: {
      Equity: 0.45,
      'Fixed Income': 0.27,
      Cash: 0.09,
      Alternative: 0.18
    },
    geographicDistribution: {
      'North America': 0.65,
      Europe: 0.20,
      'Asia Pacific': 0.10,
      'Emerging Markets': 0.05
    },
    sectorExposure: {
      Technology: 0.20,
      Financial: 0.15,
      Healthcare: 0.12,
      'Consumer Goods': 0.10,
      Energy: 0.08,
      Utilities: 0.05,
      Materials: 0.05,
      Industrial: 0.15,
      'Real Estate': 0.10
    }
  };
};

// Mock comparison datasets
const generateMockComparisonData = () => {
  return [
    {
      id: 1,
      name: 'Portfolio 2024',
      color: 'rgba(75, 192, 192, 0.8)',
      timeSeries: generateTimeSeriesData(100, 1000, 0.01, 0.0005),
      metadata: {
        source: 'Portfolio Statement Q1 2024',
        currency: 'USD',
        advisor: 'John Smith, CFA',
        riskRating: 'Moderate',
        asOfDate: '2024-03-31'
      }
    },
    {
      id: 2,
      name: 'Portfolio 2023',
      color: 'rgba(255, 99, 132, 0.8)',
      timeSeries: generateTimeSeriesData(100, 900, 0.015, 0.0003),
      metadata: {
        source: 'Portfolio Statement Q1 2023',
        currency: 'USD',
        advisor: 'John Smith, CFA',
        riskRating: 'Moderate',
        asOfDate: '2023-03-31'
      }
    },
    {
      id: 3,
      name: 'Benchmark',
      color: 'rgba(54, 162, 235, 0.8)',
      timeSeries: generateTimeSeriesData(100, 950, 0.008, 0.0006),
      metadata: {
        source: 'S&P 500 Total Return',
        currency: 'USD',
        category: 'Index',
        provider: 'Standard & Poor\'s',
        asOfDate: '2024-03-31'
      }
    }
  ];
};

// Generate mock time series data
function generateTimeSeriesData(numPoints, initialValue, volatility, trend) {
  const result = [];
  let value = initialValue;
  const startDate = new Date('2023-01-01');
  
  for (let i = 0; i < numPoints; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    
    // Random walk with drift
    const randomChange = (Math.random() - 0.5) * 2 * volatility * value;
    const trendChange = trend * value;
    value = value + randomChange + trendChange;
    
    result.push({
      period: date.toISOString().split('T')[0],
      value: Math.round(value * 100) / 100
    });
  }
  
  return result;
}

// Mock time series data
const generateMockTimeSeriesData = () => {
  return [
    {
      id: 1,
      name: 'S&P 500',
      color: 'rgba(75, 192, 192, 0.8)',
      description: 'S&P 500 Index',
      source: 'Standard & Poor\'s',
      timeSeries: generateTimeSeriesData(365, 4200, 0.01, 0.0002)
    },
    {
      id: 2,
      name: 'NASDAQ',
      color: 'rgba(255, 99, 132, 0.8)',
      description: 'NASDAQ Composite Index',
      source: 'NASDAQ',
      timeSeries: generateTimeSeriesData(365, 12800, 0.015, 0.0003)
    },
    {
      id: 3,
      name: 'Portfolio',
      color: 'rgba(54, 162, 235, 0.8)',
      description: 'Client Portfolio Performance',
      source: 'Internal',
      timeSeries: generateTimeSeriesData(365, 1000000, 0.008, 0.00025)
    }
  ];
};

// Handler for export functionality
const handleExport = (exportData) => {
  console.log('Export requested:', exportData);
  // In a real application, this would trigger a download
  alert(`Exporting ${exportData.format} file...`);
};

// Main test component
const AdvancedVisualizationTest = () => {
  const [portfolioData, setPortfolioData] = useState(null);
  const [comparisonData, setComparisonData] = useState(null);
  const [timeSeriesData, setTimeSeriesData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Simulate loading data from an API
  useEffect(() => {
    setLoading(true);
    
    // Simulate API delay
    setTimeout(() => {
      setPortfolioData(generateMockPortfolioData());
      setComparisonData(generateMockComparisonData());
      setTimeSeriesData(generateMockTimeSeriesData());
      setLoading(false);
    }, 1000);
  }, []);
  
  if (loading) {
    return (
      <Box p={6} textAlign="center">
        <div className="spinner"></div>
        <p>Loading visualization data...</p>
      </Box>
    );
  }
  
  return (
    <Box p={4}>
      <Heading mb={6}>Advanced Data Visualization Components Test</Heading>
      
      <Tabs isLazy colorScheme="blue" variant="enclosed">
        <TabList>
          <Tab>Portfolio Visualization</Tab>
          <Tab>Financial Comparison</Tab>
          <Tab>Time Series Analysis</Tab>
        </TabList>
        
        <TabPanels>
          <TabPanel>
            <VStack spacing={4} align="stretch">
              <Heading size="md">Interactive Portfolio Visualization</Heading>
              <InteractivePortfolioVisualization 
                portfolioData={portfolioData}
                defaultView="allocation"
                timeframes={['1M', '3M', '6M', '1Y', '3Y', '5Y', 'MAX']}
                enableDrilldown={true}
                enableComparison={true}
                onDataExport={handleExport}
                height="600px"
                width="100%"
              />
            </VStack>
          </TabPanel>
          
          <TabPanel>
            <VStack spacing={4} align="stretch">
              <Heading size="md">Advanced Financial Comparison</Heading>
              <AdvancedFinancialComparison 
                datasets={comparisonData}
                config={{
                  defaultChartType: 'line',
                  enableAnimations: true,
                  enableDrilldown: true,
                  significanceThreshold: 5,
                  defaultComparisonMode: 'overlay',
                  defaultTimeRange: 'all',
                  defaultNormalization: 'absolute'
                }}
                onExport={handleExport}
                height="800px"
                width="100%"
              />
            </VStack>
          </TabPanel>
          
          <TabPanel>
            <VStack spacing={4} align="stretch">
              <Heading size="md">Time Series Analyzer</Heading>
              <TimeSeriesAnalyzer 
                timeSeries={timeSeriesData}
                config={{
                  defaultChartType: 'line',
                  enableTechnicalIndicators: true,
                  enableForecasting: true,
                  enableSeasonalDecomposition: true,
                  enableAnomalyDetection: true,
                  defaultDateRange: 'all',
                  defaultInterval: 'daily',
                  showConfidenceIntervals: true,
                  forecastHorizon: 30,
                  allowDataTransformations: true,
                  enableAnnotations: true,
                  showStatisticalSummary: true
                }}
                onExport={handleExport}
                height="700px"
                width="100%"
              />
            </VStack>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};

// Render the test component
const renderApp = () => {
  const root = document.getElementById('root');
  
  ReactDOM.render(
    <ChakraProvider>
      <AdvancedVisualizationTest />
    </ChakraProvider>,
    root
  );
};

// Run the test
document.addEventListener('DOMContentLoaded', renderApp);

export default AdvancedVisualizationTest;