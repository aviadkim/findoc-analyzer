import React, { useState, useEffect } from 'react';
import { PortfolioVisualizationDashboard } from '../components/portfolio';

const PortfolioVisualizationExample = () => {
  const [portfolio, setPortfolio] = useState(null);
  const [securities, setSecurities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch portfolio data and extracted securities
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch portfolio data from API
        // In a real implementation, you would call your API here
        // For example:
        // const portfolioResponse = await fetch('/api/portfolio/123');
        // const securitiesResponse = await fetch('/api/portfolio/123/securities');
        
        // For this example, we'll use mock data
        const mockPortfolio = {
          id: '123',
          name: 'Sample Portfolio',
          description: 'This is a sample portfolio for demonstration',
          createdAt: '2023-01-01',
          updatedAt: '2023-05-15',
        };
        
        const mockSecurities = [
          {
            isin: 'US0378331005',
            name: 'Apple Inc.',
            symbol: 'AAPL',
            assetClass: 'Equity',
            sector: 'Technology',
            region: 'North America',
            currency: 'USD',
            marketValue: 250000,
            quantity: 1200,
            price: 208.33
          },
          {
            isin: 'US5949181045',
            name: 'Microsoft Corporation',
            symbol: 'MSFT',
            assetClass: 'Equity',
            sector: 'Technology',
            region: 'North America',
            currency: 'USD',
            marketValue: 180000,
            quantity: 450,
            price: 400
          },
          {
            isin: 'US0231351067',
            name: 'Amazon.com Inc.',
            symbol: 'AMZN',
            assetClass: 'Equity',
            sector: 'Consumer Discretionary',
            region: 'North America',
            currency: 'USD',
            marketValue: 145000,
            quantity: 650,
            price: 223.08
          },
          {
            isin: 'US02079K1079',
            name: 'Alphabet Inc.',
            symbol: 'GOOGL',
            assetClass: 'Equity',
            sector: 'Communication Services',
            region: 'North America',
            currency: 'USD',
            marketValue: 120000,
            quantity: 800,
            price: 150
          },
          {
            isin: 'US88160R1014',
            name: 'Tesla Inc.',
            symbol: 'TSLA',
            assetClass: 'Equity',
            sector: 'Consumer Discretionary',
            region: 'North America',
            currency: 'USD',
            marketValue: 95000,
            quantity: 350,
            price: 271.43
          },
          {
            isin: 'US30303M1027',
            name: 'Meta Platforms Inc.',
            symbol: 'META',
            assetClass: 'Equity',
            sector: 'Communication Services',
            region: 'North America',
            currency: 'USD',
            marketValue: 85000,
            quantity: 250,
            price: 340
          },
          {
            isin: 'CH0038863350',
            name: 'Nestle S.A.',
            symbol: 'NESN.SW',
            assetClass: 'Equity',
            sector: 'Consumer Staples',
            region: 'Europe',
            currency: 'CHF',
            marketValue: 70000,
            quantity: 700,
            price: 100
          },
          {
            isin: 'JP3633400001',
            name: 'Toyota Motor Corporation',
            symbol: '7203.T',
            assetClass: 'Equity',
            sector: 'Consumer Discretionary',
            region: 'Asia',
            currency: 'JPY',
            marketValue: 65000,
            quantity: 3500,
            price: 18.57
          },
          {
            isin: 'US912810FP85',
            name: 'US Treasury Bond 3.125% 2049',
            symbol: 'TBOND',
            assetClass: 'Bond',
            sector: 'Government',
            region: 'North America',
            currency: 'USD',
            marketValue: 120000,
            quantity: 100,
            price: 1200
          },
          {
            isin: 'US037833DX05',
            name: 'Apple Inc. 3.85% 2043',
            symbol: 'AAPL43',
            assetClass: 'Bond',
            sector: 'Corporate',
            region: 'North America',
            currency: 'USD',
            marketValue: 50000,
            quantity: 50,
            price: 1000
          },
          {
            isin: 'DE0001102580',
            name: 'German Bund 0.25% 2029',
            symbol: 'BUND',
            assetClass: 'Bond',
            sector: 'Government',
            region: 'Europe',
            currency: 'EUR',
            marketValue: 75000,
            quantity: 80,
            price: 937.5
          },
          {
            isin: 'GB00B0V3WX43',
            name: 'iShares Core FTSE 100 ETF',
            symbol: 'ISF.L',
            assetClass: 'ETF',
            sector: 'Equity Index',
            region: 'Europe',
            currency: 'GBP',
            marketValue: 45000,
            quantity: 5500,
            price: 8.18
          },
          {
            isin: 'US78463V1070',
            name: 'SPDR S&P 500 ETF Trust',
            symbol: 'SPY',
            assetClass: 'ETF',
            sector: 'Equity Index',
            region: 'North America',
            currency: 'USD',
            marketValue: 95000,
            quantity: 180,
            price: 527.78
          },
          {
            isin: 'US46090E1038',
            name: 'Invesco QQQ Trust',
            symbol: 'QQQ',
            assetClass: 'ETF',
            sector: 'Technology',
            region: 'North America',
            currency: 'USD',
            marketValue: 80000,
            quantity: 160,
            price: 500
          },
          {
            isin: 'US912796K736',
            name: 'US Treasury Bills 0% 2023',
            symbol: 'T-BILL',
            assetClass: 'Cash Equivalent',
            sector: 'Money Market',
            region: 'North America',
            currency: 'USD',
            marketValue: 50000,
            quantity: 50,
            price: 1000
          }
        ];
        
        setPortfolio(mockPortfolio);
        setSecurities(mockSecurities);
        setError(null);
      } catch (err) {
        console.error('Error fetching portfolio data:', err);
        setError('Failed to load portfolio data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4 text-red-800">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Portfolio Visualization</h1>
      
      {portfolio && securities.length > 0 ? (
        <PortfolioVisualizationDashboard 
          portfolio={portfolio} 
          securities={securities} 
        />
      ) : (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 text-yellow-800">
          <p>No portfolio data available. Please select or create a portfolio.</p>
        </div>
      )}
    </div>
  );
};

export default PortfolioVisualizationExample;