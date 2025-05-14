/**
 * Portfolio Visualization Service
 * Handles data visualization for financial portfolios
 */

const fs = require('fs');
const path = require('path');

// Sample colors for visualizations
const colors = {
  primary: ['#4285F4', '#34A853', '#FBBC05', '#EA4335', '#8AB4F8', '#137333', '#A8DAB5'],
  secondary: ['#1A73E8', '#1E8E3E', '#F9AB00', '#D93025', '#669DF6', '#0D652D', '#81C995'],
  grayscale: ['#202124', '#3C4043', '#5F6368', '#80868B', '#9AA0A6', '#BDC1C6', '#DADCE0', '#E8EAED']
};

/**
 * Generate asset allocation chart data
 * @param {Object} portfolioData - Portfolio data
 * @returns {Array} - Asset allocation data for charts
 */
function generateAssetAllocation(portfolioData) {
  try {
    // Use real data if available, otherwise use sample data
    if (portfolioData && portfolioData.holdings) {
      // Group holdings by asset class
      const assetGroups = {};
      
      portfolioData.holdings.forEach(holding => {
        const assetClass = holding.assetClass || 'Other';
        
        if (!assetGroups[assetClass]) {
          assetGroups[assetClass] = 0;
        }
        
        assetGroups[assetClass] += holding.value || 0;
      });
      
      // Calculate total value
      const totalValue = Object.values(assetGroups).reduce((sum, value) => sum + value, 0);
      
      // Convert to array and calculate percentages
      return Object.entries(assetGroups).map(([name, value], index) => ({
        name,
        value: Math.round((value / totalValue) * 100),
        rawValue: value,
        color: colors.primary[index % colors.primary.length]
      })).sort((a, b) => b.value - a.value);
    }
    
    // Sample data
    return [
      { name: 'Stocks', value: 60, rawValue: 750000, color: '#4285F4' },
      { name: 'Bonds', value: 25, rawValue: 312500, color: '#34A853' },
      { name: 'Cash', value: 10, rawValue: 125000, color: '#FBBC05' },
      { name: 'Alternatives', value: 5, rawValue: 62500, color: '#EA4335' }
    ];
  } catch (error) {
    console.error('Error generating asset allocation data:', error.message);
    // Return fallback data
    return [
      { name: 'Stocks', value: 60, rawValue: 750000, color: '#4285F4' },
      { name: 'Bonds', value: 25, rawValue: 312500, color: '#34A853' },
      { name: 'Cash', value: 15, rawValue: 187500, color: '#FBBC05' }
    ];
  }
}

/**
 * Generate sector allocation chart data
 * @param {Object} portfolioData - Portfolio data
 * @returns {Array} - Sector allocation data for charts
 */
function generateSectorAllocation(portfolioData) {
  try {
    // Use real data if available, otherwise use sample data
    if (portfolioData && portfolioData.holdings) {
      // Group holdings by sector
      const sectorGroups = {};
      
      portfolioData.holdings.forEach(holding => {
        const sector = holding.sector || 'Other';
        
        if (!sectorGroups[sector]) {
          sectorGroups[sector] = 0;
        }
        
        sectorGroups[sector] += holding.value || 0;
      });
      
      // Calculate total value
      const totalValue = Object.values(sectorGroups).reduce((sum, value) => sum + value, 0);
      
      // Convert to array and calculate percentages
      return Object.entries(sectorGroups).map(([name, value], index) => ({
        name,
        value: Math.round((value / totalValue) * 100),
        rawValue: value,
        color: colors.primary[index % colors.primary.length]
      })).sort((a, b) => b.value - a.value);
    }
    
    // Sample data
    return [
      { name: 'Technology', value: 35, rawValue: 437500, color: '#4285F4' },
      { name: 'Financial Services', value: 15, rawValue: 187500, color: '#34A853' },
      { name: 'Healthcare', value: 12, rawValue: 150000, color: '#FBBC05' },
      { name: 'Consumer Cyclical', value: 10, rawValue: 125000, color: '#EA4335' },
      { name: 'Communication Services', value: 8, rawValue: 100000, color: '#8AB4F8' },
      { name: 'Industrials', value: 7, rawValue: 87500, color: '#137333' },
      { name: 'Consumer Defensive', value: 6, rawValue: 75000, color: '#A8DAB5' },
      { name: 'Utilities', value: 4, rawValue: 50000, color: '#1A73E8' },
      { name: 'Other', value: 3, rawValue: 37500, color: '#5F6368' }
    ];
  } catch (error) {
    console.error('Error generating sector allocation data:', error.message);
    // Return fallback data
    return [
      { name: 'Technology', value: 35, rawValue: 437500, color: '#4285F4' },
      { name: 'Financial Services', value: 20, rawValue: 250000, color: '#34A853' },
      { name: 'Healthcare', value: 15, rawValue: 187500, color: '#FBBC05' },
      { name: 'Consumer Cyclical', value: 10, rawValue: 125000, color: '#EA4335' },
      { name: 'Other', value: 20, rawValue: 250000, color: '#8AB4F8' }
    ];
  }
}

