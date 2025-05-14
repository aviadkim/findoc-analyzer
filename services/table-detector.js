/**
 * Table Detector
 * 
 * This module provides enhanced table detection capabilities for financial PDFs.
 * It uses multiple strategies to detect tables in PDF documents.
 */

/**
 * Detect tables in PDF text
 * @param {string} text - Text content of the PDF
 * @returns {Array} - Detected table regions (start line, end line, title)
 */
function detectTables(text) {
  console.log('Detecting tables in PDF text...');
  
  // Initialize detected tables array
  const detectedTables = [];
  
  // Split text into lines
  const lines = text.split('\n');
  
  // Apply different detection strategies
  const spacingBasedTables = detectTablesUsingSpacing(lines);
  const patternBasedTables = detectTablesUsingPatterns(lines);
  const keywordBasedTables = detectTablesUsingKeywords(lines);
  
  // Combine tables from different strategies
  detectedTables.push(...spacingBasedTables);
  detectedTables.push(...patternBasedTables);
  detectedTables.push(...keywordBasedTables);
  
  // Merge overlapping table regions
  const mergedTables = mergeOverlappingTables(detectedTables);
  
  console.log(`Detected ${mergedTables.length} table regions`);
  
  return mergedTables;
}

/**
 * Detect tables based on consistent spacing
 * @param {Array} lines - Lines of text
 * @returns {Array} - Detected table regions
 */
function detectTablesUsingSpacing(lines) {
  const tables = [];
  
  let tableStart = -1;
  let tableEnd = -1;
  let tableTitle = '';
  let inTable = false;
  let consistentSpacing = false;
  let spacingPattern = null;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Skip empty lines
    if (!line) {
      // If we're in a table, empty lines might indicate the end
      if (inTable) {
        const emptyLineCount = countConsecutiveEmptyLines(lines, i);
        if (emptyLineCount >= 2) {
          // End of table
          tableEnd = i - 1;
          inTable = false;
          
          tables.push({
            start: tableStart,
            end: tableEnd,
            title: tableTitle
          });
          
          // Reset variables
          tableStart = -1;
          tableEnd = -1;
          tableTitle = '';
          consistentSpacing = false;
          spacingPattern = null;
        }
      }
      continue;
    }
    
    // Check for consistent spacing that might indicate a table
    if (!inTable) {
      const currentSpacingPattern = analyzeSpacingPattern(line);
      
      // Check if the next few lines follow the same spacing pattern
      if (currentSpacingPattern && currentSpacingPattern.length >= 2) {
        const followsPattern = checkConsistentSpacing(lines, i, currentSpacingPattern);
        
        if (followsPattern >= 3) { // At least 3 lines with consistent spacing
          // Start of a new table
          tableStart = i;
          tableTitle = i > 0 ? lines[i - 1].trim() : '';
          inTable = true;
          consistentSpacing = true;
          spacingPattern = currentSpacingPattern;
        }
      }
    } else if (consistentSpacing) {
      // Check if the line still follows the spacing pattern
      if (!lineFollowsSpacingPattern(line, spacingPattern)) {
        const nextLineFollows = i + 1 < lines.length && 
                               lineFollowsSpacingPattern(lines[i + 1].trim(), spacingPattern);
        
        if (!nextLineFollows) {
          // End of table
          tableEnd = i - 1;
          inTable = false;
          
          tables.push({
            start: tableStart,
            end: tableEnd,
            title: tableTitle
          });
          
          // Reset variables
          tableStart = -1;
          tableEnd = -1;
          tableTitle = '';
          consistentSpacing = false;
          spacingPattern = null;
        }
      }
    }
  }
  
  // Handle case where the table extends to the end of the document
  if (inTable) {
    tableEnd = lines.length - 1;
    
    tables.push({
      start: tableStart,
      end: tableEnd,
      title: tableTitle
    });
  }
  
  return tables;
}

/**
 * Detect tables based on common financial table patterns
 * @param {Array} lines - Lines of text
 * @returns {Array} - Detected table regions
 */
function detectTablesUsingPatterns(lines) {
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
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Skip empty lines
    if (!line) {
      continue;
    }
    
    // Check for title patterns
    for (const pattern of tablePatterns) {
      if (pattern.titlePattern.test(line)) {
        // Look for header pattern in the next few lines
        let headerIndex = -1;
        
        for (let j = i + 1; j < Math.min(i + 10, lines.length); j++) {
          if (pattern.headerPattern.test(lines[j])) {
            headerIndex = j;
            break;
          }
        }
        
        if (headerIndex !== -1) {
          // Found a header, now determine the end of the table
          let tableEnd = headerIndex;
          
          // Count columns in the header
          const headerColumns = countColumns(lines[headerIndex]);
          
          if (headerColumns >= pattern.minColumns) {
            // Look for the end of the table
            for (let j = headerIndex + 1; j < lines.length; j++) {
              const currentLine = lines[j].trim();
              
              // Empty lines or new title patterns indicate the end of the table
              if (!currentLine || 
                  tablePatterns.some(p => p.titlePattern.test(currentLine)) ||
                  j - headerIndex > 100) { // Limit table size
                tableEnd = j - 1;
                break;
              }
            }
            
            tables.push({
              start: i,
              end: tableEnd,
              title: line
            });
            
            // Skip to the end of this table
            i = tableEnd;
            break;
          }
        }
      }
    }
  }
  
  return tables;
}

/**
 * Detect tables based on financial keywords
 * @param {Array} lines - Lines of text
 * @returns {Array} - Detected table regions
 */
