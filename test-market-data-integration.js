/**
 * Market Data Integration Test
 * 
 * Tests the real-time market data integration for securities.
 */

const axios = require('axios');
const { performance } = require('perf_hooks');

// Configuration
const DEFAULT_API_URL = 'http://localhost:8080';
const API_URL = process.env.API_URL || DEFAULT_API_URL;
const testIsin = 'US0378331005'; // Apple Inc.

// Test functions
async function testCurrentPrice() {
  console.log('Testing current price lookup...');
  const start = performance.now();
  
  try {
    const response = await axios.get(`${API_URL}/api/market-data/price/${testIsin}`);
    
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
    if (!response.data.success) {
      throw new Error('API call was not successful');
    }
    
    if (!response.data.data?.price) {
      throw new Error('No price data returned');
    }
    
    console.log(`✅ Successfully retrieved current price: ${response.data.data.price} ${response.data.data.currency || 'USD'}`);
    console.log(`   Data source: ${response.data.data.provider}`);
    if (response.data.data.change) {
      console.log(`   Price change: ${response.data.data.change} (${response.data.data.changePercent}%)`);
    }
  } catch (error) {
    console.error('❌ Failed to get current price:', error.message);
    if (error.response) {
      console.error('   Response data:', error.response.data);
    }
  }
  
  const end = performance.now();
  console.log(`   Execution time: ${(end - start).toFixed(2)}ms\n`);
}

async function testHistoricalPrices() {
  console.log('Testing historical price data...');
  const start = performance.now();
  
  try {
    const response = await axios.get(`${API_URL}/api/market-data/historical/${testIsin}`, {
      params: {
        period: '1m',
        interval: '1d'
      }
    });
    
    if (!response.data.success) {
      throw new Error('API call was not successful');
    }
    
    if (!response.data.data?.historicalData?.length) {
      throw new Error('No historical data returned');
    }
    
    console.log(`✅ Successfully retrieved ${response.data.data.historicalData.length} historical data points`);
    console.log(`   Data source: ${response.data.data.provider}`);
    console.log(`   First date: ${response.data.data.historicalData[0].date}`);
    console.log(`   Last date: ${response.data.data.historicalData[response.data.data.historicalData.length-1].date}`);
  } catch (error) {
    console.error('❌ Failed to get historical prices:', error.message);
    if (error.response) {
      console.error('   Response data:', error.response.data);
    }
  }
  
  const end = performance.now();
  console.log(`   Execution time: ${(end - start).toFixed(2)}ms\n`);
}

async function testUpdateSecurities() {
  console.log('Testing securities update with market data...');
  const start = performance.now();
  
  try {
    // Create test securities array
    const testSecurities = [
      {
        name: 'Apple Inc.',
        isin: 'US0378331005',
        type: 'equity',
        quantity: 10,
        price: 150.00,
        value: 1500.00,
        currency: 'USD'
      },
      {
        name: 'Microsoft Corporation',
        isin: 'US5949181045',
        type: 'equity',
        quantity: 5,
        price: 300.00,
        value: 1500.00,
        currency: 'USD'
      },
      {
        name: 'Amazon.com Inc.',
        isin: 'US0231351067',
        type: 'equity',
        quantity: 2,
        price: 3000.00,
        value: 6000.00,
        currency: 'USD'
      }
    ];
    
    const response = await axios.put(`${API_URL}/api/market-data/update-securities`, {
      securities: testSecurities,
      forceRefresh: true
    });
    
    if (!response.data.success) {
      throw new Error('API call was not successful');
    }
    
    const updatedSecurities = response.data.data.securities;
    
    console.log(`✅ Successfully updated ${response.data.data.marketPricesAdded} of ${updatedSecurities.length} securities with market data`);
    
    // Display updated securities with market data
    console.log('\nUpdated Securities:');
    updatedSecurities.forEach(security => {
      console.log(`   ${security.name} (${security.isin}):`);
      console.log(`     Document Price: ${security.price} ${security.currency}`);
      console.log(`     Market Price: ${security.marketPrice || 'N/A'} ${security.currency}`);
      if (security.priceChange) {
        console.log(`     Change: ${security.priceChange} (${security.priceChangePercent}%)`);
      }
      console.log(`     Document Value: ${security.value} ${security.currency}`);
      console.log(`     Market Value: ${security.marketValue || 'N/A'} ${security.currency}`);
      console.log('');
    });
  } catch (error) {
    console.error('❌ Failed to update securities:', error.message);
    if (error.response) {
      console.error('   Response data:', error.response.data);
    }
  }
  
  const end = performance.now();
  console.log(`   Execution time: ${(end - start).toFixed(2)}ms\n`);
}

// Run tests
async function runTests() {
  console.log('==============================================');
  console.log('Market Data Integration Test');
  console.log('==============================================');
  console.log(`API URL: ${API_URL}`);
  console.log('==============================================\n');
  
  await testCurrentPrice();
  await testHistoricalPrices();
  await testUpdateSecurities();
  
  console.log('==============================================');
  console.log('Tests completed');
  console.log('==============================================');
}

runTests().catch(error => {
  console.error('Unhandled error in test suite:', error);
  process.exit(1);
});