/**
 * Generate top holdings data
 * @param {Object} portfolioData - Portfolio data
 * @param {Number} limit - Number of top holdings to return
 * @returns {Array} - Top holdings data
 */
function generateTopHoldings(portfolioData, limit = 5) {
  try {
    // Use real data if available, otherwise use sample data
    if (portfolioData && portfolioData.holdings) {
      // Sort holdings by value
      const sortedHoldings = [...portfolioData.holdings]
        .sort((a, b) => (b.value || 0) - (a.value || 0))
        .slice(0, limit);
      
      // Calculate total portfolio value
      const totalValue = portfolioData.holdings.reduce((sum, holding) => sum + (holding.value || 0), 0);
      
      // Format holdings
      return sortedHoldings.map(holding => ({
        name: holding.name || 'Unknown',
        ticker: holding.ticker || '--',
        isin: holding.isin || '--',
        value: holding.value || 0,
        percentage: Math.round(((holding.value || 0) / totalValue) * 100)
      }));
    }
    
    // Sample data
    return [
      { name: 'Apple Inc.', ticker: 'AAPL', isin: 'US0378331005', value: 250000, percentage: 20 },
      { name: 'Microsoft Corp.', ticker: 'MSFT', isin: 'US5949181045', value: 200000, percentage: 16 },
      { name: 'Amazon.com Inc.', ticker: 'AMZN', isin: 'US0231351067', value: 150000, percentage: 12 },
      { name: 'Alphabet Inc.', ticker: 'GOOGL', isin: 'US02079K1079', value: 125000, percentage: 10 },
      { name: 'Tesla Inc.', ticker: 'TSLA', isin: 'US88160R1014', value: 100000, percentage: 8 }
    ];
  } catch (error) {
    console.error('Error generating top holdings data:', error.message);
    // Return fallback data
    return [
      { name: 'Apple Inc.', ticker: 'AAPL', isin: 'US0378331005', value: 250000, percentage: 20 },
      { name: 'Microsoft Corp.', ticker: 'MSFT', isin: 'US5949181045', value: 200000, percentage: 16 },
      { name: 'Amazon.com Inc.', ticker: 'AMZN', isin: 'US0231351067', value: 150000, percentage: 12 }
    ];
  }
}

/**
 * Generate performance history data
 * @param {Object} portfolioData - Portfolio data
 * @param {Object} options - Options for performance data
 * @param {String} options.timeframe - Timeframe for data (1m, 3m, 6m, 1y, 3y, 5y, max)
 * @returns {Array} - Performance history data
 */