function detectTablesUsingKeywords(lines) {
  const tables = [];
  
  // Financial keywords that often indicate tables
  const keywords = [
    'Balance Sheet', 'Income Statement', 'Cash Flow Statement',
    'Statement of Financial Position', 'Statement of Operations',
    'Statement of Changes', 'Portfolio Summary', 'Portfolio Holdings',
    'Asset Overview', 'Financial Summary', 'Financial Highlights',
    'Key Figures', 'Key Metrics', 'Key Ratios', 'Key Statistics'
  ];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Skip empty lines
    if (!line) {
      continue;
    }
    
    // Check if line contains a keyword
    if (keywords.some(keyword => line.includes(keyword))) {
      // Look for a table structure in the next few lines
      let tableStart = i;
      let tableEnd = i;
      
      // Check the next 20 lines for table-like structure
      for (let j = i + 1; j < Math.min(i + 20, lines.length); j++) {
        const currentLine = lines[j].trim();
        
        // Skip empty lines
        if (!currentLine) {
          continue;
        }
        
        // Check if line has multiple columns
        if (countColumns(currentLine) >= 2) {
          // Found a potential table, now determine the end
          tableStart = j;
          tableEnd = j;
          
          // Look for the end of the table
          for (let k = j + 1; k < lines.length; k++) {
            const tableLine = lines[k].trim();
            
            // Empty lines or new keywords indicate the end of the table
            if (!tableLine || 
                keywords.some(keyword => tableLine.includes(keyword)) ||
                k - j > 100) { // Limit table size
              tableEnd = k - 1;
              break;
            }
            
            // If line has similar column structure, it's part of the table
            if (countColumns(tableLine) >= 2) {
              tableEnd = k;
            }
          }
          
          tables.push({
            start: tableStart,
            end: tableEnd,
            title: line
          });
          
          // Skip to the end of this table
          i = tableEnd;
          break;
        }
      }
    }
  }
  
  return tables;
}

/**
 * Count consecutive empty lines
 * @param {Array} lines - Lines of text
 * @param {number} startIndex - Starting index
 * @returns {number} - Number of consecutive empty lines
 */
function countConsecutiveEmptyLines(lines, startIndex) {
  let count = 0;
  
  for (let i = startIndex; i < lines.length; i++) {
    if (lines[i].trim() === '') {
      count++;
    } else {
      break;
    }
  }
  
  return count;
}

/**
 * Analyze spacing pattern in a line
 * @param {string} line - Line to analyze
 * @returns {Array|null} - Spacing pattern or null if no pattern found
 */
function analyzeSpacingPattern(line) {
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
  
  return columnPositions.length >= 2 ? columnPositions : null;
}

/**
 * Check if the next few lines follow a consistent spacing pattern
 * @param {Array} lines - Lines of text
 * @param {number} startIndex - Starting index
 * @param {Array} spacingPattern - Spacing pattern to check
 * @returns {number} - Number of lines that follow the pattern
 */
function checkConsistentSpacing(lines, startIndex, spacingPattern) {
  let count = 1; // Start with 1 for the current line
  
  for (let i = startIndex + 1; i < Math.min(startIndex + 10, lines.length); i++) {
    const line = lines[i].trim();
    
    // Skip empty lines
    if (!line) {
      continue;
    }
    
    if (lineFollowsSpacingPattern(line, spacingPattern)) {
      count++;
    } else {
      break;
    }
  }
  
  return count;
}

/**
 * Check if a line follows a spacing pattern
 * @param {string} line - Line to check
 * @param {Array} spacingPattern - Spacing pattern to check
 * @returns {boolean} - Whether the line follows the pattern
 */
function lineFollowsSpacingPattern(line, spacingPattern) {
  // Check if the line has content at the column positions
  let contentAtPositions = 0;
  
  for (const [start, end] of spacingPattern) {
    if (start < line.length) {
      const segment = line.substring(start, Math.min(end + 1, line.length));
      if (segment.trim() !== '') {
        contentAtPositions++;
      }
    }
  }
  
  // If the line has content at most of the column positions, it follows the pattern
  return contentAtPositions >= spacingPattern.length * 0.5;
}

/**
 * Count columns in a line
 * @param {string} line - Line to analyze
 * @returns {number} - Number of columns
 */
function countColumns(line) {
  // Split by multiple spaces
  const columns = line.split(/\s{2,}/).filter(col => col.trim() !== '');
  return columns.length;
}

/**
 * Merge overlapping table regions
 * @param {Array} tables - Table regions to merge
 * @returns {Array} - Merged table regions
 */
function mergeOverlappingTables(tables) {
  if (tables.length <= 1) {
    return tables;
  }
  
  // Sort tables by start line
  const sortedTables = [...tables].sort((a, b) => a.start - b.start);
  
  const mergedTables = [];
  let currentTable = sortedTables[0];
  
  for (let i = 1; i < sortedTables.length; i++) {
    const nextTable = sortedTables[i];
    
    // Check if tables overlap
    if (nextTable.start <= currentTable.end + 2) { // Allow 2 lines gap
      // Merge tables
      currentTable.end = Math.max(currentTable.end, nextTable.end);
      // Keep the more specific title
      if (nextTable.title.length > currentTable.title.length) {
        currentTable.title = nextTable.title;
      }
    } else {
      // No overlap, add current table and move to next
      mergedTables.push(currentTable);
      currentTable = nextTable;
    }
  }
  
  // Add the last table
  mergedTables.push(currentTable);
  
  return mergedTables;
}

module.exports = {
  detectTables
};
