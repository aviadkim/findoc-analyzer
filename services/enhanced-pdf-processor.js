/**
 * Enhanced PDF Processing Service
 *
 * This service provides improved functionality for extracting text, tables, and metadata from PDF documents.
 * It addresses issues with text extraction and improves entity recognition.
 */

const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const { isOcrAvailable, processPdfWithOcr } = require('./ocr-integration');

/**
 * Process a PDF document with enhanced extraction
 * @param {string} filePath - Path to the PDF file
 * @param {object} options - Processing options
 * @param {boolean} options.useOcr - Whether to use OCR
 * @param {boolean} options.forceOcr - Force using OCR even if text extraction works
 * @param {boolean} options.extractEntities - Whether to extract entities
 * @param {boolean} options.extractTables - Whether to extract tables
 * @returns {Promise<object>} - Extracted content
 */
async function processEnhancedPdf(filePath, options = {}) {
  try {
    console.log(`Processing PDF with enhanced extraction: ${filePath}`);

    // Default options
    const useOcr = options.useOcr || false;
    const forceOcr = options.forceOcr || false;
    const extractEntities = options.extractEntities !== false;
    const extractTables = options.extractTables !== false;
    
    const ocrAvailable = await isOcrAvailable();

    // Prepare result object
    const result = {
      text: '',
      tables: [],
      entities: [],
      metadata: {
        title: path.basename(filePath),
        author: 'Unknown',
        pages: 0
      }
    };

    // Force OCR if requested and available
    if (forceOcr && ocrAvailable) {
      console.log('Forcing OCR processing');
      const ocrResult = await processPdfWithOcr(filePath);
      result.text = ocrResult.text || '';
      result.tables = ocrResult.tables || [];
    } 
    // Use OCR if requested and available
    else if (useOcr && ocrAvailable) {
      console.log('Using OCR as requested');
      const ocrResult = await processPdfWithOcr(filePath);
      result.text = ocrResult.text || '';
      result.tables = ocrResult.tables || [];
    } 
    // Otherwise try standard extraction first
    else {
      try {
        // Extract text using standard method
        result.text = await extractTextFromAllPages(filePath);
        
        // If text extraction returned very little text and OCR is available, use OCR as fallback
        if ((!result.text || result.text.length < 100) && ocrAvailable) {
          console.log('Text extraction returned little or no text, using OCR as fallback');
          const ocrResult = await processPdfWithOcr(filePath);
          result.text = ocrResult.text || '';
          result.tables = ocrResult.tables || [];
        }
      } catch (error) {
        console.error(`Error in standard text extraction: ${error.message}`);
        
        // If standard extraction failed and OCR is available, use OCR as fallback
        if (ocrAvailable) {
          console.log('Standard text extraction failed, using OCR as fallback');
          const ocrResult = await processPdfWithOcr(filePath);
          result.text = ocrResult.text || '';
          result.tables = ocrResult.tables || [];
        }
      }
    }

    // Extract tables if not already extracted via OCR and extraction is requested
    if (extractTables && result.tables.length === 0) {
      try {
        console.log('Extracting tables from text...');
        // Import table detector and extractor dynamically to avoid circular dependencies
        const { detectTables } = require('./table-detector');
        const { extractTables: extractTablesFromText } = require('./table-extractor');

        // Try enhanced table detection first
        const tableRegions = detectTables(result.text);
        result.tables = extractTablesFromText(result.text, tableRegions);
        console.log(`Detected and extracted ${result.tables.length} tables with enhanced method`);

        // If no tables found, try fallback method
        if (result.tables.length === 0) {
          result.tables = await extractTablesWithFallback(filePath, result.text);
        }
      } catch (error) {
        console.error(`Error extracting tables: ${error.message}`);
        // Try fallback method
        try {
          result.tables = await extractTablesWithFallback(filePath, result.text);
        } catch (fallbackError) {
          console.error(`Fallback table extraction also failed: ${fallbackError.message}`);
        }
      }
    }

    // Extract metadata
    try {
      result.metadata = await extractEnhancedMetadata(filePath);
    } catch (error) {
      console.error(`Error extracting metadata: ${error.message}`);
      // Continue with default metadata
    }

    // Extract entities if requested
    if (extractEntities) {
      try {
        const { extractEntities } = require('./entity-extractor');
        result.entities = await extractEntities(result.text, result.tables);
      } catch (error) {
        console.error(`Error extracting entities: ${error.message}`);
        // Continue with empty entities
      }
    }

    return result;
  } catch (error) {
    console.error('Error in enhanced PDF processing:', error);
    throw error;
  }
}

/**
 * Extract text from all pages of a PDF document
 * @param {string} filePath - Path to the PDF file
 * @returns {Promise<string>} - Extracted text
 */
async function extractTextFromAllPages(filePath) {
  try {
    console.log(`Extracting text from all pages: ${filePath}`);

    // Read the PDF file
    const dataBuffer = fs.readFileSync(filePath);

    // Custom rendering options to improve text extraction
    const options = {
      pagerender: renderPage
    };

    // Parse the PDF with custom rendering
    const data = await pdfParse(dataBuffer, options);
    
    return data.text;
  } catch (error) {
    console.error('Error extracting text from all pages:', error);
    throw error;
  }
}

/**
 * Custom page renderer to improve text extraction
 * @param {object} pageData - Page data from pdf-parse
 * @returns {Promise<string>} - Rendered text
 */
