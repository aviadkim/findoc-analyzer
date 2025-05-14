/**
 * Advanced Table Extractor
 * 
 * This module provides advanced table extraction capabilities for financial PDFs.
 * It uses multiple strategies to detect and extract tables from PDF documents.
 */

const fs = require('fs');
const path = require('path');

/**
 * Extract tables from PDF text using multiple strategies
 * @param {string} text - Text content of the PDF
 * @returns {Array} - Extracted tables
 */
function extractTablesFromText(text) {
  console.log('Extracting tables using advanced techniques...');
  
  // Initialize tables array
  const tables = [];
  
  // Try different table extraction strategies
  const spacingBasedTables = extractTablesUsingSpacing(text);
  const lineBasedTables = extractTablesUsingLines(text);
  const patternBasedTables = extractTablesUsingPatterns(text);
  
  // Combine tables from different strategies
  tables.push(...spacingBasedTables);
  tables.push(...lineBasedTables);
  tables.push(...patternBasedTables);
  
  // Remove duplicate tables
  const uniqueTables = removeDuplicateTables(tables);
  
  console.log(`Extracted ${uniqueTables.length} unique tables`);
  
  return uniqueTables;
}

/**
 * Extract tables based on consistent spacing
 * @param {string} text - Text content of the PDF
 * @returns {Array} - Extracted tables
 */
function extractTablesUsingSpacing(text) {
  const tables = [];
  
  // Split text into lines
  const lines = text.split('\n');
  
  // Find potential table sections
  let tableStart = -1;
  let tableEnd = -1;
  let tableTitle = '';
  let inTable = false;
  let tableLines = [];
  let columnPositions = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Skip empty lines
    if (!line) {
      continue;
    }
    
    // Check if line could be a table header
    if (!inTable && isPotentialTableHeader(line)) {
      // Analyze spacing to detect column positions
      const positions = analyzeColumnPositions(line);
      
      if (positions.length >= 2) {
        // Start of a new table
        tableStart = i;
        tableTitle = lines[i - 1]?.trim() || '';
        inTable = true;
        tableLines = [line];
        columnPositions = positions;
      }
    } else if (inTable) {
      // Check if we're still in a table by analyzing if the line follows the same column structure
      if (followsColumnStructure(line, columnPositions)) {
        tableLines.push(line);
      } else {
        // End of table
        tableEnd = i - 1;
        inTable = false;
        
        // Process table
        if (tableLines.length >= 2) {
          const table = processTableWithColumns(tableLines, tableTitle, columnPositions);
          tables.push(table);
        }
        
        tableLines = [];
        columnPositions = [];
      }
    }
  }
  
  // Process any remaining table
  if (inTable && tableLines.length >= 2) {
    const table = processTableWithColumns(tableLines, tableTitle, columnPositions);
    tables.push(table);
  }
  
  return tables;
}

/**
 * Extract tables based on line separators
 * @param {string} text - Text content of the PDF
 * @returns {Array} - Extracted tables
 */
function extractTablesUsingLines(text) {
  const tables = [];
  
  // Look for sections with line separators like +----+----+----+
  const linePatterns = [
    /[+\-|]+/, // +----+----+
    /[\+\-\=\|]+/, // +=====+====+
    /[\|\s]+\n[\-\=]+/ // | | | \n ------
  ];
  
  // Split text into sections
  const sections = text.split(/\n\s*\n/);
  
  for (const section of sections) {
    // Check if section contains line separators
    const hasLineSeparators = linePatterns.some(pattern => pattern.test(section));
    
    if (hasLineSeparators) {
      // Process section as a table
      const lines = section.split('\n').filter(line => line.trim() !== '');
      
      // Find the title (usually before the table)
      let tableTitle = '';
      const titleMatch = section.match(/^([A-Z][A-Za-z\s\d]+)(?:\n|\r\n)/);
      if (titleMatch) {
        tableTitle = titleMatch[1].trim();
      }
      
      // Extract headers and rows
      const headerIndex = lines.findIndex(line => /[A-Za-z]/.test(line) && !/^[A-Z][A-Za-z\s\d]+$/.test(line));
      
      if (headerIndex !== -1) {
        const headers = extractCellsFromLine(lines[headerIndex]);
        const rows = [];
        
        // Extract rows
        for (let i = headerIndex + 1; i < lines.length; i++) {
          const line = lines[i];
          
          // Skip separator lines
          if (/^[\+\-\=\|]+$/.test(line)) {
            continue;
          }
          
          const cells = extractCellsFromLine(line);
          
          // Ensure we have valid cells
          if (cells.length > 0 && cells.some(cell => cell.trim() !== '')) {
            rows.push(cells);
          }
        }
        
        // Add table if we have headers and rows
        if (headers.length > 0 && rows.length > 0) {
          tables.push({
            title: tableTitle,
            headers,
            rows
          });
        }
      }
    }
  }
  
  return tables;
}

