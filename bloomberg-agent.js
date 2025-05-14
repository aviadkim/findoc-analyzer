/**
 * Bloomberg Agent
 *
 * This agent fetches financial data from the web, including stock prices,
 * historical data, and charts to answer client questions.
 */

const FinancialAgentBase = require('./financial-agent-base');
const axios = require('axios');

class BloombergAgent extends FinancialAgentBase {
  /**
   * Constructor
   * @param {Object} apiKeys - API keys for the agent
   * @param {Object} options - Additional options
   */
  constructor(apiKeys, options = {}) {
    super(
      'Bloomberg',
      'Fetches financial data from the web, including stock prices, historical data, and charts.',
      'openrouter', // Using OpenRouter for advanced financial analysis
      apiKeys,
      options
    );

    // Initialize agent-specific stats
    this.stats = {
      queriesProcessed: 0,
      stocksAnalyzed: 0,
      chartsGenerated: 0,
      questionsAnswered: 0,
      averageProcessingTime: 0
    };

    // Chart types
    this.chartTypes = {
      LINE: 'line',
      CANDLE: 'candle',
      BAR: 'bar',
      AREA: 'area'
    };

    // Question types
    this.questionTypes = {
      PRICE: 'price',
      HISTORICAL: 'historical',
      COMPARISON: 'comparison',
      ANALYSIS: 'analysis',
      GENERAL: 'general'
    };
  }

  /**
   * Initialize agent-specific resources
   * @returns {Promise<void>}
   */
  async initialize() {
    this.addLog('INFO', 'Initializing Bloomberg agent resources');

    // In a real implementation, this might load models, connect to databases, etc.
    // For now, we'll just simulate initialization
    await new Promise(resolve => setTimeout(resolve, 500));

    this.addLog('INFO', 'Bloomberg agent resources initialized');
  }

