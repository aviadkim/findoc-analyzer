/**
 * Spreadsheet Processor Service
 * 
 * Handles XLSX and CSV document processing to extract data and tables
 */

const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');
const csv = require('csv-parser');
const { v4: uuidv4 } = require('uuid');

// Debug flag
const DEBUG = process.env.DEBUG === 'true';

/**
 * Process a spreadsheet document (XLSX or CSV)
 * @param {string} filePath - Path to the spreadsheet file
 * @param {Object} options - Processing options
 * @returns {Promise<Object>} - Processing result
 */
async function processSpreadsheet(filePath, options = {}) {
  try {
    if (DEBUG) console.log(`Processing spreadsheet: ${filePath}`);
    
    const fileExt = path.extname(filePath).toLowerCase().slice(1);
    
    let result;
    if (fileExt === 'xlsx' || fileExt === 'xls') {
      result = await processExcel(filePath, options);
    } else if (fileExt === 'csv') {
      result = await processCsv(filePath, options);
    } else {
      throw new Error(`Unsupported spreadsheet format: ${fileExt}`);
    }
    
    return result;
  } catch (error) {
    console.error(`Error processing spreadsheet: ${error.message}`);
    throw error;
  }
}

/**
 * Process an Excel file
 * @param {string} filePath - Path to the Excel file
 * @param {Object} options - Processing options
 * @returns {Promise<Object>} - Processing result
 */
async function processExcel(filePath, options = {}) {
  try {
    if (DEBUG) console.log(`Processing Excel file: ${filePath}`);
    
    // Read the workbook
    const workbook = XLSX.readFile(filePath);
    
    // Get metadata
    const metadata = extractExcelMetadata(workbook, filePath);
    
    // Get text representation
    const text = extractTextFromExcel(workbook);
    
    // Get tables from sheets
    const tables = extractTablesFromExcel(workbook);
    
    return {
      documentId: uuidv4(),
      metadata,
      text,
      tables
    };
  } catch (error) {
    console.error(`Error processing Excel file: ${error.message}`);
    throw error;
  }
}

/**
 * Process a CSV file
 * @param {string} filePath - Path to the CSV file
 * @param {Object} options - Processing options
 * @returns {Promise<Object>} - Processing result
 */
async function processCsv(filePath, options = {}) {
  try {
    if (DEBUG) console.log(`Processing CSV file: ${filePath}`);
    
    // Get file stats for metadata
    const stats = fs.statSync(filePath);
    
    // Parse CSV to extract data
    const rows = await parseCsvFile(filePath);
    
    // Get headers (first row)
    const headers = rows.length > 0 ? Object.keys(rows[0]) : [];
    
    // Create metadata
    const metadata = {
      filename: path.basename(filePath),
      fileType: 'csv',
      createdAt: stats.birthtime,
      modifiedAt: stats.mtime,
      fileSize: stats.size,
      rowCount: rows.length,
      columnCount: headers.length
    };
    
    // Create text representation
    let text = headers.join(', ') + '\\n';
    rows.forEach(row => {
      text += Object.values(row).join(', ') + '\\n';
    });
    
    // Create table
    const tableRows = rows.map(row => headers.map(header => row[header]));
    
    const tables = [
      {
        name: 'CSV Data',
        headers,
        rows: tableRows
      }
    ];
    
    return {
      documentId: uuidv4(),
      metadata,
      text,
      tables
    };
  } catch (error) {
    console.error(`Error processing CSV file: ${error.message}`);
    throw error;
  }
}

/**
 * Parse a CSV file into rows
 * @param {string} filePath - Path to the CSV file
 * @returns {Promise<Array>} - Parsed rows
 */
function parseCsvFile(filePath) {
  return new Promise((resolve, reject) => {
    const rows = [];
    
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => rows.push(row))
      .on('end', () => resolve(rows))
      .on('error', (error) => reject(error));
  });
}

/**
 * Extract metadata from Excel workbook
 * @param {Object} workbook - XLSX workbook
 * @param {string} filePath - Path to the Excel file
 * @returns {Object} - Extracted metadata
 */