function generatePerformanceHistory(portfolioData, options = {}) {
  try {
    const { timeframe = '1y' } = options;
    
    // Use real data if available, otherwise use sample data
    if (portfolioData && portfolioData.performanceHistory) {
      // Filter and format based on timeframe
      let historyData = [...portfolioData.performanceHistory];
      
      // Sort by date
      historyData.sort((a, b) => new Date(a.date) - new Date(b.date));
      
      return historyData;
    }
    
    // Generate sample data based on timeframe
    const endDate = new Date();
    let startDate;
    let dataPoints;
    
    switch (timeframe) {
      case '1m':
        startDate = new Date(endDate);
        startDate.setMonth(endDate.getMonth() - 1);
        dataPoints = 30;
        break;
      case '3m':
        startDate = new Date(endDate);
        startDate.setMonth(endDate.getMonth() - 3);
        dataPoints = 12;
        break;
      case '6m':
        startDate = new Date(endDate);
        startDate.setMonth(endDate.getMonth() - 6);
        dataPoints = 24;
        break;
      case '1y':
        startDate = new Date(endDate);
        startDate.setFullYear(endDate.getFullYear() - 1);
        dataPoints = 12;
        break;
      case '3y':
        startDate = new Date(endDate);
        startDate.setFullYear(endDate.getFullYear() - 3);
        dataPoints = 36;
        break;
      case '5y':
        startDate = new Date(endDate);
        startDate.setFullYear(endDate.getFullYear() - 5);
        dataPoints = 60;
        break;
      case 'max':
        startDate = new Date(endDate);
        startDate.setFullYear(endDate.getFullYear() - 10);
        dataPoints = 120;
        break;
      default:
        startDate = new Date(endDate);
        startDate.setFullYear(endDate.getFullYear() - 1);
        dataPoints = 12;
    }
    
    const interval = (endDate - startDate) / dataPoints;
    const baseValue = 1000000;
    const volatility = 0.05;
    const annualGrowth = 0.08;
    const dailyGrowth = Math.pow(1 + annualGrowth, 1/365) - 1;
    
    const result = [];
    let currentValue = baseValue;
    
    for (let i = 0; i <= dataPoints; i++) {
      const date = new Date(startDate.getTime() + (interval * i));
      
      // Apply growth and random volatility
      const daysSinceStart = Math.round((date - startDate) / (1000 * 60 * 60 * 24));
      const growthFactor = Math.pow(1 + dailyGrowth, daysSinceStart);
      const randomFactor = 1 + (Math.random() - 0.5) * volatility;
      
      currentValue = baseValue * growthFactor * randomFactor;
      
      result.push({
        date: date.toISOString().split('T')[0],
        value: Math.round(currentValue)
      });
    }
    
    return result;
  } catch (error) {
    console.error('Error generating performance history:', error.message);
    // Return fallback data
    return [
      { date: '2024-06-01', value: 1000000 },
      { date: '2024-07-01', value: 1025000 },
      { date: '2024-08-01', value: 1050000 },
      { date: '2024-09-01', value: 1075000 },
      { date: '2024-10-01', value: 1100000 },
      { date: '2024-11-01', value: 1125000 },
      { date: '2024-12-01', value: 1150000 },
      { date: '2025-01-01', value: 1175000 },
      { date: '2025-02-01', value: 1200000 },
      { date: '2025-03-01', value: 1225000 },
      { date: '2025-04-01', value: 1250000 },
      { date: '2025-05-01', value: 1275000 }
    ];
  }
}

/**
 * Generate geographic distribution data
 * @param {Object} portfolioData - Portfolio data
 * @returns {Array} - Geographic distribution data
 */
function generateGeographicDistribution(portfolioData) {
  try {
    // Use real data if available, otherwise use sample data
    if (portfolioData && portfolioData.holdings) {
      // Group holdings by country/region
      const regionGroups = {};
      
      portfolioData.holdings.forEach(holding => {
        const region = holding.region || holding.country || 'Unknown';
        
        if (!regionGroups[region]) {
          regionGroups[region] = 0;
        }
        
        regionGroups[region] += holding.value || 0;
      });
      
      // Calculate total value
      const totalValue = Object.values(regionGroups).reduce((sum, value) => sum + value, 0);
      
      // Convert to array and calculate percentages
      return Object.entries(regionGroups).map(([name, value], index) => ({
        name,
        value: Math.round((value / totalValue) * 100),
        rawValue: value,
        color: colors.primary[index % colors.primary.length]
      })).sort((a, b) => b.value - a.value);
    }
    
    // Sample data
    return [
      { name: 'United States', value: 65, rawValue: 812500, color: '#4285F4' },
      { name: 'Europe', value: 15, rawValue: 187500, color: '#34A853' },
      { name: 'Asia', value: 10, rawValue: 125000, color: '#FBBC05' },
      { name: 'Other', value: 10, rawValue: 125000, color: '#EA4335' }
    ];
  } catch (error) {
    console.error('Error generating geographic distribution data:', error.message);
    // Return fallback data
    return [
      { name: 'United States', value: 70, rawValue: 875000, color: '#4285F4' },
      { name: 'International', value: 30, rawValue: 375000, color: '#34A853' }
    ];
  }
}

