/**
 * PDF Parser Module
 *
 * Enhanced PDF parsing capabilities for the document analyzer agent.
 */

const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const { PDFDocument } = require('pdf-lib');
const { extractTablesWithCamelot, isCamelotInstalled } = require('./camelot_integration');
const { extractTablesWithTableTransformer, isTableTransformerInstalled } = require('./table_transformer_integration');

/**
 * Parse a PDF document
 * @param {string} pdfPath - Path to the PDF document
 * @returns {Promise<object>} Parsed PDF data
 */
const parsePdf = async (pdfPath) => {
  try {
    console.log(`Parsing PDF: ${pdfPath}`);

    // Read PDF file
    const dataBuffer = fs.readFileSync(pdfPath);

    // Parse PDF with pdf-parse
    const pdfData = await pdfParse(dataBuffer);

    // Extract text
    const text = pdfData.text;

    // Get PDF structure using pdf-lib
    const pdfDoc = await PDFDocument.load(dataBuffer);
    const pages = pdfDoc.getPages();

    // Extract page-level information
    const pageInfo = pages.map((page, index) => {
      const { width, height } = page.getSize();
      return {
        pageNumber: index + 1,
        width,
        height,
        text: extractPageText(text, index + 1, pdfData.numpages)
      };
    });

    // Identify potential tables
    const tables = await identifyTables(text, pdfPath);

    // Identify potential headers and footers
    const { headers, footers } = identifyHeadersAndFooters(pageInfo);

    // Identify document sections
    const sections = identifyDocumentSections(text);

    // Create result object
    const result = {
      documentPath: pdfPath,
      text,
      pageCount: pdfData.numpages,
      info: pdfData.info,
      metadata: pdfData.metadata,
      structure: {
        pages: pageInfo,
        tables,
        headers,
        footers,
        sections
      }
    };

    // Add multi-page support information
    result.isMultiPage = pdfData.numpages > 1;

    // Add table summary
    result.tableSummary = {
      count: tables.length,
      bySource: tables.reduce((summary, table) => {
        summary[table.source] = (summary[table.source] || 0) + 1;
        return summary;
      }, {})
    };

    return result;
  } catch (error) {
    console.error('Error parsing PDF:', error);
    throw error;
  }
};

/**
 * Extract text for a specific page
 * @param {string} fullText - Full document text
 * @param {number} pageNumber - Page number
 * @param {number} totalPages - Total number of pages
 * @returns {string} Page text
 */
const extractPageText = (fullText, pageNumber, totalPages) => {
  // This is a simplified implementation
  // In a real implementation, we would use a more sophisticated approach

  // Split text by page breaks
  const pages = fullText.split('\n\n\n').filter(page => page.trim());

  // If we have fewer "pages" than expected, just return empty string
  if (pages.length < pageNumber) {
    return '';
  }

  // Return the page text
  return pages[pageNumber - 1];
};

/**
 * Identify tables in text and PDF
 * @param {string} text - Document text
 * @param {string} pdfPath - Path to the PDF document
 * @returns {Promise<Array<object>>} Identified tables
 */
const identifyTables = async (text, pdfPath) => {
  try {
    console.log(`Identifying tables in PDF: ${pdfPath}`);

    // Initialize tables array
    let tables = [];

    // Try to use Camelot for table extraction
    let camelotAvailable = false;

    try {
      camelotAvailable = await isCamelotInstalled();

      if (camelotAvailable) {
        console.log('Using Camelot for table extraction');

        // Extract tables with Camelot
        const camelotTables = await extractTablesWithCamelot(pdfPath);

        // Process Camelot tables
        for (const table of camelotTables) {
          tables.push({
            source: 'camelot',
            page: table.page,
            headers: table.headers,
            rows: table.rows,
            data: table.data,
            accuracy: table.accuracy,
            text: table.csv
          });
        }

        console.log(`Extracted ${tables.length} tables with Camelot`);
      }
    } catch (error) {
      console.error('Error using Camelot for table extraction:', error);
      camelotAvailable = false;
    }

    // If Camelot is not available or didn't find any tables, try Table Transformer
    if (!camelotAvailable || tables.length === 0) {
      let tableTransformerAvailable = false;

      try {
        tableTransformerAvailable = await isTableTransformerInstalled();

        if (tableTransformerAvailable) {
          console.log('Using Table Transformer for table extraction');

          // Extract tables with Table Transformer
          const tableTransformerResult = await extractTablesWithTableTransformer(pdfPath);

          // Process Table Transformer tables
          for (const table of tableTransformerResult.tables) {
            tables.push({
              source: 'table_transformer',
              page: table.page,
              box: table.box,
              score: table.score,
              imagePath: table.imagePath
            });
          }

          console.log(`Extracted ${tables.length} tables with Table Transformer`);
        }
      } catch (error) {
        console.error('Error using Table Transformer for table extraction:', error);
        tableTransformerAvailable = false;
      }
    }

    // If neither Camelot nor Table Transformer are available or didn't find any tables,
    // fall back to text-based table detection
    if (tables.length === 0) {
      console.log('Using text-based table detection');

      // Look for table-like patterns
      const lines = text.split('\n');

      let tableStart = -1;
      let tableEnd = -1;
      let inTable = false;
      let tableHeader = '';
      let tableRows = [];

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        // Skip empty lines
        if (!line) {
          continue;
        }

        // Check if line looks like a table row
        const isTableRow = (
          line.includes('|') ||
          line.includes('\t') ||
          (line.split(/\s{2,}/).length >= 3) ||
          /^\s*[\d.,]+\s+[\w\s]+\s+[\d.,]+\s*$/.test(line) // Number, text, number pattern
        );

        if (isTableRow && !inTable) {
          // Start of table
          tableStart = i;
          tableHeader = line;
          tableRows = [];
          inTable = true;
        } else if (isTableRow && inTable) {
          // Table row
          tableRows.push(line);
        } else if (!isTableRow && inTable) {
          // End of table
          tableEnd = i - 1;
          inTable = false;

          // Add table if it has enough rows
          if (tableRows.length >= 2) { // At least 2 data rows
            tables.push({
              source: 'text',
              startLine: tableStart,
              endLine: tableEnd,
              header: tableHeader,
              rows: tableRows,
              text: [tableHeader, ...tableRows].join('\n')
            });
          }

          // Reset table data
          tableHeader = '';
          tableRows = [];
        }
      }

      // Check if we're still in a table at the end
      if (inTable && tableRows.length >= 2) {
        tableEnd = lines.length - 1;

        // Add table
        tables.push({
          source: 'text',
          startLine: tableStart,
          endLine: tableEnd,
          header: tableHeader,
          rows: tableRows,
          text: [tableHeader, ...tableRows].join('\n')
        });
      }

      console.log(`Extracted ${tables.length} tables with text-based detection`);
    }

    return tables;
  } catch (error) {
    console.error('Error identifying tables:', error);

    // Fall back to empty tables array
    return [];
  }
};