function extractExcelMetadata(workbook, filePath) {
  try {
    // Get file stats
    const stats = fs.statSync(filePath);
    
    // Get workbook properties
    const props = workbook.Props || {};
    
    // Create metadata object
    return {
      filename: path.basename(filePath),
      fileType: path.extname(filePath).toLowerCase().slice(1),
      createdAt: props.CreatedDate || stats.birthtime,
      modifiedAt: props.ModifiedDate || stats.mtime,
      fileSize: stats.size,
      sheetCount: workbook.SheetNames.length,
      sheetNames: workbook.SheetNames,
      title: props.Title || '',
      subject: props.Subject || '',
      author: props.Author || '',
      company: props.Company || ''
    };
  } catch (error) {
    console.error(`Error extracting Excel metadata: ${error.message}`);
    return {
      filename: path.basename(filePath),
      fileType: path.extname(filePath).toLowerCase().slice(1)
    };
  }
}

/**
 * Extract text from Excel workbook
 * @param {Object} workbook - XLSX workbook
 * @returns {string} - Extracted text
 */
function extractTextFromExcel(workbook) {
  try {
    let text = '';
    
    // Process each sheet
    workbook.SheetNames.forEach(sheetName => {
      const sheet = workbook.Sheets[sheetName];
      
      // Add sheet name
      text += `Sheet: ${sheetName}\n`;
      
      // Convert sheet to JSON
      const sheetData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
      
      // Add rows as text
      sheetData.forEach(row => {
        text += row.join('\t') + '\n';
      });
      
      text += '\n';
    });
    
    return text;
  } catch (error) {
    console.error(`Error extracting text from Excel: ${error.message}`);
    return '';
  }
}

/**
 * Extract tables from Excel workbook
 * @param {Object} workbook - XLSX workbook
 * @returns {Array} - Extracted tables
 */
function extractTablesFromExcel(workbook) {
  try {
    const tables = [];

    // Process each sheet as a table
    workbook.SheetNames.forEach(sheetName => {
      const sheet = workbook.Sheets[sheetName];

      // Convert sheet to JSON with headers
      const sheetData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

      // Skip empty sheets
      if (sheetData.length === 0) return;

      // Get headers (first row)
      const headers = sheetData[0].map(cell => String(cell || ''));

      // Get data rows (excluding header)
      const rows = sheetData.slice(1).map(row =>
        row.map(cell => cell !== undefined ? String(cell) : '')
      );

      // Skip if no data rows
      if (rows.length === 0) return;

      // Process special sheets
      if (sheetName === 'Portfolio Holdings') {
        tables.push({
          id: 'portfolio-holdings',
          name: 'Portfolio Holdings',
          title: 'Portfolio Holdings',
          headers,
          rows,
          type: 'portfolio'
        });
      } else if (sheetName === 'Asset Allocation') {
        tables.push({
          id: 'asset-allocation',
          name: 'Asset Allocation',
          title: 'Asset Allocation',
          headers,
          rows,
          type: 'allocation'
        });
      } else if (sheetName === 'Performance') {
        tables.push({
          id: 'performance',
          name: 'Performance',
          title: 'Performance Metrics',
          headers,
          rows,
          type: 'performance'
        });
      } else if (sheetName === 'Account Information') {
        // For account info, transform into key-value pairs
        const infoTable = {
          id: 'account-info',
          name: 'Account Information',
          title: 'Account Information',
          headers: ['Key', 'Value'],
          rows: rows.map(row => [row[0] || '', row[1] || '']),
          type: 'metadata'
        };
        tables.push(infoTable);
      } else {
        // Default table format for other sheets
        tables.push({
          id: `sheet-${sheetName.toLowerCase().replace(/\s+/g, '-')}`,
          name: sheetName,
          title: sheetName,
          headers,
          rows,
          type: 'general'
        });
      }
    });

    return tables;
  } catch (error) {
    console.error(`Error extracting tables from Excel: ${error.message}`);
    return [];
  }
}

module.exports = {
  processSpreadsheet,
  processExcel,
  processCsv,
  extractTablesFromExcel
};