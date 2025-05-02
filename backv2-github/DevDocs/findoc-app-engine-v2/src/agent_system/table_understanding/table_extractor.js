/**
 * Table Extractor Module
 *
 * Enhanced table extraction capabilities for the table understanding agent.
 */

const { generateContentInternal } = require('../../api/controllers/geminiController');

/**
 * Extract tables from document
 * @param {object} documentAnalysis - Document analysis result
 * @returns {Promise<Array<object>>} Extracted tables
 */
const extractTables = async (documentAnalysis) => {
  try {
    console.log('Extracting tables from document');

    // Get tables from document analysis
    const tables = documentAnalysis.structure?.tables || documentAnalysis.tables || [];

    // Process each table
    const processedTables = [];

    for (const table of tables) {
      const processedTable = await processTable(table, documentAnalysis.text);
      processedTables.push(processedTable);
    }

    return processedTables;
  } catch (error) {
    console.error('Error extracting tables:', error);
    throw error;
  }
};

/**
 * Process a table
 * @param {object} table - Table to process
 * @param {string} documentText - Document text
 * @returns {Promise<object>} Processed table
 */
const processTable = async (table, documentText) => {
  try {
    console.log('Processing table');

    // Identify table type
    const tableType = await identifyTableType(table.text);

    // Identify columns
    const columns = await identifyColumns(table.text);

    // Identify rows
    const rows = identifyRows(table.text, columns);

    // Identify table context
    const context = identifyTableContext(table, documentText);

    return {
      ...table,
      tableType,
      columns,
      rows,
      context
    };
  } catch (error) {
    console.error('Error processing table:', error);
    throw error;
  }
};

/**
 * Identify table type
 * @param {string} tableText - Table text
 * @returns {Promise<string>} Table type
 */
const identifyTableType = async (tableText) => {
  try {
    // Prepare prompt
    const prompt = `
      Analyze the following table and determine its type.
      Possible types:
      - securities_table: Contains securities information (ISIN, name, quantity, price, value)
      - transactions_table: Contains transaction information (date, type, security, quantity, price, amount)
      - performance_table: Contains performance information (period, return, benchmark)
      - allocation_table: Contains allocation information (asset class, percentage, value)
      - summary_table: Contains summary information (total value, currency, etc.)
      - unknown: Cannot determine the table type

      Table:
      ${tableText}

      Return only the table type as a single word, no explanation.
    `;

    try {
      // Generate response using Gemini API
      const tableType = await generateContentInternal(prompt);

      // Validate table type
      const validTypes = [
        'securities_table',
        'transactions_table',
        'performance_table',
        'allocation_table',
        'summary_table'
      ];

      if (validTypes.includes(tableType.trim().toLowerCase())) {
        return tableType.trim().toLowerCase();
      }
    } catch (error) {
      console.error('Error identifying table type with Gemini:', error);
      // Continue to fallback
    }

    // Fallback to rule-based approach
    return identifyTableTypeRuleBased(tableText);
  } catch (error) {
    console.error('Error identifying table type:', error);
    // Fallback to rule-based approach
    return identifyTableTypeRuleBased(tableText);
  }
};

/**
 * Identify table type using rule-based approach
 * @param {string} tableText - Table text
 * @returns {string} Table type
 */
const identifyTableTypeRuleBased = (tableText) => {
  // Convert text to lowercase for case-insensitive matching
  const lowercaseText = tableText.toLowerCase();

  // Check for securities table features
  const securitiesFeatures = [
    'isin', 'cusip', 'security', 'securities', 'holding', 'holdings',
    'position', 'positions', 'quantity', 'price', 'value', 'weight'
  ];

  const securitiesScore = securitiesFeatures.reduce((score, feature) => {
    return score + (lowercaseText.includes(feature) ? 1 : 0);
  }, 0);

  // Check for transactions table features
  const transactionsFeatures = [
    'transaction', 'trade', 'buy', 'sell', 'purchase', 'sale',
    'date', 'type', 'quantity', 'price', 'amount', 'commission'
  ];

  const transactionsScore = transactionsFeatures.reduce((score, feature) => {
    return score + (lowercaseText.includes(feature) ? 1 : 0);
  }, 0);

  // Check for performance table features
  const performanceFeatures = [
    'performance', 'return', 'yield', 'gain', 'loss',
    'period', 'benchmark', 'comparison', 'historical'
  ];

  const performanceScore = performanceFeatures.reduce((score, feature) => {
    return score + (lowercaseText.includes(feature) ? 1 : 0);
  }, 0);

  // Check for allocation table features
  const allocationFeatures = [
    'allocation', 'asset', 'class', 'sector', 'industry',
    'geography', 'country', 'region', 'percentage', 'weight'
  ];

  const allocationScore = allocationFeatures.reduce((score, feature) => {
    return score + (lowercaseText.includes(feature) ? 1 : 0);
  }, 0);

  // Check for summary table features
  const summaryFeatures = [
    'summary', 'total', 'subtotal', 'net', 'gross',
    'balance', 'value', 'currency', 'as of', 'date'
  ];

  const summaryScore = summaryFeatures.reduce((score, feature) => {
    return score + (lowercaseText.includes(feature) ? 1 : 0);
  }, 0);

  // Determine table type based on scores
  const scores = [
    { type: 'securities_table', score: securitiesScore },
    { type: 'transactions_table', score: transactionsScore },
    { type: 'performance_table', score: performanceScore },
    { type: 'allocation_table', score: allocationScore },
    { type: 'summary_table', score: summaryScore }
  ];

  // Sort scores in descending order
  scores.sort((a, b) => b.score - a.score);

  // Return the table type with the highest score
  // If the highest score is 0, return 'unknown'
  return scores[0].score > 0 ? scores[0].type : 'unknown';
};

