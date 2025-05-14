/**
 * Financial Data Extractor
 *
 * This service extracts financial data from PDF text and tables.
 */

/**
 * Extract financial data from PDF text and tables
 * @param {string} text - Extracted text from the PDF
 * @param {Array} tables - Extracted tables from the PDF
 * @returns {object} - Extracted financial data
 */
async function extractFinancialData(text, tables) {
  try {
    console.log('Extracting financial data');
    console.log('Text length:', text.length);
    console.log('Number of tables:', tables.length);

    // Extract portfolio information
    const portfolioInfo = extractPortfolioInfo(text);

    // Extract asset allocation
    const assetAllocation = extractAssetAllocation(tables, text);

    // Extract securities
    const securities = extractSecurities(tables, text);

    // Extract performance metrics
    const performance = extractPerformanceMetrics(tables, text);

    // Extract ISINs from text if no securities were found
    if (securities.length === 0) {
      console.log('No securities found, searching for ISINs in text');

      // Look for ISINs in the text
      const isinMatches = [...text.matchAll(/[A-Z]{2}[A-Z0-9]{10}/g)];

      isinMatches.forEach(match => {
        const isin = match[0];

        // Check if this is a valid ISIN (basic check)
        if (isValidISIN(isin)) {
          securities.push({
            name: `Security with ISIN ${isin}`,
            type: 'unknown',
            quantity: null,
            price: null,
            value: null,
            percentage: null,
            isin
          });
        }
      });
    }

    const result = {
      portfolioInfo,
      assetAllocation,
      securities,
      performance
    };

    console.log('Extracted financial data:', JSON.stringify(result, null, 2));

    return result;
  } catch (error) {
    console.error('Error extracting financial data:', error);
    throw error;
  }
}

/**
 * Check if an ISIN is valid (basic check)
 * @param {string} isin - ISIN to check
 * @returns {boolean} - Whether the ISIN is valid
 */
function isValidISIN(isin) {
  // Basic check: 2 letters followed by 10 characters (letters or numbers)
  if (!/^[A-Z]{2}[A-Z0-9]{10}$/.test(isin)) {
    return false;
  }

  // Check if the first two letters are a valid country code
  const countryCode = isin.substring(0, 2);
  const validCountryCodes = [
    'AD', 'AE', 'AF', 'AG', 'AI', 'AL', 'AM', 'AO', 'AQ', 'AR', 'AS', 'AT', 'AU', 'AW', 'AX', 'AZ',
    'BA', 'BB', 'BD', 'BE', 'BF', 'BG', 'BH', 'BI', 'BJ', 'BL', 'BM', 'BN', 'BO', 'BQ', 'BR', 'BS',
    'BT', 'BV', 'BW', 'BY', 'BZ', 'CA', 'CC', 'CD', 'CF', 'CG', 'CH', 'CI', 'CK', 'CL', 'CM', 'CN',
    'CO', 'CR', 'CU', 'CV', 'CW', 'CX', 'CY', 'CZ', 'DE', 'DJ', 'DK', 'DM', 'DO', 'DZ', 'EC', 'EE',
    'EG', 'EH', 'ER', 'ES', 'ET', 'FI', 'FJ', 'FK', 'FM', 'FO', 'FR', 'GA', 'GB', 'GD', 'GE', 'GF',
    'GG', 'GH', 'GI', 'GL', 'GM', 'GN', 'GP', 'GQ', 'GR', 'GS', 'GT', 'GU', 'GW', 'GY', 'HK', 'HM',
    'HN', 'HR', 'HT', 'HU', 'ID', 'IE', 'IL', 'IM', 'IN', 'IO', 'IQ', 'IR', 'IS', 'IT', 'JE', 'JM',
    'JO', 'JP', 'KE', 'KG', 'KH', 'KI', 'KM', 'KN', 'KP', 'KR', 'KW', 'KY', 'KZ', 'LA', 'LB', 'LC',
    'LI', 'LK', 'LR', 'LS', 'LT', 'LU', 'LV', 'LY', 'MA', 'MC', 'MD', 'ME', 'MF', 'MG', 'MH', 'MK',
    'ML', 'MM', 'MN', 'MO', 'MP', 'MQ', 'MR', 'MS', 'MT', 'MU', 'MV', 'MW', 'MX', 'MY', 'MZ', 'NA',
    'NC', 'NE', 'NF', 'NG', 'NI', 'NL', 'NO', 'NP', 'NR', 'NU', 'NZ', 'OM', 'PA', 'PE', 'PF', 'PG',
    'PH', 'PK', 'PL', 'PM', 'PN', 'PR', 'PS', 'PT', 'PW', 'PY', 'QA', 'RE', 'RO', 'RS', 'RU', 'RW',
    'SA', 'SB', 'SC', 'SD', 'SE', 'SG', 'SH', 'SI', 'SJ', 'SK', 'SL', 'SM', 'SN', 'SO', 'SR', 'SS',
    'ST', 'SV', 'SX', 'SY', 'SZ', 'TC', 'TD', 'TF', 'TG', 'TH', 'TJ', 'TK', 'TL', 'TM', 'TN', 'TO',
    'TR', 'TT', 'TV', 'TW', 'TZ', 'UA', 'UG', 'UM', 'US', 'UY', 'UZ', 'VA', 'VC', 'VE', 'VG', 'VI',
    'VN', 'VU', 'WF', 'WS', 'YE', 'YT', 'ZA', 'ZM', 'ZW'
  ];

  return validCountryCodes.includes(countryCode);
}