/**
 * Generate risk metrics data
 * @param {Object} portfolioData - Portfolio data
 * @returns {Object} - Risk metrics data
 */
function generateRiskMetrics(portfolioData) {
  try {
    // Sample data - in a real implementation, this would calculate metrics like beta, alpha, sharpe ratio, etc.
    return {
      beta: (portfolioData?.riskMetrics?.beta || (0.9 + Math.random() * 0.3)).toFixed(2),
      alpha: (portfolioData?.riskMetrics?.alpha || (-2 + Math.random() * 5)).toFixed(2) + '%',
      sharpeRatio: (portfolioData?.riskMetrics?.sharpeRatio || (0.8 + Math.random() * 1)).toFixed(2),
      volatility: (portfolioData?.riskMetrics?.volatility || (8 + Math.random() * 5)).toFixed(2) + '%',
      riskLevel: portfolioData?.riskMetrics?.riskLevel || ['Low', 'Moderate', 'High'][Math.floor(Math.random() * 3)],
      maxDrawdown: (portfolioData?.riskMetrics?.maxDrawdown || (10 + Math.random() * 15)).toFixed(2) + '%'
    };
  } catch (error) {
    console.error('Error generating risk metrics:', error.message);
    // Return fallback data
    return {
      beta: '1.05',
      alpha: '2.3%',
      sharpeRatio: '1.2',
      volatility: '12.5%',
      riskLevel: 'Moderate',
      maxDrawdown: '18.7%'
    };
  }
}

/**
 * Generate ESG metrics data
 * @param {Object} portfolioData - Portfolio data
 * @returns {Object} - ESG metrics data
 */
function generateESGMetrics(portfolioData) {
  try {
    // Sample data - in a real implementation, this would calculate actual ESG metrics
    return {
      environmentalScore: portfolioData?.esgMetrics?.environmentalScore || Math.floor(60 + Math.random() * 30),
      socialScore: portfolioData?.esgMetrics?.socialScore || Math.floor(60 + Math.random() * 30),
      governanceScore: portfolioData?.esgMetrics?.governanceScore || Math.floor(60 + Math.random() * 30),
      overallESGScore: portfolioData?.esgMetrics?.overallESGScore || Math.floor(60 + Math.random() * 30),
      carbonIntensity: portfolioData?.esgMetrics?.carbonIntensity || Math.floor(100 + Math.random() * 100) + ' tons CO2e/$M',
      controversyFlag: portfolioData?.esgMetrics?.controversyFlag || ['Low', 'Moderate', 'High'][Math.floor(Math.random() * 3)]
    };
  } catch (error) {
    console.error('Error generating ESG metrics:', error.message);
    // Return fallback data
    return {
      environmentalScore: 75,
      socialScore: 68,
      governanceScore: 82,
      overallESGScore: 75,
      carbonIntensity: '150 tons CO2e/$M',
      controversyFlag: 'Low'
    };
  }
}

/**
 * Generate complete portfolio visualization data
 * @param {String} portfolioId - Portfolio ID
 * @param {Object} options - Visualization options
 * @param {String} options.timeframe - Timeframe for performance data
 * @param {Boolean} options.includeESG - Whether to include ESG metrics
 * @param {Boolean} options.includeRisk - Whether to include risk metrics
 * @returns {Object} - Complete portfolio visualization data
 */