/**
 * Identify columns
 * @param {string} tableText - Table text
 * @returns {Promise<Array<object>>} Identified columns
 */
const identifyColumns = async (tableText) => {
  try {
    // Prepare prompt
    const prompt = `
      Analyze the following table and identify the columns.
      For each column, determine:
      - name: The column name
      - type: The column type (text, number, date, currency, percentage)
      - index: The column index (0-based)

      Table:
      ${tableText}

      Return the columns as a JSON array of objects with name, type, and index properties.
    `;

    try {
      // Generate response using Gemini API
      const responseText = await generateContentInternal(prompt);

      // Extract JSON
      const jsonMatch = responseText.match(/\[[\s\S]*\]/);

      if (jsonMatch) {
        try {
          const columns = JSON.parse(jsonMatch[0]);
          return columns;
        } catch (error) {
          console.error('Error parsing columns JSON:', error);
          // Continue to fallback
        }
      }
    } catch (error) {
      console.error('Error identifying columns with Gemini:', error);
      // Continue to fallback
    }

    return fallbackColumnIdentification(tableText);
  } catch (error) {
    console.error('Error identifying columns:', error);
    return fallbackColumnIdentification(tableText);
  }
};

/**
 * Fallback column identification
 * @param {string} tableText - Table text
 * @returns {Array<object>} Identified columns
 */
const fallbackColumnIdentification = (tableText) => {
  // Split table into lines
  const lines = tableText.split('\n').filter(line => line.trim());

  if (lines.length === 0) {
    return [];
  }

  // Assume first line is header
  const headerLine = lines[0];

  // Split header by whitespace or pipe
  let headers;

  if (headerLine.includes('|')) {
    // Split by pipe
    headers = headerLine.split('|').map(h => h.trim()).filter(h => h);
  } else {
    // Split by whitespace
    headers = headerLine.split(/\s{2,}/).map(h => h.trim()).filter(h => h);
  }

  // Create columns
  return headers.map((name, index) => ({
    name,
    type: guessColumnType(name),
    index
  }));
};

/**
 * Guess column type based on name
 * @param {string} name - Column name
 * @returns {string} Column type
 */
const guessColumnType = (name) => {
  const lowercaseName = name.toLowerCase();

  if (lowercaseName.includes('date') || lowercaseName.includes('time')) {
    return 'date';
  } else if (lowercaseName.includes('price') || lowercaseName.includes('value') || lowercaseName.includes('amount')) {
    return 'currency';
  } else if (lowercaseName.includes('quantity') || lowercaseName.includes('number') || lowercaseName.includes('count')) {
    return 'number';
  } else if (lowercaseName.includes('percentage') || lowercaseName.includes('percent') || lowercaseName.includes('%')) {
    return 'percentage';
  } else {
    return 'text';
  }
};

/**
 * Identify rows
 * @param {string} tableText - Table text
 * @param {Array<object>} columns - Identified columns
 * @returns {Array<object>} Identified rows
 */
const identifyRows = (tableText, columns) => {
  // Split table into lines
  const lines = tableText.split('\n').filter(line => line.trim());

  if (lines.length <= 1 || columns.length === 0) {
    return [];
  }

  // Skip header line
  const dataLines = lines.slice(1);

  // Parse rows
  const rows = [];

  for (const line of dataLines) {
    // Skip empty lines
    if (!line.trim()) {
      continue;
    }

    // Split line by whitespace or pipe
    let cells;

    if (line.includes('|')) {
      // Split by pipe
      cells = line.split('|').map(c => c.trim()).filter(c => c);
    } else {
      // Split by whitespace
      cells = line.split(/\s{2,}/).map(c => c.trim()).filter(c => c);
    }

    // Create row
    const row = {};

    for (let i = 0; i < Math.min(columns.length, cells.length); i++) {
      const column = columns[i];
      const cell = cells[i];

      // Convert cell value based on column type
      let value;

      switch (column.type) {
        case 'number':
          value = parseFloat(cell.replace(/[^0-9.-]/g, ''));
          break;
        case 'currency':
          value = parseFloat(cell.replace(/[^0-9.-]/g, ''));
          break;
        case 'percentage':
          value = parseFloat(cell.replace(/[^0-9.-]/g, '')) / 100;
          break;
        case 'date':
          value = cell;
          break;
        default:
          value = cell;
      }

      row[column.name] = value;
    }

    rows.push(row);
  }

  return rows;
};

/**
 * Identify table context
 * @param {object} table - Table object
 * @param {string} documentText - Document text
 * @returns {object} Table context
 */
const identifyTableContext = (table, documentText) => {
  // Get text before and after the table
  const lines = documentText.split('\n');

  // Get text before table
  const textBefore = lines.slice(Math.max(0, table.startLine - 10), table.startLine).join('\n');

  // Get text after table
  const textAfter = lines.slice(table.endLine + 1, Math.min(lines.length, table.endLine + 10)).join('\n');

  // Look for table title
  const titleMatch = textBefore.match(/([A-Z][A-Za-z\s]+)(?:\n|\r\n|\r)$/);
  const title = titleMatch ? titleMatch[1].trim() : null;

  // Look for table footnotes
  const footnoteMatch = textAfter.match(/^(?:\n|\r\n|\r)?([^A-Z].*)/);
  const footnotes = footnoteMatch ? footnoteMatch[1].trim() : null;

  return {
    title,
    footnotes,
    textBefore,
    textAfter
  };
};

module.exports = {
  extractTables,
  processTable,
  identifyTableType,
  identifyColumns,
  identifyRows,
  identifyTableContext
};
