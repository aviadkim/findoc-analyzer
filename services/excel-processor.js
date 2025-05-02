/**
 * Excel Processing Service
 * 
 * This service provides functionality for processing Excel documents.
 */

const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

/**
 * Process an Excel document
 * @param {string} filePath - Path to the Excel file
 * @returns {Promise<object>} - Extracted content
 */
async function processExcel(filePath) {
  try {
    console.log(`Processing Excel: ${filePath}`);
    
    // Extract sheets
    const sheets = await extractSheets(filePath);
    
    // Extract text representation
    const text = generateTextRepresentation(sheets);
    
    // Convert sheets to tables
    const tables = convertSheetsToTables(sheets);
    
    // Extract metadata
    const metadata = await extractMetadata(filePath);
    
    return {
      text,
      tables,
      metadata,
      sheets
    };
  } catch (error) {
    console.error('Error processing Excel:', error);
    throw error;
  }
}

/**
 * Extract sheets from an Excel document
 * @param {string} filePath - Path to the Excel file
 * @returns {Promise<object>} - Extracted sheets
 */
async function extractSheets(filePath) {
  try {
    console.log(`Extracting sheets from Excel: ${filePath}`);
    
    // Read the Excel file
    const workbook = XLSX.readFile(filePath);
    
    // Extract sheets
    const sheets = {};
    
    workbook.SheetNames.forEach(sheetName => {
      const sheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
      
      // Skip empty sheets
      if (data.length === 0) return;
      
      sheets[sheetName] = data;
    });
    
    return sheets;
  } catch (error) {
    console.error('Error extracting sheets from Excel:', error);
    throw error;
  }
}

/**
 * Generate a text representation of the Excel sheets
 * @param {object} sheets - Extracted sheets
 * @returns {string} - Text representation
 */
function generateTextRepresentation(sheets) {
  try {
    let text = '';
    
    // Process each sheet
    Object.entries(sheets).forEach(([sheetName, data]) => {
      text += `Sheet: ${sheetName}\n\n`;
      
      // Process each row
      data.forEach(row => {
        text += row.join('\t') + '\n';
      });
      
      text += '\n\n';
    });
    
    return text;
  } catch (error) {
    console.error('Error generating text representation:', error);
    return '';
  }
}

/**
 * Convert sheets to tables
 * @param {object} sheets - Extracted sheets
 * @returns {Array} - Tables
 */
function convertSheetsToTables(sheets) {
  try {
    const tables = [];
    
    // Process each sheet
    Object.entries(sheets).forEach(([sheetName, data]) => {
      // Skip empty sheets
      if (data.length === 0) return;
      
      // Get headers from the first row
      const headers = data[0].map(header => header ? header.toString() : '');
      
      // Get rows (skip the header row)
      const rows = data.slice(1).map(row => {
        // Convert all values to strings
        return row.map(cell => cell !== undefined && cell !== null ? cell.toString() : '');
      });
      
      // Add the table
      tables.push({
        title: sheetName,
        headers,
        rows
      });
    });
    
    return tables;
  } catch (error) {
    console.error('Error converting sheets to tables:', error);
    return [];
  }
}

/**
 * Extract metadata from an Excel document
 * @param {string} filePath - Path to the Excel file
 * @returns {Promise<object>} - Extracted metadata
 */
async function extractMetadata(filePath) {
  try {
    console.log(`Extracting metadata from Excel: ${filePath}`);
    
    // Read the Excel file
    const workbook = XLSX.readFile(filePath);
    
    // Extract metadata
    const metadata = {
      title: path.basename(filePath),
      author: workbook.Props?.Author || 'Unknown',
      subject: workbook.Props?.Subject || '',
      keywords: workbook.Props?.Keywords || '',
      creator: workbook.Props?.Creator || '',
      lastModifiedBy: workbook.Props?.LastModifiedBy || '',
      creationDate: workbook.Props?.CreatedDate ? new Date(workbook.Props.CreatedDate).toISOString() : '',
      modificationDate: workbook.Props?.ModifiedDate ? new Date(workbook.Props.ModifiedDate).toISOString() : '',
      sheets: workbook.SheetNames
    };
    
    return metadata;
  } catch (error) {
    console.error('Error extracting metadata from Excel:', error);
    return {
      title: path.basename(filePath),
      author: 'Unknown',
      sheets: []
    };
  }
}

module.exports = {
  processExcel,
  extractSheets,
  extractMetadata
};
