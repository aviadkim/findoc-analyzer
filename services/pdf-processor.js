/**
 * PDF Processing Service
 * 
 * This service provides functionality for extracting text, tables, and metadata from PDF documents.
 */

const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const { PdfExtract } = require('pdf.js-extract');
const pdfExtract = new PdfExtract();

/**
 * Process a PDF document
 * @param {string} filePath - Path to the PDF file
 * @returns {Promise<object>} - Extracted content
 */
async function processPdf(filePath) {
  try {
    console.log(`Processing PDF: ${filePath}`);
    
    // Extract text
    const text = await extractText(filePath);
    
    // Extract tables
    const tables = await extractTables(filePath, text);
    
    // Extract metadata
    const metadata = await extractMetadata(filePath);
    
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
    
    // Use pdf.js-extract to get page data
    const data = await pdfExtract.extract(filePath, {});
    
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
    const data = await pdfParse(dataBuffer);
    
    // Extract metadata
    const metadata = {
      title: data.info.Title || path.basename(filePath),
      author: data.info.Author || 'Unknown',
      subject: data.info.Subject || '',
      keywords: data.info.Keywords || '',
      creator: data.info.Creator || '',
      producer: data.info.Producer || '',
      creationDate: data.info.CreationDate ? new Date(data.info.CreationDate).toISOString() : '',
      modificationDate: data.info.ModDate ? new Date(data.info.ModDate).toISOString() : '',
      pages: data.numpages
    };
    
    return metadata;
  } catch (error) {
    console.error('Error extracting metadata from PDF:', error);
    return {
      title: path.basename(filePath),
      author: 'Unknown',
      pages: 0
    };
  }
}

module.exports = {
  processPdf,
  extractText,
  extractTables,
  extractMetadata
};