function renderPage(pageData) {
  // Check if the page has content
  if (!pageData || !pageData.getTextContent) {
    return Promise.resolve('');
  }

  return pageData.getTextContent({
    normalizeWhitespace: true,
    disableCombineTextItems: false
  })
  .then(textContent => {
    let lastY;
    let text = '';
    
    // Process each text item
    for (const item of textContent.items) {
      if (lastY === item.transform[5] || !lastY) {
        text += item.str;
      } else {
        text += '\\n' + item.str;
      }
      lastY = item.transform[5];
    }
    
    // Replace escaped newlines with actual newlines
    return text.replace(/\\n/g, '\\n');
  });
}

/**
 * Extract tables using fallback method
 * @param {string} filePath - Path to the PDF file
 * @param {string} text - Extracted text
 * @returns {Promise<Array>} - Extracted tables
 */
async function extractTablesWithFallback(filePath, text) {
  try {
    console.log(`Using fallback table extraction for: ${filePath}`);

    // Split text into lines
    const lines = text.split('\\n').filter(line => line.trim() !== '');
    const tables = [];

    // Find potential table headers (lines with multiple separators)
    const potentialHeaders = lines.filter(line => {
      const separators = line.match(/[|,\\t]/g);
      return separators && separators.length > 2;
    });

    // Process each potential header
    for (const header of potentialHeaders) {
      // Determine the separator
      let separator = '|';
      if (header.includes(',') && !header.includes('|')) {
        separator = ',';
      } else if (header.includes('\\t') && !header.includes('|') && !header.includes(',')) {
        separator = '\\t';
      }

      // Get the header index
      const headerIndex = lines.indexOf(header);
      if (headerIndex === -1) continue;

      // Extract header columns
      const headerColumns = header.split(separator).map(col => col.trim()).filter(col => col !== '');
      if (headerColumns.length < 2) continue;

      // Look for rows with the same separator pattern
      const rows = [];
      let rowIndex = headerIndex + 1;
      let consecNonTableRows = 0;
      const MAX_NON_TABLE_ROWS = 2; // Allow up to 2 non-matching rows

      while (rowIndex < lines.length && consecNonTableRows < MAX_NON_TABLE_ROWS) {
        const line = lines[rowIndex];
        
        // Check if line has the same separator
        if (line.includes(separator)) {
          const columns = line.split(separator).map(col => col.trim()).filter(col => col !== '');
          
          // Check if the number of columns is similar to the header
          if (Math.abs(columns.length - headerColumns.length) <= 2) {
            rows.push(columns);
            consecNonTableRows = 0; // Reset counter
          } else {
            consecNonTableRows++;
          }
        } else {
          consecNonTableRows++;
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
    console.error('Error in fallback table extraction:', error);
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
    if (line === '' || line.includes('|') || line.includes(',') || line.includes('\\t')) {
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
 * Extract enhanced metadata from a PDF document
 * @param {string} filePath - Path to the PDF file
 * @returns {Promise<object>} - Extracted metadata
 */
async function extractEnhancedMetadata(filePath) {
  try {
    console.log(`Extracting enhanced metadata from: ${filePath}`);

    // Read the PDF file
    const dataBuffer = fs.readFileSync(filePath);

    // Parse the PDF
    const data = await pdfParse(dataBuffer, { max: 1 }); // Only parse first page for metadata

    // Get file stats
    const stats = fs.statSync(filePath);

    // Extract metadata
    const metadata = {
      title: data.info?.Title || path.basename(filePath),
      author: data.info?.Author || 'Unknown',
      subject: data.info?.Subject || '',
      keywords: data.info?.Keywords || '',
      creator: data.info?.Creator || '',
      producer: data.info?.Producer || '',
      pages: data.numpages || 0,
      fileSize: stats.size,
      fileName: path.basename(filePath),
      fileExt: path.extname(filePath).toLowerCase().slice(1)
    };

    // Safely parse dates
    try {
      if (data.info?.CreationDate) {
        metadata.creationDate = new Date(data.info.CreationDate).toISOString();
      } else {
        metadata.creationDate = new Date(stats.birthtime).toISOString();
      }
    } catch (dateError) {
      console.error('Error parsing creation date:', dateError.message);
      metadata.creationDate = new Date(stats.birthtime).toISOString();
    }

    try {
      if (data.info?.ModDate) {
        metadata.modificationDate = new Date(data.info.ModDate).toISOString();
      } else {
        metadata.modificationDate = new Date(stats.mtime).toISOString();
      }
    } catch (dateError) {
      console.error('Error parsing modification date:', dateError.message);
      metadata.modificationDate = new Date(stats.mtime).toISOString();
    }

    return metadata;
  } catch (error) {
    console.error('Error extracting enhanced metadata:', error);
    return {
      title: path.basename(filePath),
      author: 'Unknown',
      pages: 0,
      fileName: path.basename(filePath),
      fileExt: path.extname(filePath).toLowerCase().slice(1),
      creationDate: '',
      modificationDate: ''
    };
  }
}

/**
 * Extract text from a specific page range
 * @param {string} filePath - Path to the PDF file
 * @param {number} startPage - Starting page number (1-based)
 * @param {number} endPage - Ending page number (1-based)
 * @returns {Promise<string>} - Extracted text
 */
async function extractTextFromPageRange(filePath, startPage, endPage) {
  try {
    console.log(`Extracting text from pages ${startPage}-${endPage}: ${filePath}`);

    // Read the PDF file
    const dataBuffer = fs.readFileSync(filePath);

    // Custom rendering options to improve text extraction
    const options = {
      pagerender: renderPage,
      max: endPage,
      min: startPage
    };

    // Parse the PDF with custom rendering
    const data = await pdfParse(dataBuffer, options);
    
    return data.text;
  } catch (error) {
    console.error(`Error extracting text from page range: ${error.message}`);
    throw error;
  }
}

module.exports = {
  processEnhancedPdf,
  extractTextFromAllPages,
  extractTablesWithFallback,
  extractEnhancedMetadata,
  extractTextFromPageRange
};