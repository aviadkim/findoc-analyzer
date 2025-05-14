/**
 * Performance Metrics Extractor
 * 
 * This module extracts performance metrics from financial PDFs.
 */

/**
 * Extract performance metrics from tables and text
 * @param {Array} tables - Extracted tables
 * @param {string} text - Full text content of the PDF
 * @returns {object} - Extracted performance metrics
 */
function extractPerformanceMetrics(tables, text) {
  console.log('Extracting performance metrics...');
  
  // Initialize performance metrics
  const performanceMetrics = {
    ytd: null,
    oneMonth: null,
    threeMonth: null,
    sixMonth: null,
    oneYear: null,
    threeYear: null,
    fiveYear: null,
    tenYear: null,
    sinceInception: null
  };
  
  // Try to extract performance metrics from tables
  const metricsFromTables = extractPerformanceMetricsFromTables(tables);
  
  // Merge metrics
  Object.assign(performanceMetrics, metricsFromTables);
  
  // If we're missing metrics, try to extract from text
  if (Object.values(performanceMetrics).every(v => v === null)) {
    const metricsFromText = extractPerformanceMetricsFromText(text);
    Object.assign(performanceMetrics, metricsFromText);
  }
  
  console.log('Extracted performance metrics:', performanceMetrics);
  
  return performanceMetrics;
}

/**
 * Extract performance metrics from tables
 * @param {Array} tables - Extracted tables
 * @returns {object} - Extracted performance metrics
 */
