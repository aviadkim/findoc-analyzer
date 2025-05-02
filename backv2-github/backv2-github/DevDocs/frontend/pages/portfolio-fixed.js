import { useState, useEffect } from 'react';
import Head from 'next/head';
import FinDocUI from '../components/FinDocUI';

export default function PortfolioPage() {
  const [portfolio, setPortfolio] = useState([]);
  const [portfolioSummary, setPortfolioSummary] = useState(null);
  const [riskMetrics, setRiskMetrics] = useState(null);
  const [performance, setPerformance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data for portfolio
  const mockPortfolio = [
    { 
      id: '1', 
      name: 'Apple Inc.', 
      symbol: 'AAPL', 
      isin: 'US0378331005',
      quantity: 100,
      price: 176.35,
      value: 17635.00,
      currency: 'USD',
      weight: 25.06,
      sector: 'Technology',
      country: 'United States'
    },
    { 
      id: '2', 
      name: 'Microsoft Corporation', 
      symbol: 'MSFT', 
      isin: 'US5949181045',
      quantity: 50,
      price: 412.27,
      value: 20613.50,
      currency: 'USD',
      weight: 29.30,
      sector: 'Technology',
      country: 'United States'
    },
    { 
      id: '3', 
      name: 'Tesla Inc.', 
      symbol: 'TSLA', 
      isin: 'US88160R1014',
      quantity: 25,
      price: 175.34,
      value: 4383.50,
      currency: 'USD',
      weight: 6.23,
      sector: 'Automotive',
      country: 'United States'
    },
    { 
      id: '4', 
      name: 'Amazon.com Inc.', 
      symbol: 'AMZN', 
      isin: 'US0231351067',
      quantity: 85,
      price: 179.77,
      value: 15280.75,
      currency: 'USD',
      weight: 21.72,
      sector: 'Consumer Cyclical',
      country: 'United States'
    },
    { 
      id: '5', 
      name: 'Alphabet Inc.', 
      symbol: 'GOOGL', 
      isin: 'US02079K1079',
      quantity: 85,
      price: 146.47,
      value: 12450.30,
      currency: 'USD',
      weight: 17.69,
      sector: 'Communication Services',
      country: 'United States'
    }
  ];

  // Mock data for portfolio summary
  const mockPortfolioSummary = {
    totalValue: 70363.05,
    currency: 'USD',
    assetAllocation: {
      'Technology': 54.36,
      'Automotive': 6.23,
      'Consumer Cyclical': 21.72,
      'Communication Services': 17.69
    },
    geographicAllocation: {
      'United States': 100
    }
  };

  // Mock data for risk metrics
  const mockRiskMetrics = {
    volatility: 18.5,
    sharpeRatio: 0.85,
    maxDrawdown: 25.3,
    beta: 1.15,
    alpha: 2.3
  };

  // Mock data for performance
  const mockPerformance = {
    '1M': 3.2,
    '3M': 7.5,
    '6M': 12.8,
    'YTD': 15.3,
    '1Y': 22.7,
    '3Y': 45.2,
    '5Y': 87.6
  };

  // Load mock data on component mount
  useEffect(() => {
    const loadMockData = () => {
      setLoading(true);
      
      // Simulate API delay
      setTimeout(() => {
        setPortfolio(mockPortfolio);
        setPortfolioSummary(mockPortfolioSummary);
        setRiskMetrics(mockRiskMetrics);
        setPerformance(mockPerformance);
        setLoading(false);
      }, 1000);
    };
    
    loadMockData();
  }, []);

  // Format currency
  const formatCurrency = (value, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(value);
  };

  // Format percentage
  const formatPercentage = (value) => {
    return `${value.toFixed(2)}%`;
  };

  // Calculate total value
  const totalValue = portfolioSummary ? portfolioSummary.totalValue : 0;

  return (
    <FinDocUI>
      <Head>
        <title>Portfolio Analysis | FinDoc Analyzer</title>
      </Head>
      
      <div className="portfolio-page">
        <h1 className="page-title">Portfolio Analysis</h1>
        
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading portfolio data...</p>
          </div>
        ) : error ? (
          <div className="error-container">
            <p className="error-message">{error}</p>
            <button
              className="retry-button"
              onClick={() => window.location.reload()}
            >
              Retry
            </button>
          </div>
        ) : (
          <>
            {/* Portfolio Summary Cards */}
            <div className="summary-cards">
              <div className="summary-card">
                <h3>Total Value</h3>
                <div className="summary-value">{formatCurrency(totalValue)}</div>
              </div>

              <div className="summary-card">
                <h3>Holdings</h3>
                <div className="summary-value">{portfolio.length}</div>
              </div>

              <div className="summary-card">
                <h3>Volatility</h3>
                <div className="summary-value">{formatPercentage(riskMetrics?.volatility || 0)}</div>
              </div>

              <div className="summary-card">
                <h3>YTD Return</h3>
                <div className="summary-value">{formatPercentage(performance?.YTD || 0)}</div>
              </div>
            </div>

            {/* Portfolio Tabs */}
            <div className="portfolio-tabs">
              <div className="tabs-header">
                <button
                  className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
                  onClick={() => setActiveTab('overview')}
                >
                  Overview
                </button>
                <button
                  className={`tab-button ${activeTab === 'holdings' ? 'active' : ''}`}
                  onClick={() => setActiveTab('holdings')}
                >
                  Holdings
                </button>
                <button
                  className={`tab-button ${activeTab === 'allocation' ? 'active' : ''}`}
                  onClick={() => setActiveTab('allocation')}
                >
                  Allocation
                </button>
                <button
                  className={`tab-button ${activeTab === 'performance' ? 'active' : ''}`}
                  onClick={() => setActiveTab('performance')}
                >
                  Performance
                </button>
                <button
                  className={`tab-button ${activeTab === 'risk' ? 'active' : ''}`}
                  onClick={() => setActiveTab('risk')}
                >
                  Risk Analysis
                </button>
              </div>

              <div className="tab-content">
                {activeTab === 'overview' && (
                  <div className="overview-tab">
                    <div className="overview-charts">
                      <div className="chart-container">
                        <h3>Asset Allocation</h3>
                        <div className="chart-placeholder">
                          {/* Placeholder for asset allocation chart */}
                          <div className="chart-mock">
                            <div style={{ height: '60px', width: '60%', backgroundColor: '#4299E1' }}></div>
                            <div style={{ height: '30px', width: '30%', backgroundColor: '#48BB78' }}></div>
                            <div style={{ height: '10px', width: '10%', backgroundColor: '#F6AD55' }}></div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="chart-container">
                        <h3>Performance</h3>
                        <div className="chart-placeholder">
                          {/* Placeholder for performance chart */}
                          <div className="chart-mock">
                            <div style={{ height: '100px', width: '100%', background: 'linear-gradient(90deg, #4299E1 0%, #48BB78 100%)' }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="top-holdings">
                      <h3>Top Holdings</h3>
                      <table className="holdings-table">
                        <thead>
                          <tr>
                            <th>Name</th>
                            <th>Value</th>
                            <th>Weight</th>
                          </tr>
                        </thead>
                        <tbody>
                          {portfolio.slice(0, 3).map((holding) => (
                            <tr key={holding.id}>
                              <td>{holding.name}</td>
                              <td>{formatCurrency(holding.value)}</td>
                              <td>{formatPercentage(holding.weight)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {activeTab === 'holdings' && (
                  <div className="holdings-tab">
                    <table className="holdings-table">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Symbol</th>
                          <th>ISIN</th>
                          <th>Quantity</th>
                          <th>Price</th>
                          <th>Value</th>
                          <th>Weight</th>
                          <th>Sector</th>
                        </tr>
                      </thead>
                      <tbody>
                        {portfolio.map((holding) => (
                          <tr key={holding.id}>
                            <td>{holding.name}</td>
                            <td>{holding.symbol}</td>
                            <td>{holding.isin}</td>
                            <td>{holding.quantity}</td>
                            <td>{formatCurrency(holding.price)}</td>
                            <td>{formatCurrency(holding.value)}</td>
                            <td>{formatPercentage(holding.weight)}</td>
                            <td>{holding.sector}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {activeTab === 'allocation' && (
                  <div className="allocation-tab">
                    <div className="allocation-charts">
                      <div className="chart-container">
                        <h3>Asset Allocation</h3>
                        <div className="chart-placeholder">
                          {/* Placeholder for asset allocation chart */}
                          <div className="chart-mock">
                            <div style={{ height: '60px', width: '60%', backgroundColor: '#4299E1' }}></div>
                            <div style={{ height: '30px', width: '30%', backgroundColor: '#48BB78' }}></div>
                            <div style={{ height: '10px', width: '10%', backgroundColor: '#F6AD55' }}></div>
                          </div>
                        </div>
                        <div className="allocation-legend">
                          {Object.entries(portfolioSummary?.assetAllocation || {}).map(([sector, weight]) => (
                            <div key={sector} className="legend-item">
                              <div className="legend-color" style={{ backgroundColor: sector === 'Technology' ? '#4299E1' : sector === 'Consumer Cyclical' ? '#48BB78' : '#F6AD55' }}></div>
                              <div className="legend-label">{sector}</div>
                              <div className="legend-value">{formatPercentage(weight)}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="chart-container">
                        <h3>Geographic Allocation</h3>
                        <div className="chart-placeholder">
                          {/* Placeholder for geographic allocation chart */}
                          <div className="chart-mock">
                            <div style={{ height: '100px', width: '100%', backgroundColor: '#4299E1' }}></div>
                          </div>
                        </div>
                        <div className="allocation-legend">
                          {Object.entries(portfolioSummary?.geographicAllocation || {}).map(([country, weight]) => (
                            <div key={country} className="legend-item">
                              <div className="legend-color" style={{ backgroundColor: '#4299E1' }}></div>
                              <div className="legend-label">{country}</div>
                              <div className="legend-value">{formatPercentage(weight)}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'performance' && (
                  <div className="performance-tab">
                    <div className="performance-chart">
                      <h3>Historical Performance</h3>
                      <div className="chart-placeholder">
                        {/* Placeholder for performance chart */}
                        <div className="chart-mock">
                          <div style={{ height: '200px', width: '100%', background: 'linear-gradient(90deg, #4299E1 0%, #48BB78 100%)' }}></div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="performance-metrics">
                      <h3>Performance Metrics</h3>
                      <table className="metrics-table">
                        <thead>
                          <tr>
                            <th>Period</th>
                            <th>Return</th>
                          </tr>
                        </thead>
                        <tbody>
                          {Object.entries(performance || {}).map(([period, value]) => (
                            <tr key={period}>
                              <td>{period}</td>
                              <td className={value >= 0 ? 'positive' : 'negative'}>
                                {formatPercentage(value)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {activeTab === 'risk' && (
                  <div className="risk-tab">
                    <div className="risk-metrics">
                      <h3>Risk Metrics</h3>
                      <table className="metrics-table">
                        <tbody>
                          <tr>
                            <td>Volatility</td>
                            <td>{formatPercentage(riskMetrics?.volatility || 0)}</td>
                          </tr>
                          <tr>
                            <td>Sharpe Ratio</td>
                            <td>{riskMetrics?.sharpeRatio.toFixed(2) || 0}</td>
                          </tr>
                          <tr>
                            <td>Maximum Drawdown</td>
                            <td>{formatPercentage(riskMetrics?.maxDrawdown || 0)}</td>
                          </tr>
                          <tr>
                            <td>Beta</td>
                            <td>{riskMetrics?.beta.toFixed(2) || 0}</td>
                          </tr>
                          <tr>
                            <td>Alpha</td>
                            <td>{formatPercentage(riskMetrics?.alpha || 0)}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    
                    <div className="risk-chart">
                      <h3>Risk/Return Analysis</h3>
                      <div className="chart-placeholder">
                        {/* Placeholder for risk/return chart */}
                        <div className="chart-mock">
                          <div style={{ height: '200px', width: '100%', background: 'linear-gradient(135deg, #4299E1 0%, #F6AD55 100%)' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      <style jsx>{`
        .portfolio-page {
          padding: 20px;
        }
        
        .page-title {
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 20px;
        }
        
        .loading-container, .error-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 40px;
          background-color: #f8f9fa;
          border-radius: 8px;
          margin-bottom: 20px;
        }
        
        .loading-spinner {
          border: 4px solid rgba(0, 0, 0, 0.1);
          border-radius: 50%;
          border-top: 4px solid #3498db;
          width: 40px;
          height: 40px;
          animation: spin 1s linear infinite;
          margin-bottom: 20px;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .error-message {
          color: #e53e3e;
          margin-bottom: 20px;
        }
        
        .retry-button {
          padding: 8px 16px;
          background-color: #3182ce;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        
        .summary-cards {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }
        
        .summary-card {
          background-color: white;
          border-radius: 8px;
          padding: 20px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        
        .summary-card h3 {
          font-size: 14px;
          color: #718096;
          margin-bottom: 10px;
        }
        
        .summary-value {
          font-size: 24px;
          font-weight: bold;
          color: #2d3748;
        }
        
        .portfolio-tabs {
          background-color: white;
          border-radius: 8px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }
        
        .tabs-header {
          display: flex;
          border-bottom: 1px solid #e2e8f0;
          overflow-x: auto;
        }
        
        .tab-button {
          padding: 12px 20px;
          background: none;
          border: none;
          cursor: pointer;
          font-size: 14px;
          color: #4a5568;
          white-space: nowrap;
        }
        
        .tab-button.active {
          color: #3182ce;
          border-bottom: 2px solid #3182ce;
          font-weight: bold;
        }
        
        .tab-content {
          padding: 20px;
        }
        
        .overview-charts, .allocation-charts {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }
        
        .chart-container {
          background-color: #f8f9fa;
          border-radius: 8px;
          padding: 20px;
        }
        
        .chart-container h3 {
          font-size: 16px;
          margin-bottom: 15px;
        }
        
        .chart-placeholder {
          height: 200px;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: white;
          border-radius: 4px;
          border: 1px solid #e2e8f0;
        }
        
        .chart-mock {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
        }
        
        .holdings-table, .metrics-table {
          width: 100%;
          border-collapse: collapse;
        }
        
        .holdings-table th, .metrics-table th {
          text-align: left;
          padding: 12px;
          background-color: #f8f9fa;
          border-bottom: 1px solid #e2e8f0;
          font-weight: bold;
          color: #4a5568;
        }
        
        .holdings-table td, .metrics-table td {
          padding: 12px;
          border-bottom: 1px solid #e2e8f0;
          color: #2d3748;
        }
        
        .allocation-legend {
          margin-top: 20px;
        }
        
        .legend-item {
          display: flex;
          align-items: center;
          margin-bottom: 8px;
        }
        
        .legend-color {
          width: 16px;
          height: 16px;
          border-radius: 4px;
          margin-right: 8px;
        }
        
        .legend-label {
          flex: 1;
          font-size: 14px;
        }
        
        .legend-value {
          font-size: 14px;
          font-weight: bold;
        }
        
        .positive {
          color: #48bb78;
        }
        
        .negative {
          color: #e53e3e;
        }
        
        @media (max-width: 768px) {
          .overview-charts, .allocation-charts {
            grid-template-columns: 1fr;
          }
          
          .tabs-header {
            flex-wrap: wrap;
          }
          
          .tab-button {
            flex: 1;
            text-align: center;
          }
        }
      `}</style>
    </FinDocUI>
  );
}