/**
 * Extract tables based on common financial table patterns
 * @param {string} text - Text content of the PDF
 * @returns {Array} - Extracted tables
 */
function extractTablesUsingPatterns(text) {
  const tables = [];
  
  // Common financial table patterns
  const tablePatterns = [
    // Securities table pattern
    {
      titlePattern: /(Securities|Holdings|Positions|Investments|Portfolio Composition)/i,
      headerPattern: /(ISIN|Security|Name|Quantity|Price|Value|%|Weight|Allocation)/i,
      minColumns: 3
    },
    // Asset allocation table pattern
    {
      titlePattern: /(Asset Allocation|Allocation|Asset Class|Portfolio Allocation)/i,
      headerPattern: /(Asset Class|Category|Type|Allocation|%|Weight|Value)/i,
      minColumns: 2
    },
    // Performance table pattern
    {
      titlePattern: /(Performance|Returns|Results)/i,
      headerPattern: /(Period|Time Frame|Duration|Return|Performance|%|YTD|1Y|3Y|5Y)/i,
      minColumns: 2
    },
    // Cash flow table pattern
    {
      titlePattern: /(Cash Flow|Cash Flows|Expected Cash Flow|Income)/i,
      headerPattern: /(Date|Period|Amount|Currency|Type|Description)/i,
      minColumns: 2
    }
  ];
  
  // Split text into sections
  const sections = text.split(/\n\s*\n/);
  
  for (const section of sections) {
    // Check each pattern
    for (const pattern of tablePatterns) {
      if (pattern.titlePattern.test(section)) {
        // Find lines that match the header pattern
        const lines = section.split('\n').filter(line => line.trim() !== '');
        const headerIndex = lines.findIndex(line => pattern.headerPattern.test(line));
        
        if (headerIndex !== -1) {
          // Extract headers
          const headerLine = lines[headerIndex];
          const headers = extractColumnsFromLine(headerLine);
          
          // Only proceed if we have enough columns
          if (headers.length >= pattern.minColumns) {
            // Extract rows
            const rows = [];
            
            for (let i = headerIndex + 1; i < lines.length; i++) {
              const line = lines[i];
              
              // Skip lines that look like headers or titles
              if (/^[A-Z][A-Za-z\s]+$/.test(line) || pattern.headerPattern.test(line)) {
                continue;
              }
              
              const cells = extractColumnsFromLine(line);
              
              // Ensure we have valid cells with at least one non-empty cell
              if (cells.length > 0 && cells.some(cell => cell.trim() !== '')) {
                // Try to align cells with headers
                while (cells.length < headers.length) {
                  cells.push('');
                }
                
                if (cells.length > headers.length) {
                  cells.splice(headers.length);
                }
                
                rows.push(cells);
              }
            }
            
            // Add table if we have headers and rows
            if (headers.length > 0 && rows.length > 0) {
              tables.push({
                title: section.match(pattern.titlePattern)[0],
                headers,
                rows
              });
              
              // Break to avoid processing the same section with multiple patterns
              break;
            }
          }
        }
      }
    }
  }
  
  return tables;
}

/**
 * Check if a line could be a table header
 * @param {string} line - Line to check
 * @returns {boolean} - Whether the line could be a table header
 */
