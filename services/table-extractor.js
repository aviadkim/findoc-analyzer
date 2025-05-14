/**
 * Table Extractor
 * 
 * This module extracts structured table data from detected table regions in PDF text.
 */

/**
 * Extract tables from detected table regions
 * @param {string} text - Full text content of the PDF
 * @param {Array} tableRegions - Detected table regions
 * @returns {Array} - Extracted tables
 */
function extractTables(text, tableRegions) {
  console.log('Extracting tables from detected regions...');
  
  // Split text into lines
  const lines = text.split('\n');
  
  // Extract tables from each region
  const tables = [];
  
  for (const region of tableRegions) {
    const { start, end, title } = region;
    
    // Get the lines for this table region
    const tableLines = lines.slice(start, end + 1);
    
    // Extract the table structure
    const table = extractTableStructure(tableLines, title);
    
    if (table && table.headers.length > 0 && table.rows.length > 0) {
      tables.push(table);
    }
  }
  
  console.log(`Extracted ${tables.length} structured tables`);
  
  return tables;
}

/**
 * Extract table structure from lines
 * @param {Array} lines - Lines of the table
 * @param {string} title - Table title
 * @returns {object|null} - Extracted table or null if extraction failed
 */
function extractTableStructure(lines, title) {
  // Try different extraction strategies
  const strategies = [
    extractFixedWidthTable,
    extractDelimitedTable,
    extractSpaceSeparatedTable
  ];
  
  for (const strategy of strategies) {
    const table = strategy(lines, title);
    
    if (table && table.headers.length > 0 && table.rows.length > 0) {
      return table;
    }
  }
  
  // If all strategies failed, try a more aggressive approach
  return extractAggressiveTable(lines, title);
}

/**
 * Extract a fixed-width table
 * @param {Array} lines - Lines of the table
 * @param {string} title - Table title
 * @returns {object|null} - Extracted table or null if extraction failed
 */