/**
 * Extract portfolio information from text
 * @param {string} text - Extracted text from the PDF
 * @returns {object} - Portfolio information
 */
function extractPortfolioInfo(text) {
  console.log('Extracting portfolio information');

  // Initialize portfolio info
  const portfolioInfo = {
    title: '',
    date: '',
    totalValue: null,
    currency: 'USD',
    owner: '',
    manager: ''
  };

  // Log the first 500 characters of text for debugging
  console.log('Text sample:', text.substring(0, 500));

  // Extract title - try multiple patterns
  let titleMatch = text.match(/([A-Z][A-Za-z\s]+)(?:Portfolio|Report|Valuation|Statement)/);
  if (titleMatch) {
    portfolioInfo.title = titleMatch[0].trim();
  } else {
    // Try to find any capitalized text that might be a title
    titleMatch = text.match(/([A-Z][A-Za-z\s]{2,30})\s*(?:\r|\n)/);
    if (titleMatch) {
      portfolioInfo.title = titleMatch[1].trim();
    }
  }

  // Extract date - try multiple patterns
  let dateMatch = text.match(/(?:as of|dated|date:?|valuation date)\s+(\d{1,2}[\/\.\-]\d{1,2}[\/\.\-]\d{2,4}|\d{1,2}\s+[A-Za-z]+\s+\d{2,4}|[A-Za-z]+\s+\d{1,2},?\s+\d{2,4})/i);
  if (dateMatch) {
    portfolioInfo.date = dateMatch[1].trim();
  } else {
    // Try to find any date-like pattern
    dateMatch = text.match(/(\d{1,2}[\/\.\-]\d{1,2}[\/\.\-]\d{2,4})/);
    if (dateMatch) {
      portfolioInfo.date = dateMatch[1].trim();
    }
  }

  // Extract total value - try multiple patterns
  let valueMatch = text.match(/(?:total|portfolio|value|worth|amount|sum)(?:\s+value)?(?:\s+of)?\s*[:=]?\s*[$€£¥]?([0-9,]+(?:\.[0-9]{2})?)\s*(?:USD|EUR|GBP|JPY|CHF|ALL)?/i);
  if (valueMatch) {
    portfolioInfo.totalValue = parseFloat(valueMatch[1].replace(/,/g, ''));
  } else {
    // Try to find any currency amount that might be the total
    valueMatch = text.match(/[$€£¥]([0-9,]+(?:\.[0-9]{2})?)/);
    if (valueMatch) {
      portfolioInfo.totalValue = parseFloat(valueMatch[1].replace(/,/g, ''));
    } else {
      // Try to find any number followed by a currency code
      valueMatch = text.match(/([0-9,]+(?:\.[0-9]{2})?)\s*(?:USD|EUR|GBP|JPY|CHF|ALL)/i);
      if (valueMatch) {
        portfolioInfo.totalValue = parseFloat(valueMatch[1].replace(/,/g, ''));
      }
    }
  }

  // Extract currency - try multiple patterns
  let currencyMatch = text.match(/(?:currency|denominated in|valued in)\s*[:=]?\s*([A-Z]{3})/i);
  if (currencyMatch) {
    portfolioInfo.currency = currencyMatch[1].trim();
  } else {
    // Try to find currency codes
    if (text.includes('USD') || text.includes('$')) {
      portfolioInfo.currency = 'USD';
    } else if (text.includes('EUR') || text.includes('€')) {
      portfolioInfo.currency = 'EUR';
    } else if (text.includes('GBP') || text.includes('£')) {
      portfolioInfo.currency = 'GBP';
    } else if (text.includes('JPY') || text.includes('¥')) {
      portfolioInfo.currency = 'JPY';
    } else if (text.includes('CHF')) {
      portfolioInfo.currency = 'CHF';
    } else if (text.includes('ALL')) {
      portfolioInfo.currency = 'ALL';
    }
  }

  // Extract owner - try multiple patterns
  let ownerMatch = text.match(/(?:owner|client|investor|account holder)(?:\s+name)?(?:\s+is)?\s*[:=]?\s*([A-Z][A-Za-z\s]+)(?:\r|\n|,)/i);
  if (ownerMatch) {
    portfolioInfo.owner = ownerMatch[1].trim();
  } else {
    // Try to find any name-like pattern
    ownerMatch = text.match(/(?:name|client):\s*([A-Z][A-Za-z\s]+)(?:\r|\n|,)/i);
    if (ownerMatch) {
      portfolioInfo.owner = ownerMatch[1].trim();
    }
  }

  // Extract manager - try multiple patterns
  let managerMatch = text.match(/(?:manager|advisor|portfolio manager)(?:\s+name)?(?:\s+is)?\s*[:=]?\s*([A-Z][A-Za-z\s]+)(?:\r|\n|,)/i);
  if (managerMatch) {
    portfolioInfo.manager = managerMatch[1].trim();
  }

  // Log extracted info for debugging
  console.log('Extracted portfolio info:', portfolioInfo);

  return portfolioInfo;
}

