/**
 * Document Processor for FinDoc Analyzer
 * 
 * This module provides functions for processing financial documents,
 * including PDF parsing, text extraction, table extraction, and metadata extraction.
 */

const fs = require('fs');
const path = require('path');
const { PDFExtract } = require('pdf.js-extract');
const pdfExtract = new PDFExtract();
const { PDFDocument } = require('pdf-lib');
const csvParser = require('csv-parser');
const xlsx = require('xlsx');
const { v4: uuidv4 } = require('uuid');

// Configuration
const EXTRACTION_TIMEOUT = 60000; // 60 seconds timeout for extraction

/**
 * Process a document file
 * @param {string} filePath - Path to the document file
 * @param {string} documentType - Type of document (e.g., 'portfolio', 'financial', 'tax')
 * @returns {Promise<Object>} - Processed document data
 */
async function processDocument(filePath, documentType) {
  console.log(`Processing document: ${filePath}, type: ${documentType}`);
  
  const startTime = Date.now();
  const fileExtension = path.extname(filePath).toLowerCase();
  
  let result = {
    id: uuidv4(),
    filePath,
    fileName: path.basename(filePath),
    fileExtension,
    documentType,
    processingTime: 0,
    processed: false,
    status: 'processing',
    message: 'Document processing started',
    metadata: {},
    content: {
      text: '',
      pages: [],
      tables: [],
      securities: []
    }
  };
  
  try {
    // Process based on file extension
    if (fileExtension === '.pdf') {
      result = await processPdf(filePath, result);
    } else if (fileExtension === '.csv') {
      result = await processCsv(filePath, result);
    } else if (['.xlsx', '.xls'].includes(fileExtension)) {
      result = await processExcel(filePath, result);
    } else {
      throw new Error(`Unsupported file extension: ${fileExtension}`);
    }
    
    // Extract securities information
    result.content.securities = await extractSecurities(result.content.text, result.content.tables);
    
    // Update processing status
    result.processed = true;
    result.status = 'completed';
    result.message = 'Document processed successfully';
    result.processingTime = Date.now() - startTime;
    
    return result;
  } catch (error) {
    console.error('Error processing document:', error);
    
    result.processed = false;
    result.status = 'error';
    result.message = `Error processing document: ${error.message}`;
    result.processingTime = Date.now() - startTime;
    
    return result;
  }
}

/**
 * Process a PDF document
 * @param {string} filePath - Path to the PDF file
 * @param {Object} result - Initial result object
 * @returns {Promise<Object>} - Processed PDF data
 */
async function processPdf(filePath, result) {
  console.log(`Processing PDF: ${filePath}`);
  
  try {
    // Extract PDF data with timeout
    const extractionPromise = pdfExtract.extract(filePath, {});
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('PDF extraction timeout')), EXTRACTION_TIMEOUT)
    );
    
    const data = await Promise.race([extractionPromise, timeoutPromise]);
    
    // Extract metadata
    result.metadata = {
      pageCount: data.pages.length,
      version: data.meta.info.PDFFormatVersion,
      isEncrypted: data.meta.info.IsEncrypted || false,
      author: data.meta.info.Author || '',
      creator: data.meta.info.Creator || '',
      producer: data.meta.info.Producer || '',
      creationDate: data.meta.info.CreationDate || '',
      modificationDate: data.meta.info.ModDate || ''
    };
    
    // Extract text content
    let fullText = '';
    const pages = [];
    
    for (let i = 0; i < data.pages.length; i++) {
      const page = data.pages[i];
      const pageText = page.content.map(item => item.str).join(' ');
      
      fullText += pageText + ' ';
      
      pages.push({
        pageNumber: i + 1,
        text: pageText,
        width: page.width,
        height: page.height
      });
    }
    
    result.content.text = fullText.trim();
    result.content.pages = pages;
    
    // Extract tables
    result.content.tables = await extractTablesFromPdf(data);
    
    return result;
  } catch (error) {
    console.error('Error processing PDF:', error);
    throw error;
  }
}

/**
 * Process a CSV document
 * @param {string} filePath - Path to the CSV file
 * @param {Object} result - Initial result object
 * @returns {Promise<Object>} - Processed CSV data
 */