function isPotentialTableHeader(line) {
  // Check if line contains multiple words separated by whitespace
  const words = line.split(/\s{2,}/).filter(Boolean);
  
  // Headers typically have at least 2 words
  if (words.length < 2) {
    return false;
  }
  
  // Headers often have capitalized words
  const capitalizedWords = words.filter(word => word[0] === word[0].toUpperCase());
  
  // If most words are capitalized, it's likely a header
  return capitalizedWords.length >= words.length * 0.5;
}

/**
 * Analyze column positions in a line
 * @param {string} line - Line to analyze
 * @returns {Array} - Column positions
 */
function analyzeColumnPositions(line) {
  const positions = [];
  let inWord = false;
  
  // Find positions where words start and end
  for (let i = 0; i < line.length; i++) {
    if (line[i] !== ' ' && !inWord) {
      positions.push(i);
      inWord = true;
    } else if (line[i] === ' ' && inWord) {
      positions.push(i - 1);
      inWord = false;
    }
  }
  
  // Add the end position if we ended in a word
  if (inWord) {
    positions.push(line.length - 1);
  }
  
  // Group positions into start-end pairs
  const columnPositions = [];
  for (let i = 0; i < positions.length; i += 2) {
    if (i + 1 < positions.length) {
      columnPositions.push([positions[i], positions[i + 1]]);
    }
  }
  
  return columnPositions;
}

/**
 * Check if a line follows the column structure
 * @param {string} line - Line to check
 * @param {Array} columnPositions - Column positions
 * @returns {boolean} - Whether the line follows the column structure
 */
function followsColumnStructure(line, columnPositions) {
  // Check if the line has content at the column positions
  let contentAtPositions = 0;
  
  for (const [start, end] of columnPositions) {
    if (start < line.length) {
      const segment = line.substring(start, Math.min(end + 1, line.length));
      if (segment.trim() !== '') {
        contentAtPositions++;
      }
    }
  }
  
  // If the line has content at most of the column positions, it follows the structure
  return contentAtPositions >= columnPositions.length * 0.5;
}

/**
 * Process a table with column positions
 * @param {Array} lines - Table lines
 * @param {string} title - Table title
 * @param {Array} columnPositions - Column positions
 * @returns {object} - Processed table
 */
function processTableWithColumns(lines, title, columnPositions) {
  // Extract headers
  const headerLine = lines[0];
  const headers = columnPositions.map(([start, end]) => {
    if (start < headerLine.length) {
      return headerLine.substring(start, Math.min(end + 1, headerLine.length)).trim();
    }
    return '';
  }).filter(Boolean);
  
  // Extract rows
  const rows = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const cells = columnPositions.map(([start, end]) => {
      if (start < line.length) {
        return line.substring(start, Math.min(end + 1, line.length)).trim();
      }
      return '';
    });
    
    // Skip rows that are likely not part of the table
    if (cells.some(cell => cell !== '')) {
      rows.push(cells);
    }
  }
  
  return {
    title,
    headers,
    rows
  };
}

/**
 * Extract cells from a line with separators
 * @param {string} line - Line to extract cells from
 * @returns {Array} - Extracted cells
 */
function extractCellsFromLine(line) {
  // Remove leading/trailing separators
  const trimmedLine = line.replace(/^[\|\+]/, '').replace(/[\|\+]$/, '');
  
  // Split by separators
  return trimmedLine.split(/[\|\+]/).map(cell => cell.trim());
}

/**
 * Extract columns from a line based on spacing
 * @param {string} line - Line to extract columns from
 * @returns {Array} - Extracted columns
 */
function extractColumnsFromLine(line) {
  // Split by multiple spaces
  return line.split(/\s{2,}/).map(col => col.trim()).filter(Boolean);
}

/**
 * Remove duplicate tables
 * @param {Array} tables - Tables to deduplicate
 * @returns {Array} - Deduplicated tables
 */
function removeDuplicateTables(tables) {
  const uniqueTables = [];
  const tableSignatures = new Set();
  
  for (const table of tables) {
    // Create a signature for the table
    const signature = `${table.title}|${table.headers.join(',')}|${table.rows.length}`;
    
    if (!tableSignatures.has(signature)) {
      tableSignatures.add(signature);
      uniqueTables.push(table);
    }
  }
  
  return uniqueTables;
}

module.exports = {
  extractTablesFromText
};