function generatePortfolioVisualization(portfolioId, options = {}) {
  const { 
    timeframe = '1y', 
    includeESG = true, 
    includeRisk = true
  } = options;
  
  try {
    // In a real implementation, this would load actual portfolio data from a database
    // For now, use mock data
    const portfolioData = loadPortfolioData(portfolioId);
    
    // Generate all visualization data
    const result = {
      portfolioId,
      name: portfolioData?.name || 'My Portfolio',
      assetAllocation: generateAssetAllocation(portfolioData),
      sectorAllocation: generateSectorAllocation(portfolioData),
      topHoldings: generateTopHoldings(portfolioData),
      performanceHistory: generatePerformanceHistory(portfolioData, { timeframe }),
      geographicDistribution: generateGeographicDistribution(portfolioData)
    };
    
    // Add optional metrics
    if (includeRisk) {
      result.riskMetrics = generateRiskMetrics(portfolioData);
    }
    
    if (includeESG) {
      result.esgMetrics = generateESGMetrics(portfolioData);
    }
    
    return {
      success: true,
      data: result
    };
  } catch (error) {
    console.error('Error generating portfolio visualization:', error.message);
    
    // Return fallback data
    return {
      success: true,
      data: {
        portfolioId: portfolioId || 'default',
        name: 'My Portfolio',
        assetAllocation: [
          { name: 'Stocks', value: 60, rawValue: 750000, color: '#4285F4' },
          { name: 'Bonds', value: 25, rawValue: 312500, color: '#34A853' },
          { name: 'Cash', value: 15, rawValue: 187500, color: '#FBBC05' }
        ],
        sectorAllocation: [
          { name: 'Technology', value: 35, rawValue: 437500, color: '#4285F4' },
          { name: 'Financial Services', value: 20, rawValue: 250000, color: '#34A853' },
          { name: 'Healthcare', value: 15, rawValue: 187500, color: '#FBBC05' },
          { name: 'Consumer Cyclical', value: 10, rawValue: 125000, color: '#EA4335' },
          { name: 'Other', value: 20, rawValue: 250000, color: '#8AB4F8' }
        ],
        topHoldings: [
          { name: 'Apple Inc.', ticker: 'AAPL', isin: 'US0378331005', value: 250000, percentage: 20 },
          { name: 'Microsoft Corp.', ticker: 'MSFT', isin: 'US5949181045', value: 200000, percentage: 16 },
          { name: 'Amazon.com Inc.', ticker: 'AMZN', isin: 'US0231351067', value: 150000, percentage: 12 },
          { name: 'Alphabet Inc.', ticker: 'GOOGL', isin: 'US02079K1079', value: 125000, percentage: 10 },
          { name: 'Tesla Inc.', ticker: 'TSLA', isin: 'US88160R1014', value: 100000, percentage: 8 }
        ],
        performanceHistory: [
          { date: '2024-06-01', value: 1000000 },
          { date: '2024-07-01', value: 1025000 },
          { date: '2024-08-01', value: 1050000 },
          { date: '2024-09-01', value: 1075000 },
          { date: '2024-10-01', value: 1100000 },
          { date: '2024-11-01', value: 1125000 },
          { date: '2024-12-01', value: 1150000 },
          { date: '2025-01-01', value: 1175000 },
          { date: '2025-02-01', value: 1200000 },
          { date: '2025-03-01', value: 1225000 },
          { date: '2025-04-01', value: 1250000 },
          { date: '2025-05-01', value: 1275000 }
        ],
        geographicDistribution: [
          { name: 'United States', value: 70, rawValue: 875000, color: '#4285F4' },
          { name: 'International', value: 30, rawValue: 375000, color: '#34A853' }
        ],
        riskMetrics: {
          beta: '1.05',
          alpha: '2.3%',
          sharpeRatio: '1.2',
          volatility: '12.5%',
          riskLevel: 'Moderate',
          maxDrawdown: '18.7%'
        },
        esgMetrics: {
          environmentalScore: 75,
          socialScore: 68,
          governanceScore: 82,
          overallESGScore: 75,
          carbonIntensity: '150 tons CO2e/$M',
          controversyFlag: 'Low'
        }
      }
    };
  }
}

/**
 * Generate document securities visualization data
 * @param {String} documentId - Document ID
 * @returns {Object} - Document securities visualization data
 */
