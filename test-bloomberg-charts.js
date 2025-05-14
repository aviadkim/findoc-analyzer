/**
 * Bloomberg Agent Chart Generation Test
 * 
 * This script tests the chart generation functionality of the Bloomberg Agent.
 */

const BloombergAgent = require('./bloomberg-agent');
const assert = require('assert');

// Create a Bloomberg agent
const agent = new BloombergAgent({ openrouter: 'mock-api-key' });

// Test function
async function runTest() {
  try {
    console.log('Starting Bloomberg Agent Chart Generation test...');
    
    // Initialize the agent
    console.log('Initializing agent...');
    await agent.start();
    console.log('Agent initialized successfully.');
    
    // Test generateChart
    console.log('\nTesting generateChart...');
    const symbol = 'AAPL';
    const chartTypes = Object.values(agent.chartTypes);
    const interval = '1d';
    const range = '1m';
    
    // Test each chart type
    for (const chartType of chartTypes) {
      console.log(`Generating ${chartType} chart for ${symbol}...`);
      const result = await agent.generateChart(symbol, chartType, interval, range);
      
      assert(result.success, `Failed to generate ${chartType} chart for ${symbol}`);
      assert(result.symbol === symbol, `Symbol mismatch: expected ${symbol}, got ${result.symbol}`);
      assert(result.chartType === chartType, `Chart type mismatch: expected ${chartType}, got ${result.chartType}`);
      assert(result.interval === interval, `Interval mismatch: expected ${interval}, got ${result.interval}`);
      assert(result.range === range, `Range mismatch: expected ${range}, got ${result.range}`);
      assert(result.chartUrl, `Chart URL should be provided`);
      assert(result.chartData, `Chart data should be provided`);
      assert(result.chartData.labels, `Chart data should have labels`);
      assert(result.chartData.datasets, `Chart data should have datasets`);
      assert(Array.isArray(result.chartData.datasets), `Datasets should be an array`);
      assert(result.chartData.datasets.length > 0, `Datasets array should not be empty`);
      
      console.log(`Chart URL: ${result.chartUrl}`);
      console.log(`Chart has ${result.chartData.labels.length} data points and ${result.chartData.datasets.length} datasets.`);
    }
    
    // Test invalid chart type
    console.log('\nTesting invalid chart type...');
    try {
      const result = await agent.generateChart(symbol, 'invalid-chart-type', interval, range);
      assert(!result.success, 'Should fail with invalid chart type');
    } catch (error) {
      console.log('Successfully caught invalid chart type error.');
    }
    
    // Print agent stats
    console.log('\nAgent stats:');
    console.log(`Queries processed: ${agent.stats.queriesProcessed}`);
    console.log(`Stocks analyzed: ${agent.stats.stocksAnalyzed}`);
    console.log(`Charts generated: ${agent.stats.chartsGenerated}`);
    
    console.log('\nAll tests passed!');
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run the test
runTest();