/**
 * Identify headers and footers in pages
 * @param {Array<object>} pages - Page information
 * @returns {object} Headers and footers
 */
const identifyHeadersAndFooters = (pages) => {
  // This is a simplified implementation
  // In a real implementation, we would use a more sophisticated approach

  const headers = [];
  const footers = [];

  // Need at least 3 pages to reliably detect headers and footers
  if (pages.length < 3) {
    return { headers, footers };
  }

  // Check for headers (first line of each page)
  const headerCandidates = pages.map(page => {
    const lines = page.text.split('\n');
    return lines.length > 0 ? lines[0].trim() : '';
  });

  // Check for footers (last line of each page)
  const footerCandidates = pages.map(page => {
    const lines = page.text.split('\n');
    return lines.length > 0 ? lines[lines.length - 1].trim() : '';
  });

  // Check if headers are similar across pages
  const headerSimilarity = calculateSimilarity(headerCandidates);
  if (headerSimilarity > 0.5) {
    headers.push(...headerCandidates);
  }

  // Check if footers are similar across pages
  const footerSimilarity = calculateSimilarity(footerCandidates);
  if (footerSimilarity > 0.5) {
    footers.push(...footerCandidates);
  }

  return { headers, footers };
};

/**
 * Calculate similarity between strings
 * @param {Array<string>} strings - Strings to compare
 * @returns {number} Similarity score (0-1)
 */
const calculateSimilarity = (strings) => {
  // This is a simplified implementation
  // In a real implementation, we would use a more sophisticated approach

  // Count how many strings are similar to the first string
  const firstString = strings[0];
  let similarCount = 0;

  for (let i = 1; i < strings.length; i++) {
    const string = strings[i];

    // Check if string is similar to first string
    if (
      string === firstString ||
      string.includes(firstString) ||
      firstString.includes(string) ||
      levenshteinDistance(string, firstString) / Math.max(string.length, firstString.length) < 0.3
    ) {
      similarCount++;
    }
  }

  // Calculate similarity score
  return similarCount / (strings.length - 1);
};

/**
 * Calculate Levenshtein distance between two strings
 * @param {string} a - First string
 * @param {string} b - Second string
 * @returns {number} Levenshtein distance
 */
const levenshteinDistance = (a, b) => {
  const matrix = [];

  // Initialize matrix
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  // Fill matrix
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // Substitution
          matrix[i][j - 1] + 1,     // Insertion
          matrix[i - 1][j] + 1      // Deletion
        );
      }
    }
  }

  return matrix[b.length][a.length];
};

/**
 * Identify document sections
 * @param {string} text - Document text
 * @returns {Array<object>} Document sections
 */
const identifyDocumentSections = (text) => {
  // This is a simplified implementation
  // In a real implementation, we would use a more sophisticated approach

  const sections = [];
  const lines = text.split('\n');

  let currentSection = null;
  let sectionContent = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Skip empty lines
    if (!line) {
      continue;
    }

    // Check if line looks like a section header
    const isSectionHeader = (
      line.length < 100 && // Not too long
      line === line.toUpperCase() || // All uppercase
      /^[0-9]+\.\s+[A-Z]/.test(line) || // Numbered section
      /^[A-Z][a-z]+(\s+[A-Z][a-z]+){0,3}:/.test(line) // Title with colon
    );

    if (isSectionHeader) {
      // Save previous section
      if (currentSection && sectionContent.length > 0) {
        sections.push({
          title: currentSection,
          content: sectionContent.join('\n'),
          startLine: i - sectionContent.length,
          endLine: i - 1
        });
      }

      // Start new section
      currentSection = line;
      sectionContent = [];
    } else if (currentSection) {
      // Add line to current section
      sectionContent.push(line);
    }
  }

  // Save last section
  if (currentSection && sectionContent.length > 0) {
    sections.push({
      title: currentSection,
      content: sectionContent.join('\n'),
      startLine: lines.length - sectionContent.length,
      endLine: lines.length - 1
    });
  }

  return sections;
};

module.exports = {
  parsePdf,
  identifyTables,
  identifyHeadersAndFooters,
  identifyDocumentSections
};
