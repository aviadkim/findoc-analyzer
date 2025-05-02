/**
 * CSV Processing Service
 * 
 * This service provides functionality for processing CSV documents.
 */

const fs = require('fs');
const path = require('path');
const csvParser = require('csv-parser');

/**
 * Process a CSV document
 * @param {string} filePath - Path to the CSV file
 * @returns {Promise<object>} - Extracted content
 */
async function processCsv(filePath) {
  try {
    console.log(`Processing CSV: ${filePath}`);
    
    // Extract data
    const data = await extractData(filePath);
    
    // Extract text representation
    const text = generateTextRepresentation(data);
    
    // Convert data to tables
    const tables = convertDataToTables(data);
    
    // Extract metadata
    const metadata = await extractMetadata(filePath);
    
    return {
      text,
      tables,
      metadata,
      data
    };
  } catch (error) {
    console.error('Error processing CSV:', error);
    throw error;
  }
}

/**
 * Extract data from a CSV document
 * @param {string} filePath - Path to the CSV file
 * @returns {Promise<Array>} - Extracted data
 */
async function extractData(filePath) {
  return new Promise((resolve, reject) => {
    try {
      console.log(`Extracting data from CSV: ${filePath}`);
      
      const results = [];
      
      fs.createReadStream(filePath)
        .pipe(csvParser())
        .on('data', (data) => results.push(data))
        .on('end', () => {
          resolve(results);
        })
        .on('error', (error) => {
          console.error('Error extracting data from CSV:', error);
          reject(error);
        });
    } catch (error) {
      console.error('Error extracting data from CSV:', error);
      reject(error);
    }
  });
}

/**
 * Generate a text representation of the CSV data
 * @param {Array} data - Extracted data
 * @returns {string} - Text representation
 */
function generateTextRepresentation(data) {
  try {
    let text = '';
    
    // Skip if no data
    if (data.length === 0) return text;
    
    // Get headers
    const headers = Object.keys(data[0]);
    
    // Add headers
    text += headers.join('\t') + '\n';
    
    // Add separator
    text += headers.map(() => '---').join('\t') + '\n';
    
    // Add rows
    data.forEach(row => {
      text += headers.map(header => row[header] || '').join('\t') + '\n';
    });
    
    return text;
  } catch (error) {
    console.error('Error generating text representation:', error);
    return '';
  }
}

/**
 * Convert data to tables
 * @param {Array} data - Extracted data
 * @returns {Array} - Tables
 */
function convertDataToTables(data) {
  try {
    // Skip if no data
    if (data.length === 0) return [];
    
    // Get headers
    const headers = Object.keys(data[0]);
    
    // Get rows
    const rows = data.map(row => {
      return headers.map(header => row[header] ? row[header].toString() : '');
    });
    
    // Add the table
    return [
      {
        title: 'CSV Data',
        headers,
        rows
      }
    ];
  } catch (error) {
    console.error('Error converting data to tables:', error);
    return [];
  }
}

/**
 * Extract metadata from a CSV document
 * @param {string} filePath - Path to the CSV file
 * @returns {Promise<object>} - Extracted metadata
 */
async function extractMetadata(filePath) {
  try {
    console.log(`Extracting metadata from CSV: ${filePath}`);
    
    // Get file stats
    const stats = fs.statSync(filePath);
    
    // Extract metadata
    const metadata = {
      title: path.basename(filePath),
      author: 'Unknown',
      creationDate: stats.birthtime.toISOString(),
      modificationDate: stats.mtime.toISOString(),
      size: stats.size
    };
    
    return metadata;
  } catch (error) {
    console.error('Error extracting metadata from CSV:', error);
    return {
      title: path.basename(filePath),
      author: 'Unknown',
      size: 0
    };
  }
}

module.exports = {
  processCsv,
  extractData,
  extractMetadata
};