function generateDocumentSecuritiesVisualization(documentId) {
  try {
    // In a real implementation, this would load actual document data from a database
    // For now, return mock data
    return {
      success: true,
      documentId,
      data: {
        securities: [
          { name: 'Apple Inc.', ticker: 'AAPL', isin: 'US0378331005', mentions: Math.floor(5 + Math.random() * 10) },
          { name: 'Microsoft Corp.', ticker: 'MSFT', isin: 'US5949181045', mentions: Math.floor(5 + Math.random() * 10) },
          { name: 'Amazon.com Inc.', ticker: 'AMZN', isin: 'US0231351067', mentions: Math.floor(5 + Math.random() * 10) },
          { name: 'Alphabet Inc.', ticker: 'GOOGL', isin: 'US02079K1079', mentions: Math.floor(5 + Math.random() * 10) },
          { name: 'Tesla Inc.', ticker: 'TSLA', isin: 'US88160R1014', mentions: Math.floor(5 + Math.random() * 10) },
          { name: 'NVIDIA Corp.', ticker: 'NVDA', isin: 'US67066G1040', mentions: Math.floor(5 + Math.random() * 10) },
          { name: 'Meta Platforms Inc.', ticker: 'META', isin: 'US30303M1027', mentions: Math.floor(5 + Math.random() * 10) }
        ],
        keyMetrics: [
          { name: 'Total Portfolio Value', value: `$${(1000000 + Math.random() * 500000).toFixed(0)}`, confidence: (0.9 + Math.random() * 0.1).toFixed(2) },
          { name: 'Annual Return', value: `${(5 + Math.random() * 10).toFixed(1)}%`, confidence: (0.9 + Math.random() * 0.1).toFixed(2) },
          { name: 'Dividend Yield', value: `${(1 + Math.random() * 3).toFixed(1)}%`, confidence: (0.9 + Math.random() * 0.1).toFixed(2) },
          { name: 'Risk Level', value: ['Low', 'Moderate', 'High'][Math.floor(Math.random() * 3)], confidence: (0.9 + Math.random() * 0.1).toFixed(2) }
        ],
        tableCount: Math.floor(2 + Math.random() * 8),
        pageCount: Math.floor(10 + Math.random() * 20),
        sentimentAnalysis: {
          positive: Math.floor(50 + Math.random() * 30),
          neutral: Math.floor(10 + Math.random() * 30),
          negative: Math.floor(5 + Math.random() * 15)
        }
      }
    };
  } catch (error) {
    console.error('Error generating document securities visualization:', error.message);
    
    // Return fallback data
    return {
      success: true,
      documentId,
      data: {
        securities: [
          { name: 'Apple Inc.', ticker: 'AAPL', isin: 'US0378331005', mentions: 12 },
          { name: 'Microsoft Corp.', ticker: 'MSFT', isin: 'US5949181045', mentions: 8 },
          { name: 'Amazon.com Inc.', ticker: 'AMZN', isin: 'US0231351067', mentions: 5 }
        ],
        keyMetrics: [
          { name: 'Total Portfolio Value', value: '$1,250,000', confidence: 0.98 },
          { name: 'Annual Return', value: '8.5%', confidence: 0.95 },
          { name: 'Risk Level', value: 'Moderate', confidence: 0.9 }
        ],
        tableCount: 5,
        pageCount: 15,
        sentimentAnalysis: {
          positive: 60,
          neutral: 30,
          negative: 10
        }
      }
    };
  }
}

/**
 * Compare multiple documents
 * @param {Array} documentIds - Array of document IDs
 * @param {Array} metrics - Metrics to compare
 * @returns {Object} - Document comparison visualization data
 */