function extractPerformanceMetricsFromTables(tables) {
  const performanceMetrics = {
    ytd: null,
    oneMonth: null,
    threeMonth: null,
    sixMonth: null,
    oneYear: null,
    threeYear: null,
    fiveYear: null,
    tenYear: null,
    sinceInception: null
  };
  
  // Find performance tables
  const performanceTables = tables.filter(table => {
    const title = table.title ? table.title.toLowerCase() : '';
    const headers = table.headers.map(h => h.toLowerCase());
    
    return (
      title.includes('performance') || 
      title.includes('return') || 
      title.includes('result') ||
      headers.some(h => 
        h.includes('performance') || 
        h.includes('return') || 
        h.includes('period') ||
        h.includes('ytd') ||
        h.includes('1y') ||
        h.includes('3y') ||
        h.includes('5y') ||
        h.includes('10y')
      )
    );
  });
  
  if (performanceTables.length === 0) {
    return performanceMetrics;
  }
  
  // Process each performance table
  for (const table of performanceTables) {
    // Check if the table has a period column and a return column
    const periodColIndex = findColumnIndex(table.headers, [
      'period', 'time frame', 'duration', 'term'
    ]);
    
    const returnColIndex = findColumnIndex(table.headers, [
      'return', 'performance', 'result', '%'
    ]);
    
    if (periodColIndex !== -1 && returnColIndex !== -1) {
      // Table has period and return columns
      for (const row of table.rows) {
        // Skip rows that don't have enough columns
        if (row.length <= Math.max(periodColIndex, returnColIndex)) {
          continue;
        }
        
        const period = row[periodColIndex].toLowerCase();
        const returnValue = parsePercentage(row[returnColIndex]);
        
        // Map period to performance metric
        if (period.includes('ytd') || period.includes('year to date')) {
          performanceMetrics.ytd = returnValue;
        } else if (period.includes('1m') || period.includes('one month') || period.includes('1 month')) {
          performanceMetrics.oneMonth = returnValue;
        } else if (period.includes('3m') || period.includes('three month') || period.includes('3 month')) {
          performanceMetrics.threeMonth = returnValue;
        } else if (period.includes('6m') || period.includes('six month') || period.includes('6 month')) {
          performanceMetrics.sixMonth = returnValue;
        } else if (period.includes('1y') || period.includes('one year') || period.includes('1 year')) {
          performanceMetrics.oneYear = returnValue;
        } else if (period.includes('3y') || period.includes('three year') || period.includes('3 year')) {
          performanceMetrics.threeYear = returnValue;
        } else if (period.includes('5y') || period.includes('five year') || period.includes('5 year')) {
          performanceMetrics.fiveYear = returnValue;
        } else if (period.includes('10y') || period.includes('ten year') || period.includes('10 year')) {
          performanceMetrics.tenYear = returnValue;
        } else if (period.includes('inception') || period.includes('since inception')) {
          performanceMetrics.sinceInception = returnValue;
        }
      }
    } else {
      // Table might have performance metrics as columns
      const ytdColIndex = findColumnIndex(table.headers, ['ytd', 'year to date']);
      const oneMonthColIndex = findColumnIndex(table.headers, ['1m', 'one month', '1 month']);
      const threeMonthColIndex = findColumnIndex(table.headers, ['3m', 'three month', '3 month']);
      const sixMonthColIndex = findColumnIndex(table.headers, ['6m', 'six month', '6 month']);
      const oneYearColIndex = findColumnIndex(table.headers, ['1y', 'one year', '1 year']);
      const threeYearColIndex = findColumnIndex(table.headers, ['3y', 'three year', '3 year']);
      const fiveYearColIndex = findColumnIndex(table.headers, ['5y', 'five year', '5 year']);
      const tenYearColIndex = findColumnIndex(table.headers, ['10y', 'ten year', '10 year']);
      const sinceInceptionColIndex = findColumnIndex(table.headers, ['inception', 'since inception']);
      
      // Find the row with the portfolio or fund performance
      let performanceRowIndex = -1;
      
      for (let i = 0; i < table.rows.length; i++) {
        const row = table.rows[i];
        
        if (row.length > 0) {
          const firstCell = row[0].toLowerCase();
          
          if (firstCell.includes('portfolio') || 
              firstCell.includes('fund') || 
              firstCell.includes('total') || 
              firstCell.includes('performance')) {
            performanceRowIndex = i;
            break;
          }
        }
      }
      
      // If we found a performance row, extract the metrics
      if (performanceRowIndex !== -1) {
        const row = table.rows[performanceRowIndex];
        
        if (ytdColIndex !== -1 && ytdColIndex < row.length) {
          performanceMetrics.ytd = parsePercentage(row[ytdColIndex]);
        }
        
        if (oneMonthColIndex !== -1 && oneMonthColIndex < row.length) {
          performanceMetrics.oneMonth = parsePercentage(row[oneMonthColIndex]);
        }
        
        if (threeMonthColIndex !== -1 && threeMonthColIndex < row.length) {
          performanceMetrics.threeMonth = parsePercentage(row[threeMonthColIndex]);
        }
        
        if (sixMonthColIndex !== -1 && sixMonthColIndex < row.length) {
          performanceMetrics.sixMonth = parsePercentage(row[sixMonthColIndex]);
        }
        
        if (oneYearColIndex !== -1 && oneYearColIndex < row.length) {
          performanceMetrics.oneYear = parsePercentage(row[oneYearColIndex]);
        }
        
        if (threeYearColIndex !== -1 && threeYearColIndex < row.length) {
          performanceMetrics.threeYear = parsePercentage(row[threeYearColIndex]);
        }
        
        if (fiveYearColIndex !== -1 && fiveYearColIndex < row.length) {
          performanceMetrics.fiveYear = parsePercentage(row[fiveYearColIndex]);
        }
        
        if (tenYearColIndex !== -1 && tenYearColIndex < row.length) {
          performanceMetrics.tenYear = parsePercentage(row[tenYearColIndex]);
        }
        
        if (sinceInceptionColIndex !== -1 && sinceInceptionColIndex < row.length) {
          performanceMetrics.sinceInception = parsePercentage(row[sinceInceptionColIndex]);
        }
      } else {
        // If we didn't find a specific performance row, use the first row
        if (table.rows.length > 0) {
          const row = table.rows[0];
          
          if (ytdColIndex !== -1 && ytdColIndex < row.length) {
            performanceMetrics.ytd = parsePercentage(row[ytdColIndex]);
          }
          
          if (oneMonthColIndex !== -1 && oneMonthColIndex < row.length) {
            performanceMetrics.oneMonth = parsePercentage(row[oneMonthColIndex]);
          }
          
          if (threeMonthColIndex !== -1 && threeMonthColIndex < row.length) {
            performanceMetrics.threeMonth = parsePercentage(row[threeMonthColIndex]);
          }
          
          if (sixMonthColIndex !== -1 && sixMonthColIndex < row.length) {
            performanceMetrics.sixMonth = parsePercentage(row[sixMonthColIndex]);
          }
          
          if (oneYearColIndex !== -1 && oneYearColIndex < row.length) {
            performanceMetrics.oneYear = parsePercentage(row[oneYearColIndex]);
          }
          
          if (threeYearColIndex !== -1 && threeYearColIndex < row.length) {
            performanceMetrics.threeYear = parsePercentage(row[threeYearColIndex]);
          }
          
          if (fiveYearColIndex !== -1 && fiveYearColIndex < row.length) {
            performanceMetrics.fiveYear = parsePercentage(row[fiveYearColIndex]);
          }
          
          if (tenYearColIndex !== -1 && tenYearColIndex < row.length) {
            performanceMetrics.tenYear = parsePercentage(row[tenYearColIndex]);
          }
          
          if (sinceInceptionColIndex !== -1 && sinceInceptionColIndex < row.length) {
            performanceMetrics.sinceInception = parsePercentage(row[sinceInceptionColIndex]);
          }
        }
      }
    }
  }
  
  return performanceMetrics;
}

