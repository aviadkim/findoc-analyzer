/**
 * PDF Processing Service
 *
 * This service provides functionality for extracting text, tables, and metadata from PDF documents.
 */

const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const { isOcrAvailable, processPdfWithOcr } = require('./ocr-integration');

/**
 * Process a PDF document
 * @param {string} filePath - Path to the PDF file
 * @param {object} options - Processing options
 * @param {boolean} options.useOcr - Whether to use OCR
 * @returns {Promise<object>} - Extracted content
 */
async function processPdf(filePath, options = {}) {
  try {
    console.log(`Processing PDF: ${filePath}`);

    // Check if OCR should be used
    const useOcr = options.useOcr || false;
    const ocrAvailable = await isOcrAvailable();

    // If OCR is requested and available, use it
    if (useOcr && ocrAvailable) {
      console.log('Using OCR to process PDF');
      return await processPdfWithOcr(filePath);
    }

    // Extract text
    let text = '';
    try {
      text = await extractText(filePath);

      // If text extraction failed or returned very little text, try OCR if available
      if ((!text || text.length < 100) && ocrAvailable) {
        console.log('Text extraction returned little or no text, trying OCR');
        return await processPdfWithOcr(filePath);
      }
    } catch (error) {
      console.error(`Error extracting text from PDF: ${error.message}`);

      // If text extraction failed, try OCR if available
      if (ocrAvailable) {
        console.log('Text extraction failed, trying OCR');
        return await processPdfWithOcr(filePath);
      }

      // Otherwise continue with empty text
      text = '';
    }

    // Extract tables using our enhanced table detection and extraction
    let tables = [];
    try {
      if (text) {
        // Import table detector and extractor dynamically to avoid circular dependencies
        const { detectTables } = require('./table-detector');
        const { extractTables: extractTablesFromText } = require('./table-extractor');

        const tableRegions = detectTables(text);
        tables = extractTablesFromText(text, tableRegions);
        console.log(`Detected and extracted ${tables.length} tables`);
      }
    } catch (error) {
      console.error(`Error extracting tables from PDF: ${error.message}`);
      // Continue with empty tables

      // Fallback to basic table extraction
      try {
        if (text) {
          tables = await extractTables(filePath, text);
        }
      } catch (fallbackError) {
        console.error(`Fallback table extraction also failed: ${fallbackError.message}`);
      }
    }

    // Extract metadata
    let metadata = {
      title: path.basename(filePath),
      author: 'Unknown',
      pages: 0
    };

    try {
      metadata = await extractMetadata(filePath);
    } catch (error) {
      console.error(`Error extracting metadata from PDF: ${error.message}`);
      // Continue with default metadata
    }

    return {
      text,
      tables,
      metadata
    };
  } catch (error) {
    console.error('Error processing PDF:', error);
    throw error;
  }
}

/**
 * Extract text from a PDF document
 * @param {string} filePath - Path to the PDF file
 * @returns {Promise<string>} - Extracted text
 */
async function extractText(filePath) {
  try {
    console.log(`Extracting text from PDF: ${filePath}`);

    // Read the PDF file
    const dataBuffer = fs.readFileSync(filePath);

    // Parse the PDF
    const data = await pdfParse(dataBuffer);

    return data.text;
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw error;
  }
}

/**
 * Extract tables from a PDF document
 * @param {string} filePath - Path to the PDF file
 * @param {string} text - Extracted text from the PDF
 * @returns {Promise<Array>} - Extracted tables
 */
async function extractTables(filePath, text) {
  try {
    console.log(`Extracting tables from PDF: ${filePath}`);

    // Extract tables from the page data
    const tables = [];

    // Simple table detection based on text patterns
    // This is a basic implementation and can be improved with more sophisticated algorithms

    // Split text into lines
    const lines = text.split('\n').filter(line => line.trim() !== '');

    // Find potential table headers (lines with multiple separators)
    const potentialHeaders = lines.filter(line => {
      const separators = line.match(/[|,\t]/g);
      return separators && separators.length > 2;
    });

    // Process each potential header
    for (const header of potentialHeaders) {
      // Determine the separator
      let separator = '|';
      if (header.includes(',') && !header.includes('|')) {
        separator = ',';
      } else if (header.includes('\t') && !header.includes('|') && !header.includes(',')) {
        separator = '\t';
      }

      // Get the header index
      const headerIndex = lines.indexOf(header);

      // Skip if header not found
      if (headerIndex === -1) continue;

      // Extract header columns
      const headerColumns = header.split(separator).map(col => col.trim()).filter(col => col !== '');

      // Skip if not enough columns
      if (headerColumns.length < 2) continue;

      // Look for rows with the same separator pattern
      const rows = [];
      let rowIndex = headerIndex + 1;

      while (rowIndex < lines.length) {
        const line = lines[rowIndex];

        // Check if line has the same separator
        if (line.includes(separator)) {
          const columns = line.split(separator).map(col => col.trim()).filter(col => col !== '');

          // Check if the number of columns is similar to the header
          if (columns.length >= headerColumns.length - 1 && columns.length <= headerColumns.length + 1) {
            rows.push(columns);
          } else {
            // If the number of columns is very different, we've probably reached the end of the table
            if (Math.abs(columns.length - headerColumns.length) > 2) {
              break;
            }
          }
        } else {
          // If the line doesn't have the separator, we've probably reached the end of the table
          break;
        }

        rowIndex++;
      }

      // Skip if not enough rows
      if (rows.length < 1) continue;

      // Add the table
      tables.push({
        title: findTableTitle(lines, headerIndex),
        headers: headerColumns,
        rows
      });
    }

    return tables;
  } catch (error) {
    console.error('Error extracting tables from PDF:', error);
    return [];
  }
}