async function processCsv(filePath, result) {
  console.log(`Processing CSV: ${filePath}`);
  
  return new Promise((resolve, reject) => {
    const rows = [];
    
    fs.createReadStream(filePath)
      .pipe(csvParser())
      .on('data', (row) => {
        rows.push(row);
      })
      .on('end', () => {
        try {
          // Extract metadata
          result.metadata = {
            rowCount: rows.length,
            columnCount: rows.length > 0 ? Object.keys(rows[0]).length : 0,
            columns: rows.length > 0 ? Object.keys(rows[0]) : []
          };
          
          // Convert to text
          let fullText = '';
          for (const row of rows) {
            fullText += Object.values(row).join(' ') + ' ';
          }
          
          result.content.text = fullText.trim();
          
          // Add as table
          result.content.tables = [{
            id: uuidv4(),
            name: 'CSV Data',
            headers: result.metadata.columns,
            rows: rows.map(row => result.metadata.columns.map(col => row[col]))
          }];
          
          resolve(result);
        } catch (error) {
          reject(error);
        }
      })
      .on('error', (error) => {
        reject(error);
      });
  });
}

/**
 * Process an Excel document
 * @param {string} filePath - Path to the Excel file
 * @param {Object} result - Initial result object
 * @returns {Promise<Object>} - Processed Excel data
 */
async function processExcel(filePath, result) {
  console.log(`Processing Excel: ${filePath}`);
  
  try {
    const workbook = xlsx.readFile(filePath);
    const sheetNames = workbook.SheetNames;
    
    // Extract metadata
    result.metadata = {
      sheetCount: sheetNames.length,
      sheetNames: sheetNames
    };
    
    // Process each sheet
    let fullText = '';
    const tables = [];
    
    for (const sheetName of sheetNames) {
      const sheet = workbook.Sheets[sheetName];
      const jsonData = xlsx.utils.sheet_to_json(sheet, { header: 1 });
      
      if (jsonData.length > 0) {
        // Extract headers (first row)
        const headers = jsonData[0].map(header => header ? header.toString() : '');
        
        // Extract rows (remaining rows)
        const rows = jsonData.slice(1).map(row => {
          // Ensure all rows have the same length as headers
          const paddedRow = [...row];
          while (paddedRow.length < headers.length) {
            paddedRow.push('');
          }
          return paddedRow.map(cell => cell ? cell.toString() : '');
        });
        
        // Add to tables
        tables.push({
          id: uuidv4(),
          name: sheetName,
          headers,
          rows
        });
        
        // Add to text
        for (const row of jsonData) {
          fullText += row.join(' ') + ' ';
        }
      }
    }
    
    result.content.text = fullText.trim();
    result.content.tables = tables;
    
    return result;
  } catch (error) {
    console.error('Error processing Excel:', error);
    throw error;
  }
}

/**
 * Extract tables from PDF data
 * @param {Object} pdfData - PDF data from pdf.js-extract
 * @returns {Promise<Array>} - Extracted tables
 */
async function extractTablesFromPdf(pdfData) {
  console.log('Extracting tables from PDF');
  
  try {
    const tables = [];
    
    // Process each page
    for (let pageIndex = 0; pageIndex < pdfData.pages.length; pageIndex++) {
      const page = pdfData.pages[pageIndex];
      
      // Group text items by their y-position (rows)
      const rows = {};
      
      for (const item of page.content) {
        // Round y-position to nearest integer to group items in the same row
        const yPos = Math.round(item.y);
        
        if (!rows[yPos]) {
          rows[yPos] = [];
        }
        
        rows[yPos].push(item);
      }
      
      // Sort rows by y-position (top to bottom)
      const sortedYPositions = Object.keys(rows).map(Number).sort((a, b) => a - b);
      
      // Detect potential tables (consecutive rows with similar structure)
      let tableStart = -1;
      let tableEnd = -1;
      let prevRowItemCount = -1;
      
      for (let i = 0; i < sortedYPositions.length; i++) {
        const yPos = sortedYPositions[i];
        const rowItemCount = rows[yPos].length;
        
        // Sort items in row by x-position (left to right)
        rows[yPos].sort((a, b) => a.x - b.x);
        
        // Check if this row has similar structure to previous row
        if (rowItemCount >= 3 && (rowItemCount === prevRowItemCount || prevRowItemCount === -1)) {
          if (tableStart === -1) {
            tableStart = i;
          }
          tableEnd = i;
        } else if (tableStart !== -1) {
          // End of potential table
          if (tableEnd - tableStart >= 2) { // At least 3 rows
            const extractedTable = extractTableFromRows(
              sortedYPositions.slice(tableStart, tableEnd + 1).map(yPos => rows[yPos]),
              pageIndex + 1
            );
            
            if (extractedTable) {
              tables.push(extractedTable);
            }
          }
          
          tableStart = -1;
          tableEnd = -1;
        }
        
        prevRowItemCount = rowItemCount;
      }
      
      // Check if there's a table at the end
      if (tableStart !== -1 && tableEnd - tableStart >= 2) {
        const extractedTable = extractTableFromRows(
          sortedYPositions.slice(tableStart, tableEnd + 1).map(yPos => rows[yPos]),
          pageIndex + 1
        );
        
        if (extractedTable) {
          tables.push(extractedTable);
        }
      }
    }
    
    return tables;
  } catch (error) {
    console.error('Error extracting tables from PDF:', error);
    return [];
  }
}