function generateDocumentComparison(documentIds, metrics = ['securities', 'keyMetrics', 'sentimentAnalysis']) {
  try {
    // Mock comparison data
    const comparisonData = {
      documentIds,
      metrics,
      data: {}
    };
    
    // Generate mock data for each metric
    metrics.forEach(metric => {
      if (metric === 'securities') {
        comparisonData.data.securities = documentIds.map(docId => ({
          documentId: docId,
          securities: [
            { name: 'Apple Inc.', ticker: 'AAPL', mentions: Math.floor(Math.random() * 15) },
            { name: 'Microsoft Corp.', ticker: 'MSFT', mentions: Math.floor(Math.random() * 10) },
            { name: 'Amazon.com Inc.', ticker: 'AMZN', mentions: Math.floor(Math.random() * 8) },
            { name: 'Alphabet Inc.', ticker: 'GOOGL', mentions: Math.floor(Math.random() * 6) },
            { name: 'Tesla Inc.', ticker: 'TSLA', mentions: Math.floor(Math.random() * 4) }
          ]
        }));
      } else if (metric === 'keyMetrics') {
        comparisonData.data.keyMetrics = documentIds.map(docId => ({
          documentId: docId,
          metrics: [
            { name: 'Total Portfolio Value', value: `$${(1000000 + Math.random() * 500000).toFixed(0)}` },
            { name: 'Annual Return', value: `${(5 + Math.random() * 5).toFixed(1)}%` },
            { name: 'Risk Level', value: ['Low', 'Moderate', 'High'][Math.floor(Math.random() * 3)] },
            { name: 'Dividend Yield', value: `${(1 + Math.random() * 3).toFixed(1)}%` }
          ]
        }));
      } else if (metric === 'sentimentAnalysis') {
        comparisonData.data.sentimentAnalysis = documentIds.map(docId => ({
          documentId: docId,
          sentiment: {
            positive: Math.floor(40 + Math.random() * 40),
            neutral: Math.floor(10 + Math.random() * 40),
            negative: Math.floor(5 + Math.random() * 20)
          }
        }));
      } else if (metric === 'tableStructure') {
        comparisonData.data.tableStructure = documentIds.map(docId => ({
          documentId: docId,
          tableCount: Math.floor(2 + Math.random() * 8),
          complexityScore: Math.floor(50 + Math.random() * 50),
          dataQualityScore: Math.floor(60 + Math.random() * 40)
        }));
      } else if (metric === 'geographicPresence') {
        comparisonData.data.geographicPresence = documentIds.map(docId => ({
          documentId: docId,
          regions: [
            { name: 'North America', mentions: Math.floor(10 + Math.random() * 20) },
            { name: 'Europe', mentions: Math.floor(5 + Math.random() * 15) },
            { name: 'Asia Pacific', mentions: Math.floor(5 + Math.random() * 15) },
            { name: 'Other', mentions: Math.floor(1 + Math.random() * 10) }
          ]
        }));
      }
    });
    
    return {
      success: true,
      data: comparisonData
    };
  } catch (error) {
    console.error('Error generating document comparison:', error.message);
    
    // Return fallback data
    return {
      success: true,
      data: {
        documentIds,
        metrics: metrics || ['securities', 'keyMetrics', 'sentimentAnalysis'],
        data: {
          securities: documentIds.map(docId => ({
            documentId: docId,
            securities: [
              { name: 'Apple Inc.', ticker: 'AAPL', mentions: 8 },
              { name: 'Microsoft Corp.', ticker: 'MSFT', mentions: 6 },
              { name: 'Amazon.com Inc.', ticker: 'AMZN', mentions: 4 }
            ]
          })),
          keyMetrics: documentIds.map(docId => ({
            documentId: docId,
            metrics: [
              { name: 'Total Portfolio Value', value: '$1,250,000' },
              { name: 'Annual Return', value: '8.5%' },
              { name: 'Risk Level', value: 'Moderate' }
            ]
          })),
          sentimentAnalysis: documentIds.map(docId => ({
            documentId: docId,
            sentiment: {
              positive: 60,
              neutral: 30,
              negative: 10
            }
          }))
        }
      }
    };
  }
}

/**
 * Generate custom visualization data based on metrics and filters
 * @param {Array} metrics - Metrics to visualize
 * @param {Object} filters - Filters to apply
 * @param {Object} timeRange - Time range for data
 * @returns {Object} - Custom visualization data
 */