/**
 * Extract performance metrics from text
 * @param {string} text - Full text content of the PDF
 * @returns {object} - Extracted performance metrics
 */
function extractPerformanceMetricsFromText(text) {
  const performanceMetrics = {
    ytd: null,
    oneMonth: null,
    threeMonth: null,
    sixMonth: null,
    oneYear: null,
    threeYear: null,
    fiveYear: null,
    tenYear: null,
    sinceInception: null
  };
  
  // Look for performance section
  const performanceMatch = text.match(/Performance.*?(?=\n\n|\n[A-Z]|$)/s);
  
  if (!performanceMatch) {
    return performanceMetrics;
  }
  
  const performanceText = performanceMatch[0];
  
  // Look for performance metrics
  const ytdMatch = performanceText.match(/YTD.*?(-?\d+(?:\.\d+)?)%/i);
  const oneMonthMatch = performanceText.match(/1[- ]Month.*?(-?\d+(?:\.\d+)?)%/i);
  const threeMonthMatch = performanceText.match(/3[- ]Month.*?(-?\d+(?:\.\d+)?)%/i);
  const sixMonthMatch = performanceText.match(/6[- ]Month.*?(-?\d+(?:\.\d+)?)%/i);
  const oneYearMatch = performanceText.match(/1[- ]Year.*?(-?\d+(?:\.\d+)?)%/i);
  const threeYearMatch = performanceText.match(/3[- ]Year.*?(-?\d+(?:\.\d+)?)%/i);
  const fiveYearMatch = performanceText.match(/5[- ]Year.*?(-?\d+(?:\.\d+)?)%/i);
  const tenYearMatch = performanceText.match(/10[- ]Year.*?(-?\d+(?:\.\d+)?)%/i);
  const sinceInceptionMatch = performanceText.match(/Since[- ]Inception.*?(-?\d+(?:\.\d+)?)%/i);
  
  if (ytdMatch) {
    performanceMetrics.ytd = parseFloat(ytdMatch[1]);
  }
  
  if (oneMonthMatch) {
    performanceMetrics.oneMonth = parseFloat(oneMonthMatch[1]);
  }
  
  if (threeMonthMatch) {
    performanceMetrics.threeMonth = parseFloat(threeMonthMatch[1]);
  }
  
  if (sixMonthMatch) {
    performanceMetrics.sixMonth = parseFloat(sixMonthMatch[1]);
  }
  
  if (oneYearMatch) {
    performanceMetrics.oneYear = parseFloat(oneYearMatch[1]);
  }
  
  if (threeYearMatch) {
    performanceMetrics.threeYear = parseFloat(threeYearMatch[1]);
  }
  
  if (fiveYearMatch) {
    performanceMetrics.fiveYear = parseFloat(fiveYearMatch[1]);
  }
  
  if (tenYearMatch) {
    performanceMetrics.tenYear = parseFloat(tenYearMatch[1]);
  }
  
  if (sinceInceptionMatch) {
    performanceMetrics.sinceInception = parseFloat(sinceInceptionMatch[1]);
  }
  
  return performanceMetrics;
}

/**
 * Find column index in headers
 * @param {Array} headers - Table headers
 * @param {Array} keywords - Keywords to look for
 * @returns {number} - Column index or -1 if not found
 */
function findColumnIndex(headers, keywords) {
  for (let i = 0; i < headers.length; i++) {
    const header = headers[i].toLowerCase();
    
    if (keywords.some(keyword => header.includes(keyword.toLowerCase()))) {
      return i;
    }
  }
  
  return -1;
}

/**
 * Parse percentage from string
 * @param {string} value - String to parse
 * @returns {number|null} - Parsed percentage or null if parsing failed
 */
function parsePercentage(value) {
  if (!value) return null;
  
  // Remove % symbol
  const cleanValue = value.toString().replace(/%/g, '');
  
  // Try to parse as number
  const number = parseFloat(cleanValue);
  
  return isNaN(number) ? null : number;
}

module.exports = {
  extractPerformanceMetrics,
  parsePercentage
};