/**
 * Extract asset allocation from tables or text
 * @param {Array} tables - Extracted tables from the PDF
 * @param {string} text - Full text of the PDF
 * @returns {object} - Asset allocation
 */
function extractAssetAllocation(tables, text) {
  console.log('Extracting asset allocation');

  // Initialize asset allocation
  const assetAllocation = {
    categories: [],
    total: 0
  };

  // Find asset allocation table
  const allocationTable = tables.find(table => {
    const title = table.title ? table.title.toLowerCase() : '';
    const headers = table.headers.map(h => h.toLowerCase());

    return (
      title.includes('asset') && title.includes('allocation') ||
      title.includes('portfolio') && title.includes('allocation') ||
      headers.some(h => h.includes('asset') || h.includes('class')) &&
      headers.some(h => h.includes('allocation') || h.includes('weight') || h.includes('percentage') || h.includes('%'))
    );
  });

  if (allocationTable) {
    console.log('Found asset allocation table:', allocationTable.title || 'Untitled');
    console.log('Headers:', allocationTable.headers);

    // Determine column indices
    const categoryColIndex = allocationTable.headers.findIndex(h =>
      h.toLowerCase().includes('asset') ||
      h.toLowerCase().includes('class') ||
      h.toLowerCase().includes('category')
    );

    const percentColIndex = allocationTable.headers.findIndex(h =>
      h.toLowerCase().includes('allocation') ||
      h.toLowerCase().includes('weight') ||
      h.toLowerCase().includes('percentage') ||
      h.toLowerCase().includes('%')
    );

    const valueColIndex = allocationTable.headers.findIndex(h =>
      h.toLowerCase().includes('value') ||
      h.toLowerCase().includes('amount') ||
      h.toLowerCase().includes('balance')
    );

    console.log('Column indices:', {
      category: categoryColIndex,
      percent: percentColIndex,
      value: valueColIndex
    });

    // Extract categories
    if (categoryColIndex !== -1 && (percentColIndex !== -1 || valueColIndex !== -1)) {
      allocationTable.rows.forEach(row => {
        if (row.length <= categoryColIndex) {
          console.log('Skipping row with insufficient columns:', row);
          return;
        }

        const category = row[categoryColIndex];

        // Skip total rows
        if (!category || category.toLowerCase().includes('total')) {
          return;
        }

        const percentage = percentColIndex !== -1 && percentColIndex < row.length ? parsePercentage(row[percentColIndex]) : null;
        const value = valueColIndex !== -1 && valueColIndex < row.length ? parseAmount(row[valueColIndex]) : null;

        assetAllocation.categories.push({
          name: category,
          percentage,
          value
        });
      });

      // Calculate total
      if (valueColIndex !== -1) {
        assetAllocation.total = assetAllocation.categories.reduce((sum, cat) => sum + (cat.value || 0), 0);
      }
    }
  } else {
    console.log('No asset allocation table found, trying to extract from text');

    // Try to extract asset allocation from text
    // Look for patterns like "Asset Allocation" followed by asset classes and percentages
    const assetAllocationMatch = text.match(/Asset\s+Allocation.*?(?=\n\n|\n[A-Z]|$)/s);

    if (assetAllocationMatch) {
      const assetAllocationText = assetAllocationMatch[0];
      console.log('Found asset allocation text:', assetAllocationText);

      // Look for asset classes and percentages
      const assetClassMatches = [...assetAllocationText.matchAll(/([A-Za-z\s]+)(?:\s+|:)(\d+)%(?:\s+|\$|€|£|¥)(?:\$|€|£|¥)?([0-9,.]+)/g)];

      if (assetClassMatches.length > 0) {
        assetClassMatches.forEach(match => {
          const name = match[1].trim();
          const percentage = parseFloat(match[2]);
          const value = parseAmount(match[3]);

          assetAllocation.categories.push({
            name,
            percentage,
            value
          });
        });

        // Calculate total
        assetAllocation.total = assetAllocation.categories.reduce((sum, cat) => sum + (cat.value || 0), 0);
      } else {
        // Try another pattern: asset class followed by percentage
        const simpleAssetClassMatches = [...assetAllocationText.matchAll(/([A-Za-z\s]+)(?:\s+|:)(\d+)%/g)];

        if (simpleAssetClassMatches.length > 0) {
          simpleAssetClassMatches.forEach(match => {
            const name = match[1].trim();
            const percentage = parseFloat(match[2]);

            assetAllocation.categories.push({
              name,
              percentage,
              value: null
            });
          });
        }
      }
    }
  }

  console.log(`Extracted ${assetAllocation.categories.length} asset allocation categories`);

  return assetAllocation;
}