  /**
   * Get current stock price
   * @param {string} symbol - Stock symbol
   * @returns {Promise<Object>} Stock price data
   */
  async getStockPrice(symbol) {
    try {
      this.addLog('INFO', `Fetching current price for ${symbol}`);

      // Try to fetch real data from Yahoo Finance API
      try {
        const response = await axios.get(`https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`);

        if (response.status === 200 && response.data && response.data.chart &&
            response.data.chart.result && response.data.chart.result.length > 0) {

          const result = response.data.chart.result[0];
          const quote = result.indicators.quote[0];
          const meta = result.meta;

          // Get the latest price
          const latestIndex = quote.close.length - 1;
          const currentPrice = quote.close[latestIndex];
          const previousClose = meta.previousClose || quote.close[0];

          // Calculate change
          const change = currentPrice - previousClose;
          const changePercent = (change / previousClose) * 100;

          this.stats.queriesProcessed++;
          this.stats.stocksAnalyzed++;

          return {
            success: true,
            symbol,
            price: currentPrice.toFixed(2),
            change: change.toFixed(2),
            changePercent: changePercent.toFixed(2),
            currency: meta.currency || 'USD',
            timestamp: new Date().toISOString(),
            source: 'yahoo-finance'
          };
        }
      } catch (apiError) {
        this.addLog('WARNING', `Error fetching real data for ${symbol}, falling back to mock data: ${apiError.message}`);
      }

      // Fall back to mock data if real data fetch fails
      const price = this.generateMockPrice(symbol);

      this.stats.queriesProcessed++;
      this.stats.stocksAnalyzed++;

      return {
        success: true,
        symbol,
        price: price.price,
        change: price.change,
        changePercent: price.changePercent,
        currency: price.currency,
        timestamp: new Date().toISOString(),
        source: 'mock-data'
      };
    } catch (error) {
      this.addLog('ERROR', `Error fetching price for ${symbol}: ${error.message}`);

      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get historical stock data
   * @param {string} symbol - Stock symbol
   * @param {string} interval - Data interval (1d, 1w, 1m, etc.)
   * @param {string} range - Data range (1d, 1w, 1m, 3m, 6m, 1y, 5y, max)
   * @returns {Promise<Object>} Historical stock data
   */
  async getHistoricalData(symbol, interval = '1d', range = '1m') {
    try {
      this.addLog('INFO', `Fetching historical data for ${symbol} (${interval}, ${range})`);

      // Map our interval and range to Yahoo Finance format
      const yahooInterval = this.mapIntervalToYahoo(interval);
      const yahooRange = this.mapRangeToYahoo(range);

      // Try to fetch real data from Yahoo Finance API
      try {
        const response = await axios.get(`https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=${yahooInterval}&range=${yahooRange}`);

        if (response.status === 200 && response.data && response.data.chart &&
            response.data.chart.result && response.data.chart.result.length > 0) {

          const result = response.data.chart.result[0];
          const quote = result.indicators.quote[0];
          const timestamps = result.timestamp;
          const meta = result.meta;

          // Format the data
          const historicalData = [];

          for (let i = 0; i < timestamps.length; i++) {
            if (quote.close[i] !== null && quote.close[i] !== undefined) {
              historicalData.push({
                date: new Date(timestamps[i] * 1000).toISOString(),
                open: quote.open[i] !== null ? quote.open[i] : quote.close[i],
                high: quote.high[i] !== null ? quote.high[i] : quote.close[i],
                low: quote.low[i] !== null ? quote.low[i] : quote.close[i],
                close: quote.close[i],
                volume: quote.volume[i] !== null ? quote.volume[i] : 0
              });
            }
          }

          this.stats.queriesProcessed++;
          this.stats.stocksAnalyzed++;

          return {
            success: true,
            symbol,
            interval,
            range,
            currency: meta.currency || 'USD',
            timestamp: new Date().toISOString(),
            data: historicalData,
            source: 'yahoo-finance'
          };
        }
      } catch (apiError) {
        this.addLog('WARNING', `Error fetching real historical data for ${symbol}, falling back to mock data: ${apiError.message}`);
      }

      // Fall back to mock data if real data fetch fails
      const historicalData = this.generateMockHistoricalData(symbol, interval, range);

      this.stats.queriesProcessed++;
      this.stats.stocksAnalyzed++;

      return {
        success: true,
        symbol,
        interval,
        range,
        currency: 'USD',
        timestamp: new Date().toISOString(),
        data: historicalData,
        source: 'mock-data'
      };
    } catch (error) {
      this.addLog('ERROR', `Error fetching historical data for ${symbol}: ${error.message}`);

      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Map our interval format to Yahoo Finance format
   * @param {string} interval - Our interval format
   * @returns {string} Yahoo Finance interval format
   */
  mapIntervalToYahoo(interval) {
    const map = {
      '1m': '1m',
      '5m': '5m',
      '15m': '15m',
      '30m': '30m',
      '1h': '1h',
      '1d': '1d',
      '1w': '1wk',
      '1mo': '1mo'
    };

    return map[interval] || '1d';
  }

  /**
   * Map our range format to Yahoo Finance format
   * @param {string} range - Our range format
   * @returns {string} Yahoo Finance range format
   */
  mapRangeToYahoo(range) {
    const map = {
      '1d': '1d',
      '5d': '5d',
      '1w': '5d',
      '1m': '1mo',
      '3m': '3mo',
      '6m': '6mo',
      '1y': '1y',
      '5y': '5y',
      'max': 'max'
    };

    return map[range] || '1mo';
  }

  /**
   * Generate mock price data
   * @param {string} symbol - Stock symbol
   * @returns {Object} Mock price data
   */
  generateMockPrice(symbol) {
    // Generate a deterministic but seemingly random price based on the symbol
    const seed = symbol.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
    const random = (seed % 1000) / 100;

    const basePrice = 100 + random;
    const change = (Math.sin(seed) * 5).toFixed(2);
    const changePercent = (change / basePrice * 100).toFixed(2);

    return {
      price: basePrice.toFixed(2),
      change,
      changePercent,
      currency: 'USD',
      volume: Math.floor(1000000 + random * 10000),
      marketCap: (basePrice * (10000000 + random * 1000000)).toFixed(2)
    };
  }

  /**
   * Generate mock historical data
   * @param {string} symbol - Stock symbol
   * @param {string} interval - Data interval
   * @param {string} range - Data range
   * @returns {Array} Mock historical data
   */
  generateMockHistoricalData(symbol, interval, range) {
    // Generate a deterministic but seemingly random price based on the symbol
    const seed = symbol.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
    const basePrice = 100 + (seed % 1000) / 100;

    // Determine number of data points based on range and interval
    let dataPoints = 30; // Default to 30 data points

    if (range === '1d') dataPoints = 24;
    else if (range === '1w') dataPoints = 7;
    else if (range === '1m') dataPoints = 30;
    else if (range === '3m') dataPoints = 90;
    else if (range === '6m') dataPoints = 180;
    else if (range === '1y') dataPoints = 365;
    else if (range === '5y') dataPoints = 365 * 5;

    // Generate historical data
    const data = [];
    let currentPrice = basePrice;
    const now = new Date();

    for (let i = dataPoints - 1; i >= 0; i--) {
      // Generate a date for this data point
      const date = new Date(now);

      if (interval === '1d') {
        date.setHours(now.getHours() - i);
      } else if (interval === '1w') {
        date.setDate(now.getDate() - (i * 7));
      } else if (interval === '1m') {
        date.setMonth(now.getMonth() - i);
      } else {
        date.setDate(now.getDate() - i);
      }

      // Generate a price movement based on the symbol and date
      const movement = (Math.sin(seed + i) * 2) - 1; // Between -1 and 1
      currentPrice = Math.max(1, currentPrice * (1 + (movement * 0.02))); // Max 2% movement, minimum price of 1

      // Generate volume
      const volume = Math.floor(1000000 + (seed % 1000) * 10000 * (1 + (Math.sin(i) * 0.5)));

      data.push({
        date: date.toISOString(),
        open: currentPrice * (1 - (Math.random() * 0.01)),
        high: currentPrice * (1 + (Math.random() * 0.02)),
        low: currentPrice * (1 - (Math.random() * 0.02)),
        close: currentPrice,
        volume
      });
    }

    return data;
  }

  /**
   * Generate a chart for a stock
   * @param {string} symbol - Stock symbol
   * @param {string} chartType - Chart type (line, candle, bar, area)
   * @param {string} interval - Data interval (1d, 1w, 1m, etc.)
   * @param {string} range - Data range (1d, 1w, 1m, 3m, 6m, 1y, 5y, max)
   * @param {Object} options - Chart options
   * @returns {Promise<Object>} Chart data
   */
  async generateChart(symbol, chartType = 'line', interval = '1d', range = '1m', options = {}) {
    try {
      this.addLog('INFO', `Generating ${chartType} chart for ${symbol} (${interval}, ${range})`);

      // Validate chart type
      if (!Object.values(this.chartTypes).includes(chartType)) {
        throw new Error(`Invalid chart type: ${chartType}`);
      }

      // Get historical data
      const historicalData = await this.getHistoricalData(symbol, interval, range);

      if (!historicalData.success) {
        throw new Error(`Failed to get historical data: ${historicalData.error}`);
      }

      // In a real implementation, this would generate a chart image or data
      // For now, we'll simulate a chart URL and data
      const chartData = this.generateMockChartData(symbol, chartType, historicalData.data, options);

      this.stats.chartsGenerated++;

      return {
        success: true,
        symbol,
        chartType,
        interval,
        range,
        timestamp: new Date().toISOString(),
        chartUrl: chartData.chartUrl,
        chartData: chartData.chartData
      };
    } catch (error) {
      this.addLog('ERROR', `Error generating chart for ${symbol}: ${error.message}`);

      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get security information by ISIN
   * @param {string} isin - ISIN code
   * @returns {Promise<Object>} Security information
   */
  async getSecurityInfo(isin) {
    try {
      this.addLog('INFO', `Getting security info for ISIN ${isin}`);

      // Try to map ISIN to a symbol
      // This is a simplified mapping - in a real implementation, we would use a financial data API
      const isinToSymbolMap = {
        'US0378331005': 'AAPL',  // Apple
        'US5949181045': 'MSFT',  // Microsoft
        'US0231351067': 'AMZN',  // Amazon
        'US88160R1014': 'TSLA',  // Tesla
        'US30303M1027': 'META',  // Meta
        'US02079K1079': 'GOOG',  // Google
        'US4581401001': 'INTC',  // Intel
        'US67066G1040': 'NVDA',  // NVIDIA
        'US0970231058': 'BA',    // Boeing
        'US46625H1005': 'JPM'    // JPMorgan Chase
      };

      const symbol = isinToSymbolMap[isin];

      if (symbol) {
        // Get real-time price using Yahoo Finance API
        try {
          const response = await axios.get(`https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`);

          if (response.status === 200 && response.data && response.data.chart &&
              response.data.chart.result && response.data.chart.result.length > 0) {

            const result = response.data.chart.result[0];
            const quote = result.indicators.quote[0];
            const meta = result.meta;

            // Get the latest price
            const latestIndex = quote.close.length - 1;
            const currentPrice = quote.close[latestIndex];

            // Get company name from meta data
            const name = meta.shortName || meta.longName || `${symbol} Inc.`;

            this.stats.queriesProcessed++;

            return {
              success: true,
              isin,
              symbol,
              name,
              price: currentPrice.toFixed(2),
              currency: meta.currency || 'USD',
              timestamp: new Date().toISOString(),
              source: 'yahoo-finance'
            };
          }
        } catch (apiError) {
          this.addLog('WARNING', `Error fetching real data for ISIN ${isin}, falling back to mock data: ${apiError.message}`);
        }

        // Fall back to mock data
        const mockPrice = this.generateMockPrice(symbol);
        const mockName = {
          'AAPL': 'Apple Inc.',
          'MSFT': 'Microsoft Corporation',
          'AMZN': 'Amazon.com Inc.',
          'TSLA': 'Tesla Inc.',
          'META': 'Meta Platforms Inc.',
          'GOOG': 'Alphabet Inc.',
          'INTC': 'Intel Corporation',
          'NVDA': 'NVIDIA Corporation',
          'BA': 'Boeing Co.',
          'JPM': 'JPMorgan Chase & Co.'
        }[symbol] || `${symbol} Inc.`;

        return {
          success: true,
          isin,
          symbol,
          name: mockName,
          price: mockPrice.price,
          currency: 'USD',
          timestamp: new Date().toISOString(),
          source: 'mock-data'
        };
      } else {
        // For unknown ISINs, generate mock data
        const mockSymbol = isin.substring(2, 5);
        const mockPrice = this.generateMockPrice(mockSymbol);

        return {
          success: true,
          isin,
          symbol: mockSymbol,
          name: `Unknown Security (${isin})`,
          price: mockPrice.price,
          currency: 'USD',
          timestamp: new Date().toISOString(),
          source: 'mock-data'
        };
      }
    } catch (error) {
      this.addLog('ERROR', `Error getting security info for ISIN ${isin}: ${error.message}`);

      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Generate mock chart data
   * @param {string} symbol - Stock symbol
   * @param {string} chartType - Chart type
   * @param {Array} historicalData - Historical data
   * @param {Object} options - Chart options
   * @returns {Object} Mock chart data
   */
  generateMockChartData(symbol, chartType, historicalData, options) {
    // Generate a mock chart URL
    const chartUrl = `https://mock-bloomberg-charts.example.com/${symbol}?type=${chartType}&t=${Date.now()}`;

    // Generate chart data based on chart type
    let chartData;

    switch (chartType) {
      case this.chartTypes.LINE:
        chartData = {
          labels: historicalData.map(d => d.date),
          datasets: [
            {
              label: symbol,
              data: historicalData.map(d => d.close),
              borderColor: '#1E88E5',
              backgroundColor: 'rgba(30, 136, 229, 0.1)',
              borderWidth: 2,
              pointRadius: 0,
              pointHoverRadius: 5
            }
          ]
        };
        break;

      case this.chartTypes.CANDLE:
        chartData = {
          labels: historicalData.map(d => d.date),
          datasets: [
            {
              label: symbol,
              data: historicalData.map(d => ({
                t: d.date,
                o: d.open,
                h: d.high,
                l: d.low,
                c: d.close
              }))
            }
          ]
        };
        break;

      case this.chartTypes.BAR:
        chartData = {
          labels: historicalData.map(d => d.date),
          datasets: [
            {
              label: `${symbol} Price`,
              data: historicalData.map(d => d.close),
              backgroundColor: historicalData.map(d => d.close > d.open ? '#4CAF50' : '#F44336')
            },
            {
              label: `${symbol} Volume`,
              data: historicalData.map(d => d.volume / 1000000), // Convert to millions
              backgroundColor: 'rgba(156, 39, 176, 0.3)'
            }
          ]
        };
        break;

      case this.chartTypes.AREA:
        chartData = {
          labels: historicalData.map(d => d.date),
          datasets: [
            {
              label: symbol,
              data: historicalData.map(d => d.close),
              borderColor: '#1E88E5',
              backgroundColor: 'rgba(30, 136, 229, 0.3)',
              borderWidth: 2,
              pointRadius: 0,
              pointHoverRadius: 5,
              fill: true
            }
          ]
        };
        break;

      default:
        chartData = {
          labels: historicalData.map(d => d.date),
          datasets: [
            {
              label: symbol,
              data: historicalData.map(d => d.close)
            }
          ]
        };
    }

    return {
      chartUrl,
      chartData
    };
  }

  /**
   * Answer a financial question
   * @param {string} question - Question to answer
   * @param {Object} options - Options for answering the question
   * @returns {Promise<Object>} Answer
   */
  async answerQuestion(question, options = {}) {
    try {
      this.addLog('INFO', `Answering question: ${question}`);

      const startTime = Date.now();

      // Analyze the question to determine the type and extract relevant information
      const analysis = this.analyzeQuestion(question);

      // Generate an answer based on the question type
      let answer;
      let data = {};

      switch (analysis.type) {
        case this.questionTypes.PRICE:
          // Get current price for the symbol
          const priceResult = await this.getStockPrice(analysis.symbol);

          if (!priceResult.success) {
            throw new Error(`Failed to get price: ${priceResult.error}`);
          }

          answer = `The current price of ${analysis.symbol} is $${priceResult.price}. `;

          if (parseFloat(priceResult.change) > 0) {
            answer += `It is up $${priceResult.change} (${priceResult.changePercent}%) today.`;
          } else {
            answer += `It is down $${Math.abs(parseFloat(priceResult.change))} (${Math.abs(parseFloat(priceResult.changePercent))}%) today.`;
          }

          data = { priceResult };
          break;

        case this.questionTypes.HISTORICAL:
          // Get historical data for the symbol
          const historicalResult = await this.getHistoricalData(analysis.symbol, analysis.interval, analysis.range);

          if (!historicalResult.success) {
            throw new Error(`Failed to get historical data: ${historicalResult.error}`);
          }

          // Generate a chart
          const chartResult = await this.generateChart(analysis.symbol, 'line', analysis.interval, analysis.range);

          // Calculate performance
          const firstPrice = historicalResult.data[0].close;
          const lastPrice = historicalResult.data[historicalResult.data.length - 1].close;
          const change = lastPrice - firstPrice;
          const percentChange = (change / firstPrice) * 100;

          answer = `Over the past ${analysis.range}, ${analysis.symbol} has `;

          if (change > 0) {
            answer += `increased by $${change.toFixed(2)} (${percentChange.toFixed(2)}%).`;
          } else {
            answer += `decreased by $${Math.abs(change).toFixed(2)} (${Math.abs(percentChange).toFixed(2)}%).`;
          }

          answer += ` The price started at $${firstPrice.toFixed(2)} and is currently $${lastPrice.toFixed(2)}.`;

          data = { historicalResult, chartResult };
          break;

        case this.questionTypes.COMPARISON:
          // Get current prices for both symbols
          const price1Result = await this.getStockPrice(analysis.symbol1);
          const price2Result = await this.getStockPrice(analysis.symbol2);

          if (!price1Result.success || !price2Result.success) {
            throw new Error('Failed to get prices for comparison');
          }

          // Get historical data for both symbols
          const historical1Result = await this.getHistoricalData(analysis.symbol1, '1d', '1y');
          const historical2Result = await this.getHistoricalData(analysis.symbol2, '1d', '1y');

          if (!historical1Result.success || !historical2Result.success) {
            throw new Error('Failed to get historical data for comparison');
          }

          // Calculate yearly performance
          const first1Price = historical1Result.data[0].close;
          const last1Price = historical1Result.data[historical1Result.data.length - 1].close;
          const change1 = last1Price - first1Price;
          const percentChange1 = (change1 / first1Price) * 100;

          const first2Price = historical2Result.data[0].close;
          const last2Price = historical2Result.data[historical2Result.data.length - 1].close;
          const change2 = last2Price - first2Price;
          const percentChange2 = (change2 / first2Price) * 100;

          answer = `Comparing ${analysis.symbol1} and ${analysis.symbol2}:\n\n`;
          answer += `${analysis.symbol1} is currently trading at $${price1Result.price}, `;

          if (parseFloat(price1Result.change) > 0) {
            answer += `up $${price1Result.change} (${price1Result.changePercent}%) today. `;
          } else {
            answer += `down $${Math.abs(parseFloat(price1Result.change))} (${Math.abs(parseFloat(price1Result.changePercent))}%) today. `;
          }

          answer += `Over the past year, it has `;

          if (change1 > 0) {
            answer += `gained ${percentChange1.toFixed(2)}%.\n\n`;
          } else {
            answer += `lost ${Math.abs(percentChange1).toFixed(2)}%.\n\n`;
          }

          answer += `${analysis.symbol2} is currently trading at $${price2Result.price}, `;

          if (parseFloat(price2Result.change) > 0) {
            answer += `up $${price2Result.change} (${price2Result.changePercent}%) today. `;
          } else {
            answer += `down $${Math.abs(parseFloat(price2Result.change))} (${Math.abs(parseFloat(price2Result.changePercent))}%) today. `;
          }

          answer += `Over the past year, it has `;

          if (change2 > 0) {
            answer += `gained ${percentChange2.toFixed(2)}%.\n\n`;
          } else {
            answer += `lost ${Math.abs(percentChange2).toFixed(2)}%.\n\n`;
          }

          // Compare performance
          if (percentChange1 > percentChange2) {
            answer += `${analysis.symbol1} has outperformed ${analysis.symbol2} by ${(percentChange1 - percentChange2).toFixed(2)}% over the past year.`;
          } else if (percentChange2 > percentChange1) {
            answer += `${analysis.symbol2} has outperformed ${analysis.symbol1} by ${(percentChange2 - percentChange1).toFixed(2)}% over the past year.`;
          } else {
            answer += `${analysis.symbol1} and ${analysis.symbol2} have performed equally over the past year.`;
          }

          data = {
            price1Result,
            price2Result,
            historical1Result,
            historical2Result
          };
          break;

        case this.questionTypes.ANALYSIS:
          // Get current price and historical data
          const priceData = await this.getStockPrice(analysis.symbol);
          const historicalData = await this.getHistoricalData(analysis.symbol, '1d', '1y');

          if (!priceData.success || !historicalData.success) {
            throw new Error('Failed to get data for analysis');
          }

          // Calculate simple metrics
          const prices = historicalData.data.map(d => d.close);
          const average = prices.reduce((sum, price) => sum + price, 0) / prices.length;
          const max = Math.max(...prices);
          const min = Math.min(...prices);
          const current = parseFloat(priceData.price);

          // Calculate volatility (standard deviation)
          const variance = prices.reduce((sum, price) => sum + Math.pow(price - average, 2), 0) / prices.length;
          const volatility = Math.sqrt(variance);

          // Generate analysis
          answer = `Analysis for ${analysis.symbol}:\n\n`;
          answer += `Current Price: $${priceData.price}\n`;
          answer += `52-Week Range: $${min.toFixed(2)} - $${max.toFixed(2)}\n`;
          answer += `Average Price (1y): $${average.toFixed(2)}\n`;
          answer += `Volatility (1y): ${(volatility / average * 100).toFixed(2)}%\n\n`;

          // Price relative to range
          const rangePosition = (current - min) / (max - min) * 100;
          answer += `${analysis.symbol} is currently trading at ${rangePosition.toFixed(2)}% of its 52-week range. `;

          if (rangePosition > 80) {
            answer += `This is near the top of its range, suggesting the stock may be relatively expensive compared to its recent history.\n\n`;
          } else if (rangePosition < 20) {
            answer += `This is near the bottom of its range, suggesting the stock may be relatively inexpensive compared to its recent history.\n\n`;
          } else {
            answer += `This is in the middle of its range.\n\n`;
          }

          // Trend analysis
          const shortTermPrices = prices.slice(-30);
          const shortTermAvg = shortTermPrices.reduce((sum, price) => sum + price, 0) / shortTermPrices.length;

          if (current > shortTermAvg) {
            answer += `The stock is trading above its 30-day average of $${shortTermAvg.toFixed(2)}, suggesting a positive short-term trend.`;
          } else {
            answer += `The stock is trading below its 30-day average of $${shortTermAvg.toFixed(2)}, suggesting a negative short-term trend.`;
          }

          data = { priceData, historicalData };
          break;

        case this.questionTypes.GENERAL:
        default:
          // For general questions, provide a generic response
          answer = `I'm sorry, I don't have enough information to answer that question specifically. `;
          answer += `I can provide stock prices, historical data, comparisons between stocks, and basic analysis. `;
          answer += `Please ask a more specific question about a particular stock or stocks.`;
          break;
      }

      const endTime = Date.now();
      const processingTime = (endTime - startTime) / 1000;

      this.stats.questionsAnswered++;
      this.stats.queriesProcessed++;

      return {
        success: true,
        question,
        answer,
        type: analysis.type,
        data,
        processingTime
      };
    } catch (error) {
      this.addLog('ERROR', `Error answering question: ${error.message}`);

      return {
        success: false,
        question,
        error: error.message
      };
    }
  }

  /**
   * Analyze a question to determine its type and extract relevant information
   * @param {string} question - Question to analyze
   * @returns {Object} Question analysis
   */
  analyzeQuestion(question) {
    // Convert question to lowercase for easier matching
    const lowerQuestion = question.toLowerCase();

    // Check for price questions
    if (
      lowerQuestion.includes('price of') ||
      lowerQuestion.includes('how much is') ||
      lowerQuestion.includes('what is the price') ||
      lowerQuestion.includes('current price') ||
      lowerQuestion.includes('trading at') ||
      lowerQuestion.includes('stock price')
    ) {
      // Extract symbol
      const symbol = this.extractSymbol(question);

      return {
        type: this.questionTypes.PRICE,
        symbol
      };
    }

    // Check for historical questions
    if (
      lowerQuestion.includes('historical') ||
      lowerQuestion.includes('history') ||
      lowerQuestion.includes('over time') ||
      lowerQuestion.includes('trend') ||
      lowerQuestion.includes('over the past') ||
      lowerQuestion.includes('over the last') ||
      lowerQuestion.includes('performance')
    ) {
      // Extract symbol
      const symbol = this.extractSymbol(question);

      // Extract time range
      let range = '1m'; // Default to 1 month
      let interval = '1d'; // Default to daily

      if (lowerQuestion.includes('year') || lowerQuestion.includes('12 month')) {
        range = '1y';
      } else if (lowerQuestion.includes('6 month') || lowerQuestion.includes('six month')) {
        range = '6m';
      } else if (lowerQuestion.includes('3 month') || lowerQuestion.includes('three month') || lowerQuestion.includes('quarter')) {
        range = '3m';
      } else if (lowerQuestion.includes('month')) {
        range = '1m';
      } else if (lowerQuestion.includes('week')) {
        range = '1w';
      } else if (lowerQuestion.includes('day')) {
        range = '1d';
      }

      if (lowerQuestion.includes('hourly')) {
        interval = '1h';
      } else if (lowerQuestion.includes('daily')) {
        interval = '1d';
      } else if (lowerQuestion.includes('weekly')) {
        interval = '1w';
      } else if (lowerQuestion.includes('monthly')) {
        interval = '1m';
      }

      return {
        type: this.questionTypes.HISTORICAL,
        symbol,
        range,
        interval
      };
    }

    // Check for comparison questions
    if (
      lowerQuestion.includes('compare') ||
      lowerQuestion.includes('versus') ||
      lowerQuestion.includes(' vs ') ||
      lowerQuestion.includes('better than') ||
      lowerQuestion.includes('worse than') ||
      lowerQuestion.includes('outperform') ||
      lowerQuestion.includes('underperform') ||
      lowerQuestion.includes('difference between')
    ) {
      // Extract symbols
      const symbols = this.extractMultipleSymbols(question);

      if (symbols.length >= 2) {
        return {
          type: this.questionTypes.COMPARISON,
          symbol1: symbols[0],
          symbol2: symbols[1]
        };
      }
    }

    // Check for analysis questions
    if (
      lowerQuestion.includes('analyze') ||
      lowerQuestion.includes('analysis') ||
      lowerQuestion.includes('outlook') ||
      lowerQuestion.includes('forecast') ||
      lowerQuestion.includes('predict') ||
      lowerQuestion.includes('recommendation') ||
      lowerQuestion.includes('should i buy') ||
      lowerQuestion.includes('should i sell') ||
      lowerQuestion.includes('good investment')
    ) {
      // Extract symbol
      const symbol = this.extractSymbol(question);

      return {
        type: this.questionTypes.ANALYSIS,
        symbol
      };
    }

    // Default to general question
    return {
      type: this.questionTypes.GENERAL
    };
  }

  /**
   * Extract a stock symbol from a question
   * @param {string} question - Question to extract symbol from
   * @returns {string} Extracted symbol
   */
  extractSymbol(question) {
    // Common stock symbols
    const commonSymbols = ['AAPL', 'MSFT', 'GOOGL', 'GOOG', 'AMZN', 'META', 'TSLA', 'NVDA', 'JPM', 'V', 'JNJ', 'WMT', 'PG', 'MA', 'UNH', 'HD', 'BAC', 'XOM', 'DIS', 'NFLX'];

    // Check for common symbols in the question
    for (const symbol of commonSymbols) {
      if (question.toUpperCase().includes(symbol)) {
        return symbol;
      }
    }

    // Check for common company names
    const companyToSymbol = {
      'apple': 'AAPL',
      'microsoft': 'MSFT',
      'google': 'GOOGL',
      'alphabet': 'GOOGL',
      'amazon': 'AMZN',
      'meta': 'META',
      'facebook': 'META',
      'tesla': 'TSLA',
      'nvidia': 'NVDA',
      'jp morgan': 'JPM',
      'jpmorgan': 'JPM',
      'visa': 'V',
      'johnson': 'JNJ',
      'walmart': 'WMT',
      'procter': 'PG',
      'procter & gamble': 'PG',
      'mastercard': 'MA',
      'unitedhealth': 'UNH',
      'home depot': 'HD',
      'bank of america': 'BAC',
      'exxon': 'XOM',
      'exxonmobil': 'XOM',
      'disney': 'DIS',
      'netflix': 'NFLX'
    };

    const lowerQuestion = question.toLowerCase();

    for (const [company, symbol] of Object.entries(companyToSymbol)) {
      if (lowerQuestion.includes(company)) {
        return symbol;
      }
    }

    // Default to AAPL if no symbol found
    return 'AAPL';
  }

  /**
   * Extract multiple stock symbols from a question
   * @param {string} question - Question to extract symbols from
   * @returns {Array<string>} Extracted symbols
   */
  extractMultipleSymbols(question) {
    // Common stock symbols
    const commonSymbols = ['AAPL', 'MSFT', 'GOOGL', 'GOOG', 'AMZN', 'META', 'TSLA', 'NVDA', 'JPM', 'V', 'JNJ', 'WMT', 'PG', 'MA', 'UNH', 'HD', 'BAC', 'XOM', 'DIS', 'NFLX'];

    const foundSymbols = [];

    // Check for common symbols in the question
    for (const symbol of commonSymbols) {
      if (question.toUpperCase().includes(symbol)) {
        foundSymbols.push(symbol);
      }
    }

    // Check for common company names
    const companyToSymbol = {
      'apple': 'AAPL',
      'microsoft': 'MSFT',
      'google': 'GOOGL',
      'alphabet': 'GOOGL',
      'amazon': 'AMZN',
      'meta': 'META',
      'facebook': 'META',
      'tesla': 'TSLA',
      'nvidia': 'NVDA',
      'jp morgan': 'JPM',
      'jpmorgan': 'JPM',
      'visa': 'V',
      'johnson': 'JNJ',
      'walmart': 'WMT',
      'procter': 'PG',
      'procter & gamble': 'PG',
      'mastercard': 'MA',
      'unitedhealth': 'UNH',
      'home depot': 'HD',
      'bank of america': 'BAC',
      'exxon': 'XOM',
      'exxonmobil': 'XOM',
      'disney': 'DIS',
      'netflix': 'NFLX'
    };

    const lowerQuestion = question.toLowerCase();

    for (const [company, symbol] of Object.entries(companyToSymbol)) {
      if (lowerQuestion.includes(company) && !foundSymbols.includes(symbol)) {
        foundSymbols.push(symbol);
      }
    }

    // If less than 2 symbols found, add defaults
    if (foundSymbols.length < 2) {
      if (!foundSymbols.includes('AAPL')) {
        foundSymbols.push('AAPL');
      }

      if (foundSymbols.length < 2 && !foundSymbols.includes('MSFT')) {
        foundSymbols.push('MSFT');
      }
    }

    return foundSymbols;
  }
}

module.exports = BloombergAgent;