/**
 * Extract a table from rows of text items
 * @param {Array} rows - Rows of text items
 * @param {number} pageNumber - Page number
 * @returns {Object|null} - Extracted table or null if not a valid table
 */
function extractTableFromRows(rows, pageNumber) {
  if (rows.length < 3) {
    return null;
  }
  
  try {
    // Determine column positions by analyzing all rows
    const xPositions = new Set();
    
    for (const row of rows) {
      for (const item of row) {
        xPositions.add(Math.round(item.x));
      }
    }
    
    const sortedXPositions = Array.from(xPositions).sort((a, b) => a - b);
    
    if (sortedXPositions.length < 2) {
      return null;
    }
    
    // Extract headers (first row)
    const headerRow = rows[0];
    const headers = [];
    
    for (let i = 0; i < sortedXPositions.length; i++) {
      const xPos = sortedXPositions[i];
      const nextXPos = sortedXPositions[i + 1] || Number.MAX_VALUE;
      
      // Find items in this column
      const columnItems = headerRow.filter(item => 
        Math.round(item.x) >= xPos && Math.round(item.x) < nextXPos
      );
      
      headers.push(columnItems.map(item => item.str).join(' ') || `Column ${i + 1}`);
    }
    
    // Extract data rows
    const dataRows = [];
    
    for (let rowIndex = 1; rowIndex < rows.length; rowIndex++) {
      const row = rows[rowIndex];
      const dataRow = [];
      
      for (let i = 0; i < sortedXPositions.length; i++) {
        const xPos = sortedXPositions[i];
        const nextXPos = sortedXPositions[i + 1] || Number.MAX_VALUE;
        
        // Find items in this column
        const columnItems = row.filter(item => 
          Math.round(item.x) >= xPos && Math.round(item.x) < nextXPos
        );
        
        dataRow.push(columnItems.map(item => item.str).join(' '));
      }
      
      dataRows.push(dataRow);
    }
    
    return {
      id: uuidv4(),
      name: `Table on page ${pageNumber}`,
      pageNumber,
      headers,
      rows: dataRows
    };
  } catch (error) {
    console.error('Error extracting table from rows:', error);
    return null;
  }
}

/**
 * Extract securities information from text and tables
 * @param {string} text - Document text content
 * @param {Array} tables - Extracted tables
 * @returns {Promise<Array>} - Extracted securities
 */
