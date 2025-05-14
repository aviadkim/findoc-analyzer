import React, { useState, useEffect } from 'react';
import AccessibilityWrapper from '../AccessibilityWrapper';
import { FiPieChart, FiBarChart2, FiDollarSign, FiGrid, FiTrendingUp } from 'react-icons/fi';
import AssetAllocationChart from './AssetAllocationChart';
import TopHoldingsChart from './TopHoldingsChart';
import CurrencyDistributionChart from './CurrencyDistributionChart';
import SectorBreakdownChart from './SectorBreakdownChart';
import PerformanceChart from '../charts/PerformanceChart';
import portfolioController from '../../controllers/portfolioController';

const PortfolioVisualizationDashboard = ({ portfolio, securities }) => {
  const [activeTab, setActiveTab] = useState('allocation');
  const [loading, setLoading] = useState(true);
  const [portfolioData, setPortfolioData] = useState(null);
  
  useEffect(() => {
    if (!portfolio || !securities || securities.length === 0) return;
    
    const processData = async () => {
      setLoading(true);
      try {
        // Create a portfolio object from the extracted securities data
        const portfolioObj = {
          holdings: securities.map(security => ({
            name: security.name || security.description || security.isin,
            isin: security.isin,
            symbol: security.symbol,
            assetClass: security.assetClass || security.type || 'Other',
            sector: security.sector || security.industry || 'Other',
            region: security.region || security.country || 'Other',
            currency: security.currency || 'USD',
            value: parseFloat(security.marketValue || security.value || 0),
            quantity: parseFloat(security.quantity || security.shares || 0),
            price: parseFloat(security.price || 0)
          }))
        };
        
        // Analyze portfolio
        const summary = await portfolioController.analyzePortfolio(portfolioObj);
        
        // Create data object for visualization
        const data = {
          summary,
          holdings: portfolioObj.holdings,
          totalValue: summary.totalValue,
          assetAllocation: summary.assetAllocation.assetClass,
          sectorAllocation: summary.assetAllocation.sector,
          regionAllocation: summary.assetAllocation.region,
          currencies: groupByCurrency(portfolioObj.holdings),
          topHoldings: getTopHoldings(portfolioObj.holdings, 10)
        };
        
        setPortfolioData(data);
      } catch (error) {
        console.error('Error processing portfolio data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    processData();
  }, [portfolio, securities]);
  
  const groupByCurrency = (holdings) => {
    const currencyGroups = {};
    let totalValue = 0;
    
    holdings.forEach(holding => {
      const currency = holding.currency || 'USD';
      const value = holding.value || 0;
      
      currencyGroups[currency] = (currencyGroups[currency] || 0) + value;
      totalValue += value;
    });
    
    return Object.entries(currencyGroups).map(([currency, value]) => ({
      currency,
      value,
      percentage: totalValue > 0 ? (value / totalValue) * 100 : 0
    }));
  };
  
  const getTopHoldings = (holdings, count) => {
    return [...holdings]
      .sort((a, b) => (b.value || 0) - (a.value || 0))
      .slice(0, count);
  };
  
  const renderSummaryCards = () => {
    if (!portfolioData) return null;
    
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="text-xs font-medium text-blue-500 uppercase">Total Value</h4>
          <p className="mt-1 text-lg font-semibold text-blue-700">
            {portfolioData.totalValue.toLocaleString('en-US', {
              style: 'currency',
              currency: 'USD'
            })}
          </p>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="text-xs font-medium text-gray-500 uppercase">Securities</h4>
          <p className="mt-1 text-lg font-semibold text-gray-700">
            {portfolioData.holdings.length}
          </p>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="text-xs font-medium text-gray-500 uppercase">Asset Classes</h4>
          <p className="mt-1 text-lg font-semibold text-gray-700">
            {portfolioData.assetAllocation.length}
          </p>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="text-xs font-medium text-gray-500 uppercase">Currencies</h4>
          <p className="mt-1 text-lg font-semibold text-gray-700">
            {portfolioData.currencies.length}
          </p>
        </div>
      </div>
    );
  };
  
  const renderAllocationView = () => {
    if (!portfolioData) return null;
    
    return (
      <div className="space-y-6">
        {renderSummaryCards()}
        
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Asset Class Allocation</h3>
            <AssetAllocationChart data={portfolioData.assetAllocation} />
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Top Holdings</h3>
            <TopHoldingsChart data={portfolioData.topHoldings} />
          </div>
        </div>
      </div>
    );
  };
  
  const renderCurrencyView = () => {
    if (!portfolioData) return null;
    
    return (
      <div className="space-y-6">
        {renderSummaryCards()}
        
        <div className="grid grid-cols-1 gap-6 md:grid-cols-1">
          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Currency Distribution</h3>
            <CurrencyDistributionChart data={portfolioData.currencies} />
          </div>
        </div>
      </div>
    );
  };
  
  const renderSectorView = () => {
    if (!portfolioData) return null;
    
    return (
      <div className="space-y-6">
        {renderSummaryCards()}
        
        <div className="grid grid-cols-1 gap-6">
          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Sector Breakdown</h3>
            <SectorBreakdownChart data={portfolioData.sectorAllocation} />
          </div>
        </div>
      </div>
    );
  };
  
  const renderPerformanceView = () => {
    if (!portfolioData) return null;
    
    return (
      <div className="space-y-6">
        {renderSummaryCards()}
        
        <div className="bg-white rounded-lg shadow-md p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Performance Over Time</h3>
          <PerformanceChart portfolio={portfolioData} />
        </div>
      </div>
    );
  };
  
  const renderActiveView = () => {
    switch (activeTab) {
      case 'allocation':
        return renderAllocationView();
      case 'currency':
        return renderCurrencyView();
      case 'sector':
        return renderSectorView();
      case 'performance':
        return renderPerformanceView();
      default:
        return renderAllocationView();
    }
  };
  
  if (!portfolio || !securities) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 text-center">
        <p className="text-gray-500">No portfolio data available</p>
      </div>
    );
  }
  
  return (
    <AccessibilityWrapper>
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-md">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px overflow-x-auto">
              <button
                onClick={() => setActiveTab('allocation')}
                className={`py-4 px-6 text-sm font-medium flex items-center whitespace-nowrap ${
                  activeTab === 'allocation'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FiPieChart className="mr-2 h-5 w-5" />
                Asset Allocation
              </button>
              
              <button
                onClick={() => setActiveTab('currency')}
                className={`py-4 px-6 text-sm font-medium flex items-center whitespace-nowrap ${
                  activeTab === 'currency'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FiDollarSign className="mr-2 h-5 w-5" />
                Currency Distribution
              </button>
              
              <button
                onClick={() => setActiveTab('sector')}
                className={`py-4 px-6 text-sm font-medium flex items-center whitespace-nowrap ${
                  activeTab === 'sector'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FiGrid className="mr-2 h-5 w-5" />
                Sector Breakdown
              </button>
              
              <button
                onClick={() => setActiveTab('performance')}
                className={`py-4 px-6 text-sm font-medium flex items-center whitespace-nowrap ${
                  activeTab === 'performance'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FiTrendingUp className="mr-2 h-5 w-5" />
                Performance
              </button>
            </nav>
          </div>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          renderActiveView()
        )}
      </div>
    </AccessibilityWrapper>
  );
};

export default PortfolioVisualizationDashboard;