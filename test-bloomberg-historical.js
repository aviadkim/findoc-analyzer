/**
 * Bloomberg Agent Historical Data Test
 * 
 * This script tests the historical data functionality of the Bloomberg Agent.
 */

const BloombergAgent = require('./bloomberg-agent');
const assert = require('assert');

// Create a Bloomberg agent
const agent = new BloombergAgent({ openrouter: 'mock-api-key' });

// Test function
async function runTest() {
  try {
    console.log('Starting Bloomberg Agent Historical Data test...');
    
    // Initialize the agent
    console.log('Initializing agent...');
    await agent.start();
    console.log('Agent initialized successfully.');
    
    // Test getHistoricalData
    console.log('\nTesting getHistoricalData...');
    const symbol = 'AAPL';
    const intervals = ['1d', '1w', '1m'];
    const ranges = ['1d', '1w', '1m', '3m', '6m', '1y'];
    
    // Test a few combinations of intervals and ranges
    for (const interval of intervals) {
      for (const range of ranges.slice(0, 2)) { // Just test a few combinations to keep it quick
        console.log(`Fetching historical data for ${symbol} (${interval}, ${range})...`);
        const result = await agent.getHistoricalData(symbol, interval, range);
        
        assert(result.success, `Failed to get historical data for ${symbol}`);
        assert(result.symbol === symbol, `Symbol mismatch: expected ${symbol}, got ${result.symbol}`);
        assert(result.interval === interval, `Interval mismatch: expected ${interval}, got ${result.interval}`);
        assert(result.range === range, `Range mismatch: expected ${range}, got ${result.range}`);
        assert(Array.isArray(result.data), `Data should be an array, got ${typeof result.data}`);
        assert(result.data.length > 0, `Data array should not be empty`);
        
        // Check the first data point
        const firstPoint = result.data[0];
        assert(firstPoint.date, `Data point should have a date`);
        assert(typeof firstPoint.open === 'number', `Open should be a number, got ${typeof firstPoint.open}`);
        assert(typeof firstPoint.high === 'number', `High should be a number, got ${typeof firstPoint.high}`);
        assert(typeof firstPoint.low === 'number', `Low should be a number, got ${typeof firstPoint.low}`);
        assert(typeof firstPoint.close === 'number', `Close should be a number, got ${typeof firstPoint.close}`);
        assert(typeof firstPoint.volume === 'number', `Volume should be a number, got ${typeof firstPoint.volume}`);
        
        console.log(`Retrieved ${result.data.length} data points.`);
      }
    }
    
    // Print agent stats
    console.log('\nAgent stats:');
    console.log(`Queries processed: ${agent.stats.queriesProcessed}`);
    console.log(`Stocks analyzed: ${agent.stats.stocksAnalyzed}`);
    
    console.log('\nAll tests passed!');
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run the test
runTest();