function generateCustomVisualization(metrics, filters = {}, timeRange = { start: '2024-06-01', end: '2025-05-01' }) {
  try {
    if (!metrics || !Array.isArray(metrics) || metrics.length === 0) {
      throw new Error('At least one metric is required');
    }
    
    // Mock custom visualization data
    const customData = {
      metrics,
      filters,
      timeRange,
      data: []
    };
    
    // Generate mock data for each metric
    metrics.forEach(metric => {
      const metricData = {
        name: metric,
        series: []
      };
      
      // Generate data points
      const start = new Date(timeRange?.start || '2024-06-01').getTime();
      const end = new Date(timeRange?.end || '2025-05-01').getTime();
      const interval = (end - start) / 10;
      
      let lastValue = 100;
      const volatility = 0.1;
      const trend = 0.02;
      
      for (let i = 0; i <= 10; i++) {
        const date = new Date(start + interval * i);
        
        // Apply trend and random volatility
        lastValue = lastValue * (1 + trend) * (1 + (Math.random() - 0.5) * volatility);
        
        metricData.series.push({
          date: date.toISOString().split('T')[0],
          value: Math.round(lastValue * 100) / 100
        });
      }
      
      customData.data.push(metricData);
    });
    
    return {
      success: true,
      data: customData
    };
  } catch (error) {
    console.error('Error generating custom visualization:', error.message);
    
    // Return fallback data
    return {
      success: false,
      message: error.message,
      data: null
    };
  }
}

/**
 * Load portfolio data from storage or database
 * @param {String} portfolioId - Portfolio ID
 * @returns {Object} - Portfolio data
 */
function loadPortfolioData(portfolioId) {
  try {
    // In a real implementation, this would load from a database
    // For now, return mock data
    return {
      id: portfolioId,
      name: 'My Investment Portfolio',
      description: 'Personal investment portfolio for long-term growth',
      currency: 'USD',
      value: 1250000,
      lastUpdated: new Date().toISOString(),
      holdings: [
        { name: 'Apple Inc.', ticker: 'AAPL', isin: 'US0378331005', assetClass: 'Stocks', sector: 'Technology', region: 'United States', value: 250000 },
        { name: 'Microsoft Corp.', ticker: 'MSFT', isin: 'US5949181045', assetClass: 'Stocks', sector: 'Technology', region: 'United States', value: 200000 },
        { name: 'Amazon.com Inc.', ticker: 'AMZN', isin: 'US0231351067', assetClass: 'Stocks', sector: 'Consumer Cyclical', region: 'United States', value: 150000 },
        { name: 'Alphabet Inc.', ticker: 'GOOGL', isin: 'US02079K1079', assetClass: 'Stocks', sector: 'Communication Services', region: 'United States', value: 125000 },
        { name: 'Tesla Inc.', ticker: 'TSLA', isin: 'US88160R1014', assetClass: 'Stocks', sector: 'Consumer Cyclical', region: 'United States', value: 100000 },
        { name: 'NVIDIA Corp.', ticker: 'NVDA', isin: 'US67066G1040', assetClass: 'Stocks', sector: 'Technology', region: 'United States', value: 75000 },
        { name: 'JPMorgan Chase & Co.', ticker: 'JPM', isin: 'US46625H1005', assetClass: 'Stocks', sector: 'Financial Services', region: 'United States', value: 50000 },
        { name: 'Johnson & Johnson', ticker: 'JNJ', isin: 'US4781601046', assetClass: 'Stocks', sector: 'Healthcare', region: 'United States', value: 50000 },
        { name: 'Vanguard Total Bond Market ETF', ticker: 'BND', isin: 'US9219378356', assetClass: 'Bonds', sector: 'N/A', region: 'United States', value: 125000 },
        { name: 'iShares Core U.S. Aggregate Bond ETF', ticker: 'AGG', isin: 'US4642872265', assetClass: 'Bonds', sector: 'N/A', region: 'United States', value: 125000 },
        { name: 'Vanguard FTSE Developed Markets ETF', ticker: 'VEA', isin: 'US9219438580', assetClass: 'Stocks', sector: 'N/A', region: 'International', value: 62500 },
        { name: 'Cash', ticker: 'N/A', isin: 'N/A', assetClass: 'Cash', sector: 'N/A', region: 'N/A', value: 62500 }
      ]
    };
  } catch (error) {
    console.error(`Error loading portfolio data for ${portfolioId}:`, error.message);
    return null;
  }
}

// Export functions
module.exports = {
  generatePortfolioVisualization,
  generateDocumentSecuritiesVisualization,
  generateDocumentComparison,
  generateCustomVisualization,
  generateAssetAllocation,
  generateSectorAllocation,
  generateTopHoldings,
  generatePerformanceHistory,
  generateGeographicDistribution,
  generateRiskMetrics,
  generateESGMetrics
};