async function extractSecurities(text, tables) {
  console.log('Extracting securities information');
  
  try {
    const securities = [];
    
    // ISIN pattern: 12 characters, starts with 2 letters followed by letters or numbers
    const isinPattern = /\b([A-Z]{2}[A-Z0-9]{10})\b/g;
    const isinMatches = text.match(isinPattern) || [];
    
    // Extract unique ISINs
    const uniqueIsins = [...new Set(isinMatches)];
    
    // Process each ISIN
    for (const isin of uniqueIsins) {
      // Find context around the ISIN
      const isinIndex = text.indexOf(isin);
      const contextStart = Math.max(0, isinIndex - 100);
      const contextEnd = Math.min(text.length, isinIndex + 100);
      const context = text.substring(contextStart, contextEnd);
      
      // Try to extract security name
      let name = '';
      const nameMatch = context.match(/([A-Z][A-Za-z0-9\s\-\.]{5,50})\s+[A-Z]{2}[A-Z0-9]{10}/);
      
      if (nameMatch) {
        name = nameMatch[1].trim();
      }
      
      // Try to extract quantity
      let quantity = null;
      const quantityPattern = /(\d{1,3}(?:,\d{3})*(?:\.\d+)?)\s+(?:shares|units|pcs)/i;
      const quantityMatch = context.match(quantityPattern);
      
      if (quantityMatch) {
        quantity = parseFloat(quantityMatch[1].replace(/,/g, ''));
      }
      
      // Try to extract price
      let price = null;
      const pricePattern = /(?:price|value|nav)(?:\s+per(?:\s+share)?)?(?:\s*[:=]\s*|\s+of\s+|\s+at\s+)?\s*(\$|€|£)?(\d{1,3}(?:,\d{3})*(?:\.\d+)?)/i;
      const priceMatch = context.match(pricePattern);
      
      if (priceMatch) {
        price = parseFloat(priceMatch[2].replace(/,/g, ''));
        const currency = priceMatch[1] || '';
        
        if (currency) {
          price = { value: price, currency };
        }
      }
      
      // Add to securities
      securities.push({
        id: uuidv4(),
        isin,
        name: name || `Security ${isin}`,
        quantity,
        price,
        context
      });
    }
    
    // Extract securities from tables
    for (const table of tables) {
      // Check if table contains securities information
      const headerText = table.headers.join(' ').toLowerCase();
      
      if (
        headerText.includes('isin') || 
        headerText.includes('security') || 
        headerText.includes('stock') || 
        headerText.includes('bond') ||
        headerText.includes('fund')
      ) {
        // Find ISIN column index
        const isinColumnIndex = table.headers.findIndex(header => 
          header.toLowerCase().includes('isin')
        );
        
        if (isinColumnIndex !== -1) {
          // Find name column index
          const nameColumnIndex = table.headers.findIndex(header => 
            header.toLowerCase().includes('name') || 
            header.toLowerCase().includes('security') ||
            header.toLowerCase().includes('description')
          );
          
          // Find quantity column index
          const quantityColumnIndex = table.headers.findIndex(header => 
            header.toLowerCase().includes('quantity') || 
            header.toLowerCase().includes('shares') ||
            header.toLowerCase().includes('units') ||
            header.toLowerCase().includes('amount')
          );
          
          // Find price column index
          const priceColumnIndex = table.headers.findIndex(header => 
            header.toLowerCase().includes('price') || 
            header.toLowerCase().includes('value') ||
            header.toLowerCase().includes('nav')
          );
          
          // Process each row
          for (const row of table.rows) {
            if (row.length <= isinColumnIndex) {
              continue;
            }
            
            const isin = row[isinColumnIndex];
            
            // Validate ISIN format
            if (!isin.match(/^[A-Z]{2}[A-Z0-9]{10}$/)) {
              continue;
            }
            
            // Check if this ISIN is already in the securities list
            const existingIndex = securities.findIndex(s => s.isin === isin);
            
            if (existingIndex !== -1) {
              // Update existing security with table data
              if (nameColumnIndex !== -1 && row.length > nameColumnIndex) {
                securities[existingIndex].name = row[nameColumnIndex] || securities[existingIndex].name;
              }
              
              if (quantityColumnIndex !== -1 && row.length > quantityColumnIndex) {
                const quantityStr = row[quantityColumnIndex];
                if (quantityStr) {
                  const quantity = parseFloat(quantityStr.replace(/[^0-9.]/g, ''));
                  if (!isNaN(quantity)) {
                    securities[existingIndex].quantity = quantity;
                  }
                }
              }
              
              if (priceColumnIndex !== -1 && row.length > priceColumnIndex) {
                const priceStr = row[priceColumnIndex];
                if (priceStr) {
                  // Extract currency symbol if present
                  const currencyMatch = priceStr.match(/^(\$|€|£)/);
                  const currency = currencyMatch ? currencyMatch[1] : '';
                  
                  // Extract numeric value
                  const price = parseFloat(priceStr.replace(/[^0-9.]/g, ''));
                  
                  if (!isNaN(price)) {
                    securities[existingIndex].price = currency ? 
                      { value: price, currency } : 
                      price;
                  }
                }
              }
            } else {
              // Create new security from table data
              const security = {
                id: uuidv4(),
                isin,
                name: nameColumnIndex !== -1 && row.length > nameColumnIndex ? 
                  row[nameColumnIndex] || `Security ${isin}` : 
                  `Security ${isin}`,
                quantity: null,
                price: null,
                context: `Found in table: ${table.name}`
              };
              
              // Add quantity if available
              if (quantityColumnIndex !== -1 && row.length > quantityColumnIndex) {
                const quantityStr = row[quantityColumnIndex];
                if (quantityStr) {
                  const quantity = parseFloat(quantityStr.replace(/[^0-9.]/g, ''));
                  if (!isNaN(quantity)) {
                    security.quantity = quantity;
                  }
                }
              }
              
              // Add price if available
              if (priceColumnIndex !== -1 && row.length > priceColumnIndex) {
                const priceStr = row[priceColumnIndex];
                if (priceStr) {
                  // Extract currency symbol if present
                  const currencyMatch = priceStr.match(/^(\$|€|£)/);
                  const currency = currencyMatch ? currencyMatch[1] : '';
                  
                  // Extract numeric value
                  const price = parseFloat(priceStr.replace(/[^0-9.]/g, ''));
                  
                  if (!isNaN(price)) {
                    security.price = currency ? 
                      { value: price, currency } : 
                      price;
                  }
                }
              }
              
              securities.push(security);
            }
          }
        }
      }
    }
    
    return securities;
  } catch (error) {
    console.error('Error extracting securities:', error);
    return [];
  }
}

module.exports = {
  processDocument,
  processPdf,
  processCsv,
  processExcel,
  extractTablesFromPdf,
  extractSecurities
};