/**
 * Find a table title
 * @param {Array} lines - Lines of text
 * @param {number} headerIndex - Index of the table header
 * @returns {string} - Table title
 */
function findTableTitle(lines, headerIndex) {
  // Look for a title in the lines before the header
  for (let i = headerIndex - 1; i >= Math.max(0, headerIndex - 5); i--) {
    const line = lines[i].trim();

    // Skip empty lines and lines that look like part of a table
    if (line === '' || line.includes('|') || line.includes(',') || line.includes('\t')) {
      continue;
    }

    // Check if the line looks like a title (not too long, starts with a capital letter)
    if (line.length < 100 && /^[A-Z]/.test(line)) {
      return line;
    }
  }

  return `Table ${headerIndex + 1}`;
}

/**
 * Extract metadata from a PDF document
 * @param {string} filePath - Path to the PDF file
 * @returns {Promise<object>} - Extracted metadata
 */
async function extractMetadata(filePath) {
  try {
    console.log(`Extracting metadata from PDF: ${filePath}`);

    // Read the PDF file
    const dataBuffer = fs.readFileSync(filePath);

    // Parse the PDF
    const data = await pdfParse(dataBuffer, { max: 1 }); // Only parse first page for metadata

    // Extract metadata
    const metadata = {
      title: data.info?.Title || path.basename(filePath),
      author: data.info?.Author || 'Unknown',
      subject: data.info?.Subject || '',
      keywords: data.info?.Keywords || '',
      creator: data.info?.Creator || '',
      producer: data.info?.Producer || '',
      pages: data.numpages || 0
    };

    // Safely parse dates
    try {
      if (data.info?.CreationDate) {
        metadata.creationDate = new Date(data.info.CreationDate).toISOString();
      } else {
        metadata.creationDate = '';
      }
    } catch (dateError) {
      console.error('Error parsing creation date:', dateError.message);
      metadata.creationDate = '';
    }

    try {
      if (data.info?.ModDate) {
        metadata.modificationDate = new Date(data.info.ModDate).toISOString();
      } else {
        metadata.modificationDate = '';
      }
    } catch (dateError) {
      console.error('Error parsing modification date:', dateError.message);
      metadata.modificationDate = '';
    }

    return metadata;
  } catch (error) {
    console.error('Error extracting metadata from PDF:', error);
    return {
      title: path.basename(filePath),
      author: 'Unknown',
      pages: 0,
      creationDate: '',
      modificationDate: ''
    };
  }
}

/**
 * Extract tables from a PDF file (public API)
 * @param {string} filePath - Path to the PDF file
 * @returns {Promise<Array>} - Extracted tables
 */
async function extractTablesFromPdf(filePath) {
  try {
    console.log(`Extracting tables from PDF: ${filePath}`);

    // Extract text from PDF
    const text = await extractText(filePath);

    // Extract tables from text
    return await extractTables(filePath, text);
  } catch (error) {
    console.error(`Error extracting tables from PDF: ${error.message}`);
    return [];
  }
}

/**
 * Extract text from PDF with a specific page range
 * @param {string} filePath - Path to the PDF file
 * @param {number} startPage - Starting page (1-based index)
 * @param {number} endPage - Ending page (inclusive)
 * @returns {Promise<string>} - Extracted text
 */
async function extractTextFromPageRange(filePath, startPage, endPage) {
  try {
    console.log(`Extracting text from PDF pages ${startPage}-${endPage}: ${filePath}`);

    // Read the PDF file
    const dataBuffer = fs.readFileSync(filePath);

    // Parse the PDF
    const data = await pdfParse(dataBuffer, {
      max: endPage,
      min: startPage
    });

    return data.text;
  } catch (error) {
    console.error(`Error extracting text from PDF pages: ${error.message}`);
    throw error;
  }
}

/**
 * Extract text from a specific PDF page
 * @param {string} filePath - Path to the PDF file
 * @param {number} pageNum - Page number (1-based index)
 * @returns {Promise<string>} - Extracted text
 */
async function extractTextFromPage(filePath, pageNum) {
  return extractTextFromPageRange(filePath, pageNum, pageNum);
}

module.exports = {
  processPdf,
  extractText,
  extractTextFromPdf: extractText, // Alias for compatibility
  extractTables,
  extractTablesFromPdf,
  extractMetadata,
  extractMetadataFromPdf: extractMetadata, // Alias for compatibility
  extractTextFromPage,
  extractTextFromPageRange
};