/**
 * Extract securities from tables and text
 * @param {Array} tables - Extracted tables from the PDF
 * @param {string} text - Full text of the PDF
 * @returns {Array} - Securities
 */
function extractSecurities(tables, text) {
  console.log('Extracting securities');

  // Initialize securities
  const securities = [];

  // Find securities table
  const securitiesTable = tables.find(table => {
    const title = table.title ? table.title.toLowerCase() : '';
    const headers = table.headers.map(h => h.toLowerCase());

    return (
      title.includes('holding') || title.includes('position') || title.includes('security') || title.includes('securities') ||
      headers.some(h => h.includes('security') || h.includes('holding') || h.includes('position') || h.includes('instrument')) &&
      headers.some(h => h.includes('value') || h.includes('amount') || h.includes('quantity') || h.includes('price') || h.includes('weight'))
    );
  });

  if (securitiesTable) {
    console.log('Found securities table:', securitiesTable.title || 'Untitled');
    console.log('Headers:', securitiesTable.headers);

    // Determine column indices
    const nameColIndex = securitiesTable.headers.findIndex(h =>
      h.toLowerCase().includes('security') ||
      h.toLowerCase().includes('holding') ||
      h.toLowerCase().includes('position') ||
      h.toLowerCase().includes('name') ||
      h.toLowerCase().includes('instrument') ||
      h.toLowerCase().includes('description')
    );

    const typeColIndex = securitiesTable.headers.findIndex(h =>
      h.toLowerCase().includes('type') ||
      h.toLowerCase().includes('asset') ||
      h.toLowerCase().includes('class') ||
      h.toLowerCase().includes('category')
    );

    const quantityColIndex = securitiesTable.headers.findIndex(h =>
      h.toLowerCase().includes('quantity') ||
      h.toLowerCase().includes('shares') ||
      h.toLowerCase().includes('units') ||
      h.toLowerCase().includes('amount') ||
      h.toLowerCase().includes('number')
    );

    const priceColIndex = securitiesTable.headers.findIndex(h =>
      h.toLowerCase().includes('price') ||
      h.toLowerCase().includes('rate') ||
      h.toLowerCase().includes('nav') ||
      h.toLowerCase().includes('value per')
    );

    const valueColIndex = securitiesTable.headers.findIndex(h =>
      h.toLowerCase().includes('value') ||
      h.toLowerCase().includes('amount') ||
      h.toLowerCase().includes('balance') ||
      h.toLowerCase().includes('market') ||
      h.toLowerCase().includes('total')
    );

    const percentColIndex = securitiesTable.headers.findIndex(h =>
      h.toLowerCase().includes('percentage') ||
      h.toLowerCase().includes('weight') ||
      h.toLowerCase().includes('%') ||
      h.toLowerCase().includes('allocation')
    );

    const isinColIndex = securitiesTable.headers.findIndex(h =>
      h.toLowerCase().includes('isin') ||
      h.toLowerCase().includes('identifier') ||
      h.toLowerCase().includes('id') ||
      h.toLowerCase().includes('code')
    );

    console.log('Column indices:', {
      name: nameColIndex,
      type: typeColIndex,
      quantity: quantityColIndex,
      price: priceColIndex,
      value: valueColIndex,
      percent: percentColIndex,
      isin: isinColIndex
    });

    // Extract securities
    if (nameColIndex !== -1) {
      securitiesTable.rows.forEach(row => {
        if (row.length <= nameColIndex) {
          console.log('Skipping row with insufficient columns:', row);
          return;
        }

        const name = row[nameColIndex];

        // Skip total rows
        if (!name || name.toLowerCase().includes('total')) {
          return;
        }

        const security = {
          name,
          type: typeColIndex !== -1 && typeColIndex < row.length ? row[typeColIndex] : inferSecurityType(name),
          quantity: quantityColIndex !== -1 && quantityColIndex < row.length ? parseAmount(row[quantityColIndex]) : null,
          price: priceColIndex !== -1 && priceColIndex < row.length ? parseAmount(row[priceColIndex]) : null,
          value: valueColIndex !== -1 && valueColIndex < row.length ? parseAmount(row[valueColIndex]) : null,
          percentage: percentColIndex !== -1 && percentColIndex < row.length ? parsePercentage(row[percentColIndex]) : null,
          isin: isinColIndex !== -1 && isinColIndex < row.length ? row[isinColIndex] : extractISIN(name)
        };

        securities.push(security);
      });
    }
  } else {
    console.log('No securities table found, trying to extract from text');

    // Try to extract securities from text if no table found
    // Look for patterns like "ISIN: XX0000000000" or "Security Name (ISIN: XX0000000000)"
    const isinMatches = [...text.matchAll(/(?:ISIN|International Securities Identification Number)[\s:]*([A-Z]{2}[A-Z0-9]{10})/gi)];

    isinMatches.forEach(match => {
      const isin = match[1];

      // Try to find the security name by looking at the text before the ISIN
      const beforeIsin = text.substring(Math.max(0, match.index - 100), match.index);
      const nameMatch = beforeIsin.match(/([A-Z][A-Za-z0-9\s\.\,\-\&]{5,50})(?:\s*\(|\s*$|\s*,)/);

      const name = nameMatch ? nameMatch[1].trim() : `Security with ISIN ${isin}`;

      // Check if we already have this security
      if (!securities.some(s => s.isin === isin)) {
        securities.push({
          name,
          type: inferSecurityType(name),
          quantity: null,
          price: null,
          value: null,
          percentage: null,
          isin
        });
      }
    });
  }

  console.log(`Extracted ${securities.length} securities`);

  return securities;
}

/**
 * Extract performance metrics from tables and text
 * @param {Array} tables - Extracted tables from the PDF
 * @param {string} text - Extracted text from the PDF
 * @returns {object} - Performance metrics
 */
function extractPerformanceMetrics(tables, text) {
  console.log('Extracting performance metrics');

  // Initialize performance metrics
  const performance = {
    ytd: null,
    oneYear: null,
    threeYear: null,
    fiveYear: null,
    tenYear: null,
    sinceInception: null
  };

  // Find performance table
  const performanceTable = tables.find(table => {
    const title = table.title.toLowerCase();
    const headers = table.headers.map(h => h.toLowerCase());

    return (
      title.includes('performance') || title.includes('return') ||
      headers.some(h => h.includes('period') || h.includes('time')) &&
      headers.some(h => h.includes('return') || h.includes('performance') || h.includes('%'))
    );
  });

  if (performanceTable) {
    // Determine column indices
    const periodColIndex = performanceTable.headers.findIndex(h =>
      h.toLowerCase().includes('period') ||
      h.toLowerCase().includes('time') ||
      h.toLowerCase().includes('term')
    );

    const returnColIndex = performanceTable.headers.findIndex(h =>
      h.toLowerCase().includes('return') ||
      h.toLowerCase().includes('performance') ||
      h.toLowerCase().includes('%')
    );

    // Extract performance metrics
    if (periodColIndex !== -1 && returnColIndex !== -1) {
      performanceTable.rows.forEach(row => {
        const period = row[periodColIndex].toLowerCase();
        const returnValue = parsePercentage(row[returnColIndex]);

        if (period.includes('ytd') || period.includes('year to date')) {
          performance.ytd = returnValue;
        } else if (period.includes('1 year') || period.includes('one year') || period.includes('1-year') || period.includes('1yr')) {
          performance.oneYear = returnValue;
        } else if (period.includes('3 year') || period.includes('three year') || period.includes('3-year') || period.includes('3yr')) {
          performance.threeYear = returnValue;
        } else if (period.includes('5 year') || period.includes('five year') || period.includes('5-year') || period.includes('5yr')) {
          performance.fiveYear = returnValue;
        } else if (period.includes('10 year') || period.includes('ten year') || period.includes('10-year') || period.includes('10yr')) {
          performance.tenYear = returnValue;
        } else if (period.includes('inception')) {
          performance.sinceInception = returnValue;
        }
      });
    }
  } else {
    // Try to extract from text if no table found
    const ytdMatch = text.match(/ytd(?:\s+return|\s+performance)?\s*[:=]?\s*([\-+]?[0-9]+(?:\.[0-9]+)?)%/i);
    if (ytdMatch) {
      performance.ytd = parseFloat(ytdMatch[1]);
    }

    const oneYearMatch = text.match(/(?:1|one)(?:\s+year|\-year|\s+yr)(?:\s+return|\s+performance)?\s*[:=]?\s*([\-+]?[0-9]+(?:\.[0-9]+)?)%/i);
    if (oneYearMatch) {
      performance.oneYear = parseFloat(oneYearMatch[1]);
    }

    const threeYearMatch = text.match(/(?:3|three)(?:\s+year|\-year|\s+yr)(?:\s+return|\s+performance)?\s*[:=]?\s*([\-+]?[0-9]+(?:\.[0-9]+)?)%/i);
    if (threeYearMatch) {
      performance.threeYear = parseFloat(threeYearMatch[1]);
    }

    const fiveYearMatch = text.match(/(?:5|five)(?:\s+year|\-year|\s+yr)(?:\s+return|\s+performance)?\s*[:=]?\s*([\-+]?[0-9]+(?:\.[0-9]+)?)%/i);
    if (fiveYearMatch) {
      performance.fiveYear = parseFloat(fiveYearMatch[1]);
    }
  }

  return performance;
}

/**
 * Parse a percentage string
 * @param {string} str - Percentage string
 * @returns {number|null} - Parsed percentage
 */
function parsePercentage(str) {
  if (!str) return null;

  const percentMatch = str.match(/([\-+]?[0-9]+(?:\.[0-9]+)?)%?/);
  if (percentMatch) {
    return parseFloat(percentMatch[1]);
  }

  return null;
}

/**
 * Parse an amount string
 * @param {string} str - Amount string
 * @returns {number|null} - Parsed amount
 */
function parseAmount(str) {
  if (!str) return null;

  // Remove currency symbols and commas
  const cleanStr = str.replace(/[$€£¥]/g, '').replace(/,/g, '');

  const amountMatch = cleanStr.match(/([\-+]?[0-9]+(?:\.[0-9]+)?)/);
  if (amountMatch) {
    return parseFloat(amountMatch[1]);
  }

  return null;
}

/**
 * Infer security type from name
 * @param {string} name - Security name
 * @returns {string} - Inferred security type
 */
function inferSecurityType(name) {
  const nameLower = name.toLowerCase();

  if (nameLower.includes('bond') || nameLower.includes('treasury') || nameLower.includes('note') ||
      nameLower.includes('bill') || nameLower.includes('debt') || nameLower.includes('fixed income')) {
    return 'bond';
  } else if (nameLower.includes('stock') || nameLower.includes('share') || nameLower.includes('equity')) {
    return 'equity';
  } else if (nameLower.includes('fund') || nameLower.includes('etf') || nameLower.includes('index')) {
    return 'fund';
  } else if (nameLower.includes('option') || nameLower.includes('future') || nameLower.includes('swap') ||
             nameLower.includes('forward') || nameLower.includes('derivative')) {
    return 'derivative';
  } else if (nameLower.includes('cash') || nameLower.includes('money market')) {
    return 'cash';
  } else if (nameLower.includes('reit') || nameLower.includes('real estate')) {
    return 'real estate';
  } else if (nameLower.includes('commodity') || nameLower.includes('gold') || nameLower.includes('silver') ||
             nameLower.includes('oil') || nameLower.includes('gas')) {
    return 'commodity';
  } else if (nameLower.includes('structured') || nameLower.includes('certificate') || nameLower.includes('note')) {
    return 'structured';
  } else {
    return 'other';
  }
}

/**
 * Extract ISIN from security name or text
 * @param {string} text - Security name or text
 * @returns {string|null} - Extracted ISIN
 */
function extractISIN(text) {
  if (!text) return null;

  // ISIN format: 2 letters followed by 10 characters (letters or numbers)
  const isinMatch = text.match(/[A-Z]{2}[A-Z0-9]{10}/);
  if (isinMatch) {
    return isinMatch[0];
  }

  // Try to find ISIN with label
  const labeledIsinMatch = text.match(/(?:ISIN|International Securities Identification Number)[\s:]*([A-Z]{2}[A-Z0-9]{10})/i);
  if (labeledIsinMatch) {
    return labeledIsinMatch[1];
  }

  // Try to find CUSIP (US securities)
  const cusipMatch = text.match(/(?:CUSIP|Committee on Uniform Securities Identification Procedures)[\s:]*([0-9A-Z]{9})/i);
  if (cusipMatch) {
    return 'US' + cusipMatch[1];
  }

  // Try to find SEDOL (UK securities)
  const sedolMatch = text.match(/(?:SEDOL|Stock Exchange Daily Official List)[\s:]*([0-9A-Z]{7})/i);
  if (sedolMatch) {
    return 'GB' + sedolMatch[1] + '000';
  }

  return null;
}

/**
 * Check if an ISIN is valid (basic check)
 * @param {string} isin - ISIN to check
 * @returns {boolean} - Whether the ISIN is valid
 */
function isValidISIN(isin) {
  // Basic check: 2 letters followed by 10 characters (letters or numbers)
  if (!/^[A-Z]{2}[A-Z0-9]{10}$/.test(isin)) {
    return false;
  }

  // Check if the first two letters are a valid country code
  const countryCode = isin.substring(0, 2);
  const validCountryCodes = [
    'AD', 'AE', 'AF', 'AG', 'AI', 'AL', 'AM', 'AO', 'AQ', 'AR', 'AS', 'AT', 'AU', 'AW', 'AX', 'AZ',
    'BA', 'BB', 'BD', 'BE', 'BF', 'BG', 'BH', 'BI', 'BJ', 'BL', 'BM', 'BN', 'BO', 'BQ', 'BR', 'BS',
    'BT', 'BV', 'BW', 'BY', 'BZ', 'CA', 'CC', 'CD', 'CF', 'CG', 'CH', 'CI', 'CK', 'CL', 'CM', 'CN',
    'CO', 'CR', 'CU', 'CV', 'CW', 'CX', 'CY', 'CZ', 'DE', 'DJ', 'DK', 'DM', 'DO', 'DZ', 'EC', 'EE',
    'EG', 'EH', 'ER', 'ES', 'ET', 'FI', 'FJ', 'FK', 'FM', 'FO', 'FR', 'GA', 'GB', 'GD', 'GE', 'GF',
    'GG', 'GH', 'GI', 'GL', 'GM', 'GN', 'GP', 'GQ', 'GR', 'GS', 'GT', 'GU', 'GW', 'GY', 'HK', 'HM',
    'HN', 'HR', 'HT', 'HU', 'ID', 'IE', 'IL', 'IM', 'IN', 'IO', 'IQ', 'IR', 'IS', 'IT', 'JE', 'JM',
    'JO', 'JP', 'KE', 'KG', 'KH', 'KI', 'KM', 'KN', 'KP', 'KR', 'KW', 'KY', 'KZ', 'LA', 'LB', 'LC',
    'LI', 'LK', 'LR', 'LS', 'LT', 'LU', 'LV', 'LY', 'MA', 'MC', 'MD', 'ME', 'MF', 'MG', 'MH', 'MK',
    'ML', 'MM', 'MN', 'MO', 'MP', 'MQ', 'MR', 'MS', 'MT', 'MU', 'MV', 'MW', 'MX', 'MY', 'MZ', 'NA',
    'NC', 'NE', 'NF', 'NG', 'NI', 'NL', 'NO', 'NP', 'NR', 'NU', 'NZ', 'OM', 'PA', 'PE', 'PF', 'PG',
    'PH', 'PK', 'PL', 'PM', 'PN', 'PR', 'PS', 'PT', 'PW', 'PY', 'QA', 'RE', 'RO', 'RS', 'RU', 'RW',
    'SA', 'SB', 'SC', 'SD', 'SE', 'SG', 'SH', 'SI', 'SJ', 'SK', 'SL', 'SM', 'SN', 'SO', 'SR', 'SS',
    'ST', 'SV', 'SX', 'SY', 'SZ', 'TC', 'TD', 'TF', 'TG', 'TH', 'TJ', 'TK', 'TL', 'TM', 'TN', 'TO',
    'TR', 'TT', 'TV', 'TW', 'TZ', 'UA', 'UG', 'UM', 'US', 'UY', 'UZ', 'VA', 'VC', 'VE', 'VG', 'VI',
    'VN', 'VU', 'WF', 'WS', 'YE', 'YT', 'ZA', 'ZM', 'ZW', 'XS'
  ];

  return validCountryCodes.includes(countryCode);
}

module.exports = {
  extractFinancialData,
  isValidISIN
};