function extractFixedWidthTable(lines, title) {
  // Find the header line
  const headerIndex = findHeaderLine(lines);
  
  if (headerIndex === -1) {
    return null;
  }
  
  // Analyze column positions
  const columnPositions = analyzeColumnPositions(lines, headerIndex);
  
  if (columnPositions.length < 2) {
    return null;
  }
  
  // Extract headers
  const headers = extractColumnsFromPositions(lines[headerIndex], columnPositions);
  
  // Extract rows
  const rows = [];
  
  for (let i = headerIndex + 1; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Skip empty lines and separator lines
    if (!line || /^[\-\=\+]+$/.test(line)) {
      continue;
    }
    
    // Extract cells
    const cells = extractColumnsFromPositions(lines[i], columnPositions);
    
    // Skip rows that don't have enough data
    if (cells.some(cell => cell.trim() !== '')) {
      // Ensure we have the right number of cells
      while (cells.length < headers.length) {
        cells.push('');
      }
      
      if (cells.length > headers.length) {
        cells.splice(headers.length);
      }
      
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
 * Extract a delimited table (using |, +, etc.)
 * @param {Array} lines - Lines of the table
 * @param {string} title - Table title
 * @returns {object|null} - Extracted table or null if extraction failed
 */
function extractDelimitedTable(lines, title) {
  // Check if this looks like a delimited table
  const hasDelimiters = lines.some(line => /[\|\+]/.test(line));
  
  if (!hasDelimiters) {
    return null;
  }
  
  // Find the header line
  const headerIndex = findHeaderLine(lines);
  
  if (headerIndex === -1) {
    return null;
  }
  
  // Extract headers
  const headers = extractCellsFromDelimitedLine(lines[headerIndex]);
  
  if (headers.length < 2) {
    return null;
  }
  
  // Extract rows
  const rows = [];
  
  for (let i = headerIndex + 1; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Skip empty lines and separator lines
    if (!line || /^[\-\=\+]+$/.test(line)) {
      continue;
    }
    
    // Extract cells
    const cells = extractCellsFromDelimitedLine(lines[i]);
    
    // Skip rows that don't have enough data
    if (cells.some(cell => cell.trim() !== '')) {
      // Ensure we have the right number of cells
      while (cells.length < headers.length) {
        cells.push('');
      }
      
      if (cells.length > headers.length) {
        cells.splice(headers.length);
      }
      
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
 * Extract a space-separated table
 * @param {Array} lines - Lines of the table
 * @param {string} title - Table title
 * @returns {object|null} - Extracted table or null if extraction failed
 */
function extractSpaceSeparatedTable(lines, title) {
  // Find the header line
  const headerIndex = findHeaderLine(lines);
  
  if (headerIndex === -1) {
    return null;
  }
  
  // Extract headers
  const headers = lines[headerIndex].split(/\s{2,}/).map(h => h.trim()).filter(Boolean);
  
  if (headers.length < 2) {
    return null;
  }
  
  // Extract rows
  const rows = [];
  
  for (let i = headerIndex + 1; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Skip empty lines and separator lines
    if (!line || /^[\-\=\+]+$/.test(line)) {
      continue;
    }
    
    // Extract cells
    const cells = line.split(/\s{2,}/).map(c => c.trim()).filter(Boolean);
    
    // Skip rows that don't have enough data
    if (cells.length >= 2) {
      // Ensure we have the right number of cells
      while (cells.length < headers.length) {
        cells.push('');
      }
      
      if (cells.length > headers.length) {
        cells.splice(headers.length);
      }
      
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
 * Extract a table using a more aggressive approach
 * @param {Array} lines - Lines of the table
 * @param {string} title - Table title
 * @returns {object|null} - Extracted table or null if extraction failed
 */
function extractAggressiveTable(lines, title) {
  // Look for any line that could be a header
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Skip empty lines
    if (!line) {
      continue;
    }
    
    // Check if this line could be a header
    const words = line.split(/\s+/).filter(Boolean);
    
    if (words.length >= 2) {
      // Try to extract a table starting from this line
      const headers = words;
      const rows = [];
      
      for (let j = i + 1; j < lines.length; j++) {
        const rowLine = lines[j].trim();
        
        // Skip empty lines
        if (!rowLine) {
          continue;
        }
        
        // Try to split the line into cells
        const cells = rowLine.split(/\s+/).filter(Boolean);
        
        // If we have at least as many cells as headers, this might be a row
        if (cells.length >= headers.length) {
          // Ensure we have the right number of cells
          while (cells.length > headers.length) {
            cells.pop();
          }
          
          rows.push(cells);
        }
      }
      
      // If we found some rows, return the table
      if (rows.length > 0) {
        return {
          title,
          headers,
          rows
        };
      }
    }
  }
  
  return null;
}

/**
 * Find the header line in a table
 * @param {Array} lines - Lines of the table
 * @returns {number} - Index of the header line or -1 if not found
 */
function findHeaderLine(lines) {
  // Common header patterns
  const headerPatterns = [
    /(ISIN|Security|Name|Quantity|Price|Value|%|Weight|Allocation)/i,
    /(Asset Class|Category|Type|Allocation|%|Weight|Value)/i,
    /(Period|Time Frame|Duration|Return|Performance|%|YTD|1Y|3Y|5Y)/i,
    /(Date|Period|Amount|Currency|Type|Description)/i
  ];
  
  // Look for lines that match header patterns
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Skip empty lines
    if (!line) {
      continue;
    }
    
    // Check if line matches any header pattern
    if (headerPatterns.some(pattern => pattern.test(line))) {
      return i;
    }
    
    // Check if line has multiple capitalized words
    const words = line.split(/\s+/).filter(Boolean);
    const capitalizedWords = words.filter(word => word[0] === word[0].toUpperCase());
    
    if (words.length >= 2 && capitalizedWords.length >= words.length * 0.5) {
      return i;
    }
  }
  
  return -1;
}

/**
 * Analyze column positions in a table
 * @param {Array} lines - Lines of the table
 * @param {number} headerIndex - Index of the header line
 * @returns {Array} - Column positions
 */
function analyzeColumnPositions(lines, headerIndex) {
  const headerLine = lines[headerIndex];
  const positions = [];
  let inWord = false;
  
  // Find positions where words start and end
  for (let i = 0; i < headerLine.length; i++) {
    if (headerLine[i] !== ' ' && !inWord) {
      positions.push(i);
      inWord = true;
    } else if (headerLine[i] === ' ' && inWord) {
      positions.push(i - 1);
      inWord = false;
    }
  }
  
  // Add the end position if we ended in a word
  if (inWord) {
    positions.push(headerLine.length - 1);
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
 * Extract columns from a line using column positions
 * @param {string} line - Line to extract columns from
 * @param {Array} columnPositions - Column positions
 * @returns {Array} - Extracted columns
 */
function extractColumnsFromPositions(line, columnPositions) {
  return columnPositions.map(([start, end]) => {
    if (start < line.length) {
      return line.substring(start, Math.min(end + 1, line.length)).trim();
    }
    return '';
  });
}

/**
 * Extract cells from a delimited line
 * @param {string} line - Line to extract cells from
 * @returns {Array} - Extracted cells
 */
function extractCellsFromDelimitedLine(line) {
  // Remove leading/trailing separators
  const trimmedLine = line.replace(/^[\|\+]/, '').replace(/[\|\+]$/, '');
  
  // Split by separators
  return trimmedLine.split(/[\|\+]/).map(cell => cell.trim());
}

module.exports = {
  extractTables
};
